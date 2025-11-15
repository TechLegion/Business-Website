const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  event: {
    type: String,
    required: true
  },
  page: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  referrer: {
    type: String,
    default: 'direct'
  },
  country: {
    type: String,
    default: 'Unknown'
  },
  city: {
    type: String,
    default: 'Unknown'
  },
  device: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet'],
    default: 'desktop'
  },
  browser: {
    type: String,
    default: 'Unknown'
  },
  os: {
    type: String,
    default: 'Unknown'
  },
  screenResolution: {
    type: String,
    default: 'Unknown'
  },
  language: {
    type: String,
    default: 'en'
  },
  sessionId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for analytics queries
analyticsSchema.index({ event: 1, timestamp: -1 });
analyticsSchema.index({ page: 1, timestamp: -1 });
analyticsSchema.index({ sessionId: 1 });
analyticsSchema.index({ ipAddress: 1, timestamp: -1 });

// Static method to get page views
analyticsSchema.statics.getPageViews = async function(startDate, endDate) {
  const matchStage = {};
  if (startDate && endDate) {
    matchStage.timestamp = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  return await this.aggregate([
    { $match: { event: 'page_view', ...matchStage } },
    {
      $group: {
        _id: '$page',
        views: { $sum: 1 },
        uniqueSessions: { $addToSet: '$sessionId' }
      }
    },
    {
      $project: {
        page: '$_id',
        views: 1,
        uniqueViews: { $size: '$uniqueSessions' }
      }
    },
    { $sort: { views: -1 } }
  ]);
};

// Static method to get device statistics
analyticsSchema.statics.getDeviceStats = async function(startDate, endDate) {
  const matchStage = {};
  if (startDate && endDate) {
    matchStage.timestamp = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  return await this.aggregate([
    { $match: { event: 'page_view', ...matchStage } },
    {
      $group: {
        _id: '$device',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Static method to get traffic sources
analyticsSchema.statics.getTrafficSources = async function(startDate, endDate) {
  const matchStage = {};
  if (startDate && endDate) {
    matchStage.timestamp = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  return await this.aggregate([
    { $match: { event: 'page_view', ...matchStage } },
    {
      $group: {
        _id: '$referrer',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Static method to get daily stats
analyticsSchema.statics.getDailyStats = async function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate },
        event: 'page_view'
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' }
        },
        views: { $sum: 1 },
        uniqueSessions: { $addToSet: '$sessionId' }
      }
    },
    {
      $project: {
        date: {
          $dateFromParts: {
            year: '$_id.year',
            month: '$_id.month',
            day: '$_id.day'
          }
        },
        views: 1,
        uniqueViews: { $size: '$uniqueSessions' }
      }
    },
    { $sort: { date: 1 } }
  ]);
};

module.exports = mongoose.model('Analytics', analyticsSchema, 'business_data');
