#!/bin/bash
# Production deployment script for shared hosting

echo "Installing dependencies..."
npm install --production

echo "Setting up production database..."
node setup-production-db.js

echo "Starting application..."
npm run production
