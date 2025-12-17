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
    document.getElementById('compareBtn').addEventListener('click', onCompareClick);

    // Comparison mode controls
    setupCompareControls();
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
    document.getElementById('filterLight')?.addEventListener('change', applyFilters);
    document.getElementById('filterInsulation').addEventListener('change', applyFilters);
    document.getElementById('filterOrigin').addEventListener('change', applyFilters);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);
    document.getElementById('printCatalog').addEventListener('click', printCatalog);
    
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
        isolante: document.getElementById('filterInsulation').value,
        origin: document.getElementById('filterOrigin').value,
        search: document.getElementById('searchSystem').value.toLowerCase()
    };
    currentPage = 1;
    renderSystems();
}

function clearFilters() {
    document.getElementById('filterType').value = '';
    const filterLight = document.getElementById('filterLight');
    if (filterLight) filterLight.value = '';
    document.getElementById('filterInsulation').value = '';
    document.getElementById('filterOrigin').value = '';
    document.getElementById('searchSystem').value = '';
    currentFilters = {};
    currentPage = 1;
    renderSystems();
}

function printCatalog() {
    window.print();
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
            <div class="system-actions" style="margin-top: 15px;">
                <button class="btn btn-secondary btn-small" onclick="openCartilhaModal('${systemId}')" style="width: 100%;">
                    📖 View System Guide
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
        updateCompareButtonState();
    } else {
        container.innerHTML = selectedSystems.map(id => {
            // Find system by ID (for custom) or by index (for database systems)
            const system = typeof id === 'string' 
                ? dataManager.systems.find(s => s.id === id)
                : dataManager.systems[id];
            
            return `
                <div class="selected-chip">
                    <span>${system.nome}</span>
                    <button class="remove-chip" data-system-id="${id}">×</button>
                </div>
            `;
        }).join('');
        
        // Add event listeners to remove buttons
        container.querySelectorAll('.remove-chip').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const systemId = e.target.dataset.systemId;
                // Convert back to number if it's a numeric string
                const id = /^\d+$/.test(systemId) ? parseInt(systemId) : systemId;
                toggleSystemSelection(id);
            });
        });
        
        updateCompareButtonState();
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

// ===== New: Compare Section Controls & Logic =====
function setupCompareControls() {
    const modeStandardsBtn = document.getElementById('modeStandardsBtn');
    const modeGroupsBtn = document.getElementById('modeGroupsBtn');
    const standardsControls = document.getElementById('standardsControls');
    const groupsControls = document.getElementById('groupsControls');

    // Default mode
    window.currentCompareMode = 'standards'; // 'standards' | 'groups'
    window.currentGroupMode = 'select'; // 'select' | 'all'

    const setMode = (mode) => {
        window.currentCompareMode = mode;
        // Toggle active
        modeStandardsBtn.classList.toggle('active', mode === 'standards');
        modeGroupsBtn.classList.toggle('active', mode === 'groups');
        // Show/hide controls
        standardsControls.style.display = mode === 'standards' ? 'block' : 'none';
        groupsControls.style.display = mode === 'groups' ? 'block' : 'none';
        // Update compare button
        updateCompareButtonState();
        // Clear previous results
        const resultsDiv = document.getElementById('comparisonResults');
        resultsDiv.style.display = 'none';
        resultsDiv.innerHTML = '';
    };

    modeStandardsBtn.addEventListener('click', () => setMode('standards'));
    modeGroupsBtn.addEventListener('click', () => setMode('groups'));

    // Group mode radios
    document.querySelectorAll('input[name="groupMode"]').forEach(r => {
        r.addEventListener('change', (e) => {
            window.currentGroupMode = e.target.value;
            updateCompareButtonState();
        });
    });

    // Standards checkboxes should refresh button state (if needed)
    document.querySelectorAll('#standardsControls .std-opt').forEach(cb => {
        cb.addEventListener('change', () => updateCompareButtonState());
    });
}

