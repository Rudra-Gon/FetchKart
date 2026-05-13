<?php
// api/auth.php
session_start();
require_once 'db.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? ($_POST['action'] ?? '');

if ($action === 'signup') {
    $username = $_POST['username'] ?? '';
    $password = password_hash($_POST['password'] ?? '', PASSWORD_DEFAULT);
    $role = $_POST['role'] ?? 'customer';

    if (empty($username) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Username and password required.']);
        exit;
    }

    // Handle Profile Pic Upload during signup
    $profile_pic = 'assets/default-avatar.png';
    if (isset($_FILES['profile_pic']) && $_FILES['profile_pic']['error'] === 0) {
        $file = $_FILES['profile_pic'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!in_array($ext, $allowed)) {
            echo json_encode(['success' => false, 'message' => 'Invalid file type for profile picture.']);
            exit;
        }
        $filename = 'profile_new_' . time() . '_' . rand(100, 999) . '.' . $ext;
        $target = '../uploads/profiles/' . $filename;
        if (!is_dir('../uploads/profiles'))
            mkdir('../uploads/profiles', 0777, true);
        if (move_uploaded_file($file['tmp_name'], $target)) {
            $profile_pic = 'uploads/profiles/' . $filename;
        }
    }

    try {
        if ($role === 'seller') {
            $warehouse_option = $_POST['warehouse_option'] ?? 'service';
            $delivery_option = $_POST['delivery_option'] ?? 'service';
            $storage_option = $_POST['storage_option'] ?? null;

            $stmt = $pdo->prepare('INSERT INTO users (username, password, role, warehouse_option, delivery_option, storage_option, profile_pic) VALUES (?, ?, ?, ?, ?, ?, ?)');
            $stmt->execute([$username, $password, $role, $warehouse_option, $delivery_option, $storage_option, $profile_pic]);
        } else {
            $stmt = $pdo->prepare('INSERT INTO users (username, password, role, profile_pic) VALUES (?, ?, ?, ?)');
            $stmt->execute([$username, $password, $role, $profile_pic]);
        }

        $userId = $pdo->lastInsertId();
        $_SESSION['user'] = [
            'id' => $userId,
            'username' => $username,
            'role' => $role
        ];
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            echo json_encode(['success' => false, 'message' => 'Username already exists.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Signup failed: ' . $e->getMessage()]);
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

    try {
        $stmt = $pdo->prepare('SELECT id, username, password, role FROM users WHERE username = ?');
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        $isValidLogin = false;

        if ($user) {
            if (password_verify($password, $user['password'])) {
                $isValidLogin = true;
            } elseif ($password === $user['password']) {
                // Backward compatibility for legacy plaintext passwords.
                // Auto-upgrade to a secure hash on successful login.
                $rehash = password_hash($password, PASSWORD_DEFAULT);
                $update = $pdo->prepare('UPDATE users SET password = ? WHERE id = ?');
                $update->execute([$rehash, $user['id']]);
                $isValidLogin = true;
            }
        }

        if ($isValidLogin) {
            // Remove password from session data for security
            unset($user['password']);
            $_SESSION['user'] = $user;
            echo json_encode(['success' => true, 'user' => $user]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid username or password.']);
        }
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Login error: ' . $e->getMessage()]);
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
        $id = $_SESSION['user']['id'];
        $stmt = $pdo->prepare('SELECT id, username, role, display_name, email, phone, bio, profile_pic FROM users WHERE id = ?');
        $stmt->execute([$id]);
        $user = $stmt->fetch();
        echo json_encode(['logged_in' => true, 'user' => $user]);
    } else {
        echo json_encode(['logged_in' => false]);
    }
    exit;
}

echo json_encode(['error' => 'Invalid action']);
?>