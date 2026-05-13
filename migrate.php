<?php
require_once 'api/db.php';

header('Content-Type: text/plain');

try {
    echo "Starting Migration...\n";

    // 0. Update 'products' table
    $missing_product_cols = [
        'stock_quantity' => "INT DEFAULT 0"
    ];

    foreach ($missing_product_cols as $col => $definition) {
        $check = $pdo->query("SHOW COLUMNS FROM products LIKE '$col'")->fetch();
        if (!$check) {
            $pdo->exec("ALTER TABLE products ADD $col $definition");
            echo "Added '$col' to 'products' table.\n";
        } else {
            echo "'$col' already exists in 'products' table.\n";
        }
    }

    // 1. Update 'orders' table
    $missing_order_cols = [
        'address' => "TEXT DEFAULT NULL AFTER payment_method",
        'status' => "ENUM('Pending', 'Shipped', 'Out for Delivery', 'Delivered') DEFAULT 'Pending' AFTER address",
        'expected_delivery_date' => "DATE DEFAULT NULL AFTER status",
        'tracking_type' => "ENUM('local', 'intercity') DEFAULT 'intercity' AFTER expected_delivery_date"
    ];

    foreach ($missing_order_cols as $col => $definition) {
        $check = $pdo->query("SHOW COLUMNS FROM orders LIKE '$col'")->fetch();
        if (!$check) {
            $pdo->exec("ALTER TABLE orders ADD $col $definition");
            echo "Added '$col' to 'orders' table.\n";
        } else {
            echo "'$col' already exists in 'orders' table.\n";
        }
    }

    // 2. Update 'users' table
    $missing_user_cols = [
        'warehouse_option' => "ENUM('service', 'personal') DEFAULT NULL",
        'delivery_option' => "ENUM('service', 'personal') DEFAULT NULL",
        'storage_option' => "ENUM('service', 'personal') DEFAULT NULL"
    ];

    foreach ($missing_user_cols as $col => $definition) {
        $check = $pdo->query("SHOW COLUMNS FROM users LIKE '$col'")->fetch();
        if (!$check) {
            $pdo->exec("ALTER TABLE users ADD $col $definition");
            echo "Added '$col' to 'users' table.\n";
        } else {
            echo "'$col' already exists in 'users' table.\n";
        }
    }

    // 3. Create 'godowns' table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `godowns` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `seller_id` int(11) NOT NULL,
      `name` varchar(100) NOT NULL,
      `location` varchar(255) DEFAULT NULL,
      `capacity` int(11) DEFAULT NULL,
      PRIMARY KEY (`id`),
      FOREIGN KEY (`seller_id`) REFERENCES users(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    echo "Ensured 'godowns' table exists.\n";

    echo "Migration Completed Successfully!\n";
    echo "You can now delete this file.";

} catch (Exception $e) {
    echo "Migration Failed: " . $e->getMessage();
}
?>