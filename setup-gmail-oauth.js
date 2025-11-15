const nodemailer = require('nodemailer');
const { google } = require('googleapis');
require('dotenv').config({ path: './config.env' });

// Gmail OAuth2 setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

async function createTransporter() {
  try {
    const accessToken = await oauth2Client.getAccessToken();
    
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    return transporter;
  } catch (error) {
    console.error('Error creating OAuth2 transporter:', error);
    return null;
  }
}

async function testGmailOAuth() {
  console.log('🔧 Testing Gmail OAuth2 Configuration...');
  
  const transporter = await createTransporter();
  if (!transporter) {
    console.log('❌ Failed to create OAuth2 transporter');
    console.log('\n💡 To set up Gmail OAuth2:');
    console.log('1. Go to: https://console.developers.google.com/');
    console.log('2. Create a new project or select existing');
    console.log('3. Enable Gmail API');
    console.log('4. Create OAuth2 credentials');
    console.log('5. Add the credentials to config.env');
    return;
  }

  try {
    await transporter.verify();
    console.log('✅ Gmail OAuth2 connection successful!');
    
    // Send test email
    const mailOptions = {
      from: `"TekLegion" <${process.env.EMAIL_USER}>`,
      to: process.env.CONTACT_EMAIL,
      subject: 'Test Email from TekLegion (OAuth2)',
      html: `
        <h2>🎉 Gmail OAuth2 Test Successful!</h2>
        <p>This email was sent using Gmail OAuth2 authentication.</p>
        <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        <p>Your contact form emails should now work properly!</p>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    console.log('📧 Check your inbox at:', process.env.CONTACT_EMAIL);
    
  } catch (error) {
    console.error('❌ Gmail OAuth2 test failed:', error.message);
  }
}

testGmailOAuth();
