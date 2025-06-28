const sql = require('mssql');

const config = {
 user: 'ecom_user',
 password: 'ecom12345',
 server: 'USMAN-DOGAR\\RIZWAN',
 database: 'EcomInventory',
 options: {
  encrypt: false,
  trustServerCertificate: true
 }
};

let pool;

sql.connect(config)
 .then(p => {
  pool = p;
  console.log('✅ Connected to SQL Server');
 })
 .catch(err => console.error('❌ DB Connection Error:', err));

module.exports = {
   sql, // We might still need the mssql object itself
getPool: () => pool
};