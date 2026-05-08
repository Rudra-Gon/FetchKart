<?php
require_once 'api/db.php';

header('Content-Type: text/plain');

try {
    echo "Adding profile columns to 'users' table...\n";

    $columns = [
        'display_name' => "VARCHAR(100) DEFAULT NULL",
        'email' => "VARCHAR(100) DEFAULT NULL UNIQUE",
        'phone' => "VARCHAR(20) DEFAULT NULL",
        'bio' => "TEXT DEFAULT NULL",
        'profile_pic' => "VARCHAR(255) DEFAULT 'assets/default-avatar.png'"
    ];

    foreach ($columns as $col => $def) {
        $check = $pdo->query("SHOW COLUMNS FROM users LIKE '$col'")->fetch();
        if (!$check) {
            $pdo->exec("ALTER TABLE users ADD $col $def");
            echo "Success: '$col' column added.\n";
        } else {
            echo "Column '$col' already exists.\n";
        }
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
