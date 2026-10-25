<?php
/**
 * api/flood.php
 * GET  — returns the current flood alert level and river reading
 * POST — admin/official sets a new level (0-3) and optional river meter reading
 */
require_once __DIR__ . '/bootstrap.php';
require_auth();

$db     = db();
$method = $_SERVER['REQUEST_METHOD'];

// ── GET ───────────────────────────────────────────────────────────────────────
if ($method === 'GET') {
    $row = $db->query(
        "SELECT level, river_meters, wind_kmh, rain_mmh, notes, set_by, created_at
         FROM   flood_levels
         ORDER  BY created_at DESC
         LIMIT  1"
    )->fetch();

    if (!$row) {
        // No record yet — return safe defaults
        json_response([
            'ok'    => true,
            'flood' => ['level' => 0, 'river_meters' => 0, 'wind_kmh' => 0, 'rain_mmh' => 0, 'notes' => '', 'created_at' => null]
        ]);
    }

    json_response(['ok' => true, 'flood' => $row]);
}

// ── POST — set new level (officials + admin only) ─────────────────────────────
if ($method === 'POST') {
    $user = current_user();
    if (!in_array($user['role'], ['official', 'admin'], true))
        json_response(['ok' => false, 'error' => 'Hindi awtorisado.'], 403);

    $body  = json_body();
    $level = (int) ($body['level']        ?? 0);
    $river = (float) ($body['river_meters'] ?? 0);
    $wind  = (float) ($body['wind_kmh']     ?? 0);
    $rain  = (float) ($body['rain_mmh']     ?? 0);
    $notes = trim($body['notes']            ?? '');

    if ($level < 0 || $level > 3)
        json_response(['ok' => false, 'error' => 'Ang antas ay dapat 0–3.'], 400);

    $db->prepare(
        "INSERT INTO flood_levels (level, river_meters, wind_kmh, rain_mmh, notes, set_by)
         VALUES (?, ?, ?, ?, ?, ?)"
    )->execute([$level, $river, $wind, $rain, $notes, $user['id']]);

    json_response(['ok' => true, 'message' => 'Antas ng baha na-update.']);
}

json_response(['ok' => false, 'error' => 'Hindi pinapayagang paraan.'], 405);
