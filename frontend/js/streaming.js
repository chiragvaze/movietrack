// Streaming Availability Management

let allMovies = [];
let filteredMovies = [];
let currentService = 'all';
let currentView = 'grid';

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Show notification
function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Service icons mapping
const serviceIcons = {
    'Netflix': 'fab fa-netflix',
    'Amazon Prime': 'fab fa-amazon',
    'Disney+': 'fas fa-film',
    'HBO Max': 'fas fa-play',
    'Hulu': 'fas fa-tv',
    'Apple TV+': 'fab fa-apple',
    'Paramount+': 'fas fa-mountain',
    'Peacock': 'fas fa-feather',
    'Other': 'fas fa-play-circle'
};

// Service colors
const serviceColors = {
    'Netflix': '#E50914',
    'Amazon Prime': '#00A8E1',
    'Disney+': '#113CCF',
    'HBO Max': '#9333EA',
    'Hulu': '#1CE783',
    'Apple TV+': '#000000',
    'Paramount+': '#0064FF',
    'Peacock': '#000000',
    'Other': '#6B7280'
};

// Load on page ready
document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    await loadMovies();
    setupEventListeners();
});

// Load all movies
async function loadMovies() {
    try {
        const response = await API.getMovies();
        if (response.success) {
            allMovies = response.movies;
            updateServiceCounts();
            filterMovies(currentService);
        }
    } catch (error) {
        console.error('Error loading movies:', error);
        showNotification('Failed to load movies', 'error');
    }
}

// Update service counts
function updateServiceCounts() {
    const counts = {
        all: allMovies.length,
        netflix: 0,
        prime: 0,
        disney: 0,
        hbo: 0,
        hulu: 0,
        apple: 0,
        other: 0
    };

    allMovies.forEach(movie => {
        if (movie.streamingServices && movie.streamingServices.length > 0) {
            movie.streamingServices.forEach(service => {
                const serviceName = service.service.toLowerCase().replace(/\s+/g, '');
                if (serviceName.includes('netflix')) counts.netflix++;
                else if (serviceName.includes('amazon') || serviceName.includes('prime')) counts.prime++;
                else if (serviceName.includes('disney')) counts.disney++;
                else if (serviceName.includes('hbo')) counts.hbo++;
                else if (serviceName.includes('hulu')) counts.hulu++;
                else if (serviceName.includes('apple')) counts.apple++;
                else counts.other++;
            });
        }
    });

    // Update UI
    document.getElementById('count-all').textContent = counts.all;
    document.getElementById('count-netflix').textContent = counts.netflix;
    document.getElementById('count-prime').textContent = counts.prime;
    document.getElementById('count-disney').textContent = counts.disney;
    document.getElementById('count-hbo').textContent = counts.hbo;
    document.getElementById('count-hulu').textContent = counts.hulu;
    document.getElementById('count-apple').textContent = counts.apple;
    document.getElementById('count-other').textContent = counts.other;
}

// Filter movies by service
function filterMovies(service) {
    currentService = service;

    if (service === 'all') {
        filteredMovies = allMovies;
    } else {
        filteredMovies = allMovies.filter(movie => {
            if (!movie.streamingServices || movie.streamingServices.length === 0) {
                return false;
            }
            return movie.streamingServices.some(s => s.service === service);
        });
    }

    displayMovies();
}

