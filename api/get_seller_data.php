<?php
// api/get_seller_data.php
session_start();
require_once 'db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'seller') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$seller_id = $_SESSION['user']['id'];
$action = $_GET['action'] ?? '';

if ($action === 'inventory') {
    $stmt = $pdo->prepare('
        SELECT p.*, g.name as godown_name 
        FROM products p
        LEFT JOIN godowns g ON p.godown_id = g.id
        WHERE p.seller_id = ?
    ');
    $stmt->execute([$seller_id]);
    echo json_encode($stmt->fetchAll());
    exit;
}

if ($action === 'orders') {
    // Join orders with products to filter by seller, and users to get customer name
    $stmt = $pdo->prepare('
        SELECT o.*, p.name as product_name, u.username as customer_name 
        FROM orders o
        JOIN products p ON o.product_id = p.id
        JOIN users u ON o.customer_id = u.id
        WHERE p.seller_id = ?
        ORDER BY o.order_date DESC
    ');
    $stmt->execute([$seller_id]);
    echo json_encode($stmt->fetchAll());
    exit;
}

if ($action === 'delete_product') {
    $id = $_POST['product_id'] ?? null;
    $stmt = $pdo->prepare('DELETE FROM products WHERE id = ? AND seller_id = ?');
    $stmt->execute([$id, $seller_id]);
    echo json_encode(['success' => true]);
    exit;
}

if ($action === 'update_stock') {
    $id = $_POST['product_id'] ?? null;
    $new_stock = $_POST['stock'] ?? 0;
    $stmt = $pdo->prepare('UPDATE products SET stock_quantity = ? WHERE id = ? AND seller_id = ?');
    $stmt->execute([$new_stock, $id, $seller_id]);
    echo json_encode(['success' => true]);
    exit;
}

echo json_encode(['error' => 'Invalid action']);
?>
