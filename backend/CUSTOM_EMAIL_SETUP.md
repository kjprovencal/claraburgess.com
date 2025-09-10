# Custom Domain Email Setup

If you have a custom domain email (like `admin@clarasworld.com`), you can use SMTP instead of Gmail OAuth 2.0. This is often simpler and doesn't require OAuth setup.

## Quick Setup

### 1. Configure Environment Variables

Add these to your `.env` file:

```env
# Email Configuration (Custom SMTP)
EMAIL_SERVICE=smtp
EMAIL_USER=admin@clarasworld.com
EMAIL_PASSWORD=your_email_password
SMTP_HOST=mail.clarasworld.com
SMTP_PORT=587
SMTP_SECURE=false
FROM_EMAIL=admin@clarasworld.com
ADMIN_EMAIL=admin@clarasworld.com
```

### 2. Test the Setup

```bash
node test-email.js
```

### Zoho
```env
EMAIL_SERVICE=smtp
EMAIL_USER=admin@clarasworld.com
EMAIL_PASSWORD=your_email_password
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_SECURE=false
```