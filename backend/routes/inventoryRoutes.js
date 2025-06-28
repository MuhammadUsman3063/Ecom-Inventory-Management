const express = require('express');
const router = express.Router();
const { getPool } = require('../db');
const sql = require('mssql');

// GET /api/inventory - Get all inventory
router.get('/inventory', async (req, res) => {
  const pool = getPool();

  if (!pool) {
    return res.status(500).send('Database connection not available.');
  }

  try {
    const result = await pool.request().query(`
      SELECT
        i.InventoryID,
        i.ProductID,
        p.Name AS ProductName,
        i.Quantity,
        i.LastUpdated
      FROM Inventory i
      INNER JOIN Products p ON i.ProductID = p.ID;
    `);
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error fetching inventory:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/inventory/:productId - Get inventory for a specific product
router.get('/inventory/:productId', async (req, res) => {
  const { productId } = req.params;
  const pool = getPool();

  if (!pool) {
    return res.status(500).send('Database connection not available.');
  }

  try {
    const result = await pool.request()
      .input('ProductID', sql.Int, productId)
      .query(`
        SELECT
          i.InventoryID,
          i.ProductID,
          p.Name AS ProductName,
          i.Quantity,
          i.LastUpdated
        FROM Inventory i
        INNER JOIN Products p ON i.ProductID = p.ID
        WHERE i.ProductID = @ProductID;
      `);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset[0]);
    } else {
      res.status(404).json({ message: 'Inventory not found for this product.' });
    }
  } catch (err) {
    console.error('Error fetching inventory for product:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /api/inventory/:productId - Update inventory quantity and record history
router.put('/inventory/:productId', async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const pool = getPool();

  if (!pool) {
    return res.status(500).send('Database connection not available.');
  }

  if (typeof quantity !== 'number' || quantity < 0) {
    return res.status(400).json({ message: 'Invalid quantity.' });
  }

  try {
    // Get the current inventory to record old quantity
    const inventoryResult = await pool.request()
      .input('ProductID', sql.Int, productId)
      .query(`SELECT InventoryID, Quantity FROM Inventory WHERE ProductID = @ProductID`);

    if (inventoryResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Inventory not found for this product.' });
    }

    const originalQuantity = inventoryResult.recordset[0].Quantity;
    const inventoryId = inventoryResult.recordset[0].InventoryID;

    // Update the inventory
    const updateResult = await pool.request()
      .input('ProductID', sql.Int, productId)
      .input('Quantity', sql.Int, quantity)
      .input('LastUpdated', sql.DateTime, new Date())
      .query(`
        UPDATE Inventory
        SET Quantity = @Quantity, LastUpdated = @LastUpdated
        WHERE ProductID = @ProductID;
      `);

    if (updateResult.rowsAffected[0] > 0 && quantity !== originalQuantity) {
      // Record the stock adjustment
      await pool.request()
        .input('InventoryID', sql.Int, inventoryId)
        .input('ProductID', sql.Int, productId)
        .input('AdjustedBy', sql.NVarChar, req.user ? req.user.username : 'System') // Assuming you have user info in req
        .input('OldQuantity', sql.Int, originalQuantity)
        .input('NewQuantity', sql.Int, quantity)
        .query(`
          INSERT INTO StockAdjustments (InventoryID, ProductID, AdjustedBy, OldQuantity, NewQuantity)
          VALUES (@InventoryID, @ProductID, @AdjustedBy, @OldQuantity, @NewQuantity);
        `);
    }

    // Optionally, fetch the updated inventory and send it back
    const updatedInventoryResult = await pool.request()
      .input('ProductID', sql.Int, productId)
      .query(`
        SELECT
          i.InventoryID,
          i.ProductID,
          p.Name AS ProductName,
          i.Quantity,
          i.LastUpdated
        FROM Inventory i
        INNER JOIN Products p ON i.ProductID = p.ID
        WHERE i.ProductID = @ProductID;
      `);

    res.status(200).json(updatedInventoryResult.recordset[0]);
  } catch (err) {
    console.error('Error updating inventory:', err);
    res.status(500).json({ error: 'Database error' });
  }
});


// PUT /api/inventory/:productId - Update inventory quantity and record history
router.put('/inventory/:productId', async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const pool = getPool();

  if (!pool) {
    return res.status(500).send('Database connection not available.');
  }

  if (typeof quantity !== 'number' || quantity < 0) {
    return res.status(400).json({ message: 'Invalid quantity.' });
  }

  try {
    // Get the current inventory to record old quantity
    const inventoryResult = await pool.request()
      .input('ProductID', sql.Int, productId)
      .query(`SELECT InventoryID, Quantity FROM Inventory WHERE ProductID = @ProductID`);

    if (inventoryResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Inventory not found for this product.' });
    }

    const originalQuantity = inventoryResult.recordset[0].Quantity;
    const inventoryId = inventoryResult.recordset[0].InventoryID;

    // Update the inventory
    const updateResult = await pool.request()
      .input('ProductID', sql.Int, productId)
      .input('Quantity', sql.Int, quantity)
      .input('LastUpdated', sql.DateTime, new Date())
      .query(`
        UPDATE Inventory
        SET Quantity = @Quantity, LastUpdated = @LastUpdated
        WHERE ProductID = @ProductID;
      `);

    if (updateResult.rowsAffected[0] > 0 && quantity !== originalQuantity) {
      // Record the stock adjustment
      await pool.request()
        .input('InventoryID', sql.Int, inventoryId)
        .input('ProductID', sql.Int, productId)
        .input('AdjustedBy', sql.NVarChar, req.user ? req.user.username : 'System') // Assuming you have user info in req
        .input('OldQuantity', sql.Int, originalQuantity)
        .input('NewQuantity', sql.Int, quantity)
        .query(`
          INSERT INTO StockAdjustments (InventoryID, ProductID, AdjustedBy, OldQuantity, NewQuantity)
          VALUES (@InventoryID, @ProductID, @AdjustedBy, @OldQuantity, @NewQuantity);
        `);
    }

    // Optionally, fetch the updated inventory and send it back
    const updatedInventoryResult = await pool.request()
      .input('ProductID', sql.Int, productId)
      .query(`
        SELECT
          i.InventoryID,
          i.ProductID,
          p.Name AS ProductName,
          i.Quantity,
          i.LastUpdated
        FROM Inventory i
        INNER JOIN Products p ON i.ProductID = p.ID
        WHERE i.ProductID = @ProductID;
      `);

    res.status(200).json(updatedInventoryResult.recordset[0]);
  } catch (err) {
    console.error('Error updating inventory:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/stock-adjustments/:productId - Get stock adjustment history for a specific product
router.get('/stock-adjustments/:productId', async (req, res) => {
  const { productId } = req.params;
  const pool = getPool();

  if (!pool) {
    return res.status(500).send('Database connection not available.');
  }

  try {
    const result = await pool.request()
      .input('ProductID', sql.Int, productId)
      .query(`
        SELECT
          sa.AdjustmentID,
          sa.AdjustmentDate,
          sa.AdjustedBy,
          sa.OldQuantity,
          sa.NewQuantity,
          sa.Reason,
          p.Name AS ProductName
        FROM StockAdjustments sa
        INNER JOIN Products p ON sa.ProductID = p.ID
        WHERE sa.ProductID = @ProductID
        ORDER BY sa.AdjustmentDate DESC;
      `);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error fetching stock adjustments:', err);
    res.status(500).json({ error: 'Database error' });
  }
});
module.exports = router;