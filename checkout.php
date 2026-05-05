<?php
require_once 'includes/db.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit;
}

if (empty($_SESSION['cart'])) {
    header('Location: products.php');
    exit;
}

$success = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $total = 0;
    foreach ($_SESSION['cart'] as $id => $item) {
        $stmt = $pdo->prepare('SELECT price FROM products WHERE id = ?');
        $stmt->execute([$id]);
        $product = $stmt->fetch();
        if ($product) {
            $total += $product['price'] * $item['quantity'];
        }
    }

    $stmt = $pdo->prepare('INSERT INTO orders (user_id, total) VALUES (?, ?)');
    $stmt->execute([$_SESSION['user_id'], $total]);
    $order_id = $pdo->lastInsertId();

    foreach ($_SESSION['cart'] as $id => $item) {
        $stmt = $pdo->prepare('SELECT price FROM products WHERE id = ?');
        $stmt->execute([$id]);
        $product = $stmt->fetch();
        if ($product) {
            $stmt_item = $pdo->prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
            $stmt_item->execute([$order_id, $id, $item['quantity'], $product['price']]);
        }
    }

    $_SESSION['cart'] = [];
    $success = true;
}

require_once 'includes/header.php';
?>

<div class="container" style="text-align: center; margin-top: 40px;">
    <?php if ($success): ?>
        <h2>Order Placed Successfully!</h2>
        <p>Thank you for shopping with us. Your barebones order has been recorded.</p>
        <br>
        <a href="index.php" class="btn">Return Home</a>
    <?php else: ?>
        <h2>Confirm Checkout</h2>
        <form action="checkout.php" method="POST">
            <p>You have <?php echo array_sum(array_column($_SESSION['cart'], 'quantity')); ?> items in your cart.</p>
            <br>
            <button type="submit" class="btn">Place Order</button>
        </form>
    <?php endif; ?>
</div>

<?php require_once 'includes/footer.php'; ?>
