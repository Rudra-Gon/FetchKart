<?php
// api/godown_actions.php
session_start();
require_once 'db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'seller') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$seller_id = $_SESSION['user']['id'];
$action = $_GET['action'] ?? ($_POST['action'] ?? '');

try {
    if ($action === 'view') {
        $stmt = $pdo->prepare('SELECT * FROM godowns WHERE seller_id = ?');
        $stmt->execute([$seller_id]);
        echo json_encode($stmt->fetchAll());
        exit;
    }

    if ($action === 'add') {
        $name = $_POST['name'] ?? '';
        $location = $_POST['location'] ?? '';
        $capacity = $_POST['capacity'] ?? 0;

        if (empty($name)) {
            echo json_encode(['success' => false, 'message' => 'Godown name is required.']);
            exit;
        }

        $stmt = $pdo->prepare('INSERT INTO godowns (seller_id, name, location, capacity) VALUES (?, ?, ?, ?)');
        $stmt->execute([$seller_id, $name, $location, $capacity]);
        echo json_encode(['success' => true, 'message' => 'Godown added successfully!']);
        exit;
    }

    if ($action === 'delete') {
        $id = $_POST['id'] ?? null;
        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'Missing Godown ID.']);
            exit;
        }

        $stmt = $pdo->prepare('DELETE FROM godowns WHERE id = ? AND seller_id = ?');
        $stmt->execute([$id, $seller_id]);
        echo json_encode(['success' => true, 'message' => 'Godown deleted successfully.']);
        exit;
    }

    if ($action === 'update') {
        $id = $_POST['id'] ?? null;
        $name = $_POST['name'] ?? '';
        $location = $_POST['location'] ?? '';
        $capacity = $_POST['capacity'] ?? 0;

        if (!$id || empty($name)) {
            echo json_encode(['success' => false, 'message' => 'ID and Name are required.']);
            exit;
        }

        $stmt = $pdo->prepare('UPDATE godowns SET name = ?, location = ?, capacity = ? WHERE id = ? AND seller_id = ?');
        $stmt->execute([$name, $location, $capacity, $id, $seller_id]);
        echo json_encode(['success' => true, 'message' => 'Godown updated successfully.']);
        exit;
    }

    echo json_encode(['success' => false, 'message' => 'Invalid action.']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>