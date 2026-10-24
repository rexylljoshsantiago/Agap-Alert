# AgapAlert - PHP + MySQL edition

## Setup (XAMPP)
1. Install XAMPP and start **Apache** and **MySQL** in the control panel.
2. Copy this folder to `C:\xampp\htdocs\agapalert`.
3. Open http://localhost/phpmyadmin -> **Import** -> choose `database/schema.sql` -> Go.
4. Open http://localhost/agapalert/check_db.php - you should see "Database connection OK".
5. Open http://localhost/agapalert/setup_demo_users.php once to create two test accounts (password `agapalert123`), then **delete** that file and `check_db.php`.
6. Sign in at http://localhost/agapalert/login.php

Requires PHP 8.1+ (current XAMPP is fine). If you set a MySQL password, edit `config.php`.

## Upgrading from an earlier stage
Do **not** re-import `schema.sql` if you already have accounts: it drops every table. Instead run
`database/migrations/003_stage3_upgrade.sql` in phpMyAdmin (SQL tab). Then open
`http://localhost/agapalert/engine_check.php` while signed in to see the alert engine on live data.

## Troubleshooting live weather
`engine_check.php` shows a "fallback" badge with the reason when it cannot reach Open-Meteo.
- *cURL ... SSL certificate problem*: XAMPP has no CA bundle. Download `cacert.pem` from curl.se/docs/caextract.html,
  save it as `C:\xampp\php\extras\ssl\cacert.pem`, and in `C:\xampp\php\php.ini` set
  `curl.cainfo = "C:\xampp\php\extras\ssl\cacert.pem"`, then restart Apache.
  (Local-only shortcut: set `HTTP_VERIFY_SSL` to `false` in `config.php`.)
- *file_get_contents failed*: enable `extension=curl` in `php.ini` and restart Apache.

## Approving official accounts
New officials register as `pending` and have resident access only. Approve one in phpMyAdmin:
`UPDATE users SET status='active' WHERE email='kap@example.ph';`
(An in-app approval screen can be added later.)

## Conversion progress
- [x] Stage 1: MySQL schema, config, PDO connection
- [x] Stage 2: Auth (register / login / logout / roles, replaces Supabase Auth + RLS)
- [x] Stage 3: Alert engine (backend/alerts.ts -> includes/alerts.php), verified against the original
- [ ] Stage 4: API endpoints (alerts, detect, stations, forecast)
- [ ] Stage 5: Radar dashboard + map
- [ ] Stage 6: Evacuation centers, reports, SOS, hotlines
- [ ] Stage 7: Email notifications (PHPMailer)
- [ ] Stage 8: Polish and responsive CSS

## Replacing Row Level Security
| Old Supabase rule | Enforced in PHP |
|---|---|
| Only logged-in users read data | `require_login()` |
| Officials manage centers / inventory / advisories of their own barangay, only if status = active | `require_official($barangayId)` |
| Residents see only their own reports; officials see their barangay's | filter in `api/reports.php` |
| Users edit only their own profile | `WHERE id = current_user_id` |
