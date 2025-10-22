const mysql = require('mysql2');
require('dotenv').config();

// Railway menggunakan MYSQLHOST, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE, MYSQLPORT
const dbConfig = {
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'cinema_booking',
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000,
  
  // ✅ SSL Configuration untuk Railway Production
  ssl: (process.env.MYSQLHOST || process.env.NODE_ENV === 'production') ? {
    rejectUnauthorized: false
  } : false,
  
  // ✅ Additional settings untuk stability
  charset: 'utf8mb4',
  multipleStatements: true
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Enhanced connection test
const testConnection = () => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('❌ Local database connection failed:', err.message);
      console.log('💡 Tips: Pastikan MySQL berjalan di komputer ini');
      console.log('💡 Tips: Coba jalankan: mysql -u root -p');
    } else {
      console.log('✅ Connected to LOCAL MySQL database successfully!');
      console.log('📊 Database: cinema_booking');
      console.log('🌐 Host: localhost');
      
      // ✅ FIXED: Simple SQL query yang universal
      connection.query('SELECT 1 + 1 AS test_result', (queryErr, results) => {
        if (queryErr) {
          console.error('❌ Query test failed:', queryErr.message);
          console.log('💡 Using alternative test...');
          
          // Alternative test tanpa complex functions
          connection.query('SELECT 1', (simpleErr, simpleResults) => {
            if (simpleErr) {
              console.error('❌ Even simple query failed:', simpleErr.message);
            } else {
              console.log('✅ Simple connection test successful');
            }
            connection.release();
          });
        } else {
          console.log('✅ Database query test successful:', results[0].test_result);
          connection.release();
        }
      });
    }
  });
};
// Handle connection errors
pool.on('error', (err) => {
  console.error('💥 Database pool error:', err);
  
  // Try to reconnect after 2 seconds
  setTimeout(() => {
    console.log('🔄 Attempting to reconnect to database...');
    testConnection();
  }, 2000);
});

// Auto-test connection saat startup
if (process.env.NODE_ENV !== 'test') {
  testConnection();
}

module.exports = { pool, testConnection };