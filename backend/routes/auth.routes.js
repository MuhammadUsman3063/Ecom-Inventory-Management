// backend/routes/auth.routes.js

const express = require('express');
const router = express.Router();

// ✅ Update: Import new customer-specific controllers
const { register, login, customerRegister, customerLogin } = require('../controllers/auth.controller');

// ========================================
// ✅ Admin/Staff Authentication Routes (uses 'users' table)
// ========================================
router.post('/register', register); // Used for Admin/Staff registration
router.post('/login', login);       // Used for Admin/Staff login

// ========================================
// ✅ NEW: Customer Authentication Routes (uses 'Customers' table)
// ========================================
router.post('/customer/register', customerRegister); // For website customer signup
router.post('/customer/login', customerLogin);       // For website customer login

module.exports = router;