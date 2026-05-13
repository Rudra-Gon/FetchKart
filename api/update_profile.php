<?php
// api/update_profile.php
session_start();
require_once 'db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user']['id'];
$action = $_GET['action'] ?? 'update_info';

if ($action === 'update_info') {
    $display_name = $_POST['display_name'] ?? '';
    $email = $_POST['email'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $bio = $_POST['bio'] ?? '';

    try {
        $stmt = $pdo->prepare('UPDATE users SET display_name = ?, email = ?, phone = ?, bio = ? WHERE id = ?');
        $stmt->execute([$display_name, $email, $phone, $bio, $user_id]);
        echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

if ($action === 'update_password') {
    $current = $_POST['current_password'] ?? '';
    $new = $_POST['new_password'] ?? '';
    $confirm = $_POST['confirm_password'] ?? '';

    if ($new !== $confirm) {
        echo json_encode(['success' => false, 'message' => 'New passwords do not match']);
        exit;
    }

    try {
        // Fetch current password
        $stmt = $pdo->prepare('SELECT password FROM users WHERE id = ?');
        $stmt->execute([$user_id]);
        $user = $stmt->fetch();

        // Check password (verified against hash)
        if (!password_verify($current, $user['password'])) {
            echo json_encode(['success' => false, 'message' => 'Current password is incorrect']);
            exit;
        }

        // Update password with hash
        $new_hashed = password_hash($new, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare('UPDATE users SET password = ? WHERE id = ?');
        $stmt->execute([$new_hashed, $user_id]);
        echo json_encode(['success' => true, 'message' => 'Password updated successfully']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

if ($action === 'upload_pic') {
    if (!isset($_FILES['profile_pic'])) {
        echo json_encode(['success' => false, 'message' => 'No file uploaded']);
        exit;
    }

    $file = $_FILES['profile_pic'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!in_array($ext, $allowed)) {
        echo json_encode(['success' => false, 'message' => 'Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.']);
        exit;
    }
    $filename = 'profile_' . $user_id . '_' . time() . '.' . $ext;
    $target = '../uploads/profiles/' . $filename;

    if (!is_dir('../uploads/profiles')) {
        mkdir('../uploads/profiles', 0777, true);
    }

    if (move_uploaded_file($file['tmp_name'], $target)) {
        $db_path = 'uploads/profiles/' . $filename;
        $stmt = $pdo->prepare('UPDATE users SET profile_pic = ? WHERE id = ?');
        $stmt->execute([$db_path, $user_id]);
        echo json_encode(['success' => true, 'path' => $db_path]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Upload failed']);
    }
}
?>