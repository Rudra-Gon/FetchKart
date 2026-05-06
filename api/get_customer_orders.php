<?php
// api/get_customer_orders.php
session_start();
require_once 'db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$customer_id = $_SESSION['user']['id'];

try {
    $stmt = $pdo->prepare('
        SELECT o.*, p.name as product_name, p.image_url, p.description
        FROM orders o
        JOIN products p ON o.product_id = p.id
        WHERE o.customer_id = ?
        ORDER BY o.order_date DESC
    ');
    $stmt->execute([$customer_id]);
    $orders = $stmt->fetchAll();
    echo json_encode($orders);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
