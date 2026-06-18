const db = require('../config/db');

exports.getReports = async (req, res) => {
  try {
    // Run all reporting queries in parallel
    const [
      [satCounts],
      [satOrbits],
      [stationCounts],
      [telemetryOverview],
      [telemetryPerSatellite]
    ] = await Promise.all([
      // Satellite status counts
      db.query('SELECT status, COUNT(*) AS count FROM satellites GROUP BY status'),
      
      // Satellite orbit type counts
      db.query('SELECT orbit_type, COUNT(*) AS count FROM satellites GROUP BY orbit_type'),
      
      // Ground station status counts
      db.query('SELECT status, COUNT(*) AS count FROM ground_stations GROUP BY status'),
      
      // Telemetry min, max, and average signal strengths
      db.query(`
        SELECT 
          COUNT(*) AS total_logs,
          AVG(signal_strength) AS avg_signal,
          MAX(signal_strength) AS max_signal,
          MIN(signal_strength) AS min_signal 
        FROM telemetry_logs
      `),
      
      // Telemetry average signal strength and logs count grouped by satellite
      db.query(`
        SELECT 
          s.satellite_name, 
          s.status AS satellite_status,
          AVG(t.signal_strength) AS avg_signal, 
          COUNT(t.id) AS logs_count
        FROM satellites s
        LEFT JOIN telemetry_logs t ON s.id = t.satellite_id
        GROUP BY s.id, s.satellite_name, s.status
        ORDER BY avg_signal DESC
      `)
    ]);

    // Format telemetry numbers for the view
    const overview = telemetryOverview[0] || { total_logs: 0, avg_signal: 0, max_signal: 0, min_signal: 0 };
    if (overview.avg_signal) overview.avg_signal = parseFloat(overview.avg_signal).toFixed(2);
    if (overview.max_signal) overview.max_signal = parseFloat(overview.max_signal).toFixed(2);
    if (overview.min_signal) overview.min_signal = parseFloat(overview.min_signal).toFixed(2);

    const formattedTelemetryPerSat = telemetryPerSatellite.map(row => {
      return {
        ...row,
        avg_signal: row.avg_signal ? parseFloat(row.avg_signal).toFixed(2) : 'N/A'
      };
    });

    res.render('reports', {
      title: 'Operational Reports & Statistics',
      user: req.session.user,
      satelliteStats: {
        statusBreakdown: satCounts,
        orbitBreakdown: satOrbits
      },
      stationStats: {
        statusBreakdown: stationCounts
      },
      telemetryStats: {
        overview,
        bySatellite: formattedTelemetryPerSat
      }
    });

  } catch (err) {
    console.error('[Reports Compilation Error]:', err.message);
    res.status(500).render('error', {
      title: 'Reports Error',
      errorCode: '500 - INTERNAL SERVER ERROR',
      errorMessage: 'Failed to compile statistics and analytics reports.',
      user: req.session.user
    });
  }
};
