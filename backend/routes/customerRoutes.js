const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { getPool } = require('../db');

// GET /api/customers - Get all customers
router.get('/customers', async (req, res) => {
    const pool = getPool();
    if (!pool) {
        return res.status(500).send('Database connection not available.');
    }
    try {
        const result = await pool.request().query('SELECT CustomerID, Name, Email, Phone, Address FROM Customers');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// POST /api/customers - Add a new customer
router.post('/customers', async (req, res) => {
    // ✅ Change this line to match frontend payload keys
    const { Name, Email, Phone, Address } = req.body; // <-- Changed to capital N, E, P, A
    const pool = getPool();

    if (!pool) {
        return res.status(500).send('Database connection not available.');
    }

    if (!Name) { // ✅ Also change this check to Name (capital N)
        return res.status(400).json({ message: 'Name is required.' });
    }

    try {
        const result = await pool.request()
            .input('Name', sql.VarChar, Name) // ✅ Use capital N for input value
            .input('Email', sql.VarChar, Email) // ✅ Use capital E for input value
            .input('Phone', sql.VarChar, Phone) // ✅ Use capital P for input value
            .input('Address', sql.VarChar, Address) // ✅ Use capital A for input value
            .query(`
                INSERT INTO Customers (Name, Email, Phone, Address)
                OUTPUT INSERTED.CustomerID, INSERTED.Name, INSERTED.Email, INSERTED.Phone, INSERTED.Address
                VALUES (@Name, @Email, @Phone, @Address);
            `);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Error adding customer:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// PUT /api/customers/:id - Update an existing customer
router.put('/customers/:id', async (req, res) => {
    const { id } = req.params;
    const { Name, Email, Phone, Address } = req.body;
    const pool = getPool();

    if (!pool) {
        return res.status(500).send('Database connection not available.');
    }

    try {
        const result = await pool.request()
            .input('CustomerID', sql.Int, id)
            .input('Name', sql.VarChar, Name)
            .input('Email', sql.VarChar, Email)
            .input('Phone', sql.VarChar, Phone)
            .input('Address', sql.VarChar, Address)
            .query(`
                UPDATE Customers
                SET Name = @Name,
                    Email = @Email,
                    Phone = @Phone,
                    Address = @Address
                WHERE CustomerID = @CustomerID;

                SELECT CustomerID, Name, Email, Phone, Address
                FROM Customers
                WHERE CustomerID = @CustomerID;
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Customer not found.' });
        }

        res.json(result.recordset[0]); // Respond with the updated customer
    } catch (err) {
        console.error('Error updating customer:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// DELETE /api/customers/:id - Delete a customer
router.delete('/customers/:id', async (req, res) => {
    const { id } = req.params;
    const pool = getPool();

    if (!pool) {
        return res.status(500).send('Database connection not available.');
    }

    try {
        const result = await pool.request()
            .input('CustomerID', sql.Int, id)
            .query('DELETE FROM Customers WHERE CustomerID = @CustomerID');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Customer not found.' });
        }

        res.status(200).json({ message: 'Customer deleted successfully.' });
    } catch (err) {
        console.error('Error deleting customer:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;