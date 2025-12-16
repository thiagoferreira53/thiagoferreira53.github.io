// ===== Sistema de Autenticação =====

// Banco de dados simples em memória (em produção, use autenticação backend apropriada)
const users = {
    'ecowallcheck': {
        password: 'sistemamelhornaoha',
        fullName: 'EcoWallCheck Admin',
        email: 'admin@ecowallcheck.com'
    },
    'admin': {
        password: 'admin123',
        fullName: 'Administrador',
        email: 'admin@example.com'
    },
    'demo': {
        password: 'demo123',
        fullName: 'Usuário Demo',
        email: 'demo@example.com'
    }
};

// Armazenamento de usuários registrados (simula banco de dados)
const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');

// Verificar se o usuário está logado
function isLoggedIn() {
    return sessionStorage.getItem('isAuthenticated') === 'true';
}

// Obter usuário atual
function getCurrentUser() {
    return sessionStorage.getItem('currentUser');
}

// Função de login
function login(username, password) {
    // Verificar usuários padrão
    if (users[username] && users[username].password === password) {
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('currentUser', username);
        return true;
    }
    
    // Verificar usuários registrados
    if (registeredUsers[username] && registeredUsers[username].password === password) {
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('currentUser', username);
        return true;
    }
    
    return false;
}

// Função de registro
function register(userData) {
    const username = userData.username;
    
    // Validar se as senhas coincidem
    if (userData.password !== userData.confirmPassword) {
        return { success: false, message: 'As senhas não coincidem' };
    }
    
    // Verificar se usuário já existe
    if (users[username] || registeredUsers[username]) {
        return { success: false, message: 'Nome de usuário já existe. Por favor, escolha outro.' };
    }
    
    // Verificar se email já existe
    const emailExists = Object.values(registeredUsers).some(user => user.email === userData.email);
    if (emailExists) {
        return { success: false, message: 'E-mail já cadastrado' };
    }
    
    // Armazenar dados do usuário
    registeredUsers[username] = {
        password: userData.password,
        fullName: userData.fullName,
        email: userData.email,
        usage: userData.usage,
        education: userData.education,
        field: userData.field,
        registeredAt: new Date().toISOString()
    };
    
    // Salvar no localStorage
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    
    return { success: true, username: username };
}

// Função de logout
function logout() {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('currentUser');
    location.reload();
}

// Inicializar autenticação ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
    const loginModal = document.getElementById('loginModal');
    const registerPopup = document.getElementById('registerPopup');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    const closeRegisterPopup = document.getElementById('closeRegisterPopup');
    const cancelRegisterBtn = document.getElementById('cancelRegisterBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Verificar se o usuário está logado
    if (!isLoggedIn()) {
        loginModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    } else {
        loginModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
    
    // Mostrar popup de registro
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            registerPopup.style.display = 'flex';
        });
    }
    
    // Fechar popup de registro
    const closePopup = () => {
        registerPopup.style.display = 'none';
        registerForm.reset();
    };
    
    if (closeRegisterPopup) {
        closeRegisterPopup.addEventListener('click', closePopup);
    }
    
    if (cancelRegisterBtn) {
        cancelRegisterBtn.addEventListener('click', closePopup);
    }
    
    // Fechar ao clicar no overlay
    if (registerPopup) {
        registerPopup.addEventListener('click', (e) => {
            if (e.target === registerPopup) {
                closePopup();
            }
        });
    }
    
    // Lidar com envio do formulário de login
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (login(username, password)) {
                loginModal.classList.add('hidden');
                document.body.style.overflow = 'auto';
                
                // Mostrar mensagem de sucesso
                const successMsg = document.createElement('div');
                successMsg.className = 'alert alert-success';
                successMsg.textContent = `Bem-vindo de volta, ${username}!`;
                successMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 1rem 2rem; border-radius: 8px; z-index: 10001; animation: slideInRight 0.3s ease-out;';
                document.body.appendChild(successMsg);
                
                setTimeout(() => {
                    successMsg.style.animation = 'slideOutRight 0.3s ease-out';
                    setTimeout(() => successMsg.remove(), 300);
                }, 3000);
            } else {
                // Mostrar mensagem de erro
                const errorMsg = document.createElement('div');
                errorMsg.className = 'alert alert-error';
                errorMsg.textContent = 'Usuário ou senha inválidos';
                errorMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #ef4444; color: white; padding: 1rem 2rem; border-radius: 8px; z-index: 10001; animation: slideInRight 0.3s ease-out;';
                document.body.appendChild(errorMsg);
                
                setTimeout(() => {
                    errorMsg.style.animation = 'slideOutRight 0.3s ease-out';
                    setTimeout(() => errorMsg.remove(), 300);
                }, 3000);
                
                // Limpar campo de senha
                document.getElementById('password').value = '';
            }
        });
    }
    
    // Lidar com envio do formulário de registro
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const userData = {
                fullName: document.getElementById('regFullName').value,
                email: document.getElementById('regEmail').value,
                username: document.getElementById('regUsername').value,
                password: document.getElementById('regPassword').value,
                confirmPassword: document.getElementById('regConfirmPassword').value,
                usage: document.getElementById('regUsage').value,
                education: document.getElementById('regEducation').value,
                field: document.getElementById('regField').value
            };
            
            const result = register(userData);
            
            if (result.success) {
                // Auto-login após registro
                login(result.username, userData.password);
                
                // Fechar popup
                registerPopup.style.display = 'none';
                
                // Esconder modal de login
                loginModal.classList.add('hidden');
                document.body.style.overflow = 'auto';
                
                // Mostrar mensagem de sucesso
                const successMsg = document.createElement('div');
                successMsg.className = 'alert alert-success';
                successMsg.textContent = `Conta criada com sucesso! Bem-vindo, ${userData.fullName}!`;
                successMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 1rem 2rem; border-radius: 8px; z-index: 40000; animation: slideInRight 0.3s ease-out;';
                document.body.appendChild(successMsg);
                
                setTimeout(() => {
                    successMsg.style.animation = 'slideOutRight 0.3s ease-out';
                    setTimeout(() => successMsg.remove(), 300);
                }, 3000);
                
                registerForm.reset();
            } else {
                // Mostrar mensagem de erro
                const errorMsg = document.createElement('div');
                errorMsg.className = 'alert alert-error';
                errorMsg.textContent = result.message || 'Falha no registro. Tente novamente.';
                errorMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #ef4444; color: white; padding: 1rem 2rem; border-radius: 8px; z-index: 40000; animation: slideInRight 0.3s ease-out;';
                document.body.appendChild(errorMsg);
                
                setTimeout(() => {
                    errorMsg.style.animation = 'slideOutRight 0.3s ease-out';
                    setTimeout(() => errorMsg.remove(), 300);
                }, 3000);
            }
        });
    }
    
    // Lidar com botão de logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});

// Adicionar animações de alerta ao CSS
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
