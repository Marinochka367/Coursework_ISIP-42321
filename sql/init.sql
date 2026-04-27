CREATE DATABASE IF NOT EXISTS flower_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE flower_shop;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS promotions;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NULL,
  address TEXT NULL,
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id INT UNSIGNED NOT NULL,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(160) NOT NULL UNIQUE,
  price DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  image VARCHAR(255) NOT NULL,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_products_category (category_id),
  INDEX idx_products_slug (slug),
  INDEX idx_products_active (is_active)
) ENGINE=InnoDB;

CREATE TABLE promotions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  promo_code VARCHAR(50) NULL UNIQUE,
  discount_type ENUM('percent', 'fixed') NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  product_id INT UNSIGNED NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  starts_at DATETIME NOT NULL,
  ends_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_promotions_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_promotions_active_dates (is_active, starts_at, ends_at),
  INDEX idx_promotions_product (product_id)
) ENGINE=InnoDB;

CREATE TABLE cart (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE cart_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cart_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY uq_cart_product (cart_id, product_id),
  INDEX idx_cart_items_cart (cart_id),
  INDEX idx_cart_items_product (product_id)
) ENGINE=InnoDB;

CREATE TABLE orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  promotion_id INT UNSIGNED NULL,
  customer_name VARCHAR(120) NOT NULL,
  customer_email VARCHAR(190) NOT NULL,
  customer_phone VARCHAR(30) NOT NULL,
  delivery_address TEXT NOT NULL,
  payment_method ENUM('cash', 'card') NOT NULL,
  status ENUM('new', 'processing', 'paid', 'delivered', 'cancelled') NOT NULL DEFAULT 'new',
  subtotal DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  promo_code VARCHAR(50) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_orders_promotion FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_orders_user (user_id),
  INDEX idx_orders_status (status),
  INDEX idx_orders_created_at (created_at)
) ENGINE=InnoDB;

CREATE TABLE order_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  product_name VARCHAR(150) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  line_total DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_order_items_order (order_id),
  INDEX idx_order_items_product (product_id)
) ENGINE=InnoDB;

CREATE TABLE sessions (
  session_id VARCHAR(128) NOT NULL,
  expires INT UNSIGNED NOT NULL,
  data MEDIUMTEXT,
  PRIMARY KEY (session_id),
  INDEX idx_sessions_expires (expires)
) ENGINE=InnoDB;

INSERT INTO categories (name, slug) VALUES
('Розы', 'roses'),
('Тюльпаны', 'tulips'),
('Букеты', 'bouquets');

INSERT INTO products (category_id, name, slug, price, description, image, stock) VALUES
(1, 'Красные розы', 'red-roses-11', 2590.00, 'Классическая композиция из 11 красных роз для особого случая.', '/uploads/red-roses-11.jpg', 25),
(1, 'Белые розы', 'white-roses-15', 3290.00, 'Нежный букет из 15 белых роз в крафтовой упаковке.', '/uploads/white-roses-15.jpg', 18),
(1, 'Розовые розы', 'pink-roses-21', 4590.00, 'Пышный букет из 21 розовой розы для романтичного подарка.', '/uploads/pink-roses-21.jpg', 12),
(2, 'Тюльпаны микс', 'tulips-mix-15', 1990.00, 'Яркий микс тюльпанов в пастельной упаковке.', '/uploads/tulips-mix-15.jpg', 30),
(2, 'Жёлтые тюльпаны', 'yellow-tulips-25', 2990.00, 'Солнечный букет из 25 жёлтых тюльпанов.', '/uploads/yellow-tulips-25.jpg', 20),
(2, 'Белые тюльпаны', 'white-tulips-35', 3890.00, 'Воздушный букет из белых тюльпанов премиального качества.', '/uploads/white-tulips-35.jpg', 14),
(3, 'Букет Нежность', 'bouquet-tenderness', 3490.00, 'Композиция из роз, эустомы и декоративной зелени.', '/uploads/bouquet-tenderness.jpg', 10),
(3, 'Букет Весенний', 'bouquet-spring', 2990.00, 'Лёгкий весенний букет с тюльпанами и альстромерией.', '/uploads/bouquet-spring.jpg', 16),
(3, 'Букет Премиум', 'bouquet-premium', 5990.00, 'Премиальный букет для самых значимых событий.', '/uploads/bouquet-premium.jpg', 8),
(3, 'Коробка с цветами Романтика', 'box-romance', 4990.00, 'Стильная коробка с розами и сезонной флористикой.', '/uploads/box-romance.jpg', 9);

INSERT INTO promotions (title, description, promo_code, discount_type, discount_value, product_id, is_active, starts_at, ends_at) VALUES
('Скидка 10% на все букеты', 'Скидка 10% по промокоду BOUQUET10.', 'BOUQUET10', 'percent', 10.00, NULL, 1, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)),
('500 рублей на премиум-букет', 'Фиксированная скидка на букет Премиум по промокоду PREMIUM500.', 'PREMIUM500', 'fixed', 500.00, 9, 1, NOW(), DATE_ADD(NOW(), INTERVAL 20 DAY));

INSERT INTO users (full_name, email, password_hash, phone, address, role) VALUES
('Администратор', 'admin@example.com', '$2b$10$4z4DrK.32NRkrW7EkXukdePet2ldHp.BdIVImJYU8KusxSOL3hRcm', '+79990000001', 'Москва, ул. Административная, 1', 'admin'),
('Тестовый Пользователь', 'test@example.com', '$2b$10$4z4DrK.32NRkrW7EkXukdePet2ldHp.BdIVImJYU8KusxSOL3hRcm', '+79990000000', 'Москва, ул. Цветочная, 1', 'customer');

INSERT INTO cart (user_id) VALUES (1), (2);
