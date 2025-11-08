const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Movie = require('../models/Movie');
const ActivityLog = require('../models/ActivityLog');
const { protect } = require('../middleware/auth');

// All routes are protected (require authentication)
router.use(protect);

// @route   GET /api/movies
// @desc    Get all movies for logged in user
// @access  Private
router.get('/', async (req, res) => {
    try {
        const { status, sort } = req.query;
        
        // Build query
        let query = { user: req.user.id };
        
        if (status && ['watched', 'watchlist'].includes(status)) {
            query.status = status;
        }
        
        // Sort options
        let sortOption = { addedAt: -1 }; // Default: newest first
        
        if (sort === 'title') {
            sortOption = { title: 1 };
        } else if (sort === 'year') {
            sortOption = { year: -1 };
        } else if (sort === 'rating') {
            sortOption = { rating: -1 };
        }
        
        const movies = await Movie.find(query).sort(sortOption);
        
        res.json({
            success: true,
            count: movies.length,
            movies
        });
    } catch (error) {
        console.error('Get movies error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching movies'
        });
    }
});

// @route   GET /api/movies/stats
// @desc    Get user's movie statistics
// @access  Private
router.get('/stats', async (req, res) => {
    try {
        const movies = await Movie.find({ user: req.user.id });
        
        const totalMovies = movies.length;
        const watchedMovies = movies.filter(m => m.status === 'watched').length;
        const watchlistMovies = movies.filter(m => m.status === 'watchlist').length;
        
        // Calculate average rating (only for rated movies)
        const ratedMovies = movies.filter(m => m.rating > 0);
        const avgRating = ratedMovies.length > 0
            ? (ratedMovies.reduce((sum, m) => sum + m.rating, 0) / ratedMovies.length).toFixed(1)
            : 0;
        
        res.json({
            success: true,
            stats: {
                totalMovies,
                watchedMovies,
                watchlistMovies,
                avgRating: parseFloat(avgRating)
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching statistics'
        });
    }
});

// @route   GET /api/movies/calendar/:year/:month
// @desc    Get watch history calendar for a specific month
// @access  Private
router.get('/calendar/:year/:month', async (req, res) => {
    try {
        const { year, month } = req.params;
        
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        
        const movies = await Movie.find({
            user: req.user.id,
            watchedDate: {
                $gte: startDate,
                $lte: endDate
            }
        }).sort({ watchedDate: 1 });
        
        // Group by date
        const calendar = {};
        movies.forEach(movie => {
            const dateKey = movie.watchedDate.toISOString().split('T')[0];
            if (!calendar[dateKey]) {
                calendar[dateKey] = [];
            }
            calendar[dateKey].push({
                _id: movie._id,
                title: movie.title,
                type: movie.type,
                poster: movie.poster,
                rating: movie.rating,
                year: movie.year
            });
        });
        
        res.json({
            success: true,
            year: parseInt(year),
            month: parseInt(month),
            calendar
        });
    } catch (error) {
        console.error('Get calendar error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching calendar'
        });
    }
});

// @route   GET /api/movies/tags
// @desc    Get all custom tags used by user
// @access  Private
router.get('/tags', async (req, res) => {
    try {
        const movies = await Movie.find({ user: req.user.id });
        
        const allTags = new Set();
        movies.forEach(movie => {
            if (movie.customTags) {
                movie.customTags.forEach(tag => allTags.add(tag));
            }
        });
        
        res.json({
            success: true,
            tags: Array.from(allTags).sort()
        });
    } catch (error) {
        console.error('Get tags error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching tags'
        });
    }
});

// @route   GET /api/movies/lists
// @desc    Get all custom lists used by user
// @access  Private
router.get('/lists', async (req, res) => {
    try {
        const movies = await Movie.find({ user: req.user.id });
        
        const allLists = new Set();
        const listDetails = {};
        
        movies.forEach(movie => {
            if (movie.customLists) {
                movie.customLists.forEach(list => {
                    allLists.add(list);
                    if (!listDetails[list]) {
                        listDetails[list] = {
                            name: list,
                            count: 0,
                            movies: []
                        };
                    }
                    listDetails[list].count++;
                    listDetails[list].movies.push({
                        _id: movie._id,
                        title: movie.title,
                        poster: movie.poster,
                        year: movie.year
                    });
                });
            }
        });
        
        res.json({
            success: true,
            lists: Array.from(allLists).sort(),
            details: listDetails
        });
    } catch (error) {
        console.error('Get lists error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching lists'
        });
    }
});

