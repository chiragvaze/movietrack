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
        
        // Apply ARIA labels if enabled
        if (settings.ariaLabels !== false) {
            applyAriaLabels();
        }
        
        // Store in window for other scripts to access
        window.userSettings = settings;
    }
    
    // Function to apply ARIA labels
    function applyAriaLabels() {
        // Wait for DOM to be ready
        const addLabels = () => {
            // Add ARIA labels to buttons without them
            document.querySelectorAll('button:not([aria-label])').forEach(btn => {
                const text = btn.textContent.trim() || btn.title || '';
                const icon = btn.querySelector('i');
                if (icon) {
                    const iconClass = icon.className;
                    if (iconClass.includes('fa-edit')) btn.setAttribute('aria-label', 'Edit');
                    else if (iconClass.includes('fa-trash')) btn.setAttribute('aria-label', 'Delete');
                    else if (iconClass.includes('fa-plus')) btn.setAttribute('aria-label', 'Add');
                    else if (iconClass.includes('fa-search')) btn.setAttribute('aria-label', 'Search');
                    else if (iconClass.includes('fa-filter')) btn.setAttribute('aria-label', 'Filter');
                    else if (iconClass.includes('fa-sort')) btn.setAttribute('aria-label', 'Sort');
                    else if (text) btn.setAttribute('aria-label', text);
                } else if (text) {
                    btn.setAttribute('aria-label', text);
                }
            });
            
            // Add ARIA roles to custom components
            document.querySelectorAll('.modal').forEach(modal => {
                if (!modal.getAttribute('role')) {
                    modal.setAttribute('role', 'dialog');
                    modal.setAttribute('aria-modal', 'true');
                }
            });
            
            document.querySelectorAll('.movie-card').forEach(card => {
                if (!card.getAttribute('role')) {
                    card.setAttribute('role', 'article');
                }
            });
            
            // Add ARIA labels to form inputs without labels
            document.querySelectorAll('input:not([aria-label]):not([id])').forEach(input => {
                const placeholder = input.placeholder;
                if (placeholder) {
                    input.setAttribute('aria-label', placeholder);
                }
            });
        };
        
        // Try immediately
        addLabels();
        
        // Also try after DOM is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', addLabels);
        }
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
