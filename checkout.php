<?php
session_start();

// Check if cart is empty before checking out
if (empty($_SESSION['cart'])) {
    header('Location: index.php');
    exit;
}

// Clear the cart to simulate a successful checkout
$_SESSION['cart'] = [];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Checkout Success - FetchKart</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

<header>
    <a href="index.php" class="logo">Fetch<span>Kart</span></a>
    <nav>
        <a href="cart.php">
            Cart 
            <span class="cart-count">0</span>
        </a>
    </nav>
</header>

<main>
    <div class="checkout-success">
        <div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div>
        <h2>Payment Successful!</h2>
        <p>Thank you for your order. We've received your request and will begin processing it shortly.</p>
        <a href="index.php" class="btn">Return to Home</a>
    </div>
</main>

</body>
</html>
