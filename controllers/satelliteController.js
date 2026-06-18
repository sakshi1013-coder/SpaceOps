const db = require('../config/db');

// Read All Satellites
exports.getAllSatellites = async (req, res) => {
  try {
    const [satellites] = await db.query('SELECT * FROM satellites ORDER BY satellite_name ASC');
    res.render('satellites/index', {
      title: 'Satellite Management',
      user: req.session.user,
      satellites,
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (err) {
    console.error('[Satellite List Error]:', err.message);
    res.status(500).render('error', {
      title: 'Database Error',
      errorCode: '500 - INTERNAL SERVER ERROR',
      errorMessage: 'Failed to retrieve satellites. Please make sure the database is active.',
      user: req.session.user
    });
  }
};

// Render Create Form
exports.getCreateForm = (req, res) => {
  res.render('satellites/form', {
    title: 'Register Satellite',
    user: req.session.user,
    satellite: {},
    isEdit: false,
    error: null
  });
};

// Process Create Form
exports.createSatellite = async (req, res) => {
  const { satellite_name, orbit_type, launch_date, status } = req.body;

  // Validation
  if (!satellite_name || !orbit_type || !launch_date || !status) {
    return res.render('satellites/form', {
      title: 'Register Satellite',
      user: req.session.user,
      satellite: { satellite_name, orbit_type, launch_date, status },
      isEdit: false,
      error: 'All fields are required.'
    });
  }

  try {
    await db.query(
      'INSERT INTO satellites (satellite_name, orbit_type, launch_date, status) VALUES (?, ?, ?, ?)',
      [satellite_name.trim(), orbit_type.trim(), launch_date, status]
    );
    res.redirect('/satellites?success=Satellite registered successfully.');
  } catch (err) {
    console.error('[Create Satellite Error]:', err.message);
    res.render('satellites/form', {
      title: 'Register Satellite',
      user: req.session.user,
      satellite: { satellite_name, orbit_type, launch_date, status },
      isEdit: false,
      error: 'Failed to register satellite due to a database error.'
    });
  }
};

// Render Edit Form
exports.getEditForm = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM satellites WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.redirect('/satellites?error=Satellite not found.');
    }
    
    // Format launch date for HTML input type="date" (YYYY-MM-DD)
    const satellite = rows[0];
    if (satellite.launch_date) {
      const d = new Date(satellite.launch_date);
      // adjust for timezone offset to get local YYYY-MM-DD
      const offset = d.getTimezoneOffset();
      const localDate = new Date(d.getTime() - (offset*60*1000));
      satellite.launch_date = localDate.toISOString().split('T')[0];
    }

    res.render('satellites/form', {
      title: 'Modify Satellite',
      user: req.session.user,
      satellite,
      isEdit: true,
      error: null
    });
  } catch (err) {
    console.error('[Edit Satellite Form Error]:', err.message);
    res.redirect('/satellites?error=Database error loading edit form.');
  }
};

// Process Edit Form (Update)
exports.updateSatellite = async (req, res) => {
  const { id } = req.params;
  const { satellite_name, orbit_type, launch_date, status } = req.body;

  if (!satellite_name || !orbit_type || !launch_date || !status) {
    return res.render('satellites/form', {
      title: 'Modify Satellite',
      user: req.session.user,
      satellite: { id, satellite_name, orbit_type, launch_date, status },
      isEdit: true,
      error: 'All fields are required.'
    });
  }

  try {
    const [result] = await db.query(
      'UPDATE satellites SET satellite_name = ?, orbit_type = ?, launch_date = ?, status = ? WHERE id = ?',
      [satellite_name.trim(), orbit_type.trim(), launch_date, status, id]
    );

    if (result.affectedRows === 0) {
      return res.redirect('/satellites?error=Satellite not found.');
    }

    res.redirect('/satellites?success=Satellite updated successfully.');
  } catch (err) {
    console.error('[Update Satellite Error]:', err.message);
    res.render('satellites/form', {
      title: 'Modify Satellite',
      user: req.session.user,
      satellite: { id, satellite_name, orbit_type, launch_date, status },
      isEdit: true,
      error: 'Failed to update satellite due to a database error.'
    });
  }
};

// Process Delete
exports.deleteSatellite = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM satellites WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.redirect('/satellites?error=Satellite not found.');
    }
    res.redirect('/satellites?success=Satellite deleted successfully.');
  } catch (err) {
    console.error('[Delete Satellite Error]:', err.message);
    res.redirect('/satellites?error=Failed to delete satellite. Ensure no conflicting logs exist or try again.');
  }
};
