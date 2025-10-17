# ✅ Quick Deployment Checklist

## 🎯 Step-by-Step Guide

### STEP 1: Test Locally ✨
- [ ] MySQL80 service is running
- [ ] Run `npm start` in terminal
- [ ] Open http://localhost:3000
- [ ] Test home page loads
- [ ] Test blog page loads
- [ ] Test admin panel (login: admin / admin123)
- [ ] Create a test blog post
- [ ] Verify blog post appears on blog page
- [ ] Open browser console (F12) - no errors

### STEP 2: Test Environment Configuration 🧪
- [ ] Open `test-environment.html` in browser
- [ ] Verify "Environment: development"
- [ ] Verify "API URL: http://localhost:3000/api"
- [ ] Click "Test Backend Connection"
- [ ] Should show "✅ Backend Connection Successful!"

### STEP 3: Run SEO Tests 🔍
```bash
node tests/seo-validator.js
```
- [ ] Overall score should be 90%+
- [ ] All pages should pass most tests

### STEP 4: Prepare for Production 🚀

#### A. Change Admin Password
- [ ] Login to admin panel
- [ ] Change password from default (admin123)
- [ ] Note down new password securely

#### B. Generate JWT Secret
```bash
# In PowerShell:
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | % {[char]$_})
```
- [ ] Copy generated secret
- [ ] Save for use in production .env

#### C. Update Frontend Configuration
Open `config/environment.js`, line 13:
```javascript
// Replace this line:
return 'https://your-backend-app.railway.app/api';

// With YOUR actual backend URL (after deploying):
return 'https://rccg-graceland-production.up.railway.app/api';
//      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ YOUR URL
```
- [ ] Update with your Railway/Render URL (see Step 5)

### STEP 5: Deploy Backend 🔧

#### Option A: Railway (Recommended)

1. **Sign Up**
   - [ ] Visit https://railway.app
   - [ ] Sign up with GitHub

2. **Create Project**
   - [ ] Click "New Project"
   - [ ] Select "Deploy from GitHub repo"
   - [ ] Authorize Railway
   - [ ] Select `rccg-graceland-website` repository

3. **Add MySQL Database**
   - [ ] In Railway project, click "+ New"
   - [ ] Select "Database" → "Add MySQL"
   - [ ] Wait for provisioning (1-2 minutes)

4. **Configure Environment Variables**
   - [ ] Click your service → "Variables" tab
   - [ ] Add these variables:
     ```
     NODE_ENV=production
     PORT=3000
     JWT_SECRET=<paste-your-generated-secret>
     ```
   - [ ] Railway auto-fills DB_* variables from MySQL

5. **Get Your Backend URL**
   - [ ] Click your service → "Settings" tab
   - [ ] Find "Domains" section
   - [ ] Copy your Railway URL (e.g., `rccg-graceland-production.up.railway.app`)
   - [ ] **SAVE THIS URL** - you'll need it!

6. **Initialize Database**
   - [ ] Click your service → "Deployments" tab
   - [ ] Wait for deployment to complete (green checkmark)
   - [ ] Go to MySQL database → "Connect" tab
   - [ ] Use Railway CLI or run init script

#### Option B: Render

1. **Sign Up**
   - [ ] Visit https://render.com
   - [ ] Sign up with GitHub

2. **Create Web Service**
   - [ ] Click "New +" → "Web Service"
   - [ ] Connect GitHub repository
   - [ ] Configure:
     - Name: rccg-graceland-backend
     - Environment: Node
     - Build Command: `npm install`
     - Start Command: `npm start`

3. **Add Environment Variables**
   - [ ] In service settings → "Environment"
   - [ ] Add all variables (see Railway list above)
   - [ ] Plus DB_* variables from your MySQL provider

4. **Get External MySQL**
   - [ ] Sign up at https://planetscale.com
   - [ ] Create database: `graceland_church`
   - [ ] Get connection string
   - [ ] Add to Render environment variables

5. **Get Your Backend URL**
   - [ ] Copy Render URL (e.g., `rccg-graceland.onrender.com`)
   - [ ] **SAVE THIS URL**

### STEP 6: Update Frontend with Backend URL 🔗
- [ ] Open `config/environment.js`
- [ ] Replace `'your-backend-app.railway.app'` with YOUR URL from Step 5
- [ ] Save file
- [ ] Commit changes:
  ```bash
  git add config/environment.js
  git commit -m "Update production backend URL"
  git push origin main
  ```

