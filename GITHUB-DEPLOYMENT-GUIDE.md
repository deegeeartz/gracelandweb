# 🚀 GitHub Pages + Backend Deployment Guide
## RCCG Graceland Website - Hybrid Hosting Setup

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                        │
└────────────┬────────────────────────────────────────────┘
             │
             ├──────────────┐
             │              │
             ▼              ▼
   ┌─────────────┐   ┌──────────────┐
   │   STATIC     │   │   BACKEND    │
   │  (GitHub     │   │  (Railway/   │
   │   Pages)     │   │   Render)    │
   │              │   │              │
   │ • HTML       │   │ • Node.js    │
   │ • CSS        │   │ • Express    │
   │ • JavaScript │   │ • MySQL      │
   │ • Images     │   │ • APIs       │
   └─────────────┘   └──────┬───────┘
                             │
                             ▼
                     ┌────────────────┐
                     │    DATABASE    │
                     │   (PlanetScale │
                     │    or MySQL)   │
                     └────────────────┘
```

---

## 🎯 Step-by-Step Deployment

### **Phase 1: Prepare Frontend for GitHub Pages**

#### 1. Create GitHub Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: RCCG Graceland Website"

# Create repository on GitHub
# Visit: https://github.com/new
# Repository name: rccg-graceland-website

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/rccg-graceland-website.git
git branch -M main
git push -u origin main
```

#### 2. Configure GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Source", select: **Deploy from a branch**
4. Branch: **main** / **(root)**
5. Click **Save**

Your site will be available at:
```
https://YOUR_USERNAME.github.io/rccg-graceland-website/
```

#### 3. Update Base URLs in Frontend

The `environment.js` file already handles this! It will automatically:
- Use `http://localhost:3000/api` when running locally
- Use your production backend URL when deployed

---

### **Phase 2: Deploy Backend + MySQL**

You have **3 FREE options** for backend hosting:

---

## 🆓 Option 1: Railway (RECOMMENDED)

### Features:
- ✅ Free $5/month credit (enough for small apps)
- ✅ Built-in MySQL database
- ✅ Automatic deployments from GitHub
- ✅ HTTPS included
- ✅ Environment variables

### Steps:

#### 1. Sign Up for Railway
Visit: https://railway.app/
- Sign up with GitHub account

#### 2. Create New Project
```bash
# Click "New Project"
# Select "Deploy from GitHub repo"
# Authorize Railway to access your repository
# Select your repository
```

#### 3. Add MySQL Database
```bash
# In your Railway project:
# Click "+ New" → "Database" → "Add MySQL"
# Railway will automatically provision a MySQL database
```

#### 4. Configure Environment Variables
```bash
# In Railway Dashboard → your service → Variables tab
# Add these variables:

PORT=3000
DB_HOST=<from Railway MySQL>
DB_USER=<from Railway MySQL>
DB_PASSWORD=<from Railway MySQL>
DB_NAME=graceland_church
JWT_SECRET=<generate-strong-random-string>
NODE_ENV=production
```

#### 5. Get Database Credentials
```bash
# In Railway → MySQL database → Connect tab
# Copy:
DB_HOST=containers-us-west-xxx.railway.app
DB_USER=root
DB_PASSWORD=xxxxxxxxxxxxx
DB_NAME=railway
DB_PORT=xxxx
```

#### 6. Update Backend URL in Frontend
```javascript
// In config/environment.js
// Replace 'your-backend-app.railway.app' with your actual Railway URL
return 'https://YOUR_APP_NAME.up.railway.app/api';
```

#### 7. Deploy
```bash
# Railway automatically deploys when you push to GitHub!
git add .
git commit -m "Configure Railway deployment"
git push origin main

# Railway will:
# 1. Detect Node.js project
# 2. Install dependencies (npm install)
# 3. Start your server (npm start)
```

#### 8. Initialize Database
```bash
# After deployment, run this ONCE to create tables:
# Railway → your service → Settings → Deploy
# Or use Railway CLI:

railway run node database/init-mysql.js
```

---

## 🆓 Option 2: Render

### Features:
- ✅ Completely free tier
- ✅ No credit card required
- ✅ HTTPS included
- ✅ Automatic deployments

### Steps:

#### 1. Sign Up for Render
Visit: https://render.com/
- Sign up with GitHub

