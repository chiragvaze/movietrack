# 🚀 Quick Deployment Checklist

## Before You Start
- [ ] Push all code to GitHub
- [ ] Have MongoDB Atlas connection string ready
- [ ] Have accounts ready: Vercel, Render (or alternatives)

## Step-by-Step Deployment

### 1️⃣ Deploy Backend (Render.com)

1. **Go to Render.com**
   - Sign up/Login: https://render.com
   - Click "New +" → "Web Service"

2. **Connect Repository**
   - Connect your GitHub account
   - Select `movie-tracker` repository
   - Click "Connect"

3. **Configure Service**
   ```
   Name: movie-tracker-api
   Root Directory: backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   Plan: Free
   ```

4. **Add Environment Variables** (in Render dashboard)
   ```
   PORT = 5000
   MONGODB_URI = your_mongodb_atlas_connection_string
   JWT_SECRET = generate_a_random_32_character_string
   NODE_ENV = production
   CLIENT_URL = https://your-app-will-be-here.vercel.app
   ```
   
   **Generate JWT Secret:**
   ```bash
   # Run this in terminal to generate secure key:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (2-3 minutes)
   - Copy your backend URL: `https://movie-tracker-api-xxxx.onrender.com`

### 2️⃣ Update Frontend API URL

1. **Edit frontend/js/api.js**
   - Change line ~20:
   ```javascript
   const API = {
       baseURL: 'https://movie-tracker-api-xxxx.onrender.com/api', // Your Render URL
       // ... rest
   }
   ```

2. **Commit and Push**
   ```bash
   git add .
   git commit -m "Update API URL for production"
   git push origin main
   ```

### 3️⃣ Deploy Frontend (Vercel.com)

1. **Go to Vercel.com**
   - Sign up/Login: https://vercel.com
   - Click "Add New..." → "Project"

2. **Import Repository**
   - Select `movie-tracker` repository
   - Click "Import"

3. **Configure Project**
   ```
   Framework Preset: Other
   Root Directory: ./
   Build Command: (leave empty)
   Output Directory: (leave empty)
   Install Command: (leave empty)
   ```

4. **Environment Variables** (Optional, none needed for frontend)
   - Skip this step

5. **Deploy**
   - Click "Deploy"
   - Wait 30-60 seconds
   - Copy your URL: `https://movie-tracker-xxxx.vercel.app`

### 4️⃣ Update Backend CORS

1. **Go back to Render Dashboard**
   - Find your backend service
   - Click "Environment" tab

2. **Update CLIENT_URL**
   ```
   CLIENT_URL = https://movie-tracker-xxxx.vercel.app
   ```

3. **Save and Redeploy**
   - Click "Save Changes"
   - Service will auto-redeploy

### 5️⃣ MongoDB Atlas Setup

1. **Go to MongoDB Atlas**
   - Login: https://cloud.mongodb.com

2. **Network Access**
   - Click "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere"
   - Add IP: `0.0.0.0/0`
   - Click "Confirm"

3. **Get Connection String**
   - Click "Database" → "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database password

### 6️⃣ Test Your Deployment

#### Test Backend
Visit: `https://your-backend.onrender.com/api/movies`
- Should see JSON response or "unauthorized" (means it's working!)

#### Test Frontend
Visit: `https://your-app.vercel.app`
- [ ] Login page loads
- [ ] Can register new user
- [ ] Can login
- [ ] Dashboard loads
- [ ] Categories page works
- [ ] Search works
- [ ] Theme toggle works

## 🎉 You're Done!

Your app is now live at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.onrender.com`

## ⚠️ Important Notes

1. **Free Tier Limitations:**
   - Render free tier: Backend sleeps after 15 min of inactivity
   - First request after sleep: 30-60 seconds to wake up
   - This is normal for free tier

2. **Custom Domain** (Optional):
   - Vercel: Settings → Domains → Add your domain
   - Render: Settings → Custom Domain

3. **Updates:**
   - Any push to GitHub main branch = Auto-deploy on both platforms

## 🐛 Troubleshooting

### CORS Error
- Check CLIENT_URL in Render environment variables
- Should match your Vercel URL exactly

### Can't Connect to Database
- MongoDB Atlas → Network Access → Add `0.0.0.0/0`
- Check MONGODB_URI is correct in Render

### Backend Not Responding
- Check Render logs: Dashboard → Service → Logs
- Free tier: May take 30-60s on first request

### Frontend Not Loading
- Clear browser cache
- Check browser console for errors
- Verify API URL in `frontend/js/api.js`

## 📝 Quick Reference

**Vercel Dashboard**: https://vercel.com/dashboard
**Render Dashboard**: https://dashboard.render.com
**MongoDB Atlas**: https://cloud.mongodb.com

**View Logs:**
- Render: Dashboard → Your Service → Logs
- Vercel: Dashboard → Your Project → Deployments → View Function Logs

**Redeploy:**
- Just push to GitHub, both auto-deploy!
- Or manual: Dashboard → Redeploy

---

## 🎬 Share Your App!

Once deployed, share your movie tracker with:
- Friends and family
- On social media
- On your portfolio/resume

Congratulations! Your app is live! 🎉
