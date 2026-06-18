const db = require('../config/db');

// Read All Ground Stations
exports.getAllStations = async (req, res) => {
  try {
    const [stations] = await db.query('SELECT * FROM ground_stations ORDER BY station_name ASC');
    res.render('stations/index', {
      title: 'Ground Station Management',
      user: req.session.user,
      stations,
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (err) {
    console.error('[Station List Error]:', err.message);
    res.status(500).render('error', {
      title: 'Database Error',
      errorCode: '500 - INTERNAL SERVER ERROR',
      errorMessage: 'Failed to retrieve ground stations. Please check database connectivity.',
      user: req.session.user
    });
  }
};

// Render Create Form
exports.getCreateForm = (req, res) => {
  res.render('stations/form', {
    title: 'Register Ground Station',
    user: req.session.user,
    station: {},
    isEdit: false,
    error: null
  });
};

// Process Create Form
exports.createStation = async (req, res) => {
  const { station_name, location, status } = req.body;

  // Validation
  if (!station_name || !location || !status) {
    return res.render('stations/form', {
      title: 'Register Ground Station',
      user: req.session.user,
      station: { station_name, location, status },
      isEdit: false,
      error: 'All fields are required.'
    });
  }

  try {
    await db.query(
      'INSERT INTO ground_stations (station_name, location, status) VALUES (?, ?, ?)',
      [station_name.trim(), location.trim(), status]
    );
    res.redirect('/stations?success=Ground station registered successfully.');
  } catch (err) {
    console.error('[Create Station Error]:', err.message);
    res.render('stations/form', {
      title: 'Register Ground Station',
      user: req.session.user,
      station: { station_name, location, status },
      isEdit: false,
      error: 'Failed to register ground station due to a database error.'
    });
  }
};

// Render Edit Form
exports.getEditForm = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM ground_stations WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.redirect('/stations?error=Ground station not found.');
    }
    
    res.render('stations/form', {
      title: 'Modify Ground Station',
      user: req.session.user,
      station: rows[0],
      isEdit: true,
      error: null
    });
  } catch (err) {
    console.error('[Edit Station Form Error]:', err.message);
    res.redirect('/stations?error=Database error loading edit form.');
  }
};

// Process Edit Form (Update)
exports.updateStation = async (req, res) => {
  const { id } = req.params;
  const { station_name, location, status } = req.body;

  if (!station_name || !location || !status) {
    return res.render('stations/form', {
      title: 'Modify Ground Station',
      user: req.session.user,
      station: { id, station_name, location, status },
      isEdit: true,
      error: 'All fields are required.'
    });
  }

  try {
    const [result] = await db.query(
      'UPDATE ground_stations SET station_name = ?, location = ?, status = ? WHERE id = ?',
      [station_name.trim(), location.trim(), status, id]
    );

    if (result.affectedRows === 0) {
      return res.redirect('/stations?error=Ground station not found.');
    }

    res.redirect('/stations?success=Ground station updated successfully.');
  } catch (err) {
    console.error('[Update Station Error]:', err.message);
    res.render('stations/form', {
      title: 'Modify Ground Station',
      user: req.session.user,
      station: { id, station_name, location, status },
      isEdit: true,
      error: 'Failed to update ground station due to a database error.'
    });
  }
};

// Process Delete
exports.deleteStation = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM ground_stations WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.redirect('/stations?error=Ground station not found.');
    }
    res.redirect('/stations?success=Ground station deleted successfully.');
  } catch (err) {
    console.error('[Delete Station Error]:', err.message);
    res.redirect('/stations?error=Failed to delete ground station due to a database error.');
  }
};
