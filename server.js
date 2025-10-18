// Optimized server.js - RCCG Graceland Website
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const multer = require('multer');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOAD_DIR = 'uploads/';

logger.success('Starting RCCG Graceland Website...');

// ============================================
// MIDDLEWARE
// ============================================

// Security
app.use(helmet({
    contentSecurityPolicy: false, // Allow inline scripts for now
}));

// CORS - Allow GitHub Pages and localhost
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5500',
    'https://deegeeartz.github.io', // GitHub Pages
    'https://railway.app',
    'https://railway.com'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, curl)
        if (!origin) return callback(null, true);
          if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('railway.app')) {
            callback(null, true);
        } else {
            logger.warn('CORS blocked origin:', origin);
            callback(null, true); // Allow all for now during development
        }
    },
    credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting - Protect API endpoints
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests, please try again later.'
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // Strict limit on login attempts
    message: 'Too many login attempts, please try again later.'
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toLocaleTimeString();
    logger.log(`${timestamp} - ${req.method} ${req.url}`);
    next();
});

// Static files
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, UPLOAD_DIR)));

// ============================================
// HTML ROUTES
// ============================================

const htmlRoutes = {
    '/': 'index.html',
    '/blog': 'blog.html',
    '/blog.html': 'blog.html',
    '/post': 'post.html',
    '/post.html': 'post.html',
    '/admin': 'admin.html',
    '/admin.html': 'admin.html'
};

Object.entries(htmlRoutes).forEach(([route, file]) => {
    app.get(route, (req, res) => {
        res.sendFile(path.join(__dirname, file));
    });
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        server: 'RCCG Graceland Website',
        database: 'MySQL',
        version: '1.0.0'
    });
});

// ============================================
// API ROUTES
// ============================================

// Safe route loading with error handling
function loadRoutes() {
    const routes = [
        { path: '/api/auth', file: './routes/auth', name: 'Auth' },
        { path: '/api/blog', file: './routes/blog', name: 'Blog' },
        { path: '/api/sermons', file: './routes/sermons', name: 'Sermons' },
        { path: '/api/admin', file: './routes/admin', name: 'Admin' },
        { path: '/api/admin', file: './routes/reset-database', name: 'Database Reset' },
        { path: '/api/settings', file: './routes/settings', name: 'Settings' }
    ];    routes.forEach(({ path, file, name }) => {
        try {
            const router = require(file);
            app.use(path, router);
            logger.success(`${name} routes loaded`);
        } catch (error) {
            logger.error(`Failed to load ${name} routes:`, error.message);
        }
    });
}

loadRoutes();

// ============================================
// FILE UPLOAD - Cloudinary Integration
// ============================================

const cloudinaryService = require('./services/cloudinary.service');

// Multer memory storage (store in memory, not disk)
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|mp3|mp4|wav|mpeg/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images, videos, and audio files are allowed!'));
    }
});

// Upload endpoint with Cloudinary integration
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Check if Cloudinary is configured
        if (!cloudinaryService.isConfigured()) {
            // Fallback to local storage if Cloudinary not configured
            const fs = require('fs').promises;
            const uploadDir = path.join(__dirname, 'uploads');
            
            // Ensure upload directory exists
            try {
                await fs.access(uploadDir);
            } catch {
                await fs.mkdir(uploadDir, { recursive: true });
            }

            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path.extname(req.file.originalname);
            const filename = req.file.fieldname + '-' + uniqueSuffix + ext;
            const filepath = path.join(uploadDir, filename);

            await fs.writeFile(filepath, req.file.buffer);

            return res.json({
                success: true,
                filename: filename,
                url: `/uploads/${filename}`,
                size: req.file.size,
                storage: 'local'
            });
        }

        // Determine resource type
        const isImage = /image/.test(req.file.mimetype);
        const isVideo = /video/.test(req.file.mimetype);
        const resourceType = isVideo ? 'video' : 'image';

        // Upload to Cloudinary
        let result;
        if (isVideo) {
            result = await cloudinaryService.uploadVideo(req.file.buffer, {
                type: 'media',
                resourceType: 'video'
            });
        } else {
            result = await cloudinaryService.uploadImage(req.file.buffer, {
                type: req.body.type || 'blog',
                optimizeLocally: true,
                resourceType: 'image'
            });
        }

        // Return optimized URLs
        res.json({
            success: true,
            public_id: result.public_id,
            url: result.url,
            urls: result.urls,
            thumbnail: result.urls?.thumbnail,
            width: result.width,
            height: result.height,
            format: result.format,
            size: result.bytes,
            storage: 'cloudinary',
            responsive_breakpoints: result.responsive_breakpoints
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ 
            error: 'Upload failed', 
            message: error.message 
        });
    }
});

// ============================================
// ERROR HANDLING
// ============================================

// Multer error handling
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large (max 5MB)' });
        }
        return res.status(400).json({ error: 'File upload error: ' + error.message });
    }

    if (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }

    next();
});

// 404 handler
app.use((req, res) => {
    logger.warn(`404 - Route not found: ${req.method} ${req.url}`);
    res.status(404).json({
        error: 'Route not found',
        path: req.url,
        method: req.method
    });
});

// Global error handler
app.use((error, req, res, next) => {
    logger.error('Unhandled error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

// ============================================
// DATABASE INITIALIZATION
// ============================================

// Initialize database asynchronously (non-blocking)
setTimeout(async () => {
    try {
        const { initializeDatabase } = require('./database/init-database');
        await initializeDatabase();
        logger.success('Database initialized');
    } catch (error) {
        logger.error('Database initialization failed:', error.message);
        logger.log('Server will continue running...');
    }
}, 1000);

// ============================================
// SERVER START
// ============================================

const server = app.listen(PORT, () => {
    logger.log('========================================');
    logger.success(`Server running on http://localhost:${PORT}`);
    logger.log(`📄 Main site: http://localhost:${PORT}`);
    logger.log(`📖 Blog: http://localhost:${PORT}/blog.html`);
    logger.log(`⚙️ Admin: http://localhost:${PORT}/admin.html`);
    logger.log(`🔧 Health: http://localhost:${PORT}/api/health`);
    logger.log('========================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.log('SIGTERM received, closing server gracefully...');
    server.close(() => {
        logger.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.log('\nSIGINT received, closing server gracefully...');
    server.close(() => {
        logger.log('Server closed');
        process.exit(0);
    });
});

module.exports = app;
