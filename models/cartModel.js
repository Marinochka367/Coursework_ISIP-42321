const { pool } = require('../config/db');
const ProductModel = require('./productModel');
const HttpError = require('../utils/httpError');

class CartModel {
  static async getOrCreateCartId(userId) {
    const [rows] = await pool.execute('SELECT id FROM cart WHERE user_id = ? LIMIT 1', [userId]);
    if (rows[0]) return rows[0].id;

    const [result] = await pool.execute('INSERT INTO cart (user_id) VALUES (?)', [userId]);
    return result.insertId;
  }

  static async validateProductAvailability(productId, quantity, existingQuantity = 0) {
    const product = await ProductModel.getProductById(productId);

    if (!product || !product.is_active) {
      throw new HttpError('Товар недоступен или был скрыт из каталога.', 400);
    }

    const requestedQuantity = Number(quantity) + Number(existingQuantity);
    if (requestedQuantity > Number(product.stock)) {
      throw new HttpError(`К сожалению, такого количества нет в наличии. Доступно: ${product.stock} шт.`, 400);
    }

    return product;
  }

  static async addItemToDbCart(userId, productId, quantity) {
    const cartId = await this.getOrCreateCartId(userId);
    const [existingRows] = await pool.execute(
      'SELECT quantity FROM cart_items WHERE cart_id = ? AND product_id = ? LIMIT 1',
      [cartId, productId]
    );
    const existingQuantity = Number(existingRows[0]?.quantity || 0);
    await this.validateProductAvailability(productId, quantity, existingQuantity);

    await pool.execute(
      `INSERT INTO cart_items (cart_id, product_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity), updated_at = CURRENT_TIMESTAMP`,
      [cartId, productId, quantity]
    );
  }

  static async updateDbCartItem(userId, productId, quantity) {
    const cartId = await this.getOrCreateCartId(userId);

    if (quantity <= 0) {
      await pool.execute('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?', [cartId, productId]);
      return;
    }

    await this.validateProductAvailability(productId, quantity, 0);

    await pool.execute(
      'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE cart_id = ? AND product_id = ?',
      [quantity, cartId, productId]
    );
  }

  static async removeDbCartItem(userId, productId) {
    const cartId = await this.getOrCreateCartId(userId);
    await pool.execute('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?', [cartId, productId]);
  }

  static async clearDbCart(userId) {
    const cartId = await this.getOrCreateCartId(userId);
    await pool.execute('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
  }

  static async getDbCartByUserId(userId) {
    const cartId = await this.getOrCreateCartId(userId);
    const [rows] = await pool.execute(
      `SELECT p.id AS product_id, p.name, p.slug, p.price, p.image, p.stock,
              ci.quantity, (p.price * ci.quantity) AS line_total
       FROM cart_items ci
       INNER JOIN products p ON p.id = ci.product_id
       WHERE ci.cart_id = ?
       ORDER BY ci.created_at DESC`,
      [cartId]
    );
    const subtotal = rows.reduce((sum, item) => sum + Number(item.line_total), 0);
    return { items: rows, subtotal };
  }

  static async getSessionCartDetailed(sessionCart) {
    if (!sessionCart.length) return { items: [], subtotal: 0 };
    const products = await ProductModel.getProductsByIds(sessionCart.map((item) => item.productId));
    const map = new Map(products.map((item) => [item.id, item]));

    const items = sessionCart.map((item) => {
      const product = map.get(item.productId);
      if (!product || !product.is_active) return null;
      return {
        product_id: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(product.price),
        image: product.image,
        stock: product.stock,
        quantity: Math.min(item.quantity, product.stock),
        line_total: Number(product.price) * Math.min(item.quantity, product.stock)
      };
    }).filter(Boolean);

    const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
    return { items, subtotal };
  }

  static async syncSessionCartToDb(userId, sessionCart) {
    if (!sessionCart || !sessionCart.length) return;
    for (const item of sessionCart) {
      try {
        await this.addItemToDbCart(userId, item.productId, item.quantity);
      } catch (error) {
        console.error('Не удалось синхронизировать товар корзины:', item.productId, error.message);
      }
    }
  }
}

module.exports = CartModel;
module.exports.syncSessionCartToDb = CartModel.syncSessionCartToDb.bind(CartModel);
