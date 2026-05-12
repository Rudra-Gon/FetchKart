<?php
require_once 'api/db.php';

try {
    echo "Creating godowns table...\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `godowns` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `seller_id` int(11) NOT NULL,
            `name` varchar(100) NOT NULL,
            `location` varchar(255) DEFAULT NULL,
            `capacity` int(11) DEFAULT NULL,
            PRIMARY KEY (`id`),
            FOREIGN KEY (`seller_id`) REFERENCES users(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");
    echo "Done.\n";

    echo "Adding godown_id to products table...\n";
    // Check if column exists first
    $stmt = $pdo->prepare("SHOW COLUMNS FROM `products` LIKE 'godown_id'");
    $stmt->execute();
    $exists = $stmt->fetch();
    
    if (!$exists) {
        $pdo->exec("ALTER TABLE `products` ADD COLUMN `godown_id` int(11) DEFAULT NULL;");
        $pdo->exec("ALTER TABLE `products` ADD CONSTRAINT `fk_product_godown` FOREIGN KEY (`godown_id`) REFERENCES `godowns`(`id`) ON DELETE SET NULL;");
        echo "Done.\n";
    } else {
        echo "Column godown_id already exists.\n";
    }

    echo "Migration completed successfully!\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
