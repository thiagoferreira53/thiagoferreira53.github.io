# CARTILHA DE SISTEMAS DE VEDAÇÕES VERTICAIS EXTERNAS OPACAS
## Template Estruturado para Documentação Técnica

---

## ESTRUTURA DO DOCUMENTO

### 1. CABEÇALHO PRINCIPAL
```json
{
  "titulo_principal": "CARTILHA DE SISTEMAS DE VEDAÇÕES VERTICAIS EXTERNAS OPACAS",
  "subtitulo": "Desempenho térmico | Desempenho ambiental",
  "identificacao_sistema": {
    "numero": "Sistema X",
    "nome": "[Nome do Sistema]",
    "exemplo": "Sistema 11 – Cerâmico"
  }
}
```

---

### 2. IDENTIFICAÇÃO DO SISTEMA

```json
{
  "identificacao": {
    // Descrição textual do sistema
    "descricao": {
      "texto": "Sistema de vedação vertical externa opaca composto por...",
      "sistema_leve": false,  // true se densidade < 100 kg/m³
      "isolante_termico": false,  // true se contém isolamento térmico
      "peso": 216.8,  // kg/m² - densidade superficial
      "espessura": 14  // cm - espessura total do sistema
    },
    
    // Lista de componentes (camadas) do interior para o exterior
    "camadas": [
      "Pintura interna",
      "Argamassa interna",
      "Bloco cerâmico/concreto",
      "Argamassa de assentamento",
      "Argamassa externa",
      "Pintura externa"
    ],
    
    // Propriedades térmicas
    "propriedades_termicas": {
      "transmitancia_termica_U": 2.78,  // W/(m²·K)
      "capacidade_termica_CT": 209  // kJ/(m²·K)
    },
    
    // Metadados do sistema
    "metadata": {
      "unidade": "1m²",
      "fronteira": "Fase de produção (A1-3)",
      "validade": "2020-2025"
    }
  }
}
```

**Campos Obrigatórios:**
- ✅ Sistema leve ou pesado (< 100 kg/m³)
- ✅ Presença de isolamento térmico
- ✅ Densidade superficial (kg/m²)
- ✅ Espessura total (cm)
- ✅ Lista completa de camadas
- ✅ Transmitância térmica U [W/(m²·K)]
- ✅ Capacidade térmica CT [kJ/(m²·K)]
- ✅ Unidade de referência
- ✅ Fronteira do sistema (escopo ACV)
- ✅ Período de validade

---

### 3. IMAGEM ILUSTRATIVA DO SISTEMA

```json
{
  "imagem": {
    "tipo": "corte_transversal",
    "arquivo": "assets/systems/sistema11.png",
    "legenda": "Esquema em corte do Sistema 11 - Cerâmico",
    "camadas_visiveis": [
      {
        "ordem": 1,
        "nome": "Pintura interna",
        "cor_representacao": "#FFFFFF"
      },
      {
        "ordem": 2,
        "nome": "Argamassa interna",
        "cor_representacao": "#D3D3D3"
      },
      {
        "ordem": 3,
        "nome": "Bloco cerâmico",
        "cor_representacao": "#CD853F"
      },
      {
        "ordem": 4,
        "nome": "Argamassa de assentamento",
        "cor_representacao": "#A9A9A9"
      },
      {
        "ordem": 5,
        "nome": "Argamassa externa",
        "cor_representacao": "#D3D3D3"
      },
      {
        "ordem": 6,
        "nome": "Pintura externa",
        "cor_representacao": "#FFFFFF"
      }
    ],
    "fonte": "Adaptado de normas técnicas NBR 15575 / RTQ-C / RTQ-R",
    "dimensoes": {
      "largura": 800,
      "altura": 600,
      "formato": "PNG"
    }
  }
}
```

**Requisitos da Imagem:**
- ✅ Corte transversal mostrando todas as camadas
- ✅ Legenda identificando cada camada
- ✅ Escala ou dimensões indicadas
- ✅ Fonte/referência da ilustração

---

### 4. NORMAS E REGULAMENTOS BRASILEIROS

