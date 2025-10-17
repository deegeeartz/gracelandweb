// Quick test of fixed endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testEndpoints() {
    console.log('🧪 Testing Fixed Endpoints\n');
    console.log('========================================\n');

    try {
        // Test 1: Health Check
        console.log('1. Testing /api/health...');
        const health = await axios.get(`${BASE_URL}/api/health`);
        console.log('   ✅ Health check:', health.data.status);

        // Test 2: Login
        console.log('\n2. Testing login...');
        const login = await axios.post(`${BASE_URL}/api/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });
        const token = login.data.token;
        console.log('   ✅ Login successful, token received');

        // Test 3: Admin Stats (Previously failing)
        console.log('\n3. Testing /api/admin/stats (WAS FAILING)...');
        try {
            const stats = await axios.get(`${BASE_URL}/api/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('   ✅ Stats loaded successfully!');
            console.log('   📊 Total Posts:', stats.data.totalPosts);
            console.log('   📊 Total Sermons:', stats.data.totalSermons);
            console.log('   📊 Total Views:', stats.data.totalViews);
        } catch (error) {
            console.log('   ❌ Stats failed:', error.response?.data?.error || error.message);
        }

        // Test 4: Admin Posts
        console.log('\n4. Testing /api/admin/posts...');
        try {
            const posts = await axios.get(`${BASE_URL}/api/admin/posts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('   ✅ Posts loaded:', posts.data.posts.length, 'posts');
        } catch (error) {
            console.log('   ❌ Posts failed:', error.response?.data?.error || error.message);
        }

        // Test 5: Public Blog Posts
        console.log('\n5. Testing /api/blog/posts...');
        const blogPosts = await axios.get(`${BASE_URL}/api/blog/posts`);
        console.log('   ✅ Blog posts loaded:', blogPosts.data.posts.length, 'posts');

        // Test 6: Categories
        console.log('\n6. Testing /api/admin/categories...');
        const categories = await axios.get(`${BASE_URL}/api/admin/categories`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   ✅ Categories loaded:', categories.data.length, 'categories');

        // Test 7: Sermons
        console.log('\n7. Testing /api/sermons...');
        const sermons = await axios.get(`${BASE_URL}/api/sermons`);
        console.log('   ✅ Sermons loaded:', sermons.data.sermons.length, 'sermons');

        console.log('\n========================================');
        console.log('✅ All tests passed!');
        console.log('========================================\n');

    } catch (error) {
        console.log('\n❌ Test failed:', error.message);
        if (error.response) {
            console.log('   Status:', error.response.status);
            console.log('   Error:', error.response.data);
        }
    }
}

// Check if axios is installed
try {
    require.resolve('axios');
    testEndpoints().then(() => process.exit(0)).catch(() => process.exit(1));
} catch (e) {
    console.log('❌ axios not installed. Installing...');
    console.log('Run: npm install axios');
    console.log('\nAlternatively, test manually:');
    console.log('1. Open: http://localhost:3000/tests/admin-test.html');
    console.log('2. Login with admin/admin123');
    console.log('3. Check if stats load without errors');
}
