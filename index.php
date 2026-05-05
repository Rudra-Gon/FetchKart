<?php
session_start();

// Initialize cart if not exists
if (!isset($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

// Hardcoded products for the barebones setup
$products = [
    1 => ['name' => 'Quantum Laptop Pro', 'price' => 1299.99, 'desc' => 'High-performance laptop with quantum processing capabilities.', 'icon' => '💻'],
    2 => ['name' => 'Nebula Smartphone', 'price' => 799.99, 'desc' => 'Next-gen smartphone with a holographic display.', 'icon' => '📱'],
    3 => ['name' => 'Aura Smartwatch', 'price' => 249.99, 'desc' => 'Track your health and control your home from your wrist.', 'icon' => '⌚'],
    4 => ['name' => 'Sonic Earbuds', 'price' => 149.99, 'desc' => 'Noise-canceling earbuds with crystal clear 3D audio.', 'icon' => '🎧']
];

// Handle Add to Cart
$message = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['add_to_cart'])) {
    $product_id = $_POST['product_id'];
    if (isset($products[$product_id])) {
        if (isset($_SESSION['cart'][$product_id])) {
            $_SESSION['cart'][$product_id]['quantity'] += 1;
        } else {
            $_SESSION['cart'][$product_id] = [
                'name' => $products[$product_id]['name'],
                'price' => $products[$product_id]['price'],
                'quantity' => 1
            ];
        }
        $message = "Added {$products[$product_id]['name']} to cart!";
    }
}

// Calculate total items in cart
$cart_count = 0;
foreach ($_SESSION['cart'] as $item) {
    $cart_count += $item['quantity'];
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FetchKart Store</title>
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
    <h1 class="page-title">Featured Products</h1>
    
    <?php if ($message): ?>
        <div class="alert-success"><?php echo $message; ?></div>
    <?php endif; ?>

    <div class="products">
        <?php foreach ($products as $id => $product): ?>
            <div class="product-card">
                <div class="product-image">
                    <?php echo $product['icon']; ?>
                </div>
                <h3 class="product-title"><?php echo htmlspecialchars($product['name']); ?></h3>
                <p class="product-desc"><?php echo htmlspecialchars($product['desc']); ?></p>
                
                <form method="POST" action="index.php">
                    <input type="hidden" name="product_id" value="<?php echo $id; ?>">
                    <div class="product-footer">
                        <span class="product-price">$<?php echo number_format($product['price'], 2); ?></span>
                        <button type="submit" name="add_to_cart" class="btn">Add to Cart</button>
                    </div>
                </form>
            </div>
        <?php endforeach; ?>
    </div>
</main>

</body>
</html>
