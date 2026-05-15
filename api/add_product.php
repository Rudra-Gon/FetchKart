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
    // If the POST body is empty but content-type is multipart, it usually means post_max_size was exceeded
    if (empty($_POST) && empty($_FILES) && strpos($_SERVER['CONTENT_TYPE'], 'multipart/form-data') !== false) {
        echo json_encode(['success' => false, 'message' => 'The file you are trying to upload is too large for the server.']);
        exit;
    }
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
    if (isset($_FILES['photo'])) {
        $upload_error = $_FILES['photo']['error'];
        if ($upload_error !== UPLOAD_ERR_OK) {
            $error_msg = "Upload error: ";
            switch ($upload_error) {
                case UPLOAD_ERR_INI_SIZE:
                    $error_msg .= "File exceeds upload_max_filesize in php.ini.";
                    break;
                case UPLOAD_ERR_FORM_SIZE:
                    $error_msg .= "File exceeds MAX_FILE_SIZE directive in HTML form.";
                    break;
                case UPLOAD_ERR_PARTIAL:
                    $error_msg .= "File was only partially uploaded.";
                    break;
                case UPLOAD_ERR_NO_FILE:
                    $error_msg .= "No file was uploaded.";
                    break;
                case UPLOAD_ERR_NO_TMP_DIR:
                    $error_msg .= "Missing temporary folder on server.";
                    break;
                case UPLOAD_ERR_CANT_WRITE:
                    $error_msg .= "Failed to write file to disk.";
                    break;
                case UPLOAD_ERR_EXTENSION:
                    $error_msg .= "A PHP extension stopped the file upload.";
                    break;
                default:
                    $error_msg .= "Unknown error code " . $upload_error;
                    break;
            }
            echo json_encode(['success' => false, 'message' => $error_msg]);
            exit;
        }

        $file_tmp = $_FILES['photo']['tmp_name'];
        $file_name = time() . '_' . basename($_FILES['photo']['name']);

        $ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!in_array($ext, $allowed)) {
            echo json_encode(['success' => false, 'message' => 'Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.']);
            exit;
        }

        $target_dir = dirname(__DIR__) . "/uploads/";
        $target_file = $target_dir . $file_name;

        if (!is_dir($target_dir)) {
            mkdir($target_dir, 0755, true);
        }

        if (move_uploaded_file($file_tmp, $target_file)) {
            $image_url = 'uploads/' . $file_name;
        } else {
            $error = error_get_last();
            echo json_encode(['success' => false, 'message' => 'Failed to upload image. Server error: ' . ($error['message'] ?? 'Check directory permissions and file size limits.')]);
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