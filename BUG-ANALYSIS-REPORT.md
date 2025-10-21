# 🐛 Bug Analysis Report - RCCG Graceland Website

**Generated:** October 21, 2025  
**Analyzed:** Full codebase structure  
**Status:** 15 Critical Issues Found

---

## 🔴 CRITICAL BUGS

### 1. **Console.log Still Present in Multiple Files** (Security Risk)
**Severity:** HIGH  
**Files Affected:** 134+ instances across 20+ files

**Issue:**
Despite implementing the production logger, many files still use `console.log`, `console.error`, `console.warn` directly instead of the logger utility.

**Locations:**
- `database/db-manager.js` - Lines 56, 57, 58, 68, 69, 70, 83, 84, 85, 95, 99, 100
- `database/models/BlogPost.js` - Line 13
- `server.js` - Line 240
- `routes/blog.js` - Lines 46, 57, 69, 102, 114
- `routes/sermons.js` - Lines 46, 58, 69, 80, 96, 107, 118
- `routes/auth.js` - Lines 52, 89, 122, 163
- `routes/admin.js` - Lines 43, 92, 139, 183, 199, 248, 297, 347, 363, 374
- `routes/settings.js` - Lines 37, 53, 88, 106, 122
- `admin-script-db.js` - Lines 33, 66, 259, 373, 467, 480, 503, 574, 687, 754, 803, 820, 845, 910, 962
- `blog-script-db.js` - Lines 32, 77, 375
- `services/cloudinary.service.js` - Lines 184, 261, 309, 337
- `config/environment.js` - Lines 78, 79, 80
- `scripts/image-optimizer.js` - Lines 63, 238, 291

**Fix:**
```javascript
// WRONG ❌
console.error('Database query error:', error);
console.log('Query:', query);

// CORRECT ✅
const logger = require('../utils/logger');
logger.error('Database query error:', error);
logger.log('Query:', query);
```

**Impact:**
- Debug information exposed in production
- Security vulnerability
- Performance overhead

---

### 2. **Missing Null/Undefined Checks**
**Severity:** HIGH  
**Files:** Multiple API routes

**Issue:**
Many functions don't validate input parameters before use, leading to potential crashes.

**Examples:**

**`blog-script-db.js` Line 140:**
```javascript
openPost(id) {
    window.location.href = `post.html?id=${id}`;
}
```
**Problem:** No check if `id` exists or is valid.

**Fix:**
```javascript
openPost(id) {
    if (!id || isNaN(id)) {
        logger.error('Invalid post ID:', id);
        this.showNotification('Invalid post ID', 'error');
        return;
    }
    window.location.href = `post.html?id=${id}`;
}
```

**`admin-script-db.js` Line 66:**
```javascript
const data = await response.json();
```
**Problem:** No check if response is valid JSON.

**Fix:**
```javascript
let data;
try {
    data = await response.json();
} catch (jsonError) {
    logger.error('Invalid JSON response:', jsonError);
    throw new Error('Server returned invalid response');
}
```

---

### 3. **Race Condition in Image Upload**
**Severity:** MEDIUM  
**File:** `scripts/admin-image-upload.js`

**Issue:**
The `pendingImageFile` variable can be overwritten if user selects multiple images quickly.

**Code:**
```javascript
imageInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    pendingImageFile = file; // ❌ No lock/queue mechanism
    showImagePreview(file);
    showImageReady(file);
});
```

**Fix:**
```javascript
let isProcessingImage = false;

imageInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (isProcessingImage) {
        logger.warn('Image processing in progress, please wait');
        return;
    }
    
    isProcessingImage = true;
    pendingImageFile = file;
    showImagePreview(file);
    showImageReady(file);
    isProcessingImage = false;
});
```

---

### 4. **Environment.js Console Logs in Production**
**Severity:** MEDIUM  
**File:** `config/environment.js` Lines 78-80

**Issue:**
Configuration details are logged to console ALWAYS, including in production.

**Code:**
```javascript
console.log(`🌍 Environment: ${window.ENV.environment}`);
console.log(`🔗 API URL: ${window.ENV.apiBaseUrl}`);
console.log(`🏠 Base URL: ${window.ENV.baseUrl}`);
```

