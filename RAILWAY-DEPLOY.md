# Railway Deployment Guide

## Quick Deploy to Railway

1. Create account at railway.app
2. Connect your GitHub account
3. Push your code to GitHub
4. Deploy with one click

## Environment Variables to Set in Railway:

- DB_HOST: (Railway will provide)
- DB_USER: (Railway will provide)
- DB_PASSWORD: (Railway will provide)
- DB_NAME: graceland_church
- JWT_SECRET: your-secure-secret
- NODE_ENV: production

## Commands Railway will run:
1. npm install
2. npm run setup-production (to initialize database)
3. npm start
