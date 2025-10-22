// Categories Page - Browse Movies & TV Shows by Genre
const TMDB_API_KEY = '409d37969fa9cdbc46f0baf72ff9c6d2';

// Check authentication
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    const token = localStorage.getItem('token');
    if (!user || !token) {
        window.location.href = 'login.html';
        return null;
    }
    return JSON.parse(user);
}

const currentUser = checkAuth();

// All available genres
const genres = [
    { id: 28, name: 'Action', icon: '💥' },
    { id: 12, name: 'Adventure', icon: '🗺️' },
    { id: 16, name: 'Animation', icon: '🎨' },
    { id: 35, name: 'Comedy', icon: '😂' },
    { id: 80, name: 'Crime', icon: '🔫' },
    { id: 99, name: 'Documentary', icon: '📹' },
    { id: 18, name: 'Drama', icon: '🎭' },
    { id: 10751, name: 'Family', icon: '👨‍👩‍👧‍👦' },
    { id: 14, name: 'Fantasy', icon: '🔮' },
    { id: 36, name: 'History', icon: '📜' },
    { id: 27, name: 'Horror', icon: '😱' },
    { id: 10402, name: 'Music', icon: '🎵' },
    { id: 9648, name: 'Mystery', icon: '🔍' },
    { id: 10749, name: 'Romance', icon: '❤️' },
    { id: 878, name: 'Sci-Fi', icon: '🚀' },
    { id: 53, name: 'Thriller', icon: '😰' },
    { id: 10752, name: 'War', icon: '⚔️' },
    { id: 37, name: 'Western', icon: '🤠' }
];

let selectedGenres = [];
let searchQuery = '';
let allResults = [];
let currentPage = 1;
let isLoading = false;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    renderCategoryButtons();
    loadAllMovies();
    initSearch();
    initThemeToggle();
    initSidebar();
    initLogout();
});

// Render category filter buttons
function renderCategoryButtons() {
    const container = document.getElementById('categoryFilterButtons');
    
    container.innerHTML = genres.map(genre => `
        <button class="category-filter-btn" data-genre-id="${genre.id}">
            <span class="genre-icon">${genre.icon}</span>
            <span class="genre-name">${genre.name}</span>
            <i class="fas fa-check check-icon"></i>
        </button>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('.category-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const genreId = parseInt(btn.dataset.genreId);
            toggleGenre(genreId, btn);
        });
    });
    
    // Clear filters button
    document.getElementById('clearFiltersBtn').addEventListener('click', clearAllFilters);
}

// Toggle genre selection
function toggleGenre(genreId, buttonElement) {
    if (selectedGenres.includes(genreId)) {
        selectedGenres = selectedGenres.filter(id => id !== genreId);
        buttonElement.classList.remove('active');
    } else {
        selectedGenres.push(genreId);
        buttonElement.classList.add('active');
    }
    
    // If genres are selected, fetch from TMDB, otherwise use local results
    if (selectedGenres.length > 0) {
        fetchMoviesByGenre();
    } else {
        filterResults();
    }
}

// Clear all filters
function clearAllFilters() {
    selectedGenres = [];
    searchQuery = '';
    document.getElementById('categorySearchInput').value = '';
    document.querySelectorAll('.category-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    // Hide search suggestions
    const searchResults = document.getElementById('categorySearchResults');
    if (searchResults) {
        searchResults.style.display = 'none';
    }
    filterResults();
}

// Load all popular movies and TV shows (multiple pages)
async function loadAllMovies() {
    const grid = document.getElementById('categoriesGrid');
    allResults = [];
    
    try {
        // Fetch multiple pages for more content (pages 1-5 for each)
        const pages = [1, 2, 3, 4, 5];
        const promises = [];
        
        // Fetch multiple pages of movies and TV shows
        pages.forEach(page => {
            promises.push(
                fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`),
                fetch(`https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`)
            );
        });
        
        const responses = await Promise.all(promises);
        const dataPromises = responses.map(r => r.json());
        const allData = await Promise.all(dataPromises);
        
        // Combine all results and mark media type
        allData.forEach((data, index) => {
            const mediaType = index % 2 === 0 ? 'movie' : 'tv';
            const items = data.results.map(item => ({ ...item, media_type: mediaType }));
            allResults.push(...items);
        });
        
        // Sort by popularity
        allResults.sort((a, b) => b.popularity - a.popularity);
        
        filterResults();
    } catch (error) {
        console.error('Error loading content:', error);
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--danger-color);">Failed to load content. Please try again.</p>';
    }
}