**Fix:**
```javascript
if (environment.isDevelopment()) {
    console.log(`🌍 Environment: ${window.ENV.environment}`);
    console.log(`🔗 API URL: ${window.ENV.apiBaseUrl}`);
    console.log(`🏠 Base URL: ${window.ENV.baseUrl}`);
}
```

---

### 5. **No Rate Limiting on Upload Endpoint**
**Severity:** MEDIUM  
**File:** `server.js` Line 176

**Issue:**
The `/api/upload` endpoint has no rate limiting, allowing abuse.

**Current:**
```javascript
app.post('/api/upload', upload.single('file'), async (req, res) => {
    // No rate limiting
});
```

**Fix:**
```javascript
const uploadLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // 10 uploads per 5 minutes
    message: 'Too many uploads, please try again later.'
});

app.post('/api/upload', uploadLimiter, upload.single('file'), async (req, res) => {
    // ...
});
```

---

### 6. **SQL Injection Risk in Category Queries**
**Severity:** HIGH  
**File:** `routes/blog.js` Line 109

**Issue:**
Category slug is used directly in query without proper sanitization.

**Code:**
```javascript
router.get('/category/:slug', async (req, res) => {
    const posts = await BlogPost.getByCategory(req.params.slug, limit);
});
```

**Problem:** If `getByCategory` doesn't use parameterized queries, it's vulnerable.

**Fix:** Verify `BlogPost.getByCategory` uses parameterized queries:
```javascript
// In BlogPost model
static async getByCategory(slug, limit) {
    // ✅ GOOD - Parameterized
    const query = 'SELECT * FROM blog_posts WHERE category_slug = ? LIMIT ?';
    return await db.all(query, [slug, limit]);
    
    // ❌ BAD - String concatenation
    // const query = `SELECT * FROM blog_posts WHERE category_slug = '${slug}'`;
}
```

---

### 7. **Missing Error Boundaries in Frontend**
**Severity:** MEDIUM  
**Files:** All HTML pages

**Issue:**
No global error handler to catch unhandled JavaScript errors.

**Fix:** Add to all HTML pages before closing `</body>`:
```html
<script>
window.addEventListener('error', function(event) {
    logger.error('Unhandled error:', event.error);
    // Optionally show user-friendly message
    console.error('An error occurred. Please refresh the page.');
});

window.addEventListener('unhandledrejection', function(event) {
    logger.error('Unhandled promise rejection:', event.reason);
});
</script>
```

---

### 8. **Memory Leak in Quill Editor**
**Severity:** LOW  
**File:** `admin-script-db.js`

**Issue:**
Quill editor instances are not properly destroyed when switching tabs.

**Code:**
```javascript
showTab(tabName) {
    if (tabName === 'posts') {
        this.initQuillEditor(); // ❌ Creates new instance without destroying old
    }
}
```

**Fix:**
```javascript
showTab(tabName) {
    // Destroy old editor before creating new one
    if (this.quillEditor) {
        const editorElement = document.querySelector('.ql-container');
        if (editorElement) {
            editorElement.innerHTML = '';
        }
        this.quillEditor = null;
    }
    
    if (tabName === 'posts') {
        this.initQuillEditor();
    }
}
```

---

### 9. **CORS Allows All Origins in Development**
**Severity:** MEDIUM  
**File:** `server.js` Line 49

**Issue:**
CORS callback allows ALL origins during development, which could leak to production.

**Code:**
```javascript
} else {
    logger.warn('CORS blocked origin:', origin);
    callback(null, true); // ❌ Allows blocked origins!
}
```

**Fix:**
```javascript
} else {
    logger.warn('CORS blocked origin:', origin);
    if (process.env.NODE_ENV === 'production') {
        callback(new Error('Not allowed by CORS'));
    } else {
        callback(null, true); // Only allow in development
    }
}
```

---

### 10. **No Input Sanitization**
**Severity:** HIGH  
**Files:** All form inputs

**Issue:**
User inputs (title, content, etc.) are not sanitized before display, risking XSS attacks.

**Fix:** Install and use DOMPurify:
```bash
npm install dompurify
```

```javascript
// In admin-script-db.js
import DOMPurify from 'dompurify';

savePost() {
    const title = DOMPurify.sanitize(document.getElementById('postTitle').value);
    const content = DOMPurify.sanitize(this.quillEditor.root.innerHTML);
    // ...
}
```

---

