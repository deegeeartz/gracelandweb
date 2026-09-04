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

// Detect environment
const isProduction = process.env.NODE_ENV === 'production' || !!process.env.MYSQLHOST;
const isLocal = !isProduction;

logger.log('🌍 Environment:', isProduction ? 'PRODUCTION (Railway)' : 'LOCAL DEVELOPMENT');

if (isProduction && !process.env.MYSQLHOST) {
    logger.warn('⚠️ NODE_ENV is production but Railway MySQL vars not set!');
}

// MySQL connection configuration
const host = process.env.MYSQLHOST || process.env.DB_HOST || 'localhost';
const isTiDB = typeof host === 'string' && host.includes('tidbcloud.com');
const defaultPort = isTiDB ? 4000 : 3306;
const isRemoteHost = !['localhost', '127.0.0.1', 'db'].includes(host);
const useSsl = isRemoteHost && (isTiDB || process.env.NODE_ENV === 'production' || process.env.VERCEL || process.env.DB_SSL === 'true');

const dbConfig = {
    host: host,
    port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT || defaultPort),
    user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'graceland_church',
    waitForConnections: true,
    connectionLimit: process.env.VERCEL ? 3 : 10,
    queueLimit: 0,
    charset: 'utf8mb4',
    ssl: useSsl ? { rejectUnauthorized: false } : undefined
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
const db = {    async all(query, params = []) {
        try {
            // Use query() instead of execute() - it handles parameters better
            const [rows] = await pool.query(query, params);
            return rows;
        } catch (error) {
            logger.error('Database query error:', error);
            logger.error('Query:', query);
            logger.error('Params:', params);
            throw error;
        }
    },
    
    async get(query, params = []) {
        try {
            const [rows] = await pool.query(query, params);
            return rows[0] || null;
        } catch (error) {
            logger.error('Database query error:', error);
            logger.error('Query:', query);
            logger.error('Params:', params);
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
            logger.error('Database query error:', error);
            logger.error('Query:', query);
            logger.error('Params:', params);
            throw error;
        }
    }
};

// Test database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        logger.success('MySQL connected successfully');
        connection.release();
        return true;
    } catch (error) {
        logger.error('MySQL connection failed:', error.message);
        logger.log('Make sure MySQL server is running and database exists');
        return false;
    }
}

module.exports = { db, pool, testConnection };
