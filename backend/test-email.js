// Simple test script to verify Gmail OAuth 2.0 email functionality
// Run with: node test-email.js

const nodemailer = require('nodemailer');
require('dotenv').config();

// Check if email configuration is set up
const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD;

if (!emailUser) {
  console.error('❌ EMAIL_USER not found in environment variables');
  console.log('Please add EMAIL_USER to your .env file');
  process.exit(1);
}

if (!emailPassword) {
  console.error('❌ Email credentials not found');
  console.log('Please add:');
  console.log('  EMAIL_PASSWORD=your_email_password');
  console.log('  SMTP_HOST=mail.yourdomain.com (optional)');
  console.log('  SMTP_PORT=587 (optional)');
  process.exit(1);
}

// Test email configuration
const fromEmail = process.env.FROM_EMAIL || emailUser;
const adminEmail = process.env.ADMIN_EMAIL || 'admin@clarasworld.com';

console.log('📧 Testing Email Configuration...');
console.log(`From Email: ${fromEmail}`);
console.log(`Admin Email: ${adminEmail}`);
console.log(`Authentication: ${hasOAuth ? 'OAuth 2.0' : 'SMTP'}`);
console.log('');

let transporter;

// Create transporter with SMTP
const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT;
const smtpSecure = process.env.SMTP_SECURE === 'true';

const config = {
  auth: {
    user: emailUser,
    pass: emailPassword,
  },
};

config.host = smtpHost;
config.port = smtpPort ? parseInt(smtpPort) : 587;
config.secure = smtpSecure || false;

transporter = nodemailer.createTransport(config);

// Test email content
const testEmail = {
  from: fromEmail,
  to: adminEmail,
  subject: "SMTP Test - Clara's World",
  text: 'This is a test email to verify SMTP is working correctly.',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; text-align: center;">SMTP Test Email 👶</h2>
      <p>This is a test email to verify that SMTP is configured correctly for Clara's World.</p>
      <p>If you receive this email, your email notifications are working! 🎉</p>
      <p><strong>Test Details:</strong></p>
      <ul>
        <li>From: ${fromEmail}</li>
        <li>To: ${adminEmail}</li>
        <li>Timestamp: ${new Date().toLocaleString()}</li>
      </ul>
      <p>Best regards,<br>Clara's World System</p>
    </div>
  `,
};

// Send test email
async function sendTestEmail() {
  try {
    await transporter.sendMail(testEmail);

    console.log('✅ Test email sent successfully!');
    console.log(`📬 Check ${adminEmail} for the test email`);
    console.log('');
    console.log('🎉 Email notifications are ready to use!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Register a new user to test admin notifications');
    console.log('2. Approve/reject users to test user notifications');
    console.log('3. Check your email sent folder to verify delivery');
  } catch (error) {
    console.error('❌ Failed to send test email:', error.message);
    console.log('');
    console.log('Troubleshooting:');
    console.log('1. Verify your EMAIL_USER and EMAIL_PASSWORD are correct');
    console.log('2. Check your SMTP server settings');
    console.log('3. Ensure your email provider allows SMTP access');
    console.log('4. Check firewall settings');
    console.log('5. Verify your email account is not locked');
  }
}

sendTestEmail();