### STEP 7: Deploy Frontend to GitHub Pages 🌐

1. **Create GitHub Repository**
   ```bash
   # In PowerShell:
   git init
   git add .
   git commit -m "Initial commit: RCCG Graceland Website"
   ```
   - [ ] Go to https://github.com/new
   - [ ] Repository name: `rccg-graceland-website`
   - [ ] Public or Private (your choice)
   - [ ] Click "Create repository"

2. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/rccg-graceland-website.git
   git branch -M main
   git push -u origin main
   ```
   - [ ] Replace `YOUR_USERNAME` with your GitHub username

3. **Enable GitHub Pages**
   - [ ] Go to repository → Settings → Pages
   - [ ] Source: "Deploy from a branch"
   - [ ] Branch: "main" / "(root)"
   - [ ] Click "Save"
   - [ ] Wait 2-3 minutes

4. **Get Your Website URL**
   - [ ] Your site will be at:
     ```
     https://YOUR_USERNAME.github.io/rccg-graceland-website/
     ```
   - [ ] **SAVE THIS URL** - this is your live website!

### STEP 8: Test Production Site 🧪

1. **Open Your GitHub Pages URL**
   - [ ] Visit your GitHub Pages URL
   - [ ] Home page should load
   - [ ] Check browser console (F12) for:
     ```
     🌍 Environment: production
     🔗 API URL: https://your-backend.railway.app/api
     ```

2. **Test Environment**
   - [ ] Navigate to `/test-environment.html`
   - [ ] Should show "Environment: production"
   - [ ] Click "Test Backend Connection"
   - [ ] Should show success message

3. **Test Features**
   - [ ] Click "Blog" in navigation
   - [ ] Blog page should load
   - [ ] Click on a blog post
   - [ ] Post should open and display correctly
   - [ ] Navigate to `/admin.html`
   - [ ] Login with your credentials
   - [ ] Admin panel should work

### STEP 9: SEO Setup 🔍

1. **Google Search Console**
   - [ ] Visit https://search.google.com/search-console
   - [ ] Add your GitHub Pages URL as property
   - [ ] Verify ownership
   - [ ] Submit sitemap: `https://YOUR_URL/sitemap.xml`

2. **Google Analytics** (Optional)
   - [ ] Create GA4 property
   - [ ] Get tracking code
   - [ ] Add to all HTML pages before `</head>`

### STEP 10: Final Checks ✅

- [ ] Website loads on desktop
- [ ] Website loads on mobile
- [ ] All navigation links work
- [ ] Blog posts load correctly
- [ ] Admin panel accessible
- [ ] No console errors
- [ ] Images load properly
- [ ] Forms submit correctly

### STEP 11: Launch! 🎉

- [ ] Share your website URL with church members
- [ ] Post on social media
- [ ] Update church materials with new website
- [ ] Create welcome blog post
- [ ] Upload church photos
- [ ] Add sermon content

---

## 🆘 Troubleshooting

### "Environment shows development on GitHub Pages"
**Fix:** Make sure you updated `config/environment.js` with production URL and pushed to GitHub

### "CORS Error in console"
**Fix:** Update `server.js` CORS settings to include your GitHub Pages URL:
```javascript
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://YOUR_USERNAME.github.io'
    ]
}));
```

### "Backend connection failed"
**Fix:** 
1. Check backend URL in `config/environment.js`
2. Verify backend is deployed and running
3. Test backend health: `https://YOUR_BACKEND_URL/api/health`

### "Database connection error"
**Fix:** Check environment variables in Railway/Render dashboard match MySQL credentials

---

## 📞 Quick Reference

### Local Development
```bash
# Start server
npm start

# Access site
http://localhost:3000
```

### Production URLs
```
Frontend: https://YOUR_USERNAME.github.io/rccg-graceland-website/
Backend: https://your-app.railway.app
Admin: https://YOUR_USERNAME.github.io/rccg-graceland-website/admin.html
```

### Default Login
```
Username: admin
Password: <your-new-password>
```

### Important Commands
```bash
# Test environment
Open: test-environment.html

# Run SEO tests
node tests/seo-validator.js

# Check backend health
curl https://your-backend-url/api/health

# Deploy changes
git add .
git commit -m "Update description"
git push origin main
```

---

## ✨ You're Done!

Your church website is now live and serving God's kingdom! 🙏

**May this website bring many souls to Christ! Amen!** 🌟
