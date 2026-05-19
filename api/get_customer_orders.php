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
    try {
        $stmt = $pdo->prepare('
            SELECT o.*, p.name as product_name, p.image_url, p.description, p.price
            FROM orders o
            JOIN products p ON o.product_id = p.id
            WHERE o.customer_id = ?
            ORDER BY o.order_date DESC
        ');
        $stmt->execute([$customer_id]);
    } catch (PDOException $e) {
        // Fallback for old schema (missing address/status/etc)
        $stmt = $pdo->prepare('
            SELECT o.id, o.customer_id, o.product_id, o.quantity, o.payment_method, o.order_date, 
                   p.name as product_name, p.image_url, p.description, p.price
            FROM orders o
            JOIN products p ON o.product_id = p.id
            WHERE o.customer_id = ?
            ORDER BY o.order_date DESC
        ');
        $stmt->execute([$customer_id]);
    }
    $orders = $stmt->fetchAll();
    echo json_encode($orders);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>