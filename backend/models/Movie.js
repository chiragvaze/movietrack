const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please add a movie title'],
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
        enum: ['watched', 'watchlist'],
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
