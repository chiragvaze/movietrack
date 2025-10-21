# ⚡ Quick Start Commands

## 🚀 First Time Setup

### 1. Install Backend Dependencies
```powershell
cd backend
npm install
copy .env.example .env
notepad .env  # Edit MongoDB URI and JWT_SECRET
```

### 2. Start Backend Server
```powershell
cd backend
npm run dev
```
Leave this terminal open!

### 3. Open Frontend
**New terminal window:**
```powershell
cd frontend
python -m http.server 5500
# OR
npx http-server -p 5500
# OR just open index.html
```

---

## 🔄 Daily Usage

### Start Backend:
```powershell
cd backend
npm run dev
```

### Start Frontend:
```powershell
cd frontend
python -m http.server 5500
```

### Access App:
- Frontend: http://localhost:5500
- Backend API: http://localhost:5000

---

## 📁 Project Structure

```
movie-tracker/
├── frontend/          # Your beautiful UI
│   ├── index.html     # Home page
│   ├── login.html     # Login
│   ├── signup.html    # Sign up
│   ├── dashboard.html # Dashboard
│   ├── css/
│   │   └── styles.css # Netflix theme
│   └── js/
│       ├── app.js
│       ├── auth.js
│       ├── dashboard.js
│       └── api.js     # Backend connector
│
└── backend/           # Your API server
    ├── models/        # Database schemas
    ├── routes/        # API endpoints
    ├── middleware/    # Authentication
    ├── server.js      # Main server
    └── .env           # Your config (secret!)
```

---

## 🔑 Important Files

### `.env` (backend folder)
Your secret configuration. Never share this!

### `api.js` (frontend/js/)
Connects frontend to backend.

---

## 📊 What You Have

### ✅ Frontend Features:
- Beautiful Netflix-themed UI
- Home page with features
- Login & Signup pages
- Dashboard with movie management
- Fully responsive
- Font Awesome icons

### ✅ Backend Features:
- User authentication (JWT)
- Secure password hashing
- Movie CRUD operations
- User statistics
- Rate limiting
- Input validation
- Error handling

---

## 🎯 Status

**Current:** Frontend uses localStorage (demo mode)

**Next:** Connect frontend to backend API

**Then:** Deploy to production!

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "npm not found" | Install Node.js |
| "MongoDB error" | Check .env MONGODB_URI |
| "Port in use" | Change PORT in .env |
| "Can't access" | Check both servers running |

---

## 📞 Commands Cheat Sheet

```powershell
# Check Node.js version
node --version

# Check npm version
npm --version

# Install dependencies
npm install

# Start dev server (auto-reload)
npm run dev

# Start production server
npm start

# Check what's using port 5000
netstat -ano | findstr :5000

# Kill process on port (if needed)
taskkill /PID <process_id> /F
```

---

**Ready to connect frontend to backend? Just let me know! 🚀**