#### 2. Create Web Service
```bash
# Click "New +" → "Web Service"
# Connect your GitHub repository
# Configure:
Name: rccg-graceland-backend
Environment: Node
Build Command: npm install
Start Command: npm start
```

#### 3. Add External MySQL Database
**Option A: PlanetScale (Free MySQL)**
```bash
# Sign up at https://planetscale.com
# Create database: graceland_church
# Get connection string
# Add to Render environment variables
```

**Option B: FreeMySQLHosting.net**
```bash
# Sign up at https://www.freemysqlhosting.net
# Create database
# Note credentials
# Add to Render environment variables
```

#### 4. Environment Variables (Render)
```bash
DB_HOST=your-mysql-host
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=graceland_church
JWT_SECRET=your-secret-key
NODE_ENV=production
```

#### 5. Deploy
```bash
# Render automatically deploys!
# Your backend will be at:
https://YOUR_APP_NAME.onrender.com
```

#### 6. Update Frontend
```javascript
// In config/environment.js
return 'https://YOUR_APP_NAME.onrender.com/api';
```

---

## 🆓 Option 3: Fly.io

### Features:
- ✅ Free tier (3 VMs)
- ✅ Global deployment
- ✅ Very fast

### Steps:

#### 1. Install Fly CLI
```bash
# Windows (PowerShell):
iwr https://fly.io/install.ps1 -useb | iex

# Verify:
fly version
```

#### 2. Sign Up & Login
```bash
fly auth signup
fly auth login
```

#### 3. Launch App
```bash
cd c:\Users\PC\Documents\gracelandweb
fly launch

# Answer prompts:
# App name: rccg-graceland
# Region: Choose closest to Lagos (e.g., Johannesburg)
# PostgreSQL: No
# Deploy now: Yes
```

#### 4. Add MySQL Database
```bash
# Use external MySQL (PlanetScale recommended)
# Add secrets:
fly secrets set DB_HOST=your-host
fly secrets set DB_USER=your-user
fly secrets set DB_PASSWORD=your-password
fly secrets set DB_NAME=graceland_church
fly secrets set JWT_SECRET=your-secret
```

#### 5. Deploy
```bash
fly deploy
```

---

## 🗄️ Free MySQL Database Options

### Option A: PlanetScale (BEST)
```
Website: https://planetscale.com
Free Tier:
  - 5GB storage
  - 1 billion row reads/month
  - 10 million row writes/month
  - Automatic backups
  - Global deployment

Setup:
1. Sign up with GitHub
2. Create database: graceland_church
3. Get connection string
4. Copy to environment variables
```

### Option B: FreeMySQLHosting.net
```
Website: https://www.freemysqlhosting.net
Free Tier:
  - 5MB storage
  - 1 database
  - PhpMyAdmin access
  
Limitations:
  - Small storage (suitable for testing only)
```

### Option C: db4free.net
```
Website: https://db4free.net
Free Tier:
  - 200MB storage
  - MySQL 8.0
  - PhpMyAdmin access
  
Note: Not recommended for production
```

### Option D: CleverCloud MySQL (Limited Free)
```
Website: https://www.clever-cloud.com
Free Tier:
  - 256MB RAM
  - 2GB storage
```

---

## 🔧 Configuration Files

### 1. Create `railway.json` (for Railway)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.js",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100
  }
}
```

### 2. Create `render.yaml` (for Render)
```yaml
services:
  - type: web
    name: rccg-graceland-backend
    env: node
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
```

### 3. Update `package.json`
```json
{
  "name": "rccg-graceland-website",
  "version": "1.0.0",
  "description": "RCCG Graceland Area HQ Website",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "init-db": "node database/init-mysql.js"
  },
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  }
}
```

---

## 🔄 Local vs Production Workflow

### Local Development (Localhost)

```bash
# 1. Start MySQL locally
# Make sure MySQL80 service is running

# 2. Use local environment
# environment.js automatically detects localhost

# 3. Start server
npm start

# 4. Access website
http://localhost:3000

# Everything uses localhost MySQL automatically!
```

### Production (GitHub Pages + Railway)

```bash
# 1. Deploy backend to Railway
git push origin main

# 2. Railway automatically:
#    - Builds your app
#    - Starts server
#    - Connects to Railway MySQL

# 3. Access your website
https://YOUR_USERNAME.github.io/rccg-graceland-website/

