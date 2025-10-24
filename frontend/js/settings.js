// Settings Page JavaScript

// Default Settings
const DEFAULT_SETTINGS = {
    // Profile
    username: '',
    email: '',
    memberSince: '',
    
    // Appearance
    theme: 'dark',
    defaultView: 'grid',
    cardsPerRow: 4,
    posterQuality: 'high',
    showYear: true,
    showRuntime: true,
    
    // Content
    defaultMediaType: 'both',
    defaultLanguage: 'en',
    defaultRegion: 'US',
    adultContent: false,
    spoilerProtection: false,
    autoFetchPosters: true,
    autoFillDetails: true,
    
    // Notifications
    achievementNotifs: true,
    notifDuration: 5000,
    notifPosition: 'top-right',
    notifSound: false,
    successToasts: true,
    errorToasts: true,
    
    // Dashboard
    defaultDashboard: 'movies',
    defaultSort: 'dateAdded',
    defaultFilter: 'all',
    showQuickStats: true,
    showAnalytics: true,
    showRecommendations: true,
    showRecent: true,
    
    // Recommendations
    recContentBased: true,
    recGenreBased: true,
    recTrending: true,
    recMinRating: 7,
    recPerSection: 10,
    recHideSimilar: false,
    
    // Achievements
    achievementHints: true,
    achievementCelebration: true,
    achievementSort: 'category',
    
    // Accessibility
    fontSize: 'medium',
    reduceMotion: false,
    highContrast: false,
    keyboardShortcuts: true,
    ariaLabels: true,
    
    // Privacy
    analyticsTracking: true
};

// Current Settings
let currentSettings = { ...DEFAULT_SETTINGS };

// Initialize Settings Page
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadSettings();
    loadUserProfile();
    calculateStorageUsage();
    initializeEventListeners();
    initializeNavigation();
});

// Load Settings from LocalStorage
function loadSettings() {
    const savedSettings = localStorage.getItem('movietrack_settings');
    if (savedSettings) {
        currentSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) };
    }
    applySettings();
}

// Apply Settings to UI
function applySettings() {
    // Profile
    document.getElementById('username').value = currentSettings.username || '';
    document.getElementById('email').value = currentSettings.email || '';
    document.getElementById('memberSince').value = currentSettings.memberSince || '';
    
    // Appearance
    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === currentSettings.theme);
    });
    document.getElementById('defaultView').value = currentSettings.defaultView;
    document.getElementById('cardsPerRow').value = currentSettings.cardsPerRow;
    document.getElementById('posterQuality').value = currentSettings.posterQuality;
    document.getElementById('showYear').checked = currentSettings.showYear;
    document.getElementById('showRuntime').checked = currentSettings.showRuntime;
    
    // Content
    document.getElementById('defaultMediaType').value = currentSettings.defaultMediaType;
    document.getElementById('defaultLanguage').value = currentSettings.defaultLanguage;
    document.getElementById('defaultRegion').value = currentSettings.defaultRegion;
    document.getElementById('adultContent').checked = currentSettings.adultContent;
    document.getElementById('spoilerProtection').checked = currentSettings.spoilerProtection;
    document.getElementById('autoFetchPosters').checked = currentSettings.autoFetchPosters;
    document.getElementById('autoFillDetails').checked = currentSettings.autoFillDetails;
    
    // Notifications
    document.getElementById('achievementNotifs').checked = currentSettings.achievementNotifs;
    document.getElementById('notifDuration').value = currentSettings.notifDuration;
    document.getElementById('notifPosition').value = currentSettings.notifPosition;
    document.getElementById('notifSound').checked = currentSettings.notifSound;
    document.getElementById('successToasts').checked = currentSettings.successToasts;
    document.getElementById('errorToasts').checked = currentSettings.errorToasts;
    
    // Dashboard
    document.getElementById('defaultDashboard').value = currentSettings.defaultDashboard;
    document.getElementById('defaultSort').value = currentSettings.defaultSort;
    document.getElementById('defaultFilter').value = currentSettings.defaultFilter;
    document.getElementById('showQuickStats').checked = currentSettings.showQuickStats;
    document.getElementById('showAnalytics').checked = currentSettings.showAnalytics;
    document.getElementById('showRecommendations').checked = currentSettings.showRecommendations;
    document.getElementById('showRecent').checked = currentSettings.showRecent;
    
    // Recommendations
    document.getElementById('recContentBased').checked = currentSettings.recContentBased;
    document.getElementById('recGenreBased').checked = currentSettings.recGenreBased;
    document.getElementById('recTrending').checked = currentSettings.recTrending;
    document.getElementById('recMinRating').value = currentSettings.recMinRating;
    document.getElementById('recPerSection').value = currentSettings.recPerSection;
    document.getElementById('recHideSimilar').checked = currentSettings.recHideSimilar;
    
    // Achievements
    document.getElementById('achievementHints').checked = currentSettings.achievementHints;
    document.getElementById('achievementCelebration').checked = currentSettings.achievementCelebration;
    document.getElementById('achievementSort').value = currentSettings.achievementSort;
    
    // Accessibility
    document.getElementById('fontSize').value = currentSettings.fontSize;
    document.getElementById('reduceMotion').checked = currentSettings.reduceMotion;
    document.getElementById('highContrast').checked = currentSettings.highContrast;
    document.getElementById('keyboardShortcuts').checked = currentSettings.keyboardShortcuts;
    document.getElementById('ariaLabels').checked = currentSettings.ariaLabels;
    
    // Privacy
    document.getElementById('analyticsTracking').checked = currentSettings.analyticsTracking;
}

