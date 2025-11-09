// TMDB API Service
const TMDB_CONFIG = {
    API_KEY: '409d37969fa9cdbc46f0baf72ff9c6d2', // Replace with your actual API key
    BASE_URL: 'https://api.themoviedb.org/3',
    IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
    POSTER_SIZE: 'w500', // Default, will be overridden by user settings
    BACKDROP_SIZE: 'w1280',
    TIMEOUT: 30000, // 30 seconds - within browser limits
    MAX_RETRIES: 2 // Try 3 times total (initial + 2 retries) for slow connections
};

// Get poster size based on user settings
function getPosterSize() {
    const settings = window.userSettings || JSON.parse(localStorage.getItem('movietrack_settings') || '{}');
    const quality = settings.posterQuality || 'medium';
    
    // TMDB poster sizes: w92, w154, w185, w342, w500, w780, original
    switch(quality) {
        case 'low':
            return 'w185';  // Small, fast loading
        case 'medium':
            return 'w342';  // Balanced quality/size
        case 'high':
            return 'w780';  // High quality, larger files
        default:
            return 'w342';
    }
}

// Simple in-memory cache for search results
const searchCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for better mobile experience

// Helper function to get cached data from localStorage
function getCachedSearch(cacheKey) {
    try {
        const cached = localStorage.getItem(`tmdb_${cacheKey}`);
        if (cached) {
            const data = JSON.parse(cached);
            if (Date.now() - data.timestamp < CACHE_DURATION) {
                return data.results;
            }
            // Remove expired cache
            localStorage.removeItem(`tmdb_${cacheKey}`);
        }
    } catch (e) {
        console.error('Cache read error:', e);
    }
    return null;
}

// Helper function to save search results to localStorage
function saveCachedSearch(cacheKey, results) {
    try {
        localStorage.setItem(`tmdb_${cacheKey}`, JSON.stringify({
            results,
            timestamp: Date.now()
        }));
    } catch (e) {
        console.error('Cache save error:', e);
    }
}

