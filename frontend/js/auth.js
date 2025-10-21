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
