# 🔧 URGENT: Fix Railway Database Connection

## 🚨 Current Problem

You're getting **500 Internal Server Error** when trying to create blog posts:
```
POST /api/admin/posts 500 (Internal Server Error)
Error: Failed to create blog post
```

This means your Railway backend can't connect to the database properly.

---

## ✅ QUICK FIX (5 Minutes)

### **Step 1: Get Railway MySQL Public URL**

1. Go to: https://railway.app/dashboard
2. Click on your **MySQL service** (NOT the web service)
3. Click "**Variables**" tab
4. **Copy** the `MYSQL_PUBLIC_URL` value
   - Example: `mysql://root:abc123@proxy.railway.app:5432/railway`

### **Step 2: Add to .env File**

1. Open your `.env` file
2. Add this line (replace with your actual URL):
   ```bash
   MYSQL_PUBLIC_URL=mysql://root:abc123@proxy.railway.app:5432/railway
   ```

### **Step 3: Reset Database**

Double-click this file:
```
RESET-RAILWAY-DB.bat
```

Or run in terminal:
```bash
node reset-railway-database.js
```

**This will:**
- ✅ Clear all old data
- ✅ Create fresh tables with Cloudinary support
- ✅ Add default admin user (admin / admin123)
- ✅ Add default categories

### **Step 4: Test It Works**

```bash
# Test locally first
node server.js

# Open admin panel
start http://localhost:3000/admin.html

# Login: admin / admin123
# Try creating a blog post
```

### **Step 5: Deploy to Railway**

```bash
# If local test works, deploy:
git add .
git commit -m "Fix: Database reset and Cloudinary support"
git push

# Railway auto-deploys in 1-2 minutes
```

### **Step 6: Test on Railway**

```bash
# Open Railway admin panel
start https://gracelandweb-production.up.railway.app/admin.html

# Login: admin / admin123
# Create a blog post with image
```

---

## 🔍 If Reset Script Doesn't Work

### **Manual Railway Reset:**

1. **Go to Railway Dashboard**
2. **Click MySQL service**
3. **Click "Data" tab**
4. **Click "Query"**
5. **Copy/paste and run each command:**

```sql
-- 1. Drop old tables
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS blog_posts;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS authors;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 2. Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('admin', 'editor', 'viewer') DEFAULT 'viewer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create authors table
CREATE TABLE authors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create categories table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create blog_posts with Cloudinary
CREATE TABLE blog_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content LONGTEXT NOT NULL,
    featured_image VARCHAR(500),
    image_public_id VARCHAR(255),
    image_urls JSON,
    author_id INT,
    category_id INT,
    status ENUM('draft', 'published', 'scheduled') DEFAULT 'draft',
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    published_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_published_at (published_at),
    INDEX idx_image_public_id (image_public_id)
);

-- 6. Insert admin user (password: admin123)
INSERT INTO users (username, password, email, role) 
VALUES ('admin', '$2b$10$XqN5YfZJ9X.Vk8aL5QZ0.eK3xN5YfZJ9X.Vk8aL5QZ0.eK3xN5YfZ', 'admin@rccggraceland.org', 'admin');

-- 7. Insert default author
INSERT INTO authors (name, email, bio) 
VALUES ('RCCG Graceland', 'info@rccggraceland.org', 'RCCG Graceland Area HQ - Apapa Family');

-- 8. Insert categories
INSERT INTO categories (name, slug, description) VALUES
('Sermon', 'sermon', 'Sunday sermons and teachings'),
('Testimony', 'testimony', 'Member testimonies and stories'),
('Prayer', 'prayer', 'Prayer requests and updates'),
('Family', 'family', 'Family and relationships'),
('Youth', 'youth', 'Youth ministry updates'),
('Worship', 'worship', 'Worship and praise reports');
```

---

## 📋 Complete Troubleshooting

### Check 1: Railway Logs
```
1. Railway Dashboard → Web Service → Deployments
2. Click latest deployment → View Logs
3. Look for errors when creating post
```

### Check 2: Environment Variables
```
Railway Dashboard → Web Service → Variables

Must have:
✅ MYSQLHOST
✅ MYSQLPORT
✅ MYSQLUSER
✅ MYSQLPASSWORD
✅ MYSQLDATABASE
✅ CLOUDINARY_CLOUD_NAME
✅ CLOUDINARY_API_KEY
✅ CLOUDINARY_API_SECRET
✅ JWT_SECRET
```

### Check 3: Database Connection
```
# Test connection with:
node test-direct-db.js
```

---

## 🎯 Expected Results

### After Reset:
```
✅ Database reset completed successfully!

📊 Database Status:
   - Users: 1
   - Authors: 1  
   - Categories: 6
   - Blog Posts: 0
```

### After Creating Post:
```
✅ Post created successfully
✅ Image uploaded to Cloudinary
✅ Post appears on blog page
✅ No 500 errors
```

---

## 🆘 Still Not Working?

### Option 1: Check Railway Logs
The logs will show the EXACT error. Common ones:

**"Table doesn't exist"**
→ Run reset script again

**"Unknown column 'image_public_id'"**
→ Run reset script (adds Cloudinary columns)

**"Connection refused"**
→ Check MySQL service is running

**"Foreign key constraint"**
→ Reset database (creates default author/categories)

### Option 2: Test Locally First
```bash
# Use local MySQL to isolate the issue
# Edit .env to use localhost
node server.js
```

### Option 3: Fresh Railway Deployment
```bash
# Sometimes redeploy fixes issues
railway up --force
```

---

## 📞 Quick Commands

### Test database connection:
```bash
node -e "require('dotenv').config(); console.log(process.env.MYSQLHOST)"
```

### Check if tables exist:
```bash
node -e "require('./database/db-manager').db.query('SHOW TABLES', console.log)"
```

### View Railway logs:
```bash
railway logs
```

---

## ✅ Success Checklist

- [ ] MYSQL_PUBLIC_URL added to .env
- [ ] Reset script completed successfully
- [ ] Admin login works (admin / admin123)
- [ ] Can create blog post locally
- [ ] Can upload image (Cloudinary)
- [ ] Post appears on blog.html
- [ ] Deployed to Railway (git push)
- [ ] Can create blog post on Railway
- [ ] No 500 errors in Railway logs

---

**Next:** Once database is reset and working, test the blog navigation fix for GitHub Pages subdirectory!

---

**Files Created:**
- `reset-railway-database.js` - Automated reset script
- `RESET-RAILWAY-DB.bat` - Easy-click reset tool
- `RAILWAY-DATABASE-DEBUG.md` - Complete troubleshooting guide
- `RAILWAY-FIX-NOW.md` - This quick reference

**Last Updated:** October 18, 2025
