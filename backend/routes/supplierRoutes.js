const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { getPool } = require('../db');

// GET /api/suppliers - Get all suppliers
router.get('/suppliers', async (req, res) => {
    const pool = getPool();
    if (!pool) {
        return res.status(500).send('Database connection not available.');
    }
    try {
        const result = await pool.request().query('SELECT SupplierID, Name, ContactPerson, Email, Phone, Address FROM Suppliers');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// POST /api/suppliers - Add a new supplier
router.post('/suppliers', async (req, res) => {
    const { Name, ContactPerson, Email, Phone, Address } = req.body; // Frontend keys se match karna zaroori hai
    const pool = getPool();

    if (!pool) {
        return res.status(500).send('Database connection not available.');
    }

    if (!Name) {
        return res.status(400).json({ message: 'Name is required.' });
    }

    try {
        const result = await pool.request()
            .input('Name', sql.VarChar, Name)
            .input('ContactPerson', sql.VarChar, ContactPerson)
            .input('Email', sql.VarChar, Email)
            .input('Phone', sql.VarChar, Phone)
            .input('Address', sql.VarChar, Address)
            .query(`
                INSERT INTO Suppliers (Name, ContactPerson, Email, Phone, Address)
                OUTPUT INSERTED.SupplierID, INSERTED.Name, INSERTED.ContactPerson, INSERTED.Email, INSERTED.Phone, INSERTED.Address
                VALUES (@Name, @ContactPerson, @Email, @Phone, @Address);
            `);
        res.status(201).json(result.recordset[0]); // Respond with the newly created supplier
    } catch (err) {
        console.error('Error adding supplier:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// PUT /api/suppliers/:id - Update an existing supplier
router.put('/suppliers/:id', async (req, res) => {
    const { id } = req.params;
    const { Name, ContactPerson, Email, Phone, Address } = req.body;
    const pool = getPool();

    if (!pool) {
        return res.status(500).send('Database connection not available.');
    }

    try {
        const result = await pool.request()
            .input('SupplierID', sql.Int, id)
            .input('Name', sql.VarChar, Name)
            .input('ContactPerson', sql.VarChar, ContactPerson)
            .input('Email', sql.VarChar, Email)
            .input('Phone', sql.VarChar, Phone)
            .input('Address', sql.VarChar, Address)
            .query(`
                UPDATE Suppliers
                SET Name = @Name,
                    ContactPerson = @ContactPerson,
                    Email = @Email,
                    Phone = @Phone,
                    Address = @Address
                WHERE SupplierID = @SupplierID;

                SELECT SupplierID, Name, ContactPerson, Email, Phone, Address
                FROM Suppliers
                WHERE SupplierID = @SupplierID;
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Supplier not found.' });
        }

        res.json(result.recordset[0]); // Respond with the updated supplier
    } catch (err) {
        console.error('Error updating supplier:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// DELETE /api/suppliers/:id - Delete a supplier
router.delete('/suppliers/:id', async (req, res) => {
    const { id } = req.params;
    const pool = getPool();

    if (!pool) {
        return res.status(500).send('Database connection not available.');
    }

    try {
        const result = await pool.request()
            .input('SupplierID', sql.Int, id)
            .query('DELETE FROM Suppliers WHERE SupplierID = @SupplierID');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Supplier not found.' });
        }

        res.status(200).json({ message: 'Supplier deleted successfully.' });
    } catch (err) {
        console.error('Error deleting supplier:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;