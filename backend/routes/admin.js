const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const Movie = require('../models/Movie');
const ActivityLog = require('../models/ActivityLog');
const Announcement = require('../models/Announcement');

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

// @route   POST /api/admin/users/bulk-ban
// @desc    Ban multiple users
// @access  Private/Admin
router.post('/users/bulk-ban', protect, adminOnly, async (req, res) => {
    try {
        const { userIds } = req.body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide user IDs to ban'
            });
        }

        // Update all users
        const result = await User.updateMany(
            { _id: { $in: userIds }, role: { $ne: 'admin' } },
            { $set: { status: 'banned' } }
        );

        // Log activity
        for (const userId of userIds) {
            const user = await User.findById(userId);
            if (user && user.role !== 'admin') {
                await logActivity(userId, user.name, 'banned', `Banned by admin ${req.user.name}`, req.ip);
            }
        }

        res.json({
            success: true,
            message: `${result.modifiedCount} user(s) banned successfully`,
            data: { count: result.modifiedCount }
        });
    } catch (error) {
        console.error('Bulk ban error:', error);
        res.status(500).json({
            success: false,
            message: 'Error banning users',
            error: error.message
        });
    }
});

// @route   POST /api/admin/users/bulk-unban
// @desc    Unban multiple users
// @access  Private/Admin
router.post('/users/bulk-unban', protect, adminOnly, async (req, res) => {
    try {
        const { userIds } = req.body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide user IDs to unban'
            });
        }

        // Update all users
        const result = await User.updateMany(
            { _id: { $in: userIds } },
            { $set: { status: 'active' } }
        );

        // Log activity
        for (const userId of userIds) {
            const user = await User.findById(userId);
            if (user) {
                await logActivity(userId, user.name, 'unbanned', `Unbanned by admin ${req.user.name}`, req.ip);
            }
        }

        res.json({
            success: true,
            message: `${result.modifiedCount} user(s) unbanned successfully`,
            data: { count: result.modifiedCount }
        });
    } catch (error) {
        console.error('Bulk unban error:', error);
        res.status(500).json({
            success: false,
            message: 'Error unbanning users',
            error: error.message
        });
    }
});

// @route   POST /api/admin/users/bulk-delete
// @desc    Delete multiple users and their movies
// @access  Private/Admin
router.post('/users/bulk-delete', protect, adminOnly, async (req, res) => {
    try {
        const { userIds } = req.body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide user IDs to delete'
            });
        }

        // Delete users' movies
        await Movie.deleteMany({ user: { $in: userIds } });

        // Delete users (excluding admins)
        const result = await User.deleteMany({
            _id: { $in: userIds },
            role: { $ne: 'admin' }
        });

        // Log activity
        await logActivity(req.user.id, req.user.name, 'bulk_delete_users', `Deleted ${result.deletedCount} users`, req.ip);

        res.json({
            success: true,
            message: `${result.deletedCount} user(s) deleted successfully`,
            data: { count: result.deletedCount }
        });
    } catch (error) {
        console.error('Bulk delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting users',
            error: error.message
        });
    }
});

// ==================== ANNOUNCEMENTS ====================

// @route   GET /api/admin/announcements
// @desc    Get all announcements
// @access  Private/Admin
router.get('/announcements', protect, adminOnly, async (req, res) => {
    try {
        const announcements = await Announcement.find()
            .sort({ createdAt: -1 })
            .populate('createdBy', 'name email');

        res.json({
            success: true,
            data: announcements
        });
    } catch (error) {
        console.error('Get announcements error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching announcements',
            error: error.message
        });
    }
});

// @route   POST /api/admin/announcements
// @desc    Create new announcement
// @access  Private/Admin
router.post('/announcements', protect, adminOnly, async (req, res) => {
    try {
        const { title, message, type, active } = req.body;

        const announcement = await Announcement.create({
            title,
            message,
            type,
            active,
            createdBy: req.user.id
        });

        await logActivity(req.user.id, req.user.name, 'create_announcement', `Created announcement: ${title}`, req.ip);

        res.status(201).json({
            success: true,
            message: 'Announcement created successfully',
            data: announcement
        });
    } catch (error) {
        console.error('Create announcement error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating announcement',
            error: error.message
        });
    }
});

// @route   PATCH /api/admin/announcements/:id
// @desc    Update announcement status
// @access  Private/Admin
router.patch('/announcements/:id', protect, adminOnly, async (req, res) => {
    try {
        const { active } = req.body;

        const announcement = await Announcement.findByIdAndUpdate(
            req.params.id,
            { active },
            { new: true }
        );

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found'
            });
        }

        res.json({
            success: true,
            message: 'Announcement updated successfully',
            data: announcement
        });
    } catch (error) {
        console.error('Update announcement error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating announcement',
            error: error.message
        });
    }
});

// @route   DELETE /api/admin/announcements/:id
// @desc    Delete announcement
// @access  Private/Admin
router.delete('/announcements/:id', protect, adminOnly, async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndDelete(req.params.id);

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found'
            });
        }

        await logActivity(req.user.id, req.user.name, 'delete_announcement', `Deleted announcement: ${announcement.title}`, req.ip);

        res.json({
            success: true,
            message: 'Announcement deleted successfully'
        });
    } catch (error) {
        console.error('Delete announcement error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting announcement',
            error: error.message
        });
    }
});

// ==================== EXPORT ROUTES ====================

// @route   GET /api/admin/export/dashboard
// @desc    Export dashboard data
// @access  Private/Admin
router.get('/export/dashboard', protect, adminOnly, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalMovies = await Movie.countDocuments();
        const activeUsers = await User.countDocuments({ status: 'active' });
        const bannedUsers = await User.countDocuments({ status: 'banned' });

        const now = new Date();
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const newUsersLast7Days = await User.countDocuments({ createdAt: { $gte: last7Days } });
        const newUsersLast30Days = await User.countDocuments({ createdAt: { $gte: last30Days } });

        res.json({
            success: true,
            data: {
                stats: {
                    totalUsers,
                    totalMovies,
                    activeUsers,
                    bannedUsers,
                    newUsersLast7Days,
                    newUsersLast30Days
                },
                exportedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Export dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting dashboard data',
            error: error.message
        });
    }
});

// @route   GET /api/admin/export/users
// @desc    Export users data
// @access  Private/Admin
router.get('/export/users', protect, adminOnly, async (req, res) => {
    try {
        const users = await User.find()
            .select('name email role status createdAt lastLogin')
            .lean();

        // Get movie count for each user
        const usersWithMovieCount = await Promise.all(
            users.map(async (user) => {
                const movieCount = await Movie.countDocuments({ user: user._id });
                return {
                    ...user,
                    movieCount
                };
            })
        );

        res.json({
            success: true,
            data: usersWithMovieCount
        });
    } catch (error) {
        console.error('Export users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting users data',
            error: error.message
        });
    }
});

// @route   GET /api/admin/export/activity
// @desc    Export activity logs
// @access  Private/Admin
router.get('/export/activity', protect, adminOnly, async (req, res) => {
    try {
        const logs = await ActivityLog.find()
            .sort({ timestamp: -1 })
            .limit(1000)
            .lean();

        res.json({
            success: true,
            data: logs
        });
    } catch (error) {
        console.error('Export activity error:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting activity logs',
            error: error.message
        });
    }
});

module.exports = router;
