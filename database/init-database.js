/**
 * Database Initialization - Calls the full MySQL setup
 */

const { initDatabase } = require('./init-mysql');
const logger = require('../utils/logger');

async function initializeDatabaseWrapper() {
    try {
        logger.log('🚀 Starting database initialization...');
        await initDatabase();
        logger.success('✅ Database initialization complete');
        return true;
    } catch (error) {
        logger.error('❌ Database initialization error:', error.message);
        throw error;
    }
}

module.exports = { initializeDatabase: initializeDatabaseWrapper };
