// Check users table structure
const { pool } = require('./database/db-manager');

async function checkUsers() {
    try {
        // Check table structure
        const [columns] = await pool.query('DESCRIBE users');
        console.log('\n📋 Users table columns:');
        columns.forEach(col => {
            console.log(`  - ${col.Field} (${col.Type})`);
        });
        
        // Check data
        const [users] = await pool.query('SELECT id, username, email, role, password FROM users');
        console.log('\n👥 Users in database:');
        users.forEach(user => {
            console.log(`  - ${user.username} (${user.role})`);
            console.log(`    Password field: ${user.password ? '✅ Set' : '❌ Missing'}`);
            console.log(`    Password length: ${user.password ? user.password.length : 0} chars`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkUsers();
