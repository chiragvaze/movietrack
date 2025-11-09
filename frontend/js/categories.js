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
let displayedResults = [];
let currentPage = 1;
let isLoading = false;
const ITEMS_PER_PAGE = 20; // Number of items to load per page

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    console.log('Categories page loaded'); // Debug
    renderCategoryButtons();
    loadAllMovies();
    initSearch();
    initThemeToggle();
    initSidebar();
    initLogout();
    initLoadMore();
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
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    
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
    
    // Store results for pagination
    displayedResults = results;
    currentPage = 1;
    
    if (results.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                <h3>No results found</h3>
                <p style="color: var(--text-secondary);">Try different filters or search terms</p>
            </div>
        `;
        loadMoreContainer.style.display = 'none';
        return;
    }
    
    // Render first page
    renderPage(1, true);
    
    // Show or hide Load More button
    if (results.length > ITEMS_PER_PAGE) {
        loadMoreContainer.style.display = 'flex';
    } else {
        loadMoreContainer.style.display = 'none';
    }
}

// Render a specific page of results
function renderPage(page, clearGrid = false) {
    const grid = document.getElementById('categoriesGrid');
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageResults = displayedResults.slice(startIndex, endIndex);
    
    // Get poster size based on settings
    const settings = window.userSettings || JSON.parse(localStorage.getItem('movietrack_settings') || '{}');
    const quality = settings.posterQuality || 'medium';
    let posterSize = 'w342';
    if (quality === 'low') posterSize = 'w185';
    else if (quality === 'high') posterSize = 'w780';
    
    const html = pageResults.map(item => {
        const title = item.title || item.name;
        const year = (item.release_date || item.first_air_date || '').substring(0, 4);
        const rating = item.vote_average?.toFixed(1) || 'N/A';
        const poster = item.poster_path 
            ? `https://image.tmdb.org/t/p/${posterSize}${item.poster_path}`
            : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450"><rect fill="%232a2a2a" width="300" height="450"/><text fill="%23666" x="50%" y="50%" text-anchor="middle" font-size="20">No Image</text></svg>';
        
        // Create unique IDs for each item
        const itemData = JSON.stringify({
            id: item.id,
            title: title,
            year: year,
            rating: rating,
            poster: poster,
            mediaType: item.media_type
        }).replace(/"/g, '&quot;');
        
        return `
            <div class="movie-card">
                <div class="movie-card-inner" onclick="showItemDetails(${item.id}, '${item.media_type}')">
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
                <div class="action-buttons" onclick="event.stopPropagation()">
                    <button class="action-btn watched-btn" onclick="addToList('watched', ${item.id}, '${item.media_type}', ${itemData})" title="Mark as Watched">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="action-btn watching-btn" onclick="addToList('watching', ${item.id}, '${item.media_type}', ${itemData})" title="Currently Watching">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="action-btn watchlist-btn" onclick="addToList('watchlist', ${item.id}, '${item.media_type}', ${itemData})" title="Add to Watchlist">
                        <i class="fas fa-bookmark"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    if (clearGrid) {
        grid.innerHTML = html;
    } else {
        grid.innerHTML += html;
    }
    
    // Update Load More button visibility
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    if (endIndex >= displayedResults.length) {
        loadMoreContainer.style.display = 'none';
    } else {
        loadMoreContainer.style.display = 'flex';
        loadMoreBtn.classList.remove('loading');
        loadMoreBtn.innerHTML = `
            <i class="fas fa-chevron-down"></i>
            <span>Load More</span>
            <i class="fas fa-chevron-down"></i>
        `;
    }
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
        
        // Get poster size based on settings
        const settings = window.userSettings || JSON.parse(localStorage.getItem('movietrack_settings') || '{}');
        const quality = settings.posterQuality || 'medium';
        let posterSize = 'w342';
        if (quality === 'low') posterSize = 'w185';
        else if (quality === 'high') posterSize = 'w780';
        
        const title = data.title || data.name;
        const year = (data.release_date || data.first_air_date || '').substring(0, 4);
        const rating = data.vote_average?.toFixed(1) || 'N/A';
        const overview = data.overview || 'No description available';
        const poster = data.poster_path 
            ? `https://image.tmdb.org/t/p/${posterSize}${data.poster_path}`
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
    
    console.log('Initializing sidebar...', { hamburgerBtn, sidebar, sidebarOverlay }); // Debug
    
    if (hamburgerBtn && sidebar && sidebarOverlay) {
        hamburgerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Hamburger clicked - opening sidebar'); // Debug
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
    } else {
        console.error('Sidebar elements not found:', { hamburgerBtn, sidebar, sidebarOverlay });
    }
    
    const closeSidebar = () => {
        if (sidebar) sidebar.classList.remove('active');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    };
    
    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', closeSidebar);
    }
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }
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

// Initialize Load More button
function initLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', handleLoadMore);
    }
}

