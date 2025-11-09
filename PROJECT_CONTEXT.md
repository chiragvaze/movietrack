# 🎬 MovieTrack - Complete Project Context

**Last Updated:** November 9, 2025  
**Current Version:** v2.5.0  
**Status:** Production Ready ✅  
**Repository:** https://github.com/chiragvaze/movietrack

---

## 📋 Quick Reference

| **Category** | **Details** |
|-------------|-------------|
| **Version** | 2.5.0 |
| **Frontend** | https://movietrack-three.vercel.app |
| **Backend** | https://movietrack-backend.onrender.com |
| **Admin Panel** | https://movietrack-three.vercel.app/admin-login.html |
| **Theme** | Netflix-inspired (Dark: #141414, Red: #e50914) |
| **Status** | ✅ Production | ⚠️ Mobile needs work |

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
- **Custom Tags System** - Organize movies with personalized tags ⭐ NEW v2.5.0
- **Tags & Lists Page** - Browse and manage all tagged content ⭐ NEW v2.5.0

---

## ✅ Current Status (v2.5.0)

### What's Working Perfectly
- ✅ Hybrid API System: OMDb (fast search) + TMDB (trending/recommendations)
- ✅ User authentication (JWT)
- ✅ Complete movie/TV show CRUD
- ✅ Settings system (10 sections, fully functional)
- ✅ Achievement system (20+ achievements)
- ✅ Analytics dashboard with Chart.js
- ✅ Content-based recommendations
- ✅ Category/Genre browsing
- ✅ **Categories Quick Actions** - Add to lists directly from browse page
- ✅ **Load More Pagination** - Infinite scroll with 20 items per page
- ✅ **Complete TMDB Details** - Full movie data fetch with cast, director, plot
- ✅ **Mobile Responsive Categories** - 2-column grid, optimized touch targets
- ✅ **Toast Notifications** - Real-time user feedback system
- ✅ **Custom Tags System** - Add personalized tags to any movie/TV show ⭐ NEW v2.5.0
- ✅ **Tag Management Modal** - Add/remove tags with quick suggestions ⭐ NEW v2.5.0
- ✅ **Tag Display on Cards** - Purple gradient badges show up to 2 tags ⭐ NEW v2.5.0
- ✅ **Tags & Lists Page** - Dedicated page to browse all tags and lists ⭐ NEW v2.5.0
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
│   │   ├── styles.css          Main styles (7104 lines) 🎨 ⭐ v2.4.1
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
│   │   ├── categories.js       Category browsing (831 lines) ⭐ v2.4.1
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
│   ├── package.json            v2.4.1
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

**Recent Changes (v2.4.1):**
- Added action buttons (Watched, Watching, Watchlist) to categories page movie cards
- Implemented Load More pagination for categories page
- Added comprehensive movie detail fetching from TMDB API
- Enhanced mobile responsive styles for categories page
- Fixed movie detail modal display on mobile devices
- Added notifications system for user feedback

**Previous Changes (v2.4.0):**
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

---

## 🎬 Categories Page Enhancement (v2.4.1)

### 1. `frontend/js/categories.js` (831 lines) - ENHANCED in v2.4.1
**Categories Browsing with Direct Movie Management**

**Purpose:** Browse movies/TV shows by genre and add directly to watchlists without leaving the page.

**Key Features Added (v2.4.1):**
- ✅ **Action Buttons** - Watched, Watching, Watchlist buttons on every card
- ✅ **Direct TMDB Fetch** - Complete movie details fetched directly from TMDB API
- ✅ **Toast Notifications** - Real-time success/error feedback
- ✅ **Load More Pagination** - 20 items per page with pagination
- ✅ **Mobile Responsive** - 2-column grid optimized for mobile devices

**Main Function - Add to List (Lines 730-831):**
```javascript
window.addToList = async function(listType, tmdbId, mediaType, itemDataStr) {
    try {
        showNotification('Adding to list...', 'info');
        
        // Get auth token
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Please login first', 'error');
            return;
        }
        
        // Fetch complete details from TMDB API directly
        const endpoint = mediaType === 'tv' ? 'tv' : 'movie';
        const tmdbUrl = `https://api.themoviedb.org/3/${endpoint}/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits`;
        const response = await fetch(tmdbUrl);
        const tmdbData = await response.json();
        
        // Extract comprehensive movie details
        const director = mediaType === 'movie' 
            ? tmdbData.credits?.crew?.find(c => c.job === 'Director')?.name || 'N/A'
            : tmdbData.created_by?.[0]?.name || 'N/A';
            
        const cast = tmdbData.credits?.cast?.slice(0, 5).map(c => c.name).join(', ') || 'N/A';
        const genres = tmdbData.genres?.map(g => g.name).join(', ') || 'N/A';
        const runtime = mediaType === 'movie' ? tmdbData.runtime || 0 : tmdbData.episode_run_time?.[0] || 0;
        const plot = tmdbData.overview || 'No plot available';
        
        // TV Show specific data
        const seasons = mediaType === 'tv' ? tmdbData.number_of_seasons || 0 : 0;
        const episodes = mediaType === 'tv' ? tmdbData.number_of_episodes || 0 : 0;
        
        // Rating conversion: TMDB 0-10 scale → App 0-5 scale
        const tmdbRating = tmdbData.vote_average || 0;
        const convertedRating = tmdbRating / 2;  // 7.1 → 3.55
        
        // Prepare movie data for backend
        const movieData = {
            title: tmdbData.title || tmdbData.name,
            year: mediaType === 'movie' 
                ? tmdbData.release_date?.split('-')[0] || 'N/A'
                : tmdbData.first_air_date?.split('-')[0] || 'N/A',
            poster: `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`,
            rating: convertedRating,  // Converted to 0-5 scale
            userRating: 0,  // User hasn't rated yet
            genre: genres,
            plot: plot,
            director: director,
            actors: cast,
            runtime: runtime,
            imdbId: tmdbData.imdb_id || tmdbId.toString(),
            type: mediaType === 'tv' ? 'series' : 'movie',
            status: listType,  // 'watched', 'watching', or 'watchlist'
            seasons: seasons,
            episodes: episodes
        };
        
        // Send to backend API
        const apiResponse = await fetch(`${API_URL}/api/movies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(movieData)
        });
        
        const result = await apiResponse.json();
        
        if (!apiResponse.ok) {
            throw new Error(result.error || 'Failed to add movie');
        }
        
        showNotification(`Added to ${listType}!`, 'success');
        
    } catch (error) {
        console.error('Error adding to list:', error);
        showNotification(error.message || 'Failed to add to list. Please try again.', 'error');
    }
};
```

**Action Buttons HTML (Lines 275-330):**
```javascript
// Render action buttons on each movie card
<div class="action-buttons">
    <button class="action-btn watched-btn" 
            onclick="addToList('watched', ${item.id}, '${type}', '${itemDataStr}')">
        <i class="fas fa-check"></i> Watched
    </button>
    <button class="action-btn watching-btn" 
            onclick="addToList('watching', ${item.id}, '${type}', '${itemDataStr}')">
        <i class="fas fa-eye"></i> Watching
    </button>
    <button class="action-btn watchlist-btn" 
            onclick="addToList('watchlist', ${item.id}, '${type}', '${itemDataStr}')">
        <i class="fas fa-bookmark"></i> Watchlist
    </button>
</div>
```

**Key Technical Decisions:**
1. **Direct TMDB Fetch:** Bypasses OMDB for complete data (cast, director, runtime, plot)
2. **Rating Conversion:** TMDB uses 0-10, backend validates 0-5, so divide by 2
3. **User Rating 0:** New additions start unrated, user can rate later in dashboard
4. **API Endpoint:** Uses `/api/movies` (not `/movies`) to match backend routes
5. **Token Auth:** Requires JWT token from localStorage for authenticated requests

### 2. `frontend/css/styles.css` - ENHANCED in v2.4.1
**Total Lines:** 7104 (increased from 5270)

**New Sections Added:**

**Action Buttons Styles (Lines 3933-4130):**
```css
/* Action buttons container - hidden by default, show on hover */
.action-buttons {
    display: none;
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    gap: 5px;
    z-index: 10;
}

.movie-card:hover .action-buttons {
    display: flex;
    flex-direction: column;
    animation: slideUp 0.3s ease;
}

/* Individual action button styles */
.action-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 6px;
    position: relative;
    overflow: hidden;
}

/* Color-coded buttons */
.watched-btn {
    background: linear-gradient(135deg, #28a745, #20c997);
    color: white;
}

.watching-btn {
    background: linear-gradient(135deg, #007bff, #0056b3);
    color: white;
}

.watchlist-btn {
    background: linear-gradient(135deg, #ffc107, #ff9800);
    color: #000;
}

/* Hover effects with scale and shadow */
.action-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

/* Ripple effect on click */
.action-btn::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
}

.action-btn:active::after {
    width: 300px;
    height: 300px;
}
```

**Toast Notification System (Lines 4130-4280):**
```css
/* Fixed notification container at top-right */
.notification {
    position: fixed;
    top: 80px;
    right: 20px;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 300px;
    animation: slideIn 0.3s ease, slideOut 0.3s ease 2.7s;
}

/* Notification types */
.notification.success {
    background: linear-gradient(135deg, #28a745, #20c997);
    color: white;
}

.notification.error {
    background: linear-gradient(135deg, #dc3545, #c82333);
    color: white;
}

.notification.info {
    background: linear-gradient(135deg, #17a2b8, #138496);
    color: white;
}

/* Slide animations */
@keyframes slideIn {
    from {
        transform: translateX(400px);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOut {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(400px);
        opacity: 0;
    }
}
```

**Mobile Responsive Design (Lines 4650-4780):**
```css
/* Mobile optimization for small screens */
@media (max-width: 768px) {
    /* 2-column grid layout */
    .results-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 12px;
        padding: 0 10px;
    }
    
    /* Smaller movie cards */
    .movie-card {
        height: auto;
    }
    
    .movie-poster {
        height: 140px;
        object-fit: cover;
    }
    
    /* Always show action buttons on mobile */
    .action-buttons {
        display: flex !important;
        flex-direction: column;
        position: relative;
        margin-top: 8px;
        gap: 6px;
    }
    
    /* Smaller buttons for mobile */
    .action-btn {
        padding: 6px 10px;
        font-size: 11px;
    }
    
    /* Full-width notifications on mobile */
    .notification {
        right: 10px;
        left: 10px;
        min-width: auto;
    }
}
```

### 3. Technical Integration Points

**Backend API Endpoint (`/api/movies` POST):**
```javascript
// Required headers
Authorization: Bearer ${JWT_TOKEN}
Content-Type: application/json

// Required fields
{
    title: String,
    status: 'watched' | 'watching' | 'watchlist',  // Required
    type: 'movie' | 'series',
    year: String,
    poster: String (URL),
    rating: Number (0-5),  // IMPORTANT: Backend validates max 5
    userRating: Number (0-5),
    genre: String,
    plot: String,
    director: String,
    actors: String (comma-separated),
    runtime: Number (minutes),
    imdbId: String,
    seasons: Number (for TV shows),
    episodes: Number (for TV shows)
}
```

**TMDB API Integration:**
```javascript
// Endpoint format
https://api.themoviedb.org/3/{movie|tv}/{tmdb_id}?api_key=${KEY}&append_to_response=credits

// Response structure
{
    id: 550,
    title: "Fight Club",  // or "name" for TV shows
    overview: "Plot description...",
    vote_average: 8.4,  // 0-10 scale
    release_date: "1999-10-15",  // or first_air_date for TV
    poster_path: "/path.jpg",
    imdb_id: "tt0137523",
    runtime: 139,  // minutes
    genres: [{id: 18, name: "Drama"}],
    credits: {
        cast: [{name: "Brad Pitt", character: "Tyler Durden"}],
        crew: [{name: "David Fincher", job: "Director"}]
    },
    // TV-specific
    number_of_seasons: 5,
    number_of_episodes: 73,
    episode_run_time: [42]
}
```

**Error Handling:**
```javascript
// Common errors and solutions
1. "Failed to add to list" → Check token in localStorage
2. "Server error: rating validation failed" → Check rating is 0-5 (not 0-10)
3. "Unauthorized" → Token expired or invalid, redirect to login
4. "Network error" → TMDB API key invalid or rate limit exceeded
```

---

### 4. `frontend/js/omdb.js` (299 lines) - NEW in v2.4.0
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

### 5. `frontend/js/settings.js` (1242 lines)
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

### 6. `frontend/css/styles.css` (7104 lines) - ENHANCED in v2.4.1
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
Lines 3001-3933: Achievements, recommendations
Lines 3933-4130: Action buttons (v2.4.1) 🆕
Lines 4130-4280: Toast notifications (v2.4.1) 🆕
Lines 4280-4650: Admin panel, tables
Lines 4650-4780: Mobile responsive (v2.4.1) 🆕
Lines 4780-7104: Responsive media queries & remaining styles
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

### 7. `backend/models/Movie.js`
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

## � Troubleshooting Guide (v2.4.1)

### Categories Page - Action Buttons Issues

**Problem 1: "Failed to add to list. Please try again."**
- **Cause:** Token not found or expired
- **Solution:** 
  ```javascript
  // Check localStorage
  console.log(localStorage.getItem('token'));
  // If null, redirect to login
  window.location.href = '/login.html';
  ```

**Problem 2: "Server error: rating validation failed"**
- **Cause:** TMDB rating (0-10) not converted to app scale (0-5)
- **Solution:** Already fixed in v2.4.1
  ```javascript
  // Correct conversion in categories.js
  const convertedRating = tmdbRating / 2;  // 7.1 → 3.55
  ```

**Problem 3: Missing movie details in dashboard**
- **Cause:** Incomplete data fetching from TMDB
- **Solution:** Already fixed in v2.4.1 - now fetches:
  - Director/Creator
  - Cast (top 5 actors)
  - Genres
  - Runtime
  - Plot/Overview
  - Seasons/Episodes (for TV shows)

**Problem 4: Action buttons not showing**
- **Desktop:** Buttons should appear on hover
- **Mobile:** Buttons always visible
- **Debug:**
  ```css
  /* Force show buttons for testing */
  .action-buttons {
      display: flex !important;
  }
  ```

**Problem 5: Toast notifications not appearing**
- **Check z-index:** Notifications use `z-index: 9999`
- **Check position:** Fixed at `top: 80px, right: 20px`
- **Debug:**
  ```javascript
  // Test notification
  showNotification('Test message', 'success');
  ```

**Problem 6: API endpoint returns 404**
- **Wrong:** `${API_URL}/movies`
- **Correct:** `${API_URL}/api/movies`
- **Check backend routes:**
  ```javascript
  // backend/server.js should have:
  app.use('/api/movies', movieRoutes);
  ```

**Problem 7: TMDB API key issues**
- **Error:** "Invalid API key" or network timeout
- **Solution:** Check `categories.js` line ~10
  ```javascript
  const TMDB_API_KEY = 'YOUR_TMDB_API_KEY';
  // Get free key from https://www.themoviedb.org/settings/api
  ```

**Problem 8: Mobile layout issues**
- **Symptoms:** Cards too large, buttons overlapping
- **Solution:** Already fixed in v2.4.1 with media queries
- **Check:** `styles.css` lines 4650-4780
  ```css
  @media (max-width: 768px) {
      .results-grid {
          grid-template-columns: repeat(2, 1fr) !important;
      }
  }
  ```

### General Debugging Tips

**Backend Connection:**
```bash
# Test backend is running
curl http://localhost:5000/api/health

# Check MongoDB connection
# Look for "MongoDB Connected" in terminal
```

**Frontend API Calls:**
```javascript
// Enable detailed logging
localStorage.setItem('debug', 'true');

// Check network tab in DevTools
// Look for failed requests to /api/movies
```

**Common HTTP Status Codes:**
- `401 Unauthorized` → Token missing or expired
- `404 Not Found` → Wrong API endpoint
- `500 Internal Server Error` → Backend validation error (check rating scale)
- `429 Too Many Requests` → TMDB API rate limit (5000/day)

---

## �📝 Version History

### v2.4.1 (November 2025) ⭐ CURRENT
**Key Features:**
- ✅ Action buttons on category movie cards (Watched/Watching/Watchlist)
- ✅ Load More pagination with smooth scrolling
- ✅ Complete TMDB movie details fetching
- ✅ Enhanced mobile responsive design
- ✅ Movie detail modal optimization
- ✅ Toast notification system

### v2.4.0 (October 2025) - Hybrid API System
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
- `backend/package.json` - v2.4.1
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

> "I'm continuing work on MovieTrack v2.4.1. Please read PROJECT_CONTEXT.md for full context. Current priority: Categories page enhancements with action buttons and pagination. All features should maintain the existing Hybrid API System from v2.4.0."

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
*Version: 2.4.1*  
*Status: Production with mobile improvements needed*
