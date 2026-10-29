/**
 * BE3 Build - Motor de cálculo térmico (versão 1.2 / Com Capacidade Térmica Heterogênea)
 * Escopo: paredes verticais, fluxo horizontal, camadas homogêneas e sistemas heterogêneos.
 * Referência de método: ABNT NBR 15220-2:2022.
 */
'use strict';

const SUPERFICIES = Object.freeze({
    paredeExternaFluxoHorizontal: Object.freeze({ Rsi: 0.13, Rse: 0.04 })
});

function erro(codigo, mensagem) {
    const e = new Error(mensagem);
    e.codigo = codigo;
    return e;
}

/** Catálogo atualizado com propriedades de massa (rho e c) nas camadas para calcular CT */
const CATALOGO = Object.freeze({
    // (Demais itens homogêneos omitidos por brevidade, mantidos iguais à V1.0)
    
    blocoCeramico91924_argamassado: Object.freeze({
        id: 'blocoCeramico91924_argamassado', 
        nome: 'Bloco cerâmico 9x19x24 cm com argamassa',
        tipo: 'heterogeneo', funcao: 'nucleo', espessuraM: 0.09,
        referencia: 'Modelagem NBR 15220-2', 
        validado: true,
        geometria: {
            // Caminhos paralelos para o Limite Superior (R_tot;upper) e CT equivalente
            // Adicionados: espessura, rho (densidade) e c (calor específico) para materiais maciços.
            // (Usando rho=1600 e c=0.92 para cerâmica como exemplo padrão normativo)
            caminhos: [
                { id: 'argamassa', fracaoArea: 0.193277, camadas: [
                    { R: 0.09 / 1.0, espessura: 0.09, rho: 1800, c: 1.0 }
                ]},
                { id: 'ceramica', fracaoArea: 0.179271, camadas: [
                    { R: 0.09 / 0.7, espessura: 0.09, rho: 1600, c: 0.92 }
                ]},
                { id: 'furos', fracaoArea: 0.627451, camadas: [
                    { R: 0.007 / 0.7, espessura: 0.007, rho: 1600, c: 0.92 }, 
                    { R: 0.16 }, // câmara de ar (CT desprezível, sem massa)
                    { R: 0.006 / 0.7, espessura: 0.006, rho: 1600, c: 0.92 }, 
                    { R: 0.16 }, 
                    { R: 0.007 / 0.7, espessura: 0.007, rho: 1600, c: 0.92 }
                ]}
            ],
            // Fatias perpendiculares para o Limite Inferior (R_tot;lower)
            fatias: [
                { espessura: 0.007, secoes: [{ fracaoArea: 0.193277, R: 0.007 / 1.0 }, { fracaoArea: 0.806723, R: 0.007 / 0.7 }] },
                { espessura: 0.035, secoes: [{ fracaoArea: 0.193277, R: 0.035 / 1.0 }, { fracaoArea: 0.179271, R: 0.035 / 0.7 }, { fracaoArea: 0.627451, R: 0.16 }] },
                { espessura: 0.006, secoes: [{ fracaoArea: 0.193277, R: 0.006 / 1.0 }, { fracaoArea: 0.806723, R: 0.006 / 0.7 }] },
                { espessura: 0.035, secoes: [{ fracaoArea: 0.193277, R: 0.035 / 1.0 }, { fracaoArea: 0.179271, R: 0.035 / 0.7 }, { fracaoArea: 0.627451, R: 0.16 }] },
                { espessura: 0.007, secoes: [{ fracaoArea: 0.193277, R: 0.007 / 1.0 }, { fracaoArea: 0.806723, R: 0.007 / 0.7 }] }
            ]
        }
    })
});

function calcularSistemaHeterogeneo(geometria, Rsi, Rse) {
    // 1. Limite Superior (R_tot;upper) E Capacidade Térmica (CT)
    let somaInversosUpper = 0;
    let somaInversosCT = 0;

    for (const caminho of geometria.caminhos) {
        let rCaminho = Rsi + Rse;
        let ctCaminho = 0;
        
        for (const camada of caminho.camadas) {
            // Soma resistência térmica (presente em todas as camadas)
            rCaminho += camada.R;
            
            // Soma capacidade térmica (CT = espessura * rho * c) apenas se for material maciço
            if (camada.espessura && camada.rho && camada.c) {
                ctCaminho += camada.espessura * camada.rho * camada.c;
            }
        }
        
        // Acumula inversos ponderados pela fração de área
        somaInversosUpper += caminho.fracaoArea / rCaminho;
        
        if (ctCaminho > 0) {
            somaInversosCT += caminho.fracaoArea / ctCaminho;
        }
    }
    const rTotUpper = 1 / somaInversosUpper;
    // Cálculo final da CT pela média harmônica ponderada pelas áreas fracionadas
    const CT = somaInversosCT > 0 ? (1 / somaInversosCT) : 0;

    // 2. Limite Inferior (R_tot;lower)
    let rTotLower = Rsi + Rse;
    for (const fatia of geometria.fatias) {
        let somaInversosFatia = 0;
        for (const secao of fatia.secoes) {
            somaInversosFatia += secao.fracaoArea / secao.R;
        }
        rTotLower += 1 / somaInversosFatia;
    }

    // 3. Critério de Validação
    const razaoLimites = rTotUpper / rTotLower;
    const metodoValido = razaoLimites <= 1.5;

    // 4. Resultados
    const rTot = (rTotUpper + rTotLower) / 2;
    const U = 1 / rTot;

    return {
        rTotUpper,
        rTotLower,
        razaoLimites,
        metodoValido,
        RT: rTot,
        U,
        CT
    };
}

if (typeof require !== 'undefined' && require.main === module) {
    const bloco = CATALOGO.blocoCeramico91924_argamassado;
    const sup = SUPERFICIES.paredeExternaFluxoHorizontal;
    
    const resultado = calcularSistemaHeterogeneo(bloco.geometria, sup.Rsi, sup.Rse);
    
    console.log("Cálculo Heterogêneo Completo (NBR 15220-2):");
    console.log(`- Transmitância (U): ${resultado.U.toFixed(2)} W/(m²K)`);
    console.log(`- Capacidade Térmica (CT): ${resultado.CT.toFixed(2)} kJ/(m²K)`);
}

if (typeof module !== 'undefined') module.exports = { SUPERFICIES, CATALOGO, calcularSistemaHeterogeneo };
