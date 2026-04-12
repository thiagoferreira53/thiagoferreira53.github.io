// ===== Auth Module (Popup Modal – NOT a page gate) =====

const hardcodedUsers = {
    'ecowallcheck': { password: 'sistemamelhornaoha', fullName: 'EcoWallCheck User', email: 'eco@example.com' },
    'admin': { password: 'admin123', fullName: 'Administrador', email: 'admin@example.com' },
    'demo': { password: 'demo123', fullName: 'Demo User', email: 'demo@example.com' }
};

// ===== Core auth functions =====
function isLoggedIn() {
    return sessionStorage.getItem('e3build_loggedIn') === 'true';
}

function getCurrentUser() {
    return sessionStorage.getItem('e3build_currentUser');
}

function getCurrentUserFullName() {
    return sessionStorage.getItem('e3build_fullName') || getCurrentUser();
}

function login(username, password) {
    // Check hardcoded users
    if (hardcodedUsers[username] && hardcodedUsers[username].password === password) {
        sessionStorage.setItem('e3build_loggedIn', 'true');
        sessionStorage.setItem('e3build_currentUser', username);
        sessionStorage.setItem('e3build_fullName', hardcodedUsers[username].fullName);
        return { success: true, user: hardcodedUsers[username] };
    }

    // Check registered users
    const registeredUsers = JSON.parse(localStorage.getItem('e3build_registeredUsers') || '[]');
    const found = registeredUsers.find(u => u.username === username && u.password === password);
    if (found) {
        sessionStorage.setItem('e3build_loggedIn', 'true');
        sessionStorage.setItem('e3build_currentUser', username);
        sessionStorage.setItem('e3build_fullName', found.fullName);
        return { success: true, user: found };
    }

    return { success: false };
}

function register(data) {
    const { username, password, fullName, email, usage, education, field } = data;

    // Check if username already exists
    if (hardcodedUsers[username]) return { success: false, error: 'register.errorExists' };
    const registeredUsers = JSON.parse(localStorage.getItem('e3build_registeredUsers') || '[]');
    if (registeredUsers.find(u => u.username === username)) return { success: false, error: 'register.errorExists' };
    if (registeredUsers.find(u => u.email === email)) return { success: false, error: 'register.errorEmail' };

    const newUser = { username, password, fullName, email, usage, education, field, registeredAt: new Date().toISOString() };
    registeredUsers.push(newUser);
    localStorage.setItem('e3build_registeredUsers', JSON.stringify(registeredUsers));

    // Auto-login after registration
    sessionStorage.setItem('e3build_loggedIn', 'true');
    sessionStorage.setItem('e3build_currentUser', username);
    sessionStorage.setItem('e3build_fullName', fullName);

    return { success: true, user: newUser };
}

function logout() {
    sessionStorage.removeItem('e3build_loggedIn');
    sessionStorage.removeItem('e3build_currentUser');
    sessionStorage.removeItem('e3build_fullName');
    updateAuthUI();
}

// ===== Login modal helpers =====
let pendingLoginCallback = null;

function showLoginModal(actionMsg) {
    const modal = document.getElementById('loginModal');
    const msgEl = document.getElementById('loginActionMsg');
    if (actionMsg && msgEl) {
        msgEl.textContent = actionMsg;
        msgEl.style.display = 'block';
    } else if (msgEl) {
        msgEl.style.display = 'none';
    }
    modal.classList.remove('hidden');
}

function hideLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.add('hidden');
    pendingLoginCallback = null;
}

/**
 * Gate an action behind login. If logged in, execute immediately.
 * Otherwise show the login modal; on success the callback is executed.
 */
function requireLogin(callback, actionMsg) {
    if (isLoggedIn()) {
        callback();
        return;
    }
    pendingLoginCallback = callback;
    showLoginModal(actionMsg || i18n.t('login.actionRequired'));
}

