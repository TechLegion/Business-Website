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
      logging: config.logging,
      pool: config.pool
    })
  : new Sequelize(config.database, config.username, config.password, {
      host: config.host,
      port: config.port,
      dialect: config.dialect,
      logging: config.logging,
      pool: config.pool
    });

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('📦 PostgreSQL Connected successfully');
    
    // Sync models in development (create tables if they don't exist)
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: false }); // Use migrations in production
      console.log('📊 Database models synchronized');
    }

    // Handle connection events
    sequelize.connectionManager.pool.on('error', (err) => {
      console.error('PostgreSQL connection error:', err);
    });

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