// Fetch movies by genre from TMDB (for ALL movies, not just local results)
async function fetchMoviesByGenre() {
    const grid = document.getElementById('categoriesGrid');
    
    // Show loading spinner
    grid.innerHTML = `
        <div class="loading-spinner" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
            <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: var(--primary-color);"></i>
            <p style="margin-top: 1rem;">Loading filtered results...</p>
        </div>
    `;
    
    try {
        const genreIds = selectedGenres.join(',');
        const pages = [1, 2, 3, 4, 5]; // Fetch 5 pages for more results
        const promises = [];
        
        // Fetch movies and TV shows with selected genres from TMDB discover API
        pages.forEach(page => {
            promises.push(
                fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&with_genres=${genreIds}&page=${page}`),
                fetch(`https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&with_genres=${genreIds}&page=${page}`)
            );
        });
        
        const responses = await Promise.all(promises);
        const dataPromises = responses.map(r => r.json());
        const allData = await Promise.all(dataPromises);
        
        let fetchedResults = [];
        
        // Combine all results and mark media type
        allData.forEach((data, index) => {
            const mediaType = index % 2 === 0 ? 'movie' : 'tv';
            const items = data.results.map(item => ({ ...item, media_type: mediaType }));
            fetchedResults.push(...items);
        });
        
        // Sort by popularity
        fetchedResults.sort((a, b) => b.popularity - a.popularity);
        
        // Apply search query if exists
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            fetchedResults = fetchedResults.filter(item => {
                const title = (item.title || item.name || '').toLowerCase();
                return title.includes(query);
            });
        }
        
        displayResults(fetchedResults);
    } catch (error) {
        console.error('Error fetching movies by genre:', error);
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--danger-color);">Failed to load content. Please try again.</p>';
    }
}

// Filter and display results (for local filtering when no genres selected)
function filterResults() {
    let filtered = allResults;
    
    // Apply search query (only used when no genres selected)
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(item => {
            const title = (item.title || item.name || '').toLowerCase();
            return title.includes(query);
        });
    }
    
    displayResults(filtered);
}

// Display results
function displayResults(results) {
    const grid = document.getElementById('categoriesGrid');
    const resultsTitle = document.getElementById('resultsTitle');
    const resultsCount = document.getElementById('resultsCount');
    
    // Update title
    if (selectedGenres.length > 0) {
        const genreNames = selectedGenres.map(id => 
            genres.find(g => g.id === id)?.name
        ).filter(Boolean).join(', ');
        resultsTitle.textContent = genreNames;
    } else {
        resultsTitle.textContent = 'All Movies & TV Shows';
    }
    
    resultsCount.textContent = `${results.length} results found`;
    
    if (results.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                <h3>No results found</h3>
                <p style="color: var(--text-secondary);">Try different filters or search terms</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = results.map(item => {
        const title = item.title || item.name;
        const year = (item.release_date || item.first_air_date || '').substring(0, 4);
        const rating = item.vote_average?.toFixed(1) || 'N/A';
        const poster = item.poster_path 
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450"><rect fill="%232a2a2a" width="300" height="450"/><text fill="%23666" x="50%" y="50%" text-anchor="middle" font-size="20">No Image</text></svg>';
        
        return `
            <div class="movie-card" onclick="showItemDetails(${item.id}, '${item.media_type}')">
                <img src="${poster}" alt="${title}" class="movie-poster" loading="lazy">
                <span class="media-type-badge ${item.media_type}">
                    ${item.media_type === 'movie' ? '🎬 Movie' : '📺 TV Show'}
                </span>
                <div class="movie-info">
                    <h3 class="movie-title" title="${title}">${title}</h3>
                    <div class="movie-meta">
                        <span class="movie-year">${year || 'N/A'}</span>
                        <span class="movie-rating">⭐ ${rating}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Show item details (redirect or modal)
window.showItemDetails = function(id, mediaType) {
    // You can implement a modal here or redirect to dashboard with the item
    showNotification('Opening details...', 'info');
    
    // For now, let's show a simple modal with details
    showDetailsModal(id, mediaType);
}

// Show details modal
async function showDetailsModal(id, mediaType) {
    try {
        const endpoint = mediaType === 'movie' ? 'movie' : 'tv';
        const response = await fetch(
            `https://api.themoviedb.org/3/${endpoint}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits`
        );
        const data = await response.json();
        
        const title = data.title || data.name;
        const year = (data.release_date || data.first_air_date || '').substring(0, 4);
        const rating = data.vote_average?.toFixed(1) || 'N/A';
        const overview = data.overview || 'No description available';
        const poster = data.poster_path 
            ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
            : '';
        const genres = data.genres?.map(g => g.name).join(', ') || 'N/A';
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h2>${title} (${year})</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="movie-details-grid">
                    ${poster ? `<img src="${poster}" alt="${title}" class="details-poster">` : ''}
                    <div class="details-info">
                        <p><strong>Type:</strong> ${mediaType === 'movie' ? 'Movie' : 'TV Show'}</p>
                        <p><strong>Rating:</strong> ⭐ ${rating}</p>
                        <p><strong>Genres:</strong> ${genres}</p>
                        <p><strong>Overview:</strong></p>
                        <p style="color: var(--text-secondary);">${overview}</p>
                        <div class="modal-buttons" style="margin-top: 2rem;">
                            <button class="btn btn-primary" onclick="this.closest('.modal').remove()">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    } catch (error) {
        console.error('Error loading details:', error);
        showNotification('Failed to load details', 'error');
    }
}

// Initialize search
function initSearch() {
    const searchInput = document.getElementById('categorySearchInput');
    const searchBtn = document.getElementById('categorySearchBtn');
    
    // Create search results dropdown
    const searchWrapper = searchInput.parentElement.parentElement;
    const searchResults = document.createElement('div');
    searchResults.id = 'categorySearchResults';
    searchResults.className = 'category-search-results';
    searchWrapper.appendChild(searchResults);
    
    let searchTimeout;
    
    // Live search with suggestions
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            searchResults.style.display = 'none';
            searchQuery = query;
            filterResults();
            return;
        }
        
        searchTimeout = setTimeout(async () => {
            try {
                const response = await fetch(
                    `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1`
                );
                const data = await response.json();
                
                if (data.results && data.results.length > 0) {
                    displaySearchSuggestions(data.results.slice(0, 8));
                } else {
                    searchResults.style.display = 'none';
                }
            } catch (error) {
                console.error('Search error:', error);
            }
            
            // Also filter current results
            searchQuery = query;
            // If genres are selected, fetch from API, otherwise filter locally
            if (selectedGenres.length > 0) {
                fetchMoviesByGenre();
            } else {
                filterResults();
            }
        }, 300);
    });
    
    searchBtn.addEventListener('click', () => {
        searchQuery = searchInput.value.trim();
        searchResults.style.display = 'none';
        // If genres are selected, fetch from API, otherwise filter locally
        if (selectedGenres.length > 0) {
            fetchMoviesByGenre();
        } else {
            filterResults();
        }
    });
    
    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchWrapper.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
    
    // Handle Enter key
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            searchQuery = searchInput.value.trim();
            searchResults.style.display = 'none';
            // If genres are selected, fetch from API, otherwise filter locally
            if (selectedGenres.length > 0) {
                fetchMoviesByGenre();
            } else {
                filterResults();
            }
        }
    });
}