// Load User Profile
async function loadUserProfile() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            // API returns data.user object
            const user = data.user || data;
            
            currentSettings.username = user.name || '';
            currentSettings.email = user.email || '';
            currentSettings.memberSince = user.createdAt 
                ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })
                : 'N/A';
            
            document.getElementById('username').value = currentSettings.username;
            document.getElementById('email').value = currentSettings.email;
            document.getElementById('memberSince').value = currentSettings.memberSince;
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
    }
}

// Initialize Event Listeners
function initializeEventListeners() {
    // Theme Selection
    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.theme-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSettings.theme = btn.dataset.theme;
            applyTheme(currentSettings.theme);
            // Save theme preference immediately
            localStorage.setItem('movietrack_settings', JSON.stringify(currentSettings));
            showToast(`Theme changed to ${currentSettings.theme}`, 'success');
        });
    });
    
    // Save Settings
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    
    // Reset to Defaults
    document.getElementById('resetDefaultsBtn').addEventListener('click', resetToDefaults);
    
    // Change Password
    document.getElementById('changePasswordBtn').addEventListener('click', changePassword);
    
    // Delete Account
    document.getElementById('deleteAccountBtn').addEventListener('click', deleteAccount);
    
    // Export Data
    document.getElementById('exportJsonBtn').addEventListener('click', () => exportData('json'));
    document.getElementById('exportCsvBtn').addEventListener('click', () => exportData('csv'));
    document.getElementById('exportPdfBtn').addEventListener('click', () => exportData('pdf'));
    
    // Import Data
    document.getElementById('importDataBtn').addEventListener('click', () => {
        document.getElementById('importFile').click();
    });
    document.getElementById('importFile').addEventListener('change', importData);
    
    // Clear Cache
    document.getElementById('clearCacheBtn').addEventListener('click', clearCache);
    
    // Reset Achievements
    document.getElementById('resetAchievementsBtn').addEventListener('click', resetAchievements);
    
    // About Section Links
    const changelogLink = document.getElementById('changelogLink');
    if (changelogLink) {
        changelogLink.addEventListener('click', (e) => {
            e.preventDefault();
            showChangelog();
        });
    }
    
    const helpLink = document.getElementById('helpLink');
    if (helpLink) {
        helpLink.addEventListener('click', (e) => {
            e.preventDefault();
            showHelpFAQ();
        });
    }
    
    const reportBugLink = document.getElementById('reportBugLink');
    if (reportBugLink) {
        reportBugLink.addEventListener('click', (e) => {
            e.preventDefault();
            showReportBug();
        });
    }
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

// Initialize Section Navigation
function initializeNavigation() {
    const navButtons = document.querySelectorAll('.settings-nav-item');
    const sections = document.querySelectorAll('.settings-section');
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const sectionId = btn.dataset.section;
            
            // Update active nav button
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show corresponding section
            sections.forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(`${sectionId}-section`).classList.add('active');
            
            // Scroll to top of content
            document.querySelector('.settings-content').scrollTop = 0;
        });
    });
}

