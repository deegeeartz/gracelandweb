# 🔧 Railway Database Connection Issues - DEBUG GUIDE

## 🚨 Current Problems

### 1. **500 Error When Creating Blog Posts**
```
POST https://gracelandweb-production.up.railway.app/api/admin/posts 500 (Internal Server Error)
Error: Failed to create blog post
```

### 2. **Database Not Clearing Old Data**
- Old blog posts still showing
- Want fresh start with empty tables

---

## 🔍 Step-by-Step Diagnosis

### **STEP 1: Check Railway Deployment Logs**

This is the MOST IMPORTANT step to see the actual error!

1. **Go to Railway Dashboard:**
   ```
   https://railway.app/dashboard
   ```

2. **Select Your Project:**
   - Click on your `gracelandweb` project

3. **Open Deployments Tab:**
   - Click "Deployments" in the left sidebar
   - Click on the most recent deployment

4. **View Logs:**
   - Click "View Logs"
   - Look for error messages when you try to create a post

**Common errors you might see:**

#### Error A: Database Connection Failed
```
Error: connect ECONNREFUSED mysql.railway.internal:3306
```
**Solution:** MySQL service not running or wrong credentials

#### Error B: Table Doesn't Exist
```
Error: Table 'railway.blog_posts' doesn't exist
```
**Solution:** Need to run database initialization

#### Error C: Column Missing
```
Error: Unknown column 'image_public_id' in 'field list'
```
**Solution:** Need to run migration for Cloudinary columns

#### Error D: Foreign Key Constraint
```
Error: Cannot add or update a child row: a foreign key constraint fails
```
**Solution:** Category or author doesn't exist

---

## 🛠️ SOLUTIONS

### Solution 1: Verify Railway Environment Variables

1. **Go to Railway Project → Variables Tab**

2. **Check these variables exist:**
   ```bash
   MYSQLHOST=mysql.railway.internal
   MYSQLPORT=3306
   MYSQLUSER=root
   MYSQLPASSWORD=<your-password>
   MYSQLDATABASE=railway
   
   # Also check for:
   JWT_SECRET=<your-secret>
   CLOUDINARY_CLOUD_NAME=<your-cloud-name>
   CLOUDINARY_API_KEY=522773987982955
   CLOUDINARY_API_SECRET=<your-secret>
   ```

3. **If any are missing, add them**

---

### Solution 2: Reset and Reinitialize Database

We need to clear old data and recreate tables with Cloudinary support.

#### **Option A: Using Railway MySQL Plugin Dashboard**

1. **Go to Railway Dashboard**
2. **Click on MySQL service** (not web service)
3. **Click "Data" tab**
4. **Click "Query"**
5. **Run these commands one by one:**

```sql
-- 1. Drop all tables (clears old data)
DROP TABLE IF EXISTS blog_posts;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS authors;
DROP TABLE IF EXISTS users;

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

-- 5. Create blog_posts table WITH Cloudinary support
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

-- 6. Insert default admin user
INSERT INTO users (username, password, email, role) 
VALUES ('admin', '$2b$10$XqN5YfZJ9X.Vk8aL5QZ0.eK3xN5YfZJ9X.Vk8aL5QZ0.eK3xN5YfZ', 'admin@rccggraceland.org', 'admin');

-- 7. Insert default author
INSERT INTO authors (name, email, bio) 
VALUES ('RCCG Graceland', 'info@rccggraceland.org', 'RCCG Graceland Area HQ - Apapa Family');

-- 8. Insert default categories
INSERT INTO categories (name, slug, description) VALUES
('Sermon', 'sermon', 'Sunday sermons and teachings'),
('Testimony', 'testimony', 'Member testimonies and stories'),
('Prayer', 'prayer', 'Prayer requests and updates'),
('Family', 'family', 'Family and relationships'),
('Youth', 'youth', 'Youth ministry updates'),
('Worship', 'worship', 'Worship and praise reports');
```

#### **Option B: Using TablePlus or MySQL Workbench**

1. **Get MySQL Public URL from Railway:**
   - Go to MySQL service → Variables
   - Copy `MYSQL_PUBLIC_URL`
   - Example: `mysql://root:password@proxy.railway.app:1234/railway`

2. **Connect with TablePlus:**
   - Host: `proxy.railway.app`
   - Port: `1234` (from URL)
   - User: `root`
   - Password: (from URL)
   - Database: `railway`

3. **Run the SQL commands above**

#### **Option C: Create a Reset Script**

I'll create a script you can run locally to reset the database:

---

### Solution 3: Check Railway Deployment Status

1. **Go to Railway → Deployments**
2. **Check deployment status:**
   - ✅ Green checkmark = Deployed successfully
   - 🔄 Building = Still deploying
   - ❌ Red X = Deployment failed

3. **If deployment failed:**
   - Click on it to see build logs
   - Look for errors in the logs
   - Common issues:
     - Missing dependencies
     - Syntax errors
     - Port conflicts

---

## 📝 Database Reset Script (EASIEST METHOD)

I've created an automated script to reset your database!

