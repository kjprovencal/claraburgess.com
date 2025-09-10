import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;
  private readonly adminEmail: string;
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.fromEmail =
      this.configService.get<string>('FROM_EMAIL') ||
      'noreply@claraburgess.com';
    this.adminEmail =
      this.configService.get<string>('ADMIN_EMAIL') || 'admin@claraburgess.com';

    // Initialize transporter asynchronously
    this.initializeTransporter().catch((error) => {
      this.logger.error('Failed to initialize email transporter:', error);
    });
  }

  private async initializeTransporter() {
    const emailUser = this.configService.get<string>('EMAIL_USER');
    const emailPassword = this.configService.get<string>('EMAIL_PASSWORD');
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<string>('SMTP_PORT');
    const smtpSecure = this.configService.get<string>('SMTP_SECURE') === 'true';

    if (emailUser && emailPassword) {
      // Use SMTP with username/password
      this.initializeSMTP(
        emailUser,
        emailPassword,
        smtpHost,
        smtpPort,
        smtpSecure,
      );
    } else {
      this.logger.warn(
        'Email credentials not found. Email notifications will be disabled.',
      );
      this.logger.warn(
        'Required: EMAIL_USER and either EMAIL_PASSWORD or Gmail OAuth credentials',
      );
    }
  }

  private initializeSMTP(
    user: string,
    password: string,
    host?: string,
    port?: string,
    secure?: boolean,
  ) {
    try {
      const config: any = {
        auth: {
          user: user,
          pass: password,
        },
      };

      if (host) {
        // Custom SMTP server
        config.host = host;
        config.port = port ? parseInt(port) : 587;
        config.secure = secure || false;
      }

      this.transporter = nodemailer.createTransport(config);
      this.logger.log(`Email service initialized with SMTP`);
    } catch (error) {
      this.logger.error(`Failed to initialize SMTP:`, error);
    }
  }

  async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn('Email transporter not initialized. Cannot send email.');
      return false;
    }

    try {
      const mailOptions = {
        from: this.fromEmail,
        to,
        subject: template.subject,
        text: template.text,
        html: template.html,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      return false;
    }
  }

  async sendUserApprovalNotification(
    userEmail: string,
    username: string,
  ): Promise<boolean> {
    const template = this.getUserApprovalTemplate(username);
    return this.sendEmail(userEmail, template);
  }

  async sendUserRejectionNotification(
    userEmail: string,
    username: string,
    rejectionReason?: string,
  ): Promise<boolean> {
    const template = this.getUserRejectionTemplate(username, rejectionReason);
    return this.sendEmail(userEmail, template);
  }

  async sendAdminNewUserNotification(
    userEmail: string,
    username: string,
  ): Promise<boolean> {
    const template = this.getAdminNewUserTemplate(userEmail, username);
    return this.sendEmail(this.adminEmail, template);
  }

  private getUserApprovalTemplate(username: string): EmailTemplate {
    const subject = "Welcome to Clara's World!";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Welcome to Clara's World! 👶</h2>
        
        <p>Dear ${username},</p>
        
        <p>Great news! Your account has been approved and you can now access Clara's baby registry and personal website.</p>
        
        <p>You can now:</p>
        <ul>
          <li>View Clara's baby registry</li>
          <li>See photos and updates about Clara</li>
          <li>Manage your account settings</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${this.getFrontendUrl()}/login" 
             style="background-color: #ff69b4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Login to Clara's World
          </a>
        </div>
        
        <p>Thank you for being part of Clara's journey! If you have any questions, please don't hesitate to contact us.</p>
        
        <p>With love,<br>
        The Provencal Family</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666; text-align: center;">
          This email was sent from Clara's World. If you did not request this, please ignore this email.
        </p>
      </div>
    `;

    const text = `
      Welcome to Clara's World! 👶
        
      Dear ${username},
        
      Great news! Your account has been approved and you can now access Clara's baby registry and personal website.
        
      You can now:
      - View Clara's baby registry
      - See photos and updates about Clara
      - Manage your account settings
        
      Login to Clara's World: ${this.getFrontendUrl()}/login
        
      Thank you for being part of Clara's journey! If you have any questions, please don't hesitate to contact us.
        
      With love,
      The Provencal Family
    `;

    return { subject, html, text };
  }

  private getUserRejectionTemplate(
    username: string,
    rejectionReason?: string,
  ): EmailTemplate {
    const subject = "Account Registration Update - Clara's World";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Account Registration Update</h2>
        
        <p>Dear ${username},</p>
        
        <p>Thank you for your interest in Clara's World. Unfortunately, we are unable to approve your account registration at this time.</p>
        
        ${
          rejectionReason
            ? `
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #dc3545; margin: 20px 0;">
          <strong>Reason:</strong> ${rejectionReason}
        </div>
        `
            : ''
        }
        
        <p>If you believe this is an error or would like to discuss your registration, please contact us directly.</p>
        
        <p>Thank you for your understanding.</p>
        
        <p>Best regards,<br>
        The Provencal Family</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666; text-align: center;">
          This email was sent from Clara's World. If you did not request this, please ignore this email.
        </p>
      </div>
    `;

    const text = `
      Account Registration Update - Clara's World

      Dear ${username},

      Thank you for your interest in Clara's World. Unfortunately, we are unable to approve your account registration at this time.

      ${rejectionReason ? `Reason: ${rejectionReason}` : ''}

      If you believe this is an error or would like to discuss your registration, please contact us directly.

      Thank you for your understanding.

      Best regards,
      The Provencal Family
    `;

    return { subject, html, text };
  }

  private getAdminNewUserTemplate(
    userEmail: string,
    username: string,
  ): EmailTemplate {
    const subject = "New User Registration - Clara's World";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">New User Registration 👶</h2>
        
        <p>Someone new wants to join Clara's World and is waiting for approval:</p>
        
        <div style="background-color: #fff0f5; padding: 20px; border-radius: 5px; margin: 20px 0; border: 2px solid #ff69b4;">
          <p><strong>Username:</strong> ${username}</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Registration Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${this.getFrontendUrl()}/admin" 
             style="background-color: #ff69b4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Review Registration
          </a>
        </div>
        
        <p>Please log in to the admin panel to approve or reject this user registration.</p>
        
        <p>Best regards,<br>
        Clara's World System</p>
      </div>
    `;

    const text = `
      New User Registration - Clara's World 👶

      Someone new wants to join Clara's World and is waiting for approval:

      Username: ${username}
      Email: ${userEmail}
      Registration Time: ${new Date().toLocaleString()}

      Please log in to the admin panel to approve or reject this user registration: ${this.getFrontendUrl()}/admin

      Best regards,
      Clara's World System
    `;

    return { subject, html, text };
  }

  private getFrontendUrl(): string {
    return (
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'
    );
  }
}
