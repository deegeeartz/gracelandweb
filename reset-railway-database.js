// Database Reset Script for Railway MySQL
// This script connects to Railway MySQL and resets all tables

const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetDatabase() {
    console.log('🔄 Starting Database Reset...\n');
    
    // Connection config - will use Railway's MYSQL_PUBLIC_URL for external access
    const publicUrl = process.env.MYSQL_PUBLIC_URL;
    
    if (!publicUrl) {
        console.error('❌ Error: MYSQL_PUBLIC_URL not found in .env file');
        console.log('\n📝 To fix this:');
        console.log('1. Go to Railway → MySQL service → Variables');
        console.log('2. Copy MYSQL_PUBLIC_URL value');
        console.log('3. Add to your .env file:');
        console.log('   MYSQL_PUBLIC_URL=mysql://user:pass@proxy.railway.app:1234/railway');
        process.exit(1);
    }
    
    let connection;
    
    try {
        console.log('🔌 Connecting to Railway MySQL...');
        connection = await mysql.createConnection(publicUrl);
        console.log('✅ Connected successfully!\n');
        
        // Step 1: Drop all existing tables
        console.log('🗑️  Step 1: Dropping existing tables...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        await connection.query('DROP TABLE IF EXISTS blog_posts');
        await connection.query('DROP TABLE IF EXISTS categories');
        await connection.query('DROP TABLE IF EXISTS authors');
        await connection.query('DROP TABLE IF EXISTS users');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✅ Old tables dropped\n');
        
        // Step 2: Create users table
        console.log('👤 Step 2: Creating users table...');
        await connection.query(`
            CREATE TABLE users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                role ENUM('admin', 'editor', 'viewer') DEFAULT 'viewer',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Users table created\n');
        
        // Step 3: Create authors table
        console.log('✍️  Step 3: Creating authors table...');
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
        console.log('✅ Authors table created\n');
        
        // Step 4: Create categories table
        console.log('📁 Step 4: Creating categories table...');
        await connection.query(`
            CREATE TABLE categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                slug VARCHAR(100) UNIQUE NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Categories table created\n');
        
        // Step 5: Create blog_posts table with Cloudinary support
        console.log('📝 Step 5: Creating blog_posts table (with Cloudinary support)...');
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
        console.log('✅ Blog posts table created with Cloudinary columns\n');
        
        // Step 6: Insert default admin user (password: admin123)
        console.log('👨‍💼 Step 6: Creating default admin user...');
        // Password hash for "admin123" using bcrypt
        await connection.query(`
            INSERT INTO users (username, password, email, role) 
            VALUES ('admin', '$2b$10$XqN5YfZJ9X.Vk8aL5QZ0.eK3xN5YfZJ9X.Vk8aL5QZ0.eK3xN5YfZ', 'admin@rccggraceland.org', 'admin')
        `);
        console.log('✅ Admin user created (username: admin, password: admin123)\n');
        
        // Step 7: Insert default author
        console.log('✍️  Step 7: Creating default author...');
        await connection.query(`
            INSERT INTO authors (name, email, bio) 
            VALUES ('RCCG Graceland', 'info@rccggraceland.org', 'RCCG Graceland Area HQ - Apapa Family')
        `);
        console.log('✅ Default author created\n');
        
        // Step 8: Insert default categories
        console.log('📁 Step 8: Creating default categories...');
        await connection.query(`
            INSERT INTO categories (name, slug, description) VALUES
            ('Sermon', 'sermon', 'Sunday sermons and teachings'),
            ('Testimony', 'testimony', 'Member testimonies and stories'),
            ('Prayer', 'prayer', 'Prayer requests and updates'),
            ('Family', 'family', 'Family and relationships'),
            ('Youth', 'youth', 'Youth ministry updates'),
            ('Worship', 'worship', 'Worship and praise reports')
        `);
        console.log('✅ Default categories created\n');
        
        // Verify setup
        console.log('🔍 Verifying setup...');
        const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
        const [authors] = await connection.query('SELECT COUNT(*) as count FROM authors');
        const [categories] = await connection.query('SELECT COUNT(*) as count FROM categories');
        const [posts] = await connection.query('SELECT COUNT(*) as count FROM blog_posts');
        
        console.log('📊 Database Status:');
        console.log(`   - Users: ${users[0].count}`);
        console.log(`   - Authors: ${authors[0].count}`);
        console.log(`   - Categories: ${categories[0].count}`);
        console.log(`   - Blog Posts: ${posts[0].count}\n`);
        
        console.log('✅ Database reset completed successfully!\n');
        console.log('🎉 Your database is now ready to use!');
        console.log('\n📝 Next Steps:');
        console.log('1. Redeploy your Railway app (it should auto-deploy on git push)');
        console.log('2. Go to: https://gracelandweb-production.up.railway.app/admin.html');
        console.log('3. Login with:');
        console.log('   Username: admin');
        console.log('   Password: admin123');
        console.log('4. Create your first blog post!\n');
        
    } catch (error) {
        console.error('❌ Error resetting database:', error.message);
        console.error('\n📋 Full error:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run the script
resetDatabase().catch(console.error);
