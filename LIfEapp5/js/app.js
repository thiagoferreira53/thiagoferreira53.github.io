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
        console.error('Falha ao carregar dados:', error);
        loadingScreen.querySelector('.loader-text').textContent = 'Erro ao carregar dados';
        loadingScreen.querySelector('.loader-subtitle').textContent = 'Por favor, recarregue a página';
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
        }, 300); // Debounce de 300ms
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
    
    // Get image path if available
    const imagePath = system.imagem || '';
    
    return `
        <div class="system-card ${typeClass}" data-system-id="${systemId}">
            ${imagePath ? `<div class="system-image"><img src="${imagePath}" alt="${system.nome}" loading="lazy"></div>` : ''}
            <div class="system-header">
                <h3 class="system-name">${system.nome}</h3>
                <button class="select-system ${isSelected ? 'selected' : ''}" data-system-id="${systemId}">
                    ${isSelected ? '✓ Selecionado' : '+ Selecionar'}
                </button>
            </div>
            <div class="system-specs">
                <div class="spec-item">
                    <span class="spec-label">Valor U:</span>
                    <span class="spec-value">${system.transmitancia.toFixed(2)} W/m²K</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">Cap. Térmica:</span>
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
            <div class="system-tags">
                ${system.custom ? '<span class="tag tag-custom">Personalizado</span>' : ''}
                ${system.identificacao.descricao.sistema_leve ? '<span class="tag">Sistema Leve</span>' : ''}
                ${system.identificacao.descricao.isolante_termico ? '<span class="tag">Isolado</span>' : ''}
            </div>
            <div class="system-actions" style="margin-top: 15px;">
                <button class="btn btn-secondary btn-small" onclick="openCartilhaModal('${systemId}')" style="width: 100%;">
                    📖 Ver Cartilha do Sistema
                </button>
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
               (currentPage === 1 ? 'disabled' : '') + '>‹ Anterior</button>';
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += '<span class="page-ellipsis">...</span>';
        }
    }
    
    html += '<button class="page-btn" onclick="changePage(' + (currentPage + 1) + ')" ' + 
            (currentPage === totalPages ? 'disabled' : '') + '>Próxima ›</button>';
    
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
            <h3>Informações do Sistema</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <strong>Unidade:</strong> ${system.identificacao.unidade}
                </div>
                <div class="detail-item">
                    <strong>Fronteira:</strong> ${system.identificacao.fronteira}
                </div>
                <div class="detail-item">
                    <strong>Validade:</strong> ${system.identificacao.validade}
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h3>Propriedades Físicas</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <strong>Peso:</strong> ${system.identificacao.descricao.peso.toFixed(1)} kg/m²
                </div>
                <div class="detail-item">
                    <strong>Espessura:</strong> ${system.identificacao.descricao.espessura} cm
                </div>
                <div class="detail-item">
                    <strong>Sistema Leve:</strong> ${system.identificacao.descricao.sistema_leve ? 'Sim' : 'Não'}
                </div>
                <div class="detail-item">
                    <strong>Isolamento Térmico:</strong> ${system.identificacao.descricao.isolante_termico ? 'Sim' : 'Não'}
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h3>Desempenho Térmico</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <strong>Valor U (Transmitância):</strong> ${system.transmitancia.toFixed(2)} W/m²K
                </div>
                <div class="detail-item">
                    <strong>Capacidade Térmica:</strong> ${system.capacidade_termica.toFixed(0)} kJ/m²K
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h3>Camadas</h3>
            <ol class="layers-list">
                ${system.identificacao.camadas.map(layer => `<li>${layer}</li>`).join('')}
            </ol>
        </div>

        <div class="detail-section">
            <h3>Impactos Ambientais</h3>
            <div class="impacts-table">
                <div class="impact-row">
                    <span class="impact-name">GWP - Potencial de Aquecimento Global</span>
                    <span class="impact-value">${formatScientific(system.impactos.gwp)} kg CO₂ eq</span>
                </div>
                <div class="impact-row">
                    <span class="impact-name">AP - Potencial de Acidificação</span>
                    <span class="impact-value">${formatScientific(system.impactos.ap)} kg SO₂ eq</span>
                </div>
                <div class="impact-row">
                    <span class="impact-name">EP - Potencial de Eutrofização</span>
                    <span class="impact-value">${formatScientific(system.impactos.ep)} kg PO₄³⁻ eq</span>
                </div>
                <div class="impact-row">
                    <span class="impact-name">POCP - Criação de Ozônio Fotoquímico</span>
                    <span class="impact-value">${formatScientific(system.impactos.pocp)} kg C₂H₄ eq</span>
                </div>
                <div class="impact-row">
                    <span class="impact-name">ODP - Depleção da Camada de Ozônio</span>
                    <span class="impact-value">${formatScientific(system.impactos.odp)} kg CFC-11 eq</span>
                </div>
                <div class="impact-row">
                    <span class="impact-name">ADPNF - Depleção Abiótica (não-fóssil)</span>
                    <span class="impact-value">${formatScientific(system.impactos.adpnf)} kg Sb eq</span>
                </div>
                <div class="impact-row">
                    <span class="impact-name">ADPF - Depleção Abiótica (fóssil)</span>
                    <span class="impact-value">${formatScientific(system.impactos.adpf)} MJ</span>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h3>Consumo de Componentes</h3>
            <div class="components-table">
                <div class="component-header">
                    <span>Componente</span>
                    <span>Consumo</span>
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
                <strong>Consumo Total:</strong> ${formatScientific(system.consumo.total)} MJ
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
            alert('Máximo de 3 sistemas podem ser comparados de cada vez');
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
        container.innerHTML = '<div class="empty-state">Nenhum sistema selecionado</div>';
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
        <h3>Resultados da Comparação</h3>
        <div class="comparison-grid">
            ${createComparisonTable(systems)}
        </div>
        <div class="comparison-charts">
            ${createComparisonCharts(systems)}
        </div>
    `;
    
    resultsDiv.style.display = 'block';
    scrollToSection('compare');
    
    // Salvar comparação no histórico do usuário
    const currentUser = getCurrentUser();
    if (currentUser) {
        const comparison = {
            systems: systems.map(s => s.nome),
            systemIds: selectedSystems
        };
        saveUserComparison(currentUser, comparison);
        // Atualizar a exibição do histórico imediatamente
        displayUserComparisons();
    }
}

