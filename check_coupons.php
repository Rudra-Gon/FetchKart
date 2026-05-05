<?php
require_once 'api/db.php';
$stmt = $pdo->query('SELECT * FROM coupons');
$coupons = $stmt->fetchAll();
print_r($coupons);
?>
