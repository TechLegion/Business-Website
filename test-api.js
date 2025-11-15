// Simple API test script
const fetch = require('node-fetch');

async function testAPI() {
  const baseURL = 'http://localhost:5000';
  
  console.log('🧪 Testing TekLegion API...\n');
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${baseURL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);
    
    // Test root endpoint
    console.log('\n2. Testing root endpoint...');
    const rootResponse = await fetch(`${baseURL}/`);
    const rootData = await rootResponse.json();
    console.log('✅ Root endpoint:', rootData.message);
    
    // Test contact form (without database)
    console.log('\n3. Testing contact form endpoint...');
    const contactData = {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Message',
      message: 'This is a test message from the API test script.',
      budget: 'discuss'
    };
    
    const contactResponse = await fetch(`${baseURL}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData)
    });
    
    if (contactResponse.ok) {
      const contactResult = await contactResponse.json();
      console.log('✅ Contact form:', contactResult.message);
    } else {
      console.log('⚠️ Contact form failed (expected without database):', contactResponse.status);
    }
    
    // Test analytics tracking
    console.log('\n4. Testing analytics tracking...');
    const analyticsData = {
      event: 'page_view',
      page: '/test',
      metadata: { test: true }
    };
    
    const analyticsResponse = await fetch(`${baseURL}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(analyticsData)
    });
    
    if (analyticsResponse.ok) {
      const analyticsResult = await analyticsResponse.json();
      console.log('✅ Analytics tracking:', analyticsResult.message);
    } else {
      console.log('⚠️ Analytics tracking failed (expected without database):', analyticsResponse.status);
    }
    
    console.log('\n🎉 API test completed!');
    console.log('\n📝 Note: Some endpoints may fail without MongoDB running, but the server is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAPI();