```json
{
  "normas_brasileiras": {
    // NBR 15575:2013 - Desempenho de Edificações Habitacionais
    "nbr15575": {
      "nome": "NBR 15575:2013",
      "descricao": "Desempenho de edificações habitacionais",
      "zonas": [
        {
          "zona": 1,
          "absortancia_limite": 0.6,
          "capacidade_minima": 130,  // kJ/(m²·K)
          "transmitancia_maxima": {
            "inferior_limite": 2.5,  // W/(m²·K) para α ≤ 0.6
            "superior_limite": 2.5   // W/(m²·K) para α > 0.6
          },
          "atende": true  // true/false baseado nos valores do sistema
        },
        // Repetir para zonas 2-8
        {
          "zona": 2,
          "absortancia_limite": 0.6,
          "capacidade_minima": 130,
          "transmitancia_maxima": {
            "inferior_limite": 2.5,
            "superior_limite": 2.5
          },
          "atende": true
        }
        // ... zonas 3-8
      ]
    },
    
    // RTQ-R:2012 - Edificações Residenciais
    "rtq_r": {
      "nome": "RTQ-R:2012",
      "descricao": "Regulamento Técnico da Qualidade para o Nível de Eficiência Energética de Edificações Residenciais",
      "zonas": [
        {
          "zona": 1,
          "absortancia_limite": 0.6,
          "capacidade_minima": 130,
          "transmitancia_maxima": {
            "inferior_limite": 2.5,
            "superior_limite": 2.5
          },
          "atende": true
        }
        // ... zonas 2-8
      ]
    },
    
    // RTQ-C:2010 - Edificações Comerciais
    "rtq_c": {
      "nome": "RTQ-C:2010",
      "descricao": "Regulamento Técnico da Qualidade do Nível de Eficiência Energética de Edifícios Comerciais, de Serviços e Públicos",
      "zonas": [
        {
          "zona": 1,
          "capacitancia_limite": 80,  // kJ/(m²·K)
          "nota_A": {
            "transmitancia_maxima": {
              "inferior_limite": 1.0,  // W/(m²·K) para α ≤ 0.6
              "superior_limite": 1.0   // W/(m²·K) para α > 0.6
            }
          },
          "nota_B": {
            "transmitancia_maxima": {
              "inferior_limite": 2.0,
              "superior_limite": 2.0
            }
          },
          "nota_CD": {
            "transmitancia_maxima": {
              "inferior_limite": 3.7,
              "superior_limite": 3.7
            }
          },
          "classificacao_sistema": "C"  // A, B, C, D ou E
        }
        // ... zonas 2-8
      ]
    }
  }
}
```

**Tabela de Conformidade:**

| Zona | RTQ-C | RTQ-R | NBR 15575 | Absortância (α) |
|------|-------|-------|-----------|-----------------|
| 1    | Nota C| Atende| Atende    | ≤ 0.6          |
| 2    | Nota C| Atende| Atende    | ≤ 0.6          |
| 3    | Nota C| Atende| Atende    | ≤ 0.6          |
| 4    | Nota C| Atende| Atende    | ≤ 0.6          |
| 5    | Nota C| Atende| Atende    | ≤ 0.6          |
| 6    | Nota C| Atende| Atende    | ≤ 0.6          |
| 7    | Nota C| Atende| Atende    | ≤ 0.6          |
| 8    | Nota C| Atende| Atende    | ≤ 0.6          |

---

### 5. DESEMPENHO TÉRMICO

#### 5.1 ASHRAE 90.1

```json
{
  "ashrae_90_1": {
    "edificacoes_nao_residenciais": {
      "zonas_climaticas": [
        {
          "zona": "0A",
          "transmitancia_maxima": 3.293,  // W/(m²·K)
          "atende": true
        },
        {
          "zona": "1A",
          "transmitancia_maxima": 3.293,
          "atende": true
        },
        {
          "zona": "2A",
          "transmitancia_maxima": 2.840,
          "atende": true
        },
        {
          "zona": "3A",
          "transmitancia_maxima": 1.520,
          "atende": false
        }
        // ... outras zonas
      ]
    },
    "edificacoes_residenciais": {
      "zonas_climaticas": [
        {
          "zona": "0",
          "transmitancia_maxima": 7.954,
          "atende": true
        },
        {
          "zona": "1",
          "transmitancia_maxima": 3.293,
          "atende": true
        }
        // ... outras zonas
      ]
    }
  }
}
```

#### 5.2 Gráficos de Desempenho Térmico

