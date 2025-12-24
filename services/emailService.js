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
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #1a1a1a; 
              background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
              min-height: 100vh;
              padding: 20px;
            }
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            }
            .header { 
              background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%); 
              color: white; 
              padding: 40px 30px; 
              text-align: center;
              position: relative;
              overflow: hidden;
              border-bottom: 3px solid #6366f1;
            }
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
              opacity: 0.3;
            }
            .logo-section {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 15px;
              margin-bottom: 20px;
              position: relative;
              z-index: 1;
            }
            .logo {
              width: 60px;
              height: 60px;
              border-radius: 12px;
              box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
              border: 2px solid rgba(255, 255, 255, 0.2);
            }
            .logo-text {
              font-size: 2rem;
              font-weight: 800;
              letter-spacing: -1px;
              background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
            .header h1 {
              font-size: 2.5rem;
              font-weight: 800;
              margin-bottom: 10px;
              position: relative;
              z-index: 1;
            }
            .header p {
              font-size: 1.1rem;
              opacity: 0.9;
              position: relative;
              z-index: 1;
            }
            .content { 
              padding: 40px 30px; 
              background: #ffffff;
            }
            .notification-card {
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
              border: 1px solid #f59e0b;
              padding: 25px;
              border-radius: 16px;
              margin-bottom: 30px;
              position: relative;
              overflow: hidden;
            }
            .notification-card::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 4px;
              background: linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b);
            }
            .notification-card h3 {
              color: #92400e;
              font-size: 1.3rem;
              font-weight: 700;
              margin-bottom: 10px;
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .contact-details {
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              border: 1px solid #e2e8f0;
              padding: 30px;
              border-radius: 16px;
              margin: 25px 0;
              position: relative;
            }
            .contact-details h3 {
              color: #1e293b;
              font-size: 1.4rem;
              font-weight: 700;
              margin-bottom: 20px;
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .detail-row {
              display: flex;
              margin-bottom: 15px;
              padding: 12px 0;
              border-bottom: 1px solid #e2e8f0;
            }
            .detail-row:last-child {
              border-bottom: none;
              margin-bottom: 0;
            }
            .detail-label {
              font-weight: 600;
              color: #475569;
              min-width: 120px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .detail-value {
              color: #1e293b;
              flex: 1;
            }
            .detail-value a {
              color: #6366f1;
              text-decoration: none;
              font-weight: 500;
            }
            .detail-value a:hover {
              text-decoration: underline;
            }
            .message-section {
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
              border: 1px solid #0ea5e9;
              padding: 25px;
              border-radius: 16px;
              margin: 25px 0;
            }
            .message-section h3 {
              color: #0c4a6e;
              font-size: 1.3rem;
              font-weight: 700;
              margin-bottom: 15px;
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .message-content {
              background: white;
              padding: 20px;
              border-radius: 12px;
              border: 1px solid #bae6fd;
              white-space: pre-wrap;
              line-height: 1.7;
              color: #1e293b;
            }
            .actions {
              background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
              border: 1px solid #10b981;
              padding: 25px;
              border-radius: 16px;
              margin: 25px 0;
              text-align: center;
            }
            .actions h3 {
              color: #047857;
              font-size: 1.3rem;
              font-weight: 700;
              margin-bottom: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
            }
            .btn { 
              background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
              color: white; 
              padding: 15px 30px; 
              text-decoration: none; 
              border-radius: 12px; 
              display: inline-block; 
              margin: 8px;
              font-weight: 600;
              font-size: 1rem;
              transition: all 0.3s ease;
              box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
            }
            .btn:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
            }
            .btn-call {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
            }
            .btn-call:hover {
              box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
            }
            .footer {
              background: #f8fafc;
              padding: 30px;
              text-align: center;
              border-top: 1px solid #e2e8f0;
            }
            .footer p {
              color: #64748b;
              font-size: 0.9rem;
            }
            @media (max-width: 600px) {
              .email-container { margin: 10px; border-radius: 16px; }
              .header, .content { padding: 30px 20px; }
              .detail-row { flex-direction: column; gap: 5px; }
              .detail-label { min-width: auto; }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <div class="logo-section">
                <img src="https://teklegion.org/images/TekLegion%20logo.png" alt="TekLegion Logo" class="logo" />
                <div class="logo-text">TekLegion</div>
              </div>
              <h1>New Contact Form Submission</h1>
              <p>You have received a new inquiry from your website</p>
            </div>
            
            <div class="content">
              <div class="notification-card">
                <h3>📧 New Inquiry Received</h3>
                <p>A new contact form submission has been received from the TekLegion website. This could be a potential client!</p>
              </div>
              
              <div class="contact-details">
                <h3>👤 Contact Details</h3>
                <div class="detail-row">
                  <div class="detail-label">👤 Name:</div>
                  <div class="detail-value">${contactData.name}</div>
                </div>
                <div class="detail-row">
                  <div class="detail-label">📧 Email:</div>
                  <div class="detail-value"><a href="mailto:${contactData.email}">${contactData.email}</a></div>
                </div>
                <div class="detail-row">
                  <div class="detail-label">💡 Subject:</div>
                  <div class="detail-value">${contactData.subject}</div>
                </div>
                <div class="detail-row">
                  <div class="detail-label">💰 Project Size:</div>
                  <div class="detail-value">${this.getBudgetDisplay(contactData.budget)}</div>
                </div>
                ${contactData.company ? `
                <div class="detail-row">
                  <div class="detail-label">🏢 Company:</div>
                  <div class="detail-value">${contactData.company}</div>
                </div>
                ` : ''}
                ${contactData.phone ? `
                <div class="detail-row">
                  <div class="detail-label">📞 Phone:</div>
                  <div class="detail-value"><a href="tel:${contactData.phone}">${contactData.phone}</a></div>
                </div>
                ` : ''}
                <div class="detail-row">
                  <div class="detail-label">⏰ Submitted:</div>
                  <div class="detail-value">${date}</div>
                </div>
              </div>
              
              <div class="message-section">
                <h3>💬 Message</h3>
                <div class="message-content">${contactData.message}</div>
              </div>
              
              <div class="actions">
                <h3>⚡ Quick Actions</h3>
                <a href="mailto:${contactData.email}?subject=Re: ${contactData.subject}" class="btn">📧 Reply via Email</a>
                ${contactData.phone ? `<a href="tel:${contactData.phone}" class="btn btn-call">📞 Call Now</a>` : ''}
              </div>
            </div>
            
            <div class="footer">
              <p>This email was sent from your TekLegion website contact form.</p>
            </div>
          </div>
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
        <html>
        <head>
          <style>
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #1a1a1a; 
              background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
              min-height: 100vh;
              padding: 20px;
              margin: 0;
            }
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }
            .header { 
              background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%); 
              color: white; 
              padding: 40px 30px; 
              text-align: center;
              position: relative;
              overflow: hidden;
              border-bottom: 3px solid #6366f1;
            }
            .logo-section {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 15px;
              margin-bottom: 20px;
              position: relative;
              z-index: 1;
            }
            .logo {
              width: 60px;
              height: 60px;
              border-radius: 12px;
              box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
              border: 2px solid rgba(255, 255, 255, 0.2);
            }
            .logo-text {
              font-size: 2rem;
              font-weight: 800;
              letter-spacing: -1px;
              background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
            .content { padding: 40px 30px; }
            .highlight { background: #e8f5e8; border: 1px solid #c8e6c9; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .contact-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .btn { background: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 5px; }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <div class="logo-section">
                <img src="https://teklegion.org/images/TekLegion%20logo.png" alt="TekLegion Logo" class="logo" />
                <div class="logo-text">TekLegion</div>
              </div>
              <h1>Thank you for contacting us!</h1>
            </div>
          <div class="content">
            <h2>Thank You for Contacting TekLegion!</h2>
            
            <p>Hi ${contactData.name},</p>
            
            <p>Thank you for reaching out to TekLegion! We've received your message about <strong>"${contactData.subject}"</strong> and we're excited to learn more about your project.</p>
            
            <div class="highlight">
              <h3>✅ What Happens Next?</h3>
              <p>
                <strong>1.</strong> Our team will review your inquiry within 24 hours<br>
                <strong>2.</strong> We'll prepare a detailed response with next steps<br>
                <strong>3.</strong> You'll receive a personalized proposal tailored to your needs
              </p>
            </div>
            
            <div class="contact-info">
              <h3>Your Inquiry Details</h3>
              <p><strong>Subject:</strong> ${contactData.subject}</p>
              <p><strong>Submitted:</strong> ${date}</p>
              <p><strong>Reference ID:</strong> #${contactData._id || 'N/A'}</p>
            </div>
            
            <div class="highlight">
              <h3>🚀 While You Wait</h3>
              <p>
                Explore our services or check out our portfolio to see examples of our work.
              </p>
            </div>
            
            <p>If you have any urgent questions or need immediate assistance, feel free to call us directly at <a href="tel:+2347019683215" style="color: #6366f1;">+234 70-1968-3215</a>.</p>
            
            <p>We look forward to helping you transform your business with modern technology solutions!</p>
            
            <p>Best regards,<br>
            <strong>The TekLegion Team</strong></p>
          </div>
          </div>
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