// Save Settings
function saveSettings() {
    // Collect all settings
    const newUsername = document.getElementById('username').value.trim();
    
    currentSettings.defaultView = document.getElementById('defaultView').value;
    currentSettings.cardsPerRow = parseInt(document.getElementById('cardsPerRow').value);
    currentSettings.posterQuality = document.getElementById('posterQuality').value;
    currentSettings.showYear = document.getElementById('showYear').checked;
    currentSettings.showRuntime = document.getElementById('showRuntime').checked;
    
    currentSettings.defaultMediaType = document.getElementById('defaultMediaType').value;
    currentSettings.defaultLanguage = document.getElementById('defaultLanguage').value;
    currentSettings.defaultRegion = document.getElementById('defaultRegion').value;
    currentSettings.adultContent = document.getElementById('adultContent').checked;
    currentSettings.spoilerProtection = document.getElementById('spoilerProtection').checked;
    currentSettings.autoFetchPosters = document.getElementById('autoFetchPosters').checked;
    currentSettings.autoFillDetails = document.getElementById('autoFillDetails').checked;
    
    currentSettings.achievementNotifs = document.getElementById('achievementNotifs').checked;
    currentSettings.notifDuration = parseInt(document.getElementById('notifDuration').value);
    currentSettings.notifPosition = document.getElementById('notifPosition').value;
    currentSettings.notifSound = document.getElementById('notifSound').checked;
    currentSettings.successToasts = document.getElementById('successToasts').checked;
    currentSettings.errorToasts = document.getElementById('errorToasts').checked;
    
    currentSettings.defaultDashboard = document.getElementById('defaultDashboard').value;
    currentSettings.defaultSort = document.getElementById('defaultSort').value;
    currentSettings.defaultFilter = document.getElementById('defaultFilter').value;
    currentSettings.showQuickStats = document.getElementById('showQuickStats').checked;
    currentSettings.showAnalytics = document.getElementById('showAnalytics').checked;
    currentSettings.showRecommendations = document.getElementById('showRecommendations').checked;
    currentSettings.showRecent = document.getElementById('showRecent').checked;
    
    currentSettings.recContentBased = document.getElementById('recContentBased').checked;
    currentSettings.recGenreBased = document.getElementById('recGenreBased').checked;
    currentSettings.recTrending = document.getElementById('recTrending').checked;
    currentSettings.recMinRating = parseInt(document.getElementById('recMinRating').value);
    currentSettings.recPerSection = parseInt(document.getElementById('recPerSection').value);
    currentSettings.recHideSimilar = document.getElementById('recHideSimilar').checked;
    
    currentSettings.achievementHints = document.getElementById('achievementHints').checked;
    currentSettings.achievementCelebration = document.getElementById('achievementCelebration').checked;
    currentSettings.achievementSort = document.getElementById('achievementSort').value;
    
    currentSettings.fontSize = document.getElementById('fontSize').value;
    currentSettings.reduceMotion = document.getElementById('reduceMotion').checked;
    currentSettings.highContrast = document.getElementById('highContrast').checked;
    currentSettings.keyboardShortcuts = document.getElementById('keyboardShortcuts').checked;
    currentSettings.ariaLabels = document.getElementById('ariaLabels').checked;
    
    currentSettings.analyticsTracking = document.getElementById('analyticsTracking').checked;
    
    // Update username if changed
    if (newUsername && newUsername !== currentSettings.username) {
        updateUsername(newUsername);
    }
    
    // Save to localStorage
    localStorage.setItem('movietrack_settings', JSON.stringify(currentSettings));
    
    // Apply settings
    applyTheme(currentSettings.theme);
    applyAccessibilitySettings();
    
    showToast('Settings saved successfully!', 'success');
}

// Update Username
async function updateUsername(newUsername) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/auth/update-profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: newUsername })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentSettings.username = newUsername;
            showToast('Username updated successfully!', 'success');
        } else {
            showToast(data.message || 'Failed to update username', 'error');
            document.getElementById('username').value = currentSettings.username; // Revert
        }
    } catch (error) {
        console.error('Error updating username:', error);
        showToast('Failed to update username', 'error');
        document.getElementById('username').value = currentSettings.username; // Revert
    }
}

