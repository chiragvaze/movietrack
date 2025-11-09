// Enhanced Dashboard with Search, Edit, TMDB Integration
// TMDB API Key
const TMDB_API_KEY = '409d37969fa9cdbc46f0baf72ff9c6d2';

/**
 * Displays a toast notification.
 * @param {string} message - The message to display.
 * @param {string} [type='success'] - The type of toast (success, error, info).
 */
function showToast(message, type = 'success') {
    // Check user settings for toast notifications
    const settings = window.userSettings || JSON.parse(localStorage.getItem('movietrack_settings') || '{}');
    
    // Check if toasts are enabled for this type
    if (type === 'success' && settings.successToasts === false) return;
    if (type === 'error' && settings.errorToasts === false) return;
    
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

    // Get notification duration from settings (default 3000ms)
    const duration = settings.notifDuration || 3000;
    
    // Animate out and remove after specified duration
    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => toast.remove());
    }, duration);
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

// Load user settings on page load
function loadUserSettings() {
    const settings = window.userSettings || JSON.parse(localStorage.getItem('movietrack_settings') || '{}');
    
    if (settings) {
        // Apply default filter if set
        if (settings.defaultFilter) {
            currentFilter = settings.defaultFilter;
        }
        
        // Apply default media type filter if set
        if (settings.defaultMediaType && settings.defaultMediaType !== 'both') {
            currentTypeFilter = settings.defaultMediaType; // 'movie' or 'tv'
        }
        
        // Apply default sort if set
        if (settings.defaultSort) {
            // Convert settings format to dashboard format
            const sortMap = {
                'dateAdded': 'date-desc',
                'title': 'title-asc',
                'year': 'year-desc',
                'rating': 'rating-desc'
            };
            currentSort = sortMap[settings.defaultSort] || currentSort;
        }
        
        // Apply default dashboard section if set
        if (settings.defaultDashboard && settings.defaultDashboard !== 'movies') {
            // Wait for DOM and data to load before opening sections
            setTimeout(() => {
                switch (settings.defaultDashboard) {
                    case 'analytics':
                        if (typeof openAnalytics === 'function') {
                            openAnalytics();
                        }
                        break;
                    case 'achievements':
                        if (typeof displayAchievementsModal === 'function' && movies) {
                            displayAchievementsModal(movies);
                        }
                        break;
                    case 'recommendations':
                        // Scroll to recommendations section if visible
                        const recsSection = document.getElementById('recommendationsSection');
                        if (recsSection && recsSection.style.display !== 'none') {
                            recsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                        break;
                }
            }, 1000); // Wait for movies to load
        }
    }
}

// Apply user settings to UI elements
function applyUserSettingsToUI() {
    const settings = window.userSettings || JSON.parse(localStorage.getItem('movietrack_settings') || '{}');
    
    // Apply filter button active state
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        if (btn.dataset.filter === currentFilter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Apply type filter button active state
    const typeFilterButtons = document.querySelectorAll('.type-filter-btn');
    typeFilterButtons.forEach(btn => {
        if (btn.dataset.type === currentTypeFilter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Apply sort dropdown value
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.value = currentSort;
    }
    
    // Apply section visibility settings
    if (settings) {
        // Hide/show quick stats section
        const quickStatsSection = document.querySelector('.dashboard-stats');
        if (quickStatsSection && settings.showQuickStats === false) {
            quickStatsSection.style.display = 'none';
        }
        
        // Hide/show recommendations section
        const recommendationsSection = document.getElementById('recommendationsSection');
        if (recommendationsSection && settings.showRecommendations === false) {
            recommendationsSection.style.display = 'none';
        }
        
        // Note: Analytics and Recent are modals/dynamic content, handled elsewhere
    }
}

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
            
            // Check for new achievements
            const settings = window.userSettings || JSON.parse(localStorage.getItem('movietrack_settings') || '{}');
            const achievementNotifs = settings.achievementNotifs !== false; // Default true
            
            if (achievementNotifs) {
                const newAchievements = getNewAchievements(movies);
                newAchievements.forEach(achievement => {
                    showAchievementUnlock(achievement);
                });
            }
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
    
    if (movies.length === 0) {
        recommendationsSection.style.display = 'none';
        return;
    }
    
    try {
        // Step 1: Analyze user preferences
        const userProfile = analyzeUserPreferences(movies);
        console.log('👤 User Profile:', userProfile);
        console.log('📊 Movies with TMDB IDs:', movies.filter(m => m.tmdbId).length);
        console.log('⭐ Movies with 4+ rating:', movies.filter(m => m.rating >= 4).length);
        
        // Step 2: Get recommendations based on multiple strategies
        const recommendations = await getSmartRecommendations(userProfile);
        console.log(`✨ Generated ${recommendations.length} smart recommendations`);
        
        if (recommendations.length === 0) {
            console.warn('⚠️ No recommendations generated. Check if movies have TMDB IDs and ratings.');
            recommendationsSection.style.display = 'none';
            return;
        }
        
        // Step 3: Display recommendations with personalized sections
        displayRecommendations(recommendations, userProfile);
        recommendationsSection.style.display = 'block';
        
    } catch (error) {
        console.error('Error loading recommendations:', error);
        recommendationsSection.style.display = 'none';
    }
}

/**
 * Analyzes user's collection to build preference profile
 */
function analyzeUserPreferences(movies) {
    const profile = {
        favoriteGenres: [],
        topRatedMovies: [],
        avgRating: 0,
        preferredType: null, // movie or tv
        recentlyWatched: [],
        totalContent: movies.length
    };
    
    // Get top-rated content (4+ stars) or fallback to any movies with TMDB ID
    let topRated = movies
        .filter(m => m.rating >= 4 && m.tmdbId)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5);
    
    // Fallback: If no 4+ rated movies, use any rated movies (3+)
    if (topRated.length === 0) {
        topRated = movies
            .filter(m => m.rating >= 3 && m.tmdbId)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 5);
    }
    
    // Fallback: If still none, use any movies with TMDB ID (watched status)
    if (topRated.length === 0) {
        topRated = movies
            .filter(m => m.tmdbId && m.status === 'watched')
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 5);
    }
    
    profile.topRatedMovies = topRated;
    
    // Calculate average rating
    const ratedMovies = movies.filter(m => m.rating > 0);
    if (ratedMovies.length > 0) {
        profile.avgRating = ratedMovies.reduce((sum, m) => sum + m.rating, 0) / ratedMovies.length;
    }
    
    // Analyze genre preferences
    const genreCount = {};
    movies.forEach(movie => {
        if (movie.genre && Array.isArray(movie.genre)) {
            movie.genre.forEach(genre => {
                genreCount[genre] = (genreCount[genre] || 0) + 1;
            });
        }
    });
    
    // Get top 3 genres
    profile.favoriteGenres = Object.entries(genreCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(g => g[0]);
    
    // Determine preferred content type
    const movieCount = movies.filter(m => m.type === 'movie').length;
    const tvCount = movies.filter(m => m.type === 'tv').length;
    profile.preferredType = movieCount > tvCount ? 'movie' : 'tv';
    
    // Get recently added items
    profile.recentlyWatched = movies
        .filter(m => m.tmdbId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);
    
    return profile;
}

/**
 * Gets smart recommendations using multiple strategies
 */
async function getSmartRecommendations(userProfile) {
    const allRecommendations = [];
    
    // Get user settings for recommendations
    const settings = window.userSettings || JSON.parse(localStorage.getItem('movietrack_settings') || '{}');
    const recContentBased = settings.recContentBased !== false; // Default true
    const recGenreBased = settings.recGenreBased !== false; // Default true
    const recTrending = settings.recTrending !== false; // Default true
    const recMinRating = settings.recMinRating || 7;
    const recPerSection = settings.recPerSection || 20; // Increased from 10 to 20
    
    // Strategy 1: "Because you watched..." - Similar to top-rated items
    if (recContentBased) {
        console.log('🎯 Strategy 1: Based on top-rated content...');
        const itemsToCheck = Math.min(userProfile.topRatedMovies.length, 5); // Increased from 3 to 5
        for (let i = 0; i < itemsToCheck; i++) {
            const item = userProfile.topRatedMovies[i];
            try {
                let recs;
                if (item.type === 'tv') {
                    recs = await TMDB.getTVRecommendations(item.tmdbId, 10); // Increased from 5 to 10
                } else {
                    recs = await TMDB.getMovieRecommendations(item.tmdbId, 10); // Increased from 5 to 10
                }
                
                recs.forEach(rec => {
                    rec.reason = `Because you loved "${item.title}"`;
                    rec.strategy = 'similar';
                });
                
                allRecommendations.push(...recs);
            } catch (error) {
                console.error(`Error getting recommendations for ${item.title}:`, error);
            }
        }
    }
    
    // Strategy 2: Based on favorite genres
    if (recGenreBased && userProfile.favoriteGenres.length > 0) {
        console.log('🎭 Strategy 2: Based on favorite genres...');
        try {
            // Get genre IDs from TMDB
            const genreMap = {
                'Action': 28, 'Adventure': 12, 'Animation': 16, 'Comedy': 35,
                'Crime': 80, 'Documentary': 99, 'Drama': 18, 'Family': 10751,
                'Fantasy': 14, 'History': 36, 'Horror': 27, 'Music': 10402,
                'Mystery': 9648, 'Romance': 10749, 'Science Fiction': 878,
                'Thriller': 53, 'War': 10752, 'Western': 37
            };
            
            const genreId = genreMap[userProfile.favoriteGenres[0]];
            if (genreId) {
                const genreRecs = await TMDB.discoverByGenre(
                    userProfile.preferredType === 'movie' ? 'movie' : 'tv',
                    genreId,
                    20 // Increased from 10 to 20
                );
                
                genreRecs.forEach(rec => {
                    rec.reason = `You love ${userProfile.favoriteGenres[0]}`;
                    rec.strategy = 'genre';
                });
                
                allRecommendations.push(...genreRecs);
            }
        } catch (error) {
            console.error('Error getting genre recommendations:', error);
        }
    }
    
    // Strategy 3: Trending in your preferred type
    if (recTrending) {
        console.log('📈 Strategy 3: Trending content...');
        try {
            const trending = await TMDB.getTrending(userProfile.preferredType, 'week', 20); // Increased from 10 to 20
            trending.forEach(rec => {
                rec.reason = 'Trending now';
                rec.strategy = 'trending';
            });
            allRecommendations.push(...trending);
        } catch (error) {
            console.error('Error getting trending:', error);
        }
    }
    
    // Remove duplicates and items already in collection
    const existingIds = movies.map(m => m.tmdbId).filter(Boolean);
    const hideSimilar = settings.recHideSimilar || false;
    
    console.log(`📊 Before filtering: ${allRecommendations.length} total recommendations`);
    
    let uniqueRecommendations = allRecommendations
        .filter((rec, index, self) => 
            index === self.findIndex(r => r.tmdbId === rec.tmdbId)
        )
        .filter(rec => !existingIds.includes(rec.tmdbId));
    
    console.log(`🔍 After duplicate removal: ${uniqueRecommendations.length} recommendations`);
    
    // Filter by minimum rating if set
    if (recMinRating > 0) {
        const beforeRatingFilter = uniqueRecommendations.length;
        uniqueRecommendations = uniqueRecommendations.filter(rec => 
            rec.rating && rec.rating >= recMinRating
        );
        console.log(`⭐ Rating filter (>=${recMinRating}): ${beforeRatingFilter} → ${uniqueRecommendations.length} recommendations`);
        
        // If rating filter removes everything, lower the threshold
        if (uniqueRecommendations.length === 0 && recMinRating > 6) {
            console.warn(`⚠️ Min rating ${recMinRating} filtered out all recommendations! Trying with 6.0...`);
            uniqueRecommendations = allRecommendations
                .filter((rec, index, self) => 
                    index === self.findIndex(r => r.tmdbId === rec.tmdbId)
                )
                .filter(rec => !existingIds.includes(rec.tmdbId))
                .filter(rec => rec.rating && rec.rating >= 6.0);
            console.log(`✅ With rating >=6.0: ${uniqueRecommendations.length} recommendations`);
        }
    }
    
    console.log(`🎯 After rating filter (min ${recMinRating}): ${uniqueRecommendations.length} recommendations`);
    
    // Hide similar recommendations if setting enabled
    if (hideSimilar) {
        // Keep only trending and genre-based, remove "similar" strategy
        uniqueRecommendations = uniqueRecommendations.filter(rec => rec.strategy !== 'similar');
    }
    
    // Don't limit total - let each section show its own recommendations
    // uniqueRecommendations = uniqueRecommendations.slice(0, Math.min(recPerSection * 2, 20)); // REMOVED THIS LINE
    
    console.log(`✅ Final recommendations: ${uniqueRecommendations.length} total`);
    
    return uniqueRecommendations;
}

/**
 * Displays recommendations in organized sections
 */
function displayRecommendations(recommendations, userProfile) {
    const carousel = document.getElementById('recommendationsCarousel');
    
    // Group by strategy
    const similarRecs = recommendations.filter(r => r.strategy === 'similar');
    const genreRecs = recommendations.filter(r => r.strategy === 'genre');
    const trendingRecs = recommendations.filter(r => r.strategy === 'trending');
    
    console.log(`📊 Recommendation breakdown:
        - Similar: ${similarRecs.length}
        - Genre: ${genreRecs.length}
        - Trending: ${trendingRecs.length}
        - Total: ${recommendations.length}`);
    
    let html = '';
    
    // Section 1: Because you watched...
    if (similarRecs.length > 0) {
        html += `<div class="rec-section">
            <h3 class="rec-section-title"><i class="fas fa-heart"></i> Based on Your Favorites</h3>
            <div class="rec-grid">`;
        
        similarRecs.forEach(rec => {
            html += createRecommendationCard(rec);
        });
        
        html += `</div></div>`;
    }
    
    // Section 2: Genre-based
    if (genreRecs.length > 0) {
        html += `<div class="rec-section">
            <h3 class="rec-section-title"><i class="fas fa-theater-masks"></i> More ${userProfile.favoriteGenres[0]}</h3>
            <div class="rec-grid">`;
        
        genreRecs.forEach(rec => {
            html += createRecommendationCard(rec);
        });
        
        html += `</div></div>`;
    }
    
    // Section 3: Trending
    if (trendingRecs.length > 0) {
        html += `<div class="rec-section">
            <h3 class="rec-section-title"><i class="fas fa-fire"></i> Trending Now</h3>
            <div class="rec-grid">`;
        
        trendingRecs.forEach(rec => {
            html += createRecommendationCard(rec);
        });
        
        html += `</div></div>`;
    }
    
    carousel.innerHTML = html;
    
    // Add smooth scroll for recommendation grids
    initRecommendationScroll();
}

/**
 * Initialize smooth scrolling for recommendation grids
 */
function initRecommendationScroll() {
    const grids = document.querySelectorAll('.rec-grid');
    
    grids.forEach(grid => {
        let isDown = false;
        let startX;
        let scrollLeft;
        
        grid.addEventListener('mousedown', (e) => {
            if (e.target.closest('.recommendation-card')) return;
            isDown = true;
            grid.classList.add('active');
            startX = e.pageX - grid.offsetLeft;
            scrollLeft = grid.scrollLeft;
        });
        
        grid.addEventListener('mouseleave', () => {
            isDown = false;
            grid.classList.remove('active');
        });
        
        grid.addEventListener('mouseup', () => {
            isDown = false;
            grid.classList.remove('active');
        });
        
        grid.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - grid.offsetLeft;
            const walk = (x - startX) * 2;
            grid.scrollLeft = scrollLeft - walk;
        });
    });
}

