/**
 * BE³ Build — "Crie e Avalie": cálculo térmico da parede montada e verificação normativa.
 *
 * Cálculo: motor BE3_Motor_Calculo_V1_2.js (calcularSistemaHeterogeneo), com as camadas da aba
 * "Prop. térmicas crie e calcule" ligadas em série (caminho único, fração de área 1) — mesma
 * ligação feita por BE3_Prop_Termicas_CrieCalcule.js, adaptada para o navegador.
 *
 * Regras: documento "Levantamento de requisitos normativos" (NBR 15575-4:2025, INI-C, INI-R,
 * RTQ-C, RTQ-R e ASHRAE 90.1-2025 — Walls, above grade).
 */
(function () {
    'use strict';

    const { Rsi, Rse } = SUPERFICIES.paredeExternaFluxoHorizontal;

    // NBR 15220-2 (projeto ago/2021), Tabela 8: [espessura mm, R m²K/W], alta emissividade, fluxo horizontal
    const TABELA8_HORIZONTAL = [[0, 0], [5, 0.10], [7, 0.12], [10, 0.14], [15, 0.15], [25, 0.16], [50, 0.16], [100, 0.16], [300, 0.16]];

    function resistenciaCamaraAr(eM) {
        const mm = eM * 1000;
        const ultimo = TABELA8_HORIZONTAL[TABELA8_HORIZONTAL.length - 1][0];
        if (mm < 0 || mm > ultimo) throw new Error(`Câmara de ar fora da Tabela 8 (0-${ultimo} mm): ${mm} mm`);
        for (let i = 1; i < TABELA8_HORIZONTAL.length; i++) {
            const [x1, y1] = TABELA8_HORIZONTAL[i];
            if (mm <= x1) {
                const [x0, y0] = TABELA8_HORIZONTAL[i - 1];
                return y0 + (y1 - y0) * (mm - x0) / (x1 - x0);
            }
        }
    }

    function normalizar(s) {
        return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    const ehAr = l => l.camaraAr || normalizar(l.material).includes('camara de ar');

    // Camada da planilha -> camada do motor ({R} ou {R, espessura, rho, c})
    function camadaParaMotor(l) {
        const R = l.camaraAr ? resistenciaCamaraAr(l.e_m) : l.e_m / l.lambda;
        return l.rho && l.c && !l.camaraAr ? { R, espessura: l.e_m, rho: l.rho, c: l.c } : { R };
    }

    /**
     * Calcula U, RT e CT da parede (componentes na ordem exterior → interior).
     * Retorna também a memória de cálculo por camada e avisos ({tipo, componente, material, valor}).
     */
    function calcularParede(componentes) {
        const avisos = [];
        const linhas = [];
        const naoCalculaveis = [];

        componentes.forEach(comp => {
            const t = comp.termico || {};
            if (t.calculavel === false) { naoCalculaveis.push(comp); avisos.push({ tipo: 'naoCalculavel', componente: comp.nome }); return; }
            if (!t.incluir) { avisos.push({ tipo: 'naoEntra', componente: comp.nome }); return; }
            t.camadas.forEach(l => {
                if (!l.camaraAr && !(l.lambda > 0)) throw new Error(`"${l.material}": condutividade ausente`);
                const m = camadaParaMotor(l);
                if (!ehAr(l) && !(l.rho && l.c)) avisos.push({ tipo: 'semMassa', componente: comp.nome, material: l.material });
                if (l.c != null && l.c < 0.3) avisos.push({ tipo: 'calorIncomum', componente: comp.nome, material: l.material, valor: l.c });
                linhas.push({
                    componente: comp.nome,
                    material: l.material,
                    e_m: l.e_m,
                    lambda: l.lambda,
                    rho: l.rho,
                    c: l.c,
                    camaraAr: !!l.camaraAr,
                    ar: ehAr(l),
                    R: m.R,
                    ct: m.espessura ? m.espessura * m.rho * m.c : 0,
                    motor: m
                });
            });
        });

        const espessuraCm = componentes.reduce((s, c) => s + (c.espessura_cm || 0), 0);
        const massaLinhas = linhas.filter(l => l.rho && !l.ar);
        const massa = massaLinhas.reduce((s, l) => s + l.e_m * l.rho, 0);
        const eMassa = massaLinhas.reduce((s, l) => s + l.e_m, 0);
        const base = { Rsi, Rse, linhas, avisos, espessuraCm, massa, densidadeMedia: eMassa ? massa / eMassa : null };

        if (naoCalculaveis.length || !linhas.length) {
            return { ...base, calculavel: false, RT: null, U: null, CT: null };
        }

        const motor = linhas.map(l => l.motor);
        const geometria = {
            caminhos: [{ id: 'serie', fracaoArea: 1, camadas: motor }],
            fatias: motor.map(m => ({ espessura: m.espessura || 0, secoes: [{ fracaoArea: 1, R: m.R }] }))
        };
        const r = calcularSistemaHeterogeneo(geometria, Rsi, Rse);
        const ctCompleta = linhas.every(l => l.ar || (l.rho && l.c));
        return { ...base, calculavel: true, RT: r.RT, U: r.U, CT: ctCompleta ? r.CT : null, resultadoMotor: r };
    }

    // ------------------------------------------------------------------
    //  Regras normativas
    // ------------------------------------------------------------------
    const ZONAS_BR = [1, 2, 3, 4, 5, 6, 7, 8];
    const porZona = fn => Object.fromEntries(ZONAS_BR.map(z => [z, fn(z)]));
    const Umax = max => ({ p: 'U', max });
    const CTmin = min => ({ p: 'CT', min });
    const faixa = (p, min, max) => ({ p, min, max });
    // RTQ-C, ZB 7 e 8: o limite de U depende da capacidade térmica da parede
    const UporCT = { p: 'U', porCT: { ref: 80, ateRef: 2.5, acimaRef: 3.7 } };

    /**
     * Cada norma: id, rótulo, variante (chave i18n), fonte (chave i18n) e critérios por zona.
     * Zona sem critérios definidos no documento = null ("—").
     */
    const NORMAS_BR = [
        { id: 'nbr15575-a1', norma: 'NBR 15575-4:2025', variante: 'alphaLow', fonte: 'nbr15575',
          zonas: porZona(z => z <= 2 ? [Umax(2.7), CTmin(130)] : z <= 4 ? [Umax(3.7), CTmin(130)] : z <= 6 ? [Umax(3.7)] : null) },
        { id: 'nbr15575-a2', norma: 'NBR 15575-4:2025', variante: 'alphaHigh', fonte: 'nbr15575',
          zonas: porZona(z => z <= 2 ? [Umax(2.7), CTmin(130)] : z <= 4 ? [Umax(2.5), CTmin(130)] : z <= 6 ? [Umax(2.5)] : null) },
        { id: 'inic-art', norma: 'INI-C', variante: 'inicArtificial', fonte: 'inicArtificial',
          zonas: porZona(() => [faixa('U', 0.25, 5.0), faixa('CT', 0, 400)]) },
        { id: 'inic-nat', norma: 'INI-C', variante: 'inicNatural', fonte: 'inicNatural',
          zonas: porZona(() => [faixa('U', 0.1, 5.0), faixa('CT', 40, 500)]) },
        { id: 'inir', norma: 'INI-R', variante: 'inir', fonte: 'inir',
          zonas: porZona(() => [faixa('U', 0.24, 4.40), faixa('CT', 26, 440)]) },
        { id: 'rtqc-a', norma: 'RTQ-C', variante: 'levelA', fonte: 'rtqc',
          zonas: porZona(z => z <= 2 ? [Umax(1.0)] : z <= 6 ? [Umax(3.7)] : [UporCT]) },
        { id: 'rtqc-b', norma: 'RTQ-C', variante: 'levelB', fonte: 'rtqc',
          zonas: porZona(z => z <= 2 ? [Umax(2.0)] : z <= 6 ? [Umax(3.7)] : [UporCT]) },
        { id: 'rtqc-cd', norma: 'RTQ-C', variante: 'levelCD', fonte: 'rtqc',
          zonas: porZona(z => z <= 6 ? [Umax(3.7)] : [UporCT]) },
        { id: 'rtqr-a1', norma: 'RTQ-R', variante: 'alphaLow', fonte: 'rtqr',
          zonas: porZona(z => [z <= 2 ? Umax(2.5) : Umax(3.7), ...(z <= 7 ? [CTmin(130)] : [])]) },
        { id: 'rtqr-a2', norma: 'RTQ-R', variante: 'alphaHigh', fonte: 'rtqr',
          zonas: porZona(z => [Umax(2.5), ...(z <= 7 ? [CTmin(130)] : [])]) }
    ];

    // ASHRAE 90.1-2025 (SI), Tabelas 5.5-0 a 5.5-8 — Walls, above grade — U máximo da montagem [W/(m²·K)]
    const ZONAS_ASHRAE = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const ASHRAE_U = {
        mass:  { nr: [3.293, 3.293, 0.857, 0.592, 0.592, 0.505, 0.432, 0.380, 0.261],
                 res: [0.857, 0.857, 0.591, 0.592, 0.505, 0.432, 0.380, 0.380, 0.261] },
        steel: { nr: [0.670, 0.670, 0.460, 0.426, 0.358, 0.301, 0.273, 0.273, 0.199],
                 res: [0.670, 0.670, 0.350, 0.358, 0.358, 0.301, 0.273, 0.233, 0.199] },
        wood:  { nr: [0.504, 0.504, 0.470, 0.470, 0.358, 0.278, 0.278, 0.278, 0.165],
                 res: [0.504, 0.504, 0.470, 0.358, 0.358, 0.278, 0.278, 0.278, 0.165] }
    };
    // Definição de "mass wall" da ASHRAE 90.1 (SI): HC ≥ 143 kJ/(m²·K), ou HC ≥ 102 kJ/(m²·K) com massa específica ≤ 1920 kg/m³
    const ASHRAE_MASSA = { hc: 143, hcLeve: 102, densidadeMax: 1920 };
    const NORMAS_ASHRAE = [
        { id: 'ashrae-nr', norma: 'ASHRAE 90.1-2025', variante: 'nonResidential', chave: 'nr' },
        { id: 'ashrae-res', norma: 'ASHRAE 90.1-2025', variante: 'residential', chave: 'res' }
    ];

    function classeAshrae(componentes, calc) {
        if (componentes.some(c => normalizar(c.nome).includes('perfil de aco'))) return 'steel';
        const hc = calc.CT;
        if (hc != null && (hc >= ASHRAE_MASSA.hc ||
            (hc >= ASHRAE_MASSA.hcLeve && calc.densidadeMedia != null && calc.densidadeMedia <= ASHRAE_MASSA.densidadeMax))) {
            return 'mass';
        }
        return 'wood';
    }

    /** true/false; null quando falta o valor necessário. */
    function avaliarCriterio(c, U, CT) {
        const v = c.p === 'U' ? U : CT;
        if (v == null) return null;
        if (c.porCT) {
            if (CT == null) return null;
            return v <= (CT > c.porCT.ref ? c.porCT.acimaRef : c.porCT.ateRef);
        }
        if (c.min != null && v < c.min) return false;
        if (c.max != null && v > c.max) return false;
        return true;
    }

    /** Status de uma lista de critérios: 'atende' | 'naoAtende' | 'na'. */
    function avaliarZona(criterios, U, CT) {
        if (!criterios) return 'na';
        const r = criterios.map(c => avaliarCriterio(c, U, CT));
        if (r.some(x => x === false)) return 'naoAtende';
        if (r.some(x => x === null)) return 'na';
        return 'atende';
    }

    function avaliarNormas(componentes, calc) {
        const U = calc.U;
        const CT = calc.CT;
        const brasil = NORMAS_BR.map(n => ({
            ...n,
            resultados: Object.fromEntries(ZONAS_BR.map(z => [z, avaliarZona(n.zonas[z], U, CT)]))
        }));
        const classe = classeAshrae(componentes, calc);
        const ashrae = NORMAS_ASHRAE.map(n => ({
            ...n,
            resultados: Object.fromEntries(ZONAS_ASHRAE.map(z => {
                const max = ASHRAE_U[classe][n.chave][z];
                return [z, avaliarZona([Umax(max)], U, CT)];
            }))
        }));
        return { brasil, ashrae, classeAshrae: classe };
    }

    window.CrieCalcule = {
        Rsi, Rse, TABELA8_HORIZONTAL, resistenciaCamaraAr,
        calcularParede, avaliarNormas, classeAshrae,
        NORMAS_BR, NORMAS_ASHRAE, ZONAS_BR, ZONAS_ASHRAE, ASHRAE_U, ASHRAE_MASSA
    };
})();
