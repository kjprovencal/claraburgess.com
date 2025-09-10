#!/bin/bash

# Digital Ocean Backend Deployment Script for Clara's Baby Registry
# This script sets up and runs the NestJS backend in production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="claraburgess.com"
APP_DIR="/opt/$APP_NAME"
SERVICE_NAME="$APP_NAME"
USER_NAME="clara-app"
LOG_DIR="/var/log/$APP_NAME"
ENV_FILE="$APP_DIR/.env"

echo -e "${BLUE}🚀 Digital Ocean Backend Deployment Script${NC}"
echo "=============================================="

# Function to check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        echo -e "${RED}❌ This script should not be run as root${NC}"
        echo "Please run as a regular user with sudo privileges"
        exit 1
    fi
}

# Function to check if user exists
check_user() {
    if ! id "$USER_NAME" &>/dev/null; then
        echo -e "${YELLOW}👤 Creating user: $USER_NAME${NC}"
        sudo useradd -r -s /bin/false -d "$APP_DIR" "$USER_NAME"
        sudo mkdir -p "$APP_DIR"
        sudo chown "$USER_NAME:$USER_NAME" "$APP_DIR"
    else
        echo -e "${GREEN}✅ User $USER_NAME already exists${NC}"
    fi
}

# Function to create directories
create_directories() {
    echo -e "${BLUE}📁 Creating necessary directories...${NC}"
    
    sudo mkdir -p "$APP_DIR"
    sudo mkdir -p "$LOG_DIR"
    sudo mkdir -p "/etc/systemd/system"
    
    sudo chown -R "$USER_NAME:$USER_NAME" "$APP_DIR"
    sudo chown -R "$USER_NAME:$USER_NAME" "$LOG_DIR"
}

# Function to install Node.js and npm
install_nodejs() {
    echo -e "${BLUE}📦 Installing Node.js and npm...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo "Installing Node.js 22.x..."
        curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
        sudo apt-get install -y nodejs
        
        # Verify installation
        node --version
        npm --version
    else
        echo -e "${GREEN}✅ Node.js already installed${NC}"
        node --version
    fi
}

# Function to install PM2 and NestJS CLI globally
install_pm2() {
    echo -e "${BLUE}📦 Installing PM2 process manager and NestJS CLI...${NC}"
    
    if ! command -v pm2 &> /dev/null; then
        sudo npm install -g pm2
        sudo pm2 startup systemd -u "$USER_NAME" --hp "$APP_DIR"
        sudo systemctl enable pm2-$USER_NAME
    else
        echo -e "${GREEN}✅ PM2 already installed${NC}"
    fi
    
    if ! command -v nest &> /dev/null; then
        echo "Installing NestJS CLI globally..."
        sudo npm install -g @nestjs/cli
    else
        echo -e "${GREEN}✅ NestJS CLI already installed${NC}"
    fi
}

# Function to setup environment file
setup_environment() {
    echo -e "${BLUE}🔧 Setting up environment configuration...${NC}"
    
    if [ ! -f "$ENV_FILE" ]; then
        echo "Creating environment file..."
        sudo -u "$USER_NAME" tee "$ENV_FILE" > /dev/null <<EOF
# Production Environment Configuration
NODE_ENV=production
PORT=3001

# Database Configuration
DATABASE_PATH=/opt/$APP_NAME/database.sqlite

# JWT Configuration
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=24h

# Frontend URL (update this with your actual domain)
FRONTEND_URL=https://yourdomain.com

# Cloudinary Configuration (update with your actual values)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=claraburgess.com
# CORS Configuration
CORS_ORIGIN=https://yourdomain.com
EOF
        echo -e "${GREEN}✅ Environment file created${NC}"
        echo -e "${YELLOW}⚠️  Please update the environment variables in $ENV_FILE${NC}"
    else
        echo -e "${GREEN}✅ Environment file already exists${NC}"
    fi
}

