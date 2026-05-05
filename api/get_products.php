<?php
// api/get_products.php
require_once 'db.php';

header('Content-Type: application/json');

try {
    $stmt = $pdo->query('SELECT * FROM products');
    $products = $stmt->fetchAll();
    echo json_encode($products);
} catch (Exception $e) {
    echo json_encode(['error' => 'Failed to fetch products.']);
}
?>