// Display movies
function displayMovies() {
    const container = document.getElementById('streamingMoviesContainer');
    container.className = currentView === 'grid' ? 'streaming-movies-grid' : 'streaming-movies-list';

    if (filteredMovies.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-play-circle"></i>
                <p>${currentService === 'all' ? 'No movies in your collection yet' : `No movies available on ${currentService}`}</p>
            </div>
        `;
        return;
    }

    if (currentView === 'grid') {
        container.innerHTML = filteredMovies.map(movie => createMovieCard(movie)).join('');
    } else {
        container.innerHTML = filteredMovies.map(movie => createMovieListItem(movie)).join('');
    }
}

// Create movie card (grid view)
function createMovieCard(movie) {
    const services = movie.streamingServices || [];
    const serviceBadges = services.slice(0, 3).map(service => {
        const icon = serviceIcons[service.service] || 'fas fa-play-circle';
        const color = serviceColors[service.service] || '#6B7280';
        return `
            <span class="streaming-badge" style="background-color: ${color}" title="${service.service}">
                <i class="${icon}"></i>
            </span>
        `;
    }).join('');

    const moreCount = services.length > 3 ? `<span class="more-services">+${services.length - 3}</span>` : '';

    return `
        <div class="streaming-movie-card">
            ${movie.poster ? 
                `<img src="${movie.poster}" alt="${movie.title}" class="movie-poster">` :
                `<div class="poster-placeholder">${movie.type === 'tv' ? '📺' : '🎬'}</div>`
            }
            <div class="movie-info-overlay">
                <h3>${movie.title}</h3>
                <p class="movie-year">${movie.year || 'N/A'}</p>
                ${movie.rating > 0 ? `
                    <div class="movie-rating">
                        <i class="fas fa-star"></i> ${movie.rating}/5
                    </div>
                ` : ''}
                <div class="streaming-services-display">
                    ${serviceBadges}
                    ${moreCount}
                </div>
                <div class="movie-card-actions">
                    <button class="btn-icon" onclick="openAddStreamingModal('${movie._id}', '${movie.title}')" title="Add Service">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="btn-icon" onclick="viewStreamingDetails('${movie._id}')" title="View Details">
                        <i class="fas fa-info-circle"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Create movie list item (list view)
function createMovieListItem(movie) {
    const services = movie.streamingServices || [];
    const serviceBadges = services.map(service => {
        const icon = serviceIcons[service.service] || 'fas fa-play-circle';
        const color = serviceColors[service.service] || '#6B7280';
        return `
            <span class="streaming-badge-list" style="border-color: ${color}" title="${service.service} - ${service.region}">
                <i class="${icon}" style="color: ${color}"></i>
                <span>${service.service}</span>
                ${service.quality ? `<span class="quality-badge">${service.quality}</span>` : ''}
                <button class="remove-service-btn" onclick="removeStreamingService('${movie._id}', '${service.service}', '${service.region}')" title="Remove">
                    <i class="fas fa-times"></i>
                </button>
            </span>
        `;
    }).join('');

    return `
        <div class="streaming-movie-list-item">
            <div class="list-item-poster">
                ${movie.poster ? 
                    `<img src="${movie.poster}" alt="${movie.title}">` :
                    `<div class="poster-placeholder-small">${movie.type === 'tv' ? '📺' : '🎬'}</div>`
                }
            </div>
            <div class="list-item-info">
                <h3>${movie.title}</h3>
                <p class="movie-meta">
                    <span>${movie.year || 'N/A'}</span>
                    ${movie.rating > 0 ? `<span><i class="fas fa-star"></i> ${movie.rating}/5</span>` : ''}
                    <span class="movie-type-badge">${movie.type === 'tv' ? 'TV Show' : 'Movie'}</span>
                </p>
            </div>
            <div class="list-item-services">
                ${services.length > 0 ? serviceBadges : '<span class="no-services">No streaming services added</span>'}
            </div>
            <div class="list-item-actions">
                <button class="btn-icon" onclick="openAddStreamingModal('${movie._id}', '${movie.title}')" title="Add Service">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        </div>
    `;
}

// Setup event listeners
function setupEventListeners() {
    // Service filter buttons
    document.querySelectorAll('.service-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.service-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterMovies(btn.dataset.service);
        });
    });

    // View toggle buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.dataset.view;
            displayMovies();
        });
    });

    // Add streaming form
    document.getElementById('addStreamingForm')?.addEventListener('submit', addStreamingService);

    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        API.logout();
    });
    
    // Hamburger menu
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    
    hamburgerBtn?.addEventListener('click', () => {
        // This will be handled by sidebar if it exists, or we can add mobile menu logic here
        console.log('Hamburger clicked');
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
}

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

// Open add streaming modal
function openAddStreamingModal(movieId, movieTitle) {
    document.getElementById('movieId').value = movieId;
    document.getElementById('movieTitle').value = movieTitle;
    document.getElementById('streamingService').value = '';
    document.getElementById('streamingRegion').value = 'US';
    document.getElementById('streamingUrl').value = '';
    document.getElementById('streamingQuality').value = '';
    document.getElementById('addStreamingModal').style.display = 'block';
}

// Close add streaming modal
function closeAddStreamingModal() {
    document.getElementById('addStreamingModal').style.display = 'none';
}

// Add streaming service
async function addStreamingService(event) {
    event.preventDefault();

    const movieId = document.getElementById('movieId').value;
    const service = document.getElementById('streamingService').value;
    const region = document.getElementById('streamingRegion').value;
    const url = document.getElementById('streamingUrl').value;
    const quality = document.getElementById('streamingQuality').value;

    try {
        const response = await API.addStreamingInfo(movieId, service, region, url, quality);
        
        if (response.success) {
            showNotification(`Added ${service} successfully`, 'success');
            closeAddStreamingModal();
            await loadMovies(); // Reload to update counts and display
        } else {
            showNotification(response.message || 'Failed to add streaming service', 'error');
        }
    } catch (error) {
        console.error('Error adding streaming service:', error);
        showNotification('Failed to add streaming service', 'error');
    }
}

// Remove streaming service
async function removeStreamingService(movieId, service, region) {
    if (!confirm(`Remove ${service} from this movie?`)) {
        return;
    }

    try {
        // We need to implement a delete endpoint or update the movie
        const movie = allMovies.find(m => m._id === movieId);
        if (!movie) return;

        // Filter out the service
        const updatedServices = movie.streamingServices.filter(
            s => !(s.service === service && s.region === region)
        );

        // Update movie with new services array
        const response = await API.updateMovie(movieId, {
            streamingServices: updatedServices
        });

        if (response.success) {
            showNotification(`Removed ${service} successfully`, 'success');
            await loadMovies();
        } else {
            showNotification(response.message || 'Failed to remove service', 'error');
        }
    } catch (error) {
        console.error('Error removing streaming service:', error);
        showNotification('Failed to remove service', 'error');
    }
}

// View streaming details
function viewStreamingDetails(movieId) {
    const movie = allMovies.find(m => m._id === movieId);
    if (!movie) return;

    const services = movie.streamingServices || [];
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2><i class="fas fa-play-circle"></i> ${movie.title}</h2>
            <p class="modal-subtitle">Streaming Availability</p>
            
            ${services.length === 0 ? `
                <div class="empty-state-small">
                    <p>No streaming services added yet</p>
                    <button class="btn-primary" onclick="this.parentElement.parentElement.parentElement.remove(); openAddStreamingModal('${movieId}', '${movie.title}')">
                        <i class="fas fa-plus"></i> Add Service
                    </button>
                </div>
            ` : `
                <div class="streaming-details-list">
                    ${services.map(service => {
                        const icon = serviceIcons[service.service] || 'fas fa-play-circle';
                        const color = serviceColors[service.service] || '#6B7280';
                        return `
                            <div class="streaming-detail-item">
                                <div class="service-icon" style="background-color: ${color}">
                                    <i class="${icon}"></i>
                                </div>
                                <div class="service-details">
                                    <h4>${service.service}</h4>
                                    <p>Region: ${service.region}</p>
                                    ${service.quality ? `<p>Quality: ${service.quality}</p>` : ''}
                                    ${service.url ? `<a href="${service.url}" target="_blank" class="watch-link"><i class="fas fa-external-link-alt"></i> Watch Now</a>` : ''}
                                </div>
                                <button class="btn-icon-danger" onclick="this.parentElement.parentElement.parentElement.parentElement.parentElement.remove(); removeStreamingService('${movieId}', '${service.service}', '${service.region}')" title="Remove">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div style="margin-top: 1.5rem;">
                    <button class="btn-primary" onclick="this.parentElement.parentElement.parentElement.remove(); openAddStreamingModal('${movieId}', '${movie.title}')">
                        <i class="fas fa-plus"></i> Add Another Service
                    </button>
                </div>
            `}
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Show notification
function showNotification(message, type = 'info') {
    // Reuse existing notification system or create simple one
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
        color: white;
        border-radius: 8px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('addStreamingModal');
    if (e.target === modal) {
        closeAddStreamingModal();
    }
});
