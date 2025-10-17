// MySQL-only database initialization
const { testConnection } = require('./db-manager');

async function initializeDatabase() {
    try {
        console.log('Initializing MySQL database...');
        
        // Test connection first
        const connected = await testConnection();
        if (!connected) {
            throw new Error('Cannot connect to MySQL database');
        }
        
        // Initialize MySQL database
        const { initDatabase } = require('./init-mysql');
        await initDatabase();
        console.log('✅ MySQL database initialized successfully');
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        console.log('💡 Make sure MySQL server is running and database "graceland_church" exists');
        throw error;
    }
}

module.exports = { initializeDatabase };
