# 🚀 Movie Tracker - Deployment Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Deployment Options](#deployment-options)
4. [Option 1: Vercel + Render (Recommended)](#option-1-vercel--render-recommended)
5. [Option 2: Netlify + Railway](#option-2-netlify--railway)
6. [Option 3: Full Stack on Render](#option-3-full-stack-on-render)
7. [Post-Deployment](#post-deployment)

---

## Prerequisites

Before deploying, ensure you have:
- ✅ Git installed and project pushed to GitHub
- ✅ MongoDB Atlas account (already configured)
- ✅ OMDb API key (get from http://www.omdbapi.com/)
- ✅ TMDB API key (get from https://www.themoviedb.org/)
- ✅ Accounts on deployment platforms (free tier available)

---

## Environment Setup

### 1. Create `.env` file in backend folder

Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
NODE_ENV=production
CLIENT_URL=https://your-frontend-url.vercel.app
```

### 2. Update `.gitignore`

Make sure your root `.gitignore` includes:
```
# Environment Variables
.env
*.env

# Dependencies
node_modules/
package-lock.json

# Build files
dist/
build/

# OS files
.DS_Store
Thumbs.db
```

---

## Deployment Options

## Option 1: Vercel + Render (Recommended) ⭐

### **Frontend on Vercel** (Free, Fast CDN)

#### Step 1: Prepare Frontend
1. Create `vercel.json` in root directory:
```json
{
  "version": 2,
  "routes": [
    {
      "src": "/frontend/(.*)",
      "dest": "/frontend/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ]
}
```

#### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your `movie-tracker` repository
5. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `frontend`
   - **Output Directory**: Leave empty (static site)
6. Click "Deploy"
7. Copy your deployment URL (e.g., `https://movie-tracker-xxx.vercel.app`)

### **Backend on Render** (Free tier available)

#### Step 1: Deploy to Render
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your repository
5. Configure:
   - **Name**: `movie-tracker-api`
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

#### Step 2: Add Environment Variables
In Render dashboard, add:
```
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key_min_32_characters_long
NODE_ENV=production
CLIENT_URL=https://your-frontend-url.vercel.app
```

#### Step 3: Get Backend URL
- Copy your Render URL (e.g., `https://movie-tracker-api.onrender.com`)

#### Step 4: Update Frontend API URL
Update `frontend/js/api.js`:
```javascript
const API = {
    baseURL: 'https://movie-tracker-api.onrender.com/api', // Your Render URL
    // ... rest of code
}
```

#### Step 5: Redeploy Frontend
- Commit changes to GitHub
- Vercel will auto-deploy

---

## Option 2: Netlify + Railway

### **Frontend on Netlify**

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub
4. Configure:
   - **Base directory**: `frontend`
   - **Build command**: Leave empty
   - **Publish directory**: `frontend`
5. Deploy

### **Backend on Railway**

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select repository
5. Add service → Select `backend` folder
6. Add environment variables
7. Deploy

---

## Option 3: Full Stack on Render

Deploy both frontend and backend on Render:

### Backend (same as Option 1)

### Frontend as Static Site

1. Create new "Static Site" on Render
2. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: Leave empty
   - **Publish Directory**: `frontend`
3. Deploy

---

## Post-Deployment Checklist

### 1. ✅ Update CORS Settings
In `backend/server.js`, update:
```javascript
const corsOptions = {
    origin: [
        'https://your-frontend-url.vercel.app',
        'https://your-frontend-url.netlify.app',
        'http://localhost:3000' // for local testing
    ],
    credentials: true,
    optionsSuccessStatus: 200
};
```

### 2. ✅ Test Authentication
- Register new user
- Login
- Verify JWT token works

### 3. ✅ Test API Endpoints
```bash
# Health check
curl https://your-backend-url.onrender.com/api/health

# Auth test
curl -X POST https://your-backend-url.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Test123!"}'
```

### 4. ✅ Test Frontend Features
- [ ] Login/Signup works
- [ ] Dashboard loads
- [ ] Add movies to collection
- [ ] Categories page loads
- [ ] Search works
- [ ] Theme toggle works
- [ ] Sidebar navigation works

### 5. ✅ MongoDB Atlas Whitelist
1. Go to MongoDB Atlas
2. Network Access → Add IP Address
3. Add `0.0.0.0/0` (Allow from anywhere) for production
   - Or add specific IPs from Render/Vercel

### 6. ✅ Custom Domain (Optional)
**Vercel:**
- Dashboard → Settings → Domains
- Add your custom domain
- Configure DNS

**Render:**
- Settings → Custom Domain
- Add domain and configure DNS

---

## 🔧 Quick Commands

### Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Update Frontend URL in Backend
```javascript
// backend/server.js
const corsOptions = {
    origin: 'https://your-vercel-url.vercel.app',
    credentials: true
};
```

### Update Backend URL in Frontend
```javascript
// frontend/js/api.js
const API = {
    baseURL: 'https://your-render-url.onrender.com/api'
}
```

---

## 🐛 Common Issues

### Issue 1: CORS Errors
**Solution:** Add frontend URL to CORS whitelist in `backend/server.js`

### Issue 2: API Not Connecting
**Solution:** 
- Check backend URL in `frontend/js/api.js`
- Verify backend is running on Render
- Check Render logs

### Issue 3: MongoDB Connection Failed
**Solution:**
- Verify MongoDB URI in environment variables
- Check Network Access in MongoDB Atlas
- Add `0.0.0.0/0` to IP whitelist

### Issue 4: Authentication Not Working
**Solution:**
- Check JWT_SECRET is set in environment variables
- Verify CLIENT_URL matches frontend URL
- Check browser console for errors

---

## 📊 Free Tier Limits

### Vercel (Frontend)
- ✅ 100 GB bandwidth/month
- ✅ Unlimited projects
- ✅ Automatic HTTPS
- ✅ Global CDN

### Render (Backend)
- ✅ 750 hours/month (enough for 1 service)
- ⚠️ Spins down after 15 min inactivity (cold start ~30s)
- ✅ Automatic HTTPS
- ✅ Auto-deploy from Git

### MongoDB Atlas (Database)
- ✅ 512 MB storage
- ✅ Shared cluster
- ✅ Suitable for small apps

---

## 🚀 Next Steps After Deployment

1. **Monitor Performance**
   - Check Render logs for errors
   - Monitor MongoDB Atlas usage

2. **Add Analytics** (Optional)
   - Google Analytics
   - Vercel Analytics

3. **Setup Monitoring** (Optional)
   - UptimeRobot for uptime monitoring
   - LogRocket for error tracking

4. **Optimize Performance**
   - Enable caching
   - Optimize images
   - Minify CSS/JS (if needed)

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **GitHub Issues**: Create issue in your repo

---

## ✅ Deployment Complete!

Your Movie Tracker is now live! 🎉

**Frontend**: `https://your-app.vercel.app`
**Backend**: `https://your-api.onrender.com`

Share your deployed app and start tracking movies! 🎬
