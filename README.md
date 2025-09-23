# Clara's Baby Registry Website

A beautiful personal website for sharing baby registry information and photos with friends and family. Built with Next.js frontend and NestJS backend.

## Features

- **Landing Page**: Welcome page with countdown timer to baby's arrival
- **Baby Registry**: Interactive registry with categories, priorities, and purchase tracking
- **Photo Gallery**: Share pregnancy journey photos with family and friends
- **Admin Panel**: Secure admin interface for managing registry items and photos
- **Database**: SQLite database with TypeORM for persistent storage
- **Photo Storage**: Cloudinary integration for professional image hosting
- **Responsive Design**: Beautiful, mobile-friendly interface
- **Real-time Updates**: Backend API for managing registry items and photos

## Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Responsive Design** - Mobile-first approach

### Backend

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe backend development
- **TypeORM** - Database ORM with SQLite
- **JWT Authentication** - Secure admin access
- **ConfigModule** - Environment-based configuration
- **Cloudinary** - Professional image hosting and optimization
- **RESTful API** - Clean API endpoints for registry and photos

## Project Structure

```
claraburgess.com/
├── frontend/                 # Next.js frontend application
│   ├── src/app/             # App Router pages
│   │   ├── page.tsx         # Landing page
│   │   ├── about-me/        # About Me page
│   │   ├── about-us/        # About Us page
│   │   ├── registry/        # Baby registry page
│   │   ├── photos/          # Photo gallery page
│   │   └── admin/           # Admin panel
│   └── public/              # Static assets
├── backend/                  # NestJS backend application
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── auth/            # Authentication module
│   │   ├── registry/        # Registry module (items, categories)
│   │   ├── photos/          # Photos module (gallery, categories)
│   │   ├── admin/           # Admin management
│   │   └── app/             # Main application module
│   ├── env.example          # Environment variables template
│   └── package.json         # Backend dependencies
└── README.md                # This file
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn package manager

### Environment Setup

1. **Copy environment template:**

   ```bash
   cd backend
   cp env.example .env
   ```

2. **Edit .env file** with your configuration:

   ```bash
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
   CLOUDINARY_FOLDER=claraburgess.com
   ```

### Backend Setup

1. **Navigate to backend directory:**

   ```bash
   cd backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm run start:dev
   ```

   The backend will be available at `http://localhost:3001`

### Frontend Setup

1. **Navigate to frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`

## Configuration

The application uses NestJS ConfigModule for environment-based configuration:

- **Environment Variables**: All configuration is driven by environment variables
- **Type Safety**: Full TypeScript support for configuration values
- **Development/Production**: Different settings for different environments
- **Security**: Sensitive values like JWT secrets are configurable

## API Endpoints

### Public API

- `GET /api/registry` - Get all registry items
- `GET /api/photos` - Get all photos
- `GET /api/baby-info` - Get baby information (name, due date)

### Admin API (Protected)

- `POST /api/admin/registry` - Create new registry item
- `PUT /api/admin/registry/:id` - Update registry item
- `DELETE /api/admin/registry/:id` - Delete registry item

### Photo Management (Protected)

- `POST /api/photos` - Upload new photo
- `PUT /api/photos/:id` - Update photo details
- `DELETE /api/photos/:id` - Delete photo

### Authentication

- `POST /api/auth/login` - Admin login

## Admin Access

- **URL**: `/admin`
- **Default Credentials**: `admin/admin123`
- **Features**:
  - Add, edit, delete registry items
  - Upload, manage photos
  - Tabbed interface for easy navigation

## Database

- **Type**: SQLite (file-based)
- **ORM**: TypeORM with automatic migrations
- **Auto-seeding**: Initial data populated on first run
- **Location**: `backend/database.sqlite`

## Photo Storage

- **Service**: Cloudinary professional image hosting
- **Features**: Automatic optimization, responsive images, CDN delivery
- **Security**: Admin-only uploads, automatic cleanup on deletion
- **Optimization**: Automatic resizing, compression, format conversion

## Customization

### Environment Configuration

Modify the `backend/.env` file to change:

- Server port
- Database path
- JWT secrets
- Frontend URL
- Environment mode
- Cloudinary settings

### Styling

The site uses Tailwind CSS. Customize colors, fonts, and layout in the component files.

## Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Backend (Railway/Heroku)

1. Set up environment variables
2. Deploy using your preferred platform
3. Update the API proxy in `next.config.ts`

## Contributing

This is a personal project, but feel free to suggest improvements or report issues.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

Built with ❤️ for Clara and family
