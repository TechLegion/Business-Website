const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  budget: {
    type: String,
    enum: ['small', 'medium', 'large', 'consultation', 'discuss'],
    default: 'discuss'
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  status: {
    type: String,
    enum: ['new', 'in_progress', 'responded', 'closed'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  source: {
    type: String,
    default: 'website',
    enum: ['website', 'referral', 'social', 'direct']
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: [{
    note: String,
    addedBy: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  response: {
    message: String,
    respondedBy: String,
    respondedAt: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ createdAt: -1 });
contactSchema.index({ priority: 1, status: 1 });

// Virtual for formatted creation date
contactSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Virtual for budget display
contactSchema.virtual('budgetDisplay').get(function() {
  const budgetMap = {
    'small': 'Small Project ($5K - $20K)',
    'medium': 'Medium Project ($20K - $100K)',
    'large': 'Large Project ($100K+)',
    'consultation': 'Strategy Consultation',
    'discuss': 'Let\'s Discuss'
  };
  return budgetMap[this.budget] || 'Not specified';
});

// Pre-save middleware to add tags based on content
contactSchema.pre('save', function(next) {
  if (this.isNew) {
    const tags = [];
    
    // Add tags based on message content
    const message = this.message.toLowerCase();
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
    
    this.tags = tags;
  }
  next();
});

// Static method to get contact statistics
contactSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        new: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
        responded: { $sum: { $cond: [{ $eq: ['$status', 'responded'] }, 1, 0] } },
        closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } }
      }
    }
  ]);
  
  return stats[0] || { total: 0, new: 0, inProgress: 0, responded: 0, closed: 0 };
};

// Instance method to mark as responded
contactSchema.methods.markAsResponded = function(responseMessage, respondedBy) {
  this.status = 'responded';
  this.response = {
    message: responseMessage,
    respondedBy: respondedBy,
    respondedAt: new Date()
  };
  return this.save();
};

module.exports = mongoose.model('Contact', contactSchema, 'business_data');
