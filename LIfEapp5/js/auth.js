// ===== Sistema de Autenticação =====

// Banco de dados simples em memória (em produção, use autenticação backend apropriada)
const users = {
    'demo': 'demo123',
    'admin': 'admin123',
    'ecowallcheck': 'sistemamelhornaoha'
};

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
    if (users[username] && users[username] === password) {
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('currentUser', username);
        return true;
    }
    return false;
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
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Verificar se o usuário está logado
    if (!isLoggedIn()) {
        loginModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    } else {
        loginModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
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