```json
{
  "graficos_termicos": {
    // Gráfico 1: Transmitância Térmica (U)
    "transmitancia": {
      "titulo": "Transmitância Térmica (U)",
      "tipo": "barra_horizontal",
      "valor_sistema": 2.78,  // W/(m²·K)
      "escala": {
        "min": 0,
        "max": 4,
        "unidade": "W/(m²·K)",
        "cores": [
          {"range": [0, 1.0], "cor": "#00FF00", "label": "Excelente"},
          {"range": [1.0, 2.0], "cor": "#90EE90", "label": "Bom"},
          {"range": [2.0, 2.5], "cor": "#FFFF00", "label": "Regular"},
          {"range": [2.5, 3.7], "cor": "#FFA500", "label": "Fraco"},
          {"range": [3.7, 4.0], "cor": "#FF0000", "label": "Inadequado"}
        ]
      }
    },
    
    // Gráfico 2: Capacidade Térmica (CT)
    "capacidade_termica": {
      "titulo": "Capacidade Térmica (CT)",
      "tipo": "barra_horizontal",
      "valor_sistema": 209,  // kJ/(m²·K)
      "escala": {
        "min": 0,
        "max": 400,
        "unidade": "kJ/(m²·K)",
        "cores": [
          {"range": [0, 80], "cor": "#FF0000", "label": "Inadequado"},
          {"range": [80, 130], "cor": "#FFA500", "label": "Fraco"},
          {"range": [130, 200], "cor": "#FFFF00", "label": "Regular"},
          {"range": [200, 300], "cor": "#90EE90", "label": "Bom"},
          {"range": [300, 400], "cor": "#00FF00", "label": "Excelente"}
        ]
      }
    }
  }
}
```

**Visualização:** Gráfico de barras horizontais com código de cores (verde = melhor desempenho, vermelho = pior desempenho)

---

### 6. IMPACTOS AMBIENTAIS POTENCIAIS

```json
{
  "impactos_ambientais": {
    // Valores totais do sistema (fase A1-A3: produção)
    "gwp": {
      "nome": "Potencial de Aquecimento Global",
      "sigla": "GWP",
      "valor": 2.95E+01,  // Notação científica
      "unidade": "kg CO₂ eq",
      "descricao": "Contribuição para o efeito estufa e mudanças climáticas"
    },
    "ap": {
      "nome": "Potencial de Acidificação",
      "sigla": "AP",
      "valor": 9.63E-02,
      "unidade": "kg SO₂ eq",
      "descricao": "Contribuição para chuva ácida e acidificação de solos e águas"
    },
    "ep": {
      "nome": "Potencial de Eutrofização",
      "sigla": "EP",
      "valor": 2.59E-02,
      "unidade": "kg PO₄³⁻ eq",
      "descricao": "Enriquecimento excessivo de nutrientes em ecossistemas aquáticos"
    },
    "pocp": {
      "nome": "Potencial de Criação de Ozônio Fotoquímico",
      "sigla": "POCP",
      "valor": 4.75E-03,
      "unidade": "kg C₂H₄ eq",
      "descricao": "Formação de ozônio troposférico (smog fotoquímico)"
    },
    "odp": {
      "nome": "Potencial de Depleção da Camada de Ozônio",
      "sigla": "ODP",
      "valor": 1.77E-06,
      "unidade": "kg CFC-11 eq",
      "descricao": "Destruição da camada de ozônio estratosférica"
    },
    "adp_nf": {
      "nome": "Potencial de Depleção Abiótica - Elementos",
      "sigla": "ADPnf",
      "valor": 1.07E-06,
      "unidade": "kg Sb eq",
      "descricao": "Esgotamento de recursos minerais não fósseis"
    },
    "adp_f": {
      "nome": "Potencial de Depleção Abiótica - Combustíveis Fósseis",
      "sigla": "ADPf",
      "valor": 1.88E+02,
      "unidade": "MJ",
      "descricao": "Esgotamento de recursos energéticos fósseis"
    }
  },
  
  // Gráfico de impactos (barras horizontais)
  "grafico_impactos": {
    "tipo": "barra_horizontal",
    "dados": [
      {"categoria": "GWP", "valor": 2.95E+01, "cor": "#667eea"},
      {"categoria": "AP", "valor": 9.63E-02, "cor": "#667eea"},
      {"categoria": "EP", "valor": 2.59E-02, "cor": "#667eea"},
      {"categoria": "POCP", "valor": 4.75E-03, "cor": "#667eea"},
      {"categoria": "ODP", "valor": 1.77E-06, "cor": "#667eea"},
      {"categoria": "ADPnf", "valor": 1.07E-06, "cor": "#667eea"},
      {"categoria": "ADPf", "valor": 1.88E+02, "cor": "#667eea"}
    ],
    "escala": "logaritmica",  // Devido à grande variação de magnitudes
    "orientacao": "horizontal"
  }
}
```

