// Add Cloudinary Columns to Railway Database
// Run this once to add the missing columns

require('dotenv').config();
const { db } = require('./database/db-manager');

async function addCloudinaryColumns() {
    console.log('🔧 Adding Cloudinary columns to blog_posts table...\n');
    
    try {
        // Check if columns already exist
        console.log('📋 Checking current table structure...');
        const [columns] = await db.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'blog_posts' 
            AND COLUMN_NAME IN ('image_public_id', 'image_urls')
        `, [process.env.MYSQLDATABASE || 'railway']);
        
        if (columns.length === 2) {
            console.log('✅ Cloudinary columns already exist!');
            console.log('   - image_public_id ✓');
            console.log('   - image_urls ✓\n');
            console.log('No changes needed. You can now create blog posts with Cloudinary images!');
            process.exit(0);
        }
        
        // Add missing columns
        console.log('📝 Adding missing columns...\n');
        
        if (columns.length === 0) {
            // Both columns missing
            console.log('Adding both columns...');
            await db.query(`
                ALTER TABLE blog_posts 
                ADD COLUMN image_public_id VARCHAR(255),
                ADD COLUMN image_urls JSON,
                ADD INDEX idx_image_public_id (image_public_id)
            `);
            console.log('✅ Added: image_public_id');
            console.log('✅ Added: image_urls');
            console.log('✅ Added: index on image_public_id\n');
        } else if (columns.find(c => c.COLUMN_NAME === 'image_public_id')) {
            // Only image_urls missing
            console.log('Adding image_urls column...');
            await db.query(`
                ALTER TABLE blog_posts 
                ADD COLUMN image_urls JSON
            `);
            console.log('✅ Added: image_urls\n');
        } else {
            // Only image_public_id missing
            console.log('Adding image_public_id column...');
            await db.query(`
                ALTER TABLE blog_posts 
                ADD COLUMN image_public_id VARCHAR(255),
                ADD INDEX idx_image_public_id (image_public_id)
            `);
            console.log('✅ Added: image_public_id');
            console.log('✅ Added: index\n');
        }
        
        // Verify the changes
        console.log('🔍 Verifying changes...');
        const [newColumns] = await db.query(`
            SELECT COLUMN_NAME, COLUMN_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'blog_posts' 
            AND COLUMN_NAME IN ('image_public_id', 'image_urls')
        `, [process.env.MYSQLDATABASE || 'railway']);
        
        console.log('\n📊 Current Cloudinary columns:');
        newColumns.forEach(col => {
            console.log(`   - ${col.COLUMN_NAME}: ${col.COLUMN_TYPE} ✓`);
        });
        
        console.log('\n✅ Success! Cloudinary columns added successfully!');
        console.log('\n🎉 You can now:');
        console.log('   1. Go to your admin panel');
        console.log('   2. Create a blog post with an image');
        console.log('   3. Image will upload to Cloudinary');
        console.log('   4. Only the Cloudinary URL is stored in database\n');
        
    } catch (error) {
        console.error('❌ Error adding Cloudinary columns:', error.message);
        console.error('\nFull error:', error);
        console.log('\n💡 Try running the SQL directly in Railway dashboard:');
        console.log('   ALTER TABLE blog_posts');
        console.log('   ADD COLUMN image_public_id VARCHAR(255),');
        console.log('   ADD COLUMN image_urls JSON;\n');
        process.exit(1);
    } finally {
        await db.end();
    }
}

// Run the function
addCloudinaryColumns();
