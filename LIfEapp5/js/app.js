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
            <button class="card-expand-btn" data-tooltip="${i18n.t('tooltip.moreInfo')}" title="${i18n.t('tooltip.moreInfo')}" aria-label="${i18n.t('tooltip.moreInfo')}" onclick="event.stopPropagation(); openCartilhaModal(${idx})">
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
        const isRTQC = normKey === 'rtqc';

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
            <button class="row-expand-btn" title="${tip}" aria-label="${tip}" onclick="event.stopPropagation(); openCartilhaModal(${idx})">${NEW_TAB_ICON}</button>
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

    function buildRTQCTable(systems, rtqc) {
        let html = `<h3 style="text-align:center;margin:2rem 0 1rem;">${i18n.t('compare.thermalResultsTitle')} — RTQ-C</h3>`;
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
            <img src="assets/logo_e3build.png?v=20260811" alt="BE³ Build" class="cartilha-inline-logo">
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

    /** Rodapé da ficha: direitos autorais, uso permitido e como citar. */
    function buildSheetFooter(system) {
        const today = new Date().toLocaleDateString(i18n.getLang() === 'en' ? 'en-GB' : 'pt-BR');
        const year = new Date().getFullYear();
        const url = 'https://thiagoferreira53.github.io/LIfEapp5/';
        const citation = i18n.getLang() === 'en'
            ? `LIfE — Life Cycle Innovation for the Built Environment. <strong>BE³ Build</strong>: environmental and thermal performance of opaque external wall systems — ${tData(system.nome)}. Version 5.0. Porto Alegre: PPGCI/UFRGS, ${year}. Available at: ${url}. Accessed on: ${today}.`
            : `LIfE — Life Cycle Innovation for the Built Environment. <strong>BE³ Build</strong>: desempenho ambiental e térmico de sistemas de vedação vertical externa opaca — ${tData(system.nome)}. Versão 5.0. Porto Alegre: PPGCI/UFRGS, ${year}. Disponível em: ${url}. Acesso em: ${today}.`;

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
            <img src="assets/logo_e3build.png?v=20260811" alt="BE³ Build" class="print-header-logo">
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
            values: systems.map(s => s.impactos?.[cat.key] || 0)
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

    /**
     * Gera o PDF a partir de uma cópia da ficha renderizada em um container
     * com largura fixa de A4 — evita o desalinhamento causado pelo modal.
     * Os gráficos (canvas) são convertidos em imagem, pois um canvas clonado
     * seria exportado em branco.
     */
    window.exportCartilhaToPDF = function () {
        const source = document.getElementById('cartilhaContent');
        if (!source) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'pdf-render-root';

        const clone = source.cloneNode(true);
        clone.classList.add('pdf-export');
        clone.querySelectorAll('.no-print').forEach(el => el.remove());

        // canvas -> imagem (mantendo a proporção do gráfico)
        const sourceCanvases = source.querySelectorAll('canvas');
        clone.querySelectorAll('canvas').forEach((canvas, i) => {
            const original = sourceCanvases[i];
            if (!original) { canvas.remove(); return; }
            const img = document.createElement('img');
            try { img.src = original.toDataURL('image/png', 1.0); } catch (e) { canvas.remove(); return; }
            img.className = 'pdf-chart-img';
            canvas.parentNode.replaceChild(img, canvas);
        });

        wrapper.appendChild(clone);
        document.body.appendChild(wrapper);

        const name = currentCartilhaSystem ? tData(currentCartilhaSystem.nome).replace(/[^\w\-]+/g, '_') : 'sistema';
        const opt = {
            margin: [12, 12, 14, 12],
            filename: `cartilha_${name}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', scrollX: 0, scrollY: 0, windowWidth: 794 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['css', 'legacy'], avoid: ['table', 'tr', '.pdf-chart-img', '.cartilha-image', '.sheet-footer', '.sheet-grid'] }
        };

        const cleanup = () => wrapper.remove();
        html2pdf().set(opt).from(clone).save().then(cleanup).catch(cleanup);
    };

    // ===================================================================
    //  Create System – Builder
    // ===================================================================
    let builderLayers = []; // {compIndex, name, thickness}

    function initBuilder() {
        const select = document.getElementById('builderMaterial');
        if (!select || !dataManager.loaded) return;
        const components = dataManager.getComponents();
        // Keep existing options if already populated
        if (select.options.length > 1) return;
        components.forEach((c, i) => {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = componentLabel(c, i);
            select.appendChild(opt);
        });
        updateThicknessInputMode();
    }

    function componentLabel(c, i) {
        return tData(c.descricao || c.componente || c.nome || `Componente ${i + 1}`);
    }

    /**
     * Argamassa tem espessura pré-definida (2 / 2,5 / 3 cm) — o usuário escolhe
     * entre as opções em vez de digitar um valor livre.
     */
    const FIXED_THICKNESS_MATERIALS = ['argamassa'];

    function materialHasFixedThickness(name) {
        const lower = (name || '').toLowerCase();
        return FIXED_THICKNESS_MATERIALS.some(m => lower.includes(m));
    }

    window.builderMaterialChanged = function () { updateThicknessInputMode(); };

    function updateThicknessInputMode() {
        const select = document.getElementById('builderMaterial');
        const input = document.getElementById('builderThickness');
        const options = document.getElementById('builderThicknessOptions');
        if (!select || !input || !options) return;

        const comp = dataManager.getComponents()[parseInt(select.value)];
        const name = comp ? (comp.componente || comp.nome || '') : '';
        const fixed = materialHasFixedThickness(name);

        input.style.display = fixed ? 'none' : '';
        options.style.display = fixed ? '' : 'none';
    }

    function getBuilderThickness() {
        const input = document.getElementById('builderThickness');
        const options = document.getElementById('builderThicknessOptions');
        if (options && options.style.display !== 'none') return parseFloat(options.value);
        return parseFloat(input?.value);
    }

    // Re-render builder when language changes
    document.addEventListener('languageChanged', () => {
        // Re-populate dropdown with translated names
        const select = document.getElementById('builderMaterial');
        if (select && dataManager.loaded) {
            const savedVal = select.value;
            const components = dataManager.getComponents();
            // Clear all but first placeholder option
            while (select.options.length > 1) select.remove(1);
            components.forEach((c, i) => {
                const opt = document.createElement('option');
                opt.value = i;
                opt.textContent = componentLabel(c, i);
                select.appendChild(opt);
            });
            select.value = savedVal;
        }
        // Re-render layers and preview with translated names
        renderBuilderLayers();
        renderBuilderPreview();
    });

    window.builderAddLayer = function () {
        const matSelect = document.getElementById('builderMaterial');
        const thicknessInput = document.getElementById('builderThickness');
        const compIndex = parseInt(matSelect?.value);
        const thickness = getBuilderThickness();

        if (isNaN(compIndex) || compIndex < 0) return;
        if (isNaN(thickness) || thickness <= 0) { thicknessInput?.focus(); return; }

        const components = dataManager.getComponents();
        const comp = components[compIndex];
        if (!comp) return;

        builderLayers.push({
            compIndex,
            name: comp.componente || comp.nome || 'Camada',
            thickness,
            comp
        });

        matSelect.value = '';
        thicknessInput.value = '';
        updateThicknessInputMode();
        renderBuilderLayers();
        renderBuilderPreview();
    };

    window.builderRemoveLayer = function (idx) {
        builderLayers.splice(idx, 1);
        renderBuilderLayers();
        renderBuilderPreview();
    };

    window.builderMoveLayer = function (idx, dir) {
        const newIdx = idx + dir;
        if (newIdx < 0 || newIdx >= builderLayers.length) return;
        const temp = builderLayers[idx];
        builderLayers[idx] = builderLayers[newIdx];
        builderLayers[newIdx] = temp;
        renderBuilderLayers();
        renderBuilderPreview();
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
                    <span class="builder-layer-name">${tData(layer.name)}</span>
                    <span class="builder-layer-thick">${layer.thickness} cm</span>
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
        'argamassa': '#d4a574',
        'gesso': '#f5f0e8',
        'concreto': '#a0a0a0',
        'bloco de concreto': '#b0b0b0',
        'bloco cerâmico': '#c4725a',
        'cerâm': '#c4725a',
        'tijolo': '#b85c3a',
        'tinta': '#e8dcc8',
        'placa cimentícia': '#c0c0c0',
        'drywall': '#eee8d5',
        'gesso acartonado': '#eee8d5',
        'lã de vidro': '#e6d45a',
        'lã de rocha': '#8b7355',
        'eps': '#d0e8ff',
        'xps': '#a0d4ff',
        'poliuretano': '#ffe0a0',
        'steel frame': '#808080',
        'madeira': '#b8834e',
        'revestimento': '#d4a574'
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
        if (lower.includes('concreto maciço') || lower.includes('concreto') && !lower.includes('bloco')) return 'concrete';
        if (lower.includes('lã') || lower.includes('eps') || lower.includes('xps') || lower.includes('poliuretano')) return 'insulation';
        return 'solid';
    }

    function renderBuilderPreview(showFullResults) {
        const card = document.getElementById('builderPreviewCard');
        if (!card) return;

        if (builderLayers.length === 0) {
            card.innerHTML = `<div class="builder-preview-empty">${i18n.t('create.previewEmpty')}</div>`;
            return;
        }

        const systemName = document.getElementById('builderSystemName')?.value || i18n.t('create.namePlaceholder');
        const totalThickness = builderLayers.reduce((s, l) => s + l.thickness, 0);
        const { totals } = builderTotals();
        const gwp = totals.gwp;
        const ced = totals.ced;

        // Build visual wall section
        let wallHtml = `<div class="preview-wall">`;
        wallHtml += `<div class="preview-wall-label">${i18n.t('create.exterior')}</div>`;
        wallHtml += `<div class="preview-wall-layers">`;
        builderLayers.forEach((layer, i) => {
            const pct = Math.max((layer.thickness / totalThickness) * 100, 8);
            const color = getMaterialColor(layer.name);
            const pattern = getMaterialPattern(layer.name);
            wallHtml += `<div class="preview-layer preview-pattern-${pattern}" style="width:${pct}%;background-color:${color};" title="${tData(layer.name)} (${layer.thickness}cm)">
                <span class="preview-layer-label">${layer.thickness}</span>
            </div>`;
        });
        wallHtml += `</div>`;
        wallHtml += `<div class="preview-wall-label">${i18n.t('create.interior')}</div>`;
        wallHtml += `</div>`;

        // Legend
        let legendHtml = `<div class="preview-legend">`;
        builderLayers.forEach((layer, i) => {
            const color = getMaterialColor(layer.name);
            legendHtml += `<div class="preview-legend-item"><span class="preview-legend-swatch" style="background:${color};"></span>${tData(layer.name)} (${layer.thickness}cm)</div>`;
        });
        legendHtml += `</div>`;

        // System info card (like existing system cards)
        let infoHtml = `<div class="preview-info">
            <h4 class="preview-system-name">${systemName}</h4>
            <div class="preview-specs">
                <div class="spec-item"><span class="spec-label">${i18n.t('card.thickness')}:</span><span class="spec-value">${totalThickness.toFixed(1)} cm</span></div>
                <div class="spec-item"><span class="spec-label">GWP:</span><span class="spec-value">${formatScientific(gwp)} kg CO₂ eq</span></div>
                <div class="spec-item"><span class="spec-label">CED:</span><span class="spec-value">${formatScientific(ced)} MJ</span></div>
            </div>
        </div>`;

        // Resultado completo (exibido pelo botão "Calcular")
        let resultsHtml = '';
        if (showFullResults) {
            resultsHtml = `<div class="preview-results"><h5>${i18n.t('create.resultsTitle')}</h5><table class="cartilha-table"><thead><tr><th>${i18n.t('cartilha.indicator')}</th><th>${i18n.t('cartilha.value')}</th><th>${i18n.t('cartilha.unitCol')}</th></tr></thead><tbody>`;
            IMPACT_CATEGORIES.forEach(cat => {
                resultsHtml += `<tr><td>${impactFullLabel(cat)}</td><td>${formatScientific(totals[cat.key])}</td><td>${cat.unit}</td></tr>`;
            });
            resultsHtml += `<tr><td>${i18n.t('impact.ced')} (CED)</td><td>${formatScientific(totals.ced)}</td><td>MJ</td></tr>`;
            resultsHtml += `</tbody></table></div>`;
        }

        card.innerHTML = infoHtml + wallHtml + legendHtml + resultsHtml;
    }

    /** Soma os impactos das camadas montadas pelo usuário. */
    function builderTotals() {
        const totals = { gwp: 0, ap: 0, ep: 0, pocp: 0, odp: 0, adpf: 0, adpnf: 0, ced: 0 };
        const componentes = [];

        builderLayers.forEach(l => {
            const imp = l.comp?.Impactos || l.comp?.impactos || {};
            const ced = imp.ced || l.comp?.consumo?.total || 0;
            Object.keys(totals).forEach(k => {
                if (k === 'ced') totals.ced += ced;
                else totals[k] += imp[k] || 0;
            });
            componentes.push({
                componente: l.name,
                espessura: l.thickness,
                consumo_componente: ced,
                gwp: imp.gwp || 0, ap: imp.ap || 0, ep: imp.ep || 0,
                pocp: imp.pocp || 0, odp: imp.odp || 0,
                adpf: imp.adpf || 0, adpnf: imp.adpnf || 0
            });
        });

        return { totals, componentes, espessura: builderLayers.reduce((s, l) => s + l.thickness, 0) };
    }

    /** Botão "Calcular": mostra o resultado completo do sistema montado. */
    window.builderCalculate = function () {
        if (builderLayers.length === 0) {
            showAlert('error', i18n.t('create.errorNoLayers'));
            return;
        }
        renderBuilderPreview(true);
        document.getElementById('builderPreviewCard')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    /** Cria o objeto de sistema a partir das camadas montadas. */
    function buildCustomSystem(name) {
        const { totals, componentes, espessura } = builderTotals();
        return {
            nome: name,
            tipo: 'Personalizado',
            transmitancia: null,
            capacidade_termica: null,
            identificacao: {
                descricao: { peso: null, espessura: Number(espessura.toFixed(1)), sistema_leve: false, isolante_termico: false },
                camadas: builderLayers.map(l => `${l.name} (${l.thickness}cm)`),
                unidade: '1m²',
                fronteira: 'Fase de produção (A1-3)',
                validade: new Date().toLocaleDateString()
            },
            impactos: {
                gwp: totals.gwp, ap: totals.ap, ep: totals.ep,
                pocp: totals.pocp, odp: totals.odp, adpf: totals.adpf, adpnf: totals.adpnf
            },
            consumo: { total: totals.ced, componentes },
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
            renderBuilderLayers();
            renderBuilderPreview();
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
