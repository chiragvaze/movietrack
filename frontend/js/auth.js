// Authentication JavaScript

// Utility Functions
function showMessage(elementId, message, type) {
    const messageElement = document.getElementById(elementId);
    messageElement.textContent = message;
    messageElement.className = `message ${type}`;
    messageElement.style.display = 'block';
    
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 5000);
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
        el.classList.remove('show');
    });
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

// Login Form Handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        // Validation
        let isValid = true;
        
        if (!validateEmail(email)) {
            showError('emailError', 'Please enter a valid email address');
            isValid = false;
        }
        
        if (!validatePassword(password)) {
            showError('passwordError', 'Password must be at least 6 characters');
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Show loading state
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;
        
        try {
            // Call the real API
            const response = await API.login(email, password);
            
            if (response.success) {
                // Store user info
                localStorage.setItem('currentUser', JSON.stringify(response.user));
                
                showMessage('loginMessage', 'Login successful! Redirecting...', 'success');
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            }
        } catch (error) {
            showMessage('loginMessage', error.message || 'Login failed. Please try again.', 'error');
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}

// Signup Form Handler
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();
        
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validation
        let isValid = true;
        
        if (name.length < 2) {
            showError('nameError', 'Name must be at least 2 characters');
            isValid = false;
        }
        
        if (!validateEmail(email)) {
            showError('emailError', 'Please enter a valid email address');
            isValid = false;
        }
        
        if (!validatePassword(password)) {
            showError('passwordError', 'Password must be at least 6 characters');
            isValid = false;
        }
        
        if (password !== confirmPassword) {
            showError('confirmPasswordError', 'Passwords do not match');
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Show loading state
        const submitBtn = signupForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Creating account...';
        submitBtn.disabled = true;
        
        try {
            // Call the real API
            const response = await API.signup(name, email, password);
            
            if (response.success) {
                showMessage('signupMessage', 'Account created successfully! Redirecting to login...', 'success');
                
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }
        } catch (error) {
            showMessage('signupMessage', error.message || 'Signup failed. Please try again.', 'error');
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}

// Real-time password validation
const passwordInput = document.getElementById('password');
if (passwordInput && window.location.pathname.includes('signup.html')) {
    passwordInput.addEventListener('input', (e) => {
        const password = e.target.value;
        const errorElement = document.getElementById('passwordError');
        
        if (password.length > 0 && password.length < 6) {
            errorElement.textContent = 'Password must be at least 6 characters';
            errorElement.classList.add('show');
        } else {
            errorElement.classList.remove('show');
        }
    });
}

// Real-time confirm password validation
const confirmPasswordInput = document.getElementById('confirmPassword');
if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener('input', (e) => {
        const password = document.getElementById('password').value;
        const confirmPassword = e.target.value;
        const errorElement = document.getElementById('confirmPasswordError');
        
        if (confirmPassword.length > 0 && password !== confirmPassword) {
            errorElement.textContent = 'Passwords do not match';
            errorElement.classList.add('show');
        } else {
            errorElement.classList.remove('show');
        }
    });
}

// ===== Forgot Password Functionality =====
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const closeForgotModal = document.getElementById('closeForgotModal');
const cancelForgotBtn = document.getElementById('cancelForgotBtn');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');

// Open modal
if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        forgotPasswordModal.style.display = 'block';
    });
}

// Close modal functions
if (closeForgotModal) {
    closeForgotModal.addEventListener('click', () => {
        forgotPasswordModal.style.display = 'none';
        forgotPasswordForm.reset();
    });
}

if (cancelForgotBtn) {
    cancelForgotBtn.addEventListener('click', () => {
        forgotPasswordModal.style.display = 'none';
        forgotPasswordForm.reset();
    });
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === forgotPasswordModal) {
        forgotPasswordModal.style.display = 'none';
        forgotPasswordForm.reset();
    }
});

// Handle forgot password form submission
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('resetEmail').value.trim();
        const username = document.getElementById('resetUsername').value.trim();
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validation
        if (!validateEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        if (username.length < 2) {
            alert('Username must be at least 2 characters');
            return;
        }
        
        if (newPassword.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        // Show loading state
        const submitBtn = forgotPasswordForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resetting...';
        submitBtn.disabled = true;
        
        try {
            const response = await fetch(`${API.baseURL}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    name: username,
                    newPassword: newPassword
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('✅ Password reset successfully! You can now login with your new password.');
                forgotPasswordModal.style.display = 'none';
                forgotPasswordForm.reset();
            } else {
                const errorMessage = data.message || 
                    (data.errors && data.errors[0]?.msg) || 
                    'Password reset failed';
                alert('❌ ' + errorMessage);
            }
        } catch (error) {
            console.error('Reset password error:', error);
            // More detailed error message
            if (error.message === 'Failed to fetch') {
                alert('❌ Cannot connect to server. Please make sure:\n\n1. Backend server is running (npm start in backend folder)\n2. Server is at http://localhost:5000\n3. MongoDB is connected');
            } else {
                alert('❌ An error occurred: ' + error.message);
            }
        } finally {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}
