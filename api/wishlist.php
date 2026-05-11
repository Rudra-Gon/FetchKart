<?php
session_start();
require_once 'db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user']['id'];
$action = $_GET['action'] ?? '';

if ($action === 'add') {
    $product_id = $_POST['product_id'] ?? null;
    if (!$product_id) {
        echo json_encode(['success' => false, 'message' => 'Product ID required']);
        exit;
    }
    try {
        $stmt = $pdo->prepare('INSERT IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)');
        $stmt->execute([$user_id, $product_id]);
        echo json_encode(['success' => true, 'message' => 'Added to wishlist']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
} elseif ($action === 'remove') {
    $product_id = $_POST['product_id'] ?? null;
    if (!$product_id) {
        echo json_encode(['success' => false, 'message' => 'Product ID required']);
        exit;
    }
    try {
        $stmt = $pdo->prepare('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?');
        $stmt->execute([$user_id, $product_id]);
        echo json_encode(['success' => true, 'message' => 'Removed from wishlist']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
} elseif ($action === 'get') {
    try {
        $stmt = $pdo->prepare('
            SELECT p.* FROM products p 
            JOIN wishlists w ON p.id = w.product_id 
            WHERE w.user_id = ?
        ');
        $stmt->execute([$user_id]);
        $wishlist = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'wishlist' => $wishlist]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid action']);
}
?>
