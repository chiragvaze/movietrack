const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const Movie = require('../models/Movie');
const ActivityLog = require('../models/ActivityLog');

// Helper function to log activity
const logActivity = async (userId, userName, action, details = '', ipAddress = '') => {
    try {
        await ActivityLog.create({
            userId,
            userName,
            action,
            details,
            ipAddress
        });
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/dashboard', protect, adminOnly, async (req, res) => {
    try {
        const now = new Date();
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Total counts
        const totalUsers = await User.countDocuments();
        const totalMovies = await Movie.countDocuments();
        const activeUsers = await User.countDocuments({ status: 'active' });
        const bannedUsers = await User.countDocuments({ status: 'banned' });

        // Recent stats
        const newUsersLast7Days = await User.countDocuments({
            createdAt: { $gte: last7Days }
        });
        const newUsersLast30Days = await User.countDocuments({
            createdAt: { $gte: last30Days }
        });

        // Active users (logged in last 7 days)
        const activeUsersLast7Days = await User.countDocuments({
            lastLogin: { $gte: last7Days }
        });

        // User growth (last 30 days, day by day)
        const userGrowth = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: last30Days }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Most active users (by movie count)
        const mostActiveUsers = await Movie.aggregate([
            {
                $group: {
                    _id: '$userId',
                    movieCount: { $sum: 1 }
                }
            },
            { $sort: { movieCount: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    userName: '$user.name',
                    userEmail: '$user.email',
                    movieCount: 1
                }
            }
        ]);

        // Recent registrations
        const recentUsers = await User.find()
            .select('name email createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        // Activity summary
        const recentActivity = await ActivityLog.find()
            .sort({ timestamp: -1 })
            .limit(10);

        res.json({
            success: true,
            data: {
                stats: {
                    totalUsers,
                    totalMovies,
                    activeUsers,
                    bannedUsers,
                    newUsersLast7Days,
                    newUsersLast30Days,
                    activeUsersLast7Days
                },
                userGrowth,
                mostActiveUsers,
                recentUsers,
                recentActivity
            }
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data',
            error: error.message
        });
    }
});

// @route   GET /api/admin/users
// @desc    Get all users with filters
// @access  Private/Admin
router.get('/users', protect, adminOnly, async (req, res) => {
    try {
        const { status, search, sort = '-createdAt', page = 1, limit = 20 } = req.query;

        const query = {};
        
        // Filter by status
        if (status) {
            query.status = status;
        }

        // Search by name or email
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('name email role status createdAt lastLogin')
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        // Get movie count for each user
        const usersWithMovieCount = await Promise.all(
            users.map(async (user) => {
                const movieCount = await Movie.countDocuments({ userId: user._id });
                return {
                    ...user.toObject(),
                    movieCount
                };
            })
        );

        res.json({
            success: true,
            data: {
                users: usersWithMovieCount,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
});

// @route   GET /api/admin/users/:id
// @desc    Get single user details
// @access  Private/Admin
router.get('/users/:id', protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('name email role status createdAt lastLogin');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user's movies
        const movies = await Movie.find({ userId: user._id })
            .select('title type poster genre status createdAt')
            .sort({ createdAt: -1 })
            .limit(10);

        // Get user's activity
        const activities = await ActivityLog.find({ userId: user._id })
            .sort({ timestamp: -1 })
            .limit(20);

        res.json({
            success: true,
            data: {
                user: {
                    ...user.toObject(),
                    movieCount: await Movie.countDocuments({ userId: user._id })
                },
                recentMovies: movies,
                recentActivities: activities
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user details',
            error: error.message
        });
    }
});

// @route   PUT /api/admin/users/:id/ban
// @desc    Ban a user
// @access  Private/Admin
router.put('/users/:id/ban', protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role === 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Cannot ban admin users'
            });
        }

        user.status = 'banned';
        await user.save();

        // Log activity
        await logActivity(
            user._id,
            user.name,
            'banned',
            `Banned by admin ${req.user.name}`,
            req.ip
        );

        res.json({
            success: true,
            message: 'User banned successfully',
            data: user
        });
    } catch (error) {
        console.error('Ban user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error banning user',
            error: error.message
        });
    }
});

// @route   PUT /api/admin/users/:id/unban
// @desc    Unban a user
// @access  Private/Admin
router.put('/users/:id/unban', protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.status = 'active';
        await user.save();

        // Log activity
        await logActivity(
            user._id,
            user.name,
            'unbanned',
            `Unbanned by admin ${req.user.name}`,
            req.ip
        );

        res.json({
            success: true,
            message: 'User unbanned successfully',
            data: user
        });
    } catch (error) {
        console.error('Unban user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error unbanning user',
            error: error.message
        });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Private/Admin
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role === 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete admin users'
            });
        }

        // Delete user's movies
        await Movie.deleteMany({ userId: user._id });

        // Delete user's activity logs
        await ActivityLog.deleteMany({ userId: user._id });

        // Delete user
        await user.deleteOne();

        res.json({
            success: true,
            message: 'User and all associated data deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
});

// @route   GET /api/admin/activity-logs
// @desc    Get activity logs
// @access  Private/Admin
router.get('/activity-logs', protect, adminOnly, async (req, res) => {
    try {
        const { action, userId, page = 1, limit = 50 } = req.query;

        const query = {};
        
        if (action) {
            query.action = action;
        }
        
        if (userId) {
            query.userId = userId;
        }

        const logs = await ActivityLog.find(query)
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await ActivityLog.countDocuments(query);

        res.json({
            success: true,
            data: {
                logs,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching activity logs',
            error: error.message
        });
    }
});

// @route   GET /api/admin/stats
// @desc    Get platform statistics
// @access  Private/Admin
router.get('/stats', protect, adminOnly, async (req, res) => {
    try {
        const now = new Date();
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // User statistics by status
        const usersByStatus = await User.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Movies by genre
        const moviesByGenre = await Movie.aggregate([
            { $unwind: '$genre' },
            {
                $group: {
                    _id: '$genre',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Movies by type
        const moviesByType = await Movie.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Daily active users (last 30 days)
        const dailyActiveUsers = await ActivityLog.aggregate([
            {
                $match: {
                    timestamp: { $gte: last30Days },
                    action: 'login'
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                        userId: '$userId'
                    }
                }
            },
            {
                $group: {
                    _id: '$_id.date',
                    activeUsers: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Most popular movies
        const popularMovies = await Movie.aggregate([
            {
                $group: {
                    _id: '$title',
                    count: { $sum: 1 },
                    poster: { $first: '$poster' }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            success: true,
            data: {
                usersByStatus,
                moviesByGenre,
                moviesByType,
                dailyActiveUsers,
                popularMovies
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics',
            error: error.message
        });
    }
});

module.exports = router;