// @route   GET /api/movies/:id
// @desc    Get single movie
// @access  Private
router.get('/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        
        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found'
            });
        }
        
        // Make sure user owns the movie
        if (movie.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this movie'
            });
        }
        
        res.json({
            success: true,
            movie
        });
    } catch (error) {
        console.error('Get movie error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching movie'
        });
    }
});

// @route   POST /api/movies
// @desc    Add new movie/TV show
// @access  Private
router.post('/', [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('status').isIn(['watched', 'watching', 'watchlist']).withMessage('Status must be watched, watching, or watchlist')
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    
    try {
        const { 
            type, title, year, status, rating, notes,
            // TMDB fields
            tmdbId, poster, backdrop, genre, director, cast, 
            runtime, plot, imdbRating, watchedDate,
            // TV Show fields
            numberOfSeasons, numberOfEpisodes, currentSeason, currentEpisode, seasonDetails
        } = req.body;
        
        console.log('📥 Received data:', { type, title, poster, genre });
        
        const movie = await Movie.create({
            user: req.user.id,
            type: type || 'movie',
            title,
            year: year || new Date().getFullYear(),
            status,
            rating: rating || 0,
            notes,
            // Include TMDB fields
            tmdbId,
            poster,
            backdrop,
            genre,
            director,
            cast,
            runtime,
            plot,
            imdbRating,
            watchedDate,
            // TV Show fields
            numberOfSeasons,
            numberOfEpisodes,
            currentSeason,
            currentEpisode,
            seasonDetails
        });
        
        console.log('💾 Saved to database:', { type: movie.type, title: movie.title, poster: movie.poster });

        // Log activity
        await ActivityLog.create({
            userId: req.user.id,
            userName: req.user.name,
            action: 'add_movie',
            details: `Added ${type || 'movie'}: ${title}`,
            ipAddress: req.ip
        });
        
        res.status(201).json({
            success: true,
            message: 'Movie added successfully',
            movie
        });
    } catch (error) {
        console.error('Add movie error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while adding movie'
        });
    }
});

// @route   PUT /api/movies/:id
// @desc    Update movie
// @access  Private
router.put('/:id', async (req, res) => {
    try {
        let movie = await Movie.findById(req.params.id);
        
        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found'
            });
        }
        
        // Make sure user owns the movie
        if (movie.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to update this movie'
            });
        }
        
        movie = await Movie.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        // Log activity
        await ActivityLog.create({
            userId: req.user.id,
            userName: req.user.name,
            action: 'update_movie',
            details: `Updated ${movie.type || 'movie'}: ${movie.title}`,
            ipAddress: req.ip
        });
        
        res.json({
            success: true,
            message: 'Movie updated successfully',
            movie
        });
    } catch (error) {
        console.error('Update movie error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating movie'
        });
    }
});

// @route   DELETE /api/movies/:id
// @desc    Delete movie
// @access  Private
router.delete('/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        
        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found'
            });
        }
        
        // Make sure user owns the movie
        if (movie.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to delete this movie'
            });
        }
        
        await movie.deleteOne();

        // Log activity
        await ActivityLog.create({
            userId: req.user.id,
            userName: req.user.name,
            action: 'delete_movie',
            details: `Deleted ${movie.type || 'movie'}: ${movie.title}`,
            ipAddress: req.ip
        });
        
        res.json({
            success: true,
            message: 'Movie deleted successfully'
        });
    } catch (error) {
        console.error('Delete movie error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting movie'
        });
    }
});

// @route   POST /api/movies/:id/tags
// @desc    Add custom tags to a movie
// @access  Private
router.post('/:id/tags', async (req, res) => {
    try {
        const { tags } = req.body;
        
        if (!Array.isArray(tags)) {
            return res.status(400).json({
                success: false,
                message: 'Tags must be an array'
            });
        }
        
        const movie = await Movie.findById(req.params.id);
        
        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found'
            });
        }
        
        if (movie.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }
        
        // Add unique tags
        const uniqueTags = [...new Set([...movie.customTags, ...tags])];
        movie.customTags = uniqueTags;
        
        await movie.save();
        
        res.json({
            success: true,
            movie
        });
    } catch (error) {
        console.error('Add tags error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while adding tags'
        });
    }
});

