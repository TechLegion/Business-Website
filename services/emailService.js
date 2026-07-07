const { Resend } = require('resend');

class EmailService {
  constructor() {
    this.resend = null;
    this.initializeResend();
  }

  // HTML-escape user-provided content to prevent injection
  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  initializeResend() {
    // Initialize Resend with API key
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
      console.log('📧 Email service initialized with Resend');
    } else {
      console.warn('⚠️ RESEND_API_KEY not set - emails will not be sent');
    }
  }

  async sendContactNotification(contactData) {
    try {
      // Skip email sending in development if disabled
      if (process.env.NODE_ENV === 'development' && process.env.DISABLE_EMAIL === 'true') {
        console.log('📧 Email sending disabled in development mode');
        console.log('📧 Contact notification would be sent to:', process.env.CONTACT_EMAIL);
        console.log('📧 Contact data:', {
          name: contactData.name,
          email: contactData.email,
          subject: contactData.subject,
          budget: contactData.budget
        });
        return { messageId: 'development-mode', success: true };
      }

      const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; border: 1px solid #d1d5db; overflow: hidden;">
                  
                  <!-- Header -->
                  <tr>
                    <td align="center" style="padding: 36px 40px 24px 40px; border-bottom: 1px solid #e2e8f0;">
                      <img src="https://teklegion.org/images/TekLegion_dark_for_light_theme.png" alt="TekLegion Labs" width="180" style="display: block; border: 0; outline: none; height: auto;" />
                      <p style="color: #64748b; font-size: 12px; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; margin: 14px 0 0 0;">Building Intelligent Software</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h1 style="color: #0f172a; font-size: 22px; font-weight: 700; margin: 0 0 8px 0;">New Contact Submission</h1>
                      <p style="color: #64748b; font-size: 14px; margin: 0 0 28px 0;">${date}</p>
                      
                      <!-- Contact Info -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 28px; border-collapse: separate;">
                        <tr>
                          <td style="padding: 24px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                              <tr>
                                <td style="padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
                                  <span style="color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Name</span>
                                  <p style="color: #0f172a; font-size: 15px; font-weight: 500; margin: 6px 0 0 0;">${this.escapeHtml(contactData.name)}</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 16px 0; border-bottom: 1px solid #e2e8f0;">
                                  <span style="color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Email</span>
                                  <p style="margin: 6px 0 0 0;"><a href="mailto:${this.escapeHtml(contactData.email)}" style="color: #3730a3; font-size: 15px; font-weight: 500; text-decoration: none;">${this.escapeHtml(contactData.email)}</a></p>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 16px 0; border-bottom: 1px solid #e2e8f0;">
                                  <span style="color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Subject</span>
                                  <p style="color: #475569; font-size: 15px; font-weight: 500; margin: 6px 0 0 0; font-family: 'Courier New', Courier, monospace; background-color: #f1f5f9; padding: 8px 12px; border-radius: 4px; border: 1px solid #e2e8f0;">${this.escapeHtml(contactData.subject)}</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 16px 0; ${contactData.company || contactData.phone ? 'border-bottom: 1px solid #e2e8f0;' : ''}">
                                  <span style="color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Project Size</span>
                                  <p style="color: #0f172a; font-size: 15px; font-weight: 500; margin: 6px 0 0 0;">${this.getBudgetDisplay(contactData.budget)}</p>
                                </td>
                              </tr>
                              ${contactData.company ? `
                              <tr>
                                <td style="padding: 16px 0; ${contactData.phone ? 'border-bottom: 1px solid #e2e8f0;' : ''}">
                                  <span style="color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Company</span>
                                  <p style="color: #0f172a; font-size: 15px; font-weight: 500; margin: 6px 0 0 0;">${this.escapeHtml(contactData.company)}</p>
                                </td>
                              </tr>
                              ` : ''}
                              ${contactData.phone ? `
                              <tr>
                                <td style="padding-top: 16px;">
                                  <span style="color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Phone</span>
                                  <p style="margin: 6px 0 0 0;"><a href="tel:${contactData.phone}" style="color: #3730a3; font-size: 15px; font-weight: 500; text-decoration: none;">${contactData.phone}</a></p>
                                </td>
                              </tr>
                              ` : ''}
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Message -->
                      <h2 style="color: #475569; font-size: 12px; font-weight: 600; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px;">Message</h2>
                      <div style="background-color: #f1f5f9; border-radius: 8px; padding: 22px; border: 1px solid #e2e8f0; border-left: 4px solid #3730a3;">
                        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0; white-space: pre-wrap; font-family: 'Courier New', Courier, monospace;">${this.escapeHtml(contactData.message)}</p>
                      </div>
                      
                      <!-- Actions -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 32px;">
                        <tr>
                          <td>
                            <a href="mailto:${this.escapeHtml(contactData.email)}?subject=Re: ${this.escapeHtml(contactData.subject)}" style="display: inline-block; background-color: #3730a3; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: 600;">Reply to ${this.escapeHtml(contactData.name.split(' ')[0])}</a>
                            ${contactData.phone ? `<a href="tel:${contactData.phone}" style="display: inline-block; background-color: transparent; color: #3730a3; padding: 10px 22px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; border: 1.5px solid #3730a3; margin-left: 12px;">Call Client</a>` : ''}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 28px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
                      <p style="color: #0f172a; font-size: 14px; font-weight: 700; margin: 0 0 4px 0;">TekLegion Labs</p>
                      <p style="color: #64748b; font-size: 12px; margin: 0;">Contact Form System &bull; Lagos, Nigeria</p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      if (!this.resend) {
        console.log('📧 Email service not configured - skipping notification');
        return { success: false, message: 'Email service not configured' };
      }

      const result = await this.resend.emails.send({
        from: 'TekLegion <contact@teklegion.org>',
        to: 'techlegion01@gmail.com',
        bcc: ['sammyokorie0@gmail.com', 'samuel@teklegion.org'],
        subject: `New Contact Form Submission: ${contactData.subject}`,
        html: html
      });

      console.log('Contact notification email sent:', result.id);
      return result;
    } catch (error) {
      console.error('Error sending contact notification email:', error);
      throw error;
    }
  }

  async sendContactConfirmation(contactData) {
    try {
      // Skip email sending in development if disabled
      if (process.env.NODE_ENV === 'development' && process.env.DISABLE_EMAIL === 'true') {
        console.log('📧 Email sending disabled in development mode');
        console.log('📧 Contact confirmation would be sent to:', contactData.email);
        return { messageId: 'development-mode', success: true };
      }

      const now = new Date();
      const date = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Generate reference number: TK-YYYYMMDD-HHmm
      const refNumber = `TK-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

      const isReply = contactData.message && contactData.message.trim().length > 0;

      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>We've received your enquiry — TekLegion</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; border: 1px solid #d1d5db; overflow: hidden; max-width: 600px;">
                  
                  <!-- Header with Logo & Tagline -->
                  <tr>
                    <td align="center" style="padding: 36px 40px 24px 40px; border-bottom: 1px solid #e2e8f0;">
                      <img src="https://teklegion.org/images/TekLegion_dark_for_light_theme.png" alt="TekLegion Labs" width="180" style="display: block; border: 0; outline: none; height: auto;" />
                      <p style="color: #64748b; font-size: 12px; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; margin: 14px 0 0 0;">Building Intelligent Software</p>
                    </td>
                  </tr>
                  
                  <!-- Reference Number Bar -->
                  <tr>
                    <td style="padding: 12px 40px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                      <p style="color: #94a3b8; font-size: 11px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Reference: <span style="color: #3730a3; font-family: 'Courier New', Courier, monospace;">${refNumber}</span></p>
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        ${isReply ? `
                        <!-- Admin Response View -->
                        <tr>
                          <td>
                            <h1 style="color: #0f172a; font-size: 22px; font-weight: 700; margin: 0 0 16px 0;">Response to Your Inquiry</h1>
                            <p style="color: #334155; font-size: 15px; line-height: 24px; margin: 0 0 20px 0;">Hi ${contactData.name.split(' ')[0]},</p>
                            
                            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #3730a3; border-radius: 8px; padding: 24px; margin-bottom: 28px;">
                              <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${contactData.message}</p>
                            </div>
                          </td>
                        </tr>
                        ` : `
                        <!-- Standard Auto-Confirmation View -->
                        <tr>
                          <td>
                            <h1 style="color: #0f172a; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">We've Received Your Enquiry</h1>
                            <p style="color: #334155; font-size: 15px; line-height: 24px; margin: 0 0 20px 0;">Hi ${contactData.name.split(' ')[0]},</p>
                            <p style="color: #334155; font-size: 16px; line-height: 26px; margin: 0 0 24px 0;">We've received your enquiry and one of our engineers will review it shortly. You can expect a response within one business day.</p>
                            
                            <!-- What's Next Box -->
                            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #3730a3; border-radius: 8px; padding: 24px; margin-bottom: 28px;">
                              <p style="color: #3730a3; font-size: 11px; font-weight: 700; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">What happens next</p>
                              <p style="color: #475569; font-size: 15px; line-height: 24px; margin: 0;">Our team will assess your requirements and prepare a tailored response. If we need any additional information, we'll reach out directly.</p>
                            </div>
                          </td>
                        </tr>
                        `}
                        
                        <!-- Inquiry Reference Details -->
                        <tr>
                          <td>
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                              <tr>
                                <td style="padding: 24px;">
                                  <p style="color: #475569; font-size: 11px; font-weight: 700; margin: 0 0 18px 0; text-transform: uppercase; letter-spacing: 1px;">Inquiry Details</p>
                                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                    <tr>
                                      <td style="padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
                                        <p style="color: #64748b; font-size: 11px; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px;">Subject</p>
                                        <p style="color: #475569; font-size: 14px; font-weight: 500; margin: 0; font-family: 'Courier New', Courier, monospace; background-color: #f1f5f9; padding: 8px 12px; border-radius: 4px; border: 1px solid #e2e8f0;">${this.escapeHtml(contactData.subject)}</p>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style="padding: 16px 0; border-bottom: 1px solid #e2e8f0;">
                                        <p style="color: #64748b; font-size: 11px; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px;">Reference</p>
                                        <p style="color: #3730a3; font-size: 14px; font-weight: 600; margin: 0; font-family: 'Courier New', Courier, monospace;">${refNumber}</p>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style="padding-top: 16px;">
                                        <p style="color: #64748b; font-size: 11px; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px;">Date Submitted</p>
                                        <p style="color: #0f172a; font-size: 14px; font-weight: 500; margin: 0;">${date}</p>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        
                        <!-- CTA Button -->
                        <tr>
                          <td align="center" style="padding: 32px 0 0 0;">
                            <a href="https://teklegion.org/#services" style="display: inline-block; background-color: #3730a3; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: 600; letter-spacing: 0.3px;">Explore Our Services</a>
                          </td>
                        </tr>
                        
                        <tr>
                          <td style="color: #475569; font-size: 15px; line-height: 26px; padding: 28px 0 0 0;">
                            Have any immediate questions? Connect with us at <a href="mailto:contact@teklegion.org" style="color: #3730a3; text-decoration: none; font-weight: 600;">contact@teklegion.org</a> or call <a href="tel:+2348107429870" style="color: #3730a3; text-decoration: none; font-weight: 600;">+234 810 742 9870</a>.
                          </td>
                        </tr>
                        
                        <tr>
                          <td style="color: #475569; font-size: 15px; line-height: 26px; padding: 20px 0 0 0;">
                            Best regards,<br><strong style="color: #0f172a;">The TekLegion Team</strong>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 28px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
                      <p style="color: #94a3b8; font-size: 12px; font-style: italic; margin: 0 0 16px 0;">Trusted by startups and growing businesses across Africa.</p>
                      <p style="color: #0f172a; font-size: 14px; font-weight: 700; margin: 0 0 6px 0;">TekLegion Labs</p>
                      <p style="color: #64748b; font-size: 12px; margin: 0 0 12px 0;">AI &bull; Software Engineering &bull; Automation</p>
                      <p style="color: #64748b; font-size: 12px; margin: 0 0 4px 0;"><a href="mailto:contact@teklegion.org" style="color: #3730a3; text-decoration: none; font-weight: 500;">contact@teklegion.org</a></p>
                      <p style="color: #64748b; font-size: 12px; margin: 0 0 14px 0;"><a href="https://teklegion.org" style="color: #3730a3; text-decoration: none; font-weight: 500;">teklegion.org</a></p>
                      <p style="color: #94a3b8; font-size: 11px; margin: 0;">&copy; ${now.getFullYear()} TekLegion Labs. All rights reserved.</p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      if (!this.resend) {
        console.log('📧 Email service not configured - skipping confirmation');
        return { success: false, message: 'Email service not configured' };
      }

      const result = await this.resend.emails.send({
        from: 'TekLegion <contact@teklegion.org>',
        to: contactData.email,
        subject: 'Thank you for contacting TekLegion',
        html: html
      });

      console.log('Contact confirmation email sent:', result.id);
      return result;
    } catch (error) {
      console.error('Error sending contact confirmation email:', error);
      throw error;
    }
  }

  async sendProjectInquiry(projectData) {
    try {
      const mailOptions = {
        from: `"TekLegion" <${process.env.EMAIL_USER}>`,
        to: process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
        subject: `New Project Inquiry: ${projectData.title}`,
        template: 'project-inquiry',
        context: {
          project: projectData,
          date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Project inquiry email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending project inquiry email:', error);
      throw error;
    }
  }

  async sendNewsletter(newsletterData) {
    try {
      const mailOptions = {
        from: `"TekLegion Newsletter" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        bcc: newsletterData.recipients,
        subject: newsletterData.subject,
        template: 'newsletter',
        context: {
          ...newsletterData,
          date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        }
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Newsletter sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending newsletter:', error);
      throw error;
    }
  }

  getBudgetDisplay(budget) {
    const budgetMap = {
      'small': 'Small Project ($5K - $20K)',
      'medium': 'Medium Project ($20K - $100K)',
      'large': 'Large Project ($100K+)',
      'consultation': 'Strategy Consultation',
      'discuss': 'Let\'s Discuss'
    };
    return budgetMap[budget] || 'Not specified';
  }

  async testConnection() {
    try {
      if (!this.resend) {
        console.log('Email service not configured');
        return false;
      }
      console.log('Email service (Resend) ready');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
