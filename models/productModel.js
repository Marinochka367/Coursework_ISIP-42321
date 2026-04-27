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

class ProductModel {
  static getCatalogOrderBy(sort = 'newest') {
    const allowedSort = {
      newest: 'p.created_at DESC',
      price_asc: 'p.price ASC',
      price_desc: 'p.price DESC',
      name_asc: 'p.name ASC'
    };
    return allowedSort[sort] || allowedSort.newest;
  }

  static async getAllCategories({ search = '', page = 1, limit = null } = {}) {
    let sql = 'SELECT id, name, slug FROM categories';
    const params = [];

    if (search) {
      sql += ' WHERE name LIKE ? OR slug LIKE ?';
      const pattern = `%${search}%`;
      params.push(pattern, pattern);
    }

    sql += ' ORDER BY name ASC';

    const pagination = normalizeLimitOffset(page, limit);
    if (pagination) {
      sql += ' LIMIT ? OFFSET ?';
      params.push(pagination.limit, pagination.offset);
    }

    const [rows] = await pool.query(sql, params);
    return rows;
  }

  static async countCategories({ search = '' } = {}) {
    let sql = 'SELECT COUNT(*) AS total FROM categories';
    const params = [];

    if (search) {
      sql += ' WHERE name LIKE ? OR slug LIKE ?';
      const pattern = `%${search}%`;
      params.push(pattern, pattern);
    }

    const [rows] = await pool.query(sql, params);
    return Number(rows[0]?.total || 0);
  }

  static async getAllProducts({
    categorySlug,
    search = '',
    minPrice = null,
    maxPrice = null,
    sort = 'newest',
    page = 1,
    limit = null
  } = {}) {
    let sql = `
      SELECT p.id, p.category_id, p.name, p.slug, p.price, p.description, p.image, p.stock, p.is_active,
             c.name AS category_name, c.slug AS category_slug
      FROM products p
      INNER JOIN categories c ON c.id = p.category_id
      WHERE p.is_active = 1
    `;
    const params = [];

    if (categorySlug) {
      sql += ' AND c.slug = ?';
      params.push(categorySlug);
    }

    if (search) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      const pattern = `%${search}%`;
      params.push(pattern, pattern);
    }

    if (Number.isFinite(minPrice)) {
      sql += ' AND p.price >= ?';
      params.push(minPrice);
    }

    if (Number.isFinite(maxPrice)) {
      sql += ' AND p.price <= ?';
      params.push(maxPrice);
    }

    sql += ` ORDER BY ${this.getCatalogOrderBy(sort)}`;

    const pagination = normalizeLimitOffset(page, limit);
    if (pagination) {
      sql += ' LIMIT ? OFFSET ?';
      params.push(pagination.limit, pagination.offset);
    }

