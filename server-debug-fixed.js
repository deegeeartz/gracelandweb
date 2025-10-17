// Simple server with database debugging
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting RCCG Graceland server with database debugging...');
console.log('Environment variables:');
console.log('- DB_HOST:', process.env.DB_HOST);
console.log('- DB_PORT:', process.env.DB_PORT);
console.log('- DB_USER:', process.env.DB_USER);
console.log('- DB_PASSWORD:', process.env.DB_PASSWORD ? '***SET***' : 'NOT SET');
console.log('- DB_NAME:', process.env.DB_NAME);

// Basic middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(__dirname));

// Health check endpoint
app.get('/api/health', (req, res) => {
    console.log('💚 Health check requested');
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        server: 'RCCG Graceland Website (Debug Mode)',
        env: {
            DB_HOST: process.env.DB_HOST,
            DB_NAME: process.env.DB_NAME,
            DB_USER: process.env.DB_USER,
            hasPassword: !!process.env.DB_PASSWORD
        }
    });
});

// Database test endpoint
app.get('/api/test-db', async (req, res) => {
    console.log('🔍 Database test requested');
    try {
        const { db, testConnection } = require('./database/db-manager');
        
        console.log('Testing database connection...');
        const connected = await testConnection();
        
        if (!connected) {
            throw new Error('Database connection failed');
        }
        
        console.log('Testing table query...');
        const tables = await db.all('SHOW TABLES');
        
        console.log('Testing user query...');
        const users = await db.all('SELECT id, username, email FROM users LIMIT 1');
        
        res.json({
            status: 'Database OK',
            connected: true,
            tables: tables.length,
            sampleUser: users[0] || null
        });
        
    } catch (error) {
        console.error('❌ Database test failed:', error);
        res.status(500).json({
            status: 'Database Error',
            error: error.message,
            stack: error.stack
        });
    }
});

// Test admin stats endpoint with detailed logging
app.get('/api/admin/stats', async (req, res) => {
    console.log('📊 Admin stats requested');
    try {
        console.log('Loading BlogPost model...');
        const BlogPost = require('./database/models/BlogPost');
        
        console.log('Calling BlogPost.getAll...');
        const allPosts = await BlogPost.getAll({ status: null, limit: 10 });
        console.log('BlogPost.getAll result:', allPosts.length, 'posts');
        
        console.log('Loading Sermon model...');
        const Sermon = require('./database/models/Sermon');
        
        console.log('Calling Sermon.getAll...');
        const allSermons = await Sermon.getAll({ limit: 10 });
        console.log('Sermon.getAll result:', allSermons.length, 'sermons');
        
        res.json({
            totalPosts: allPosts.length,
            totalSermons: allSermons.length,
            status: 'Stats loaded successfully'
        });
        
    } catch (error) {
        console.error('❌ Admin stats failed:', error);
        res.status(500).json({
            error: 'Failed to load stats',
            message: error.message,
            stack: error.stack
        });
    }
});

// Load auth routes safely
try {
    const authRoutes = require('./routes/auth');
    app.use('/api/auth', authRoutes);
    console.log('✅ Auth routes loaded');
} catch (error) {
    console.log('⚠️ Auth routes failed:', error.message);
}

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/admin-test.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-test.html'));
});

// 404 handler
app.use((req, res) => {
    console.log('❌ 404 - Route not found:', req.method, req.url);
    res.status(404).json({ 
        error: 'Route not found', 
        path: req.url, 
        method: req.method 
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('💥 Server error:', error);
    res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message,
        stack: error.stack
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Debug server running on http://localhost:${PORT}`);
    console.log(`🔧 Test endpoints:`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
    console.log(`   DB Test: http://localhost:${PORT}/api/test-db`);
    console.log(`   Admin Stats: http://localhost:${PORT}/api/admin/stats`);
    console.log(`   Admin Test: http://localhost:${PORT}/admin-test.html`);
    console.log('✅ Server started successfully!');
});

module.exports = app;
