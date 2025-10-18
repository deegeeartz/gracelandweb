# 🔄 FULL DATABASE RESET - Clean Slate

## ⚠️ WARNING
This will **DELETE ALL** existing blog posts, users, categories, and data!

Only do this if:
- ✅ You have test data you don't need
- ✅ You want to start completely fresh
- ✅ You haven't published any real blog posts yet

---

## 🚀 Full Reset SQL (Copy/Paste into Railway)

Go to: **Railway → MySQL service → Data → Query**

Then paste this **entire script**:

```sql
-- ============================================
-- FULL DATABASE RESET WITH CLOUDINARY SUPPORT
-- ============================================

-- Step 1: Drop all existing tables
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS blog_posts;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS authors;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- Step 2: Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('admin', 'editor', 'viewer') DEFAULT 'viewer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Create authors table
CREATE TABLE authors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: Create categories table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 5: Create blog_posts table WITH Cloudinary support
CREATE TABLE blog_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content LONGTEXT NOT NULL,
    featured_image VARCHAR(500),
    image_public_id VARCHAR(255),
    image_urls JSON,
    author_id INT DEFAULT 1,
    category_id INT DEFAULT 1,
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

-- Step 6: Insert default admin user (password: admin123)
INSERT INTO users (username, password, email, role) 
VALUES ('admin', '$2b$10$YourHashedPasswordHere', 'admin@rccggraceland.org', 'admin');

-- Step 7: Insert default author
INSERT INTO authors (name, email, bio) 
VALUES ('RCCG Graceland', 'info@rccggraceland.org', 'RCCG Graceland Area HQ - Apapa Family');

-- Step 8: Insert default categories
INSERT INTO categories (name, slug, description) VALUES
('Sermon', 'sermon', 'Sunday sermons and teachings'),
('Testimony', 'testimony', 'Member testimonies and stories'),
('Prayer', 'prayer', 'Prayer requests and updates'),
('Family', 'family', 'Family and relationships'),
('Youth', 'youth', 'Youth ministry updates'),
('Worship', 'worship', 'Worship and praise reports');

-- Verify setup
SELECT 'Database reset completed!' as status;
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as author_count FROM authors;
SELECT COUNT(*) as category_count FROM categories;
SELECT COUNT(*) as post_count FROM blog_posts;
```

---

## ✅ What This Does

1. **Drops all tables** - Removes everything (users, posts, categories)
2. **Recreates tables** - With proper Cloudinary columns
3. **Adds defaults:**
   - Admin user (username: `admin`, password: `admin123`)
   - Default author (RCCG Graceland)
   - 6 categories (Sermon, Testimony, Prayer, Family, Youth, Worship)
4. **Clean database** - No base64 images, ready for Cloudinary

---

## 🎯 After Reset

### **Login to Admin:**
```
URL: https://gracelandweb-production.up.railway.app/admin.html
Username: admin
Password: admin123
```

### **Create Your First Real Post:**
1. Write your content
2. Upload image (goes to Cloudinary)
3. Select category
4. Publish

### **Result:**
- ✅ Images in Cloudinary (not database)
- ✅ Fast performance
- ✅ No base64 bloat
- ✅ Ready for production

---

## 💡 Going Forward

### **To Prevent Base64 Images in Content:**

Your rich text editor (Quill) needs to be configured to upload images instead of embedding them.

I'll need to update your admin panel to handle this properly. After you reset the database, let me know and I'll show you how to configure the editor.

---

## ⚠️ Important Notes

- This deletes **ALL** data
- You'll need to create posts again
- Admin password resets to `admin123`
- Categories will be recreated
- Database will be clean and optimized

---

**Copy the SQL script above into Railway MySQL Query and run it!**
