const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupProductionDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        multipleStatements: true
    });

    try {
        // Create database if it doesn't exist
        await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`Database ${process.env.DB_NAME} created or already exists`);

        // Use the database
        await connection.execute(`USE ${process.env.DB_NAME}`);

        // Initialize tables
        const { initDatabase } = require('./init-mysql');
        await initDatabase();

        console.log('Production database setup completed successfully!');
    } catch (error) {
        console.error('Error setting up production database:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

if (require.main === module) {
    setupProductionDatabase()
        .then(() => {
            console.log('Database setup completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Database setup failed:', error);
            process.exit(1);
        });
}

module.exports = { setupProductionDatabase };
