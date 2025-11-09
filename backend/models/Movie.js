const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Type: movie or tv
    type: {
        type: String,
        enum: ['movie', 'tv'],
        required: true,
        default: 'movie'
    },
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    year: {
        type: Number,
        min: [1888, 'Year must be after 1888'],
        max: [new Date().getFullYear() + 5, 'Year cannot be too far in the future']
    },
    status: {
        type: String,
        enum: ['watched', 'watchlist', 'watching'],  // Added 'watching' for TV shows
        required: [true, 'Please add a status'],
        default: 'watchlist'
    },
    rating: {
        type: Number,
        min: [0, 'Rating must be at least 0'],
        max: [5, 'Rating cannot exceed 5'],
        default: 0
    },
    notes: {
        type: String,
        maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    // TMDB Integration
    tmdbId: {
        type: Number
    },
    poster: {
        type: String  // URL to poster image
    },
    backdrop: {
        type: String  // URL to backdrop image
    },
    // Additional Details
    genre: [{
        type: String
    }],
    director: {
        type: String,
        maxlength: [200, 'Director name cannot exceed 200 characters']
    },
    cast: [{
        type: String
    }],
    runtime: {
        type: Number,  // in minutes
        min: [0, 'Runtime cannot be negative']
    },
    plot: {
        type: String,
        maxlength: [2000, 'Plot cannot exceed 2000 characters']
    },
    imdbRating: {
        type: Number,
        min: [0, 'Rating must be at least 0'],
        max: [10, 'Rating cannot exceed 10']
    },
    // TV Show Specific Fields
    numberOfSeasons: {
        type: Number,
        min: [0, 'Number of seasons cannot be negative']
    },
    numberOfEpisodes: {
        type: Number,
        min: [0, 'Number of episodes cannot be negative']
    },
    seasonDetails: [{
        seasonNumber: Number,
        episodeCount: Number
    }],
    currentSeason: {
        type: Number,
        min: [0, 'Current season cannot be negative']
    },
    currentEpisode: {
        type: Number,
        min: [0, 'Current episode cannot be negative']
    },
    // Watch Date Tracking
    watchedDate: {
        type: Date
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
MovieSchema.index({ user: 1, addedAt: -1 });
MovieSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Movie', MovieSchema);
