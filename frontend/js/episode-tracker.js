// Episode Tracker for TV Shows
let currentShowId = null;
let currentShowTitle = null;
let currentShowTmdbId = null;
let watchedEpisodesData = [];

// Initialize episode tracker from dashboard
async function initEpisodeTracker(movieId) {
    try {
        const movie = await API.getMovieById(movieId);
        if (!movie || movie.type !== 'tv') {
            alert('This feature is only available for TV shows');
            return;
        }
        
        showEpisodeTracker(movie._id, movie.title, movie.tmdbId, movie.watchedEpisodes || []);
    } catch (error) {
        console.error('Error initializing episode tracker:', error);
        alert('Failed to load episode tracker');
    }
}

function showEpisodeTracker(movieId, movieTitle, tmdbId, watchedEpisodes = []) {
    currentShowId = movieId;
    currentShowTitle = movieTitle;
    currentShowTmdbId = tmdbId;
    watchedEpisodesData = watchedEpisodes || [];
    currentShowId = movieId;
    currentShowTitle = movieTitle;
    watchedEpisodesData = watchedEpisodes || [];
    
    const modal = document.getElementById('episode-tracker-modal');
    if (!modal) {
        createEpisodeTrackerModal();
    }
    
    document.getElementById('episode-tracker-title').textContent = `Track Episodes - ${movieTitle}`;
    loadSeasons();
    document.getElementById('episode-tracker-modal').style.display = 'flex';
}

