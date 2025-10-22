// Admin Login Script
// API_URL is loaded from config.js

// Check if already logged in as admin
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (token && userRole === 'admin') {
        window.location.href = 'admin-dashboard.html';
    }
});

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.toggle-password i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// Handle admin login form submission
document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const submitButton = e.target.querySelector('button[type="submit"]');
    
    // Clear previous error
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';
    
    // Disable submit button
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
    
    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Verify admin role
            const verifyResponse = await fetch(`${API_URL}/api/auth/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${data.token}`
                }
            });
            
            const userData = await verifyResponse.json();
            
            if (userData.success && userData.user.role === 'admin') {
                // Store token and user data
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', userData.user.id);
                localStorage.setItem('userName', userData.user.name);
                localStorage.setItem('userEmail', userData.user.email);
                localStorage.setItem('userRole', userData.user.role);
                
                // Show success message
                errorMessage.style.display = 'block';
                errorMessage.style.background = '#10b981';
                errorMessage.innerHTML = '<i class="fas fa-check-circle"></i> Admin access granted! Redirecting...';
                
                // Redirect to admin dashboard
                setTimeout(() => {
                    window.location.href = 'admin-dashboard.html';
                }, 1000);
            } else {
                throw new Error('Access denied. Admin privileges required.');
            }
        } else {
            throw new Error(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Admin login error:', error);
        errorMessage.textContent = error.message;
        errorMessage.style.display = 'block';
        
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Access Admin Panel';
    }
});

// Handle Enter key on password field
document.getElementById('password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('adminLoginForm').dispatchEvent(new Event('submit'));
    }
});
