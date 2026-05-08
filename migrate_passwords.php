<?php
// migrate_passwords.php
require_once 'api/db.php';

header('Content-Type: text/plain');

try {
    echo "Starting password migration...\n";

    $stmt = $pdo->query("SELECT id, password FROM users");
    $users = $stmt->fetchAll();

    $count = 0;
    foreach ($users as $user) {
        $id = $user['id'];
        $plain = $user['password'];

        // Only hash if it's not already hashed (very basic check)
        // password_get_info returns ['algo' => 0] for plain text or unknown hashes
        $info = password_get_info($plain);
        if ($info['algo'] === 0) {
            $hashed = password_hash($plain, PASSWORD_DEFAULT);
            $update = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
            $update->execute([$hashed, $id]);
            $count++;
            echo "User ID $id migrated.\n";
        } else {
            echo "User ID $id already hashed.\n";
        }
    }

    echo "\nTotal users migrated: $count\n";
    echo "Migration complete.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
