const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'login',
            'logout',
            'register',
            'add_movie',
            'delete_movie',
            'update_movie',
            'search',
            'filter_category',
            'password_reset',
            'profile_update',
            'banned',
            'unbanned'
        ]
    },
    details: {
        type: String
    },
    ipAddress: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
ActivityLogSchema.index({ timestamp: -1 });
ActivityLogSchema.index({ userId: 1 });
ActivityLogSchema.index({ action: 1 });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
