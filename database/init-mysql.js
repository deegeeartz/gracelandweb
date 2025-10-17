const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'graceland_church',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ MySQL connection failed:', error.message);
        return false;
    }
}

// Create database if it doesn't exist
async function createDatabase() {
    try {
        const tempConfig = { ...dbConfig };
        delete tempConfig.database;
        
        const tempPool = mysql.createPool(tempConfig);
        const connection = await tempPool.getConnection();
        
        await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`✅ Database '${dbConfig.database}' created/verified`);
        
        connection.release();
        tempPool.end();
    } catch (error) {
        console.error('❌ Error creating database:', error.message);
        throw error;
    }
}

// Create tables
async function createTables() {
    const connection = await pool.getConnection();
    
    try {
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

        console.log('✅ All tables created successfully');
        
    } catch (error) {
        console.error('❌ Error creating tables:', error);
        throw error;
    } finally {
        connection.release();
    }
}

// Insert sample data
async function insertSampleData() {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        // Insert categories
        const categories = [
            ['Spiritual Growth', 'spiritual-growth', 'Posts about growing in faith and spiritual maturity'],
            ['Testimony', 'testimony', 'Personal testimonies of God\'s goodness and faithfulness'],
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

        // Insert default admin user (password: admin123)
        const defaultPassword = await bcrypt.hash('admin123', 10);
        await connection.execute(
            'INSERT IGNORE INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
            ['admin', 'admin@graceland.com', defaultPassword, 'admin']
        );

        // Insert sample settings
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

        await connection.commit();
        console.log('✅ Sample data inserted successfully');

    } catch (error) {
        await connection.rollback();
        console.error('❌ Error inserting sample data:', error);
        throw error;
    } finally {
        connection.release();
    }
}

// Initialize database
async function initDatabase() {
    try {
        console.log('🚀 Initializing MySQL database...');
        
        await createDatabase();
        await testConnection();
        await createTables();
        await insertSampleData();
        
        console.log('✅ Database initialization complete!');
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    }
}

// Export pool and functions
module.exports = {
    pool,
    initDatabase,
    testConnection
};

// Run initialization if this file is executed directly
if (require.main === module) {
    initDatabase().then(() => {
        console.log('🎉 Setup complete! You can now start your server.');
        process.exit(0);
    }).catch(error => {
        console.error('💥 Setup failed:', error);
        process.exit(1);
    });
}
