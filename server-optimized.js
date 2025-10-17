// Optimized server.js - RCCG Graceland Website
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOAD_DIR = 'uploads/';

console.log('🚀 Starting RCCG Graceland Website...');

// ============================================
// MIDDLEWARE
// ============================================

// Security
app.use(helmet({
    contentSecurityPolicy: false, // Allow inline scripts for now
}));

// CORS
app.use(cors());

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
    console.log(`${timestamp} - ${req.method} ${req.url}`);
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
        { path: '/api/settings', file: './routes/settings', name: 'Settings' }
    ];

    routes.forEach(({ path, file, name }) => {
        try {
            const router = require(file);
            app.use(path, router);
            console.log(`✅ ${name} routes loaded`);
        } catch (error) {
            console.error(`❌ Failed to load ${name} routes:`, error.message);
        }
    });
}

loadRoutes();

// ============================================
// FILE UPLOAD
// ============================================

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|mp3|mp4|wav/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images and audio files are allowed!'));
    }
});

app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
        success: true,
        filename: req.file.filename,
        url: `/uploads/${req.file.filename}`,
        size: req.file.size
    });
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
    console.log(`❌ 404 - Route not found: ${req.method} ${req.url}`);
    res.status(404).json({
        error: 'Route not found',
        path: req.url,
        method: req.method
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('💥 Unhandled error:', error);
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
        console.log('✅ Database initialized');
    } catch (error) {
        console.error('⚠️ Database initialization failed:', error.message);
        console.log('Server will continue running...');
    }
}, 1000);

// ============================================
// SERVER START
// ============================================

const server = app.listen(PORT, () => {
    console.log('========================================');
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📄 Main site: http://localhost:${PORT}`);
    console.log(`📖 Blog: http://localhost:${PORT}/blog.html`);
    console.log(`⚙️ Admin: http://localhost:${PORT}/admin.html`);
    console.log(`🔧 Health: http://localhost:${PORT}/api/health`);
    console.log('========================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\nSIGINT received, closing server gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

module.exports = app;
