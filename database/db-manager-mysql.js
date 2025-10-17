// Database connection manager - MySQL Only
require('dotenv').config();

console.log('Database Manager: Using MySQL');
console.log(`Connecting to MySQL at ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

const mysql = require('mysql2/promise');

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

console.log('MySQL Config:', {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database
});

const pool = mysql.createPool(dbConfig);

// MySQL database interface
const db = {
    async all(query, params = []) {
        const [rows] = await pool.execute(query, params);
        return rows;
    },
    
    async get(query, params = []) {
        const [rows] = await pool.execute(query, params);
        return rows[0] || null;
    },
    
    async run(query, params = []) {
        const [result] = await pool.execute(query, params);
        return {
            lastID: result.insertId,
            changes: result.affectedRows
        };
    }
};

module.exports = { db, pool };
