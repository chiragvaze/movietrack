# 🎯 Quick Deployment Guide - Movie Tracker

**Time Required:** 30-45 minutes

---

## 📦 What You're Deploying

- **Frontend**: Static HTML/CSS/JS (Vercel/Netlify)
- **Backend**: Node.js API (Render)
- **Database**: MongoDB Atlas (Already set up)

---

## 🚀 Quick Steps

### 1️⃣ Prepare Files (5 minutes)

✅ **Config file created**: `frontend/js/config.js`  
✅ **Update production URL** in config.js after backend deployment

### 2️⃣ Deploy Backend (10-15 minutes)

1. Go to **[Render.com](https://render.com)** → Sign up/Login
2. Click **"New +"** → **"Web Service"**
3. Connect your **GitHub repository**
4. Configure:
   - Name: `movie-tracker-backend`
   - Root: `backend`
   - Build: `npm install`
   - Start: `npm start`
   
5. Add **Environment Variables**:
   ```
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your-super-secret-key-min-32-characters
   NODE_ENV=production
   PORT=5000
   ```

6. Click **"Create Web Service"**
7. Wait 5-10 minutes for deployment
8. **Copy your backend URL**: `https://movie-tracker-backend-xxxx.onrender.com`

### 3️⃣ Update Frontend Config (2 minutes)

1. Open `frontend/js/config.js`
2. Replace `'https://your-backend-url.onrender.com'` with your actual URL
3. **Git commit and push**:
   ```bash
   git add .
   git commit -m "Update production API URL"
   git push origin main
   ```

### 4️⃣ Deploy Frontend (5-10 minutes)

#### Option A: Vercel (Recommended)

1. Go to **[Vercel.com](https://vercel.com)** → Sign up/Login
2. Click **"Add New"** → **"Project"**
3. Import your **GitHub repository**
4. Configure:
   - Framework: `Other`
   - Root: `frontend`
   - Build: *(leave empty)*
   - Output: `.`
5. Click **"Deploy"**
6. **Your app is live!** 🎉

#### Option B: Netlify

1. Go to **[Netlify.com](https://netlify.com)**
2. Drag and drop your `frontend` folder
3. **Your app is live!** 🎉

### 5️⃣ Update Backend CORS (5 minutes)

1. Open `backend/server.js`
2. Find the CORS configuration:
   ```javascript
   const corsOptions = {
       origin: [
           'http://localhost:3000',
           'https://your-app.vercel.app' // Add your actual URL
       ],
       credentials: true
   };
   ```
3. **Git commit and push** (Render auto-redeploys)

### 6️⃣ Create Admin User (5 minutes)

**Option 1 - Local Script** (Easiest):
```bash
# Temporarily update backend/.env with production MongoDB URI
cd backend
node create-admin.js your-email@example.com
# Revert .env back to local
```

**Option 2 - Render Shell**:
1. Render Dashboard → Your Service → Shell tab
2. Run: `node create-admin.js your-email@example.com`

### 7️⃣ Test Everything (5 minutes)

✅ Visit your frontend URL  
✅ Register and login  
✅ Add a movie  
✅ Visit `/admin-login.html`  
✅ Login as admin  
✅ Check all admin features  

---

## 🎉 Done! Your App is Live!

**Your URLs:**
- 🎬 Main App: `https://your-app.vercel.app`
- 🔐 Admin: `https://your-app.vercel.app/admin-login.html`
- 🔌 API: `https://your-backend.onrender.com`

---

## ⚠️ Important Notes

1. **Render Free Tier**: Spins down after 15 min → 30-60s cold start
2. **Admin URL**: Keep private! Not linked from main app
3. **First Request**: May be slow due to cold start
4. **MongoDB**: Make sure IP whitelist is `0.0.0.0/0`

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| CORS errors | Add frontend URL to backend CORS config |
| Can't connect | Check Render backend is running |
| Admin login fails | Verify user has `role: "admin"` in database |
| MongoDB error | Check IP whitelist and connection string |

---

## 📚 Full Guides

- **Complete Guide**: See `DEPLOYMENT_GUIDE.md`
- **Checklist**: See `DEPLOYMENT_CHECKLIST.md`
- **Admin Setup**: See `ADMIN_QUICK_START.md`

---

**Need Help?** Check the full deployment guide or troubleshooting section!
