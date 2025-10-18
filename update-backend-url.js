// Script to update backend URL in environment.js
// Usage: node update-backend-url.js <your-railway-url>
// Example: node update-backend-url.js https://graceland-backend-production.up.railway.app

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

if (args.length === 0) {
    console.log('❌ Error: Please provide your Railway backend URL');
    console.log('');
    console.log('Usage: node update-backend-url.js <backend-url>');
    console.log('Example: node update-backend-url.js https://graceland-backend-production.up.railway.app');
    console.log('');
    console.log('To find your Railway URL:');
    console.log('1. Go to https://railway.app');
    console.log('2. Open your project');
    console.log('3. Click on your backend service');
    console.log('4. Go to Settings → Domains');
    console.log('5. Copy the URL (should look like: *.up.railway.app)');
    process.exit(1);
}

let backendUrl = args[0].trim();

// Remove trailing slash if present
backendUrl = backendUrl.replace(/\/$/, '');

// Validate URL format
if (!backendUrl.startsWith('http://') && !backendUrl.startsWith('https://')) {
    backendUrl = 'https://' + backendUrl;
}

console.log(`🔧 Updating backend URL to: ${backendUrl}`);

// Read environment.js
const envPath = path.join(__dirname, 'config', 'environment.js');
let content = fs.readFileSync(envPath, 'utf8');

// Replace the placeholder URL
const oldUrl = 'https://your-backend-app.railway.app/api';
const newUrl = `${backendUrl}/api`;

content = content.replace(oldUrl, newUrl);

// Also replace any other common placeholders
content = content.replace(/https:\/\/your-backend-app\.railway\.app/g, backendUrl);
content = content.replace(/https:\/\/your-app\.railway\.app/g, backendUrl);

// Write back
fs.writeFileSync(envPath, content, 'utf8');

console.log('✅ Backend URL updated successfully!');
console.log('');
console.log('📝 Updated config/environment.js');
console.log(`   API URL: ${newUrl}`);
console.log('');

// Also update CORS in server.js
console.log('🔧 Updating CORS configuration...');
const serverPath = path.join(__dirname, 'server.js');
let serverContent = fs.readFileSync(serverPath, 'utf8');

// Find and replace CORS origin
const oldCors = /origin:\s*['"]https:\/\/railway\.com['"]/g;
const newCors = `origin: 'https://deegeeartz.github.io'`;

if (serverContent.match(oldCors)) {
    serverContent = serverContent.replace(oldCors, newCors);
    fs.writeFileSync(serverPath, serverContent, 'utf8');
    console.log('✅ CORS updated to allow GitHub Pages');
} else {
    console.log('ℹ️  CORS already configured or not found');
}

console.log('');
console.log('🎉 All done! Next steps:');
console.log('');
console.log('1. Commit changes:');
console.log('   git add config/environment.js server.js');
console.log('   git commit -m "Fix: Update Railway backend URL and CORS"');
console.log('   git push');
console.log('');
console.log('2. Wait 2-3 minutes for Railway to redeploy');
console.log('');
console.log('3. Test your admin panel at:');
console.log('   https://deegeeartz.github.io/gracelandweb/admin.html');
console.log('');
console.log('4. Login with your credentials and start managing content!');
console.log('');
