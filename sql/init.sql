-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: flower_shop
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cart`
--
Create database flower_shop

DROP TABLE IF EXISTS `cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
INSERT INTO `cart` VALUES (1,1,'2026-04-17 15:19:48','2026-04-17 15:19:48'),(2,2,'2026-04-17 15:19:48','2026-04-17 15:19:48'),(3,3,'2026-04-17 15:19:48','2026-04-17 15:19:48'),(4,4,'2026-04-17 15:19:48','2026-04-17 15:19:48'),(5,5,'2026-04-17 15:19:48','2026-04-17 15:19:48'),(6,6,'2026-04-17 15:19:48','2026-04-17 15:19:48'),(7,7,'2026-04-19 12:43:10','2026-04-19 12:43:10');
/*!40000 ALTER TABLE `cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `cart_id` int unsigned NOT NULL,
  `product_id` int unsigned NOT NULL,
  `quantity` int unsigned NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cart_product` (`cart_id`,`product_id`),
  KEY `idx_cart_items_cart` (`cart_id`),
  KEY `idx_cart_items_product` (`product_id`),
  CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`cart_id`) REFERENCES `cart` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cart_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (1,2,11,1,'2026-04-17 15:19:48','2026-04-17 15:19:48'),(2,2,17,2,'2026-04-17 15:19:48','2026-04-17 15:19:48'),(3,3,5,3,'2026-04-17 15:19:48','2026-04-17 15:19:48'),(4,4,13,1,'2026-04-17 15:19:48','2026-04-17 15:19:48'),(5,5,2,1,'2026-04-17 15:19:48','2026-04-17 15:19:48'),(6,5,16,1,'2026-04-17 15:19:48','2026-04-17 15:19:48');
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Розы','roses','2026-04-17 15:19:48'),(2,'Тюльпаны','tulips','2026-04-17 15:19:48'),(3,'Букеты','bouquets','2026-04-17 15:19:48'),(4,'Композиции','compositions','2026-04-17 15:19:48'),(5,'Подарочные наборы','gift-sets','2026-04-17 15:19:48');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `order_id` int unsigned NOT NULL,
  `product_id` int unsigned NOT NULL,
  `product_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `quantity` int unsigned NOT NULL,
  `line_total` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order` (`order_id`),
  KEY `idx_order_items_product` (`product_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,9,'Букет Нежность',3490.00,1,3490.00),(2,2,6,'Жёлтые тюльпаны 25 шт',2990.00,2,5980.00),(3,3,11,'Букет Премиум',5990.00,1,5990.00),(4,4,16,'Подарочный набор Для мамы',4590.00,1,4590.00),(5,5,5,'Тюльпаны микс 15 шт',1990.00,2,3980.00),(6,6,16,'Подарочный набор Для мамы',4590.00,1,4590.00),(7,7,1,'Красные розы 11 шт',2590.00,1,2590.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `promotion_id` int unsigned DEFAULT NULL,
  `customer_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_email` varchar(190) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_phone` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `delivery_address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_method` enum('cash','card') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('new','processing','paid','delivered','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'new',
  `subtotal` decimal(10,2) NOT NULL,
  `discount_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL,
  `promo_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_orders_promotion` (`promotion_id`),
  KEY `idx_orders_user` (`user_id`),
  KEY `idx_orders_status` (`status`),
  KEY `idx_orders_created_at` (`created_at`),
  CONSTRAINT `fk_orders_promotion` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,2,1,'Анна Смирнова','anna@example.com','+79990000002','Москва, ул. Цветочная, 14, кв. 8','card','new',3490.00,349.00,3141.00,'BOUQUET10','Позвонить за 30 минут до доставки.','2026-04-15 15:19:48','2026-04-15 15:19:48'),(2,3,NULL,'Иван Петров','ivan@example.com','+79990000003','Санкт-Петербург, Невский проспект, 25','cash','processing',5980.00,0.00,5980.00,NULL,'Доставка после 18:00.','2026-04-12 15:19:48','2026-04-13 15:19:48'),(3,4,2,'Мария Волкова','maria@example.com','+79990000004','Казань, ул. Баумана, 7','card','paid',5990.00,500.00,5490.00,'PREMIUM500','Добавить открытку.','2026-04-09 15:19:48','2026-04-10 15:19:48'),(4,5,NULL,'Дмитрий Орлов','dmitry@example.com','+79990000005','Екатеринбург, ул. Малышева, 101','card','delivered',4590.00,0.00,4590.00,NULL,NULL,'2026-04-03 15:19:48','2026-04-05 15:19:48'),(5,6,3,'Елена Морозова','elena@example.com','+79990000006','Новосибирск, Красный проспект, 10','cash','cancelled',3980.00,597.00,3383.00,'SPRING15','Клиент отменил заказ.','2026-04-16 15:19:48','2026-04-16 15:19:48'),(6,2,4,'Анна Смирнова','anna@example.com','+79990000002','Москва, ул. Цветочная, 14, кв. 8','card','delivered',4590.00,300.00,4290.00,'MOM300','Оставить у двери, если не отвечаю.','2026-03-28 15:19:48','2026-03-30 15:19:48'),(7,1,NULL,'Администратор','admin@example.com','+79990000001','92, 258-й квартал, Европейский микрорайон, Ангарск, Ангарский городской округ, Иркутская область, Сибирский федеральный округ, 665821, Россия','cash','new',2590.00,0.00,2590.00,NULL,NULL,'2026-04-20 15:49:51','2026-04-20 15:49:51');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `category_id` int unsigned NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(160) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stock` int unsigned NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_products_category` (`category_id`),
  KEY `idx_products_slug` (`slug`),
  KEY `idx_products_active` (`is_active`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,1,'Красные розы','red-roses-11',2590.00,'Классическая композиция из 11 красных роз для особого случая.','/uploads/1776602793502-img5211-1000x1000.jpg',24,1,'2026-04-17 15:19:48','2026-04-20 15:59:03'),(2,1,'Белые розы 15 шт','white-roses-15',3290.00,'Нежный букет из 15 белых роз в крафтовой упаковке.','/uploads/1776602864820-images.jpg',18,1,'2026-04-17 15:19:48','2026-04-19 12:47:44'),(3,1,'Розовые розы 21 шт','pink-roses-21',4590.00,'Пышный букет из 21 розовой розы для романтичного подарка.','/uploads/1776602898443-----------------.jpg',12,1,'2026-04-17 15:19:48','2026-04-19 12:48:18'),(4,1,'Кремовые розы 25 шт','cream-roses-25',4990.00,'Элегантный букет из 25 кремовых роз.','/uploads/1776602917607-------------------1-.jpg',10,1,'2026-04-17 15:19:48','2026-04-19 12:48:37'),(5,2,'Тюльпаны микс 15 шт','tulips-mix-15',1990.00,'Яркий микс тюльпанов в пастельной упаковке.','/uploads/1776602943963-------------------2-.jpg',30,1,'2026-04-17 15:19:48','2026-04-19 12:49:03'),(6,2,'Жёлтые тюльпаны 25 шт','yellow-tulips-25',2990.00,'Солнечный букет из 25 жёлтых тюльпанов.','/uploads/1776602967300-------------------3-.jpg',20,1,'2026-04-17 15:19:48','2026-04-19 12:49:27'),(7,2,'Белые тюльпаны 35 шт','white-tulips-35',3890.00,'Воздушный букет из белых тюльпанов премиального качества.','/uploads/1776603001449-------------------4-.jpg',14,1,'2026-04-17 15:19:48','2026-04-19 12:50:01'),(8,2,'Розовые тюльпаны 21 шт','pink-tulips-21',2790.00,'Нежный букет из 21 розового тюльпана.','/uploads/1776603019818-------------------5-.jpg',22,1,'2026-04-17 15:19:48','2026-04-19 12:50:19'),(9,3,'Букет Нежность','bouquet-tenderness',3490.00,'Композиция из роз, эустомы и декоративной зелени.','/uploads/1776603042602-------------------6-.jpg',10,1,'2026-04-17 15:19:48','2026-04-19 12:50:42'),(10,3,'Букет Весенний','bouquet-spring',2990.00,'Лёгкий весенний букет с тюльпанами и альстромерией.','/uploads/1776603067282-------------------7-.jpg',16,1,'2026-04-17 15:19:48','2026-04-19 12:51:07'),(11,3,'Букет Премиум','bouquet-premium',5990.00,'Премиальный букет для самых значимых событий.','/uploads/1776603183286-images--1-.jpg',8,1,'2026-04-17 15:19:48','2026-04-19 12:53:03'),(12,3,'Букет Сюрприз','bouquet-surprise',4190.00,'Яркий авторский букет в современной упаковке.','/uploads/1776603239822-------------------8-.jpg',11,1,'2026-04-17 15:19:48','2026-04-19 12:53:59'),(13,4,'Коробка с цветами Романтика','box-romance',4990.00,'Стильная коробка с розами и сезонной флористикой.','/uploads/1776603298277-------------------9-.jpg',9,1,'2026-04-17 15:19:48','2026-04-19 12:54:58'),(14,4,'Композиция в корзине','basket-composition',5390.00,'Праздничная композиция в плетёной корзине.','/uploads/1776603323041-------------------10-.jpg',7,1,'2026-04-17 15:19:48','2026-04-19 12:55:23'),(15,4,'Сердце из роз','heart-of-roses',8990.00,'Эффектная композиция в форме сердца.','/uploads/1776603345109-------------------11-.jpg',4,1,'2026-04-17 15:19:48','2026-04-19 12:55:45'),(16,5,'Подарочный набор Для мамы','gift-set-mom',4590.00,'Цветы, шоколад и открытка в одном наборе.','/uploads/1776603402621-------------------12-.jpg',13,1,'2026-04-17 15:19:48','2026-04-19 12:56:42'),(17,5,'Набор Сладкий комплимент','gift-set-sweet',3890.00,'Небольшой букет и набор сладостей.','/uploads/1776603459013-image-1771849984757.jpg',15,1,'2026-04-17 15:19:48','2026-04-19 12:57:39'),(18,5,'Набор Премиум подарок','gift-set-premium',7490.00,'Большой букет, десерт и свеча.','/uploads/1776603499644-images--2-.jpg',6,1,'2026-04-17 15:19:48','2026-04-19 12:58:19');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotions`
--

DROP TABLE IF EXISTS `promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `promo_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `discount_type` enum('percent','fixed') COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `product_id` int unsigned DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `starts_at` datetime NOT NULL,
  `ends_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `promo_code` (`promo_code`),
  KEY `idx_promotions_active_dates` (`is_active`,`starts_at`,`ends_at`),
  KEY `idx_promotions_product` (`product_id`),
  CONSTRAINT `fk_promotions_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotions`
--

LOCK TABLES `promotions` WRITE;
/*!40000 ALTER TABLE `promotions` DISABLE KEYS */;
INSERT INTO `promotions` VALUES (1,'Скидка 10% на все букеты','Скидка 10% по промокоду BOUQUET10 на товары категории букетов.','BOUQUET10','percent',10.00,NULL,1,'2026-04-17 18:19:48','2026-05-17 18:19:48','2026-04-17 15:19:48'),(2,'500 рублей на букет Премиум','Фиксированная скидка на букет Премиум.','PREMIUM500','fixed',500.00,11,1,'2026-04-17 18:19:48','2026-05-07 18:19:48','2026-04-17 15:19:48'),(3,'Весеннее предложение','Скидка 15% на тюльпаны по промокоду SPRING15.','SPRING15','percent',15.00,NULL,1,'2026-04-17 18:19:48','2026-05-01 18:19:48','2026-04-17 15:19:48'),(4,'Подарок маме','Скидка 300 рублей на подарочный набор Для мамы.','MOM300','fixed',300.00,16,1,'2026-04-17 18:19:48','2026-05-12 18:19:48','2026-04-17 15:19:48');
/*!40000 ALTER TABLE `promotions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` mediumtext COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`session_id`),
  KEY `idx_sessions_expires` (`expires`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('nTV2qjf3NuvUkFN9l8Xkven53xDN8mlk',1778075048,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2026-05-06T05:01:25.031Z\",\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"flash\":{},\"cart\":[],\"user\":{\"id\":1,\"full_name\":\"Администратор\",\"email\":\"admin@example.com\",\"phone\":\"+79990000001\",\"address\":\"Москва, ул. Административная, 1\",\"role\":\"admin\"}}'),('YF5LpG78u7jcLNUyHlKKTXV9DKomf95H',1778168755,'{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2026-05-07T15:45:54.768Z\",\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"flash\":{},\"cart\":[]}');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `full_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(190) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `role` enum('customer','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'customer',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Администратор','admin@example.com','$2b$10$4z4DrK.32NRkrW7EkXukdePet2ldHp.BdIVImJYU8KusxSOL3hRcm','+79990000001','Москва, ул. Административная, 1','admin','2026-04-17 15:19:48','2026-04-17 15:19:48'),(2,'Анна Смирнова','anna@example.com','$2b$10$4z4DrK.32NRkrW7EkXukdePet2ldHp.BdIVImJYU8KusxSOL3hRcm','+79990000002','Москва, ул. Цветочная, 14, кв. 8','customer','2026-04-17 15:19:48','2026-04-17 15:19:48'),(3,'Иван Петров','ivan@example.com','$2b$10$4z4DrK.32NRkrW7EkXukdePet2ldHp.BdIVImJYU8KusxSOL3hRcm','+79990000003','Санкт-Петербург, Невский проспект, 25','customer','2026-04-17 15:19:48','2026-04-17 15:19:48'),(4,'Мария Волкова','maria@example.com','$2b$10$4z4DrK.32NRkrW7EkXukdePet2ldHp.BdIVImJYU8KusxSOL3hRcm','+79990000004','Казань, ул. Баумана, 7','customer','2026-04-17 15:19:48','2026-04-17 15:19:48'),(5,'Дмитрий Орлов','dmitry@example.com','$2b$10$4z4DrK.32NRkrW7EkXukdePet2ldHp.BdIVImJYU8KusxSOL3hRcm','+79990000005','Екатеринбург, ул. Малышева, 101','customer','2026-04-17 15:19:48','2026-04-17 15:19:48'),(6,'Елена Морозова','elena@example.com','$2b$10$4z4DrK.32NRkrW7EkXukdePet2ldHp.BdIVImJYU8KusxSOL3hRcm','+79990000006','Новосибирск, Красный проспект, 10','customer','2026-04-17 15:19:48','2026-04-17 15:19:48'),(7,'Аккаунт 1','example3@example.com','$2b$10$VEyecb3WzzUV8SRL0xGmu.A/u5DuipRgnpoSk/mkeDrk6hiqRaACe','123131232131','123','customer','2026-04-19 12:43:10','2026-04-19 13:00:43');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-06 18:53:25
