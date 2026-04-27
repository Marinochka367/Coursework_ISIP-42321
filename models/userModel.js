const { pool } = require('../config/db');

class UserModel {
  static async createUser({ fullName, email, passwordHash, phone, address, role = 'customer' }) {
    const [result] = await pool.execute(
      `INSERT INTO users (full_name, email, password_hash, phone, address, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [fullName, email, passwordHash, phone || null, address || null, role]
    );

    await pool.execute('INSERT INTO cart (user_id) VALUES (?)', [result.insertId]);
    return result.insertId;
  }

  static async getUserByEmail(email) {
    const [rows] = await pool.execute(
      `SELECT id, full_name, email, password_hash, phone, address, role
       FROM users WHERE email = ? LIMIT 1`,
      [email]
    );
    return rows[0] || null;
  }

  static async getUserById(id) {
    const [rows] = await pool.execute(
      `SELECT id, full_name, email, phone, address, role, created_at
       FROM users WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  static async updateUser(id, { fullName, phone, address }) {
    await pool.execute(
      `UPDATE users
       SET full_name = ?, phone = ?, address = ?
       WHERE id = ?`,
      [fullName, phone || null, address || null, id]
    );
  }

  static async getUserCounts() {
    const [rows] = await pool.execute('SELECT COUNT(*) AS total FROM users');
    return rows[0].total;
  }
}

module.exports = UserModel;
