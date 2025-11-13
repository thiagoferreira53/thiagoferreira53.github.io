// ===== User Systems Management =====

// Get user's created systems from localStorage
function getUserSystems(username) {
    const key = `userSystems_${username}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

// Save user's created system
function saveUserSystem(username, system) {
    const systems = getUserSystems(username);
    system.id = `custom_${Date.now()}`;
    system.createdAt = new Date().toISOString();
    system.createdBy = username;
    systems.push(system);
    localStorage.setItem(`userSystems_${username}`, JSON.stringify(systems));
    return system;
}

// Delete user's created system
function deleteUserSystem(username, systemId) {
    let systems = getUserSystems(username);
    systems = systems.filter(s => s.id !== systemId);
    localStorage.setItem(`userSystems_${username}`, JSON.stringify(systems));
}

// Get user's comparison history
function getUserComparisons(username) {
    const key = `userComparisons_${username}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

// Save user's comparison
function saveUserComparison(username, comparison) {
    const comparisons = getUserComparisons(username);
    comparison.id = `comparison_${Date.now()}`;
    comparison.performedAt = new Date().toISOString();
    comparison.performedBy = username;
    comparisons.unshift(comparison); // Add to beginning
    // Keep only last 20 comparisons
    if (comparisons.length > 20) {
        comparisons.pop();
    }
    localStorage.setItem(`userComparisons_${username}`, JSON.stringify(comparisons));
}

// Delete comparison from history
function deleteUserComparison(username, comparisonId) {
    let comparisons = getUserComparisons(username);
    comparisons = comparisons.filter(c => c.id !== comparisonId);
    localStorage.setItem(`userComparisons_${username}`, JSON.stringify(comparisons));
}

// ===== Create System Form =====
document.addEventListener('DOMContentLoaded', () => {
    const createForm = document.getElementById('createSystemForm');
    const clearBtn = document.getElementById('clearForm');
    
    if (createForm) {
        createForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const currentUser = getCurrentUser();
            if (!currentUser) {
                alert('Please log in to create systems');
                return;
            }
            
            // Collect form data
            const system = {
                nome: document.getElementById('systemName').value,
                tipo: document.getElementById('systemType').value,
                transmitancia: parseFloat(document.getElementById('uValue').value),
                capacidade_termica: parseFloat(document.getElementById('thermalCapacity').value),
                identificacao: {
                    descricao: {
                        peso: parseFloat(document.getElementById('weight').value),
                        espessura: parseFloat(document.getElementById('thickness').value),
                        sistema_leve: document.getElementById('lightSystem').checked,
                        isolante_termico: document.getElementById('thermalInsulation').checked
                    },
                    camadas: document.getElementById('layers').value.split('\n').filter(l => l.trim()),
                    unidade: 'm²',
                    fronteira: 'Custom System',
                    validade: new Date().toLocaleDateString()
                },
                impactos: {
                    gwp: parseFloat(document.getElementById('gwp').value),
                    ap: parseFloat(document.getElementById('ap').value),
                    ep: parseFloat(document.getElementById('ep').value),
                    pocp: 0,
                    odp: 0,
                    adpnf: 0,
                    adpf: 0
                },
                consumo: {
                    total: parseFloat(document.getElementById('ced').value),
                    componentes: []
                },
                custom: true
            };
            
            // Save system
            const savedSystem = saveUserSystem(currentUser, system);
            
            // Add the created system to dataManager to make it available in the list
            if (!dataManager.systems.find(s => s.id === savedSystem.id)) {
                dataManager.systems.push(savedSystem);
            }
            
            // Show success message
            showAlert('success', 'System created successfully!');
            
            // Clear form
            createForm.reset();
            
            // Refresh My Systems display
            displayUserSystems();
            
            // Reload systems section to include the new system
            if (typeof renderSystems === 'function') {
                renderSystems();
            }
            
            // Scroll to My Systems
            scrollToSection('mysystems');
        });
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            createForm.reset();
        });
    }
    
    // Initialize tabs
    initializeTabs();
    
    // Display user systems on load
    if (isLoggedIn()) {
        displayUserSystems();
        displayUserComparisons();
    }
});

