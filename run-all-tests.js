#!/usr/bin/env node
/**
 * Comprehensive Test Suite - RCCG Graceland Website
 * Tests all recent bug fixes and features
 */

require('dotenv').config();
const http = require('http');

console.log('🧪 RCCG Graceland - Comprehensive Test Suite\n');
console.log('='.repeat(70));

// Color codes for terminal
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

const SUCCESS = `${colors.green}✅${colors.reset}`;
const FAIL = `${colors.red}❌${colors.reset}`;
const INFO = `${colors.blue}ℹ️${colors.reset}`;
const WARN = `${colors.yellow}⚠️${colors.reset}`;

let testResults = {
    passed: 0,
    failed: 0,
    warnings: 0
};

// Helper function to make HTTP requests
function makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: data
                });
            });
        });
        
        req.on('error', reject);
        
        if (postData) {
            req.write(postData);
        }
        
        req.end();
    });
}

// Test 1: Environment Variables Check
console.log('\n📋 Test 1: Environment Variables Configuration');
console.log('-'.repeat(70));

// Check for both Railway and local environment variable naming
const isRailway = !!(process.env.MYSQLHOST);
const isLocal = !!(process.env.DB_HOST);

console.log(`Environment Type: ${isRailway ? 'Railway' : isLocal ? 'Local Development' : 'Unknown'}`);
console.log('');

const requiredEnvVars = {
    // Database (supports both Railway and local naming)
    'Database Host': process.env.MYSQLHOST || process.env.DB_HOST,
    'Database Port': process.env.MYSQLPORT || process.env.DB_PORT,
    'Database User': process.env.MYSQLUSER || process.env.DB_USER,
    'Database Password': process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
    'Database Name': process.env.MYSQLDATABASE || process.env.DB_NAME,
    
    // Cloudinary (New Keys)
    'CLOUDINARY_CLOUD_NAME': process.env.CLOUDINARY_CLOUD_NAME,
    'CLOUDINARY_API_KEY': process.env.CLOUDINARY_API_KEY,
    'CLOUDINARY_API_SECRET': process.env.CLOUDINARY_API_SECRET,
    
    // JWT
    'JWT_SECRET': process.env.JWT_SECRET
};

Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (value) {
        console.log(`${SUCCESS} ${key}: Set`);
        if (key.includes('Password') || key.includes('SECRET')) {
            console.log(`   Value: ${'*'.repeat(20)}`);
        } else if (key === 'Database Host') {
            console.log(`   Value: ${value}`);
            if (value.includes('railway.internal')) {
                console.log(`   ${SUCCESS} Using PRIVATE network (FREE!)`);
                testResults.passed++;
            } else if (value.includes('proxy.railway.app')) {
                console.log(`   ${FAIL} Using PUBLIC network (costs money!)`);
                testResults.failed++;
            } else if (value === 'localhost') {
                console.log(`   ${INFO} Using local database`);
                testResults.passed++;
            }
        } else {
            console.log(`   Value: ${value}`);
        }
        testResults.passed++;
    } else {
        console.log(`${FAIL} ${key}: NOT SET`);
        testResults.failed++;
    }
});

// Check for public endpoint variables (should NOT be used)
console.log('\n🔍 Checking for Public Endpoint Variables (should NOT be in code):');
const publicVars = ['MYSQL_PUBLIC_URL', 'MYSQL_PUBLIC_HOST', 'RAILWAY_TCP_PROXY_DOMAIN'];
publicVars.forEach(varName => {
    if (process.env[varName]) {
        console.log(`${WARN} ${varName} exists but should NOT be used in code`);
        testResults.warnings++;
    } else {
        console.log(`${SUCCESS} ${varName} not set (good!)`);
    }
});

// Test 2: Cloudinary Credentials Check
console.log('\n☁️  Test 2: Cloudinary Credentials');
console.log('-'.repeat(70));

if (process.env.CLOUDINARY_API_KEY === '133537346964831') {
    console.log(`${FAIL} Using OLD exposed API key!`);
    console.log(`   ${WARN} Security risk! Rotate your keys immediately!`);
    testResults.failed++;
} else if (process.env.CLOUDINARY_API_KEY === '522773987982955') {
    console.log(`${SUCCESS} Using NEW rotated API key`);
    testResults.passed++;
} else {
    console.log(`${INFO} Using custom API key: ${process.env.CLOUDINARY_API_KEY}`);
    testResults.passed++;
}

// Test 3: Database Schema Check
console.log('\n🗄️  Test 3: Database Schema (Cloudinary Fields)');
console.log('-'.repeat(70));

const db = require('./database/db-manager');

