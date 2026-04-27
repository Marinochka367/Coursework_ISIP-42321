const { pool } = require('../config/db');

function normalizeLimitOffset(page, limit) {
  const safeLimit = Number.parseInt(limit, 10);
  const safePage = Number.parseInt(page, 10);

  if (!Number.isInteger(safeLimit) || safeLimit <= 0) {
    return null;
  }

  const normalizedPage = Number.isInteger(safePage) && safePage > 0 ? safePage : 1;
  return {
    limit: safeLimit,
    offset: (normalizedPage - 1) * safeLimit
  };
}

class PromotionModel {
  static async getActivePromotions() {
    const [rows] = await pool.execute(
      `SELECT pr.id, pr.title, pr.description, pr.promo_code, pr.discount_type, pr.discount_value,
              pr.product_id, pr.starts_at, pr.ends_at, pr.is_active, p.name AS product_name
       FROM promotions pr
       LEFT JOIN products p ON p.id = pr.product_id
       WHERE pr.is_active = 1 AND NOW() BETWEEN pr.starts_at AND pr.ends_at
       ORDER BY pr.ends_at ASC`
    );
    return rows;
  }

  static async getActivePromotionByCode(code) {
    const [rows] = await pool.execute(
      `SELECT id, title, description, promo_code, discount_type, discount_value, product_id
       FROM promotions
       WHERE promo_code = ? AND is_active = 1 AND NOW() BETWEEN starts_at AND ends_at
       LIMIT 1`,
      [code]
    );
    return rows[0] || null;
  }

  static calculateDiscount(cartItems, promotion) {
    if (!promotion) return 0;

    const eligibleItems = promotion.product_id
      ? cartItems.filter((item) => item.product_id === promotion.product_id)
      : cartItems;

    const eligibleTotal = eligibleItems.reduce((sum, item) => sum + Number(item.line_total), 0);

    if (promotion.discount_type === 'percent') {
      return Number(((eligibleTotal * Number(promotion.discount_value)) / 100).toFixed(2));
    }
    return Math.min(Number(promotion.discount_value), eligibleTotal);
  }

  static async getAllPromotionsForAdmin({ search = '', page = 1, limit = null } = {}) {
    let sql = `
      SELECT pr.id, pr.title, pr.promo_code, pr.discount_type, pr.discount_value, pr.is_active,
              pr.starts_at, pr.ends_at, p.name AS product_name
       FROM promotions pr
       LEFT JOIN products p ON p.id = pr.product_id
    `;
    const params = [];

    if (search) {
      sql += ' WHERE pr.title LIKE ? OR pr.promo_code LIKE ? OR p.name LIKE ?';
      const pattern = `%${search}%`;
      params.push(pattern, pattern, pattern);
    }

    sql += ' ORDER BY pr.created_at DESC';

    const pagination = normalizeLimitOffset(page, limit);
    if (pagination) {
      sql += ' LIMIT ? OFFSET ?';
      params.push(pagination.limit, pagination.offset);
    }

    const [rows] = await pool.query(sql, params);
    return rows;
  }

  static async countPromotions({ search = '' } = {}) {
    let sql = `
      SELECT COUNT(*) AS total
      FROM promotions pr
      LEFT JOIN products p ON p.id = pr.product_id
    `;
    const params = [];

    if (search) {
      sql += ' WHERE pr.title LIKE ? OR pr.promo_code LIKE ? OR p.name LIKE ?';
      const pattern = `%${search}%`;
      params.push(pattern, pattern, pattern);
    }

    const [rows] = await pool.execute(sql, params);
    return Number(rows[0]?.total || 0);
  }

  static async getPromotionById(id) {
    const [rows] = await pool.execute(
      `SELECT id, title, description, promo_code, discount_type, discount_value, product_id, is_active,
              DATE_FORMAT(starts_at, '%Y-%m-%dT%H:%i') AS starts_at,
              DATE_FORMAT(ends_at, '%Y-%m-%dT%H:%i') AS ends_at
       FROM promotions WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  static async getPromotionByCodeForAdmin(promoCode) {
    if (!promoCode) return null;
    const [rows] = await pool.execute(
      'SELECT id, promo_code FROM promotions WHERE promo_code = ? LIMIT 1',
      [promoCode]
    );
    return rows[0] || null;
  }

  static async createPromotion(data) {
    const [result] = await pool.execute(
      `INSERT INTO promotions (title, description, promo_code, discount_type, discount_value, product_id, is_active, starts_at, ends_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title,
        data.description,
        data.promoCode || null,
        data.discountType,
        data.discountValue,
        data.productId || null,
        data.isActive,
        data.startsAt,
        data.endsAt
      ]
    );
    return result.insertId;
  }

  static async updatePromotion(id, data) {
    await pool.execute(
      `UPDATE promotions
       SET title = ?, description = ?, promo_code = ?, discount_type = ?, discount_value = ?, product_id = ?, is_active = ?, starts_at = ?, ends_at = ?
       WHERE id = ?`,
      [
        data.title,
        data.description,
        data.promoCode || null,
        data.discountType,
        data.discountValue,
        data.productId || null,
        data.isActive,
        data.startsAt,
        data.endsAt,
        id
      ]
    );
  }

  static async deletePromotion(id) {
    await pool.execute('DELETE FROM promotions WHERE id = ?', [id]);
  }
}

module.exports = PromotionModel;