function createComparisonTable(systems) {
    return `
        <div class="comparison-table">
            <div class="comparison-row header">
                <div class="comparison-cell">Propriedade</div>
                ${systems.map((s, i) => `<div class="comparison-cell">Sistema ${i + 1}</div>`).join('')}
            </div>
            <div class="comparison-row">
                <div class="comparison-cell"><strong>Nome</strong></div>
                ${systems.map(s => `<div class="comparison-cell">${s.nome}</div>`).join('')}
            </div>
            <div class="comparison-row">
                <div class="comparison-cell"><strong>Valor U (W/m²K)</strong></div>
                ${systems.map(s => {
                    const min = Math.min(...systems.map(sys => sys.transmitancia));
                    const isBest = s.transmitancia === min;
                    return `<div class="comparison-cell ${isBest ? 'best' : ''}">${s.transmitancia.toFixed(2)}</div>`;
                }).join('')}
            </div>
            <div class="comparison-row">
                <div class="comparison-cell"><strong>Capacidade Térmica (kJ/m²K)</strong></div>
                ${systems.map(s => {
                    const max = Math.max(...systems.map(sys => sys.capacidade_termica));
                    const isBest = s.capacidade_termica === max;
                    return `<div class="comparison-cell ${isBest ? 'best' : ''}">${s.capacidade_termica.toFixed(0)}</div>`;
                }).join('')}
            </div>
            <div class="comparison-row">
                <div class="comparison-cell"><strong>Peso (kg/m²)</strong></div>
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
                <div class="comparison-cell"><strong>Energia (MJ)</strong></div>
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
            <h4>Comparação de Impactos Ambientais</h4>
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

// ===== Funções do Modal Cartilha =====
function openCartilhaModal(systemIndex) {
    const system = typeof systemIndex === 'string' && systemIndex.includes('custom_')
        ? dataManager.systems.find(s => s.id === systemIndex)
        : dataManager.systems[systemIndex];
    
    if (!system) return;
    
    const modal = document.getElementById('cartilhaModal');
    const titulo = document.getElementById('cartilhaTitulo');
    const content = document.getElementById('cartilhaContent');
    
    titulo.textContent = system.nome;
    
    // Generate regulations section
    const nbr = dataManager.regulations.nbr15575;
    const rtqr = dataManager.regulations.rtqr;
    const rtqc = dataManager.regulations.rtqc;
    
    let regulationsHTML = '';
    if (nbr || rtqr || rtqc) {
        regulationsHTML = '<h3>NORMAS E REGULAMENTOS BRASILEIROS</h3>';
        
        if (nbr) {
            regulationsHTML += `
                <h4>${nbr.nome} - Norma de Desempenho de Edificações</h4>
                <table class="cartilha-table">
                    <thead>
                        <tr>
                            <th>Zona</th>
                            <th>Transmitância Máx (W/m².K)</th>
                            <th>Capacidade Térmica Mín (kJ/m².K)</th>
                            <th>Limite de Absortância</th>
                            <th>Status do Sistema</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${nbr.zonas.map(zona => {
                            const uMax = zona.transmitancia_maxima.superior_limite;
                            const ctMin = zona.capacidade_minima;
                            const meetsU = system.transmitancia <= uMax;
                            const meetsCT = system.capacidade_termica >= ctMin;
                            const meets = meetsU && meetsCT;
                            return `
                                <tr style="background-color: ${meets ? '#d1fae5' : '#fee2e2'}">
                                    <td>Zona ${zona.zona}</td>
                                    <td>≤ ${uMax}</td>
                                    <td>≥ ${ctMin}</td>
                                    <td>≤ ${zona.absortancia_limite}</td>
                                    <td><strong>${meets ? '✓ Atende' : '✗ Não atende'}</strong></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        }
        
        if (rtqr) {
            regulationsHTML += `
                <h4>${rtqr.nome} - Eficiência Energética de Edificações Residenciais</h4>
                <table class="cartilha-table">
                    <thead>
                        <tr>
                            <th>Zona</th>
                            <th>Transmitância Máx (W/m².K)</th>
                            <th>Capacidade Térmica Mín (kJ/m².K)</th>
                            <th>Limite de Absortância</th>
                            <th>Status do Sistema</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rtqr.zonas.map(zona => {
                            const uMax = zona.transmitancia_maxima.superior_limite;
                            const ctMin = zona.capacidade_minima;
                            const meetsU = system.transmitancia <= uMax;
                            const meetsCT = system.capacidade_termica >= ctMin;
                            const meets = meetsU && meetsCT;
                            return `
                                <tr style="background-color: ${meets ? '#d1fae5' : '#fee2e2'}">
                                    <td>Zona ${zona.zona}</td>
                                    <td>≤ ${uMax}</td>
                                    <td>≥ ${ctMin}</td>
                                    <td>≤ ${zona.absortancia_limite}</td>
                                    <td><strong>${meets ? '✓ Atende' : '✗ Não atende'}</strong></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        }
        
        if (rtqc) {
            regulationsHTML += `
                <h4>${rtqc.nome} - Eficiência Energética de Edificações Comerciais</h4>
                <table class="cartilha-table">
                    <thead>
                        <tr>
                            <th>Zona</th>
                            <th>Nota A (≤ W/m².K)</th>
                            <th>Nota B (≤ W/m².K)</th>
                            <th>Nota C/D (≤ W/m².K)</th>
                            <th>Capacitância Mín (kJ/m².K)</th>
                            <th>Nota do Sistema</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rtqc.zonas.map(zona => {
                            const uA = zona.nota_A.transmitancia_maxima.superior_limite;
                            const uB = zona.nota_B.transmitancia_maxima.superior_limite;
                            const uCD = zona.nota_CD.transmitancia_maxima.superior_limite;
                            const ctMin = zona.capacitancia_limite;
                            
                            let grade = 'N/A';
                            let bgColor = '#fee2e2';
                            if (system.capacidade_termica >= ctMin) {
                                if (system.transmitancia <= uA) {
                                    grade = 'A';
                                    bgColor = '#d1fae5';
                                } else if (system.transmitancia <= uB) {
                                    grade = 'B';
                                    bgColor = '#dbeafe';
                                } else if (system.transmitancia <= uCD) {
                                    grade = 'C/D';
                                    bgColor = '#fef3c7';
                                } else {
                                    grade = 'E';
                                }
                            }
                            
                            return `
                                <tr style="background-color: ${bgColor}">
                                    <td>Zona ${zona.zona}</td>
                                    <td>≤ ${uA}</td>
                                    <td>≤ ${uB}</td>
                                    <td>≤ ${uCD}</td>
                                    <td>≥ ${ctMin}</td>
                                    <td><strong>${grade}</strong></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        }
    }
    
    content.innerHTML = `
        ${system.imagem ? `<img src="${system.imagem}" alt="${system.nome}" class="cartilha-image">` : ''}
        
        <h3>IDENTIFICAÇÃO</h3>
        <p><strong>Nome:</strong> ${system.nome}</p>
        <p><strong>Sistema leve:</strong> ${system.identificacao.descricao.sistema_leve ? 'Sim' : 'Não'}</p>
        <p><strong>Isolante térmico:</strong> ${system.identificacao.descricao.isolante_termico ? 'Sim' : 'Não'}</p>
        <p><strong>Peso:</strong> ${system.identificacao.descricao.peso} kg/m²</p>
        <p><strong>Espessura:</strong> ${system.identificacao.descricao.espessura} cm</p>
        <p><strong>Unidade:</strong> ${system.identificacao.unidade}</p>
        <p><strong>Fronteira:</strong> ${system.identificacao.fronteira}</p>
        <p><strong>Validade:</strong> ${system.identificacao.validade}</p>
        
        <h3>CAMADAS</h3>
        <ol>
            ${system.identificacao.camadas.map(camada => `<li>${camada}</li>`).join('')}
        </ol>
        
        <h3>DESEMPENHO TÉRMICO</h3>
        <p><strong>Transmitância térmica (U):</strong> ${system.transmitancia} W/(m².K)</p>
        <p><strong>Capacidade térmica (CT):</strong> ${system.capacidade_termica} kJ/(m².K)</p>
        
        <div style="max-width: 700px; margin: 2rem auto 3rem;">
            <canvas id="thermalChart" style="height: 280px;"></canvas>
        </div>
        
        ${regulationsHTML}
        
        <h3>IMPACTOS AMBIENTAIS</h3>
        <table class="cartilha-table">
            <thead>
                <tr>
                    <th>Categoria de Impacto</th>
                    <th>Valor</th>
                    <th>Unidade</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Potencial de Aquecimento Global (GWP)</td>
                    <td>${formatScientific(system.impactos.gwp)}</td>
                    <td>kg CO₂ eq</td>
                </tr>
                <tr>
                    <td>Potencial de Acidificação (AP)</td>
                    <td>${formatScientific(system.impactos.ap)}</td>
                    <td>kg SO₂ eq</td>
                </tr>
                <tr>
                    <td>Potencial de Eutrofização (EP)</td>
                    <td>${formatScientific(system.impactos.ep)}</td>
                    <td>kg PO₄³⁻ eq</td>
                </tr>
                <tr>
                    <td>Potencial de Criação de Ozônio Fotoquímico (POCP)</td>
                    <td>${formatScientific(system.impactos.pocp)}</td>
                    <td>kg C₂H₄ eq</td>
                </tr>
                <tr>
                    <td>Potencial de Depleção da Camada de Ozônio (ODP)</td>
                    <td>${formatScientific(system.impactos.odp)}</td>
                    <td>kg CFC-11 eq</td>
                </tr>
                <tr>
                    <td>Potencial de Depleção Abiótica - não fóssil (ADPnf)</td>
                    <td>${formatScientific(system.impactos.adpnf)}</td>
                    <td>kg Sb eq</td>
                </tr>
                <tr>
                    <td>Potencial de Depleção Abiótica - fóssil (ADPf)</td>
                    <td>${formatScientific(system.impactos.adpf)}</td>
                    <td>MJ</td>
                </tr>
            </tbody>
        </table>
        
        <div style="max-width: 700px; margin: 2rem auto;">
            <canvas id="impactsChart" style="height: 280px;"></canvas>
        </div>
        
        <h3>CONSUMO DE COMPONENTES & IMPACTOS</h3>
        <p><strong>Consumo total:</strong> ${formatScientific(system.consumo.total)} kg</p>
        
        <div style="max-width: 700px; margin: 2rem auto;">
            <canvas id="componentGWPChart" style="height: 280px;"></canvas>
        </div>
        
        <table class="cartilha-table">
            <thead>
                <tr>
                    <th>Componente</th>
                    <th>Consumo (kg)</th>
                    <th>GWP (kg CO₂ eq)</th>
                    <th>AP (kg SO₂ eq)</th>
                    <th>EP (kg PO₄³⁻ eq)</th>
                    <th>POCP (kg C₂H₄ eq)</th>
                </tr>
            </thead>
            <tbody>
                ${system.consumo.componentes.map(comp => `
                    <tr>
                        <td>${comp.componente}</td>
                        <td>${formatScientific(comp.consumo_componente)}</td>
                        <td>${formatScientific(comp.gwp)}</td>
                        <td>${formatScientific(comp.ap)}</td>
                        <td>${formatScientific(comp.ep)}</td>
                        <td>${formatScientific(comp.pocp)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Create charts after modal is visible
    setTimeout(() => {
        createCartilhaCharts(system);
    }, 100);
}

function createCartilhaCharts(system) {
    // Destroy existing charts if they exist
    if (window.cartilhaCharts) {
        window.cartilhaCharts.forEach(chart => chart.destroy());
    }
    window.cartilhaCharts = [];
    
    // 1. Gráfico de Desempenho Térmico
    const thermalCanvas = document.getElementById('thermalChart');
    if (thermalCanvas) {
        const thermalChart = new Chart(thermalCanvas, {
            type: 'bar',
            data: {
                labels: [
                    `U = ${system.transmitancia} W/(m².K)`,
                    `CT = ${system.capacidade_termica} kJ/(m².K)`
                ],
                datasets: [{
                    data: [system.transmitancia, system.capacidade_termica / 50], // Escala CT para visualização
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: 'rgb(102, 126, 234)',
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                if (context.dataIndex === 0) {
                                    return `Transmitância: ${system.transmitancia} W/(m².K)`;
                                } else {
                                    return `Capacidade Térmica: ${system.capacidade_termica} kJ/(m².K)`;
                                }
                            }
                        }
                    }
                },
                scales: {
                    x: { display: false, beginAtZero: true },
                    y: { ticks: { font: { size: 11 } } }
                }
            }
        });
        window.cartilhaCharts.push(thermalChart);
    }
    
    // 2. Gráfico de Barras de Impactos Ambientais (Horizontal)
    const impactsCanvas = document.getElementById('impactsChart');
    if (impactsCanvas) {
        const impactsChart = new Chart(impactsCanvas, {
            type: 'bar',
            data: {
                labels: [
                    'GWP (kg CO₂ eq)',
                    'AP (kg SO₂ eq)',
                    'EP (kg PO₄³⁻ eq)',
                    'POCP (kg C₂H₄ eq)',
                    'ODP (kg CFC-11 eq)',
                    'ADPnf (kg Sb eq)',
                    'ADPf (MJ)'
                ],
                datasets: [{
                    data: [
                        system.impactos.gwp,
                        system.impactos.ap * 300,
                        system.impactos.ep * 1000,
                        system.impactos.pocp * 5000,
                        system.impactos.odp * 10000000,
                        system.impactos.adpnf * 20000000,
                        system.impactos.adpf / 5
                    ],
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: 'rgb(102, 126, 234)',
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const realValues = [
                                    system.impactos.gwp.toExponential(2),
                                    system.impactos.ap.toExponential(2),
                                    system.impactos.ep.toExponential(2),
                                    system.impactos.pocp.toExponential(2),
                                    system.impactos.odp.toExponential(2),
                                    system.impactos.adpnf.toExponential(2),
                                    system.impactos.adpf.toExponential(2)
                                ];
                                return realValues[context.dataIndex];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: false,
                        beginAtZero: true
                    },
                    y: {
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    }
                }
            }
        });
        window.cartilhaCharts.push(impactsChart);
    }
    
    // 3. Gráfico de Barras de Contribuição GWP por Componente (Horizontal)
    const gwpCanvas = document.getElementById('componentGWPChart');
    if (gwpCanvas) {
        const gwpChart = new Chart(gwpCanvas, {
            type: 'bar',
            data: {
                labels: system.consumo.componentes.map(c => c.componente),
                datasets: [{
                    data: system.consumo.componentes.map(c => c.gwp),
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: 'rgb(102, 126, 234)',
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const percentage = ((context.parsed.x / system.impactos.gwp) * 100).toFixed(1);
                                return `${context.parsed.x.toExponential(2)} kg CO₂ eq (${percentage}%)`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: false,
                        beginAtZero: true
                    },
                    y: {
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    }
                }
            }
        });
        window.cartilhaCharts.push(gwpChart);
    }
}

function closeCartilhaModal() {
    const modal = document.getElementById('cartilhaModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Destroy charts when closing modal
    if (window.cartilhaCharts && window.cartilhaCharts.length > 0) {
        window.cartilhaCharts.forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });
        window.cartilhaCharts = [];
    }
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('cartilhaModal');
    if (e.target === modal) {
        closeCartilhaModal();
    }
});

function exportCartilhaToPDF() {
    const element = document.getElementById('cartilhaContent');
    const titulo = document.getElementById('cartilhaTitulo').textContent;
    const exportBtn = document.querySelector('.cartilha-actions button[onclick="exportCartilhaToPDF()"]');
    const originalLabel = exportBtn ? exportBtn.innerHTML : null;
    if (exportBtn) {
        exportBtn.disabled = true;
        exportBtn.innerHTML = '⏳ Gerando PDF…';
    }
    const cleanup = () => {
        if (exportBtn) {
            exportBtn.disabled = false;
            exportBtn.innerHTML = originalLabel;
        }
        document.querySelectorAll('.html2pdf__overlay, .html2pdf__progress, [id^="html2pdf__"], [class^="html2pdf__"]').forEach(el => {
            try { el.remove(); } catch (_) { /* noop */ }
        });
        document.body.style.pointerEvents = '';
    };
    
    const opt = {
        margin: 10,
        filename: `${titulo.replace(/\s+/g, '_')}_Cartilha.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    try {
        const worker = html2pdf().set(opt).from(element).save();
        if (worker && typeof worker.then === 'function') {
            worker.then(() => cleanup()).catch(() => cleanup());
        } else {
            setTimeout(cleanup, 500);
        }
    } catch (_) {
        cleanup();
    }
}

// Make functions globally accessible
window.changePage = changePage;
window.toggleSystemSelection = toggleSystemSelection;
window.openCartilhaModal = openCartilhaModal;
window.closeCartilhaModal = closeCartilhaModal;
window.exportCartilhaToPDF = exportCartilhaToPDF;

// Log welcome message
console.log('%c🏗️ LIfE App v4.0', 'font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;');
console.log('%cBuilding Systems Environmental Analysis', 'font-size: 14px; color: #6b7280;');