**Nota:** Os valores estão em notação científica e devem ser escalonados para visualização gráfica.

---

### 7. CONSUMO DE COMPONENTES E ENERGIA

```json
{
  "consumo_componentes": {
    // Consumo total de materiais
    "total": 2.37E+02,  // kg (para 1m²)
    "unidade": "kg",
    
    // Detalhamento por componente
    "componentes": [
      {
        "componente": "Argamassa de revestimento",
        "consumo_componente": 1.20E+02,  // kg
        "percentual": 50.6,  // % do total
        
        // Impactos específicos deste componente
        "impactos": {
          "gwp": 1.72E+01,  // kg CO₂ eq
          "ap": 4.40E-02,   // kg SO₂ eq
          "ep": 1.18E-02,   // kg PO₄³⁻ eq
          "pocp": 2.00E-03, // kg C₂H₄ eq
          "odp": 8.87E-07,  // kg CFC-11 eq
          "adpnf": 1.50E-07,// kg Sb eq
          "adpf": 9.93E+01  // MJ
        }
      },
      {
        "componente": "Argamassa de assentamento",
        "consumo_componente": 1.95E+01,
        "percentual": 8.2,
        "impactos": {
          "gwp": 2.80E+00,
          "ap": 7.16E-03,
          "ep": 1.91E-03,
          "pocp": 3.25E-04,
          "odp": 1.44E-07,
          "adpnf": 2.45E-08,
          "adpf": 1.62E+01
        }
      },
      {
        "componente": "Alvenaria (Bloco cerâmico)",
        "consumo_componente": 6.67E+01,
        "percentual": 28.1,
        "impactos": {
          "gwp": 7.48E+00,
          "ap": 2.82E-02,
          "ep": 6.74E-03,
          "pocp": 1.26E-03,
          "odp": 5.93E-07,
          "adpnf": 9.03E-08,
          "adpf": 5.03E+01
        }
      },
      {
        "componente": "Aço (armaduras)",
        "consumo_componente": 8.07E+00,
        "percentual": 3.4,
        "impactos": {
          "gwp": 5.91E-01,
          "ap": 8.63E-03,
          "ep": 2.63E-03,
          "pocp": 3.35E-04,
          "odp": 4.01E-08,
          "adpnf": 1.54E-07,
          "adpf": 6.40E+00
        }
      },
      {
        "componente": "Pintura",
        "consumo_componente": 2.26E+01,
        "percentual": 9.5,
        "impactos": {
          "gwp": 2.87E+00,
          "ap": 1.68E-02,
          "ep": 5.73E-03,
          "pocp": 1.68E-03,
          "odp": 2.18E-07,
          "adpnf": 1.30E-06,
          "adpf": 3.24E+01
        }
      }
    ],
    
    // Gráficos de consumo
    "graficos": {
      // Gráfico 1: Consumo por componente (barras horizontais)
      "consumo_material": {
        "tipo": "barra_horizontal",
        "titulo": "Consumo de Material por Componente",
        "dados": [
          {"componente": "Argamassa de revestimento", "valor": 120, "cor": "#667eea"},
          {"componente": "Alvenaria", "valor": 66.7, "cor": "#667eea"},
          {"componente": "Pintura", "valor": 22.6, "cor": "#667eea"},
          {"componente": "Argamassa de assentamento", "valor": 19.5, "cor": "#667eea"},
          {"componente": "Aço", "valor": 8.07, "cor": "#667eea"}
        ],
        "unidade": "kg"
      },
      
      // Gráfico 2: Contribuição GWP por componente (barras horizontais)
      "gwp_por_componente": {
        "tipo": "barra_horizontal",
        "titulo": "Contribuição GWP por Componente",
        "dados": [
          {"componente": "Argamassa de revestimento", "valor": 17.2, "percentual": 58.3, "cor": "#667eea"},
          {"componente": "Alvenaria", "valor": 7.48, "percentual": 25.4, "cor": "#667eea"},
          {"componente": "Pintura", "valor": 2.87, "percentual": 9.7, "cor": "#667eea"},
          {"componente": "Argamassa de assentamento", "valor": 2.80, "percentual": 9.5, "cor": "#667eea"},
          {"componente": "Aço", "valor": 0.591, "percentual": 2.0, "cor": "#667eea"}
        ],
        "unidade": "kg CO₂ eq"
      },
      
      // Gráfico 3: Consumo de energia por componente (barras empilhadas)
      "energia_por_componente": {
        "tipo": "barra_empilhada",
        "titulo": "Consumo de Energia Incorporada (ADPf)",
        "dados": [
          {"componente": "Argamassa de revestimento", "valor": 99.3, "cor": "#667eea"},
          {"componente": "Alvenaria", "valor": 50.3, "cor": "#764ba2"},
          {"componente": "Pintura", "valor": 32.4, "cor": "#f093fb"},
          {"componente": "Argamassa de assentamento", "valor": 16.2, "cor": "#4facfe"},
          {"componente": "Aço", "valor": 6.4, "cor": "#00f2fe"}
        ],
        "total": 204.6,
        "unidade": "MJ"
      }
    }
  }
}
```

