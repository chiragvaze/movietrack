// Enhanced Dashboard with Search, Edit, TMDB Integration
// TMDB API Key
const TMDB_API_KEY = '409d37969fa9cdbc46f0baf72ff9c6d2';

/**
 * Displays a toast notification.
 * @param {string} message - The message to display.
 * @param {string} [type='success'] - The type of toast (success, error, info).
 */
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const iconClass = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        info: 'fa-info-circle'
    }[type];

    toast.innerHTML = `<i class="fas ${iconClass}"></i> ${message}`;
    
    container.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    // Animate out and remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => toast.remove());
    }, 3000);
}

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
let currentTypeFilter = null;
let searchQuery = '';
let selectedGenre = null;
let currentSort = 'title-asc'; // Default sort

/**
 * Custom confirmation dialog
 */
function showConfirm(title, message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        const titleEl = document.getElementById('confirmModalTitle');
        const messageEl = document.getElementById('confirmModalMessage');
        const yesBtn = document.getElementById('confirmModalYes');
        const noBtn = document.getElementById('confirmModalNo');
        
        titleEl.textContent = title;
        messageEl.textContent = message;
        modal.classList.add('show');
        
        const handleYes = () => {
            modal.classList.remove('show');
            yesBtn.removeEventListener('click', handleYes);
            noBtn.removeEventListener('click', handleNo);
            resolve(true);
        };
        
        const handleNo = () => {
            modal.classList.remove('show');
            yesBtn.removeEventListener('click', handleYes);
            noBtn.removeEventListener('click', handleNo);
            resolve(false);
        };
        
        yesBtn.addEventListener('click', handleYes);
        noBtn.addEventListener('click', handleNo);
    });
}

/**
 * Sort movies based on selected criteria
 */
function sortMovies(moviesToSort) {
    const sorted = [...moviesToSort];
    
    switch (currentSort) {
        case 'title-asc':
            sorted.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'title-desc':
            sorted.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case 'year-desc':
            sorted.sort((a, b) => (b.year || 0) - (a.year || 0));
            break;
        case 'year-asc':
            sorted.sort((a, b) => (a.year || 0) - (b.year || 0));
            break;
        case 'rating-desc':
            sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
        case 'rating-asc':
            sorted.sort((a, b) => (a.rating || 0) - (b.rating || 0));
            break;
        case 'date-desc':
            sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            break;
        default:
            sorted.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    return sorted;
}


/**
 * Renders skeleton loaders for the movie cards.
 */
function renderSkeletonLoader() {
    const container = document.getElementById('moviesContainer');
    if (!container) return;
    
    let skeletons = '';
    for (let i = 0; i < 6; i++) {
        skeletons += `
            <div class="movie-card skeleton">
                <div class="movie-poster-skeleton"></div>
                <div class="movie-details">
                    <div class="skeleton-text"></div>
                    <div class="skeleton-text skeleton-text-short"></div>
                    <div class="skeleton-button"></div>
                </div>
            </div>
        `;
    }
    container.innerHTML = skeletons;
}

// Load movies
async function loadMovies() {
    renderSkeletonLoader();
    try {
        const response = await API.getMovies();
        if (response.success) {
            movies = response.movies;
            console.log('🎬 Loaded movies:', movies);
            console.log('📊 Movies with posters:', movies.filter(m => m.poster).length);
            console.log('📊 Movies without posters:', movies.filter(m => !m.poster).length);
            updateStats();
            renderMovies();
            loadRecommendations(); // Load recommendations after movies are loaded
        }
    } catch (error) {
        console.error('Error loading movies:', error);
        showToast('Failed to load movies', 'error');
    }
}

// Update stats
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

// Load personalized recommendations
async function loadRecommendations() {
    const recommendationsSection = document.getElementById('recommendationsSection');
    const recommendationsCarousel = document.getElementById('recommendationsCarousel');
    
    // Check if elements exist
    if (!recommendationsSection || !recommendationsCarousel) {
        console.log('Recommendations elements not found');
        return;
    }
    
    // Get user's highest-rated content with TMDB IDs
    const highestRated = movies
        .filter(m => m.rating >= 4 && m.tmdbId) // Only 4+ star rated items with TMDB ID
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5); // Top 5 highest rated
    
    console.log('🎯 Highest rated items for recommendations:', highestRated.map(m => ({
        title: m.title,
        type: m.type,
        rating: m.rating,
        tmdbId: m.tmdbId
    })));
    
    if (highestRated.length === 0) {
        recommendationsSection.style.display = 'none';
        return;
    }
    
    try {
        // Fetch recommendations for each highly-rated item
        const allRecommendations = [];
        
        for (const item of highestRated) {
            let recs;
            console.log(`🔍 Fetching recommendations for: ${item.title} (${item.type})`);
            if (item.type === 'tv') {
                recs = await TMDB.getTVRecommendations(item.tmdbId, 5);
            } else {
                recs = await TMDB.getMovieRecommendations(item.tmdbId, 5);
            }
            console.log(`✅ Got ${recs.length} recommendations for ${item.title}`);
            allRecommendations.push(...recs);
        }
        
        console.log(`📊 Total recommendations before filtering: ${allRecommendations.length}`);
        console.log('📊 Recommendation types:', allRecommendations.reduce((acc, rec) => {
            acc[rec.type] = (acc[rec.type] || 0) + 1;
            return acc;
        }, {}));
        
        // Remove duplicates and items already in user's collection
        const uniqueRecommendations = allRecommendations
            .filter((rec, index, self) => 
                index === self.findIndex(r => r.tmdbId === rec.tmdbId)
            )
            .filter(rec => 
                !movies.some(m => m.tmdbId === rec.tmdbId)
            )
            .slice(0, 15); // Limit to 15 recommendations
        
        console.log(`✨ Final unique recommendations: ${uniqueRecommendations.length}`);
        console.log('✨ Final types:', uniqueRecommendations.reduce((acc, rec) => {
            acc[rec.type] = (acc[rec.type] || 0) + 1;
            return acc;
        }, {}));
        
        if (uniqueRecommendations.length === 0) {
            recommendationsSection.style.display = 'none';
            return;
        }
        
        // Display recommendations
        recommendationsSection.style.display = 'block';
        recommendationsCarousel.innerHTML = uniqueRecommendations.map(rec => `
            <div class="recommendation-card" onclick="openRecommendationDetails('${rec.tmdbId}', '${rec.type}')">
                <img 
                    src="${rec.poster || 'https://via.placeholder.com/200x300?text=No+Poster'}" 
                    alt="${rec.title}"
                    class="recommendation-poster"
                    onerror="this.src='https://via.placeholder.com/200x300?text=No+Poster'"
                >
                <div class="recommendation-info">
                    <div class="recommendation-title">${rec.title}</div>
                    <div class="recommendation-meta">
                        <span class="recommendation-year">${rec.year || 'N/A'}</span>
                        <span class="recommendation-rating">
                            <i class="fas fa-star"></i>
                            ${rec.rating.toFixed(1)}
                        </span>
                    </div>
                    <span class="recommendation-type-badge">
                        ${rec.type === 'tv' ? '📺 TV Show' : '🎬 Movie'}
                    </span>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading recommendations:', error);
        if (recommendationsSection) {
            recommendationsSection.style.display = 'none';
        }
    }
}

// Open recommendation details and allow quick add
async function openRecommendationDetails(tmdbId, type) {
    try {
        let details;
        if (type === 'tv') {
            details = await TMDB.getTVShowDetails(tmdbId);
        } else {
            details = await TMDB.getMovieDetails(tmdbId);
        }
        
        if (!details) {
            showNotification('Failed to load details', 'error');
            return;
        }
        
        // Show modal with quick add option
        showRecommendationModal(details);
        
    } catch (error) {
        console.error('Error loading recommendation details:', error);
        showNotification('Failed to load details', 'error');
    }
}

// Filter and render movies
function renderMovies() {
    const container = document.getElementById('moviesContainer');
    let filteredMovies = movies;
    
    // Filter by status
    if (currentFilter !== 'all') {
        filteredMovies = filteredMovies.filter(m => m.status === currentFilter);
    }
    
    // Filter by content type (only if a type is selected)
    if (currentTypeFilter) {
        filteredMovies = filteredMovies.filter(m => m.type === currentTypeFilter);
    }
    
    // Filter by search
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredMovies = filteredMovies.filter(m => 
            m.title.toLowerCase().includes(query) ||
            (m.director && m.director.toLowerCase().includes(query)) ||
            (m.genre && m.genre.some(g => g.toLowerCase().includes(query)))
        );
    }
    
    // Filter by genre
    if (selectedGenre) {
        filteredMovies = filteredMovies.filter(m => 
            m.genre && m.genre.includes(selectedGenre)
        );
    }
    
    // Apply sorting
    filteredMovies = sortMovies(filteredMovies);
    
    if (filteredMovies.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No movies found. Try adjusting your filters or add a new movie!</p></div>';
        return;
    }
    
    console.log('🎨 Rendering movies:', filteredMovies.map(m => ({
        title: m.title,
        hasPoster: !!m.poster,
        posterUrl: m.poster
    })));
    
    container.innerHTML = filteredMovies.map(movie => `
        <div class="movie-card" data-id="${movie._id}" onclick="showMovieDetails('${movie._id}')">
            ${movie.poster ? `<img src="${movie.poster}" alt="${movie.title}" class="movie-poster" onerror="console.error('❌ Failed to load poster:', '${movie.poster}')">` : `<div class="movie-poster-placeholder">${movie.type === 'tv' ? '📺' : '🎬'}</div>`}
            <div class="movie-content">
                <div class="movie-header">
                    <h4 class="movie-title">
                        ${movie.type === 'tv' ? '<span class="type-badge">📺</span>' : ''}
                        ${movie.title}
                    </h4>
                    <span class="movie-year">${movie.year || 'N/A'}</span>
                </div>
                <div class="movie-info">
                    <span class="movie-status status-${movie.status}">${movie.status}</span>
                    <span class="movie-rating">${movie.rating > 0 ? '⭐'.repeat(movie.rating) : 'Not rated'}</span>
                </div>
                ${movie.type === 'tv' && movie.currentSeason ? `
                    <div class="tv-progress">
                        <i class="fas fa-tv"></i> S${movie.currentSeason}${movie.currentEpisode ? ` E${movie.currentEpisode}` : ''}
                        ${movie.numberOfSeasons ? ` (${movie.numberOfSeasons} seasons)` : ''}
                    </div>
                ` : ''}
                ${movie.genre && movie.genre.length > 0 ? `
                    <div class="movie-genres">
                        ${movie.genre.slice(0, 3).map(g => `<span class="genre-badge">${g}</span>`).join('')}
                    </div>
                ` : ''}
                ${movie.watchedDate && movie.status === 'watched' ? `
                    <div class="watched-date">
                        <i class="fas fa-calendar"></i> Watched: ${new Date(movie.watchedDate).toLocaleDateString()}
                    </div>
                ` : ''}
                ${movie.type === 'tv' && movie.status === 'watching' && movie.currentEpisode ? `
                    <div class="episode-tracker" onclick="event.stopPropagation()">
                        <button class="btn-episode" onclick="updateEpisode('${movie._id}', ${movie.currentSeason}, ${movie.currentEpisode}, ${movie.numberOfEpisodes || 0})" title="Next Episode">
                            <i class="fas fa-forward"></i> Next Episode
                        </button>
                    </div>
                ` : ''}
                <div class="movie-actions" onclick="event.stopPropagation()">
                    <button class="btn-icon" onclick="editMovie('${movie._id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="deleteMovie('${movie._id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Search functionality
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const clearSearchBtn = document.getElementById('clearSearch');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            
            // Sync with sidebar search input
            const sidebarSearchInput = document.getElementById('sidebarSearchInput');
            if (sidebarSearchInput) {
                sidebarSearchInput.value = searchQuery;
            }
            
            if (clearSearchBtn) {
                clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
            }
            renderMovies();
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            searchQuery = searchInput.value;
            
            // Sync with sidebar search input
            const sidebarSearchInput = document.getElementById('sidebarSearchInput');
            if (sidebarSearchInput) {
                sidebarSearchInput.value = searchQuery;
            }
            
            renderMovies();
        });
    }
    
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchQuery = '';
            
            // Clear sidebar search too
            const sidebarSearchInput = document.getElementById('sidebarSearchInput');
            if (sidebarSearchInput) {
                sidebarSearchInput.value = '';
            }
            
            clearSearchBtn.style.display = 'none';
            renderMovies();
        });
    }
}

