/**
 * Request Timeout Middleware
 * Prevents requests from hanging indefinitely
 */

const logger = require('../utils/logger');

/**
 * Create timeout middleware
 * @param {number} timeout - Timeout in milliseconds (default: 30000ms = 30s)
 */
function timeoutMiddleware(timeout = 30000) {
    return (req, res, next) => {
        // Set timeout on request
        req.setTimeout(timeout, () => {
            logger.warn(`Request timeout: ${req.method} ${req.url}`);
            
            if (!res.headersSent) {
                res.status(408).json({
                    error: 'Request timeout',
                    message: 'The server took too long to respond'
                });
            }
        });

        // Set timeout on response
        res.setTimeout(timeout, () => {
            logger.warn(`Response timeout: ${req.method} ${req.url}`);
            
            if (!res.headersSent) {
                res.status(504).json({
                    error: 'Gateway timeout',
                    message: 'The server did not respond in time'
                });
            }
        });

        next();
    };
}

module.exports = timeoutMiddleware;
