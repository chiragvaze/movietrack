// API Configuration
// API_URL is loaded from config.js
const API_CONFIG = {
    BASE_URL: (typeof API_URL !== 'undefined' ? API_URL : 'http://localhost:5000') + '/api',
    ENDPOINTS: {
        // Authentication
        SIGNUP: '/auth/signup',
        LOGIN: '/auth/login',
        ME: '/auth/me',
        
        // Movies
        MOVIES: '/movies',
        MOVIE_STATS: '/movies/stats'
    }
};

// API Helper Functions
const API = {
    // Base URL for API requests
    baseURL: (typeof API_URL !== 'undefined' ? API_URL : 'http://localhost:5000') + '/api',
    
    // Get auth token from localStorage
    getToken() {
        return localStorage.getItem('token');
    },
    
    // Set auth token
    setToken(token) {
        localStorage.setItem('token', token);
    },
    
    // Remove auth token
    removeToken() {
        localStorage.removeItem('token');
    },
    
    // Get auth headers
    getHeaders(includeAuth = false) {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (includeAuth) {
            const token = this.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        
        return headers;
    },
    
    // Make API request
    async request(endpoint, options = {}) {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        
        try {
            const response = await fetch(url, {
                ...options,
                headers: this.getHeaders(options.auth)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'An error occurred');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    // Authentication APIs
    async signup(name, email, password) {
        const data = await this.request(API_CONFIG.ENDPOINTS.SIGNUP, {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });
        
        if (data.success && data.token) {
            this.setToken(data.token);
        }
        
        return data;
    },
    
    async login(email, password) {
        const data = await this.request(API_CONFIG.ENDPOINTS.LOGIN, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (data.success && data.token) {
            this.setToken(data.token);
        }
        
        return data;
    },
    
    async getCurrentUser() {
        return await this.request(API_CONFIG.ENDPOINTS.ME, {
            auth: true
        });
    },
    
    async updateUserProfile(name) {
        return await this.request('/auth/update-profile', {
            method: 'PUT',
            body: JSON.stringify({ name }),
            auth: true
        });
    },
    
    // Movie APIs
    async getMovies(status = null) {
        const endpoint = status 
            ? `${API_CONFIG.ENDPOINTS.MOVIES}?status=${status}`
            : API_CONFIG.ENDPOINTS.MOVIES;
            
        return await this.request(endpoint, { auth: true });
    },
    
    async getMovieById(id) {
        const response = await this.request(`${API_CONFIG.ENDPOINTS.MOVIES}/${id}`, { auth: true });
        return response.movie || response;
    },
    
    async getMovieStats() {
        return await this.request(API_CONFIG.ENDPOINTS.MOVIE_STATS, { auth: true });
    },
    
    async addMovie(movieData) {
        return await this.request(API_CONFIG.ENDPOINTS.MOVIES, {
            method: 'POST',
            body: JSON.stringify(movieData),
            auth: true
        });
    },
    
    async updateMovie(id, movieData) {
        return await this.request(`${API_CONFIG.ENDPOINTS.MOVIES}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(movieData),
            auth: true
        });
    },
    
    async deleteMovie(id) {
        return await this.request(`${API_CONFIG.ENDPOINTS.MOVIES}/${id}`, {
            method: 'DELETE',
            auth: true
        });
    },
    
    // Tags & Lists APIs
    async getTags() {
        return await this.request('/movies/tags', { auth: true });
    },
    
    async getLists() {
        return await this.request('/movies/lists', { auth: true });
    },
    
    async addTags(movieId, tags) {
        return await this.request(`/movies/${movieId}/tags`, {
            method: 'POST',
            body: JSON.stringify({ tags }),
            auth: true
        });
    },
    
    async removeTags(movieId, tags) {
        return await this.request(`/movies/${movieId}/tags`, {
            method: 'DELETE',
            body: JSON.stringify({ tags }),
            auth: true
        });
    },
    
    async addToLists(movieId, lists) {
        return await this.request(`/movies/${movieId}/lists`, {
            method: 'POST',
            body: JSON.stringify({ lists }),
            auth: true
        });
    },
    
    // Episode Tracking APIs
    async markEpisodeWatched(movieId, seasonNumber, episodeNumber, rating = null) {
        return await this.request(`/movies/${movieId}/episodes`, {
            method: 'POST',
            body: JSON.stringify({ seasonNumber, episodeNumber, rating }),
            auth: true
        });
    },
    
    async unmarkEpisode(movieId, seasonNumber, episodeNumber) {
        return await this.request(`/movies/${movieId}/episodes`, {
            method: 'DELETE',
            body: JSON.stringify({ seasonNumber, episodeNumber }),
            auth: true
        });
    },
    
    // Streaming APIs
    async addStreamingInfo(movieId, service, region = 'US', url = '', quality = '') {
        return await this.request(`/movies/${movieId}/streaming`, {
            method: 'POST',
            body: JSON.stringify({ service, region, url, quality }),
            auth: true
        });
    },
    
    // Calendar API
    async getCalendar(year, month) {
        return await this.request(`/movies/calendar/${year}/${month}`, { auth: true });
    },
    
    // Logout
    logout() {
        this.removeToken();
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
};
