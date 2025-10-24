// OMDb API Service - Fast search for slow connections
const OMDB_CONFIG = {
    API_KEY: 'f6136c3d', // Free OMDb API key
    BASE_URL: 'https://www.omdbapi.com',
    TIMEOUT: 8000, // 8 seconds - OMDb is much faster
    MAX_RETRIES: 1
};

// Cache for OMDb search results
const omdbCache = new Map();
const OMDB_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Helper function to get cached data from localStorage
function getOMDbCachedSearch(cacheKey) {
    try {
        const cached = localStorage.getItem(`omdb_${cacheKey}`);
        if (cached) {
            const data = JSON.parse(cached);
            if (Date.now() - data.timestamp < OMDB_CACHE_DURATION) {
                return data.results;
            }
            localStorage.removeItem(`omdb_${cacheKey}`);
        }
    } catch (e) {
        console.error('OMDb cache read error:', e);
    }
    return null;
}

// Helper function to save search results to localStorage
function saveOMDbCachedSearch(cacheKey, results) {
    try {
        localStorage.setItem(`omdb_${cacheKey}`, JSON.stringify({
            results,
            timestamp: Date.now()
        }));
    } catch (e) {
        console.error('OMDb cache save error:', e);
    }
}

// Fetch with timeout for OMDb
async function omdbFetchWithTimeout(url, timeout = OMDB_CONFIG.TIMEOUT) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

