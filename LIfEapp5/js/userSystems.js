// ===== Gerenciamento de Sistemas do Usuário =====

// Obter sistemas criados pelo usuário do localStorage
function getUserSystems(username) {
    const key = `userSystems_${username}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

// Salvar sistema criado pelo usuário
function saveUserSystem(username, system) {
    const systems = getUserSystems(username);
    system.id = `custom_${Date.now()}`;
    system.createdAt = new Date().toISOString();
    system.createdBy = username;
    systems.push(system);
    localStorage.setItem(`userSystems_${username}`, JSON.stringify(systems));
    return system;
}

// Deletar sistema criado pelo usuário
function deleteUserSystem(username, systemId) {
    let systems = getUserSystems(username);
    systems = systems.filter(s => s.id !== systemId);
    localStorage.setItem(`userSystems_${username}`, JSON.stringify(systems));
}

// Obter histórico de comparações do usuário
function getUserComparisons(username) {
    const key = `userComparisons_${username}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

// Salvar comparação do usuário
function saveUserComparison(username, comparison) {
    const comparisons = getUserComparisons(username);
    comparison.id = `comparison_${Date.now()}`;
    comparison.performedAt = new Date().toISOString();
    comparison.performedBy = username;
    comparisons.unshift(comparison); // Adicionar no início
    // Manter apenas as últimas 20 comparações
    if (comparisons.length > 20) {
        comparisons.pop();
    }
    localStorage.setItem(`userComparisons_${username}`, JSON.stringify(comparisons));
}

// Deletar comparação do histórico
function deleteUserComparison(username, comparisonId) {
    let comparisons = getUserComparisons(username);
    comparisons = comparisons.filter(c => c.id !== comparisonId);
    localStorage.setItem(`userComparisons_${username}`, JSON.stringify(comparisons));
}

// ===== Initialise tabs & user data on DOMContentLoaded =====
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    if (typeof isLoggedIn === 'function' && isLoggedIn()) {
        displayUserSystems();
        displayUserComparisons();
    }
});

// ===== Carregar Sistemas do Usuário no DataManager =====
function loadUserSystemsIntoDataManager() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const userSystems = getUserSystems(currentUser);
    userSystems.forEach(system => {
        // Adicionar ao dataManager se ainda não existir
        if (!dataManager.systems.find(s => s.id === system.id)) {
            dataManager.systems.push(system);
        }
    });
}

// ===== Gerenciamento de Abas =====
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            
            // Remover classe active de todas as abas e conteúdos
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Adicionar classe active à aba clicada e conteúdo correspondente
            btn.classList.add('active');
            if (tabName === 'created') {
                document.getElementById('createdTab').classList.add('active');
            } else {
                document.getElementById('comparisonsTab').classList.add('active');
            }
        });
    });
}

// ===== Exibir Sistemas do Usuário =====
function displayUserSystems() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const systems = getUserSystems(currentUser);
    const grid = document.getElementById('mySystemsGrid');
    
    if (systems.length === 0) {
        grid.innerHTML = '<div class="empty-state">Nenhum sistema criado ainda. Crie seu primeiro sistema acima!</div>';
        return;
    }
    
    grid.innerHTML = systems.map(system => {
        const typeClass = system.tipo === 'Concreto' ? 'concrete' : 
                         system.tipo === 'Cerâmico' ? 'ceramic' : 'other';
        
        return `
            <div class="system-card ${typeClass}">
                <div class="system-header">
                    <h3 class="system-name">${system.nome}</h3>
                    <span class="badge-custom">Custom</span>
                </div>
                <div class="system-specs">
                    <div class="spec-item">
                        <span class="spec-label">Valor U:</span>
                        <span class="spec-value">${system.transmitancia.toFixed(2)} W/m²K</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Capacidade Térmica:</span>
                        <span class="spec-value">${system.capacidade_termica.toFixed(0)} kJ/m²K</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Peso:</span>
                        <span class="spec-value">${system.identificacao.descricao.peso.toFixed(1)} kg/m²</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Espessura:</span>
                        <span class="spec-value">${system.identificacao.descricao.espessura} cm</span>
                    </div>
                </div>
                <div class="system-impacts">
                    <div class="impact-item">
                        <span class="impact-label">GWP:</span>
                        <span class="impact-value">${formatScientific(system.impactos.gwp)} kg CO₂ eq</span>
                    </div>
                    <div class="impact-item">
                        <span class="impact-label">CED:</span>
                        <span class="impact-value">${formatScientific(system.consumo.total)} MJ</span>
                    </div>
                </div>
                <div class="system-actions">
                    <button class="btn btn-small btn-secondary" onclick="viewSystemDetail('${system.id}', true)">Ver Detalhes</button>
                    <button class="btn btn-small btn-outline" onclick="viewSystemCartilha('${system.id}')">📖 Cartilha</button>
                    <button class="btn btn-small btn-danger" onclick="event.stopPropagation(); confirmDeleteSystem('${system.id}')">Deletar</button>
                </div>
            </div>
        `;
    }).join('');
}

