# Movie Tracker - Frontend v2.3.1

A simple, elegant movie tracking application built with **Vanilla JavaScript, HTML5, and CSS3**.

## 🚀 Features

### Core Features
- **User Authentication**: Secure sign up and login with JWT tokens
- **Movie Management**: Add, view, edit, and delete movies
- **Status Tracking**: Mark movies as "Watched", "Watchlist", or "Watching"
- **Rating System**: Rate movies from 1-5 stars
- **Statistics Dashboard**: View your watching statistics
- **Filter Movies**: Filter by status (all, watched, watchlist)
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### Advanced Features (v2.1)
- **🎭 Categories System**: Browse movies by genre with TMDB integration
- **📊 Analytics Dashboard**: Comprehensive statistics with interactive charts
  - Viewing trends and patterns
  - Rating distribution analysis
  - Genre preferences visualization
  - Top-rated content lists
  - Watch time tracking

### Smart Features (v2.2)
- **🤖 Smart Recommendations Engine**: AI-powered movie suggestions
  - Content-based recommendations (similar to your favorites)
  - Genre-based discovery (personalized to your preferences)
  - Trending content recommendations
  - Filters out movies you already own
  
- **🏆 Achievement/Badges System**: Gamification with 25 unique achievements
  - **Collection Badges**: First Movie, Growing Collection, Movie Buff, Cinema Enthusiast, Movie Master
  - **Rating Badges**: First Review, Critical Eye, Harsh Critic, Five Star Fan, Rating Pro
  - **Watch Time Badges**: Movie Marathon, Weekend Warrior, Cinema Addict, Time Traveler
  - **Genre Exploration**: Genre Explorer, Action Hero, Romance Reader, Sci-Fi Scholar, Horror Survivor
  - **Streak Achievements**: Week Warrior, Month Master, Year Champion
  - **Special Achievements**: Binge Watcher, Quality Curator, Completionist
  - Real-time unlock notifications with animations
  - Progress tracking and achievement modal

### ⚙️ Settings System (v2.3) **NEW!**
- **🔧 Comprehensive Settings Page** with 10 organized sections:
  1. **Profile Settings**: Update username, change password, delete account
  2. **Appearance**: Theme selection (Dark/Light/Auto), view mode, grid columns, poster quality
  3. **Content Preferences**: Media type, language, region, adult content filter, spoiler protection
  4. **Notifications**: Achievement alerts, toast notifications, duration, position, sound effects
  5. **Dashboard Customization**: Default view, sort order, visible sections
  6. **Recommendations**: Algorithm toggles, rating filters, results limit
  7. **Achievements**: Progress hints, celebration effects, sorting, reset option
  8. **Data & Privacy**: Export (JSON/CSV/PDF), import data, storage usage, clear cache
  9. **Accessibility**: Font size, reduce motion, high contrast, keyboard shortcuts
  10. **About**: Version info, credits, help links, changelog
- **💾 Full Data Portability**: Export/import entire movie collection
- **🎨 Persistent Preferences**: All settings saved to localStorage
- **📊 Storage Tracking**: Visual display of local storage usage

### 🆕 Enhanced Features (v2.0)
- ⭐ **TMDB Integration**: Auto-fill movie data with posters from TheMovieDB
- ⭐ **Real-time Search**: Search as you type with 300ms debounce
- ⭐ **Sort Movies**: Sort by title, year, rating, or date added
- ⭐ **Genre Filtering**: Browse by 18+ movie genres
- ⭐ **Toast Notifications**: Beautiful success/error/info messages
- ⭐ **Skeleton Loaders**: Smooth loading animations
- ⭐ **Back-to-Top Button**: Easy navigation on long lists
- ⭐ **Custom Confirm Modal**: Elegant confirmation dialogs
- ⭐ **Detailed View**: Click cards to see full info (cast, plot, runtime)
- ⭐ **Movie Recommendations**: TMDB-powered suggestions based on your collection

### 📊 Analytics Dashboard (v2.1)
- 📈 **Quick Stats**: Total content, estimated watch time, average rating, day streak
- 🥧 **Content Distribution Chart**: Pie chart showing Movies vs TV Shows ratio
- 📊 **Genre Analysis**: Bar chart of your top 8 favorite genres
- ⭐ **Rating Distribution**: Color-coded rating breakdown (0-5 stars)
- 📅 **7-Day Activity Timeline**: Line chart showing your weekly activity pattern
- 🏆 **Top Rated List**: Your 5 highest-rated movies and shows
- 🆕 **Recent Additions**: 5 most recently added items with dates
- 🎯 **Real-time Updates**: Charts auto-generate from your collection using Chart.js

