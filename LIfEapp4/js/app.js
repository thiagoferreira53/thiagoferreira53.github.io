// ===== Global State =====
let selectedSystems = [];
let currentPage = 1;
const systemsPerPage = 12;
let currentFilters = {};

// ===== Initialization =====
window.addEventListener('load', async () => {
    const loadingScreen = document.getElementById('loadingScreen');
    
    try {
        // Load all data
        await dataManager.loadAll();
        
        // Load user's custom systems into dataManager
        if (typeof loadUserSystemsIntoDataManager === 'function' && isLoggedIn()) {
            loadUserSystemsIntoDataManager();
        }
        
        // Update stats in hero
        const stats = dataManager.getStatistics();
        document.getElementById('systemCount').textContent = stats.totalSystems;
        document.getElementById('componentCount').textContent = stats.totalComponents;
        
        // Initialize app
        initializeApp();
        renderSystems();
        
        // Hide loading screen
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 1000);
        
    } catch (error) {
        console.error('Failed to load data:', error);
        loadingScreen.querySelector('.loader-text').textContent = 'Error loading data';
        loadingScreen.querySelector('.loader-subtitle').textContent = 'Please refresh the page';
    }
});

function initializeApp() {
    // Navigation
    setupNavigation();
    
    // Filters
    setupFilters();
    
    // Buttons
    document.getElementById('startAnalysis').addEventListener('click', () => {
        scrollToSection('systems');
    });
    
    document.getElementById('learnMore').addEventListener('click', () => {
        scrollToSection('about');
    });
    
    // Modal
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.querySelector('.modal-overlay').addEventListener('click', closeModal);
    
    // Compare button
    document.getElementById('compareBtn').addEventListener('click', showComparison);
}

// ===== Navigation =====
function setupNavigation() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        updateActiveLink();
    });

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const spans = navToggle.querySelectorAll('span');
        if (navMenu.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });

    // Smooth scroll for nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            scrollToSection(targetId);
            navMenu.classList.remove('active');
            const spans = navToggle.querySelectorAll('span');
            spans.forEach(span => span.style.transform = 'none');
            spans[1].style.opacity = '1';
        });
    });
}

function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offsetTop = section.offsetTop - 70;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// ===== Filters =====
function setupFilters() {
    document.getElementById('filterType').addEventListener('change', applyFilters);
    document.getElementById('filterLight').addEventListener('change', applyFilters);
    document.getElementById('filterInsulation').addEventListener('change', applyFilters);
    document.getElementById('filterOrigin').addEventListener('change', applyFilters);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);
    
    // Setup search input
    const searchInput = document.getElementById('searchSystem');
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentFilters.search = e.target.value.toLowerCase();
            currentPage = 1;
            renderSystems();
        }, 300); // 300ms debounce
    });
}

function applyFilters() {
    currentFilters = {
        type: document.getElementById('filterType').value,
        systemLeve: document.getElementById('filterLight').value,
        isolante: document.getElementById('filterInsulation').value,
        origin: document.getElementById('filterOrigin').value,
        search: document.getElementById('searchSystem').value.toLowerCase()
    };
    currentPage = 1;
    renderSystems();
}

function clearFilters() {
    document.getElementById('filterType').value = '';
    document.getElementById('filterLight').value = '';
    document.getElementById('filterInsulation').value = '';
    document.getElementById('filterOrigin').value = '';
    document.getElementById('searchSystem').value = '';
    currentFilters = {};
    currentPage = 1;
    renderSystems();
}

// ===== Systems Rendering =====
function renderSystems() {
    const grid = document.getElementById('systemsGrid');
    const systems = dataManager.getSystems(currentFilters);
    
    if (systems.length === 0) {
        grid.innerHTML = '<div class="empty-state">No systems found matching your criteria</div>';
        return;
    }
    
    const start = (currentPage - 1) * systemsPerPage;
    const end = start + systemsPerPage;
    const pageSystems = systems.slice(start, end);
    
    grid.innerHTML = pageSystems.map((system, index) => createSystemCard(system, start + index)).join('');
    renderPagination(systems.length);
    
    // Add click handlers
    document.querySelectorAll('.system-card').forEach(card => {
        card.addEventListener('click', () => {
            const systemId = card.dataset.systemId;
            // For custom systems, use the string ID; for database systems, use the index
            const id = systemId.includes('custom_') ? systemId : parseInt(systemId);
            showSystemDetail(id);
        });
    });
    
    document.querySelectorAll('.select-system').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const systemId = btn.dataset.systemId;
            // For custom systems, use the string ID; for database systems, use the index
            const id = systemId.includes('custom_') ? systemId : parseInt(systemId);
            toggleSystemSelection(id);
        });
    });
}

