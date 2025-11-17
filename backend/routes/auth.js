const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const Announcement = require('../models/Announcement');
const { protect } = require('../middleware/auth');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create user
        user = await User.create({
            name,
            email,
            password
        });

        // Log registration activity
        await ActivityLog.create({
            userId: user._id,
            userName: user.name,
            action: 'register',
            details: `New user registered: ${email}`,
            ipAddress: req.ip
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    const { email, password } = req.body;

    try {
        // Check if user exists (include password for comparison)
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Update last login
        user.lastLogin = Date.now();
        await user.save();

        // Log login activity
        await ActivityLog.create({
            userId: user._id,
            userName: user.name,
            action: 'login',
            details: `User logged in`,
            ipAddress: req.ip
        });

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/auth/update-profile
// @desc    Update user profile (name)
// @access  Private
router.put('/update-profile', protect, [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters')
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    const { name } = req.body;

    try {
        // Update user
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with email and username verification
// @access  Public
router.post('/reset-password', [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('name').trim().notEmpty().withMessage('Username is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    const { email, name, newPassword } = req.body;

    try {
        // Find user by email and name
        const user = await User.findOne({ email, name });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this email and username combination'
            });
        }

        // Update password (will be hashed by the pre-save hook)
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successfully. You can now login with your new password.'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while resetting password'
        });
    }
});

// @route   POST /api/auth/change-password
// @desc    Change user password (authenticated)
// @access  Private
router.post('/change-password', protect, [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: errors.array()[0].msg
        });
    }

    const { currentPassword, newPassword } = req.body;

    try {
        // Get user with password field
        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if current password is correct
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password (will be hashed by the pre-save hook)
        user.password = newPassword;
        await user.save();

        // Log activity
        await ActivityLog.create({
            user: user._id,
            action: 'password_changed',
            details: 'User changed their password'
        });

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while changing password'
        });
    }
});

// @route   PUT /api/auth/update-profile
// @desc    Update user profile
// @access  Private
router.put('/update-profile', protect, [
    body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters')
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: errors.array()[0].msg
        });
    }

    const { name } = req.body;

    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update only allowed fields
        if (name) user.name = name;

        await user.save();

        // Log activity
        await ActivityLog.create({
            user: user._id,
            action: 'profile_updated',
            details: 'User updated their profile'
        });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating profile'
        });
    }
});

// @route   DELETE /api/auth/delete-account
// @desc    Delete user account and all associated data
// @access  Private
router.delete('/delete-account', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Import Movie model to delete user's movies
        const Movie = require('../models/Movie');

        // Delete all user's movies
        await Movie.deleteMany({ user: user._id });

        // Delete all user's activity logs
        await ActivityLog.deleteMany({ user: user._id });

        // Delete the user account
        await User.findByIdAndDelete(user._id);

        res.json({
            success: true,
            message: 'Account and all associated data deleted successfully'
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting account'
        });
    }
});

// @route   GET /api/auth/announcements
// @desc    Get active announcements for users
// @access  Public
router.get('/announcements', async (req, res) => {
    try {
        const announcements = await Announcement.find({ active: true })
            .select('title message type createdAt viewedBy')
            .sort({ createdAt: -1 })
            .limit(20);

        res.json({
            success: true,
            data: announcements
        });
    } catch (error) {
        console.error('Get announcements error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching announcements'
        });
    }
});

// @route   GET /api/auth/announcements/unread
// @desc    Get unread announcement count for user
// @access  Private
router.get('/announcements/unread', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Get user preferences
        const user = await User.findById(userId);
        const mutedTypes = user.notificationPreferences?.mutedTypes || [];
        const muteUntil = user.notificationPreferences?.muteUntil;
        
        // Check if notifications are muted
        const isMuted = muteUntil && new Date(muteUntil) > new Date();
        
        if (isMuted) {
            return res.json({
                success: true,
                count: 0,
                muted: true
            });
        }
        
        // Count announcements not viewed by user and not in muted types
        const unreadCount = await Announcement.countDocuments({
            active: true,
            type: { $nin: mutedTypes },
            'viewedBy.user': { $ne: userId }
        });

        res.json({
            success: true,
            count: unreadCount,
            muted: false
        });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching unread count'
        });
    }
});

// @route   POST /api/auth/announcements/:id/mark-read
// @desc    Mark announcement as read
// @access  Private
router.post('/announcements/:id/mark-read', protect, async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        
        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found'
            });
        }
        
        // Check if already viewed by user
        const alreadyViewed = announcement.viewedBy.some(
            v => v.user.toString() === req.user._id.toString()
        );
        
        if (!alreadyViewed) {
            announcement.viewedBy.push({
                user: req.user._id,
                viewedAt: new Date()
            });
            await announcement.save();
        }

        res.json({
            success: true,
            message: 'Announcement marked as read'
        });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking announcement as read'
        });
    }
});

// @route   PUT /api/auth/notification-preferences
// @desc    Update notification preferences (mute)
// @access  Private
router.put('/notification-preferences', protect, async (req, res) => {
    try {
        const { muteUntil, mutedTypes } = req.body;
        
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Initialize preferences if not exists
        if (!user.notificationPreferences) {
            user.notificationPreferences = {};
        }
        
        if (muteUntil !== undefined) {
            user.notificationPreferences.muteUntil = muteUntil;
        }
        
        if (mutedTypes !== undefined) {
            user.notificationPreferences.mutedTypes = mutedTypes;
        }
        
        await user.save();
        
        // Log activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'update_notification_preferences',
            details: `Updated notification preferences`,
            ipAddress: req.ip
        });

        res.json({
            success: true,
            message: 'Notification preferences updated',
            preferences: user.notificationPreferences
        });
    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating preferences'
        });
    }
});

// @route   GET /api/auth/notification-preferences
// @desc    Get notification preferences
// @access  Private
router.get('/notification-preferences', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        res.json({
            success: true,
            preferences: user.notificationPreferences || {
                muteUntil: null,
                mutedTypes: []
            }
        });
    } catch (error) {
        console.error('Get preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching preferences'
        });
    }
});

module.exports = router;
