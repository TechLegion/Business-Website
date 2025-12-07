const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

const Analytics = sequelize.define('Analytics', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  event: {
    type: DataTypes.STRING,
    allowNull: false
  },
  page: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: false
  },
  referrer: {
    type: DataTypes.STRING,
    defaultValue: 'direct'
  },
  country: {
    type: DataTypes.STRING,
    defaultValue: 'Unknown'
  },
  city: {
    type: DataTypes.STRING,
    defaultValue: 'Unknown'
  },
  device: {
    type: DataTypes.ENUM('desktop', 'mobile', 'tablet'),
    defaultValue: 'desktop'
  },
  browser: {
    type: DataTypes.STRING,
    defaultValue: 'Unknown'
  },
  os: {
    type: DataTypes.STRING,
    defaultValue: 'Unknown'
  },
  screenResolution: {
    type: DataTypes.STRING,
    defaultValue: 'Unknown'
  },
  language: {
    type: DataTypes.STRING(10),
    defaultValue: 'en'
  },
  sessionId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'analytics',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['event', 'timestamp'] },
    { fields: ['page', 'timestamp'] },
    { fields: ['session_id'] },
    { fields: ['ip_address', 'timestamp'] }
  ]
});

// Static method to get page views
Analytics.getPageViews = async function(startDate, endDate) {
  const whereClause = {
    event: 'page_view'
  };

  if (startDate && endDate) {
    whereClause.timestamp = {
      [Op.between]: [new Date(startDate), new Date(endDate)]
    };
  }

  const pageViews = await Analytics.findAll({
    where: whereClause,
    attributes: [
      'page',
      [sequelize.fn('COUNT', sequelize.col('Analytics.id')), 'views'],
      [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('Analytics.session_id'))), 'uniqueViews']
    ],
    group: ['page'],
    order: [[sequelize.literal('views'), 'DESC']],
    raw: true
  });

  return pageViews.map(item => ({
    page: item.page,
    views: parseInt(item.views) || 0,
    uniqueViews: parseInt(item.uniqueViews) || 0
  }));
};

// Static method to get device statistics
Analytics.getDeviceStats = async function(startDate, endDate) {
  const whereClause = {
    event: 'page_view'
  };

  if (startDate && endDate) {
    whereClause.timestamp = {
      [Op.between]: [new Date(startDate), new Date(endDate)]
    };
  }

  const deviceStats = await Analytics.findAll({
    where: whereClause,
    attributes: [
      'device',
      [sequelize.fn('COUNT', sequelize.col('Analytics.id')), 'count']
    ],
    group: ['device'],
    order: [[sequelize.literal('count'), 'DESC']],
    raw: true
  });

  return deviceStats.map(item => ({
    device: item.device,
    count: parseInt(item.count) || 0
  }));
};

// Static method to get traffic sources
Analytics.getTrafficSources = async function(startDate, endDate) {
  const whereClause = {
    event: 'page_view'
  };

  if (startDate && endDate) {
    whereClause.timestamp = {
      [Op.between]: [new Date(startDate), new Date(endDate)]
    };
  }

  const trafficSources = await Analytics.findAll({
    where: whereClause,
    attributes: [
      'referrer',
      [sequelize.fn('COUNT', sequelize.col('Analytics.id')), 'count']
    ],
    group: ['referrer'],
    order: [[sequelize.literal('count'), 'DESC']],
    raw: true
  });

  return trafficSources.map(item => ({
    referrer: item.referrer,
    count: parseInt(item.count) || 0
  }));
};

// Static method to get daily stats
Analytics.getDailyStats = async function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const dailyStats = await Analytics.findAll({
    where: {
      event: 'page_view',
      timestamp: {
        [Op.gte]: startDate
      }
    },
    attributes: [
      [sequelize.fn('DATE', sequelize.col('Analytics.timestamp')), 'date'],
      [sequelize.fn('COUNT', sequelize.col('Analytics.id')), 'views'],
      [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('Analytics.session_id'))), 'uniqueViews']
    ],
    group: [sequelize.fn('DATE', sequelize.col('Analytics.timestamp'))],
    order: [[sequelize.fn('DATE', sequelize.col('Analytics.timestamp')), 'ASC']],
    raw: true
  });

  return dailyStats.map(item => ({
    date: item.date,
    views: parseInt(item.views) || 0,
    uniqueViews: parseInt(item.uniqueViews) || 0
  }));
};

module.exports = Analytics;
