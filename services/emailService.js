const { Resend } = require('resend');

class EmailService {
  constructor() {
    this.resend = null;
    this.initializeResend();
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
        <body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0f; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #111118; border-radius: 8px; border: 1px solid #1e1e2e;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="padding: 32px 40px; border-bottom: 1px solid #1e1e2e;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td>
                            <img src="https://teklegion.org/images/TekLegion%20logo.png" alt="TekLegion" width="40" height="40" style="border-radius: 8px; vertical-align: middle;" />
                            <span style="color: #ffffff; font-size: 18px; font-weight: 600; margin-left: 12px; vertical-align: middle;">TekLegion</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h1 style="color: #ffffff; font-size: 24px; font-weight: 600; margin: 0 0 8px 0;">New Contact Submission</h1>
                      <p style="color: #71717a; font-size: 14px; margin: 0 0 32px 0;">${date}</p>
                      
                      <!-- Contact Info -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0f; border-radius: 6px; margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 24px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                              <tr>
                                <td style="padding-bottom: 16px; border-bottom: 1px solid #1e1e2e;">
                                  <span style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Name</span>
                                  <p style="color: #ffffff; font-size: 15px; margin: 4px 0 0 0;">${contactData.name}</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 16px 0; border-bottom: 1px solid #1e1e2e;">
                                  <span style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Email</span>
                                  <p style="margin: 4px 0 0 0;"><a href="mailto:${contactData.email}" style="color: #818cf8; font-size: 15px; text-decoration: none;">${contactData.email}</a></p>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 16px 0; border-bottom: 1px solid #1e1e2e;">
                                  <span style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Subject</span>
                                  <p style="color: #ffffff; font-size: 15px; margin: 4px 0 0 0;">${contactData.subject}</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding-top: 16px;">
                                  <span style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Project Size</span>
                                  <p style="color: #ffffff; font-size: 15px; margin: 4px 0 0 0;">${this.getBudgetDisplay(contactData.budget)}</p>
                                </td>
                              </tr>
                              ${contactData.company ? `
                              <tr>
                                <td style="padding-top: 16px; border-top: 1px solid #1e1e2e; margin-top: 16px;">
                                  <span style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Company</span>
                                  <p style="color: #ffffff; font-size: 15px; margin: 4px 0 0 0;">${contactData.company}</p>
                                </td>
                              </tr>
                              ` : ''}
                              ${contactData.phone ? `
                              <tr>
                                <td style="padding-top: 16px; border-top: 1px solid #1e1e2e;">
                                  <span style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Phone</span>
                                  <p style="margin: 4px 0 0 0;"><a href="tel:${contactData.phone}" style="color: #818cf8; font-size: 15px; text-decoration: none;">${contactData.phone}</a></p>
                                </td>
                              </tr>
                              ` : ''}
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Message -->
                      <h2 style="color: #ffffff; font-size: 14px; font-weight: 600; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">Message</h2>
                      <div style="background-color: #0a0a0f; border-radius: 6px; padding: 20px; border-left: 3px solid #818cf8;">
                        <p style="color: #d4d4d8; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${contactData.message}</p>
                      </div>
                      
                      <!-- Actions -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 32px;">
                        <tr>
                          <td>
                            <a href="mailto:${contactData.email}?subject=Re: ${contactData.subject}" style="display: inline-block; background-color: #818cf8; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500;">Reply to ${contactData.name.split(' ')[0]}</a>
                            ${contactData.phone ? `<a href="tel:${contactData.phone}" style="display: inline-block; background-color: transparent; color: #818cf8; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500; border: 1px solid #818cf8; margin-left: 12px;">Call</a>` : ''}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 40px; border-top: 1px solid #1e1e2e;">
                      <p style="color: #52525b; font-size: 12px; margin: 0;">TekLegion Contact Form Notification</p>
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
        to: process.env.CONTACT_EMAIL || 'techlegion01@gmail.com',
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

      const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thank you for contacting TekLegion</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#0a0a0f" style="background-color: #0a0a0f;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#111118" style="background-color: #111118; border-radius: 8px; max-width: 600px;">
                  
                  <!-- Header with Logo -->
                  <tr>
                    <td align="center" style="padding: 40px 40px 30px 40px;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td align="center">
                            <img src="https://teklegion.org/images/TekLegion%20logo.png" alt="TekLegion Logo" width="50" height="50" style="display: block; border: 0; border-radius: 8px;" />
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding-top: 16px;">
                            <span style="color: #ffffff; font-size: 20px; font-weight: bold;">TekLegion</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 0 40px 40px 40px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td>
                            <h1 style="color: #ffffff; font-size: 22px; font-weight: bold; margin: 0 0 24px 0; text-align: center;">Thank you for reaching out</h1>
                          </td>
                        </tr>
                        <tr>
                          <td style="color: #d4d4d8; font-size: 15px; line-height: 24px; padding-bottom: 20px;">
                            Hi ${contactData.name.split(' ')[0]},
                          </td>
                        </tr>
                        <tr>
                          <td style="color: #d4d4d8; font-size: 15px; line-height: 24px; padding-bottom: 24px;">
                            We have received your inquiry regarding <strong style="color: #ffffff;">"${contactData.subject}"</strong> and appreciate you taking the time to contact us.
                          </td>
                        </tr>
                        
                        <!-- What's Next Box -->
                        <tr>
                          <td style="padding-bottom: 24px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#1a1a24" style="background-color: #1a1a24; border-radius: 6px; border-left: 3px solid #818cf8;">
                              <tr>
                                <td style="padding: 20px;">
                                  <p style="color: #818cf8; font-size: 12px; font-weight: bold; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">What happens next</p>
                                  <p style="color: #a1a1aa; font-size: 14px; line-height: 22px; margin: 0;">Our team will review your message and respond within 24-48 business hours with a detailed response tailored to your needs.</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        
                        <!-- Inquiry Summary -->
                        <tr>
                          <td style="padding-bottom: 24px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#1a1a24" style="background-color: #1a1a24; border-radius: 6px;">
                              <tr>
                                <td style="padding: 20px;">
                                  <p style="color: #818cf8; font-size: 12px; font-weight: bold; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 1px;">Your inquiry</p>
                                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                    <tr>
                                      <td style="padding-bottom: 12px;">
                                        <p style="color: #71717a; font-size: 12px; margin: 0 0 4px 0;">Subject</p>
                                        <p style="color: #ffffff; font-size: 14px; margin: 0;">${contactData.subject}</p>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style="padding-top: 12px; border-top: 1px solid #2a2a3a;">
                                        <p style="color: #71717a; font-size: 12px; margin: 0 0 4px 0;">Submitted</p>
                                        <p style="color: #ffffff; font-size: 14px; margin: 0;">${date}</p>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        
                        <tr>
                          <td style="color: #d4d4d8; font-size: 15px; line-height: 24px; padding-bottom: 24px;">
                            For urgent matters, you can reach us directly at <a href="tel:+2347019683215" style="color: #818cf8; text-decoration: none;">+234 701-968-3215</a>.
                          </td>
                        </tr>
                        <tr>
                          <td style="color: #d4d4d8; font-size: 15px; line-height: 24px;">
                            Best regards,<br><strong style="color: #ffffff;">The TekLegion Team</strong>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 40px; border-top: 1px solid #1e1e2e;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td align="center">
                            <p style="color: #52525b; font-size: 12px; margin: 0;">TekLegion - AI & Software Development</p>
                            <p style="color: #52525b; font-size: 12px; margin: 8px 0 0 0;"><a href="https://teklegion.org" style="color: #71717a; text-decoration: none;">teklegion.org</a></p>
                          </td>
                        </tr>
                      </table>
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
        to: newsletterData.recipients,
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