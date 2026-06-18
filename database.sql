-- SpaceOps Satellite Ground Station Monitoring Portal Database Schema
CREATE DATABASE IF NOT EXISTS spaceops_db;
USE spaceops_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Manager', 'Operator') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Satellites Table
CREATE TABLE IF NOT EXISTS satellites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    satellite_name VARCHAR(255) NOT NULL,
    orbit_type VARCHAR(100) NOT NULL,
    launch_date DATE NOT NULL,
    status ENUM('Active', 'Inactive', 'Maintenance') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Ground Stations Table
CREATE TABLE IF NOT EXISTS ground_stations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    station_name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    status ENUM('Active', 'Inactive', 'Maintenance') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Telemetry Logs Table
CREATE TABLE IF NOT EXISTS telemetry_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    satellite_id INT NOT NULL,
    signal_strength DECIMAL(5, 2) NOT NULL, -- in dBm (e.g., -80.5)
    timestamp DATETIME NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (satellite_id) REFERENCES satellites(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Seed Data
-- Passwords:
-- Admin: admin123 -> $2a$10$eZMRhJ6mvGAjNTqtPBnRwOFxroBsvinImUO38r2gE3A27Z4fh4g5q
-- Manager: manager123 -> $2a$10$WzIt2z3vtSIm5xWyZjTDreD/evQ6aIIO3D0DqOkxJCoerieGJYrH6
-- Operator: operator123 -> $2a$10$ciPE7uv/f/TDgUR.ecAW3uWqcfI98JQDOjL4S0BAXL7Waudne/ST6

INSERT INTO users (name, email, password, role) VALUES 
('Alex Administrator', 'admin@spaceops.com', '$2a$10$eZMRhJ6mvGAjNTqtPBnRwOFxroBsvinImUO38r2gE3A27Z4fh4g5q', 'Admin')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO users (name, email, password, role) VALUES 
('Maria Manager', 'manager@spaceops.com', '$2a$10$WzIt2z3vtSIm5xWyZjTDreD/evQ6aIIO3D0DqOkxJCoerieGJYrH6', 'Manager')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO users (name, email, password, role) VALUES 
('Owen Operator', 'operator@spaceops.com', '$2a$10$ciPE7uv/f/TDgUR.ecAW3uWqcfI98JQDOjL4S0BAXL7Waudne/ST6', 'Operator')
ON DUPLICATE KEY UPDATE id=id;

-- Seed Satellites
INSERT INTO satellites (id, satellite_name, orbit_type, launch_date, status) VALUES
(1, 'Kepler-10D', 'LEO (Low Earth Orbit)', '2022-04-12', 'Active'),
(2, 'Orion-Nexus', 'MEO (Medium Earth Orbit)', '2023-08-19', 'Active'),
(3, 'Sentinel-V', 'GEO (Geostationary Orbit)', '2021-11-05', 'Maintenance'),
(4, 'NovaStar-1', 'LEO (Low Earth Orbit)', '2024-01-30', 'Inactive')
ON DUPLICATE KEY UPDATE id=id;

-- Seed Ground Stations
INSERT INTO ground_stations (id, station_name, location, status) VALUES
(1, 'Svalbard-1', 'Svalbard, Norway', 'Active'),
(2, 'McMurdo Deep Space', 'Ross Island, Antarctica', 'Active'),
(3, 'Hartebeesthoek', 'Gauteng, South Africa', 'Maintenance'),
(4, 'Santiago Station', 'Maipu, Chile', 'Inactive')
ON DUPLICATE KEY UPDATE id=id;

-- Seed Telemetry Logs
INSERT INTO telemetry_logs (id, satellite_id, signal_strength, timestamp, notes) VALUES
(1, 1, -74.50, '2026-06-15 08:30:00', 'Nominal connection, telemetry tracking active.'),
(2, 1, -76.20, '2026-06-15 09:30:00', 'Slight atmospheric interference detected.'),
(3, 2, -62.10, '2026-06-15 08:45:00', 'Excellent signal strength, high data packet integrity.'),
(4, 2, -63.40, '2026-06-15 09:45:00', 'Nominal download complete.'),
(5, 3, -92.30, '2026-06-15 09:00:00', 'Weak signal, receiver maintenance in progress.'),
(6, 4, -110.00, '2026-06-15 09:15:00', 'No carrier signal detected, satellite is currently inactive.')
ON DUPLICATE KEY UPDATE id=id;