**Tabela de Consumo e Impactos:**

| Componente | Consumo (kg) | % | GWP (kg CO₂ eq) | AP (kg SO₂ eq) | EP (kg PO₄³⁻ eq) | POCP (kg C₂H₄ eq) |
|-----------|--------------|---|-----------------|----------------|------------------|-------------------|
| Argamassa de revestimento | 1.20E+02 | 50.6% | 1.72E+01 | 4.40E-02 | 1.18E-02 | 2.00E-03 |
| Alvenaria | 6.67E+01 | 28.1% | 7.48E+00 | 2.82E-02 | 6.74E-03 | 1.26E-03 |
| Pintura | 2.26E+01 | 9.5% | 2.87E+00 | 1.68E-02 | 5.73E-03 | 1.68E-03 |
| Argamassa de assentamento | 1.95E+01 | 8.2% | 2.80E+00 | 7.16E-03 | 1.91E-03 | 3.25E-04 |
| Aço | 8.07E+00 | 3.4% | 5.91E-01 | 8.63E-03 | 2.63E-03 | 3.35E-04 |
| **TOTAL** | **2.37E+02** | **100%** | **2.95E+01** | **9.63E-02** | **2.59E-02** | **4.75E-03** |

---

### 8. NOTAS E OBSERVAÇÕES

