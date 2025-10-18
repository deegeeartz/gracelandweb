/**
 * Client-Side Production-Safe Logger
 * Prevents console logs in production while preserving errors
 */

(function() {
    // Check if we're in production (based on hostname or explicit flag)
    const isProduction = 
        window.location.hostname !== 'localhost' && 
        window.location.hostname !== '127.0.0.1' &&
        !window.location.hostname.includes('localhost') &&
        !window.location.hostname.includes('127.0.0.1');

    // Create production-safe logger
    window.logger = {
        /**
         * Info logs - only shown in development
         */
        log: (...args) => {
            if (!isProduction) {
                console.log(...args);
            }
        },

        /**
         * Info logs - only shown in development
         */
        info: (...args) => {
            if (!isProduction) {
                console.info(...args);
            }
        },

        /**
         * Warning logs - only shown in development
         */
        warn: (...args) => {
            if (!isProduction) {
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
            if (!isProduction) {
                console.debug(...args);
            }
        },

        /**
         * Success logs - only shown in development
         */
        success: (...args) => {
            if (!isProduction) {
                console.log('✅', ...args);
            }
        },

        /**
         * Check if we're in development mode
         */
        isDevelopment: () => !isProduction,

        /**
         * Check if we're in production mode
         */
        isProduction: () => isProduction
    };

    // Log initialization status
    if (!isProduction) {
        console.log('🔍 Logger initialized in DEVELOPMENT mode');
    }
})();
