<?php
// api/get_products.php
require_once 'db.php';

header('Content-Type: application/json');

try {
    $id = $_GET['id'] ?? null;

    if ($id) {
        $stmt = $pdo->prepare('SELECT p.*, u.username as seller_name FROM products p LEFT JOIN users u ON p.seller_id = u.id WHERE p.id = ?');
        $stmt->execute([$id]);
        $product = $stmt->fetch();
        if ($product) {
            echo json_encode($product);
        } else {
            echo json_encode(['error' => 'Product not found.']);
        }
    } else {
        $stmt = $pdo->query('SELECT p.*, u.username as seller_name FROM products p LEFT JOIN users u ON p.seller_id = u.id');
        $products = $stmt->fetchAll();
        echo json_encode($products);
    }
} catch (Exception $e) {
    echo json_encode(['error' => 'Failed to fetch products.']);
}
?>