function createEpisodeTrackerModal() {
    const modal = document.createElement('div');
    modal.id = 'episode-tracker-modal';
    modal.className = 'episode-modal';
    modal.innerHTML = `
        <div class="episode-modal-content">
            <div class="episode-modal-header">
                <h2 id="episode-tracker-title">Track Episodes</h2>
                <button class="close-btn" onclick="closeEpisodeTracker()">&times;</button>
            </div>
            
            <div class="episode-modal-body">
                <div class="season-input-section">
                    <div class="input-group">
                        <label for="season-number">Season:</label>
                        <input type="number" id="season-number" min="1" value="1" />
                    </div>
                    <button class="primary-btn" onclick="loadEpisodes()">
                        <i class="fas fa-list"></i> Load Season
                    </button>
                </div>
                
                <div class="season-progress">
                    <div class="progress-info">
                        <span id="season-watched-count">0</span> watched out of 
                        <span id="season-total-count">0</span> episodes
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="season-progress-fill"></div>
                    </div>
                </div>
                
                <div class="episodes-container" id="episodes-container">
                    <div class="empty-state">
                        <i class="fas fa-tv"></i>
                        <p>Enter a season number and click "Load Season"</p>
                    </div>
                </div>
                
                <div class="quick-actions">
                    <button class="secondary-btn" onclick="markAllEpisodesWatched()">
                        <i class="fas fa-check-double"></i> Mark All Watched
                    </button>
                    <button class="secondary-btn" onclick="clearAllEpisodes()">
                        <i class="fas fa-times"></i> Clear All
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function closeEpisodeTracker() {
    document.getElementById('episode-tracker-modal').style.display = 'none';
}

async function loadSeasons() {
    // Load watched episodes data for the show
    try {
        const movie = await API.getMovieById(currentShowId);
        watchedEpisodesData = movie.watchedEpisodes || [];
        document.getElementById('season-number').value = '1';
    } catch (error) {
        console.error('Error loading show data:', error);
    }
}

async function loadEpisodes() {
    const seasonNumber = parseInt(document.getElementById('season-number').value);
    if (!seasonNumber || seasonNumber < 1) {
        alert('Please enter a valid season number');
        return;
    }
    
    const container = document.getElementById('episodes-container');
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading episodes...</div>';
    
    try {
        // Fetch episode data from TMDB
        const response = await fetch(
            `https://api.themoviedb.org/3/tv/${currentShowTmdbId}/season/${seasonNumber}?api_key=${TMDB_CONFIG.API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error('Season not found');
        }
        
        const seasonData = await response.json();
        displayEpisodes(seasonData.episodes, seasonNumber);
    } catch (error) {
        console.error('Error loading episodes:', error);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Could not load episodes for this season. It may not exist yet.</p>
            </div>
        `;
    }
}

function displayEpisodes(episodes, seasonNumber) {
    const container = document.getElementById('episodes-container');
    
    if (!episodes || episodes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tv"></i>
                <p>No episodes found for this season</p>
            </div>
        `;
        return;
    }
    
    // Calculate progress
    const watchedCount = watchedEpisodesData.filter(
        ep => ep.seasonNumber === seasonNumber
    ).length;
    
    updateSeasonProgress(watchedCount, episodes.length);
    
    // Display episodes
    container.innerHTML = episodes.map(episode => {
        const isWatched = watchedEpisodesData.some(
            ep => ep.seasonNumber === seasonNumber && ep.episodeNumber === episode.episode_number
        );
        
        const watchedEp = watchedEpisodesData.find(
            ep => ep.seasonNumber === seasonNumber && ep.episodeNumber === episode.episode_number
        );
        
        return `
            <div class="episode-card ${isWatched ? 'watched' : ''}" data-episode="${episode.episode_number}">
                <div class="episode-checkbox">
                    <input type="checkbox" 
                           id="ep-${episode.episode_number}" 
                           ${isWatched ? 'checked' : ''}
                           onchange="toggleEpisode(${seasonNumber}, ${episode.episode_number})" />
                    <label for="ep-${episode.episode_number}">
                        <i class="fas fa-check"></i>
                    </label>
                </div>
                
                <div class="episode-info">
                    <div class="episode-header">
                        <span class="episode-number">E${episode.episode_number}</span>
                        <h4>${episode.name}</h4>
                    </div>
                    <p class="episode-overview">${episode.overview || 'No description available'}</p>
                    <div class="episode-meta">
                        <span><i class="far fa-calendar"></i> ${episode.air_date || 'TBA'}</span>
                        ${episode.runtime ? `<span><i class="far fa-clock"></i> ${episode.runtime} min</span>` : ''}
                    </div>
                    ${isWatched && watchedEp ? `
                        <div class="episode-watched-info">
                            <span><i class="fas fa-check-circle"></i> Watched ${new Date(watchedEp.watchedDate).toLocaleDateString()}</span>
                            ${watchedEp.rating ? `<span class="episode-rating"><i class="fas fa-star"></i> ${watchedEp.rating}/10</span>` : ''}
                        </div>
                    ` : ''}
                </div>
                
                ${isWatched ? `
                    <div class="episode-actions">
                        <button class="icon-btn" onclick="rateEpisode(${seasonNumber}, ${episode.episode_number})" title="Rate Episode">
                            <i class="fas fa-star"></i>
                        </button>
                        <button class="icon-btn danger" onclick="unmarkEpisode(${seasonNumber}, ${episode.episode_number})" title="Unmark">
                            <i class="fas fa-undo"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function updateSeasonProgress(watched, total) {
    document.getElementById('season-watched-count').textContent = watched;
    document.getElementById('season-total-count').textContent = total;
    
    const percentage = total > 0 ? (watched / total) * 100 : 0;
    document.getElementById('season-progress-fill').style.width = `${percentage}%`;
}

async function toggleEpisode(seasonNumber, episodeNumber) {
    const isChecked = document.getElementById(`ep-${episodeNumber}`).checked;
    
    if (isChecked) {
        await markEpisodeWatched(seasonNumber, episodeNumber);
    } else {
        await unmarkEpisode(seasonNumber, episodeNumber);
    }
}

async function markEpisodeWatched(seasonNumber, episodeNumber, rating = null) {
    try {
        await API.markEpisodeWatched(currentShowId, seasonNumber, episodeNumber, rating);
        
        // Update local data
        if (!watchedEpisodesData.some(ep => ep.seasonNumber === seasonNumber && ep.episodeNumber === episodeNumber)) {
            watchedEpisodesData.push({
                seasonNumber,
                episodeNumber,
                watchedDate: new Date().toISOString(),
                rating
            });
        }
        
        // Reload the current season view
        await loadEpisodes();
    } catch (error) {
        console.error('Error marking episode as watched:', error);
        alert('Failed to mark episode as watched');
    }
}

async function unmarkEpisode(seasonNumber, episodeNumber) {
    try {
        await API.unmarkEpisode(currentShowId, seasonNumber, episodeNumber);
        
        // Update local data
        watchedEpisodesData = watchedEpisodesData.filter(
            ep => !(ep.seasonNumber === seasonNumber && ep.episodeNumber === episodeNumber)
        );
        
        // Reload the current season view
        await loadEpisodes();
    } catch (error) {
        console.error('Error unmarking episode:', error);
        alert('Failed to unmark episode');
    }
}

async function rateEpisode(seasonNumber, episodeNumber) {
    const rating = prompt('Rate this episode (1-10):');
    if (rating === null) return;
    
    const ratingNum = parseFloat(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 10) {
        alert('Please enter a valid rating between 1 and 10');
        return;
    }
    
    // Update the episode with new rating
    await markEpisodeWatched(seasonNumber, episodeNumber, ratingNum);
}

async function markAllEpisodesWatched() {
    const seasonNumber = parseInt(document.getElementById('season-number').value);
    const episodeCards = document.querySelectorAll('.episode-card');
    
    if (episodeCards.length === 0) {
        alert('Please load a season first');
        return;
    }
    
    if (!confirm(`Mark all ${episodeCards.length} episodes of Season ${seasonNumber} as watched?`)) {
        return;
    }
    
    for (const card of episodeCards) {
        const episodeNumber = parseInt(card.dataset.episode);
        const checkbox = document.getElementById(`ep-${episodeNumber}`);
        
        if (!checkbox.checked) {
            await markEpisodeWatched(seasonNumber, episodeNumber);
        }
    }
    
    await loadEpisodes();
}

async function clearAllEpisodes() {
    const seasonNumber = parseInt(document.getElementById('season-number').value);
    const episodeCards = document.querySelectorAll('.episode-card.watched');
    
    if (episodeCards.length === 0) {
        alert('No watched episodes to clear');
        return;
    }
    
    if (!confirm(`Clear all watched episodes for Season ${seasonNumber}?`)) {
        return;
    }
    
    for (const card of episodeCards) {
        const episodeNumber = parseInt(card.dataset.episode);
        await unmarkEpisode(seasonNumber, episodeNumber);
    }
    
    await loadEpisodes();
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('episode-tracker-modal');
    if (modal && e.target === modal) {
        closeEpisodeTracker();
    }
});
