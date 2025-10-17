// Test login functionality
async function testLogin() {
    try {
        console.log('Testing admin login...');
        
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
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Login successful!');
            console.log('Token received:', data.token ? 'Yes' : 'No');
            console.log('User:', data.user?.username);
        } else {
            const error = await response.text();
            console.log('❌ Login failed:', error);
        }
        
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
}

// Run test when page loads
if (typeof window !== 'undefined') {
    window.testLogin = testLogin;
} else {
    testLogin();
}
