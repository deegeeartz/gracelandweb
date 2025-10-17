// MySQL-only database connection manager
require('dotenv').config();
const mysql = require('mysql2/promise');

console.log('Database Manager: MySQL-only configuration');

// MySQL connection configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'graceland_church',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
};

console.log('MySQL Configuration:', {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database
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
