/**
 * Sistema de Habilidades Desbloqueables
 * Permite al jugador desbloquear y mejorar habilidades permanentes
 *
 * @class AbilitySystem
 * @description Sistema de progresión con:
 * - Árbol de habilidades
 * - Múltiples ramas (Velocidad, Defensa, Ataque, Utilidad)
 * - Sistema de puntos de habilidad
 * - Sinergias entre habilidades
 * - Habilidades pasivas y activas
 */

import Storage from '../utils/Storage.js';

export class AbilitySystem {
    constructor() {
        // Árboles de habilidades
        this.trees = {
            speed: {
                name: 'Velocidad',
                icon: '⚡',
                color: '#ffaa00',
                abilities: this._defineSpeedAbilities()
            },
            defense: {
                name: 'Defensa',
                icon: '🛡️',
                color: '#00aaff',
                abilities: this._defineDefenseAbilities()
            },
            offense: {
                name: 'Ataque',
                icon: '⚔️',
                color: '#ff4444',
                abilities: this._defineOffenseAbilities()
            },
            utility: {
                name: 'Utilidad',
                icon: '🔮',
                color: '#aa00ff',
                abilities: this._defineUtilityAbilities()
            }
        };

        // Estado del jugador
        this.playerAbilities = {};
        this.availablePoints = 0;
        this.totalPointsEarned = 0;

        // Cargar progreso
        this._loadProgress();
    }

    /**
     * Define habilidades del árbol de Velocidad
     * @private
     */
    _defineSpeedAbilities() {
        return [
            {
                id: 'speed_boost_1',
                name: 'Velocidad Base',
                description: '+10% velocidad de movimiento',
                tier: 1,
                maxLevel: 3,
                cost: 1,
                requires: [],
                effect: { speedMultiplier: 0.1 },
                type: 'passive'
            },
            {
                id: 'dash',
                name: 'Dash',
                description: 'Dash rápido en la dirección de movimiento',
                tier: 2,
                maxLevel: 1,
                cost: 2,
                requires: ['speed_boost_1'],
                cooldown: 3000,
                effect: { dashSpeed: 3, dashDuration: 200 },
                type: 'active'
            },
            {
                id: 'speed_boost_2',
                name: 'Velocidad Avanzada',
                description: '+15% velocidad adicional',
                tier: 2,
                maxLevel: 3,
                cost: 2,
                requires: ['speed_boost_1'],
                effect: { speedMultiplier: 0.15 },
                type: 'passive'
            },
            {
                id: 'afterburner',
                name: 'Afterburner',
                description: 'Dejar estela que daña enemigos',
                tier: 3,
                maxLevel: 1,
                cost: 3,
                requires: ['dash', 'speed_boost_2'],
                effect: { trailDamage: 10, trailDuration: 1000 },
                type: 'passive'
            }
        ];
    }

    /**
     * Define habilidades del árbol de Defensa
     * @private
     */
    _defineDefenseAbilities() {
        return [
            {
                id: 'armor_1',
                name: 'Armadura Base',
                description: '+1 punto de vida máxima',
                tier: 1,
                maxLevel: 5,
                cost: 1,
                requires: [],
                effect: { maxHealthBonus: 1 },
                type: 'passive'
            },
            {
                id: 'shield_regen',
                name: 'Regeneración',
                description: 'Regenera 1 vida cada 60s sin daño',
                tier: 2,
                maxLevel: 1,
                cost: 2,
                requires: ['armor_1'],
                effect: { regenInterval: 60000, regenAmount: 1 },
                type: 'passive'
            },
            {
                id: 'damage_reduction',
                name: 'Piel Dura',
                description: '-20% daño recibido',
                tier: 2,
                maxLevel: 3,
                cost: 2,
                requires: ['armor_1'],
                effect: { damageReduction: 0.2 },
                type: 'passive'
            },
            {
                id: 'invulnerability',
                name: 'Escudo Temporal',
                description: '2 segundos de invulnerabilidad',
                tier: 3,
                maxLevel: 1,
                cost: 3,
                requires: ['shield_regen', 'damage_reduction'],
                cooldown: 30000,
                effect: { duration: 2000 },
                type: 'active'
            }
        ];
    }

