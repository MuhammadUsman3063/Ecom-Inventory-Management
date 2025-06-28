// backend/controllers/order.controller.js

const { sql, getPool } = require('../db'); // ✅ getPool ko bhi import karein

// ============================================
// ✅ Get Orders for a specific customer
// (Accessible only to logged-in customers)
// ============================================
async function getCustomerOrders(req, res) {
  const customerId = req.user.id;
  const userRole = req.user.role;

  if (userRole !== 'customer') {
    return res.status(403).json({ message: 'Access denied. Only customers can view their orders.' });
  }

  try {
    const pool = getPool(); // ✅ getPool() se connection pool lein
    if (!pool) {
        return res.status(500).json({ message: 'Database connection pool not available.' });
    }

    // Database se orders fetch karein CustomerID ke zariye
    // Query ko pool.request() ke through chalayein
    const result = await pool.request() // ✅ pool.request() ka istemal karein
      .input('CustomerID', sql.Int, customerId) // ✅ Parameters ko input() method se add karein
      .query`
        SELECT
          o.OrderID,
          o.OrderDate,
          o.TotalAmount,
          o.OrderStatus AS Status, -- ✅ Agar aapke DB mein column name OrderStatus hai, to ye use karein
          -- Agar aapke DB mein column name Status hai, to sirf 'o.Status,' use karein
          (SELECT COUNT(*) FROM OrderItems oi WHERE oi.OrderID = o.OrderID) AS NumberOfItems
        FROM Orders o
        WHERE o.CustomerID = @CustomerID
        ORDER BY o.OrderDate DESC;
      `;

    const orders = result.recordset;

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ message: 'Server error while fetching orders.', error: error.message }); // Error message ko behtar banaya
  }
}

module.exports = {
  getCustomerOrders,
  // Agar aapke paas doosre order controllers hain
};