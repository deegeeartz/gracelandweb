# 🎯 Quick Start Guide - RCCG Graceland Website

**Last Updated:** October 17, 2025  
**Version:** 1.0.0  
**Status:** 🟢 Production Ready

---

## 🚀 Quick Start (30 seconds)

```bash
# 1. Start the server
npm start

# 2. Open your browser
http://localhost:3000/admin.html

# 3. Login
Username: admin
Password: admin123
```

**That's it!** You're ready to manage your church website.

---

## 📖 Complete Website Tour

### 1️⃣ Main Website
**URL:** http://localhost:3000

**Features:**
- Church information
- Welcome message
- Quick links
- Contact information

---

### 2️⃣ Blog Section
**URL:** http://localhost:3000/blog.html

**Features:**
- ✅ View all published posts
- ✅ Filter by category
- ✅ Search posts
- ✅ Pagination (6 posts per page)
- ✅ Recent posts sidebar

**How to Read a Post:**
1. Go to blog page
2. Click on any post card
3. You'll be redirected to full post view
4. Read, share, and enjoy!

---

### 3️⃣ Single Post Page (NEW!)
**URL:** http://localhost:3000/post.html?id=3

**Features:**
- ✅ Full post content
- ✅ Beautiful reading layout
- ✅ Social sharing buttons
- ✅ View counter
- ✅ Category badges
- ✅ Mobile responsive

**Direct Access:**
```
http://localhost:3000/post.html?id=1
http://localhost:3000/post.html?id=2
http://localhost:3000/post.html?id=3
```

---

### 4️⃣ Admin Panel
**URL:** http://localhost:3000/admin.html

**Default Login:**
- Username: `admin`
- Password: `admin123` ⚠️ Change this!

**Dashboard Features:**
- 📊 Total posts count
- 👁️ Total views
- ❤️ Total likes
- 🎤 Total sermons
- 📝 Recent posts list

---

## ✍️ How to Create a Blog Post

### Step-by-Step:

1. **Login to Admin**
   ```
   http://localhost:3000/admin.html
   Username: admin
   Password: admin123
   ```

2. **Go to Blog Posts**
   - Click "Blog Posts" in sidebar
   - Click "Create New Post" button

3. **Fill in Details**
   - **Title:** Your post title
   - **Slug:** URL-friendly version (auto-generated)
   - **Excerpt:** Short summary (optional)
   - **Content:** Use the rich text editor
   - **Category:** Choose from dropdown
   - **Featured Image:** Upload (optional)
   - **Status:** Draft or Published

4. **Save Post**
   - Click "Create Post" button
   - Post will be saved immediately

5. **View Your Post**
   - Go to http://localhost:3000/blog.html
   - Your post will appear in the list
   - Click to read it!

---

## 🎨 Rich Text Editor Features

### Available in Content Editor:

**Formatting:**
- Bold (Ctrl+B)
- Italic (Ctrl+I)
- Underline (Ctrl+U)
- Strikethrough

**Structure:**
- Headings (H1-H6)
- Paragraphs
- Blockquotes
- Code blocks

**Lists:**
- Bullet lists
- Numbered lists
- Nested lists

**Media:**
- Insert images
- Add links
- Embed videos (manual HTML)

**Alignment:**
- Left align
- Center align
- Right align
- Justify

---

## 📂 File Uploads

### How to Upload Images:

1. **In Post Editor:**
   - Click "Upload Featured Image"
   - Select image from computer
   - Image will be uploaded automatically
   - Preview appears instantly

2. **Supported Formats:**
   - JPG/JPEG
   - PNG
   - GIF
   - Max size: 5MB

3. **Image Storage:**
   - Stored in `/uploads/` folder
   - Accessible at: `http://localhost:3000/uploads/filename.jpg`

---

## 🎯 Common Tasks

### Task 1: Change Admin Password
```
1. Login to admin panel
2. Go to Settings
3. Click "Change Password"
4. Enter new password
5. Confirm password
6. Save changes
```

### Task 2: Create Category
```
1. Login to admin panel
2. Go to Categories
3. Click "Add Category"
4. Enter name (e.g., "Sermons")
5. Slug auto-generates
6. Add description (optional)
7. Save
```

### Task 3: Add Sermon
```
1. Login to admin panel
2. Go to Sermons
3. Click "Add Sermon"
4. Fill in details:
   - Title
   - Speaker
   - Date
   - Description
   - Audio file (optional)
5. Save sermon
```

### Task 4: Edit Post
```
1. Login to admin panel
2. Go to Blog Posts
3. Click "Edit" on any post
4. Make changes
5. Click "Update Post"
6. Changes saved instantly
```

### Task 5: Delete Post
```
1. Login to admin panel
2. Go to Blog Posts
3. Click "Delete" on any post
4. Confirm deletion
5. Post removed permanently
```

---

## 🔍 Search & Filter

### Search Posts:
```
1. Go to blog page
2. Use search box at top
3. Type keywords
4. Results filter automatically
```

