// Dashboard JavaScript
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    const token = API.getToken();
    if (!user || !token) {
        window.location.href = 'login.html';
        return null;
    }
    return JSON.parse(user);
}

const currentUser = checkAuth();
if (currentUser) {
    document.getElementById('userName').textContent = currentUser.name;
}

let movies = [];
let currentFilter = 'all';

async function loadMovies() {
    try {
        const response = await API.getMovies();
        if (response.success) {
            movies = response.movies;
            updateStats();
            renderMovies(currentFilter);
        }
    } catch (error) {
        console.error('Error loading movies:', error);
        showNotification('Failed to load movies', 'error');
        if (error.message && error.message.includes('token')) {
            API.logout();
        }
    }
}

async function updateStats() {
    try {
        const response = await API.getMovieStats();
        if (response.success) {
            const stats = response.stats;
            document.getElementById('totalMovies').textContent = stats.totalMovies;
            document.getElementById('watchedMovies').textContent = stats.watchedMovies;
            document.getElementById('watchlistMovies').textContent = stats.watchlistMovies;
            document.getElementById('avgRating').textContent = stats.avgRating.toFixed(1);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

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
    container.innerHTML = filteredMovies.map(movie => `
        <div class="movie-card" data-id="${movie._id}">
            <div class="movie-header">
                <div class="movie-title">
                    <h4>${movie.title}</h4>
                    <span class="movie-year">${movie.year || 'N/A'}</span>
                </div>
                <div class="movie-actions">
                    <button class="icon-btn delete-btn" onclick="deleteMovie('${movie._id}')" title="Delete"></button>
                </div>
            </div>
            <div class="movie-info">
                <span class="movie-status status-${movie.status}">${movie.status}</span>
                <span class="movie-rating">${movie.rating > 0 ? ''.repeat(movie.rating) : 'Not rated'}</span>
            </div>
        </div>
    `).join('');
}

const addMovieForm = document.getElementById('addMovieForm');
if (addMovieForm) {
    addMovieForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('movieTitle').value.trim();
        const year = document.getElementById('movieYear').value;
        const status = document.getElementById('movieStatus').value;
        const rating = parseInt(document.getElementById('movieRating').value) || 0;
        if (!title || !status) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        const submitBtn = addMovieForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Adding...';
        submitBtn.disabled = true;
        try {
            const movieData = { title, year: year || new Date().getFullYear(), status, rating };
            const response = await API.addMovie(movieData);
            if (response.success) {
                addMovieForm.reset();
                await loadMovies();
                showNotification('Movie added successfully!');
            }
        } catch (error) {
            console.error('Error adding movie:', error);
            showNotification(error.message || 'Failed to add movie', 'error');
        } finally {
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}

async function deleteMovie(movieId) {
    if (confirm('Are you sure you want to delete this movie?')) {
        try {
            const response = await API.deleteMovie(movieId);
            if (response.success) {
                await loadMovies();
                showNotification('Movie deleted');
            }
        } catch (error) {
            console.error('Error deleting movie:', error);
            showNotification(error.message || 'Failed to delete movie', 'error');
        }
    }
}

const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderMovies(currentFilter);
    });
});

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `position: fixed; top: 80px; right: 20px; background: ${type === 'success' ? '#10b981' : '#ef4444'}; color: white; padding: 1rem 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); z-index: 1000; animation: slideIn 0.3s ease;`;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

const style = document.createElement('style');
style.textContent = `@keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } }`;
document.head.appendChild(style);

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            API.logout();
        }
    });
}

loadMovies();
