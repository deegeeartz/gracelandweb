// Railway Database Reset Endpoint
// Access: POST /api/admin/reset-database (with auth token)

const express = require('express');
const router = express.Router();
const { pool } = require('../database/init-mysql');
const bcrypt = require('bcryptjs');

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
    const connection = await pool.getConnection();
    try {
        console.log('🔄 Starting database reset...');
        
        // Step 1: Drop all tables
        console.log('🗑️  Dropping existing tables...');
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
        
        const tablesToDrop = [
            'social_posts', 'comments', 'event_rsvps', 'events', 
            'prayer_requests', 'members', 'house_fellowships', 'gallery',
            'analytics', 'settings', 'blog_posts', 'sermons', 'categories', 'users'
        ];
        
        for (const table of tablesToDrop) {
            await connection.execute(`DROP TABLE IF EXISTS ${table}`);
        }
        
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
        
        // Step 2: Call initDatabase's createTables and insertSampleData logic manually
        // Users table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('admin', 'editor') DEFAULT 'admin',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_username (username),
                INDEX idx_email (email)
            ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        `);

        // Categories table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                slug VARCHAR(100) UNIQUE NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_slug (slug)
            ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        `);
        
        // Blog posts table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS blog_posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                slug VARCHAR(255) UNIQUE NOT NULL,
                excerpt TEXT,
                content LONGTEXT NOT NULL,
                featured_image VARCHAR(500),
                image_public_id VARCHAR(255) NULL,
                image_urls JSON NULL,
                author_id INT,
                category_id INT,
                status ENUM('draft', 'published', 'scheduled') DEFAULT 'draft',
                published_at TIMESTAMP NULL,
                views INT DEFAULT 0,
                likes INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
                INDEX idx_slug (slug),
                INDEX idx_status (status),
                INDEX idx_published_at (published_at),
                INDEX idx_category_id (category_id),
                INDEX idx_image_public_id (image_public_id),
                FULLTEXT(title, excerpt, content)
            ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        `);

        // Sermons table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS sermons (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                slug VARCHAR(255) UNIQUE NOT NULL,
                description TEXT,
                speaker VARCHAR(100) NOT NULL,
                series VARCHAR(100),
                audio_url VARCHAR(500),
                video_url VARCHAR(500),
                featured_image VARCHAR(500),
                scripture_reference VARCHAR(200),
                sermon_date DATE,
                duration INT COMMENT 'Duration in minutes',
                listens INT DEFAULT 0,
                downloads INT DEFAULT 0,
                status ENUM('draft', 'published') DEFAULT 'published',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_slug (slug),
                INDEX idx_status (status),
                INDEX idx_sermon_date (sermon_date),
                INDEX idx_speaker (speaker),
                INDEX idx_series (series),
                FULLTEXT(title, description, speaker)
            ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        `);

        // Comments table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS comments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                post_id INT NOT NULL,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                comment TEXT NOT NULL,
                status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
                INDEX idx_post_id (post_id),
                INDEX idx_status (status)
            ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        `);

        // Social media posts table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS social_posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                post_id INT,
                sermon_id INT,
                platform ENUM('facebook', 'instagram', 'twitter') NOT NULL,
                social_post_id VARCHAR(100),
                message TEXT,
                scheduled_at TIMESTAMP NULL,
                posted_at TIMESTAMP NULL,
                status ENUM('scheduled', 'posted', 'failed') DEFAULT 'scheduled',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
                FOREIGN KEY (sermon_id) REFERENCES sermons(id) ON DELETE CASCADE,
                INDEX idx_platform (platform),
                INDEX idx_status (status)
            ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        `);

        // Settings table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                \`key\` VARCHAR(100) UNIQUE NOT NULL,
                value TEXT,
                type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
                description TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_key (\`key\`)
            ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        `);

        // Analytics table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS analytics (
                id INT AUTO_INCREMENT PRIMARY KEY,
                content_type ENUM('blog_post', 'sermon') NOT NULL,
                content_id INT NOT NULL,
                event_type ENUM('view', 'like', 'share', 'download') NOT NULL,
                ip_address VARCHAR(45),
                user_agent TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_content (content_type, content_id),
                INDEX idx_event_type (event_type),
                INDEX idx_created_at (created_at)
            ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        `);

        // Events table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS events (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                start_time DATETIME NOT NULL,
                end_time DATETIME NOT NULL,
                location VARCHAR(255),
                image_url VARCHAR(500),
                status ENUM('draft', 'published', 'cancelled') DEFAULT 'published',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_start_time (start_time),
                INDEX idx_status (status)
            ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        `);

        // Event RSVPs table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS event_rsvps (
                id INT AUTO_INCREMENT PRIMARY KEY,
                event_id INT NOT NULL,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                phone VARCHAR(50),
                status ENUM('attending', 'maybe', 'declined') DEFAULT 'attending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
                INDEX idx_event_id (event_id)
            ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        `);

        // Prayer Requests table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS prayer_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100),
                phone VARCHAR(50),
                request_text TEXT NOT NULL,
                is_public BOOLEAN DEFAULT FALSE,
                status ENUM('pending', 'approved', 'prayed', 'answered') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_status (status),
                INDEX idx_is_public (is_public)
            ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        `);

        // Members table (Connect Cards / Directory)
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS members (
                id INT AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(100),
                phone VARCHAR(50),
                address TEXT,
                joined_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        `);

        // House Fellowships table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS house_fellowships (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                leader_name VARCHAR(100) NOT NULL,
                address TEXT NOT NULL,
                meeting_time VARCHAR(100),
                phone VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        `);

        // Gallery table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS gallery (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                image_url VARCHAR(500) NOT NULL,
                image_public_id VARCHAR(255),
                category VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_category (category)
            ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        `);

        // Insert sample data
        const categories = [
            ['Spiritual Growth', 'spiritual-growth', 'Posts about growing in faith and spiritual maturity'],
            ['Testimony', 'testimony', 'Personal testimonies of God\\'s goodness and faithfulness'],
            ['Ministry', 'ministry', 'Ministry updates and church activities'],
            ['Family', 'family', 'Biblical principles for family life'],
            ['Prayer', 'prayer', 'Teaching and resources about prayer'],
            ['Youth', 'youth', 'Content specifically for young people'],
            ['Worship', 'worship', 'Resources about worship and praise']
        ];

        for (const [name, slug, description] of categories) {
            await connection.execute(
                'INSERT IGNORE INTO categories (name, slug, description) VALUES (?, ?, ?)',
                [name, slug, description]
            );
        }

        const defaultPassword = await bcrypt.hash('admin123', 10);
        await connection.execute(
            'INSERT IGNORE INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
            ['admin', 'admin@graceland.com', defaultPassword, 'admin']
        );
        
        const settings = [
            ['site_name', 'RCCG Graceland Area HQ', 'string', 'Website name'],
            ['site_description', 'Experiencing An Overflow Of His Grace', 'string', 'Website description'],
            ['facebook_page', '', 'string', 'Facebook page URL'],
            ['instagram_handle', '', 'string', 'Instagram handle'],
            ['twitter_handle', '', 'string', 'Twitter handle'],
            ['contact_email', 'info@graceland.com', 'string', 'Contact email address'],
            ['contact_phone', '', 'string', 'Contact phone number'],
            ['church_address', 'Apapa, Lagos, Nigeria', 'string', 'Church address']
        ];

        for (const [key, value, type, description] of settings) {
            await connection.execute(
                'INSERT IGNORE INTO settings (`key`, value, type, description) VALUES (?, ?, ?, ?)',
                [key, value, type, description]
            );
        }
        
        res.json({
            success: true,
            message: 'Database reset completed successfully!'
        });
        
    } catch (error) {
        console.error('❌ Database reset failed:', error);
        res.status(500).json({
            success: false,
            error: 'Database reset failed',
            message: error.message
        });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;