### **How to Use:**

1. **Get your Railway MySQL Public URL:**
   ```bash
   # Go to Railway Dashboard
   # → Click MySQL service (not web service)
   # → Click "Variables" tab
   # → Copy the MYSQL_PUBLIC_URL value
   # Example: mysql://root:password@proxy.railway.app:1234/railway
   ```

2. **Add it to your .env file:**
   ```bash
   # Open .env file and add:
   MYSQL_PUBLIC_URL=mysql://root:password@proxy.railway.app:1234/railway
   ```

3. **Run the reset script:**
   ```bash
   # Double-click this file:
   RESET-RAILWAY-DB.bat
   
   # Or run in terminal:
   node reset-railway-database.js
   ```

4. **What it does:**
   - ✅ Drops all old tables (clears data)
   - ✅ Creates fresh tables with Cloudinary support
   - ✅ Adds default admin user (username: admin, password: admin123)
   - ✅ Adds default author (RCCG Graceland)
   - ✅ Adds default categories (Sermon, Testimony, Prayer, etc.)

5. **After reset:**
   ```bash
   # Test locally first:
   node server.js
   # Open: http://localhost:3000/admin.html
   # Login: admin / admin123
   # Try creating a post
   
   # If it works, deploy to Railway:
   git add .
   git commit -m "Database reset and working"
   git push
   ```

---

## 🔍 Alternative: Manual Railway Query Method

If the script doesn't work, you can reset manually:

1. **Go to Railway Dashboard**
2. **Click on MySQL service** (NOT the web service)
3. **Click "Data" tab**
4. **Click "Query" button**
5. **Copy and paste the SQL commands from the script above**
6. **Run them one by one**

---

## 🚨 Most Common Issues & Fixes

### Issue 1: "MYSQL_PUBLIC_URL not found"
**Fix:**
```bash
# Add to .env file:
MYSQL_PUBLIC_URL=<copy from Railway>
```

### Issue 2: "Connection refused"
**Fix:**
- Make sure MySQL service is running in Railway
- Check the URL is correct
- Verify you copied the full URL including password

### Issue 3: "Access denied"
**Fix:**
- Check the password in the URL is correct
- Try copying MYSQL_PUBLIC_URL again from Railway

### Issue 4: "Table already exists"
**Fix:**
- The script drops tables first, but if it fails:
- Run: `DROP TABLE IF EXISTS blog_posts, categories, authors, users;`
- Then run the script again

---

## ✅ Testing Checklist

After resetting the database:

### Test Locally:
- [ ] Start server: `node server.js`
- [ ] Open: http://localhost:3000/admin.html
- [ ] Login: admin / admin123
- [ ] Create a test blog post
- [ ] Check it appears in blog.html
- [ ] Delete the test post

### Test on Railway:
- [ ] Push to GitHub: `git push`
- [ ] Wait 2 minutes for Railway to deploy
- [ ] Open: https://gracelandweb-production.up.railway.app/admin.html
- [ ] Login: admin / admin123
- [ ] Create a blog post with Cloudinary image
- [ ] Verify post appears on blog page
- [ ] Check Railway logs show no errors

---

## 📊 Expected Result

After running the reset script, you should see:

```
✅ Database reset completed successfully!

📊 Database Status:
   - Users: 1
   - Authors: 1
   - Categories: 6
   - Blog Posts: 0

🎉 Your database is now ready to use!
```

---

## 🆘 Still Having Issues?

### Step 1: Check Railway Deployment Logs
```
1. Go to Railway Dashboard
2. Click on your web service (gracelandweb)
3. Click "Deployments"
4. Click on latest deployment
5. Click "View Logs"
6. Look for error messages
```

### Step 2: Check Server Logs When Creating Post
```
1. Open Railway logs
2. Try creating a post from admin panel
3. Watch logs in real-time
4. Copy any error messages
```

### Common Error Messages:

**Error:** `Table 'railway.blog_posts' doesn't exist`
**Fix:** Run the reset script

**Error:** `Unknown column 'image_public_id'`
**Fix:** Run the reset script (adds Cloudinary columns)

**Error:** `Foreign key constraint fails`
**Fix:** Make sure author_id=1 and category_id is valid (1-6)

**Error:** `Cannot add or update a child row`
**Fix:** Reset database to create default author and categories

---

## 📞 Quick Support Commands

### Check if tables exist:
```sql
SHOW TABLES;
```

### Check blog_posts structure:
```sql
DESCRIBE blog_posts;
```

### Check if Cloudinary columns exist:
```sql
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'blog_posts' 
AND COLUMN_NAME IN ('image_public_id', 'image_urls');
```

### Count records:
```sql
SELECT 
    (SELECT COUNT(*) FROM users) as users,
    (SELECT COUNT(*) FROM authors) as authors,
    (SELECT COUNT(*) FROM categories) as categories,
    (SELECT COUNT(*) FROM blog_posts) as posts;
```

---

**Last Updated:** October 18, 2025  
**Status:** Ready to use - run `RESET-RAILWAY-DB.bat`

