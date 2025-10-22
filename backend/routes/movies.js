const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Movie = require('../models/Movie');
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

module.exports = router;