// Helper function for fetch with timeout and retry
async function fetchWithTimeout(url, options = {}, timeout = TMDB_CONFIG.TIMEOUT, retries = TMDB_CONFIG.MAX_RETRIES, onRetry = null) {
    let lastError = null;
    
    for (let i = 0; i <= retries; i++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            if (i > 0 && onRetry) {
                onRetry(i, retries + 1); // Notify about retry attempt
            }
            
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            lastError = error;
            
            // If it's the last retry, throw the error
            if (i === retries) {
                throw error;
            }
            
            // Wait before retrying (progressive delay: 2s, 4s)
            const delay = Math.min(2000 * Math.pow(2, i), 5000);
            console.log(`Retry ${i + 1}/${retries + 1} after ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    throw lastError;
}

const TMDB = {
    // Search movies with loading state and caching
    async searchMovies(query, onLoading = null, onRetry = null) {
        if (!query || query.trim().length < 2) {
            return { results: [], loading: false };
        }
        
        // Get user settings for language, region, and adult content
        const settings = window.userSettings || JSON.parse(localStorage.getItem('movietrack_settings') || '{}');
        const language = settings.defaultLanguage || 'en';
        const region = settings.defaultRegion || 'IN'; // Default to India
        const includeAdult = settings.includeAdultContent || false;
        
        const cacheKey = `movie_${query.toLowerCase()}_${language}_${region}_${includeAdult}`;
        
        // Check localStorage cache first (persists across page reloads)
        const localCached = getCachedSearch(cacheKey);
        if (localCached) {
            console.log('📦 Returning localStorage cached results for:', query);
            return { ...localCached, fromCache: true, loading: false };
        }
        
        // Check memory cache
        const cached = searchCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log('📦 Returning memory cached results for:', query);
            return { ...cached.data, fromCache: true };
        }
        
        try {
            if (onLoading) onLoading(true);
            
            const response = await fetchWithTimeout(
                `${TMDB_CONFIG.BASE_URL}/search/movie?api_key=${TMDB_CONFIG.API_KEY}&query=${encodeURIComponent(query)}&language=${language}-${region}&region=${region}&include_adult=${includeAdult}&page=1`,
                {},
                TMDB_CONFIG.TIMEOUT,
                TMDB_CONFIG.MAX_RETRIES,
                onRetry // Pass retry callback
            );
            
            if (!response.ok) {
                throw new Error('Failed to search movies');
            }
            
            const data = await response.json();
            const result = { ...data, loading: false };
            
            // Cache in both memory and localStorage
            searchCache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });
            saveCachedSearch(cacheKey, result);
            
            if (onLoading) onLoading(false);
            return result;
        } catch (error) {
            console.error('TMDB search error:', error);
            if (onLoading) onLoading(false);
            
            // Return error info so UI can show appropriate message
            return { 
                results: [], 
                loading: false,
                error: error.name === 'AbortError' ? 'timeout' : 'network',
                message: error.name === 'AbortError' 
                    ? 'Connection timeout after 3 attempts. Check your internet connection.' 
                    : 'Network error. Please check your connection and try again.'
            };
        }
    },
    
    // Search TV shows with loading state and caching
    async searchTVShows(query, onLoading = null, onRetry = null) {
        if (!query || query.trim().length < 2) {
            return { results: [], loading: false };
        }
        
        // Get user settings for language, region, and adult content
        const settings = window.userSettings || JSON.parse(localStorage.getItem('movietrack_settings') || '{}');
        const language = settings.defaultLanguage || 'en';
        const region = settings.defaultRegion || 'IN'; // Default to India
        const includeAdult = settings.includeAdultContent || false;
        
        const cacheKey = `tv_${query.toLowerCase()}_${language}_${region}_${includeAdult}`;
        
        // Check localStorage cache first
        const localCached = getCachedSearch(cacheKey);
        if (localCached) {
            console.log('📦 Returning localStorage cached results for:', query);
            return { ...localCached, fromCache: true, loading: false };
        }
        
        // Check memory cache
        const cached = searchCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log('📦 Returning memory cached results for:', query);
            return { ...cached.data, fromCache: true };
        }
        
        try {
            if (onLoading) onLoading(true);
            
            const response = await fetchWithTimeout(
                `${TMDB_CONFIG.BASE_URL}/search/tv?api_key=${TMDB_CONFIG.API_KEY}&query=${encodeURIComponent(query)}&language=${language}-${region}&include_adult=${includeAdult}&page=1`,
                {},
                TMDB_CONFIG.TIMEOUT,
                TMDB_CONFIG.MAX_RETRIES,
                onRetry // Pass retry callback
            );
            
            if (!response.ok) {
                throw new Error('Failed to search TV shows');
            }
            
            const data = await response.json();
            const result = { ...data, loading: false };
            
            // Cache in both memory and localStorage
            searchCache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });
            saveCachedSearch(cacheKey, result);
            
            if (onLoading) onLoading(false);
            return result;
        } catch (error) {
            console.error('TMDB TV search error:', error);
            if (onLoading) onLoading(false);
            
            return { 
                results: [], 
                loading: false,
                error: error.name === 'AbortError' ? 'timeout' : 'network',
                message: error.name === 'AbortError' 
                    ? 'Connection timeout after 3 attempts. Check your internet connection.' 
                    : 'Network error. Please check your connection and try again.'
            };
        }
    },
    
    // Get movie details
    async getMovieDetails(tmdbId) {
        try {
            const response = await fetchWithTimeout(
                `${TMDB_CONFIG.BASE_URL}/movie/${tmdbId}?api_key=${TMDB_CONFIG.API_KEY}&language=en-US&append_to_response=credits`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch movie details');
            }
            
            const data = await response.json();
            return this.formatMovieData(data);
        } catch (error) {
            console.error('TMDB details error:', error);
            
            // Show user-friendly error message
            if (error.name === 'AbortError') {
                alert('⚠️ Request timed out. Please check your internet connection and try again.');
            } else {
                alert('⚠️ Failed to load movie details. Please try again.');
            }
            return null;
        }
    },
    
    // Get TV show details
    async getTVShowDetails(tmdbId) {
        try {
            const response = await fetchWithTimeout(
                `${TMDB_CONFIG.BASE_URL}/tv/${tmdbId}?api_key=${TMDB_CONFIG.API_KEY}&language=en-US&append_to_response=credits`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch TV show details');
            }
            
            const data = await response.json();
            
            // Get season details with episode counts
            const seasonDetails = [];
            if (data.seasons) {
                for (const season of data.seasons) {
                    // Skip "Season 0" (specials)
                    if (season.season_number > 0) {
                        seasonDetails.push({
                            seasonNumber: season.season_number,
                            episodeCount: season.episode_count
                        });
                    }
                }
            }
            
            return this.formatTVShowData(data, seasonDetails);
        } catch (error) {
            console.error('TMDB TV details error:', error);
            
            // Show user-friendly error message
            if (error.name === 'AbortError') {
                alert('⚠️ Request timed out. Please check your internet connection and try again.');
            } else {
                alert('⚠️ Failed to load TV show details. Please try again.');
            }
            return null;
        }
    },
    
    // Format movie data for our app
    formatMovieData(tmdbMovie) {
        const formatted = {
            type: 'movie',
            tmdbId: tmdbMovie.id,
            title: tmdbMovie.title,
            year: tmdbMovie.release_date ? new Date(tmdbMovie.release_date).getFullYear() : null,
            poster: tmdbMovie.poster_path 
                ? `${TMDB_CONFIG.IMAGE_BASE_URL}/${getPosterSize()}${tmdbMovie.poster_path}`
                : null,
            backdrop: tmdbMovie.backdrop_path
                ? `${TMDB_CONFIG.IMAGE_BASE_URL}/${TMDB_CONFIG.BACKDROP_SIZE}${tmdbMovie.backdrop_path}`
                : null,
            genre: tmdbMovie.genres ? tmdbMovie.genres.map(g => g.name) : [],
            plot: tmdbMovie.overview || '',
            runtime: tmdbMovie.runtime || 0,
            imdbRating: tmdbMovie.vote_average || 0,
            director: tmdbMovie.credits && tmdbMovie.credits.crew 
                ? (tmdbMovie.credits.crew.find(c => c.job === 'Director')?.name || '')
                : '',
            cast: tmdbMovie.credits && tmdbMovie.credits.cast
                ? tmdbMovie.credits.cast.slice(0, 5).map(c => c.name)
                : []
        };
        
        console.log('🎬 TMDB Formatted Movie Data:', formatted);
        console.log('🖼️ Poster URL:', formatted.poster);
        console.log('🖼️ Backdrop URL:', formatted.backdrop);
        
        return formatted;
    },
    
    // Format TV show data for our app
    formatTVShowData(tmdbTV, seasonDetails = []) {
        const formatted = {
            type: 'tv',
            tmdbId: tmdbTV.id,
            title: tmdbTV.name,
            year: tmdbTV.first_air_date ? new Date(tmdbTV.first_air_date).getFullYear() : null,
            poster: tmdbTV.poster_path 
                ? `${TMDB_CONFIG.IMAGE_BASE_URL}/${getPosterSize()}${tmdbTV.poster_path}`
                : null,
            backdrop: tmdbTV.backdrop_path
                ? `${TMDB_CONFIG.IMAGE_BASE_URL}/${TMDB_CONFIG.BACKDROP_SIZE}${tmdbTV.backdrop_path}`
                : null,
            genre: tmdbTV.genres ? tmdbTV.genres.map(g => g.name) : [],
            plot: tmdbTV.overview || '',
            imdbRating: tmdbTV.vote_average || 0,
            numberOfSeasons: tmdbTV.number_of_seasons || 0,
            numberOfEpisodes: tmdbTV.number_of_episodes || 0,
            seasonDetails: seasonDetails, // Array of {seasonNumber, episodeCount}
            cast: tmdbTV.credits && tmdbTV.credits.cast
                ? tmdbTV.credits.cast.slice(0, 5).map(c => c.name)
                : []
        };
        
        console.log('📺 TMDB Formatted TV Show Data:', formatted);
        console.log('🖼️ Poster URL:', formatted.poster);
        console.log('📊 Seasons:', formatted.numberOfSeasons, 'Episodes:', formatted.numberOfEpisodes);
        
        return formatted;
    },
    
    // Get poster URL
    getPosterUrl(posterPath) {
        if (!posterPath) return null;
        return `${TMDB_CONFIG.IMAGE_BASE_URL}/${TMDB_CONFIG.POSTER_SIZE}${posterPath}`;
    },
    
    // Get backdrop URL
    getBackdropUrl(backdropPath) {
        if (!backdropPath) return null;
        return `${TMDB_CONFIG.IMAGE_BASE_URL}/${TMDB_CONFIG.BACKDROP_SIZE}${backdropPath}`;
    },
    
    // Get movie recommendations
    async getMovieRecommendations(tmdbId, limit = 10) {
        try {
            const response = await fetch(
                `${TMDB_CONFIG.BASE_URL}/movie/${tmdbId}/recommendations?api_key=${TMDB_CONFIG.API_KEY}&language=en-US&page=1`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch recommendations');
            }
            
            const data = await response.json();
            return data.results.slice(0, limit).map(movie => ({
                tmdbId: movie.id,
                title: movie.title,
                year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
                poster: movie.poster_path 
                    ? `${TMDB_CONFIG.IMAGE_BASE_URL}/${getPosterSize()}${movie.poster_path}`
                    : null,
                rating: movie.vote_average || 0,
                type: 'movie'
            }));
        } catch (error) {
            console.error('TMDB recommendations error:', error);
            return [];
        }
    },
    
    // Get TV show recommendations
    async getTVRecommendations(tmdbId, limit = 10) {
        try {
            const response = await fetch(
                `${TMDB_CONFIG.BASE_URL}/tv/${tmdbId}/recommendations?api_key=${TMDB_CONFIG.API_KEY}&language=en-US&page=1`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch recommendations');
            }
            
            const data = await response.json();
            return data.results.slice(0, limit).map(show => ({
                tmdbId: show.id,
                title: show.name,
                year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : null,
                poster: show.poster_path 
                    ? `${TMDB_CONFIG.IMAGE_BASE_URL}/${getPosterSize()}${show.poster_path}`
                    : null,
                rating: show.vote_average || 0,
                type: 'tv'
            }));
        } catch (error) {
            console.error('TMDB TV recommendations error:', error);
            return [];
        }
    },
    
    // Get trending content
    async getTrending(mediaType = 'all', timeWindow = 'week', limit = 20) {
        try {
            const response = await fetch(
                `${TMDB_CONFIG.BASE_URL}/trending/${mediaType}/${timeWindow}?api_key=${TMDB_CONFIG.API_KEY}`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch trending content');
            }
            
            const data = await response.json();
            return data.results.slice(0, limit).map(item => ({
                tmdbId: item.id,
                title: item.title || item.name,
                year: (item.release_date || item.first_air_date) 
                    ? new Date(item.release_date || item.first_air_date).getFullYear() 
                    : null,
                poster: item.poster_path 
                    ? `${TMDB_CONFIG.IMAGE_BASE_URL}/${getPosterSize()}${item.poster_path}`
                    : null,
                rating: item.vote_average || 0,
                type: item.media_type || mediaType
            }));
        } catch (error) {
            console.error('TMDB trending error:', error);
            return [];
        }
    },
    
    // Discover content by genre
    async discoverByGenre(mediaType, genreId, limit = 10) {
        try {
            const response = await fetch(
                `${TMDB_CONFIG.BASE_URL}/discover/${mediaType}?api_key=${TMDB_CONFIG.API_KEY}&with_genres=${genreId}&sort_by=vote_average.desc&vote_count.gte=100`
            );
            
            if (!response.ok) {
                throw new Error('Failed to discover by genre');
            }
            
            const data = await response.json();
            return data.results.slice(0, limit).map(item => ({
                tmdbId: item.id,
                title: item.title || item.name,
                year: (item.release_date || item.first_air_date) 
                    ? new Date(item.release_date || item.first_air_date).getFullYear() 
                    : null,
                poster: item.poster_path 
                    ? `${TMDB_CONFIG.IMAGE_BASE_URL}/${getPosterSize()}${item.poster_path}`
                    : null,
                rating: item.vote_average || 0,
                type: mediaType
            }));
        } catch (error) {
            console.error('TMDB discover by genre error:', error);
            return [];
        }
    },

    // Get streaming providers for a movie/TV show
    async getStreamingProviders(tmdbId, type = 'movie') {
        try {
            const settings = window.userSettings || JSON.parse(localStorage.getItem('movietrack_settings') || '{}');
            const region = settings.defaultRegion || 'IN'; // Default to India
            
            const endpoint = type === 'movie' ? 'movie' : 'tv';
            const response = await fetchWithTimeout(
                `${TMDB_CONFIG.BASE_URL}/${endpoint}/${tmdbId}/watch/providers?api_key=${TMDB_CONFIG.API_KEY}`
            );
            
            if (!response.ok) {
                console.warn('No streaming providers found');
                return [];
            }
            
            const data = await response.json();
            const providers = data.results && data.results[region];
            
            if (!providers) {
                console.log(`No streaming providers available in ${region}`);
                return [];
            }
            
            const streamingServices = [];
            
            // Flatten all provider types (flatrate, rent, buy)
            const allProviders = [
                ...(providers.flatrate || []),
                ...(providers.rent || []),
                ...(providers.buy || [])
            ];
            
            // Remove duplicates by provider_id
            const uniqueProviders = Array.from(
                new Map(allProviders.map(p => [p.provider_id, p])).values()
            );
            
            uniqueProviders.forEach(provider => {
                streamingServices.push({
                    service: provider.provider_name,
                    link: providers.link || '',
                    logoPath: provider.logo_path 
                        ? `${TMDB_CONFIG.IMAGE_BASE_URL}/original${provider.logo_path}`
                        : null
                });
            });
            
            console.log(`Found ${streamingServices.length} streaming services for ${type} ${tmdbId} in ${region}`);
            return streamingServices;
        } catch (error) {
            console.error('Error fetching streaming providers:', error);
            return [];
        }
    }
};


