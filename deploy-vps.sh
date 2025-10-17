#!/bin/bash
# Production deployment script for VPS

echo "Updating system..."
sudo apt update && sudo apt upgrade -y

echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "Installing MySQL..."
sudo apt install mysql-server -y
sudo mysql_secure_installation

echo "Creating database and user..."
sudo mysql -e "CREATE DATABASE graceland_church CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER 'graceland'@'localhost' IDENTIFIED BY 'your_secure_password';"
sudo mysql -e "GRANT ALL PRIVILEGES ON graceland_church.* TO 'graceland'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

echo "Installing application dependencies..."
npm install --production

echo "Setting up database..."
node setup-production-db.js

echo "Installing PM2 for process management..."
sudo npm install -g pm2

echo "Starting application with PM2..."
pm2 start server.js --name "graceland-website"
pm2 save
pm2 startup

echo "Deployment completed!"