### Filter by Category:
```
1. Go to blog page
2. Click category in sidebar
3. OR click category badge on post
4. Posts filtered instantly
```

---

## 📱 Mobile Access

### All pages are mobile responsive:
- ✅ Blog list
- ✅ Single post page
- ✅ Admin panel
- ✅ Forms and editors

### Test on Mobile:
```
1. Open browser on phone
2. Go to your server IP:
   http://192.168.1.X:3000
3. Everything works!
```

---

## 🔐 Security Features

### Already Implemented:
- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Rate limiting (100 requests/15min)
- ✅ Helmet security headers
- ✅ CORS protection
- ✅ SQL injection prevention
- ✅ XSS protection

### Recommended Actions:
1. ⚠️ Change default admin password
2. ⚠️ Update JWT_SECRET in .env
3. ⚠️ Enable HTTPS in production
4. ⚠️ Set up regular backups

---

## 🆘 Troubleshooting

### Problem: Can't Login
**Solution:**
```bash
# Reset to default password
node database/init-mysql.js
# Login with admin/admin123
```

### Problem: Posts Not Showing
**Solution:**
```
1. Check post status is "Published"
2. Verify published_at date is set
3. Check category is assigned
4. Refresh browser
```

### Problem: Images Not Uploading
**Solution:**
```
1. Check file size (must be < 5MB)
2. Check file format (JPG, PNG, GIF)
3. Verify uploads/ folder exists
4. Check folder permissions
```

### Problem: Server Won't Start
**Solution:**
```bash
# Check if MySQL is running
net start MySQL80

# Check if port 3000 is available
netstat -ano | findstr :3000

# Restart server
npm start
```

### Problem: Database Errors
**Solution:**
```bash
# Run diagnostics
node tests/diagnose-db.js

# Reinitialize database
node database/init-mysql.js
```

---

## 📊 API Reference (For Developers)

### Public Endpoints:
```javascript
GET  /api/blog              // All published posts
GET  /api/blog/:id          // Single post
GET  /api/blog/recent       // Recent posts
GET  /api/blog/categories   // All categories
GET  /api/sermons           // All sermons
```

### Admin Endpoints (Require Auth):
```javascript
POST /api/auth/login        // Login
GET  /api/admin/stats       // Dashboard stats
GET  /api/admin/posts       // All posts (including drafts)
POST /api/admin/posts       // Create post
PUT  /api/admin/posts/:id   // Update post
DEL  /api/admin/posts/:id   // Delete post
```

### Example API Call:
```javascript
// Login
const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
    })
});
const { token } = await response.json();

// Get admin stats
const stats = await fetch('/api/admin/stats', {
    headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## 🎓 Tips & Best Practices

### Writing Great Posts:
1. ✅ Use clear, descriptive titles
2. ✅ Write engaging excerpts
3. ✅ Add featured images
4. ✅ Use headings for structure
5. ✅ Include relevant categories
6. ✅ Proofread before publishing

### SEO Tips:
1. ✅ Use keywords in title
2. ✅ Write meta descriptions (excerpt)
3. ✅ Use descriptive slugs
4. ✅ Add alt text to images
5. ✅ Link to related posts

### Performance Tips:
1. ✅ Optimize images before upload
2. ✅ Keep posts under 2000 words
3. ✅ Use categories consistently
4. ✅ Delete unused posts
5. ✅ Clear browser cache

---

## 📞 Quick Links

### Main URLs:
- **Home:** http://localhost:3000
- **Blog:** http://localhost:3000/blog.html
- **Admin:** http://localhost:3000/admin.html
- **API Health:** http://localhost:3000/api/health

### Test Tools:
- **Admin Tests:** http://localhost:3000/tests/admin-test.html
- **Quick Tests:** http://localhost:3000/tests/quick-test.html

### Documentation:
- `README-OPTIMIZED.md` - Full documentation
- `BLOG-POST-FEATURE.md` - New post page features
- `FINAL-RESOLUTION.md` - Bug fixes summary
- `BUG-FIXED.md` - Technical details

---

## 🎉 You're All Set!

Your RCCG Graceland website is fully functional with:

✅ Beautiful blog system  
✅ Powerful admin panel  
✅ Dedicated post reading page  
✅ Social sharing features  
✅ Mobile responsive design  
✅ Secure authentication  
✅ Fast performance  
✅ Easy to use interface  

**Start creating amazing content for your church community!**

---

## 💡 Need Help?

### Check These Resources:
1. Run diagnostics: `node tests/diagnose-db.js`
2. Check server logs in terminal
3. Review documentation files
4. Test with: `http://localhost:3000/tests/admin-test.html`

### Common Commands:
```bash
npm start              # Start server
npm run init-db        # Initialize database
node tests/diagnose-db.js  # Check database
```

---

**Happy blogging! 🎊**

*For questions or issues, refer to the complete documentation in README-OPTIMIZED.md*
