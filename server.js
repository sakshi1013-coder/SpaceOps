const express = require('express');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
const db = require('./config/db');

// Load environment variables
dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 3000;

// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session management setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'spaceops_super_secret_session_key_123',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 24 Hours
    secure: false, // Set to true if deploying with HTTPS
    httpOnly: true
  }
}));

// Static files routing (CSS, JS, Images)
app.use(express.static(path.join(__dirname, 'public')));

// Template Engine configuration
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Import system routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const satelliteRoutes = require('./routes/satellites');
const stationRoutes = require('./routes/stations');
const telemetryRoutes = require('./routes/telemetry');
const reportRoutes = require('./routes/reports');

// Mount system routes
app.use('/', authRoutes);
app.use('/', dashboardRoutes);
app.use('/satellites', satelliteRoutes);
app.use('/stations', stationRoutes);
app.use('/telemetry', telemetryRoutes);
app.use('/reports', reportRoutes);

// Fallback 404 Error handler
app.use((req, res, next) => {
  res.status(404).render('error', {
    title: 'Resource Not Found',
    errorCode: '404 - NOT FOUND',
    errorMessage: `The system coordinates you requested (${req.originalUrl}) could not be resolved in the SpaceOps directory.`,
    user: req.session.user || null
  });
});

// Global Exception handler
app.use((err, req, res, next) => {
  console.error('[Global Server Error]:', err.stack);
  res.status(500).render('error', {
    title: 'Internal System Failure',
    errorCode: '500 - INTERNAL ERROR',
    errorMessage: 'An unexpected processing malfunction occurred inside the portal server core. Please try again.',
    user: req.session.user || null
  });
});

// Initialize database pool and boot up express listener
async function bootServer() {
  try {
    // Attempt database initialization
    await db.getPool();
    
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`[SYS] SpaceOps Ground Station Portal ONLINE on Port: ${PORT}`);
      console.log(`[SYS] Gateway Address: http://localhost:${PORT}`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('[Fatal boot error]: Server failed to establish database link. Shutting down.');
    process.exit(1);
  }
}

bootServer();
