# 🧪 Complete Testing Guide

## Quick Start

**Option 1: Automated Testing (Easiest)**
```bash
# Double-click this file:
RUN-TESTS.bat

# Or run in PowerShell:
.\test-and-deploy.ps1

# Or run Node.js tests directly:
node run-all-tests.js
```

**Option 2: Manual Step-by-Step Testing**

Follow the sections below to manually test each component.

---

## ✅ Test Checklist

### 1. Environment Configuration (5 min)

- [ ] `.env` file exists with all credentials
- [ ] Cloudinary API key is NEW rotated key (522773987982955)
- [ ] `.env` is in `.gitignore`
- [ ] Railway environment variables are set

**How to verify:**
```bash
node run-all-tests.js
```

Look for:
- ✅ All environment variables set
- ✅ MYSQLHOST ends with `.railway.internal`
- ✅ Using NEW Cloudinary API key

---

### 2. Database Schema (5 min)

- [ ] `image_public_id` column exists in `blog_posts` table
- [ ] `image_urls` JSON column exists
- [ ] Index on `image_public_id` created

**How to verify:**

**Option A: Run migration script**
```bash
node database/migrate-cloudinary.js
```

**Option B: Check manually**
```sql
SHOW COLUMNS FROM blog_posts WHERE Field IN ('image_public_id', 'image_urls');
```

Expected output:
```
image_public_id | VARCHAR(255) | YES | NULL
image_urls      | JSON         | YES | NULL
```

---

### 3. Bug Fix #1: Cloudinary Image Upload (10 min)

**Test that images upload to Cloudinary instead of database**