```json
{
  "notas": {
    "metodologia": {
      "titulo": "Metodologia de Avaliação",
      "conteudo": [
        "Os valores de transmitância térmica (U) e capacidade térmica (CT) foram calculados conforme NBR 15220-2:2005.",
        "A avaliação de conformidade com normas brasileiras considera as 8 zonas bioclimáticas definidas pela NBR 15220-3.",
        "O método de simulação computacional pode ser utilizado caso os critérios do método prescritivo não sejam atendidos.",
        "Para a ASHRAE 90.1, foram consideradas as zonas climáticas equivalentes ao território brasileiro."
      ]
    },
    
    "acv": {
      "titulo": "Avaliação do Ciclo de Vida (ACV)",
      "conteudo": [
        "A ACV foi realizada seguindo as normas ISO 14040 e ISO 14044.",
        "Fronteira do sistema: berço ao portão (cradle-to-gate) - Fase A1-A3 conforme EN 15804.",
        "Unidade funcional: 1 m² de vedação vertical externa opaca.",
        "Período de validade dos dados: 2020-2025.",
        "Base de dados utilizada: Ecoinvent 3.8 e dados primários de fabricantes brasileiros.",
        "Métodos de avaliação de impacto: CML-IA baseline v3.05 / ILCD 2011 Midpoint+."
      ]
    },
    
    "limitacoes": {
      "titulo": "Limitações e Considerações",
      "conteudo": [
        "Os resultados são válidos apenas para a fase de produção (A1-A3).",
        "Fases de transporte (A4), construção (A5), uso (B1-B7), fim de vida (C1-C4) e benefícios (D) não foram incluídas.",
        "Variações nas formulações dos materiais podem alterar os resultados.",
        "Absortância solar (α) considerada: ≤ 0.6 para superfícies claras e > 0.6 para superfícies escuras.",
        "Não foram considerados pontes térmicas e heterogeneidades construtivas."
      ]
    },
    
    "referencias": {
      "titulo": "Referências Normativas",
      "conteudo": [
        "ABNT NBR 15220-2:2005 - Desempenho térmico de edificações - Parte 2: Métodos de cálculo da transmitância térmica",
        "ABNT NBR 15220-3:2005 - Desempenho térmico de edificações - Parte 3: Zoneamento bioclimático brasileiro",
        "ABNT NBR 15575:2013 - Edificações habitacionais — Desempenho",
        "INMETRO - RTQ-C: Regulamento Técnico da Qualidade do Nível de Eficiência Energética de Edifícios Comerciais (2010)",
        "INMETRO - RTQ-R: Regulamento Técnico da Qualidade para o Nível de Eficiência Energética de Edificações Residenciais (2012)",
        "ASHRAE 90.1-2019: Energy Standard for Buildings Except Low-Rise Residential Buildings",
        "ISO 14040:2006 - Environmental management — Life cycle assessment — Principles and framework",
        "ISO 14044:2006 - Environmental management — Life cycle assessment — Requirements and guidelines",
        "EN 15804:2012+A2:2019 - Sustainability of construction works — Environmental product declarations"
      ]
    },
    
    "autores": {
      "titulo": "Créditos e Responsáveis",
      "conteudo": [
        "Universidade Federal do Rio Grande do Sul (UFRGS)",
        "Programa de Pós-Graduação em Engenharia Civil (PPGCI)",
        "Laboratório de Eficiência Energética em Edificações",
        "Projeto: Life Cycle Impact Evaluation for Buildings (LIfE)",
        "Período: 2020-2025"
      ]
    },
    
    "atualizacao": {
      "titulo": "Controle de Versão",
      "versao": "1.0",
      "data": "2025-11-13",
      "responsavel": "Equipe LIfE - UFRGS/PPGCI",
      "historico": [
        {
          "versao": "1.0",
          "data": "2025-11-13",
          "alteracoes": "Versão inicial da cartilha"
        }
      ]
    }
  }
}
```

---

## TEMPLATE DE IMPLEMENTAÇÃO (HTML/JavaScript)

