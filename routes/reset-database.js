// Railway Database Reset Endpoint
// This runs INSIDE Railway using private network (FREE!)
// Access: POST /api/admin/reset-database (with auth token)

const express = require('express');
const router = express.Router();
const { db } = require('../database/db-manager');
const bcrypt = require('bcrypt');

// Middleware to verify admin token
const verifyAdminToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    const adminToken = process.env.ADMIN_RESET_TOKEN || 'change-this-secret-token';
    
    if (token !== adminToken) {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    next();
};

// POST /api/admin/reset-database
// WARNING: This will DELETE ALL DATA!
router.post('/reset-database', verifyAdminToken, async (req, res) => {
    try {
        console.log('🔄 Starting database reset...');
        
        // Step 1: Drop all tables
        console.log('🗑️  Dropping existing tables...');
        await db.query('SET FOREIGN_KEY_CHECKS = 0');
        await db.query('DROP TABLE IF EXISTS blog_posts');
        await db.query('DROP TABLE IF EXISTS categories');
        await db.query('DROP TABLE IF EXISTS authors');
        await db.query('DROP TABLE IF EXISTS users');
        await db.query('SET FOREIGN_KEY_CHECKS = 1');
        
        // Step 2: Create users table
        console.log('👤 Creating users table...');
        await db.query(`
            CREATE TABLE users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                role ENUM('admin', 'editor', 'viewer') DEFAULT 'viewer',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Step 3: Create authors table
        console.log('✍️  Creating authors table...');
        await db.query(`
            CREATE TABLE authors (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100),
                bio TEXT,
                avatar_url VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Step 4: Create categories table
        console.log('📁 Creating categories table...');
        await db.query(`
            CREATE TABLE categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                slug VARCHAR(100) UNIQUE NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Step 5: Create blog_posts table with Cloudinary
        console.log('📝 Creating blog_posts table...');
        await db.query(`
            CREATE TABLE blog_posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                slug VARCHAR(255) UNIQUE NOT NULL,
                excerpt TEXT,
                content LONGTEXT NOT NULL,
                featured_image VARCHAR(500),
                image_public_id VARCHAR(255),
                image_urls JSON,
                author_id INT,
                category_id INT,
                status ENUM('draft', 'published', 'scheduled') DEFAULT 'draft',
                views INT DEFAULT 0,
                likes INT DEFAULT 0,
                published_at DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE SET NULL,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
                INDEX idx_slug (slug),
                INDEX idx_status (status),
                INDEX idx_published_at (published_at),
                INDEX idx_image_public_id (image_public_id)
            )
        `);
        
        // Step 6: Insert default admin (password: admin123)
        console.log('👨‍💼 Creating admin user...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await db.query(
            'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
            ['admin', hashedPassword, 'admin@rccggraceland.org', 'admin']
        );
        
        // Step 7: Insert default author
        console.log('✍️  Creating default author...');
        await db.query(
            'INSERT INTO authors (name, email, bio) VALUES (?, ?, ?)',
            ['RCCG Graceland', 'info@rccggraceland.org', 'RCCG Graceland Area HQ - Apapa Family']
        );
        
        // Step 8: Insert categories
        console.log('📁 Creating categories...');
        const categories = [
            ['Sermon', 'sermon', 'Sunday sermons and teachings'],
            ['Testimony', 'testimony', 'Member testimonies and stories'],
            ['Prayer', 'prayer', 'Prayer requests and updates'],
            ['Family', 'family', 'Family and relationships'],
            ['Youth', 'youth', 'Youth ministry updates'],
            ['Worship', 'worship', 'Worship and praise reports']
        ];
        
        for (const [name, slug, description] of categories) {
            await db.query(
                'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
                [name, slug, description]
            );
        }
        
        // Verify setup
        console.log('🔍 Verifying setup...');
        const [users] = await db.query('SELECT COUNT(*) as count FROM users');
        const [authors] = await db.query('SELECT COUNT(*) as count FROM authors');
        const [cats] = await db.query('SELECT COUNT(*) as count FROM categories');
        const [posts] = await db.query('SELECT COUNT(*) as count FROM blog_posts');
        
        const result = {
            success: true,
            message: 'Database reset completed successfully!',
            counts: {
                users: users[0].count,
                authors: authors[0].count,
                categories: cats[0].count,
                blog_posts: posts[0].count
            },
            credentials: {
                username: 'admin',
                password: 'admin123',
                note: 'Please change the password after first login!'
            }
        };
        
        console.log('✅ Database reset successful!');
        console.log('📊 Counts:', result.counts);
        
        res.json(result);
        
    } catch (error) {
        console.error('❌ Database reset failed:', error);
        res.status(500).json({
            success: false,
            error: 'Database reset failed',
            message: error.message
        });
    }
});

module.exports = router;
