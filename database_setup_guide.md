# SpaceOps Database Configuration & Workbench Setup Guide

This guide provides step-by-step instructions for setting up the MySQL database, configuring connection pools in Node.js, and mapping the monitoring modules to their database operations.

---

## 1. Complete `database.sql` Script

Save the following SQL script as `database.sql` (already created in your `SpaceOps/` directory) and run it in MySQL Workbench:

```sql
-- Create SpaceOps Database
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
    signal_strength DECIMAL(5, 2) NOT NULL, -- signal level in dBm
    timestamp DATETIME NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (satellite_id) REFERENCES satellites(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Seed Users Data (Passwords are admin123, manager123, operator123 respectively)
INSERT INTO users (name, email, password, role) VALUES 
('Alex Administrator', 'admin@spaceops.com', '$2a$10$eZMRhJ6mvGAjNTqtPBnRwOFxroBsvinImUO38r2gE3A27Z4fh4g5q', 'Admin'),
('Maria Manager', 'manager@spaceops.com', '$2a$10$WzIt2z3vtSIm5xWyZjTDreD/evQ6aIIO3D0DqOkxJCoerieGJYrH6', 'Manager'),
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
(6, 4, -110.00, '2026-06-15 09:15:00', 'No carrier signal detected, satellite is inactive.')
ON DUPLICATE KEY UPDATE id=id;
```

---

## 2. Step-by-Step MySQL Workbench Setup Instructions

Follow these instructions to configure and initialize your database using **MySQL Workbench**:

1. **Launch MySQL Workbench** on your machine.
2. **Create a New MySQL Connection**:
   - In the home tab, click the **`+` icon** next to the "MySQL Connections" heading.
3. **Configure Connection Properties**:
   - **Connection Name**: `SpaceOps Local`
   - **Connection Method**: `Standard (TCP/IP)`
   - **Hostname**: `127.0.0.1` (or `localhost`)
   - **Port**: `3306`
   - **Username**: `root`
   - **Password**: Click **Store in Vault...** and enter your root password (e.g., `sakshi8055`).
   - Click the **Test Connection** button at the bottom right. You should see a dialog confirming connection success.
   - Click **OK** to save the connection.
4. **Open the SQL Workspace**:
   - Double-click the newly created **SpaceOps Local** connection card.
5. **Load and Run the Setup Script**:
   - Click **File** -> **Open SQL Script...** in the top menu bar.
   - Navigate to the `SpaceOps` folder and select the `database.sql` file.
   - Click the **Execute (lightning bolt)** button in the SQL editor toolbar to run the script. This creates the database schema and seeds the sample records.
6. **Verify Tables and Sample Data**:
   - In the left sidebar **Schemas** panel, right-click and select **Refresh All**.
   - Expand `spaceops_db` -> **Tables**.
   - Right-click the `telemetry_logs` table and select **Select Rows - Limit 1000**.
   - Verify that the seeded telemetry signal strength records are populated in the query results panel.

---

## 3. Node.js MySQL Connection Configuration

### Required npm Packages
Our project relies on two main library packages for database operations:
- **`mysql2`**: A modern database driver for Node.js that supports connection pooling and yields native JavaScript Promises (allowing us to write clean `async/await` syntax instead of callbacks).
- **`dotenv`**: Loads environment settings from a local `.env` file into `process.env`.

### Environment Variables placement (`.env`)
The database connection coordinates are declared in the **`.env` file** located in the root of the project (`SpaceOps/.env`). Add or update these keys:

```ini
PORT=3000
SESSION_SECRET=spaceops_super_secret_session_key_123

# Database configuration parameters:
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sakshi8055
DB_NAME=spaceops_db
```

- **`DB_HOST`**: The hostname where MySQL is running (use local loopback `127.0.0.1` for local setup).
- **`DB_PORT`**: The network port MySQL listens on (default is `3306`).
- **`DB_USER`**: The database user name (e.g. `root`).
- **`DB_PASSWORD`**: The password assigned to the MySQL root user (e.g. `sakshi8055`).
- **`DB_NAME`**: The specific schema containing our monitoring portal tables (`spaceops_db`).

