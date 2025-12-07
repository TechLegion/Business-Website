# Deployment Guide

## Railway Deployment

### Prerequisites
1. GitHub account with your repository
2. Railway account (sign up at [railway.app](https://railway.app))

### Steps

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TechLegion/your-repo-name.git
   git push -u origin main
   ```

2. **Deploy on Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will automatically detect Node.js and deploy

3. **Configure Environment Variables**
   In Railway dashboard, add these environment variables:
   
   ```
   NODE_ENV=production
   PORT=5000
   FRONTEND_URL=https://your-app.railway.app
   MONGODB_URI=your-mongodb-connection-string
   EMAIL_SERVICE=gmail
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=465
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   CONTACT_EMAIL=your-contact-email@gmail.com
   ADMIN_TOKEN=your-secure-admin-token
   JWT_SECRET=your-jwt-secret
   SESSION_SECRET=your-session-secret
   ```

4. **MongoDB Setup**
   - Use MongoDB Atlas (free tier available)
   - Or add Railway MongoDB service
   - Update MONGODB_URI with your connection string

5. **Custom Domain (Optional)**
   - In Railway, go to Settings → Domains
   - Add your custom domain
   - Update FRONTEND_URL environment variable

## Environment Variables

All sensitive configuration is stored in environment variables. Never commit `config.env` to Git.

Use `env.example` as a template for required variables.

## Production Checklist

- [ ] All environment variables set in Railway
- [ ] MongoDB connection string configured
- [ ] Email service credentials configured
- [ ] CORS origins updated for production domain
- [ ] Admin token set to a secure value
- [ ] Custom domain configured (if applicable)

