// backend/routes/productRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const productModel = require('../models/productModel');
const { sql, getPool } = require('../db'); // Assuming db.js exports sql and getPool

// ============================================
// ✅ Multer Storage Configuration for Images
// ============================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, 'product-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Error: Only image files (jpeg, jpg, png, gif) are allowed!'));
  }
});

// ============================================
// Product Routes (Using productModel functions)
// ============================================

// POST /products - Add new product
router.post('/products', upload.single('image'), async (req, res) => {
  console.log('Incoming product data:', req.body);
  // ✅ CORRECTION: SupplierID ko destructure karein
  const { Name, Price, Quantity, Category, SupplierID } = req.body;
  const ImageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (!Name || Price == null || Quantity == null || !Category || !ImageUrl) {
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads', req.file.filename);
      fs.unlink(filePath, (err) => {
        if (err && err.code !== 'ENOENT') console.error('Error deleting incomplete image:', err);
      });
    }
    return res.status(400).json({ error: 'Missing required fields or product image' });
  }

  try {
    const newProduct = await productModel.createProduct({
      name: Name,
      price: Price,
      quantity: Quantity,
      category: Category,
      imageUrl: ImageUrl,
      // ✅ CORRECTION: SupplierID ko yahan pass karein
      supplierId: SupplierID
    });

    res.status(201).json({
      message: 'Product created successfully and inventory initialized',
      product: newProduct,
    });
  } catch (err) {
    console.error('Error creating product:', err);
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads', req.file.filename);
      fs.unlink(filePath, (err) => {
        if (err && err.code !== 'ENOENT') console.error('Error deleting failed upload image:', err);
      });
    }
    res.status(500).json({ error: 'Failed to create product.', details: err.message });
  }
});

// GET /products - Get all products
router.get('/products', async (req, res) => {
  try {
    const products = await productModel.getAllProducts();
    res.status(200).json(products);
  } catch (err) {
    console.error('Error fetching all products:', err);
    res.status(500).json({ error: 'Database error fetching products.' });
  }
});

// GET /products/:id - Get a single product by ID
router.get('/products/:id', async (req, res) => {
  const productId = req.params.id;

  if (isNaN(productId)) {
    return res.status(400).json({ error: 'Invalid product ID provided.' });
  }

  try {
    const product = await productModel.getProductById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.status(200).json(product);
  } catch (err) {
    console.error('Error fetching single product:', err);
    res.status(500).json({ error: 'Database error while fetching product.' });
  }
});

// PUT /products/:id - Update a product
router.put('/products/:id', upload.single('image'), async (req, res) => {
  const productId = req.params.id;
  // ✅ CORRECTION: SupplierID ko destructure karein
  const { Name, Price, Quantity, Category, SupplierID } = req.body;
  let newImageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (isNaN(productId)) {
    return res.status(400).json({ error: 'Invalid product ID provided.' });
  }

  // Frontend will handle sending all required fields or current image.
  if (!Name || Price == null || Quantity == null || !Category) {
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads', req.file.filename);
      fs.unlink(filePath, (err) => {
        if (err && err.code !== 'ENOENT') console.error('Error deleting incomplete update image:', err);
      });
    }
    return res.status(400).json({ error: 'Missing required fields for product update' });
  }

  try {
    let oldImageUrl = null;
    if (newImageUrl) {
      const existingProduct = await productModel.getProductById(productId);
      if (existingProduct) {
        oldImageUrl = existingProduct.ImageUrl;
      }
    }

    const updatedProduct = await productModel.updateProduct(productId, {
      name: Name,
      price: Price,
      quantity: Quantity,
      category: Category,
      imageUrl: newImageUrl || oldImageUrl,
      // ✅ CORRECTION: SupplierID ko yahan pass karein
      supplierId: SupplierID
    });

    if (!updatedProduct) {
      if (req.file) {
        const filePath = path.join(__dirname, '../uploads', req.file.filename);
        fs.unlink(filePath, (err) => {
          if (err && err.code !== 'ENOENT') console.error('Error deleting failed update image:', err);
        });
      }
      return res.status(404).json({ error: 'Product not found or no changes made.' });
    }

    if (oldImageUrl && newImageUrl && oldImageUrl !== newImageUrl) {
      const oldFilePath = path.join(__dirname, '..', oldImageUrl);
      fs.unlink(oldFilePath, (err) => {
        if (err && err.code !== 'ENOENT') {
          console.error('Error deleting old image file:', oldFilePath, err);
        } else if (!err) {
          console.log('Successfully deleted old image file:', oldFilePath);
        }
      });
    }

    res.status(200).json(updatedProduct);
  } catch (err) {
    console.error('Error updating product:', err);
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads', req.file.filename);
      fs.unlink(filePath, (err) => {
        if (err && err.code !== 'ENOENT') console.error('Error deleting update image on error:', err);
      });
    }
    res.status(500).json({ error: 'Database error while updating product.', details: err.message });
  }
});

