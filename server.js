const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: './config.env' });
}

const connectDB = require('./config/database');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "https://unpkg.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  }
}));

// CORS configuration
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',')
  : ['http://localhost:3000', 'http://localhost:5000'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'production') {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

// API routes
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API root endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'TekLegion API Server',
    version: '1.0.0',
    status: 'Running',
    endpoints: {
      health: '/health',
      admin: '/api/admin'
    }
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: 'The requested API endpoint does not exist',
    availableEndpoints: [
      'GET /health',
      'GET /api',
      'GET /api/admin'
    ]
  });
});

// Serve static files and frontend in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files (CSS, JS, images)
  app.use(express.static(path.join(__dirname), {
    index: false // Don't serve index.html for root, handle it separately
  }));
  
  // Serve specific HTML pages
  app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
  });
  
  app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
  });
  
  app.get('/view-contacts', (req, res) => {
    res.sendFile(path.join(__dirname, 'view-contacts.html'));
  });
  
  app.get('/business-card', (req, res) => {
    res.sendFile(path.join(__dirname, 'business-card.html'));
  });
  
  // Serve index.html for root and all other routes (SPA routing)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });
} else {
  // Development: API root endpoint
  app.get('/', (req, res) => {
    res.json({
      message: 'TekLegion API Server',
      version: '1.0.0',
      status: 'Running',
      environment: 'development',
      endpoints: {
        health: '/health',
        api: '/api',
        admin: '/api/admin'
      },
      note: 'Frontend runs on http://localhost:3000'
    });
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TekLegion API Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
