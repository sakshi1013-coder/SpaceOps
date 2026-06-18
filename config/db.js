const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ override: true });

let pool;

async function getPool() {
  if (!pool) {
    try {
      const dbHost = process.env.DB_HOST || '127.0.0.1';
      const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
      const dbUser = process.env.DB_USER || 'root';
      const dbPassword = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '';
      const dbName = process.env.DB_NAME || 'spaceops_db';

      // 1. Create a temporary connection to ensure the database exists
      const initConnection = await mysql.createConnection({
        host: dbHost,
        port: dbPort,
        user: dbUser,
        password: dbPassword
      });
      
      await initConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
      await initConnection.end();

      // 2. Create the connection pool
      pool = mysql.createPool({
        host: dbHost,
        port: dbPort,
        user: dbUser,
        password: dbPassword,
        database: dbName,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
      });

      console.log(`[DB] Connected to MySQL database "${dbName}"`);
      
      // Initialize tables and seed data if not present
      await initializeDatabase(pool);
    } catch (err) {
      console.error('[DB Error] Failed to connect or initialize database:', err.message);
      console.error('Ensure MySQL is running and credentials in .env are correct.');
      throw err;
    }
  }
  return pool;
}

async function initializeDatabase(activePool) {
  try {
    // Check if tables exist by querying for the 'users' table
    const [tables] = await activePool.query("SHOW TABLES LIKE 'users'");
    if (tables.length === 0) {
      console.log("[DB] Tables not found. Initializing database schema and seeding sample data...");
      const sqlFilePath = path.join(__dirname, '../database.sql');
      const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
      
      // Split the schema SQL statements by semicolons, ignoring comments and handling string literals
      const queries = sqlContent
        .split(/;(?=(?:[^']*'[^']*')*[^']*$)/)
        .map(q => q.trim())
        .filter(q => q.length > 0 && !q.startsWith('--') && !q.startsWith('/*'));

      for (let query of queries) {
        if (query.toUpperCase().startsWith('CREATE DATABASE') || query.toUpperCase().startsWith('USE ')) {
          // Skip these since we already handle database selection and creation
          continue;
        }
        await activePool.query(query);
      }
      console.log("[DB] Schema creation and seeding complete.");
    } else {
      console.log("[DB] Schema already initialized. Skipping seeding.");
    }
  } catch (err) {
    console.error("[DB Init Error] Failed to seed database:", err.message);
  }
}

module.exports = {
  getPool,
  query: async (sql, params) => {
    const activePool = await getPool();
    return activePool.query(sql, params);
  }
};
