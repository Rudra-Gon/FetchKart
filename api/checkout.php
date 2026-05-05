<?php
// api/checkout.php
session_start();
require_once 'db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user'])) {
    echo json_encode(['success' => false, 'message' => 'Please login to checkout.']);
    exit;
}

if (!empty($_SESSION['cart'])) {
    $customer_id = $_SESSION['user']['id'];
    $payment_method = $_POST['payment_method'] ?? 'Not Specified';
    
    try {
        $pdo->beginTransaction();
        
        $stmt = $pdo->prepare('INSERT INTO orders (customer_id, product_id, quantity, payment_method) VALUES (?, ?, ?, ?)');
        
        foreach ($_SESSION['cart'] as $id => $item) {
            $stmt->execute([$customer_id, $id, $item['quantity'], $payment_method]);
        }
        
        $pdo->commit();
        
        // Clear cart after successful order
        $_SESSION['cart'] = [];
        
        echo json_encode(['success' => true, 'message' => 'Order placed successfully! Selected Method: ' . $payment_method]);
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        echo json_encode(['success' => false, 'message' => 'Checkout failed: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Cart is empty.']);
}
?>
