CREATE DATABASE agapalert;

USE agapalert;

CREATE TABLE barangays (
    id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    city VARCHAR(120) NOT NULL
);

INSERT INTO barangays (name, city) VALUES
    ('Dalongue',       'Santa Barbara'),
    ('Poblacion Sur',  'Santa Barbara'),
    ('Tuliao',         'Santa Barbara');

CREATE TABLE users (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name     VARCHAR(160) NOT NULL,
    email         VARCHAR(191) NULL UNIQUE,
    phone_number  VARCHAR(40)  NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          ENUM('resident','official','admin') NOT NULL DEFAULT 'resident',
    status        ENUM('active','pending','rejected') NOT NULL DEFAULT 'active',
    barangay_id   INT UNSIGNED NULL,
    avatar_path   VARCHAR(255) NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (barangay_id) REFERENCES barangays(id) ON DELETE SET NULL
);

CREATE TABLE invite_codes (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code       VARCHAR(20)  NOT NULL UNIQUE,
    note       VARCHAR(255) NULL,
    created_by INT UNSIGNED NOT NULL,
    used_by    INT UNSIGNED NULL,
    status     ENUM('unused','used','expired') NOT NULL DEFAULT 'unused',
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (used_by)    REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE shelters (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    barangay_id INT UNSIGNED NULL,
    capacity    INT UNSIGNED NOT NULL DEFAULT 0,
    occupancy   INT UNSIGNED NOT NULL DEFAULT 0,
    contact     VARCHAR(60)  NULL,
    is_open     TINYINT(1)   NOT NULL DEFAULT 1,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (barangay_id) REFERENCES barangays(id) ON DELETE SET NULL
);

CREATE TABLE reports (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED NULL,
    title       VARCHAR(255) NOT NULL,
    description TEXT         NULL,
    location    VARCHAR(255) NULL,
    barangay_id INT UNSIGNED NULL,
    status      ENUM('new','acknowledged','dispatched','resolved') NOT NULL DEFAULT 'new',
    is_sos      TINYINT(1)   NOT NULL DEFAULT 0,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)     REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (barangay_id) REFERENCES barangays(id) ON DELETE SET NULL
);
