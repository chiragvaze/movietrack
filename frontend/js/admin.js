// Admin Dashboard Script
// API_URL is loaded from config.js

// Check authentication and admin role
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName');
    
    if (!token || userRole !== 'admin') {
        window.location.href = 'admin-login.html';
        return;
    }
    
    // Set admin name
    document.getElementById('adminName').textContent = userName || 'Admin';
    
    // Initialize dashboard
    loadDashboard();
    
    // Setup navigation
    setupNavigation();
    
    // Setup filters and search
    setupUserManagement();
    setupActivityManagement();
    
    // Auto-refresh every 30 seconds
    setInterval(() => {
        const activeSection = document.querySelector('.admin-section.active');
        if (activeSection && activeSection.id === 'dashboard-section') {
            refreshDashboard();
        }
    }, 30000);
});

// Setup navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            switchSection(section);
        });
    });
}

// Switch between sections
function switchSection(section) {
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    // Update sections
    document.querySelectorAll('.admin-section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(`${section}-section`).classList.add('active');
    
    // Load section data
    switch(section) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'users':
            loadUsers();
            break;
        case 'activity':
            loadActivityLogs();
            break;
        case 'stats':
            loadStatistics();
            break;
    }
}

// Admin Logout
function adminLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        window.location.href = 'admin-login.html';
    }
}

// ==================== DASHBOARD ====================

async function loadDashboard() {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            console.error('No token found');
            window.location.href = 'admin-login.html';
            return;
        }
        
        const response = await fetch(`${API_URL}/api/admin/dashboard`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (result.success && result.data) {
            const data = result.data;
            
            // Update stats cards
            document.getElementById('totalUsers').textContent = data.stats.totalUsers || 0;
            document.getElementById('totalMovies').textContent = data.stats.totalMovies || 0;
            document.getElementById('activeUsers').textContent = data.stats.activeUsersLast7Days || 0;
            const avgMovies = data.stats.totalUsers > 0 
                ? (data.stats.totalMovies / data.stats.totalUsers).toFixed(1)
                : 0;
            document.getElementById('avgMoviesPerUser').textContent = avgMovies;
            
            // Load charts
            if (data.userGrowth && data.userGrowth.length > 0) {
                renderUserGrowthChart(data.userGrowth);
            }
            
            // Load recent activity
            if (data.recentActivity && data.recentActivity.length > 0) {
                displayRecentActivity(data.recentActivity);
            } else {
                loadRecentActivity();
            }
            
            // Load recent users
            loadRecentUsers(data.recentUsers || []);
            
            // Load movies by genre for chart
            loadGenreChart();
        } else {
            throw new Error(result.message || 'Failed to load dashboard');
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        
        // Check if it's a network error
        if (error.message.includes('fetch')) {
            alert('Cannot connect to server. Please make sure the backend is running on http://localhost:5000');
        } else {
            alert('Failed to load dashboard data: ' + error.message);
        }
        
        // If unauthorized, redirect to login
        if (error.message.includes('401') || error.message.includes('403')) {
            localStorage.clear();
            window.location.href = 'admin-login.html';
        }
    }
}

function refreshDashboard() {
    console.log('Refreshing dashboard...');
    loadDashboard();
}

