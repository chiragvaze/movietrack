// Tags & Lists Management

let allMovies = [];
let allTags = [];
let allLists = {};

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

// Load on page ready
document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    await loadMovies();
    await loadTags();
    await loadLists();
    
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

// Load all movies
async function loadMovies() {
    try {
        const response = await API.getMovies();
        if (response.success) {
            allMovies = response.movies;
        }
    } catch (error) {
        console.error('Error loading movies:', error);
    }
}

// Load all tags
async function loadTags() {
    try {
        const response = await API.getTags();
        if (response.success) {
            allTags = response.tags;
            displayTags();
        }
    } catch (error) {
        console.error('Error loading tags:', error);
        document.getElementById('tagsCloud').innerHTML = '<p class="error">Failed to load tags</p>';
    }
}

// Display tags cloud
function displayTags() {
    const container = document.getElementById('tagsCloud');
    
    if (allTags.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tags"></i>
                <p>No tags yet. Start tagging your movies!</p>
            </div>
        `;
        return;
    }
    
    // Count movies per tag
    const tagCounts = {};
    allMovies.forEach(movie => {
        if (movie.customTags) {
            movie.customTags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        }
    });
    
    container.innerHTML = allTags.map(tag => {
        const count = tagCounts[tag] || 0;
        const size = Math.min(Math.max(count * 0.2 + 1, 1), 2.5);
        
        return `
            <div class="tag-item" style="font-size: ${size}rem;" onclick="showTagMovies('${tag}')">
                <i class="fas fa-tag"></i>
                <span>${tag}</span>
                <span class="tag-count">${count}</span>
            </div>
        `;
    }).join('');
}

// Show movies with specific tag
async function showTagMovies(tag) {
    const tagMovies = allMovies.filter(movie => 
        movie.customTags && movie.customTags.includes(tag)
    );
    
    const modal = document.createElement('div');
    modal.className = 'modal modal-large';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2><i class="fas fa-tag"></i> ${tag} (${tagMovies.length})</h2>
            <div class="movies-grid-modal">
                ${tagMovies.map(movie => `
                    <div class="movie-card-small" onclick="window.location.href='dashboard.html'">
                        ${movie.poster ? 
                            `<img src="${movie.poster}" alt="${movie.title}">` :
                            `<div class="poster-placeholder">${movie.type === 'tv' ? '📺' : '🎬'}</div>`
                        }
                        <div class="movie-info-small">
                            <h4>${movie.title}</h4>
                            <p>${movie.year || 'N/A'}</p>
                            <div class="rating-small">${'⭐'.repeat(movie.rating || 0)}</div>
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

// Load custom lists
async function loadLists() {
    try {
        const response = await API.getLists();
        if (response.success) {
            allLists = response.details;
            displayLists();
        }
    } catch (error) {
        console.error('Error loading lists:', error);
        document.getElementById('listsGrid').innerHTML = '<p class="error">Failed to load lists</p>';
    }
}

// Display lists
function displayLists() {
    const container = document.getElementById('listsGrid');
    const listNames = Object.keys(allLists);
    
    if (listNames.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-list"></i>
                <p>No custom lists yet. Create your first list!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = listNames.map(listName => {
        const list = allLists[listName];
        const preview = list.movies.slice(0, 4);
        
        return `
            <div class="list-card" onclick="showListMovies('${listName}')">
                <div class="list-header">
                    <h3><i class="fas fa-list"></i> ${listName}</h3>
                    <span class="list-count">${list.count} ${list.count === 1 ? 'item' : 'items'}</span>
                </div>
                <div class="list-preview">
                    ${preview.map(movie => `
                        <div class="list-preview-item">
                            ${movie.poster ?
                                `<img src="${movie.poster}" alt="${movie.title}">` :
                                `<div class="preview-placeholder">🎬</div>`
                            }
                        </div>
                    `).join('')}
                    ${list.count > 4 ? `<div class="list-preview-more">+${list.count - 4}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Show list movies
function showListMovies(listName) {
    const list = allLists[listName];
    
    const modal = document.createElement('div');
    modal.className = 'modal modal-large';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2><i class="fas fa-list"></i> ${listName} (${list.count})</h2>
            <div class="movies-grid-modal">
                ${list.movies.map(movie => `
                    <div class="movie-card-small" onclick="window.location.href='dashboard.html'">
                        ${movie.poster ?
                            `<img src="${movie.poster}" alt="${movie.title}">` :
                            `<div class="poster-placeholder">🎬</div>`
                        }
                        <div class="movie-info-small">
                            <h4>${movie.title}</h4>
                            <p>${movie.year || 'N/A'}</p>
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

// Create new list
function createNewList() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2><i class="fas fa-plus"></i> Create New List</h2>
            <p>Create a custom list to organize your favorite movies and shows</p>
            <input type="text" id="newListName" placeholder="List name (e.g., 'Date Night Movies', 'Summer Blockbusters')" maxlength="100">
            <div class="modal-buttons">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                <button class="btn btn-primary" onclick="saveNewList()">Create List</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.getElementById('newListName').focus();
}

// Save new list (you'll add movies to it from the dashboard)
async function saveNewList() {
    const listName = document.getElementById('newListName').value.trim();
    
    if (!listName) {
        alert('Please enter a list name');
        return;
    }
    
    // For now, just close and show success
    // Lists are created when you add a movie to them
    document.querySelector('.modal').remove();
    
    showNotification(`List "${listName}" created! Add movies to it from your dashboard.`);
    
    await loadLists();
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
