/**
 * Test MongoDB connection
 */

import { getMongoDb } from '../src/lib/mongodb';

async function testConnection() {
  try {
    console.log('🔍 Testing MongoDB connection...\n');
    
    const db = await getMongoDb();
    console.log('✅ Successfully connected to MongoDB!');
    console.log(`📊 Database name: ${db.databaseName}\n`);
    
    // Test reading from blogs collection
    const blogsCollection = db.collection('blogs');
    const count = await blogsCollection.countDocuments();
    console.log(`📝 Found ${count} blog posts in database\n`);
    
    if (count > 0) {
      const sample = await blogsCollection.findOne({}, { projection: { title: 1, slug: 1 } });
      console.log('📄 Sample blog:', sample);
    }
    
    console.log('\n✨ MongoDB connection test passed!');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ MongoDB connection failed!');
    console.error('Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('1. Check MONGODB_URI in .env.local');
    console.error('2. Verify MongoDB Atlas IP whitelist includes your IP (0.0.0.0/0 for all)');
    console.error('3. Check MongoDB username and password');
    process.exit(1);
  }
}

testConnection();