// Handle Load More click
function handleLoadMore() {
    if (isLoading) return;
    
    isLoading = true;
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    // Show loading state
    loadMoreBtn.classList.add('loading');
    loadMoreBtn.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i>
        <span>Loading...</span>
        <i class="fas fa-spinner fa-spin"></i>
    `;
    
    // Simulate a small delay for better UX
    setTimeout(() => {
        currentPage++;
        renderPage(currentPage, false);
        isLoading = false;
        
        // Smooth scroll to new content
        const grid = document.getElementById('categoriesGrid');
        const cards = grid.querySelectorAll('.movie-card');
        const lastCardBeforeLoad = cards[cards.length - ITEMS_PER_PAGE - 1];
        if (lastCardBeforeLoad) {
            setTimeout(() => {
                lastCardBeforeLoad.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }, 500);
}

// Add to List functionality (make it globally accessible)
window.addToList = async function(listType, tmdbId, mediaType, itemDataStr) {
    console.log('addToList called with:', { listType, tmdbId, mediaType, itemDataStr });
    
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            showNotification('Please login to add movies to your list', 'error');
            return;
        }
        
        // Parse the item data (it comes as a string with &quot; instead of ")
        let item;
        if (typeof itemDataStr === 'string') {
            item = JSON.parse(itemDataStr.replace(/&quot;/g, '"'));
        } else {
            item = itemDataStr;
        }
        
        console.log('Parsed item data:', item);
        
        // Show loading state on button
        const clickedButton = event.target.closest('.action-btn');
        const buttons = event.target.closest('.action-buttons').querySelectorAll('.action-btn');
        buttons.forEach(btn => btn.disabled = true);
        
        // Show loading notification
        showNotification('Fetching movie details...', 'info');
        
        // Fetch full movie details from TMDB
        const endpoint = mediaType === 'movie' ? 'movie' : 'tv';
        const tmdbResponse = await fetch(
            `https://api.themoviedb.org/3/${endpoint}/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits`
        );
        
        if (!tmdbResponse.ok) {
            throw new Error('Failed to fetch movie details from TMDB');
        }
        
        const tmdbData = await tmdbResponse.json();
        console.log('TMDB full data:', tmdbData);
        
        // Extract detailed information
        const director = tmdbData.credits?.crew?.find(person => person.job === 'Director')?.name || 'Unknown';
        const cast = tmdbData.credits?.cast?.slice(0, 5).map(actor => actor.name) || [];
        const genres = tmdbData.genres?.map(g => g.name).join(', ') || 'General';
        const tmdbRating = tmdbData.vote_average || 0;
        
        // Get season details for TV shows
        let seasonDetails = [];
        if (mediaType === 'tv' && tmdbData.seasons) {
            seasonDetails = tmdbData.seasons
                .filter(season => season.season_number > 0) // Skip specials
                .map(season => ({
                    seasonNumber: season.season_number,
                    episodeCount: season.episode_count
                }));
        }
        
        // Prepare comprehensive movie data
        
        // Get poster size based on settings
        const settings = window.userSettings || JSON.parse(localStorage.getItem('movietrack_settings') || '{}');
        const quality = settings.posterQuality || 'medium';
        let posterSize = 'w342';
        if (quality === 'low') posterSize = 'w185';
        else if (quality === 'high') posterSize = 'w780';
        
        const movieData = {
            type: mediaType, // 'movie' or 'tv'
            title: tmdbData.title || tmdbData.name,
            year: parseInt((tmdbData.release_date || tmdbData.first_air_date || '').substring(0, 4)) || new Date().getFullYear(),
            status: listType, // 'watched', 'watching', or 'watchlist'
            rating: 0, // User hasn't rated it yet
            genre: genres,
            poster: tmdbData.poster_path ? `https://image.tmdb.org/t/p/${posterSize}${tmdbData.poster_path}` : item.poster,
            backdrop: tmdbData.backdrop_path ? `https://image.tmdb.org/t/p/original${tmdbData.backdrop_path}` : null,
            tmdbId: tmdbId,
            imdbRating: tmdbRating,
            plot: tmdbData.overview || 'No overview available',
            runtime: tmdbData.runtime || null,
            director: director,
            cast: cast,
            // TV Show specific fields
            numberOfSeasons: tmdbData.number_of_seasons || null,
            numberOfEpisodes: tmdbData.number_of_episodes || null,
            seasonDetails: seasonDetails.length > 0 ? seasonDetails : null
        };
        
        console.log('Sending movie data:', movieData);
        console.log('API URL:', API_URL);
        
        const response = await fetch(`${API_URL}/api/movies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(movieData)
        });
        
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (response.ok) {
            // Show success notification
            showNotification(`Added to ${listType}!`, 'success');
            
            // Add visual feedback
            if (clickedButton) {
                clickedButton.classList.add('added');
                setTimeout(() => {
                    clickedButton.classList.remove('added');
                }, 2000);
            }
        } else {
            showNotification(data.message || `Failed to add to ${listType}`, 'error');
        }
        
        // Re-enable buttons
        buttons.forEach(btn => btn.disabled = false);
        
    } catch (error) {
        console.error('Error adding to list:', error);
        showNotification('Failed to add to list. Please try again.', 'error');
        
        // Re-enable buttons on error
        if (event && event.target) {
            const buttons = event.target.closest('.action-buttons')?.querySelectorAll('.action-btn');
            if (buttons) {
                buttons.forEach(btn => btn.disabled = false);
            }
        }
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
