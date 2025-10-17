// Simple Railway database connection handler
require('dotenv').config();

// Check if we're on Railway
const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID;

console.log('Railway Environment Check:');
console.log('Is Railway:', !!isRailway);
console.log('Environment Variables:');
Object.keys(process.env).forEach(key => {
    if (key.includes('MYSQL') || key.includes('DATABASE') || key.includes('RAILWAY')) {
        console.log(`${key}:`, process.env[key] ? '[SET]' : '[NOT SET]');
    }
});

if (isRailway) {
    console.log('Running on Railway - checking for database service...');
    
    // Check if MySQL service is available
    const hasMySQL = process.env.MYSQLHOST && 
                     process.env.MYSQLUSER && 
                     process.env.MYSQLPASSWORD && 
                     process.env.MYSQLDATABASE;
    
    if (!hasMySQL) {
        console.log('❌ MySQL service not detected on Railway!');
        console.log('Please add a MySQL database service to your Railway project:');
        console.log('1. Go to Railway Dashboard');
        console.log('2. Click "New Service"');
        console.log('3. Select "Database" → "MySQL"');
        console.log('4. Wait for provisioning to complete');
        process.exit(1);
    } else {
        console.log('✅ MySQL service detected on Railway');
    }
}

module.exports = { isRailway };