    /**
     * Define habilidades del árbol de Ataque
     * @private
     */
    _defineOffenseAbilities() {
        return [
            {
                id: 'score_boost_1',
                name: 'Codicia',
                description: '+10% puntos al recolectar',
                tier: 1,
                maxLevel: 5,
                cost: 1,
                requires: [],
                effect: { scoreMultiplier: 0.1 },
                type: 'passive'
            },
            {
                id: 'combo_master',
                name: 'Maestro de Combos',
                description: 'Combos duran 50% más',
                tier: 2,
                maxLevel: 1,
                cost: 2,
                requires: ['score_boost_1'],
                effect: { comboTimeBonus: 0.5 },
                type: 'passive'
            },
            {
                id: 'magnet',
                name: 'Magnetismo',
                description: 'Atrae banderas cercanas',
                tier: 2,
                maxLevel: 3,
                cost: 2,
                requires: ['score_boost_1'],
                effect: { magnetRange: 50 },
                type: 'passive'
            },
            {
                id: 'score_burst',
                name: 'Burst de Puntos',
                description: 'Duplica puntos por 10 segundos',
                tier: 3,
                maxLevel: 1,
                cost: 3,
                requires: ['combo_master', 'magnet'],
                cooldown: 45000,
                effect: { duration: 10000, multiplier: 2 },
                type: 'active'
            }
        ];
    }

    /**
     * Define habilidades del árbol de Utilidad
     * @private
     */
    _defineUtilityAbilities() {
        return [
            {
                id: 'luck_1',
                name: 'Suerte',
                description: '+10% chance de powerups',
                tier: 1,
                maxLevel: 5,
                cost: 1,
                requires: [],
                effect: { powerupChance: 0.1 },
                type: 'passive'
            },
            {
                id: 'powerup_duration',
                name: 'Duración Extendida',
                description: 'Powerups duran 50% más',
                tier: 2,
                maxLevel: 3,
                cost: 2,
                requires: ['luck_1'],
                effect: { powerupDurationBonus: 0.5 },
                type: 'passive'
            },
            {
                id: 'vision',
                name: 'Visión Mejorada',
                description: 'Ver enemigos en el minimapa',
                tier: 2,
                maxLevel: 1,
                cost: 2,
                requires: ['luck_1'],
                effect: { showEnemiesOnMap: true },
                type: 'passive'
            },
            {
                id: 'time_freeze',
                name: 'Congelar Tiempo',
                description: 'Congela enemigos por 3 segundos',
                tier: 3,
                maxLevel: 1,
                cost: 3,
                requires: ['powerup_duration', 'vision'],
                cooldown: 60000,
                effect: { duration: 3000 },
                type: 'active'
            }
        ];
    }

    /**
     * Desbloquea o mejora una habilidad
     * @param {string} tree - Árbol de habilidad
     * @param {string} abilityId - ID de la habilidad
     * @returns {Object} Resultado de la operación
     */
    unlockAbility(tree, abilityId) {
        const ability = this._getAbility(tree, abilityId);

        if (!ability) {
            return { success: false, error: 'Habilidad no encontrada' };
        }

        // Verificar puntos disponibles
        if (this.availablePoints < ability.cost) {
            return { success: false, error: 'Puntos insuficientes' };
        }

        // Verificar nivel actual
        const currentLevel = this.playerAbilities[abilityId] || 0;
        if (currentLevel >= ability.maxLevel) {
            return { success: false, error: 'Nivel máximo alcanzado' };
        }

        // Verificar requisitos
        const requirementsMet = ability.requires.every(reqId =>
            (this.playerAbilities[reqId] || 0) > 0
        );

        if (!requirementsMet) {
            return { success: false, error: 'Requisitos no cumplidos' };
        }

        // Desbloquear/mejorar
        this.playerAbilities[abilityId] = currentLevel + 1;
        this.availablePoints -= ability.cost;

        this._saveProgress();

        return {
            success: true,
            ability: ability,
            newLevel: this.playerAbilities[abilityId],
            pointsRemaining: this.availablePoints
        };
    }

    /**
     * Añade puntos de habilidad
     * @param {number} points - Puntos a añadir
     */
    addAbilityPoints(points) {
        this.availablePoints += points;
        this.totalPointsEarned += points;
        this._saveProgress();
    }

    /**
     * Obtiene todas las habilidades activas del jugador
     * @returns {Array} Lista de habilidades activas con sus efectos
     */
    getActiveAbilities() {
        const active = [];

        Object.keys(this.trees).forEach(treeName => {
            const tree = this.trees[treeName];
            tree.abilities.forEach(ability => {
                const level = this.playerAbilities[ability.id] || 0;
                if (level > 0) {
                    active.push({
                        ...ability,
                        level,
                        tree: treeName,
                        totalEffect: this._calculateTotalEffect(ability, level)
                    });
                }
            });
        });

        return active;
    }

    /**
     * Calcula el efecto total de una habilidad según su nivel
     * @param {Object} ability - Habilidad
     * @param {number} level - Nivel actual
     * @returns {Object} Efectos totales
     * @private
     */
    _calculateTotalEffect(ability, level) {
        const effect = {};

        Object.keys(ability.effect).forEach(key => {
            // Los efectos se multiplican por el nivel
            effect[key] = ability.effect[key] * level;
        });

        return effect;
    }

