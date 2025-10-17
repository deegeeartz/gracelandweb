// Simple test to trigger the error
const http = require('http');

// First login
const loginData = JSON.stringify({
    username: 'admin',
    password: 'admin123'
});

const loginOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
    }
};

console.log('1. Logging in...');
const loginReq = http.request(loginOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        const result = JSON.parse(data);
        const token = result.token;
        console.log('✅ Login successful');
        
        // Now test admin stats
        console.log('\n2. Testing /api/admin/stats...');
        const statsOptions = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/admin/stats',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
        
        const statsReq = http.request(statsOptions, (res) => {
            let statsData = '';
            res.on('data', (chunk) => statsData += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('✅ Stats loaded successfully!');
                    console.log(JSON.parse(statsData));
                } else {
                    console.log('❌ Stats failed:', res.statusCode);
                    console.log(statsData);
                }
                process.exit(0);
            });
        });
        
        statsReq.on('error', (e) => {
            console.error('❌ Request error:', e);
            process.exit(1);
        });
        
        statsReq.end();
    });
});

loginReq.on('error', (e) => {
    console.error('❌ Login error:', e);
    process.exit(1);
});

loginReq.write(loginData);
loginReq.end();
