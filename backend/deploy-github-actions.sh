#!/bin/bash

# GitHub Actions Deployment Script for Clara's Baby Registry

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="claraburgess.com"
APP_DIR="/opt/$APP_NAME"
USER_NAME="clara-app"
LOG_DIR="/var/log/$APP_NAME"

echo -e "${BLUE}🚀 GitHub Actions Deployment Script${NC}"
echo "======================================"

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

create_directories() {
    echo -e "${BLUE}📁 Creating necessary directories...${NC}"
    
    sudo mkdir -p "$APP_DIR"
    sudo mkdir -p "$LOG_DIR"
    sudo chown -R "$USER_NAME:$USER_NAME" "$APP_DIR"
    sudo chown -R "$USER_NAME:$USER_NAME" "$LOG_DIR"
}

backup_database() {
    if [ -f "$APP_DIR/database.sqlite" ]; then
        echo -e "${BLUE}📦 Backing up existing database...${NC}"
        sudo cp "$APP_DIR/database.sqlite" "$APP_DIR/database.sqlite.backup.$(date +%Y%m%d_%H%M%S)"
        echo -e "${GREEN}✅ Database backed up${NC}"
    else
        echo -e "${YELLOW}⚠️  No existing database found${NC}"
    fi
}

stop_application() {
    echo -e "${BLUE}🛑 Stopping application...${NC}"
    sudo -u "$USER_NAME" pm2 stop "$APP_NAME" 2>/dev/null || true
    echo -e "${GREEN}✅ Application stopped${NC}"
}

deploy_files() {
    echo -e "${BLUE}📁 Deploying application files...${NC}"
    
    # Copy application files (excluding database and sensitive files)
    sudo rsync -av --exclude='database.sqlite' \
                --exclude='node_modules' \
                --exclude='.env*' \
                --exclude='*.log' \
                --exclude='.git' \
                . "$APP_DIR/"
    
    # Set ownership
    sudo chown -R "$USER_NAME:$USER_NAME" "$APP_DIR"
    
    echo -e "${GREEN}✅ Files deployed${NC}"
}

install_dependencies() {
    echo -e "${BLUE}📦 Installing production dependencies...${NC}"
    
    cd "$APP_DIR"
    
    # Install only production dependencies
    sudo -u "$USER_NAME" npm ci --only=production --no-audit --no-fund --loglevel=error
    
    echo -e "${GREEN}✅ Dependencies installed${NC}"
}

start_application() {
    echo -e "${BLUE}🚀 Starting application...${NC}"
    
    cd "$APP_DIR"
    
    # Start with PM2
    sudo -u "$USER_NAME" pm2 start ecosystem.config.js
    
    # Save PM2 configuration
    sudo -u "$USER_NAME" pm2 save
    
    echo -e "${GREEN}✅ Application started${NC}"
}

health_check() {
    echo -e "${BLUE}🔍 Performing health check...${NC}"
    
    # Wait for application to start
    sleep 10
    
    # Check if application is responding
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Health check passed${NC}"
        return 0
    else
        echo -e "${RED}❌ Health check failed${NC}"
        echo -e "${YELLOW}📋 Recent logs:${NC}"
        sudo -u "$USER_NAME" pm2 logs --lines 20
        return 1
    fi
}

show_status() {
    echo -e "${BLUE}📊 Application Status${NC}"
    echo "===================="
    
    echo -e "${GREEN}✅ PM2 Status:${NC}"
    sudo -u "$USER_NAME" pm2 status
    
    echo -e "\n${GREEN}✅ Health Check:${NC}"
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        echo "✅ Backend is healthy and responding"
    else
        echo "❌ Backend health check failed"
    fi
}

deploy() {
    echo -e "${BLUE}🚀 Starting deployment...${NC}"
    
    check_user
    create_directories
    backup_database
    stop_application
    deploy_files
    install_dependencies
    start_application
    
    if health_check; then
        echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
        show_status
        return 0
    else
        echo -e "${RED}❌ Deployment failed!${NC}"
        return 1
    fi
}

main() {
    local command=${1:-deploy}
    
    case $command in
        deploy)
            deploy
            ;;
        status)
            show_status
            ;;
        logs)
            echo -e "${BLUE}📋 Application Logs${NC}"
            sudo -u "$USER_NAME" pm2 logs --lines 50
            ;;
        restart)
            echo -e "${BLUE}🔄 Restarting application...${NC}"
            sudo -u "$USER_NAME" pm2 restart "$APP_NAME"
            echo -e "${GREEN}✅ Application restarted${NC}"
            ;;
        stop)
            echo -e "${BLUE}🛑 Stopping application...${NC}"
            sudo -u "$USER_NAME" pm2 stop "$APP_NAME"
            echo -e "${GREEN}✅ Application stopped${NC}"
            ;;
        *)
            echo -e "${RED}❌ Unknown command: $command${NC}"
            echo "Available commands: deploy, status, logs, restart, stop"
            exit 1
            ;;
    esac
}

main "$@"