// TMDB Movie/TV Search (for add form)
let tmdbSearchTimeout;
let currentTMDBResults = [];
let currentContentType = 'movie';

function initTMDBSearch() {
    const titleInput = document.getElementById('movieTitle');
    const contentTypeSelect = document.getElementById('contentType');
    const tmdbResults = document.createElement('div');
    tmdbResults.id = 'tmdbResults';
    tmdbResults.className = 'tmdb-results';
    titleInput.parentNode.appendChild(tmdbResults);
    
    // Update content type when selector changes
    contentTypeSelect.addEventListener('change', (e) => {
        currentContentType = e.target.value;
        tmdbResults.innerHTML = '';
        tmdbResults.style.display = 'none';
        titleInput.value = '';
        titleInput.placeholder = currentContentType === 'movie' ? 'Movie Title' : 'TV Show Title';
    });
    
    titleInput.addEventListener('input', (e) => {
        clearTimeout(tmdbSearchTimeout);
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            tmdbResults.innerHTML = '';
            tmdbResults.style.display = 'none';
            return;
        }
        
        tmdbSearchTimeout = setTimeout(async () => {
            const results = currentContentType === 'movie' 
                ? await TMDB.searchMovies(query)
                : await TMDB.searchTVShows(query);
            currentTMDBResults = results.results || [];
            displayTMDBResults(currentTMDBResults, tmdbResults);
        }, 500);
    });
}