// Reset to Defaults
function resetToDefaults() {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
        // Preserve user profile data
        const preservedProfile = {
            username: currentSettings.username,
            email: currentSettings.email,
            memberSince: currentSettings.memberSince
        };
        
        // Reset to defaults
        currentSettings = { ...DEFAULT_SETTINGS, ...preservedProfile };
        localStorage.setItem('movietrack_settings', JSON.stringify(currentSettings));
        
        // Reapply all settings to UI
        applySettings();
        applyTheme(currentSettings.theme);
        applyAccessibilitySettings();
        
        showToast('Settings reset to defaults', 'info');
    }
}

// Apply Theme
function applyTheme(theme) {
    // Remove existing theme class
    document.body.classList.remove('light-theme');
    
    if (theme === 'light') {
        document.body.classList.add('light-theme');
    } else if (theme === 'dark') {
        // Dark theme is default, no class needed
        document.body.classList.remove('light-theme');
    } else if (theme === 'auto') {
        // Auto theme - detect system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (!prefersDark) {
            document.body.classList.add('light-theme');
        }
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (currentSettings.theme === 'auto') {
                if (e.matches) {
                    document.body.classList.remove('light-theme');
                } else {
                    document.body.classList.add('light-theme');
                }
            }
        });
    }
}

// Apply Accessibility Settings
function applyAccessibilitySettings() {
    document.body.classList.toggle('reduce-motion', currentSettings.reduceMotion);
    document.body.classList.toggle('high-contrast', currentSettings.highContrast);
    document.body.setAttribute('data-font-size', currentSettings.fontSize);
}

// Change Password
async function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('Please fill in all password fields', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/auth/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('Password changed successfully!', 'success');
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
        } else {
            showToast(data.message || 'Failed to change password', 'error');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        showToast('An error occurred. Please try again.', 'error');
    }
}

// Delete Account
async function deleteAccount() {
    const confirmed = confirm('⚠️ WARNING: This will permanently delete your account and all your data. This action cannot be undone. Are you absolutely sure?');
    
    if (!confirmed) return;
    
    const doubleConfirm = confirm('Last chance! Type "DELETE" to confirm account deletion.');
    
    if (!doubleConfirm) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/auth/delete-account`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            showToast('Account deleted successfully', 'success');
            setTimeout(() => {
                localStorage.clear();
                window.location.href = 'index.html';
            }, 2000);
        } else {
            showToast('Failed to delete account', 'error');
        }
    } catch (error) {
        console.error('Error deleting account:', error);
        showToast('An error occurred. Please try again.', 'error');
    }
}

// Export Data
async function exportData(format) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/movies`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch movies');
        
        let data = await response.json();
        
        // Extract movies array from response
        let movies = Array.isArray(data) ? data : (data.movies || []);
        
        if (!Array.isArray(movies) || movies.length === 0) {
            showToast('No movies to export', 'info');
            return;
        }
        
        if (format === 'json') {
            exportAsJson(movies);
        } else if (format === 'csv') {
            exportAsCsv(movies);
        } else if (format === 'pdf') {
            exportAsPdf(movies);
        }
    } catch (error) {
        console.error('Error exporting data:', error);
        showToast('Failed to export data', 'error');
    }
}

