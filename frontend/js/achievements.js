/**
 * Achievement/Badges System for MovieTrack
 * Gamification features to engage users
 */

const ACHIEVEMENTS = {
    // Collection Milestones
    firstMovie: {
        id: 'first_movie',
        name: 'Getting Started',
        description: 'Add your first movie',
        icon: 'fa-film',
        color: '#28a745',
        requirement: (stats) => stats.totalContent >= 1
    },
    collector10: {
        id: 'collector_10',
        name: 'Movie Enthusiast',
        description: 'Add 10 movies to your collection',
        icon: 'fa-box',
        color: '#17a2b8',
        requirement: (stats) => stats.totalContent >= 10
    },
    collector50: {
        id: 'collector_50',
        name: 'Cinephile',
        description: 'Add 50 movies to your collection',
        icon: 'fa-boxes-stacked',
        color: '#6f42c1',
        requirement: (stats) => stats.totalContent >= 50
    },
    collector100: {
        id: 'collector_100',
        name: 'Movie Master',
        description: 'Add 100 movies to your collection',
        icon: 'fa-crown',
        color: '#ffc107',
        requirement: (stats) => stats.totalContent >= 100
    },
    
    // Rating Achievements
    critic5: {
        id: 'critic_5',
        name: 'Aspiring Critic',
        description: 'Rate 5 movies',
        icon: 'fa-star-half-stroke',
        color: '#fd7e14',
        requirement: (stats) => stats.ratedCount >= 5
    },
    critic25: {
        id: 'critic_25',
        name: 'Expert Critic',
        description: 'Rate 25 movies',
        icon: 'fa-star',
        color: '#ffd700',
        requirement: (stats) => stats.ratedCount >= 25
    },
    perfectionist: {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Give 5 movies a perfect 5-star rating',
        icon: 'fa-certificate',
        color: '#ff1744',
        requirement: (stats) => stats.perfectRatings >= 5
    },
    
    // Watch Time Achievements
    binge10h: {
        id: 'binge_10h',
        name: 'Weekend Warrior',
        description: 'Watch 10+ hours of content',
        icon: 'fa-couch',
        color: '#9c27b0',
        requirement: (stats) => stats.watchTimeHours >= 10
    },
    binge50h: {
        id: 'binge_50h',
        name: 'Binge Master',
        description: 'Watch 50+ hours of content',
        icon: 'fa-tv',
        color: '#e91e63',
        requirement: (stats) => stats.watchTimeHours >= 50
    },
    binge100h: {
        id: 'binge_100h',
        name: 'Screen Addict',
        description: 'Watch 100+ hours of content',
        icon: 'fa-video',
        color: '#f44336',
        requirement: (stats) => stats.watchTimeHours >= 100
    },
    
    // Genre Achievements
    genreExplorer: {
        id: 'genre_explorer',
        name: 'Genre Explorer',
        description: 'Watch movies from 5 different genres',
        icon: 'fa-compass',
        color: '#00bcd4',
        requirement: (stats) => stats.uniqueGenres >= 5
    },
    genreMaster: {
        id: 'genre_master',
        name: 'Genre Master',
        description: 'Watch movies from 10 different genres',
        icon: 'fa-globe',
        color: '#009688',
        requirement: (stats) => stats.uniqueGenres >= 10
    },
    
    // Streak Achievements
    streak3: {
        id: 'streak_3',
        name: 'On a Roll',
        description: 'Add content for 3 consecutive days',
        icon: 'fa-fire',
        color: '#ff6f00',
        requirement: (stats) => stats.currentStreak >= 3
    },
    streak7: {
        id: 'streak_7',
        name: 'Dedicated Tracker',
        description: 'Add content for 7 consecutive days',
        icon: 'fa-fire-flame-curved',
        color: '#ff3d00',
        requirement: (stats) => stats.currentStreak >= 7
    },
    streak30: {
        id: 'streak_30',
        name: 'Commitment King',
        description: 'Add content for 30 consecutive days',
        icon: 'fa-trophy',
        color: '#ffd700',
        requirement: (stats) => stats.currentStreak >= 30
    },
    
    // Special Achievements
    earlyBird: {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Join MovieTrack in its early days',
        icon: 'fa-dove',
        color: '#03a9f4',
        requirement: (stats) => true // Everyone who joins gets this
    },
    nightOwl: {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Add movies after midnight',
        icon: 'fa-moon',
        color: '#673ab7',
        requirement: (stats) => stats.midnightAdds >= 1
    },
    weekendWarrior: {
        id: 'weekend_warrior',
        name: 'Weekend Binger',
        description: 'Add 10 movies on weekends',
        icon: 'fa-calendar-days',
        color: '#8bc34a',
        requirement: (stats) => stats.weekendAdds >= 10
    },
    diverseWatcher: {
        id: 'diverse_watcher',
        name: 'Diverse Watcher',
        description: 'Watch both movies and TV shows',
        icon: 'fa-film-simple',
        color: '#4caf50',
        requirement: (stats) => stats.movieCount > 0 && stats.tvCount > 0
    },
    speedRacer: {
        id: 'speed_racer',
        name: 'Speed Racer',
        description: 'Add 5 movies in one day',
        icon: 'fa-gauge-high',
        color: '#ff5722',
        requirement: (stats) => stats.maxDailyAdds >= 5
    }
};

/**
 * Calculate user statistics for achievement checking
 */
