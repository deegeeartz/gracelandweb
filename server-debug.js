require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting RCCG Graceland Website server...');
console.log('📁 Serving files from:', __dirname);

// Basic middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files - serve from root directory (NOT public/)
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Log all requests
app.use((req, res, next) => {
    console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
    next();
});

// Health check first
app.get('/api/health', (req, res) => {
    console.log('💚 Health check requested');
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        server: 'RCCG Graceland Website',
        static_root: __dirname
    });
});

// HTML file routes - explicit routes
app.get('/', (req, res) => {
    console.log('📄 Serving index.html');
    const filePath = path.join(__dirname, 'index.html');
    console.log('File path:', filePath);
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error serving index.html:', err);
            res.status(500).send('Error loading homepage');
        }
    });
});

app.get('/blog', (req, res) => {
    console.log('📖 Serving blog.html via /blog');
    res.sendFile(path.join(__dirname, 'blog.html'));
});

app.get('/blog.html', (req, res) => {
    console.log('📖 Serving blog.html directly');
    res.sendFile(path.join(__dirname, 'blog.html'));
});

app.get('/admin', (req, res) => {
    console.log('⚙️ Serving admin.html via /admin');
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/admin.html', (req, res) => {
    console.log('⚙️ Serving admin.html directly');
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Test CSS file explicitly
app.get('/styles.css', (req, res) => {
    console.log('🎨 Serving styles.css');
    res.sendFile(path.join(__dirname, 'styles.css'));
});

// Try to load API routes safely
try {
    const authRoutes = require('./routes/auth');
    app.use('/api/auth', authRoutes);
    console.log('✅ Auth routes loaded');
} catch (error) {
    console.log('⚠️ Auth routes failed:', error.message);
}

try {
    const blogRoutes = require('./routes/blog');
    app.use('/api/blog', blogRoutes);
    console.log('✅ Blog routes loaded');
} catch (error) {
    console.log('⚠️ Blog routes failed:', error.message);
}

try {
    const adminRoutes = require('./routes/admin');
    app.use('/api/admin', adminRoutes);
    console.log('✅ Admin routes loaded');
} catch (error) {
    console.log('⚠️ Admin routes failed:', error.message);
}

try {
    const sermonRoutes = require('./routes/sermons');
    app.use('/api/sermons', sermonRoutes);
    console.log('✅ Sermon routes loaded');
} catch (error) {
    console.log('⚠️ Sermon routes failed:', error.message);
}

try {
    const settingsRoutes = require('./routes/settings');
    app.use('/api/settings', settingsRoutes);
    console.log('✅ Settings routes loaded');
} catch (error) {
    console.log('⚠️ Settings routes failed:', error.message);
}

// 404 handler with detailed info
app.use((req, res) => {
    console.log('❌ 404 - Route not found:', req.method, req.url);
    
    if (req.url.endsWith('.html') || req.url === '/') {
        // For HTML requests, send a simple HTML response
        res.status(404).send(`
            <h1>Page Not Found</h1>
            <p>Could not find: ${req.url}</p>
            <p>Try: <a href="/">Homepage</a> | <a href="/admin.html">Admin</a> | <a href="/blog.html">Blog</a></p>
        `);
    } else {
        // For API requests, send JSON
        res.status(404).json({ 
            error: 'Route not found', 
            path: req.url, 
            method: req.method 
        });
    }
});

// Error handler
app.use((error, req, res, next) => {
    console.error('💥 Server error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
});

app.listen(PORT, () => {
    console.log(`🚀 RCCG Graceland Website server running on http://localhost:${PORT}`);
    console.log(`📄 Main site: http://localhost:${PORT}`);
    console.log(`📖 Blog: http://localhost:${PORT}/blog.html`);
    console.log(`⚙️ Admin: http://localhost:${PORT}/admin.html`);
    console.log(`💚 Health: http://localhost:${PORT}/api/health`);
    console.log(`🎨 CSS: http://localhost:${PORT}/styles.css`);
    console.log('✅ Server started successfully!');
});

module.exports = app;
