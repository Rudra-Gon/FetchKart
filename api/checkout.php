<?php
// api/checkout.php
session_start();

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!empty($_SESSION['cart'])) {
        // Here you would normally insert the order into an orders table in the DB.
        // For barebones, we just clear the cart session.
        $_SESSION['cart'] = [];
        echo json_encode(['success' => true, 'message' => 'Order placed successfully.']);
    } else {
        echo json_encode(['error' => 'Cart is empty.']);
    }
} else {
    echo json_encode(['error' => 'Invalid request method.']);
}
?>
