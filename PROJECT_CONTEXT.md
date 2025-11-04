# 🎬 MovieTrack - Complete Project Context

**Last Updated:** November 4, 2025  
**Current Version:** v2.4.1 (Categories Enhancement)  
**Status:** Production Ready ✅  
**Repository:** https://github.com/chiragvaze/movietrack

---

## 📋 Quick Reference

| **Category** | **Details** |
|-------------|-------------|
| **Version** | 2.4.1 (Categories Enhancement) |
| **Frontend** | https://movietrack-three.vercel.app |
| **Backend** | https://movietrack-backend.onrender.com |
| **Admin Panel** | https://movietrack-three.vercel.app/admin-login.html |
| **Theme** | Netflix-inspired (Dark: #141414, Red: #e50914) |
| **Status** | ✅ Production | ❌ Mobile needs work |

---

## 🎯 Project Overview

**MovieTrack** is a full-stack Netflix-themed movie tracking application that allows users to track movies and TV shows they've watched, are watching, or want to watch with personalized recommendations, analytics, and achievements.

**Key Capabilities:**
- Track movies/TV shows with status (Watched/Watching/Watchlist)
- Fast search with OMDb API (optimized for slow internet)
- Smart recommendations based on viewing history
- Browse by categories and genres  
- Detailed analytics with charts
- Achievement system (20+ achievements)
- Complete settings system (10 sections)
- Export data (JSON/CSV/PDF)
- Admin panel for user management

---

## ✅ Current Status (v2.4.1)

### What's Working Perfectly
- ✅ Hybrid API System: OMDb (fast search) + TMDB (trending/recommendations)
- ✅ User authentication (JWT)
- ✅ Complete movie/TV show CRUD
- ✅ Settings system (10 sections, fully functional)
- ✅ Achievement system (20+ achievements)
- ✅ Analytics dashboard with Chart.js
- ✅ Content-based recommendations
- ✅ Category/Genre browsing
- ✅ Export (JSON, CSV, PDF)
- ✅ Light/Dark/Auto themes
- ✅ Admin panel
- ✅ Custom Netflix scrollbars
- ✅ Desktop view works perfectly

### ❌ Critical Issues (Needs Immediate Fix)

**MOBILE RESPONSIVENESS PROBLEMS:**
1. **Navbar Layout** ❌
   - Current: All links visible in navbar
   - Required: Hamburger (left) + Logo (center) + Profile (right)
   - Profile icon missing on mobile

2. **Movie Cards** ❌
   - Too large on mobile
   - Need 1-2 column grid instead of current layout
   
3. **Category Buttons** ❌
   - Too large on mobile
   - Need smaller size and better spacing
   
4. **Sidebar** ❌
   - Settings link missing (added but needs testing)
   - Can't return to Dashboard from Categories page
   
5. **Profile Modal** ❌
   - Logout button should be inside profile modal on mobile (not in navbar)

6. **Touch Targets** ⚠️
   - Need minimum 44x44px for mobile
   - Font size minimum 16px to prevent iOS auto-zoom

### ⚠️ Known Limitations
- Render backend cold start: 30-60 seconds (free tier sleeps)
- OMDb API: 1,000 requests/day free tier limit
- Browser compatibility: `:has()` selector doesn't work in Safari

---

## 🛠️ Tech Stack

### Frontend
```
Framework: Vanilla JavaScript (ES6+)
Styling: Pure CSS3 with CSS Variables
Libraries:
  - Font Awesome 6.4.0 (icons)
  - Chart.js 4.4.0 (analytics)
Build: None (static files)
Deployment: Vercel
```

### Backend
```
Runtime: Node.js
Framework: Express.js 4.18.2
Database: MongoDB Atlas
ODM: Mongoose 8.0.0
Auth: JWT (jsonwebtoken 9.0.2)
Security:
  - bcryptjs 2.4.3 (password hashing)
  - helmet 7.1.0 (security headers)
  - express-rate-limit 7.1.5
Deployment: Render
```

### External APIs
```
OMDb API:
  - Purpose: Fast movie search
  - API Key: YOUR_OMDB_API_KEY (get from http://www.omdbapi.com/)
  - Limit: 1,000 requests/day
  - Timeout: 8 seconds
  - Used for: Autocomplete search, movie details

TMDB API:
  - Purpose: Rich movie data
  - API Key: YOUR_TMDB_API_KEY (get from https://www.themoviedb.org/)
  - Limit: Unlimited with rate limiting
  - Timeout: 30 seconds (3 retries)
  - Used for: Trending, recommendations, genres
```

---

## 📁 Project Structure

```
movie-tracker/
├── frontend/
│   ├── index.html              Landing page
│   ├── login.html              User login
│   ├── signup.html             User registration
│   ├── dashboard.html          Main dashboard ⭐
│   ├── categories.html         Genre browsing
│   ├── settings.html           User settings (10 sections)
│   ├── admin-login.html        Admin login
│   ├── admin-dashboard.html    Admin panel
│   │
│   ├── css/
│   │   ├── styles.css          Main styles (5270 lines) 🎨
│   │   └── admin-styles.css    Admin styles
│   │
│   ├── js/
│   │   ├── config.js           API URL config (dev/prod)
│   │   ├── api.js              Backend API wrapper
│   │   ├── omdb.js             OMDb API service ⭐ v2.4.0
│   │   ├── tmdb.js             TMDB API service
│   │   ├── auth.js             Authentication logic
│   │   ├── app.js              Landing page
│   │   ├── dashboard-enhanced.js  Main dashboard (2476 lines) ⭐
│   │   ├── categories.js       Category browsing
│   │   ├── settings.js         Settings (1242 lines) ⭐
│   │   ├── achievements.js     Achievement system
│   │   ├── admin.js            Admin panel
│   │   └── apply-settings.js   Theme & settings
│   │
│   └── assets/
│       └── logo.svg            Red film icon
│
├── backend/
│   ├── server.js               Main server
│   ├── package.json            v2.4.0
│   ├── .env                    Environment variables
│   │
│   ├── middleware/
│   │   └── auth.js             JWT middleware
│   │
│   ├── models/
│   │   ├── User.js             User schema
│   │   ├── Movie.js            Movie schema ⭐
│   │   └── ActivityLog.js      Activity logs
│   │
│   ├── routes/
│   │   ├── auth.js             Auth endpoints
│   │   ├── movies.js           Movie CRUD ⭐
│   │   └── admin.js            Admin endpoints
│   │
│   ├── create-admin.js         Create admin utility
│   └── list-users.js           List users utility
│
├── docs/
│   ├── DEPLOYMENT_GUIDE.md     Full deployment guide
│   ├── QUICK_DEPLOY.md         Quick deploy
│   ├── DEPLOYMENT_ISSUES.md    Troubleshooting
│   ├── ADMIN_PANEL_GUIDE.md    Admin docs
│   └── ADMIN_QUICK_START.md    Quick admin setup
│
├── README.md                    Project README
├── PROJECT_CONTEXT.md          This file ⭐
├── vercel.json                 Vercel config
└── .gitignore                  Git ignore
```

---

## 🔑 Critical Files to Know

### 1. `frontend/js/dashboard-enhanced.js` (2476 lines)
**Most Important File** - Main dashboard logic

**Key Functions:**
- `loadMovies()` - Fetch user's movies
- `setupTMDBSearch()` - Initialize OMDb autocomplete
- `selectTMDBMovie(index)` - Handle search selection
- `displayTMDBResults()` - Show search dropdown
- `editMovie()` / `deleteMovie()` - Movie management
- `getRecommendations()` - Smart recommendations
- `loadTrending()` - TMDB trending

**Recent Changes (v2.4.0):**
```javascript
// Line 667-720: Switched to OMDb for search
const results = currentContentType === 'movie' 
    ? await OMDb.searchMovies(query)
    : await OMDb.searchTVShows(query);

// Line 790-810: Data transformation
if (isOMDb) {
    // Convert "162 min" → 162
    details.runtime = parseInt(details.runtime.replace(/\D/g, ''));
    // Convert IMDb 7.9 → App 3.95 (10-scale to 5-scale)
    details.rating = Math.round((parseFloat(details.imdbRating) / 10) * 5 * 10) / 10;
}
```

### 2. `frontend/js/omdb.js` (299 lines) - NEW in v2.4.0
**OMDb API Service** - Fast search for slow internet

**Key Functions:**
```javascript
// Search with caching
async searchMovies(query, onLoading)
async searchTVShows(query, onLoading)

// Get full details
async getMovieDetails(imdbId)
async getTVShowDetails(imdbId)

// Cache management
function getOMDbCachedSearch(cacheKey)  // localStorage
function saveOMDbCachedSearch(cacheKey, results)
```

**Configuration:**
```javascript
const OMDB_CONFIG = {
    API_KEY: 'YOUR_OMDB_API_KEY',  // Get from http://www.omdbapi.com/
    BASE_URL: 'https://www.omdbapi.com',
    TIMEOUT: 8000,  // 8 seconds
    MAX_RETRIES: 1
};
```

### 3. `frontend/js/settings.js` (1242 lines)
**Complete Settings System** - 10 sections

**Sections:**
1. Profile (name, email, username)
2. Account Security (password, 2FA, delete account)
3. Appearance (theme, font size, animations)
4. Content Preferences (default type, genres, view mode)
5. Dashboard (layout, stats, grid columns)
6. Accessibility (high contrast, large buttons)
7. Recommendations (settings, genre preferences)
8. Data & Privacy (export, import, clear data)
9. Notifications (achievement notifications)
10. About (version, changelog, help)

**Key Functions:**
```javascript
exportAsJson()      // Export movies as JSON
exportAsCsv()       // Export as CSV
exportAsPdf()       // Export as printable PDF
showChangelog()     // Version history
showHelpFAQ()       // Help modal
showReportBug()     // Bug report modal
```

### 4. `frontend/css/styles.css` (5270 lines)
**Complete Styling** - Netflix theme

**Structure:**
```css
Lines 1-110:    CSS Variables (colors, shadows)
Lines 111-280:  Base styles, typography
Lines 281-600:  Navigation (navbar, hamburger)
Lines 601-1500: Movie cards, grids, filters
Lines 1501-2000: Modals, forms, buttons
Lines 2001-2500: Dashboard, stats, analytics
Lines 2501-3000: Settings page
Lines 3001-4000: Achievements, recommendations
Lines 4001-5000: Admin panel, tables
Lines 5001-5270: Responsive media queries ⚠️ NEEDS WORK
```

**Theme:**
```css
:root {
    --primary-color: #e50914;     /* Netflix red */
    --primary-dark: #b20710;
    --dark-bg: #141414;           /* Netflix dark */
    --card-bg: #1a1a1a;
    --text-primary: #ffffff;
    --text-secondary: #b3b3b3;
}
```

### 5. `backend/models/Movie.js`
**Movie Database Schema**

```javascript
{
  // Basic info
  user: ObjectId,          // User reference
  type: String,            // 'movie' or 'tv'
  title: String,           // Required
  year: Number,
  status: String,          // 'watched', 'watching', 'watchlist'
  rating: Number,          // 0-5 scale
  notes: String,
  
  // API data
  tmdbId: String,
  poster: String,
  backdrop: String,
  genre: String,
  director: String,
  cast: String,
  runtime: Number,         // Minutes (converted from "162 min")
  plot: String,
  imdbRating: String,      // Original IMDb rating
  
  // TV specific
  numberOfSeasons: Number,
  numberOfEpisodes: Number,
  currentSeason: Number,
  currentEpisode: Number,
  
  // Timestamps
  addedAt: Date,
  watchedDate: Date
}
```

---

## 🔐 Environment Configuration

### Frontend (`frontend/js/config.js`)
```javascript
const config = {
    development: {
        API_URL: 'http://localhost:5000'
    },
    production: {
        API_URL: 'https://movietrack-backend.onrender.com'
    }
};

// Auto-detect
const environment = window.location.hostname === 'localhost' 
    ? 'development' 
    : 'production';
```

### Backend (`.env`)
```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb+srv://movietrack:movietrack%40%2312@cluster0.qvpitc.mongodb.net/movietrack

JWT_SECRET=movietrack_secret_key_2025_super_secure_change_in_production
JWT_EXPIRE=7d

CLIENT_URL=http://localhost:3000
```

---

## 🚀 Development Setup

```bash
# Backend
cd backend
npm install
npm start  # http://localhost:5000

# Frontend (choose one)
cd frontend
python -m http.server 3000     # http://localhost:3000
npx serve -p 3000
# OR use VS Code Live Server extension
```

---

## 📝 Version History

### v2.4.0 (October 2025) - Hybrid API System ⭐ CURRENT
**Major Changes:**
- ✅ Added OMDb API for fast search (5-10x faster)
- ✅ Created `frontend/js/omdb.js`
- ✅ Updated `dashboard-enhanced.js` to use OMDb
- ✅ Kept TMDB for trending/recommendations
- ✅ Data transformation (runtime, rating scales)
- ✅ 30-minute caching (localStorage)
- ✅ Reduced timeout from 90s to 8s

**Bug Fixes:**
- ✅ Fixed runtime validation ("162 min" → 162)
- ✅ Fixed rating validation (7.9 → 3.95)
- ✅ Fixed movie save operation

**Files Changed:**
- `frontend/js/omdb.js` - Created
- `frontend/js/dashboard-enhanced.js` - Updated
- `frontend/dashboard.html` - Added OMDb script
- `backend/package.json` - v2.4.0
- All README files updated

### v2.3.1 (October 2025) - Slow Internet Optimizations
- ✅ TMDB retry logic (3 attempts)
- ✅ Progressive timeout (3×30s)
- ✅ localStorage cache persistence
- ✅ Custom Netflix scrollbars
- ✅ Fixed export functions
- ✅ Fixed Settings features

### v2.3.0 (October 2025) - Settings System
- ✅ Complete Settings (10 sections)
- ✅ Theme switcher (Dark/Light/Auto)
- ✅ Export functionality
- ✅ Accessibility features
- ✅ Profile management

---

## 🐛 Priority Bug Fixes Needed

### CRITICAL (Must Fix for Mobile)

1. **Mobile Navbar Layout**
   ```
   Current:  [All links visible in navbar]
   Required: [☰] ←→ [MOVIETRACK] ←→ [👤]
            (left)  (center)      (right)
   ```
   
2. **Profile Icon Missing**
   - Not visible on mobile view
   - Should be in top right corner
   - Clicking opens profile modal with logout button

3. **Movie Cards Too Large**
   ```
   Current:  2-3 cards per row (too wide)
   Required: 1-2 cards per row (smaller)
   ```

4. **Category Buttons Too Large**
   - Current buttons too big on mobile
   - Need smaller size and better spacing

5. **Sidebar Navigation**
   - Settings link missing (added but needs testing)
   - Can't return to Dashboard from Categories

### Where to Fix

**File:** `frontend/css/styles.css`
**Lines:** 5001-5270 (mobile media queries)

**Current Media Queries:**
```css
@media (max-width: 768px) {
  /* Mobile styles here */
}

@media (max-width: 480px) {
  /* Small mobile styles here */
}
```

**Required Changes:**
```css
@media (max-width: 768px) {
  /* 1. Hide desktop nav links */
  .nav-menu {
    display: none !important;
  }
  
  /* 2. Show hamburger + profile */
  .hamburger-menu {
    display: block !important;
    position: absolute;
    left: 10px;
  }
  
  .profile-icon {
    display: block !important;
    position: absolute;
    right: 10px;
  }
  
  /* 3. Center logo */
  .nav-brand {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
  
  /* 4. Smaller movie cards */
  .movies-grid {
    grid-template-columns: 1fr !important;
    gap: 16px;
  }
  
  .movie-card {
    max-width: 100%;
  }
  
  /* 5. Smaller category buttons */
  .filter-buttons button {
    padding: 8px 12px;
    font-size: 14px;
  }
}
```

---

## 📚 API Reference

### OMDb API (v2.4.0)

**Search Movies:**
```javascript
const result = await OMDb.searchMovies('Avatar');
// Returns: { results: [...], loading: false, fromCache: boolean }
```

**Get Details:**
```javascript
const movie = await OMDb.getMovieDetails('tt0499549');
// Returns full movie object with IMDb data
```

**Cache:**
- Memory: 30 minutes
- localStorage: 30 minutes
- Key format: `omdb_movie_{query}`

**Data Format:**
```javascript
{
  id: 'tt0499549',
  title: 'Avatar',
  year: 2009,
  poster: 'https://...',
  runtime: 162,           // Converted from "162 min"
  rating: 3.95,           // Converted from IMDb 7.9
  imdbRating: '7.9',      // Original
  genre: 'Action, Adventure, Fantasy',
  director: 'James Cameron',
  cast: 'Sam Worthington, Zoe Saldana',
  plot: '...',
}
```

### TMDB API

**Trending:**
```javascript
const trending = await TMDB.getTrending('movie', 10);
```

**Recommendations:**
```javascript
const recs = await TMDB.getRecommendations(userProfile, 9);
```

---

## 👤 User Context

### Development Environment
- **OS:** Windows
- **Shell:** PowerShell v5.1
- **Editor:** VS Code
- **Git:** chiragvaze/movietrack

### Design Preferences
- Netflix-themed (dark #141414, red #e50914)
- Professional and clean
- Minimal and elegant
- Good visual hierarchy

### Performance Requirements
- **CRITICAL:** Must work on slow internet (100 KBps)
- Fast autocomplete search ✅ (solved with OMDb)
- Smooth animations
- No lag or freezing

### Mobile Requirements (HIGH PRIORITY) ❌
- Responsive for all mobile devices
- Touch-friendly (min 44x44px buttons)
- Proper navbar: Hamburger left, Logo center, Profile right
- Smaller movie cards (1-2 column grid)
- Sidebar with all navigation links
- No horizontal scrolling
- Font min 16px (prevent iOS zoom)

---

## 🔧 Common Commands

```bash
# Development
cd backend && npm start           # Start backend (port 5000)
cd frontend && python -m http.server 3000  # Start frontend

# Git
git status
git add .
git commit -m "message"
git push origin main

# Database
cd backend
node create-admin.js              # Create admin user
node list-users.js                # List all users

# Health Check
curl https://movietrack-backend.onrender.com/api/health
```

---

## 📞 Resources

### Documentation
- Main README: `/README.md`
- Frontend: `/frontend/README.md`
- Backend: `/backend/README.md`
- Deployment: `/docs/DEPLOYMENT_GUIDE.md`
- Admin: `/docs/ADMIN_PANEL_GUIDE.md`

### External APIs
- OMDb: http://www.omdbapi.com/
- TMDB: https://developers.themoviedb.org/3

### Deployment
- Vercel: Auto-deploy from main branch
- Render: Auto-deploy from main branch
- MongoDB Atlas: M0 free tier (512MB)

---

## 🎓 Key Decisions

### Why Hybrid API (OMDb + TMDB)?
- **Problem:** TMDB too slow on 100 KBps mobile internet
- **Solution:** OMDb for search (fast), TMDB for features (rich data)
- **Result:** 5-10x faster search, kept all TMDB benefits

### Why Vanilla JavaScript?
- No build process
- Fast development
- Easy deployment
- Small bundle size

### Why MongoDB?
- Flexible schema (movies vs TV shows)
- Free Atlas tier (512MB)
- Good Mongoose ODM

### Why JWT?
- Stateless
- Scalable
- Works with frontend/backend separation

---

## ✅ Testing Checklist for Next Chat

### Desktop (Working) ✅
- [x] All features work
- [x] Authentication flow
- [x] Movie CRUD operations
- [x] Settings (all 10 sections)
- [x] Achievements
- [x] Analytics
- [x] Admin panel
- [x] Export functionality

### Mobile (Needs Work) ❌
- [ ] Navbar layout (hamburger, logo, profile)
- [ ] Sidebar opens/closes properly
- [ ] All links work in sidebar
- [ ] Profile icon visible and clickable
- [ ] Logout button in profile modal
- [ ] Movie cards proper size (1-2 columns)
- [ ] Category buttons proper size
- [ ] Forms work (no iOS zoom on input focus)
- [ ] Touch targets min 44px
- [ ] No horizontal scroll
- [ ] Settings link appears in sidebar

---

## 📝 Instructions for Next Chat

**When starting a new chat, share this context and say:**

> "I'm continuing work on MovieTrack v2.4.0. Please read PROJECT_CONTEXT.md for full context. Current priority: Fix mobile responsiveness issues listed in the 'Priority Bug Fixes Needed' section. Desktop view is working perfectly and should not be changed. Focus on mobile navbar layout (hamburger left, logo center, profile right), smaller movie cards, and proper touch targets."

**Key Focus Areas:**
1. Mobile navbar redesign (lines 5001-5270 in styles.css)
2. Movie card sizing for mobile
3. Category button sizing
4. Profile icon visibility
5. Touch target sizes (min 44px)

**What's Already Perfect (Don't Change):**
- ✅ Desktop view
- ✅ OMDb + TMDB hybrid system
- ✅ All backend functionality
- ✅ Authentication
- ✅ Settings system
- ✅ Achievements
- ✅ Analytics

---

**End of Project Context**

*Last updated: November 3, 2025*  
*Version: 2.4.0*  
*Status: Production with mobile improvements needed*
