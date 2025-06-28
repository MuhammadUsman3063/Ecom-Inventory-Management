// backend/models/productModel.js

const { sql, getPool } = require('../db');

// ============================================
// ✅ Get All Products
// Fetches all products from the Products table, aliasing 'id' to 'ID' and joining SupplierName.
// ============================================
async function getAllProducts() {
    try {
        const pool = getPool();
        if (!pool) {
            throw new Error('Database connection pool not available.');
        }
        const result = await pool.request().query`
            SELECT
                p.id AS ID,
                p.Name,
                p.Price,
                p.Quantity,
                p.Category,
                p.ImageUrl, -- ✅ Changed from Imageurl to ImageUrl
                p.SupplierID,
                s.Name AS SupplierName
            FROM
                Products p
            LEFT JOIN
                Suppliers s ON p.SupplierID = s.SupplierID;
        `;
        return result.recordset;
    } catch (error) {
        console.error('Error in getAllProducts:', error);
        throw error;
    }
}

async function getProductById(id) {
    try {
        const pool = getPool();
        if (!pool) {
            throw new Error('Database connection pool not available.');
        }
        const request = pool.request();
        request.input('product_id_param', sql.Int, parseInt(id));
        const result = await request.query`
            SELECT
                p.id AS ID,
                p.Name,
                p.Price,
                p.Quantity,
                p.Category,
                p.ImageUrl, -- ✅ Changed from Imageurl to ImageUrl
                p.SupplierID,
                s.Name AS SupplierName
            FROM
                Products p
            LEFT JOIN
                Suppliers s ON p.SupplierID = s.SupplierID
            WHERE p.id = @product_id_param;
        `;
        return result.recordset[0];
    } catch (error) {
        console.error('Error in getProductById:', error);
        throw error;
    }
}

async function createProduct(product) {
    const { name, price, quantity, category, imageUrl, supplierId } = product;

    try {
        const pool = getPool();
        if (!pool) {
            throw new Error('Database connection pool not available.');
        }
        const request = pool.request();
        request.input('Name', sql.NVarChar, name);
        request.input('Price', sql.Decimal(10, 2), Number(price));
        request.input('Quantity', sql.Int, Number(quantity));
        request.input('Category', sql.NVarChar, category);
        request.input('ImageUrl', sql.NVarChar, imageUrl || null);

        // ✅ Make sure these lines are NOT commented out like // ...
        console.log('productModel: createProduct - Received supplierId:', supplierId);
        console.log('productModel: createProduct - Type of supplierId:', typeof supplierId);

        // Conditional input for SupplierID:
        const finalSupplierId = (supplierId === '' || supplierId === 'null') ? null : (supplierId ? Number(supplierId) : null);

        console.log('productModel: createProduct - Final supplierId for DB:', finalSupplierId);
        console.log('productModel: createProduct - Type of finalSupplierId for DB:', typeof finalSupplierId);
        // ✅ End of the block that should NOT be commented out

        request.input('SupplierID', sql.Int, finalSupplierId); // ✅ Use finalSupplierId for input

        const result = await request.query`
            INSERT INTO Products (Name, Price, Quantity, Category, ImageUrl, SupplierID)
            OUTPUT INSERTED.id
            VALUES (@Name, @Price, @Quantity, @Category, @ImageUrl, @SupplierID);
        `;
        const newProductId = result.recordset[0].id;

        const newProductWithSupplierName = await module.exports.getProductById(newProductId);

        if (newProductWithSupplierName && newProductWithSupplierName.id !== undefined) {
            newProductWithSupplierName.ID = newProductWithSupplierName.id;
            delete newProductWithSupplierName.id;
        }

        return newProductWithSupplierName;
    } catch (error) {
        console.error('Error in createProduct:', error);
        throw error;
    }
}

async function updateProduct(id, product) {
    const { name, price, quantity, category, imageUrl, supplierId } = product;

    try {
        const pool = getPool();
        if (!pool) {
            throw new Error('Database connection pool not available.');
        }
        const request = pool.request();
        request.input('product_id_param', sql.Int, parseInt(id));
        request.input('Name', sql.NVarChar, name);
        request.input('Price', sql.Decimal(10, 2), Number(price));
        request.input('Quantity', sql.Int, Number(quantity));
        request.input('Category', sql.NVarChar, category);
        request.input('ImageUrl', sql.NVarChar, imageUrl || null); // ✅ Changed from Imageurl to ImageUrl

        // ... (debugging logs and finalSupplierId logic)

        request.input('SupplierID', sql.Int, finalSupplierId);


        await request.query`
            UPDATE Products
            SET
                Name = @Name,
                Price = @Price,
                Quantity = @Quantity,
                Category = @Category,
                ImageUrl = @ImageUrl, -- ✅ Changed from Imageurl to ImageUrl
                SupplierID = @SupplierID
            WHERE id = @product_id_param;
        `;
        return module.exports.getProductById(id);
    } catch (error) {
        console.error('Error in updateProduct:', error);
        throw error;
    }
}

// ============================================
// ✅ Delete Product
// Deletes a product from the Products table by 'id'.
// ============================================
async function deleteProduct(id) {
    try {
        const pool = getPool();
        if (!pool) {
            throw new Error('Database connection pool not available.');
        }
        const request = pool.request();
        request.input('product_id_param', sql.Int, parseInt(id));
        const result = await request.query`
            DELETE FROM Products WHERE id = @product_id_param;
        `;
        return result.rowsAffected[0];
    } catch (error) {
        console.error('Error in deleteProduct:', error);
        throw error;
    }
}

// Export all functions to be used by controllers
module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};