---

## 4. Complete MySQL Connection Code (`config/db.js`)

This file manages the connection pool, handles initialization, and exposes a promise-based query wrapper:

```javascript
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ override: true }); // override forces loading variables from .env over shell defaults

let pool;

async function getPool() {
  if (!pool) {
    try {
      const dbHost = process.env.DB_HOST || '127.0.0.1';
      const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
      const dbUser = process.env.DB_USER || 'root';
      const dbPassword = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '';
      const dbName = process.env.DB_NAME || 'spaceops_db';

      // 1. Temporary connection to ensure the database schema exists
      const initConnection = await mysql.createConnection({
        host: dbHost,
        port: dbPort,
        user: dbUser,
        password: dbPassword
      });
      
      await initConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
      await initConnection.end();

      // 2. Create standard connection pool
      pool = mysql.createPool({
        host: dbHost,
        port: dbPort,
        user: dbUser,
        password: dbPassword,
        database: dbName,
        waitForConnections: true,
        connectionLimit: 10, // Max simultaneous connections to allow in the pool
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
      });

      console.log(`[DB] Connected to MySQL database "${dbName}"`);
      
      // Auto-seeds the database if it doesn't find tables
      await initializeDatabase(pool);
    } catch (err) {
      console.error('[DB Error] Failed to connect or initialize database:', err.message);
      console.error('Ensure MySQL is running and credentials in .env are correct.');
      throw err;
    }
  }
  return pool;
}

// Function to auto-run database.sql schema on startup if DB is uninitialized
async function initializeDatabase(activePool) {
  try {
    const [tables] = await activePool.query("SHOW TABLES LIKE 'users'");
    if (tables.length === 0) {
      console.log("[DB] Tables not found. Initializing database schema...");
      const sqlFilePath = path.join(__dirname, '../database.sql');
      const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
      
      const queries = sqlContent
        .split(/;(?=(?:[^']*'[^']*')*[^']*$)/)
        .map(q => q.trim())
        .filter(q => q.length > 0 && !q.startsWith('--') && !q.startsWith('/*'));

      for (let query of queries) {
        if (query.toUpperCase().startsWith('CREATE DATABASE') || query.toUpperCase().startsWith('USE ')) {
          continue;
        }
        await activePool.query(query);
      }
      console.log("[DB] Schema creation and seeding complete.");
    }
  } catch (err) {
    console.error("[DB Init Error] Failed to seed database:", err.message);
  }
}

module.exports = {
  getPool,
  // High-level wrapper executing queries directly against the pool
  query: async (sql, params) => {
    const activePool = await getPool();
    return activePool.query(sql, params);
  }
};
```

---

## 5. Module-by-Module Integration Details

Each dashboard view corresponds directly to backend routers and MySQL queries:

### A. Authentication Module
- **Backend API Routes**:
  - `GET /login`: Renders the login portal screen.
  - `POST /login`: Validates inputs, pulls credentials, matches crypt hashes, and loads the user session.
  - `GET /logout`: Destroys the cookie session and redirects to `/login`.
- **MySQL Queries**:
  - Fetch user credentials:
    ```sql
    SELECT * FROM users WHERE email = ?
    ```
- **How it interacts**:
  1. The controller receives the email string from the login form.
  2. Runs a parameterized query to look up the user record.
  3. Uses `bcryptjs.compare()` to compare the user's password input against the hashed password returned by MySQL.
  4. Stores matching user properties (ID, name, email, role) in `req.session.user`.

### B. Satellites Management (CRUD)
- **Backend API Routes**:
  - `GET /satellites`: Renders the full fleet registry.
  - `GET /satellites/create` & `POST /satellites/create`: Renders form and saves a new satellite.
  - `GET /satellites/edit/:id` & `POST /satellites/edit/:id`: Renders form and updates satellite properties.
  - `POST /satellites/delete/:id`: Removes a satellite record.
