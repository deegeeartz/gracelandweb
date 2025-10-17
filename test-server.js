// Simple server test
const fetch = require('node-fetch');

async function testServer() {
    try {
        console.log('Testing server connection...');
        
        // Test basic connectivity
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123'
            })
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers));
        
        const data = await response.text();
        console.log('Response body:', data);
        
    } catch (error) {
        console.error('Server test failed:', error);
    }
}

testServer();
