# 🎬 MovieTrack - Complete Setup Guide

## What You Need to Do (Simple 3 Steps!)

### Step 1: Install Node.js ✅

1. Check if you already have Node.js:
```powershell
node --version
```

If you see a version number (like v18.x.x), you're good! Skip to Step 2.

If not, download and install from: https://nodejs.org/
- Choose the **LTS version** (recommended)
- Run the installer
- Keep clicking "Next" with default settings

### Step 2: Choose MongoDB Option 🗄️

**Option A: MongoDB Atlas (Cloud - EASY & FREE)** ⭐ Recommended

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up for free
3. Create a free cluster (takes 3-5 minutes)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster...`)
6. Save it for Step 3

**Option B: Local MongoDB (Install on your computer)**

1. Download from: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will run automatically

### Step 3: Setup and Run 🚀

Open PowerShell in your project folder and run these commands:

```powershell
# Navigate to backend folder
cd backend

# Install dependencies (takes 1-2 minutes)
npm install

# Create environment file
copy .env.example .env

# Edit .env file (open with notepad)
notepad .env
```

**In the .env file, update these values:**

For MongoDB Atlas (Cloud):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=my_super_secret_key_12345
JWT_EXPIRE=7d
CLIENT_URL=http://127.0.0.1:5500
```

For Local MongoDB:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/movietrack
JWT_SECRET=my_super_secret_key_12345
JWT_EXPIRE=7d
CLIENT_URL=http://127.0.0.1:5500
```

**Save and close the file.**

### Step 4: Start the Backend Server 🖥️

```powershell
# Still in backend folder
npm run dev
```

You should see:
```
✅ MongoDB Connected Successfully
🚀 Server running on port 5000
```

**Keep this window open!**

### Step 5: Open Frontend 🌐

Open a NEW PowerShell window:

```powershell
# Navigate to frontend folder
cd frontend

# If you have Python installed:
python -m http.server 5500

# OR if you have Node.js http-server:
npx http-server -p 5500

# OR just open index.html in your browser
```

Then open: http://localhost:5500 or http://127.0.0.1:5500

---

## 🎉 That's It!

Your app should now be running with:
- ✅ Professional frontend
- ✅ Secure backend API
- ✅ MongoDB database
- ✅ JWT authentication
- ✅ Full CRUD operations

---

## Quick Commands Reference

**Start Backend (Development):**
```powershell
cd backend
npm run dev
```

**Start Backend (Production):**
```powershell
cd backend
npm start
```

**View Backend API:**
Open http://localhost:5000 in browser

**View Frontend:**
Open http://localhost:5500 or just open index.html

---

## 🐛 Troubleshooting

### "npm: command not found"
→ Node.js is not installed. Go back to Step 1.

### "MongoDB connection error"
→ Check your MONGODB_URI in .env file
→ Make sure MongoDB is running (if using local)

### "Port 5000 already in use"
→ Change PORT=5001 in .env file

### Frontend not connecting to backend
→ Make sure backend is running (Step 4)
→ Check CLIENT_URL in backend .env file

---

## 📞 Need Help?

1. Check backend terminal for errors
2. Check browser console (F12) for errors
3. Make sure both backend and frontend are running
4. Verify .env file settings

---

**You're all set! Start tracking movies! 🎬🍿**
