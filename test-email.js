const nodemailer = require('nodemailer');
require('dotenv').config({ path: './config.env' });

async function testEmail() {
  console.log('🔧 Testing Gmail SMTP Configuration...');
  console.log('📧 Email User:', process.env.EMAIL_USER);
  console.log('📧 Email Host:', process.env.EMAIL_HOST);
  console.log('📧 Email Port:', process.env.EMAIL_PORT);
  console.log('📧 Contact Email:', process.env.CONTACT_EMAIL);
  console.log('📧 Disable Email:', process.env.DISABLE_EMAIL);

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    // Test connection
    console.log('\n🔍 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');

    // Send test email
    console.log('\n📤 Sending test email...');
    const mailOptions = {
      from: `"TekLegion Test" <${process.env.EMAIL_USER}>`,
      to: process.env.CONTACT_EMAIL,
      subject: 'Test Email from TekLegion Backend',
      html: `
        <h2>🎉 Email Test Successful!</h2>
        <p>This is a test email from your TekLegion backend.</p>
        <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Server:</strong> Development</p>
        <p>If you receive this email, your Gmail SMTP configuration is working correctly!</p>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    console.log('📧 Check your inbox at:', process.env.CONTACT_EMAIL);

  } catch (error) {
    console.error('❌ Email test failed:');
    console.error('Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Authentication failed. Check your Gmail App Password.');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n💡 Connection failed. Check your internet connection and Gmail settings.');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('\n💡 Connection timeout. Gmail might be blocking the connection.');
    }
  }
}

testEmail();
