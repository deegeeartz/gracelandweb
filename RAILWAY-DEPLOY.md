# Railway Deployment Guide for RCCG Graceland Website

## 🚀 Quick Deployment Steps

### 1. Sign up for Railway
1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Sign in with your GitHub account

### 2. Deploy from GitHub
1. Click "Deploy from GitHub repo"
2. Select your `graceland-website` repository  
3. Railway will automatically detect it's a Node.js project

### 3. Add MySQL Database
1. In your Railway project dashboard, click "New Service"
2. Select "Database" → "MySQL"
3. Railway will automatically create environment variables

### 4. Configure Environment Variables
Railway automatically provides these MySQL variables:
- `MYSQLHOST`
- `MYSQLPORT` 
- `MYSQLUSER`
- `MYSQLPASSWORD`
- `MYSQLDATABASE`
- `DATABASE_URL`

**Additional variables to add manually:**
1. Go to your project → Variables tab
2. Add these variables:

```
JWT_SECRET=your-super-secure-jwt-secret-change-this-now
NODE_ENV=production
```

### 5. Initialize Database
After deployment, Railway will automatically run your application. The database tables will be created automatically when the app starts.

### 6. Access Your Website
1. Go to your Railway project dashboard
2. Click on your web service
3. Click "Generate Domain" to get a public URL
4. Your website will be available at: `https://your-app-name.railway.app`

## 📋 Post-Deployment Checklist

- [ ] Test website loads correctly
- [ ] Access admin panel at `/admin.html`
- [ ] Create first admin account
- [ ] Test blog post creation
- [ ] Upload church content
- [ ] Configure custom domain (optional)

## 🔧 Troubleshooting

### Database Connection Issues
If you see database errors:
1. Check MySQL service is running in Railway
2. Verify environment variables are set
3. Check deployment logs for errors

### Free Tier Limits
Railway free tier includes:
- $5 credit per month
- 500 hours of usage  
- 1GB RAM per service

Perfect for church websites!
3. npm start
