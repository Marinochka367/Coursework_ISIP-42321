const CartModel = require('../models/cartModel');

function redirectBackOrCart(req, res) {
  const fallback = '/cart';
  const referer = req.get('referer');
  if (!referer) return res.redirect(fallback);
  try {
    const url = new URL(referer, `${req.protocol}://${req.get('host')}`);
    return res.redirect(url.pathname + (url.search || ''));
  } catch {
    return res.redirect(fallback);
  }
}

class CartController {
  static async renderCartPage(req, res, next) {
    try {
      const data = req.session.user
        ? await CartModel.getDbCartByUserId(req.session.user.id)
        : await CartModel.getSessionCartDetailed(req.session.cart || []);

      res.render('cart/index', {
        title: 'Корзина',
        cartItems: data.items,
        subtotal: data.subtotal,
        discount: 0,
        total: data.subtotal
      });
    } catch (error) {
      next(error);
    }
  }

  static async addToCart(req, res, next) {
    try {
      const productId = Number(req.body.productId);
      const quantity = Number(req.body.quantity || 1);

      if (req.session.user) {
        await CartModel.addItemToDbCart(req.session.user.id, productId, quantity);
      } else {
        if (!req.session.cart) req.session.cart = [];
        const existing = req.session.cart.find((item) => item.productId === productId);
        const existingQuantity = Number(existing?.quantity || 0);
        await CartModel.validateProductAvailability(productId, quantity, existingQuantity);

        if (existing) existing.quantity += quantity;
        else req.session.cart.push({ productId, quantity });
      }

      req.flash('success', 'Товар добавлен в корзину.');
      res.redirect('/cart');
    } catch (error) {
      if (error.statusCode === 400) {
        req.flash('error', error.message || 'Не удалось добавить товар в корзину.');
        return redirectBackOrCart(req, res);
      }
      next(error);
    }
  }

  static async updateCartItem(req, res, next) {
    try {
      const productId = Number(req.body.productId);
      const quantity = Number(req.body.quantity);

      if (req.session.user) {
        await CartModel.updateDbCartItem(req.session.user.id, productId, quantity);
      } else {
        if (quantity > 0) {
          await CartModel.validateProductAvailability(productId, quantity, 0);
        }
        req.session.cart = (req.session.cart || [])
          .map((item) => item.productId === productId ? { ...item, quantity } : item)
          .filter((item) => item.quantity > 0);
      }

      req.flash('success', 'Корзина обновлена.');
      res.redirect('/cart');
    } catch (error) {
      if (error.statusCode === 400) {
        req.flash('error', error.message || 'Не удалось обновить корзину.');
        return res.redirect('/cart');
      }
      next(error);
    }
  }

  static async removeCartItem(req, res, next) {
    try {
      const productId = Number(req.body.productId);

      if (req.session.user) {
        await CartModel.removeDbCartItem(req.session.user.id, productId);
      } else {
        req.session.cart = (req.session.cart || []).filter((item) => item.productId !== productId);
      }

      req.flash('success', 'Товар удалён из корзины.');
      res.redirect('/cart');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CartController;