// Export as JSON
function exportAsJson(movies) {
    if (!Array.isArray(movies) || movies.length === 0) {
        showToast('No movies to export', 'info');
        return;
    }
    
    const dataStr = JSON.stringify(movies, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `movietrack-export-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Data exported as JSON', 'success');
}

// Export as CSV
function exportAsCsv(movies) {
    if (!Array.isArray(movies) || movies.length === 0) {
        showToast('No movies to export', 'info');
        return;
    }
    
    const headers = ['Title', 'Year', 'Director', 'Genre', 'Rating', 'Status', 'Type', 'Runtime', 'Watch Date'];
    const rows = movies.map(movie => [
        movie.title || '',
        movie.year || '',
        movie.director || '',
        movie.genre || '',
        movie.rating || '',
        movie.status || '',
        movie.type || 'movie',
        movie.runtime || '',
        movie.watchDate ? new Date(movie.watchDate).toLocaleDateString() : ''
    ]);
    
    const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
    
    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `movietrack-export-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Data exported as CSV', 'success');
}

// Export as PDF
function exportAsPdf(movies) {
    if (!Array.isArray(movies) || movies.length === 0) {
        showToast('No movies to export', 'info');
        return;
    }
    
    const username = currentSettings.username || 'User';
    const exportDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Calculate statistics
    const totalMovies = movies.length;
    const watchedCount = movies.filter(m => m.status === 'watched').length;
    const avgRating = movies.length > 0 
        ? (movies.reduce((sum, m) => sum + (m.rating || 0), 0) / movies.length).toFixed(1)
        : 0;
    
    // Create PDF content as HTML
    let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>MovieTrack Export - ${username}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 40px;
                    color: #333;
                }
                .header {
                    text-align: center;
                    border-bottom: 3px solid #e50914;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .header h1 {
                    color: #e50914;
                    margin: 0;
                    font-size: 32px;
                }
                .header p {
                    color: #666;
                    margin: 10px 0;
                }
                .stats {
                    display: flex;
                    justify-content: space-around;
                    margin: 30px 0;
                    padding: 20px;
                    background: #f5f5f5;
                    border-radius: 8px;
                }
                .stat-item {
                    text-align: center;
                }
                .stat-value {
                    font-size: 32px;
                    font-weight: bold;
                    color: #e50914;
                }
                .stat-label {
                    color: #666;
                    margin-top: 5px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th {
                    background: #e50914;
                    color: white;
                    padding: 12px;
                    text-align: left;
                    font-weight: bold;
                }
                td {
                    padding: 10px 12px;
                    border-bottom: 1px solid #ddd;
                }
                tr:nth-child(even) {
                    background: #f9f9f9;
                }
                .rating {
                    color: #ffc107;
                    font-weight: bold;
                }
                .status-watched { color: #28a745; }
                .status-watchlist { color: #007bff; }
                .status-watching { color: #ffc107; }
                .footer {
                    margin-top: 40px;
                    text-align: center;
                    color: #999;
                    font-size: 12px;
                    border-top: 1px solid #ddd;
                    padding-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🎬 MovieTrack Export</h1>
                <p><strong>${username}</strong></p>
                <p>Exported on ${exportDate}</p>
            </div>
            
            <div class="stats">
                <div class="stat-item">
                    <div class="stat-value">${totalMovies}</div>
                    <div class="stat-label">Total Movies</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${watchedCount}</div>
                    <div class="stat-label">Watched</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${avgRating} ⭐</div>
                    <div class="stat-label">Avg Rating</div>
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Year</th>
                        <th>Genre</th>
                        <th>Rating</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    movies.forEach((movie, index) => {
        const statusClass = `status-${movie.status}`;
        const stars = '⭐'.repeat(Math.round(movie.rating || 0));
        htmlContent += `
                    <tr>
                        <td>${index + 1}</td>
                        <td><strong>${movie.title}</strong></td>
                        <td>${movie.year}</td>
                        <td>${movie.genre}</td>
                        <td class="rating">${stars} ${movie.rating || 'N/A'}</td>
                        <td class="${statusClass}">${movie.status}</td>
                    </tr>
        `;
    });
    
    htmlContent += `
                </tbody>
            </table>
            
            <div class="footer">
                <p>Generated by MovieTrack v2.3.1 | &copy; ${new Date().getFullYear()}</p>
                <p>This document contains ${totalMovies} movie entries</p>
            </div>
        </body>
        </html>
    `;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = function() {
        printWindow.print();
        showToast('PDF print dialog opened', 'success');
    };
}

// Import Data
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = JSON.parse(e.target.result);
            
            if (!Array.isArray(data)) {
                showToast('Invalid data format. Expected an array of movies.', 'error');
                return;
            }
            
            if (data.length === 0) {
                showToast('No movies found in the file', 'error');
                return;
            }
            
            // Confirm import
            const confirmed = confirm(`Import ${data.length} movies? This will add them to your collection.`);
            if (!confirmed) return;
            
            const token = localStorage.getItem('token');
            let successCount = 0;
            let errorCount = 0;
            
            showToast(`Importing ${data.length} movies...`, 'info');
            
            // Import movies one by one
            for (const movie of data) {
                try {
                    const response = await fetch(`${API_URL}/api/movies`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            title: movie.title,
                            year: movie.year,
                            director: movie.director,
                            genre: movie.genre,
                            rating: movie.rating,
                            status: movie.status,
                            type: movie.type || 'movie',
                            poster: movie.poster,
                            plot: movie.plot,
                            cast: movie.cast,
                            runtime: movie.runtime,
                            watchDate: movie.watchDate,
                            tmdbId: movie.tmdbId
                        })
                    });
                    
                    if (response.ok) {
                        successCount++;
                    } else {
                        errorCount++;
                    }
                } catch (error) {
                    errorCount++;
                }
            }
            
            // Reset file input
            event.target.value = '';
            
            if (successCount > 0) {
                showToast(`Successfully imported ${successCount} movies!`, 'success');
            }
            if (errorCount > 0) {
                showToast(`Failed to import ${errorCount} movies`, 'error');
            }
            
        } catch (error) {
            console.error('Error importing data:', error);
            showToast('Failed to parse import file. Make sure it\'s valid JSON.', 'error');
        }
    };
    reader.readAsText(file);
}

