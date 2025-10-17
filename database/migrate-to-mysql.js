const sqlite3 = require('sqlite3').verbose();
const { pool } = require('./init-mysql');
const path = require('path');

async function migrateSQLiteToMySQL() {
    console.log('🔄 Starting migration from SQLite to MySQL...');
    
    // Check if SQLite database exists
    const sqliteDbPath = path.join(__dirname, 'graceland.db');
    const fs = require('fs');
    
    if (!fs.existsSync(sqliteDbPath)) {
        console.log('ℹ️  No SQLite database found. Skipping migration.');
        return;
    }

    const sqliteDb = new sqlite3.Database(sqliteDbPath);
    
    try {
        // Migrate Categories
        console.log('📂 Migrating categories...');
        const categories = await new Promise((resolve, reject) => {
            sqliteDb.all('SELECT * FROM categories', (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });

        for (const category of categories) {
            await pool.execute(
                'INSERT IGNORE INTO categories (id, name, slug, description, created_at) VALUES (?, ?, ?, ?, ?)',
                [category.id, category.name, category.slug, category.description, category.created_at]
            );
        }
        console.log(`✅ Migrated ${categories.length} categories`);

        // Migrate Users
        console.log('👤 Migrating users...');
        const users = await new Promise((resolve, reject) => {
            sqliteDb.all('SELECT * FROM users', (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });

        for (const user of users) {
            await pool.execute(
                'INSERT IGNORE INTO users (id, username, email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [user.id, user.username, user.email, user.password_hash, user.role, user.created_at, user.updated_at]
            );
        }
        console.log(`✅ Migrated ${users.length} users`);

        // Migrate Blog Posts
        console.log('📝 Migrating blog posts...');
        const posts = await new Promise((resolve, reject) => {
            sqliteDb.all('SELECT * FROM blog_posts', (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });

        for (const post of posts) {
            await pool.execute(
                `INSERT IGNORE INTO blog_posts (
                    id, title, slug, excerpt, content, featured_image, 
                    author_id, category_id, status, published_at, views, likes,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    post.id, post.title, post.slug, post.excerpt, post.content, 
                    post.featured_image, post.author_id, post.category_id, 
                    post.status, post.published_at, post.views || 0, post.likes || 0,
                    post.created_at, post.updated_at
                ]
            );
        }
        console.log(`✅ Migrated ${posts.length} blog posts`);

        // Migrate Sermons
        console.log('🎤 Migrating sermons...');
        const sermons = await new Promise((resolve, reject) => {
            sqliteDb.all('SELECT * FROM sermons', (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });

        for (const sermon of sermons) {
            await pool.execute(
                `INSERT IGNORE INTO sermons (
                    id, title, slug, description, speaker, series, audio_url,
                    video_url, featured_image, scripture_reference, sermon_date,
                    duration, listens, downloads, status, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    sermon.id, sermon.title, sermon.slug, sermon.description,
                    sermon.speaker, sermon.series, sermon.audio_url, sermon.video_url,
                    sermon.featured_image, sermon.scripture_reference, sermon.sermon_date,
                    sermon.duration, sermon.listens || 0, sermon.downloads || 0,
                    sermon.status, sermon.created_at, sermon.updated_at
                ]
            );
        }
        console.log(`✅ Migrated ${sermons.length} sermons`);

        // Migrate Settings
        console.log('⚙️ Migrating settings...');
        const settings = await new Promise((resolve, reject) => {
            sqliteDb.all('SELECT * FROM settings', (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });

        for (const setting of settings) {
            await pool.execute(
                'INSERT IGNORE INTO settings (id, `key`, value, type, description, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
                [setting.id, setting.key, setting.value, setting.type, setting.description, setting.updated_at]
            );
        }
        console.log(`✅ Migrated ${settings.length} settings`);

        console.log('🎉 Migration completed successfully!');
        
        // Backup SQLite database
        const backupPath = path.join(__dirname, `graceland_backup_${Date.now()}.db`);
        fs.copyFileSync(sqliteDbPath, backupPath);
        console.log(`💾 SQLite database backed up to: ${backupPath}`);
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        sqliteDb.close();
    }
}

// Run migration if this file is executed directly
if (require.main === module) {
    const { initDatabase } = require('./init-mysql');
    
    initDatabase()
        .then(() => migrateSQLiteToMySQL())
        .then(() => {
            console.log('✅ Migration process completed!');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 Migration failed:', error);
            process.exit(1);
        });
}

module.exports = { migrateSQLiteToMySQL };
