<?php
/**
 * config/setup.php
 *
 * Run this ONCE from the browser: http://localhost/agapalert/config/setup.php
 * It creates the database, all tables, and the default admin account.
 * DELETE this file after running it.
 */

define('DB_HOST',    'localhost');
define('DB_USER',    'root');
define('DB_PASS',    '');
define('DB_NAME',    'agapalert');
define('DB_CHARSET', 'utf8mb4');

header('Content-Type: text/plain; charset=utf-8');

try {
    // Connect without selecting a database first so we can CREATE it
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';charset=' . DB_CHARSET,
        DB_USER, DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    // Create database
    $pdo->exec('CREATE DATABASE IF NOT EXISTS `' . DB_NAME . '`
                CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    $pdo->exec('USE `' . DB_NAME . '`');
    echo "✓ Database created or already exists.\n";

    // Run schema file
    $sql = file_get_contents(__DIR__ . '/../database.sql');

    // Strip the CREATE DATABASE / USE lines (we already handled them)
    $sql = preg_replace('/CREATE DATABASE.*?;/si', '', $sql);
    $sql = preg_replace('/USE\s+\w+\s*;/i', '', $sql);

    // Split on semicolons and run each statement
    $statements = array_filter(
        array_map('trim', explode(';', $sql)),
        fn($s) => $s !== ''
    );

    foreach ($statements as $stmt) {
        if (str_starts_with(ltrim($stmt), '--')) continue;
        $pdo->exec($stmt);
    }
    echo "✓ Tables created.\n";

    // Create admin account with a real bcrypt hash
    $adminEmail    = 'admin@agapalert.ph';
    $adminPassword = 'admin123';   // ← Change this before going live
    $adminHash     = password_hash($adminPassword, PASSWORD_BCRYPT, ['cost' => 12]);
    $check = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
    $check->execute([$adminEmail]);

    if ($check->fetch()) {
        // Update the hash in case it was a placeholder
        $upd = $pdo->prepare('UPDATE users SET password_hash = ? WHERE email = ?');
        $upd->execute([$adminHash, $adminEmail]);
        echo "✓ Admin password updated.\n";
    } else {
        $ins = $pdo->prepare(
            'INSERT INTO users (full_name, email, password_hash, role, status)
             VALUES (?, ?, ?, "admin", "active")'
        );
        $ins->execute(['System Administrator', $adminEmail, $adminHash]);
        echo "✓ Admin account created.\n";
    }

    echo "\n✅ Setup complete!\n";
    echo "   Email:    " . $adminEmail . "\n";
    echo "   Password: " . $adminPassword . "\n\n";
    echo "⚠️  DELETE this file now (config/setup.php).\n";

} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
