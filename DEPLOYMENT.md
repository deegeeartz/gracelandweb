# Production Deployment Guide

## Why MySQL for Production?

### Performance Comparison
- **SQLite**: Good for < 1000 concurrent users
- **MySQL**: Handles 10,000+ concurrent users easily

### Scalability Benefits
- **Connection pooling**: Multiple simultaneous database connections
- **Horizontal scaling**: Can add read replicas for better performance
- **Better caching**: MySQL has sophisticated query optimization
- **ACID compliance**: Better data integrity for critical operations

### Hosting Support
- **Shared hosting**: Most providers support MySQL
- **Cloud platforms**: All major cloud providers offer managed MySQL
- **CDN integration**: Better compatibility with content delivery networks

## Hosting Options

### 1. Shared Hosting (Budget-friendly)
**Best for**: Small churches, limited budget
**Cost**: $3-10/month

Popular providers:
- **Hostinger**: Great performance, MySQL included
- **SiteGround**: Excellent support, optimized for performance
- **Bluehost**: WordPress optimized, easy setup

Setup steps:
1. Purchase hosting plan with Node.js support
2. Upload files via FTP/File Manager
3. Create MySQL database in cPanel
4. Update .env with database credentials
5. Run `npm install` and `npm run init-mysql`

### 2. VPS/Cloud Hosting (Recommended)
**Best for**: Growing churches, need full control
**Cost**: $5-50/month

Popular providers:
- **DigitalOcean**: $5/month droplet, excellent documentation
- **Linode**: Great performance, competitive pricing
- **Vultr**: Fast NVMe storage, global locations

Setup steps:
1. Create Ubuntu 20.04+ server
2. Install Node.js, MySQL, and PM2
3. Clone your repository
4. Configure firewall and SSL
5. Set up automated backups

### 3. Platform-as-a-Service (Easiest)
**Best for**: Non-technical teams, quick deployment
**Cost**: $7-25/month

Popular providers:
- **Heroku**: Easy deployment, MySQL add-ons available
- **Railway**: Git-based deployment, automatic scaling
- **Render**: Modern platform, great free tier

Setup steps:
1. Connect your Git repository
2. Add MySQL database service
3. Configure environment variables
4. Deploy with one click

### 4. Managed Database Services
**Best for**: High availability, automatic backups
**Cost**: $15-100/month

Popular services:
- **AWS RDS**: Industry standard, highly reliable
- **DigitalOcean Managed Databases**: Simple setup, automated backups
- **PlanetScale**: Serverless MySQL with branching
- **Google Cloud SQL**: Enterprise-grade with global reach

## Step-by-Step DigitalOcean Deployment

### 1. Server Setup
```bash
# Create new Ubuntu 20.04 droplet
# SSH into your server
ssh root@your_server_ip

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install MySQL
apt install mysql-server -y
mysql_secure_installation

# Install PM2 (Process Manager)
npm install -g pm2

# Install Nginx (Web Server)
apt install nginx -y

# Install Certbot (SSL Certificates)
apt install certbot python3-certbot-nginx -y
```

### 2. Database Setup
```bash
# Login to MySQL
mysql -u root -p

# Create database and user
CREATE DATABASE graceland_church CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'graceland'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON graceland_church.* TO 'graceland'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Application Deployment
```bash
# Clone your repository
git clone https://github.com/yourusername/graceland-website.git
cd graceland-website

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env
```

Update your `.env` file:
```env
DB_HOST=localhost
DB_USER=graceland
DB_PASSWORD=your_secure_password
DB_NAME=graceland_church
JWT_SECRET=your-super-secure-jwt-secret-change-this
PORT=3000
NODE_ENV=production
```

```bash
# Initialize database
npm run init-mysql

# Start application with PM2
pm2 start server.js --name "graceland-website"
pm2 startup
pm2 save
```

### 4. Nginx Configuration
```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/graceland-website
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve static files directly
    location /uploads {
        alias /path/to/your/app/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/graceland-website /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Get SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 5. Security Hardening
```bash
# Configure firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable

# Secure MySQL
mysql_secure_installation

# Set up fail2ban
apt install fail2ban -y
systemctl enable fail2ban
```

## Performance Optimization

### 1. Database Optimization
```sql
-- Add these to MySQL configuration
[mysqld]
innodb_buffer_pool_size = 128M
query_cache_size = 32M
max_connections = 100
```

### 2. Application Optimization
- Enable gzip compression in Nginx
- Use CDN for static assets
- Implement Redis for session storage
- Set up database connection pooling

### 3. Monitoring
```bash
# Install monitoring tools
npm install -g pm2-logrotate
pm2 install pm2-server-monit

# Monitor application
pm2 monit
```

## Backup Strategy

### 1. Database Backups
```bash
# Create backup script
nano /home/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u graceland -p graceland_church | gzip > /backups/graceland_${DATE}.sql.gz
find /backups -name "graceland_*.sql.gz" -mtime +7 -delete
```

```bash
# Schedule with cron
crontab -e
# Add: 0 2 * * * /home/backup-db.sh
```

### 2. File Backups
```bash
# Backup uploads directory
rsync -av /path/to/uploads/ /backups/uploads/
```

## Domain and SSL

### 1. Domain Setup
- Point your domain's A record to your server IP
- Add www subdomain (CNAME to main domain)

### 2. SSL Certificate
```bash
# Automatic renewal
certbot renew --dry-run
```

## Monitoring and Maintenance

### 1. Log Management
```bash
# View application logs
pm2 logs graceland-website

# View Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 2. Health Checks
```bash
# Check application status
pm2 status

# Check MySQL status
systemctl status mysql

# Check disk space
df -h
```

## Scaling Considerations

### 1. Load Balancing
- Use multiple server instances
- Implement sticky sessions
- Use Redis for shared sessions

### 2. Database Scaling
- Set up MySQL read replicas
- Implement database connection pooling
- Consider using MySQL Cluster

### 3. CDN Integration
- Use CloudFlare or AWS CloudFront
- Serve static assets from CDN
- Optimize images and compress files

## Cost Estimates

### Small Church (< 500 members)
- **VPS**: $5-10/month (DigitalOcean/Linode)
- **Domain**: $10-15/year
- **SSL**: Free (Let's Encrypt)
- **Total**: ~$60-120/year

### Medium Church (500-2000 members)
- **VPS**: $20-40/month (Higher specs)
- **Managed Database**: $15-30/month
- **CDN**: $5-15/month
- **Total**: ~$480-1020/year

### Large Church (2000+ members)
- **Multiple servers**: $100-300/month
- **Load balancer**: $20-50/month
- **Managed services**: $50-200/month
- **Total**: ~$2040-6600/year

## Conclusion

**For most churches, I recommend:**
1. **Development**: SQLite (simple setup)
2. **Production**: MySQL on DigitalOcean ($5/month droplet)
3. **Scaling**: Add managed database when needed

This gives you the best balance of cost, performance, and scalability while keeping the technical complexity manageable.
