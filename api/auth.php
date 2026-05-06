<?php
// api/auth.php
session_start();
require_once 'db.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? ($_POST['action'] ?? '');

if ($action === 'signup') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    $role = $_POST['role'] ?? 'customer';

    if (empty($username) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Username and password required.']);
        exit;
    }

    try {
        if ($role === 'seller') {
            $warehouse = $_POST['warehouse_option'] ?? 'service';
            $delivery = $_POST['delivery_option'] ?? 'service';
            $storage = $_POST['storage_option'] ?? 'service';
            $stmt = $pdo->prepare('INSERT INTO users (username, password, role, warehouse_option, delivery_option, storage_option) VALUES (?, ?, ?, ?, ?, ?)');
            $stmt->execute([$username, $password, $role, $warehouse, $delivery, $storage]);
        } else {
            $stmt = $pdo->prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
            $stmt->execute([$username, $password, $role]);
        }
        echo json_encode(['success' => true, 'message' => 'Account created successfully.']);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            echo json_encode(['success' => false, 'message' => 'Username already exists.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Signup failed.']);
        }
    }
    exit;
}

if ($action === 'login') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    if (empty($username) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Username and password required.']);
        exit;
    }

    $stmt = $pdo->prepare('SELECT id, username, role, warehouse_option, delivery_option, storage_option FROM users WHERE username = ? AND password = ?');
    $stmt->execute([$username, $password]);
    $user = $stmt->fetch();

    if ($user) {
        $_SESSION['user'] = $user;
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid username or password.']);
    }
    exit;
}

if ($action === 'logout') {
    session_destroy();
    echo json_encode(['success' => true]);
    exit;
}

if ($action === 'check') {
    if (isset($_SESSION['user'])) {
        echo json_encode(['logged_in' => true, 'user' => $_SESSION['user']]);
    } else {
        echo json_encode(['logged_in' => false]);
    }
    exit;
}

echo json_encode(['error' => 'Invalid action']);
?>
