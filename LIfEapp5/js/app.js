// ===== E³ Build – Main Application =====
// SPA router, system rendering, comparison, cartilha, charts, PDF export

(function () {
    'use strict';

    // ===== State =====
    let currentPage = 'home';
    let selectedSystems = [];          // array of system indices / ids
    const ITEMS_PER_PAGE = 12;
    let currentSystemPage = 1;
    let filteredSystems = [];
    let selectedLayers = [];           // for create-system form

    // Chart colour palette
    const chartColors = [
        'rgba(61, 122, 84, 0.85)',
        'rgba(196, 154, 92, 0.85)',
        'rgba(90, 138, 106, 0.85)',
        'rgba(140, 122, 102, 0.85)',
        'rgba(143, 170, 181, 0.85)'
    ];

    // ===================================================================
    //  SPA Navigation
    // ===================================================================
    function navigateTo(pageName) {
        const pages = document.querySelectorAll('.page');
        pages.forEach(p => p.classList.remove('active'));

        const target = document.getElementById(`page-${pageName}`);
        if (target) target.classList.add('active');

        // Update nav active link
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        const link = document.querySelector(`.nav-link[data-nav="${pageName}"]`);
        if (link) link.classList.add('active');

        currentPage = pageName;
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Page-specific init
        if (pageName === 'systems' && dataManager.loaded) renderSystems();
        if (pageName === 'compare') renderSelectedChips();
        if (pageName === 'create' && dataManager.loaded) renderComponentsList();
        if (pageName === 'history' && isLoggedIn()) {
            displayUserSystems();
            displayUserComparisons();
        }

        // Update i18n for dynamically-rendered content
        i18n.updatePage();

        // Close mobile menu
        document.getElementById('navMenu')?.classList.remove('active');
    }
    // expose globally
    window.navigateTo = navigateTo;

    // ===================================================================
    //  Initialisation
    // ===================================================================
    document.addEventListener('DOMContentLoaded', async () => {
        // --- Language Switcher ---
        document.querySelectorAll('.lang-flag').forEach(btn => {
            btn.addEventListener('click', () => i18n.setLanguage(btn.dataset.lang));
        });
        // Set initial flag state from i18n
        document.querySelectorAll('.lang-flag').forEach(f => f.classList.remove('active'));
        const initFlag = document.querySelector(`.lang-flag[data-lang="${i18n.getLang()}"]`);
        if (initFlag) initFlag.classList.add('active');

        // --- Nav scroll effect ---
        window.addEventListener('scroll', () => {
            document.querySelector('.navbar')?.classList.toggle('scrolled', window.scrollY > 30);
        });

        // --- Mobile toggle ---
        document.getElementById('navToggle')?.addEventListener('click', () => {
            document.getElementById('navMenu')?.classList.toggle('active');
        });

        // --- Navigation clicks (nav links + feature cards + any data-nav) ---
        document.addEventListener('click', (e) => {
            const navEl = e.target.closest('[data-nav]');
            if (navEl) {
                e.preventDefault();
                const page = navEl.dataset.nav;
                // Protected pages
                if (['compare', 'create', 'history'].includes(page)) {
                    requireLogin(() => navigateTo(page));
                } else {
                    navigateTo(page);
                }
            }
        });

        // --- Hero CTA buttons ---
        document.getElementById('startAnalysis')?.addEventListener('click', () => navigateTo('systems'));
        document.getElementById('learnMore')?.addEventListener('click', () => navigateTo('about'));

        // --- Load Data ---
        try {
            await dataManager.loadAll();
            // Load user systems into data manager
            if (isLoggedIn()) loadUserSystemsIntoDataManager();

            // Update stats on hero
            const stats = dataManager.getStatistics();
            if (stats) {
                document.getElementById('systemCount').textContent = stats.totalSystems;
                document.getElementById('componentCount').textContent = stats.totalComponents;
            }
        } catch (err) {
            console.error('Error loading data:', err);
        }

        // Hide loading screen
        const ls = document.getElementById('loadingScreen');
        if (ls) { ls.classList.add('hidden'); setTimeout(() => ls.remove(), 600); }

        // i18n initial update
        i18n.updatePage();

        // --- Filters ---
        document.getElementById('searchSystem')?.addEventListener('input', () => { currentSystemPage = 1; renderSystems(); });
        document.getElementById('filterType')?.addEventListener('change', () => { currentSystemPage = 1; renderSystems(); });
        document.getElementById('filterInsulation')?.addEventListener('change', () => { currentSystemPage = 1; renderSystems(); });
        document.getElementById('filterOrigin')?.addEventListener('change', () => { currentSystemPage = 1; renderSystems(); });
        document.getElementById('clearFilters')?.addEventListener('click', clearFilters);
        document.getElementById('printCatalog')?.addEventListener('click', () => window.print());

        // --- Compare ---
        document.getElementById('compareBtn')?.addEventListener('click', () => {
            requireLogin(() => showComparison());
        });

        // --- System detail modal ---
        document.getElementById('modalClose')?.addEventListener('click', closeSystemModal);
        document.querySelector('#systemModal .modal-overlay')?.addEventListener('click', closeSystemModal);

        // --- Create form: override default submit to require login ---
        const createForm = document.getElementById('createSystemForm');
        if (createForm) {
            // Remove existing listener from userSystems.js (it fires on DOMContentLoaded too)
            // We'll add our own wrapper here:
            createForm.addEventListener('submit', handleCreateSystem, true);
        }
        document.getElementById('componentSearch')?.addEventListener('input', renderComponentsList);
    });

    // ===================================================================
    //  Render Systems (Grid + Pagination)
    // ===================================================================
    function renderSystems() {
        const grid = document.getElementById('systemsGrid');
        if (!grid || !dataManager.loaded) return;

        const search = document.getElementById('searchSystem')?.value || '';
        const type = document.getElementById('filterType')?.value || '';
        const insulation = document.getElementById('filterInsulation')?.value || '';
        const origin = document.getElementById('filterOrigin')?.value || '';

        filteredSystems = dataManager.getSystems({ search, type, isolante: insulation, origin });

        if (filteredSystems.length === 0) {
            grid.innerHTML = `<div class="empty-state">${i18n.t('systems.noResults')}</div>`;
            document.getElementById('pagination').innerHTML = '';
            return;
        }

        const totalPages = Math.ceil(filteredSystems.length / ITEMS_PER_PAGE);
        if (currentSystemPage > totalPages) currentSystemPage = totalPages;
        const start = (currentSystemPage - 1) * ITEMS_PER_PAGE;
        const pageItems = filteredSystems.slice(start, start + ITEMS_PER_PAGE);

        grid.innerHTML = pageItems.map(system => createSystemCard(system)).join('');
        renderPagination(totalPages);
    }
    window.renderSystems = renderSystems;

    function createSystemCard(system) {
        const idx = dataManager.systems.indexOf(system);
        const isCustom = system.custom === true;
        const isSelected = selectedSystems.includes(idx);
        const typeClass = getTypeClass(system);

        const imageSrc = system.imagem || '';
        const imageHtml = imageSrc
            ? `<div class="system-image"><img src="${imageSrc}" alt="${system.nome}" loading="lazy"></div>`
            : '';

        return `
        <div class="system-card ${typeClass}" onclick="showSystemDetail(${idx})">
            ${isCustom ? `<span class="badge-custom">Custom</span>` : ''}
            ${imageHtml}
            <div class="system-header">
                <h3 class="system-name">${system.nome}</h3>
                <button class="select-system ${isSelected ? 'selected' : ''}" onclick="event.stopPropagation(); toggleSelectSystem(${idx})">
                    ${isSelected ? i18n.t('systems.selected') : i18n.t('systems.select')}
                </button>
            </div>
            <div class="system-specs">
                <div class="spec-item"><span class="spec-label">U:</span><span class="spec-value">${system.transmitancia?.toFixed(2) || '—'} W/m²K</span></div>
                <div class="spec-item"><span class="spec-label">CT:</span><span class="spec-value">${system.capacidade_termica?.toFixed(0) || '—'} kJ/m²K</span></div>
                <div class="spec-item"><span class="spec-label">Peso:</span><span class="spec-value">${system.identificacao?.descricao?.peso?.toFixed(1) || '—'} kg/m²</span></div>
                <div class="spec-item"><span class="spec-label">Esp.:</span><span class="spec-value">${system.identificacao?.descricao?.espessura || '—'} cm</span></div>
            </div>
            <div class="system-impacts">
                <div class="impact-item"><span class="impact-label">GWP:</span><span class="impact-value">${formatScientific(system.impactos?.gwp)} kg CO₂ eq</span></div>
                <div class="impact-item"><span class="impact-label">CED:</span><span class="impact-value">${formatScientific(system.consumo?.total)} MJ</span></div>
            </div>
            <div class="system-tags">
                ${system.identificacao?.descricao?.isolante_termico ? `<span class="tag">🛡️ Isolamento</span>` : ''}
                ${system.identificacao?.descricao?.sistema_leve ? `<span class="tag">⚡ Leve</span>` : ''}
            </div>
        </div>`;
    }

    function getTypeClass(system) {
        const name = (system.nome || '').toLowerCase();
        const layers = (system.identificacao?.camadas || []).join(' ').toLowerCase();
        if (name.includes('concreto') || layers.includes('bloco de concreto') || layers.includes('concreto maciço')) return 'concrete';
        if (name.includes('cerâm') || layers.includes('cerâm') || layers.includes('tijolo')) return 'ceramic';
        if (name.includes('steel frame') || name.includes('drywall') || layers.includes('placa cimentícia')) return 'steelframe';
        return 'other';
    }

    // ===================================================================
    //  Pagination
    // ===================================================================
    function renderPagination(totalPages) {
        const container = document.getElementById('pagination');
        if (!container) return;
        if (totalPages <= 1) { container.innerHTML = ''; return; }

        let html = `<button class="page-btn" onclick="changePage(${currentSystemPage - 1})" ${currentSystemPage === 1 ? 'disabled' : ''}>${i18n.t('systems.prev')}</button>`;

        for (let p = 1; p <= totalPages; p++) {
            if (totalPages > 7 && p > 2 && p < totalPages - 1 && Math.abs(p - currentSystemPage) > 1) {
                if (p === 3 || p === totalPages - 2) html += '<span class="page-ellipsis">…</span>';
                continue;
            }
            html += `<button class="page-btn ${p === currentSystemPage ? 'active' : ''}" onclick="changePage(${p})">${p}</button>`;
        }
        html += `<button class="page-btn" onclick="changePage(${currentSystemPage + 1})" ${currentSystemPage === totalPages ? 'disabled' : ''}>${i18n.t('systems.next')}</button>`;
        container.innerHTML = html;
    }
    window.changePage = function (p) {
        const totalPages = Math.ceil(filteredSystems.length / ITEMS_PER_PAGE);
        if (p < 1 || p > totalPages) return;
        currentSystemPage = p;
        renderSystems();
        document.getElementById('page-systems')?.scrollIntoView({ behavior: 'smooth' });
    };

    function clearFilters() {
        document.getElementById('searchSystem').value = '';
        document.getElementById('filterType').value = '';
        document.getElementById('filterInsulation').value = '';
        document.getElementById('filterOrigin').value = '';
        currentSystemPage = 1;
        renderSystems();
    }

    // ===================================================================
    //  System Selection (for compare)
    // ===================================================================
    window.toggleSelectSystem = function (idx) {
        const pos = selectedSystems.indexOf(idx);
        if (pos > -1) {
            selectedSystems.splice(pos, 1);
        } else {
            if (selectedSystems.length >= 3) {
                showAlert('error', i18n.t('alert.maxSystems'));
                return;
            }
            selectedSystems.push(idx);
        }
        renderSystems();
        renderSelectedChips();
    };

    function renderSelectedChips() {
        const container = document.getElementById('selectedSystems');
        const compareBtn = document.getElementById('compareBtn');
        if (!container) return;

        if (selectedSystems.length === 0) {
            container.innerHTML = `<div class="empty-state">${i18n.t('compare.empty')}</div>`;
            if (compareBtn) compareBtn.disabled = true;
            return;
        }
        if (compareBtn) compareBtn.disabled = selectedSystems.length < 2;

        container.innerHTML = selectedSystems.map((idx) => {
            const sys = dataManager.systems[idx];
            return `<span class="selected-chip">${sys?.nome || idx}<button class="remove-chip" onclick="toggleSelectSystem(${idx})">×</button></span>`;
        }).join('');
    }
    window.updateSelectedSystems = renderSelectedChips;

    // ===================================================================
    //  System Detail Modal
    // ===================================================================
    window.showSystemDetail = function (idx) {
        const system = dataManager.systems[idx];
        if (!system) return;

        const modal = document.getElementById('systemModal');
        const body = document.getElementById('modalBody');
        if (!modal || !body) return;

        // Apply type-based color to modal
        const typeClass = getTypeClass(system);
        modal.className = `modal ${typeClass}-modal`;

        body.innerHTML = buildDetailHTML(system, idx);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    function closeSystemModal() {
        document.getElementById('systemModal')?.classList.remove('active');
        document.body.style.overflow = '';
    }

    function buildDetailHTML(system, idx) {
        const desc = system.identificacao?.descricao || {};
        const layers = system.identificacao?.camadas || [];
        const imp = system.impactos || {};
        const comps = system.consumo?.componentes || [];

        let html = `<h2 class="modal-title">${system.nome}</h2>`;

        // Identification
        html += `<div class="detail-section"><h3>Identificação</h3><div class="detail-grid">`;
        html += `<div class="detail-item"><strong>Fronteira:</strong> ${system.identificacao?.fronteira || '—'}</div>`;
        html += `<div class="detail-item"><strong>Unidade:</strong> ${system.identificacao?.unidade || '—'}</div>`;
        html += `<div class="detail-item"><strong>Peso:</strong> ${desc.peso?.toFixed(1) || '—'} kg/m²</div>`;
        html += `<div class="detail-item"><strong>Espessura:</strong> ${desc.espessura || '—'} cm</div>`;
        html += `<div class="detail-item"><strong>Sistema Leve:</strong> ${desc.sistema_leve ? 'Sim' : 'Não'}</div>`;
        html += `<div class="detail-item"><strong>Isolante Térmico:</strong> ${desc.isolante_termico ? 'Sim' : 'Não'}</div>`;
        html += `</div></div>`;

        // Layers
        if (layers.length) {
            html += `<div class="detail-section"><h3>Camadas (interior → exterior)</h3><ol class="layers-list">${layers.map(l => `<li>${l}</li>`).join('')}</ol></div>`;
        }

        // Thermal properties
        html += `<div class="detail-section"><h3>Propriedades Térmicas</h3><div class="detail-grid">`;
        html += `<div class="detail-item"><strong>Transmitância Térmica (U):</strong> ${system.transmitancia?.toFixed(2) || '—'} W/m²K</div>`;
        html += `<div class="detail-item"><strong>Capacidade Térmica (CT):</strong> ${system.capacidade_termica?.toFixed(0) || '—'} kJ/m²K</div>`;
        html += `</div></div>`;

        // Environmental impacts
        html += `<div class="detail-section"><h3>Impactos Ambientais (A1-A3)</h3><div class="impacts-table">`;
        const impactLabels = { gwp: 'GWP (kg CO₂ eq)', ap: 'AP (kg SO₂ eq)', ep: 'EP (kg PO₄ eq)', pocp: 'POCP (kg C₂H₄ eq)', odp: 'ODP (kg CFC-11 eq)', adpf: 'ADP-f (MJ)', adpnf: 'ADP-nf (kg Sb eq)' };
        for (const [key, label] of Object.entries(impactLabels)) {
            html += `<div class="impact-row"><span>${label}</span><span>${formatScientific(imp[key])}</span></div>`;
        }
        html += `</div></div>`;

        // Energy consumption
        html += `<div class="detail-section"><h3>Consumo Energético (CED)</h3>`;
        html += `<div class="total-row"><strong>Total: ${formatScientific(system.consumo?.total)} MJ</strong></div>`;
        if (comps.length) {
            html += `<div class="components-table"><div class="component-header"><span>Componente</span><span>CED (MJ)</span><span>GWP (kg CO₂ eq)</span></div>`;
            comps.forEach(c => {
                html += `<div class="component-row"><span>${c.componente}</span><span>${formatScientific(c.consumo_componente)}</span><span>${formatScientific(c.gwp)}</span></div>`;
            });
            html += `</div>`;
        }
        html += `</div>`;

        // View Cartilha button
        html += `<div style="text-align:center;margin-top:24px"><button class="btn btn-primary" onclick="openCartilhaModal(${idx})">${i18n.t('systems.viewCard')}</button></div>`;

        return html;
    }

    // ===================================================================
    //  Comparison
    // ===================================================================
    function showComparison() {
        if (selectedSystems.length < 2) return;

        const systems = selectedSystems.map(i => dataManager.systems[i]).filter(Boolean);
        const resultsDiv = document.getElementById('comparisonResults');
        if (!resultsDiv) return;
        resultsDiv.style.display = 'block';

        let html = `<h3>${i18n.t('compare.results')}</h3>`;
        html += createComparisonTable(systems);
        html += `<div class="comparison-charts">${createComparisonCharts(systems)}</div>`;
        html += createStandardsComplianceTable(systems);
        resultsDiv.innerHTML = html;

        // Render charts after DOM is ready
        setTimeout(() => {
            renderBarCharts(systems);
        }, 100);

        // Save comparison to history
        if (isLoggedIn()) {
            saveUserComparison(getCurrentUser(), { systems: systems.map(s => s.nome) });
            displayUserComparisons();
        }
    }

    function createComparisonTable(systems) {
        const props = [
            { key: 'transmitancia', label: 'Transmitância Térmica (U)', unit: 'W/m²K', lower: true },
            { key: 'capacidade_termica', label: 'Capacidade Térmica (CT)', unit: 'kJ/m²K', lower: false },
            { key: 'peso', label: 'Peso', unit: 'kg/m²', lower: true, path: 'identificacao.descricao.peso' },
            { key: 'espessura', label: 'Espessura', unit: 'cm', lower: true, path: 'identificacao.descricao.espessura' },
            { key: 'gwp', label: 'GWP (kg CO₂ eq)', unit: '', lower: true, path: 'impactos.gwp' },
            { key: 'ap', label: 'AP (kg SO₂ eq)', unit: '', lower: true, path: 'impactos.ap' },
            { key: 'ep', label: 'EP (kg PO₄ eq)', unit: '', lower: true, path: 'impactos.ep' },
            { key: 'pocp', label: 'POCP (kg C₂H₄ eq)', unit: '', lower: true, path: 'impactos.pocp' },
            { key: 'odp', label: 'ODP (kg CFC-11 eq)', unit: '', lower: true, path: 'impactos.odp' },
            { key: 'ced', label: 'CED (MJ)', unit: '', lower: true, path: 'consumo.total' }
        ];

        let html = `<div class="comparison-table">`;
        // Header with clickable system names and descriptions
        html += `<div class="comparison-row header"><div class="comparison-cell">${i18n.t('compare.property')}</div>`;
        systems.forEach(s => {
            const idx = dataManager.systems.indexOf(s);
            const typeClass = getTypeClass(s);
            const desc = s.identificacao?.descricao || {};
            const layers = (s.identificacao?.camadas || []).join(', ');
            html += `<div class="comparison-cell system-header-cell ${typeClass}-header">
                <a href="#" class="system-name-link" onclick="event.preventDefault(); showSystemDetail(${idx})">${s.nome}</a>
                <span class="system-desc-sub">${layers || ''}</span>
            </div>`;
        });
        html += `</div>`;

        props.forEach(prop => {
            const values = systems.map(s => {
                if (prop.path) return prop.path.split('.').reduce((o, k) => o?.[k], s);
                return s[prop.key];
            });
            const best = prop.lower ? Math.min(...values.filter(v => v != null)) : Math.max(...values.filter(v => v != null));

            html += `<div class="comparison-row"><div class="comparison-cell">${prop.label}</div>`;
            values.forEach(v => {
                const isBest = v === best;
                const display = v != null ? (prop.unit ? `${typeof v === 'number' && Math.abs(v) < 0.01 ? formatScientific(v) : (typeof v === 'number' ? v.toFixed(2) : v)} ${prop.unit}` : formatScientific(v)) : '—';
                html += `<div class="comparison-cell ${isBest ? 'best' : ''}">${display}</div>`;
            });
            html += `</div>`;
        });
        html += `</div>`;
        return html;
    }

    function createComparisonCharts(systems) {
        // Placeholder canvases – will be rendered in renderBarCharts
        return `
            <h4>Impactos Ambientais</h4>
            <canvas id="chartGWP" height="200"></canvas>
            <canvas id="chartEnergy" height="200"></canvas>
            <canvas id="chartAP" height="200"></canvas>
        `;
    }

    function renderBarCharts(systems) {
        const labels = systems.map(s => s.nome);

        // GWP Chart
        const ctxGWP = document.getElementById('chartGWP');
        if (ctxGWP) {
            new Chart(ctxGWP, {
                type: 'bar',
                data: { labels, datasets: [{ label: 'GWP (kg CO₂ eq)', data: systems.map(s => s.impactos?.gwp || 0), backgroundColor: chartColors }] },
                options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
            });
        }

        // CED Chart
        const ctxCED = document.getElementById('chartEnergy');
        if (ctxCED) {
            new Chart(ctxCED, {
                type: 'bar',
                data: { labels, datasets: [{ label: 'CED (MJ)', data: systems.map(s => s.consumo?.total || 0), backgroundColor: chartColors }] },
                options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
            });
        }

        // AP Chart
        const ctxAP = document.getElementById('chartAP');
        if (ctxAP) {
            new Chart(ctxAP, {
                type: 'bar',
                data: { labels, datasets: [{ label: 'AP (kg SO₂ eq)', data: systems.map(s => s.impactos?.ap || 0), backgroundColor: chartColors }] },
                options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
            });
        }
    }

    // ===================================================================
    //  Standards Compliance
    // ===================================================================
    function createStandardsComplianceTable(systems) {
        const regs = dataManager.getRegulations();
        if (!regs) return '';

        let html = `<h3 style="text-align:center;margin-top:2rem;">${i18n.t('compare.standardsTitle')}</h3>`;
        html += `<div class="comparison-table"><div class="comparison-row header"><div class="comparison-cell">${i18n.t('compare.standard')}</div>`;
        systems.forEach(s => { html += `<div class="comparison-cell">${s.nome}</div>`; });
        html += `</div>`;

        // NBR 15575 – zones 1-8
        if (regs.nbr15575) {
            for (let z = 1; z <= 8; z++) {
                html += `<div class="comparison-row"><div class="comparison-cell">NBR 15575 – Zona ${z}</div>`;
                systems.forEach(s => {
                    const result = evaluateNBR(s, regs.nbr15575, z);
                    html += `<div class="comparison-cell" style="color:${result ? 'var(--success-500)' : 'var(--error-500)'}">${result ? '✓' : '✗'}</div>`;
                });
                html += `</div>`;
            }
        }

        // ASHRAE residential
        if (regs.ashrae_residential) {
            regs.ashrae_residential.zonas?.forEach(zona => {
                html += `<div class="comparison-row"><div class="comparison-cell">ASHRAE Res. – Zona ${zona.zona}</div>`;
                systems.forEach(s => {
                    const maxU = zona.transmitancia_maxima?.wall_mass || 999;
                    const pass = s.transmitancia <= maxU;
                    html += `<div class="comparison-cell" style="color:${pass ? 'var(--success-500)' : 'var(--error-500)'}">${pass ? '✓' : '✗'}</div>`;
                });
                html += `</div>`;
            });
        }

        // ASHRAE commercial
        if (regs.ashrae_commercial) {
            regs.ashrae_commercial.zonas?.forEach(zona => {
                html += `<div class="comparison-row"><div class="comparison-cell">ASHRAE Com. – Zona ${zona.zona}</div>`;
                systems.forEach(s => {
                    const maxU = zona.transmitancia_maxima?.wall_mass || 999;
                    const pass = s.transmitancia <= maxU;
                    html += `<div class="comparison-cell" style="color:${pass ? 'var(--success-500)' : 'var(--error-500)'}">${pass ? '✓' : '✗'}</div>`;
                });
                html += `</div>`;
            });
        }

        html += `</div>`;
        return html;
    }

    function evaluateNBR(system, nbr, zone) {
        const zona = nbr.zonas?.find(z => z.zona === zone);
        if (!zona) return false;
        const maxU = zona.transmitancia_maxima?.inferior_limite || 999;
        const minCT = zona.capacidade_minima || 0;
        return system.transmitancia <= maxU && system.capacidade_termica >= minCT;
    }

    // ===================================================================
    //  Cartilha Modal
    // ===================================================================
    window.openCartilhaModal = function (idx) {
        const system = dataManager.systems[idx];
        if (!system) return;

        // Close detail modal first
        closeSystemModal();

        const modal = document.getElementById('cartilhaModal');
        const titulo = document.getElementById('cartilhaTitulo');
        const content = document.getElementById('cartilhaContent');
        if (!modal || !content) return;

        titulo.textContent = `Cartilha – ${system.nome}`;
        content.innerHTML = buildCartilhaHTML(system);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Render cartilha charts
        setTimeout(() => createCartilhaCharts(system), 200);
    };

    window.closeCartilhaModal = function () {
        const modal = document.getElementById('cartilhaModal');
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    function buildCartilhaHTML(system) {
        const desc = system.identificacao?.descricao || {};
        const layers = system.identificacao?.camadas || [];
        const imp = system.impactos || {};
        const comps = system.consumo?.componentes || [];
        const regs = dataManager.getRegulations();
        const typeClass = getTypeClass(system);

        let html = '';

        // Logos header
        html += `<div class="cartilha-logos-row"><img src="assets/logo_ufrgs.png" alt="UFRGS" class="cartilha-inline-logo"><img src="assets/logo_e3build.svg" alt="E³ Build" class="cartilha-inline-logo"><img src="assets/logo_life.png" alt="LIfE" class="cartilha-inline-logo"></div>`;

        // Image
        if (system.imagem) {
            html += `<img src="${system.imagem}" alt="${system.nome}" class="cartilha-image">`;
        }

        // 1. Identification
        html += `<h3>1. IDENTIFICAÇÃO DO SISTEMA</h3>`;
        html += `<p><strong>Sistema:</strong> ${system.nome}</p>`;
        html += `<p><strong>Fronteira do sistema:</strong> ${system.identificacao?.fronteira || '—'}</p>`;
        html += `<p><strong>Unidade funcional:</strong> ${system.identificacao?.unidade || '—'}</p>`;
        html += `<p><strong>Peso:</strong> ${desc.peso?.toFixed(1) || '—'} kg/m²</p>`;
        html += `<p><strong>Espessura total:</strong> ${desc.espessura || '—'} cm</p>`;
        html += `<p><strong>Sistema leve:</strong> ${desc.sistema_leve ? 'Sim' : 'Não'}</p>`;
        html += `<p><strong>Isolante térmico:</strong> ${desc.isolante_termico ? 'Sim' : 'Não'}</p>`;

        // Layers
        html += `<h4>Composição (interior → exterior):</h4>`;
        html += `<ol>${layers.map(l => `<li>${l}</li>`).join('')}</ol>`;

        // 2. Thermal Performance
        html += `<h3>2. DESEMPENHO TÉRMICO</h3>`;
        html += `<table class="cartilha-table"><thead><tr><th>Propriedade</th><th>Valor</th><th>Unidade</th></tr></thead><tbody>`;
        html += `<tr><td>Transmitância Térmica (U)</td><td>${system.transmitancia?.toFixed(2) || '—'}</td><td>W/(m²·K)</td></tr>`;
        html += `<tr><td>Capacidade Térmica (CT)</td><td>${system.capacidade_termica?.toFixed(0) || '—'}</td><td>kJ/(m²·K)</td></tr>`;
        html += `</tbody></table>`;

        // 3. Environmental Impacts
        html += `<h3>3. IMPACTOS AMBIENTAIS (A1-A3)</h3>`;
        html += `<table class="cartilha-table"><thead><tr><th>Indicador</th><th>Valor</th><th>Unidade</th></tr></thead><tbody>`;
        const impacts = [
            ['GWP', imp.gwp, 'kg CO₂ eq'], ['AP', imp.ap, 'kg SO₂ eq'], ['EP', imp.ep, 'kg PO₄ eq'],
            ['POCP', imp.pocp, 'kg C₂H₄ eq'], ['ODP', imp.odp, 'kg CFC-11 eq'],
            ['ADP-nf', imp.adpnf, 'kg Sb eq'], ['ADP-f', imp.adpf, 'MJ']
        ];
        impacts.forEach(([label, val, unit]) => {
            html += `<tr><td>${label}</td><td>${formatScientific(val)}</td><td>${unit}</td></tr>`;
        });
        html += `</tbody></table>`;

        // 4. Energy consumption
        html += `<h3>4. CONSUMO ENERGÉTICO (CED)</h3>`;
        html += `<p><strong>Total:</strong> ${formatScientific(system.consumo?.total)} MJ</p>`;
        if (comps.length) {
            html += `<table class="cartilha-table"><thead><tr><th>Componente</th><th>CED (MJ)</th><th>GWP (kg CO₂ eq)</th><th>AP (kg SO₂ eq)</th></tr></thead><tbody>`;
            comps.forEach(c => {
                html += `<tr><td>${c.componente}</td><td>${formatScientific(c.consumo_componente)}</td><td>${formatScientific(c.gwp)}</td><td>${formatScientific(c.ap)}</td></tr>`;
            });
            html += `</tbody></table>`;
        }

        // Chart canvases
        html += `<h3>5. GRÁFICOS</h3>`;
        html += `<h4>Distribuição de Impactos por Componente</h4>`;
        html += `<canvas id="cartilhaChartGWP" height="250"></canvas>`;
        html += `<canvas id="cartilhaChartCED" height="250"></canvas>`;

        // 6. Standards compliance
        html += `<h3>6. CONFORMIDADE COM NORMAS</h3>`;
        html += buildCartilhaStandards(system, regs);

        return html;
    }

    function buildCartilhaStandards(system, regs) {
        let html = `<table class="cartilha-table"><thead><tr><th>Norma</th><th>Zona</th><th>Resultado</th></tr></thead><tbody>`;

        // NBR
        if (regs?.nbr15575) {
            for (let z = 1; z <= 8; z++) {
                const pass = evaluateNBR(system, regs.nbr15575, z);
                html += `<tr><td>NBR 15575</td><td>Zona ${z}</td><td style="color:${pass ? 'var(--success-500)' : 'var(--error-500)'}">${pass ? 'ATENDE ✓' : 'NÃO ATENDE ✗'}</td></tr>`;
            }
        }

        // ASHRAE residential
        if (regs?.ashrae_residential) {
            regs.ashrae_residential.zonas?.forEach(zona => {
                const maxU = zona.transmitancia_maxima?.wall_mass || 999;
                const pass = system.transmitancia <= maxU;
                html += `<tr><td>ASHRAE 90.1 Residencial</td><td>Zona ${zona.zona}</td><td style="color:${pass ? 'var(--success-500)' : 'var(--error-500)'}">${pass ? 'ATENDE ✓' : 'NÃO ATENDE ✗'}</td></tr>`;
            });
        }

        // ASHRAE commercial
        if (regs?.ashrae_commercial) {
            regs.ashrae_commercial.zonas?.forEach(zona => {
                const maxU = zona.transmitancia_maxima?.wall_mass || 999;
                const pass = system.transmitancia <= maxU;
                html += `<tr><td>ASHRAE 90.1 Comercial</td><td>Zona ${zona.zona}</td><td style="color:${pass ? 'var(--success-500)' : 'var(--error-500)'}">${pass ? 'ATENDE ✓' : 'NÃO ATENDE ✗'}</td></tr>`;
            });
        }

        html += `</tbody></table>`;
        return html;
    }

    function createCartilhaCharts(system) {
        const comps = system.consumo?.componentes || [];
        if (!comps.length) return;

        const labels = comps.map(c => c.componente);

        // GWP Pie/Doughnut
        const ctxGWP = document.getElementById('cartilhaChartGWP');
        if (ctxGWP) {
            new Chart(ctxGWP, {
                type: 'doughnut',
                data: { labels, datasets: [{ data: comps.map(c => c.gwp || 0), backgroundColor: chartColors }] },
                options: { responsive: true, plugins: { title: { display: true, text: 'GWP por Componente (kg CO₂ eq)' } } }
            });
        }

        // CED Pie/Doughnut
        const ctxCED = document.getElementById('cartilhaChartCED');
        if (ctxCED) {
            new Chart(ctxCED, {
                type: 'doughnut',
                data: { labels, datasets: [{ data: comps.map(c => c.consumo_componente || 0), backgroundColor: chartColors }] },
                options: { responsive: true, plugins: { title: { display: true, text: 'CED por Componente (MJ)' } } }
            });
        }
    }

    // ===================================================================
    //  PDF Export
    // ===================================================================
    window.exportCartilhaToPDF = function () {
        const content = document.getElementById('cartilhaContent');
        if (!content) return;

        const opt = {
            margin: [10, 10, 10, 10],
            filename: 'cartilha_sistema.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(content).save();
    };

    // ===================================================================
    //  Create System – Component Selector
    // ===================================================================
    function renderComponentsList() {
        const list = document.getElementById('componentsList');
        if (!list || !dataManager.loaded) return;

        const search = (document.getElementById('componentSearch')?.value || '').toLowerCase();
        const components = dataManager.getComponents();
        const filtered = search
            ? components.filter(c => (c.componente || c.nome || '').toLowerCase().includes(search))
            : components;

        list.innerHTML = filtered.map((c, i) => {
            const name = c.componente || c.nome || `Component ${i}`;
            return `<div class="component-item" onclick="addLayer(${i})">
                <span>${name}</span>
                <button class="component-add" onclick="event.stopPropagation(); addLayer(${i})">+</button>
            </div>`;
        }).join('');
    }

    window.addLayer = function (compIndex) {
        const components = dataManager.getComponents();
        const comp = components[compIndex];
        if (!comp) return;
        selectedLayers.push({ ...comp, _idx: compIndex });
        renderSelectedLayers();
    };

    window.removeLayer = function (layerIndex) {
        selectedLayers.splice(layerIndex, 1);
        renderSelectedLayers();
    };

    function renderSelectedLayers() {
        const container = document.getElementById('selectedLayers');
        if (!container) return;

        if (selectedLayers.length === 0) {
            container.innerHTML = `<div class="empty-state">${i18n.t('create.noLayers')}</div>`;
            return;
        }
        container.innerHTML = selectedLayers.map((layer, i) => {
            const name = layer.componente || layer.nome || 'Layer';
            return `<div class="layer-item">
                <div class="layer-info"><span class="layer-order">${i + 1}</span><span class="layer-name">${name}</span></div>
                <button class="layer-remove" onclick="removeLayer(${i})">×</button>
            </div>`;
        }).join('');
    }

    // ===================================================================
    //  Create System – Form Submission
    // ===================================================================
    function handleCreateSystem(e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        requireLogin(() => {
            const currentUser = getCurrentUser();
            if (!currentUser) return;

            const name = document.getElementById('systemName')?.value?.trim();
            const type = document.getElementById('systemType')?.value;
            const uVal = parseFloat(document.getElementById('uValue')?.value);
            const ct = parseFloat(document.getElementById('thermalCapacity')?.value);
            const weight = parseFloat(document.getElementById('weight')?.value);
            const thickness = parseFloat(document.getElementById('thickness')?.value);
            const lightSystem = document.getElementById('lightSystem')?.checked || false;
            const thermalIns = document.getElementById('thermalInsulation')?.checked || false;

            if (!name || !type || isNaN(uVal) || isNaN(ct) || isNaN(weight) || isNaN(thickness)) {
                showAlert('error', 'Please fill all required fields.');
                return;
            }

            // Calculate impacts from selected layers
            let gwp = 0, ap = 0, ep = 0, pocp = 0, odp = 0, adpnf = 0, adpf = 0, ced = 0;
            const compList = [];
            selectedLayers.forEach(layer => {
                gwp += layer.gwp || 0;
                ap += layer.ap || 0;
                ep += layer.ep || 0;
                pocp += layer.pocp || 0;
                odp += layer.odp || 0;
                adpnf += layer.adpnf || 0;
                adpf += layer.adpf || 0;
                ced += layer.consumo_componente || layer.ced || 0;
                compList.push({
                    componente: layer.componente || layer.nome || 'Layer',
                    consumo_componente: layer.consumo_componente || layer.ced || 0,
                    gwp: layer.gwp || 0,
                    ap: layer.ap || 0
                });
            });

            const system = {
                nome: name,
                tipo: type,
                transmitancia: uVal,
                capacidade_termica: ct,
                identificacao: {
                    descricao: { peso: weight, espessura: thickness, sistema_leve: lightSystem, isolante_termico: thermalIns },
                    camadas: selectedLayers.map(l => l.componente || l.nome || 'Layer'),
                    unidade: 'm²',
                    fronteira: 'Sistema Personalizado',
                    validade: new Date().toLocaleDateString()
                },
                impactos: { gwp, ap, ep, pocp, odp, adpnf, adpf },
                consumo: { total: ced, componentes: compList },
                custom: true
            };

            const saved = saveUserSystem(currentUser, system);
            if (!dataManager.systems.find(s => s.id === saved.id)) {
                dataManager.systems.push(saved);
            }

            showAlert('success', i18n.t('alert.systemCreated'));
            document.getElementById('createSystemForm')?.reset();
            selectedLayers = [];
            renderSelectedLayers();
            displayUserSystems();
            renderSystems();
        });
    }

    // ===================================================================
    //  Utility
    // ===================================================================
    function formatScientific(value) {
        if (value === undefined || value === null) return '—';
        if (typeof value !== 'number') return String(value);
        if (value === 0) return '0';
        if (Math.abs(value) >= 0.01 && Math.abs(value) < 10000) return value.toFixed(2);
        return value.toExponential(2);
    }
    window.formatScientific = formatScientific;

})();
