// backend/controllers/auth.controller.js

const { sql } = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey'; // Move this to .env in production

// ✅ Admin/Staff Allowed roles
const allowedRoles = ['admin', 'inventory manager', 'sales manager', 'staff'];

// ===========================================
// ✅ REGISTER Controller (For Admin/Staff - Uses 'users' table)
// ===========================================
async function register(req, res) {
  const { name, email, password, role } = req.body;

  // ✅ Input validation
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role provided.' });
  }

  try {
    // ✅ Check if email already exists in 'users' table
    const result = await sql.query`SELECT * FROM users WHERE email = ${email}`;
    if (result.recordset.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    // ✅ Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Insert user into 'users' table
    await sql.query`
      INSERT INTO users (name, email, password, role)
      VALUES (${name}, ${email}, ${hashedPassword}, ${role})
    `;

    res.status(201).json({ message: '✅ Admin/Staff user registered successfully!' });
  } catch (error) {
    console.error('Admin Register Error:', error);
    res.status(500).json({ message: 'Server error during admin/staff registration.' });
  }
}

// =======================================
// ✅ LOGIN Controller (For Admin/Staff - Uses 'users' table)
// =======================================
async function login(req, res) {
  const { email, password } = req.body;

  // ✅ Input validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  try {
    const result = await sql.query`SELECT * FROM users WHERE email = ${email}`;
    if (result.recordset.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const user = result.recordset[0];

    // ✅ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // ✅ Sign JWT (for Admin/Staff)
    const token = jwt.sign(
      {
        id: user.id, // UserID from 'users' table
        name: user.name,
        email: user.email,
        role: user.role // Admin/Staff role
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // ✅ Send token + user info
    res.status(200).json({
      message: '✅ Admin/Staff Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Admin Login Error:', error);
    res.status(500).json({ message: 'Server error during admin/staff login.' });
  }
}

// =========================================
// ✅ NEW: CUSTOMER REGISTER Controller (For Website Customers - Uses 'Customers' table)
// =========================================
async function customerRegister(req, res) {
  const { name, email, password, phone, address } = req.body; // 'role' is not needed here, it's implicitly 'customer'

  // ✅ Input validation (basic fields for customer)
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email, and password.' });
  }

  try {
    // ✅ Check if email already exists in 'Customers' table
    const result = await sql.query`SELECT * FROM Customers WHERE Email = ${email}`;
    if (result.recordset.length > 0) {
      return res.status(400).json({ message: 'An account already exists with this email.' });
    }

    // ✅ Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Insert customer into 'Customers' table
    const insertResult = await sql.query`
      INSERT INTO Customers (Name, Email, Phone, Address, PasswordHash)
      VALUES (${name}, ${email}, ${phone || null}, ${address || null}, ${hashedPassword});
      SELECT SCOPE_IDENTITY() AS CustomerID; -- Get the newly inserted CustomerID
    `;

    const customerID = insertResult.recordset[0].CustomerID;

    res.status(201).json({ message: '✅ Customer account created successfully!', customerID });
  } catch (error) {
    console.error('Customer Register Error:', error);
    res.status(500).json({ message: 'Server error during customer registration.' });
  }
}

// =====================================
// ✅ NEW: CUSTOMER LOGIN Controller (For Website Customers - Uses 'Customers' table)
// =====================================
async function customerLogin(req, res) {
  const { email, password } = req.body;

  // ✅ Input validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  try {
    // ✅ Find customer in 'Customers' table
    const result = await sql.query`SELECT * FROM Customers WHERE Email = ${email}`;
    if (result.recordset.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const customer = result.recordset[0];

    // ✅ Compare password
    const isMatch = await bcrypt.compare(password, customer.PasswordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // ✅ Sign JWT (for Customers)
    const token = jwt.sign(
      {
        id: customer.CustomerID, // Use CustomerID for customer users
        name: customer.Name,
        email: customer.Email,
        role: 'customer' // Explicitly set role as 'customer'
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // ✅ Send token + customer info
    res.status(200).json({
      message: '✅ Customer Login successful!',
      token,
      user: {
        id: customer.CustomerID,
        name: customer.Name,
        email: customer.Email,
        role: 'customer'
      }
    });
  } catch (error) {
    console.error('Customer Login Error:', error);
    res.status(500).json({ message: 'Server error during customer login.' });
  }
}


module.exports = {
  register,          // For Admin/Staff via 'users' table
  login,             // For Admin/Staff via 'users' table
  customerRegister,  // ✅ NEW: For Website Customers via 'Customers' table
  customerLogin      // ✅ NEW: For Website Customers via 'Customers' table
};