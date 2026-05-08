<?php
// api/admin.php
session_start();
require_once 'db.php';

header('Content-Type: application/json');

// 1. Authorization Check: ONLY ADMINS ALLOWED
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Access denied. Admin authorization required.']);
    exit;
}

$action = $_GET['action'] ?? '';

// GET /api/admin.php?action=stats
if ($action === 'stats') {
    try {
        // Total Users
        $userCount = $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
        
        // Total Products
        $productCount = $pdo->query('SELECT COUNT(*) FROM products')->fetchColumn();
        
        // Total Orders
        $orderCount = $pdo->query('SELECT COUNT(*) FROM orders')->fetchColumn();
        
        // Pending Orders
        $pendingCount = $pdo->query("SELECT COUNT(*) FROM orders WHERE status = 'Pending'")->fetchColumn();

        echo json_encode([
            'success' => true,
            'stats' => [
                'total_users' => (int)$userCount,
                'total_products' => (int)$productCount,
                'total_orders' => (int)$orderCount,
                'pending_orders' => (int)$pendingCount
            ]
        ]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// GET /api/admin.php?action=users
if ($action === 'users') {
    try {
        $stmt = $pdo->query('SELECT id, username, role FROM users ORDER BY role ASC');
        $users = $stmt->fetchAll();
        echo json_encode(['success' => true, 'users' => $users]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// GET /api/admin.php?action=products
if ($action === 'products') {
    try {
        $stmt = $pdo->query('SELECT p.*, u.username as seller_name FROM products p LEFT JOIN users u ON p.seller_id = u.id ORDER BY p.id DESC');
        $products = $stmt->fetchAll();
        echo json_encode(['success' => true, 'products' => $products]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// GET /api/admin.php?action=orders
if ($action === 'orders') {
    try {
        $stmt = $pdo->query('SELECT o.*, u.username as customer_name, p.name as product_name FROM orders o JOIN users u ON o.customer_id = u.id JOIN products p ON o.product_id = p.id ORDER BY o.order_date DESC');
        $orders = $stmt->fetchAll();
        echo json_encode(['success' => true, 'orders' => $orders]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// DELETE /api/admin.php?action=delete_product&id=...
if ($action === 'delete_product') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'Product ID required.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare('DELETE FROM products WHERE id = ?');
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Product deleted successfully.']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// DELETE /api/admin.php?action=delete_user&id=...
if ($action === 'delete_user') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'User ID required.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare('DELETE FROM users WHERE id = ?');
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'User deleted successfully.']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// GET /api/admin.php?action=coupons
if ($action === 'coupons') {
    try {
        $stmt = $pdo->query('SELECT * FROM coupons ORDER BY expiry_date DESC');
        $coupons = $stmt->fetchAll();
        echo json_encode(['success' => true, 'coupons' => $coupons]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// DELETE /api/admin.php?action=delete_coupon&id=...
if ($action === 'delete_coupon') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'Coupon ID required.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare('DELETE FROM coupons WHERE id = ?');
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Coupon deleted successfully.']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// POST /api/admin.php?action=add_coupon
if ($action === 'add_coupon') {
    $code = $_POST['code'] ?? '';
    $type = $_POST['discount_type'] ?? 'percentage';
    $value = $_POST['discount_value'] ?? 0;
    $min_amount = $_POST['min_order_amount'] ?? 0;
    $expiry = $_POST['expiry_date'] ?? null;

    if (empty($code)) {
        echo json_encode(['success' => false, 'message' => 'Coupon code is required.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare('INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, expiry_date) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([$code, $type, $value, $min_amount, $expiry]);
        echo json_encode(['success' => true, 'message' => 'Coupon added successfully.']);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            echo json_encode(['success' => false, 'message' => 'Coupon code already exists.']);
        } else {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
    exit;
}

// DELETE /api/admin.php?action=delete_order&id=...
if ($action === 'delete_order') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'Order ID required.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare('DELETE FROM orders WHERE id = ?');
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Order record deleted successfully.']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

echo json_encode(['success' => false, 'message' => 'Invalid admin action.']);
?>