/**
 * Creates a recommendation card HTML
 */
function createRecommendationCard(rec) {
    const cardId = `rec-card-${rec.tmdbId}`;
    return `
        <div class="recommendation-card" 
             id="${cardId}"
             data-tmdb-id="${rec.tmdbId}" 
             data-type="${rec.type}"
             onclick="openRecommendationDetails('${rec.tmdbId}', '${rec.type}')">
            <img 
                src="${rec.poster || 'https://via.placeholder.com/200x300?text=No+Poster'}" 
                alt="${rec.title}"
                class="recommendation-poster"
                onerror="this.src='https://via.placeholder.com/200x300?text=No+Poster'"
            >
            <div class="recommendation-overlay">
                <div class="rec-reason">${rec.reason}</div>
                <div class="recommendation-info">
                    <div class="recommendation-title">${rec.title}</div>
                    <div class="recommendation-meta">
                        <span class="recommendation-year">${rec.year || 'N/A'}</span>
                        <span class="recommendation-rating">
                            <i class="fas fa-star"></i>
                            ${rec.rating ? rec.rating.toFixed(1) : 'N/A'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Handle touch interactions for showing overlay on mobile
document.addEventListener('DOMContentLoaded', function() {
    // Add CSS to show overlay on tap for mobile devices
    const style = document.createElement('style');
    style.textContent = `
        @media (hover: none) and (pointer: coarse) {
            /* Mobile devices - tap to show info */
            .recommendation-card:active .recommendation-overlay {
                opacity: 1 !important;
            }
        }
    `;
    document.head.appendChild(style);
});


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
    
    // Get user settings for display options
    const settings = window.userSettings || JSON.parse(localStorage.getItem('movietrack_settings') || '{}');
    const showYear = settings.showYear !== false; // Default to true
    const showRuntime = settings.showRuntime !== false; // Default to true
    
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
            ${showRuntime ? (
                movie.type === 'tv' && movie.numberOfSeasons ? 
                    `<div class="movie-runtime-badge"><i class="fas fa-tv"></i> ${movie.numberOfSeasons} Season${movie.numberOfSeasons > 1 ? 's' : ''}</div>` :
                movie.runtime ? 
                    `<div class="movie-runtime-badge"><i class="fas fa-clock"></i> ${movie.runtime} min</div>` : 
                    ''
            ) : ''}
            ${movie.streamingServices && movie.streamingServices.length > 0 ? `
                <div class="streaming-badges-overlay">
                    ${movie.streamingServices.slice(0, 3).map(service => {
                        const icons = {
                            'Netflix': 'fab fa-netflix',
                            'Amazon Prime': 'fab fa-amazon',
                            'Disney+': 'fas fa-film',
                            'HBO Max': 'fas fa-play',
                            'Hulu': 'fas fa-tv',
                            'Apple TV+': 'fab fa-apple',
                            'Other': 'fas fa-play-circle'
                        };
                        const colors = {
                            'Netflix': '#E50914',
                            'Amazon Prime': '#00A8E1',
                            'Disney+': '#113CCF',
                            'HBO Max': '#9333EA',
                            'Hulu': '#1CE783',
                            'Apple TV+': '#000000',
                            'Other': '#6B7280'
                        };
                        const icon = icons[service.service] || 'fas fa-play-circle';
                        const color = colors[service.service] || '#6B7280';
                        return `<span class="stream-badge" style="background-color: ${color}" title="${service.service}"><i class="${icon}"></i></span>`;
                    }).join('')}
                    ${movie.streamingServices.length > 3 ? `<span class="stream-badge-more">+${movie.streamingServices.length - 3}</span>` : ''}
                </div>
            ` : ''}
            <div class="movie-content"
                <div class="movie-header">
                    <h4 class="movie-title">
                        ${movie.type === 'tv' ? '<span class="type-badge">📺</span>' : ''}
                        ${movie.title}
                    </h4>
                    ${showYear ? `<span class="movie-year">${movie.year || 'N/A'}</span>` : ''}
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
                ${movie.customTags && movie.customTags.length > 0 ? `
                    <div class="movie-tags-container">
                        ${movie.customTags.slice(0, 2).map(tag => `<span class="tag-badge-display">${tag}</span>`).join('')}
                        ${movie.customTags.length > 2 ? `<span class="tag-more">+${movie.customTags.length - 2}</span>` : ''}
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
                    <button class="btn-icon" onclick="addTagToMovie('${movie._id}')" title="Add Tag">
                        <i class="fas fa-tag"></i>
                    </button>
                    <button class="btn-icon" onclick="addMovieToList('${movie._id}')" title="Add to List">
                        <i class="fas fa-list"></i>
                    </button>
                    ${movie.type === 'tv' ? `
                        <button class="btn-icon" onclick="initEpisodeTracker('${movie._id}')" title="Track Episodes">
                            <i class="fas fa-list-check"></i>
                        </button>
                    ` : ''}
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
        
        // Show loading immediately with helpful message
        tmdbResults.innerHTML = `
            <div class="tmdb-loading">
                <i class="fas fa-spinner fa-spin"></i> 
                <div>Searching OMDb (Fast Mode)...</div>
                <small style="opacity: 0.7; margin-top: 5px; display: block;">
                    ${query.length < 4 ? 'Type more for better results' : 'Optimized for slow connections ⚡'}
                </small>
            </div>
        `;
        tmdbResults.style.display = 'block';
        
        // Reduced debounce time for faster response (OMDb is much faster!)
        tmdbSearchTimeout = setTimeout(async () => {
            let isLoading = true;
            
            try {
                // Use OMDb for fast search (works great on slow connections)
                const results = currentContentType === 'movie' 
                    ? await OMDb.searchMovies(query, (loading) => { isLoading = loading; })
                    : await OMDb.searchTVShows(query, (loading) => { isLoading = loading; });
                
                currentTMDBResults = results.results || [];
                
                // Check if results came from cache
                if (results.fromCache) {
                    console.log('✅ OMDb: Showing cached results instantly');
                }
                
                // Check for errors
                if (results.error) {
                    displayTMDBError(results.message, tmdbResults, query);
                } else {
                    displayTMDBResults(currentTMDBResults, tmdbResults);
                }
            } catch (error) {
                console.error('OMDb search error:', error);
                displayTMDBError('Connection failed. Please check your internet and try again.', tmdbResults, query);
            }
        }, 300); // Faster debounce since OMDb is much quicker
    });
}

