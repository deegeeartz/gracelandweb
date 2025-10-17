const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'graceland.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Enable foreign key constraints
db.run('PRAGMA foreign_keys = ON');

// Create tables
const createTables = () => {
    // Users table for admin authentication
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Categories table
    db.run(`CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Blog posts table
    db.run(`CREATE TABLE IF NOT EXISTS blog_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        featured_image TEXT,
        author_id INTEGER,
        category_id INTEGER,
        status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
        published_at DATETIME,
        views INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users (id),
        FOREIGN KEY (category_id) REFERENCES categories (id)
    )`);

    // Sermons table
    db.run(`CREATE TABLE IF NOT EXISTS sermons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        speaker TEXT NOT NULL,
        series TEXT,
        audio_url TEXT,
        video_url TEXT,
        featured_image TEXT,
        scripture_reference TEXT,
        sermon_date DATE,
        duration INTEGER, -- in minutes
        listens INTEGER DEFAULT 0,
        downloads INTEGER DEFAULT 0,
        status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Comments table
    db.run(`CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        comment TEXT NOT NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES blog_posts (id) ON DELETE CASCADE
    )`);

    // Social media posts table
    db.run(`CREATE TABLE IF NOT EXISTS social_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER,
        sermon_id INTEGER,
        platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'twitter')),
        social_post_id TEXT,
        message TEXT,
        scheduled_at DATETIME,
        posted_at DATETIME,
        status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'posted', 'failed')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES blog_posts (id) ON DELETE CASCADE,
        FOREIGN KEY (sermon_id) REFERENCES sermons (id) ON DELETE CASCADE
    )`);

    // Settings table
    db.run(`CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT,
        type TEXT DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'json')),
        description TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Analytics table for tracking
    db.run(`CREATE TABLE IF NOT EXISTS analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content_type TEXT NOT NULL CHECK (content_type IN ('blog_post', 'sermon')),
        content_id INTEGER NOT NULL,
        event_type TEXT NOT NULL CHECK (event_type IN ('view', 'like', 'share', 'download')),
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    console.log('Database tables created successfully');
};

// Insert sample data
const insertSampleData = () => {
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

    const categoryStmt = db.prepare(`INSERT OR IGNORE INTO categories (name, slug, description) VALUES (?, ?, ?)`);
    categories.forEach(category => {
        categoryStmt.run(category);
    });
    categoryStmt.finalize();

    // Insert default admin user (password: admin123)
    const bcrypt = require('bcryptjs');
    const defaultPassword = bcrypt.hashSync('admin123', 10);
    
    db.run(`INSERT OR IGNORE INTO users (username, email, password_hash, role) 
            VALUES (?, ?, ?, ?)`, 
            ['admin', 'admin@graceland.com', defaultPassword, 'admin']);

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

    const settingsStmt = db.prepare(`INSERT OR IGNORE INTO settings (key, value, type, description) VALUES (?, ?, ?, ?)`);
    settings.forEach(setting => {
        settingsStmt.run(setting);
    });
    settingsStmt.finalize();

    console.log('Sample data inserted successfully');
};

// Initialize database
const initDatabase = () => {
    createTables();
    
    // Wait a bit for tables to be created, then insert sample data
    setTimeout(() => {
        insertSampleData();
        console.log('Database initialization complete!');
        
        // Close the database connection if this script is run directly
        if (require.main === module) {
            db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err.message);
                } else {
                    console.log('Database connection closed.');
                }
            });
        }
    }, 1000);
};

// Export database connection and init function
module.exports = {
    db,
    initDatabase
};

// Run initialization if this file is executed directly
if (require.main === module) {
    initDatabase();
}