    const [rows] = await pool.query(sql, params);
    return rows;
  }

  static async countProducts({
    categorySlug,
    search = '',
    minPrice = null,
    maxPrice = null,
    adminOnly = false
  } = {}) {
    let sql = `
      SELECT COUNT(*) AS total
      FROM products p
      INNER JOIN categories c ON c.id = p.category_id
      WHERE 1=1
    `;
    const params = [];

    if (!adminOnly) {
      sql += ' AND p.is_active = 1';
    }

    if (categorySlug) {
      sql += ' AND c.slug = ?';
      params.push(categorySlug);
    }

    if (search) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.slug LIKE ?)';
      const pattern = `%${search}%`;
      params.push(pattern, pattern, pattern);
    }

    if (Number.isFinite(minPrice)) {
      sql += ' AND p.price >= ?';
      params.push(minPrice);
    }

    if (Number.isFinite(maxPrice)) {
      sql += ' AND p.price <= ?';
      params.push(maxPrice);
    }

    const [rows] = await pool.execute(sql, params);
    return Number(rows[0]?.total || 0);
  }

  static async getFeaturedProducts() {
    const [rows] = await pool.execute(
      `SELECT p.id, p.name, p.slug, p.price, p.description, p.image,
              c.name AS category_name
       FROM products p
       INNER JOIN categories c ON c.id = p.category_id
       WHERE p.is_active = 1
       ORDER BY p.created_at DESC
       LIMIT 6`
    );
    return rows;
  }

  static async getProductBySlug(slug) {
    const [rows] = await pool.execute(
      `SELECT p.id, p.category_id, p.name, p.slug, p.price, p.description, p.image, p.stock, p.is_active,
              c.name AS category_name, c.slug AS category_slug
       FROM products p
       INNER JOIN categories c ON c.id = p.category_id
       WHERE p.slug = ? AND p.is_active = 1
       LIMIT 1`,
      [slug]
    );
    return rows[0] || null;
  }

  static async getProductById(id) {
    const [rows] = await pool.execute(
      `SELECT id, category_id, name, slug, price, description, image, stock, is_active
       FROM products WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  static async getProductBySlugForAdmin(slug) {
    const [rows] = await pool.execute(
      'SELECT id, slug FROM products WHERE slug = ? LIMIT 1',
      [slug]
    );
    return rows[0] || null;
  }

  static async getProductsByIds(ids) {
    if (!ids.length) return [];
    const placeholders = ids.map(() => '?').join(',');
    const [rows] = await pool.execute(
      `SELECT id, name, slug, price, image, stock, is_active FROM products WHERE id IN (${placeholders})`,
      ids
    );
    return rows;
  }

  static async getAllProductsForAdmin({ search = '', page = 1, limit = null } = {}) {
    let sql = `
      SELECT p.id, p.name, p.slug, p.price, p.stock, p.image, p.is_active, c.name AS category_name
       FROM products p
       INNER JOIN categories c ON c.id = p.category_id
    `;
    const params = [];

    if (search) {
      sql += ' WHERE p.name LIKE ? OR p.slug LIKE ? OR c.name LIKE ?';
      const pattern = `%${search}%`;
      params.push(pattern, pattern, pattern);
    }

    sql += ' ORDER BY p.created_at DESC';

    const pagination = normalizeLimitOffset(page, limit);
    if (pagination) {
      sql += ' LIMIT ? OFFSET ?';
      params.push(pagination.limit, pagination.offset);
    }

    const [rows] = await pool.query(sql, params);
    return rows;
  }

  static async createProduct(data) {
    const [result] = await pool.execute(
      `INSERT INTO products (category_id, name, slug, price, description, image, stock, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.categoryId,
        data.name,
        data.slug,
        data.price,
        data.description,
        data.image,
        data.stock,
        data.isActive
      ]
    );
    return result.insertId;
  }

  static async updateProduct(id, data) {
    await pool.execute(
      `UPDATE products
       SET category_id = ?, name = ?, slug = ?, price = ?, description = ?, image = ?, stock = ?, is_active = ?
       WHERE id = ?`,
      [
        data.categoryId,
        data.name,
        data.slug,
        data.price,
        data.description,
        data.image,
        data.stock,
        data.isActive,
        id
      ]
    );
  }

  static async deleteProduct(id) {
    await pool.execute('DELETE FROM products WHERE id = ?', [id]);
  }

  static async createCategory({ name, slug }) {
    const [result] = await pool.execute(
      'INSERT INTO categories (name, slug) VALUES (?, ?)',
      [name, slug]
    );
    return result.insertId;
  }

  static async updateCategory(id, { name, slug }) {
    await pool.execute(
      'UPDATE categories SET name = ?, slug = ? WHERE id = ?',
      [name, slug, id]
    );
  }

  static async getCategoryById(id) {
    const [rows] = await pool.execute(
      'SELECT id, name, slug FROM categories WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  }

  static async getCategoryBySlug(slug) {
    const [rows] = await pool.execute('SELECT id, slug FROM categories WHERE slug = ? LIMIT 1', [slug]);
    return rows[0] || null;
  }

  static async deleteCategory(id) {
    await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
  }
}

module.exports = ProductModel;
