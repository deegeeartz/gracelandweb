const logger = require('../utils/logger');
const { ZodError } = require('zod');

/**
 * Middleware to validate request data against a Zod schema
 * @param {import('zod').ZodSchema} schema - The Zod schema to validate against
 * @param {'body' | 'query' | 'params'} property - Which part of the request to validate
 */
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        try {
            const parsedData = schema.parse(req[property]);
            // Replace the request property with the parsed and type-coerced data
            req[property] = parsedData;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                // Format the Zod errors into a readable structure
                const formattedErrors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));

                logger.warn(`Validation error on ${req.method} ${req.url}:`, formattedErrors);
                
                return res.status(400).json({
                    error: 'Validation failed',
                    details: formattedErrors
                });
            }
            
            logger.error('Unexpected validation error:', error);
            return res.status(500).json({ error: 'Internal server error during validation' });
        }
    };
};

module.exports = validate;
