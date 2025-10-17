// Test environment variables
require('dotenv').config();

console.log('Environment Variables Test:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'NOT SET');
console.log('DB_NAME:', process.env.DB_NAME);

console.log('\nRaw DB_PASSWORD length:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0);

// Test database connection with these values
const mysql = require('mysql2/promise');

async function testEnvConnection() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'graceland_church'
        });
        
        console.log('✅ Connection with env vars successful');
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('✅ Query successful:', rows[0]);
        await connection.end();
        
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('Error code:', error.code);
    }
}

testEnvConnection();
