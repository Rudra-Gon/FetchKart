CREATE TABLE IF NOT EXISTS `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` text NOT NULL,
  `icon` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `products` (`id`, `name`, `price`, `description`, `icon`) VALUES
(1, 'Quantum Laptop Pro', 1299.99, 'High-performance laptop with quantum processing capabilities.', '💻'),
(2, 'Nebula Smartphone', 799.99, 'Next-gen smartphone with a holographic display.', '📱'),
(3, 'Aura Smartwatch', 249.99, 'Track your health and control your home from your wrist.', '⌚'),
(4, 'Sonic Earbuds', 149.99, 'Noise-canceling earbuds with crystal clear 3D audio.', '🎧');