- **MySQL Queries**:
  - Retrieve list:
    ```sql
    SELECT * FROM satellites ORDER BY satellite_name ASC
    ```
  - Create new entry:
    ```sql
    INSERT INTO satellites (satellite_name, orbit_type, launch_date, status) VALUES (?, ?, ?, ?)
    ```
  - Read single record:
    ```sql
    SELECT * FROM satellites WHERE id = ?
    ```
  - Update:
    ```sql
    UPDATE satellites SET satellite_name = ?, orbit_type = ?, launch_date = ?, status = ? WHERE id = ?
    ```
  - Delete:
    ```sql
    DELETE FROM satellites WHERE id = ?
    ```
- **How it interacts**:
  - Performs SQL queries to modify records in the `satellites` table.
  - Enforces role checks: Block operator role requests from routing to write endpoints (`create`, `edit`, `delete`), rendering a 403 error page.

### C. Ground Station Management (CRUD)
- **Backend API Routes**:
  - `GET /stations`: Displays ground sites.
  - `GET /stations/create` & `POST /stations/create`: Renders form and saves a station site.
  - `GET /stations/edit/:id` & `POST /stations/edit/:id`: Modifies site coordinates.
  - `POST /stations/delete/:id`: Removes site records.
- **MySQL Queries**:
  - Retrieve list:
    ```sql
    SELECT * FROM ground_stations ORDER BY station_name ASC
    ```
  - Create:
    ```sql
    INSERT INTO ground_stations (station_name, location, status) VALUES (?, ?, ?)
    ```
  - Update:
    ```sql
    UPDATE ground_stations SET station_name = ?, location = ?, status = ? WHERE id = ?
    ```
  - Delete:
    ```sql
    DELETE FROM ground_stations WHERE id = ?
    ```
- **How it interacts**:
  - Modifies records inside the `ground_stations` table. Hides action buttons in the user interface if the session role is `Operator`.

### D. Telemetry Logs Module (CRUD)
- **Backend API Routes**:
  - `GET /telemetry`: Lists live signal streams.
  - `GET /telemetry/create` & `POST /telemetry/create`: Logs new telemetry logs.
  - `GET /telemetry/edit/:id` & `POST /telemetry/edit/:id`: Modifies previous log details.
  - `POST /telemetry/delete/:id`: Deletes signal logs.
- **MySQL Queries**:
  - Retrieve list (joining tables to pull satellite designates):
    ```sql
    SELECT t.*, s.satellite_name 
    FROM telemetry_logs t 
    JOIN satellites s ON t.satellite_id = s.id 
    ORDER BY t.timestamp DESC
    ```
  - Create:
    ```sql
    INSERT INTO telemetry_logs (satellite_id, signal_strength, timestamp, notes) VALUES (?, ?, ?, ?)
    ```
  - Update:
    ```sql
    UPDATE telemetry_logs SET satellite_id = ?, signal_strength = ?, timestamp = ?, notes = ? WHERE id = ?
    ```
  - Delete:
    ```sql
    DELETE FROM telemetry_logs WHERE id = ?
    ```
- **How it interacts**:
  - Interacts with both the `telemetry_logs` and `satellites` tables.
  - Allows full access across all roles (Operators, Managers, and Admins can record signal logs).

---

## 6. Testing Instructions

### A. Inserting Test Data
You can seed test data in two ways:
1. **Via Portal Web UI**:
   - Log into the portal (e.g. `admin@spaceops.com`).
   - Go to the **Satellites** registry page, click **Register Satellite**, fill in the details, and click **Deploy Registry**.
   - Go to the **Telemetry Logs** page, click **Record Telemetry**, choose the newly created satellite from the dropdown list, type in a signal strength value like `-78.50`, pick a timestamp, and save.
