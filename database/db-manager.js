// MySQL-only database connection manager
require('dotenv').config();
const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

logger.log('Database Manager: MySQL-only configuration');

// Debug: Show ALL environment variables related to MySQL/Database
logger.log('🔍 Checking environment variables:');
logger.log('MYSQLHOST:', process.env.MYSQLHOST || '❌ Not set');
logger.log('MYSQLUSER:', process.env.MYSQLUSER || '❌ Not set');
logger.log('MYSQLDATABASE:', process.env.MYSQLDATABASE || '❌ Not set');
logger.log('MYSQLPORT:', process.env.MYSQLPORT || '❌ Not set');
logger.log('MYSQLPASSWORD:', process.env.MYSQLPASSWORD ? '✅ Set (hidden)' : '❌ Not set');
logger.log('DB_HOST:', process.env.DB_HOST || '❌ Not set');
logger.log('DB_USER:', process.env.DB_USER || '❌ Not set');
logger.log('NODE_ENV:', process.env.NODE_ENV || '❌ Not set');

// MySQL connection configuration
// IMPORTANT: Use Railway's PRIVATE network variables to avoid egress fees!
// Private variables: MYSQL_PRIVATE_URL or individual MYSQLHOST (without _PUBLIC suffix)
const dbConfig = {
    // Railway private network: Use MYSQLHOST (not MYSQL_PUBLIC_URL)
    // This connects through Railway's internal network (free!)
    host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT || 3306),
    user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'graceland_church',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,    charset: 'utf8mb4'
};

logger.success('MySQL Configuration:', {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database,
    usingRailway: !!(process.env.MYSQLHOST),
    usingStandard: !!(process.env.DB_HOST),
    usingDefaults: (!process.env.MYSQLHOST && !process.env.DB_HOST)
});

// Create MySQL connection pool
const pool = mysql.createPool(dbConfig);

// Database interface with async/await
const db = {
    async all(query, params = []) {
        try {
            // Use query() instead of execute() - it handles parameters better
            const [rows] = await pool.query(query, params);
            return rows;
        } catch (error) {
            console.error('Database query error:', error);
            console.error('Query:', query);
            console.error('Params:', params);
            throw error;
        }
    },
    
    async get(query, params = []) {
        try {
            const [rows] = await pool.query(query, params);
            return rows[0] || null;
        } catch (error) {
            console.error('Database query error:', error);
            console.error('Query:', query);
            console.error('Params:', params);
            throw error;
        }
    },
    
    async run(query, params = []) {
        try {
            const [result] = await pool.query(query, params);
            return {
                lastID: result.insertId,
                changes: result.affectedRows
            };
        } catch (error) {
            console.error('Database query error:', error);
            console.error('Query:', query);
            console.error('Params:', params);
            throw error;
        }
    }
};

// Test database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ MySQL connection failed:', error.message);
        console.log('💡 Make sure MySQL server is running and database exists');
        return false;
    }
}

module.exports = { db, pool, testConnection };