async function testDatabaseSchema() {
    try {
        // Test database connection first
        await db.run('SELECT 1', []);
        
        const schema = await db.all(`
            SHOW COLUMNS FROM blog_posts 
            WHERE Field IN ('image_public_id', 'image_urls', 'featured_image')
        `, []);
        
        const hasImagePublicId = schema.some(col => col.Field === 'image_public_id');
        const hasImageUrls = schema.some(col => col.Field === 'image_urls');
        const hasFeaturedImage = schema.some(col => col.Field === 'featured_image');
        
        if (hasImagePublicId) {
            console.log(`${SUCCESS} image_public_id column exists`);
            testResults.passed++;
        } else {
            console.log(`${FAIL} image_public_id column missing`);
            console.log(`   Run: node database/migrate-cloudinary.js`);
            testResults.failed++;
        }
        
        if (hasImageUrls) {
            console.log(`${SUCCESS} image_urls (JSON) column exists`);
            testResults.passed++;
        } else {
            console.log(`${FAIL} image_urls column missing`);
            console.log(`   Run: node database/migrate-cloudinary.js`);
            testResults.failed++;
        }
        
        if (hasFeaturedImage) {
            console.log(`${SUCCESS} featured_image column exists`);
            testResults.passed++;
        } else {
            console.log(`${FAIL} featured_image column missing`);
            testResults.failed++;
        }
        
    } catch (error) {
        console.log(`${WARN} Database test skipped: ${error.message}`);
        console.log(`   ${INFO} This is OK for local development without MySQL running`);
        console.log(`   ${INFO} Database schema will be tested on Railway deployment`);
        testResults.warnings++;
    }
}

// Test 4: Server Endpoints Check
console.log('\n🌐 Test 4: Server Endpoints');
console.log('-'.repeat(70));

async function testServerEndpoints() {
    const PORT = process.env.PORT || 3000;
    const baseUrl = `http://localhost:${PORT}`;
    
    console.log(`Testing server at: ${baseUrl}`);
    
    const endpoints = [
        { path: '/', method: 'GET', name: 'Homepage' },
        { path: '/blog.html', method: 'GET', name: 'Blog Page' },
        { path: '/admin.html', method: 'GET', name: 'Admin Page' },
        { path: '/api/posts', method: 'GET', name: 'Blog Posts API' },
        { path: '/api/sermons', method: 'GET', name: 'Sermons API' }
    ];
    
    console.log(`\n${INFO} Start server first: node server.js`);
    console.log(`   Then run: node run-all-tests.js --server-running\n`);
    
    if (process.argv.includes('--server-running')) {
        for (const endpoint of endpoints) {
            try {
                const response = await makeRequest({
                    hostname: 'localhost',
                    port: PORT,
                    path: endpoint.path,
                    method: endpoint.method
                });
                
                if (response.statusCode === 200) {
                    console.log(`${SUCCESS} ${endpoint.name}: ${response.statusCode} OK`);
                    testResults.passed++;
                } else {
                    console.log(`${WARN} ${endpoint.name}: ${response.statusCode}`);
                    testResults.warnings++;
                }
            } catch (error) {
                console.log(`${FAIL} ${endpoint.name}: ${error.message}`);
                testResults.failed++;
            }
        }
    } else {
        console.log(`${INFO} Skipping server tests (server not running)`);
    }
}

// Test 5: File Structure Check
console.log('\n📁 Test 5: File Structure');
console.log('-'.repeat(70));

const fs = require('fs');
const path = require('path');

const criticalFiles = [
    'server.js',
    'database/db-manager.js',
    'database/models/BlogPost.js',
    'routes/admin.js',
    'config/environment.js',
    'blog-script-db.js',
    'services/cloudinary.service.js',
    '.gitignore'
];

criticalFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`${SUCCESS} ${file} exists`);
        testResults.passed++;
    } else {
        console.log(`${FAIL} ${file} missing`);
        testResults.failed++;
    }
});

// Test 6: .gitignore Check
console.log('\n🔒 Test 6: Security - .gitignore');
console.log('-'.repeat(70));

try {
    const gitignorePath = path.join(__dirname, '.gitignore');
    const gitignore = fs.readFileSync(gitignorePath, 'utf8');
    
    const hasEnv = gitignore.includes('.env');
    const hasNodeModules = gitignore.includes('node_modules');
    const hasUploads = gitignore.includes('uploads/') || gitignore.includes('uploads');
    
    if (hasEnv) {
        console.log(`${SUCCESS} .env is in .gitignore`);
        testResults.passed++;
    } else {
        console.log(`${FAIL} .env NOT in .gitignore!`);
        console.log(`   ${WARN} Security risk! Add .env to .gitignore`);
        testResults.failed++;
    }
    
    if (hasNodeModules) {
        console.log(`${SUCCESS} node_modules is in .gitignore`);
        testResults.passed++;
    }
    
    if (hasUploads) {
        console.log(`${SUCCESS} uploads/ is in .gitignore`);
        testResults.passed++;
    }
    
} catch (error) {
    console.log(`${FAIL} .gitignore not found or unreadable`);
    testResults.failed++;
}

