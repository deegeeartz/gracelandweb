// SEO Validation Script for RCCG Graceland Website
const fs = require('fs');
const path = require('path');

console.log('🔍 Running SEO Validation Tests...\n');

const pages = [
    { file: 'index.html', name: 'Home Page' },
    { file: 'blog.html', name: 'Blog Page' },
    { file: 'post.html', name: 'Post Page' },
    { file: 'admin.html', name: 'Admin Page' }
];

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function validatePage(filePath, pageName) {
    console.log(`\n📄 Testing: ${pageName}`);
    console.log('─'.repeat(50));
    
    const content = fs.readFileSync(filePath, 'utf-8');
    let pageTests = 0;
    let pagePassed = 0;
    
    // Test 1: Title Tag
    totalTests++; pageTests++;
    if (content.includes('<title>') && content.match(/<title>(.+?)<\/title>/)) {
        const title = content.match(/<title>(.+?)<\/title>/)[1];
        if (title.length >= 30 && title.length <= 60) {
            console.log('✅ Title tag exists and is optimally sized (30-60 chars)');
            passedTests++; pagePassed++;
        } else {
            console.log(`⚠️  Title tag exists but size is ${title.length} chars (recommended: 30-60)`);
            passedTests++; pagePassed++;
        }
    } else {
        console.log('❌ Missing title tag');
        failedTests++;
    }
    
    // Test 2: Meta Description
    totalTests++; pageTests++;
    if (content.includes('meta name="description"')) {
        const descMatch = content.match(/name="description"\s+content="(.+?)"/);
        if (descMatch && descMatch[1].length >= 120 && descMatch[1].length <= 160) {
            console.log('✅ Meta description exists and is optimally sized (120-160 chars)');
            passedTests++; pagePassed++;
        } else if (descMatch) {
            console.log(`⚠️  Meta description exists but size is ${descMatch[1].length} chars (recommended: 120-160)`);
            passedTests++; pagePassed++;
        }
    } else {
        console.log('❌ Missing meta description');
        failedTests++;
    }
    
    // Test 3: Meta Keywords
    totalTests++; pageTests++;
    if (content.includes('meta name="keywords"')) {
        console.log('✅ Meta keywords present');
        passedTests++; pagePassed++;
    } else {
        console.log('⚠️  Meta keywords missing (optional but helpful)');
        failedTests++;
    }
    
    // Test 4: Open Graph Tags
    totalTests++; pageTests++;
    const ogTags = [
        'property="og:title"',
        'property="og:description"',
        'property="og:image"',
        'property="og:url"'
    ];
    const ogCount = ogTags.filter(tag => content.includes(tag)).length;
    if (ogCount === ogTags.length) {
        console.log('✅ All essential Open Graph tags present');
        passedTests++; pagePassed++;
    } else {
        console.log(`⚠️  Only ${ogCount}/${ogTags.length} Open Graph tags present`);
        failedTests++;
    }
    
    // Test 5: Twitter Card Tags
    totalTests++; pageTests++;
    const twitterTags = [
        'property="twitter:card"',
        'property="twitter:title"',
        'property="twitter:description"'
    ];
    const twitterCount = twitterTags.filter(tag => content.includes(tag)).length;
    if (twitterCount === twitterTags.length) {
        console.log('✅ Twitter Card tags present');
        passedTests++; pagePassed++;
    } else {
        console.log(`⚠️  Only ${twitterCount}/${twitterTags.length} Twitter Card tags present`);
        failedTests++;
    }
    
    // Test 6: Canonical URL
    totalTests++; pageTests++;
    if (content.includes('rel="canonical"')) {
        console.log('✅ Canonical URL present');
        passedTests++; pagePassed++;
    } else {
        console.log('⚠️  Missing canonical URL');
        failedTests++;
    }
    
    // Test 7: Favicon
    totalTests++; pageTests++;
    if (content.includes('rel="icon"')) {
        console.log('✅ Favicon present');
        passedTests++; pagePassed++;
    } else {
        console.log('❌ Missing favicon');
        failedTests++;
    }
    
    // Test 8: Structured Data (JSON-LD)
    totalTests++; pageTests++;
    if (content.includes('application/ld+json')) {
        console.log('✅ Structured data (JSON-LD) present');
        passedTests++; pagePassed++;
    } else {
        console.log('⚠️  Missing structured data (JSON-LD)');
        failedTests++;
    }
    
    // Test 9: Viewport Meta Tag
    totalTests++; pageTests++;
    if (content.includes('name="viewport"')) {
        console.log('✅ Viewport meta tag present (mobile-friendly)');
        passedTests++; pagePassed++;
    } else {
        console.log('❌ Missing viewport meta tag');
        failedTests++;
    }
    
    // Test 10: Language Attribute
    totalTests++; pageTests++;
    if (content.includes('<html lang="')) {
        console.log('✅ Language attribute present');
        passedTests++; pagePassed++;
    } else {
        console.log('❌ Missing language attribute');
        failedTests++;
    }
    
    // Test 11: Alt Text for Images
    totalTests++; pageTests++;
    const imgTags = content.match(/<img[^>]*>/g) || [];
    const imgsWithAlt = imgTags.filter(img => img.includes('alt=')).length;
    if (imgTags.length === 0 || imgsWithAlt === imgTags.length) {
        console.log('✅ All images have alt text');
        passedTests++; pagePassed++;
    } else {
        console.log(`⚠️  ${imgsWithAlt}/${imgTags.length} images have alt text`);
        failedTests++;
    }
    
    // Test 12: Performance - Preconnect
    totalTests++; pageTests++;
    if (content.includes('rel="preconnect"')) {
        console.log('✅ Preconnect tags present (performance optimization)');
        passedTests++; pagePassed++;
    } else {
        console.log('⚠️  Missing preconnect tags');
        failedTests++;
    }
    
    const pageScore = Math.round((pagePassed / pageTests) * 100);
    console.log(`\n📊 Page Score: ${pageScore}% (${pagePassed}/${pageTests} tests passed)`);
    
    if (pageScore >= 90) {
        console.log('🏆 Excellent SEO optimization!');
    } else if (pageScore >= 75) {
        console.log('✅ Good SEO optimization');
    } else if (pageScore >= 60) {
        console.log('⚠️  Fair SEO optimization - room for improvement');
    } else {
        console.log('❌ Poor SEO optimization - needs work');
    }
}

// Run tests for each page
pages.forEach(page => {
    const filePath = path.join(__dirname, '..', page.file);
    console.log(`Looking for file: ${filePath}`);
    if (fs.existsSync(filePath)) {
        validatePage(filePath, page.name);
    } else {
        console.log(`\n❌ File not found: ${page.file} at ${filePath}`);
    }
});

// Final Report
console.log('\n' + '═'.repeat(50));
console.log('📊 FINAL SEO VALIDATION REPORT');
console.log('═'.repeat(50));
console.log(`Total Tests Run: ${totalTests}`);
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
const overallScore = Math.round((passedTests / totalTests) * 100);
console.log(`\n🎯 Overall Score: ${overallScore}%`);

if (overallScore >= 90) {
    console.log('🏆 EXCELLENT! Your website is well-optimized for SEO!');
} else if (overallScore >= 75) {
    console.log('✅ GOOD! Your website has solid SEO optimization.');
} else if (overallScore >= 60) {
    console.log('⚠️  FAIR. Consider addressing the failed tests for better SEO.');
} else {
    console.log('❌ NEEDS IMPROVEMENT. Focus on fixing failed tests.');
}

console.log('\n✨ SEO validation complete!\n');
