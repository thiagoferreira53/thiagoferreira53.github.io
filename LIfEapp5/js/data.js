// Data Manager for LIfE App
class DataManager {
    constructor() {
        this.systems = [];
        this.components = [];
        this.regulations = {
            ashrae_residential: null,
            ashrae_commercial: null,
            nbr15575: null,
            rtqc: null,
            rtqr: null
        };
        this.loaded = false;
    }

    async loadAll() {
        try {
            // Load systems and components
            const [systemsData, componentsData] = await Promise.all([
                fetch('assets/sistemas.json').then(r => r.json()),
                fetch('assets/componentes.json').then(r => r.json())
            ]);

            this.systems = systemsData;
            this.components = componentsData;

            // Load regulations (optional)
            try {
                const [ashrae_res, ashrae_com, nbr, rtqc, rtqr] = await Promise.all([
                    fetch('assets/ASHRAE901_residencial.json').then(r => r.json()).catch(() => null),
                    fetch('assets/ASHRAE901_nao_residencial.json').then(r => r.json()).catch(() => null),
                    fetch('assets/NBR15575.json').then(r => r.json()).catch(() => null),
                    fetch('assets/RTQC.json').then(r => r.json()).catch(() => null),
                    fetch('assets/RTQR.json').then(r => r.json()).catch(() => null)
                ]);

                this.regulations.ashrae_residential = ashrae_res;
                this.regulations.ashrae_commercial = ashrae_com;
                this.regulations.nbr15575 = nbr;
                this.regulations.rtqc = rtqc;
                this.regulations.rtqr = rtqr;
            } catch (e) {
                console.warn('Some regulations data could not be loaded:', e);
            }

            this.loaded = true;
            return true;
        } catch (error) {
            console.error('Error loading data:', error);
            throw error;
        }
    }

    getSystems(filters = {}) {
        let filtered = [...this.systems];

        // Filtro de busca por nome
        if (filters.search && filters.search.trim() !== '') {
            filtered = filtered.filter(s => 
                s.nome.toLowerCase().includes(filters.search.toLowerCase())
            );
        }

        // Filtro de origem (custom ou database)
        if (filters.origin) {
            if (filters.origin === 'custom') {
                filtered = filtered.filter(s => s.custom === true);
            } else if (filters.origin === 'database') {
                filtered = filtered.filter(s => !s.custom);
            }
        }

        if (filters.type) {
            const ft = filters.type.toLowerCase();
            filtered = filtered.filter(s => {
                const nome = (s.nome || '').toLowerCase();
                const layers = (s.identificacao?.camadas || []).map(c => c.toLowerCase());
                const allLayers = layers.join(' ');

                // Special mapping for filter types
                if (ft === 'bloco de concreto') {
                    return layers.some(l => l.includes('bloco de concreto'));
                }
                if (ft === 'parede de concreto') {
                    return layers.some(l => l.includes('concreto maciço') || l.includes('concreto macico'));
                }
                if (ft === 'bloco cerâmico' || ft === 'bloco ceramico') {
                    return layers.some(l => l.includes('bloco cerâmico') || l.includes('bloco ceramico') || l.includes('tijolo'));
                }
                if (ft === 'steel frame (leve)' || ft === 'drywall (leve)') {
                    return nome.includes('steel frame') || nome.includes('drywall') || allLayers.includes('placa cimentícia') || allLayers.includes('placa de gesso');
                }

                // Default: check layers and name
                const hasLayer = layers.some(l => l.includes(ft));
                const hasInName = nome.includes(ft);
                return hasLayer || hasInName;
            });
        }

        if (filters.isolante !== undefined && filters.isolante !== '') {
            filtered = filtered.filter(s => 
                s.identificacao.descricao.isolante_termico === (filters.isolante === 'true')
            );
        }

        if (filters.minTransmitancia) {
            filtered = filtered.filter(s => 
                s.transmitancia >= parseFloat(filters.minTransmitancia)
            );
        }

        if (filters.maxTransmitancia) {
            filtered = filtered.filter(s => 
                s.transmitancia <= parseFloat(filters.maxTransmitancia)
            );
        }

        return filtered;
    }

    getSystemById(id) {
        return this.systems.find((s, index) => index === id) || 
               this.systems.find(s => s.nome === id);
    }

    getComponents() {
        return this.components;
    }

    getRegulations() {
        return this.regulations;
    }

    // Calculate system ranking by environmental impact
    rankSystems(impactType = 'gwp') {
        return [...this.systems]
            .sort((a, b) => {
                const aImpact = a.impactos[impactType] || 0;
                const bImpact = b.impactos[impactType] || 0;
                return aImpact - bImpact;
            });
    }

    // Get summary statistics
    getStatistics() {
        if (this.systems.length === 0) return null;

        const stats = {
            totalSystems: this.systems.length,
            totalComponents: this.components.length,
            avgTransmitancia: 0,
            avgCapacidade: 0,
            avgGWP: 0,
            lightSystems: 0,
            insulatedSystems: 0
        };

        this.systems.forEach(s => {
            stats.avgTransmitancia += s.transmitancia || 0;
            stats.avgCapacidade += s.capacidade_termica || 0;
            stats.avgGWP += s.impactos.gwp || 0;
            if (s.identificacao.descricao.sistema_leve) stats.lightSystems++;
            if (s.identificacao.descricao.isolante_termico) stats.insulatedSystems++;
        });

        stats.avgTransmitancia /= this.systems.length;
        stats.avgCapacidade /= this.systems.length;
        stats.avgGWP /= this.systems.length;

        return stats;
    }
}

// Global data manager instance
const dataManager = new DataManager();
