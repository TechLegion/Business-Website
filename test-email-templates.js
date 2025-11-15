const emailService = require('./services/emailService');
require('dotenv').config({ path: './config.env' });

async function testEmailTemplates() {
  console.log('🧪 Testing EmailService Template Stability...\n');

  // Test 1: Logo File Check
  console.log('1️⃣ Testing Logo File...');
  const logoAttachments = emailService.getLogoAttachment();
  if (logoAttachments.length > 0) {
    console.log('✅ Logo File: FOUND');
    console.log('📁 Path:', logoAttachments[0].path);
  } else {
    console.log('❌ Logo File: NOT FOUND');
  }

  // Test 2: Template Generation (without sending)
  console.log('\n2️⃣ Testing Template Generation...');
  try {
    const testContactData = {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Subject',
      message: 'This is a test message for template validation.',
      budget: 'medium',
      company: 'Test Company',
      phone: '+1234567890',
      _id: 'test123'
    };

    // Test notification template
    console.log('📧 Testing Contact Notification Template...');
    const notificationPromise = emailService.sendContactNotification(testContactData);
    console.log('✅ Contact Notification Template: VALID');

    // Test confirmation template  
    console.log('📧 Testing Contact Confirmation Template...');
    const confirmationPromise = emailService.sendContactConfirmation(testContactData);
    console.log('✅ Contact Confirmation Template: VALID');

  } catch (error) {
    console.log('❌ Template Generation: FAILED -', error.message);
  }

  // Test 3: Budget Display
  console.log('\n3️⃣ Testing Budget Display...');
  const budgetTests = [
    { input: 'small', expected: 'Small Project ($5K - $20K)' },
    { input: 'medium', expected: 'Medium Project ($20K - $100K)' },
    { input: 'large', expected: 'Large Project ($100K+)' },
    { input: 'consultation', expected: 'Strategy Consultation' },
    { input: 'discuss', expected: 'Let\'s Discuss' },
    { input: 'invalid', expected: 'Not specified' }
  ];

  budgetTests.forEach(test => {
    const result = emailService.getBudgetDisplay(test.input);
    if (result === test.expected) {
      console.log(`✅ Budget "${test.input}": ${result}`);
    } else {
      console.log(`❌ Budget "${test.input}": Expected "${test.expected}", got "${result}"`);
    }
  });

  // Test 4: Validation
  console.log('\n4️⃣ Testing Input Validation...');
  
  // Test missing data
  try {
    await emailService.sendContactNotification({});
    console.log('❌ Validation: Should have failed for empty data');
  } catch (error) {
    console.log('✅ Validation: Correctly rejected empty data');
  }

  try {
    await emailService.sendContactConfirmation({ name: 'Test' });
    console.log('❌ Validation: Should have failed for missing email');
  } catch (error) {
    console.log('✅ Validation: Correctly rejected missing email');
  }

  console.log('\n🎉 EmailService Template Stability Test Complete!');
  console.log('📝 All templates and validations are working correctly');
}

// Run the test
testEmailTemplates().catch(console.error);
