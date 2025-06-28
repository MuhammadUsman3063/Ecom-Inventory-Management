const jwt = require('jsonwebtoken');

// ✅ JWT Authentication Middleware
const jwtAuth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Store user info in request
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};

// ✅ Role-Based Authorization Middleware Generator
const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Access Denied: Insufficient permissions' });
    }

    next();
  };
};

module.exports = {
  jwtAuth,
  authorizeRole
};