function createSystemCard(system, index) {
    // Use custom ID for custom systems, otherwise use the index
    const systemId = system.id || index;
    const isSelected = selectedSystems.includes(systemId);
    const typeClass = system.nome.includes('Concreto') ? 'concrete' : 
                     system.nome.includes('Cerâmico') ? 'ceramic' : 'other';
    
    return `
        <div class="system-card ${typeClass}" data-system-id="${systemId}">
            <div class="system-header">
                <h3 class="system-name">${system.nome}</h3>
                <button class="select-system ${isSelected ? 'selected' : ''}" data-system-id="${systemId}">
                    ${isSelected ? '✓ Selected' : '+ Select'}
                </button>
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
            <div class="system-tags">
                ${system.custom ? '<span class="tag tag-custom">Custom</span>' : ''}
                ${system.identificacao.descricao.sistema_leve ? '<span class="tag">Light System</span>' : ''}
                ${system.identificacao.descricao.isolante_termico ? '<span class="tag">Insulated</span>' : ''}
            </div>
        </div>
    `;
}

function renderPagination(totalSystems) {
    const totalPages = Math.ceil(totalSystems / systemsPerPage);
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '<button class="page-btn" onclick="changePage(' + (currentPage - 1) + ')" ' + 
               (currentPage === 1 ? 'disabled' : '') + '>‹ Previous</button>';
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += '<span class="page-ellipsis">...</span>';
        }
    }
    
    html += '<button class="page-btn" onclick="changePage(' + (currentPage + 1) + ')" ' + 
            (currentPage === totalPages ? 'disabled' : '') + '>Next ›</button>';
    
    pagination.innerHTML = html;
}

function changePage(page) {
    const systems = dataManager.getSystems(currentFilters);
    const totalPages = Math.ceil(systems.length / systemsPerPage);
    
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderSystems();
    scrollToSection('systems');
}