// ===== UI updates =====
function updateAuthUI() {
    const navLoginBtn = document.getElementById('navLoginBtn');
    const userMenu = document.getElementById('userMenu');
    const userDisplayName = document.getElementById('userDisplayName');
    const userAvatar = document.getElementById('userAvatar');

    if (isLoggedIn()) {
        if (navLoginBtn) navLoginBtn.style.display = 'none';
        if (userMenu) { userMenu.classList.remove('hidden'); }
        const fullName = getCurrentUserFullName();
        if (userDisplayName) userDisplayName.textContent = fullName;
        if (userAvatar) userAvatar.textContent = (fullName || 'U').charAt(0).toUpperCase();
    } else {
        if (navLoginBtn) navLoginBtn.style.display = '';
        if (userMenu) { userMenu.classList.add('hidden'); }
    }
}

// ===== Wire up DOM events =====
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginOverlay = document.getElementById('loginOverlay');
    const loginCloseBtn = document.getElementById('loginCloseBtn');
    const navLoginBtn = document.getElementById('navLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    const registerPopup = document.getElementById('registerPopup');
    const closeRegisterPopup = document.getElementById('closeRegisterPopup');
    const cancelRegisterBtn = document.getElementById('cancelRegisterBtn');
    const registerForm = document.getElementById('registerForm');

    // Show login modal from nav button
    if (navLoginBtn) navLoginBtn.addEventListener('click', () => showLoginModal());

    // Close login modal
    if (loginCloseBtn) loginCloseBtn.addEventListener('click', hideLoginModal);
    if (loginOverlay) loginOverlay.addEventListener('click', hideLoginModal);

    // Handle login
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const result = login(username, password);
            if (result.success) {
                hideLoginModal();
                updateAuthUI();
                showAlert('success', `${i18n.t('login.welcome')} ${result.user.fullName}!`);
                // Load user data
                loadUserSystemsIntoDataManager();
                if (typeof displayUserSystems === 'function') displayUserSystems();
                if (typeof displayUserComparisons === 'function') displayUserComparisons();
                if (typeof renderSystems === 'function') renderSystems();
                // Execute pending callback
                if (pendingLoginCallback) {
                    const cb = pendingLoginCallback;
                    pendingLoginCallback = null;
                    cb();
                }
            } else {
                showAlert('error', i18n.t('login.error'));
            }
        });
    }

    // Logout
    if (logoutBtn) logoutBtn.addEventListener('click', () => {
        logout();
        showAlert('success', 'Logged out');
    });

    // Show register popup
    if (showRegisterBtn) showRegisterBtn.addEventListener('click', () => {
        hideLoginModal();
        if (registerPopup) registerPopup.style.display = 'flex';
    });
    if (closeRegisterPopup) closeRegisterPopup.addEventListener('click', () => { registerPopup.style.display = 'none'; });
    if (cancelRegisterBtn) cancelRegisterBtn.addEventListener('click', () => { registerPopup.style.display = 'none'; });

    // Handle register
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const pw = document.getElementById('regPassword').value;
            const cpw = document.getElementById('regConfirmPassword').value;
            if (pw !== cpw) { showAlert('error', i18n.t('register.errorPasswords')); return; }

            const data = {
                fullName: document.getElementById('regFullName').value.trim(),
                email: document.getElementById('regEmail').value.trim(),
                username: document.getElementById('regUsername').value.trim(),
                password: pw,
                usage: document.getElementById('regUsage').value,
                education: document.getElementById('regEducation').value,
                field: document.getElementById('regField').value.trim()
            };

            const result = register(data);
            if (result.success) {
                registerPopup.style.display = 'none';
                updateAuthUI();
                showAlert('success', `${i18n.t('register.success')} ${result.user.fullName}!`);
                loadUserSystemsIntoDataManager();
                if (pendingLoginCallback) {
                    const cb = pendingLoginCallback;
                    pendingLoginCallback = null;
                    cb();
                }
            } else {
                showAlert('error', i18n.t(result.error));
            }
        });
    }

    // Initial UI state
    updateAuthUI();
});
