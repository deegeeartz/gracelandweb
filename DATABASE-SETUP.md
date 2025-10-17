# 🗄️ Database Creation Guide - RCCG Graceland Website

## 🚀 Quick Setup (Recommended)

### **Option 1: Run the Batch File**
Simply double-click: `create-database.bat`
- Creates SQLite database
- Sets up all tables
- Adds sample church content
- Ready to use!

### **Option 2: PowerShell Script**
Right-click `create-database.ps1` → "Run with PowerShell"

### **Option 3: Manual Commands**
```bash
node database/init-db.js
node database/add-sample-data.js
npm start
```

---

## 📋 What Gets Created

### **Database Tables:**
1. **users** - Admin accounts for login
2. **categories** - Blog post categories
3. **blog_posts** - Church announcements and articles
4. **sermons** - Sermon recordings and notes
5. **settings** - Site configuration
6. **comments** - User comments (future feature)
7. **social_posts** - Social media integration

### **Sample Content:**
- ✅ 5 Sample blog posts about spiritual growth
- ✅ 3 Sample sermons with audio links
- ✅ 4 Blog categories (Spiritual Growth, Testimony, Ministry, Family)
- ✅ Basic site settings
- ✅ Default admin user (username: admin, password: admin123)

---

## 🔧 Database Details

**Type:** SQLite (single file database)
**Location:** `database/graceland.db`
**Size:** ~50KB with sample data
**Backup:** Simply copy the .db file

---

## 🎯 After Database Creation

### **1. Start the Website**
```bash
npm start
```

### **2. Access Your Site**
- **Main Website:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin.html

### **3. Login to Admin**
- **Username:** admin
- **Password:** admin123

### **4. Customize Content**
- Edit/delete sample posts
- Add your church information
- Upload your church logo
- Configure social media links

---

## 🔍 Verify Database Creation

After running the setup, you should see:
- ✅ `database/graceland.db` file created
- ✅ "Database initialized successfully" message
- ✅ "Sample data added" confirmation
- ✅ No error messages

---

## 🆘 Troubleshooting

### **If SQLite issues:**
1. Make sure Node.js is installed
2. Run `npm install` first
3. Check file permissions in database folder

### **If you prefer MySQL:**
1. Change `.env`: `DB_HOST=localhost`
2. Install MySQL server
3. Create database: `CREATE DATABASE graceland_church;`
4. Run: `npm run init-mysql`

---

## 🎉 Ready to Go!

Once database is created:
1. Your church website will be fully functional
2. Admin panel ready for content management
3. Blog system operational
4. Sermon management available
5. All features working locally

**Next:** Start customizing with your church's content!