// User Growth Chart
let userGrowthChart = null;
function renderUserGrowthChart(data) {
    const ctx = document.getElementById('userGrowthChart');
    if (!ctx) return;
    
    if (userGrowthChart) {
        userGrowthChart.destroy();
    }
    
    userGrowthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d._id),
            datasets: [{
                label: 'New Users',
                data: data.map(d => d.count),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Genre Chart
let genreChart = null;
async function loadGenreChart() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (result.success && result.data && result.data.moviesByGenre) {
            const ctx = document.getElementById('genreChart');
            if (!ctx) return;
            
            if (genreChart) {
                genreChart.destroy();
            }
            
            const colors = [
                '#667eea', '#f093fb', '#4facfe', '#fa709a', '#fee140',
                '#30cfd0', '#a8edea', '#fbc2eb', '#fdcbf1', '#e6dee9'
            ];
            
            genreChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: result.data.moviesByGenre.map(g => g._id || 'Unknown'),
                    datasets: [{
                        data: result.data.moviesByGenre.map(g => g.count),
                        backgroundColor: colors
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right'
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error loading genre chart:', error);
    }
}

// Display Recent Activity (from dashboard data)
function displayRecentActivity(logs) {
    const container = document.getElementById('recentActivity');
    if (logs && logs.length > 0) {
        container.innerHTML = logs.map(log => `
            <div class="activity-item">
                <div class="activity-icon" style="background: ${getActionColor(log.action)};">
                    <i class="${getActionIcon(log.action)}"></i>
                </div>
                <div class="activity-details">
                    <h4>${log.userName} - ${formatAction(log.action)}</h4>
                    <p>${log.details} • ${formatDate(log.timestamp)}</p>
                </div>
            </div>
        `).join('');
    } else {
        container.innerHTML = '<p class="loading">No recent activity</p>';
    }
}

// Recent Activity (fetch separately if needed)
async function loadRecentActivity() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/admin/activity-logs?limit=10`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.logs.length > 0) {
            displayRecentActivity(data.logs);
        } else {
            document.getElementById('recentActivity').innerHTML = '<p class="loading">No recent activity</p>';
        }
    } catch (error) {
        console.error('Error loading recent activity:', error);
        document.getElementById('recentActivity').innerHTML = '<p class="loading">No recent activity</p>';
    }
}

// Recent Users
function loadRecentUsers(users) {
    const container = document.getElementById('recentUsers');
    if (users && users.length > 0) {
        container.innerHTML = users.map(user => `
            <div class="user-item">
                <div class="user-info">
                    <h4>${user.name} ${user.role === 'admin' ? '<span class="badge badge-admin">Admin</span>' : ''}</h4>
                    <p>${user.email} • Joined ${formatDate(user.createdAt)}</p>
                </div>
            </div>
        `).join('');
    } else {
        container.innerHTML = '<p class="loading">No new users</p>';
    }
}

// ==================== USER MANAGEMENT ====================

let currentUsersPage = 1;
let usersFilters = { search: '', filter: '' };

function setupUserManagement() {
    document.getElementById('userSearch').addEventListener('input', (e) => {
        usersFilters.search = e.target.value;
        currentUsersPage = 1;
        loadUsers();
    });
    
    document.getElementById('userFilter').addEventListener('change', (e) => {
        usersFilters.filter = e.target.value;
        currentUsersPage = 1;
        loadUsers();
    });
}

async function loadUsers(page = 1) {
    currentUsersPage = page;
    
    try {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({
            page,
            limit: 20,
            ...usersFilters
        });
        
        const response = await fetch(`${API_URL}/api/admin/users?${params}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (result.success && result.data) {
            renderUsersTable(result.data.users);
            renderPagination('usersPagination', result.data.pagination, loadUsers);
        } else {
            throw new Error(result.message || 'Failed to load users');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        document.getElementById('usersTableBody').innerHTML = 
            '<tr><td colspan="8" class="error">Failed to load users</td></tr>';
    }
}

function renderUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="loading">No users found</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td class="checkbox-cell">
                <input 
                    type="checkbox" 
                    class="user-checkbox" 
                    value="${user._id}"
                    onchange="toggleUserSelection('${user._id}')"
                    ${user.role === 'admin' ? 'disabled title="Cannot select admin users"' : ''}
                />
            </td>
            <td><strong>${user.name}</strong></td>
            <td>${user.email}</td>
            <td>
                <span class="role-badge ${user.role === 'admin' ? 'role-admin' : 'role-user'}">
                    ${user.role}
                </span>
            </td>
            <td>
                <span class="status-badge ${user.status === 'active' ? 'status-active' : 'status-banned'}">
                    ${user.status}
                </span>
            </td>
            <td>${user.movieCount || 0}</td>
            <td>${formatDate(user.createdAt)}</td>
            <td>${user.lastLogin ? formatDate(user.lastLogin) : 'Never'}</td>
            <td>
                <button class="action-btn btn-view" onclick="viewUser('${user._id}')">
                    <i class="fas fa-eye"></i> View
                </button>
                ${user.role !== 'admin' ? (
                    user.status === 'active' 
                    ? `<button class="action-btn btn-ban" onclick="banUser('${user._id}')">
                        <i class="fas fa-ban"></i> Ban
                      </button>`
                    : `<button class="action-btn btn-unban" onclick="unbanUser('${user._id}')">
                        <i class="fas fa-check"></i> Unban
                      </button>`
                ) : ''}
                ${user.role !== 'admin' ? `
                    <button class="action-btn btn-delete" onclick="deleteUser('${user._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

// View User Details
async function viewUser(userId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (result.success && result.data) {
            const user = result.data.user;
            const movies = result.data.recentMovies || [];
            const activities = result.data.recentActivities || [];
            
            document.getElementById('userDetails').innerHTML = `
                <div class="user-detail-grid">
                    <div class="detail-section">
                        <h3><i class="fas fa-user"></i> User Information</h3>
                        <p><strong>Name:</strong> ${user.name}</p>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <p><strong>Role:</strong> <span class="role-badge ${user.role === 'admin' ? 'role-admin' : 'role-user'}">${user.role}</span></p>
                        <p><strong>Status:</strong> <span class="status-badge ${user.status === 'active' ? 'status-active' : 'status-banned'}">${user.status}</span></p>
                        <p><strong>Joined:</strong> ${formatDate(user.createdAt)}</p>
                        <p><strong>Last Login:</strong> ${user.lastLogin ? formatDate(user.lastLogin) : 'Never'}</p>
                        <p><strong>Total Movies:</strong> ${user.movieCount || 0}</p>
                    </div>
                    
                    <div class="detail-section">
                        <h3><i class="fas fa-film"></i> Recent Movies (${movies.length})</h3>
                        ${movies.length > 0 ? `
                            <div style="max-height: 300px; overflow-y: auto;">
                                ${movies.map(movie => `
                                    <p>• ${movie.title} ${movie.type ? `(${movie.type})` : ''}</p>
                                `).join('')}
                                ${user.movieCount > 10 ? `<p><em>... and ${user.movieCount - 10} more</em></p>` : ''}
                            </div>
                        ` : '<p>No movies added yet</p>'}
                    </div>
                    
                    <div class="detail-section">
                        <h3><i class="fas fa-history"></i> Recent Activity (${activities.length})</h3>
                        ${activities.length > 0 ? `
                            <div style="max-height: 300px; overflow-y: auto;">
                                ${activities.map(activity => `
                                    <p><small>${formatDateTime(activity.timestamp)}</small><br>${formatAction(activity.action)}: ${activity.details}</p>
                                `).join('')}
                            </div>
                        ` : '<p>No recent activity</p>'}
                    </div>
                </div>
            `;
            document.getElementById('userModal').style.display = 'block';
        } else {
            throw new Error(result.message || 'Failed to load user details');
        }
    } catch (error) {
        console.error('Error viewing user:', error);
        alert('Failed to load user details');
    }
}

function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
}

// Ban User
async function banUser(userId) {
    const confirmed = await showConfirmModal(
        'Ban User',
        'Are you sure you want to ban this user? They will not be able to access their account.'
    );
    
    if (confirmed) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/users/${userId}/ban`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('User banned successfully');
                loadUsers(currentUsersPage);
            } else {
                alert(data.message || 'Failed to ban user');
            }
        } catch (error) {
            console.error('Error banning user:', error);
            alert('Failed to ban user');
        }
    }
}

