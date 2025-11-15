// Test MongoDB connection and show database structure
const mongoose = require('mongoose');

async function testMongoDB() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log('📍 Database: mongodb://localhost:27017/teklegion_local');
    
    // Connect to your specific database
    const conn = await mongoose.connect('mongodb://localhost:27017/teklegion_local');
    console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // List existing collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('\n📁 Existing collections:');
    if (collections.length > 0) {
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
    } else {
      console.log('   (No collections found)');
    }
    
    // Show what collections will be created by our app
    console.log('\n🚀 Collections that will be created by TekLegion backend:');
    console.log('   - contacts (for contact form submissions)');
    console.log('   - analytics (for website analytics data)');
    
    // Test creating a sample document
    console.log('\n🧪 Testing document creation...');
    
    // Create a test contact document using your business_data collection
    const Contact = mongoose.model('Contact', new mongoose.Schema({
      name: String,
      email: String,
      subject: String,
      message: String,
      createdAt: { type: Date, default: Date.now }
    }), 'business_data');
    
    const testContact = new Contact({
      name: 'Test User',
      email: 'test@example.com',
      subject: 'MongoDB Connection Test',
      message: 'This is a test to verify MongoDB connection is working.'
    });
    
    await testContact.save();
    console.log('✅ Test contact document created successfully!');
    
    // Count documents in business_data collection
    const contactCount = await Contact.countDocuments();
    console.log(`📊 Total documents in business_data collection: ${contactCount}`);
    
    // Clean up test document
    await Contact.deleteOne({ email: 'test@example.com' });
    console.log('🧹 Test document cleaned up');
    
    console.log('\n🎉 MongoDB connection test completed successfully!');
    console.log('\n📝 Your TekLegion backend is ready to use with this database.');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure MongoDB is running: mongod');
    console.log('2. Check if port 27017 is available');
    console.log('3. Verify database name: teklegion_local');
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
testMongoDB();
