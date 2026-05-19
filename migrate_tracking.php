<?php
require_once 'api/db.php';

header('Content-Type: text/plain');

try {
    echo "Adding 'current_location' column to 'orders' table...\n";

    $check = $pdo->query("SHOW COLUMNS FROM orders LIKE 'current_location'")->fetch();
    if (!$check) {
        $pdo->exec("ALTER TABLE orders ADD current_location VARCHAR(255) DEFAULT 'At Warehouse'");
        echo "Success: 'current_location' column added.\n";
    } else {
        echo "Column 'current_location' already exists.\n";
    }

    echo "Updating existing orders to 'intercity' tracking type...\n";
    $count = $pdo->exec("UPDATE orders SET tracking_type = 'intercity'");
    echo "Success: Updated $count orders to 'intercity'.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>