// ===== Authentication System =====

// Simple in-memory user database (in production, use proper backend authentication)
const users = {
    'ecowallcheck': 'sistemamelhornaoha',
    'admin': 'admin123',
    'user': 'user123'
};

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
    if (users[username] && users[username] === password) {
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('currentUser', username);
        return true;
    }
    return false;
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
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Check if user is logged in
    if (!isLoggedIn()) {
        loginModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    } else {
        loginModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
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