// Display search suggestions
function displaySearchSuggestions(results) {
    const searchResults = document.getElementById('categorySearchResults');
    
    const filteredResults = results.filter(item => 
        item.media_type === 'movie' || item.media_type === 'tv'
    );
    
    if (filteredResults.length === 0) {
        searchResults.style.display = 'none';
        return;
    }
    
    searchResults.innerHTML = filteredResults.map(item => {
        const title = item.title || item.name;
        const year = (item.release_date || item.first_air_date || '').substring(0, 4);
        const type = item.media_type === 'movie' ? '🎬' : '📺';
        const poster = item.poster_path 
            ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
            : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="92" height="138"><rect fill="%232a2a2a" width="92" height="138"/></svg>';
        
        return `
            <div class="search-result-item" onclick="selectSearchItem('${title.replace(/'/g, "\\'")}')">
                <img src="${poster}" alt="${title}" class="search-result-poster">
                <div class="search-result-info">
                    <div class="search-result-title">${type} ${title}</div>
                    <div class="search-result-year">${year || 'N/A'}</div>
                </div>
            </div>
        `;
    }).join('');
    
    searchResults.style.display = 'block';
}

// Select search item from suggestions
window.selectSearchItem = function(title) {
    const searchInput = document.getElementById('categorySearchInput');
    const searchResults = document.getElementById('categorySearchResults');
    
    searchInput.value = title;
    searchQuery = title;
    searchResults.style.display = 'none';
    // If genres are selected, fetch from API, otherwise filter locally
    if (selectedGenres.length > 0) {
        fetchMoviesByGenre();
    } else {
        filterResults();
    }
}

// Notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.textContent = message;
    
    let bgColor = '#3b82f6'; // info - blue
    if (type === 'success') bgColor = '#10b981'; // green
    if (type === 'error') bgColor = '#ef4444'; // red
    
    notification.style.cssText = `position: fixed; top: 80px; right: 20px; background: ${bgColor}; color: white; padding: 1rem 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); z-index: 10000; animation: slideIn 0.3s ease;`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Theme toggle
function initThemeToggle() {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = themeToggleBtn.querySelector('i');
    
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme, themeIcon);
    
    themeToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme, themeIcon);
    });
}

function updateThemeIcon(theme, iconElement) {
    iconElement.className = theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
}

// Sidebar (basic version)
function initSidebar() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
        });
    }
    
    const closeSidebar = () => {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    };
    
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);
}

// Logout
function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('token');
                localStorage.removeItem('currentUser');
                window.location.href = 'login.html';
            }
        });
    }
}

// Profile Modal
document.getElementById('profileBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    showProfileModal();
});

function showProfileModal() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Profile</h2>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="profile-info">
                    <div class="profile-avatar">
                        <i class="fas fa-user-circle" style="font-size: 5rem; color: var(--primary-color);"></i>
                    </div>
                    <div class="profile-details">
                        <p><strong>Name:</strong> ${user.name || 'N/A'}</p>
                        <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
                        <p><strong>Member since:</strong> ${new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}