// Calculate Storage Usage
function calculateStorageUsage() {
    try {
        let totalSize = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length + key.length;
            }
        }
        
        const sizeInKB = (totalSize / 1024).toFixed(2);
        const maxSize = 5120; // 5MB typical localStorage limit
        const percentage = (totalSize / (maxSize * 1024)) * 100;
        
        document.getElementById('storageUsed').style.width = `${Math.min(percentage, 100)}%`;
        document.getElementById('storageText').textContent = `${sizeInKB} KB used of ~5 MB`;
    } catch (error) {
        console.error('Error calculating storage:', error);
        document.getElementById('storageText').textContent = 'Unable to calculate';
    }
}

// Clear Cache
function clearCache() {
    if (confirm('This will clear all cached data. You will remain logged in. Continue?')) {
        const token = localStorage.getItem('token');
        const settings = localStorage.getItem('movietrack_settings');
        
        localStorage.clear();
        
        // Restore essential data
        localStorage.setItem('token', token);
        if (settings) localStorage.setItem('movietrack_settings', settings);
        
        // Recalculate storage and reload profile
        calculateStorageUsage();
        loadUserProfile();
        
        showToast('Cache cleared successfully', 'success');
    }
}

// Reset Achievements
function resetAchievements() {
    if (confirm('Are you sure you want to reset all achievements? This cannot be undone.')) {
        localStorage.removeItem('earnedAchievements');
        localStorage.removeItem('achievementProgress');
        
        // If on achievements page, trigger a reload
        if (window.location.pathname.includes('dashboard.html')) {
            showToast('Achievements reset successfully. Please refresh the page to see changes.', 'success');
        } else {
            showToast('Achievements reset successfully', 'success');
        }
    }
}

// Show Toast Notification
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'exclamation-circle' : 
                 'info-circle';
    
    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }
}

// Check Authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
    }
}

