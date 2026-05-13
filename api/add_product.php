<?php
// api/add_product.php
session_start();
require_once 'db.php';

header('Content-Type: application/json');

// Check if user is logged in and is a seller
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'seller') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Only sellers can add products.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'] ?? '';
    $price = $_POST['price'] ?? 0;
    $description = $_POST['description'] ?? '';
    $category = $_POST['category'] ?? 'General';
    $stock_quantity = $_POST['stock_quantity'] ?? 0;
    $godown_id = !empty($_POST['godown_id']) ? $_POST['godown_id'] : null;
    $seller_id = $_SESSION['user']['id'];

    if (empty($name) || empty($price) || empty($description)) {
        echo json_encode(['success' => false, 'message' => 'All fields are required.']);
        exit;
    }

    $image_url = null;
    if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        $file_tmp = $_FILES['photo']['tmp_name'];
        $file_name = time() . '_' . basename($_FILES['photo']['name']);

        $ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!in_array($ext, $allowed)) {
            echo json_encode(['success' => false, 'message' => 'Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.']);
            exit;
        }

        $target_dir = "../uploads/";
        $target_file = $target_dir . $file_name;

        if (move_uploaded_file($file_tmp, $target_file)) {
            $image_url = 'uploads/' . $file_name;
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to upload image.']);
            exit;
        }
    }

    try {
        $stmt = $pdo->prepare('INSERT INTO products (name, price, description, category, image_url, seller_id, stock_quantity, godown_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([$name, $price, $description, $category, $image_url, $seller_id, $stock_quantity, $godown_id]);
        echo json_encode(['success' => true, 'message' => 'Product added successfully!']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
    exit;
}

echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
?>