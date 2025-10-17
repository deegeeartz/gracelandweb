const express = require('express');
const path = require('path');

// Simple health check endpoint for Railway
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'RCCG Graceland Website is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: process.env.MYSQLHOST ? 'MySQL (Railway)' : 'SQLite (Local)'
    });
});

app.get('/db-test', async (req, res) => {
    try {
        if (process.env.MYSQLHOST) {
            const mysql = require('mysql2/promise');
            const connection = await mysql.createConnection({
                host: process.env.MYSQLHOST,
                port: process.env.MYSQLPORT,
                user: process.env.MYSQLUSER,
                password: process.env.MYSQLPASSWORD,
                database: process.env.MYSQLDATABASE
            });
            
            await connection.execute('SELECT 1');
            await connection.end();
            
            res.json({
                status: 'SUCCESS',
                message: 'Database connection successful',
                type: 'MySQL (Railway)'
            });
        } else {
            res.json({
                status: 'INFO',
                message: 'Using SQLite for development',
                type: 'SQLite'
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Database connection failed',
            error: error.message
        });
    }
});

// Serve static files
app.use(express.static('.'));

app.listen(PORT, () => {
    console.log(`Health check server running on port ${PORT}`);
    console.log(`Visit /health for status check`);
    console.log(`Visit /db-test for database test`);
});

module.exports = app;
