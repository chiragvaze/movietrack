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
            currentSettings.username = data.username;
            currentSettings.email = data.email;
            currentSettings.memberSince = new Date(data.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            document.getElementById('username').value = data.username;
            document.getElementById('email').value = data.email;
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
    currentSettings.username = document.getElementById('username').value;
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
    
    // Save to localStorage
    localStorage.setItem('movietrack_settings', JSON.stringify(currentSettings));
    
    // Apply settings
    applyTheme(currentSettings.theme);
    applyAccessibilitySettings();
    
    showToast('Settings saved successfully!', 'success');
}

// Reset to Defaults
function resetToDefaults() {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
        currentSettings = { ...DEFAULT_SETTINGS };
        localStorage.removeItem('movietrack_settings');
        applySettings();
        showToast('Settings reset to defaults', 'info');
    }
}

// Apply Theme
function applyTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
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
        
        const movies = await response.json();
        
        if (format === 'json') {
            exportAsJson(movies);
        } else if (format === 'csv') {
            exportAsCsv(movies);
        } else if (format === 'pdf') {
            showToast('PDF export coming soon!', 'info');
        }
    } catch (error) {
        console.error('Error exporting data:', error);
        showToast('Failed to export data', 'error');
    }
}

// Export as JSON
function exportAsJson(movies) {
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
    const headers = ['Title', 'Year', 'Director', 'Genre', 'Rating', 'Status', 'Type', 'Runtime', 'Watch Date'];
    const rows = movies.map(movie => [
        movie.title,
        movie.year,
        movie.director,
        movie.genre,
        movie.rating,
        movie.status,
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

// Import Data
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = JSON.parse(e.target.result);
            
            if (!Array.isArray(data)) {
                showToast('Invalid data format', 'error');
                return;
            }
            
            showToast('Import feature coming soon!', 'info');
            // TODO: Implement import logic
            
        } catch (error) {
            console.error('Error importing data:', error);
            showToast('Failed to import data', 'error');
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
        
        localStorage.setItem('token', token);
        if (settings) localStorage.setItem('movietrack_settings', settings);
        
        calculateStorageUsage();
        showToast('Cache cleared successfully', 'success');
    }
}

// Reset Achievements
function resetAchievements() {
    if (confirm('Are you sure you want to reset all achievements? This cannot be undone.')) {
        localStorage.removeItem('earnedAchievements');
        localStorage.removeItem('achievementProgress');
        showToast('Achievements reset successfully', 'success');
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