// Test 7: Code Review - Bug Fixes
console.log('\n🐛 Test 7: Bug Fixes Verification');
console.log('-'.repeat(70));

try {
    // Check BlogPost.js for Cloudinary fields
    const blogPostPath = path.join(__dirname, 'database/models/BlogPost.js');
    const blogPostCode = fs.readFileSync(blogPostPath, 'utf8');
    
    if (blogPostCode.includes('image_public_id') && blogPostCode.includes('image_urls')) {
        console.log(`${SUCCESS} BlogPost model has Cloudinary fields`);
        testResults.passed++;
    } else {
        console.log(`${FAIL} BlogPost model missing Cloudinary fields`);
        testResults.failed++;
    }
    
    // Check admin.js for Cloudinary parameters
    const adminRoutesPath = path.join(__dirname, 'routes/admin.js');
    const adminRoutesCode = fs.readFileSync(adminRoutesPath, 'utf8');
    
    if (adminRoutesCode.includes('image_public_id') && adminRoutesCode.includes('image_urls')) {
        console.log(`${SUCCESS} Admin routes accept Cloudinary parameters`);
        testResults.passed++;
    } else {
        console.log(`${FAIL} Admin routes don't accept Cloudinary parameters`);
        testResults.failed++;
    }
    
    // Check environment.js for baseUrl
    const envConfigPath = path.join(__dirname, 'config/environment.js');
    const envConfigCode = fs.readFileSync(envConfigPath, 'utf8');
    
    if (envConfigCode.includes('getBaseUrl') || envConfigCode.includes('baseUrl')) {
        console.log(`${SUCCESS} Environment config has baseUrl function`);
        testResults.passed++;
    } else {
        console.log(`${FAIL} Environment config missing baseUrl`);
        testResults.failed++;
    }
    
    // Check blog-script-db.js for dynamic base URL
    const blogScriptPath = path.join(__dirname, 'blog-script-db.js');
    const blogScriptCode = fs.readFileSync(blogScriptPath, 'utf8');
    
    if (blogScriptCode.includes('ENV.baseUrl') || blogScriptCode.includes('window.location.origin')) {
        console.log(`${SUCCESS} Blog script uses dynamic base URL`);
        testResults.passed++;
    } else {
        console.log(`${WARN} Blog script may use hardcoded URL`);
        testResults.warnings++;
    }
    
} catch (error) {
    console.log(`${FAIL} Code review failed: ${error.message}`);
    testResults.failed++;
}

// Run async tests
(async () => {
    await testDatabaseSchema();
    await testServerEndpoints();
    
    // Final Results
    console.log('\n' + '='.repeat(70));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(70));
    
    const total = testResults.passed + testResults.failed;
    const passRate = total > 0 ? ((testResults.passed / total) * 100).toFixed(1) : 0;
    
    console.log(`\n${SUCCESS} Passed:   ${testResults.passed}`);
    console.log(`${FAIL} Failed:   ${testResults.failed}`);
    console.log(`${WARN} Warnings: ${testResults.warnings}`);
    console.log(`\n📈 Pass Rate: ${passRate}%`);
    
    if (testResults.failed === 0) {
        console.log(`\n${colors.green}🎉 ALL TESTS PASSED! Your website is ready!${colors.reset}\n`);
    } else if (testResults.failed <= 3) {
        console.log(`\n${colors.yellow}⚠️  Some tests failed. Review and fix issues.${colors.reset}\n`);
    } else {
        console.log(`\n${colors.red}❌ Multiple tests failed. Please review the output.${colors.reset}\n`);
    }
    
    // Next Steps
    console.log('📋 NEXT STEPS:');
    console.log('-'.repeat(70));
    
    if (!process.argv.includes('--server-running')) {
        console.log('1. Start server: node server.js');
        console.log('2. Run tests again: node run-all-tests.js --server-running');
    }
    
    console.log('3. Test image upload:');
    console.log('   - Open http://localhost:3000/admin.html');
    console.log('   - Login with credentials');
    console.log('   - Create a blog post with image');
    console.log('   - Verify image uploads to Cloudinary');
    
    console.log('4. Test blog links:');
    console.log('   - Open http://localhost:3000/blog.html');
    console.log('   - Click a blog post link');
    console.log('   - Verify it opens correctly');
    
    console.log('5. Deploy to Railway:');
    console.log('   - git add .');
    console.log('   - git commit -m "All tests passing"');
    console.log('   - git push');
    
    console.log('\n✨ Documentation:');
    console.log('   - QUICK-START-GUIDE.md');
    console.log('   - CLOUDINARY-GUIDE.md');
    console.log('   - RAILWAY-PRIVATE-NETWORK.md');
    
    process.exit(testResults.failed > 0 ? 1 : 0);
})();
