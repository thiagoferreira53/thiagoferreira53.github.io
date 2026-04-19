// ===== Internationalization (i18n) Module =====

const translations = {
    'pt-BR': {
        // Navigation
        'nav.home': 'Página Inicial',
        'nav.systems': 'Sistemas',
        'nav.compare': 'Compare Sistemas',
        'nav.create': 'Crie e Avalie',
        'nav.history': 'Meus Projetos',
        'nav.about': 'Saiba Mais',
        'nav.login': 'Entrar',
        'nav.logout': 'Sair',
        'nav.myAccount': 'Minha Conta',

        // Hero
        'hero.badge': 'Avaliação de Ciclo de Vida para Edificações',
        'hero.title': 'Desempenho ambiental de sistemas construtivos de',
        'hero.titleHighlight': 'Vedação Vertical Externa Opaca',
        'hero.description': 'Ferramenta de pesquisa desenvolvida para avaliar impactos ambientais e desempenho térmico de sistemas de vedação vertical externa opaca, cobrindo impactos da fase de produção (A1-A3) e métricas de desempenho térmico.',
        'hero.cta': 'Ver Sistemas',
        'hero.learnMore': 'Saiba Mais',
        'hero.statSystems': 'Sistemas Construtivos',
        'hero.statComponents': 'Componentes',
        'hero.statStandards': 'Normas',
        'hero.compliance': 'Em conformidade com ASHRAE 90.1, NBR 15575, RTQ-C e RTQ-R.',

        // Home info sections
        'home.whatIsTitle': 'O que é',
        'home.whatIsP1': 'O E³ Build é um aplicativo voltado à escolha consciente de sistemas de vedação vertical externa no processo de projeto.',
        'home.whatIsP2': 'A ferramenta permite avaliar e comparar o desempenho térmico e os impactos ambientais de diferentes soluções construtivas, apoiando decisões mais eficientes, sustentáveis e fundamentadas em dados. Além disso, possibilita a criação de sistemas personalizados, adaptados às necessidades específicas de cada projeto.',
        'home.applicationsTitle': 'Aplicações',
        'home.app1': 'Seleção de sistemas construtivos mais adequados ao projeto',
        'home.app2': 'Comparação entre alternativas com base em desempenho térmico e impacto ambiental',
        'home.app3': 'Apoio à melhoria contínua do processo de projeto',
        'home.app4': 'Fundamentação técnica para tomada de decisão em fases iniciais de projeto',
        'home.howToUseTitle': 'Como Usar',
        'home.use1': 'Consultando informações de sistemas construtivos disponíveis no explorar sistemas',
        'home.use2': 'Comparando diferentes soluções para avaliar desempenho e impacto ambiental',
        'home.use3': 'Criando sistemas personalizados conforme as necessidades do projeto',
        'home.use4': 'Analisando resultados para apoiar a escolha da melhor solução',
        'home.indicatorsTitle': 'Entenda os indicadores',
        'home.thermalLabel': 'Desempenho térmico',
        'home.thermalDesc': 'Entenda como o valor U e a capacidade térmica influenciam o conforto.',
        'home.lcaLabel': 'Impacto ambiental',
        'home.lcaDesc': 'O que é GWP, CED e como interpretar os resultados.',
        'home.learnMoreBtn': 'Saiba mais',
        'home.featuresTitle': 'Explore as funcionalidades',

        // Feature Cards
        'feature.catalog.title': 'Cartilha de Sistemas',
        'feature.catalog.desc': 'Verifique a cartilha com informações de desempenho térmico e impactos ambientais dos sistemas.',
        'feature.compare.title': 'Comparativo de Impactos',
        'feature.compare.desc': 'Selecione os sistemas para comparar e avaliar a melhor opção para o seu projeto.',
        'feature.create.title': 'Crie e Calcule',
        'feature.create.desc': 'Monte um sistema de vedação vertical externa opaca e calcule automaticamente os impactos.',
        'feature.history.title': 'Histórico',
        'feature.history.desc': 'Salve seus projetos e comparações para também ter como revisar.',

        // Systems Section
        'systems.title': 'Biblioteca de Sistemas Construtivos',
        'systems.subtitle': 'Sistemas de Vedação Vertical Externa são partes da edificação habitacional que limitam verticalmente a edificação e seus ambientes, como as fachadas e as paredes.',
        'systems.cta': 'Verifique as informações de desempenho térmico e os impactos ambientais do sistema construtivo.',
        'systems.expandTitle': 'Explorar Sistemas de vedação vertical',
        'systems.expandP1': 'Consulte diferentes sistemas construtivos de vedação vertical opaca, como paredes de concreto maciço, blocos de concreto, blocos cerâmicos e sistemas em drywall.',
        'systems.expandP2': 'Para cada sistema, são apresentadas informações de desempenho térmico e impactos ambientais, auxiliando na comparação e na tomada de decisão em projeto.',
        'systems.search': 'Buscar sistemas por nome...',
        'systems.filterType': 'Tipo:',
        'systems.allTypes': 'Todos os Tipos',
        'systems.filterInsulation': 'Isolamento Térmico:',
        'systems.all': 'Todos',
        'systems.yes': 'Sim',
        'systems.no': 'Não',
        'systems.filterOrigin': 'Origem:',
        'systems.allSystems': 'Todos os Sistemas',
        'systems.mySystems': 'Meus Sistemas',
        'systems.database': 'Sistema da Biblioteca',
        'systems.clearFilters': 'Limpar Filtros',
        'systems.print': 'Imprimir',
        'systems.loading': 'Carregando sistemas...',
        'systems.noResults': 'Nenhum sistema encontrado com seus critérios',
        'systems.selected': '✓ Selecionado',
        'systems.select': '+ Selecionar',
        'systems.viewCard': '📖 Ver Cartilha do Sistema',
        'systems.concrete': 'Concreto',
        'systems.ceramic': 'Cerâmica',
        'systems.steelframe': 'Steel Frame',
        'systems.other': 'Outros',
        'systems.prev': '‹ Anterior',
        'systems.next': 'Próxima ›',

        // Compare Section
        'compare.title': 'Comparar Sistemas',
        'compare.description': 'Escolha o método de comparação e selecione os sistemas de vedação vertical externa opaca.',
        'compare.stepMethod': '1. Escolha o método de comparação',
        'compare.methodThermal': 'Desempenho Térmico',
        'compare.methodThermalDesc': 'Compare todos os sistemas com base em normas de desempenho térmico (NBR, ASHRAE, RTQ-C, RTQ-R)',
        'compare.methodGroups': 'Grupos de Sistemas',
        'compare.methodGroupsDesc': 'Compare impactos ambientais entre sistemas — selecione individualmente ou compare todos de uma vez',
        'compare.back': 'Voltar',
        'compare.thermalTitle': 'Comparação por Desempenho Térmico',
        'compare.thermalDesc': 'Selecione uma norma técnica para verificar a conformidade de todos os sistemas:',
        'compare.normNBR': 'Norma de Desempenho — Edificações Habitacionais (Zonas 1–8)',
        'compare.normRTQR': 'Requisitos Técnicos — Edifícios Residenciais (Zonas 1–8)',
        'compare.normRTQC': 'Requisitos Técnicos — Edifícios Comerciais (Zonas 1–8)',
        'compare.normASHRAERes': 'Padrão de Energia — Edifícios Residenciais (Zonas 0–3)',
        'compare.normASHRAECom': 'Padrão de Energia — Edifícios Comerciais (Zonas 0–3)',
        'compare.groupsTitle': 'Comparação por Grupos de Sistemas',
        'compare.approachIndividual': 'Seleção Individual',
        'compare.approachAll': 'Comparar Todos',
        'compare.individualDesc': 'Selecione até 5 sistemas para comparar seus impactos ambientais:',
        'compare.allDesc': 'Compare todos os sistemas da biblioteca de uma vez, visualizando impactos ambientais e desempenho térmico de toda a base de dados.',
        'compare.compareAllBtn': 'Comparar Todos os Sistemas',
        'compare.searchPlaceholder': 'Buscar sistemas por nome...',
        'compare.empty': 'Nenhum sistema selecionado',
        'compare.btn': 'Comparar Selecionados',
        'compare.results': 'Resultados da Comparação',
        'compare.allResultsTitle': 'Comparação de Todos os Sistemas',
        'compare.thermalResultsTitle': 'Conformidade Térmica',
        'compare.property': 'Propriedade',
        'compare.system': 'Sistema',
        'compare.zone': 'Zona',
        'compare.chartsTitle': 'Impactos Ambientais',
        'compare.rtqcGrades': 'Classificação energética: A (melhor) → B → CD → E (não atende)',
        'compare.standardsTitle': 'Conformidade com Normas Térmicas',
        'compare.standard': 'Norma',
        'compare.loginRequired': 'Faça login para comparar sistemas',

        // System card labels
        'card.weight': 'Peso',
        'card.thickness': 'Esp.',
        'card.insulation': 'Isolamento',
        'card.light': 'Leve',

        // System detail modal
        'detail.identification': 'Identificação',
        'detail.boundary': 'Fronteira',
        'detail.unit': 'Unidade',
        'detail.weight': 'Peso',
        'detail.thickness': 'Espessura',
        'detail.lightweight': 'Sistema Leve',
        'detail.insulation': 'Isolante Térmico',
        'detail.yes': 'Sim',
        'detail.no': 'Não',
        'detail.layers': 'Camadas (interior → exterior)',
        'detail.thermalProps': 'Propriedades Térmicas',
        'detail.thermalTransmittance': 'Transmitância Térmica (U)',
        'detail.thermalCapacity': 'Capacidade Térmica (CT)',
        'detail.envImpacts': 'Impactos Ambientais (A1-A3)',
        'detail.energyConsumption': 'Consumo Energético (CED)',
        'detail.total': 'Total',
        'detail.component': 'Componente',

        // Filter type options
        'filter.concreteBlock': 'Bloco de concreto',
        'filter.concreteWall': 'Parede de concreto',
        'filter.ceramicBlock': 'Bloco cerâmico',
        'filter.steelFrame': 'Steel frame (leve)',

        // Cartilha (System Card)
        'cartilha.title': 'Cartilha',
        'cartilha.identification': '1. IDENTIFICAÇÃO DO SISTEMA',
        'cartilha.system': 'Sistema',
        'cartilha.boundary': 'Fronteira do sistema',
        'cartilha.functionalUnit': 'Unidade funcional',
        'cartilha.weight': 'Peso',
        'cartilha.totalThickness': 'Espessura total',
        'cartilha.lightweight': 'Sistema leve',
        'cartilha.insulation': 'Isolante térmico',
        'cartilha.composition': 'Composição (interior → exterior):',
        'cartilha.thermalPerf': '2. DESEMPENHO TÉRMICO',
        'cartilha.property': 'Propriedade',
        'cartilha.value': 'Valor',
        'cartilha.unitCol': 'Unidade',
        'cartilha.thermalTransmittance': 'Transmitância Térmica (U)',
        'cartilha.thermalCapacity': 'Capacidade Térmica (CT)',
        'cartilha.envImpacts': '3. IMPACTOS AMBIENTAIS (A1-A3)',
        'cartilha.indicator': 'Indicador',
        'cartilha.energyCED': '4. CONSUMO ENERGÉTICO (CED)',
        'cartilha.total': 'Total',
        'cartilha.component': 'Componente',
        'cartilha.charts': '5. GRÁFICOS',
        'cartilha.chartSubtitle': 'Distribuição de Impactos por Componente',
        'cartilha.standards': '6. CONFORMIDADE COM NORMAS',
        'cartilha.standard': 'Norma',
        'cartilha.zone': 'Zona',
        'cartilha.result': 'Resultado',
        'cartilha.pass': 'ATENDE ✓',
        'cartilha.fail': 'NÃO ATENDE ✗',

        // Create Section
        'create.title': 'Criar Sistema Personalizado',
        'create.description': 'Projete seu próprio sistema de vedação',
        'create.name': 'Nome do Sistema *',
        'create.namePlaceholder': 'Digite o nome do sistema',
        'create.type': 'Tipo *',
        'create.selectType': 'Selecione o tipo',
        'create.uValue': 'Valor U (W/m²K) *',
        'create.thermalCapacity': 'Capacidade Térmica (kJ/m²K) *',
        'create.weight': 'Peso (kg/m²) *',
        'create.thickness': 'Espessura (cm) *',
        'create.lightSystem': 'Sistema Leve',
        'create.thermalInsulation': 'Isolamento Térmico',
        'create.componentsTitle': 'Componentes do Sistema',
        'create.componentsDesc': 'Selecione os componentes que compõem o sistema de vedação. O software calculará automaticamente a transmitância térmica e os impactos ambientais.',
        'create.available': 'Componentes Disponíveis',
        'create.searchComponent': 'Buscar componente...',
        'create.selectedLayers': 'Camadas Selecionadas (arraste para reordenar)',
        'create.noLayers': 'Nenhuma camada selecionada',
        'create.save': 'Salvar Sistema',
        'create.clear': 'Limpar Formulário',
        'create.loginRequired': 'Faça login para criar sistemas',

        // History Section
        'history.title': 'Histórico',
        'history.description': 'Acesse os sistemas que você criou e o seu histórico de comparações.',
        'history.createdTab': 'Sistemas Criados',
        'history.comparisonsTab': 'Histórico de Comparações',
        'history.noSystems': 'Nenhum sistema criado ainda. Crie seu primeiro sistema acima!',
        'history.noComparisons': 'Nenhuma comparação realizada ainda. Compare sistemas para ver o histórico aqui!',
        'history.loginRequired': 'Faça login para ver seu histórico',
        'history.viewDetails': 'Ver Detalhes',
        'history.viewPDF': 'Ver PDF',
        'history.print': 'Imprimir',
        'history.delete': 'Deletar',

        // About / Saiba Mais Section
        'about.title': 'Saiba Mais',
        'about.introTitle': 'Sobre o E³ Build',
        'about.text1': 'E³ Build (Energy, Environment, Envelope) é uma ferramenta de pesquisa desenvolvida para avaliar impactos ambientais e desempenho térmico de sistemas de vedação vertical externa opaca.',
        'about.text2': 'O banco de dados inclui dados completos de avaliação de ciclo de vida para sistemas construtivos, cobrindo impactos da fase de produção (A1-A3) e métricas de desempenho térmico incluindo valores de transmitância térmica (U) e capacidade térmica (CT).',
        'about.text3': 'A ferramenta foi desenvolvida no Laboratório de Inovação e Fabricação — LIfE, vinculado ao Programa de Pós-Graduação em Engenharia Civil (PPGCI) da Universidade Federal do Rio Grande do Sul (UFRGS).',
        'about.lcaTitle': 'Avaliação do Ciclo de Vida (ACV)',
        'about.lcaText1': 'A Avaliação do Ciclo de Vida (ACV) é uma metodologia padronizada internacionalmente pelas normas ISO 14040 e ISO 14044, que quantifica os impactos ambientais de um produto ou sistema ao longo de todo o seu ciclo de vida — desde a extração de matérias-primas até a disposição final.',
        'about.lcaText2': 'No contexto da construção civil, a ACV permite comparar diferentes sistemas construtivos em termos de emissões de gases de efeito estufa (GWP), acidificação (AP), eutrofização (EP), criação de ozônio fotoquímico (POCP), depleção da camada de ozônio (ODP) e demanda cumulativa de energia (CED).',
        'about.lcaText3': 'A norma europeia EN 15978 e a brasileira NBR ISO 21930 definem as etapas do ciclo de vida das edificações em módulos: A1-A3 (produção), A4-A5 (transporte e construção), B1-B7 (uso) e C1-C4 (fim de vida). Este aplicativo foca nos módulos A1-A3 (produção dos materiais).',
        'about.lcaBoundary': 'Fronteira do Sistema: A1–A3 (Produção)',
        'about.lcaBoundaryDesc': 'A1 — Extração e processamento de matérias-primas; A2 — Transporte de matérias-primas ao fabricante; A3 — Fabricação dos produtos.',
        'about.thermalTitle': 'Desempenho Térmico',
        'about.thermalText1': 'O desempenho térmico de uma edificação está diretamente relacionado à capacidade de seus sistemas construtivos de resistir à transferência de calor. Os principais indicadores utilizados são:',
        'about.thermalU': 'Transmitância Térmica (U)',
        'about.thermalUDesc': 'É o inverso da resistência térmica total. Indica a quantidade de calor que atravessa um componente por unidade de área, de tempo e de diferença de temperatura. Quanto menor o valor U, melhor o isolamento térmico. Unidade: W/(m²·K).',
        'about.thermalCT': 'Capacidade Térmica (CT)',
        'about.thermalCTDesc': 'Indica a quantidade de calor que um componente pode armazenar por unidade de área. Materiais com alta CT ajudam a amortecer variações de temperatura ao longo do dia. Unidade: kJ/(m²·K).',
        'about.thermalText2': 'O desempenho térmico dos sistemas construtivos é regulado por normas nacionais e internacionais que definem valores mínimos e máximos de transmitância e capacidade térmica conforme a zona bioclimática.',
        'about.indicators': 'Indicadores Ambientais',
        'about.indicatorGWP': 'Potencial de Aquecimento Global — Mede a contribuição para o aquecimento global em kg CO₂ equivalente.',
        'about.indicatorAP': 'Potencial de Acidificação — Mede a contribuição para a chuva ácida em kg SO₂ equivalente.',
        'about.indicatorEP': 'Potencial de Eutrofização — Mede a contribuição para o enriquecimento de nutrientes em corpos d\'água em kg PO₄ equivalente.',
        'about.indicatorPOCP': 'Criação de Ozônio Fotoquímico — Mede a contribuição para a formação de smog em kg C₂H₄ equivalente.',
        'about.indicatorODP': 'Depleção da Camada de Ozônio — Mede a contribuição para a destruição da camada de ozônio em kg CFC-11 equivalente.',
        'about.indicatorCED': 'Demanda Cumulativa de Energia — Mede a energia total requerida ao longo do ciclo de vida em MJ.',
        'about.card1.title': 'Baseado em Evidências',
        'about.card1.desc': 'Construído com metodologia ACV rigorosa e dados verificados',
        'about.card2.title': 'Conformidade com Normas',
        'about.card2.desc': 'Alinhado com regulamentações brasileiras e internacionais',
        'about.card3.title': 'Orientado por Pesquisa',
        'about.card3.desc': 'Desenvolvido na UFRGS para uso acadêmico e profissional',
        'about.standardsTitle': 'Normas Técnicas',
        'about.standardsDesc': 'Conformidade com padrões nacionais e internacionais de desempenho térmico e eficiência energética',
        'about.nbr15575Title': 'NBR 15575 — Norma de Desempenho',
        'about.nbr15575Desc': 'A NBR 15575 é a norma brasileira que estabelece requisitos mínimos de desempenho para edificações habitacionais. Ela define valores máximos de transmitância térmica e valores mínimos de capacidade térmica para vedações verticais externas, classificados por zona bioclimática (1 a 8). A conformidade com esta norma é obrigatória para habitações no Brasil.',
        'about.ashrae901Title': 'ASHRAE 90.1 — Padrão de Energia',
        'about.ashrae901Desc': 'O padrão ASHRAE 90.1 define requisitos de eficiência energética para edifícios comerciais e residenciais. Ele classifica as zonas climáticas internacionalmente e especifica valores máximos de transmitância térmica para paredes de envelope, diferenciando entre tipos de construção (mass wall, metal building, etc.).',
        'about.rtqcTitle': 'RTQ-C — Requisitos Técnicos para Edifícios Comerciais',
        'about.rtqcDesc': 'O Regulamento Técnico da Qualidade para o Nível de Eficiência Energética de Edifícios Comerciais, de Serviço e Públicos (RTQ-C) faz parte do Programa Brasileiro de Etiquetagem de Edificações (PBE Edifica). Define pré-requisitos para a envoltória, incluindo limites de transmitância térmica por zona bioclimática.',
        'about.rtqrTitle': 'RTQ-R — Requisitos Técnicos para Edifícios Residenciais',
        'about.rtqrDesc': 'O Regulamento Técnico da Qualidade para o Nível de Eficiência Energética de Edificações Residenciais (RTQ-R) define pré-requisitos específicos para a envoltória de unidades habitacionais autônomas, incluindo valores máximos de transmitância para paredes externas e coberturas.',
        'about.referencesTitle': 'Referências',
        'about.ref1': 'ABNT NBR 15575:2021 — Edificações Habitacionais — Desempenho.',
        'about.ref2': 'ABNT NBR 15220:2005 — Desempenho Térmico de Edificações.',
        'about.ref3': 'ASHRAE Standard 90.1-2022 — Energy Standard for Buildings Except Low-Rise Residential Buildings.',
        'about.ref4': 'ISO 14040:2006 — Environmental Management — Life Cycle Assessment — Principles and Framework.',
        'about.ref5': 'ISO 14044:2006 — Environmental Management — Life Cycle Assessment — Requirements and Guidelines.',
        'about.ref6': 'EN 15978:2011 — Sustainability of Construction Works — Assessment of Environmental Performance of Buildings.',
        'about.ref7': 'INMETRO. Regulamento Técnico da Qualidade para o Nível de Eficiência Energética de Edifícios Comerciais, de Serviço e Públicos (RTQ-C). 2021.',
        'about.ref8': 'INMETRO. Regulamento Técnico da Qualidade para o Nível de Eficiência Energética de Edificações Residenciais (RTQ-R). 2012.',

        // Login Modal
        'login.title': 'Bem-vindo ao E³ Build',
        'login.subtitle': 'Plataforma de Análise de Sistemas Construtivos',
        'login.username': 'Usuário',
        'login.usernamePlaceholder': 'Digite seu usuário',
        'login.password': 'Senha',
        'login.passwordPlaceholder': 'Digite sua senha',
        'login.submit': 'Entrar',
        'login.register': 'Criar Conta',
        'login.help': 'Login: usuário: <strong>ecowallcheck</strong> | senha: <strong>sistemamelhornaoha</strong>',
        'login.error': 'Usuário ou senha inválidos',
        'login.welcome': 'Bem-vindo de volta,',
        'login.actionRequired': 'É necessário fazer login para realizar esta ação.',

        // Register
        'register.title': 'Criar Nova Conta',
        'register.fullName': 'Nome Completo *',
        'register.fullNamePlaceholder': 'Digite seu nome completo',
        'register.email': 'E-mail *',
        'register.emailPlaceholder': 'Digite seu e-mail',
        'register.username': 'Nome de Usuário *',
        'register.usernamePlaceholder': 'Escolha um nome de usuário',
        'register.usernameHint': 'Apenas letras, números e underscores (mín. 3 caracteres)',
        'register.password': 'Senha *',
        'register.passwordPlaceholder': 'Crie uma senha',
        'register.confirmPassword': 'Confirmar Senha *',
        'register.confirmPasswordPlaceholder': 'Confirme sua senha',
        'register.usage': 'Para que vai usar? *',
        'register.usageSelect': 'Selecione uma opção',
        'register.usageAcademic': 'Pesquisa Acadêmica',
        'register.usageProfessional': 'Trabalho Profissional',
        'register.usageEducation': 'Educação/Ensino',
        'register.usagePersonal': 'Projetos Pessoais',
        'register.usageOther': 'Outro',
        'register.education': 'Formação *',
        'register.educationSelect': 'Selecione sua formação',
        'register.educationUndergrad': 'Graduando',
        'register.educationGrad': 'Pós-Graduando',
        'register.educationBachelor': 'Graduação Completa',
        'register.educationMaster': 'Mestrado',
        'register.educationPhd': 'Doutorado',
        'register.educationOther': 'Outro',
        'register.field': 'Área de Formação *',
        'register.fieldPlaceholder': 'ex: Arquitetura, Engenharia Civil',
        'register.submit': 'Criar Conta',
        'register.cancel': 'Cancelar',
        'register.success': 'Conta criada com sucesso! Bem-vindo,',
        'register.errorPasswords': 'As senhas não coincidem',
        'register.errorExists': 'Nome de usuário já existe. Por favor, escolha outro.',
        'register.errorEmail': 'E-mail já cadastrado',

        // Footer
        'footer.copy': '© 2025 E³ Build - UFRGS/PPGCI. Energy, Environment, Envelope for Buildings.',

        // Misc
        'loading.title': 'E³ Build',
        'loading.subtitle': 'Carregando dados...',
        'loading.error': 'Erro ao carregar dados',
        'loading.retry': 'Por favor, recarregue a página',
        'alert.systemCreated': 'Sistema criado com sucesso!',
        'alert.systemDeleted': 'Sistema deletado com sucesso',
        'alert.comparisonDeleted': 'Comparação deletada com sucesso',
        'alert.maxSystems': 'Máximo de 5 sistemas podem ser comparados de cada vez',
        'confirm.deleteSystem': 'Tem certeza que deseja deletar este sistema?',
        'confirm.deleteComparison': 'Tem certeza que deseja deletar esta comparação?',

        // Tooltips — Compare page
        'tooltip.compare.selected': 'Os sistemas selecionados para comparação aparecem aqui. Selecione sistemas na aba "Sistemas".',
        'tooltip.compare.btn': 'Clique para gerar gráficos e tabela comparativa dos sistemas selecionados (mín. 2, máx. 3)',

        // Tooltips — Create page
        'tooltip.create.name': 'Dê um nome descritivo ao sistema, por exemplo: "Bloco cerâmico 14cm com EPS"',
        'tooltip.create.type': 'Selecione a categoria principal do sistema construtivo',
        'tooltip.create.uValue': 'Transmitância térmica: indica a quantidade de calor que atravessa o sistema. Quanto menor, melhor o isolamento. Unidade: W/(m²·K)',
        'tooltip.create.thermalCapacity': 'Indica a quantidade de calor que o sistema armazena. Alta CT amortece variações de temperatura. Unidade: kJ/(m²·K)',
        'tooltip.create.weight': 'Peso total do sistema construtivo por metro quadrado de parede',
        'tooltip.create.thickness': 'Espessura total do sistema de vedação, incluindo todas as camadas',
        'tooltip.create.lightSystem': 'Marque se o sistema é leve (< 60 kg/m²), como steel frame ou drywall',
        'tooltip.create.thermalInsulation': 'Marque se o sistema possui camada de isolamento térmico (EPS, lã de rocha, etc.)',
        'tooltip.create.components': 'Adicione as camadas que compõem o sistema (ex.: bloco, argamassa, revestimento). A ordem importa: da camada externa para a interna.',
        'tooltip.create.selectedLayers': 'Camadas adicionadas ao sistema. Arraste para reordenar ou clique em × para remover.',
        'tooltip.create.save': 'Salva o sistema no seu histórico pessoal. Requer login.',
        'tooltip.create.clear': 'Limpa todos os campos e camadas selecionadas',

        // Tooltips — History page
        'tooltip.history.createdTab': 'Sistemas construtivos que você criou e salvou',
        'tooltip.history.comparisonsTab': 'Comparações entre sistemas que você realizou anteriormente',
        'tooltip.history.print': 'Imprimir ou salvar o histórico como PDF',
    },

    'en': {
        // Navigation
        'nav.home': 'Home',
        'nav.systems': 'Systems',
        'nav.compare': 'Compare Systems',
        'nav.create': 'Create & Evaluate',
        'nav.history': 'My Projects',
        'nav.about': 'Learn More',
        'nav.login': 'Sign In',
        'nav.logout': 'Sign Out',
        'nav.myAccount': 'My Account',

        // Hero
        'hero.badge': 'Life Cycle Assessment for Buildings',
        'hero.title': 'Environmental performance of',
        'hero.titleHighlight': 'External Wall Systems',
        'hero.description': 'Research tool developed to evaluate environmental impacts and thermal performance of opaque external vertical cladding systems, covering production phase impacts (A1-A3) and thermal performance metrics.',
        'hero.cta': 'View Systems',
        'hero.learnMore': 'Learn More',
        'hero.statSystems': 'Building Systems',
        'hero.statComponents': 'Components',
        'hero.statStandards': 'Standards',
        'hero.compliance': 'Compliant with ASHRAE 90.1, NBR 15575, RTQ-C and RTQ-R.',

        // Home info sections
        'home.whatIsTitle': 'What is it',
        'home.whatIsP1': 'E³ Build is an application aimed at the conscious selection of external vertical cladding systems during the design process.',
        'home.whatIsP2': 'The tool allows you to evaluate and compare the thermal performance and environmental impacts of different construction solutions, supporting more efficient, sustainable, and data-driven decisions. It also enables the creation of custom systems, tailored to the specific needs of each project.',
        'home.applicationsTitle': 'Applications',
        'home.app1': 'Selection of the most suitable construction systems for the project',
        'home.app2': 'Comparison between alternatives based on thermal performance and environmental impact',
        'home.app3': 'Support for continuous improvement of the design process',
        'home.app4': 'Technical basis for decision-making in early design phases',
        'home.howToUseTitle': 'How to Use',
        'home.use1': 'Browsing available construction systems in the systems explorer',
        'home.use2': 'Comparing different solutions to evaluate performance and environmental impact',
        'home.use3': 'Creating custom systems according to project needs',
        'home.use4': 'Analyzing results to support choosing the best solution',
        'home.indicatorsTitle': 'Understand the indicators',
        'home.thermalLabel': 'Thermal Performance',
        'home.thermalDesc': 'Understand how U-value and thermal capacity influence comfort.',
        'home.lcaLabel': 'Environmental Impact',
        'home.lcaDesc': 'What is GWP, CED and how to interpret the results.',
        'home.learnMoreBtn': 'Learn more',
        'home.featuresTitle': 'Explore the features',

        // Feature Cards
        'feature.catalog.title': 'Systems Catalog',
        'feature.catalog.desc': 'Check the catalog with thermal performance and environmental impact information.',
        'feature.compare.title': 'Impact Comparison',
        'feature.compare.desc': 'Select systems to compare and evaluate the best option for your project.',
        'feature.create.title': 'Create & Calculate',
        'feature.create.desc': 'Build an external wall system and automatically calculate its impacts.',
        'feature.history.title': 'History',
        'feature.history.desc': 'Save your projects and comparisons for future review.',

        // Systems Section
        'systems.title': 'Building Systems Library',
        'systems.subtitle': 'External Vertical Cladding Systems are parts of the residential building that vertically limit the building and its environments, such as facades and walls.',
        'systems.cta': 'Check the thermal performance information and environmental impacts of the building system.',
        'systems.expandTitle': 'Explore Vertical Cladding Systems',
        'systems.expandP1': 'Browse different opaque vertical cladding construction systems, such as solid concrete walls, concrete blocks, ceramic blocks, and drywall systems.',
        'systems.expandP2': 'For each system, thermal performance and environmental impact data are presented, helping with comparison and design decision-making.',
        'systems.search': 'Search systems by name...',
        'systems.filterType': 'Type:',
        'systems.allTypes': 'All Types',
        'systems.filterInsulation': 'Thermal Insulation:',
        'systems.all': 'All',
        'systems.yes': 'Yes',
        'systems.no': 'No',
        'systems.filterOrigin': 'Origin:',
        'systems.allSystems': 'All Systems',
        'systems.mySystems': 'My Systems',
        'systems.database': 'Library Systems',
        'systems.clearFilters': 'Clear Filters',
        'systems.print': 'Print',
        'systems.loading': 'Loading systems...',
        'systems.noResults': 'No systems found matching your criteria',
        'systems.selected': '✓ Selected',
        'systems.select': '+ Select',
        'systems.viewCard': '📖 View System Card',
        'systems.concrete': 'Concrete',
        'systems.ceramic': 'Ceramic',
        'systems.steelframe': 'Steel Frame',
        'systems.other': 'Others',
        'systems.prev': '‹ Previous',
        'systems.next': 'Next ›',

        // Compare Section
        'compare.title': 'Compare Systems',
        'compare.description': 'Choose the comparison method and select the external wall systems.',
        'compare.stepMethod': '1. Choose the comparison method',
        'compare.methodThermal': 'Thermal Performance',
        'compare.methodThermalDesc': 'Compare all systems based on thermal performance standards (NBR, ASHRAE, RTQ-C, RTQ-R)',
        'compare.methodGroups': 'System Groups',
        'compare.methodGroupsDesc': 'Compare environmental impacts between systems — select individually or compare all at once',
        'compare.back': 'Back',
        'compare.thermalTitle': 'Thermal Performance Comparison',
        'compare.thermalDesc': 'Select a technical standard to check compliance of all systems:',
        'compare.normNBR': 'Performance Standard — Residential Buildings (Zones 1–8)',
        'compare.normRTQR': 'Technical Requirements — Residential Buildings (Zones 1–8)',
        'compare.normRTQC': 'Technical Requirements — Commercial Buildings (Zones 1–8)',
        'compare.normASHRAERes': 'Energy Standard — Residential Buildings (Zones 0–3)',
        'compare.normASHRAECom': 'Energy Standard — Commercial Buildings (Zones 0–3)',
        'compare.groupsTitle': 'System Groups Comparison',
        'compare.approachIndividual': 'Individual Selection',
        'compare.approachAll': 'Compare All',
        'compare.individualDesc': 'Select up to 5 systems to compare their environmental impacts:',
        'compare.allDesc': 'Compare all library systems at once, viewing environmental impacts and thermal performance of the entire database.',
        'compare.compareAllBtn': 'Compare All Systems',
        'compare.searchPlaceholder': 'Search systems by name...',
        'compare.empty': 'No systems selected',
        'compare.btn': 'Compare Selected',
        'compare.results': 'Comparison Results',
        'compare.allResultsTitle': 'All Systems Comparison',
        'compare.thermalResultsTitle': 'Thermal Compliance',
        'compare.property': 'Property',
        'compare.system': 'System',
        'compare.zone': 'Zone',
        'compare.chartsTitle': 'Environmental Impacts',
        'compare.rtqcGrades': 'Energy rating: A (best) → B → CD → E (non-compliant)',
        'compare.standardsTitle': 'Thermal Standards Compliance',
        'compare.standard': 'Standard',
        'compare.loginRequired': 'Sign in to compare systems',

        // System card labels
        'card.weight': 'Weight',
        'card.thickness': 'Thk.',
        'card.insulation': 'Insulation',
        'card.light': 'Lightweight',

        // System detail modal
        'detail.identification': 'Identification',
        'detail.boundary': 'Boundary',
        'detail.unit': 'Unit',
        'detail.weight': 'Weight',
        'detail.thickness': 'Thickness',
        'detail.lightweight': 'Lightweight System',
        'detail.insulation': 'Thermal Insulation',
        'detail.yes': 'Yes',
        'detail.no': 'No',
        'detail.layers': 'Layers (interior → exterior)',
        'detail.thermalProps': 'Thermal Properties',
        'detail.thermalTransmittance': 'Thermal Transmittance (U)',
        'detail.thermalCapacity': 'Thermal Capacity (CT)',
        'detail.envImpacts': 'Environmental Impacts (A1-A3)',
        'detail.energyConsumption': 'Energy Consumption (CED)',
        'detail.total': 'Total',
        'detail.component': 'Component',

        // Filter type options
        'filter.concreteBlock': 'Concrete block',
        'filter.concreteWall': 'Concrete wall',
        'filter.ceramicBlock': 'Ceramic block',
        'filter.steelFrame': 'Steel frame (light)',

        // Cartilha (System Card)
        'cartilha.title': 'System Card',
        'cartilha.identification': '1. SYSTEM IDENTIFICATION',
        'cartilha.system': 'System',
        'cartilha.boundary': 'System boundary',
        'cartilha.functionalUnit': 'Functional unit',
        'cartilha.weight': 'Weight',
        'cartilha.totalThickness': 'Total thickness',
        'cartilha.lightweight': 'Lightweight system',
        'cartilha.insulation': 'Thermal insulation',
        'cartilha.composition': 'Composition (interior → exterior):',
        'cartilha.thermalPerf': '2. THERMAL PERFORMANCE',
        'cartilha.property': 'Property',
        'cartilha.value': 'Value',
        'cartilha.unitCol': 'Unit',
        'cartilha.thermalTransmittance': 'Thermal Transmittance (U)',
        'cartilha.thermalCapacity': 'Thermal Capacity (CT)',
        'cartilha.envImpacts': '3. ENVIRONMENTAL IMPACTS (A1-A3)',
        'cartilha.indicator': 'Indicator',
        'cartilha.energyCED': '4. ENERGY CONSUMPTION (CED)',
        'cartilha.total': 'Total',
        'cartilha.component': 'Component',
        'cartilha.charts': '5. CHARTS',
        'cartilha.chartSubtitle': 'Impact Distribution by Component',
        'cartilha.standards': '6. STANDARDS COMPLIANCE',
        'cartilha.standard': 'Standard',
        'cartilha.zone': 'Zone',
        'cartilha.result': 'Result',
        'cartilha.pass': 'COMPLIANT ✓',
        'cartilha.fail': 'NON-COMPLIANT ✗',

        // Create Section
        'create.title': 'Create Custom System',
        'create.description': 'Design your own cladding system',
        'create.name': 'System Name *',
        'create.namePlaceholder': 'Enter system name',
        'create.type': 'Type *',
        'create.selectType': 'Select type',
        'create.uValue': 'U-Value (W/m²K) *',
        'create.thermalCapacity': 'Thermal Capacity (kJ/m²K) *',
        'create.weight': 'Weight (kg/m²) *',
        'create.thickness': 'Thickness (cm) *',
        'create.lightSystem': 'Lightweight System',
        'create.thermalInsulation': 'Thermal Insulation',
        'create.componentsTitle': 'System Components',
        'create.componentsDesc': 'Select the components that make up the cladding system. The software will automatically calculate thermal transmittance and environmental impacts.',
        'create.available': 'Available Components',
        'create.searchComponent': 'Search component...',
        'create.selectedLayers': 'Selected Layers (drag to reorder)',
        'create.noLayers': 'No layers selected',
        'create.save': 'Save System',
        'create.clear': 'Clear Form',
        'create.loginRequired': 'Sign in to create systems',

        // History Section
        'history.title': 'History',
        'history.description': 'Access the systems you created and your comparison history.',
        'history.createdTab': 'Created Systems',
        'history.comparisonsTab': 'Comparison History',
        'history.noSystems': 'No systems created yet. Create your first system above!',
        'history.noComparisons': 'No comparisons yet. Compare systems to see history here!',
        'history.loginRequired': 'Sign in to view your history',
        'history.viewDetails': 'View Details',
        'history.viewPDF': 'View PDF',
        'history.print': 'Print',
        'history.delete': 'Delete',

        // About / Learn More Section
        'about.title': 'Learn More',
        'about.introTitle': 'About E³ Build',
        'about.text1': 'E³ Build (Energy, Environment, Envelope) is a research tool developed to evaluate environmental impacts and thermal performance of opaque external vertical cladding systems.',
        'about.text2': 'The database includes complete life cycle assessment data for building systems, covering production phase impacts (A1-A3) and thermal performance metrics including thermal transmittance (U-value) and thermal capacity (CT).',
        'about.text3': 'The tool was developed at the Innovation and Manufacturing Laboratory — LIfE, linked to the Graduate Program in Civil Engineering (PPGCI) at the Federal University of Rio Grande do Sul (UFRGS).',
        'about.lcaTitle': 'Life Cycle Assessment (LCA)',
        'about.lcaText1': 'Life Cycle Assessment (LCA) is an internationally standardized methodology (ISO 14040 and ISO 14044) that quantifies the environmental impacts of a product or system throughout its entire life cycle — from raw material extraction to final disposal.',
        'about.lcaText2': 'In the context of construction, LCA enables comparing different building systems in terms of greenhouse gas emissions (GWP), acidification (AP), eutrophication (EP), photochemical ozone creation (POCP), ozone layer depletion (ODP) and cumulative energy demand (CED).',
        'about.lcaText3': 'The European standard EN 15978 and the Brazilian standard NBR ISO 21930 define building life cycle stages in modules: A1-A3 (production), A4-A5 (transport and construction), B1-B7 (use) and C1-C4 (end of life). This application focuses on modules A1-A3 (material production).',
        'about.lcaBoundary': 'System Boundary: A1–A3 (Production)',
        'about.lcaBoundaryDesc': 'A1 — Raw material extraction and processing; A2 — Transport of raw materials to manufacturer; A3 — Product manufacturing.',
        'about.thermalTitle': 'Thermal Performance',
        'about.thermalText1': 'The thermal performance of a building is directly related to the ability of its construction systems to resist heat transfer. The main indicators used are:',
        'about.thermalU': 'Thermal Transmittance (U-value)',
        'about.thermalUDesc': 'The inverse of total thermal resistance. It indicates the amount of heat that passes through a component per unit area, time and temperature difference. The lower the U-value, the better the thermal insulation. Unit: W/(m²·K).',
        'about.thermalCT': 'Thermal Capacity (CT)',
        'about.thermalCTDesc': 'Indicates the amount of heat a component can store per unit area. Materials with high CT help dampen temperature variations throughout the day. Unit: kJ/(m²·K).',
        'about.thermalText2': 'The thermal performance of construction systems is regulated by national and international standards that define minimum and maximum values of transmittance and thermal capacity according to the bioclimatic zone.',
        'about.indicators': 'Environmental Indicators',
        'about.indicatorGWP': 'Global Warming Potential — Measures contribution to global warming in kg CO₂ equivalent.',
        'about.indicatorAP': 'Acidification Potential — Measures contribution to acid rain in kg SO₂ equivalent.',
        'about.indicatorEP': 'Eutrophication Potential — Measures contribution to nutrient enrichment in water bodies in kg PO₄ equivalent.',
        'about.indicatorPOCP': 'Photochemical Ozone Creation — Measures contribution to smog formation in kg C₂H₄ equivalent.',
        'about.indicatorODP': 'Ozone Depletion Potential — Measures contribution to ozone layer destruction in kg CFC-11 equivalent.',
        'about.indicatorCED': 'Cumulative Energy Demand — Measures total energy required throughout the life cycle in MJ.',
        'about.card1.title': 'Evidence-Based',
        'about.card1.desc': 'Built with rigorous LCA methodology and verified data',
        'about.card2.title': 'Standards Compliance',
        'about.card2.desc': 'Aligned with Brazilian and international regulations',
        'about.card3.title': 'Research-Driven',
        'about.card3.desc': 'Developed at UFRGS for academic and professional use',
        'about.standardsTitle': 'Technical Standards',
        'about.standardsDesc': 'Compliance with national and international standards for thermal performance and energy efficiency',
        'about.nbr15575Title': 'NBR 15575 — Performance Standard',
        'about.nbr15575Desc': 'NBR 15575 is the Brazilian standard that establishes minimum performance requirements for residential buildings. It defines maximum thermal transmittance values and minimum thermal capacity values for external vertical cladding, classified by bioclimatic zone (1 to 8). Compliance with this standard is mandatory for housing in Brazil.',
        'about.ashrae901Title': 'ASHRAE 90.1 — Energy Standard',
        'about.ashrae901Desc': 'The ASHRAE 90.1 standard defines energy efficiency requirements for commercial and residential buildings. It classifies climate zones internationally and specifies maximum thermal transmittance values for envelope walls, differentiating between construction types (mass wall, metal building, etc.).',
        'about.rtqcTitle': 'RTQ-C — Commercial Building Requirements',
        'about.rtqcDesc': 'The Technical Quality Regulation for Energy Efficiency Level of Commercial, Service and Public Buildings (RTQ-C) is part of the Brazilian Building Labeling Program (PBE Edifica). It defines prerequisites for the envelope, including thermal transmittance limits by bioclimatic zone.',
        'about.rtqrTitle': 'RTQ-R — Residential Building Requirements',
        'about.rtqrDesc': 'The Technical Quality Regulation for Energy Efficiency Level of Residential Buildings (RTQ-R) defines specific prerequisites for the envelope of autonomous housing units, including maximum transmittance values for external walls and roofing.',
        'about.referencesTitle': 'References',
        'about.ref1': 'ABNT NBR 15575:2021 — Residential Buildings — Performance.',
        'about.ref2': 'ABNT NBR 15220:2005 — Thermal Performance of Buildings.',
        'about.ref3': 'ASHRAE Standard 90.1-2022 — Energy Standard for Buildings Except Low-Rise Residential Buildings.',
        'about.ref4': 'ISO 14040:2006 — Environmental Management — Life Cycle Assessment — Principles and Framework.',
        'about.ref5': 'ISO 14044:2006 — Environmental Management — Life Cycle Assessment — Requirements and Guidelines.',
        'about.ref6': 'EN 15978:2011 — Sustainability of Construction Works — Assessment of Environmental Performance of Buildings.',
        'about.ref7': 'INMETRO. Technical Quality Regulation for Energy Efficiency Level of Commercial, Service and Public Buildings (RTQ-C). 2021.',
        'about.ref8': 'INMETRO. Technical Quality Regulation for Energy Efficiency Level of Residential Buildings (RTQ-R). 2012.',

        // Login Modal
        'login.title': 'Welcome to E³ Build',
        'login.subtitle': 'Building Systems Analysis Platform',
        'login.username': 'Username',
        'login.usernamePlaceholder': 'Enter your username',
        'login.password': 'Password',
        'login.passwordPlaceholder': 'Enter your password',
        'login.submit': 'Sign In',
        'login.register': 'Create Account',
        'login.help': 'Login: user: <strong>ecowallcheck</strong> | password: <strong>sistemamelhornaoha</strong>',
        'login.error': 'Invalid username or password',
        'login.welcome': 'Welcome back,',
        'login.actionRequired': 'You need to sign in to perform this action.',

        // Register
        'register.title': 'Create New Account',
        'register.fullName': 'Full Name *',
        'register.fullNamePlaceholder': 'Enter your full name',
        'register.email': 'Email *',
        'register.emailPlaceholder': 'Enter your email',
        'register.username': 'Username *',
        'register.usernamePlaceholder': 'Choose a username',
        'register.usernameHint': 'Letters, numbers and underscores only (min. 3 characters)',
        'register.password': 'Password *',
        'register.passwordPlaceholder': 'Create a password',
        'register.confirmPassword': 'Confirm Password *',
        'register.confirmPasswordPlaceholder': 'Confirm your password',
        'register.usage': 'Intended use? *',
        'register.usageSelect': 'Select an option',
        'register.usageAcademic': 'Academic Research',
        'register.usageProfessional': 'Professional Work',
        'register.usageEducation': 'Education/Teaching',
        'register.usagePersonal': 'Personal Projects',
        'register.usageOther': 'Other',
        'register.education': 'Education *',
        'register.educationSelect': 'Select your education',
        'register.educationUndergrad': 'Undergraduate',
        'register.educationGrad': 'Graduate Student',
        'register.educationBachelor': 'Bachelor\'s Degree',
        'register.educationMaster': 'Master\'s Degree',
        'register.educationPhd': 'PhD',
        'register.educationOther': 'Other',
        'register.field': 'Field of Study *',
        'register.fieldPlaceholder': 'e.g., Architecture, Civil Engineering',
        'register.submit': 'Create Account',
        'register.cancel': 'Cancel',
        'register.success': 'Account created successfully! Welcome,',
        'register.errorPasswords': 'Passwords do not match',
        'register.errorExists': 'Username already exists. Please choose another.',
        'register.errorEmail': 'Email already registered',

        // Footer
        'footer.copy': '© 2025 E³ Build - UFRGS/PPGCI. Energy, Environment, Envelope for Buildings.',

        // Misc
        'loading.title': 'E³ Build',
        'loading.subtitle': 'Loading data...',
        'loading.error': 'Error loading data',
        'loading.retry': 'Please reload the page',
        'alert.systemCreated': 'System created successfully!',
        'alert.systemDeleted': 'System deleted successfully',
        'alert.comparisonDeleted': 'Comparison deleted successfully',
        'alert.maxSystems': 'Maximum of 5 systems can be compared at once',
        'confirm.deleteSystem': 'Are you sure you want to delete this system?',
        'confirm.deleteComparison': 'Are you sure you want to delete this comparison?',

        // Tooltips — Compare page
        'tooltip.compare.selected': 'Systems selected for comparison appear here. Select systems from the "Systems" tab.',
        'tooltip.compare.btn': 'Click to generate charts and comparison table for the selected systems (min. 2, max. 3)',

        // Tooltips — Create page
        'tooltip.create.name': 'Give your system a descriptive name, e.g.: "Ceramic block 14cm with EPS"',
        'tooltip.create.type': 'Select the main category of the construction system',
        'tooltip.create.uValue': 'Thermal transmittance: indicates how much heat passes through the system. Lower is better insulation. Unit: W/(m²·K)',
        'tooltip.create.thermalCapacity': 'Indicates how much heat the system stores. High CT dampens temperature variations. Unit: kJ/(m²·K)',
        'tooltip.create.weight': 'Total weight of the construction system per square meter of wall',
        'tooltip.create.thickness': 'Total thickness of the wall system, including all layers',
        'tooltip.create.lightSystem': 'Check if the system is lightweight (< 60 kg/m²), such as steel frame or drywall',
        'tooltip.create.thermalInsulation': 'Check if the system has a thermal insulation layer (EPS, rock wool, etc.)',
        'tooltip.create.components': 'Add the layers that make up the system (e.g.: block, mortar, coating). Order matters: from outer to inner layer.',
        'tooltip.create.selectedLayers': 'Layers added to the system. Drag to reorder or click × to remove.',
        'tooltip.create.save': 'Save the system to your personal history. Requires login.',
        'tooltip.create.clear': 'Clear all fields and selected layers',

        // Tooltips — History page
        'tooltip.history.createdTab': 'Construction systems you created and saved',
        'tooltip.history.comparisonsTab': 'Comparisons between systems you performed previously',
        'tooltip.history.print': 'Print or save the history as PDF',
    }
};

