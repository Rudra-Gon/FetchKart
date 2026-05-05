<?php
// api/cart_actions.php
session_start();
require_once 'db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

$action = $_GET['action'] ?? ($_POST['action'] ?? '');

if ($action === 'add') {
    $product_id = $_POST['product_id'] ?? null;
    
    if ($product_id) {
        if (isset($_SESSION['cart'][$product_id])) {
            $_SESSION['cart'][$product_id]['quantity'] += 1;
        } else {
            // Fetch product details from DB
            $stmt = $pdo->prepare('SELECT name, price FROM products WHERE id = ?');
            $stmt->execute([$product_id]);
            $product = $stmt->fetch();
            
            if ($product) {
                $_SESSION['cart'][$product_id] = [
                    'id' => $product_id,
                    'name' => $product['name'],
                    'price' => $product['price'],
                    'quantity' => 1
                ];
            }
        }
        echo json_encode(['success' => true]);
        exit;
    }
}

if ($action === 'remove') {
    $product_id = $_POST['product_id'] ?? null;
    if ($product_id && isset($_SESSION['cart'][$product_id])) {
        unset($_SESSION['cart'][$product_id]);
        echo json_encode(['success' => true]);
        exit;
    }
}

if ($action === 'update_quantity') {
    $product_id = $_POST['product_id'] ?? null;
    $change = (int)($_POST['change'] ?? 0);
    
    if ($product_id && isset($_SESSION['cart'][$product_id])) {
        $_SESSION['cart'][$product_id]['quantity'] += $change;
        
        // Remove if quantity is 0 or less
        if ($_SESSION['cart'][$product_id]['quantity'] <= 0) {
            unset($_SESSION['cart'][$product_id]);
        }
        
        echo json_encode(['success' => true]);
        exit;
    }
}

if ($action === 'clear') {
    $_SESSION['cart'] = [];
    echo json_encode(['success' => true]);
    exit;
}

if ($action === 'count') {
    $count = 0;
    foreach ($_SESSION['cart'] as $item) {
        $count += $item['quantity'];
    }
    echo json_encode(['count' => $count]);
    exit;
}

if ($action === 'view') {
    $items = array_values($_SESSION['cart']);
    $total = 0;
    foreach ($items as $item) {
        $total += $item['price'] * $item['quantity'];
    }
    echo json_encode(['items' => $items, 'total' => $total]);
    exit;
}

echo json_encode(['error' => 'Invalid action']);
?>