# Function to deploy application
deploy_application() {
    echo -e "${BLUE}🚀 Deploying application...${NC}"
    
    # Backup existing database if it exists
    if [ -f "$APP_DIR/database.sqlite" ]; then
        echo "Backing up existing database..."
        sudo cp "$APP_DIR/database.sqlite" "$APP_DIR/database.sqlite.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    # Copy application files (excluding database)
    echo "Copying application files..."
    sudo rsync -av --exclude='database.sqlite' backend/ "$APP_DIR/"
    sudo chown -R "$USER_NAME:$USER_NAME" "$APP_DIR"
    
    # Install dependencies
    echo "Installing production dependencies..."
    cd "$APP_DIR"
    sudo -u "$USER_NAME" npm ci --only=production --omit=dev
    
    # Build application
    echo "Building application..."
    sudo -u "$USER_NAME" npm run build
    
    # Create database directory and set permissions
    sudo mkdir -p "$(dirname "$(grep DATABASE_PATH "$ENV_FILE" | cut -d'=' -f2)")"
    sudo chown -R "$USER_NAME:$USER_NAME" "$(dirname "$(grep DATABASE_PATH "$ENV_FILE" | cut -d'=' -f2)")"
}

# Function to create systemd service
create_systemd_service() {
    echo -e "${BLUE}🔧 Creating systemd service...${NC}"
    
    sudo tee "/etc/systemd/system/$SERVICE_NAME.service" > /dev/null <<EOF
[Unit]
Description=Clara's Baby Registry Backend
After=network.target

[Service]
Type=simple
User=$USER_NAME
WorkingDirectory=$APP_DIR
Environment=NODE_ENV=production
Environment=PORT=3001
ExecStart=/usr/bin/node dist/main.js
Restart=always
RestartSec=10
StandardOutput=append:/var/log/$APP_NAME/app.log
StandardError=append:/var/log/$APP_NAME/error.log

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable "$SERVICE_NAME"
    echo -e "${GREEN}✅ Systemd service created and enabled${NC}"
}

# Function to setup PM2 ecosystem
setup_pm2() {
    echo -e "${BLUE}🔧 Setting up PM2 ecosystem...${NC}"
    
    sudo -u "$USER_NAME" tee "$APP_DIR/ecosystem.config.js" > /dev/null <<EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'dist/main.js',
    cwd: '$APP_DIR',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '$LOG_DIR/error.log',
    out_file: '$LOG_DIR/out.log',
    log_file: '$LOG_DIR/combined.log',
    time: true,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF

    echo -e "${GREEN}✅ PM2 ecosystem file created${NC}"
}

# Function to start application
start_application() {
    echo -e "${BLUE}🚀 Starting application...${NC}"
    
    # Stop existing service if running
    sudo systemctl stop "$SERVICE_NAME" 2>/dev/null || true
    
    # Start with PM2
    cd "$APP_DIR"
    sudo -u "$USER_NAME" pm2 start ecosystem.config.js
    
    # Save PM2 configuration
    sudo -u "$USER_NAME" pm2 save
    sudo -u "$USER_NAME" pm2 startup
    
    echo -e "${GREEN}✅ Application started with PM2${NC}"
}

# Function to setup firewall
setup_firewall() {
    echo -e "${BLUE}🔥 Setting up firewall...${NC}"
    
    # Allow SSH
    sudo ufw allow ssh
    
    # Allow HTTP and HTTPS
    sudo ufw allow 80
    sudo ufw allow 443
    
    # Allow backend port (if needed externally)
    sudo ufw allow 3001
    
    # Enable firewall
    echo "y" | sudo ufw enable
    
    echo -e "${GREEN}✅ Firewall configured${NC}"
}

# Function to setup Nginx reverse proxy (optional)
setup_nginx() {
    echo -e "${BLUE}🌐 Setting up Nginx reverse proxy...${NC}"
    
    if ! command -v nginx &> /dev/null; then
        echo "Installing Nginx..."
        sudo apt-get update
        sudo apt-get install -y nginx
    fi
    
    # Create Nginx configuration
    sudo tee "/etc/nginx/sites-available/$APP_NAME" > /dev/null <<EOF
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

    # Enable site
    sudo ln -sf "/etc/nginx/sites-available/$APP_NAME" "/etc/nginx/sites-enabled/"
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload Nginx
    sudo nginx -t
    sudo systemctl reload nginx
    
    echo -e "${GREEN}✅ Nginx configured${NC}"
    echo -e "${YELLOW}⚠️  Please update the domain name in the Nginx configuration${NC}"
}