# 4. Frontend automatically uses Railway backend!
# (environment.js detects non-localhost and switches)
```

---

## ✅ Deployment Checklist

### Before Deploying:

- [ ] Update `environment.js` with your backend URL
- [ ] Change admin password from default
- [ ] Generate strong JWT_SECRET
- [ ] Test locally first
- [ ] Commit all changes to GitHub
- [ ] Verify .env is in .gitignore (never commit secrets!)

### After Deploying Backend:

- [ ] Run database initialization
- [ ] Test API health endpoint
- [ ] Create admin user
- [ ] Upload sample blog posts
- [ ] Test file uploads

### After Deploying Frontend:

- [ ] Test website loads correctly
- [ ] Test blog page
- [ ] Test admin panel
- [ ] Test all forms
- [ ] Check console for errors
- [ ] Verify API calls work

---

## 🧪 Testing Your Deployment

### 1. Test Backend
```bash
# Health check
curl https://YOUR_BACKEND_URL/api/health

# Should return:
{
  "status": "OK",
  "timestamp": "2025-10-17T...",
  "server": "RCCG Graceland Website",
  "database": "MySQL",
  "version": "1.0.0"
}
```

### 2. Test Frontend
```bash
# Open browser console (F12)
# Visit your GitHub Pages URL
# Check console for:
# "🌍 Environment: production"
# "🔗 API URL: https://your-backend.railway.app/api"
```

### 3. Test Database Connection
```bash
# Try to fetch blog posts
https://YOUR_BACKEND_URL/api/blog/posts

# Should return array of posts (or empty array if no posts yet)
```

---

## 🐛 Troubleshooting

### Problem: "CORS Error"
**Solution:** Update `server.js`:
```javascript
const cors = require('cors');
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://YOUR_USERNAME.github.io'
    ],
    credentials: true
}));
```

### Problem: "Database Connection Failed"
**Solution:** Check environment variables:
```bash
# Railway/Render Dashboard → Environment Variables
# Verify all DB_* variables are correct
```

### Problem: "404 Not Found" for API calls
**Solution:** Check `environment.js`:
```javascript
// Make sure production URL is correct:
return 'https://YOUR_ACTUAL_BACKEND_URL.railway.app/api';
//           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ (no typos!)
```

### Problem: GitHub Pages shows 404
**Solution:**
```bash
# Ensure repository is public
# Check Settings → Pages is configured correctly
# Wait 2-3 minutes for deployment
```

---

## 📊 Monitoring & Maintenance

### Check Backend Status
```bash
# Railway: Dashboard → your service → Metrics
# Render: Dashboard → your service → Logs
```

### View Logs
```bash
# Railway:
railway logs

# Render:
# Dashboard → Logs tab
```

### Database Backups
```bash
# Railway:
# Automatic daily backups included

# PlanetScale:
# Automatic backups included
# Can create manual backups in dashboard
```

---

## 💰 Cost Breakdown (Free Tier)

| Service | Free Tier | Limits |
|---------|-----------|--------|
| **GitHub Pages** | Free forever | 1GB storage, 100GB bandwidth/month |
| **Railway** | $5/month credit | ~500 hours/month (enough for 24/7) |
| **Render** | Free forever | 750 hours/month, sleeps after inactivity |
| **PlanetScale** | Free forever | 5GB storage, 1B reads/month |

**Total Cost: $0/month** (with free tiers)

---

## 🚀 Quick Deploy Commands

### Railway:
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
git push origin main
```

### Render:
```bash
# Just push to GitHub
git push origin main
# Render auto-deploys!
```

### Update Frontend:
```bash
# Make changes
git add .
git commit -m "Update content"
git push origin main
# GitHub Pages auto-deploys in 1-2 minutes
```

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Render Documentation](https://render.com/docs)
- [PlanetScale Documentation](https://planetscale.com/docs)
- [GitHub Pages Documentation](https://docs.github.com/pages)

---

## ✨ Summary

You now have a **completely free**, **professional** setup:

1. **Frontend**: GitHub Pages (static files)
2. **Backend**: Railway/Render (Node.js + Express)
3. **Database**: PlanetScale/Railway (MySQL)
4. **Auto-switching**: environment.js handles local vs production

**Your workflow:**
- Develop locally with localhost
- Push to GitHub
- Railway/Render auto-deploys backend
- GitHub Pages auto-deploys frontend
- Everything just works! ✨

---

**Need help?** Check the troubleshooting section or create an issue on GitHub!
