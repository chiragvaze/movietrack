/**
 * Logo Animation Splash Screen Handler
 * Displays a full-screen video animation on first page load
 */

(function() {
    'use strict';

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSplashScreen);
    } else {
        initSplashScreen();
    }

    function initSplashScreen() {
        // Get DOM elements first
        const splashScreen = document.getElementById('splash-screen');
        const logoVideo = document.getElementById('logo-video');

        // Safety check - if elements don't exist, bail out
        if (!splashScreen || !logoVideo) {
            console.warn('Splash screen elements not found');
            return;
        }

        // Check if user has seen the splash screen in this session
        const hasSeenSplash = sessionStorage.getItem('splashShown');
        
        // If already shown in this session, hide immediately
        if (hasSeenSplash === 'true') {
            if (splashScreen && splashScreen.parentNode) {
                splashScreen.style.display = 'none';
                splashScreen.remove();
            }
            document.body.style.overflow = '';
            return;
        }
        
        // Configuration
        const config = {
            minDisplayTime: 1000, // Minimum time to show splash (1 second)
            maxDisplayTime: 5000, // Maximum time before auto-skip (5 seconds)
            fadeOutDuration: 800  // Match CSS transition duration
        };

    // Track when splash started
    const startTime = Date.now();
    let hasEnded = false;

        /**
         * Hide the splash screen with optional delay
         */
        function hideSplash(delay = config.fadeOutDuration) {
            if (hasEnded) return;
            hasEnded = true;

            console.log('Hiding splash screen...');

            // Ensure minimum display time
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, config.minDisplayTime - elapsedTime);
            
            setTimeout(() => {
                splashScreen.classList.add('fade-out');
                
                // Remove from DOM after fade animation
                setTimeout(() => {
                    if (splashScreen && splashScreen.parentNode) {
                        splashScreen.remove();
                    }
                    // Mark as shown in session
                    sessionStorage.setItem('splashShown', 'true');
                    
                    // Restore body scroll
                    document.body.style.overflow = '';
                    
                    // Trigger custom event for other scripts
                    document.dispatchEvent(new CustomEvent('splashComplete'));
                    console.log('Splash screen removed');
                }, delay);
            }, remainingTime);
        }

        /**
         * Handle video end event
         */
        function onVideoEnd() {
            console.log('Video ended - hiding splash');
            hideSplash();
        }

        /**
         * Auto-skip after maximum display time
         */
        function setupAutoSkip() {
            setTimeout(() => {
                if (!hasEnded) {
                    hideSplash();
                }
            }, config.maxDisplayTime);
        }

        // Event listeners
        if (logoVideo) {
            // Video ended event
            logoVideo.addEventListener('ended', onVideoEnd);
            
            // Video loaded and can play
            logoVideo.addEventListener('loadeddata', () => {
                console.log('Video loaded successfully');
            });
            
            // Video started playing
            logoVideo.addEventListener('playing', () => {
                console.log('Video is playing');
            });
            
            // Video error handling
            logoVideo.addEventListener('error', () => {
                console.warn('Logo video failed to load. Skipping splash screen.');
                hideSplash(0);
            });

            // Ensure video plays (some browsers block autoplay)
            const playPromise = logoVideo.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log('Video autoplay started');
                    })
                    .catch(error => {
                        console.warn('Autoplay prevented. Skipping splash screen.', error);
                        hideSplash(0);
                    });
            }
        } else {
            console.warn('Logo video element not found');
            hideSplash(0);
        }

        // Setup auto-skip timeout
        setupAutoSkip();

        // Prevent body scroll while splash is showing
        document.body.style.overflow = 'hidden';

    } // End initSplashScreen

})();