function displayTMDBResults(results, container) {
    if (results.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    const isTV = currentContentType === 'tv';
    
    container.innerHTML = results.slice(0, 5).map((item, index) => {
        const title = isTV ? item.name : item.title;
        const date = isTV ? item.first_air_date : item.release_date;
        const year = date ? new Date(date).getFullYear() : 'N/A';
        const icon = isTV ? '📺' : '🎬';
        
        return `
            <div class="tmdb-result-item" onclick="selectTMDBMovie(${index})">
                <span class="tmdb-title">${icon} ${title}</span>
                <span class="tmdb-year">(${year})</span>
            </div>
        `;
    }).join('');
    container.style.display = 'block';
}

async function selectTMDBMovie(index) {
    const selectedItem = currentTMDBResults[index];
    console.log('Selected from TMDB:', selectedItem);
    
    const isTV = currentContentType === 'tv';
    const details = isTV 
        ? await TMDB.getTVShowDetails(selectedItem.id)
        : await TMDB.getMovieDetails(selectedItem.id);
    
    console.log(`${isTV ? 'TV Show' : 'Movie'} details from TMDB:`, details);
    
    if (details) {
        document.getElementById('movieTitle').value = details.title;
        document.getElementById('movieYear').value = details.year || '';
        document.getElementById('tmdbResults').style.display = 'none';
        
        // Show TV show fields if it's a TV show
        const tvShowFields = document.getElementById('tvShowFields');
        if (isTV && tvShowFields) {
            tvShowFields.style.display = 'block';
        }
        
        // Store TMDB data for when form is submitted
        window.selectedTMDBData = details;
        console.log('Stored TMDB data:', window.selectedTMDBData);
    }
}

// Add movie/TV form
const addMovieForm = document.getElementById('addMovieForm');
if (addMovieForm) {
    // Show/hide watched date field based on status
    const contentTypeSelect = document.getElementById('contentType');
    const statusSelect = document.getElementById('movieStatus');
    const watchedDateContainer = document.getElementById('watchedDateContainer');
    const watchedDateInput = document.getElementById('watchedDate');
    const tvShowFields = document.getElementById('tvShowFields');
    
    // Set default date to today
    if (watchedDateInput) {
        watchedDateInput.value = new Date().toISOString().split('T')[0];
    }
    
    // Function to update status options based on content type
    function updateStatusOptions(isTV) {
        const currentStatus = statusSelect.value;
        
        if (isTV) {
            // For TV shows: show Watched, Watching, Watchlist
            statusSelect.innerHTML = `
                <option value="">Select Status</option>
                <option value="watched">Watched</option>
                <option value="watching">Watching</option>
                <option value="watchlist">Watchlist</option>
            `;
        } else {
            // For movies: show only Watched, Watchlist (no Watching)
            statusSelect.innerHTML = `
                <option value="">Select Status</option>
                <option value="watched">Watched</option>
                <option value="watchlist">Watchlist</option>
            `;
        }
        
        // Restore previous selection if it's still valid
        if (currentStatus && Array.from(statusSelect.options).some(opt => opt.value === currentStatus)) {
            statusSelect.value = currentStatus;
        }
    }
    
    // Initialize with movie options (default)
    updateStatusOptions(false);
    
    // Show/hide TV show fields based on content type
    contentTypeSelect.addEventListener('change', (e) => {
        const isTV = e.target.value === 'tv';
        
        // Update status options
        updateStatusOptions(isTV);
        
        // Show/hide TV show fields
        if (isTV && !window.selectedTMDBData) {
            tvShowFields.style.display = 'block';
        } else if (!isTV) {
            tvShowFields.style.display = 'none';
        }
        
        // Hide watched date when switching types
        watchedDateContainer.style.display = 'none';
    });
    
    statusSelect.addEventListener('change', (e) => {
        if (e.target.value === 'watched') {
            watchedDateContainer.style.display = 'block';
            // Set default date when switching to watched
            if (!watchedDateInput.value) {
                watchedDateInput.value = new Date().toISOString().split('T')[0];
            }
        } else {
            watchedDateContainer.style.display = 'none';
        }
    });
    
    addMovieForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const contentType = document.getElementById('contentType').value;
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
            const movieData = {
                type: contentType,
                title,
                year: year || new Date().getFullYear(),
                status,
                rating
            };
            
            // Add TV show specific fields
            if (contentType === 'tv') {
                const currentSeason = document.getElementById('currentSeason').value;
                const currentEpisode = document.getElementById('currentEpisode').value;
                if (currentSeason) movieData.currentSeason = parseInt(currentSeason);
                if (currentEpisode) movieData.currentEpisode = parseInt(currentEpisode);
            }
            
            // Add watched date if status is watched
            if (status === 'watched') {
                const watchedDate = watchedDateInput.value;
                movieData.watchedDate = watchedDate ? new Date(watchedDate) : new Date();
            } else {
                movieData.watchedDate = null;
            }
            
            // Include TMDB data if available
            if (window.selectedTMDBData) {
                console.log('🎬 Adding TMDB data to movie:', window.selectedTMDBData);
                Object.assign(movieData, window.selectedTMDBData);
                window.selectedTMDBData = null;
            } else {
                console.log('⚠️ No TMDB data selected - movie will have no poster');
            }
            
            console.log('📤 Sending movie data to API:', movieData);
            const response = await API.addMovie(movieData);
            console.log('📥 API Response:', response);
            
            if (response.success) {
                addMovieForm.reset();
                watchedDateContainer.style.display = 'none';
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

// Edit movie
function editMovie(movieId) {
    const movie = movies.find(m => m._id === movieId);
    if (!movie) return;
    
    const modal = createEditModal(movie);
    document.body.appendChild(modal);
}

function createEditModal(movie) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    // Format date for input (YYYY-MM-DD)
    const formatDateForInput = (date) => {
        if (!date) return new Date().toISOString().split('T')[0];
        return new Date(date).toISOString().split('T')[0];
    };
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2><i class="fas fa-edit"></i> Edit Movie</h2>
            <form id="editMovieForm">
                <input type="text" id="editTitle" value="${movie.title}" placeholder="Movie Title" required>
                <input type="number" id="editYear" value="${movie.year || ''}" placeholder="Year" min="1900" max="2030">
                <select id="editStatus" required>
                    <option value="watched" ${movie.status === 'watched' ? 'selected' : ''}>Watched</option>
                    <option value="watchlist" ${movie.status === 'watchlist' ? 'selected' : ''}>Watchlist</option>
                </select>
                <select id="editRating">
                    <option value="0" ${movie.rating === 0 ? 'selected' : ''}>No Rating</option>
                    <option value="5" ${movie.rating === 5 ? 'selected' : ''}>⭐⭐⭐⭐⭐</option>
                    <option value="4" ${movie.rating === 4 ? 'selected' : ''}>⭐⭐⭐⭐</option>
                    <option value="3" ${movie.rating === 3 ? 'selected' : ''}>⭐⭐⭐</option>
                    <option value="2" ${movie.rating === 2 ? 'selected' : ''}>⭐⭐</option>
                    <option value="1" ${movie.rating === 1 ? 'selected' : ''}>⭐</option>
                </select>
                <div id="editWatchedDateContainer" style="display: ${movie.status === 'watched' ? 'block' : 'none'}">
                    <label for="editWatchedDate" style="display: flex; align-items: center; gap: 8px; color: #ffffff; margin-bottom: 8px; font-size: 14px;">
                        <i class="fas fa-calendar"></i> Watched Date
                    </label>
                    <input type="date" id="editWatchedDate" value="${formatDateForInput(movie.watchedDate)}" max="${new Date().toISOString().split('T')[0]}">
                </div>
                <button type="submit" class="btn btn-primary">Update Movie</button>
            </form>
        </div>
    `;
    
    // Show/hide watched date based on status
    const statusSelect = modal.querySelector('#editStatus');
    const watchedDateContainer = modal.querySelector('#editWatchedDateContainer');
    
    statusSelect.addEventListener('change', (e) => {
        if (e.target.value === 'watched') {
            watchedDateContainer.style.display = 'block';
        } else {
            watchedDateContainer.style.display = 'none';
        }
    });
    
    modal.querySelector('#editMovieForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const status = document.getElementById('editStatus').value;
        const updateData = {
            title: document.getElementById('editTitle').value,
            year: document.getElementById('editYear').value,
            status: status,
            rating: parseInt(document.getElementById('editRating').value)
        };
        
        // Add watched date if status is watched
        if (status === 'watched') {
            const watchedDate = document.getElementById('editWatchedDate').value;
            updateData.watchedDate = watchedDate ? new Date(watchedDate) : new Date();
        } else {
            updateData.watchedDate = null;
        }
        
        await updateMovie(movie._id, updateData);
        modal.remove();
    });
    
    return modal;
}

async function updateMovie(movieId, data) {
    try {
        const response = await API.updateMovie(movieId, data);
        if (response.success) {
            await loadMovies();
            showNotification('Movie updated successfully!');
        }
    } catch (error) {
        showNotification(error.message || 'Failed to update movie', 'error');
    }
}

// Show movie details
function showMovieDetails(movieId) {
    const movie = movies.find(m => m._id === movieId);
    if (!movie) return;
    
    const modal = createDetailsModal(movie);
    document.body.appendChild(modal);
}

function createDetailsModal(movie) {
    const modal = document.createElement('div');
    modal.className = 'modal modal-large';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            ${movie.backdrop ? `<img src="${movie.backdrop}" class="modal-backdrop">` : ''}
            <div class="modal-body">
                <div class="movie-details-grid">
                    ${movie.poster ? `<img src="${movie.poster}" class="details-poster">` : '<div class="details-poster-placeholder">🎬</div>'}
                    <div class="details-info">
                        <h2>${movie.title}</h2>
                        <p class="details-meta">
                            ${movie.year || 'N/A'} • 
                            ${movie.runtime ? `${movie.runtime} min` : 'Runtime unknown'} • 
                            ${movie.status === 'watched' ? '✓ Watched' : 'Watchlist'}
                        </p>
                        ${movie.genre && movie.genre.length > 0 ? `
                            <div class="details-genres">
                                ${movie.genre.map(g => `<span class="genre-badge">${g}</span>`).join('')}
                            </div>
                        ` : ''}
                        <div class="details-rating">
                            <span>Your Rating: ${movie.rating > 0 ? '⭐'.repeat(movie.rating) : 'Not rated'}</span>
                            ${movie.imdbRating ? `<span>TMDB: ${movie.imdbRating.toFixed(1)}/10</span>` : ''}
                        </div>
                        ${movie.plot ? `<p class="details-plot">${movie.plot}</p>` : ''}
                        ${movie.director ? `<p><strong>Director:</strong> ${movie.director}</p>` : ''}
                        ${movie.cast && movie.cast.length > 0 ? `<p><strong>Cast:</strong> ${movie.cast.join(', ')}</p>` : ''}
                        ${movie.watchedDate ? `<p><strong>Watched on:</strong> ${new Date(movie.watchedDate).toLocaleDateString()}</p>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    return modal;
}

// Show recommendation modal with quick add option
function showRecommendationModal(details) {
    const modal = document.createElement('div');
    modal.className = 'modal modal-large';
    
    const posterPlaceholder = details.type === 'tv' ? '📺' : '🎬';
    const posterHtml = details.poster 
        ? `<img src="${details.poster}" class="details-poster">` 
        : `<div class="details-poster-placeholder">${posterPlaceholder}</div>`;
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            ${details.backdrop ? `<img src="${details.backdrop}" class="modal-backdrop">` : ''}
            <div class="modal-body">
                <div class="movie-details-grid">
                    ${posterHtml}
                    <div class="details-info">
                        <h2>${details.title}</h2>
                        <span class="recommendation-type-badge">${details.type === 'tv' ? '📺 TV Show' : '🎬 Movie'}</span>
                        <p class="details-meta">
                            ${details.year || 'N/A'} • 
                            ${details.runtime ? `${details.runtime} min` : ''} 
                            ${details.numberOfSeasons ? `${details.numberOfSeasons} Seasons` : ''}
                        </p>
                        ${details.genre && details.genre.length > 0 ? `
                            <div class="details-genres">
                                ${details.genre.map(g => `<span class="genre-badge">${g}</span>`).join('')}
                            </div>
                        ` : ''}
                        <div class="details-rating">
                            ${details.imdbRating ? `<span>TMDB Rating: ${details.imdbRating.toFixed(1)}/10 ⭐</span>` : ''}
                        </div>
                        ${details.plot ? `<p class="details-plot">${details.plot}</p>` : ''}
                        ${details.director ? `<p><strong>Director:</strong> ${details.director}</p>` : ''}
                        ${details.cast && details.cast.length > 0 ? `<p><strong>Cast:</strong> ${details.cast.join(', ')}</p>` : ''}
                        
                        <div class="quick-add-section" style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
                            <h4 style="margin-bottom: 1rem;">Quick Add to Your Collection</h4>
                            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                                <button class="btn btn-primary" onclick="quickAddToWatchlist('${details.tmdbId}', '${details.type}')">
                                    <i class="fas fa-clock"></i> Add to Watchlist
                                </button>
                                <button class="btn btn-secondary" onclick="quickAddAsWatched('${details.tmdbId}', '${details.type}')">
                                    <i class="fas fa-check"></i> Mark as Watched
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Quick add to watchlist
async function quickAddToWatchlist(tmdbId, type) {
    try {
        let details;
        if (type === 'tv') {
            details = await TMDB.getTVShowDetails(tmdbId);
        } else {
            details = await TMDB.getMovieDetails(tmdbId);
        }
        
        const movieData = {
            ...details,
            status: 'watchlist',
            rating: 0
        };
        
        const response = await API.addMovie(movieData);
        if (response.success) {
            await loadMovies();
            document.querySelector('.modal')?.remove();
            showNotification(`${details.title} added to watchlist!`);
        }
    } catch (error) {
        showNotification(error.message || 'Failed to add to watchlist', 'error');
    }
}

// Quick add as watched
async function quickAddAsWatched(tmdbId, type) {
    try {
        let details;
        if (type === 'tv') {
            details = await TMDB.getTVShowDetails(tmdbId);
        } else {
            details = await TMDB.getMovieDetails(tmdbId);
        }
        
        const movieData = {
            ...details,
            status: 'watched',
            rating: 5,
            watchedDate: new Date().toISOString().split('T')[0]
        };
        
        const response = await API.addMovie(movieData);
        if (response.success) {
            await loadMovies();
            document.querySelector('.modal')?.remove();
            showNotification(`${details.title} added as watched!`);
        }
    } catch (error) {
        showNotification(error.message || 'Failed to add as watched', 'error');
    }
}

// Delete movie
async function deleteMovie(movieId) {
    const movie = movies.find(m => m._id === movieId);
    const movieTitle = movie ? movie.title : 'this movie';
    
    const confirmed = await showConfirm(
        'Delete Movie',
        `Are you sure you want to delete "${movieTitle}"? This action cannot be undone.`
    );
    
    if (confirmed) {
        try {
            const response = await API.deleteMovie(movieId);
            if (response.success) {
                await loadMovies();
                showToast(`"${movieTitle}" deleted successfully`, 'info');
            }
        } catch (error) {
            showToast(error.message || 'Failed to delete movie', 'error');
        }
    }
}

// Update episode for TV shows with smart season progression
async function updateEpisode(movieId, currentSeason, currentEpisode, totalEpisodes) {
    const movie = movies.find(m => m._id === movieId);
    if (!movie) return;
    
    try {
        let newEpisode = currentEpisode + 1;
        let newSeason = currentSeason;
        let newStatus = movie.status;
        let updateData = {};
        
        // Check if we have season details from TMDB
        if (movie.seasonDetails && movie.seasonDetails.length > 0) {
            const currentSeasonInfo = movie.seasonDetails.find(s => s.seasonNumber === currentSeason);
            
            if (currentSeasonInfo) {
                // Check if we've finished this season
                if (currentEpisode >= currentSeasonInfo.episodeCount) {
                    // Check if there's a next season
                    const nextSeasonInfo = movie.seasonDetails.find(s => s.seasonNumber === currentSeason + 1);
                    
                    if (nextSeasonInfo) {
                        // Move to next season
                        newSeason = currentSeason + 1;
                        newEpisode = 1;
                        showNotification(`🎉 Season ${currentSeason} completed! Moving to Season ${newSeason}`, 'success');
                    } else {
                        // This was the last season - mark as watched
                        newStatus = 'watched';
                        updateData.watchedDate = new Date();
                        showNotification(`🎊 Congratulations! You've finished "${movie.title}"! Moved to Watched.`, 'success');
                    }
                }
            }
        }
        
        updateData.currentSeason = newSeason;
        updateData.currentEpisode = newEpisode;
        updateData.status = newStatus;
        
        const response = await API.updateMovie(movieId, updateData);
        if (response.success) {
            await loadMovies();
            if (newStatus === 'watched') {
                // Already showed completion message
            } else if (newSeason > currentSeason) {
                // Already showed season completion message
            } else {
                showNotification(`Updated to S${newSeason} E${newEpisode}! 📺`);
            }
        }
    } catch (error) {
        showNotification(error.message || 'Failed to update episode', 'error');
    }
}

// Filter buttons
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderMovies();
    });
});

