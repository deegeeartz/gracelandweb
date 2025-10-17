// Configuration constants - RCCG Graceland Website
require('dotenv').config();

module.exports = {
    // Server configuration
    server: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development',
        isDevelopment: process.env.NODE_ENV !== 'production'
    },
    
    // Database configuration
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        name: process.env.DB_NAME || 'graceland_church',
        connectionLimit: 10,
        charset: 'utf8mb4'
    },
    
    // JWT configuration
    jwt: {
        secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this',
        expiresIn: '24h'
    },
    
    // File upload configuration
    upload: {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
        allowedAudioTypes: ['audio/mpeg', 'audio/mp3', 'audio/wav'],
        uploadDir: 'uploads/'
    },
    
    // Pagination defaults
    pagination: {
        defaultPage: 1,
        defaultLimit: 10,
        maxLimit: 100
    },
    
    // Rate limiting
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100,
        authMaxRequests: 5 // Stricter for auth endpoints
    },
    
    // Cache settings
    cache: {
        enabled: process.env.CACHE_ENABLED === 'true',
        ttl: 5 * 60 // 5 minutes
    },
    
    // Admin defaults
    admin: {
        defaultUsername: 'admin',
        defaultPassword: 'admin123' // Should be changed immediately
    },
    
    // Blog settings
    blog: {
        excerptLength: 200,
        titleMaxLength: 255,
        contentMaxLength: 50000
    },
    
    // Sermon settings
    sermon: {
        titleMaxLength: 255,
        descriptionMaxLength: 1000
    }
};