```javascript
/**
 * Estrutura de dados para Sistema de Vedação
 * Este objeto deve ser preenchido com os dados reais de cada sistema
 */
const sistemaTemplate = {
  // ID único do sistema
  id: "sistema_11",
  numero: 11,
  nome: "Sistema 11 – Cerâmico",
  
  // Imagem do sistema
  imagem: "assets/systems/sistema11.png",
  
  // Identificação completa
  identificacao: {
    descricao: {
      sistema_leve: false,
      isolante_termico: false,
      peso: 216.8,  // kg/m²
      espessura: 14  // cm
    },
    camadas: [
      "Pintura interna",
      "Argamassa interna",
      "Bloco cerâmico",
      "Argamassa de assentamento",
      "Argamassa externa",
      "Pintura externa"
    ],
    unidade: "1m²",
    fronteira: "Fase de produção (A1-3)",
    validade: "2020-2025"
  },
  
  // Desempenho térmico
  transmitancia: 2.78,  // W/(m²·K)
  capacidade_termica: 209,  // kJ/(m²·K)
  
  // Impactos ambientais
  impactos: {
    gwp: 2.95E+01,
    ap: 9.63E-02,
    ep: 2.59E-02,
    pocp: 4.75E-03,
    odp: 1.77E-06,
    adpnf: 1.07E-06,
    adpf: 1.88E+02
  },
  
  // Consumo de componentes
  consumo: {
    total: 2.37E+02,
    componentes: [
      {
        componente: "Argamassa de revestimento",
        consumo_componente: 1.20E+02,
        gwp: 1.72E+01,
        ap: 4.40E-02,
        ep: 1.18E-02,
        pocp: 2.00E-03,
        odp: 8.87E-07,
        adpnf: 1.50E-07,
        adpf: 9.93E+01
      }
      // ... outros componentes
    ]
  }
};

/**
 * Função para gerar a cartilha completa
 * @param {Object} sistema - Objeto com dados do sistema
 * @returns {String} HTML da cartilha
 */
function gerarCartilha(sistema) {
  return `
    <!-- CABEÇALHO -->
    <header class="cartilha-header">
      <h1>CARTILHA DE SISTEMAS DE VEDAÇÕES VERTICAIS EXTERNAS OPACAS</h1>
      <h2>Desempenho térmico | Desempenho ambiental</h2>
      <h3>${sistema.numero} – ${sistema.nome}</h3>
    </header>
    
    <!-- IMAGEM DO SISTEMA -->
    <img src="${sistema.imagem}" alt="${sistema.nome}" class="sistema-imagem">
    
    <!-- IDENTIFICAÇÃO -->
    <section id="identificacao">
      <h3>IDENTIFICAÇÃO DO SISTEMA</h3>
      <p><strong>Sistema leve:</strong> ${sistema.identificacao.descricao.sistema_leve ? 'Sim' : 'Não'}</p>
      <p><strong>Isolamento térmico:</strong> ${sistema.identificacao.descricao.isolante_termico ? 'Sim' : 'Não'}</p>
      <p><strong>Peso:</strong> ${sistema.identificacao.descricao.peso} kg/m²</p>
      <p><strong>Espessura:</strong> ${sistema.identificacao.descricao.espessura} cm</p>
      
      <h4>Camadas:</h4>
      <ol>
        ${sistema.identificacao.camadas.map(c => `<li>${c}</li>`).join('')}
      </ol>
    </section>
    
    <!-- DESEMPENHO TÉRMICO -->
    <section id="desempenho-termico">
      <h3>DESEMPENHO TÉRMICO</h3>
      <p><strong>Transmitância térmica (U):</strong> ${sistema.transmitancia} W/(m²·K)</p>
      <p><strong>Capacidade térmica (CT):</strong> ${sistema.capacidade_termica} kJ/(m²·K)</p>
      <canvas id="thermalChart"></canvas>
    </section>
    
    <!-- NORMAS BRASILEIRAS -->
    <section id="normas">
      <h3>NORMAS E REGULAMENTOS BRASILEIROS</h3>
      <!-- Tabelas de conformidade -->
    </section>
    
    <!-- IMPACTOS AMBIENTAIS -->
    <section id="impactos">
      <h3>IMPACTOS AMBIENTAIS</h3>
      <canvas id="impactsChart"></canvas>
      <table><!-- Tabela de impactos --></table>
    </section>
    
    <!-- CONSUMO DE COMPONENTES -->
    <section id="consumo">
      <h3>CONSUMO DE COMPONENTES</h3>
      <canvas id="componentsChart"></canvas>
      <table><!-- Tabela de consumo --></table>
    </section>
    
    <!-- NOTAS -->
    <section id="notas">
      <h3>NOTAS E OBSERVAÇÕES</h3>
      <!-- Notas metodológicas -->
    </section>
  `;
}
```

---

## CHECKLIST DE IMPLEMENTAÇÃO

### ✅ Dados Obrigatórios
- [ ] Número e nome do sistema
- [ ] Imagem ilustrativa (corte transversal)
- [ ] Lista completa de camadas
- [ ] Densidade superficial (kg/m²)
- [ ] Espessura total (cm)
- [ ] Transmitância térmica U [W/(m²·K)]
- [ ] Capacidade térmica CT [kJ/(m²·K)]
- [ ] 7 indicadores de impacto ambiental (GWP, AP, EP, POCP, ODP, ADPnf, ADPf)
- [ ] Consumo total de materiais (kg)
- [ ] Detalhamento por componente (consumo + impactos)
- [ ] Conformidade com NBR 15575 (8 zonas)
- [ ] Conformidade com RTQ-R (8 zonas)
- [ ] Conformidade com RTQ-C (8 zonas)
- [ ] Conformidade com ASHRAE 90.1

### ✅ Elementos Visuais
- [ ] 3 gráficos de barras horizontais (térmico, impactos, componentes)
- [ ] Tabelas formatadas com dados numéricos
- [ ] Código de cores consistente (azul #667eea)
- [ ] Layout responsivo
- [ ] Botão de exportar para PDF

### ✅ Metadados
- [ ] Unidade funcional (1m²)
- [ ] Fronteira do sistema (A1-A3)
- [ ] Período de validade
- [ ] Referências normativas
- [ ] Créditos institucionais

---

**Documento gerado para o projeto LIfE - UFRGS/PPGCI**  
**Data:** 2025-11-13  
**Versão:** 1.0
