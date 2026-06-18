// Authentication and Authorization Middleware

// Protect route: require login
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    // Make user available in all views (EJS templates)
    res.locals.user = req.session.user;
    return next();
  }
  req.session.redirectTo = req.originalUrl;
  res.redirect('/login');
}

// Redirect logged-in users away from auth pages
function isGuest(req, res, next) {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  next();
}

// Restrict access to specific roles
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.redirect('/login');
    }
    
    const { role } = req.session.user;
    if (allowedRoles.includes(role)) {
      return next();
    }

    // Render access denied error page
    res.status(403).render('error', {
      title: 'Access Denied',
      errorCode: '403 - FORBIDDEN',
      errorMessage: `Your role (${role}) does not have permission to perform this action or view this resource.`,
      user: req.session.user
    });
  };
}

module.exports = {
  isAuthenticated,
  isGuest,
  authorizeRoles
};
