# 🔍 How to Find Your Railway Backend URL

## Step-by-Step Guide

### 1. Go to Railway Dashboard
- Visit: https://railway.app/dashboard
- Log in with your GitHub account

### 2. Open Your Project
- You should see your project (probably named "gracelandweb" or similar)
- Click on it

### 3. Identify the Web Service (NOT MySQL)
You'll see TWO services in your project:
- ✅ **Web Service** (your Node.js app) - This is what we need!
- ❌ **MySQL Database** - NOT this one

Look for the service with:
- Type: "Web Service" or "Node.js"
- Has "Deployments" tab
- Shows "Build Logs"

### 4. Click on the Web Service

### 5. Go to "Settings" Tab

### 6. Scroll Down to "Domains" Section

### 7. Copy Your Domain
You'll see something like:
```
gracelandweb-production.up.railway.app
```

The full URL will be:
```
https://gracelandweb-production.up.railway.app
```

---

## 🎯 What to Do Next

Once you have your backend URL (e.g., `https://gracelandweb-production.up.railway.app`):

### Option 1: Use the Update Script (Easy)
```powershell
cd c:\Users\PC\Documents\gracelandweb
node update-backend-url.js
```
When prompted, enter: `https://your-actual-railway-url.up.railway.app`

### Option 2: Manual Edit
Open `config/environment.js` and change line 13:

**BEFORE:**
```javascript
return 'https://your-backend-app.railway.app/api';
```

**AFTER:**
```javascript
return 'https://gracelandweb-production.up.railway.app/api';
```
*(Replace with your actual URL)*

---

## ❓ Still Can't Find It?

### Quick Check:
1. Railway dashboard → Your project
2. Count how many services you see
3. Click on the one that is **NOT** MySQL
4. Look for "Settings" → "Domains"

### If You Don't See a Domain:
1. Click "Settings" tab on your web service
2. Scroll to "Domains" section
3. Click "Generate Domain" button
4. Railway will create one for you: `something.up.railway.app`

---

## 📸 Visual Example

```
Railway Project: gracelandweb
├── 🌐 Web Service (gracelandweb)     ← THIS ONE!
│   ├── Deployments
│   ├── Logs
│   └── Settings
│       └── Domains: gracelandweb-production.up.railway.app ✅
│
└── 🗄️ MySQL Database (mysql)         ← NOT this one
    ├── Data
    ├── Variables (MYSQLHOST, etc.)
    └── Connect
```

---

## 🚨 Common Mistakes

❌ **Wrong:** Using the MySQL database URL
```
mysql://root:pass@mysql.railway.internal:3306/railway
```

✅ **Correct:** Using the web service domain
```
https://gracelandweb-production.up.railway.app
```

---

## 🎬 Next Steps After Finding URL

1. **Update `config/environment.js`** with your real Railway URL
2. **Update CORS in `server.js`** to allow your GitHub Pages domain
3. **Commit and push** changes to GitHub
4. Railway will auto-deploy
5. Test your admin panel again!

---

## Need More Help?

If you still can't find it, share a screenshot of your Railway dashboard and I'll help you locate it!
