<?php
require_once __DIR__ . '/bootstrap.php';
require_method('POST');

$body     = json_body();
$email    = strtolower(trim($body['email']    ?? ''));
$password = $body['password'] ?? '';

if (empty($email) || empty($password))
    json_response(['ok' => false, 'error' => 'Email and password are required.'], 400);

$db = db();

// Fetch user by email
$stmt = $db->prepare(
    'SELECT u.id, u.full_name, u.email, u.phone_number, u.role, u.status,
            u.password_hash, u.barangay_id,
            b.name AS barangay_name, b.city AS barangay_city,
            u.avatar_path
     FROM   users u
     LEFT   JOIN barangays b ON b.id = u.barangay_id
     WHERE  u.email = ?
     LIMIT  1'
);
$stmt->execute([$email]);
$user = $stmt->fetch();

// Verify password
if (!$user || !password_verify($password, $user['password_hash']))
    json_response(['ok' => false, 'error' => 'Incorrect email or password.'], 401);

if ($user['status'] === 'rejected')
    json_response(['ok' => false, 'error' => 'Your account access has been rejected. Contact your administrator.'], 403);

// Sign in
sign_in((int) $user['id']);

// Return user without hash
unset($user['password_hash']);

json_response([
    'ok'   => true,
    'user' => $user,
]);
