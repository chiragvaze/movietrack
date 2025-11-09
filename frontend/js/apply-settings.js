// Apply Settings Script - Load and apply user settings on every page
// This script should be included in all pages to apply user preferences

(function() {
    'use strict';
    
    // Load settings from localStorage
    function loadSettings() {
        const savedSettings = localStorage.getItem('movietrack_settings');
        if (savedSettings) {
            return JSON.parse(savedSettings);
        }
        return null;
    }
    
    // Apply theme
    function applyTheme(theme) {
        if (theme === 'light') {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
        } else if (theme === 'dark') {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
        } else if (theme === 'auto') {
            // Auto theme based on system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                document.body.classList.add('dark-theme');
                document.body.classList.remove('light-theme');
            } else {
                document.body.classList.add('light-theme');
                document.body.classList.remove('dark-theme');
            }
        }
    }
    
    // Apply accessibility settings
    function applyAccessibility(settings) {
        if (settings.reduceMotion) {
            document.body.classList.add('reduce-motion');
        } else {
            document.body.classList.remove('reduce-motion');
        }
        
        if (settings.highContrast) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
        
        if (settings.fontSize) {
            document.body.setAttribute('data-font-size', settings.fontSize);
        }
    }
    
    // Apply grid settings (cards per row)
    function applyGridSettings(settings) {
        // Wait for DOM to be ready
        const applyToGrid = () => {
            const moviesGrid = document.querySelector('.movies-grid');
            if (moviesGrid && settings.cardsPerRow) {
                // Remove all existing col classes
                moviesGrid.classList.remove('cols-3', 'cols-4', 'cols-5', 'cols-6');
                // Add the selected one
                moviesGrid.classList.add(`cols-${settings.cardsPerRow}`);
            }
        };
        
        // Try immediately
        applyToGrid();
        
        // Also try after DOM is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', applyToGrid);
        }
    }
    
    // Apply settings immediately
    const settings = loadSettings();
    if (settings) {
        // Apply theme
        if (settings.theme) {
            applyTheme(settings.theme);
        }
        
        // Apply accessibility
        applyAccessibility(settings);
        
        // Apply grid settings
        applyGridSettings(settings);
        
        // Store in window for other scripts to access
        window.userSettings = settings;
    }
    
    // Listen for storage changes (when settings are updated in another tab)
    window.addEventListener('storage', function(e) {
        if (e.key === 'movietrack_settings') {
            const newSettings = JSON.parse(e.newValue);
            if (newSettings) {
                applyTheme(newSettings.theme);
                applyAccessibility(newSettings);
                applyGridSettings(newSettings);
                window.userSettings = newSettings;
            }
        }
    });
    
})();
