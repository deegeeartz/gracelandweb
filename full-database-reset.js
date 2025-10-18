// Full Database Reset for Railway MySQL
// This connects using your existing db-manager and resets everything

const { db, pool } = require('./database/db-manager');
const bcrypt = require('bcrypt');

async function fullDatabaseReset() {
    console.log('🔄 Starting FULL database reset...\n');
    console.log('⚠️  This will DELETE ALL data!\n');
    
    try {        // Step 1: Drop all tables
        console.log('🗑️  Step 1: Dropping all existing tables...');
        await pool.query('SET FOREIGN_KEY_CHECKS = 0');
        await pool.query('DROP TABLE IF EXISTS blog_posts');
        await pool.query('DROP TABLE IF EXISTS categories');
        await pool.query('DROP TABLE IF EXISTS authors');
        await pool.query('DROP TABLE IF EXISTS users');
        await pool.query('DROP TABLE IF EXISTS sermons');
        await pool.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✅ All tables dropped\n');        // Step 2: Create users table
        console.log('👤 Step 2: Creating users table...');
        await pool.query(`
            CREATE TABLE users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                role ENUM('admin', 'editor', 'viewer') DEFAULT 'viewer',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Users table created\n');
        
        // Step 3: Create authors table
        console.log('✍️  Step 3: Creating authors table...');
        await pool.query(`
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
        await pool.query(`
            CREATE TABLE categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                slug VARCHAR(100) UNIQUE NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Categories table created\n');
        
        // Step 5: Create blog_posts table WITH Cloudinary support
        console.log('📝 Step 5: Creating blog_posts table (with Cloudinary)...');
        await pool.query(`
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
                INDEX idx_published_at (published_at),
                INDEX idx_image_public_id (image_public_id)
            )
        `);
        console.log('✅ Blog posts table created with Cloudinary columns\n');
        
        // Step 5.5: Create sermons table (optional feature)
        console.log('🎤 Step 5.5: Creating sermons table...');
        await pool.query(`
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
        console.log('✅ Sermons table created\n');
        
        // Step 6: Insert default admin user
        console.log('👨‍💼 Step 6: Creating default admin user...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await pool.query(
            'INSERT INTO users (username, password_hash, email, role) VALUES (?, ?, ?, ?)',
            ['admin', hashedPassword, 'admin@rccggraceland.org', 'admin']
        );
        console.log('✅ Admin user created (username: admin, password: admin123)\n');
        
        // Step 7: Insert default author
        console.log('✍️  Step 7: Creating default author...');
        await pool.query(
            'INSERT INTO authors (name, email, bio) VALUES (?, ?, ?)',
            ['RCCG Graceland', 'info@rccggraceland.org', 'RCCG Graceland Area HQ - Apapa Family, Lagos, Nigeria. Experiencing An Overflow Of His Grace.']
        );
        console.log('✅ Default author created\n');
        
        // Step 8: Insert default categories
        console.log('📁 Step 8: Creating default categories...');
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
            await pool.query(
                'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
                [name, slug, description]
            );
        }
        console.log('✅ 8 default categories created\n');
        
        // Verify setup
        console.log('🔍 Verifying database setup...');
        const [users] = await pool.query('SELECT COUNT(*) as count FROM users');
        const [authors] = await pool.query('SELECT COUNT(*) as count FROM authors');
        const [cats] = await pool.query('SELECT COUNT(*) as count FROM categories');
        const [posts] = await pool.query('SELECT COUNT(*) as count FROM blog_posts');
        
        console.log('\n📊 Database Status:');
        console.log(`   - Users: ${users[0].count}`);
        console.log(`   - Authors: ${authors[0].count}`);
        console.log(`   - Categories: ${cats[0].count}`);
        console.log(`   - Blog Posts: ${posts[0].count}\n`);
          // Show categories
        console.log('📋 Available Categories:');
        const [categoriesList] = await pool.query('SELECT id, name, slug FROM categories');
        categoriesList.forEach(cat => {
            console.log(`   ${cat.id}. ${cat.name} (${cat.slug})`);
        });
        
        console.log('\n✅ ========================================');
        console.log('✅  DATABASE RESET COMPLETED SUCCESSFULLY!');
        console.log('✅ ========================================\n');
        
        console.log('🎉 Your database is now ready to use!\n');
        console.log('📝 Next Steps:');
        console.log('   1. Go to: https://gracelandweb-production.up.railway.app/admin.html');
        console.log('   2. Login with:');
        console.log('      Username: admin');
        console.log('      Password: admin123');
        console.log('   3. Create your first blog post with Cloudinary image!');
        console.log('   4. Test blog navigation on GitHub Pages');
        console.log('   5. Deploy and celebrate! 🎊\n');
        
    } catch (error) {
        console.error('\n❌ Error resetting database:', error.message);
        console.error('\n📋 Full error:', error);
        console.log('\n💡 Troubleshooting:');
        console.log('   1. Make sure your Railway MySQL is running');
        console.log('   2. Check your .env has correct MYSQLHOST, MYSQLPORT, etc.');
        console.log('   3. Verify you can connect: node diagnose-db.js');
        console.log('   4. Check Railway logs for database errors\n');
        process.exit(1);    } finally {
        await pool.end();
        console.log('🔌 Database connection closed\n');
    }
}

// Run the reset
console.log('\n========================================');
console.log('  RCCG GRACELAND - DATABASE RESET');
console.log('========================================\n');
console.log('⚠️  WARNING: This will DELETE ALL data!');
console.log('   - All blog posts');
console.log('   - All users');
console.log('   - All categories');
console.log('   - All authors\n');
console.log('✅ Then create fresh tables with:');
console.log('   - Cloudinary support (image_public_id, image_urls)');
console.log('   - Default admin user (admin/admin123)');
console.log('   - Default categories (8 categories)');
console.log('   - Default author (RCCG Graceland)\n');
console.log('Press Ctrl+C now to cancel, or wait 5 seconds...\n');

// Give user 5 seconds to cancel
setTimeout(() => {
    fullDatabaseReset().catch(console.error);
}, 5000);
