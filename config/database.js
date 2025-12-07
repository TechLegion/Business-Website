const { Sequelize } = require('sequelize');

// Get database connection details from environment variables
const getDatabaseConfig = () => {
  // For production (Railway), use DATABASE_URL if available
  if (process.env.DATABASE_URL) {
    return {
      url: process.env.DATABASE_URL,
      dialect: 'postgres',
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      }
    };
  }

  // For local development
  return {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'teklegion_business',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'sammyokay',
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };
};

const config = getDatabaseConfig();
const sequelize = config.url 
  ? new Sequelize(config.url, {
      dialect: 'postgres',
      dialectOptions: config.dialectOptions,
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    })
  : new Sequelize(config.database, config.username, config.password, {
      host: config.host,
      port: config.port,
      dialect: config.dialect,
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('📦 PostgreSQL Connected successfully');
    
    // Sync models (create tables if they don't exist)
    // Use alter: true to add missing columns if tables exist
    try {
      await sequelize.sync({ force: false, alter: true });
      console.log('📊 Database models synchronized');
    } catch (syncError) {
      // If alter fails due to column name mismatch (created_at vs createdAt)
      if (syncError.message.includes('does not exist') || syncError.message.includes('column')) {
        console.warn('⚠️  Schema mismatch detected. Attempting to fix...');
        try {
          // Check if tables exist and are empty - if so, we can drop and recreate
          const [tables] = await sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('contacts', 'analytics')
          `);
          
          if (tables.length > 0) {
            // Tables exist, check if empty
            try {
              const [contactCount] = await sequelize.query('SELECT COUNT(*)::int as count FROM contacts');
              const [analyticsCount] = await sequelize.query('SELECT COUNT(*)::int as count FROM analytics');
              
              if ((contactCount[0]?.count || 0) === 0 && (analyticsCount[0]?.count || 0) === 0) {
                console.log('📊 Tables are empty. Dropping and recreating with correct schema...');
                await sequelize.sync({ force: true });
                console.log('✅ Database tables recreated with correct schema');
              } else {
                console.warn('⚠️  Tables contain data. Dropping tables to fix schema...');
                console.warn('   (Data will be lost - this is OK for fresh deployments)');
                await sequelize.sync({ force: true });
                console.log('✅ Database tables recreated');
              }
            } catch (queryError) {
              // Query failed - tables might have wrong schema, just recreate
              console.log('📊 Recreating tables with correct schema...');
              await sequelize.sync({ force: true });
              console.log('✅ Database tables recreated');
            }
          } else {
            // Tables don't exist, just create them
            await sequelize.sync({ force: false, alter: false });
            console.log('📊 Database tables created');
          }
        } catch (fixError) {
          console.warn('⚠️  Could not auto-fix. Error:', fixError.message);
          console.warn('   Tables may need manual fix in Railway database console');
          // Continue anyway - app might still work
        }
      } else {
        console.error('Database sync error:', syncError.message);
      }
    }

    // Handle connection events (pool might not be available immediately)
    try {
      const pool = sequelize.connectionManager.pool;
      if (pool && typeof pool.on === 'function') {
        pool.on('error', (err) => {
          console.error('PostgreSQL connection error:', err);
        });
      }
    } catch (err) {
      // Pool not available yet, that's okay
    }

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await sequelize.close();
      console.log('PostgreSQL connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('Database connection failed:', error.message);
    // Only exit if it's a connection authentication error
    if (error.message.includes('password') || error.message.includes('authentication') || error.message.includes('ECONNREFUSED')) {
      console.error('❌ Fatal database connection error. Exiting...');
      process.exit(1);
    }
    // For schema errors, log warning but continue
    if (error.message.includes('does not exist') || error.message.includes('column')) {
      console.warn('⚠️  Schema mismatch detected. Run: node scripts/fix-database-schema.js');
      console.warn('   Or drop tables manually and let Sequelize recreate them.');
    }
    // Don't exit for schema errors - app might still work
  }
};

module.exports = { sequelize, connectDB };
