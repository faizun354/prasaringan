-- ========================================================================
-- SISTEM PRESENSI PONDOK PESANTREN
-- SKEMA DATABASE MYSQL (SIAP UNTUK MYSQL WORKBENCH & HOSTING VPS)
-- ========================================================================

-- 1. Buat Database (Jika belum ada)
CREATE DATABASE IF NOT EXISTS db_presensi_pondok
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE db_presensi_pondok;

-- Nonaktifkan pengecekan foreign key sementara untuk inisialisasi
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------
-- 2. TABEL: users (Akun Login Admin & Santri)
-- ------------------------------------------------------------------------
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'santri') NOT NULL DEFAULT 'santri',
    nama VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Akun Default Siap Pakai:
-- Admin:  admin / admin123
-- Santri: mahasantri / mahasantri123
INSERT INTO users (username, password, role, nama) VALUES
('admin', 'admin123', 'admin', 'Administrator Pesantren'),
('mahasantri', 'mahasantri123', 'santri', 'Portal Umum Santri');

-- ------------------------------------------------------------------------
-- 3. TABEL: santri (Master Data Santri)
-- ------------------------------------------------------------------------
DROP TABLE IF EXISTS santri;
CREATE TABLE santri (
    id VARCHAR(50) PRIMARY KEY,
    nis VARCHAR(30) NOT NULL UNIQUE,
    nama VARCHAR(150) NOT NULL,
    gender ENUM('Putra', 'Putri') DEFAULT 'Putra',
    angkatan VARCHAR(30) NOT NULL,
    kelas VARCHAR(50) NOT NULL,
    jenjang VARCHAR(50) DEFAULT 'Santri',
    status ENUM('Aktif', 'Izin Pulang', 'Non-Aktif') DEFAULT 'Aktif',
    foto_url LONGTEXT NULL,
    qr_token VARCHAR(100) NOT NULL UNIQUE,
    nama_wali VARCHAR(150) NULL,
    total_hadir INT DEFAULT 0,
    total_izin INT DEFAULT 0,
    total_sakit INT DEFAULT 0,
    total_alfa INT DEFAULT 0,
    persentase INT DEFAULT 100,
    status_disiplin VARCHAR(50) DEFAULT 'Sangat Disiplin',
    last_scan VARCHAR(50) DEFAULT 'Baru Diterbitkan',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nis (nis),
    INDEX idx_status (status),
    INDEX idx_kelas (kelas)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------
-- 4. TABEL: activities (Jadwal & Agenda Kegiatan)
-- ------------------------------------------------------------------------
DROP TABLE IF EXISTS activities;
CREATE TABLE activities (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    time VARCHAR(50) NOT NULL,
    location VARCHAR(150) NOT NULL,
    status ENUM('Akan Datang', 'Sedang Berlangsung', 'Selesai') DEFAULT 'Akan Datang',
    icon VARCHAR(50) DEFAULT 'event_available',
    petugas VARCHAR(100) DEFAULT 'Admin Presensi',
    hadir_count INT DEFAULT 0,
    total_santri INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------
-- 5. TABEL: attendance_records (Log Presensi Real-Time & Manual)
-- ------------------------------------------------------------------------
DROP TABLE IF EXISTS attendance_records;
CREATE TABLE attendance_records (
    id VARCHAR(50) PRIMARY KEY,
    santri_id VARCHAR(50) NOT NULL,
    nis VARCHAR(30) NOT NULL,
    nama VARCHAR(150) NOT NULL,
    kelas VARCHAR(50) NOT NULL,
    foto_url LONGTEXT NULL,
    kegiatan VARCHAR(150) NOT NULL,
    timestamp VARCHAR(20) NOT NULL,
    date VARCHAR(50) NOT NULL,
    status ENUM('Hadir', 'Izin', 'Sakit', 'Alfa') NOT NULL DEFAULT 'Hadir',
    keterangan TEXT NULL,
    sensor_location VARCHAR(150) DEFAULT 'Scanner Gerbang',
    petugas VARCHAR(100) DEFAULT 'Admin Presensi',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_santri_id (santri_id),
    INDEX idx_nis (nis),
    INDEX idx_kegiatan (kegiatan),
    INDEX idx_date (date),
    INDEX idx_status (status),
    CONSTRAINT fk_attendance_santri 
        FOREIGN KEY (santri_id) REFERENCES santri(id) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Aktifkan kembali pengecekan foreign key
SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------------------
-- 6. TABEL: piket_amalsholih (Dokumentasi foto before & after)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS piket_amalsholih (
    id VARCHAR(60) PRIMARY KEY,
    before_image LONGTEXT NOT NULL,
    after_image LONGTEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- SELESAI. Script ini siap di-Run (Ctrl + Shift + Enter) di MySQL Workbench!
-- ========================================================================