// Unban User
async function unbanUser(userId) {
    const confirmed = await showConfirmModal(
        'Unban User',
        'Are you sure you want to restore access for this user?'
    );
    
    if (confirmed) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/users/${userId}/unban`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('User unbanned successfully');
                loadUsers(currentUsersPage);
            } else {
                alert(data.message || 'Failed to unban user');
            }
        } catch (error) {
            console.error('Error unbanning user:', error);
            alert('Failed to unban user');
        }
    }
}

// Delete User
async function deleteUser(userId) {
    const confirmed = await showConfirmModal(
        'Delete User',
        'Are you sure you want to delete this user? This action cannot be undone. All their movies and activity will be deleted.'
    );
    
    if (confirmed) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('User deleted successfully');
                loadUsers(currentUsersPage);
            } else {
                alert(data.message || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user');
        }
    }
}

// ==================== ACTIVITY LOGS ====================

let currentActivityPage = 1;
let activityFilters = { action: '', date: '' };

function setupActivityManagement() {
    document.getElementById('actionFilter').addEventListener('change', (e) => {
        activityFilters.action = e.target.value;
        currentActivityPage = 1;
        loadActivityLogs();
    });
    
    document.getElementById('dateFilter').addEventListener('change', (e) => {
        activityFilters.date = e.target.value;
        currentActivityPage = 1;
        loadActivityLogs();
    });
}

async function loadActivityLogs(page = 1) {
    currentActivityPage = page;
    
    try {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({
            page,
            limit: 50,
            ...activityFilters
        });
        
        const response = await fetch(`${API_URL}/api/admin/activity-logs?${params}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (result.success && result.data) {
            renderActivityTable(result.data.logs);
            renderPagination('activityPagination', result.data.pagination, loadActivityLogs);
        } else {
            throw new Error(result.message || 'Failed to load activity logs');
        }
    } catch (error) {
        console.error('Error loading activity logs:', error);
        document.getElementById('activityTableBody').innerHTML = 
            '<tr><td colspan="5" class="error">Failed to load activity logs</td></tr>';
    }
}

