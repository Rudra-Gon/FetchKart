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
    unset($_SESSION['applied_coupon']);
    echo json_encode(['success' => true]);
    exit;
}

if ($action === 'apply_coupon') {
    $code = $_POST['code'] ?? '';
    
    if (empty($code)) {
        echo json_encode(['success' => false, 'message' => 'Please enter a coupon code.']);
        exit;
    }

    $stmt = $pdo->prepare('SELECT * FROM coupons WHERE code = ? AND (expiry_date IS NULL OR expiry_date >= CURDATE())');
    $stmt->execute([$code]);
    $coupon = $stmt->fetch();

    if ($coupon) {
        // Calculate current total
        $total = 0;
        if (!empty($_SESSION['cart'])) {
            foreach ($_SESSION['cart'] as $item) {
                $total += (float)$item['price'] * (int)$item['quantity'];
            }
        }

        if ($total < (float)$coupon['min_order_amount']) {
            echo json_encode(['success' => false, 'message' => 'Minimum order amount for this coupon is ₹' . number_format($coupon['min_order_amount'], 2)]);
            exit;
        }

        $_SESSION['applied_coupon'] = $coupon;
        echo json_encode(['success' => true, 'message' => 'Coupon applied successfully!', 'coupon' => $coupon]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid or expired coupon code.']);
    }
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

    $discount = 0;
    $coupon_info = null;

    if (isset($_SESSION['applied_coupon'])) {
        $coupon = $_SESSION['applied_coupon'];
        
        // Re-validate min amount just in case items were removed
        if ($total >= (float)$coupon['min_order_amount']) {
            if ($coupon['discount_type'] === 'percentage') {
                $discount = $total * ((float)$coupon['discount_value'] / 100);
            } else {
                $discount = (float)$coupon['discount_value'];
            }
            $coupon_info = $coupon;
        } else {
            // Remove coupon if min amount not met anymore
            unset($_SESSION['applied_coupon']);
        }
    }

    $platform_fee = round($total * 0.10, 2);

    echo json_encode([
        'items' => $items, 
        'total' => $total,
        'discount' => round($discount, 2),
        'platform_fee' => $platform_fee,
        'grand_total' => max(0, round($total - $discount + $platform_fee, 2)),
    'applied_coupon' => $coupon_info
]);
    exit;
}

echo json_encode(['error' => 'Invalid action']);
?>