function displayTMDBError(message, container, query) {
    container.innerHTML = `
        <div class="tmdb-error">
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
            <button class="btn-retry" onclick="retryTMDBSearch('${query}')">
                <i class="fas fa-redo"></i> Retry
            </button>
            <div style="margin-top: 10px; font-size: 0.85rem; opacity: 0.8;">
                💡 Tip: Using OMDb for faster search on slow connections. Results cached for 30 min.
            </div>
        </div>
    `;
    container.style.display = 'block';
}

function retryTMDBSearch(query) {
    const titleInput = document.getElementById('movieTitle');
    if (titleInput) {
        titleInput.value = query;
        titleInput.dispatchEvent(new Event('input'));
    }
}

function displayTMDBResults(results, container) {
    if (results.length === 0) {
        container.innerHTML = `
            <div class="tmdb-no-results">
                <i class="fas fa-film"></i>
                <span>No results found. Try different keywords.</span>
            </div>
        `;
        container.style.display = 'block';
        return;
    }
    
    const isTV = currentContentType === 'tv';
    
    container.innerHTML = results.slice(0, 5).map((item, index) => {
        // Handle both OMDb and TMDB formats
        const title = isTV ? (item.name || item.title) : item.title;
        const year = item.year || (item.release_date ? new Date(item.release_date).getFullYear() : 
                     (item.first_air_date ? new Date(item.first_air_date).getFullYear() : 'N/A'));
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
    console.log('Selected from OMDb:', selectedItem);
    
    const isTV = currentContentType === 'tv';
    
    // Check if this is OMDb data (has imdbID) or TMDB data (numeric id)
    const isOMDb = selectedItem.id && selectedItem.id.startsWith('tt');
    
    let details;
    if (isOMDb) {
        // Fetch full details from OMDb using IMDb ID
        details = isTV 
            ? await OMDb.getTVShowDetails(selectedItem.id)
            : await OMDb.getMovieDetails(selectedItem.id);
        console.log(`${isTV ? 'TV Show' : 'Movie'} details from OMDb:`, details);
    } else {
        // Fallback to TMDB if needed (for trending/recommendations)
        details = isTV 
            ? await TMDB.getTVShowDetails(selectedItem.id)
            : await TMDB.getMovieDetails(selectedItem.id);
        console.log(`${isTV ? 'TV Show' : 'Movie'} details from TMDB:`, details);
    }
    
    if (details) {
        document.getElementById('movieTitle').value = details.title || details.name;
        document.getElementById('movieYear').value = details.year || '';
        document.getElementById('tmdbResults').style.display = 'none';
        
        // Show TV show fields if it's a TV show
        const tvShowFields = document.getElementById('tvShowFields');
        if (isTV && tvShowFields) {
            tvShowFields.style.display = 'block';
        }
        
        // Transform OMDb data to match backend schema
        if (isOMDb) {
            // Convert runtime "162 min" -> 162 (number)
            if (details.runtime && typeof details.runtime === 'string') {
                details.runtime = parseInt(details.runtime.replace(/\D/g, '')) || null;
            }
            
            // Convert IMDb rating (0-10) to app rating (0-5)
            if (details.imdbRating && typeof details.imdbRating === 'string') {
                const imdbScore = parseFloat(details.imdbRating);
                details.rating = Math.round((imdbScore / 10) * 5 * 10) / 10; // Convert 10-scale to 5-scale
            }
            
            // Store original IMDb rating separately
            details.imdbRatingOriginal = details.imdbRating;
        }
        
        // Store data for when form is submitted
        window.selectedTMDBData = details;
        console.log('Stored movie/TV data:', window.selectedTMDBData);
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
    modal.style.display = 'block'; // Make modal visible
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.remove();
        }
    });
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
                        ${movie.plot ? `<p class="details-plot ${getSpoilerClass()}" ${getSpoilerAttributes()}>${movie.plot}</p>` : ''}
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

// Helper function to get spoiler protection class
function getSpoilerClass() {
    const settings = window.userSettings || JSON.parse(localStorage.getItem('movietrack_settings') || '{}');
    return settings.spoilerProtection ? 'spoiler-protected' : '';
}

// Helper function to get spoiler protection attributes
function getSpoilerAttributes() {
    const settings = window.userSettings || JSON.parse(localStorage.getItem('movietrack_settings') || '{}');
    return settings.spoilerProtection ? 'onclick="this.classList.toggle(\'spoiler-revealed\')" title="Click to reveal spoiler"' : '';
}

// Show recommendation modal with quick add option
function showRecommendationModal(details) {
    const modal = document.createElement('div');
    modal.className = 'modal modal-large';
    modal.style.display = 'block'; // Make modal visible
    
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
                        ${details.plot ? `<p class="details-plot ${getSpoilerClass()}" ${getSpoilerAttributes()}>${details.plot}</p>` : ''}
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
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.remove();
        }
    });
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
    // Check user settings for notifications
    const settings = window.userSettings || JSON.parse(localStorage.getItem('movietrack_settings') || '{}');
    
    // Check if toasts are enabled for this type
    if (type === 'success' && settings.successToasts === false) return;
    if (type === 'error' && settings.errorToasts === false) return;
    
    const notification = document.createElement('div');
    notification.textContent = message;
    
    let bgColor = '#10b981'; // success - green
    if (type === 'error') bgColor = '#ef4444'; // error - red
    if (type === 'info') bgColor = '#3b82f6'; // info - blue
    
    // Get notification position from settings (default top-right)
    const position = settings.notifPosition || 'top-right';
    let positionStyles = 'top: 80px; right: 20px;'; // default
    
    switch(position) {
        case 'top-left':
            positionStyles = 'top: 80px; left: 20px;';
            break;
        case 'top-center':
            positionStyles = 'top: 80px; left: 50%; transform: translateX(-50%);';
            break;
        case 'bottom-right':
            positionStyles = 'bottom: 20px; right: 20px;';
            break;
        case 'bottom-left':
            positionStyles = 'bottom: 20px; left: 20px;';
            break;
        case 'bottom-center':
            positionStyles = 'bottom: 20px; left: 50%; transform: translateX(-50%);';
            break;
    }
    
    notification.style.cssText = `position: fixed; ${positionStyles} background: ${bgColor}; color: white; padding: 1rem 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); z-index: 1000; animation: slideIn 0.3s ease;`;
    document.body.appendChild(notification);
    
    // Get notification duration from settings (default 3000ms)
    const duration = settings.notifDuration || 3000;
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, duration);
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