// DELETE /products/:id - Delete a product
router.delete('/products/:id', async (req, res) => {
    const productId = parseInt(req.params.id);

    if (isNaN(productId)) {
        return res.status(400).json({ error: 'Invalid product ID' });
    }

    try {
        const pool = await getPool();

        // 1. Get the product details (especially ImageUrl) before attempting to delete related records
        const productToDelete = await productModel.getProductById(productId);

        if (!productToDelete) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // 2. Delete related entries from dbo.OrderItems table FIRST
        const orderItemsResult = await pool.request()
            .input('productId', sql.Int, productId)
            .query`DELETE FROM dbo.OrderItems WHERE ProductID = @productId`;
        console.log(`Deleted ${orderItemsResult.rowsAffected[0]} related order items for ProductID ${productId}`);

        // 3. Get InventoryIDs related to this ProductID to delete StockAdjustments first
        const inventoryIDsResult = await pool.request()
            .input('productId', sql.Int, productId)
            .query`SELECT InventoryID FROM dbo.Inventory WHERE ProductID = @productId`;
        const inventoryIDs = inventoryIDsResult.recordset.map(row => row.InventoryID);

        if (inventoryIDs.length > 0) {
            // 4. Delete related entries from dbo.StockAdjustments table SECOND
            // ✅ CORRECTION: Build the query string manually and then use request.input for each parameter
            let stockAdjustmentsQuery = `DELETE FROM dbo.StockAdjustments WHERE InventoryID IN (`;
            const requestForStockAdjustments = pool.request();
            const params = [];

            for (let i = 0; i < inventoryIDs.length; i++) {
                const paramName = `invId${i}`;
                stockAdjustmentsQuery += `@${paramName}`;
                requestForStockAdjustments.input(paramName, sql.Int, inventoryIDs[i]);
                if (i < inventoryIDs.length - 1) {
                    stockAdjustmentsQuery += ',';
                }
            }
            stockAdjustmentsQuery += `)`;

            const stockAdjustmentsResult = await requestForStockAdjustments.query(stockAdjustmentsQuery);
            console.log(`Deleted ${stockAdjustmentsResult.rowsAffected[0]} related stock adjustments for ProductID ${productId}`);
        }
        
        // 5. Now delete related entries from dbo.Inventory table THIRD
        const inventoryResult = await pool.request()
            .input('productId', sql.Int, productId)
            .query`DELETE FROM dbo.Inventory WHERE ProductID = @productId`;
        console.log(`Deleted ${inventoryResult.rowsAffected[0]} related inventory entries for ProductID ${productId}`);


        // 6. Finally delete the product from dbo.Products
        const rowsAffected = await productModel.deleteProduct(productId);

        if (rowsAffected === 0) {
            return res.status(404).json({ error: 'Product not found after trying to delete related items' });
        }

        // 7. Delete the associated image file from the server
        if (productToDelete.ImageUrl) {
            const filePath = path.join(__dirname, '..', productToDelete.ImageUrl);
            fs.unlink(filePath, (err) => {
                if (err && err.code !== 'ENOENT') {
                    console.error('Error deleting image file:', filePath, err);
                } else if (!err) {
                    console.log('Successfully deleted image file:', filePath);
                }
            });
        }

        res.status(200).json({ message: `Product with ID ${productId} deleted successfully` });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ error: 'Database error while deleting product.', details: err.message });
    }
});

// ✅ GET /categories - Get all unique product categories
router.get('/categories', async (req, res) => {
    
  const pool = getPool();

  if (!pool) {
    return res.status(500).send('Database connection not available.');
  }

  try {
    const request = pool.request();
    const result = await request.query(`
      SELECT DISTINCT Category
      FROM Products
      WHERE Category IS NOT NULL AND Category != ''
      ORDER BY Category;
    `);
    const categories = result.recordset.map(record => record.Category);
    console.log('Categories fetched from DB (backend):', categories); // ADDED THIS LINE
    res.status(200).json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Database error while fetching categories.', details: err.message });
  }
});

module.exports = router;