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
    // In production, this will only create tables if they don't exist (won't alter existing)
    await sequelize.sync({ alter: false });
    console.log('📊 Database models synchronized');

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
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
