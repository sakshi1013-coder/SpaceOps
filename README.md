# SpaceOps - Satellite Ground Station Monitoring Portal

SpaceOps is a centralized full-stack monitoring portal for orbital satellites, receiver ground station sites, and real-time telemetry log feeds. It is designed with Node.js/Express on the backend, MySQL on the database layer, and EJS-rendered responsive HTML5/CSS3 templates for the frontend interface.

## Tech Stack

- **Backend Runtime**: [Node.js](https://nodejs.org/) (v18+)
- **Web Framework**: [Express.js](https://expressjs.com/) (v4.x)
- **Database**: [MySQL](https://www.mysql.com/) (v8.0+)
- **View Engine**: [EJS](https://ejs.co/) (Embedded JavaScript)
- **Styling & UI**: Vanilla CSS3 (custom futuristic Space/Cyberpunk Dark Theme with glassmorphism, responsive navigation)
- **Security & Authentication**: [bcryptjs](https://www.npmjs.com/package/bcryptjs) (password hashing), [express-session](https://www.npmjs.com/package/express-session) (session management)
- **Configuration**: [dotenv](https://www.npmjs.com/package/dotenv) for environment variables

## System Features


1. **Gatekeeper Authentication & Roles**:
   - Session-based operator authentication.
   - Dynamic Role-Based Access Control (RBAC) with three distinct profiles:
     - **Admin**: Complete administrative CRUD access to all modules, including user database profiles.
     - **Manager**: Read and Update access across all modules; and Create/Delete permissions for Satellites and Stations.
     - **Operator**: Read-only access for Satellites and Ground Stations. Full access (Create/Read/Update/Delete) for Telemetry Logs.
2. **Command Dashboard**:
   - Total satellite telemetry counters, active receiver indicators, live health ratio metrics.
   - Interactive lists showing the latest ground stations registered and live signal updates.
3. **Satellite Registry (CRUD)**:
   - Tracks Spacecraft designation, orbit config (LEO, MEO, GEO, HEO), mission launch date, and online status.
4. **Ground Sites Registry (CRUD)**:
   - Manages receiver station identities, geographic coordinates, and active signal sync states.
5. **Signal Telemetry DB (CRUD)**:
   - Logs specific signal strengths in decibel-milliwatts (dBm), acquisition timestamps, and operational status notes.
6. **Operational Reports & Stats**:
   - Dynamic analytical charts and aggregations computed directly on the database (averages, minimum/maximum signal counts, status distribution breakdowns).
7. **Modern Space Cyberpunk Aesthetics**:
   - Dark theme layout using CSS glassmorphism cards, glowing status metrics, real-time responsive navigation sidebars, live clocks, and client-side searchable tables.

---

## Directory Structure

```
SpaceOps/
├── server.js            # Express application entry server
├── package.json         # Backend node packages list
├── database.sql         # SQL schema definitions and database seed entries
├── .env                 # Environment secrets (Port, DB details)
├── .env.example         # Template environment setup file
│
├── config/
│   └── db.js            # Connection pool & automatic database seeding script
│
├── middleware/
│   └── auth.js          # Authentication guard and role authorization checks
│
├── controllers/
│   ├── authController.js
│   ├── dashboardController.js
│   ├── satelliteController.js
│   ├── stationController.js
│   ├── telemetryController.js
│   └── reportController.js
│
├── routes/
│   ├── auth.js
│   ├── dashboard.js
│   ├── satellites.js
│   ├── stations.js
│   ├── telemetry.js
│   └── reports.js
│
├── public/
│   ├── css/
│   │   └── style.css    # Central styling sheet (glassmorphism/space dark theme)
│   └── js/
│       └── main.js      # System scripts (UTC clock, live search filter, alert fades)
│
├── views/               # EJS template views
│   ├── layout/          # Layout pieces (header, sidebar, footer)
│   ├── login.ejs        # Credentials entrance gate
│   ├── dashboard.ejs    # Control panel overview
│   ├── error.ejs        # Error layout (403, 404, 500)
│   ├── satellites/      # Satellite list and CRUD form views
│   ├── stations/        # Ground station list and CRUD form views
│   └── telemetry/       # Telemetry logs list and CRUD form views
│
└── README.md
```

---

## Installation & Local Execution

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **MySQL Server** (v8.0.0 or higher) running locally or in a cloud instance

### Step 1: Clone and Configure Environment
Copy the environment variables template and customize for your database credentials:
```bash
cp .env.example .env
```
Open `.env` in an editor and set your MySQL password and DB parameters:
```ini
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=spaceops_db
```

### Step 2: Install Node Packages
Run the install command inside the `SpaceOps` directory:
```bash
npm install
```

### Step 3: Run the Application
Start the Node.js server:
```bash
npm start
```

*Note: You do not need to manually import `database.sql`! The server will automatically detect if the tables are missing upon boot, connect to your MySQL database instance, create the database `spaceops_db`, compile all tables, and insert default telemetry and users seed data.*

---

## Gateway Access Credentials

Use these default credentials to test the various Role-Based Access Control permissions:

| Operator Role | Email Address | Gateway Password | Operations Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@spaceops.com` | `admin123` | Root controller, full CRUD on all registry logs |
| **Manager** | `manager@spaceops.com` | `manager123` | Read/Update registries, telemetry operations |
| **Operator** | `operator@spaceops.com` | `operator123` | Read-only access to assets, complete CRUD on signal logs |

---

## AWS EC2 Deployment Guidelines

The SpaceOps Portal is ready for immediate deployment on AWS. Follow these high-level steps to deploy:

1. **Launch EC2 Instance**:
   - Provision an Amazon EC2 instance (Amazon Linux 2 or Ubuntu Server 22.04 LTS).
   - Configure Security Groups to expose port `80` (HTTP) and your chosen Node port (e.g. `3000`), along with port `22` (SSH).
2. **Provision Database**:
   - Deploy an Amazon RDS instance running MySQL, OR install MySQL server directly on the EC2 instance. Ensure the RDS/MySQL Security Groups permit access from the EC2 instance.
3. **Environment Setup**:
   - Install Node.js (via NVM) and git on the EC2 server.
   - Clone your project repository.
   - Populate the production `.env` file with the target RDS endpoint coordinates as `DB_HOST`, along with username/password.
4. **Daemon Control**:
   - Use `PM2` (Process Manager 2) to keep the Node server running continuously:
     ```bash
     npm install -m -g pm2
     pm2 start server.js --name "spaceops-portal"
     pm2 startup
     pm2 save
     ```
5. **Reverse Proxy (Nginx)**:
   - Install Nginx on the EC2 host.
   - Configure a reverse proxy server block to forward incoming port `80` web requests to the Node server running locally (e.g. `http://127.0.0.1:3000`).
