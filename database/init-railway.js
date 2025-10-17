const mysql = require('mysql2/promise');

async function initRailwayDatabase() {
    // Railway provides DATABASE_URL or individual connection params
    const connectionConfig = process.env.DATABASE_URL ? {
        uri: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    } : {
        host: process.env.MYSQLHOST || process.env.DB_HOST,
        port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
        user: process.env.MYSQLUSER || process.env.DB_USER,
        password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
        database: process.env.MYSQLDATABASE || process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }
    };

    try {
        console.log('Connecting to Railway MySQL database...');
        const connection = await mysql.createConnection(connectionConfig);
        
        // Test connection
        await connection.execute('SELECT 1');
        console.log('Database connection successful!');

        // Initialize database schema
        const { initDatabase } = require('./init-mysql');
        await initDatabase();
        
        await connection.end();
        console.log('Railway database initialization completed!');
        
    } catch (error) {
        console.error('Railway database initialization failed:', error);
        throw error;
    }
}

module.exports = { initRailwayDatabase };

// Run if called directly
if (require.main === module) {
    initRailwayDatabase()
        .then(() => {
            console.log('Database setup completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Database setup failed:', error);
            process.exit(1);
        });
}
