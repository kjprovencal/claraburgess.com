# Authentication System

This application now requires authentication to access the registry and photos pages. Here's how it works:

## Overview

- **Public Access**: Home page is accessible to everyone
- **Authenticated Access**: Registry and Photos pages require login
- **Admin Access**: Admin panel is only available to users with admin role
- **Smart Redirects**: Users are automatically redirected to their intended destination after login

## Smart Redirect System

The authentication system intelligently remembers where users were trying to go:

1. **Direct Links**: If someone visits `/registry` or `/photos` directly (bookmark, direct URL, etc.), they're redirected to login
2. **Return After Login**: After successful authentication, users are automatically taken to the page they originally wanted to visit
3. **Seamless Experience**: No need to navigate back manually - the system handles it automatically

### How It Works

- When an unauthenticated user tries to access a protected route, the system captures the intended destination
- The user is redirected to `/login?returnTo=/registry` (or whatever page they wanted)
- After successful login, they're automatically redirected back to `/registry`
- If no specific destination was captured, users go to the home page

## Default Credentials

The system automatically creates an admin user with these credentials:

- **Username**: `admin`
- **Password**: `admin123`

## How to Use

1. **Login**: Click the "Login" link in the navigation
2. **Access Protected Pages**: Once logged in, you can access Registry and Photos
3. **Admin Features**: If you're an admin user, you'll see an "Admin" link for managing content
4. **Logout**: Click the "Logout" button to sign out

## Technical Details

### Frontend Authentication

- Uses React Context for state management
- JWT tokens stored in localStorage
- Protected routes with automatic redirects
- Smart return URL handling

### Backend Authentication

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control

### API Endpoints

- `POST /api/auth/login` - User authentication
- Protected routes require valid JWT token

## Security Features

- Passwords are hashed using bcrypt
- JWT tokens for session management
- Automatic token validation
- Role-based access control

## Adding New Users

To add new users, you'll need to:

1. Access the backend directly
2. Create a new user entity
3. Hash the password using bcrypt
4. Assign appropriate role

## Troubleshooting

If you can't log in:

1. Check that the backend is running on port 3001
2. Verify the credentials (admin/admin123)
3. Check browser console for any errors
4. Ensure cookies/localStorage are enabled

## User Experience Features

- **Bookmark-Friendly**: Users can bookmark protected pages and will be redirected there after login
- **Direct URL Access**: Typing URLs directly works seamlessly with authentication
- **Context Preservation**: The system maintains user intent throughout the authentication flow
- **No Lost Navigation**: Users never lose their place in the application
