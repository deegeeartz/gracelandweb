// Unified database initialization
const { useMySQL } = require('./db-manager');

async function initializeDatabase() {
    try {
        if (useMySQL) {
            console.log('Initializing MySQL database...');
            const { initDatabase } = require('./init-mysql');
            await initDatabase();
            console.log('✅ MySQL database initialized successfully');
        } else {
            console.log('Initializing SQLite database...');
            const { initDatabase } = require('./init-db');
            await initDatabase();
            console.log('✅ SQLite database initialized successfully');
        }
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
    }
}

module.exports = { initializeDatabase };
