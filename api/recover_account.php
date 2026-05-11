<?php
require_once 'db.php';
header('Content-Type: application/json');

$action = $_GET['action'] ?? '';

if ($action === 'send_otp') {
    $phone = $_POST['phone'] ?? '';
    
    if (!$phone) {
        echo json_encode(['success' => false, 'message' => 'Phone number is required']);
        exit;
    }
    
    $stmt = $pdo->prepare('SELECT id FROM users WHERE phone = ?');
    $stmt->execute([$phone]);
    $user = $stmt->fetch();
    
    if ($user) {
        // In a real app, integrate with SMS gateway (e.g. Twilio)
        // For now, simulate OTP
        session_start();
        $_SESSION['recovery_otp'] = '123456';
        $_SESSION['recovery_phone'] = $phone;
        echo json_encode(['success' => true, 'message' => 'OTP sent to mobile number']);
    } else {
        echo json_encode(['success' => false, 'message' => 'No account found with this mobile number']);
    }
} elseif ($action === 'verify_otp') {
    session_start();
    $phone = $_POST['phone'] ?? '';
    $otp = $_POST['otp'] ?? '';
    $new_password = $_POST['new_password'] ?? '';
    
    if (isset($_SESSION['recovery_otp']) && $_SESSION['recovery_otp'] === $otp && $_SESSION['recovery_phone'] === $phone) {
        $hashed = password_hash($new_password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare('UPDATE users SET password = ? WHERE phone = ?');
        $stmt->execute([$hashed, $phone]);
        
        unset($_SESSION['recovery_otp']);
        unset($_SESSION['recovery_phone']);
        echo json_encode(['success' => true, 'message' => 'Password reset successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid OTP']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid action']);
}
?>
