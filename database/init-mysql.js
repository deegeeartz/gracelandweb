const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Database configuration with Railway, TiDB, Aiven and Vercel support
const isRemoteHost = !['localhost', '127.0.0.1', 'db'].includes(process.env.MYSQLHOST || process.env.DB_HOST || 'localhost');
const useSsl = isRemoteHost && (process.env.NODE_ENV === 'production' || process.env.VERCEL || process.env.DB_SSL === 'true');

const dbConfig = {
    host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT || 3306),
    user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'graceland_church',
    waitForConnections: true,
    connectionLimit: process.env.VERCEL ? 3 : 10,
    queueLimit: 0,
    charset: 'utf8mb4',
    ssl: useSsl ? { rejectUnauthorized: false } : undefined
};

console.log('Database config:', {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database,
    ssl: !!dbConfig.ssl
});

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

// Create database if it doesn't exist (fails gracefully on managed cloud hosts)
async function createDatabase() {
    try {
        const tempConfig = { ...dbConfig };
        delete tempConfig.database;
        
        const tempPool = mysql.createPool(tempConfig);
        const connection = await tempPool.getConnection();
        
        await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`✅ Database '${dbConfig.database}' created/verified`);
        
        connection.release();
        await tempPool.end();
    } catch (error) {
        console.warn('⚠️ Note on database creation:', error.message);
        console.log(`ℹ️ Assuming database '${dbConfig.database}' already exists or user has restricted permissions.`);
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
        `);        // Blog posts table
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
                INDEX idx_image_public_id (image_public_id)
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
                INDEX idx_series (series)
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

        // Ministries table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS ministries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                image_url VARCHAR(500),
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
            ['hero_image', '', 'string', 'Homepage Hero Image URL'],
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

        // Insert default ministries
        const ministries = [
            ['Children\'s Ministry', 'Building strong foundations in Christ for our young ones', null],
            ['Choir Ministry', 'Worshiping God through music and song', null],
            ['Youth Ministry', 'Empowering young people for kingdom service', null],
            ['Ushering Ministry', 'Welcoming everyone with love and hospitality', null],
            ['Welfare Ministry', 'Demonstrating God\'s love through giving and care', null]
        ];

        for (const [name, description, image_url] of ministries) {
            // Check if it exists before inserting to avoid duplicates
            const [existing] = await connection.execute('SELECT id FROM ministries WHERE name = ?', [name]);
            if (existing.length === 0) {
                await connection.execute(
                    'INSERT INTO ministries (name, description, image_url) VALUES (?, ?, ?)',
                    [name, description, image_url]
                );
            }
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
        const connected = await testConnection();
        if (!connected) {
            throw new Error('Could not establish connection to MySQL database. Please verify host, port, credentials, and SSL settings.');
        }
        await createTables();
        await insertSampleData();
        
        console.log('✅ Database initialization complete!');
        return { success: true, message: 'Database initialized and tables created successfully' };
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
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
