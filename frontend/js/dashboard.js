// Dashboard JavaScript

// Check if user is logged in
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        window.location.href = 'login.html';
        return null;
    }
    return JSON.parse(user);
}

// Initialize dashboard
const currentUser = checkAuth();
if (currentUser) {
    document.getElementById('userName').textContent = currentUser.name;
}

// Movie data structure
let movies = JSON.parse(localStorage.getItem('movies') || '[]');
let currentFilter = 'all';

// Update statistics
function updateStats() {
    const totalMovies = movies.length;
    const watchedMovies = movies.filter(m => m.status === 'watched').length;
    const watchlistMovies = movies.filter(m => m.status === 'watchlist').length;
    
    // Calculate average rating
    const ratedMovies = movies.filter(m => m.rating > 0);
    const avgRating = ratedMovies.length > 0 
        ? (ratedMovies.reduce((sum, m) => sum + m.rating, 0) / ratedMovies.length).toFixed(1)
        : 0;
    
    document.getElementById('totalMovies').textContent = totalMovies;
    document.getElementById('watchedMovies').textContent = watchedMovies;
    document.getElementById('watchlistMovies').textContent = watchlistMovies;
    document.getElementById('avgRating').textContent = avgRating;
}

// Render movies
function renderMovies(filter = 'all') {
    const container = document.getElementById('moviesContainer');
    
    let filteredMovies = movies;
    if (filter !== 'all') {
        filteredMovies = movies.filter(m => m.status === filter);
    }
    
    if (filteredMovies.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No movies found. Add your first movie!</p></div>';
        return;
    }
    
    container.innerHTML = filteredMovies.map((movie, index) => `
        <div class="movie-card" data-id="${index}">
            <div class="movie-header">
                <div class="movie-title">
                    <h4>${movie.title}</h4>
                    <span class="movie-year">${movie.year || 'N/A'}</span>
                </div>
                <div class="movie-actions">
                    <button class="icon-btn delete-btn" onclick="deleteMovie(${index})" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
            <div class="movie-info">
                <span class="movie-status status-${movie.status}">${movie.status}</span>
                <span class="movie-rating">${movie.rating > 0 ? '⭐'.repeat(movie.rating) : 'Not rated'}</span>
            </div>
        </div>
    `).join('');
}

// Add movie
const addMovieForm = document.getElementById('addMovieForm');
addMovieForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = document.getElementById('movieTitle').value.trim();
    const year = document.getElementById('movieYear').value;
    const status = document.getElementById('movieStatus').value;
    const rating = parseInt(document.getElementById('movieRating').value) || 0;
    
    if (!title || !status) {
        alert('Please fill in all required fields');
        return;
    }
    
    const newMovie = {
        title,
        year: year || new Date().getFullYear(),
        status,
        rating,
        addedAt: new Date().toISOString()
    };
    
    movies.push(newMovie);
    localStorage.setItem('movies', JSON.stringify(movies));
    
    // Reset form
    addMovieForm.reset();
    
    // Update UI
    updateStats();
    renderMovies(currentFilter);
    
    // Show success message
    showNotification('Movie added successfully!');
});

// Delete movie
function deleteMovie(index) {
    if (confirm('Are you sure you want to delete this movie?')) {
        movies.splice(index, 1);
        localStorage.setItem('movies', JSON.stringify(movies));
        updateStats();
        renderMovies(currentFilter);
        showNotification('Movie deleted');
    }
}

// Filter movies
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active button
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Filter movies
        currentFilter = btn.dataset.filter;
        renderMovies(currentFilter);
    });
});

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
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
`;
document.head.appendChild(style);

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
});

// Initialize dashboard
updateStats();
renderMovies();
