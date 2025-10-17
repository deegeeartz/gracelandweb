# MySQL Setup Guide for RCCG Graceland Website

## Prerequisites
1. **MySQL Server** must be installed and running
2. **Node.js** must be installed

## Step 1: Install MySQL Server
Download and install MySQL from: https://dev.mysql.com/downloads/mysql/

During installation:
- Set root password (can be empty for local development)
- Make sure MySQL runs on port 3306
- Start MySQL service

## Step 2: Create Database
Option A - MySQL Workbench:
1. Open MySQL Workbench
2. Connect to your local MySQL server
3. Run the script: `create-database.sql`

Option B - MySQL Command Line:
```bash
mysql -u root -p
CREATE DATABASE graceland_church CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

## Step 3: Install Dependencies
```bash
npm install
```

## Step 4: Test Database Connection
```bash
npm run test-connection
```
You should see: "✅ MySQL connected successfully"

## Step 5: Initialize Database Tables
```bash
npm run init-db
```
This creates all tables and adds sample data.

## Step 6: Start the Website
```bash
npm start
```

## Access Your Website
- **Main Website**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin.html

## Configuration
Your `.env` file is set up for MySQL:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=graceland_church
```

## Troubleshooting

### "MySQL connection failed"
1. Check if MySQL service is running
2. Verify username/password in `.env`
3. Make sure database `graceland_church` exists
4. Check if port 3306 is available

### "Database doesn't exist"
Run in MySQL:
```sql
CREATE DATABASE graceland_church CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### "Access denied for user"
Update `.env` with correct MySQL credentials:
```
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
```

## Database Structure
Once initialized, you'll have these tables:
- `blog_posts` - Church blog content
- `sermons` - Sermon recordings and details
- `categories` - Content categories
- `users` - Admin users
- `settings` - Site configuration
- `comments` - Blog comments
- `social_posts` - Social media integration
- `analytics` - Website analytics

Your church website is now ready! 🎉