// Type Filter buttons (toggle behavior)
const typeFilterButtons = document.querySelectorAll('.type-filter-btn');
typeFilterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const clickedType = btn.dataset.type;
        
        // If clicking the same button, toggle it off
        if (currentTypeFilter === clickedType) {
            btn.classList.remove('active');
            currentTypeFilter = null;
        } else {
            // Remove active from all buttons and activate clicked one
            typeFilterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTypeFilter = clickedType;
        }
        
        renderMovies();
    });
});

// Notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.textContent = message;
    
    let bgColor = '#10b981'; // success - green
    if (type === 'error') bgColor = '#ef4444'; // error - red
    if (type === 'info') bgColor = '#3b82f6'; // info - blue
    
    notification.style.cssText = `position: fixed; top: 80px; right: 20px; background: ${bgColor}; color: white; padding: 1rem 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); z-index: 1000; animation: slideIn 0.3s ease;`;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } }
    .modal { display: block; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.8); }
    .modal-content { background-color: #1a1a1a; margin: 5% auto; padding: 20px; border: 1px solid #333; border-radius: 8px; width: 90%; max-width: 500px; }
    .modal-large .modal-content { max-width: 900px; }
    .close { color: #aaa; float: right; font-size: 28px; font-weight: bold; cursor: pointer; }
    .close:hover { color: #fff; }
    .tmdb-results { position: absolute; background: #1a1a1a; border: 1px solid #333; border-radius: 4px; width: 100%; max-height: 200px; overflow-y: auto; z-index: 100; }
    .tmdb-result-item { padding: 10px; cursor: pointer; border-bottom: 1px solid #333; }
    .tmdb-result-item:hover { background: #2a2a2a; }
    .movie-poster, .movie-poster-placeholder { width: 100%; height: 300px; object-fit: cover; border-radius: 8px 8px 0 0; }
    .movie-poster-placeholder { display: flex; align-items: center; justify-content: center; background: #2a2a2a; font-size: 48px; }
    .movie-genres { display: flex; flex-wrap: wrap; gap: 5px; margin: 10px 0; }
    .genre-badge { background: #e50914; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; }
    .watched-date { font-size: 0.875rem; color: #9ca3af; margin-top: 8px; }
    .btn-icon { background: none; border: none; color: #9ca3af; font-size: 18px; cursor: pointer; padding: 5px 10px; }
    .btn-icon:hover { color: #e50914; }
    .movie-card { cursor: pointer; transition: transform 0.2s; }
    .movie-card:hover { transform: translateY(-5px); }
`;
document.head.appendChild(style);

// Profile Modal
const profileBtn = document.getElementById('profileBtn');
const profileModal = document.getElementById('profileModal');

if (profileBtn) {
    profileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showProfileModal();
    });
}

function showProfileModal() {
    // Get user data from localStorage (stored as 'currentUser' during login)
    const user = JSON.parse(localStorage.getItem('currentUser'));
    
    if (user) {
        document.getElementById('profileName').textContent = user.name || 'User';
        document.getElementById('profileEmail').textContent = user.email || 'user@example.com';
    } else {
        // Fallback if user data not found
        document.getElementById('profileName').textContent = 'User';
        document.getElementById('profileEmail').textContent = 'user@example.com';
    }
    
    // Get stats
    const totalMovies = movies.length;
    const watchedCount = movies.filter(m => m.status === 'watched').length;
    const watchlistCount = movies.filter(m => m.status === 'watchlist').length;
    const avgRating = movies.length > 0 
        ? (movies.reduce((sum, m) => sum + (m.rating || 0), 0) / movies.length).toFixed(1)
        : '0.0';
    
    document.getElementById('profileTotalMovies').textContent = totalMovies;
    document.getElementById('profileWatchedCount').textContent = watchedCount;
    document.getElementById('profileWatchlistCount').textContent = watchlistCount;
    document.getElementById('profileAvgRating').textContent = avgRating;
    
    // Member since (from user creation date or fallback)
    if (user && user.createdAt) {
        const memberDate = new Date(user.createdAt);
        document.getElementById('profileMemberSince').textContent = memberDate.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        });
    } else {
        document.getElementById('profileMemberSince').textContent = new Date().toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        });
    }
    
    // Favorite genre (most common genre)
    const genreCounts = {};
    movies.forEach(movie => {
        if (movie.genre && Array.isArray(movie.genre)) {
            movie.genre.forEach(g => {
                genreCounts[g] = (genreCounts[g] || 0) + 1;
            });
        }
    });
    
    const favoriteGenre = Object.keys(genreCounts).length > 0
        ? Object.keys(genreCounts).reduce((a, b) => genreCounts[a] > genreCounts[b] ? a : b)
        : 'Not available';
    
    document.getElementById('profileFavoriteGenre').textContent = favoriteGenre;
    
    // Most watched type
    const movieCount = movies.filter(m => m.type === 'movie').length;
    const tvCount = movies.filter(m => m.type === 'tv').length;
    const mostWatched = movieCount > tvCount ? '🎬 Movies' : tvCount > movieCount ? '📺 TV Shows' : '🎬 Movies & 📺 TV Shows';
    
    document.getElementById('profileMostWatched').textContent = mostWatched;
    
    // Show modal
    profileModal.style.display = 'block';
}

// Edit username functionality
const editNameBtn = document.getElementById('editNameBtn');
const editNameSection = document.getElementById('editNameSection');
const newUserNameInput = document.getElementById('newUserName');
const saveNameBtn = document.getElementById('saveNameBtn');
const cancelNameBtn = document.getElementById('cancelNameBtn');

if (editNameBtn) {
    editNameBtn.addEventListener('click', () => {
        const currentName = document.getElementById('profileName').textContent;
        newUserNameInput.value = currentName;
        editNameSection.style.display = 'block';
        newUserNameInput.focus();
    });
}

if (cancelNameBtn) {
    cancelNameBtn.addEventListener('click', () => {
        editNameSection.style.display = 'none';
        newUserNameInput.value = '';
    });
}

if (saveNameBtn) {
    saveNameBtn.addEventListener('click', async () => {
        const newName = newUserNameInput.value.trim();
        
        if (!newName || newName.length < 2) {
            showNotification('Name must be at least 2 characters', 'error');
            return;
        }
        
        try {
            const response = await API.updateUserProfile(newName);
            
            if (response.success) {
                // Update UI
                document.getElementById('profileName').textContent = newName;
                document.getElementById('userName').textContent = newName;
                
                // Update localStorage (use 'currentUser' key to match login storage)
                const user = JSON.parse(localStorage.getItem('currentUser'));
                if (user) {
                    user.name = newName;
                    localStorage.setItem('currentUser', JSON.stringify(user));
                }
                
                // Hide edit section
                editNameSection.style.display = 'none';
                newUserNameInput.value = '';
                
                showNotification('Username updated successfully!');
            }
        } catch (error) {
            showNotification(error.message || 'Failed to update username', 'error');
        }
    });
}

// Handle Enter key in username input
if (newUserNameInput) {
    newUserNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveNameBtn.click();
        }
    });
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target === profileModal) {
        profileModal.style.display = 'none';
    }
}

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            API.logout();
        }
    });
}

// ===== Theme Toggle Functionality =====
function initThemeToggle() {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = themeToggleBtn.querySelector('i');
    
    // Load saved theme preference or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme, themeIcon);
    
    // Theme toggle event listener
    themeToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme, themeIcon);
        
        showNotification(`Switched to ${newTheme} mode`, 'success');
    });
}

function updateThemeIcon(theme, iconElement) {
    if (theme === 'light') {
        iconElement.className = 'fas fa-sun'; // Sun icon for light mode
    } else {
        iconElement.className = 'fas fa-moon'; // Moon icon for dark mode
    }
}

// ===== View Mode Toggle Functionality =====
function initViewModeToggle() {
    const viewModeBtn = document.getElementById('viewModeBtn');
    const viewIcon = viewModeBtn.querySelector('i');
    const moviesGrid = document.querySelector('.movies-grid');
    
    // Load saved view mode preference or default to grid
    const savedViewMode = localStorage.getItem('viewMode') || 'grid';
    if (savedViewMode === 'list') {
        moviesGrid.classList.add('list-view');
        updateViewIcon('list', viewIcon);
    }
    
    // View mode toggle event listener
    viewModeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const isListView = moviesGrid.classList.contains('list-view');
        
        if (isListView) {
            moviesGrid.classList.remove('list-view');
            localStorage.setItem('viewMode', 'grid');
            updateViewIcon('grid', viewIcon);
            showNotification('Switched to Grid View', 'success');
        } else {
            moviesGrid.classList.add('list-view');
            localStorage.setItem('viewMode', 'list');
            updateViewIcon('list', viewIcon);
            showNotification('Switched to List View', 'success');
        }
    });
}

function updateViewIcon(viewMode, iconElement) {
    if (viewMode === 'list') {
        iconElement.className = 'fas fa-list'; // List icon for list view
    } else {
        iconElement.className = 'fas fa-th'; // Grid icon for grid view
    }
}

// ===== Sidebar Toggle Functionality =====
function initSidebar() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const comingSoonLinks = document.querySelectorAll('.coming-soon');
    const sidebarSearchInput = document.getElementById('sidebarSearchInput');
    const upcomingBtn = document.getElementById('sidebarUpcoming');
    const categoriesBtn = document.getElementById('sidebarCategories');
    
    // Open sidebar
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
    }
    
    // Close sidebar function
    const closeSidebar = () => {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    };
    
    // Close sidebar via close button
    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', closeSidebar);
    }
    
    // Close sidebar via overlay click
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }
    
    // Sidebar search functionality with TMDB
    let sidebarSearchTimeout;
    if (sidebarSearchInput) {
        const sidebarSearchResults = document.getElementById('sidebarSearchResults');
        console.log('✅ Sidebar search initialized');
        
        sidebarSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            console.log('🔍 Searching for:', query);
            
            // Clear previous timeout
            clearTimeout(sidebarSearchTimeout);
            
            if (query.length < 2) {
                sidebarSearchResults.style.display = 'none';
                return;
            }
            
            // Debounce search
            sidebarSearchTimeout = setTimeout(async () => {
                try {
                    console.log('📡 Fetching from TMDB...');
                    const response = await fetch(
                        `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
                    );
                    const data = await response.json();
                    console.log('📦 Results:', data.results?.length || 0);
                    
                    if (data.results && data.results.length > 0) {
                        displaySidebarSearchResults(data.results.slice(0, 5));
                    } else {
                        sidebarSearchResults.innerHTML = '<div class="tmdb-result-item">No results found</div>';
                        sidebarSearchResults.style.display = 'block';
                    }
                } catch (error) {
                    console.error('❌ Sidebar search error:', error);
                }
            }, 500);
        });
        
        // Close results when clicking outside
        document.addEventListener('click', (e) => {
            if (!sidebarSearchInput.contains(e.target) && !sidebarSearchResults.contains(e.target)) {
                sidebarSearchResults.style.display = 'none';
            }
        });
    } else {
        console.error('❌ sidebarSearchInput not found');
    }
    
    // Upcoming releases
    if (upcomingBtn) {
        upcomingBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            closeSidebar();
            showNotification('Loading upcoming releases...', 'info');
            
            try {
                const response = await fetch(`https://api.themoviedb.org/3/movie/upcoming?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
                const data = await response.json();
                
                // Show upcoming movies in a modal
                showUpcomingModal(data.results);
            } catch (error) {
                console.error('Error loading upcoming:', error);
                showNotification('Failed to load upcoming releases', 'error');
            }
        });
    }
    
    // Categories - Navigate to categories page
    if (categoriesBtn) {
        categoriesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeSidebar();
            // Navigate to categories page
            window.location.href = 'categories.html';
        });
    }
    
    // Coming soon message for sidebar links
    comingSoonLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const featureName = link.querySelector('span:not(.badge)').textContent;
            showNotification(`${featureName} - Coming Soon! 🚀`, 'info');
        });
    });
    
    // Close sidebar on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('active')) {
            closeSidebar();
        }
    });
}

// Show upcoming movies modal
function showUpcomingModal(movies) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    const upcomingHTML = movies.slice(0, 10).map(movie => `
        <div class="upcoming-item" onclick="openRecommendationDetails(${movie.id}, 'movie')">
            <img src="${movie.poster_path ? 'https://image.tmdb.org/t/p/w200' + movie.poster_path : ''}" 
                 alt="${movie.title}"
                 onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22300%22><rect fill=%22%232a2a2a%22 width=%22200%22 height=%22300%22/><text fill=%22%23666%22 x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 font-size=%2220%22>No Image</text></svg>'">
            <div class="upcoming-info">
                <h4>${movie.title}</h4>
                <p>Release: ${new Date(movie.release_date).toLocaleDateString()}</p>
                <p class="rating">⭐ ${movie.vote_average.toFixed(1)}</p>
            </div>
        </div>
    `).join('');
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
                <h2><i class="fas fa-clock"></i> Upcoming Movies</h2>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="upcoming-grid">
                ${upcomingHTML}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Show categories modal
function showCategoriesModal() {
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
        { id: 10770, name: 'TV Movie', icon: '📺' },
        { id: 53, name: 'Thriller', icon: '😰' },
        { id: 10752, name: 'War', icon: '⚔️' },
        { id: 37, name: 'Western', icon: '🤠' }
    ];
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    const categoriesHTML = genres.map(genre => `
        <div class="category-card" onclick="filterByGenre(${genre.id}, '${genre.name}')">
            <span class="category-icon">${genre.icon}</span>
            <span class="category-name">${genre.name}</span>
        </div>
    `).join('');
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h2><i class="fas fa-th-large"></i> Browse by Category</h2>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="categories-grid">
                ${categoriesHTML}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Filter by genre
window.filterByGenre = function(genreId, genreName) {
    // Close the modal
    document.querySelector('.modal')?.remove();
    
    selectedGenre = genreId;
    showNotification(`Filtering by: ${genreName}`, 'info');
    renderMovies();
}

// Display sidebar search results
function displaySidebarSearchResults(results) {
    const sidebarSearchResults = document.getElementById('sidebarSearchResults');
    
    sidebarSearchResults.innerHTML = results.map(item => {
        const title = item.title || item.name;
        const year = item.release_date || item.first_air_date;
        const type = item.media_type === 'movie' ? '🎬 Movie' : '📺 TV Show';
        const yearText = year ? `(${year.substring(0, 4)})` : '';
        
        return `
            <div class="tmdb-result-item" onclick="showSidebarMovieDetails(${item.id}, '${item.media_type}')">
                <strong>${title}</strong> ${yearText}
                <br>
                <small style="color: var(--primary-color);">${type}</small>
            </div>
        `;
    }).join('');
    
    sidebarSearchResults.style.display = 'block';
}

// Show movie details from sidebar search
window.showSidebarMovieDetails = async function(tmdbId, mediaType) {
    // Close sidebar
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
    
    // Hide search results
    const sidebarSearchResults = document.getElementById('sidebarSearchResults');
    sidebarSearchResults.style.display = 'none';
    
    // Clear search input
    const sidebarSearchInput = document.getElementById('sidebarSearchInput');
    sidebarSearchInput.value = '';
    
    // Show loading notification
    showNotification('Loading details...', 'info');
    
    try {
        const endpoint = mediaType === 'movie' ? 'movie' : 'tv';
        const response = await fetch(
            `https://api.themoviedb.org/3/${endpoint}/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits`
        );
        const data = await response.json();
        
        // Show movie details modal (use the existing recommendation details modal)
        openRecommendationDetails(tmdbId, mediaType);
    } catch (error) {
        console.error('Error loading movie details:', error);
        showNotification('Failed to load details', 'error');
    }
}

// Initialize
loadMovies();
initSearch();
initTMDBSearch();
initThemeToggle();
initViewModeToggle();
initSidebar();

// Make functions globally accessible
window.openRecommendationDetails = openRecommendationDetails;
window.quickAddToWatchlist = quickAddToWatchlist;
window.quickAddAsWatched = quickAddAsWatched;

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    // Back to Top Button
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (backToTopBtn) {
        window.onscroll = () => {
            if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        };
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Sort Dropdown
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderMovies();
            showToast('Sorted successfully', 'info');
        });
    }
    
    // Real-time Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchQuery = e.target.value.trim();
                renderMovies();
                
                const clearBtn = document.getElementById('clearSearch');
                if (clearBtn) {
                    clearBtn.style.display = searchQuery ? 'block' : 'none';
                }
            }, 300); // Debounce for 300ms
        });
    }
    
    // Clear Search Button
    const clearSearchBtn = document.getElementById('clearSearch');
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.value = '';
                searchQuery = '';
                renderMovies();
                clearSearchBtn.style.display = 'none';
            }
        });
    }
    
    // Analytics Sidebar Click
    const analyticsBtn = document.getElementById('sidebarAnalytics');
    if (analyticsBtn) {
        analyticsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openAnalytics();
            
            // Close sidebar on mobile
            const sidebar = document.querySelector('.sidebar');
            if (window.innerWidth <= 768 && sidebar) {
                sidebar.classList.remove('active');
            }
        });
    }
    
    // Close Analytics Modal
    const closeAnalyticsBtn = document.querySelector('.close-analytics');
    if (closeAnalyticsBtn) {
        closeAnalyticsBtn.addEventListener('click', closeAnalytics);
    }
    
    // Close on outside click
    const analyticsModal = document.getElementById('analyticsModal');
    if (analyticsModal) {
        analyticsModal.addEventListener('click', (e) => {
            if (e.target === analyticsModal) {
                closeAnalytics();
            }
        });
    }
});

