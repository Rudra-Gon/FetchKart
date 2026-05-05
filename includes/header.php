<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple E-Commerce</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    <header class="main-header">
        <div class="container">
            <h1 class="logo"><a href="index.php">ShopEase</a></h1>
            <nav class="main-nav">
                <ul>
                    <li><a href="products.php">Products</a></li>
                    <li><a href="cart.php">Cart <?php echo isset($_SESSION['cart']) ? '(' . array_sum(array_column($_SESSION['cart'], 'quantity')) . ')' : ''; ?></a></li>
                    <?php if (isset($_SESSION['user_id'])): ?>
                        <li><a href="logout.php">Logout</a></li>
                    <?php else: ?>
                        <li><a href="login.php">Login</a></li>
                        <li><a href="register.php">Register</a></li>
                    <?php endif; ?>
                </ul>
            </nav>
        </div>
    </header>
    <main class="container">