function updateCompareButtonState() {
    const compareBtn = document.getElementById('compareBtn');
    const mode = window.currentCompareMode || 'standards';
    if (mode === 'standards') {
        // Need at least 1 system and 1 standard
        const anyStd = Array.from(document.querySelectorAll('#standardsControls .std-opt'))
            .some(cb => cb.checked);
        compareBtn.disabled = !(selectedSystems.length >= 1 && anyStd);
        compareBtn.textContent = 'Compare';
    } else {
        // groups
        const groupMode = window.currentGroupMode || 'select';
        if (groupMode === 'select') {
            compareBtn.disabled = selectedSystems.length < 2;
            compareBtn.textContent = 'Compare selected';
        } else {
            compareBtn.disabled = false;
            compareBtn.textContent = 'Compare all groups';
        }
    }
}

function onCompareClick() {
    const mode = window.currentCompareMode || 'standards';
    if (mode === 'standards') {
        const systems = getSelectedSystemsObjects();
        const standards = getSelectedStandards();
        if (systems.length === 0 || standards.length === 0) return;
        renderStandardsComparison(systems, standards);
    } else {
        const groupMode = window.currentGroupMode || 'select';
        if (groupMode === 'select') {
            showComparison();
        } else {
            renderGroupComparison();
        }
    }
}

function getSelectedSystemsObjects() {
    return selectedSystems.map(id => (typeof id === 'string')
        ? dataManager.systems.find(s => s.id === id)
        : dataManager.systems[id]
    ).filter(Boolean);
}

function getSelectedStandards() {
    return Array.from(document.querySelectorAll('#standardsControls .std-opt'))
        .filter(cb => cb.checked)
        .map(cb => cb.value);
}

function renderStandardsComparison(systems, standards) {
    const regs = dataManager.getRegulations();
    const resultsDiv = document.getElementById('comparisonResults');

    const header = `<h3>Thermal standards compliance</h3>`;

    // Build table header
    const thead = `
        <div class="comparison-row header">
            <div class="comparison-cell">System</div>
            ${standards.map(std => `<div class="comparison-cell">${formatStandardLabel(std)}</div>`).join('')}
        </div>`;

    const rows = systems.map(sys => {
        const cells = standards.map(std => {
            const res = evaluateStandard(std, sys, regs);
            return `<div class="comparison-cell ${res.ok ? 'best' : ''}">${res.label}</div>`;
        }).join('');
        return `
            <div class="comparison-row">
                <div class="comparison-cell"><strong>${sys.nome}</strong></div>
                ${cells}
            </div>`;
    }).join('');

    const table = `<div class="comparison-table">${thead}${rows}</div>`;

    resultsDiv.innerHTML = `${header}${table}`;
    resultsDiv.style.display = 'block';
    scrollToSection('compare');
}

function formatStandardLabel(std) {
    switch (std) {
        case 'INI-C': return 'INI-C';
        case 'INI-R': return 'INI-R';
        case 'NBR15575': return 'NBR 15575';
        case 'ASHRAE_R': return 'ASHRAE 90.1 (R)';
        case 'ASHRAE_NR': return 'ASHRAE 90.1 (NR)';
        default: return std;
    }
}