// ===== System Detail Modal =====
function showSystemDetail(systemId) {
    // Find system by ID (string for custom) or index (number for database)
    const system = typeof systemId === 'string' 
        ? dataManager.systems.find(s => s.id === systemId)
        : dataManager.systems[systemId];
    if (!system) return;
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2 class="modal-title">${system.nome}</h2>
        
        <div class="detail-section">
            <h3>System Information</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <strong>Unit:</strong> ${system.identificacao.unidade}
                </div>
                <div class="detail-item">
                    <strong>Boundary:</strong> ${system.identificacao.fronteira}
                </div>
                <div class="detail-item">
                    <strong>Validity:</strong> ${system.identificacao.validade}
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h3>Physical Properties</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <strong>Weight:</strong> ${system.identificacao.descricao.peso.toFixed(1)} kg/m²
                </div>
                <div class="detail-item">
                    <strong>Thickness:</strong> ${system.identificacao.descricao.espessura} cm
                </div>
                <div class="detail-item">
                    <strong>Light System:</strong> ${system.identificacao.descricao.sistema_leve ? 'Yes' : 'No'}
                </div>
                <div class="detail-item">
                    <strong>Thermal Insulation:</strong> ${system.identificacao.descricao.isolante_termico ? 'Yes' : 'No'}
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h3>Thermal Performance</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <strong>U-Value (Transmittance):</strong> ${system.transmitancia.toFixed(2)} W/m²K
                </div>
                <div class="detail-item">
                    <strong>Thermal Capacity:</strong> ${system.capacidade_termica.toFixed(0)} kJ/m²K
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h3>Layers</h3>
            <ol class="layers-list">
                ${system.identificacao.camadas.map(layer => `<li>${layer}</li>`).join('')}
            </ol>
        </div>

        <div class="detail-section">
            <h3>Environmental Impacts</h3>
            <div class="impacts-table">
                <div class="impact-row">
                    <span class="impact-name">GWP - Global Warming Potential</span>
                    <span class="impact-value">${formatScientific(system.impactos.gwp)} kg CO₂ eq</span>
                </div>
                <div class="impact-row">
                    <span class="impact-name">AP - Acidification Potential</span>
                    <span class="impact-value">${formatScientific(system.impactos.ap)} kg SO₂ eq</span>
                </div>
                <div class="impact-row">
                    <span class="impact-name">EP - Eutrophication Potential</span>
                    <span class="impact-value">${formatScientific(system.impactos.ep)} kg PO₄³⁻ eq</span>
                </div>
                <div class="impact-row">
                    <span class="impact-name">POCP - Photochemical Ozone Creation</span>
                    <span class="impact-value">${formatScientific(system.impactos.pocp)} kg C₂H₄ eq</span>
                </div>
                <div class="impact-row">
                    <span class="impact-name">ODP - Ozone Depletion Potential</span>
                    <span class="impact-value">${formatScientific(system.impactos.odp)} kg CFC-11 eq</span>
                </div>
                <div class="impact-row">
                    <span class="impact-name">ADPNF - Abiotic Depletion (non-fossil)</span>
                    <span class="impact-value">${formatScientific(system.impactos.adpnf)} kg Sb eq</span>
                </div>
                <div class="impact-row">
                    <span class="impact-name">ADPF - Abiotic Depletion (fossil)</span>
                    <span class="impact-value">${formatScientific(system.impactos.adpf)} MJ</span>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h3>Components Consumption</h3>
            <div class="components-table">
                <div class="component-header">
                    <span>Component</span>
                    <span>Consumption</span>
                    <span>GWP</span>
                </div>
                ${system.consumo.componentes.map(comp => `
                    <div class="component-row">
                        <span class="component-name">${comp.componente}</span>
                        <span>${formatScientific(comp.consumo_componente)}</span>
                        <span>${formatScientific(comp.gwp)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="total-row">
                <strong>Total Consumption:</strong> ${formatScientific(system.consumo.total)} MJ
            </div>
        </div>
    `;
    
    document.getElementById('systemModal').classList.add('active');
}

function closeModal() {
    document.getElementById('systemModal').classList.remove('active');
}

// ===== System Selection & Comparison =====
function toggleSystemSelection(systemId) {
    const index = selectedSystems.indexOf(systemId);
    
    if (index > -1) {
        selectedSystems.splice(index, 1);
    } else {
        if (selectedSystems.length >= 3) {
            alert('Maximum 3 systems can be compared at once');
            return;
        }
        selectedSystems.push(systemId);
    }
    
    updateSelectedSystems();
    renderSystems(); // Re-render to update button states
}

function updateSelectedSystems() {
    const container = document.getElementById('selectedSystems');
    const compareBtn = document.getElementById('compareBtn');
    
    if (selectedSystems.length === 0) {
        container.innerHTML = '<div class="empty-state">No systems selected</div>';
        compareBtn.disabled = true;
    } else {
        container.innerHTML = selectedSystems.map(id => {
            // Find system by ID (for custom) or by index (for database systems)
            const system = typeof id === 'string' 
                ? dataManager.systems.find(s => s.id === id)
                : dataManager.systems[id];
            
            return `
                <div class="selected-chip">
                    <span>${system.nome}</span>
                    <button onclick="toggleSystemSelection('${id}')" class="remove-chip">×</button>
                </div>
            `;
        }).join('');
        compareBtn.disabled = selectedSystems.length < 2;
    }
}

function showComparison() {
    if (selectedSystems.length < 2) return;
    
    // Get systems correctly by ID (string for custom) or index (number for database)
    const systems = selectedSystems.map(id => {
        if (typeof id === 'string') {
            return dataManager.systems.find(s => s.id === id);
        }
        return dataManager.systems[id];
    });
    const resultsDiv = document.getElementById('comparisonResults');
    
    resultsDiv.innerHTML = `
        <h3>Comparison Results</h3>
        <div class="comparison-grid">
            ${createComparisonTable(systems)}
        </div>
        <div class="comparison-charts">
            ${createComparisonCharts(systems)}
        </div>
    `;
    
    resultsDiv.style.display = 'block';
    scrollToSection('compare');
    
    // Save comparison to user history
    const currentUser = getCurrentUser();
    if (currentUser) {
        const comparison = {
            systems: systems.map(s => s.nome),
            systemIds: selectedSystems
        };
        saveUserComparison(currentUser, comparison);
        // Update comparison history display immediately
        displayUserComparisons();
    }
}

function createComparisonTable(systems) {
    return `
        <div class="comparison-table">
            <div class="comparison-row header">
                <div class="comparison-cell">Property</div>
                ${systems.map((s, i) => `<div class="comparison-cell">System ${i + 1}</div>`).join('')}
            </div>
            <div class="comparison-row">
                <div class="comparison-cell"><strong>Name</strong></div>
                ${systems.map(s => `<div class="comparison-cell">${s.nome}</div>`).join('')}
            </div>
            <div class="comparison-row">
                <div class="comparison-cell"><strong>U-Value (W/m²K)</strong></div>
                ${systems.map(s => {
                    const min = Math.min(...systems.map(sys => sys.transmitancia));
                    const isBest = s.transmitancia === min;
                    return `<div class="comparison-cell ${isBest ? 'best' : ''}">${s.transmitancia.toFixed(2)}</div>`;
                }).join('')}
            </div>
            <div class="comparison-row">
                <div class="comparison-cell"><strong>Thermal Capacity (kJ/m²K)</strong></div>
                ${systems.map(s => {
                    const max = Math.max(...systems.map(sys => sys.capacidade_termica));
                    const isBest = s.capacidade_termica === max;
                    return `<div class="comparison-cell ${isBest ? 'best' : ''}">${s.capacidade_termica.toFixed(0)}</div>`;
                }).join('')}
            </div>
            <div class="comparison-row">
                <div class="comparison-cell"><strong>Weight (kg/m²)</strong></div>
                ${systems.map(s => `<div class="comparison-cell">${s.identificacao.descricao.peso.toFixed(1)}</div>`).join('')}
            </div>
            <div class="comparison-row">
                <div class="comparison-cell"><strong>GWP (kg CO₂ eq)</strong></div>
                ${systems.map(s => {
                    const min = Math.min(...systems.map(sys => sys.impactos.gwp));
                    const isBest = s.impactos.gwp === min;
                    return `<div class="comparison-cell ${isBest ? 'best' : ''}">${formatScientific(s.impactos.gwp)}</div>`;
                }).join('')}
            </div>
            <div class="comparison-row">
                <div class="comparison-cell"><strong>AP (kg SO₂ eq)</strong></div>
                ${systems.map(s => {
                    const min = Math.min(...systems.map(sys => sys.impactos.ap));
                    const isBest = s.impactos.ap === min;
                    return `<div class="comparison-cell ${isBest ? 'best' : ''}">${formatScientific(s.impactos.ap)}</div>`;
                }).join('')}
            </div>
            <div class="comparison-row">
                <div class="comparison-cell"><strong>EP (kg PO₄³⁻ eq)</strong></div>
                ${systems.map(s => {
                    const min = Math.min(...systems.map(sys => sys.impactos.ep));
                    const isBest = s.impactos.ep === min;
                    return `<div class="comparison-cell ${isBest ? 'best' : ''}">${formatScientific(s.impactos.ep)}</div>`;
                }).join('')}
            </div>
            <div class="comparison-row">
                <div class="comparison-cell"><strong>Energy (MJ)</strong></div>
                ${systems.map(s => {
                    const min = Math.min(...systems.map(sys => sys.consumo.total));
                    const isBest = s.consumo.total === min;
                    return `<div class="comparison-cell ${isBest ? 'best' : ''}">${formatScientific(s.consumo.total)}</div>`;
                }).join('')}
            </div>
        </div>
    `;
}

function createComparisonCharts(systems) {
    const colors = ['#3b82f6', '#8b5cf6', '#06b6d4'];
    
    return `
        <div class="chart-section">
            <h4>Environmental Impacts Comparison</h4>
            <div class="bar-chart">
                ${['gwp', 'ap', 'ep', 'pocp'].map(impact => {
                    const impactNames = {
                        gwp: 'GWP',
                        ap: 'AP',
                        ep: 'EP',
                        pocp: 'POCP'
                    };
                    const maxValue = Math.max(...systems.map(s => s.impactos[impact]));
                    return `
                        <div class="chart-group">
                            <div class="chart-label">${impactNames[impact]}</div>
                            <div class="chart-bars">
                                ${systems.map((s, i) => {
                                    const percentage = (s.impactos[impact] / maxValue) * 100;
                                    return `
                                        <div class="bar-item">
                                            <div class="bar-fill" style="width: ${percentage}%; background: ${colors[i]}"></div>
                                            <span class="bar-value">${formatScientific(s.impactos[impact])}</span>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

// ===== Utility Functions =====
function formatScientific(num) {
    if (num === null || num === undefined) return 'N/A';
    if (Math.abs(num) < 0.01 || Math.abs(num) > 1000) {
        return num.toExponential(2);
    }
    return num.toFixed(2);
}

// Make functions globally accessible
window.changePage = changePage;
window.toggleSystemSelection = toggleSystemSelection;

// Log welcome message
console.log('%c🏗️ LIfE App v4.0', 'font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;');
console.log('%cBuilding Systems Environmental Analysis', 'font-size: 14px; color: #6b7280;');