// ===== Data-level Translation Dictionary (PT → EN) =====
// Used to translate system names, layer names, component names, and field values
// coming from the JSON data files when the UI is set to English.
const dataTranslations = {
    // --- System name parts ---
    'Sistema': 'System',
    'Concreto Estrutural': 'Structural Concrete',
    'Concreto estrutural': 'Structural Concrete',
    'Cerâmico': 'Ceramic',
    'Concreto': 'Concrete',
    'Steel frame': 'Steel Frame',

    // --- Layer names ---
    'Pintura interna': 'Interior paint',
    'Pintura Interna': 'Interior paint',
    'Pintura externa': 'Exterior paint',
    'Argamassa interna': 'Interior mortar',
    'Argamassa externa': 'Exterior mortar',
    'Argamassa de assentamento': 'Laying mortar',
    'Bloco cerâmico': 'Ceramic block',
    'Bloco de concreto': 'Concrete block',
    'Concreto maciço': 'Solid concrete',
    'Tijolo maciço': 'Solid brick',
    'Câmara de ar': 'Air gap',
    'Câmara de Ar': 'Air gap',
    'Gesso': 'Gypsum',
    'Granito': 'Granite',
    'Lã de rocha': 'Rock wool',
    'Lã de Rocha': 'Rock wool',
    'Poliestireno': 'Polystyrene',
    'Placa Cimentícia': 'Cement board',
    'Placa de Gesso': 'Gypsum board',
    'Placa melamínica': 'Melamine board',
    'Alumínio composto': 'Composite aluminium',

    // --- Component names (CED table) ---
    'Aço galvanizado': 'Galvanized steel',
    'Aço': 'Steel',
    'Alumínio composto': 'Composite aluminium',
    'Alvenaria': 'Masonry',
    'Argamassa de assentamento': 'Laying mortar',
    'Argamassa de revestimento': 'Rendering mortar',
    'Armadura': 'Reinforcement',
    'Forma': 'Formwork',
    'Isolante': 'Insulation',
    'MDF': 'MDF',
    'Perfis de Aço': 'Steel profiles',
    'Pintura': 'Paint',
    'Placa de Cimentícia': 'Cement board',
    'Placa de Gesso': 'Gypsum board',

    // --- Field values ---
    'Fase de produção (A1-3)': 'Production phase (A1-3)',
    '1m²': '1 m²',
    'Sistema Personalizado': 'Custom System'
};

