const db = require('../config/db');

exports.getDashboard = async (req, res) => {
  try {
    // Perform all counts in parallel for optimal performance
    const [
      [satTotal],
      [gsTotal],
      [telTotal],
      [satActive],
      [gsActive],
      recentLogs,
      recentStations
    ] = await Promise.all([
      db.query('SELECT COUNT(*) AS count FROM satellites'),
      db.query('SELECT COUNT(*) AS count FROM ground_stations'),
      db.query('SELECT COUNT(*) AS count FROM telemetry_logs'),
      db.query("SELECT COUNT(*) AS count FROM satellites WHERE status = 'Active'"),
      db.query("SELECT COUNT(*) AS count FROM ground_stations WHERE status = 'Active'"),
      db.query(`
        SELECT t.*, s.satellite_name 
        FROM telemetry_logs t 
        JOIN satellites s ON t.satellite_id = s.id 
        ORDER BY t.timestamp DESC 
        LIMIT 5
      `),
      db.query(`
        SELECT station_name, location, status 
        FROM ground_stations 
        ORDER BY created_at DESC 
        LIMIT 3
      `)
    ]);

    res.render('dashboard', {
      title: 'SpaceOps Dashboard',
      user: req.session.user,
      stats: {
        totalSatellites: satTotal[0].count,
        totalGroundStations: gsTotal[0].count,
        totalTelemetryLogs: telTotal[0].count,
        activeSatellites: satActive[0].count,
        activeGroundStations: gsActive[0].count
      },
      recentLogs: recentLogs[0] || [],
      recentStations: recentStations[0] || []
    });

  } catch (err) {
    console.error('[Dashboard Error]:', err.message);
    res.status(500).render('error', {
      title: 'Database Error',
      errorCode: '500 - INTERNAL SERVER ERROR',
      errorMessage: 'Failed to retrieve telemetry stats or dashboard summary. Check your database connection.',
      user: req.session.user
    });
  }
};
