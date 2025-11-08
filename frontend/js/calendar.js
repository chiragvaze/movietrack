// Watch History Calendar

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth() + 1; // 1-12
let calendarData = {};

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Month names
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

// Load on page ready
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadCalendar();
    
    // Logout button
    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        API.logout();
    });
    
    // Theme toggle
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = themeToggleBtn?.querySelector('i');
    
    if (themeToggleBtn) {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        if (themeIcon) {
            themeIcon.className = savedTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        themeToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            if (themeIcon) {
                themeIcon.className = newTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
            }
        });
    }
    
    // Profile button
    document.getElementById('profileBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        showProfileModal();
    });
    
    // Hamburger menu button
    document.getElementById('hamburgerBtn')?.addEventListener('click', () => {
        console.log('Hamburger clicked');
    });
});

// Show profile modal
function showProfileModal() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Profile</h2>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="profile-info">
                    <div class="profile-avatar">
                        <i class="fas fa-user-circle" style="font-size: 5rem; color: var(--primary-color);"></i>
                    </div>
                    <div class="profile-details">
                        <p><strong>Name:</strong> ${user.name || 'N/A'}</p>
                        <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
                        <p><strong>Member since:</strong> ${new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Load calendar data
async function loadCalendar() {
    try {
        const response = await API.getCalendar(currentYear, currentMonth);
        if (response.success) {
            calendarData = response.calendar;
            displayCalendar();
            updateStats();
        }
    } catch (error) {
        console.error('Error loading calendar:', error);
        showNotification('Failed to load calendar', 'error');
    }
}

// Display calendar
function displayCalendar() {
    // Update header
    document.getElementById('currentMonthYear').textContent = 
        `${monthNames[currentMonth - 1]} ${currentYear}`;
    
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';
    
    // Get first day of month and total days
    const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        grid.appendChild(emptyDay);
    }
    
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const movies = calendarData[dateKey] || [];
        const count = movies.length;
        
        const dayDiv = document.createElement('div');
        dayDiv.className = `calendar-day ${getIntensityClass(count)}`;
        dayDiv.onclick = () => showDayMovies(dateKey, movies);
        
        dayDiv.innerHTML = `
            <div class="day-number">${day}</div>
            ${count > 0 ? `
                <div class="day-indicator">
                    <i class="fas fa-film"></i> ${count}
                </div>
            ` : ''}
        `;
        
        grid.appendChild(dayDiv);
    }
}

// Get intensity class based on movie count
function getIntensityClass(count) {
    if (count === 0) return 'empty';
    if (count <= 2) return 'low';
    if (count <= 4) return 'medium';
    return 'high';
}

// Show movies for a specific day
function showDayMovies(dateKey, movies) {
    if (movies.length === 0) {
        showNotification('No movies watched on this day', 'info');
        return;
    }
    
    const date = new Date(dateKey);
    const formattedDate = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const modal = document.createElement('div');
    modal.className = 'modal modal-large';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2><i class="fas fa-calendar-day"></i> ${formattedDate}</h2>
            <p class="subtitle">${movies.length} ${movies.length === 1 ? 'movie' : 'movies'} watched</p>
            <div class="day-movies-grid">
                ${movies.map(movie => `
                    <div class="day-movie-card">
                        ${movie.poster ? 
                            `<img src="${movie.poster}" alt="${movie.title}">` :
                            `<div class="poster-placeholder">${movie.type === 'tv' ? '📺' : '🎬'}</div>`
                        }
                        <div class="day-movie-info">
                            <h3>${movie.title}</h3>
                            <p>${movie.year || 'N/A'}</p>
                            <div class="rating">${'⭐'.repeat(movie.rating || 0)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) modal.remove();
    });
}

// Update statistics
function updateStats() {
    const movies = Object.values(calendarData).flat();
    
    // Total movies this month
    document.getElementById('monthTotal').textContent = movies.length;
    
    // Average rating
    const ratings = movies.filter(m => m.rating > 0).map(m => m.rating);
    const avgRating = ratings.length > 0 
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
        : '0.0';
    document.getElementById('avgRating').textContent = avgRating;
    
    // Longest streak
    const streak = calculateStreak();
    document.getElementById('longestStreak').textContent = streak;
}

// Calculate longest streak
function calculateStreak() {
    const dates = Object.keys(calendarData).filter(date => calendarData[date].length > 0).sort();
    
    if (dates.length === 0) return 0;
    
    let maxStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i - 1]);
        const curr = new Date(dates[i]);
        const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
        } else {
            currentStreak = 1;
        }
    }
    
    return maxStreak;
}

// Navigate to previous month
function previousMonth() {
    currentMonth--;
    if (currentMonth < 1) {
        currentMonth = 12;
        currentYear--;
    }
    loadCalendar();
}

// Navigate to next month
function nextMonth() {
    currentMonth++;
    if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
    }
    loadCalendar();
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Hamburger menu
document.querySelector('.hamburger')?.addEventListener('click', () => {
    document.querySelector('.nav-menu').classList.toggle('active');
});
