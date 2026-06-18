const db = require('../config/db');

// Read All Telemetry Logs
exports.getAllTelemetry = async (req, res) => {
  try {
    const [logs] = await db.query(`
      SELECT t.*, s.satellite_name 
      FROM telemetry_logs t 
      JOIN satellites s ON t.satellite_id = s.id 
      ORDER BY t.timestamp DESC
    `);
    
    res.render('telemetry/index', {
      title: 'Telemetry Log Management',
      user: req.session.user,
      logs,
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (err) {
    console.error('[Telemetry List Error]:', err.message);
    res.status(500).render('error', {
      title: 'Database Error',
      errorCode: '500 - INTERNAL SERVER ERROR',
      errorMessage: 'Failed to retrieve telemetry logs.',
      user: req.session.user
    });
  }
};

// Render Create Form
exports.getCreateForm = async (req, res) => {
  try {
    const [satellites] = await db.query('SELECT id, satellite_name FROM satellites ORDER BY satellite_name ASC');
    
    if (satellites.length === 0) {
      return res.redirect('/telemetry?error=Please register at least one satellite before creating telemetry logs.');
    }

    // Default timestamp to current local time (format: YYYY-MM-DDTHH:MM)
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localNow = new Date(now.getTime() - (offset * 60 * 1000));
    const defaultTimestamp = localNow.toISOString().slice(0, 16);

    res.render('telemetry/form', {
      title: 'Record Telemetry Log',
      user: req.session.user,
      satellites,
      log: { timestamp: defaultTimestamp },
      isEdit: false,
      error: null
    });
  } catch (err) {
    console.error('[Telemetry Form Error]:', err.message);
    res.redirect('/telemetry?error=Database error loading page.');
  }
};

// Process Create Form
exports.createTelemetry = async (req, res) => {
  const { satellite_id, signal_strength, timestamp, notes } = req.body;

  try {
    const [satellites] = await db.query('SELECT id, satellite_name FROM satellites ORDER BY satellite_name ASC');
    
    if (!satellite_id || !signal_strength || !timestamp) {
      return res.render('telemetry/form', {
        title: 'Record Telemetry Log',
        user: req.session.user,
        satellites,
        log: { satellite_id, signal_strength, timestamp, notes },
        isEdit: false,
        error: 'Satellite, Signal Strength, and Timestamp are required.'
      });
    }

    const strength = parseFloat(signal_strength);
    if (isNaN(strength)) {
      return res.render('telemetry/form', {
        title: 'Record Telemetry Log',
        user: req.session.user,
        satellites,
        log: { satellite_id, signal_strength, timestamp, notes },
        isEdit: false,
        error: 'Signal strength must be a valid number.'
      });
    }

    await db.query(
      'INSERT INTO telemetry_logs (satellite_id, signal_strength, timestamp, notes) VALUES (?, ?, ?, ?)',
      [satellite_id, strength, timestamp, notes ? notes.trim() : null]
    );

    res.redirect('/telemetry?success=Telemetry log recorded successfully.');
  } catch (err) {
    console.error('[Create Telemetry Error]:', err.message);
    res.redirect('/telemetry?error=Failed to record telemetry log due to database error.');
  }
};

// Render Edit Form
exports.getEditForm = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM telemetry_logs WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.redirect('/telemetry?error=Telemetry log not found.');
    }

    const [satellites] = await db.query('SELECT id, satellite_name FROM satellites ORDER BY satellite_name ASC');
    
    const log = rows[0];
    if (log.timestamp) {
      // Format timestamp for datetime-local (YYYY-MM-DDTHH:MM)
      const d = new Date(log.timestamp);
      const offset = d.getTimezoneOffset();
      const localDate = new Date(d.getTime() - (offset * 60 * 1000));
      log.timestamp = localDate.toISOString().slice(0, 16);
    }

    res.render('telemetry/form', {
      title: 'Modify Telemetry Log',
      user: req.session.user,
      satellites,
      log,
      isEdit: true,
      error: null
    });
  } catch (err) {
    console.error('[Edit Telemetry Form Error]:', err.message);
    res.redirect('/telemetry?error=Database error loading edit form.');
  }
};

// Process Edit Form (Update)
exports.updateTelemetry = async (req, res) => {
  const { id } = req.params;
  const { satellite_id, signal_strength, timestamp, notes } = req.body;

  try {
    const [satellites] = await db.query('SELECT id, satellite_name FROM satellites ORDER BY satellite_name ASC');

    if (!satellite_id || !signal_strength || !timestamp) {
      return res.render('telemetry/form', {
        title: 'Modify Telemetry Log',
        user: req.session.user,
        satellites,
        log: { id, satellite_id, signal_strength, timestamp, notes },
        isEdit: true,
        error: 'Satellite, Signal Strength, and Timestamp are required.'
      });
    }

    const strength = parseFloat(signal_strength);
    if (isNaN(strength)) {
      return res.render('telemetry/form', {
        title: 'Modify Telemetry Log',
        user: req.session.user,
        satellites,
        log: { id, satellite_id, signal_strength, timestamp, notes },
        isEdit: true,
        error: 'Signal strength must be a valid number.'
      });
    }

    const [result] = await db.query(
      'UPDATE telemetry_logs SET satellite_id = ?, signal_strength = ?, timestamp = ?, notes = ? WHERE id = ?',
      [satellite_id, strength, timestamp, notes ? notes.trim() : null, id]
    );

    if (result.affectedRows === 0) {
      return res.redirect('/telemetry?error=Telemetry log not found.');
    }

    res.redirect('/telemetry?success=Telemetry log updated successfully.');
  } catch (err) {
    console.error('[Update Telemetry Error]:', err.message);
    res.redirect('/telemetry?error=Failed to update telemetry log due to database error.');
  }
};

// Process Delete
exports.deleteTelemetry = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM telemetry_logs WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.redirect('/telemetry?error=Telemetry log not found.');
    }
    res.redirect('/telemetry?success=Telemetry log deleted successfully.');
  } catch (err) {
    console.error('[Delete Telemetry Error]:', err.message);
    res.redirect('/telemetry?error=Failed to delete telemetry log.');
  }
};
