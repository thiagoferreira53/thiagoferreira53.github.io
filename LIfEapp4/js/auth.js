// ===== Authentication System =====

// Simple in-memory user database (in production, use proper backend authentication)
const users = {
    'ecowallcheck': {
        password: 'sistemamelhornaoha',
        fullName: 'EcoWallCheck Admin',
        email: 'admin@ecowallcheck.com'
    },
    'admin': {
        password: 'admin123',
        fullName: 'Administrator',
        email: 'admin@example.com'
    },
    'user': {
        password: 'user123',
        fullName: 'Test User',
        email: 'user@example.com'
    }
};

// Registered users storage (simulates database)
const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');

// Check if user is logged in
function isLoggedIn() {
    return sessionStorage.getItem('isAuthenticated') === 'true';
}

// Get current user
function getCurrentUser() {
    return sessionStorage.getItem('currentUser');
}

// Login function
function login(username, password) {
    // Check default users
    if (users[username] && users[username].password === password) {
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('currentUser', username);
        return true;
    }
    
    // Check registered users
    if (registeredUsers[username] && registeredUsers[username].password === password) {
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('currentUser', username);
        return true;
    }
    
    return false;
}

// Register function
function register(userData) {
    const username = userData.email.split('@')[0]; // Use email prefix as username
    
    // Check if user already exists
    if (users[username] || registeredUsers[username]) {
        return { success: false, message: 'User already exists' };
    }
    
    // Store user data
    registeredUsers[username] = {
        password: userData.password,
        fullName: userData.fullName,
        email: userData.email,
        usage: userData.usage,
        education: userData.education,
        field: userData.field,
        registeredAt: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    
    return { success: true, username: username };
}

// Logout function
function logout() {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('currentUser');
    location.reload();
}

// Initialize authentication on page load
window.addEventListener('DOMContentLoaded', () => {
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    const backToLoginBtn = document.getElementById('backToLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Check if user is logged in
    if (!isLoggedIn()) {
        loginModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    } else {
        loginModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
    
    // Show register modal
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', () => {
            loginModal.classList.add('hidden');
            registerModal.classList.remove('hidden');
        });
    }
    
    // Back to login
    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', () => {
            registerModal.classList.add('hidden');
            loginModal.classList.remove('hidden');
            registerForm.reset();
        });
    }
    
    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (login(username, password)) {
                loginModal.classList.add('hidden');
                document.body.style.overflow = 'auto';
                
                // Show success message
                const successMsg = document.createElement('div');
                successMsg.className = 'alert alert-success';
                successMsg.textContent = `Welcome back, ${username}!`;
                successMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 1rem 2rem; border-radius: 8px; z-index: 10001; animation: slideInRight 0.3s ease-out;';
                document.body.appendChild(successMsg);
                
                setTimeout(() => {
                    successMsg.style.animation = 'slideOutRight 0.3s ease-out';
                    setTimeout(() => successMsg.remove(), 300);
                }, 3000);
            } else {
                // Show error message
                const errorMsg = document.createElement('div');
                errorMsg.className = 'alert alert-error';
                errorMsg.textContent = 'Invalid username or password';
                errorMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #ef4444; color: white; padding: 1rem 2rem; border-radius: 8px; z-index: 10001; animation: slideInRight 0.3s ease-out;';
                document.body.appendChild(errorMsg);
                
                setTimeout(() => {
                    errorMsg.style.animation = 'slideOutRight 0.3s ease-out';
                    setTimeout(() => errorMsg.remove(), 300);
                }, 3000);
                
                // Clear password field
                document.getElementById('password').value = '';
            }
        });
    }
    
    // Handle register form submission
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const userData = {
                fullName: document.getElementById('regFullName').value,
                email: document.getElementById('regEmail').value,
                password: document.getElementById('regPassword').value,
                usage: document.getElementById('regUsage').value,
                education: document.getElementById('regEducation').value,
                field: document.getElementById('regField').value
            };
            
            const result = register(userData);
            
            if (result.success) {
                // Auto-login after registration
                login(result.username, userData.password);
                
                registerModal.classList.add('hidden');
                document.body.style.overflow = 'auto';
                
                // Show success message
                const successMsg = document.createElement('div');
                successMsg.className = 'alert alert-success';
                successMsg.textContent = `Account created successfully! Welcome, ${userData.fullName}!`;
                successMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 1rem 2rem; border-radius: 8px; z-index: 10001; animation: slideInRight 0.3s ease-out;';
                document.body.appendChild(successMsg);
                
                setTimeout(() => {
                    successMsg.style.animation = 'slideOutRight 0.3s ease-out';
                    setTimeout(() => successMsg.remove(), 300);
                }, 3000);
                
                registerForm.reset();
            } else {
                // Show error message
                const errorMsg = document.createElement('div');
                errorMsg.className = 'alert alert-error';
                errorMsg.textContent = result.message || 'Registration failed. Please try again.';
                errorMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #ef4444; color: white; padding: 1rem 2rem; border-radius: 8px; z-index: 10001; animation: slideInRight 0.3s ease-out;';
                document.body.appendChild(errorMsg);
                
                setTimeout(() => {
                    errorMsg.style.animation = 'slideOutRight 0.3s ease-out';
                    setTimeout(() => errorMsg.remove(), 300);
                }, 3000);
            }
        });
    }
    
    // Handle logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});

// Add alert animations to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