## 📁 Project Structure

```
frontend/
├── index.html                   # Landing page
├── login.html                   # Login page
├── signup.html                  # Sign up page
├── dashboard.html               # Main dashboard with analytics
├── categories.html              # Genre browsing page 🆕
├── admin-login.html             # Admin authentication 🆕
├── admin-dashboard.html         # Admin panel 🆕
├── assets/
│   └── logo.svg                 # Application logo 🆕
├── css/
│   ├── styles.css               # Main styling (Netflix theme)
│   └── admin-styles.css         # Admin panel styles 🆕
├── js/
│   ├── api.js                   # API service layer
│   ├── auth.js                  # Authentication handling
│   ├── dashboard-enhanced.js    # Enhanced dashboard with analytics 📊
│   ├── tmdb.js                  # TMDB API integration 🆕
│   ├── categories.js            # Categories page logic 🆕
│   ├── admin-login.js           # Admin authentication 🆕
│   ├── admin.js                 # Admin dashboard logic 🆕
│   └── config.js                # Configuration settings 🆕
└── README.md                    # This file
```

## 🛠️ Technologies Used

- **HTML5**: Semantic markup with modern structure
- **CSS3**: Advanced styling with Flexbox, Grid, animations, and transitions
- **Vanilla JavaScript (ES6+)**: Async/await, modules, modern syntax
- **Font Awesome 6.4.0**: Beautiful icons throughout the UI
- **Chart.js 4.4.0**: Interactive charts for analytics dashboard 📊
- **TMDB API**: Movie data, posters, and recommendations
- **JWT**: JSON Web Tokens for secure authentication
- **Netflix-inspired Design**: Dark theme with red accents

## 🎯 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- No build tools or dependencies required!

### Installation

1. Clone or download this repository
2. Navigate to the `frontend` directory
3. Open `index.html` in your web browser

**Or use a local server:**

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## 📖 Usage

### Creating an Account

1. Click "Sign Up" from the home page
2. Fill in your details (name, email, password)
3. Click "Sign Up" button
4. You'll be redirected to login

### Adding Movies

1. Login to your account
2. Click "Add Movie" button on the dashboard
3. Search for movie in TMDB database (auto-complete suggestions)
4. Select movie from results (auto-fills all data + poster)
5. Or manually enter movie details
6. Set status (watched/watchlist/watching) and rating
7. Click "Add Movie"

### Managing Movies

- **Search**: Use the search bar to find movies by title
- **Sort**: Use the sort dropdown (title, year, rating, date added)
- **Filter**: Click filter buttons to view all, watched, or watchlist movies
- **Edit**: Click the edit icon to modify movie details
- **Delete**: Click the trash icon (with custom confirm modal)
- **View Details**: Click any movie card for full information
- **View Stats**: See statistics at the top of the dashboard
- **View Analytics**: Click "Analytics" in sidebar for comprehensive charts 📊

### Analytics Dashboard 📊

1. Click "Analytics" in the sidebar menu
2. View your collection statistics:
   - **Quick Stats**: Total content, watch time, avg rating, streak
   - **Content Distribution**: Pie chart of Movies vs TV Shows
   - **Top Genres**: Bar chart of your favorite genres
   - **Rating Distribution**: See how you rate content (color-coded)
   - **7-Day Activity**: Track your weekly adding pattern
   - **Top Rated**: Your highest-rated movies/shows
   - **Recent Additions**: Latest items you've added
3. Charts update automatically based on your collection

### Logging Out

- Click the "Logout" button in the navigation bar

## 🎨 Customization

### Changing Colors

Edit the CSS variables in `css/styles.css`:

```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #8b5cf6;
    /* Add more custom colors */
}
```

### Adding Features

The code is well-structured and commented. Feel free to add:
- Movie search functionality
- Categories/genres
- Notes for each movie
- Export/import data
- Integration with movie APIs (TMDB, OMDB)

## 🔒 Security Note

This is a **frontend-only demo** using localStorage. For production:
- Use a backend server for authentication
- Hash passwords on the server
- Use secure tokens (JWT)
- Implement proper session management

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🐛 Known Issues

- Data is stored locally - clearing browser data will delete all movies
- No password recovery feature (demo only)
- No backend integration (frontend only)

## 🚀 Future Enhancements

- [ ] Connect to backend API
- [ ] Movie poster images
- [ ] Advanced search and filters
- [ ] Social features (share movies)
- [ ] Dark mode toggle
- [ ] PWA support (offline access)

## 📝 License

Free to use for learning and personal projects.

## 🤝 Contributing

Feel free to fork and improve this project!

---

**Enjoy tracking your movies! 🎬🍿**
