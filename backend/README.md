# Clara's World - Backend API

A NestJS backend application for Clara's World, a baby registry and personal website for Clara. This provides user authentication, photo management, and registry functionality for family and friends to stay connected with Clara's journey.

## Features

- **User Authentication**: JWT-based authentication with admin approval workflow
- **Email Notifications**: SMTP integration for user registration and approval notifications
- **Photo Management**: Cloudinary integration for photo uploads and management
- **Registry System**: Baby registry functionality for Clara's needs
- **Admin Panel**: User management and approval system

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Email account (Gmail with OAuth 2.0 or custom domain with SMTP)
- Cloudinary account (for photo storage)

### Installation

1. Clone the repository and navigate to the backend directory:

```bash
cd backend
npm install
```

2. Copy the environment template and configure your settings:

```bash
cp env.example .env
```

3. Update the `.env` file with your configuration:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend Configuration
FRONTEND_URL=http://localhost:3000

# Database Configuration
DATABASE_PATH=database.sqlite

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=claras-world

# Email Configuration (Gmail OAuth 2.0)
EMAIL_SERVICE=gmail
EMAIL_USER=your_gmail_address@gmail.com
GMAIL_CLIENT_ID=your_client_id
GMAIL_CLIENT_SECRET=your_client_secret
GMAIL_REFRESH_TOKEN=your_refresh_token
FROM_EMAIL=your_gmail_address@gmail.com
ADMIN_EMAIL=admin@clarasworld.com
```

### Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod

# Build the application
npm run build
```

## Email Notifications

The application includes comprehensive email notifications using Gmail OAuth 2.0:

- **Admin Notifications**: When new users register
- **User Approval**: Welcome emails when users are approved
- **User Rejection**: Notification emails with rejection reasons

See [EMAIL_SETUP.md](./EMAIL_SETUP.md) for detailed setup instructions.

### Testing Email Configuration

Run the email test script to verify your email setup:

```bash
node test-email.js
```

### Email Setup Options

**Option 1: Gmail OAuth 2.0 (Recommended for Gmail accounts)**
```bash
node generate-refresh-token.js
```

**Option 2: Custom Domain SMTP (For custom domain emails)**
See [CUSTOM_EMAIL_SETUP.md](./CUSTOM_EMAIL_SETUP.md) for detailed instructions.

## API Endpoints

### Authentication

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/approve-user` - Approve/reject user (admin only)
- `GET /auth/pending-users` - Get pending users (admin only)
- `GET /auth/all-users` - Get all users (admin only)

### Photos

- `GET /photos` - Get all photos
- `POST /photos` - Upload new photo (authenticated)
- `PUT /photos/:id` - Update photo (authenticated)
- `DELETE /photos/:id` - Delete photo (authenticated)

### Registry

- `GET /registry` - Get registry items
- `POST /registry` - Create registry item (admin only)
- `PUT /registry/:id` - Update registry item (admin only)
- `DELETE /registry/:id` - Delete registry item (admin only)

## Database

The application uses SQLite for development and can be configured for PostgreSQL in production. The database is automatically created on first run.

### Default Admin User

A default admin user is created automatically:

- Username: `admin`
- Password: `admin123`
- Email: `admin@clarasworld.com`

**Important**: Change the default admin password in production!

## Development

### Project Structure

```
src/
├── auth/           # Authentication module
├── email/          # Email service module
├── photos/         # Photo management module
├── registry/       # Registry module
├── admin/          # Admin functionality
├── config/         # Configuration files
└── main.ts         # Application entry point
```

### Available Scripts

```bash
# Development
npm run start:dev

# Build
npm run build

# Production
npm run start:prod

# Linting
npm run lint

# Testing
npm run test
npm run test:e2e
npm run test:cov
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions.

## Security Considerations

- Change default admin credentials
- Use strong JWT secrets
- Configure CORS properly
- Set up domain authentication for SendGrid
- Use HTTPS in production
- Regularly update dependencies

## Support

For issues and questions, please check the documentation or contact the development team.

## License

This project is private and personal for Clara's World.