// Profile Modal Logout Button
const profileLogoutBtn = document.getElementById('profileLogoutBtn');
if (profileLogoutBtn) {
    profileLogoutBtn.addEventListener('click', (e) => {
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
    
    // Load saved view mode preference from settings (fallback to localStorage for backward compatibility)
    const settings = window.userSettings || JSON.parse(localStorage.getItem('movietrack_settings') || '{}');
    const savedViewMode = settings.defaultView || localStorage.getItem('viewMode') || 'grid';
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
                // Get current date and upcoming dates
                const today = new Date();
                const maxDate = new Date();
                maxDate.setMonth(maxDate.getMonth() + 6); // Next 6 months
                
                const minDateStr = today.toISOString().split('T')[0];
                const maxDateStr = maxDate.toISOString().split('T')[0];
                
                // Get user settings for region
                const settings = window.userSettings || JSON.parse(localStorage.getItem('movietrack_settings') || '{}');
                const region = settings.defaultRegion || 'IN';
                
                // Fetch upcoming movies and TV shows
                const [moviesResponse, tvResponse] = await Promise.all([
                    fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&region=${region}&primary_release_date.gte=${minDateStr}&primary_release_date.lte=${maxDateStr}&sort_by=popularity.desc&page=1`),
                    fetch(`https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&language=en-US&first_air_date.gte=${minDateStr}&first_air_date.lte=${maxDateStr}&sort_by=popularity.desc&page=1`)
                ]);
                
                const moviesData = await moviesResponse.json();
                const tvData = await tvResponse.json();
                
                // Combine and sort by release date
                const combined = [
                    ...moviesData.results.map(m => ({
                        ...m, 
                        mediaType: 'movie',
                        releaseDate: m.release_date,
                        displayTitle: m.title
                    })),
                    ...tvData.results.map(t => ({
                        ...t,
                        mediaType: 'tv',
                        releaseDate: t.first_air_date,
                        displayTitle: t.name
                    }))
                ].filter(item => {
                    // Filter out items with past release dates
                    if (!item.releaseDate) return false;
                    return new Date(item.releaseDate) >= today;
                }).sort((a, b) => {
                    return new Date(a.releaseDate) - new Date(b.releaseDate);
                });
                
                // Show upcoming content in a modal
                showUpcomingModal(combined.slice(0, 20)); // Show top 20
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

// Show upcoming movies and TV shows modal
function showUpcomingModal(items) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    // Get poster size based on settings
    const settings = window.userSettings || JSON.parse(localStorage.getItem('movietrack_settings') || '{}');
    const quality = settings.posterQuality || 'medium';
    let posterSize = 'w342'; // default
    if (quality === 'low') posterSize = 'w185';
    else if (quality === 'high') posterSize = 'w780';
    
    const upcomingHTML = items.map(item => {
        const mediaTypeIcon = item.mediaType === 'tv' ? '<i class="fas fa-tv"></i>' : '<i class="fas fa-film"></i>';
        const mediaTypeLabel = item.mediaType === 'tv' ? 'TV Show' : 'Movie';
        
        return `
        <div class="upcoming-item" onclick="openRecommendationDetails(${item.id}, '${item.mediaType}')">
            <img src="${item.poster_path ? 'https://image.tmdb.org/t/p/' + posterSize + item.poster_path : ''}" 
                 alt="${item.displayTitle}"
                 onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22300%22><rect fill=%22%232a2a2a%22 width=%22200%22 height=%22300%22/><text fill=%22%23666%22 x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 font-size=%2220%22>No Image</text></svg>'">
            <div class="upcoming-info">
                <span class="media-type-badge">${mediaTypeIcon} ${mediaTypeLabel}</span>
                <h4>${item.displayTitle}</h4>
                <p>Release: ${new Date(item.releaseDate).toLocaleDateString()}</p>
                <p class="rating">⭐ ${item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}</p>
            </div>
        </div>
    `}).join('');
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 900px;">
            <div class="modal-header">
                <h2><i class="fas fa-clock"></i> Upcoming Movies & TV Shows</h2>
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
loadUserSettings(); // Load user settings first
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
    // Apply user settings to UI once DOM is ready
    applyUserSettingsToUI();
    
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
    
    // Achievements Sidebar Click
    const achievementsBtn = document.getElementById('sidebarAchievements');
    if (achievementsBtn) {
        achievementsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            displayAchievementsModal(movies);
            
            // Close sidebar on mobile
            const sidebar = document.querySelector('.sidebar');
            if (window.innerWidth <= 768 && sidebar) {
                sidebar.classList.remove('active');
            }
        });
    }
    
    // Close Achievements Modal
    const closeAchievementsBtn = document.querySelector('.close-achievements');
    if (closeAchievementsBtn) {
        closeAchievementsBtn.addEventListener('click', () => {
            const modal = document.getElementById('achievementsModal');
            if (modal) {
                modal.classList.remove('show');
            }
        });
    }
    
    // Close achievements on outside click
    const achievementsModal = document.getElementById('achievementsModal');
    if (achievementsModal) {
        achievementsModal.addEventListener('click', (e) => {
            if (e.target === achievementsModal) {
                achievementsModal.classList.remove('show');
            }
        });
    }
    
    // Initialize keyboard shortcuts
    initKeyboardShortcuts();
});

// Keyboard shortcuts functionality
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Check if keyboard shortcuts are enabled
        const settings = window.userSettings || JSON.parse(localStorage.getItem('movietrack_settings') || '{}');
        const keyboardShortcuts = settings.keyboardShortcuts !== false; // Default true
        
        if (!keyboardShortcuts) return;
        
        // Don't trigger shortcuts when typing in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
            return;
        }
        
        // Ctrl/Cmd + N: Add new movie
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            const addBtn = document.getElementById('addMovieBtn');
            if (addBtn) addBtn.click();
        }
        
        // Ctrl/Cmd + F: Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
        
        // A: Open Analytics
        if (e.key === 'a' || e.key === 'A') {
            e.preventDefault();
            if (typeof openAnalytics === 'function') {
                openAnalytics();
            }
        }
        
        // H: Open Achievements
        if (e.key === 'h' || e.key === 'H') {
            e.preventDefault();
            if (typeof displayAchievementsModal === 'function' && movies) {
                displayAchievementsModal(movies);
            }
        }
        
        // Escape: Close modals
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal, .analytics-modal.show, #achievementsModal.show');
            modals.forEach(modal => {
                if (modal.classList.contains('show')) {
                    modal.classList.remove('show');
                } else {
                    modal.remove();
                }
            });
        }
        
        // S: Open Settings
        if (e.key === 's' || e.key === 'S') {
            e.preventDefault();
            window.location.href = 'settings.html';
        }
        
        // Number keys 1-4: Filter shortcuts
        if (e.key >= '1' && e.key <= '4') {
            e.preventDefault();
            const filterMap = {
                '1': 'all',
                '2': 'watched',
                '3': 'watchlist',
                '4': 'watching'
            };
            const filter = filterMap[e.key];
            if (filter) {
                const filterBtn = document.querySelector(`.filter-btn[data-filter="${filter}"]`);
                if (filterBtn) filterBtn.click();
            }
        }
    });
}

/**
 * Opens the Analytics Modal and generates charts
 */
function openAnalytics() {
    const modal = document.getElementById('analyticsModal');
    if (!modal) {
        console.error('Analytics modal not found');
        return;
    }
    
    console.log('Opening analytics with movies:', movies);
    console.log('Movies count:', movies.length);
    
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
    console.log('Generating analytics for', movies.length, 'movies');
    
    if (!movies || movies.length === 0) {
        console.warn('No movies available for analytics');
        // Show empty state
        document.getElementById('analyticsTotal').textContent = '0';
        document.getElementById('analyticsTotalHours').textContent = '0h 0m';
        document.getElementById('analyticsAvgRating').textContent = '0.0';
        document.getElementById('analyticsStreak').textContent = '0';
        return;
    }
    
    // Calculate stats
    const totalContent = movies.length;
    const totalWatchTime = calculateTotalWatchTime(movies);
    const avgRating = calculateAverageRating(movies);
    const dayStreak = calculateDayStreak(movies);
    
    console.log('Analytics stats:', { totalContent, totalWatchTime, avgRating, dayStreak });
    
    // Update stat cards
    document.getElementById('analyticsTotal').textContent = totalContent;
    document.getElementById('analyticsTotalHours').textContent = totalWatchTime;
    document.getElementById('analyticsAvgRating').textContent = avgRating;
    document.getElementById('analyticsStreak').textContent = dayStreak;
    
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
        } else if (movie.type === 'tv' && movie.numberOfEpisodes) {
            // Estimate: 45 min per episode
            const episodes = parseInt(movie.numberOfEpisodes) || 0;
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
    const ratedMovies = movies.filter(m => m.rating && m.rating > 0);
    if (ratedMovies.length === 0) return '0.0';
    
    const sum = ratedMovies.reduce((sum, m) => sum + (parseFloat(m.rating) || 0), 0);
    return (sum / ratedMovies.length).toFixed(1);
}

/**
 * Calculates consecutive day streak
 */
function calculateDayStreak(movies) {
    if (movies.length === 0) return 0;
    
    const sortedDates = movies
        .filter(m => m.createdAt)
        .map(m => new Date(m.createdAt))
        .sort((a, b) => b - a);
    
    if (sortedDates.length === 0) return 0;
    
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
 * Generates Content Type Pie Chart (Movies vs TV Shows)
 */
function generateContentTypeChart(movies) {
    const ctx = document.getElementById('contentTypeChart');
    if (!ctx) return;
    
    const movieCount = movies.filter(m => m.type === 'movie').length;
    const tvCount = movies.filter(m => m.type === 'tv').length;
    
    console.log('Content type counts:', { movieCount, tvCount });
    
    // Destroy existing chart if exists
    if (window.contentTypeChartInstance) {
        window.contentTypeChartInstance.destroy();
    }
    
    window.contentTypeChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Movies', 'TV Shows'],
            datasets: [{
                data: [movieCount, tvCount],
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
        if (movie.genre && Array.isArray(movie.genre)) {
            movie.genre.forEach(genre => {
                genreCounts[genre] = (genreCounts[genre] || 0) + 1;
            });
        }
    });
    
    console.log('Genre counts:', genreCounts);
    
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
    
    // Rating is 0-5 scale, create buckets: 0-1, 1-2, 2-3, 3-4, 4-5
    const ratingBuckets = { '0-1': 0, '1-2': 0, '2-3': 0, '3-4': 0, '4-5': 0 };
    
    movies.forEach(movie => {
        const rating = parseFloat(movie.rating);
        if (!rating || rating === 0) return;
        
        if (rating > 0 && rating <= 1) ratingBuckets['0-1']++;
        else if (rating > 1 && rating <= 2) ratingBuckets['1-2']++;
        else if (rating > 2 && rating <= 3) ratingBuckets['2-3']++;
        else if (rating > 3 && rating <= 4) ratingBuckets['3-4']++;
        else if (rating > 4 && rating <= 5) ratingBuckets['4-5']++;
    });
    
    console.log('Rating distribution:', ratingBuckets);
    
    // Destroy existing chart if exists
    if (window.ratingChartInstance) {
        window.ratingChartInstance.destroy();
    }
    
    window.ratingChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['0-1⭐', '1-2⭐', '2-3⭐', '3-4⭐', '4-5⭐'],
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
            if (!movie.createdAt) return false;
            const movieDate = new Date(movie.createdAt);
            movieDate.setHours(0, 0, 0, 0);
            return movieDate.getTime() === date.getTime();
        }).length;
    });
    
    const labels = last7Days.map(date => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[date.getDay()];
    });
    
    console.log('Activity timeline:', { labels, activityCounts });
    
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
        .filter(m => m.rating && m.rating > 0)
        .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
        .slice(0, 5);
    
    console.log('Top rated movies:', topRated);
    
    if (topRated.length === 0) {
        listElement.innerHTML = '<p style="color: var(--text-secondary);">No rated content yet</p>';
        return;
    }
    
    listElement.innerHTML = topRated.map((movie, index) => `
        <div class="analytics-movie-item">
            <div class="analytics-movie-rank">${index + 1}</div>
            <div class="analytics-movie-info">
                <p class="analytics-movie-title">${movie.title}</p>
                <p class="analytics-movie-meta">${movie.year || 'N/A'} • ${movie.type === 'movie' ? 'Movie' : 'TV Show'}</p>
            </div>
            <div class="analytics-movie-rating">⭐ ${movie.rating.toFixed(1)}</div>
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
        .filter(m => m.createdAt)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    
    console.log('Recent movies:', recent);
    
    if (recent.length === 0) {
        listElement.innerHTML = '<p style="color: var(--text-secondary);">No content yet</p>';
        return;
    }
    
    listElement.innerHTML = recent.map((movie, index) => {
        const date = new Date(movie.createdAt);
        const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        return `
            <div class="analytics-movie-item">
                <div class="analytics-movie-rank">${index + 1}</div>
                <div class="analytics-movie-info">
                    <p class="analytics-movie-title">${movie.title}</p>
                    <p class="analytics-movie-meta">${formattedDate} • ${movie.type === 'movie' ? 'Movie' : 'TV Show'}</p>
                </div>
                ${movie.rating && movie.rating > 0 ? `<div class="analytics-movie-rating">⭐ ${movie.rating.toFixed(1)}</div>` : ''}
            </div>
        `;
    }).join('');
}

// =====================================
// TAGGING FUNCTIONALITY
// =====================================

/**
 * Opens modal to add tags to a movie
 */
function addTagToMovie(movieId) {
    const movie = movies.find(m => m._id === movieId);
    if (!movie) {
        showToast('Movie not found', 'error');
        return;
    }
    
    const existingTags = movie.customTags || [];
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-tags"></i> Add Tags to "${movie.title}"</h2>
                <span class="close">&times;</span>
            </div>
            <div class="modal-body">
                ${existingTags.length > 0 ? `
                    <div class="current-tags">
                        <h4>Current Tags:</h4>
                        <div class="tags-list">
                            ${existingTags.map(tag => `
                                <span class="tag-badge">
                                    ${tag}
                                    <button class="remove-tag-btn" onclick="removeTagFromMovie('${movieId}', '${tag}', this)" title="Remove tag">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </span>
                            `).join('')}
                        </div>
                    </div>
                    <hr style="margin: 1rem 0; border-color: var(--bg-secondary);">
                ` : ''}
                
                <div class="add-tag-section">
                    <h4>Add New Tag:</h4>
                    <div class="tag-input-group">
                        <input type="text" 
                               id="newTagInput" 
                               placeholder="Enter tag name (e.g., Action Favorites, Date Night)" 
                               class="form-input"
                               style="flex: 1;">
                        <button onclick="submitNewTag('${movieId}')" class="btn btn-primary">
                            <i class="fas fa-plus"></i> Add Tag
                        </button>
                    </div>
                    <p class="hint-text" style="margin-top: 0.5rem; color: var(--text-secondary); font-size: 0.85rem;">
                        <i class="fas fa-info-circle"></i> Press Enter to quickly add a tag
                    </p>
                </div>
                
                <div class="suggested-tags" style="margin-top: 1.5rem;">
                    <h4>Quick Tags:</h4>
                    <div class="quick-tags-list">
                        ${['Favorites', 'Watch Later', 'Must Rewatch', 'Date Night', 'Family Friendly', 'Mind-Bending'].map(tag => 
                            !existingTags.includes(tag) ? `
                                <button class="quick-tag-btn" onclick="addQuickTag('${movieId}', '${tag}')">
                                    ${tag}
                                </button>
                            ` : ''
                        ).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal handlers
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = () => {
        modal.remove();
    };
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };
    
    // Focus on input
    setTimeout(() => {
        const input = document.getElementById('newTagInput');
        input.focus();
        
        // Enter key to add tag
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitNewTag(movieId);
            }
        });
    }, 100);
}

/**
 * Submit a new tag for a movie
 */
async function submitNewTag(movieId) {
    const input = document.getElementById('newTagInput');
    const tagName = input.value.trim();
    
    if (!tagName) {
        showToast('Please enter a tag name', 'error');
        return;
    }
    
    try {
        const movie = movies.find(m => m._id === movieId);
        if (!movie) {
            showToast('Movie not found', 'error');
            return;
        }
        
        // Check if tag already exists
        if (movie.customTags && movie.customTags.includes(tagName)) {
            showToast('Tag already exists on this movie', 'error');
            return;
        }
        
        // Add tag to movie
        const updatedTags = [...(movie.customTags || []), tagName];
        
        const response = await API.updateMovie(movieId, { customTags: updatedTags });
        
        if (response.success) {
            // Update local movie data
            movie.customTags = updatedTags;
            
            showToast(`Tag "${tagName}" added successfully!`, 'success');
            
            // Close modal and refresh display
            document.querySelector('.modal').remove();
            renderMovies();
        } else {
            showToast('Failed to add tag', 'error');
        }
    } catch (error) {
        console.error('Error adding tag:', error);
        showToast('Error adding tag', 'error');
    }
}

/**
 * Add a quick tag (from suggestions)
 */
async function addQuickTag(movieId, tagName) {
    try {
        const movie = movies.find(m => m._id === movieId);
        if (!movie) {
            showToast('Movie not found', 'error');
            return;
        }
        
        // Add tag to movie
        const updatedTags = [...(movie.customTags || []), tagName];
        
        const response = await API.updateMovie(movieId, { customTags: updatedTags });
        
        if (response.success) {
            // Update local movie data
            movie.customTags = updatedTags;
            
            showToast(`Tag "${tagName}" added!`, 'success');
            
            // Close modal and refresh display
            document.querySelector('.modal').remove();
            renderMovies();
        } else {
            showToast('Failed to add tag', 'error');
        }
    } catch (error) {
        console.error('Error adding tag:', error);
        showToast('Error adding tag', 'error');
    }
}

/**
 * Remove a tag from a movie
 */
async function removeTagFromMovie(movieId, tagName, buttonElement) {
    try {
        const movie = movies.find(m => m._id === movieId);
        if (!movie) {
            showToast('Movie not found', 'error');
            return;
        }
        
        // Remove tag from movie
        const updatedTags = (movie.customTags || []).filter(t => t !== tagName);
        
        const response = await API.updateMovie(movieId, { customTags: updatedTags });
        
        if (response.success) {
            // Update local movie data
            movie.customTags = updatedTags;
            
            showToast(`Tag "${tagName}" removed`, 'success');
            
            // Remove tag badge from UI
            buttonElement.closest('.tag-badge').remove();
            
            // If no tags left, remove the current tags section
            if (updatedTags.length === 0) {
                const currentTagsSection = document.querySelector('.current-tags');
                if (currentTagsSection) {
                    currentTagsSection.nextElementSibling.remove(); // Remove hr
                    currentTagsSection.remove();
                }
            }
            
            // Refresh display
            renderMovies();
        } else {
            showToast('Failed to remove tag', 'error');
        }
    } catch (error) {
        console.error('Error removing tag:', error);
        showToast('Error removing tag', 'error');
    }
}

/**
 * Opens modal to add movie to list(s)
 */
async function addMovieToList(movieId) {
    const movie = movies.find(m => m._id === movieId);
    if (!movie) {
        showToast('Movie not found', 'error');
        return;
    }
    
    // Fetch available lists
    try {
        const response = await API.getLists();
        
        const lists = response.success && response.lists ? response.lists : [];
        const movieLists = movie.lists || [];
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 550px;">
                <div class="modal-header">
                    <h2><i class="fas fa-list"></i> Add "${movie.title}" to List</h2>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    ${lists.length > 0 ? `
                        <p style="margin-bottom: 1rem; color: var(--text-secondary);">
                            Select existing lists or create a new one:
                        </p>
                        
                        <div class="lists-selection" style="max-height: 250px; overflow-y: auto; margin-bottom: 1rem;">
                            ${lists.map(list => {
                                const isInList = movieLists.includes(list.name);
                                return `
                                    <label class="list-checkbox-item" style="
                                        display: flex;
                                        align-items: center;
                                        padding: 0.75rem;
                                        margin-bottom: 0.5rem;
                                        background: var(--card-bg);
                                        border: 2px solid ${isInList ? 'var(--primary-color)' : 'var(--border-color)'};
                                        border-radius: 8px;
                                        cursor: pointer;
                                        transition: all 0.3s ease;
                                    ">
                                        <input type="checkbox" 
                                               name="list" 
                                               value="${list.name}"
                                               ${isInList ? 'checked disabled' : ''}
                                               style="margin-right: 0.75rem; width: 18px; height: 18px; cursor: pointer;">
                                        <div style="flex: 1;">
                                            <div style="font-weight: 600; color: var(--text-primary);">
                                                ${list.name}
                                            </div>
                                            <div style="font-size: 0.85rem; color: var(--text-secondary);">
                                                ${list.movies?.length || 0} ${list.movies?.length === 1 ? 'item' : 'items'}
                                                ${isInList ? '<span style="color: var(--primary-color); margin-left: 0.5rem;"><i class="fas fa-check"></i> Already added</span>' : ''}
                                            </div>
                                        </div>
                                    </label>
                                `;
                            }).join('')}
                        </div>
                        <hr style="margin: 1.5rem 0; border-color: var(--border-color);">
                    ` : `
                        <p style="margin-bottom: 1rem; color: var(--text-secondary);">
                            <i class="fas fa-info-circle"></i> You don't have any lists yet. Create your first one below!
                        </p>
                    `}
                    
                    <div class="create-new-list-section">
                        <h4 style="margin-bottom: 0.75rem; color: var(--text-primary);">
                            <i class="fas fa-plus-circle"></i> Create New List
                        </h4>
                        <div class="tag-input-group" style="display: flex; gap: 0.5rem;">
                            <input type="text" 
                                   id="newListNameInput" 
                                   placeholder="Enter list name (e.g., 'Date Night', 'Action Favorites')" 
                                   class="form-input"
                                   style="flex: 1;">
                            <button id="createNewListBtn" data-movie-id="${movieId}" class="btn btn-success">
                                <i class="fas fa-plus"></i> Create & Add
                            </button>
                        </div>
                        <p class="hint-text" style="margin-top: 0.5rem; color: var(--text-secondary); font-size: 0.85rem;">
                            <i class="fas fa-lightbulb"></i> Press Enter to quickly create and add
                        </p>
                    </div>
                                            <p class="hint-text" style="margin-top: 0.5rem; color: var(--text-secondary); font-size: 0.85rem;">
                            <i class="fas fa-lightbulb"></i> Press Enter to quickly create and add
                        </p>
                    </div>
                    
                    ${lists.length > 0 ? `
                        <div style="margin-top: 1.5rem; text-align: right; border-top: 1px solid var(--border-color); padding-top: 1rem;">
                            <button onclick="this.closest('.modal').remove()" class="btn btn-secondary" style="margin-right: 0.5rem;">
                                Cancel
                            </button>
                            <button onclick="submitAddToLists('${movieId}')" class="btn btn-primary">
                                <i class="fas fa-check"></i> Add to Selected Lists
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle Enter key for quick creation and button click
        const newListInput = modal.querySelector('#newListNameInput');
        const createBtn = modal.querySelector('#createNewListBtn');
        
        if (newListInput && createBtn) {
            // Function to handle list creation
            const handleCreateList = async () => {
                const listName = newListInput.value.trim();
                
                if (!listName) {
                    showToast('Please enter a list name', 'error');
                    newListInput.focus();
                    return;
                }
                
                // Validate list name
                if (listName.length < 2) {
                    showToast('List name must be at least 2 characters', 'error');
                    newListInput.focus();
                    return;
                }
                
                if (listName.length > 50) {
                    showToast('List name must be less than 50 characters', 'error');
                    newListInput.focus();
                    return;
                }
                
                try {
                    // Add movie to the new list (backend will create list automatically)
                    const response = await API.addToLists(movieId, [listName]);
                    
                    if (response.success) {
                        // Update local movie data
                        const movie = movies.find(m => m._id === movieId);
                        if (movie) {
                            movie.lists = [...(movie.lists || []), listName];
                        }
                        
                        showToast(`List "${listName}" created and movie added!`, 'success');
                        modal.remove();
                        renderMovies();
                    } else {
                        showToast('Failed to create list and add movie', 'error');
                    }
                } catch (error) {
                    console.error('Error creating list:', error);
                    showToast('Failed to create list', 'error');
                }
            };
            
            // Button click handler
            createBtn.addEventListener('click', handleCreateList);
            
            // Enter key handler
            newListInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreateList();
                }
            });
            
            newListInput.focus();
        }
        
        // Close modal handlers
        const closeBtn = modal.querySelector('.close');
        closeBtn.onclick = () => modal.remove();
        
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
        
        // Hover effect for list items
        const listItems = modal.querySelectorAll('.list-checkbox-item');
        listItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                if (!item.querySelector('input').disabled) {
                    item.style.borderColor = 'var(--primary-color)';
                    item.style.background = 'var(--card-hover)';
                }
            });
            item.addEventListener('mouseleave', () => {
                if (!item.querySelector('input').checked) {
                    item.style.borderColor = 'var(--border-color)';
                    item.style.background = 'var(--card-bg)';
                }
            });
        });
        
    } catch (error) {
        console.error('Error fetching lists:', error);
        showToast('Failed to load lists', 'error');
    }
}

/**
 * Submit selected lists to add movie to
 */
async function submitAddToLists(movieId) {
    const modal = document.querySelector('.modal');
    const checkboxes = modal.querySelectorAll('input[name="list"]:checked:not([disabled])');
    
    if (checkboxes.length === 0) {
        showToast('Please select at least one list', 'error');
        return;
    }
    
    const selectedLists = Array.from(checkboxes).map(cb => cb.value);
    
    try {
        const response = await API.addToLists(movieId, selectedLists);
        
        if (response.success) {
            // Update local movie data
            const movie = movies.find(m => m._id === movieId);
            if (movie) {
                movie.lists = [...(movie.lists || []), ...selectedLists];
            }
            
            showToast(`Added to ${selectedLists.length} list${selectedLists.length > 1 ? 's' : ''}!`, 'success');
            modal.remove();
            renderMovies();
        } else {
            showToast('Failed to add to lists', 'error');
        }
    } catch (error) {
        console.error('Error adding to lists:', error);
        showToast('Error adding to lists', 'error');
    }
}

