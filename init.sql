-- =============================================================
--  Bakery Delight — MySQL Schema
--  Jalankan sekali untuk membuat database & tabel
--  Contoh: mysql -u root -p < init.sql
-- =============================================================

CREATE DATABASE IF NOT EXISTS bakery_delight
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE bakery_delight;

-- Products
CREATE TABLE IF NOT EXISTS products (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  price       INT NOT NULL,
  category    VARCHAR(100) NOT NULL,
  special     JSON,
  status      ENUM('tersedia','preorder','habis') DEFAULT 'tersedia',
  image       VARCHAR(500) DEFAULT '',
  description TEXT,
  stock       INT DEFAULT 0,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  product     VARCHAR(255) NOT NULL,
  rating      DECIMAL(3,1) NOT NULL,
  `text`      TEXT NOT NULL,
  approved    TINYINT(1) DEFAULT 1,
  date        VARCHAR(100) DEFAULT '',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Gallery
CREATE TABLE IF NOT EXISTS gallery (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  image       VARCHAR(500) NOT NULL,
  category    VARCHAR(100) DEFAULT 'umum',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Admins
CREATE TABLE IF NOT EXISTS admins (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(100) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  name        VARCHAR(255) NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  customer_name    VARCHAR(255) NOT NULL,
  customer_phone   VARCHAR(50),
  customer_email   VARCHAR(255),
  items            JSON NOT NULL,
  total            INT NOT NULL,
  status           ENUM('pending','processing','completed','cancelled') DEFAULT 'pending',
  notes            TEXT,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Settings (key-value store)
CREATE TABLE IF NOT EXISTS settings (
  `key`   VARCHAR(100) PRIMARY KEY,
  `value` TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
