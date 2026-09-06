// Vercel-Native api-server.js - RCCG Graceland Website
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const multer = require('multer');
const logger = require('./utils/logger');
const timeoutMiddleware = require('./middleware/timeout');

const app = express();

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Trust proxy - Required for Vercel
app.set('trust proxy', true);

// ============================================
// MIDDLEWARE
// ============================================

// Security
app.use(helmet({
    contentSecurityPolicy: false,
}));

// CORS
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://deegeeartz.github.io',
    'https://rccggraceland.com',
    'https://www.rccggraceland.com',
    'https://gracelandweb.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (
            allowedOrigins.includes(origin) ||
            origin.endsWith('.rccggraceland.com') ||
            origin.endsWith('.vercel.app')
        ) {
            callback(null, true);
        } else {
            callback(null, true);
        }
    },
    credentials: true
}));

// Body parsing (Express handles this, Next.js parsing is disabled in catch-all)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Timeout middleware
app.use(timeoutMiddleware(30000));

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    validate: { trustProxy: false },
    message: 'Too many requests, please try again later.'
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    validate: { trustProxy: false },
    message: 'Too many login attempts, please try again later.'
});

const uploadLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 20,
    validate: { trustProxy: false },
    message: 'Too many uploads, please try again later.'
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);

// Track route loading
const routeLoadErrors = [];
const routesToLoad = [
    ['/api/auth', './routes/auth'],
    ['/api/blog', './routes/blog'],
    ['/api/sermons', './routes/sermons'],
    ['/api/admin', './routes/admin'],
    ['/api/admin', './routes/reset-database'],
    ['/api/settings', './routes/settings'],
    ['/api/facebook', './routes/facebook'],
    ['/api/events', './routes/events'],
    ['/api/prayer', './routes/prayer'],
    ['/api/members', './routes/members'],
    ['/api/fellowships', './routes/fellowships'],
    ['/api/comments', './routes/comments'],
    ['/api/search', './routes/search'],
    ['/api/gallery', './routes/gallery'],
    ['/api/ministries', './routes/ministries'],
];

for (const [routePath, modulePath] of routesToLoad) {
    try {
        app.use(routePath, require(modulePath));
    } catch (error) {
        routeLoadErrors.push({ path: routePath, module: modulePath, error: error.message });
        logger.error(`Error loading ${routePath}:`, error.message);
    }
}

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        server: 'RCCG Graceland Website (Vercel Native)',
        database: 'TiDB',
        routesMounted: routesToLoad.length - routeLoadErrors.length,
        routeErrors: routeLoadErrors.length > 0 ? routeLoadErrors : undefined,
        version: '1.0.0'
    });
});

// ============================================
// FILE UPLOAD - Cloudinary Integration
// ============================================

const cloudinaryService = require('./services/cloudinary.service');
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|mp3|mp4|wav|mpeg/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Only images, videos, and audio files are allowed!'));
    }
});

app.post('/api/upload', uploadLimiter, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        if (!cloudinaryService.isConfigured()) return res.status(500).json({ error: 'Cloudinary not configured.' });

        const isVideo = /video/.test(req.file.mimetype);
        let result;
        if (isVideo) {
            result = await cloudinaryService.uploadVideo(req.file.buffer, { type: 'media', resourceType: 'video' });
        } else {
            result = await cloudinaryService.uploadImage(req.file.buffer, { type: req.body.type || 'blog', optimizeLocally: true, resourceType: 'image' });
        }

        res.json({
            success: true,
            public_id: result.public_id,
            url: result.url,
            urls: result.urls,
            storage: 'cloudinary'
        });    
    } catch (error) {
        logger.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed', message: error.message });
    }
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'File too large (max 5MB)' });
        return res.status(400).json({ error: 'File upload error: ' + error.message });
    }
    next(error);
});

// DO NOT ADD app.listen() 
// DO NOT ADD Next.js handler here
// Just export the Express app for the Catch-All API route

module.exports = app;
