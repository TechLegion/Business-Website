# TekLegion Business Website

> Modern business website with contact form, admin dashboard, and analytics

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template) - Full Stack

A modern, responsive business website with a complete backend API for TekLegion, an IT consulting firm specializing in enterprise software, AI/ML solutions, and digital transformation.

## 🚀 Features

### Frontend
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **Interactive Elements**: Smooth animations, parallax effects, and dynamic content
- **Contact Form**: Integrated with backend API for form submissions
- **Analytics Tracking**: Real-time user behavior tracking
- **Business Card Generator**: Interactive business card preview
- **SEO Optimized**: Meta tags, structured data, and performance optimized

### Backend API
- **Contact Management**: Full CRUD operations for contact submissions
- **Email Notifications**: Automated email responses and admin notifications
- **Analytics Dashboard**: Comprehensive user behavior and website analytics
- **Admin Panel**: Complete admin interface for managing contacts and analytics
- **Security**: Rate limiting, CORS, input validation, and data sanitization
- **Database**: PostgreSQL with Sequelize ORM and optimized schemas

## 🛠️ Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Font Awesome Icons
- AOS (Animate On Scroll) Library
- Custom CSS with CSS Grid and Flexbox

### Backend
- Node.js with Express.js
- PostgreSQL with Sequelize ORM
- Nodemailer for email services
- Express Validator for input validation
- Handlebars for email templates
- Helmet for security

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (local or cloud instance)
- Email service account (Gmail, SendGrid, etc.)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd business-website
```

### 2. Install Dependencies
```bash
# Install backend dependencies
npm install

# For development with auto-restart
npm install -g nodemon
```

### 3. Environment Configuration
```bash
# Copy the example environment file
cp env.example .env

# Edit the .env file with your configuration
nano .env
```

### 4. Configure Environment Variables
```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=teklegion_business
DB_USER=postgres
DB_PASSWORD=your-password

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CONTACT_EMAIL=techlegion01@gmail.com

# Admin Configuration
ADMIN_TOKEN=your-secure-admin-token-here
```

### 5. Start the Application

#### Development Mode
```bash
# Start the backend server
npm run dev

# The server will start on http://localhost:5000
```

#### Production Mode
```bash
# Start the production server
npm start
```

### 6. Access the Application
- **Frontend**: Open `index.html` in your browser or serve via a web server
- **API Health Check**: http://localhost:5000/health
- **API Documentation**: http://localhost:5000/

## 🚢 Deployment

### Railway Deployment

This project is configured for easy deployment on Railway. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**Quick Start:**
1. Push your code to GitHub
2. Connect your repository to Railway
3. Add environment variables in Railway dashboard
4. Deploy!

**Required Environment Variables:**
- `NODE_ENV=production`
- `PORT` (auto-set by Railway)
- `DATABASE_URL` or `DB_*` variables (your PostgreSQL connection string)
- `FRONTEND_URL` (your Railway app URL)
- `EMAIL_USER`, `EMAIL_PASS` (email credentials)
- `ADMIN_TOKEN` (secure admin token)
- `JWT_SECRET`, `SESSION_SECRET` (security secrets)

### GitHub

The project includes:
- `.gitignore` configured to exclude sensitive files
- `env.example` template for environment variables
- Production-ready server configuration

**Important:** Never commit `config.env` to Git. Use environment variables in production.

## 📧 Email Setup

### Gmail Setup
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. Use the app password in your `.env` file

### Other Email Services
The system supports various email services:
- SendGrid
- AWS SES
- Mailgun
- Custom SMTP servers

## 🗄️ Database Setup

### Local PostgreSQL
```bash
# Install PostgreSQL locally
# macOS with Homebrew
brew install postgresql@14

# Start PostgreSQL service
brew services start postgresql@14

# Create database
createdb teklegion_business

# Or using psql
psql -U postgres
CREATE DATABASE teklegion_business;
```

### PostgreSQL on Railway (Recommended)
1. Add PostgreSQL service in Railway dashboard
2. Railway automatically sets `DATABASE_URL` environment variable
3. No additional configuration needed

### External PostgreSQL (Supabase, Neon, etc.)
1. Create a PostgreSQL database
2. Get your connection string
3. Set `DATABASE_URL` in your environment variables
4. Format: `postgresql://user:password@host:port/database`

## 🔧 API Endpoints

### Admin
- `POST /api/contact` - Submit contact form
- `POST /api/analytics/track` - Track events
- `GET /api/admin/dashboard` - Get admin dashboard data
- `GET /api/admin/contacts` - Get contacts with filtering
- `GET /api/admin/analytics` - Get detailed analytics
- `GET /api/admin/export/contacts` - Export contacts to CSV

## 📊 Admin Panel

Access the admin panel by making authenticated requests to admin endpoints:

```bash
# Get dashboard data
curl -H "Authorization: Bearer your-admin-token" \
     http://localhost:5000/api/admin/dashboard

# Get contacts
curl -H "Authorization: Bearer your-admin-token" \
     http://localhost:5000/api/admin/contacts
```

## 🚀 Deployment

### Heroku
1. Create a Heroku app
2. Set environment variables in Heroku dashboard
3. Deploy using Git:
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel --prod`

### DigitalOcean App Platform
1. Connect your GitHub repository
2. Configure environment variables
3. Deploy automatically on push

## 🔒 Security Features

- **Rate Limiting**: Prevents spam and abuse
- **Input Validation**: Sanitizes all user inputs
- **CORS Protection**: Configurable cross-origin requests
- **Helmet Security**: Security headers and protection
- **Data Sanitization**: Prevents XSS and injection attacks

## 📈 Analytics Features

- **Page Views**: Track page visits and unique visitors
- **Device Analytics**: Mobile, desktop, and tablet statistics
- **Traffic Sources**: Referrer tracking and source analysis
- **Event Tracking**: Custom event tracking for user interactions
- **Real-time Data**: Live analytics dashboard
- **Export Functionality**: CSV export for data analysis

## 🎨 Customization

### Styling
- Modify `styles.css` for custom styling
- Update color scheme in CSS variables
- Add custom animations and effects

### Content
- Update company information in HTML files
- Modify service descriptions and portfolio items
- Customize contact information and social links

### Backend
- Add new API endpoints in the `routes/` directory
- Modify database schemas in `models/`
- Update email templates in `templates/`

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Test API endpoints
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","subject":"Test","message":"Test message"}'
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions:
- Email: techlegion01@gmail.com
- Phone: +234 70-1968-3215
- Website: [TekLegion](https://teklegion.com)

## 🔄 Updates

### Version 1.0.0
- Initial release with full-stack functionality
- Contact form with email notifications
- Analytics tracking and admin panel
- Responsive design and modern UI
- Security features and rate limiting

---

**TekLegion** - Transforming Businesses Through Technology Innovation
