// Simple database test
require('dotenv').config();
const mysql = require('mysql2/promise');

async function testDirect() {
    try {
        console.log('Testing direct MySQL connection...');
        
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: 'Starbaby8',
            database: 'graceland_church'
        });
        
        console.log('✅ Direct connection successful');
        
        const [rows] = await connection.execute('SELECT COUNT(*) as count FROM users');
        console.log('✅ Users table:', rows[0].count, 'records');
        
        const [posts] = await connection.execute('SELECT COUNT(*) as count FROM blog_posts');
        console.log('✅ Blog posts table:', posts[0].count, 'records');
        
        const [categories] = await connection.execute('SELECT COUNT(*) as count FROM categories');
        console.log('✅ Categories table:', categories[0].count, 'records');
        
        await connection.end();
        
        console.log('\n✅ Direct database test successful');
        
    } catch (error) {
        console.error('❌ Direct test failed:', error.message);
    }
}

testDirect();