/**
 * Translate a data-level string from Portuguese to English.
 * If the current language is PT-BR, the original string is returned unchanged.
 * If the current language is EN, the dictionary is consulted.
 * For system names (e.g., "Sistema 13 - Cerâmico"), partial replacement is done.
 */
function tData(str) {
    if (!str || typeof str !== 'string') return str || '—';
    if (i18n.getLang() !== 'en') return str;

    // Direct match first
    if (dataTranslations[str]) return dataTranslations[str];

    // Partial / composite translation for system names like "Sistema 13 - Concreto Estrutural"
    let result = str;
    // Sort keys by length descending so longer matches are applied first
    const sortedKeys = Object.keys(dataTranslations).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
        if (result.includes(key)) {
            result = result.split(key).join(dataTranslations[key]);
        }
    }
    return result;
}

// ===== i18n Manager =====
class I18nManager {
    constructor() {
        this.currentLang = localStorage.getItem('e3build_lang') || 'pt-BR';
    }

    t(key) {
        const lang = translations[this.currentLang];
        return lang && lang[key] ? lang[key] : key;
    }

    setLanguage(lang) {
        if (translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('e3build_lang', lang);
            this.updatePage();
            // Update flag active states
            document.querySelectorAll('.lang-flag').forEach(f => f.classList.remove('active'));
            const activeFlag = document.querySelector(`.lang-flag[data-lang="${lang}"]`);
            if (activeFlag) activeFlag.classList.add('active');
        }
    }

    getLang() {
        return this.currentLang;
    }

    updatePage() {
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const val = this.t(key);
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = val;
            } else if (el.tagName === 'OPTION') {
                el.textContent = val;
            } else {
                el.innerHTML = val;
            }
        });

        // Update all elements with data-i18n-placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            el.placeholder = this.t(el.getAttribute('data-i18n-placeholder'));
        });

        // Update all elements with data-i18n-tooltip
        document.querySelectorAll('[data-i18n-tooltip]').forEach(el => {
            el.setAttribute('data-tooltip', this.t(el.getAttribute('data-i18n-tooltip')));
        });

        // Dispatch event so other code can react
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: this.currentLang } }));
    }
}

// Global instance
const i18n = new I18nManager();
