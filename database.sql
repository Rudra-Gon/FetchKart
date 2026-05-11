-- database.sql

DROP TABLE IF EXISTS `coupons`;

CREATE TABLE IF NOT EXISTS `products` ( 
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` text NOT NULL,
  `category` varchar(50) DEFAULT 'General',
  `image_url` varchar(255) DEFAULT NULL,
  `seller_id` int(11) DEFAULT NULL,
  `stock_quantity` int(11) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `role` enum('customer', 'seller', 'admin') NOT NULL DEFAULT 'customer',
  `warehouse_option` enum('service', 'personal') DEFAULT NULL,
  `delivery_option` enum('service', 'personal') DEFAULT NULL,
  `storage_option`
enum(
'service',
'personal',
'cold storage',
'fragile'
) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `customer_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `payment_method` varchar(50) DEFAULT 'Not Specified',
  `address` text DEFAULT NULL,
  `status` enum('Pending', 'Shipped', 'Out for Delivery', 'Delivered') DEFAULT 'Pending',
  `expected_delivery_date` date DEFAULT NULL,
  `tracking_type` enum('local', 'intercity') DEFAULT 'intercity',
  `order_date` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `coupons` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(20) NOT NULL UNIQUE,
  `discount_type` enum('percentage','fixed') NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `min_order_amount` decimal(10,2) DEFAULT 0.00,
  `expiry_date` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default admin account if not exists
INSERT IGNORE INTO `users` (`username`, `password`, `role`) VALUES ('ADMIN', '12345', 'admin');

-- Insert sample coupons
INSERT IGNORE INTO `coupons` (`code`, `discount_type`, `discount_value`, `min_order_amount`) VALUES 
('FIRSTFETCH', 'percentage', 75.00, 200.00),
('FETCHFEST', 'fixed', 100.00, 500.00),
('FASTFETCH', 'fixed', 123.00, 500.00),
('FETCHTHEDEAL','percentage',50.00,500.00),
('ADMINSFETCH', 'percentage', 99.00, 0.00);



CREATE TABLE IF NOT EXISTS `godowns` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `seller_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `capacity` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`seller_id`) REFERENCES users(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
  `review_text` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`product_id`) REFERENCES products(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES users(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- made by rudra gondhalkar

CREATE TABLE IF NOT EXISTS `wishlists` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `added_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_wishlist` (`user_id`, `product_id`),
  FOREIGN KEY (`user_id`) REFERENCES users(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES products(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;