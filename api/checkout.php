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
    $address = $_POST['address'] ?? 'No Address Provided';
    $expected_date = date('Y-m-d', strtotime('+5 days'));
    
    try {
        $pdo->beginTransaction();
        
        $stmt = $pdo->prepare('INSERT INTO orders (customer_id, product_id, quantity, payment_method, address, expected_delivery_date, tracking_type) VALUES (?, ?, ?, ?, ?, ?, ?)');
        
        foreach ($_SESSION['cart'] as $id => $item) {
            // Check stock level first
            $checkStmt = $pdo->prepare('SELECT stock_quantity, name FROM products WHERE id = ?');
            $checkStmt->execute([$id]);
            $product = $checkStmt->fetch();
            
            if (!$product || $product['stock_quantity'] < $item['quantity']) {
                throw new Exception('Insufficient stock for item: ' . ($product['name'] ?? 'Unknown Product'));
            }

            // Decrement stock
            $updateStmt = $pdo->prepare('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?');
            $updateStmt->execute([$item['quantity'], $id]);

            // Insert order record
            $tracking_type = (rand(0, 1) == 0) ? 'local' : 'intercity';
            $stmt->execute([$customer_id, $id, $item['quantity'], $payment_method, $address, $expected_date, $tracking_type]);
        }
        
        $pdo->commit();
        
        // Clear cart after successful order
        $_SESSION['cart'] = [];
        unset($_SESSION['applied_coupon']);
        
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
