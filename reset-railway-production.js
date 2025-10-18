// Reset Railway Production Database
// This script uses the PUBLIC Railway MySQL URL for remote access

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

// Get Railway PUBLIC connection URL from environment
// You need to add this to .env: MYSQL_PUBLIC_URL=mysql://root:password@host:port/railway
const RAILWAY_URL = process.env.MYSQL_PUBLIC_URL;

if (!RAILWAY_URL) {
    console.error('\n❌ Error: MYSQL_PUBLIC_URL not found in .env file\n');
    console.log('To get your Railway MySQL public URL:');
    console.log('1. Go to Railway dashboard → MySQL service');
    console.log('2. Click "Variables" tab');
    console.log('3. Look for "MYSQL_URL" (without _PRIVATE suffix)');
    console.log('4. Copy the URL: mysql://root:xxxxx@xxxxx.railway.app:3306/railway');
    console.log('5. Add to .env: MYSQL_PUBLIC_URL=<your-url>\n');
    process.exit(1);
}

console.log('✅ Found Railway public URL');
console.log('🔗 Connecting to:', RAILWAY_URL.replace(/:[^:@]*@/, ':****@')); // Hide password

async function resetRailwayDatabase() {
    let connection;
    
    try {
        // Create connection
        connection = await mysql.createConnection(RAILWAY_URL);
        console.log('✅ Connected to Railway MySQL\n');
        
        // Drop tables
        console.log('🗑️  Dropping all tables...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        await connection.query('DROP TABLE IF EXISTS blog_posts');
        await connection.query('DROP TABLE IF EXISTS categories');
        await connection.query('DROP TABLE IF EXISTS authors');
        await connection.query('DROP TABLE IF EXISTS users');
        await connection.query('DROP TABLE IF EXISTS sermons');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✅ Tables dropped\n');
        
        // Create tables        console.log('👤 Creating users table...');
        await connection.query(`
            CREATE TABLE users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                role ENUM('admin', 'editor', 'viewer') DEFAULT 'viewer',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('✍️  Creating authors table...');
        await connection.query(`
            CREATE TABLE authors (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100),
                bio TEXT,
                avatar_url VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('📁 Creating categories table...');
        await connection.query(`
            CREATE TABLE categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                slug VARCHAR(100) UNIQUE NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('📝 Creating blog_posts table with Cloudinary support...');
        await connection.query(`
            CREATE TABLE blog_posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                slug VARCHAR(255) UNIQUE NOT NULL,
                excerpt TEXT,
                content LONGTEXT NOT NULL,
                featured_image VARCHAR(500),
                image_public_id VARCHAR(255),
                image_urls JSON,
                author_id INT DEFAULT 1,
                category_id INT DEFAULT 1,
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
                INDEX idx_published_at (published_at),                INDEX idx_image_public_id (image_public_id)
            )
        `);
        
        console.log('🎤 Creating sermons table...');
        await connection.query(`
            CREATE TABLE sermons (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                slug VARCHAR(255) UNIQUE NOT NULL,
                description TEXT,
                sermon_date DATE NOT NULL,
                speaker VARCHAR(100),
                audio_url VARCHAR(500),
                video_url VARCHAR(500),
                scripture_reference VARCHAR(200),
                category VARCHAR(100),
                status ENUM('draft', 'published') DEFAULT 'draft',
                views INT DEFAULT 0,
                downloads INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_slug (slug),
                INDEX idx_status (status),
                INDEX idx_sermon_date (sermon_date)
            )
        `);
        console.log('✅ All tables created\n');
          // Insert default data
        console.log('👨‍💼 Creating admin user...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await connection.query(
            'INSERT INTO users (username, password_hash, email, role) VALUES (?, ?, ?, ?)',
            ['admin', hashedPassword, 'admin@rccggraceland.org', 'admin']
        );
        
        console.log('✍️  Creating default author...');
        await connection.query(
            'INSERT INTO authors (name, email, bio) VALUES (?, ?, ?)',
            ['RCCG Graceland', 'info@rccggraceland.org', 'RCCG Graceland Area HQ - Apapa Family, Lagos, Nigeria.']
        );
        
        console.log('📁 Creating default categories...');
        const categories = [
            ['Sermon', 'sermon', 'Sunday sermons and biblical teachings'],
            ['Testimony', 'testimony', 'Member testimonies and faith stories'],
            ['Prayer', 'prayer', 'Prayer requests and answered prayers'],
            ['Family', 'family', 'Family life and relationships'],
            ['Youth', 'youth', 'Youth ministry updates and events'],
            ['Worship', 'worship', 'Worship experiences and praise reports'],
            ['Announcement', 'announcement', 'Church announcements and news'],
            ['Event', 'event', 'Upcoming church events and programs']
        ];
        
        for (const [name, slug, description] of categories) {
            await connection.query(
                'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
                [name, slug, description]
            );
        }
        
        console.log('\n✅ ========================================');
        console.log('✅  RAILWAY DATABASE RESET COMPLETE!');
        console.log('✅ ========================================\n');
        console.log('🎉 Production database is ready!\n');
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Connection closed\n');
        }
    }
}

console.log('\n========================================');
console.log('  RAILWAY PRODUCTION DATABASE RESET');
console.log('========================================\n');
console.log('⚠️  WARNING: This resets your PRODUCTION database!\n');
console.log('Press Ctrl+C to cancel, or wait 5 seconds...\n');

setTimeout(() => {
    resetRailwayDatabase().catch(console.error);
}, 5000);