    /**
     * Obtiene los stats totales aplicando todas las habilidades
     * @returns {Object} Stats combinados
     */
    getTotalStats() {
        const stats = {
            speedMultiplier: 1.0,
            maxHealthBonus: 0,
            damageReduction: 0,
            scoreMultiplier: 1.0,
            comboTimeBonus: 0,
            magnetRange: 0,
            powerupChance: 0,
            powerupDurationBonus: 0,
            showEnemiesOnMap: false,
            regenInterval: 0,
            regenAmount: 0
        };

        this.getActiveAbilities().forEach(ability => {
            const effects = ability.totalEffect;

            Object.keys(effects).forEach(key => {
                if (typeof effects[key] === 'number') {
                    if (key.includes('Multiplier')) {
                        stats[key] += effects[key]; // Multiplicadores se suman
                    } else {
                        stats[key] += effects[key];
                    }
                } else if (typeof effects[key] === 'boolean') {
                    stats[key] = stats[key] || effects[key];
                } else {
                    stats[key] = effects[key];
                }
            });
        });

        return stats;
    }

    /**
     * Obtiene una habilidad por ID
     * @param {string} tree - Árbol
     * @param {string} abilityId - ID de habilidad
     * @returns {Object|null} Habilidad o null
     * @private
     */
    _getAbility(tree, abilityId) {
        if (!this.trees[tree]) return null;
        return this.trees[tree].abilities.find(a => a.id === abilityId) || null;
    }

    /**
     * Obtiene el árbol de habilidades completo con progreso
     * @param {string} treeName - Nombre del árbol
     * @returns {Object} Árbol con progreso
     */
    getAbilityTree(treeName) {
        if (!this.trees[treeName]) return null;

        const tree = { ...this.trees[treeName] };
        tree.abilities = tree.abilities.map(ability => ({
            ...ability,
            currentLevel: this.playerAbilities[ability.id] || 0,
            unlocked: (this.playerAbilities[ability.id] || 0) > 0,
            canUnlock: this._canUnlock(ability),
            totalEffect: this._calculateTotalEffect(
                ability,
                this.playerAbilities[ability.id] || 0
            )
        }));

        return tree;
    }

    /**
     * Verifica si se puede desbloquear una habilidad
     * @param {Object} ability - Habilidad
     * @returns {boolean}
     * @private
     */
    _canUnlock(ability) {
        // Verificar puntos
        if (this.availablePoints < ability.cost) return false;

        // Verificar nivel máximo
        const currentLevel = this.playerAbilities[ability.id] || 0;
        if (currentLevel >= ability.maxLevel) return false;

        // Verificar requisitos
        return ability.requires.every(reqId =>
            (this.playerAbilities[reqId] || 0) > 0
        );
    }

    /**
     * Resetea todas las habilidades (respec)
     * @returns {number} Puntos devueltos
     */
    respecAbilities() {
        const pointsToReturn = Object.keys(this.playerAbilities).reduce((sum, abilityId) => {
            // Buscar la habilidad en todos los árboles
            let ability = null;
            Object.values(this.trees).forEach(tree => {
                const found = tree.abilities.find(a => a.id === abilityId);
                if (found) ability = found;
            });

            if (ability) {
                const level = this.playerAbilities[abilityId];
                return sum + (ability.cost * level);
            }
            return sum;
        }, 0);

        this.playerAbilities = {};
        this.availablePoints += pointsToReturn;

        this._saveProgress();

        return pointsToReturn;
    }

    /**
     * Carga progreso desde storage
     * @private
     */
    _loadProgress() {
        try {
            const saved = Storage.get('rallyx_abilities', null);
            if (saved) {
                this.playerAbilities = saved.abilities || {};
                this.availablePoints = saved.availablePoints || 0;
                this.totalPointsEarned = saved.totalPointsEarned || 0;
            }
        } catch (error) {
            console.warn('Error cargando habilidades:', error);
        }
    }

    /**
     * Guarda progreso en storage
     * @private
     */
    _saveProgress() {
        try {
            Storage.set('rallyx_abilities', {
                abilities: this.playerAbilities,
                availablePoints: this.availablePoints,
                totalPointsEarned: this.totalPointsEarned
            });
        } catch (error) {
            console.warn('Error guardando habilidades:', error);
        }
    }

    /**
     * Obtiene resumen del progreso
     * @returns {Object} Resumen
     */
    getProgressSummary() {
        const activeAbilities = this.getActiveAbilities();

        return {
            totalAbilitiesUnlocked: activeAbilities.length,
            totalPointsSpent: this.totalPointsEarned - this.availablePoints,
            totalPointsEarned: this.totalPointsEarned,
            availablePoints: this.availablePoints,
            abilitiesByTree: {
                speed: activeAbilities.filter(a => a.tree === 'speed').length,
                defense: activeAbilities.filter(a => a.tree === 'defense').length,
                offense: activeAbilities.filter(a => a.tree === 'offense').length,
                utility: activeAbilities.filter(a => a.tree === 'utility').length
            }
        };
    }
}

export default AbilitySystem;
