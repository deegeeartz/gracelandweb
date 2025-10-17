# Localhost MySQL Setup Guide

## Prerequisites
1. Install MySQL Server on your computer
2. Make sure MySQL is running on localhost:3306

## Quick Setup Steps

### 1. Install MySQL (if not already installed)
Download from: https://dev.mysql.com/downloads/mysql/

### 2. Create Database
Open MySQL Command Line or MySQL Workbench and run:
```sql
CREATE DATABASE graceland_church CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Update .env file (already done)
Your .env file is now configured for localhost MySQL:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=graceland_church
```

### 4. Install Dependencies and Run
```bash
npm install
npm run init-mysql
npm start
```

### 5. Access Your Website
- Website: http://localhost:3000
- Admin Panel: http://localhost:3000/admin.html

## Troubleshooting

### MySQL Connection Issues
1. Make sure MySQL server is running
2. Check if port 3306 is available
3. Verify username/password in .env file
4. Create the database if it doesn't exist

### Alternative Setup (if MySQL issues)
If you prefer to use SQLite (simpler, no MySQL installation needed):
1. Change `.env` file:
   ```
   DB_HOST=sqlite
   ```
2. Run: `npm run init-db`
3. Run: `npm start`

Your church website will work with either database!