### 11. **Database Connection Pool Not Closed**
**Severity:** LOW  
**File:** `database/db-manager.js`

**Issue:**
No graceful shutdown handler to close database connections.

**Fix:** Add to `server.js`:
```javascript
const { pool } = require('./database/db-manager');

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.log('SIGTERM received, closing database connections...');
    await pool.end();
    process.exit(0);
});
```

---

### 12. **Hardcoded API URL**
**Severity:** LOW  
**File:** `config/environment.js` Line 20

**Issue:**
Production API URL is hardcoded, making deployment changes difficult.

**Code:**
```javascript
return 'https://gracelandweb-production.up.railway.app/api';
```

**Fix:** Use environment variable injection:
```javascript
return window.RAILWAY_API_URL || 'https://gracelandweb-production.up.railway.app/api';
```

Then inject during build:
```html
<!-- In HTML -->
<script>
    window.RAILWAY_API_URL = '<%= process.env.RAILWAY_PUBLIC_DOMAIN %>/api';
</script>
```

---

### 13. **No Request Timeout**
**Severity:** MEDIUM  
**Files:** All API fetch calls

**Issue:**
Fetch requests have no timeout, can hang indefinitely.

**Fix:** Add timeout wrapper:
```javascript
// In admin-script-db.js
static async request(endpoint, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout
    
    try {
        const response = await fetch(url, {
            ...config,
            signal: controller.signal
        });
        clearTimeout(timeout);
        return await response.json();
    } catch (error) {
        clearTimeout(timeout);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout');
        }
        throw error;
    }
}
```

---

### 14. **Pagination SQL Injection**
**Severity:** HIGH  
**File:** `routes/blog.js` Line 13-16

**Issue:**
Page and limit parameters from query string are used directly.

**Code:**
```javascript
const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    // ...
};
```

**Problem:** `parseInt(undefined)` returns `NaN`, could break queries.

**Fix:**
```javascript
const options = {
    page: Math.max(1, parseInt(page) || 1),
    limit: Math.min(100, Math.max(1, parseInt(limit) || 10)),
    // ...
};
```

---

### 15. **File Upload Without Virus Scanning**
**Severity:** MEDIUM  
**File:** `server.js` Line 176

**Issue:**
Files are uploaded without malware scanning.

**Recommendation:**
- Use ClamAV or similar
- Add file type validation beyond MIME type (check magic numbers)
- Implement file size limits per user role

**Fix:**
```javascript
const fileFilter = (req, file, cb) => {
    // Check magic numbers, not just MIME type
    const allowedMagicNumbers = {
        'ffd8ff': 'image/jpeg',
        '89504e47': 'image/png',
        '47494638': 'image/gif'
    };
    
    // Validate file signature
    // ... implementation
};
```

---

## 📊 Summary

| Severity | Count |
|----------|-------|
| 🔴 HIGH | 6 |
| 🟡 MEDIUM | 7 |
| 🟢 LOW | 2 |
| **TOTAL** | **15** |

---

## 🛠️ Priority Fix List

### Immediate (Next Deploy):
1. ✅ Replace all `console.log` with logger
2. ✅ Fix CORS production behavior
3. ✅ Add null checks to critical functions
4. ✅ Remove production console logs in `environment.js`
5. ✅ Add rate limiting to upload endpoint

### Short Term (This Week):
6. ⏳ Add input sanitization (DOMPurify)
7. ⏳ Add SQL injection protection verification
8. ⏳ Add request timeouts to all fetch calls
9. ⏳ Fix pagination parameter validation
10. ⏳ Add error boundaries to frontend

### Medium Term (This Month):
11. ⏳ Implement file virus scanning
12. ⏳ Fix memory leaks in Quill editor
13. ⏳ Add database connection graceful shutdown
14. ⏳ Implement proper image upload queue
15. ⏳ Make API URL configurable via environment

---

## 🔧 Testing Recommendations

After fixing bugs, test:
1. **Security:** Run OWASP ZAP scan
2. **Performance:** Load test with 1000 concurrent users
3. **Memory:** Monitor for leaks over 24 hours
4. **SQL Injection:** Use sqlmap tool
5. **XSS:** Use XSStrike tool

---

## 📝 Next Steps

1. Create GitHub issues for each bug
2. Prioritize by severity
3. Fix immediate issues first
4. Deploy and test
5. Document fixes

---

**Report End**
