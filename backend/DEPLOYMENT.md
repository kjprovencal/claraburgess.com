# Digital Ocean Backend Deployment Guide

This guide will help you deploy Clara's Baby Registry backend to Digital Ocean.

## Prerequisites

- A Digital Ocean account
- A Droplet (Ubuntu 22.04 LTS recommended)
- SSH access to your Droplet
- A domain name (optional but recommended)

## Quick Start

1. **Upload the deployment script to your Droplet:**

   ```bash
   scp deploy-digitalocean.sh root@your-droplet-ip:/root/
   ```

2. **SSH into your Droplet:**

   ```bash
   ssh root@your-droplet-ip
   ```

3. **Make the script executable and run it:**
   ```bash
   chmod +x deploy-digitalocean.sh
   ./deploy-digitalocean.sh deploy
   ```

## Manual Deployment Steps

If you prefer to deploy manually or need to customize the process:

### 1. Create a Non-Root User

```bash
# Create application user
sudo useradd -r -s /bin/false -d /opt/claraburgess clara-app

# Create directories
sudo mkdir -p /opt/claraburgess
sudo mkdir -p /var/claraburgess
sudo chown -R clara-app:clara-app /opt/claraburgess
sudo chown -R clara-app:clara-app /var/log/claraburgess
```

### 2. Install Node.js

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 3. Install PM2 Process Manager

```bash
# Install PM2 globally
sudo npm install -g pm2

# Setup PM2 to start on boot
sudo pm2 startup systemd -u clara-app --hp /opt/claraburgess
sudo systemctl enable pm2-clara-app
```

### 4. Deploy Your Application

```bash
# Copy your backend files
sudo cp -r backend/* /opt/claraburgess/

# Set ownership
sudo chown -R clara-app:clara-app /opt/claraburgess

# Install dependencies
cd /opt/claraburgess
sudo -u clara-app npm ci --only=production

# Build the application
sudo -u clara-app npm run build
```

### 5. Configure Environment Variables

```bash
# Create environment file
sudo -u clara-app tee /opt/claraburgess/.env > /dev/null <<EOF
NODE_ENV=production
PORT=3001
DATABASE_PATH=/opt/claraburgess/database.sqlite
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=24h
FRONTEND_URL=https://yourdomain.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=clara-baby-registry
CORS_ORIGIN=https://yourdomain.com
EOF
```

### 6. Create PM2 Ecosystem File

```bash
sudo -u clara-app tee /opt/claraburgess/ecosystem.config.js > /dev/null <<EOF
module.exports = {
  apps: [{
    name: 'claraburgess',
    script: 'dist/main.js',
    cwd: '/opt/claraburgess',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/claraburgess/error.log',
    out_file: '/var/log/claraburgess/out.log',
    log_file: '/var/log/claraburgess/combined.log',
    time: true,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF
```

### 7. Start the Application

```bash
# Start with PM2
cd /opt/claraburgess
sudo -u clara-app pm2 start ecosystem.config.js

# Save PM2 configuration
sudo -u clara-app pm2 save
sudo -u clara-app pm2 startup
```

### 8. Configure Firewall

```bash
# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Enable firewall
echo "y" | sudo ufw enable
```

## Nginx Reverse Proxy Setup (Optional)

If you want to serve your backend through a domain name:

### 1. Install Nginx

```bash
sudo apt-get update
sudo apt-get install -y nginx
```

### 2. Create Nginx Configuration

```bash
sudo tee /etc/nginx/sites-available/claraburgess > /dev/null <<EOF
server {
    listen 80;
    server_name yourdomain.com;  # Update with your actual domain

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
```

### 3. Enable the Site

```bash
# Enable site
sudo ln -sf /etc/nginx/sites-available/claraburgess /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

## SSL Certificate with Let's Encrypt

### 1. Install Certbot

```bash
sudo apt-get install -y certbot python3-certbot-nginx
```

### 2. Obtain SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com
```

## Management Commands

The deployment script provides several management commands:

```bash
# Show application status
./deploy-digitalocean.sh status

# View logs
./deploy-digitalocean.sh logs

# Restart application
./deploy-digitalocean.sh restart

# Stop application
./deploy-digitalocean.sh stop

# Update application
./deploy-digitalocean.sh update

# Setup Nginx
./deploy-digitalocean.sh nginx
```

## Monitoring and Logs

### PM2 Monitoring

```bash
# View PM2 status
sudo -u clara-app pm2 status

# View PM2 logs
sudo -u clara-app pm2 logs

# Monitor resources
sudo -u clara-app pm2 monit
```

### Application Logs

```bash
# Application logs
sudo tail -f /var/log/claraburgess/app.log

# Error logs
sudo tail -f /var/log/claraburgess/error.log

# PM2 logs
sudo -u clara-app pm2 logs --lines 50
```

## Health Checks

Your backend includes a health check endpoint:

```bash
# Check if backend is running
curl http://localhost:3001/health

# Check from external (if firewall allows)
curl http://your-droplet-ip:3001/health
```

## Troubleshooting

### Common Issues

1. **Port already in use:**

   ```bash
   sudo netstat -tlnp | grep :3001
   sudo lsof -i :3001
   ```

2. **Permission denied:**

   ```bash
   sudo chown -R clara-app:clara-app /opt/claraburgess
   sudo chown -R clara-app:clara-app /var/log/claraburgess
   ```

3. **PM2 not starting on boot:**

   ```bash
   sudo -u clara-app pm2 startup systemd -u clara-app --hp /opt/claraburgess
   sudo systemctl enable pm2-clara-app
   ```

4. **Database connection issues:**

   ```bash
   # Check database file permissions
   ls -la /opt/claraburgess/database.sqlite

   # Check database file exists
   sudo -u clara-app test -f /opt/claraburgess/database.sqlite
   ```

### Reset Everything

If you need to start over:

```bash
# Stop all services
sudo -u clara-app pm2 stop all
sudo -u clara-app pm2 delete all
sudo systemctl stop claraburgess

# Remove application
sudo rm -rf /opt/claraburgess
sudo rm -rf /var/log/claraburgess

# Remove systemd service
sudo systemctl disable claraburgess
sudo rm /etc/systemd/system/claraburgess.service
sudo systemctl daemon-reload

# Remove user
sudo userdel clara-app
```

## Security Considerations

1. **Firewall:** Only allow necessary ports (22, 80, 443)
2. **User Permissions:** Run application as non-root user
3. **Environment Variables:** Keep sensitive data in environment files
4. **SSL:** Always use HTTPS in production
5. **Updates:** Regularly update your system and dependencies
6. **Backups:** Regular backups of your database and application files

## Performance Optimization

1. **PM2 Clustering:** Uses all CPU cores by default
2. **Memory Limits:** Restarts if memory usage exceeds 1GB
3. **Log Rotation:** PM2 handles log rotation automatically
4. **Process Monitoring:** Automatic restart on crashes

## Next Steps

After successful deployment:

1. Update your domain DNS to point to your Droplet's IP
2. Configure your frontend to use the backend URL
3. Set up monitoring and alerting
4. Configure automated backups
5. Set up CI/CD pipeline for future deployments

## Support

If you encounter issues:

1. Check the logs: `./deploy-digitalocean.sh logs`
2. Verify service status: `./deploy-digitalocean.sh status`
3. Check system resources: `htop`, `df -h`, `free -h`
4. Review firewall rules: `sudo ufw status`
