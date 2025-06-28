// backend/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey'; // Ensure this matches your auth.controller

async function protect(req, res, next) {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Attach user information from token to req.user
      // Humne customerLogin mein token payload mein id (CustomerID) aur role dala tha
      req.user = {
        id: decoded.id, // This is CustomerID for customers
        name: decoded.name,
        email: decoded.email,
        role: decoded.role
      };

      next(); // Go to the next middleware/controller
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ message: 'Not authorized, token failed.' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token.' });
  }
}

module.exports = { protect };