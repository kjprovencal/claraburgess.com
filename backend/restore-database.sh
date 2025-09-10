#!/bin/bash

# Database Restore Script for Clara's Baby Registry
# This script helps restore the database from a backup

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

echo -e "${BLUE}🔄 Database Restore Script${NC}"
echo "=============================="

# Function to list available backups
list_backups() {
    echo -e "${BLUE}📋 Available database backups:${NC}"
    if [ -d "$APP_DIR" ]; then
        ls -la "$APP_DIR"/database.sqlite.backup.* 2>/dev/null || echo "No backups found"
    else
        echo "Application directory not found: $APP_DIR"
    fi
}

# Function to restore from backup
restore_backup() {
    local backup_file="$1"
    
    if [ ! -f "$backup_file" ]; then
        echo -e "${RED}❌ Backup file not found: $backup_file${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}🔄 Restoring database from: $backup_file${NC}"
    
    # Stop the application
    echo "Stopping application..."
    sudo -u "$USER_NAME" pm2 stop "$APP_NAME" 2>/dev/null || true
    
    # Create backup of current database
    if [ -f "$APP_DIR/database.sqlite" ]; then
        echo "Creating backup of current database..."
        sudo cp "$APP_DIR/database.sqlite" "$APP_DIR/database.sqlite.current.$(date +%Y%m%d_%H%M%S)"
    fi
    
    # Restore from backup
    echo "Restoring database..."
    sudo cp "$backup_file" "$APP_DIR/database.sqlite"
    sudo chown "$USER_NAME:$USER_NAME" "$APP_DIR/database.sqlite"
    
    # Start the application
    echo "Starting application..."
    sudo -u "$USER_NAME" pm2 start "$APP_NAME"
    
    echo -e "${GREEN}✅ Database restored successfully${NC}"
}

# Function to show usage
show_usage() {
    echo -e "${BLUE}Usage:${NC}"
    echo "  $0 [command]"
    echo ""
    echo "Commands:"
    echo "  list                    - List available backups"
    echo "  restore <backup_file>   - Restore from specific backup"
    echo "  latest                  - Restore from latest backup"
    echo "  help                    - Show this help message"
}

# Main execution
main() {
    local command=${1:-help}
    
    case $command in
        list)
            list_backups
            ;;
        restore)
            if [ -z "$2" ]; then
                echo -e "${RED}❌ Please provide backup file path${NC}"
                show_usage
                exit 1
            fi
            restore_backup "$2"
            ;;
        latest)
            latest_backup=$(ls -t "$APP_DIR"/database.sqlite.backup.* 2>/dev/null | head -n1)
            if [ -z "$latest_backup" ]; then
                echo -e "${RED}❌ No backups found${NC}"
                exit 1
            fi
            restore_backup "$latest_backup"
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