function renderActivityTable(logs) {
    const tbody = document.getElementById('activityTableBody');
    
    if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">No activity logs found</td></tr>';
        return;
    }
    
    tbody.innerHTML = logs.map(log => `
        <tr>
            <td>${formatDateTime(log.timestamp)}</td>
            <td>${log.userName}</td>
            <td>
                <span style="display: inline-flex; align-items: center; gap: 5px;">
                    <i class="${getActionIcon(log.action)}" style="color: ${getActionColor(log.action)};"></i>
                    ${formatAction(log.action)}
                </span>
            </td>
            <td>${log.details}</td>
            <td>${log.ipAddress || 'N/A'}</td>
        </tr>
    `).join('');
}

// ==================== STATISTICS ====================

async function loadStatistics() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (result.success && result.data) {
            const data = result.data;
            renderUsersStatusChart(data.usersByStatus);
            renderContentTypeChart(data.moviesByType);
            renderTopGenresChart(data.moviesByGenre);
            renderDailyActiveChart(data.dailyActiveUsers);
        } else {
            throw new Error(result.message || 'Failed to load statistics');
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Users by Status Chart
let usersStatusChart = null;
function renderUsersStatusChart(data) {
    const ctx = document.getElementById('usersStatusChart');
    if (!ctx || !data) return;
    
    if (usersStatusChart) {
        usersStatusChart.destroy();
    }
    
    usersStatusChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(d => d._id),
            datasets: [{
                data: data.map(d => d.count),
                backgroundColor: ['#10b981', '#ef4444']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Content Type Chart
let contentTypeChart = null;
function renderContentTypeChart(data) {
    const ctx = document.getElementById('contentTypeChart');
    if (!ctx || !data) return;
    
    if (contentTypeChart) {
        contentTypeChart.destroy();
    }
    
    contentTypeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d._id || 'Unknown'),
            datasets: [{
                label: 'Count',
                data: data.map(d => d.count),
                backgroundColor: '#667eea'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Top Genres Chart
let topGenresChart = null;
function renderTopGenresChart(data) {
    const ctx = document.getElementById('topGenresChart');
    if (!ctx || !data) return;
    
    if (topGenresChart) {
        topGenresChart.destroy();
    }
    
    const topGenres = data.slice(0, 8);
    
    topGenresChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topGenres.map(d => d._id || 'Unknown'),
            datasets: [{
                label: 'Count',
                data: topGenres.map(d => d.count),
                backgroundColor: '#f093fb'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Daily Active Users Chart
let dailyActiveChart = null;
function renderDailyActiveChart(data) {
    const ctx = document.getElementById('dailyActiveChart');
    if (!ctx || !data) return;
    
    if (dailyActiveChart) {
        dailyActiveChart.destroy();
    }
    
    dailyActiveChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d._id),
            datasets: [{
                label: 'Active Users',
                data: data.map(d => d.count),
                borderColor: '#4facfe',
                backgroundColor: 'rgba(79, 172, 254, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// ==================== UTILITY FUNCTIONS ====================

function renderPagination(containerId, pagination, callback) {
    const container = document.getElementById(containerId);
    if (!container || !pagination) return;
    
    let html = '';
    
    if (pagination.prev) {
        html += `<button class="page-btn" onclick="${callback.name}(${pagination.prev.page})">← Previous</button>`;
    }
    
    for (let i = 1; i <= pagination.pages; i++) {
        html += `<button class="page-btn ${i === pagination.page ? 'active' : ''}" onclick="${callback.name}(${i})">${i}</button>`;
    }
    
    if (pagination.next) {
        html += `<button class="page-btn" onclick="${callback.name}(${pagination.next.page})">Next →</button>`;
    }
    
    container.innerHTML = html;
}

function formatDate(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function formatAction(action) {
    const actions = {
        'login': 'Login',
        'logout': 'Logout',
        'register': 'Register',
        'add_movie': 'Add Movie',
        'delete_movie': 'Delete Movie',
        'update_movie': 'Update Movie',
        'search': 'Search',
        'filter_category': 'Filter Category',
        'password_reset': 'Password Reset',
        'profile_update': 'Profile Update',
        'banned': 'User Banned',
        'unbanned': 'User Unbanned'
    };
    return actions[action] || action;
}

function getActionIcon(action) {
    const icons = {
        'login': 'fas fa-sign-in-alt',
        'logout': 'fas fa-sign-out-alt',
        'register': 'fas fa-user-plus',
        'add_movie': 'fas fa-plus-circle',
        'delete_movie': 'fas fa-trash',
        'update_movie': 'fas fa-edit',
        'search': 'fas fa-search',
        'filter_category': 'fas fa-filter',
        'password_reset': 'fas fa-key',
        'profile_update': 'fas fa-user-edit',
        'banned': 'fas fa-ban',
        'unbanned': 'fas fa-check-circle'
    };
    return icons[action] || 'fas fa-circle';
}

function getActionColor(action) {
    const colors = {
        'login': '#10b981',
        'logout': '#6b7280',
        'register': '#3b82f6',
        'add_movie': '#8b5cf6',
        'delete_movie': '#ef4444',
        'update_movie': '#f59e0b',
        'search': '#06b6d4',
        'filter_category': '#ec4899',
        'password_reset': '#f97316',
        'profile_update': '#14b8a6',
        'banned': '#dc2626',
        'unbanned': '#059669'
    };
    return colors[action] || '#6b7280';
}

function showError(message) {
    alert(message);
}

// Confirm Modal
function showConfirmModal(title, message) {
    return new Promise((resolve) => {
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        const modal = document.getElementById('confirmModal');
        modal.style.display = 'block';
        
        const confirmBtn = document.getElementById('confirmButton');
        const cancelBtn = modal.querySelector('.btn-cancel');
        
        // Clone buttons to remove old event listeners
        const newConfirmBtn = confirmBtn.cloneNode(true);
        const newCancelBtn = cancelBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        
        // Confirm button - resolve with true
        newConfirmBtn.onclick = () => {
            modal.style.display = 'none';
            resolve(true);
        };
        
        // Cancel button - resolve with false
        newCancelBtn.onclick = () => {
            modal.style.display = 'none';
            resolve(false);
        };
        
        // Click outside to cancel
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                resolve(false);
            }
        };
    });
}

function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    const userModal = document.getElementById('userModal');
    const confirmModal = document.getElementById('confirmModal');
    
    if (event.target == userModal) {
        closeUserModal();
    }
    if (event.target == confirmModal) {
        closeConfirmModal();
    }
}

// ==================== TOAST NOTIFICATIONS ====================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// ==================== DARK MODE ====================
function toggleDarkMode() {
    const body = document.body;
    const isDark = body.classList.toggle('dark-mode');
    localStorage.setItem('adminDarkMode', isDark);
    
    const icon = document.querySelector('.dark-mode-toggle i');
    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    
    showToast(isDark ? 'Dark mode enabled' : 'Light mode enabled', 'info');
}

// Load dark mode preference (light mode is default)
document.addEventListener('DOMContentLoaded', () => {
    const darkMode = localStorage.getItem('adminDarkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
        const icon = document.querySelector('.dark-mode-toggle i');
        if (icon) icon.className = 'fas fa-sun';
    } else {
        // Ensure light mode icon is set
        const icon = document.querySelector('.dark-mode-toggle i');
        if (icon) icon.className = 'fas fa-moon';
    }
});

// ==================== MOBILE NAVIGATION ====================
function toggleMobileNav() {
    const navMenu = document.getElementById('adminNavMenu');
    const overlay = document.getElementById('navOverlay');
    
    navMenu.classList.toggle('active');
    overlay.classList.toggle('active');
}

// ==================== EXPORT FUNCTIONALITY ====================
function toggleExportMenu(menuId) {
    const menu = document.getElementById(menuId);
    const allMenus = document.querySelectorAll('.export-menu');
    
    allMenus.forEach(m => {
        if (m.id !== menuId) m.classList.remove('active');
    });
    
    menu.classList.toggle('active');
}

// Close export menus when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.export-dropdown')) {
        document.querySelectorAll('.export-menu').forEach(m => m.classList.remove('active'));
    }
});

async function exportDashboard(format) {
    try {
        showToast('Generating export...', 'info');
        
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/admin/export/dashboard?format=${format}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Export failed');
        
        const data = await response.json();
        
        if (format === 'pdf') {
            // Generate PDF using jsPDF
            generatePDFReport(data.data, 'Dashboard_Report');
        } else if (format === 'csv') {
            downloadCSV(convertDashboardToCSV(data.data), 'dashboard_report.csv');
        } else {
            downloadJSON(data.data, 'dashboard_report.json');
        }
        
        showToast('Export completed successfully!', 'success');
    } catch (error) {
        console.error('Export error:', error);
        showToast('Export failed. Please try again.', 'error');
    }
}

async function exportUsers(format) {
    try {
        showToast('Exporting users...', 'info');
        
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/admin/export/users?format=${format}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Export failed');
        
        const data = await response.json();
        
        if (format === 'csv') {
            downloadCSV(convertUsersToCSV(data.data), 'users_export.csv');
        } else {
            downloadJSON(data.data, 'users_export.json');
        }
        
        showToast('Users exported successfully!', 'success');
    } catch (error) {
        console.error('Export error:', error);
        showToast('Export failed. Please try again.', 'error');
    }
}

async function exportActivityLogs(format) {
    try {
        showToast('Exporting activity logs...', 'info');
        
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/admin/export/activity?format=${format}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Export failed');
        
        const data = await response.json();
        
        if (format === 'csv') {
            downloadCSV(convertActivityToCSV(data.data), 'activity_logs.csv');
        } else {
            downloadJSON(data.data, 'activity_logs.json');
        }
        
        showToast('Activity logs exported successfully!', 'success');
    } catch (error) {
        console.error('Export error:', error);
        showToast('Export failed. Please try again.', 'error');
    }
}

// Helper functions for export
function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

function convertDashboardToCSV(data) {
    const stats = data.stats;
    let csv = 'Metric,Value\n';
    csv += `Total Users,${stats.totalUsers}\n`;
    csv += `Total Movies,${stats.totalMovies}\n`;
    csv += `Active Users,${stats.activeUsers}\n`;
    csv += `Banned Users,${stats.bannedUsers}\n`;
    csv += `New Users (Last 7 Days),${stats.newUsersLast7Days}\n`;
    csv += `New Users (Last 30 Days),${stats.newUsersLast30Days}\n`;
    return csv;
}

function convertUsersToCSV(users) {
    let csv = 'Name,Email,Role,Status,Movie Count,Joined,Last Login\n';
    users.forEach(user => {
        csv += `"${user.name}","${user.email}","${user.role}","${user.status}",${user.movieCount},"${new Date(user.createdAt).toLocaleDateString()}","${new Date(user.lastLogin).toLocaleDateString()}"\n`;
    });
    return csv;
}

function convertActivityToCSV(logs) {
    let csv = 'Time,User,Action,Details,IP Address\n';
    logs.forEach(log => {
        csv += `"${new Date(log.timestamp).toLocaleString()}","${log.userName}","${log.action}","${log.details}","${log.ipAddress}"\n`;
    });
    return csv;
}

function generatePDFReport(data, filename) {
    // Simple text-based PDF generation
    // For production, you'd want to use jsPDF library
    const reportContent = `
=================================
${filename}
Generated: ${new Date().toLocaleString()}
=================================

STATISTICS
----------
Total Users: ${data.stats.totalUsers}
Total Movies: ${data.stats.totalMovies}
Active Users: ${data.stats.activeUsers}
Banned Users: ${data.stats.bannedUsers}
New Users (7 days): ${data.stats.newUsersLast7Days}
New Users (30 days): ${data.stats.newUsersLast30Days}

=================================
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename + '.txt';
    link.click();
}

// ==================== BULK USER ACTIONS ====================
let selectedUsers = new Set();

function toggleSelectAll() {
    const checkbox = document.getElementById('selectAllUsers');
    const userCheckboxes = document.querySelectorAll('.user-checkbox');
    
    userCheckboxes.forEach(cb => {
        cb.checked = checkbox.checked;
        if (checkbox.checked) {
            selectedUsers.add(cb.value);
        } else {
            selectedUsers.delete(cb.value);
        }
    });
    
    updateBulkActionBar();
}

function toggleUserSelection(userId) {
    if (selectedUsers.has(userId)) {
        selectedUsers.delete(userId);
    } else {
        selectedUsers.add(userId);
    }
    
    updateBulkActionBar();
}

function updateBulkActionBar() {
    const count = selectedUsers.size;
    const bar = document.getElementById('bulkActionBar');
    const countEl = document.getElementById('selectedCount');
    
    if (count > 0) {
        bar.classList.add('active');
        countEl.textContent = `${count} user${count > 1 ? 's' : ''} selected`;
    } else {
        bar.classList.remove('active');
    }
    
    // Update select all checkbox state
    const selectAll = document.getElementById('selectAllUsers');
    const totalCheckboxes = document.querySelectorAll('.user-checkbox').length;
    selectAll.checked = count === totalCheckboxes && count > 0;
}

async function bulkBanUsers() {
    if (selectedUsers.size === 0) return;
    
    const confirmed = await showConfirmModal(
        'Ban Users',
        `Are you sure you want to ban ${selectedUsers.size} user(s)?`
    );
    
    if (!confirmed) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/admin/users/bulk-ban`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userIds: Array.from(selectedUsers) })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast(`Successfully banned ${selectedUsers.size} user(s)`, 'success');
            selectedUsers.clear();
            loadUsers();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Bulk ban error:', error);
        showToast('Failed to ban users. Please try again.', 'error');
    }
}

async function bulkUnbanUsers() {
    if (selectedUsers.size === 0) return;
    
    const confirmed = await showConfirmModal(
        'Unban Users',
        `Are you sure you want to unban ${selectedUsers.size} user(s)?`
    );
    
    if (!confirmed) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/admin/users/bulk-unban`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userIds: Array.from(selectedUsers) })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast(`Successfully unbanned ${selectedUsers.size} user(s)`, 'success');
            selectedUsers.clear();
            loadUsers();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Bulk unban error:', error);
        showToast('Failed to unban users. Please try again.', 'error');
    }
}

async function bulkDeleteUsers() {
    if (selectedUsers.size === 0) return;
    
    const confirmed = await showConfirmModal(
        'Delete Users',
        `WARNING: This will permanently delete ${selectedUsers.size} user(s) and all their data. This action cannot be undone!`
    );
    
    if (!confirmed) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/admin/users/bulk-delete`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userIds: Array.from(selectedUsers) })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast(`Successfully deleted ${selectedUsers.size} user(s)`, 'success');
            selectedUsers.clear();
            loadUsers();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Bulk delete error:', error);
        showToast('Failed to delete users. Please try again.', 'error');
    }
}