// ===== Exibir Comparações do Usuário =====
function displayUserComparisons() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const comparisons = getUserComparisons(currentUser);
    const container = document.getElementById('myComparisons');
    
    if (comparisons.length === 0) {
        container.innerHTML = '<div class="empty-state">Nenhuma comparação realizada ainda. Compare sistemas para ver o histórico aqui!</div>';
        return;
    }
    
    container.innerHTML = comparisons.map(comp => {
        const date = new Date(comp.performedAt).toLocaleString('pt-BR');
        const systemNames = comp.systems || [];
        return `
            <div class="comparison-history-card">
                <div class="comparison-header">
                    <span class="comparison-date">${date}</span>
                    <div class="comparison-actions">
                        <button class="btn btn-small btn-outline" onclick="event.stopPropagation(); confirmDeleteComparison('${comp.id}')">Deletar</button>
                    </div>
                </div>
                <div class="comparison-systems">
                    ${systemNames.map(name => `<strong>${name}</strong>`).join('<span class="comparison-arrow">vs</span>')}
                </div>
            </div>
        `;
    }).join('');
}

// ===== Ver Detalhes do Sistema (Personalizado) =====
function viewSystemDetail(systemId, isCustom) {
    // Find index in dataManager.systems
    const idx = dataManager.systems.findIndex(s => s.id === systemId);
    if (idx > -1 && typeof showSystemDetail === 'function') {
        showSystemDetail(idx);
    }
}

// ===== Ver Cartilha do Sistema (Personalizado) =====
function viewSystemCartilha(systemId) {
    const idx = dataManager.systems.findIndex(s => s.id === systemId);
    if (idx > -1 && typeof openCartilhaModal === 'function') {
        openCartilhaModal(idx);
    }
}

// ===== Deletar Sistema =====
function confirmDeleteSystem(systemId) {
    if (confirm('Tem certeza que deseja deletar este sistema?')) {
        const currentUser = getCurrentUser();
        
        // Remove from localStorage
        deleteUserSystem(currentUser, systemId);
        
        // Remove from dataManager
        const index = dataManager.systems.findIndex(s => s.id === systemId);
        if (index > -1) {
            dataManager.systems.splice(index, 1);
        }
        
        // Remove from selected systems if it was selected
        if (typeof selectedSystems !== 'undefined') {
            const selectedIndex = selectedSystems.indexOf(systemId);
            if (selectedIndex > -1) {
                selectedSystems.splice(selectedIndex, 1);
                // Update the selected systems display
                if (typeof updateSelectedSystems === 'function') {
                    updateSelectedSystems();
                }
            }
        }
        
        // Update displays
        displayUserSystems();
        
        // Reload the systems list to reflect the deletion
        if (typeof renderSystems === 'function') {
            renderSystems();
        }
        
        showAlert('success', 'Sistema deletado com sucesso');
    }
}

// ===== Deletar Comparação =====
function confirmDeleteComparison(comparisonId) {
    if (confirm('Tem certeza que deseja deletar esta comparação?')) {
        const currentUser = getCurrentUser();
        deleteUserComparison(currentUser, comparisonId);
        displayUserComparisons();
        showAlert('success', 'Comparação deletada com sucesso');
    }
}

// ===== Mostrar Alerta =====
function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.cssText = `position: fixed; top: 20px; right: 20px; background: ${type === 'success' ? '#10b981' : '#ef4444'}; color: white; padding: 1rem 2rem; border-radius: 8px; z-index: 10001; animation: slideInRight 0.3s ease-out;`;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}
