#!/bin/bash

# Enable error handling
set -e
set -x

# Update system packages
sudo yum update -y

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install Nginx properly
sudo yum install -y stress
sudo yum install -y nginx

# Verify Nginx installation
which nginx
nginx -v

# Install PM2 globally
sudo npm install -y pm2 -g

# Create application directory
sudo mkdir -p /var/www/greendata
cd /var/www/greendata

# Clone your repository
git clone https://github.com/turjoy18/chatbotgreendata.git .

# Install dependencies
npm install

# Build the application
npm run build

# Verify build directory exists and has content
ls -la build/

# Configure Nginx
sudo tee /etc/nginx/conf.d/greendata.conf << EOF
server {
    listen 80 default_server;
    server_name _;

    access_log /var/log/nginx/greendata_access.log;
    error_log /var/log/nginx/greendata_error.log debug;

    root /var/www/greendata/build;
    index index.html;

    # Handle React routing
    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Serve static files
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
        try_files \$uri =404;
    }

    # Handle 404 errors
    error_page 404 /index.html;

    # Handle 50x errors
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF

# Remove default Nginx configuration
sudo rm -f /etc/nginx/conf.d/default.conf

# Set proper permissions
sudo chown -R nginx:nginx /var/www/greendata
sudo chmod -R 755 /var/www/greendata

# Test Nginx configuration
sudo nginx -t

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify Nginx is running
sudo systemctl status nginx

# Start the application with PM2
pm2 start npm --name "greendata" -- start
pm2 startup
pm2 save

# Verify PM2 is running
pm2 status

# Set up automatic updates
sudo tee /etc/cron.d/update-greendata << EOF
0 0 * * * root cd /var/www/greendata && git pull && npm install && npm run build && pm2 restart greendata
EOF

# Print final status
echo "Deployment completed. Checking services..."
sudo systemctl status nginx
pm2 status
sudo netstat -tulpn | grep :80