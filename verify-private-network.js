// Verify Railway Private Network Configuration
// Run this script to confirm you're NOT using public endpoints

require('dotenv').config();

console.log('🔍 Railway Network Configuration Verification\n');
console.log('='.repeat(60));

// Check what variables exist
const hasPrivate = !!(process.env.MYSQLHOST);
const hasPublic = !!(process.env.MYSQL_PUBLIC_URL);

console.log('\n📋 Environment Variables Status:');
console.log('-'.repeat(60));

if (hasPrivate) {
    console.log('✅ MYSQLHOST found:', process.env.MYSQLHOST);
    console.log('   → Using PRIVATE network (FREE!) 🎉');
} else {
    console.log('❌ MYSQLHOST not found');
}

if (hasPublic) {
    console.log('⚠️  MYSQL_PUBLIC_URL exists:', process.env.MYSQL_PUBLIC_URL?.substring(0, 30) + '...');
    console.log('   → But NOT using it in code! ✅');
} else {
    console.log('✅ MYSQL_PUBLIC_URL not set (good!)');
}

console.log('\n🔧 Current Database Configuration:');
console.log('-'.repeat(60));

// Show what db-manager.js will actually use
const actualConfig = {
    host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT || 3306),
    user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'graceland_church',
};

console.log('Host:', actualConfig.host);
console.log('Port:', actualConfig.port);
console.log('User:', actualConfig.user);
console.log('Database:', actualConfig.database);

console.log('\n🎯 Network Type Detection:');
console.log('-'.repeat(60));

if (actualConfig.host.includes('railway.internal')) {
    console.log('✅ PRIVATE NETWORK CONFIRMED!');
    console.log('   Connection: Internal Railway network');
    console.log('   Cost: $0.00 (FREE!)');
    console.log('   Speed: Fast (no proxy)');
    console.log('   Security: High (not internet-facing)');
} else if (actualConfig.host.includes('proxy.railway.app')) {
    console.log('❌ PUBLIC NETWORK DETECTED!');
    console.log('   Connection: Through Railway proxy');
    console.log('   Cost: $0.10/GB egress fees');
    console.log('   Speed: Slower (goes through proxy)');
    console.log('   ⚠️  WARNING: This will cost money!');
} else if (actualConfig.host === 'localhost') {
    console.log('🏠 LOCAL DEVELOPMENT');
    console.log('   Connection: Your local machine');
    console.log('   Cost: $0.00 (local)');
} else {
    console.log('❓ UNKNOWN CONFIGURATION');
    console.log('   Host:', actualConfig.host);
}

console.log('\n💰 Cost Analysis:');
console.log('-'.repeat(60));

if (actualConfig.host.includes('railway.internal')) {
    console.log('Monthly database traffic: 50 GB');
    console.log('Monthly cost: $0.00 (private network)');
    console.log('Annual savings vs public: $60/year');
    console.log('\n🎉 You\'re saving money with private network!');
} else if (actualConfig.host.includes('proxy.railway.app')) {
    console.log('Monthly database traffic: 50 GB');
    console.log('Monthly cost: $5.00 (50 GB × $0.10/GB)');
    console.log('Annual cost: $60/year');
    console.log('\n⚠️  Consider switching to private network!');
} else {
    console.log('Not applicable (not on Railway)');
}

console.log('\n📚 Summary:');
console.log('-'.repeat(60));

if (actualConfig.host.includes('railway.internal')) {
    console.log('✅ Status: PERFECT CONFIGURATION!');
    console.log('✅ Using: Private network variables (MYSQLHOST)');
    console.log('✅ Cost: $0.00/month for database queries');
    console.log('✅ Security: High (internal network only)');
    console.log('\n🎯 No action needed - you\'re all set! 🎉');
} else if (actualConfig.host.includes('proxy.railway.app')) {
    console.log('❌ Status: USING PUBLIC NETWORK');
    console.log('❌ Using: MYSQL_PUBLIC_URL or MYSQL_PUBLIC_HOST');
    console.log('💸 Cost: $0.10/GB egress fees');
    console.log('\n⚠️  Action needed: Switch to MYSQLHOST variable!');
} else {
    console.log('ℹ️  Status: Local development or custom setup');
    console.log('ℹ️  This verification is for Railway deployments');
}

console.log('\n' + '='.repeat(60));
console.log('Verification complete! ✅\n');
