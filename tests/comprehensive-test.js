// Comprehensive test of all fixed features
const http = require('http');

const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
    tests.push({ name, fn });
}

function runTests() {
    console.log('🧪 Running Comprehensive Tests\n');
    console.log('========================================\n');
    
    let index = 0;
    function runNext() {
        if (index >= tests.length) {
            console.log('\n========================================');
            console.log(`✅ Passed: ${passed}`);
            console.log(`❌ Failed: ${failed}`);
            console.log(`📊 Total: ${tests.length}`);
            console.log('========================================\n');
            process.exit(failed > 0 ? 1 : 0);
            return;
        }
        
        const { name, fn } = tests[index++];
        console.log(`Testing: ${name}...`);
        
        fn()
            .then(() => {
                console.log(`  ✅ ${name} passed\n`);
                passed++;
                runNext();
            })
            .catch(error => {
                console.log(`  ❌ ${name} failed:`, error.message, '\n');
                failed++;
                runNext();
            });
    }
    
    runNext();
}

// Helper function to make HTTP requests
function request(path, method = 'GET', data = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path,
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
        
        if (data) {
            const jsonData = JSON.stringify(data);
            options.headers['Content-Length'] = jsonData.length;
        }
        
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(json);
                    } else {
                        reject(new Error(`Status ${res.statusCode}: ${json.error || body}`));
                    }
                } catch (e) {
                    reject(new Error(`Invalid JSON: ${body}`));
                }
            });
        });
        
        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

let authToken = null;

// Define tests
test('Health Check', async () => {
    const result = await request('/api/health');
    if (result.status !== 'OK') throw new Error('Health check failed');
});

test('Login', async () => {
    const result = await request('/api/auth/login', 'POST', {
        username: 'admin',
        password: 'admin123'
    });
    if (!result.token) throw new Error('No token received');
    authToken = result.token;
});

test('Admin Stats (was failing)', async () => {
    const result = await request('/api/admin/stats', 'GET', null, authToken);
    if (typeof result.totalPosts !== 'number') throw new Error('Invalid stats');
});

test('Admin Posts Listing', async () => {
    const result = await request('/api/admin/posts?page=1&limit=10&status=all', 'GET', null, authToken);
    if (!Array.isArray(result.posts)) throw new Error('Invalid posts array');
});

test('Blog Posts (was failing)', async () => {
    const result = await request('/api/blog?page=1&limit=6');
    if (!Array.isArray(result.posts)) throw new Error('Invalid posts array');
});

test('Blog Recent Posts (was failing)', async () => {
    const result = await request('/api/blog/recent?limit=5');
    if (!Array.isArray(result)) throw new Error('Invalid recent posts');
});

test('Single Blog Post by ID (was failing)', async () => {
    const result = await request('/api/blog/3');
    if (!result.id) throw new Error('Invalid blog post');
    if (!result.title) throw new Error('Missing title');
});

test('Categories', async () => {
    const result = await request('/api/blog/categories');
    if (!Array.isArray(result)) throw new Error('Invalid categories');
});

test('Sermons', async () => {
    const result = await request('/api/sermons');
    if (!result.sermons) throw new Error('Invalid sermons response');
});

test('Auth Token Verification', async () => {
    const result = await request('/api/auth/verify', 'GET', null, authToken);
    if (!result.user) throw new Error('Token verification failed');
});

// Run all tests
runTests();