function evaluateStandard(std, system, regs) {
    try {
        if (std === 'NBR15575' && regs.nbr15575) {
            const zonas = regs.nbr15575.zonas || [];
            let pass = 0;
            zonas.forEach(z => {
                const uMax = z.transmitancia_maxima.superior_limite;
                const ctMin = z.capacidade_minima || 0;
                const ok = (system.transmitancia <= uMax) && (system.capacidade_termica >= ctMin);
                if (ok) pass++;
            });
            return { ok: pass > 0, label: `${pass}/${zonas.length} zones` };
        }
        if (std === 'INI-R') {
            // INI-R prescriptive envelope maps to NBR 15575 thresholds (per LIfEapp3 description)
            const base = regs.nbr15575 || regs.rtqr; // fallback to RTQ-R if NBR missing
            if (!base) return { ok: false, label: 'N/A' };
            const zonas = base.zonas || [];
            let pass = 0;
            zonas.forEach(z => {
                const uMax = z.transmitancia_maxima?.superior_limite;
                const ctMin = (z.capacidade_minima ?? z.capacitancia_limite) || 0;
                const ok = (uMax == null ? true : system.transmitancia <= uMax) && (system.capacidade_termica >= ctMin);
                if (ok) pass++;
            });
            return { ok: pass > 0, label: `${pass}/${zonas.length} zones` };
        }
        if (std === 'INI-C' && regs.rtqc) {
            // Use RTQ-C style grading to infer INI-C envelope acceptability
            const zonas = regs.rtqc.zonas || [];
            const ct = system.capacidade_termica;
            let grade = 'E';
            zonas.forEach(z => {
                const ctMin = z.capacitancia_limite ?? z.capacidade_minima ?? 0;
                if (ct >= ctMin) {
                    const uA = z.nota_A?.transmitancia_maxima?.superior_limite;
                    const uB = z.nota_B?.transmitancia_maxima?.superior_limite;
                    const uCD = z.nota_CD?.transmitancia_maxima?.superior_limite;
                    if (uA != null && system.transmitancia <= uA) grade = 'A';
                    else if ((grade === 'E' || grade === 'C/D' || grade === 'B') && uB != null && system.transmitancia <= uB) grade = maxGrade(grade, 'B');
                    else if ((grade === 'E' || grade === 'C/D') && uCD != null && system.transmitancia <= uCD) grade = maxGrade(grade, 'C/D');
                }
            });
            return { ok: grade !== 'E', label: grade };
        }
        if (std === 'ASHRAE_R' && regs.ashrae_residential) {
            const zonas = regs.ashrae_residential.zonas || [];
            const isLight = !!system.identificacao?.descricao?.sistema_leve;
            let pass = 0;
            zonas.forEach(z => {
                const limit = isLight ? z.transmitancia_maxima.steel_frame : z.transmitancia_maxima.wall_mass;
                if (limit != null && system.transmitancia <= limit) pass++;
            });
            return { ok: pass > 0, label: `${pass}/${zonas.length} zones` };
        }
        if (std === 'ASHRAE_NR' && regs.ashrae_commercial) {
            const zonas = regs.ashrae_commercial.zonas || [];
            const isLight = !!system.identificacao?.descricao?.sistema_leve;
            let pass = 0;
            zonas.forEach(z => {
                const limit = isLight ? z.transmitancia_maxima.steel_frame : z.transmitancia_maxima.wall_mass;
                if (limit != null && system.transmitancia <= limit) pass++;
            });
            return { ok: pass > 0, label: `${pass}/${zonas.length} zones` };
        }
        return { ok: false, label: 'N/A' };
    } catch (e) {
        return { ok: false, label: 'N/A' };
    }
}

function maxGrade(current, next) {
    const order = ['E', 'C/D', 'B', 'A'];
    return order.indexOf(next) > order.indexOf(current) ? next : current;
}

