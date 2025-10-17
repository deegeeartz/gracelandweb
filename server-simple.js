require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting RCCG Graceland Website server...');

// Basic middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve HTML files
app.get('/', (req, res) => {
    console.log('📄 Serving index.html');
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/blog', (req, res) => {
    console.log('📖 Serving blog.html');
    res.sendFile(path.join(__dirname, 'blog.html'));
});

app.get('/admin', (req, res) => {
    console.log('⚙️ Serving admin.html');
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/blog.html', (req, res) => {
    console.log('📖 Serving blog.html direct');
    res.sendFile(path.join(__dirname, 'blog.html'));
});

app.get('/admin.html', (req, res) => {
    console.log('⚙️ Serving admin.html direct');
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Health check
app.get('/api/health', (req, res) => {
    console.log('💚 Health check requested');
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        server: 'RCCG Graceland Website (Simple Mode)'
    });
});

// Import and use routes only if they exist
try {
    const authRoutes = require('./routes/auth');
    app.use('/api/auth', authRoutes);
    console.log('✅ Auth routes loaded');
} catch (error) {
    console.log('⚠️ Auth routes failed to load:', error.message);
}

try {
    const blogRoutes = require('./routes/blog');
    app.use('/api/blog', blogRoutes);
    console.log('✅ Blog routes loaded');
} catch (error) {
    console.log('⚠️ Blog routes failed to load:', error.message);
}

try {
    const adminRoutes = require('./routes/admin');
    app.use('/api/admin', adminRoutes);
    console.log('✅ Admin routes loaded');
} catch (error) {
    console.log('⚠️ Admin routes failed to load:', error.message);
}

try {
    const settingsRoutes = require('./routes/settings');
    app.use('/api/settings', settingsRoutes);
    console.log('✅ Settings routes loaded');
} catch (error) {
    console.log('⚠️ Settings routes failed to load:', error.message);
}

try {
    const sermonRoutes = require('./routes/sermons');
    app.use('/api/sermons', sermonRoutes);
    console.log('✅ Sermon routes loaded');
} catch (error) {
    console.log('⚠️ Sermon routes failed to load:', error.message);
}

// 404 handler
app.use((req, res) => {
    console.log('❌ 404 - Route not found:', req.method, req.url);
    res.status(404).json({ error: 'Route not found', path: req.url, method: req.method });
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
    console.log('✅ Server started successfully!');
});

module.exports = app;