# Function to show status
show_status() {
    echo -e "${BLUE}📊 Application Status${NC}"
    echo "===================="
    
    echo -e "${GREEN}✅ PM2 Status:${NC}"
    sudo -u "$USER_NAME" pm2 status
    
    echo -e "\n${GREEN}✅ Systemd Service Status:${NC}"
    sudo systemctl status "$SERVICE_NAME" --no-pager -l
    
    echo -e "\n${GREEN}✅ Application Logs:${NC}"
    echo "Application logs: $LOG_DIR/app.log"
    echo "Error logs: $LOG_DIR/error.log"
    echo "PM2 logs: $LOG_DIR/out.log"
    
    echo -e "\n${GREEN}✅ Health Check:${NC}"
    echo "Backend: http://localhost:3001/health"
    echo "Frontend: https://yourdomain.com (after Nginx setup)"
}

# Function to show usage
show_usage() {
    echo -e "${BLUE}Usage:${NC}"
    echo "  $0 [command]"
    echo ""
    echo "Commands:"
    echo "  deploy     - Full deployment (default)"
    echo "  start      - Start the application"
    echo "  stop       - Stop the application"
    echo "  restart    - Restart the application"
    echo "  status     - Show application status"
    echo "  logs       - Show application logs"
    echo "  update     - Update application code"
    echo "  nginx      - Setup Nginx reverse proxy"
    echo "  help       - Show this help message"
}

# Function to show logs
show_logs() {
    echo -e "${BLUE}📋 Application Logs${NC}"
    echo "===================="
    
    if [ -f "$LOG_DIR/app.log" ]; then
        echo -e "${GREEN}Application Logs:${NC}"
        sudo tail -n 50 "$LOG_DIR/app.log"
    fi
    
    if [ -f "$LOG_DIR/error.log" ]; then
        echo -e "\n${RED}Error Logs:${NC}"
        sudo tail -n 50 "$LOG_DIR/error.log"
    fi
    
    echo -e "\n${BLUE}PM2 Logs:${NC}"
    sudo -u "$USER_NAME" pm2 logs --lines 20
}

# Function to update application
update_application() {
    echo -e "${BLUE}🔄 Updating application...${NC}"
    
    # Stop application
    sudo -u "$USER_NAME" pm2 stop "$APP_NAME"
    
    # Backup existing database if it exists
    if [ -f "$APP_DIR/database.sqlite" ]; then
        echo "Backing up existing database..."
        sudo cp "$APP_DIR/database.sqlite" "$APP_DIR/database.sqlite.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    # Pull latest code
    cd "$APP_DIR" && git pull origin main
    
    # Copy new files (excluding database)
    echo "Updating application files..."
    sudo rsync -av --exclude='database.sqlite' backend/ "$APP_DIR/"
    sudo chown -R "$USER_NAME:$USER_NAME" "$APP_DIR"
    
    # Install dependencies
    cd "$APP_DIR"
    sudo -u "$USER_NAME" npm ci --only=production --omit=dev
    
    # Build application
    sudo -u "$USER_NAME" npm run build
    
    # Start application
    sudo -u "$USER_NAME" pm2 start ecosystem.config.js
    sudo -u "$USER_NAME" pm2 save
    
    echo -e "${GREEN}✅ Application updated and restarted${NC}"
}

# Main execution
main() {
    local command=${1:-deploy}
    
    case $command in
        deploy)
            check_root
            check_user
            create_directories
            install_nodejs
            install_pm2
            setup_environment
            deploy_application
            create_systemd_service
            setup_pm2
            start_application
            setup_firewall
            show_status
            echo -e "\n${GREEN}🎉 Deployment completed successfully!${NC}"
            echo -e "${YELLOW}Next steps:${NC}"
            echo "1. Update environment variables in $ENV_FILE"
            echo "2. Update domain names in Nginx configuration"
            echo "3. Setup SSL certificates with Let's Encrypt"
            echo "4. Configure your domain DNS to point to this server"
            ;;
        start)
            start_application
            ;;
        stop)
            echo -e "${BLUE}🛑 Stopping application...${NC}"
            sudo -u "$USER_NAME" pm2 stop "$APP_NAME"
            sudo systemctl stop "$SERVICE_NAME"
            echo -e "${GREEN}✅ Application stopped${NC}"
            ;;
        restart)
            echo -e "${BLUE}🔄 Restarting application...${NC}"
            sudo -u "$USER_NAME" pm2 restart "$APP_NAME"
            sudo systemctl restart "$SERVICE_NAME"
            echo -e "${GREEN}✅ Application restarted${NC}"
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs
            ;;
        update)
            update_application
            ;;
        nginx)
            setup_nginx
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            echo -e "${RED}❌ Unknown command: $command${NC}"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