/**
 * Opens the Analytics Modal and generates charts
 */
function openAnalytics() {
    const modal = document.getElementById('analyticsModal');
    if (!modal) return;
    
    modal.classList.add('show');
    generateAnalytics();
}

/**
 * Closes the Analytics Modal
 */
function closeAnalytics() {
    const modal = document.getElementById('analyticsModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

/**
 * Generates all analytics data and charts
 */
function generateAnalytics() {
    if (!movies || movies.length === 0) {
        // Show empty state
        document.getElementById('totalContent').textContent = '0';
        document.getElementById('totalWatchTime').textContent = '0h 0m';
        document.getElementById('avgRating').textContent = '0.0';
        document.getElementById('dayStreak').textContent = '0';
        return;
    }
    
    // Calculate stats
    const totalContent = movies.length;
    const totalWatchTime = calculateTotalWatchTime(movies);
    const avgRating = calculateAverageRating(movies);
    const dayStreak = calculateDayStreak(movies);
    
    // Update stat cards
    document.getElementById('totalContent').textContent = totalContent;
    document.getElementById('totalWatchTime').textContent = totalWatchTime;
    document.getElementById('avgRating').textContent = avgRating;
    document.getElementById('dayStreak').textContent = dayStreak;
    
    // Generate charts
    generateContentTypeChart(movies);
    generateGenreChart(movies);
    generateRatingChart(movies);
    generateActivityChart(movies);
    
    // Generate movie lists
    generateTopRatedList(movies);
    generateRecentList(movies);
}

/**
 * Calculates total watch time from movies
 */
function calculateTotalWatchTime(movies) {
    let totalMinutes = 0;
    movies.forEach(movie => {
        if (movie.type === 'movie' && movie.runtime) {
            totalMinutes += parseInt(movie.runtime) || 0;
        } else if (movie.type === 'series' && movie.seasons) {
            // Estimate: 45 min per episode
            const episodes = movie.seasons.reduce((sum, season) => sum + (season.episodes || 0), 0);
            totalMinutes += episodes * 45;
        }
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
}

/**
 * Calculates average rating
 */
function calculateAverageRating(movies) {
    const ratedMovies = movies.filter(m => m.personalRating);
    if (ratedMovies.length === 0) return '0.0';
    
    const sum = ratedMovies.reduce((sum, m) => sum + (parseFloat(m.personalRating) || 0), 0);
    return (sum / ratedMovies.length).toFixed(1);
}

/**
 * Calculates consecutive day streak
 */
function calculateDayStreak(movies) {
    if (movies.length === 0) return 0;
    
    const sortedDates = movies
        .map(m => new Date(m.dateAdded))
        .sort((a, b) => b - a);
    
    let streak = 1;
    let currentDate = new Date(sortedDates[0]);
    currentDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if most recent is today or yesterday
    const daysDiff = Math.floor((today - currentDate) / (1000 * 60 * 60 * 24));
    if (daysDiff > 1) return 0; // Streak broken
    
    for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i]);
        prevDate.setHours(0, 0, 0, 0);
        
        const diff = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
        
        if (diff === 1) {
            streak++;
            currentDate = prevDate;
        } else if (diff > 1) {
            break;
        }
    }
    
    return streak;
}

/**
 * Generates Content Type Pie Chart (Movies vs Series)
 */
function generateContentTypeChart(movies) {
    const ctx = document.getElementById('contentTypeChart');
    if (!ctx) return;
    
    const movieCount = movies.filter(m => m.type === 'movie').length;
    const seriesCount = movies.filter(m => m.type === 'series').length;
    
    // Destroy existing chart if exists
    if (window.contentTypeChartInstance) {
        window.contentTypeChartInstance.destroy();
    }
    
    window.contentTypeChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Movies', 'Series'],
            datasets: [{
                data: [movieCount, seriesCount],
                backgroundColor: ['#e50914', '#564d4d'],
                borderWidth: 2,
                borderColor: '#221f1f'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#e5e5e5', font: { size: 12 } }
                }
            }
        }
    });
}