// ==================== ANNOUNCEMENTS ====================
async function createAnnouncement(event) {
    event.preventDefault();
    
    const title = document.getElementById('announcementTitle').value;
    const message = document.getElementById('announcementMessage').value;
    const type = document.getElementById('announcementType').value;
    const active = document.getElementById('announcementActive').checked;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/admin/announcements`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, message, type, active })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Announcement created successfully!', 'success');
            document.getElementById('announcementForm').reset();
            loadAnnouncements();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Create announcement error:', error);
        showToast('Failed to create announcement. Please try again.', 'error');
    }
}

async function loadAnnouncements() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/admin/announcements`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const result = await response.json();
        
        if (result.success) {
            displayAnnouncements(result.data);
        }
    } catch (error) {
        console.error('Load announcements error:', error);
        document.getElementById('announcementsList').innerHTML = '<p class="loading">Failed to load announcements</p>';
    }
}

function displayAnnouncements(announcements) {
    const container = document.getElementById('announcementsList');
    
    if (!announcements || announcements.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6b7280;">No announcements yet</p>';
        return;
    }
    
    container.innerHTML = announcements.map(announcement => `
        <div class="announcement-item ${announcement.type}">
            <div class="announcement-item-header">
                <div>
                    <div class="announcement-item-title">${announcement.title}</div>
                    <div class="announcement-item-meta">
                        ${new Date(announcement.createdAt).toLocaleString()} · 
                        <span class="announcement-status ${announcement.active ? 'active' : 'inactive'}">
                            ${announcement.active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
            </div>
            <div class="announcement-item-message">${announcement.message}</div>
            <div class="announcement-item-actions">
                <button onclick="toggleAnnouncementStatus('${announcement._id}', ${!announcement.active})">
                    <i class="fas fa-${announcement.active ? 'eye-slash' : 'eye'}"></i>
                    ${announcement.active ? 'Deactivate' : 'Activate'}
                </button>
                <button class="btn-delete" onclick="deleteAnnouncement('${announcement._id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

async function toggleAnnouncementStatus(id, active) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/admin/announcements/${id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ active })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast(`Announcement ${active ? 'activated' : 'deactivated'}`, 'success');
            loadAnnouncements();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Toggle announcement error:', error);
        showToast('Failed to update announcement. Please try again.', 'error');
    }
}

async function deleteAnnouncement(id) {
    console.log('Delete announcement called with ID:', id);
    
    const confirmed = await showConfirmModal(
        'Delete Announcement',
        'Are you sure you want to delete this announcement? This action cannot be undone.'
    );
    
    console.log('User confirmation:', confirmed);
    
    if (!confirmed) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/admin/announcements/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Announcement deleted successfully', 'success');
            loadAnnouncements();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Delete announcement error:', error);
        showToast('Failed to delete announcement. Please try again.', 'error');
    }
}

// Make functions globally accessible
window.toggleAnnouncementStatus = toggleAnnouncementStatus;
window.deleteAnnouncement = deleteAnnouncement;
window.showConfirmModal = showConfirmModal;
window.closeConfirmModal = closeConfirmModal;

// Update switchSection to handle announcements
const originalSwitchSection = switchSection;
switchSection = function(section) {
    originalSwitchSection(section);
    if (section === 'announcements') {
        loadAnnouncements();
    }
};

