const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Contact = sequelize.define('Contact', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Name is required' },
      len: { args: [1, 100], msg: 'Name cannot exceed 100 characters' }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: { msg: 'Please enter a valid email' },
      notEmpty: { msg: 'Email is required' }
    }
  },
  subject: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Subject is required' },
      len: { args: [1, 200], msg: 'Subject cannot exceed 200 characters' }
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Message is required' },
      len: { args: [1, 2000], msg: 'Message cannot exceed 2000 characters' }
    }
  },
  budget: {
    type: DataTypes.ENUM('small', 'medium', 'large', 'consultation', 'discuss'),
    defaultValue: 'discuss'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: { args: [0, 20], msg: 'Phone number cannot exceed 20 characters' }
    }
  },
  company: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: { args: [0, 100], msg: 'Company name cannot exceed 100 characters' }
    }
  },
  status: {
    type: DataTypes.ENUM('new', 'in_progress', 'responded', 'closed'),
    defaultValue: 'new'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  source: {
    type: DataTypes.ENUM('website', 'referral', 'social', 'direct'),
    defaultValue: 'website'
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  notes: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  response: {
    type: DataTypes.JSONB,
    defaultValue: null
  }
}, {
  tableName: 'contacts',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['email'] },
    { fields: ['status'] },
    { fields: ['created_at'] },
    { fields: ['priority', 'status'] }
  ],
  hooks: {
    beforeCreate: (contact) => {
      // Add tags based on message content
      const tags = [];
      const message = contact.message.toLowerCase();
      
      if (message.includes('ai') || message.includes('machine learning') || message.includes('ml')) {
        tags.push('AI/ML');
      }
      if (message.includes('cloud') || message.includes('aws') || message.includes('azure')) {
        tags.push('Cloud');
      }
      if (message.includes('data') || message.includes('analytics') || message.includes('science')) {
        tags.push('Data Science');
      }
      if (message.includes('security') || message.includes('compliance')) {
        tags.push('Security');
      }
      if (message.includes('mobile') || message.includes('app')) {
        tags.push('Mobile');
      }
      if (message.includes('web') || message.includes('website') || message.includes('frontend')) {
        tags.push('Web Development');
      }
      
      contact.tags = tags;
    }
  }
});

// Instance methods
Contact.prototype.getBudgetDisplay = function() {
  const budgetMap = {
    'small': 'Small Project ($5K - $20K)',
    'medium': 'Medium Project ($20K - $100K)',
    'large': 'Large Project ($100K+)',
    'consultation': 'Strategy Consultation',
    'discuss': 'Let\'s Discuss'
  };
  return budgetMap[this.budget] || 'Not specified';
};

Contact.prototype.getFormattedDate = function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

Contact.prototype.markAsResponded = async function(responseMessage, respondedBy) {
  this.status = 'responded';
  this.response = {
    message: responseMessage,
    respondedBy: respondedBy,
    respondedAt: new Date()
  };
  return await this.save();
};

// Static methods
Contact.getStats = async function() {
  const { sequelize } = require('../config/database');
  
  const [stats] = await sequelize.query(`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'new' THEN 1 END) as "new",
      COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as "inProgress",
      COUNT(CASE WHEN status = 'responded' THEN 1 END) as "responded",
      COUNT(CASE WHEN status = 'closed' THEN 1 END) as "closed"
    FROM contacts
  `, {
    type: sequelize.QueryTypes.SELECT
  });

  return {
    total: parseInt(stats.total) || 0,
    new: parseInt(stats.new) || 0,
    inProgress: parseInt(stats.inProgress) || 0,
    responded: parseInt(stats.responded) || 0,
    closed: parseInt(stats.closed) || 0
  };
};

module.exports = Contact;
