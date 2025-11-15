// Quick MongoDB connection check
const mongoose = require('mongoose');

async function checkMongoDB() {
  try {
    console.log('🔌 Checking MongoDB connection...');
    console.log('📍 Database: teklegion_local');
    console.log('📁 Collection: business_data');
    
    // Try to connect
    await mongoose.connect('mongodb://127.0.0.1:27017/teklegion_local', {
      serverSelectionTimeoutMS: 5000 // 5 second timeout
    });
    
    console.log('✅ MongoDB is running and accessible!');
    console.log(`📊 Connected to: ${mongoose.connection.host}`);
    console.log(`🗄️ Database: ${mongoose.connection.name}`);
    
    // Check if business_data collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const businessDataExists = collections.some(col => col.name === 'business_data');
    
    if (businessDataExists) {
      console.log('✅ business_data collection found!');
    } else {
      console.log('ℹ️ business_data collection will be created when first document is saved');
    }
    
    console.log('\n🎉 Your TekLegion backend is ready to use this database!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('\n🔧 MongoDB is not running. To start it:');
    console.log('1. Open Command Prompt as Administrator');
    console.log('2. Run: net start MongoDB');
    console.log('3. Or find MongoDB in Services and start it');
    console.log('4. Or run: mongod --dbpath "C:\\Program Files\\MongoDB\\Server\\7.0\\data"');
  } finally {
    await mongoose.connection.close();
  }
}

checkMongoDB();
