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

class OrderModel {
  static async createOrder({
    userId,
    cartItems,
    customerName,
    customerEmail,
    customerPhone,
    deliveryAddress,
    paymentMethod,
    notes,
    promotion,
    subtotal,
    discountAmount
  }) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      for (const item of cartItems) {
        const [stockRows] = await connection.execute(
          'SELECT stock FROM products WHERE id = ? FOR UPDATE',
          [item.product_id]
        );
        const stock = stockRows[0]?.stock ?? 0;
        if (stock < item.quantity) {
          const error = new Error(`Недостаточно остатка для товара "${item.name}".`);
          error.statusCode = 400;
          throw error;
        }
      }

      const totalAmount = Math.max(Number(subtotal) - Number(discountAmount), 0);

      const [orderResult] = await connection.execute(
        `INSERT INTO orders (
          user_id, promotion_id, customer_name, customer_email, customer_phone,
          delivery_address, payment_method, subtotal, discount_amount, total_amount,
          promo_code, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          promotion ? promotion.id : null,
          customerName,
          customerEmail,
          customerPhone,
          deliveryAddress,
          paymentMethod,
          subtotal,
          discountAmount,
          totalAmount,
          promotion ? promotion.promo_code : null,
          notes || null
        ]
      );

      const orderId = orderResult.insertId;

      for (const item of cartItems) {
        await connection.execute(
          `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, line_total)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [orderId, item.product_id, item.name, item.price, item.quantity, item.line_total]
        );

        await connection.execute(
          'UPDATE products SET stock = stock - ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }

      await connection.commit();
      return orderId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getOrdersByUserId(userId) {
    const [rows] = await pool.execute(
      `SELECT o.id, o.status, o.subtotal, o.discount_amount, o.total_amount, o.promo_code, o.created_at,
              oi.product_name, oi.unit_price, oi.quantity, oi.line_total
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC, oi.id ASC`,
      [userId]
    );

    const grouped = new Map();
    for (const row of rows) {
      if (!grouped.has(row.id)) {
        grouped.set(row.id, {
          id: row.id,
          status: row.status,
          subtotal: row.subtotal,
          discount_amount: row.discount_amount,
          total_amount: row.total_amount,
          promo_code: row.promo_code,
          created_at: row.created_at,
          items: []
        });
      }
      if (row.product_name) {
        grouped.get(row.id).items.push({
          product_name: row.product_name,
          unit_price: row.unit_price,
          quantity: row.quantity,
          line_total: row.line_total
        });
      }
    }
    return [...grouped.values()];
  }

  static async getOrderByIdAndUserId(orderId, userId) {
    const [rows] = await pool.execute(
      `SELECT o.id, o.status, o.customer_name, o.customer_email, o.customer_phone, o.delivery_address,
              o.payment_method, o.subtotal, o.discount_amount, o.total_amount, o.promo_code, o.created_at,
              oi.product_name, oi.unit_price, oi.quantity, oi.line_total
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.id = ? AND o.user_id = ?`,
      [orderId, userId]
    );

    if (!rows.length) return null;

    const order = {
      id: rows[0].id,
      status: rows[0].status,
      customer_name: rows[0].customer_name,
      customer_email: rows[0].customer_email,
      customer_phone: rows[0].customer_phone,
      delivery_address: rows[0].delivery_address,
      payment_method: rows[0].payment_method,
      subtotal: rows[0].subtotal,
      discount_amount: rows[0].discount_amount,
      total_amount: rows[0].total_amount,
      promo_code: rows[0].promo_code,
      created_at: rows[0].created_at,
      items: []
    };

    for (const row of rows) {
      if (row.product_name) {
        order.items.push({
          product_name: row.product_name,
          unit_price: row.unit_price,
          quantity: row.quantity,
          line_total: row.line_total
        });
      }
    }

    return order;
  }

  static async getAdminStats() {
    const [ordersResult, revenueResult] = await Promise.all([
      pool.execute('SELECT COUNT(*) AS total_orders FROM orders'),
      pool.execute("SELECT COALESCE(SUM(total_amount), 0) AS total_revenue FROM orders WHERE status <> 'cancelled'")
    ]);

    const [orderRows] = ordersResult;
    const [revenueRows] = revenueResult;

    return {
      totalOrders: Number(orderRows[0]?.total_orders || 0),
      totalRevenue: Number(revenueRows[0]?.total_revenue || 0)
    };
  }

  static async getOrdersForAdmin({ search = '', status = '', page = 1, limit = null } = {}) {
    let sql = `
      SELECT o.id, o.customer_name, o.customer_email, o.customer_phone, o.status, o.total_amount, o.payment_method,
             o.created_at, u.full_name AS user_name, u.email AS user_email,
             COUNT(oi.id) AS items_count
      FROM orders o
      INNER JOIN users u ON u.id = o.user_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND o.status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (o.id = ? OR o.customer_name LIKE ? OR o.customer_email LIKE ? OR u.full_name LIKE ? OR u.email LIKE ?)';
      const numericId = Number.parseInt(search, 10);
      const exactId = Number.isFinite(numericId) ? numericId : 0;
      const pattern = `%${search}%`;
      params.push(exactId, pattern, pattern, pattern, pattern);
    }

    sql += ' GROUP BY o.id, o.customer_name, o.customer_email, o.customer_phone, o.status, o.total_amount, o.payment_method, o.created_at, u.full_name, u.email';
    sql += ' ORDER BY o.created_at DESC';

    const pagination = normalizeLimitOffset(page, limit);
    if (pagination) {
      sql += ' LIMIT ? OFFSET ?';
      params.push(pagination.limit, pagination.offset);
    }

    const [rows] = await pool.query(sql, params);
    return rows;
  }

  static async countOrdersForAdmin({ search = '', status = '' } = {}) {
    let sql = `
      SELECT COUNT(*) AS total
      FROM orders o
      INNER JOIN users u ON u.id = o.user_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND o.status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (o.id = ? OR o.customer_name LIKE ? OR o.customer_email LIKE ? OR u.full_name LIKE ? OR u.email LIKE ?)';
      const numericId = Number.parseInt(search, 10);
      const exactId = Number.isFinite(numericId) ? numericId : 0;
      const pattern = `%${search}%`;
      params.push(exactId, pattern, pattern, pattern, pattern);
    }

    const [rows] = await pool.execute(sql, params);
    return Number(rows[0]?.total || 0);
  }

  static async getOrderByIdForAdmin(orderId) {
    const [rows] = await pool.execute(
      `SELECT o.id, o.status, o.customer_name, o.customer_email, o.customer_phone, o.delivery_address,
              o.payment_method, o.subtotal, o.discount_amount, o.total_amount, o.promo_code, o.notes, o.created_at,
              u.full_name AS user_name, u.email AS user_email,
              oi.product_name, oi.unit_price, oi.quantity, oi.line_total
       FROM orders o
       INNER JOIN users u ON u.id = o.user_id
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.id = ?
       ORDER BY oi.id ASC`,
      [orderId]
    );

    if (!rows.length) return null;

    const order = {
      id: rows[0].id,
      status: rows[0].status,
      customer_name: rows[0].customer_name,
      customer_email: rows[0].customer_email,
      customer_phone: rows[0].customer_phone,
      delivery_address: rows[0].delivery_address,
      payment_method: rows[0].payment_method,
      subtotal: rows[0].subtotal,
      discount_amount: rows[0].discount_amount,
      total_amount: rows[0].total_amount,
      promo_code: rows[0].promo_code,
      notes: rows[0].notes,
      created_at: rows[0].created_at,
      user_name: rows[0].user_name,
      user_email: rows[0].user_email,
      items: []
    };

    for (const row of rows) {
      if (row.product_name) {
        order.items.push({
          product_name: row.product_name,
          unit_price: row.unit_price,
          quantity: row.quantity,
          line_total: row.line_total
        });
      }
    }

    return order;
  }

  static async updateOrderStatus(orderId, status) {
    await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
  }
}

module.exports = OrderModel;
