const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Display Login Form
exports.getLogin = (req, res) => {
  res.render('login', { 
    title: 'Portal Login', 
    error: null,
    success: null 
  });
};

// Process Login Form
exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  // Simple validation
  if (!email || !password) {
    return res.render('login', {
      title: 'Portal Login',
      error: 'Please fill in all fields.',
      success: null
    });
  }

  console.log(`[AUTH DEBUG] Attempting login for email: "${email}"`);
  try {
    // Check if user exists in the database
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email.trim()]);
    
    if (rows.length === 0) {
      console.log(`[AUTH DEBUG] User not found for email: "${email}" (Rows: 0)`);
      return res.render('login', {
        title: 'Portal Login',
        error: 'Invalid email or password.',
        success: null
      });
    }

    const user = rows[0];
    console.log(`[AUTH DEBUG] User found: "${user.name}". ID: ${user.id}, Role: ${user.role}`);
    console.log(`[AUTH DEBUG] Stored password hash in DB: "${user.password}"`);

    // Verify Password Hash
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`[AUTH DEBUG] Bcrypt match result: ${isMatch}`);
    if (!isMatch) {
      return res.render('login', {
        title: 'Portal Login',
        error: 'Invalid email or password.',
        success: null
      });
    }

    // Set User Session details (exclude password)
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    // Redirect to requested URL or default to dashboard
    const redirectUrl = req.session.redirectTo || '/dashboard';
    delete req.session.redirectTo;
    res.redirect(redirectUrl);

  } catch (err) {
    console.error('[Login Error]:', err.message);
    res.render('login', {
      title: 'Portal Login',
      error: 'A database error occurred. Please try again later.',
      success: null
    });
  }
};

// Process Logout
exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('[Logout Error]:', err.message);
    }
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
};
