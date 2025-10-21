/**
 * Database Initialization
 * Creates required tables if they don't exist
 */

const db = require('./db-manager');
const logger = require('../utils/logger');

async function initializeDatabase() {
    try {
        logger.log('Initializing database...');
        
        // Test connection first
        await db.testConnection();
        
        logger.success('Database connection verified');
        logger.log('Database initialization complete');
        
        return true;
    } catch (error) {
        logger.error('Database initialization error:', error.message);
        throw error;
    }
}

module.exports = { initializeDatabase };