2. **Via MySQL Workbench**:
   - Open a query tab in MySQL Workbench and run:
     ```sql
     USE spaceops_db;
     INSERT INTO satellites (satellite_name, orbit_type, launch_date, status) 
     VALUES ('Voyager-X', 'HEO (Highly Elliptical Orbit)', '2026-06-15', 'Active');
     ```

### B. Verifying Data in MySQL Workbench
Ensure your web portal inputs are accurately persisted in the database:
- Run a query to select telemetry logs grouped by satellite:
  ```sql
  USE spaceops_db;
  SELECT t.id, s.satellite_name, t.signal_strength, t.timestamp 
  FROM telemetry_logs t 
  JOIN satellites s ON t.satellite_id = s.id 
  ORDER BY t.timestamp DESC;
  ```
- Make sure records match the entries typed in the web form.

### C. Testing CRUD Actions
1. **Create Verification**: Add a new record (satellite, ground station, or log) in the UI. Go to the dashboard and confirm the count card increases by 1.
2. **Read Verification**: Confirm the new entry is displayed in the tables list. Type its name in the search filter bar and confirm the table filters in real-time.
3. **Update Verification**: Click the **Edit icon (blue pen)** on the record. Change its details and click save. Confirm that the list shows the updated values and no duplication occurred.
4. **Delete Verification**: Click the **Delete icon (red trash can)** on the record, click OK on the confirmation dialog, and check that it is removed from the table list and dashboard counts.
5. **RBAC Guard Testing**: 
   - Log out, and sign back in as `operator@spaceops.com`.
   - Try to navigate directly to `http://localhost:3000/satellites/create`.
   - Confirm that the system blocks you and renders the stylized **403 Access Denied** error page.

---

## 7. Troubleshooting: Resetting MySQL Root Password on macOS

If you receive the **`Access denied for user 'root'@'localhost'`** error when testing the connection in MySQL Workbench with your password `sakshi8055`, it means the MySQL server is active but does not recognize that password for the `root` account. 

Since you are running the official macOS Oracle MySQL server package (`/usr/local/mysql`), follow these steps to reset the root password to `sakshi8055`:

### Step 1: Stop the MySQL Server
1. Click the apple icon in the top-left of your Mac screen and open **System Settings**.
2. Scroll to the bottom of the left sidebar and click **MySQL**.
3. Click the **Stop MySQL Server** button (type in your macOS lock screen password when prompted).

### Step 2: Start MySQL in Safe Mode
1. Open your Mac **Terminal** application.
2. Run the following command to start the MySQL server in safe mode, bypassing the permissions/grants table check:
   ```bash
   sudo /usr/local/mysql/bin/mysqld_safe --skip-grant-tables --skip-networking &
   ```
   *(Enter your macOS lock screen password when prompted. The `&` runs the process in the background).*

### Step 3: Connect and Reset the Password
1. In the same terminal window (or a new one), connect to the database command line:
   ```bash
   sudo /usr/local/mysql/bin/mysql -u root
   ```
   *(This opens the database terminal, showing a `mysql>` command prompt).*
2. Execute the following SQL commands to update the password to `sakshi8055`:
   ```sql
   -- 1. Reload the system permission tables
   FLUSH PRIVILEGES;

   -- 2. Update the root user password (caching_sha2_password is standard for MySQL 8/9)
   ALTER USER 'root'@'localhost' IDENTIFIED WITH caching_sha2_password BY 'sakshi8055';
   ```
   *(If the `ALTER USER` command outputs an error, try using this legacy version instead)*:
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'sakshi8055';
   ```
3. Exit the database:
   ```sql
   EXIT;
   ```

### Step 4: Restart MySQL normally
1. Kill the running safe-mode instance:
   ```bash
   sudo pkill mysqld
   ```
2. Return to Mac **System Settings** -> **MySQL** and click the **Start MySQL Server** button.
3. Open **MySQL Workbench**, double-click **SpaceOps Local**, enter `sakshi8055`, and you will successfully connect!

