// backend/index.js

const { sql } = require('./db'); // ✅ Ye line sabse upar ho
const express = require('express');
const cors = require('cors');
const path = require('path');
const inventoryRoutes = require('./routes/inventoryRoutes'); // Assuming this is admin related

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// ==============================================
// ✅ Routes Imports
// ==============================================
const customerRoutes = require('./routes/customerRoutes'); // Assuming customer-related routes, potentially redundant if authRoutes handles customer login/register
const supplierRoutes = require('./routes/supplierRoutes');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/auth.routes'); // Authentication routes for both admin/customer

// ✅ Order routes (This is the one we're fixing)
const orderRoutes = require('./routes/orderRoutes');


// ==============================================
// ✅ Routes Mounting
// ==============================================

// Inventory/Admin routes
app.use('/api', inventoryRoutes); // Adjust this if inventoryRoutes should be under a specific /api/inventory path

// Customer specific routes (if not handled by auth or other specific routers)
app.use('/api', customerRoutes); // Adjust this if customerRoutes should be under a specific /api/customers path

// Supplier routes
app.use('/api', supplierRoutes); // Adjust this if supplierRoutes should be under a specific /api/suppliers path

// Product routes
app.use('/api', productRoutes); // Adjust this if productRoutes should be under a specific /api/products path

// Authentication routes (customer/admin login/register)
app.use('/api/auth', authRoutes); // Correctly mounted at /api/auth

// ✅ FIXED: Order routes mounted at /api/orders
app.use('/api/orders', orderRoutes); // ✅ IMPORTANT: Now /customer inside orderRoutes becomes /api/orders/customer


// Test route
app.get('/', (req, res) => {
  res.send('🎉 E-Commerce Inventory Backend is Running!');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});