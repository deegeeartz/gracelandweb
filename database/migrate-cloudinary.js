// Migration script to add Cloudinary columns to blog_posts table
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
    port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
    user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'graceland_church',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

async function migrateCloudinaryColumns() {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        console.log('🔧 Starting Cloudinary migration...');
        
        // Check if columns already exist
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'blog_posts' 
            AND COLUMN_NAME IN ('image_public_id', 'image_urls')
        `, [dbConfig.database]);
        
        if (columns.length === 2) {
            console.log('✅ Cloudinary columns already exist. Migration not needed.');
            return;
        }
        
        // Add image_public_id column if it doesn't exist
        if (!columns.find(c => c.COLUMN_NAME === 'image_public_id')) {
            await connection.execute(`
                ALTER TABLE blog_posts 
                ADD COLUMN image_public_id VARCHAR(255) NULL 
                AFTER featured_image
            `);
            console.log('✅ Added image_public_id column');
        }
        
        // Add image_urls column if it doesn't exist
        if (!columns.find(c => c.COLUMN_NAME === 'image_urls')) {
            await connection.execute(`
                ALTER TABLE blog_posts 
                ADD COLUMN image_urls JSON NULL 
                AFTER image_public_id
            `);
            console.log('✅ Added image_urls column');
        }
        
        // Add index for image_public_id
        try {
            await connection.execute(`
                CREATE INDEX idx_image_public_id ON blog_posts(image_public_id)
            `);
            console.log('✅ Added index for image_public_id');
        } catch (error) {
            if (!error.message.includes('Duplicate key name')) {
                throw error;
            }
            console.log('ℹ️  Index already exists');
        }
        
        console.log('🎉 Cloudinary migration completed successfully!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

// Run migration if called directly
if (require.main === module) {
    migrateCloudinaryColumns()
        .then(() => {
            console.log('✅ Done!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error:', error);
            process.exit(1);
        });
}

module.exports = { migrateCloudinaryColumns };
