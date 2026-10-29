// ===== BE³ Build – Main Application =====
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

    // Paleta usada nos gráficos empilhados por material (cores vizinhas contrastantes)
    const materialChartColors = [
        'rgba(61, 122, 84, 0.9)',
        'rgba(196, 154, 92, 0.9)',
        'rgba(143, 170, 181, 0.9)',
        'rgba(140, 122, 102, 0.9)',
        'rgba(122, 160, 138, 0.9)',
        'rgba(154, 112, 48, 0.9)',
        'rgba(96, 116, 148, 0.9)',
        'rgba(196, 90, 90, 0.9)',
        'rgba(45, 106, 64, 0.9)',
        'rgba(212, 199, 181, 0.9)'
    ];

    // Chart.js global font defaults (larger, readable)
    if (typeof Chart !== 'undefined' && Chart.defaults) {
        Chart.defaults.font.size = 14;
        Chart.defaults.font.family = "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif";
        Chart.defaults.color = '#374151';
    }

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
        // Fecha modais que possam estar abertos ao trocar de página
        if (document.getElementById('cartilhaModal')?.classList.contains('active')) closeCartilhaModal();
        if (document.getElementById('systemModal')?.classList.contains('active')) closeSystemModal();
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Page-specific init
        if (pageName === 'systems' && dataManager.loaded) renderSystems();
        if (pageName === 'compare') {
            renderSelectedChips();
            if (dataManager.loaded) renderCompareSystemGrid();
        }
        if (pageName === 'create' && dataManager.loaded) initBuilder();
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

        // Re-render dynamic content when language changes
        document.addEventListener('languageChanged', () => {
            if (currentPage === 'systems' && dataManager.loaded) renderSystems();
            if (currentPage === 'compare' && dataManager.loaded) {
                renderCompareSystemGrid();
                renderSelectedChips();
                // Re-render thermal comparison results if visible
                const thermalRes = document.getElementById('thermalComparisonResults');
                if (thermalRes && thermalRes.style.display !== 'none' && lastThermalNormKey) {
                    runThermalComparison(lastThermalNormKey, true);
                }
                // Re-render group comparison results if visible
                const groupRes = document.getElementById('groupComparisonResults');
                if (groupRes && groupRes.style.display !== 'none' && lastGroupResultType) {
                    if (lastGroupResultType === 'all') {
                        runCompareAll(true);
                    } else if (lastGroupResultType === 'individual' && selectedSystems.length >= 2) {
                        showComparison(true);
                    }
                }
            }
        });

        // --- Filters ---
        document.getElementById('searchSystem')?.addEventListener('input', () => { currentSystemPage = 1; renderSystems(); });
        document.getElementById('filterType')?.addEventListener('change', () => { currentSystemPage = 1; renderSystems(); });
        document.getElementById('filterInsulation')?.addEventListener('change', () => { currentSystemPage = 1; renderSystems(); });
        // Filtro "Origem" desativado — mantido comentado para uso futuro
        // document.getElementById('filterOrigin')?.addEventListener('change', () => { currentSystemPage = 1; renderSystems(); });
        document.getElementById('clearFilters')?.addEventListener('click', clearFilters);
        // Botão de imprimir da biblioteca removido — impressão disponível apenas na cartilha

        // --- Compare ---
        document.getElementById('compareBtn')?.addEventListener('click', () => {
            requireLogin(() => showComparison());
        });

        // --- System detail modal ---
        document.getElementById('modalClose')?.addEventListener('click', closeSystemModal);
        document.querySelector('#systemModal .modal-overlay')?.addEventListener('click', closeSystemModal);

        // Initialize builder material dropdown
        initBuilder();
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

    // Ícone "abrir em nova aba" — usado nos cards e nas tabelas de comparação
    const NEW_TAB_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6"></path><path d="M20 4l-8.5 8.5"></path><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"></path></svg>';

    function createSystemCard(system) {
        const idx = dataManager.systems.indexOf(system);
        const isCustom = system.custom === true;
        const typeClass = getTypeClass(system);

        const imageSrc = system.imagem || '';
        const imageHtml = imageSrc
            ? `<div class="system-image"><img src="${imageSrc}" alt="${tData(system.nome)}" loading="lazy"></div>`
            : '';

        const weightLabel = i18n.t('card.weight');
        const thicknessLabel = i18n.t('card.thickness');
        const insulationTag = i18n.t('card.insulation');
        const lightTag = i18n.t('card.light');

        return `
        <div class="system-card ${typeClass}" onclick="showSystemDetail(${idx})">
            <button class="card-expand-btn" data-fly-tip="${i18n.t('tooltip.moreInfo')}" aria-label="${i18n.t('tooltip.moreInfo')}" onclick="event.stopPropagation(); openCartilhaModal(${idx})">
                ${NEW_TAB_ICON}
            </button>
            ${isCustom ? `<span class="badge-custom">Custom</span>` : ''}
            ${imageHtml}
            <div class="system-header">
                <h3 class="system-name">${tData(system.nome)}</h3>
            </div>
            <div class="system-specs">
                <div class="spec-item"><span class="spec-label">U:</span><span class="spec-value">${system.transmitancia?.toFixed(2) || '—'} W/m²K</span></div>
                <div class="spec-item"><span class="spec-label">CT:</span><span class="spec-value">${system.capacidade_termica?.toFixed(0) || '—'} kJ/m²K</span></div>
                <div class="spec-item"><span class="spec-label">${weightLabel}:</span><span class="spec-value">${system.identificacao?.descricao?.peso?.toFixed(1) || '—'} kg/m²</span></div>
                <div class="spec-item"><span class="spec-label">${thicknessLabel}:</span><span class="spec-value">${system.identificacao?.descricao?.espessura || '—'} cm</span></div>
            </div>
            <div class="system-impacts">
                <div class="impact-item"><span class="impact-label">GWP:</span><span class="impact-value">${formatScientific(system.impactos?.gwp)} kg CO₂ eq</span></div>
                <div class="impact-item"><span class="impact-label">CED:</span><span class="impact-value">${formatScientific(system.consumo?.total)} MJ</span></div>
            </div>
            <div class="system-tags">
                ${system.identificacao?.descricao?.isolante_termico ? `<span class="tag">🛡️ ${insulationTag}</span>` : ''}
                ${system.identificacao?.descricao?.sistema_leve ? `<span class="tag">⚡ ${lightTag}</span>` : ''}
            </div>
        </div>`;
    }

    function getTypeClass(system) {
        const name = (system.nome || '').toLowerCase();
        const layers = (system.identificacao?.camadas || []).join(' ').toLowerCase();
        // Parede de concreto (concreto maciço) — categoria própria na legenda
        if (layers.includes('concreto maciço') || layers.includes('concreto macico')) return 'concretewall';
        if (name.includes('concreto') || layers.includes('bloco de concreto')) return 'concrete';
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
        // Filtro "Origem" desativado — mantido comentado para uso futuro
        // document.getElementById('filterOrigin').value = '';
        currentSystemPage = 1;
        renderSystems();
    }

    // ===================================================================
    //  Compare Tab — Method Selection
    // ===================================================================
    let compareMethod = null; // 'thermal' | 'groups'
    let groupApproach = 'individual'; // 'individual' | 'all'
    let lastThermalNormKey = null;   // track last thermal norm for re-render on lang change
    let lastGroupResultType = null;  // 'individual' | 'all' — track for re-render on lang change

    window.selectCompareMethod = function (method) {
        compareMethod = method;
        document.getElementById('compareMethodSelector').style.display = method ? 'none' : 'block';
        document.getElementById('panelThermal').style.display = method === 'thermal' ? 'block' : 'none';
        document.getElementById('panelGroups').style.display = method === 'groups' ? 'block' : 'none';
        document.getElementById('finderSection').style.display = method === 'finder' ? 'block' : 'none';

        // Reset results
        const thermalRes = document.getElementById('thermalComparisonResults');
        const groupRes = document.getElementById('groupComparisonResults');
        if (thermalRes) thermalRes.style.display = 'none';
        if (groupRes) groupRes.style.display = 'none';

        // Highlight selected method card
        document.querySelectorAll('.compare-method-card').forEach(c => c.classList.remove('active'));
        if (method === 'thermal') {
            document.getElementById('methodThermal')?.classList.add('active');
            updateThermalSystemsCount();
        }
        if (method === 'finder') document.getElementById('methodFinder')?.classList.add('active');
        if (method === 'groups') {
            document.getElementById('methodGroups')?.classList.add('active');
            selectGroupApproach('individual');
            renderCompareSystemGrid();
        }
    };

    // Somente a seleção individual permanece ativa (o modo "Comparar Todos" ficou desativado)
    window.selectGroupApproach = function (approach) {
        groupApproach = approach;
        const individual = document.getElementById('subpanelIndividual');
        if (individual) individual.style.display = approach === 'individual' ? 'block' : 'none';
        const all = document.getElementById('subpanelAll');
        if (all) all.style.display = approach === 'all' ? 'block' : 'none';
        const groupRes = document.getElementById('groupComparisonResults');
        if (groupRes) groupRes.style.display = 'none';
    };

    // Comparar 3: "XX sistemas encontrados" na aba de desempenho térmico
    function updateThermalSystemsCount() {
        const el = document.getElementById('thermalSystemsCount');
        if (!el || !dataManager.loaded) return;
        const total = dataManager.systems.filter(s => !s.custom).length;
        el.innerHTML = `<strong>${total}</strong> ${i18n.t('finder.found')}`;
    }

    // ===================================================================
    //  Compare Tab — System Selection Grid (inside compare)
    // ===================================================================
    function renderCompareSystemGrid() {
        const grid = document.getElementById('compareSystemGrid');
        if (!grid || !dataManager.loaded) return;

        const search = document.getElementById('compareSearchSystem')?.value || '';
        const type = document.getElementById('compareFilterType')?.value || '';
        const systems = dataManager.getSystems({ search, type });

        if (systems.length === 0) {
            grid.innerHTML = `<div class="empty-state">${i18n.t('systems.noResults')}</div>`;
            return;
        }

        grid.innerHTML = systems.map(system => {
            const idx = dataManager.systems.indexOf(system);
            const isSelected = selectedSystems.includes(idx);
            const typeClass = getTypeClass(system);
            const weightLabel = i18n.t('card.weight');
            const thicknessLabel = i18n.t('card.thickness');

            return `
            <div class="compare-mini-card ${typeClass} ${isSelected ? 'selected' : ''}" onclick="toggleCompareSystem(${idx})">
                <div class="mini-card-check">${isSelected ? '✓' : ''}</div>
                <h4 class="mini-card-name">${tData(system.nome)}</h4>
                <div class="mini-card-specs">
                    <span>U: ${system.transmitancia?.toFixed(2) || '—'}</span>
                    <span>CT: ${system.capacidade_termica?.toFixed(0) || '—'}</span>
                    <span>${weightLabel}: ${system.identificacao?.descricao?.peso?.toFixed(1) || '—'}</span>
                </div>
            </div>`;
        }).join('');
    }

    window.toggleCompareSystem = function (idx) {
        const pos = selectedSystems.indexOf(idx);
        if (pos > -1) {
            selectedSystems.splice(pos, 1);
        } else {
            if (selectedSystems.length >= 5) {
                showAlert('error', i18n.t('alert.maxSystems'));
                return;
            }
            selectedSystems.push(idx);
        }
        renderCompareSystemGrid();
        renderSelectedChips();
    };

    function renderSelectedChips() {
        const container = document.getElementById('selectedSystems');
        const compareBtn = document.getElementById('compareBtn');
        if (!container) return;

        // Salvar/imprimir só ficam ativos depois que uma comparação é executada
        setComparisonActionsEnabled(false);

        if (selectedSystems.length === 0) {
            container.innerHTML = `<div class="empty-state">${i18n.t('compare.empty')}</div>`;
            if (compareBtn) compareBtn.disabled = true;
            return;
        }
        if (compareBtn) compareBtn.disabled = selectedSystems.length < 2;

        container.innerHTML = selectedSystems.map((idx) => {
            const sys = dataManager.systems[idx];
            return `<span class="selected-chip">${tData(sys?.nome) || idx}<button class="remove-chip" onclick="event.stopPropagation(); toggleCompareSystem(${idx})">×</button></span>`;
        }).join('');
    }
    window.updateSelectedSystems = renderSelectedChips;

    // Search / filter listeners for compare grid
    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('compareSearchSystem')?.addEventListener('input', renderCompareSystemGrid);
        document.getElementById('compareFilterType')?.addEventListener('change', renderCompareSystemGrid);
    });

    // ===================================================================
    //  Finder: Encontrar Sistema Ideal
    // ===================================================================
    window.runFinder = function () {
        const normKey = document.getElementById('finderNorm').value;
        const zoneVal = document.getElementById('finderZone').value;
        const resultsDiv = document.getElementById('finderResults');
        if (!normKey || !zoneVal || !resultsDiv) return;

        const regs = dataManager.getRegulations();
        const norm = regs?.[normKey];
        const zoneNum = parseInt(zoneVal);
        const zona = norm?.zonas?.find(z => z.zona === zoneNum);

        const systems = dataManager.systems.filter(s => !s.custom);
        const isASHRAE = normKey.startsWith('ashrae');
        const isRTQC = normKey === 'rtqc' || normKey === 'inic';

        const results = systems.map(sys => {
            let status = '';
            let pass = false;
            if (!zona) {
                // Zone not defined in this norm — mark as N/A
                status = '—'; pass = false;
            } else if (isRTQC) {
                const u = sys.transmitancia;
                if (u <= (zona.nota_A?.transmitancia_maxima?.inferior_limite || 0)) { status = 'A'; pass = true; }
                else if (u <= (zona.nota_B?.transmitancia_maxima?.inferior_limite || 0)) { status = 'B'; pass = true; }
                else if (u <= (zona.nota_CD?.transmitancia_maxima?.inferior_limite || 0)) { status = 'CD'; pass = true; }
                else { status = 'E'; pass = false; }
            } else if (isASHRAE) {
                const isSF = sys.identificacao?.descricao?.sistema_leve === true;
                const maxU = isSF
                    ? (zona.transmitancia_maxima?.steel_frame || zona.transmitancia_maxima?.wall_mass || 999)
                    : (zona.transmitancia_maxima?.wall_mass || 999);
                pass = sys.transmitancia <= maxU;
                status = pass ? '✓' : '✗';
            } else {
                const maxU = zona.transmitancia_maxima?.inferior_limite || 999;
                const minCT = zona.capacidade_minima || 0;
                pass = sys.transmitancia <= maxU && sys.capacidade_termica >= minCT;
                status = pass ? '✓' : '✗';
            }
            return { sys, pass, status };
        });

        // Sort: passing first, then by GWP
        results.sort((a, b) => {
            if (a.pass !== b.pass) return a.pass ? -1 : 1;
            return (a.sys.impactos?.gwp || 999) - (b.sys.impactos?.gwp || 999);
        });

        const passing = results.filter(r => r.pass);
        let html = `<h4 style="margin-bottom:var(--space-sm);">${i18n.t('finder.resultsTitle')}</h4>`;
        html += `<p class="finder-summary"><strong>${passing.length}</strong> ${i18n.t('finder.found')} (${results.length} total)</p>`;

        if (results.length === 0) {
            html += `<p>${i18n.t('finder.noResults')}</p>`;
        } else {
            results.forEach(({ sys, pass, status }) => {
                const idx = dataManager.systems.indexOf(sys);
                const badgeClass = isRTQC ? 'grade' : (pass ? 'pass' : 'fail');
                const badgeText = isRTQC ? status : (pass ? i18n.t('finder.compliant') : i18n.t('finder.nonCompliant'));
                html += `<div class="finder-card" style="opacity:${pass ? 1 : 0.55}">
                    <div class="finder-card-header">
                        <h4 onclick="showSystemDetail(${idx})">${tData(sys.nome)}</h4>
                        <span class="finder-badge ${badgeClass}">${badgeText}</span>
                    </div>
                    <div class="finder-card-props">
                        <div class="finder-prop">U: <span>${sys.transmitancia?.toFixed(2) || '—'} W/m²K</span></div>
                        <div class="finder-prop">CT: <span>${sys.capacidade_termica?.toFixed(0) || '—'} kJ/m²K</span></div>
                        <div class="finder-prop">GWP: <span>${sys.impactos?.gwp != null ? formatScientific(sys.impactos.gwp) : '—'} kg CO₂ eq</span></div>
                        <div class="finder-prop">CED: <span>${sys.consumo?.total != null ? formatScientific(sys.consumo.total) : '—'} MJ</span></div>
                        <div class="finder-prop">AP: <span>${sys.impactos?.ap != null ? formatScientific(sys.impactos.ap) : '—'} kg SO₂ eq</span></div>
                        <div class="finder-prop">EP: <span>${sys.impactos?.ep != null ? formatScientific(sys.impactos.ep) : '—'} kg PO₄ eq</span></div>
                    </div>
                </div>`;
            });
        }

        resultsDiv.innerHTML = html;
        resultsDiv.style.display = 'block';
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // ===================================================================
    //  Thermal Performance Comparison (Method A)
    // ===================================================================
    window.runThermalComparison = function (normKey, skipScroll) {
        const regs = dataManager.getRegulations();
        const resultsDiv = document.getElementById('thermalComparisonResults');
        if (!resultsDiv || !regs) return;

        lastThermalNormKey = normKey;

        const systems = dataManager.systems.filter(s => !s.custom);
        let html = '';

        // Highlight the selected norm card
        if (!skipScroll) {
            document.querySelectorAll('.norm-card').forEach(c => c.classList.remove('active'));
            event?.target?.closest('.norm-card')?.classList.add('active');
        }

        const ashraeResLabel = i18n.getLang() === 'en' ? 'ASHRAE 90.1 Residential' : 'ASHRAE 90.1 Residencial';
        const ashraeComLabel = i18n.getLang() === 'en' ? 'ASHRAE 90.1 Non-Residential' : 'ASHRAE 90.1 Não Residencial';

        if (normKey === 'nbr15575' && regs.nbr15575) {
            html = buildThermalTable(systems, regs.nbr15575, 'NBR 15575', 8, (sys, zona) => {
                const maxU = zona.transmitancia_maxima?.inferior_limite || 999;
                const minCT = zona.capacidade_minima || 0;
                return sys.transmitancia <= maxU && sys.capacidade_termica >= minCT;
            });
        } else if (normKey === 'inir' && regs.inir) {
            html = buildThermalTable(systems, regs.inir, 'INI-R', 8, (sys, zona) => {
                const maxU = zona.transmitancia_maxima?.inferior_limite || 999;
                const minCT = zona.capacidade_minima || 0;
                return sys.transmitancia <= maxU && sys.capacidade_termica >= minCT;
            });
        } else if (normKey === 'inic' && regs.inic) {
            html = buildRTQCTable(systems, regs.inic, 'INI-C');
        } else if (normKey === 'rtqr' && regs.rtqr) {
            html = buildThermalTable(systems, regs.rtqr, 'RTQ-R', 8, (sys, zona) => {
                const maxU = zona.transmitancia_maxima?.inferior_limite || 999;
                const minCT = zona.capacidade_minima || 0;
                return sys.transmitancia <= maxU && sys.capacidade_termica >= minCT;
            });
        } else if (normKey === 'rtqc' && regs.rtqc) {
            html = buildRTQCTable(systems, regs.rtqc);
        } else if (normKey === 'ashrae_residential' && regs.ashrae_residential) {
            html = buildASHRAETable(systems, regs.ashrae_residential, ashraeResLabel);
        } else if (normKey === 'ashrae_commercial' && regs.ashrae_commercial) {
            html = buildASHRAETable(systems, regs.ashrae_commercial, ashraeComLabel);
        }

        resultsDiv.innerHTML = html;
        resultsDiv.style.display = 'block';
        updateThermalSystemsCount();
        if (!skipScroll) resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    /**
     * Célula com o nome do sistema nas tabelas de desempenho térmico:
     * mostra a figura ao passar o mouse e o ícone que expande a cartilha.
     */
    function thermalSystemCell(sys) {
        const idx = dataManager.systems.indexOf(sys);
        const tip = i18n.t('tooltip.moreInfo');
        return `<td class="system-name-cell" data-system-idx="${idx}">
            <span class="row-name" onclick="showSystemDetail(${idx})">${tData(sys.nome)}</span>
            <button class="row-expand-btn" data-fly-tip="${tip}" aria-label="${tip}" onclick="event.stopPropagation(); openCartilhaModal(${idx})">${NEW_TAB_ICON}</button>
        </td>`;
    }

    // ---- Painel flutuante com a figura do sistema (fora do container da tabela) ----
    let hoverPreviewEl = null;

    function getHoverPreviewEl() {
        if (!hoverPreviewEl) {
            hoverPreviewEl = document.createElement('div');
            hoverPreviewEl.className = 'floating-preview';
            hoverPreviewEl.innerHTML = '<img alt=""><span class="floating-preview-caption"></span>';
            document.body.appendChild(hoverPreviewEl);
        }
        return hoverPreviewEl;
    }

    function showHoverPreview(cell) {
        const idx = parseInt(cell.dataset.systemIdx);
        const sys = dataManager.systems[idx];
        if (!sys?.imagem) return;

        const el = getHoverPreviewEl();
        const img = el.querySelector('img');
        if (img.getAttribute('src') !== sys.imagem) img.src = sys.imagem;
        el.querySelector('.floating-preview-caption').textContent = tData(sys.nome);
        el.classList.add('visible');

        const place = () => {
            const r = cell.getBoundingClientRect();
            const width = el.offsetWidth || 280;
            const height = el.offsetHeight || 220;
            let left = r.right + 12;
            if (left + width > window.innerWidth - 12) left = Math.max(12, r.left - width - 12);
            let top = r.top + r.height / 2 - height / 2;
            top = Math.min(Math.max(12, top), window.innerHeight - height - 12);
            el.style.left = `${left}px`;
            el.style.top = `${top}px`;
        };
        place();
        // Reposiciona depois que a imagem carrega (a altura muda)
        if (!img.complete) img.onload = place; else requestAnimationFrame(place);
    }
    window.hideSystemPreview = () => hideHoverPreview();

    function hideHoverPreview() {
        hoverPreviewEl?.classList.remove('visible');
    }

    document.addEventListener('mouseover', (e) => {
        const cell = e.target.closest('.system-name-cell[data-system-idx]');
        if (cell) showHoverPreview(cell);
    });
    document.addEventListener('mouseout', (e) => {
        const cell = e.target.closest('.system-name-cell[data-system-idx]');
        if (cell && !cell.contains(e.relatedTarget)) hideHoverPreview();
    });
    window.addEventListener('scroll', hideHoverPreview, true);

    // Tooltip imediato em posição fixa: não é cortado por cards/células com overflow:hidden
    let flyTipEl = null;
    function hideFlyTip() { flyTipEl?.classList.remove('visible'); }
    document.addEventListener('mouseover', (e) => {
        const btn = e.target.closest('[data-fly-tip]');
        if (!btn) return;
        if (!flyTipEl) {
            flyTipEl = document.createElement('div');
            flyTipEl.className = 'fly-tip';
            document.body.appendChild(flyTipEl);
        }
        flyTipEl.textContent = btn.dataset.flyTip;
        flyTipEl.classList.add('visible');
        const r = btn.getBoundingClientRect();
        const w = flyTipEl.offsetWidth;
        const left = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), window.innerWidth - w - 8);
        flyTipEl.style.left = `${left}px`;
        flyTipEl.style.top = `${r.bottom + 8}px`;
    });
    document.addEventListener('mouseout', (e) => {
        const btn = e.target.closest('[data-fly-tip]');
        if (btn && !btn.contains(e.relatedTarget)) hideFlyTip();
    });
    window.addEventListener('scroll', hideFlyTip, true);

    function buildThermalTable(systems, norm, normName, numZones, evaluateFn) {
        let html = `<h3 style="text-align:center;margin:2rem 0 1rem;">${i18n.t('compare.thermalResultsTitle')} — ${normName}</h3>`;
        html += `<div class="thermal-results-table"><table><thead><tr><th>${i18n.t('compare.system')}</th><th>U (W/m²K)</th><th>CT (kJ/m²K)</th>`;
        for (let z = 1; z <= numZones; z++) html += `<th>${i18n.t('compare.zone')} ${z}</th>`;
        html += `</tr></thead><tbody>`;

        systems.forEach(sys => {
            html += `<tr>${thermalSystemCell(sys)}<td>${sys.transmitancia?.toFixed(2) || '—'}</td><td>${sys.capacidade_termica?.toFixed(0) || '—'}</td>`;
            for (let z = 1; z <= numZones; z++) {
                const zona = norm.zonas?.find(zn => zn.zona === z);
                const pass = zona ? evaluateFn(sys, zona) : false;
                html += `<td class="compliance-cell ${pass ? 'pass' : 'fail'}">${pass ? '✓' : '✗'}</td>`;
            }
            html += `</tr>`;
        });
        html += `</tbody></table></div>`;
        return html;
    }

    function buildRTQCTable(systems, rtqc, normName = 'RTQ-C') {
        let html = `<h3 style="text-align:center;margin:2rem 0 1rem;">${i18n.t('compare.thermalResultsTitle')} — ${normName}</h3>`;
        html += `<p style="text-align:center;color:var(--gray-500);margin-bottom:1rem;">${i18n.t('compare.rtqcGrades')}</p>`;
        html += `<div class="thermal-results-table"><table><thead><tr><th>${i18n.t('compare.system')}</th><th>U (W/m²K)</th><th>CT (kJ/m²K)</th>`;
        for (let z = 1; z <= 8; z++) html += `<th>${i18n.t('compare.zone')} ${z}</th>`;
        html += `</tr></thead><tbody>`;

        systems.forEach(sys => {
            html += `<tr>${thermalSystemCell(sys)}<td>${sys.transmitancia?.toFixed(2) || '—'}</td><td>${sys.capacidade_termica?.toFixed(0) || '—'}</td>`;
            for (let z = 1; z <= 8; z++) {
                const zona = rtqc.zonas?.find(zn => zn.zona === z);
                if (!zona) { html += `<td>—</td>`; continue; }
                const u = sys.transmitancia;
                let grade = '—';
                if (u <= (zona.nota_A?.transmitancia_maxima?.inferior_limite || 0)) grade = 'A';
                else if (u <= (zona.nota_B?.transmitancia_maxima?.inferior_limite || 0)) grade = 'B';
                else if (u <= (zona.nota_CD?.transmitancia_maxima?.inferior_limite || 0)) grade = 'CD';
                else grade = 'E';
                const cls = grade === 'A' ? 'grade-a' : grade === 'B' ? 'grade-b' : grade === 'CD' ? 'grade-cd' : 'grade-e';
                html += `<td class="compliance-cell ${cls}">${grade}</td>`;
            }
            html += `</tr>`;
        });
        html += `</tbody></table></div>`;
        return html;
    }

    function buildASHRAETable(systems, ashrae, normName) {
        const zones = ashrae.zonas || [];
        let html = `<h3 style="text-align:center;margin:2rem 0 1rem;">${i18n.t('compare.thermalResultsTitle')} — ${normName}</h3>`;
        html += `<div class="thermal-results-table"><table><thead><tr><th>${i18n.t('compare.system')}</th><th>U (W/m²K)</th>`;
        zones.forEach(z => html += `<th>${i18n.t('compare.zone')} ${z.zona}</th>`);
        html += `</tr></thead><tbody>`;

        systems.forEach(sys => {
            html += `<tr>${thermalSystemCell(sys)}<td>${sys.transmitancia?.toFixed(2) || '—'}</td>`;
            const isSteelFrame = sys.identificacao?.descricao?.sistema_leve === true;
            zones.forEach(zona => {
                const maxU = isSteelFrame
                    ? (zona.transmitancia_maxima?.steel_frame || zona.transmitancia_maxima?.wall_mass || 999)
                    : (zona.transmitancia_maxima?.wall_mass || 999);
                const pass = sys.transmitancia <= maxU;
                html += `<td class="compliance-cell ${pass ? 'pass' : 'fail'}">${pass ? '✓' : '✗'}</td>`;
            });
            html += `</tr>`;
        });
        html += `</tbody></table></div>`;
        return html;
    }

    // ===================================================================
    //  Compare All (Method B — all systems)
    // ===================================================================
    window.runCompareAll = function (skipScroll) {
        const systems = dataManager.systems.filter(s => !s.custom);
        if (systems.length === 0) return;

        lastGroupResultType = 'all';

        const resultsDiv = document.getElementById('groupComparisonResults');
        if (!resultsDiv) return;

        let html = `<h3 style="text-align:center;">${i18n.t('compare.allResultsTitle')}</h3>`;
        html += createComparisonTable(systems);
        html += `<div class="comparison-charts">${createComparisonCharts(systems, 'all')}</div>`;
        html += createStandardsComplianceTable(systems);
        resultsDiv.innerHTML = html;
        resultsDiv.style.display = 'block';

        setTimeout(() => renderBarCharts(systems, 'all'), 100);
        if (!skipScroll) {
            resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
            if (isLoggedIn()) {
                saveUserComparison(getCurrentUser(), { systems: systems.map(s => s.nome), type: 'compare-all' });
                displayUserComparisons();
            }
        }
    };

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

        currentDetailIdx = idx;
        body.innerHTML = buildSystemSheetHTML(system, 'detail', { idx, showActions: true });
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => renderSheetCharts(system, 'detail'), 120);
    };

    let currentDetailIdx = null;

    // Re-renderiza a ficha aberta ao trocar de idioma
    document.addEventListener('languageChanged', () => {
        const modal = document.getElementById('systemModal');
        if (modal?.classList.contains('active') && currentDetailIdx != null) {
            const system = dataManager.systems[currentDetailIdx];
            const body = document.getElementById('modalBody');
            if (system && body) {
                destroySheetCharts('detail');
                body.innerHTML = buildSystemSheetHTML(system, 'detail', { idx: currentDetailIdx, showActions: true });
                setTimeout(() => renderSheetCharts(system, 'detail'), 120);
            }
        }
    });

    function closeSystemModal() {
        destroySheetCharts('detail');
        currentDetailIdx = null;
        document.getElementById('systemModal')?.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ===================================================================
    //  Ficha do Sistema — layout único (detalhe do sistema = cartilha = PDF)
    // ===================================================================
    // Categorias de impacto ambiental: sigla + nome completo + unidade
    const IMPACT_CATEGORIES = [
        { key: 'gwp', acronym: 'GWP', i18nKey: 'impact.gwp', unit: 'kg CO₂ eq', path: 'impactos.gwp' },
        { key: 'ap', acronym: 'AP', i18nKey: 'impact.ap', unit: 'kg SO₂ eq', path: 'impactos.ap' },
        { key: 'ep', acronym: 'EP', i18nKey: 'impact.ep', unit: 'kg PO₄ eq', path: 'impactos.ep' },
        { key: 'pocp', acronym: 'POCP', i18nKey: 'impact.pocp', unit: 'kg C₂H₄ eq', path: 'impactos.pocp' },
        { key: 'odp', acronym: 'ODP', i18nKey: 'impact.odp', unit: 'kg CFC-11 eq', path: 'impactos.odp' },
        { key: 'adpnf', acronym: 'ADP-nf', i18nKey: 'impact.adpnf', unit: 'kg Sb eq', path: 'impactos.adpnf' },
        { key: 'adpf', acronym: 'ADP-f', i18nKey: 'impact.adpf', unit: 'MJ', path: 'impactos.adpf' }
    ];
    window.IMPACT_CATEGORIES = IMPACT_CATEGORIES;

    function impactFullLabel(cat) { return `${i18n.t(cat.i18nKey)} (${cat.acronym})`; }
    window.impactFullLabel = impactFullLabel;

    // Normas avaliadas na tabela de conformidade (linhas) × zonas bioclimáticas (colunas)
    const NORM_ROWS = [
        { key: 'nbr15575', label: 'NBR 15575' },
        { key: 'rtqr', label: 'RTQ-R' },
        { key: 'rtqc', label: 'RTQ-C' },
        { key: 'ashrae_residential', label: 'ASHRAE 90.1 Res.' },
        { key: 'ashrae_commercial', label: 'ASHRAE 90.1 Com.' }
    ];
    const COMPLIANCE_ZONES = [1, 2, 3, 4, 5, 6, 7, 8];
    window.NORM_ROWS = NORM_ROWS;
    window.COMPLIANCE_ZONES = COMPLIANCE_ZONES;

    /** Avalia um sistema em uma norma/zona. Retorna { text, cls }. */
    function evaluateNormZone(system, normKey, regs, zone) {
        const norm = regs?.[normKey];
        const zona = norm?.zonas?.find(z => z.zona === zone);
        if (!zona) return { text: '—', cls: 'na' };

        if (normKey === 'rtqc') {
            const u = system.transmitancia;
            let grade = 'E';
            if (u <= (zona.nota_A?.transmitancia_maxima?.inferior_limite || 0)) grade = 'A';
            else if (u <= (zona.nota_B?.transmitancia_maxima?.inferior_limite || 0)) grade = 'B';
            else if (u <= (zona.nota_CD?.transmitancia_maxima?.inferior_limite || 0)) grade = 'CD';
            return { text: grade, cls: 'grade-' + grade.toLowerCase() };
        }

        if (normKey.startsWith('ashrae')) {
            const isSF = system.identificacao?.descricao?.sistema_leve === true;
            const maxU = isSF
                ? (zona.transmitancia_maxima?.steel_frame || zona.transmitancia_maxima?.wall_mass || 999)
                : (zona.transmitancia_maxima?.wall_mass || 999);
            const pass = system.transmitancia <= maxU;
            return { text: pass ? '✓' : '✗', cls: pass ? 'pass' : 'fail' };
        }

        const maxU = zona.transmitancia_maxima?.inferior_limite || 999;
        const minCT = zona.capacidade_minima || 0;
        const pass = system.transmitancia <= maxU && system.capacidade_termica >= minCT;
        return { text: pass ? '✓' : '✗', cls: pass ? 'pass' : 'fail' };
    }
    window.evaluateNormZone = evaluateNormZone;

    /** Tabela de conformidade: normas nas linhas, zonas nas colunas. */
    function buildComplianceMatrix(system) {
        const regs = dataManager.getRegulations();
        if (!regs) return '';
        let html = `<div class="sheet-table-wrap"><table class="cartilha-table compliance-matrix"><thead><tr><th>${i18n.t('cartilha.standard')}</th>`;
        COMPLIANCE_ZONES.forEach(z => { html += `<th>${i18n.t('cartilha.zone')} ${z}</th>`; });
        html += `</tr></thead><tbody>`;
        NORM_ROWS.forEach(row => {
            if (!regs[row.key]) return;
            html += `<tr><td class="norm-name-cell">${row.label}</td>`;
            COMPLIANCE_ZONES.forEach(z => {
                const r = evaluateNormZone(system, row.key, regs, z);
                html += `<td class="compliance-cell ${r.cls}">${r.text}</td>`;
            });
            html += `</tr>`;
        });
        html += `</tbody></table></div>`;
        html += `<p class="sheet-note">${i18n.t('cartilha.matrixNote')}</p>`;
        return html;
    }

    /**
     * Monta a ficha do sistema. O mesmo HTML é usado no modal de detalhe,
     * na cartilha e no PDF exportado, garantindo layout idêntico.
     */
    function buildSystemSheetHTML(system, prefix, opts) {
        opts = opts || {};
        const desc = system.identificacao?.descricao || {};
        const layers = system.identificacao?.camadas || [];
        const imp = system.impactos || {};
        const yes = i18n.t('detail.yes');
        const no = i18n.t('detail.no');

        let html = `<div class="system-sheet" id="systemSheet_${prefix}">`;

        // Cabeçalho com logos (o logo da UFRGS não vai para a impressão/PDF)
        html += `<div class="cartilha-logos-row">
            <img src="assets/logo_ufrgs.png" alt="UFRGS" class="cartilha-inline-logo no-print">
            <img src="assets/logo_be3.png?v=20261025" alt="BE³ Build" class="cartilha-inline-logo">
            <img src="assets/Logo_2306.png" alt="LIfE" class="cartilha-inline-logo">
        </div>`;

        html += `<h2 class="sheet-title">${tData(system.nome)}</h2>`;

        if (system.imagem) {
            html += `<img src="${system.imagem}" alt="${tData(system.nome)}" class="cartilha-image">`;
        }

        // 1. Identificação
        html += `<h3 class="sheet-section-title">${i18n.t('cartilha.identification')}</h3>`;
        html += `<div class="sheet-grid">`;
        html += `<div class="sheet-item"><strong>${i18n.t('cartilha.boundary')}:</strong> ${tData(system.identificacao?.fronteira) || '—'}</div>`;
        html += `<div class="sheet-item"><strong>${i18n.t('cartilha.functionalUnit')}:</strong> ${tData(system.identificacao?.unidade) || '—'}</div>`;
        html += `<div class="sheet-item"><strong>${i18n.t('cartilha.weight')}:</strong> ${desc.peso?.toFixed(1) || '—'} kg/m²</div>`;
        html += `<div class="sheet-item"><strong>${i18n.t('cartilha.totalThickness')}:</strong> ${desc.espessura || '—'} cm</div>`;
        html += `<div class="sheet-item"><strong>${i18n.t('cartilha.lightweight')}:</strong> ${desc.sistema_leve ? yes : no}</div>`;
        html += `<div class="sheet-item"><strong>${i18n.t('cartilha.insulation')}:</strong> ${desc.isolante_termico ? yes : no}</div>`;
        html += `</div>`;

        if (layers.length) {
            html += `<h4 class="sheet-subtitle">${i18n.t('cartilha.composition')}</h4>`;
            html += `<ol class="sheet-layers">${layers.map(l => `<li>${tData(l)}</li>`).join('')}</ol>`;
        }

        // 2. Desempenho térmico
        html += `<h3 class="sheet-section-title">${i18n.t('cartilha.thermalPerf')}</h3>`;
        html += `<div class="sheet-table-wrap"><table class="cartilha-table"><thead><tr><th>${i18n.t('cartilha.property')}</th><th>${i18n.t('cartilha.value')}</th><th>${i18n.t('cartilha.unitCol')}</th></tr></thead><tbody>`;
        html += `<tr><td>${i18n.t('cartilha.thermalTransmittance')}</td><td>${system.transmitancia?.toFixed(2) || '—'}</td><td>W/(m²·K)</td></tr>`;
        html += `<tr><td>${i18n.t('cartilha.thermalCapacity')}</td><td>${system.capacidade_termica?.toFixed(0) || '—'}</td><td>kJ/(m²·K)</td></tr>`;
        html += `</tbody></table></div>`;

        // 3. Impactos ambientais — nome completo das categorias
        html += `<h3 class="sheet-section-title">${i18n.t('cartilha.envImpacts')}</h3>`;
        html += `<div class="sheet-table-wrap"><table class="cartilha-table"><thead><tr><th>${i18n.t('cartilha.indicator')}</th><th>${i18n.t('cartilha.value')}</th><th>${i18n.t('cartilha.unitCol')}</th></tr></thead><tbody>`;
        IMPACT_CATEGORIES.forEach(cat => {
            html += `<tr><td>${impactFullLabel(cat)}</td><td>${formatScientific(imp[cat.key])}</td><td>${cat.unit}</td></tr>`;
        });
        html += `</tbody></table></div>`;

        // 4. Gráfico — participação (%) de cada material por categoria de impacto
        const comps = system.consumo?.componentes || [];
        if (comps.length) {
            html += `<h3 class="sheet-section-title">${i18n.t('cartilha.charts')}</h3>`;
            html += `<h4 class="sheet-subtitle">${i18n.t('cartilha.chartSubtitle')}</h4>`;
            html += `<div class="sheet-chart-wrap"><canvas id="sheetChart_${prefix}"></canvas></div>`;
        }

        // 5. Conformidade com normas (zonas nas colunas, normas nas linhas)
        html += `<h3 class="sheet-section-title">${i18n.t('cartilha.standards')}</h3>`;
        html += buildComplianceMatrix(system);

        // Rodapé: propriedade intelectual e forma de citação
        html += buildSheetFooter(system);

        html += `</div>`;

        if (opts.showActions && opts.idx != null) {
            html += `<div class="sheet-actions no-print">
                <button class="btn btn-primary" onclick="openCartilhaModal(${opts.idx})">${i18n.t('systems.viewCard')}</button>
            </div>`;
        }

        return html;
    }

    /**
     * Endereço público onde o app está publicado — usado na citação.
     * Lido da própria URL, então acompanha qualquer mudança de hospedagem.
     */
    function getAppUrl() {
        const { origin, pathname } = window.location;
        if (!/^https?:/.test(origin || '')) return 'https://be3-app.github.io/';
        return origin + pathname.replace(/[^/]*$/, '');
    }

    /** Rodapé da ficha: direitos autorais, uso permitido e como citar. */
    function buildSheetFooter(system) {
        const today = new Date().toLocaleDateString(i18n.getLang() === 'en' ? 'en-GB' : 'pt-BR');
        const year = new Date().getFullYear();
        const url = getAppUrl();
        const citation = i18n.getLang() === 'en'
            ? `LIfE — Life Cycle Innovation for the Built Environment. <strong>BE³ Build</strong>: environmental and thermal performance of wall systems — ${tData(system.nome)}. Version 5.0. Porto Alegre: PPGCI/UFRGS, ${year}. Available at: ${url}. Accessed on: ${today}.`
            : `LIfE — Life Cycle Innovation for the Built Environment. <strong>BE³ Build</strong>: desempenho ambiental e térmico de sistemas de paredes — ${tData(system.nome)}. Versão 5.0. Porto Alegre: PPGCI/UFRGS, ${year}. Disponível em: ${url}. Acesso em: ${today}.`;

        return `<div class="sheet-footer">
            <div class="sheet-citation"><strong>${i18n.t('cartilha.howToCite')}</strong><p>${citation}</p></div>
            <p class="sheet-copyright">${i18n.t('cartilha.copyright')}</p>
            <p class="sheet-ip">${i18n.t('cartilha.ipNotice')}</p>
        </div>`;
    }

    // ---- Gráficos da ficha (barras empilhadas 100% por categoria) ----
    const sheetChartRegistry = {};

    function destroySheetCharts(prefix) {
        if (sheetChartRegistry[prefix]) {
            try { sheetChartRegistry[prefix].destroy(); } catch (e) { /* noop */ }
            delete sheetChartRegistry[prefix];
        }
    }

    function renderSheetCharts(system, prefix) {
        const comps = system.consumo?.componentes || [];
        const canvas = document.getElementById(`sheetChart_${prefix}`);
        if (!comps.length || !canvas || typeof Chart === 'undefined') return;

        destroySheetCharts(prefix);

        // Percentual de cada material dentro de cada categoria de impacto
        const totals = {};
        IMPACT_CATEGORIES.forEach(cat => {
            totals[cat.key] = comps.reduce((sum, c) => sum + Math.abs(c[cat.key] || 0), 0);
        });

        const datasets = comps.map((c, i) => ({
            label: tData(c.componente),
            data: IMPACT_CATEGORIES.map(cat => {
                const total = totals[cat.key];
                return total ? (Math.abs(c[cat.key] || 0) / total) * 100 : 0;
            }),
            backgroundColor: materialChartColors[i % materialChartColors.length],
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.9)'
        }));

        sheetChartRegistry[prefix] = new Chart(canvas, {
            type: 'bar',
            data: { labels: IMPACT_CATEGORIES.map(c => c.acronym), datasets },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                    legend: { position: 'bottom', labels: { font: { size: 12 }, boxWidth: 14 } },
                    title: { display: true, text: i18n.t('cartilha.chartAxisTitle'), font: { size: 15, weight: '600' } },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.x.toFixed(1)}%`
                        }
                    }
                },
                scales: {
                    x: { stacked: true, min: 0, max: 100, ticks: { callback: (v) => `${v}%`, font: { size: 12 } } },
                    y: { stacked: true, ticks: { font: { size: 13, weight: '600' } } }
                }
            }
        });
    }

    // ===================================================================
    //  Comparison
    // ===================================================================
    let lastComparisonSystems = [];

    function setComparisonActionsEnabled(enabled) {
        const saveBtn = document.getElementById('saveComparisonBtn');
        const printBtn = document.getElementById('printComparisonBtn');
        if (saveBtn) saveBtn.disabled = !enabled;
        if (printBtn) printBtn.disabled = !enabled;
    }

    function showComparison(skipScroll) {
        if (selectedSystems.length < 2) return;

        lastGroupResultType = 'individual';

        const systems = selectedSystems.map(i => dataManager.systems[i]).filter(Boolean);
        const resultsDiv = document.getElementById('groupComparisonResults');
        if (!resultsDiv) return;
        resultsDiv.style.display = 'block';
        lastComparisonSystems = systems;

        // Tabela 1: características do sistema · Tabela 2: impacto ambiental
        const today = new Date().toLocaleDateString(i18n.getLang() === 'en' ? 'en-GB' : 'pt-BR');
        let html = `<div id="comparisonPrintArea">`;
        html += `<div class="print-only print-header">
            <img src="assets/logo_be3.png?v=20261025" alt="BE³ Build" class="print-header-logo">
            <div class="print-header-text">
                <strong>${i18n.t('compare.results')}</strong>
                <span>${systems.map(s => tData(s.nome)).join('  ·  ')}</span>
                <span>${i18n.t('compare.printedOn')} ${today}</span>
            </div>
        </div>`;
        html += `<h3 class="no-print-title">${i18n.t('compare.results')}</h3>`;
        html += createComparisonTable(systems);
        html += `<h3 class="comparison-subtitle">${i18n.t('compare.envTitle')}</h3>`;
        html += createEnvironmentalTable(systems);
        html += buildAcronymsLegend();
        html += `<div class="comparison-charts">${createComparisonCharts(systems, 'ind')}</div>`;
        html += createStandardsComplianceTable(systems);
        html += `<div class="print-only sheet-footer">
            <p class="sheet-copyright">${i18n.t('cartilha.copyright')}</p>
            <p class="sheet-ip">${i18n.t('cartilha.ipNotice')}</p>
        </div>`;
        html += `</div>`;
        resultsDiv.innerHTML = html;

        // Render charts after DOM is ready
        setTimeout(() => {
            renderBarCharts(systems, 'ind');
        }, 100);

        setComparisonActionsEnabled(true);

        if (!skipScroll) resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /** Comparar 11: salvar a comparação no histórico do usuário. */
    window.saveCurrentComparison = function () {
        if (!lastComparisonSystems.length) return;
        requireLogin(() => {
            const user = getCurrentUser();
            if (!user) return;
            saveUserComparison(user, {
                type: 'individual',
                systems: lastComparisonSystems.map(s => s.nome),
                systemKeys: lastComparisonSystems.map(s => s.id || s.nome)
            });
            if (typeof displayUserComparisons === 'function') displayUserComparisons();
            showAlert('success', i18n.t('compare.savedMsg'));
        });
    };

    /** Comparar 12: imprimir apenas o resultado da comparação. */
    window.printComparison = function () {
        const results = document.getElementById('groupComparisonResults');
        if (!results || results.style.display === 'none') return;
        // Paisagem: as tabelas de comparação são largas
        runPrint('printing-compare', '@page { size: A4 landscape; margin: 10mm; }');
    };

    /** Meus Projetos 2: reabrir uma comparação salva já configurada. */
    window.openSavedComparison = function (comparisonId) {
        const user = getCurrentUser();
        if (!user) return;
        const comp = getUserComparisons(user).find(c => c.id === comparisonId);
        if (!comp) return;

        const keys = comp.systemKeys || comp.systems || [];
        const indices = keys
            .map(k => dataManager.systems.findIndex(s => s.id === k || s.nome === k))
            .filter(i => i > -1);

        if (indices.length < 2) {
            showAlert('error', i18n.t('history.openError'));
            return;
        }

        selectedSystems = indices.slice(0, 5);
        navigateTo('compare');
        selectCompareMethod('groups');
        renderCompareSystemGrid();
        renderSelectedChips();
        setTimeout(() => showComparison(), 150);
    };

    function comparisonHeaderRow(systems, firstLabel) {
        let html = `<div class="comparison-row header" style="grid-template-columns: 1.5fr repeat(${systems.length}, 1fr)"><div class="comparison-cell">${firstLabel}</div>`;
        systems.forEach(s => {
            const idx = dataManager.systems.indexOf(s);
            const typeClass = getTypeClass(s);
            const layers = (s.identificacao?.camadas || []).map(l => tData(l)).join(', ');
            html += `<div class="comparison-cell system-header-cell ${typeClass}-header">
                <a href="#" class="system-name-link" onclick="event.preventDefault(); showSystemDetail(${idx})">${tData(s.nome)}</a>
                <span class="system-desc-sub">${layers || ''}</span>
            </div>`;
        });
        html += `</div>`;
        return html;
    }

    function comparisonValueRows(systems, props) {
        let html = '';
        props.forEach(prop => {
            const values = systems.map(s => {
                if (prop.path) return prop.path.split('.').reduce((o, k) => o?.[k], s);
                return s[prop.key];
            });
            const numeric = values.filter(v => typeof v === 'number');
            const best = numeric.length ? (prop.lower ? Math.min(...numeric) : Math.max(...numeric)) : null;

            html += `<div class="comparison-row" style="grid-template-columns: 1.5fr repeat(${systems.length}, 1fr)"><div class="comparison-cell">${prop.label}</div>`;
            values.forEach(v => {
                const isBest = best != null && v === best;
                const display = v == null ? '—' : (typeof v === 'number' ? formatScientific(v) : v);
                html += `<div class="comparison-cell ${isBest ? 'best' : ''}">${display}${prop.unit && v != null ? ' ' + prop.unit : ''}</div>`;
            });
            html += `</div>`;
        });
        return html;
    }

    // Tabela 1 — características do sistema (até espessura)
    function createComparisonTable(systems) {
        const props = [
            { key: 'transmitancia', label: `${i18n.t('detail.thermalTransmittance')}`, unit: 'W/m²K', lower: true },
            { key: 'capacidade_termica', label: `${i18n.t('detail.thermalCapacity')}`, unit: 'kJ/m²K', lower: false },
            { key: 'peso', label: `${i18n.t('detail.weight')} (kg/m²)`, unit: '', lower: true, path: 'identificacao.descricao.peso' },
            { key: 'espessura', label: `${i18n.t('detail.thickness')} (cm)`, unit: '', lower: true, path: 'identificacao.descricao.espessura' }
        ];
        let html = `<div class="comparison-table" style="--compare-cols: ${systems.length}">`;
        html += comparisonHeaderRow(systems, i18n.t('compare.property'));
        html += comparisonValueRows(systems, props);
        html += `</div>`;
        return html;
    }

    // Tabela 2 — impacto ambiental (todas as categorias)
    function createEnvironmentalTable(systems) {
        const props = IMPACT_CATEGORIES.map(cat => ({
            key: cat.key,
            label: `${impactFullLabel(cat)} — ${cat.unit}`,
            unit: '',
            lower: true,
            path: cat.path
        }));
        props.push({ key: 'ced', label: `${i18n.t('impact.ced')} (CED) — MJ`, unit: '', lower: true, path: 'consumo.total' });

        let html = `<div class="comparison-table" style="--compare-cols: ${systems.length}">`;
        html += comparisonHeaderRow(systems, i18n.t('compare.indicator'));
        html += comparisonValueRows(systems, props);
        html += `</div>`;
        return html;
    }

    // Comparar 10: significado das siglas
    function buildAcronymsLegend() {
        let html = `<div class="acronyms-legend"><h5>${i18n.t('compare.acronyms')}</h5><ul>`;
        IMPACT_CATEGORIES.forEach(cat => {
            html += `<li><strong>${cat.acronym}</strong> — ${i18n.t(cat.i18nKey)} (${cat.unit})</li>`;
        });
        html += `<li><strong>CED</strong> — ${i18n.t('impact.ced')} (MJ)</li>`;
        html += `<li><strong>U</strong> — ${i18n.t('detail.thermalTransmittance')} (W/m²K)</li>`;
        html += `<li><strong>CT</strong> — ${i18n.t('detail.thermalCapacity')} (kJ/m²K)</li>`;
        html += `</ul></div>`;
        return html;
    }

    // Comparar 9: um gráfico para cada categoria de impacto (antes eram só 3)
    function createComparisonCharts(systems, prefix) {
        let html = `<h4>${i18n.t('compare.chartsTitle')}</h4><div class="comparison-charts-grid">`;
        IMPACT_CATEGORIES.forEach(cat => {
            html += `<div class="comparison-chart-box"><canvas id="chart_${cat.key}_${prefix}"></canvas></div>`;
        });
        html += `<div class="comparison-chart-box"><canvas id="chart_ced_${prefix}"></canvas></div>`;
        html += `</div>`;
        return html;
    }

    const comparisonChartRegistry = {};

    function renderBarCharts(systems, prefix) {
        if (typeof Chart === 'undefined') return;
        const labels = systems.map(s => tData(s.nome));
        const colors = labels.map((_, i) => chartColors[i % chartColors.length]);

        // Descarta gráficos anteriores para evitar reuso de canvas
        (comparisonChartRegistry[prefix] || []).forEach(c => { try { c.destroy(); } catch (e) { /* noop */ } });
        comparisonChartRegistry[prefix] = [];

        const series = IMPACT_CATEGORIES.map(cat => ({
            id: `chart_${cat.key}_${prefix}`,
            title: `${cat.acronym} (${cat.unit})`,
            values: systems.map(s => s.impactos?.[cat.key] ?? null)
        }));
        series.push({
            id: `chart_ced_${prefix}`,
            title: 'CED (MJ)',
            values: systems.map(s => s.consumo?.total || 0)
        });

        series.forEach(serie => {
            const ctx = document.getElementById(serie.id);
            if (!ctx) return;
            comparisonChartRegistry[prefix].push(new Chart(ctx, {
                type: 'bar',
                data: { labels, datasets: [{ label: serie.title, data: serie.values, backgroundColor: colors }] },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    plugins: {
                        legend: { display: false },
                        title: { display: true, text: serie.title, font: { size: 15, weight: '600' } }
                    },
                    scales: {
                        y: { beginAtZero: true, ticks: { font: { size: 11 } } },
                        x: { ticks: { maxRotation: 35, minRotation: 0, font: { size: 11, weight: '500' }, autoSkip: false } }
                    }
                }
            }));
        });
    }

    // ===================================================================
    //  Standards Compliance
    // ===================================================================
    function createStandardsComplianceTable(systems) {
        const regs = dataManager.getRegulations();
        if (!regs) return '';

        let html = `<h3 style="text-align:center;margin-top:2rem;">${i18n.t('compare.standardsTitle')}</h3>`;
        html += `<div class="comparison-table"><div class="comparison-row header" style="grid-template-columns: 1.5fr repeat(${systems.length}, 1fr)"><div class="comparison-cell">${i18n.t('compare.standard')}</div>`;
        systems.forEach(s => { html += `<div class="comparison-cell">${tData(s.nome)}</div>`; });
        html += `</div>`;

        // NBR 15575 – zones 1-8
        if (regs.nbr15575) {
            for (let z = 1; z <= 8; z++) {
                html += `<div class="comparison-row" style="grid-template-columns: 1.5fr repeat(${systems.length}, 1fr)"><div class="comparison-cell">NBR 15575 – ${i18n.t('compare.zone')} ${z}</div>`;
                systems.forEach(s => {
                    const result = evaluateNBR(s, regs.nbr15575, z);
                    html += `<div class="comparison-cell" style="color:${result ? 'var(--success-500)' : 'var(--error-500)'}">${result ? '✓' : '✗'}</div>`;
                });
                html += `</div>`;
            }
        }

        // ASHRAE residential
        if (regs.ashrae_residential) {
            const ashraeResShort = i18n.getLang() === 'en' ? 'ASHRAE Res.' : 'ASHRAE Res.';
            regs.ashrae_residential.zonas?.forEach(zona => {
                html += `<div class="comparison-row" style="grid-template-columns: 1.5fr repeat(${systems.length}, 1fr)"><div class="comparison-cell">${ashraeResShort} – ${i18n.t('compare.zone')} ${zona.zona}</div>`;
                systems.forEach(s => {
                    const isSF = s.identificacao?.descricao?.sistema_leve === true;
                    const maxU = isSF ? (zona.transmitancia_maxima?.steel_frame || zona.transmitancia_maxima?.wall_mass || 999) : (zona.transmitancia_maxima?.wall_mass || 999);
                    const pass = s.transmitancia <= maxU;
                    html += `<div class="comparison-cell" style="color:${pass ? 'var(--success-500)' : 'var(--error-500)'}">${pass ? '✓' : '✗'}</div>`;
                });
                html += `</div>`;
            });
        }

        // ASHRAE commercial
        if (regs.ashrae_commercial) {
            const ashraeComShort = i18n.getLang() === 'en' ? 'ASHRAE Com.' : 'ASHRAE Com.';
            regs.ashrae_commercial.zonas?.forEach(zona => {
                html += `<div class="comparison-row" style="grid-template-columns: 1.5fr repeat(${systems.length}, 1fr)"><div class="comparison-cell">${ashraeComShort} – ${i18n.t('compare.zone')} ${zona.zona}</div>`;
                systems.forEach(s => {
                    const isSF = s.identificacao?.descricao?.sistema_leve === true;
                    const maxU = isSF ? (zona.transmitancia_maxima?.steel_frame || zona.transmitancia_maxima?.wall_mass || 999) : (zona.transmitancia_maxima?.wall_mass || 999);
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

        currentCartilhaSystem = system;
        titulo.textContent = `${i18n.t('cartilha.title')} – ${tData(system.nome)}`;
        // Mesmo layout do detalhe do sistema e do PDF exportado
        content.innerHTML = buildSystemSheetHTML(system, 'cartilha', {});
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        setTimeout(() => renderSheetCharts(system, 'cartilha'), 200);
    };

    let currentCartilhaSystem = null;

    window.closeCartilhaModal = function () {
        destroySheetCharts('cartilha');
        currentCartilhaSystem = null;
        const modal = document.getElementById('cartilhaModal');
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    // Re-renderiza a cartilha aberta ao trocar de idioma
    document.addEventListener('languageChanged', () => {
        const modal = document.getElementById('cartilhaModal');
        if (modal?.classList.contains('active') && currentCartilhaSystem) {
            const content = document.getElementById('cartilhaContent');
            const titulo = document.getElementById('cartilhaTitulo');
            if (titulo) titulo.textContent = `${i18n.t('cartilha.title')} – ${tData(currentCartilhaSystem.nome)}`;
            if (content) {
                destroySheetCharts('cartilha');
                content.innerHTML = buildSystemSheetHTML(currentCartilhaSystem, 'cartilha', {});
                setTimeout(() => renderSheetCharts(currentCartilhaSystem, 'cartilha'), 120);
            }
        }
    });

    // ===================================================================
    //  Impressão e exportação da cartilha
    // ===================================================================
    /** Define a orientação da folha durante a impressão (removida ao final). */
    function setPrintPageStyle(css) {
        let el = document.getElementById('printPageStyle');
        if (!el) {
            el = document.createElement('style');
            el.id = 'printPageStyle';
            document.head.appendChild(el);
        }
        el.textContent = css;
    }
    function clearPrintPageStyle() {
        document.getElementById('printPageStyle')?.remove();
    }

    function runPrint(bodyClass, pageCss) {
        document.body.classList.add(bodyClass);
        setPrintPageStyle(pageCss);
        const cleanup = () => {
            document.body.classList.remove(bodyClass);
            clearPrintPageStyle();
            window.removeEventListener('afterprint', cleanup);
        };
        window.addEventListener('afterprint', cleanup);
        setTimeout(() => { window.print(); setTimeout(cleanup, 1000); }, 150);
    }

    window.printCartilha = function () {
        runPrint('printing-cartilha', '@page { size: A4 portrait; margin: 12mm; }');
    };

    // Gera e baixa o PDF direto (sem diálogo de impressão); cada seção numerada ocupa uma página.
    window.exportCartilhaToPDF = async function () {
        const system = currentCartilhaSystem;
        if (!system) return;
        if (typeof html2pdf === 'undefined') {
            showAlert('error', i18n.t('cartilha.pdfError'));
            return;
        }

        const btn = document.querySelector('.cartilha-actions button[onclick="exportCartilhaToPDF()"]');
        if (btn) btn.disabled = true;

        // Cópia fora da tela, com a largura útil da página A4 (210mm - 2 x 12mm de margem)
        const host = document.createElement('div');
        host.style.cssText = 'position:fixed;left:-10000px;top:0;';
        const root = document.createElement('div');
        root.className = 'cartilha-content pdf-sheet';
        root.style.cssText = 'width:186mm;padding:0;overflow:visible;background:#fff;';
        root.innerHTML = buildSystemSheetHTML(system, 'pdf', {});
        host.appendChild(root);
        document.body.appendChild(host);

        try {
            root.querySelectorAll('.no-print').forEach(el => el.remove());
            root.querySelectorAll('.sheet-section-title').forEach((h, i) => {
                if (i > 0) h.classList.add('pdf-break');
            });
            renderSheetCharts(system, 'pdf');

            await Promise.all([...root.querySelectorAll('img')].map(img =>
                img.complete ? null : new Promise(res => { img.onload = img.onerror = res; })));

            const name = tData(system.nome).replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_+|_+$/g, '') || 'sistema';
            await html2pdf().set({
                margin: 12,
                filename: `${name}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['css'], before: '.pdf-break', avoid: ['.cartilha-table', '.cartilha-image', '.sheet-chart-wrap'] }
            }).from(root).save();
        } catch (e) {
            console.error('PDF export failed', e);
            showAlert('error', i18n.t('cartilha.pdfError'));
        } finally {
            destroySheetCharts('pdf');
            host.remove();
            if (btn) btn.disabled = false;
        }
    };

    // ===================================================================
    //  Create System – Builder ("Crie e Avalie")
    // ===================================================================
    // Materiais da aba "Impactos do crie e calcule" (assets/crie_calcule.json), de fora para dentro
    let builderLayers = [];
    let builderPendingIdx = null;
    let builderLastResult = null;

    // Categorias da aba "Impactos do crie e calcule" (EN 15804+A2) + CED
    const BUILDER_IMPACTS = [
        { key: 'gwp', acronym: 'GWP-total', i18nKey: 'impactA2.gwp', unit: 'kg CO₂ eq' },
        { key: 'adpf', acronym: 'ADP-f', i18nKey: 'impactA2.adpf', unit: 'MJ' },
        { key: 'adpe', acronym: 'ADP-e', i18nKey: 'impactA2.adpe', unit: 'kg Sb eq' },
        { key: 'ap', acronym: 'AP', i18nKey: 'impactA2.ap', unit: 'mol H⁺ eq' },
        { key: 'odp', acronym: 'ODP', i18nKey: 'impactA2.odp', unit: 'kg CFC-11 eq' },
        { key: 'epfw', acronym: 'EP-freshwater', i18nKey: 'impactA2.epfw', unit: 'kg P eq' },
        { key: 'epm', acronym: 'EP-marine', i18nKey: 'impactA2.epm', unit: 'kg N eq' },
        { key: 'ept', acronym: 'EP-terrestrial', i18nKey: 'impactA2.ept', unit: 'mol N eq' },
        { key: 'pocp', acronym: 'POCP', i18nKey: 'impactA2.pocp', unit: 'kg NMVOC eq' },
        { key: 'wdp', acronym: 'WDP', i18nKey: 'impactA2.wdp', unit: 'm³ world eq' },
        { key: 'ced', acronym: 'CED', i18nKey: 'impact.ced', unit: 'MJ' }
    ];

    const numLocale = () => (i18n.getLang() === 'en' ? 'en-GB' : 'pt-BR');
    function fmtFixed(v, digits) {
        if (v == null || isNaN(v)) return '—';
        return Number(v).toLocaleString(numLocale(), { minimumFractionDigits: digits, maximumFractionDigits: digits });
    }
    /** Como formatScientific, mas com o separador decimal do idioma. */
    function fmtSci(v) {
        if (v == null || isNaN(v)) return '—';
        if (v === 0) return '0';
        if (Math.abs(v) >= 0.01 && Math.abs(v) < 10000) return fmtFixed(v, 2);
        const [m, e] = v.toExponential(2).split('e');
        return `${fmtFixed(Number(m), 2)}e${e}`;
    }
    function fmtShort(v) {
        return Number(v).toLocaleString(numLocale(), { maximumFractionDigits: 3 });
    }
    /** Espessura do material: "2,5 cm"; "—" quando a planilha não atribui espessura (pintura). */
    function fmtCm(v) {
        return v ? `${fmtShort(v)} cm` : '—';
    }
    const esc = s => (typeof escapeHTML === 'function' ? escapeHTML(s) : String(s ?? ''));

    function fillBuilderMaterialSelect(select) {
        while (select.options.length > 1) select.remove(1);
        dataManager.getBuilderComponents().forEach((c, i) => {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = tData(c.nome);
            select.appendChild(opt);
        });
    }

    function initBuilder() {
        const select = document.getElementById('builderMaterial');
        if (!select || !dataManager.loaded) return;
        if (!select.dataset.bound) {
            select.addEventListener('change', () => {
                builderPendingIdx = select.value === '' ? null : parseInt(select.value);
                renderBuilderPreview();
            });
            select.dataset.bound = '1';
        }
        // Keep existing options if already populated
        if (select.options.length > 1) return;
        fillBuilderMaterialSelect(select);
    }

    // Re-render builder when language changes
    document.addEventListener('languageChanged', () => {
        const select = document.getElementById('builderMaterial');
        if (select && dataManager.loaded) {
            const savedVal = select.value;
            fillBuilderMaterialSelect(select);
            select.value = savedVal;
        }
        renderBuilderLayers();
        renderBuilderPreview();
        renderBuilderResults();
    });

    /** Qualquer alteração nas camadas invalida o resultado calculado. */
    function builderLayersChanged() {
        builderLastResult = null;
        renderBuilderLayers();
        renderBuilderPreview();
        renderBuilderResults();
    }

    window.builderAddLayer = function () {
        const select = document.getElementById('builderMaterial');
        const comp = dataManager.getBuilderComponents()[parseInt(select?.value)];
        if (!comp) { select?.focus(); return; }
        builderLayers.push(comp);
        select.value = '';
        builderPendingIdx = null;
        builderLayersChanged();
    };

    window.builderRemoveLayer = function (idx) {
        builderLayers.splice(idx, 1);
        builderLayersChanged();
    };

    window.builderMoveLayer = function (idx, dir) {
        const newIdx = idx + dir;
        if (newIdx < 0 || newIdx >= builderLayers.length) return;
        [builderLayers[idx], builderLayers[newIdx]] = [builderLayers[newIdx], builderLayers[idx]];
        builderLayersChanged();
    };

    function renderBuilderLayers() {
        const container = document.getElementById('builderLayersList');
        if (!container) return;

        if (builderLayers.length === 0) {
            container.innerHTML = `<div class="empty-state">${i18n.t('create.noLayers')}</div>`;
            return;
        }

        container.innerHTML = builderLayers.map((layer, i) => `
            <div class="builder-layer-item">
                <div class="builder-layer-order">${i + 1}</div>
                <div class="builder-layer-info">
                    <span class="builder-layer-name">${tData(layer.nome)}</span>
                    <span class="builder-layer-thick">${fmtCm(layer.espessura_cm)}</span>
                </div>
                <div class="builder-layer-actions">
                    <button class="builder-layer-btn" onclick="builderMoveLayer(${i}, -1)" ${i === 0 ? 'disabled' : ''}>↑</button>
                    <button class="builder-layer-btn" onclick="builderMoveLayer(${i}, 1)" ${i === builderLayers.length - 1 ? 'disabled' : ''}>↓</button>
                    <button class="builder-layer-btn remove" onclick="builderRemoveLayer(${i})">×</button>
                </div>
            </div>
        `).join('');
    }

    // Material colors for visual preview
    const materialColors = {
        'bloco de concreto': '#b0b0b0',
        'bloco cerâmico': '#c4725a',
        'argamassa': '#d4a574',
        'placa de gesso': '#eee8d5',
        'gesso': '#f5f0e8',
        'concreto': '#a0a0a0',
        'granito': '#8e8a8f',
        'placa cimentícia': '#c0c0c0',
        'alumínio': '#cfd6dc',
        'perfil de aço': '#9aa3ab',
        'lã de rocha': '#e6d45a',
        'poliestireno': '#d0e8ff',
        'mdf': '#c49a6c',
        'pintura': '#e8dcc8',
        'camara de ar': '#f4f9fc'
    };

    function getMaterialColor(name) {
        const lower = (name || '').toLowerCase();
        for (const [key, color] of Object.entries(materialColors)) {
            if (lower.includes(key)) return color;
        }
        return '#c8bfb0';
    }

    function getMaterialPattern(name) {
        const lower = (name || '').toLowerCase();
        if (lower.includes('bloco') || lower.includes('tijolo')) return 'brick';
        if (lower.includes('concreto') || lower.includes('granito')) return 'concrete';
        if (lower.includes('lã') || lower.includes('poliestireno')) return 'insulation';
        if (lower.includes('perfil de aço')) return 'steel';
        if (lower.includes('camara de ar')) return 'air';
        return 'solid';
    }

    /** Uma faixa vertical da parede: só a representação do material e a espessura (cm). */
    function wallLayerHtml(comp, pending) {
        const e = comp.espessura_cm || 0;
        const label = e ? `<span class="preview-layer-label">${fmtCm(e)}</span>` : '';
        const title = `${tData(comp.nome)} — ${fmtCm(e)}`;
        return `<div class="preview-layer preview-pattern-${getMaterialPattern(comp.nome)}${e ? '' : ' preview-layer-thin'}${pending ? ' preview-layer-pending' : ''}"
            style="flex-grow:${e || 0};background-color:${getMaterialColor(comp.nome)};" title="${esc(title)}">${label}</div>`;
    }

    function renderBuilderPreview() {
        const card = document.getElementById('builderPreviewCard');
        if (!card) return;

        const pending = builderPendingIdx != null ? dataManager.getBuilderComponents()[builderPendingIdx] : null;
        if (builderLayers.length === 0 && !pending) {
            card.innerHTML = `<div class="builder-preview-empty">${i18n.t('create.previewEmpty')}</div>`;
            return;
        }

        const systemName = document.getElementById('builderSystemName')?.value || i18n.t('create.namePlaceholder');
        const totalThickness = builderLayers.reduce((s, l) => s + (l.espessura_cm || 0), 0);

        // Corte vertical da parede: exterior à esquerda, interior à direita
        let wallHtml = `<div class="preview-wall">`;
        wallHtml += `<div class="preview-wall-side">${i18n.t('create.exterior')}</div>`;
        wallHtml += `<div class="preview-wall-layers">`;
        builderLayers.forEach(layer => { wallHtml += wallLayerHtml(layer, false); });
        if (pending) wallHtml += wallLayerHtml(pending, true);
        wallHtml += `</div>`;
        wallHtml += `<div class="preview-wall-side">${i18n.t('create.interior')}</div>`;
        wallHtml += `</div>`;

        let legendHtml = `<div class="preview-legend">`;
        const legendItems = pending ? [...builderLayers, pending] : builderLayers;
        legendItems.forEach((layer, i) => {
            const isPending = pending && i === legendItems.length - 1;
            legendHtml += `<div class="preview-legend-item${isPending ? ' pending' : ''}"><span class="preview-legend-swatch" style="background:${getMaterialColor(layer.nome)};"></span>${tData(layer.nome)}${isPending ? ` <em>(${i18n.t('create.pendingLayer')})</em>` : ''}</div>`;
        });
        legendHtml += `</div>`;

        const infoHtml = `<div class="preview-info">
            <h4 class="preview-system-name">${esc(systemName)}</h4>
            <div class="preview-specs">
                <div class="spec-item"><span class="spec-label">${i18n.t('card.thickness')}:</span><span class="spec-value">${fmtCm(totalThickness)}</span></div>
            </div>
        </div>`;

        card.innerHTML = infoHtml + wallHtml + legendHtml;
    }

    /** Soma os impactos (por 1 m² de parede) das camadas montadas. */
    function builderTotals() {
        const totals = {};
        BUILDER_IMPACTS.forEach(c => { totals[c.key] = 0; });
        builderLayers.forEach(l => {
            BUILDER_IMPACTS.forEach(c => { totals[c.key] += l.impactos?.[c.key] || 0; });
        });
        return totals;
    }

    // ---- Texto das regras normativas -------------------------------------------------
    function criterionText(c) {
        if (c.porCT) {
            const r = c.porCT;
            return `CT ≤ ${fmtShort(r.ref)}: U ≤ ${fmtShort(r.ateRef)}; CT > ${fmtShort(r.ref)}: U ≤ ${fmtShort(r.acimaRef)}`;
        }
        if (c.min != null && c.max != null) return `${fmtShort(c.min)} ≤ ${c.p} ≤ ${fmtShort(c.max)}`;
        if (c.max != null) return `${c.p} ≤ ${fmtShort(c.max)}`;
        return `${c.p} ≥ ${fmtShort(c.min)}`;
    }

    /** Agrupa zonas consecutivas com os mesmos critérios: "ZB 1–2: U ≤ 2,7 · CT ≥ 130". */
    function zoneRulesText(norm) {
        const groups = [];
        CrieCalcule.ZONAS_BR.forEach(z => {
            const crit = norm.zonas[z];
            const text = crit ? crit.map(criterionText).join(' · ') : i18n.t('create.noCriterion');
            const last = groups[groups.length - 1];
            if (last && last.text === text) last.to = z;
            else groups.push({ from: z, to: z, text });
        });
        return groups.map(g => `<li><strong>ZB ${g.from}${g.to !== g.from ? '–' + g.to : ''}:</strong> ${g.text}</li>`).join('');
    }

    function statusCell(status) {
        if (status === 'atende') return `<td class="compliance-cell pass">${i18n.t('create.meets')}</td>`;
        if (status === 'naoAtende') return `<td class="compliance-cell fail">${i18n.t('create.notMeets')}</td>`;
        return `<td class="compliance-cell na">—</td>`;
    }

    const normLabel = n => `${n.norma}<small class="norm-variant">${i18n.t('create.variant.' + n.variante)}</small>`;

    function renderBuilderResults() {
        const box = document.getElementById('builderResults');
        if (!box) return;
        if (!builderLastResult) { box.hidden = true; box.innerHTML = ''; return; }

        const { name, layers, calc, normas, totals } = builderLastResult;
        const t = k => i18n.t(k);
        let html = `<div class="builder-results-card">`;
        html += `<h3 class="builder-subtitle">${t('create.resultsHeading')} — ${esc(name || t('create.namePlaceholder'))}</h3>`;
        html += `<p class="preview-results-note">${t('create.resultsNote')}</p>`;

        // 1. Desempenho térmico
        html += `<h4 class="sheet-section-title">${t('create.thermalSection')}</h4>`;
        if (!calc.calculavel) {
            html += `<div class="builder-warning">${t('create.notCalculable')}</div>`;
        }
        html += `<div class="sheet-table-wrap"><table class="cartilha-table"><thead><tr><th>${t('cartilha.property')}</th><th>${t('cartilha.value')}</th><th>${t('cartilha.unitCol')}</th></tr></thead><tbody>`;
        html += `<tr><td>${t('cartilha.totalThickness')}</td><td>${fmtShort(calc.espessuraCm)}</td><td>cm</td></tr>`;
        html += `<tr><td>${t('create.totalResistance')} (R<sub>T</sub>)</td><td>${fmtFixed(calc.RT, 3)}</td><td>m²·K/W</td></tr>`;
        html += `<tr><td>${t('cartilha.thermalTransmittance')}</td><td><strong>${fmtFixed(calc.U, 2)}</strong></td><td>W/(m²·K)</td></tr>`;
        html += `<tr><td>${t('cartilha.thermalCapacity')}</td><td><strong>${fmtFixed(calc.CT, 0)}</strong></td><td>kJ/(m²·K)</td></tr>`;
        html += `<tr><td>${t('create.surfaceMass')}</td><td>${fmtFixed(calc.massa, 1)}</td><td>kg/m²</td></tr>`;
        html += `</tbody></table></div>`;

        // 2. Impactos ambientais
        html += `<h4 class="sheet-section-title">${t('create.impactsSection')}</h4>`;
        html += `<div class="sheet-table-wrap"><table class="cartilha-table"><thead><tr><th>${t('cartilha.indicator')}</th><th>${t('cartilha.value')}</th><th>${t('cartilha.unitCol')}</th></tr></thead><tbody>`;
        BUILDER_IMPACTS.forEach(cat => {
            html += `<tr><td>${t(cat.i18nKey)} (${cat.acronym})</td><td>${fmtSci(totals[cat.key])}</td><td>${cat.unit}</td></tr>`;
        });
        html += `</tbody></table></div>`;

        // 3. Conformidade — zonas bioclimáticas brasileiras
        html += `<h4 class="sheet-section-title">${t('create.complianceSection')}</h4>`;
        html += `<div class="sheet-table-wrap"><table class="cartilha-table compliance-matrix builder-compliance"><thead><tr><th>${t('cartilha.standard')}</th>`;
        CrieCalcule.ZONAS_BR.forEach(z => { html += `<th>ZB ${z}</th>`; });
        html += `</tr></thead><tbody>`;
        normas.brasil.forEach(n => {
            html += `<tr><td class="norm-name-cell">${normLabel(n)}</td>`;
            CrieCalcule.ZONAS_BR.forEach(z => { html += statusCell(n.resultados[z]); });
            html += `</tr>`;
        });
        html += `</tbody></table></div>`;
        html += `<p class="sheet-note">${t('create.complianceNote')}</p>`;

        // ASHRAE — zonas climáticas próprias (0 a 8)
        html += `<h5 class="sheet-subtitle">ASHRAE 90.1-2025 — ${t('create.ashraeWalls')} · ${t('create.ashraeClass')}: <em>${t('create.ashraeClass.' + normas.classeAshrae)}</em></h5>`;
        html += `<div class="sheet-table-wrap"><table class="cartilha-table compliance-matrix builder-compliance"><thead><tr><th>${t('cartilha.standard')}</th>`;
        CrieCalcule.ZONAS_ASHRAE.forEach(z => { html += `<th>${t('create.climateZone')} ${z}</th>`; });
        html += `</tr></thead><tbody>`;
        normas.ashrae.forEach(n => {
            html += `<tr><td class="norm-name-cell">${normLabel(n)}</td>`;
            CrieCalcule.ZONAS_ASHRAE.forEach(z => { html += statusCell(n.resultados[z]); });
            html += `</tr>`;
        });
        html += `</tbody></table></div>`;
        html += `<p class="sheet-note">${t('create.ashraeNote')}</p>`;

        html += buildCalcDetailsHtml(layers, calc, normas);
        html += `</div>`;

        box.innerHTML = html;
        box.hidden = false;
    }

    /** Seção expansível: memória de cálculo + regras normativas aplicadas. */
    function buildCalcDetailsHtml(layers, calc, normas) {
        const t = k => i18n.t(k);
        let h = `<details class="concepts-details builder-calc-details">`;
        h += `<summary><span>${t('create.detailsTitle')}</span></summary><div class="concepts-details-body">`;

        // Método
        h += `<h5 class="sheet-subtitle">${t('create.methodTitle')}</h5>`;
        h += `<p>${t('create.methodIntro')}</p>`;
        h += `<ul class="builder-formulas">
            <li>${t('create.formulaR')}</li>
            <li>${t('create.formulaAir')}</li>
            <li>R<sub>T</sub> = R<sub>si</sub> + ΣR + R<sub>se</sub> &nbsp;(R<sub>si</sub> = ${fmtShort(calc.Rsi)}; R<sub>se</sub> = ${fmtShort(calc.Rse)} m²·K/W)</li>
            <li>U = 1 / R<sub>T</sub></li>
            <li>CT = Σ (e · ρ · c) ${t('create.formulaCT')}</li>
        </ul>`;

        // Memória por camada
        h += `<div class="sheet-table-wrap"><table class="cartilha-table builder-calc-table"><thead><tr>
            <th>${t('create.colLayer')}</th><th>e (cm)</th><th>λ<br><small>W/(m·K)</small></th><th>ρ<br><small>kg/m³</small></th>
            <th>c<br><small>kJ/(kg·K)</small></th><th>R<br><small>m²·K/W</small></th><th>e·ρ·c<br><small>kJ/(m²·K)</small></th></tr></thead><tbody>`;
        h += `<tr class="calc-surface"><td>${t('create.rse')}</td><td></td><td></td><td></td><td></td><td>${fmtFixed(calc.Rse, 3)}</td><td></td></tr>`;
        calc.linhas.forEach(l => {
            const material = l.material === l.componente ? '' : ` — ${tData(l.material)}`;
            h += `<tr><td>${tData(l.componente)}${material}</td><td>${fmtShort(l.e_m * 100)}</td>
                <td>${l.camaraAr ? t('create.table8') : fmtShort(l.lambda)}</td><td>${l.rho ? fmtShort(l.rho) : '—'}</td>
                <td>${l.c ? fmtShort(l.c) : '—'}</td><td>${fmtFixed(l.R, 3)}</td><td>${l.ct ? fmtFixed(l.ct, 1) : '—'}</td></tr>`;
        });
        h += `<tr class="calc-surface"><td>${t('create.rsi')}</td><td></td><td></td><td></td><td></td><td>${fmtFixed(calc.Rsi, 3)}</td><td></td></tr>`;
        h += `<tr class="calc-total"><td>${t('create.total')}</td><td></td><td></td><td></td><td></td><td>R<sub>T</sub> = ${fmtFixed(calc.RT, 3)}</td><td>CT = ${fmtFixed(calc.CT, 1)}</td></tr>`;
        h += `</tbody></table></div>`;
        h += `<p class="sheet-note">U = 1 / ${fmtFixed(calc.RT, 3)} = <strong>${fmtFixed(calc.U, 2)} W/(m²·K)</strong> · CT = <strong>${fmtFixed(calc.CT, 0)} kJ/(m²·K)</strong></p>`;

        // Regras — normas brasileiras
        h += `<h5 class="sheet-subtitle">${t('create.rulesTitle')}</h5>`;
        h += `<p>${t('create.rulesIntro')}</p>`;
        h += `<div class="sheet-table-wrap"><table class="cartilha-table builder-rules-table"><thead><tr><th>${t('cartilha.standard')}</th><th>${t('create.rulesCriteria')}</th><th>${t('create.rulesSource')}</th></tr></thead><tbody>`;
        normas.brasil.forEach(n => {
            h += `<tr><td class="norm-name-cell">${normLabel(n)}</td><td><ul class="builder-rule-list">${zoneRulesText(n)}</ul></td><td>${t('create.src.' + n.fonte)}</td></tr>`;
        });
        h += `</tbody></table></div>`;

        // Regras — ASHRAE
        h += `<p>${t('create.ashraeRulesIntro')}</p>`;
        h += `<div class="sheet-table-wrap"><table class="cartilha-table compliance-matrix builder-rules-table"><thead><tr><th>${t('create.ashraeClass')}</th><th>${t('create.use')}</th>`;
        CrieCalcule.ZONAS_ASHRAE.forEach(z => { h += `<th>${z}</th>`; });
        h += `</tr></thead><tbody>`;
        ['mass', 'steel', 'wood'].forEach(cls => {
            CrieCalcule.NORMAS_ASHRAE.forEach(n => {
                const active = cls === normas.classeAshrae;
                h += `<tr class="${active ? 'rule-active' : ''}"><td class="norm-name-cell">${t('create.ashraeClass.' + cls)}</td><td>${t('create.variant.' + n.variante)}</td>`;
                CrieCalcule.ZONAS_ASHRAE.forEach(z => { h += `<td>${fmtFixed(CrieCalcule.ASHRAE_U[cls][n.chave][z], 3)}</td>`; });
                h += `</tr>`;
            });
        });
        h += `</tbody></table></div>`;
        h += `<p class="sheet-note">${t('create.ashraeClassRule')}</p>`;

        // Observações
        const warnings = calc.avisos.map(a => {
            const comp = `<strong>${tData(a.componente)}</strong>`;
            if (a.tipo === 'naoCalculavel') return `${comp}: ${t('create.warn.notCalculable')}`;
            if (a.tipo === 'naoEntra') return `${comp}: ${t('create.warn.notIncluded')}`;
            if (a.tipo === 'semMassa') return `${comp}: ${t('create.warn.noMass')}`;
            if (a.tipo === 'calorIncomum') return `${comp}: ${t('create.warn.unusualHeat').replace('{c}', fmtShort(a.valor))}`;
            return comp;
        });
        layers.forEach(l => {
            if (BUILDER_IMPACTS.every(c => !l.impactos?.[c.key])) warnings.push(`<strong>${tData(l.nome)}</strong>: ${t('create.warn.noImpacts')}`);
        });
        h += `<h5 class="sheet-subtitle">${t('create.notesTitle')}</h5><ul class="builder-formulas">`;
        [...new Set(warnings)].forEach(w => { h += `<li>${w}</li>`; });
        h += `<li>${t('create.noteIni')}</li><li>${t('create.noteAlpha')}</li>`;
        h += `</ul>`;

        h += `</div></details>`;
        return h;
    }

    /** Botão "Calcular": U e CT pelo motor V1.2, impactos e verificação das normas. */
    window.builderCalculate = function () {
        if (builderLayers.length === 0) {
            showAlert('error', i18n.t('create.errorNoLayers'));
            return;
        }
        const layers = [...builderLayers];
        let calc;
        try {
            calc = CrieCalcule.calcularParede(layers);
        } catch (e) {
            console.error(e);
            showAlert('error', i18n.t('create.calcError'));
            return;
        }
        builderLastResult = {
            name: document.getElementById('builderSystemName')?.value?.trim() || '',
            layers,
            calc,
            normas: CrieCalcule.avaliarNormas(layers, calc),
            totals: builderTotals()
        };
        renderBuilderResults();
        document.getElementById('builderResults')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    /** Cria o objeto de sistema a partir das camadas montadas. */
    function buildCustomSystem(name) {
        const totals = builderTotals();
        const calc = CrieCalcule.calcularParede(builderLayers);
        const espessura = builderLayers.reduce((s, l) => s + (l.espessura_cm || 0), 0);
        const has = re => builderLayers.some(l => re.test(l.nome));
        const round = (v, d) => (v == null ? null : Number(v.toFixed(d)));
        return {
            nome: name,
            tipo: 'Personalizado',
            transmitancia: round(calc.U, 2),
            capacidade_termica: round(calc.CT, 0),
            identificacao: {
                descricao: {
                    peso: round(calc.massa, 1),
                    espessura: Number(espessura.toFixed(1)),
                    sistema_leve: has(/perfil de aço/i),
                    isolante_termico: has(/lã de rocha|poliestireno/i)
                },
                camadas: builderLayers.map(l => (/\d\s*cm/i.test(l.nome) || !l.espessura_cm ? l.nome : `${l.nome} (${fmtCm(l.espessura_cm)})`)),
                unidade: '1m²',
                fronteira: 'Fase de produção (A1-3)',
                validade: new Date().toLocaleDateString()
            },
            // AP, EP e POCP da planilha (EN 15804+A2) têm unidades diferentes das usadas pelos sistemas da base;
            // ficam só em impactos_a2 para não serem comparados como se fossem a mesma grandeza.
            impactos: {
                gwp: totals.gwp, ap: null, ep: null, pocp: null,
                odp: totals.odp, adpf: totals.adpf, adpnf: totals.adpe
            },
            impactos_a2: totals,
            consumo: {
                total: totals.ced,
                componentes: builderLayers.map(l => ({
                    componente: l.nome,
                    espessura: l.espessura_cm,
                    consumo_componente: l.impactos?.ced || 0,
                    gwp: l.impactos?.gwp || 0, ap: null, ep: null, pocp: null,
                    odp: l.impactos?.odp || 0, adpf: l.impactos?.adpf || 0, adpnf: l.impactos?.adpe || 0
                }))
            },
            custom: true
        };
    }

    window.builderSave = function (onSaved) {
        requireLogin(() => {
            const currentUser = getCurrentUser();
            if (!currentUser) return;

            const name = document.getElementById('builderSystemName')?.value?.trim();
            if (!name) { showAlert('error', i18n.t('create.errorNoName')); return; }
            if (builderLayers.length === 0) { showAlert('error', i18n.t('create.errorNoLayers')); return; }

            const saved = saveUserSystem(currentUser, buildCustomSystem(name));
            if (!dataManager.systems.find(s => s.id === saved.id)) {
                dataManager.systems.push(saved);
            }

            showAlert('success', i18n.t('alert.systemCreated'));
            builderLayers = [];
            document.getElementById('builderSystemName').value = '';
            builderLayersChanged();
            displayUserSystems();
            renderSystems();

            if (typeof onSaved === 'function') onSaved(saved);
        });
    };

    /** Salva o sistema criado e já o leva para a comparação. */
    window.builderCompare = function () {
        if (builderLayers.length === 0) { showAlert('error', i18n.t('create.errorNoLayers')); return; }
        builderSave((saved) => {
            const idx = dataManager.systems.findIndex(s => s.id === saved.id);
            if (idx > -1 && !selectedSystems.includes(idx)) {
                if (selectedSystems.length >= 5) selectedSystems.shift();
                selectedSystems.push(idx);
            }
            navigateTo('compare');
            selectCompareMethod('groups');
            renderCompareSystemGrid();
            renderSelectedChips();
            showAlert('success', i18n.t('create.addedToCompare'));
        });
    };

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
