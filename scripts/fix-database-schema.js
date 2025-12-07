/**
 * Script to fix database schema - converts camelCase columns to snake_case
 * Run this once if you have existing tables with wrong column names
 * 
 * Usage: node scripts/fix-database-schema.js
 */

const { sequelize } = require('../config/database');

async function fixSchema() {
  try {
    console.log('🔧 Fixing database schema...');
    
    // Check if contacts table exists and has wrong columns
    const [tables] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'contacts' AND column_name = 'createdAt'
    `);
    
    if (tables.length > 0) {
      console.log('⚠️  Found camelCase columns. Renaming to snake_case...');
      
      // Rename columns in contacts table
      await sequelize.query(`
        ALTER TABLE contacts 
        RENAME COLUMN "createdAt" TO created_at;
      `);
      
      await sequelize.query(`
        ALTER TABLE contacts 
        RENAME COLUMN "updatedAt" TO updated_at;
      `);
      
      console.log('✅ Contacts table fixed');
    }
    
    // Check analytics table
    const [analyticsTables] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'analytics' AND column_name = 'createdAt'
    `);
    
    if (analyticsTables.length > 0) {
      await sequelize.query(`
        ALTER TABLE analytics 
        RENAME COLUMN "createdAt" TO created_at;
      `);
      
      await sequelize.query(`
        ALTER TABLE analytics 
        RENAME COLUMN "updatedAt" TO updated_at;
      `);
      
      console.log('✅ Analytics table fixed');
    }
    
    console.log('✅ Schema fix complete!');
    await sequelize.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error fixing schema:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  fixSchema();
}

module.exports = fixSchema;