const OMDb = {
    // Search movies - Super fast for autocomplete
    async searchMovies(query, onLoading = null) {
        if (!query || query.trim().length < 2) {
            return { results: [], loading: false };
        }
        
        const cacheKey = `movie_${query.toLowerCase()}`;
        
        // Check localStorage cache first
        const localCached = getOMDbCachedSearch(cacheKey);
        if (localCached) {
            console.log('📦 OMDb: Returning cached results for:', query);
            return { ...localCached, fromCache: true, loading: false };
        }
        
        // Check memory cache
        const cached = omdbCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < OMDB_CACHE_DURATION) {
            console.log('📦 OMDb: Returning memory cached results for:', query);
            return { ...cached.data, fromCache: true };
        }
        
        try {
            if (onLoading) onLoading(true);
            
            const response = await omdbFetchWithTimeout(
                `${OMDB_CONFIG.BASE_URL}/?apikey=${OMDB_CONFIG.API_KEY}&s=${encodeURIComponent(query)}&type=movie`
            );
            
            if (!response.ok) {
                throw new Error('OMDb API request failed');
            }
            
            const data = await response.json();
            
            if (data.Response === 'False') {
                // No results found
                return { results: [], loading: false };
            }
            
            // Transform OMDb format to match our app's format
            const results = data.Search.map(item => ({
                id: item.imdbID,
                title: item.Title,
                year: item.Year,
                poster: item.Poster !== 'N/A' ? item.Poster : null,
                type: item.Type
            }));
            
            const result = { results, loading: false, totalResults: data.totalResults };
            
            // Cache in both memory and localStorage
            omdbCache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });
            saveOMDbCachedSearch(cacheKey, result);
            
            if (onLoading) onLoading(false);
            console.log('✅ OMDb: Search successful for:', query);
            return result;
            
        } catch (error) {
            console.error('OMDb search error:', error);
            if (onLoading) onLoading(false);
            
            return {
                results: [],
                loading: false,
                error: error.name === 'AbortError' ? 'timeout' : 'network',
                message: error.name === 'AbortError'
                    ? 'Search timed out. Please try again.'
                    : 'Network error. Please check your connection.'
            };
        }
    },
    
    // Search TV shows
    async searchTVShows(query, onLoading = null) {
        if (!query || query.trim().length < 2) {
            return { results: [], loading: false };
        }
        
        const cacheKey = `tv_${query.toLowerCase()}`;
        
        // Check localStorage cache
        const localCached = getOMDbCachedSearch(cacheKey);
        if (localCached) {
            console.log('📦 OMDb: Returning cached TV results for:', query);
            return { ...localCached, fromCache: true, loading: false };
        }
        
        // Check memory cache
        const cached = omdbCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < OMDB_CACHE_DURATION) {
            console.log('📦 OMDb: Returning memory cached TV results for:', query);
            return { ...cached.data, fromCache: true };
        }
        
        try {
            if (onLoading) onLoading(true);
            
            const response = await omdbFetchWithTimeout(
                `${OMDB_CONFIG.BASE_URL}/?apikey=${OMDB_CONFIG.API_KEY}&s=${encodeURIComponent(query)}&type=series`
            );
            
            if (!response.ok) {
                throw new Error('OMDb API request failed');
            }
            
            const data = await response.json();
            
            if (data.Response === 'False') {
                return { results: [], loading: false };
            }
            
            // Transform OMDb format
            const results = data.Search.map(item => ({
                id: item.imdbID,
                name: item.Title,
                title: item.Title,
                first_air_date: item.Year,
                year: item.Year,
                poster_path: item.Poster !== 'N/A' ? item.Poster : null,
                poster: item.Poster !== 'N/A' ? item.Poster : null,
                type: item.Type
            }));
            
            const result = { results, loading: false, totalResults: data.totalResults };
            
            // Cache in both memory and localStorage
            omdbCache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });
            saveOMDbCachedSearch(cacheKey, result);
            
            if (onLoading) onLoading(false);
            console.log('✅ OMDb: TV search successful for:', query);
            return result;
            
        } catch (error) {
            console.error('OMDb TV search error:', error);
            if (onLoading) onLoading(false);
            
            return {
                results: [],
                loading: false,
                error: error.name === 'AbortError' ? 'timeout' : 'network',
                message: error.name === 'AbortError'
                    ? 'Search timed out. Please try again.'
                    : 'Network error. Please check your connection.'
            };
        }
    },
    
    // Get movie details by IMDb ID
    async getMovieDetails(imdbId) {
        try {
            const response = await omdbFetchWithTimeout(
                `${OMDB_CONFIG.BASE_URL}/?apikey=${OMDB_CONFIG.API_KEY}&i=${imdbId}&plot=full`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch movie details');
            }
            
            const data = await response.json();
            
            if (data.Response === 'False') {
                throw new Error(data.Error);
            }
            
            // Transform to match our app's format
            return {
                id: data.imdbID,
                title: data.Title,
                year: parseInt(data.Year),
                director: data.Director,
                genre: data.Genre,
                plot: data.Plot,
                poster: data.Poster !== 'N/A' ? data.Poster : null,
                rating: parseFloat(data.imdbRating) || 0,
                runtime: data.Runtime,
                cast: data.Actors,
                imdbRating: data.imdbRating,
                imdbVotes: data.imdbVotes,
                rated: data.Rated,
                released: data.Released,
                awards: data.Awards,
                boxOffice: data.BoxOffice
            };
            
        } catch (error) {
            console.error('OMDb details error:', error);
            throw error;
        }
    },
    
    // Get TV show details by IMDb ID
    async getTVShowDetails(imdbId) {
        try {
            const response = await omdbFetchWithTimeout(
                `${OMDB_CONFIG.BASE_URL}/?apikey=${OMDB_CONFIG.API_KEY}&i=${imdbId}&plot=full`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch TV show details');
            }
            
            const data = await response.json();
            
            if (data.Response === 'False') {
                throw new Error(data.Error);
            }
            
            return {
                id: data.imdbID,
                name: data.Title,
                title: data.Title,
                year: parseInt(data.Year),
                genre: data.Genre,
                plot: data.Plot,
                poster: data.Poster !== 'N/A' ? data.Poster : null,
                rating: parseFloat(data.imdbRating) || 0,
                runtime: data.Runtime,
                cast: data.Actors,
                totalSeasons: parseInt(data.totalSeasons) || 0,
                imdbRating: data.imdbRating,
                imdbVotes: data.imdbVotes,
                rated: data.Rated,
                released: data.Released,
                awards: data.Awards
            };
            
        } catch (error) {
            console.error('OMDb TV details error:', error);
            throw error;
        }
    }
};