/**
 * Generates Genre Bar Chart
 */
function generateGenreChart(movies) {
    const ctx = document.getElementById('genreChart');
    if (!ctx) return;
    
    const genreCounts = {};
    movies.forEach(movie => {
        if (movie.genres && Array.isArray(movie.genres)) {
            movie.genres.forEach(genre => {
                genreCounts[genre] = (genreCounts[genre] || 0) + 1;
            });
        }
    });
    
    // Get top 8 genres
    const sortedGenres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);
    
    const labels = sortedGenres.map(g => g[0]);
    const data = sortedGenres.map(g => g[1]);
    
    // Destroy existing chart if exists
    if (window.genreChartInstance) {
        window.genreChartInstance.destroy();
    }
    
    window.genreChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Titles',
                data: data,
                backgroundColor: '#e50914',
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#e5e5e5', stepSize: 1 },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: '#e5e5e5' },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

/**
 * Generates Rating Distribution Chart
 */
function generateRatingChart(movies) {
    const ctx = document.getElementById('ratingChart');
    if (!ctx) return;
    
    const ratingBuckets = { '0-2': 0, '2-4': 0, '4-6': 0, '6-8': 0, '8-10': 0 };
    
    movies.forEach(movie => {
        const rating = parseFloat(movie.personalRating);
        if (!rating) return;
        
        if (rating >= 0 && rating < 2) ratingBuckets['0-2']++;
        else if (rating >= 2 && rating < 4) ratingBuckets['2-4']++;
        else if (rating >= 4 && rating < 6) ratingBuckets['4-6']++;
        else if (rating >= 6 && rating < 8) ratingBuckets['6-8']++;
        else if (rating >= 8 && rating <= 10) ratingBuckets['8-10']++;
    });
    
    // Destroy existing chart if exists
    if (window.ratingChartInstance) {
        window.ratingChartInstance.destroy();
    }
    
    window.ratingChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['0-2', '2-4', '4-6', '6-8', '8-10'],
            datasets: [{
                label: 'Number of Ratings',
                data: Object.values(ratingBuckets),
                backgroundColor: [
                    '#dc3545',
                    '#fd7e14',
                    '#ffc107',
                    '#28a745',
                    '#20c997'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#e5e5e5', stepSize: 1 },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: '#e5e5e5' },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

/**
 * Generates Activity Timeline Chart (Last 7 days)
 */
function generateActivityChart(movies) {
    const ctx = document.getElementById('activityChart');
    if (!ctx) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        last7Days.push(date);
    }
    
    const activityCounts = last7Days.map(date => {
        return movies.filter(movie => {
            const movieDate = new Date(movie.dateAdded);
            movieDate.setHours(0, 0, 0, 0);
            return movieDate.getTime() === date.getTime();
        }).length;
    });
    
    const labels = last7Days.map(date => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[date.getDay()];
    });
    
    // Destroy existing chart if exists
    if (window.activityChartInstance) {
        window.activityChartInstance.destroy();
    }
    
    window.activityChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Items Added',
                data: activityCounts,
                borderColor: '#e50914',
                backgroundColor: 'rgba(229, 9, 20, 0.2)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#e50914',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#e5e5e5', stepSize: 1 },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: '#e5e5e5' },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

/**
 * Generates Top Rated Movies List
 */
function generateTopRatedList(movies) {
    const listElement = document.getElementById('topRatedList');
    if (!listElement) return;
    
    const topRated = movies
        .filter(m => m.personalRating)
        .sort((a, b) => parseFloat(b.personalRating) - parseFloat(a.personalRating))
        .slice(0, 5);
    
    if (topRated.length === 0) {
        listElement.innerHTML = '<p style="color: var(--text-secondary);">No rated content yet</p>';
        return;
    }
    
    listElement.innerHTML = topRated.map((movie, index) => `
        <div class="analytics-movie-item">
            <div class="analytics-movie-rank">${index + 1}</div>
            <div class="analytics-movie-info">
                <p class="analytics-movie-title">${movie.title}</p>
                <p class="analytics-movie-meta">${movie.year || 'N/A'} • ${movie.type === 'movie' ? 'Movie' : 'Series'}</p>
            </div>
            <div class="analytics-movie-rating">⭐ ${movie.personalRating}</div>
        </div>
    `).join('');
}

/**
 * Generates Most Recent Movies List
 */
function generateRecentList(movies) {
    const listElement = document.getElementById('recentList');
    if (!listElement) return;
    
    const recent = movies
        .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
        .slice(0, 5);
    
    if (recent.length === 0) {
        listElement.innerHTML = '<p style="color: var(--text-secondary);">No content yet</p>';
        return;
    }
    
    listElement.innerHTML = recent.map((movie, index) => {
        const date = new Date(movie.dateAdded);
        const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        return `
            <div class="analytics-movie-item">
                <div class="analytics-movie-rank">${index + 1}</div>
                <div class="analytics-movie-info">
                    <p class="analytics-movie-title">${movie.title}</p>
                    <p class="analytics-movie-meta">${formattedDate} • ${movie.type === 'movie' ? 'Movie' : 'Series'}</p>
                </div>
                ${movie.personalRating ? `<div class="analytics-movie-rating">⭐ ${movie.personalRating}</div>` : ''}
            </div>
        `;
    }).join('');
}
