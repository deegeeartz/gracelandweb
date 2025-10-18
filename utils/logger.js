/**
 * Production-Safe Logger Utility
 * Prevents console logs in production while preserving errors
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = {
    /**
     * Info logs - only shown in development
     */
    log: (...args) => {
        if (isDevelopment) {
            console.log(...args);
        }
    },

    /**
     * Info logs - only shown in development
     */
    info: (...args) => {
        if (isDevelopment) {
            console.info(...args);
        }
    },

    /**
     * Warning logs - only shown in development
     */
    warn: (...args) => {
        if (isDevelopment) {
            console.warn(...args);
        }
    },

    /**
     * Error logs - ALWAYS shown (even in production)
     */
    error: (...args) => {
        console.error(...args);
    },

    /**
     * Debug logs - only shown in development
     */
    debug: (...args) => {
        if (isDevelopment) {
            console.debug(...args);
        }
    },

    /**
     * Success logs with emoji - only shown in development
     */
    success: (...args) => {
        if (isDevelopment) {
            console.log('✅', ...args);
        }
    },

    /**
     * Request logs - only shown in development
     */
    request: (method, url, status) => {
        if (isDevelopment) {
            const timestamp = new Date().toISOString();
            const statusColor = status >= 400 ? '❌' : status >= 300 ? '⚠️' : '✅';
            console.log(`${statusColor} ${timestamp} - ${method} ${url} - ${status}`);
        }
    }
};

module.exports = logger;
