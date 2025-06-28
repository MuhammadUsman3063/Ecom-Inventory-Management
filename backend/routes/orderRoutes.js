// Ecom-Inventory-System/backend/routes/orderRoutes.js

const sql = require('mssql');
const express = require('express');
const router = express.Router();
const { getPool } = require('../db');

// ✅ NEW: Import authentication middleware
const { protect } = require('../middleware/authMiddleware');

// ✅ NEW: Import order controller functions (especially for customer orders)
const { getCustomerOrders } = require('../controllers/order.controller');

// ====================================================================
// ✅ NEW ROUTE FOR CUSTOMER ORDER HISTORY
// This route will be called from the customer frontend
// ====================================================================
router.get('/customer', protect, getCustomerOrders);


// ====================================================================
// Existing Admin Panel Order Management Routes (Unchanged)
// ====================================================================

// GET /api/orders - Get paginated and filtered/sorted/searched orders (Existing route)
router.get('/', async (req, res) => { // ✅ Path ko sirf '/' kar diya hai, kyunki ye router khud /api/orders par mounted hai
    const page = parseInt(req.query.page) || 1;
    const pageSize = 2;
    const offset = (page - 1) * pageSize;
    const { status, sortBy, search } = req.query;
    const pool = getPool();

    if (!pool) {
        return res.status(500).send('Database connection not available.');
    }

    let whereClause = '';
    const whereParams = [];
    if (status) {
        whereClause += `WHERE OrderStatus = @OrderStatus`;
        whereParams.push({ name: 'OrderStatus', type: sql.NVarChar, value: status });
    }
    if (search) {
        if (whereClause) {
            whereClause += ` AND OrderID LIKE @SearchTerm`;
        } else {
            whereClause = `WHERE OrderID LIKE @SearchTerm`;
        }
        whereParams.push({ name: 'SearchTerm', type: sql.NVarChar, value: `%${search}%` });
    }

    let orderByClause = 'ORDER BY OrderID DESC';
    if (sortBy === 'orderDateAsc') {
        orderByClause = 'ORDER BY OrderDate ASC';
    } else if (sortBy === 'orderDateDesc') {
        orderByClause = 'ORDER BY OrderDate DESC';
    } else if (sortBy === 'totalAmountAsc') {
        orderByClause = 'ORDER BY TotalAmount ASC';
    } else if (sortBy === 'totalAmountDesc') {
        orderByClause = 'ORDER BY TotalAmount DESC';
    }

    try {
        let countQuery = `SELECT COUNT(*) AS TotalOrders FROM Orders ${whereClause}`;
        const countRequest = pool.request();
        whereParams.forEach(param => countRequest.input(param.name, param.type, param.value));
        const countResult = await countRequest.query(countQuery);
        const totalOrders = countResult.recordset[0].TotalOrders;
        const totalPages = Math.ceil(totalOrders / pageSize);

        let ordersQuery = `
            SELECT OrderID, OrderDate, OrderStatus, TotalAmount, CustomerID
            FROM Orders
            ${whereClause}
            ${orderByClause}
            OFFSET ${offset} ROWS
            FETCH NEXT ${pageSize} ROWS ONLY;
        `;
        const ordersRequest = pool.request();
        whereParams.forEach(param => ordersRequest.input(param.name, param.type, param.value));
        const ordersResult = await ordersRequest.query(ordersQuery);

        res.status(200).json({
            orders: ordersResult.recordset,
            totalOrders: totalOrders,
            totalPages: totalPages,
            currentPage: page,
        });
    } catch (err) {
        console.error('SQL error (GET /orders):', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// POST /api/orders - Create a new order (UPDATED/REPLACED ROUTE)
router.post('/', async (req, res) => { // ✅ Path ko sirf '/' kar diya hai
    const { cartItems, customerId } = req.body; // ✅ customerId frontend se bheja jayega
    let transaction;

    if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ message: 'Cart is empty. Cannot place an order.' });
    }
    // ✅ CustomerID validation agar zaroori ho
    if (!customerId) {
        return res.status(400).json({ message: 'Customer ID is required to place an order.' });
    }

    try {
        let pool = getPool();
        if (!pool) {
            throw new Error('Database connection pool not available.');
        }
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        let totalAmount = 0;
        for (const item of cartItems) {
            totalAmount += item.Price * item.quantity;
        }

        const orderRequest = new sql.Request(transaction);
        orderRequest.input('TotalAmount', sql.Decimal(10, 2), totalAmount);
        orderRequest.input('OrderStatus', sql.NVarChar(50), 'Pending');
        orderRequest.input('CustomerID', sql.Int, customerId); // ✅ CustomerID ko add karein

        const orderResult = await orderRequest.query(`
            INSERT INTO Orders (TotalAmount, OrderStatus, CustomerID, OrderDate)
            VALUES (@TotalAmount, @OrderStatus, @CustomerID, GETDATE());
            SELECT SCOPE_IDENTITY() AS OrderID;
        `);

        const orderID = orderResult.recordset[0].OrderID;
        console.log('New Order Created with ID:', orderID);

        for (const item of cartItems) {
            const stockCheckRequest = new sql.Request(transaction);
            stockCheckRequest.input('ProductID', sql.Int, item.ID);
            const stockResult = await stockCheckRequest.query(`
                SELECT Quantity FROM Products WHERE ID = @ProductID;
            `);

            if (stockResult.recordset.length === 0 || stockResult.recordset[0].Quantity < item.quantity) {
                await transaction.rollback();
                return res.status(400).json({ message: `Insufficient stock for product: ${item.Name}. Available: ${stockResult.recordset[0] ? stockResult.recordset[0].Quantity : 0}, Requested: ${item.quantity}` });
            }

            const orderItemRequest = new sql.Request(transaction);
            orderItemRequest.input('OrderID', sql.Int, orderID);
            orderItemRequest.input('ProductID', sql.Int, item.ID);
            orderItemRequest.input('Quantity', sql.Int, item.quantity);
            orderItemRequest.input('PricePerUnit', sql.Decimal(10, 2), item.Price);

            await orderItemRequest.query(`
                INSERT INTO OrderItems (OrderID, ProductID, Quantity, PricePerUnit)
                VALUES (@OrderID, @ProductID, @Quantity, @PricePerUnit);
            `);
            console.log(`Inserted OrderItem for Product ${item.ID} with quantity ${item.quantity}`);

            const updateProductStockRequest = new sql.Request(transaction);
            updateProductStockRequest.input('NewQuantity', sql.Int, stockResult.recordset[0].Quantity - item.quantity);
            updateProductStockRequest.input('ProductID', sql.Int, item.ID);
            await updateProductStockRequest.query(`
                UPDATE Products SET Quantity = @NewQuantity WHERE ID = @ProductID;
            `);
            console.log(`Updated stock for Product ${item.ID}. New quantity: ${stockResult.recordset[0].Quantity - item.quantity}`);
        }

        await transaction.commit();
        res.status(201).json({ message: 'Order placed successfully!', orderID: orderID });

    } catch (err) {
        if (transaction) {
            await transaction.rollback();
            console.log('Transaction rolled back due to error.');
        }
        console.error('Error placing order:', err);
        res.status(500).json({ message: 'Failed to place order.', error: err.message });
    }
});


// GET /api/orders/:orderId - Get details for a specific order (Existing route)
router.get('/:orderId', async (req, res) => { // ✅ Path ko sirf '/:orderId' kar diya hai
    const { orderId } = req.params;
    const pool = getPool();

    if (!pool) {
        return res.status(500).send('Database connection not available.');
    }

    try {
        const orderResult = await pool.request()
            .input('OrderID', sql.Int, orderId)
            .query(`
                SELECT o.OrderID, o.OrderDate, o.OrderStatus, o.TotalAmount, o.CustomerID,
                        oi.OrderItemID, oi.ProductID, p.Name AS ProductName, oi.Quantity, oi.PricePerUnit AS ProductPrice, p.ImageUrl
                FROM Orders o
                INNER JOIN OrderItems oi ON o.OrderID = oi.OrderID
                INNER JOIN Products p ON oi.ProductID = p.ID
                WHERE o.OrderID = @OrderID;
            `);

        if (orderResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const orderDetails = {
            OrderID: orderResult.recordset[0].OrderID,
            OrderDate: orderResult.recordset[0].OrderDate,
            OrderStatus: orderResult.recordset[0].OrderStatus,
            TotalAmount: orderResult.recordset[0].TotalAmount,
            CustomerID: orderResult.recordset[0].CustomerID,
            items: orderResult.recordset.map(item => ({
                OrderItemID: item.OrderItemID,
                ProductID: item.ProductID,
                ProductName: item.ProductName,
                Quantity: item.Quantity,
                PricePerUnit: item.ProductPrice,
                ImageUrl: item.ImageUrl
            })),
        };

        res.status(200).json(orderDetails);
    } catch (err) {
        console.error('Error fetching order details:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// PUT /api/orders/:orderId - Update order status (Existing route)
router.put('/:orderId', async (req, res) => { // ✅ Path ko sirf '/:orderId' kar diya hai
    const { orderId } = req.params;
    const { status } = req.body;
    const pool = getPool();

    if (!pool) {
        return res.status(500).send('Database connection not available.');
    }

    if (!['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid order status.' });
    }

    try {
        const result = await pool.request()
            .input('OrderID', sql.Int, orderId)
            .input('OrderStatus', sql.NVarChar, status)
            .query(`
                UPDATE Orders
                SET OrderStatus = @OrderStatus
                WHERE OrderID = @OrderID;
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        const updatedOrderResult = await pool.request()
            .input('OrderID', sql.Int, orderId)
            .query(`
                SELECT OrderID, OrderDate, OrderStatus, TotalAmount, CustomerID
                FROM Orders
                WHERE OrderID = @OrderID;
            `);

        res.status(200).json(updatedOrderResult.recordset[0]);
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;