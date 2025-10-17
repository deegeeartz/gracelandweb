require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const multer = require('multer');

// Import unified database initialization
const { initializeDatabase } = require('./database/init-database');

// Import routes
const blogRoutes = require('./routes/blog');
const sermonRoutes = require('./routes/sermons');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const settingsRoutes = require('./routes/settings');

// Import auth middleware
const { verifyToken } = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database asynchronously (don't block server startup)
setTimeout(() => {
    initializeDatabase().catch(error => {
        console.error('Database initialization failed:', error);
        console.log('Server will continue running without database initialization');
    });
}, 1000);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable for now to allow inline scripts
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS
app.use(cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files - serve from root directory since CSS/JS files are there
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve the main HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/blog', (req, res) => {
    res.sendFile(path.join(__dirname, 'blog.html'));
});

app.get('/blog.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'blog.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        database: 'MySQL',
        server: 'RCCG Graceland Website'
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/sermons', sermonRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);

// File upload configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        // Allow images and audio files
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image and audio files are allowed!'), false);
        }
    }
});

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    
    res.json({
        message: 'File uploaded successfully',
        filename: req.file.filename,
        url: `/uploads/${req.file.filename}`
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large' });
        }
    }
    
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    console.log(`❌ 404 - Route not found: ${req.method} ${req.url}`);
    res.status(404).json({ 
        error: 'Route not found', 
        path: req.url, 
        method: req.method,
        available_routes: [
            'GET /',
            'GET /blog.html', 
            'GET /admin.html',
            'GET /api/health',
            'POST /api/auth/login'
        ]
    });
});

app.listen(PORT, () => {
    console.log(`🚀 RCCG Graceland Website server running on http://localhost:${PORT}`);
    console.log(`📄 Main site: http://localhost:${PORT}`);
    console.log(`📖 Blog: http://localhost:${PORT}/blog.html`);
    console.log(`⚙️ Admin: http://localhost:${PORT}/admin.html`);
    console.log(`🔧 API: http://localhost:${PORT}/api`);
    console.log(`💚 Health: http://localhost:${PORT}/api/health`);
    console.log('✅ Server started successfully!');
});

module.exports = app;