// Show Changelog
function showChangelog() {
    const changelogContent = `
        <div style="max-width: 600px; background: var(--card-bg); padding: 30px; border-radius: 12px; max-height: 80vh; overflow-y: auto;">
            <h2 style="margin-bottom: 20px; color: var(--primary-color);">📝 Changelog</h2>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: var(--text-primary);">Version 2.3.1 - October 2025</h3>
                <ul style="color: var(--text-secondary); line-height: 1.8;">
                    <li>🌐 Improved slow internet handling for TMDB search</li>
                    <li>⏱️ Added loading indicators and retry logic</li>
                    <li>🔄 Smart timeout handling (15s for slow connections)</li>
                    <li>💡 Better error messages and user feedback</li>
                    <li>🎨 Custom Netflix-themed scrollbars</li>
                    <li>🐛 Fixed export functions and TMDB trending API</li>
                    <li>❓ Added Help & FAQ, Changelog, Report Bug modals</li>
                </ul>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: var(--text-primary);">Version 2.3.0 - October 2025</h3>
                <ul style="color: var(--text-secondary); line-height: 1.8;">
                    <li>✨ Complete Settings System with 10 organized sections</li>
                    <li>🎨 Light/Dark/Auto theme support</li>
                    <li>♿ Accessibility features (High Contrast, Reduce Motion, Font Sizes)</li>
                    <li>📤 Export data as JSON, CSV, or PDF</li>
                    <li>📥 Import movies from JSON files</li>
                    <li>🔒 Enhanced security with password change and account deletion</li>
                    <li>⚙️ Customizable dashboard and content preferences</li>
                    <li>🎯 Grid layout controls (3-6 columns)</li>
                </ul>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: var(--text-primary);">Version 2.2.0 - October 2025</h3>
                <ul style="color: var(--text-secondary); line-height: 1.8;">
                    <li>🤖 Smart Content-Based Recommendations</li>
                    <li>🏆 Achievement System with 20+ achievements</li>
                    <li>📊 Enhanced Analytics Dashboard</li>
                    <li>🎬 Genre-based recommendations</li>
                    <li>🔥 Trending movies integration</li>
                </ul>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: var(--text-primary);">Version 2.1.0 - September 2025</h3>
                <ul style="color: var(--text-secondary); line-height: 1.8;">
                    <li>🎭 TMDB Integration for movie details</li>
                    <li>🖼️ Auto-fetch posters and metadata</li>
                    <li>🎪 Categories & Genre Management</li>
                    <li>🔍 Advanced search and filters</li>
                </ul>
            </div>
            
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: var(--primary-color); color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-top: 10px;">
                Close
            </button>
        </div>
    `;
    
    showModal(changelogContent);
}

// Show Help & FAQ
function showHelpFAQ() {
    const helpContent = `
        <div style="max-width: 700px; background: var(--card-bg); padding: 30px; border-radius: 12px; max-height: 80vh; overflow-y: auto;">
            <h2 style="margin-bottom: 20px; color: var(--primary-color);">❓ Help & FAQ</h2>
            
            <div style="margin-bottom: 25px;">
                <h3 style="color: var(--text-primary); margin-bottom: 10px;">🎬 How do I add a movie?</h3>
                <p style="color: var(--text-secondary); line-height: 1.6; margin-left: 15px;">
                    Go to the Dashboard, click the "Add Movie" button, fill in the movie details (or use TMDB auto-fill), 
                    and click Save. You can manually enter details or search TMDB for automatic population.
                </p>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h3 style="color: var(--text-primary); margin-bottom: 10px;">🔍 How does TMDB integration work?</h3>
                <p style="color: var(--text-secondary); line-height: 1.6; margin-left: 15px;">
                    When adding a movie, type the title and click "Search TMDB". Select from results to auto-fill 
                    all movie details including poster, cast, plot, and ratings.
                </p>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h3 style="color: var(--text-primary); margin-bottom: 10px;">🎨 How do I change the theme?</h3>
                <p style="color: var(--text-secondary); line-height: 1.6; margin-left: 15px;">
                    Go to Settings → Appearance → Theme. Choose between Dark (default), Light, or Auto 
                    (follows system preference). The theme applies instantly across all pages.
                </p>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h3 style="color: var(--text-primary); margin-bottom: 10px;">📤 How do I export my data?</h3>
                <p style="color: var(--text-secondary); line-height: 1.6; margin-left: 15px;">
                    Go to Settings → Data & Privacy → Export Data. Choose JSON (complete data), CSV (spreadsheet), 
                    or PDF (printable report). Your movie collection will be downloaded immediately.
                </p>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h3 style="color: var(--text-primary); margin-bottom: 10px;">🏆 What are achievements?</h3>
                <p style="color: var(--text-secondary); line-height: 1.6; margin-left: 15px;">
                    Achievements are unlocked as you use MovieTrack. Track movies, explore genres, rate films, 
                    and reach milestones to earn badges. View them in the Dashboard → Achievements section.
                </p>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h3 style="color: var(--text-primary); margin-bottom: 10px;">🤖 How do recommendations work?</h3>
                <p style="color: var(--text-secondary); line-height: 1.6; margin-left: 15px;">
                    MovieTrack analyzes your watched movies, ratings, and favorite genres to suggest similar content. 
                    Recommendations update automatically based on your activity. Configure in Settings → Recommendations.
                </p>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h3 style="color: var(--text-primary); margin-bottom: 10px;">🔒 Is my data secure?</h3>
                <p style="color: var(--text-secondary); line-height: 1.6; margin-left: 15px;">
                    Yes! All data is stored securely with encrypted passwords. You can export, backup, or delete 
                    your account anytime from Settings → Data & Privacy.
                </p>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h3 style="color: var(--text-primary); margin-bottom: 10px;">💾 What is storage usage?</h3>
                <p style="color: var(--text-secondary); line-height: 1.6; margin-left: 15px;">
                    MovieTrack uses browser localStorage (typically 5-10 MB limit) for caching. Large collections 
                    are stored on our secure servers. Clear cache in Settings if experiencing issues.
                </p>
            </div>
            
            <div style="background: var(--bg-secondary); padding: 15px; border-radius: 8px; margin-top: 20px;">
                <p style="color: var(--text-secondary); margin: 0;">
                    <strong>Still need help?</strong> Email us at <a href="mailto:support@movietrack.com" style="color: var(--primary-color);">support@movietrack.com</a> 
                    or visit our <a href="https://github.com/chiragvaze/movietrack" target="_blank" style="color: var(--primary-color);">GitHub repository</a>.
                </p>
            </div>
            
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: var(--primary-color); color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-top: 20px;">
                Close
            </button>
        </div>
    `;
    
    showModal(helpContent);
}

