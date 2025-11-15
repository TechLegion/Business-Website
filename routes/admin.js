const express = require('express');
const Contact = require('../models/Contact');
const Analytics = require('../models/Analytics');
const emailService = require('../services/emailService');

const router = express.Router();

// Middleware to check admin authentication (placeholder)
const requireAuth = (req, res, next) => {
  // In a real application, implement proper JWT authentication
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access'
    });
  }
  
  next();
};

// Apply auth middleware to all admin routes
router.use(requireAuth);

// GET /api/admin/dashboard - Get admin dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get contact statistics
    const contactStats = await Contact.getStats();
    
    // Get recent contacts
    const recentContacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email subject status createdAt');

    // Get analytics overview
    const pageViews = await Analytics.getPageViews(startDate, new Date());
    const deviceStats = await Analytics.getDeviceStats(startDate, new Date());
    const dailyStats = await Analytics.getDailyStats(parseInt(days));

    // Get contact form conversion rate
    const totalPageViews = await Analytics.countDocuments({
      event: 'page_view',
      page: 'contact',
      timestamp: { $gte: startDate }
    });
    
    const contactSubmissions = await Contact.countDocuments({
      createdAt: { $gte: startDate }
    });
    
    const conversionRate = totalPageViews > 0 ? (contactSubmissions / totalPageViews * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        contacts: {
          ...contactStats,
          recent: recentContacts,
          conversionRate: parseFloat(conversionRate)
        },
        analytics: {
          pageViews,
          deviceStats,
          dailyStats
        },
        period: {
          days: parseInt(days),
          startDate,
          endDate: new Date()
        }
      }
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

// GET /api/admin/contacts - Get all contacts with advanced filtering
router.get('/contacts', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      budget,
      search,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (budget) query.budget = budget;
    
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const contacts = await Contact.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Contact.countDocuments(query);

    res.json({
      success: true,
      data: contacts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contacts'
    });
  }
});

// PUT /api/admin/contacts/:id - Update contact
router.put('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, notes, response } = req.body;

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Update fields
    if (status) contact.status = status;
    if (priority) contact.priority = priority;
    if (notes) {
      contact.notes.push({
        note: notes,
        addedBy: 'admin',
        addedAt: new Date()
      });
    }
    if (response) {
      contact.response = {
        message: response,
        respondedBy: 'admin',
        respondedAt: new Date()
      };
      contact.status = 'responded';
    }

    await contact.save();

    res.json({
      success: true,
      message: 'Contact updated successfully',
      data: contact
    });

  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact'
    });
  }
});

// DELETE /api/admin/contacts/:id - Delete contact
router.delete('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByIdAndDelete(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });

  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact'
    });
  }
});

// POST /api/admin/contacts/:id/respond - Send response to contact
router.post('/contacts/:id/respond', async (req, res) => {
  try {
    const { id } = req.params;
    const { message, sendEmail = true } = req.body;

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Update contact with response
    contact.status = 'responded';
    contact.response = {
      message,
      respondedBy: 'admin',
      respondedAt: new Date()
    };

    await contact.save();

    // Send email response if requested
    if (sendEmail) {
      try {
        // This would need a proper email template for responses
        await emailService.sendContactConfirmation({
          ...contact.toObject(),
          subject: `Re: ${contact.subject}`,
          message: `Thank you for contacting TekLegion. Here's our response:\n\n${message}`
        });
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.json({
      success: true,
      message: 'Response sent successfully',
      data: contact
    });

  } catch (error) {
    console.error('Send response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send response'
    });
  }
});

// GET /api/admin/analytics - Get detailed analytics
router.get('/analytics', async (req, res) => {
  try {
    const { days = 30, startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const [
      pageViews,
      deviceStats,
      trafficSources,
      dailyStats,
      eventStats,
      contactStats
    ] = await Promise.all([
      Analytics.getPageViews(start, end),
      Analytics.getDeviceStats(start, end),
      Analytics.getTrafficSources(start, end),
      Analytics.getDailyStats(parseInt(days)),
      Analytics.aggregate([
        { $match: { timestamp: { $gte: start, $lte: end } } },
        { $group: { _id: '$event', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Contact.getStats()
    ]);

    res.json({
      success: true,
      data: {
        pageViews,
        deviceStats,
        trafficSources,
        dailyStats,
        eventStats,
        contactStats,
        period: { start, end, days: parseInt(days) }
      }
    });

  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data'
    });
  }
});

// GET /api/admin/export/contacts - Export contacts to CSV
router.get('/export/contacts', async (req, res) => {
  try {
    const { status, dateFrom, dateTo } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .select('name email subject message budget company phone status priority createdAt');

    // Convert to CSV
    const csvHeader = 'Name,Email,Subject,Message,Budget,Company,Phone,Status,Priority,Created At\n';
    const csvData = contacts.map(contact => {
      return [
        contact.name,
        contact.email,
        contact.subject,
        `"${contact.message.replace(/"/g, '""')}"`,
        contact.budgetDisplay,
        contact.company || '',
        contact.phone || '',
        contact.status,
        contact.priority,
        contact.createdAt.toISOString()
      ].join(',');
    }).join('\n');

    const csv = csvHeader + csvData;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
    res.send(csv);

  } catch (error) {
    console.error('Export contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export contacts'
    });
  }
});

// GET /api/admin/settings - Get admin settings
router.get('/settings', (req, res) => {
  res.json({
    success: true,
    data: {
      emailService: {
        configured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
        service: process.env.EMAIL_SERVICE || 'gmail'
      },
      database: {
        connected: true,
        type: 'MongoDB'
      },
      features: {
        analytics: true,
        emailNotifications: true,
        contactForm: true,
        adminPanel: true
      }
    }
  });
});

module.exports = router;
