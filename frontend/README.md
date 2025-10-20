# Movie Tracker - Frontend

A simple, elegant movie tracking application built with **Vanilla JavaScript, HTML5, and CSS3**.

## 🚀 Features

- **User Authentication**: Sign up and login functionality
- **Movie Management**: Add, view, and delete movies
- **Status Tracking**: Mark movies as "Watched" or "Watchlist"
- **Rating System**: Rate movies from 1-5 stars
- **Statistics Dashboard**: View your watching statistics
- **Filter Movies**: Filter by all, watched, or watchlist
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Local Storage**: Data persists in browser

## 📁 Project Structure

```
frontend/
├── index.html          # Landing page
├── login.html          # Login page
├── signup.html         # Sign up page
├── dashboard.html      # Main dashboard
├── css/
│   └── styles.css      # All styling
├── js/
│   ├── app.js          # Main application logic
│   ├── auth.js         # Authentication handling
│   └── dashboard.js    # Dashboard functionality
└── README.md           # This file
```

## 🛠️ Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with Flexbox and Grid
- **Vanilla JavaScript (ES6+)**: No frameworks or libraries
- **LocalStorage API**: Client-side data persistence

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
2. Use the "Add New Movie" form on the dashboard
3. Enter movie title, year, status (watched/watchlist), and rating
4. Click "Add Movie"

### Managing Movies

- **Filter**: Click filter buttons to view all, watched, or watchlist movies
- **Delete**: Click the trash icon on any movie card to remove it
- **View Stats**: See your statistics at the top of the dashboard

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
