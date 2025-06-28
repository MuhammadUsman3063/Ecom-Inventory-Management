// ✅ middleware/authenticateToken.js

const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // 👈 Make sure to set this in .env
    req.user = decoded; // ⬅️ Put decoded user info (e.g., id, role) in request
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authenticateToken;
