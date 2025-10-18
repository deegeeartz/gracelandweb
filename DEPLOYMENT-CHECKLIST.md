# 🚀 Production Deployment Checklist

> Complete checklist for deploying RCCG Graceland website to Railway with Cloudinary integration.

---

## ✅ Pre-Deployment Checklist

### 1. Local Environment Setup
- [x] Node.js v18+ installed
- [x] MySQL 8.0+ installed and running
- [x] Dependencies installed (`npm install`)
- [x] `.env` file configured with all required variables
- [x] Local server tested (`npm start`)
- [x] Admin panel accessible (http://localhost:3000/admin.html)
- [x] Blog posts can be created/edited/deleted
- [x] Image upload working locally

### 2. Cloudinary Configuration
- [ ] Cloudinary account created (FREE tier)
- [ ] Cloud name, API key, and API secret obtained
- [ ] Added to `.env` file:
  ```env
  CLOUDINARY_CLOUD_NAME=your_cloud_name
  CLOUDINARY_API_KEY=your_api_key
  CLOUDINARY_API_SECRET=your_api_secret
  CLOUDINARY_FOLDER=graceland-church
  ```
- [ ] Local image upload tested with Cloudinary
- [ ] Verify images appear on Cloudinary dashboard
- [ ] Test lazy loading on blog page
- [ ] Test responsive images (mobile/desktop)

### 3. Database Preparation
- [ ] MySQL database schema created (`create-database.sql`)
- [ ] Test data added (optional)
- [ ] Database connection tested locally
- [ ] Admin user created and login working
- [ ] Blog posts visible on frontend

### 4. Code Quality
- [x] No console.log statements in production code
- [x] No sensitive data hardcoded
- [x] Error handling implemented
- [x] Input validation on all forms
- [x] XSS protection enabled
- [x] CORS configured properly
- [x] SQL injection prevention (parameterized queries)

### 5. Documentation
- [x] README.md updated
- [x] QUICK-START-GUIDE.md complete
- [x] CLOUDINARY-GUIDE.md created
- [x] CHANGELOG.md updated
- [x] GITHUB-DEPLOYMENT-GUIDE.md verified

---

## 🚂 Railway Deployment Steps

### Step 1: Prepare Railway Project

1. **Go to Railway Dashboard**
   - Visit: https://railway.app/
   - Login or sign up

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account
   - Select your repository: `gracelandweb`

3. **Wait for Initial Deploy**
   - Railway will auto-detect Node.js project
   - Initial deploy may fail (expected - missing env vars)

---

### Step 2: Configure Environment Variables

Click **Variables** tab and add:

#### Database Variables
```
DATABASE_URL=mysql://user:password@host:port/database
DB_HOST=your-mysql-host
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=graceland_db
DB_PORT=3306
```

#### Cloudinary Variables
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=graceland-church
CLOUDINARY_AUTO_OPTIMIZE=true
CLOUDINARY_QUALITY=auto:good
```

#### Application Variables
```
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this
SESSION_SECRET=your-super-secret-session-key-change-this
```

#### Admin Credentials (Optional - Create via Admin Panel)
```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
ADMIN_EMAIL=admin@rccggraceland.org
```

**Security Note:** Generate strong, unique secrets!

---

### Step 3: Configure MySQL Database

**Option A: Railway MySQL Plugin (Recommended)**

1. Click "New" → "Database" → "Add MySQL"
2. Railway auto-creates `DATABASE_URL`
3. Copy connection details to your variables
4. Run database schema:
   ```powershell
   # Connect to Railway MySQL via CLI
   mysql -h your-host -u root -p -D railway
   
   # Run schema
   source create-database.sql
   ```

**Option B: External MySQL (PlanetScale, etc.)**

1. Create database on PlanetScale/other provider
2. Get connection string
3. Add to Railway variables as `DATABASE_URL`
4. Run schema using provider's tools

---

### Step 4: Deploy Application

1. **Trigger Deployment**
   - Railway auto-deploys on git push
   - Or click "Deploy" in Railway dashboard

2. **Monitor Deployment**
   - Check build logs for errors
   - Wait for "Success" status
   - Note: First deploy takes 2-5 minutes

3. **Get Deployment URL**
   - Click on deployment
   - Copy the generated URL (e.g., `graceland-web-production.up.railway.app`)

---

### Step 5: Post-Deployment Testing

#### Test Basic Functionality
- [ ] Visit deployment URL
- [ ] Homepage loads correctly
- [ ] Navigation works (Home, Blog, About, etc.)
- [ ] Images load from Cloudinary CDN
- [ ] Lazy loading works (scroll blog page)
- [ ] Responsive design works (mobile/tablet/desktop)

#### Test Admin Panel
- [ ] Go to `/admin.html`
- [ ] Login with admin credentials
- [ ] Dashboard shows statistics
- [ ] Create a test blog post
- [ ] Upload featured image (test Cloudinary)
- [ ] Publish post
- [ ] Verify post appears on blog page
- [ ] Edit post
- [ ] Delete post

#### Test Image Optimization
- [ ] Upload 2MB+ image in admin panel
- [ ] Check Cloudinary dashboard for uploaded image
- [ ] Verify image appears on frontend
- [ ] Check Network tab - should load ~200KB WebP version
- [ ] Test on mobile - should load smaller version
- [ ] Test lazy loading (image loads when scrolling)

#### Test Performance
- [ ] Run Lighthouse audit (target 90+ score)
- [ ] Check page load time (<2 seconds)
- [ ] Verify images optimized (WebP format)
- [ ] Check CDN delivery (Cloudinary URLs)
- [ ] Test from different locations/devices

---

## 🔧 Troubleshooting

### Issue: Build Fails

**Check:**
- All dependencies in `package.json`
- `package-lock.json` committed to repo
- No syntax errors in code
- Railway build logs for specific error

**Fix:**
```powershell
# Locally verify build works
npm install
npm start
```

---

### Issue: Database Connection Fails

**Check:**
- `DATABASE_URL` variable set correctly
- MySQL service running on Railway
- Firewall allows Railway IP addresses
- Database schema created

**Fix:**
```powershell
# Test database connection
node -e "
const mysql = require('mysql2/promise');
mysql.createConnection(process.env.DATABASE_URL)
  .then(() => console.log('✅ Database connected!'))
  .catch(err => console.error('❌ Error:', err));
"
```

---

### Issue: Images Not Uploading

**Check:**
- Cloudinary variables set in Railway
- No typos in variable names
- API key/secret valid
- Cloudinary account not exceeded limits

**Fix:**
1. Verify variables in Railway dashboard
2. Check Cloudinary dashboard for errors
3. Review Railway logs for upload errors

---

### Issue: Admin Login Fails

**Check:**
- Admin user created in database
- Password hashed correctly (bcrypt)
- `JWT_SECRET` set in Railway
- Session cookies enabled

**Fix:**
```sql
-- Create admin user manually
INSERT INTO users (username, email, password, role) 
VALUES ('admin', 'admin@rccggraceland.org', 
        '$2b$10$hashedpassword', 'admin');
```

---

### Issue: CORS Errors

**Check:**
- Frontend URL matches backend `CORS_ORIGIN`
- CORS middleware configured in `server.js`
- Railway deployment URL added to CORS whitelist

**Fix in `server.js`:**
```javascript
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://your-railway-url.up.railway.app'
    ],
    credentials: true
}));
```

---

## 📊 Performance Benchmarks

### Target Metrics
- **Lighthouse Performance:** 90+
- **First Contentful Paint:** <1.5s
- **Time to Interactive:** <3s
- **Total Page Size:** <2MB
- **Image Optimization:** 80%+ reduction
- **Lazy Loading:** Enabled for all images

### Measure Performance
```powershell
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://your-railway-url.up.railway.app --view
```

---

## 🔐 Security Checklist

- [ ] `.env` file NOT committed to git
- [ ] Strong JWT_SECRET (32+ characters)
- [ ] Strong database password
- [ ] Cloudinary API secret secure
- [ ] SQL injection prevention enabled
- [ ] XSS protection enabled
- [ ] CSRF protection enabled
- [ ] HTTPS enforced
- [ ] Rate limiting configured
- [ ] Admin routes protected
- [ ] Input validation on all forms
- [ ] Password hashing with bcrypt

---

## 📱 Mobile Testing

Test on these devices/viewports:

- [ ] iPhone SE (375px)
- [ ] iPhone 12 Pro (390px)
- [ ] iPad (768px)
- [ ] iPad Pro (1024px)
- [ ] Desktop (1920px)

**Check:**
- Images responsive
- Navigation mobile-friendly
- Forms usable on small screens
- Performance on slow networks

---

## 🎯 Final Verification

### Homepage
- [ ] Loads in <2 seconds
- [ ] All images optimized
- [ ] Navigation works
- [ ] Contact form submits
- [ ] Service times displayed
- [ ] Footer links work

### Blog Page
- [ ] Posts load correctly
- [ ] Images lazy load
- [ ] Pagination works
- [ ] Search/filter functional
- [ ] Post links work

### Admin Panel
- [ ] Login secure (HTTPS)
- [ ] Dashboard loads
- [ ] Create/edit/delete posts works
- [ ] Image upload works
- [ ] Statistics accurate

### Overall
- [ ] No console errors
- [ ] No broken links
- [ ] SEO meta tags present
- [ ] Sitemap accessible (/sitemap.xml)
- [ ] Robots.txt configured
- [ ] PWA manifest present
- [ ] Service worker registered

---

## 🎉 Deployment Complete!

### Post-Launch Tasks

1. **Monitor Application**
   - Check Railway logs regularly
   - Monitor Cloudinary usage (FREE tier limits)
   - Set up error alerting (Sentry, etc.)

2. **Update DNS**
   - Point custom domain to Railway URL
   - Add SSL certificate (Railway provides free SSL)
   - Test domain works correctly

3. **Share with Team**
   - Provide admin credentials to church leaders
   - Create user guide for content management
   - Train team on blog post creation

4. **Marketing**
   - Announce new website launch
   - Share on social media
   - Update church materials with new URL

---

## 📞 Support

**Need Help?**
- Check QUICK-START-GUIDE.md
- Check CLOUDINARY-GUIDE.md
- Check Railway Documentation: https://docs.railway.app
- Contact: support@rccggraceland.org

---

**Last Updated:** October 18, 2025
**Version:** 2.0.0
