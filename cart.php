<?php
require_once 'includes/db.php';

if (!isset($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    if ($action === 'add') {
        $product_id = (int)$_POST['product_id'];
        if (isset($_SESSION['cart'][$product_id])) {
            $_SESSION['cart'][$product_id]['quantity']++;
        } else {
            $_SESSION['cart'][$product_id] = ['quantity' => 1];
        }
    } elseif ($action === 'remove') {
        $product_id = (int)$_POST['product_id'];
        unset($_SESSION['cart'][$product_id]);
    }
    header('Location: cart.php');
    exit;
}

require_once 'includes/header.php';
?>

<h2>Shopping Cart</h2>

<?php if (empty($_SESSION['cart'])): ?>
    <div style="margin-top:20px;">
        <p>Your cart is empty.</p>
        <br>
        <a href="products.php" class="btn">Shop now</a>
    </div>
<?php else: ?>
    <div style="margin-top:20px;">
        <ul style="list-style-type: none;">
            <?php 
            $total = 0;
            foreach ($_SESSION['cart'] as $id => $item): 
                $stmt = $pdo->prepare('SELECT * FROM products WHERE id = ?');
                $stmt->execute([$id]);
                $product = $stmt->fetch();
                if($product) {
                    $item_total = $product['price'] * $item['quantity'];
                    $total += $item_total;
            ?>
                <li style="padding: 10px; border-bottom: 1px solid #ccc; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong><?php echo htmlspecialchars($product['name']); ?></strong> 
                        (x<?php echo $item['quantity']; ?>) <br>
                        $<?php echo number_format($item_total, 2); ?>
                    </div>
                    <form action="cart.php" method="POST">
                        <input type="hidden" name="action" value="remove">
                        <input type="hidden" name="product_id" value="<?php echo $id; ?>">
                        <button type="submit" style="background:#e74c3c; color:white; border:none; padding:5px 10px; border-radius:3px; cursor:pointer;">Remove</button>
                    </form>
                </li>
            <?php 
                }
            endforeach; 
            ?>
        </ul>
        <h3 style="margin-top: 20px;">Total: $<?php echo number_format($total, 2); ?></h3>
        <br>
        <?php if (isset($_SESSION['user_id'])): ?>
            <a href="checkout.php" class="btn">Proceed to Checkout</a>
        <?php else: ?>
            <a href="login.php" class="btn">Login to Checkout</a>
        <?php endif; ?>
    </div>
<?php endif; ?>

<?php require_once 'includes/footer.php'; ?>
