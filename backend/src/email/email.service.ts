import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZohoMailApiService } from './zoho-mail-api.service';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly adminEmail: string;

  constructor(
    private configService: ConfigService,
    private zohoMailApiService: ZohoMailApiService,
  ) {
    this.adminEmail =
      this.configService.get<string>('ADMIN_EMAIL') || 'admin@claraburgess.com';
  }

  async sendEmail(to: string, template: EmailTemplate): Promise<boolean>;
  async sendEmail(emailData: {
    to: string;
    subject: string;
    template: string;
    data: any;
  }): Promise<boolean>;
  async sendEmail(
    toOrData:
      | string
      | { to: string; subject: string; template: string; data: any },
    template?: EmailTemplate,
  ): Promise<boolean> {
    try {
      if (!(await this.zohoMailApiService.isReady()))
        throw new Error('Zoho OAuth is not configured');

      this.logger.log('Using Zoho OAuth for email sending');

      let emailTemplate: EmailTemplate;

      if (typeof toOrData === 'string' && template) {
        // Legacy method call
        emailTemplate = template;
      } else if (typeof toOrData === 'object') {
        // New template-based method call
        emailTemplate = this.getTemplate(toOrData.template, toOrData.data);
      } else {
        throw new Error('Invalid email parameters');
      }

      const result = await this.zohoMailApiService.sendEmail({
        toAddress: typeof toOrData === 'string' ? toOrData : toOrData.to,
        subject: emailTemplate.subject,
        content: emailTemplate.html,
        mailFormat: 'html',
      });

      if (!result.success) throw new Error(result.error);
      this.logger.log(
        `Email sent successfully to ${typeof toOrData === 'string' ? toOrData : toOrData.to}`,
      );
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email:`, error);
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

  async sendPasswordResetEmail(
    userEmail: string,
    resetToken: string,
  ): Promise<boolean> {
    const template = this.getPasswordResetTemplate(resetToken);
    return this.sendEmail(userEmail, template);
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

  private getPasswordResetTemplate(resetToken: string): EmailTemplate {
    const subject = "Password Reset Request - Clara's World";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Password Reset Request</h2>

        <p>Hello,</p>

        <p>A password reset request has been made for your account. Please click the link below to reset your password:</p>

        <a href="${this.getFrontendUrl()}/reset-password?token=${resetToken}">Reset Password</a>
      </div>
    `;

    const text = `
      Password Reset Request - Clara's World

      Hello,

      A password reset request has been made for your account. Please click the link below to reset your password:

      ${this.getFrontendUrl()}/reset-password?token=${resetToken}
    `;

    return { subject, html, text };
  }

  private getTemplate(templateName: string, data: any): EmailTemplate {
    switch (templateName) {
      case 'baby-shower-confirmation':
        return this.getBabyShowerConfirmationTemplate(data);
      default:
        throw new Error(`Template '${templateName}' not found`);
    }
  }

  private getBabyShowerConfirmationTemplate(data: {
    name: string;
    guestCount: number;
    eventDetails: {
      date: string;
      time: string;
      location: string;
      registryUrl: string;
    };
    dietaryRestrictions?: string;
    message?: string;
  }): EmailTemplate {
    const subject = `Baby Shower RSVP Confirmation - Clara B's Celebration`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fef7f7;">
        <div style="background-color: white; border-radius: 15px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #ff69b4, #8a2be2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px;">👶</span>
            </div>
            <h1 style="color: #333; margin: 0; font-size: 28px; background: linear-gradient(135deg, #ff69b4, #8a2be2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
              Baby Shower RSVP Confirmed!
            </h1>
            <p style="color: #666; margin: 10px 0 0; font-size: 16px;">
              Thank you for confirming your attendance, ${data.name}!
            </p>
          </div>

          <!-- Event Details -->
          <div style="background: linear-gradient(135deg, #fef7f7, #f0f8ff); border-radius: 10px; padding: 25px; margin-bottom: 25px;">
            <h2 style="color: #333; margin: 0 0 20px; text-align: center; font-size: 22px;">Event Details</h2>
            
            <div style="display: grid; gap: 15px;">
              <div style="display: flex; align-items: center; gap: 15px;">
                <div style="width: 40px; height: 40px; background: #ff69b4; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-size: 18px;">📅</span>
                </div>
                <div>
                  <strong style="color: #333;">Date:</strong>
                  <span style="color: #666; margin-left: 8px;">${data.eventDetails.date}</span>
                </div>
              </div>
              
              <div style="display: flex; align-items: center; gap: 15px;">
                <div style="width: 40px; height: 40px; background: #8a2be2; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-size: 18px;">🕐</span>
                </div>
                <div>
                  <strong style="color: #333;">Time:</strong>
                  <span style="color: #666; margin-left: 8px;">${data.eventDetails.time}</span>
                </div>
              </div>
              
              <div style="display: flex; align-items: center; gap: 15px;">
                <div style="width: 40px; height: 40px; background: #32cd32; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-size: 18px;">📍</span>
                </div>
                <div>
                  <strong style="color: #333;">Location:</strong>
                  <span style="color: #666; margin-left: 8px;">${data.eventDetails.location}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- RSVP Details -->
          <div style="background: #f8f9fa; border-radius: 10px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #333; margin: 0 0 15px; font-size: 18px;">Your RSVP Details</h3>
            <p style="margin: 5px 0; color: #666;"><strong>Guests:</strong> ${data.guestCount} ${data.guestCount === 1 ? 'person' : 'people'}</p>
            ${data.dietaryRestrictions ? `<p style="margin: 5px 0; color: #666;"><strong>Dietary Restrictions:</strong> ${data.dietaryRestrictions}</p>` : ''}
            ${data.message ? `<p style="margin: 5px 0; color: #666;"><strong>Your Message:</strong> "${data.message}"</p>` : ''}
          </div>

          <!-- Registry Link -->
          <div style="text-align: center; margin: 25px 0;">
            <p style="color: #666; margin-bottom: 15px;">Gifts are optional but appreciated!</p>
            <a href="${data.eventDetails.registryUrl}" 
               style="background: linear-gradient(135deg, #ff69b4, #8a2be2); color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              🎁 View Registry
            </a>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; margin: 0; font-size: 14px;">
              We can't wait to celebrate with you! 💕<br>
              Questions? Contact us at <a href="mailto:admin@claraburgess.com" style="color: #ff69b4;">admin@claraburgess.com</a>
            </p>
          </div>
        </div>
      </div>
    `;

    const text = `
      Baby Shower RSVP Confirmation - Clara B's Celebration

      Thank you for confirming your attendance, ${data.name}!

      EVENT DETAILS:
      Date: ${data.eventDetails.date}
      Time: ${data.eventDetails.time}
      Location: ${data.eventDetails.location}

      YOUR RSVP DETAILS:
      Guests: ${data.guestCount} ${data.guestCount === 1 ? 'person' : 'people'}
      ${data.dietaryRestrictions ? `Dietary Restrictions: ${data.dietaryRestrictions}` : ''}
      ${data.message ? `Your Message: "${data.message}"` : ''}

      Gifts are optional but appreciated! View our registry at: ${data.eventDetails.registryUrl}

      We can't wait to celebrate with you! 💕
      Questions? Contact us at admin@claraburgess.com
    `;

    return { subject, html, text };
  }

  private getFrontendUrl(): string {
    return (
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'
    );
  }
}
