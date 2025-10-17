// Database diagnostic script
const { db, testConnection } = require('./database/db-manager');

async function diagnoseDatabase() {
    console.log('🔍 Database Diagnostic Report');
    console.log('========================================');
    
    try {
        // Test basic connection
        console.log('1. Testing connection...');
        const connected = await testConnection();
        console.log(`   Connection: ${connected ? '✅ Success' : '❌ Failed'}`);
        
        if (!connected) {
            console.log('❌ Cannot proceed - database not connected');
            return;
        }

        // Check if tables exist
        console.log('\n2. Checking tables...');
        try {
            const tables = await db.all('SHOW TABLES');
            console.log(`   Found ${tables.length} tables:`);
            tables.forEach(table => {
                const tableName = Object.values(table)[0];
                console.log(`   - ${tableName}`);
            });
            
            if (tables.length === 0) {
                console.log('⚠️ No tables found - database needs initialization');
                return;
            }
        } catch (error) {
            console.log(`   ❌ Error checking tables: ${error.message}`);
            return;
        }

        // Test each required table
        console.log('\n3. Testing table structure...');
        const requiredTables = ['users', 'blog_posts', 'categories', 'sermons', 'settings'];
        
        for (const tableName of requiredTables) {
            try {
                const result = await db.all(`SELECT COUNT(*) as count FROM ${tableName} LIMIT 1`);
                const count = result[0].count;
                console.log(`   ${tableName}: ✅ ${count} records`);
            } catch (error) {
                console.log(`   ${tableName}: ❌ ${error.message}`);
            }
        }

        // Test model operations
        console.log('\n4. Testing models...');
        
        try {
            const User = require('./database/models/User');
            const users = await User.getByCredentials('admin');
            console.log(`   User model: ${users ? '✅' : '⚠️'} Admin user ${users ? 'found' : 'not found'}`);
        } catch (error) {
            console.log(`   User model: ❌ ${error.message}`);
        }

        try {
            const BlogPost = require('./database/models/BlogPost');
            const posts = await BlogPost.getAll({ limit: 1 });
            console.log(`   BlogPost model: ✅ Working (${posts.length} posts)`);
        } catch (error) {
            console.log(`   BlogPost model: ❌ ${error.message}`);
        }

        try {
            const Category = require('./database/models/Category');
            const categories = await Category.getAll();
            console.log(`   Category model: ✅ Working (${categories.length} categories)`);
        } catch (error) {
            console.log(`   Category model: ❌ ${error.message}`);
        }

        try {
            const Sermon = require('./database/models/Sermon');
            const sermons = await Sermon.getAll({ limit: 1 });
            console.log(`   Sermon model: ✅ Working (${sermons.length} sermons)`);
        } catch (error) {
            console.log(`   Sermon model: ❌ ${error.message}`);
        }

        console.log('\n========================================');
        console.log('✅ Database diagnostic complete');
        
    } catch (error) {
        console.log(`\n❌ Diagnostic failed: ${error.message}`);
    }
}

diagnoseDatabase().then(() => {
    console.log('\n💡 If there are issues:');
    console.log('   1. Make sure MySQL server is running');
    console.log('   2. Run: npm run init-db');
    console.log('   3. Check database credentials in .env');
    process.exit(0);
}).catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
});