// ===== Load User Systems into DataManager =====
function loadUserSystemsIntoDataManager() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const userSystems = getUserSystems(currentUser);
    userSystems.forEach(system => {
        // Add to dataManager if it doesn't exist yet
        if (!dataManager.systems.find(s => s.id === system.id)) {
            dataManager.systems.push(system);
        }
    });
}

// ===== Tabs Management =====
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            btn.classList.add('active');
            if (tabName === 'created') {
                document.getElementById('createdTab').classList.add('active');
            } else {
                document.getElementById('comparisonsTab').classList.add('active');
            }
        });
    });
}

// ===== Display User Systems =====
function displayUserSystems() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const systems = getUserSystems(currentUser);
    const grid = document.getElementById('mySystemsGrid');
    
    if (systems.length === 0) {
        grid.innerHTML = '<div class="empty-state">No systems created yet. Create your first system above!</div>';
        return;
    }
    
    grid.innerHTML = systems.map(system => {
        const typeClass = system.tipo === 'Concreto' ? 'concrete' : 
                         system.tipo === 'Cerâmico' ? 'ceramic' : 'other';
        
        return `
            <div class="system-card ${typeClass}">
                <div class="system-header">
                    <h3 class="system-name">${system.nome}</h3>
                    <span class="badge badge-custom">Custom</span>
                </div>
                <div class="system-specs">
                    <div class="spec-item">
                        <span class="spec-label">U-Value:</span>
                        <span class="spec-value">${system.transmitancia.toFixed(2)} W/m²K</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Thermal Capacity:</span>
                        <span class="spec-value">${system.capacidade_termica.toFixed(0)} kJ/m²K</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Weight:</span>
                        <span class="spec-value">${system.identificacao.descricao.peso.toFixed(1)} kg/m²</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Thickness:</span>
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
                    <button class="btn btn-small btn-secondary" onclick="viewSystemDetail('${system.id}', true)">View Details</button>
                    <button class="btn btn-small btn-danger" onclick="confirmDeleteSystem('${system.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// ===== Display User Comparisons =====
function displayUserComparisons() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const comparisons = getUserComparisons(currentUser);
    const container = document.getElementById('myComparisons');
    
    if (comparisons.length === 0) {
        container.innerHTML = '<div class="empty-state">No comparisons performed yet. Compare systems to see history here!</div>';
        return;
    }
    
    container.innerHTML = comparisons.map(comp => {
        const date = new Date(comp.performedAt).toLocaleString();
        return `
            <div class="comparison-history-card">
                <div class="comparison-history-header">
                    <h4>Comparison - ${date}</h4>
                    <button class="btn btn-small btn-danger" onclick="confirmDeleteComparison('${comp.id}')">Delete</button>
                </div>
                <div class="comparison-history-systems">
                    <strong>Systems compared:</strong>
                    <ul>
                        ${comp.systems.map(s => `<li>${s}</li>`).join('')}
                    </ul>
                </div>
                <button class="btn btn-small btn-secondary" onclick="viewComparisonDetail('${comp.id}')">View Details</button>
            </div>
        `;
    }).join('');
}

// ===== View System Detail (Custom) =====
function viewSystemDetail(systemId, isCustom) {
    const currentUser = getCurrentUser();
    let system;
    
    if (isCustom) {
        const systems = getUserSystems(currentUser);
        system = systems.find(s => s.id === systemId);
    } else {
        system = dataManager.systems[systemId];
    }
    
    if (!system) return;
    
    showSystemDetail(system.id || systemId);
}

// ===== Delete System =====
function confirmDeleteSystem(systemId) {
    if (confirm('Are you sure you want to delete this system?')) {
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
        
        showAlert('success', 'System deleted successfully');
    }
}

// ===== Delete Comparison =====
function confirmDeleteComparison(comparisonId) {
    if (confirm('Are you sure you want to delete this comparison?')) {
        const currentUser = getCurrentUser();
        deleteUserComparison(currentUser, comparisonId);
        displayUserComparisons();
        showAlert('success', 'Comparison deleted successfully');
    }
}

// ===== Show Alert =====
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