function renderGroupComparison() {
    const resultsDiv = document.getElementById('comparisonResults');
    const systems = dataManager.getSystems({});

    const groups = {
        Concrete: [],
        Ceramic: [],
        Drywall: [],
        Other: []
    };

    systems.forEach(s => {
        const name = (s.nome || '').toLowerCase();
        if (name.includes('concreto')) groups.Concrete.push(s);
        else if (name.includes('cerâmico') || name.includes('ceramico')) groups.Ceramic.push(s);
        else if (name.includes('drywall')) groups.Drywall.push(s);
        else groups.Other.push(s);
    });

    const impacts = ['gwp', 'ap', 'ep', 'pocp'];
    const impactLabels = { gwp: 'GWP', ap: 'AP', ep: 'EP', pocp: 'POCP' };

    const avg = (arr) => arr.reduce((a, b) => a + b, 0) / (arr.length || 1);

    const groupStats = Object.keys(groups).map(g => {
        const list = groups[g];
        const vals = {
            gwp: avg(list.map(s => s.impactos.gwp || 0)),
            ap: avg(list.map(s => s.impactos.ap || 0)),
            ep: avg(list.map(s => s.impactos.ep || 0)),
            pocp: avg(list.map(s => s.impactos.pocp || 0))
        };
        return { group: g, ...vals };
    });

    const charts = impacts.map(impact => {
        const maxVal = Math.max(...groupStats.map(gs => gs[impact]));
        return `
            <div class="chart-group">
                <div class="chart-label">${impactLabels[impact]}</div>
                <div class="chart-bars">
                    ${groupStats.map((gs, i) => {
                        const pct = maxVal > 0 ? (gs[impact] / maxVal) * 100 : 0;
                        const color = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981'][i % 4];
                        return `
                            <div class="bar-item">
                                <div class="bar-fill" style="width: ${pct}%; background: ${color}"></div>
                                <span class="bar-value">${gs.group}: ${formatScientific(gs[impact])}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');

    resultsDiv.innerHTML = `
        <h3>Group comparison (average impacts)</h3>
        <div class="comparison-charts">
            ${charts}
        </div>
    `;
    resultsDiv.style.display = 'block';
    scrollToSection('compare');
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

// ===== Cartilha Modal Functions =====
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
        regulationsHTML = '<h3>BRAZILIAN STANDARDS AND REGULATIONS</h3>';
        
        if (nbr) {
            regulationsHTML += `
                <h4>${nbr.nome} - Building Performance Standard</h4>
                <table class="cartilha-table">
                    <thead>
                        <tr>
                            <th>Zone</th>
                            <th>Max Transmittance (W/m².K)</th>
                            <th>Min Thermal Capacity (kJ/m².K)</th>
                            <th>Absortance Limit</th>
                            <th>System Status</th>
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
                                    <td>Zone ${zona.zona}</td>
                                    <td>≤ ${uMax}</td>
                                    <td>≥ ${ctMin}</td>
                                    <td>≤ ${zona.absortancia_limite}</td>
                                    <td><strong>${meets ? '✓ Compliant' : '✗ Non-compliant'}</strong></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        }
        
        if (rtqr) {
            regulationsHTML += `
                <h4>${rtqr.nome} - Residential Building Energy Efficiency</h4>
                <table class="cartilha-table">
                    <thead>
                        <tr>
                            <th>Zone</th>
                            <th>Max Transmittance (W/m².K)</th>
                            <th>Min Thermal Capacity (kJ/m².K)</th>
                            <th>Absortance Limit</th>
                            <th>System Status</th>
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
                                    <td>Zone ${zona.zona}</td>
                                    <td>≤ ${uMax}</td>
                                    <td>≥ ${ctMin}</td>
                                    <td>≤ ${zona.absortancia_limite}</td>
                                    <td><strong>${meets ? '✓ Compliant' : '✗ Non-compliant'}</strong></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        }
        
        if (rtqc) {
            regulationsHTML += `
                <h4>${rtqc.nome} - Commercial Building Energy Efficiency</h4>
                <table class="cartilha-table">
                    <thead>
                        <tr>
                            <th>Zone</th>
                            <th>Grade A (≤ W/m².K)</th>
                            <th>Grade B (≤ W/m².K)</th>
                            <th>Grade C/D (≤ W/m².K)</th>
                            <th>Min Capacitance (kJ/m².K)</th>
                            <th>System Grade</th>
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
                                    <td>Zone ${zona.zona}</td>
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
        
        <h3>IDENTIFICATION</h3>
        <p><strong>Name:</strong> ${system.nome}</p>
        <p><strong>Light system:</strong> ${system.identificacao.descricao.sistema_leve ? 'Yes' : 'No'}</p>
        <p><strong>Thermal insulation:</strong> ${system.identificacao.descricao.isolante_termico ? 'Yes' : 'No'}</p>
        <p><strong>Weight:</strong> ${system.identificacao.descricao.peso} kg/m²</p>
        <p><strong>Thickness:</strong> ${system.identificacao.descricao.espessura} cm</p>
        <p><strong>Unit:</strong> ${system.identificacao.unidade}</p>
        <p><strong>Boundary:</strong> ${system.identificacao.fronteira}</p>
        <p><strong>Validity:</strong> ${system.identificacao.validade}</p>
        
        <h3>LAYERS</h3>
        <ol>
            ${system.identificacao.camadas.map(camada => `<li>${camada}</li>`).join('')}
        </ol>
        
        <h3>THERMAL PERFORMANCE</h3>
        <p><strong>Thermal transmittance (U):</strong> ${system.transmitancia} W/(m².K)</p>
        <p><strong>Thermal capacity (CT):</strong> ${system.capacidade_termica} kJ/(m².K)</p>
        
        <div style="max-width: 700px; margin: 2rem auto 3rem;">
            <canvas id="thermalChart" style="height: 280px;"></canvas>
        </div>
        
        ${regulationsHTML}
        
        <h3>ENVIRONMENTAL IMPACTS</h3>
        <table class="cartilha-table">
            <thead>
                <tr>
                    <th>Impact Category</th>
                    <th>Value</th>
                    <th>Unit</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Global Warming Potential (GWP)</td>
                    <td>${formatScientific(system.impactos.gwp)}</td>
                    <td>kg CO₂ eq</td>
                </tr>
                <tr>
                    <td>Acidification Potential (AP)</td>
                    <td>${formatScientific(system.impactos.ap)}</td>
                    <td>kg SO₂ eq</td>
                </tr>
                <tr>
                    <td>Eutrophication Potential (EP)</td>
                    <td>${formatScientific(system.impactos.ep)}</td>
                    <td>kg PO₄³⁻ eq</td>
                </tr>
                <tr>
                    <td>Photochemical Ozone Creation Potential (POCP)</td>
                    <td>${formatScientific(system.impactos.pocp)}</td>
                    <td>kg C₂H₄ eq</td>
                </tr>
                <tr>
                    <td>Ozone Depletion Potential (ODP)</td>
                    <td>${formatScientific(system.impactos.odp)}</td>
                    <td>kg CFC-11 eq</td>
                </tr>
                <tr>
                    <td>Abiotic Depletion Potential - non fossil (ADPnf)</td>
                    <td>${formatScientific(system.impactos.adpnf)}</td>
                    <td>kg Sb eq</td>
                </tr>
                <tr>
                    <td>Abiotic Depletion Potential - fossil (ADPf)</td>
                    <td>${formatScientific(system.impactos.adpf)}</td>
                    <td>MJ</td>
                </tr>
            </tbody>
        </table>
        
        <div style="max-width: 700px; margin: 2rem auto;">
            <canvas id="impactsChart" style="height: 280px;"></canvas>
        </div>
        
        <h3>COMPONENT CONSUMPTION & IMPACTS</h3>
        <p><strong>Total consumption:</strong> ${formatScientific(system.consumo.total)} kg</p>
        
        <div style="max-width: 700px; margin: 2rem auto;">
            <canvas id="componentGWPChart" style="height: 280px;"></canvas>
        </div>
        
        <table class="cartilha-table">
            <thead>
                <tr>
                    <th>Component</th>
                    <th>Consumption (kg)</th>
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
    
    // 1. Thermal Performance Comparison Chart
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
                    data: [system.transmitancia, system.capacidade_termica / 50], // Scale CT for visualization
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
                                    return `Transmittance: ${system.transmitancia} W/(m².K)`;
                                } else {
                                    return `Thermal Capacity: ${system.capacidade_termica} kJ/(m².K)`;
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
    
    // 2. Environmental Impacts Bar Chart (Horizontal)
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
    
    // 3. Component GWP Contribution Bar Chart (Horizontal)
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
        exportBtn.innerHTML = '⏳ Generating PDF…';
    }
    // Safety: ensure pointer events remain available after export
    const cleanup = () => {
        if (exportBtn) {
            exportBtn.disabled = false;
            exportBtn.innerHTML = originalLabel;
        }
        // Remove any html2pdf overlays or containers that might block clicks
        document.querySelectorAll('.html2pdf__overlay, .html2pdf__progress, [id^="html2pdf__"], [class^="html2pdf__"]').forEach(el => {
            try { el.remove(); } catch (_) { /* noop */ }
        });
        document.body.style.pointerEvents = '';
    };
    
    const opt = {
        margin: 10,
        filename: `${titulo.replace(/\s+/g, '_')}_Guide.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Generate and save PDF, then cleanup UI regardless of outcome
    try {
        const worker = html2pdf().set(opt).from(element).save();
        if (worker && typeof worker.then === 'function') {
            worker.then(() => cleanup()).catch(() => cleanup());
        } else {
            // Fallback cleanup if no promise is returned
            setTimeout(cleanup, 500);
        }
    } catch (e) {
        cleanup();
    }
}

// Make functions globally accessible
window.changePage = changePage;
window.toggleSystemSelection = toggleSystemSelection;
window.openCartilhaModal = openCartilhaModal;
window.closeCartilhaModal = closeCartilhaModal;
window.exportCartilhaToPDF = exportCartilhaToPDF;
window.onCompareClick = onCompareClick;

// Log welcome message
console.log('%c🏗️ LIfE App v4.0', 'font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;');
console.log('%cBuilding Systems Environmental Analysis', 'font-size: 14px; color: #6b7280;');