- [ ] Start server: `node server.js`
- [ ] Open http://localhost:3000/admin.html
- [ ] Login with credentials
- [ ] Click "New Post"
- [ ] Upload an image (drag & drop or click)
- [ ] Fill in post details
- [ ] Click "Publish"
- [ ] Open Cloudinary dashboard (https://cloudinary.com/console)
- [ ] Verify image appears in `graceland-church` folder
- [ ] Check database: `image_public_id` should be populated (not base64 data)

**Expected Results:**
```sql
SELECT id, title, image_public_id, featured_image 
FROM blog_posts 
ORDER BY id DESC LIMIT 1;

-- Should show:
-- image_public_id: "graceland-church/xyz123"
-- featured_image: "https://res.cloudinary.com/dxepqoloh/..."
```

**NOT:**
```sql
-- ❌ BAD (old behavior):
-- featured_image: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
```

---

### 4. Bug Fix #2: Blog Post Links (5 min)

**Test that blog links work on different environments**

- [ ] Server running: `node server.js`
- [ ] Open http://localhost:3000/blog.html
- [ ] Click any blog post title or "Read More"
- [ ] Verify it opens `http://localhost:3000/post.html?id=X` (NOT GitHub URL)
- [ ] Post loads correctly without 404 error

**Test on Railway (after deployment):**
- [ ] Open https://your-app.up.railway.app/blog.html
- [ ] Click blog post
- [ ] Should open: `https://your-app.up.railway.app/post.html?id=X`
- [ ] NOT: `https://deegeeartz.github.io/post.html?id=X`

**Code Verification:**
```bash
# Check blog-script-db.js uses dynamic base URL
grep -n "ENV.baseUrl" blog-script-db.js

# Should show:
# const baseUrl = window.ENV ? window.ENV.baseUrl : window.location.origin;
```

---

### 5. Security: API Key Rotation (2 min)

**Verify new Cloudinary credentials are active**

- [ ] Check `.env` file
- [ ] Cloudinary API key = `522773987982955` (NEW)
- [ ] NOT `133537346964831` (OLD - exposed)

**Test upload with new keys:**
- [ ] Upload image through admin panel
- [ ] Should succeed (keys are valid)
- [ ] Check Cloudinary dashboard - image appears

---

### 6. Railway Private Network (2 min)

**Verify using FREE internal network (not costly public network)**

- [ ] Check Railway dashboard → Variables tab
- [ ] `MYSQLHOST` exists and ends with `.railway.internal`
- [ ] `MYSQL_PUBLIC_URL` exists but is NOT used in code

**Code Verification:**
```bash
# Check db-manager.js uses MYSQLHOST
grep -n "MYSQLHOST" database/db-manager.js

# Should show:
# host: process.env.MYSQLHOST || ...
```

**Railway Logs (after deployment):**
```
✅ MySQL Configuration: {
  host: 'mysql.railway.internal',  ← Should be .railway.internal
  ...
}
```

**NOT:**
```
❌ host: 'proxy.railway.app'  ← This costs money!
```

---

### 7. Performance Testing (Optional - 5 min)

**Test image optimization improvements**

- [ ] Open blog post with images
- [ ] Open DevTools (F12) → Network tab
- [ ] Check image file sizes

**Expected:**
- Original: 2.5 MB
- Cloudinary optimized: 250 KB (90% reduction)
- Page load: < 1 second

**Lighthouse Audit:**
- [ ] Open DevTools → Lighthouse tab
- [ ] Run audit
- [ ] Performance score: 90+ (was ~45 before)

---

## 🚀 Deployment Testing

### Local → Railway Deployment

**Step 1: Commit Changes**
```bash
git status
git add .
git commit -m "Fix: Cloudinary integration & blog link navigation"
git push
```

**Step 2: Monitor Railway Deployment**
- [ ] Open Railway dashboard
- [ ] Check deployment logs
- [ ] Wait for build to complete (~2-3 minutes)
- [ ] Check for errors in logs

**Step 3: Test Production Site**
- [ ] Open your Railway URL: https://your-app.up.railway.app
- [ ] Test image upload in admin
- [ ] Test blog post links
- [ ] Check browser console for errors
- [ ] Verify images load from Cloudinary CDN

**Step 4: Verify Railway Variables**
- [ ] Railway → Settings → Variables
- [ ] All Cloudinary variables set:
  - `CLOUDINARY_CLOUD_NAME=dxepqoloh`
  - `CLOUDINARY_API_KEY=522773987982955`
  - `CLOUDINARY_API_SECRET=zSqc9-t9LsmeoQWOtG4uPQap91E`
  - `CLOUDINARY_FOLDER=graceland-church`
- [ ] All MySQL variables set:
  - `MYSQLHOST` (ends with .railway.internal)
  - `MYSQLPORT=3306`
  - `MYSQLUSER`
  - `MYSQLPASSWORD`
  - `MYSQLDATABASE`

---

## 🐛 Troubleshooting

### Issue: Images Still Saving to Database

**Symptom:** `featured_image` contains base64 data instead of Cloudinary URL

**Solutions:**
1. Check database schema has new columns:
   ```bash
   node database/migrate-cloudinary.js
   ```

2. Verify admin routes accept Cloudinary parameters:
   ```bash
   grep -n "image_public_id" routes/admin.js
   ```

3. Clear browser cache and test again

### Issue: Blog Links Still Show 404

**Symptom:** Clicking blog post shows GitHub URL or 404 error

**Solutions:**
1. Clear browser cache (Ctrl+F5)
2. Verify `config/environment.js` has `getBaseUrl()`:
   ```bash
   grep -n "getBaseUrl" config/environment.js
   ```

3. Check `blog-script-db.js` uses `ENV.baseUrl`:
   ```bash
   grep -n "ENV.baseUrl" blog-script-db.js
   ```

### Issue: Cloudinary Upload Fails

**Symptom:** Error when uploading images

**Solutions:**
1. Verify Cloudinary credentials in `.env`:
   ```bash
   node -e "require('dotenv').config(); console.log('API Key:', process.env.CLOUDINARY_API_KEY);"
   ```

2. Check Cloudinary dashboard for API key validity

3. Verify `CLOUDINARY_FOLDER=graceland-church` exists

### Issue: Railway Egress Fees Warning

**Symptom:** Railway shows warning about public endpoint usage

**Solutions:**
1. This is normal - Railway auto-creates both variables
2. Verify code uses `MYSQLHOST` (not `MYSQL_PUBLIC_URL`):
   ```bash
   grep -r "MYSQL_PUBLIC" . --exclude-dir=node_modules
   ```
3. Should only appear in documentation, not in code
4. Optional: Delete `MYSQL_PUBLIC_URL` from Railway dashboard

---

## 📊 Success Criteria

### All Tests Pass When:

✅ **Environment:**
- All variables set correctly
- Using private network (MYSQLHOST = mysql.railway.internal)
- Using NEW Cloudinary keys

✅ **Database:**
- `image_public_id` column exists
- `image_urls` JSON column exists
- Index created

✅ **Image Upload:**
- Images upload to Cloudinary
- Database stores Cloudinary URL (not base64)
- `image_public_id` populated
- `image_urls` has all sizes

✅ **Blog Navigation:**
- Links use current domain (not hardcoded GitHub URL)
- Post pages load without 404
- Works on localhost and Railway

✅ **Security:**
- Old API keys rotated
- `.env` not in Git
- Railway variables secure

✅ **Performance:**
- Image sizes reduced 90%
- Page load < 1 second
- Lighthouse score 90+

---

## 🎯 Next Steps After All Tests Pass

1. **Monitor Production:**
   - Check Railway logs for errors
   - Monitor Cloudinary usage
   - Track database storage savings

2. **User Testing:**
   - Have admin users test image uploads
   - Get feedback on blog navigation
   - Check mobile devices

3. **Documentation:**
   - Update README with any new findings
   - Document any additional fixes

4. **Optimization:**
   - Run Lighthouse audits regularly
   - Monitor performance metrics
   - Optimize as needed

---

## 📞 Support

**If Tests Fail:**
1. Review error messages carefully
2. Check troubleshooting section above
3. Review recent Git commits for changes
4. Check documentation:
   - QUICK-START-GUIDE.md
   - CLOUDINARY-GUIDE.md
   - RAILWAY-PRIVATE-NETWORK.md

**Still Stuck?**
- Review CHANGELOG.md for recent changes
- Check Railway deployment logs
- Verify all environment variables

---

**Last Updated:** 2025-10-18  
**Version:** 2.0.0  
**Status:** Ready for Testing
