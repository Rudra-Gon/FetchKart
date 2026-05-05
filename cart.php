<?php
session_start();

if (!isset($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

// Handle remove item from cart
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['remove_item'])) {
    $product_id = $_POST['product_id'];
    if (isset($_SESSION['cart'][$product_id])) {
        unset($_SESSION['cart'][$product_id]);
    }
}

// Calculate total
$total_price = 0;
$cart_count = 0;
foreach ($_SESSION['cart'] as $item) {
    $total_price += $item['price'] * $item['quantity'];
    $cart_count += $item['quantity'];
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Cart - FetchKart</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

<header>
    <a href="index.php" class="logo">Fetch<span>Kart</span></a>
    <nav>
        <a href="cart.php">
            Cart 
            <span class="cart-count"><?php echo $cart_count; ?></span>
        </a>
    </nav>
</header>

<main>
    <h1 class="page-title">Shopping Cart</h1>
    
    <div class="cart-container">
        <?php if (empty($_SESSION['cart'])): ?>
            <p style="text-align: center; color: #94a3b8; padding: 2rem 0;">Your cart is currently empty.</p>
            <div style="text-align: center; margin-top: 1rem;">
                <a href="index.php" class="btn">Browse Products</a>
            </div>
        <?php else: ?>
            <table class="cart-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Subtotal</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($_SESSION['cart'] as $id => $item): ?>
                        <tr>
                            <td style="font-weight: 600;"><?php echo htmlspecialchars($item['name']); ?></td>
                            <td>$<?php echo number_format($item['price'], 2); ?></td>
                            <td><?php echo $item['quantity']; ?></td>
                            <td>$<?php echo number_format($item['price'] * $item['quantity'], 2); ?></td>
                            <td>
                                <form method="POST" action="cart.php" style="margin: 0;">
                                    <input type="hidden" name="product_id" value="<?php echo $id; ?>">
                                    <button type="submit" name="remove_item" class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">Remove</button>
                                </form>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            
            <div class="cart-total">
                Total: <span>$<?php echo number_format($total_price, 2); ?></span>
            </div>
            
            <div class="cart-actions">
                <a href="index.php" class="btn btn-secondary">Continue Shopping</a>
                <a href="checkout.php" class="btn">Proceed to Checkout</a>
            </div>
        <?php endif; ?>
    </div>
</main>

</body>
</html>
