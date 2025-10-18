# 🚀 URGENT: Fix Your Admin Panel Access

## ⚠️ Current Problem
Your admin panel can't connect because:
1. ❌ `config/environment.js` has placeholder URL: `https://your-backend-app.railway.app/api`
2. ❌ CORS is blocking GitHub Pages from accessing Railway backend

---

## ✅ Solution (5 Minutes)

### STEP 1: Find Your Railway Backend URL

**Go to:** https://railway.app/dashboard

**You'll see something like this:**
```
My Project
├── 🌐 gracelandweb (Web Service)    ← Click this one!
└── 🗄️ mysql (Database)              ← NOT this one
```

**Click on the Web Service → Settings → Domains**

**Copy the URL (looks like):**
```
gracelandweb-production.up.railway.app
```

---

### STEP 2: Update Your Code

**Open PowerShell and run:**
```powershell
cd c:\Users\PC\Documents\gracelandweb
node update-backend-url.js https://YOUR-ACTUAL-URL.up.railway.app
```

**Replace `YOUR-ACTUAL-URL` with what you copied from Railway!**

**Example:**
```powershell
node update-backend-url.js https://gracelandweb-production.up.railway.app
```

---

### STEP 3: Fix CORS

**The script will ask if you want to update CORS. Type `yes`**

This allows GitHub Pages (`https://deegeeartz.github.io`) to access your backend.

---

### STEP 4: Deploy Changes

```powershell
git add config/environment.js server.js
git commit -m "Fix: Update Railway backend URL and CORS"
git push
```

---

### STEP 5: Wait & Test

1. **Wait 2-3 minutes** for Railway to redeploy
2. **Go to:** https://deegeeartz.github.io/gracelandweb/admin.html
3. **Try logging in** with your admin credentials
4. **Should work!** ✅

---

## 🆘 Quick Reference

### Backend URL = Where your Node.js server lives
- ✅ Example: `https://gracelandweb-production.up.railway.app`
- ✅ Found: Railway → Web Service → Settings → Domains
- ✅ Used for: API calls from frontend

### Database URL = MySQL connection (different!)
- ❌ Example: `mysql://root:pass@mysql.railway.internal:3306/railway`
- ❌ Found: Railway → MySQL Service → Variables
- ❌ NOT used in frontend!

---

## 📞 Can't Find Your Railway URL?

Run this command to open Railway in your browser:
```powershell
start https://railway.app/dashboard
```

Then:
1. Click your project name
2. Look for **TWO boxes** on the screen
3. Click the one that says **"Web Service"** or shows deployment logs
4. Click **"Settings"** at the top
5. Scroll to **"Domains"** section
6. **Copy the URL you see there**

That's your backend URL! 🎯

---

## ⏱️ Timeline
- **Step 1-2:** 2 minutes (find URL + update)
- **Step 3:** 30 seconds (commit)
- **Step 4:** 2-3 minutes (Railway redeploys)
- **Step 5:** 10 seconds (test)
- **Total:** ~5 minutes

---

## ✨ After This Works

You'll be able to:
- ✅ Access admin panel from GitHub Pages
- ✅ Login with admin credentials
- ✅ Create/edit blog posts
- ✅ Manage church content
- ✅ Upload images

Your website will be **100% live** on the internet! 🌍