// @route   DELETE /api/movies/:id/tags
// @desc    Remove custom tags from a movie
// @access  Private
router.delete('/:id/tags', async (req, res) => {
    try {
        const { tags } = req.body;
        
        const movie = await Movie.findById(req.params.id);
        
        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found'
            });
        }
        
        if (movie.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }
        
        movie.customTags = movie.customTags.filter(tag => !tags.includes(tag));
        await movie.save();
        
        res.json({
            success: true,
            movie
        });
    } catch (error) {
        console.error('Remove tags error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while removing tags'
        });
    }
});

// @route   POST /api/movies/:id/lists
// @desc    Add movie to custom lists
// @access  Private
router.post('/:id/lists', async (req, res) => {
    try {
        const { lists } = req.body;
        
        if (!Array.isArray(lists)) {
            return res.status(400).json({
                success: false,
                message: 'Lists must be an array'
            });
        }
        
        const movie = await Movie.findById(req.params.id);
        
        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found'
            });
        }
        
        if (movie.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }
        
        const uniqueLists = [...new Set([...movie.customLists, ...lists])];
        movie.customLists = uniqueLists;
        
        await movie.save();
        
        res.json({
            success: true,
            movie
        });
    } catch (error) {
        console.error('Add to lists error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while adding to lists'
        });
    }
});

// @route   POST /api/movies/:id/episodes
// @desc    Mark episode as watched
// @access  Private
router.post('/:id/episodes', async (req, res) => {
    try {
        const { seasonNumber, episodeNumber, rating } = req.body;
        
        const movie = await Movie.findById(req.params.id);
        
        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found'
            });
        }
        
        if (movie.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }
        
        if (movie.type !== 'tv') {
            return res.status(400).json({
                success: false,
                message: 'Episode tracking is only for TV shows'
            });
        }
        
        // Check if episode already marked
        const existingIndex = movie.watchedEpisodes.findIndex(
            ep => ep.seasonNumber === seasonNumber && ep.episodeNumber === episodeNumber
        );
        
        if (existingIndex >= 0) {
            // Update existing
            movie.watchedEpisodes[existingIndex].watchedDate = new Date();
            if (rating) movie.watchedEpisodes[existingIndex].rating = rating;
        } else {
            // Add new
            movie.watchedEpisodes.push({
                seasonNumber,
                episodeNumber,
                watchedDate: new Date(),
                rating: rating || 0
            });
        }
        
        // Update current season/episode
        movie.currentSeason = seasonNumber;
        movie.currentEpisode = episodeNumber;
        
        await movie.save();
        
        await ActivityLog.create({
            userId: req.user.id,
            userName: req.user.name,
            action: 'watch_episode',
            details: `Watched ${movie.title} S${seasonNumber}E${episodeNumber}`,
            ipAddress: req.ip
        });
        
        res.json({
            success: true,
            movie
        });
    } catch (error) {
        console.error('Mark episode watched error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while marking episode'
        });
    }
});

// @route   DELETE /api/movies/:id/episodes
// @desc    Unmark episode as watched
// @access  Private
router.delete('/:id/episodes', async (req, res) => {
    try {
        const { seasonNumber, episodeNumber } = req.body;
        
        const movie = await Movie.findById(req.params.id);
        
        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found'
            });
        }
        
        if (movie.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }
        
        movie.watchedEpisodes = movie.watchedEpisodes.filter(
            ep => !(ep.seasonNumber === seasonNumber && ep.episodeNumber === episodeNumber)
        );
        
        await movie.save();
        
        res.json({
            success: true,
            movie
        });
    } catch (error) {
        console.error('Unmark episode error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while unmarking episode'
        });
    }
});

// @route   POST /api/movies/:id/streaming
// @desc    Add streaming availability info
// @access  Private
router.post('/:id/streaming', async (req, res) => {
    try {
        const { service, region, url, quality } = req.body;
        
        const movie = await Movie.findById(req.params.id);
        
        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found'
            });
        }
        
        if (movie.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }
        
        // Check if service already exists
        const existingIndex = movie.streamingServices.findIndex(
            s => s.service === service && s.region === (region || 'US')
        );
        
        if (existingIndex >= 0) {
            // Update existing
            movie.streamingServices[existingIndex] = {
                service,
                region: region || 'US',
                url,
                quality,
                lastChecked: new Date()
            };
        } else {
            // Add new
            movie.streamingServices.push({
                service,
                region: region || 'US',
                url,
                quality,
                lastChecked: new Date()
            });
        }
        
        await movie.save();
        
        res.json({
            success: true,
            movie
        });
    } catch (error) {
        console.error('Add streaming info error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while adding streaming info'
        });
    }
});

module.exports = router;
