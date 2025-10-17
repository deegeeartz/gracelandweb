// Database connection manager - automatically selects SQLite or MySQL
require('dotenv').config();

// Debug environment variables
console.log('DB Manager Environment Check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('MYSQL') || key.includes('DB') || key.includes('DATABASE')));

// Determine which database system to use
const useMySQL = process.env.NODE_ENV === 'production' || 
                 process.env.DATABASE_URL || 
                 process.env.MYSQLHOST || 
                 (process.env.DB_HOST && process.env.DB_HOST !== 'localhost');

console.log(`Database Manager: Using ${useMySQL ? 'MySQL' : 'SQLite'}`);

let db, pool;

if (useMySQL) {
    // MySQL connection
    const mysql = require('mysql2/promise');
    
    const dbConfig = {
        host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
        port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
        user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
        password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
        database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'graceland_church',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        charset: 'utf8mb4',
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };
    
    pool = mysql.createPool(dbConfig);
    
    // MySQL wrapper to match SQLite interface
    db = {
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
} else {
    // SQLite connection
    const sqlite3 = require('sqlite3').verbose();
    const path = require('path');
    
    const dbPath = path.join(__dirname, 'graceland.db');
    const sqliteDb = new sqlite3.Database(dbPath);
    
    // SQLite promisified wrapper
    db = {
        all(query, params = []) {
            return new Promise((resolve, reject) => {
                sqliteDb.all(query, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
        },
        
        get(query, params = []) {
            return new Promise((resolve, reject) => {
                sqliteDb.get(query, params, (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
        },
        
        run(query, params = []) {
            return new Promise((resolve, reject) => {
                sqliteDb.run(query, params, function(err) {
                    if (err) reject(err);
                    else resolve({
                        lastID: this.lastID,
                        changes: this.changes
                    });
                });
            });
        }
    };
}

module.exports = { db, pool, useMySQL };
