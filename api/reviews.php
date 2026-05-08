<?php
// api/reviews.php
session_start();
require_once 'db.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? ($_POST['action'] ?? '');

// GET reviews for a product: ?action=get&product_id=...
if ($action === 'get') {
    $product_id = $_GET['product_id'] ?? null;
    if (!$product_id) {
        echo json_encode(['success' => false, 'message' => 'Product ID required.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare('SELECT r.*, u.username, p.name as product_name FROM reviews r JOIN users u ON r.user_id = u.id JOIN products p ON r.product_id = p.id WHERE r.product_id = ? ORDER BY r.created_at DESC');
        $stmt->execute([$product_id]);
        $reviews = $stmt->fetchAll();
        echo json_encode(['success' => true, 'reviews' => $reviews]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// GET all reviews for products belonging to a seller: ?action=get_seller_reviews
if ($action === 'get_seller_reviews') {
    if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'seller') {
        echo json_encode(['success' => false, 'message' => 'Seller authorization required.']);
        exit;
    }

    $seller_id = $_SESSION['user']['id'];

    try {
        $stmt = $pdo->prepare('
            SELECT r.*, u.username as reviewer_name, p.name as product_name, p.image_url 
            FROM reviews r 
            JOIN users u ON r.user_id = u.id 
            JOIN products p ON r.product_id = p.id 
            WHERE p.seller_id = ? 
            ORDER BY r.created_at DESC
        ');
        $stmt->execute([$seller_id]);
        $reviews = $stmt->fetchAll();
        echo json_encode(['success' => true, 'reviews' => $reviews]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// POST a new review: ?action=add (multipart/form-data or post)
if ($action === 'add') {
    if (!isset($_SESSION['user'])) {
        echo json_encode(['success' => false, 'message' => 'You must be logged in to write a review.']);
        exit;
    }

    $product_id = $_POST['product_id'] ?? null;
    $rating = $_POST['rating'] ?? null;
    $review_text = $_POST['review_text'] ?? '';
    $user_id = $_SESSION['user']['id'];

    if (!$product_id || !$rating) {
        echo json_encode(['success' => false, 'message' => 'Product ID and rating (1-5) required.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare('INSERT INTO reviews (product_id, user_id, rating, review_text) VALUES (?, ?, ?, ?)');
        $stmt->execute([$product_id, $user_id, $rating, $review_text]);
        echo json_encode(['success' => true, 'message' => 'Review submitted successfully.']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

echo json_encode(['success' => false, 'message' => 'Invalid action.']);
?>
