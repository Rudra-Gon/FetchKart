<?php
require_once 'api/db.php';

header('Content-Type: text/plain');

try {
    echo "Creating 'reviews' table...\n";

    $sql = "CREATE TABLE IF NOT EXISTS `reviews` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `product_id` int(11) NOT NULL,
      `user_id` int(11) NOT NULL,
      `rating` int(11) NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
      `review_text` text DEFAULT NULL,
      `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (`id`),
      FOREIGN KEY (`product_id`) REFERENCES products(`id`) ON DELETE CASCADE,
      FOREIGN KEY (`user_id`) REFERENCES users(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $pdo->exec($sql);
    echo "Success: 'reviews' table created or already exists.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