function calculateAchievementStats(movies) {
    const stats = {
        totalContent: movies.length,
        ratedCount: movies.filter(m => m.rating > 0).length,
        perfectRatings: movies.filter(m => m.rating === 5).length,
        watchTimeHours: 0,
        uniqueGenres: 0,
        currentStreak: 0,
        midnightAdds: 0,
        weekendAdds: 0,
        movieCount: movies.filter(m => m.type === 'movie').length,
        tvCount: movies.filter(m => m.type === 'tv').length,
        maxDailyAdds: 0
    };
    
    // Calculate watch time
    let totalMinutes = 0;
    movies.forEach(movie => {
        if (movie.type === 'movie' && movie.runtime) {
            totalMinutes += parseInt(movie.runtime) || 0;
        } else if (movie.type === 'tv' && movie.numberOfEpisodes) {
            totalMinutes += (parseInt(movie.numberOfEpisodes) || 0) * 45;
        }
    });
    stats.watchTimeHours = Math.floor(totalMinutes / 60);
    
    // Calculate unique genres
    const genres = new Set();
    movies.forEach(movie => {
        if (movie.genre && Array.isArray(movie.genre)) {
            movie.genre.forEach(g => genres.add(g));
        }
    });
    stats.uniqueGenres = genres.size;
    
    // Calculate streak
    if (movies.length > 0) {
        const sortedDates = movies
            .filter(m => m.createdAt)
            .map(m => new Date(m.createdAt))
            .sort((a, b) => b - a);
        
        if (sortedDates.length > 0) {
            let streak = 1;
            let currentDate = new Date(sortedDates[0]);
            currentDate.setHours(0, 0, 0, 0);
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const daysDiff = Math.floor((today - currentDate) / (1000 * 60 * 60 * 24));
            if (daysDiff <= 1) {
                for (let i = 1; i < sortedDates.length; i++) {
                    const prevDate = new Date(sortedDates[i]);
                    prevDate.setHours(0, 0, 0, 0);
                    
                    const diff = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
                    
                    if (diff === 1) {
                        streak++;
                        currentDate = prevDate;
                    } else if (diff > 1) {
                        break;
                    }
                }
            } else {
                streak = 0;
            }
            stats.currentStreak = streak;
        }
    }
    
    // Calculate midnight adds
    stats.midnightAdds = movies.filter(m => {
        const hour = new Date(m.createdAt).getHours();
        return hour >= 0 && hour < 6;
    }).length;
    
    // Calculate weekend adds
    stats.weekendAdds = movies.filter(m => {
        const day = new Date(m.createdAt).getDay();
        return day === 0 || day === 6;
    }).length;
    
    // Calculate max daily adds
    const dailyAdds = {};
    movies.forEach(m => {
        const date = new Date(m.createdAt).toDateString();
        dailyAdds[date] = (dailyAdds[date] || 0) + 1;
    });
    stats.maxDailyAdds = Math.max(...Object.values(dailyAdds), 0);
    
    return stats;
}

/**
 * Check which achievements the user has earned
 */
function checkAchievements(movies) {
    const stats = calculateAchievementStats(movies);
    const earned = [];
    
    for (const [key, achievement] of Object.entries(ACHIEVEMENTS)) {
        if (achievement.requirement(stats)) {
            earned.push(achievement);
        }
    }
    
    return {
        earned,
        total: Object.keys(ACHIEVEMENTS).length,
        percentage: Math.round((earned.length / Object.keys(ACHIEVEMENTS).length) * 100)
    };
}

/**
 * Get newly earned achievements (compare with stored achievements)
 */
function getNewAchievements(movies) {
    const currentAchievements = checkAchievements(movies);
    const storedAchievements = JSON.parse(localStorage.getItem('userAchievements') || '[]');
    
    const newAchievements = currentAchievements.earned.filter(achievement =>
        !storedAchievements.some(stored => stored.id === achievement.id)
    );
    
    // Update stored achievements
    localStorage.setItem('userAchievements', JSON.stringify(currentAchievements.earned));
    
    return newAchievements;
}

/**
 * Show achievement unlock notification
 */
function showAchievementUnlock(achievement) {
    const container = document.getElementById('achievement-container');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.style.setProperty('--achievement-color', achievement.color);
    
    notification.innerHTML = `
        <div class="achievement-icon" style="color: ${achievement.color}">
            <i class="fas ${achievement.icon}"></i>
        </div>
        <div class="achievement-content">
            <div class="achievement-badge-label">Achievement Unlocked!</div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-desc">${achievement.description}</div>
        </div>
    `;
    
    container.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

/**
 * Display achievements modal
 */
function displayAchievementsModal(movies) {
    const result = checkAchievements(movies);
    const modal = document.getElementById('achievementsModal');
    if (!modal) return;
    
    const earnedIds = new Set(result.earned.map(a => a.id));
    
    let html = `
        <div class="achievements-header">
            <h3>🏆 Your Achievements</h3>
            <p class="achievements-progress">${result.earned.length} / ${result.total} Unlocked (${result.percentage}%)</p>
            <div class="achievements-progress-bar">
                <div class="achievements-progress-fill" style="width: ${result.percentage}%"></div>
            </div>
        </div>
        <div class="achievements-grid">
    `;
    
    for (const achievement of Object.values(ACHIEVEMENTS)) {
        const isEarned = earnedIds.has(achievement.id);
        html += `
            <div class="achievement-item ${isEarned ? 'earned' : 'locked'}">
                <div class="achievement-item-icon" style="color: ${isEarned ? achievement.color : '#666'}">
                    <i class="fas ${achievement.icon}"></i>
                </div>
                <div class="achievement-item-info">
                    <div class="achievement-item-name">${achievement.name}</div>
                    <div class="achievement-item-desc">${achievement.description}</div>
                </div>
                ${isEarned ? '<div class="achievement-checkmark"><i class="fas fa-check"></i></div>' : '<div class="achievement-lock"><i class="fas fa-lock"></i></div>'}
            </div>
        `;
    }
    
    html += `</div>`;
    
    document.getElementById('achievementsContent').innerHTML = html;
    modal.classList.add('show');
}
