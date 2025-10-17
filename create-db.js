// Create database script
require('dotenv').config();
const mysql = require('mysql2/promise');

async function createDatabase() {
    try {
        console.log('Creating graceland_church database...');
        
        // Connect without specifying database first
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });
        
        // Create database
        await connection.execute('CREATE DATABASE IF NOT EXISTS graceland_church');
        console.log('✅ Database "graceland_church" created successfully');
        
        await connection.end();
        return true;
        
    } catch (error) {
        console.error('❌ Database creation failed:', error.message);
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('💡 Check your MySQL username/password in .env file');
        }
        return false;
    }
}

createDatabase();
