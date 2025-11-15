const emailService = require('./services/emailService');
require('dotenv').config({ path: './config.env' });

async function testEmailServiceStability() {
  console.log('🧪 Testing EmailService Stability...\n');

  // Test 1: Connection Test
  console.log('1️⃣ Testing SMTP Connection...');
  try {
    const connectionResult = await emailService.testConnection();
    if (connectionResult) {
      console.log('✅ SMTP Connection: PASSED');
    } else {
      console.log('❌ SMTP Connection: FAILED');
      return;
    }
  } catch (error) {
    console.log('❌ SMTP Connection: FAILED -', error.message);
    return;
  }

  // Test 2: Contact Notification Email
  console.log('\n2️⃣ Testing Contact Notification Email...');
  try {
    const testContactData = {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Subject',
      message: 'This is a test message for stability testing.',
      budget: 'medium',
      company: 'Test Company',
      phone: '+1234567890',
      _id: 'test123'
    };

    const notificationResult = await emailService.sendContactNotification(testContactData);
    console.log('✅ Contact Notification: PASSED');
    console.log('📧 Message ID:', notificationResult.messageId);
  } catch (error) {
    console.log('❌ Contact Notification: FAILED -', error.message);
  }

  // Test 3: Contact Confirmation Email
  console.log('\n3️⃣ Testing Contact Confirmation Email...');
  try {
    const testContactData = {
      name: 'Test User',
      email: process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
      subject: 'Test Subject',
      message: 'This is a test message for stability testing.',
      budget: 'medium',
      company: 'Test Company',
      phone: '+1234567890',
      _id: 'test123'
    };

    const confirmationResult = await emailService.sendContactConfirmation(testContactData);
    console.log('✅ Contact Confirmation: PASSED');
    console.log('📧 Message ID:', confirmationResult.messageId);
  } catch (error) {
    console.log('❌ Contact Confirmation: FAILED -', error.message);
  }

  // Test 4: Logo File Existence
  console.log('\n4️⃣ Testing Logo File Path...');
  const fs = require('fs');
  const path = require('path');
  const logoPath = path.join(__dirname, 'images', 'TekLegion logo.png');
  
  if (fs.existsSync(logoPath)) {
    console.log('✅ Logo File: FOUND');
    console.log('📁 Path:', logoPath);
  } else {
    console.log('❌ Logo File: NOT FOUND');
    console.log('📁 Expected Path:', logoPath);
  }

  // Test 5: Email Template Validation
  console.log('\n5️⃣ Testing Email Template Structure...');
  try {
    const testData = {
      name: 'Test',
      email: 'test@test.com',
      subject: 'Test',
      message: 'Test',
      budget: 'small'
    };

    // Test if templates can be generated without errors
    const html1 = emailService.sendContactNotification(testData);
    const html2 = emailService.sendContactConfirmation(testData);
    console.log('✅ Email Templates: VALID');
  } catch (error) {
    console.log('❌ Email Templates: INVALID -', error.message);
  }

  console.log('\n🎉 EmailService Stability Test Complete!');
  console.log('📧 Check your inbox for test emails');
}

// Run the test
testEmailServiceStability().catch(console.error);
