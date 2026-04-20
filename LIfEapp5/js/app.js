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
        document.getElementById('finderSection').style.display = method ? 'none' : 'block';

        // Reset results
        const thermalRes = document.getElementById('thermalComparisonResults');
        const groupRes = document.getElementById('groupComparisonResults');
        if (thermalRes) thermalRes.style.display = 'none';
        if (groupRes) groupRes.style.display = 'none';

        // Highlight selected method card
        document.querySelectorAll('.compare-method-card').forEach(c => c.classList.remove('active'));
        if (method === 'thermal') document.getElementById('methodThermal')?.classList.add('active');
        if (method === 'groups') {
            document.getElementById('methodGroups')?.classList.add('active');
            selectGroupApproach('individual');
            renderCompareSystemGrid();
        }
    };

    window.selectGroupApproach = function (approach) {
        groupApproach = approach;
        document.getElementById('subpanelIndividual').style.display = approach === 'individual' ? 'block' : 'none';
        document.getElementById('subpanelAll').style.display = approach === 'all' ? 'block' : 'none';
        document.getElementById('approachIndividual')?.classList.toggle('active', approach === 'individual');
        document.getElementById('approachAll')?.classList.toggle('active', approach === 'all');
        const groupRes = document.getElementById('groupComparisonResults');
        if (groupRes) groupRes.style.display = 'none';
    };

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
        if (!skipScroll) resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    function buildThermalTable(systems, norm, normName, numZones, evaluateFn) {
        let html = `<h3 style="text-align:center;margin:2rem 0 1rem;">${i18n.t('compare.thermalResultsTitle')} — ${normName}</h3>`;
        html += `<div class="thermal-results-table"><table><thead><tr><th>${i18n.t('compare.system')}</th><th>U (W/m²K)</th><th>CT (kJ/m²K)</th>`;
        for (let z = 1; z <= numZones; z++) html += `<th>${i18n.t('compare.zone')} ${z}</th>`;
        html += `</tr></thead><tbody>`;

        systems.forEach(sys => {
            html += `<tr><td class="system-name-cell">${tData(sys.nome)}</td><td>${sys.transmitancia?.toFixed(2) || '—'}</td><td>${sys.capacidade_termica?.toFixed(0) || '—'}</td>`;
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
            html += `<tr><td class="system-name-cell">${tData(sys.nome)}</td><td>${sys.transmitancia?.toFixed(2) || '—'}</td><td>${sys.capacidade_termica?.toFixed(0) || '—'}</td>`;
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
            html += `<tr><td class="system-name-cell">${tData(sys.nome)}</td><td>${sys.transmitancia?.toFixed(2) || '—'}</td>`;
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
        const yes = i18n.t('detail.yes');
        const no = i18n.t('detail.no');

        let html = `<h2 class="modal-title">${tData(system.nome)}</h2>`;

        // Identification
        html += `<div class="detail-section"><h3>${i18n.t('detail.identification')}</h3><div class="detail-grid">`;
        html += `<div class="detail-item"><strong>${i18n.t('detail.boundary')}:</strong> ${tData(system.identificacao?.fronteira) || '—'}</div>`;
        html += `<div class="detail-item"><strong>${i18n.t('detail.unit')}:</strong> ${tData(system.identificacao?.unidade) || '—'}</div>`;
        html += `<div class="detail-item"><strong>${i18n.t('detail.weight')}:</strong> ${desc.peso?.toFixed(1) || '—'} kg/m²</div>`;
        html += `<div class="detail-item"><strong>${i18n.t('detail.thickness')}:</strong> ${desc.espessura || '—'} cm</div>`;
        html += `<div class="detail-item"><strong>${i18n.t('detail.lightweight')}:</strong> ${desc.sistema_leve ? yes : no}</div>`;
        html += `<div class="detail-item"><strong>${i18n.t('detail.insulation')}:</strong> ${desc.isolante_termico ? yes : no}</div>`;
        html += `</div></div>`;

        // Layers
        if (layers.length) {
            html += `<div class="detail-section"><h3>${i18n.t('detail.layers')}</h3><ol class="layers-list">${layers.map(l => `<li>${tData(l)}</li>`).join('')}</ol></div>`;
        }

        // Thermal properties
        html += `<div class="detail-section"><h3>${i18n.t('detail.thermalProps')}</h3><div class="detail-grid">`;
        html += `<div class="detail-item"><strong>${i18n.t('detail.thermalTransmittance')}:</strong> ${system.transmitancia?.toFixed(2) || '—'} W/m²K</div>`;
        html += `<div class="detail-item"><strong>${i18n.t('detail.thermalCapacity')}:</strong> ${system.capacidade_termica?.toFixed(0) || '—'} kJ/m²K</div>`;
        html += `</div></div>`;

        // Environmental impacts
        html += `<div class="detail-section"><h3>${i18n.t('detail.envImpacts')}</h3><div class="impacts-table">`;
        const impactLabels = { gwp: 'GWP (kg CO₂ eq)', ap: 'AP (kg SO₂ eq)', ep: 'EP (kg PO₄ eq)', pocp: 'POCP (kg C₂H₄ eq)', odp: 'ODP (kg CFC-11 eq)', adpf: 'ADP-f (MJ)', adpnf: 'ADP-nf (kg Sb eq)' };
        for (const [key, label] of Object.entries(impactLabels)) {
            html += `<div class="impact-row"><span>${label}</span><span>${formatScientific(imp[key])}</span></div>`;
        }
        html += `</div></div>`;

        // Energy consumption
        html += `<div class="detail-section"><h3>${i18n.t('detail.energyConsumption')}</h3>`;
        html += `<div class="total-row"><strong>${i18n.t('detail.total')}: ${formatScientific(system.consumo?.total)} MJ</strong></div>`;
        if (comps.length) {
            html += `<div class="components-table"><div class="component-header"><span>${i18n.t('detail.component')}</span><span>CED (MJ)</span><span>GWP (kg CO₂ eq)</span></div>`;
            comps.forEach(c => {
                html += `<div class="component-row"><span>${tData(c.componente)}</span><span>${formatScientific(c.consumo_componente)}</span><span>${formatScientific(c.gwp)}</span></div>`;
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
    function showComparison(skipScroll) {
        if (selectedSystems.length < 2) return;

        lastGroupResultType = 'individual';

        const systems = selectedSystems.map(i => dataManager.systems[i]).filter(Boolean);
        const resultsDiv = document.getElementById('groupComparisonResults');
        if (!resultsDiv) return;
        resultsDiv.style.display = 'block';

        let html = `<h3>${i18n.t('compare.results')}</h3>`;
        html += createComparisonTable(systems);
        html += `<div class="comparison-charts">${createComparisonCharts(systems, 'ind')}</div>`;
        html += createStandardsComplianceTable(systems);
        resultsDiv.innerHTML = html;

        // Render charts after DOM is ready
        setTimeout(() => {
            renderBarCharts(systems, 'ind');
        }, 100);

        if (!skipScroll) {
            resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Save comparison to history
            if (isLoggedIn()) {
                saveUserComparison(getCurrentUser(), { systems: systems.map(s => s.nome) });
                displayUserComparisons();
            }
        }
    }

    function createComparisonTable(systems) {
        const props = [
            { key: 'transmitancia', label: `${i18n.t('detail.thermalTransmittance')}`, unit: 'W/m²K', lower: true },
            { key: 'capacidade_termica', label: `${i18n.t('detail.thermalCapacity')}`, unit: 'kJ/m²K', lower: false },
            { key: 'peso', label: `${i18n.t('detail.weight')} (kg/m²)`, unit: '', lower: true, path: 'identificacao.descricao.peso' },
            { key: 'espessura', label: `${i18n.t('detail.thickness')} (cm)`, unit: '', lower: true, path: 'identificacao.descricao.espessura' },
            { key: 'gwp', label: 'GWP (kg CO₂ eq)', unit: '', lower: true, path: 'impactos.gwp' },
            { key: 'ap', label: 'AP (kg SO₂ eq)', unit: '', lower: true, path: 'impactos.ap' },
            { key: 'ep', label: 'EP (kg PO₄ eq)', unit: '', lower: true, path: 'impactos.ep' },
            { key: 'pocp', label: 'POCP (kg C₂H₄ eq)', unit: '', lower: true, path: 'impactos.pocp' },
            { key: 'odp', label: 'ODP (kg CFC-11 eq)', unit: '', lower: true, path: 'impactos.odp' },
            { key: 'ced', label: 'CED (MJ)', unit: '', lower: true, path: 'consumo.total' }
        ];

        let html = `<div class="comparison-table" style="--compare-cols: ${systems.length}">`;
        // Header with clickable system names and descriptions
        html += `<div class="comparison-row header" style="grid-template-columns: 1.5fr repeat(${systems.length}, 1fr)"><div class="comparison-cell">${i18n.t('compare.property')}</div>`;
        systems.forEach(s => {
            const idx = dataManager.systems.indexOf(s);
            const typeClass = getTypeClass(s);
            const desc = s.identificacao?.descricao || {};
            const layers = (s.identificacao?.camadas || []).map(l => tData(l)).join(', ');
            html += `<div class="comparison-cell system-header-cell ${typeClass}-header">
                <a href="#" class="system-name-link" onclick="event.preventDefault(); showSystemDetail(${idx})">${tData(s.nome)}</a>
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

            html += `<div class="comparison-row" style="grid-template-columns: 1.5fr repeat(${systems.length}, 1fr)"><div class="comparison-cell">${prop.label}</div>`;
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

    function createComparisonCharts(systems, prefix) {
        // Placeholder canvases – will be rendered in renderBarCharts
        return `
            <h4>${i18n.t('compare.chartsTitle')}</h4>
            <canvas id="chartGWP_${prefix}" height="200"></canvas>
            <canvas id="chartEnergy_${prefix}" height="200"></canvas>
            <canvas id="chartAP_${prefix}" height="200"></canvas>
        `;
    }

    function renderBarCharts(systems, prefix) {
        const labels = systems.map(s => tData(s.nome));

        // GWP Chart
        const ctxGWP = document.getElementById(`chartGWP_${prefix}`);
        if (ctxGWP) {
            new Chart(ctxGWP, {
                type: 'bar',
                data: { labels, datasets: [{ label: 'GWP (kg CO₂ eq)', data: systems.map(s => s.impactos?.gwp || 0), backgroundColor: chartColors.concat(chartColors).slice(0, systems.length) }] },
                options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true }, x: { ticks: { maxRotation: 90, minRotation: 45, font: { size: 10 } } } } }
            });
        }

        // CED Chart
        const ctxCED = document.getElementById(`chartEnergy_${prefix}`);
        if (ctxCED) {
            new Chart(ctxCED, {
                type: 'bar',
                data: { labels, datasets: [{ label: 'CED (MJ)', data: systems.map(s => s.consumo?.total || 0), backgroundColor: chartColors.concat(chartColors).slice(0, systems.length) }] },
                options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true }, x: { ticks: { maxRotation: 90, minRotation: 45, font: { size: 10 } } } } }
            });
        }

        // AP Chart
        const ctxAP = document.getElementById(`chartAP_${prefix}`);
        if (ctxAP) {
            new Chart(ctxAP, {
                type: 'bar',
                data: { labels, datasets: [{ label: 'AP (kg SO₂ eq)', data: systems.map(s => s.impactos?.ap || 0), backgroundColor: chartColors.concat(chartColors).slice(0, systems.length) }] },
                options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true }, x: { ticks: { maxRotation: 90, minRotation: 45, font: { size: 10 } } } } }
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

        titulo.textContent = `${i18n.t('cartilha.title')} – ${tData(system.nome)}`;
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
        const yes = i18n.t('detail.yes');
        const no = i18n.t('detail.no');

        let html = '';

        // Logos header
        html += `<div class="cartilha-logos-row"><img src="assets/logo_ufrgs.png" alt="UFRGS" class="cartilha-inline-logo"><img src="assets/logo_e3build.png?v=20260413d" alt="E³ Build" class="cartilha-inline-logo"><img src="assets/logo_life.png" alt="LIfE" class="cartilha-inline-logo"></div>`;

        // Image
        if (system.imagem) {
            html += `<img src="${system.imagem}" alt="${tData(system.nome)}" class="cartilha-image">`;
        }

        // 1. Identification
        html += `<h3>${i18n.t('cartilha.identification')}</h3>`;
        html += `<p><strong>${i18n.t('cartilha.system')}:</strong> ${tData(system.nome)}</p>`;
        html += `<p><strong>${i18n.t('cartilha.boundary')}:</strong> ${tData(system.identificacao?.fronteira) || '—'}</p>`;
        html += `<p><strong>${i18n.t('cartilha.functionalUnit')}:</strong> ${tData(system.identificacao?.unidade) || '—'}</p>`;
        html += `<p><strong>${i18n.t('cartilha.weight')}:</strong> ${desc.peso?.toFixed(1) || '—'} kg/m²</p>`;
        html += `<p><strong>${i18n.t('cartilha.totalThickness')}:</strong> ${desc.espessura || '—'} cm</p>`;
        html += `<p><strong>${i18n.t('cartilha.lightweight')}:</strong> ${desc.sistema_leve ? yes : no}</p>`;
        html += `<p><strong>${i18n.t('cartilha.insulation')}:</strong> ${desc.isolante_termico ? yes : no}</p>`;

        // Layers
        html += `<h4>${i18n.t('cartilha.composition')}</h4>`;
        html += `<ol>${layers.map(l => `<li>${tData(l)}</li>`).join('')}</ol>`;

        // 2. Thermal Performance
        html += `<h3>${i18n.t('cartilha.thermalPerf')}</h3>`;
        html += `<table class="cartilha-table"><thead><tr><th>${i18n.t('cartilha.property')}</th><th>${i18n.t('cartilha.value')}</th><th>${i18n.t('cartilha.unitCol')}</th></tr></thead><tbody>`;
        html += `<tr><td>${i18n.t('cartilha.thermalTransmittance')}</td><td>${system.transmitancia?.toFixed(2) || '—'}</td><td>W/(m²·K)</td></tr>`;
        html += `<tr><td>${i18n.t('cartilha.thermalCapacity')}</td><td>${system.capacidade_termica?.toFixed(0) || '—'}</td><td>kJ/(m²·K)</td></tr>`;
        html += `</tbody></table>`;

        // 3. Environmental Impacts
        html += `<h3>${i18n.t('cartilha.envImpacts')}</h3>`;
        html += `<table class="cartilha-table"><thead><tr><th>${i18n.t('cartilha.indicator')}</th><th>${i18n.t('cartilha.value')}</th><th>${i18n.t('cartilha.unitCol')}</th></tr></thead><tbody>`;
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
        html += `<h3>${i18n.t('cartilha.energyCED')}</h3>`;
        html += `<p><strong>${i18n.t('cartilha.total')}:</strong> ${formatScientific(system.consumo?.total)} MJ</p>`;
        if (comps.length) {
            html += `<table class="cartilha-table"><thead><tr><th>${i18n.t('cartilha.component')}</th><th>CED (MJ)</th><th>GWP (kg CO₂ eq)</th><th>AP (kg SO₂ eq)</th></tr></thead><tbody>`;
            comps.forEach(c => {
                html += `<tr><td>${tData(c.componente)}</td><td>${formatScientific(c.consumo_componente)}</td><td>${formatScientific(c.gwp)}</td><td>${formatScientific(c.ap)}</td></tr>`;
            });
            html += `</tbody></table>`;
        }

        // Chart canvases
        html += `<h3>${i18n.t('cartilha.charts')}</h3>`;
        html += `<h4>${i18n.t('cartilha.chartSubtitle')}</h4>`;
        html += `<canvas id="cartilhaChartGWP" height="250"></canvas>`;
        html += `<canvas id="cartilhaChartCED" height="250"></canvas>`;

        // 6. Standards compliance
        html += `<h3>${i18n.t('cartilha.standards')}</h3>`;
        html += buildCartilhaStandards(system, regs);

        return html;
    }

    function buildCartilhaStandards(system, regs) {
        const passLabel = i18n.t('cartilha.pass');
        const failLabel = i18n.t('cartilha.fail');
        let html = `<table class="cartilha-table"><thead><tr><th>${i18n.t('cartilha.standard')}</th><th>${i18n.t('cartilha.zone')}</th><th>${i18n.t('cartilha.result')}</th></tr></thead><tbody>`;

        // NBR
        if (regs?.nbr15575) {
            for (let z = 1; z <= 8; z++) {
                const pass = evaluateNBR(system, regs.nbr15575, z);
                html += `<tr><td>NBR 15575</td><td>${i18n.t('cartilha.zone')} ${z}</td><td style="color:${pass ? 'var(--success-500)' : 'var(--error-500)'}">${pass ? passLabel : failLabel}</td></tr>`;
            }
        }

        // ASHRAE residential
        if (regs?.ashrae_residential) {
            const ashraeResShort = i18n.getLang() === 'en' ? 'ASHRAE 90.1 Res.' : 'ASHRAE 90.1 Res.';
            regs.ashrae_residential.zonas?.forEach(zona => {
                const isSF = system.identificacao?.descricao?.sistema_leve === true;
                const maxU = isSF ? (zona.transmitancia_maxima?.steel_frame || zona.transmitancia_maxima?.wall_mass || 999) : (zona.transmitancia_maxima?.wall_mass || 999);
                const pass = system.transmitancia <= maxU;
                html += `<tr><td>${ashraeResShort}</td><td>${i18n.t('cartilha.zone')} ${zona.zona}</td><td style="color:${pass ? 'var(--success-500)' : 'var(--error-500)'}">${pass ? passLabel : failLabel}</td></tr>`;
            });
        }

        // ASHRAE commercial
        if (regs?.ashrae_commercial) {
            const ashraeComShort = i18n.getLang() === 'en' ? 'ASHRAE 90.1 Com.' : 'ASHRAE 90.1 Com.';
            regs.ashrae_commercial.zonas?.forEach(zona => {
                const isSF = system.identificacao?.descricao?.sistema_leve === true;
                const maxU = isSF ? (zona.transmitancia_maxima?.steel_frame || zona.transmitancia_maxima?.wall_mass || 999) : (zona.transmitancia_maxima?.wall_mass || 999);
                const pass = system.transmitancia <= maxU;
                html += `<tr><td>${ashraeComShort}</td><td>${i18n.t('cartilha.zone')} ${zona.zona}</td><td style="color:${pass ? 'var(--success-500)' : 'var(--error-500)'}">${pass ? passLabel : failLabel}</td></tr>`;
            });
        }

        html += `</tbody></table>`;
        return html;
    }

    function createCartilhaCharts(system) {
        const comps = system.consumo?.componentes || [];
        if (!comps.length) return;

        const labels = comps.map(c => tData(c.componente));
        const gwpChartTitle = i18n.getLang() === 'en' ? 'GWP per Component (kg CO₂ eq)' : 'GWP por Componente (kg CO₂ eq)';
        const cedChartTitle = i18n.getLang() === 'en' ? 'CED per Component (MJ)' : 'CED por Componente (MJ)';

        // GWP Pie/Doughnut
        const ctxGWP = document.getElementById('cartilhaChartGWP');
        if (ctxGWP) {
            new Chart(ctxGWP, {
                type: 'doughnut',
                data: { labels, datasets: [{ data: comps.map(c => c.gwp || 0), backgroundColor: chartColors }] },
                options: { responsive: true, plugins: { title: { display: true, text: gwpChartTitle } } }
            });
        }

        // CED Pie/Doughnut
        const ctxCED = document.getElementById('cartilhaChartCED');
        if (ctxCED) {
            new Chart(ctxCED, {
                type: 'doughnut',
                data: { labels, datasets: [{ data: comps.map(c => c.consumo_componente || 0), backgroundColor: chartColors }] },
                options: { responsive: true, plugins: { title: { display: true, text: cedChartTitle } } }
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
            opt.textContent = tData(c.componente || c.nome || `Componente ${i + 1}`);
            select.appendChild(opt);
        });
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
                opt.textContent = tData(c.componente || c.nome || `Componente ${i + 1}`);
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
        const thickness = parseFloat(thicknessInput?.value);

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

    function renderBuilderPreview() {
        const card = document.getElementById('builderPreviewCard');
        if (!card) return;

        if (builderLayers.length === 0) {
            card.innerHTML = `<div class="builder-preview-empty">${i18n.t('create.previewEmpty')}</div>`;
            return;
        }

        const systemName = document.getElementById('builderSystemName')?.value || i18n.t('create.namePlaceholder');
        const totalThickness = builderLayers.reduce((s, l) => s + l.thickness, 0);

        // Calculate impacts from layers
        let gwp = 0, ced = 0;
        builderLayers.forEach(l => {
            gwp += l.comp?.Impactos?.gwp || l.comp?.impactos?.gwp || 0;
            ced += l.comp?.Impactos?.ced || l.comp?.consumo?.total || 0;
        });

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

        card.innerHTML = infoHtml + wallHtml + legendHtml;
    }

    window.builderSave = function () {
        requireLogin(() => {
            const currentUser = getCurrentUser();
            if (!currentUser) return;

            const name = document.getElementById('builderSystemName')?.value?.trim();
            if (!name) { showAlert('error', 'Digite um nome para o sistema.'); return; }
            if (builderLayers.length === 0) { showAlert('error', 'Adicione pelo menos uma camada.'); return; }

            let gwp = 0, ap = 0, ep = 0, pocp = 0, odp = 0, ced = 0;
            const totalThickness = builderLayers.reduce((s, l) => s + l.thickness, 0);
            const compList = [];

            builderLayers.forEach(l => {
                const imp = l.comp?.Impactos || l.comp?.impactos || {};
                gwp += imp.gwp || 0;
                ap += imp.ap || 0;
                ep += imp.ep || 0;
                pocp += imp.pocp || 0;
                odp += imp.odp || 0;
                ced += imp.ced || l.comp?.consumo?.total || 0;
                compList.push({ componente: l.name, espessura: l.thickness });
            });

            const system = {
                nome: name,
                tipo: 'Personalizado',
                transmitancia: null,
                capacidade_termica: null,
                identificacao: {
                    descricao: { peso: null, espessura: totalThickness, sistema_leve: false, isolante_termico: false },
                    camadas: builderLayers.map(l => `${l.name} (${l.thickness}cm)`),
                    unidade: 'm²',
                    fronteira: 'Sistema Personalizado',
                    validade: new Date().toLocaleDateString()
                },
                impactos: { gwp, ap, ep, pocp, odp },
                consumo: { total: ced, componentes: compList },
                custom: true
            };

            const saved = saveUserSystem(currentUser, system);
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
        });
    };

    window.builderCompare = function () {
        if (builderLayers.length === 0) return;
        // Save first, then navigate to compare
        builderSave();
        setTimeout(() => navigateTo('compare'), 300);
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