// Show Report Bug Dialog
function showReportBug() {
    const bugContent = `
        <div style="max-width: 600px; background: var(--card-bg); padding: 30px; border-radius: 12px; max-height: 80vh; overflow-y: auto;">
            <h2 style="margin-bottom: 20px; color: var(--primary-color);">🐛 Report a Bug</h2>
            
            <p style="color: var(--text-secondary); margin-bottom: 20px;">
                Found a bug? We appreciate your help in making MovieTrack better!
            </p>
            
            <div style="background: var(--bg-secondary); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: var(--text-primary); margin-bottom: 15px;">How to Report:</h3>
                
                <div style="margin-bottom: 15px;">
                    <strong style="color: var(--text-primary);">1. GitHub Issues (Recommended)</strong>
                    <p style="color: var(--text-secondary); margin: 5px 0 0 20px;">
                        Visit our <a href="https://github.com/chiragvaze/movietrack/issues" target="_blank" 
                        style="color: var(--primary-color);">GitHub Issues page</a> and create a new issue with:
                    </p>
                    <ul style="color: var(--text-secondary); margin-left: 40px; margin-top: 5px;">
                        <li>Clear description of the bug</li>
                        <li>Steps to reproduce</li>
                        <li>Expected vs actual behavior</li>
                        <li>Screenshots (if applicable)</li>
                        <li>Browser and OS version</li>
                    </ul>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <strong style="color: var(--text-primary);">2. Email</strong>
                    <p style="color: var(--text-secondary); margin: 5px 0 0 20px;">
                        Send bug details to: <a href="mailto:bugs@movietrack.com" style="color: var(--primary-color);">bugs@movietrack.com</a>
                    </p>
                </div>
                
                <div>
                    <strong style="color: var(--text-primary);">3. Quick Info</strong>
                    <p style="color: var(--text-secondary); margin: 5px 0 0 20px;">
                        Version: 2.3.1<br>
                        Browser: ${navigator.userAgent}<br>
                        Current Page: ${window.location.pathname}
                    </p>
                </div>
            </div>
            
            <div style="background: #fff3cd; color: #856404; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <strong>⚠️ Security Issues:</strong> Please email security@movietrack.com directly for any security vulnerabilities.
            </div>
            
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button onclick="window.open('https://github.com/chiragvaze/movietrack/issues/new', '_blank')" 
                        style="background: var(--primary-color); color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; flex: 1;">
                    Open GitHub Issues
                </button>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                        style="background: var(--bg-secondary); color: var(--text-primary); border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                    Close
                </button>
            </div>
        </div>
    `;
    
    showModal(bugContent);
}

// Show Modal Helper
function showModal(content) {
    // Remove existing modal if any
    const existingModal = document.getElementById('custom-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal overlay
    const modal = document.createElement('div');
    modal.id = 'custom-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;
    
    modal.innerHTML = content;
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    document.body.appendChild(modal);
}
