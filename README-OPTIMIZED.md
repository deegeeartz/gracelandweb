# 🏛️ RCCG Graceland Area HQ Website - Optimized Version

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
copy .env.example .env
# Edit .env with your MySQL password

# 3. Initialize database
npm run init-db

# 4. Start server
npm start
# OR use optimized startup:
start-optimized.bat
```

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Optimization Guide](#optimization-guide)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

## ✨ Features

- ✅ **Content Management System**
  - Blog post creation and management
  - Sermon upload and organization
  - Category management
  - Media library

- ✅ **User Authentication**
  - JWT-based authentication
  - Role-based access control
  - Secure password hashing

- ✅ **Admin Dashboard**
  - Real-time statistics
  - Content analytics
  - User management

- ✅ **Optimized Performance**
  - Database connection pooling
  - Caching layer
  - Rate limiting
  - Gzip compression

- ✅ **Security Features**
  - Input validation
  - SQL injection protection
  - XSS prevention
  - CSRF protection
  - Rate limiting

## 🛠️ Tech Stack

- **Backend:** Node.js + Express.js
- **Database:** MySQL 8.0
- **Authentication:** JWT
- **Frontend:** Vanilla JavaScript
- **Security:** Helmet, Rate Limiting

## 📦 Installation

### Prerequisites

- Node.js (v14 or higher)
- MySQL 8.0
- npm or yarn

### Step-by-Step Setup

1. **Clone/Download the project**
   ```bash
   cd c:\Users\PC\Documents\gracelandweb
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   copy .env.example .env
   ```
   Edit `.env` file with your settings:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=graceland_church
   JWT_SECRET=your-secret-key
   PORT=3000
   NODE_ENV=development
   ```

4. **Create database**
   ```bash
   npm run create-db
   ```

5. **Initialize database**
   ```bash
   npm run init-db
   ```

6. **Start server**
   ```bash
   npm start
   ```

Visit: http://localhost:3000

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | `` |
| `DB_NAME` | Database name | `graceland_church` |
| `JWT_SECRET` | JWT signing key | (required) |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |

### Admin Access

Default credentials (⚠️ **Change immediately after first login!**):
- **Username:** `admin`
- **Password:** `admin123`

## 📚 API Documentation

### Authentication

**POST /api/auth/login**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**GET /api/auth/verify**
Headers: `Authorization: Bearer {token}`

### Blog Posts

**GET /api/blog**
Query params: `page`, `limit`, `category`, `search`

**POST /api/admin/posts**
Headers: `Authorization: Bearer {token}`
```json
{
  "title": "Post Title",
  "content": "<p>Content</p>",
  "excerpt": "Short description",
  "category_id": 1,
  "status": "published"
}
```

### Sermons

**GET /api/sermons**
Query params: `page`, `limit`, `series`, `speaker`

**POST /api/admin/sermons**
Headers: `Authorization: Bearer {token}`
```json
{
  "title": "Sermon Title",
  "speaker": "Pastor Name",
  "sermon_date": "2024-01-01",
  "audio_url": "/uploads/sermon.mp3"
}
```

## 🎯 Optimization Guide

### Clean Up Duplicate Files

```bash
# Run the optimization script
optimize-cleanup.bat
```

This will:
- Remove duplicate server files
- Remove duplicate database managers
- Remove backup model files
- Organize test files
- Remove obsolete documentation

### Performance Optimization

1. **Enable Caching**
   ```env
   CACHE_ENABLED=true
   ```

2. **Optimize Database Queries**
   - All queries use parameterized statements
   - Connection pooling enabled
   - Indexes on frequently queried fields

3. **Use Optimized Server**
   ```bash
   node server-optimized.js
   ```

### Code Quality

- Use validation middleware for all inputs
- Follow error handling best practices
- Use constants instead of hardcoded values
- Implement proper logging

## 🔒 Security

### Best Practices Implemented

- ✅ JWT authentication with expiry
- ✅ Password hashing with bcrypt
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection (input sanitization)
- ✅ Rate limiting on API endpoints
- ✅ HTTPS ready (use reverse proxy in production)
- ✅ Environment variables for sensitive data
- ✅ Input validation on all endpoints

### Security Checklist

- [ ] Change default admin password
- [ ] Update JWT_SECRET to a strong random string
- [ ] Enable HTTPS in production
- [ ] Regular database backups
- [ ] Keep dependencies updated
- [ ] Monitor server logs
- [ ] Implement CSRF protection for forms

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Test connection
npm run test-connection

# Reinitialize database
npm run init-db
```

### Server Won't Start

```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process using the port
taskkill /PID <PID> /F
```

### MySQL Service Not Running

```bash
# Start MySQL service
net start MySQL80
```

### Admin Login Not Working

1. Verify admin user exists:
   ```sql
   USE graceland_church;
   SELECT * FROM users WHERE username='admin';
   ```

2. Reset admin password if needed:
   ```bash
   node scripts/reset-admin-password.js
   ```

## 📊 Project Structure

```
gracelandweb/
├── config/
│   └── constants.js          # Configuration constants
├── database/
│   ├── models/               # Database models
│   ├── db-manager.js         # Database connection
│   └── init-database.js      # Database initialization
├── middleware/
│   └── index.js              # Validation & error handling
├── routes/
│   ├── auth.js               # Authentication routes
│   ├── blog.js               # Blog routes
│   ├── sermons.js            # Sermon routes
│   ├── admin.js              # Admin routes
│   └── settings.js           # Settings routes
├── tests/                    # Test files
├── uploads/                  # User uploaded files
├── server.js                 # Main server file
├── server-optimized.js       # Optimized server
└── package.json              # Dependencies

## 📝 NPM Scripts

```bash
npm start              # Start server
npm run init-db        # Initialize database
npm run test-connection # Test database connection
npm run create-db      # Create database
npm run dev            # Development mode with nodemon
```

## 🤝 Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Use meaningful commit messages

## 📄 License

MIT License - See LICENSE file for details

## 👥 Support

For issues or questions:
- Check TROUBLESHOOTING section
- Review OPTIMIZATION-REPORT.md
- Contact system administrator

---

**Made with ❤️ for RCCG Graceland Area HQ**
