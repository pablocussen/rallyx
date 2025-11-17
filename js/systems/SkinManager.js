/**
 * Skin Manager - Sistema de Skins Desbloqueables
 * Personalización, colección, incentivo para jugar más
 *
 * Características:
 * - 15+ skins únicos con diferentes estilos visuales
 * - Sistema de desbloqueo por logros, niveles, misiones
 * - Cada skin tiene efectos visuales especiales
 * - Skins raros y legendarios
 * - Preview antes de seleccionar
 */

import Storage from '../utils/Storage.js';

export class SkinManager {
    constructor() {
        // Catálogo de skins
        this.skins = {
            default: {
                name: 'Classic Racer',
                description: 'El coche clásico de Rally X',
                rarity: 'common',
                icon: '🏎️',
                colors: {
                    primary: '#00d4ff',
                    secondary: '#ffffff',
                    accent: '#0088cc'
                },
                unlockCondition: { type: 'default' },
                unlocked: true,
                effects: {
                    trail: 'normal',
                    particles: 'normal',
                    glow: false
                }
            },

            neon: {
                name: 'Neon Racer',
                description: 'Brillante estilo cyberpunk',
                rarity: 'rare',
                icon: '🌟',
                colors: {
                    primary: '#ff00ff',
                    secondary: '#00ffff',
                    accent: '#ff0088'
                },
                unlockCondition: { type: 'level', value: 20 },
                unlocked: false,
                effects: {
                    trail: 'neon',
                    particles: 'sparkles',
                    glow: true,
                    glowIntensity: 1.5
                }
            },

            retro: {
                name: 'Retro Racer',
                description: 'Estilo arcade de los 80s',
                rarity: 'rare',
                icon: '👾',
                colors: {
                    primary: '#ffaa00',
                    secondary: '#ff0000',
                    accent: '#ffff00'
                },
                unlockCondition: { type: 'level', value: 30 },
                unlocked: false,
                effects: {
                    trail: 'pixelated',
                    particles: 'squares',
                    glow: false,
                    scanlines: true
                }
            },

            stealth: {
                name: 'Stealth Racer',
                description: 'Invisible y misterioso',
                rarity: 'epic',
                icon: '👻',
                colors: {
                    primary: '#333333',
                    secondary: '#666666',
                    accent: '#00ff00'
                },
                unlockCondition: { type: 'achievement', value: 'ghost' },
                unlocked: false,
                effects: {
                    trail: 'smoke',
                    particles: 'minimal',
                    glow: false,
                    opacity: 0.7
                }
            },

            fire: {
                name: 'Fire Racer',
                description: 'Envuelto en llamas',
                rarity: 'epic',
                icon: '🔥',
                colors: {
                    primary: '#ff4400',
                    secondary: '#ffaa00',
                    accent: '#ff0000'
                },
                unlockCondition: { type: 'streak', value: 7 },
                unlocked: false,
                effects: {
                    trail: 'flames',
                    particles: 'fire',
                    glow: true,
                    glowIntensity: 2.0,
                    animated: true
                }
            },

            ice: {
                name: 'Ice Racer',
                description: 'Congelado y cristalino',
                rarity: 'epic',
                icon: '❄️',
                colors: {
                    primary: '#aaffff',
                    secondary: '#ffffff',
                    accent: '#00ccff'
                },
                unlockCondition: { type: 'score', value: 50000 },
                unlocked: false,
                effects: {
                    trail: 'ice',
                    particles: 'snowflakes',
                    glow: true,
                    glowIntensity: 1.2,
                    crystalline: true
                }
            },

            gold: {
                name: 'Golden Racer',
                description: 'Lujo y elegancia',
                rarity: 'legendary',
                icon: '👑',
                colors: {
                    primary: '#ffdd00',
                    secondary: '#ffaa00',
                    accent: '#ff8800'
                },
                unlockCondition: { type: 'level', value: 50 },
                unlocked: false,
                effects: {
                    trail: 'golden',
                    particles: 'stars',
                    glow: true,
                    glowIntensity: 2.5,
                    shimmer: true
                }
            },

            rainbow: {
                name: 'Rainbow Racer',
                description: 'Todos los colores del arcoíris',
                rarity: 'legendary',
                icon: '🌈',
                colors: {
                    primary: 'rainbow', // Especial: cambia de color
                    secondary: '#ffffff',
                    accent: 'rainbow'
                },
                unlockCondition: { type: 'combo', value: 50 },
                unlocked: false,
                effects: {
                    trail: 'rainbow',
                    particles: 'rainbow',
                    glow: true,
                    glowIntensity: 2.0,
                    colorCycle: true
                }
            },

            ghost: {
                name: 'Ghost Racer',
                description: 'Fantasmal y etéreo',
                rarity: 'legendary',
                icon: '💀',
                colors: {
                    primary: '#aaaaff',
                    secondary: '#ffffff',
                    accent: '#8888ff'
                },
                unlockCondition: { type: 'achievement', value: 'perfectionist' },
                unlocked: false,
                effects: {
                    trail: 'ethereal',
                    particles: 'spirits',
                    glow: true,
                    glowIntensity: 1.5,
                    transparency: true,
                    phasing: true
                }
            },

            matrix: {
                name: 'Matrix Racer',
                description: 'Código digital cayendo',
                rarity: 'epic',
                icon: '💻',
                colors: {
                    primary: '#00ff00',
                    secondary: '#003300',
                    accent: '#00cc00'
                },
                unlockCondition: { type: 'mission', value: 50 },
                unlocked: false,
                effects: {
                    trail: 'digital',
                    particles: 'code',
                    glow: true,
                    glowIntensity: 1.3,
                    scanlines: true
                }
            },

            plasma: {
                name: 'Plasma Racer',
                description: 'Energía pura',
                rarity: 'epic',
                icon: '⚡',
                colors: {
                    primary: '#ff00ff',
                    secondary: '#ffff00',
                    accent: '#00ffff'
                },
                unlockCondition: { type: 'mode', value: 'timeAttack' },
                unlocked: false,
                effects: {
                    trail: 'plasma',
                    particles: 'electricity',
                    glow: true,
                    glowIntensity: 2.2,
                    electricArcs: true
                }
            },

            carbon: {
                name: 'Carbon Racer',
                description: 'Fibra de carbono high-tech',
                rarity: 'rare',
                icon: '⚫',
                colors: {
                    primary: '#222222',
                    secondary: '#444444',
                    accent: '#00d4ff'
                },
                unlockCondition: { type: 'score', value: 25000 },
                unlocked: false,
                effects: {
                    trail: 'minimal',
                    particles: 'minimal',
                    glow: false,
                    carbonPattern: true
                }
            },

            chrome: {
                name: 'Chrome Racer',
                description: 'Reflectante y brillante',
                rarity: 'rare',
                icon: '🔮',
                colors: {
                    primary: '#cccccc',
                    secondary: '#ffffff',
                    accent: '#aaaaaa'
                },
                unlockCondition: { type: 'achievement', value: 'speedster' },
                unlocked: false,
                effects: {
                    trail: 'mirror',
                    particles: 'sparkles',
                    glow: false,
                    reflective: true
                }
            },

            void: {
                name: 'Void Racer',
                description: 'Oscuridad absoluta',
                rarity: 'legendary',
                icon: '🌑',
                colors: {
                    primary: '#000000',
                    secondary: '#110011',
                    accent: '#440044'
                },
                unlockCondition: { type: 'mode', value: 'survival', requirement: 300 },
                unlocked: false,
                effects: {
                    trail: 'void',
                    particles: 'darkness',
                    glow: true,
                    glowIntensity: 1.0,
                    voidAura: true,
                    darknessWave: true
                }
            },

            cosmic: {
                name: 'Cosmic Racer',
                description: 'Galaxias y estrellas',
                rarity: 'legendary',
                icon: '🌌',
                colors: {
                    primary: '#4400ff',
                    secondary: '#ff00ff',
                    accent: '#00ffff'
                },
                unlockCondition: { type: 'totalXP', value: 100000 },
                unlocked: false,
                effects: {
                    trail: 'cosmic',
                    particles: 'stars',
                    glow: true,
                    glowIntensity: 2.5,
                    starfield: true,
                    galaxyPattern: true
                }
            }
        };

        // Skin actual
        this.currentSkin = 'default';

        // Rainbow color cycling state
        this.rainbowHue = 0;

        this.loadUnlocks();
    }

    /**
     * Cargar skins desbloqueados desde Storage
     */
    loadUnlocks() {
        const data = Storage.get('rallyx_skins', {
            currentSkin: 'default',
            unlocked: ['default']
        });

        this.currentSkin = data.currentSkin;

        // Marcar como desbloqueados
        data.unlocked.forEach(skinId => {
            if (this.skins[skinId]) {
                this.skins[skinId].unlocked = true;
            }
        });
    }

    /**
     * Guardar estado de skins
     */
    saveUnlocks() {
        const unlocked = Object.keys(this.skins).filter(id => this.skins[id].unlocked);
        Storage.set('rallyx_skins', {
            currentSkin: this.currentSkin,
            unlocked
        });
    }

    /**
     * Seleccionar skin
     */
    selectSkin(skinId) {
        const skin = this.skins[skinId];

        if (!skin) {
            console.error(`Skin ${skinId} no existe`);
            return false;
        }

        if (!skin.unlocked) {
            console.warn(`Skin ${skinId} no desbloqueado`);
            return false;
        }

        this.currentSkin = skinId;
        this.saveUnlocks();

        console.log(`🎨 Skin seleccionado: ${skin.name}`);
        return true;
    }

    /**
     * Desbloquear skin
     */
    unlockSkin(skinId) {
        const skin = this.skins[skinId];

        if (!skin) {
            console.error(`Skin ${skinId} no existe`);
            return false;
        }

        if (skin.unlocked) {
            console.log(`Skin ${skinId} ya desbloqueado`);
            return false;
        }

        skin.unlocked = true;
        this.saveUnlocks();

        console.log(`🎉 ¡Skin desbloqueado: ${skin.name}!`);
        return {
            skinId,
            skin,
            message: `¡Desbloqueaste: ${skin.name}!`
        };
    }

    /**
     * Verificar si se puede desbloquear un skin según condición
     */
    checkUnlockConditions(playerStats) {
        const newUnlocks = [];

        Object.keys(this.skins).forEach(skinId => {
            const skin = this.skins[skinId];

            if (skin.unlocked) return; // Ya desbloqueado

            const condition = skin.unlockCondition;
            let canUnlock = false;

            switch (condition.type) {
                case 'level':
                    canUnlock = playerStats.level >= condition.value;
                    break;

                case 'score':
                    canUnlock = playerStats.bestScore >= condition.value;
                    break;

                case 'streak':
                    canUnlock = playerStats.currentStreak >= condition.value ||
                                playerStats.longestStreak >= condition.value;
                    break;

                case 'combo':
                    canUnlock = playerStats.maxCombo >= condition.value;
                    break;

                case 'totalXP':
                    canUnlock = playerStats.totalXp >= condition.value;
                    break;

                case 'mission':
                    canUnlock = playerStats.missionsCompleted >= condition.value;
                    break;

                case 'achievement':
                    canUnlock = playerStats.achievements?.includes(condition.value);
                    break;

                case 'mode':
                    const modeStats = playerStats.modes?.[condition.value];
                    if (condition.requirement) {
                        // Requisito específico (ej: sobrevivir 300 segundos)
                        canUnlock = modeStats?.longestTime >= condition.requirement * 1000;
                    } else {
                        // Solo completar el modo
                        canUnlock = modeStats?.wins > 0;
                    }
                    break;
            }

            if (canUnlock) {
                const unlockResult = this.unlockSkin(skinId);
                if (unlockResult) {
                    newUnlocks.push(unlockResult);
                }
            }
        });

        return newUnlocks;
    }

    /**
     * Obtener skin actual
     */
    getCurrentSkin() {
        return {
            id: this.currentSkin,
            ...this.skins[this.currentSkin]
        };
    }

    /**
     * Obtener colores del skin actual (con soporte para rainbow)
     */
    getCurrentColors() {
        const skin = this.skins[this.currentSkin];

        if (skin.colors.primary === 'rainbow') {
            // Ciclar colores del arcoíris
            this.rainbowHue = (this.rainbowHue + 1) % 360;
            return {
                primary: `hsl(${this.rainbowHue}, 100%, 50%)`,
                secondary: `hsl(${(this.rainbowHue + 180) % 360}, 100%, 50%)`,
                accent: `hsl(${(this.rainbowHue + 120) % 360}, 100%, 50%)`
            };
        }

        return skin.colors;
    }

    /**
     * Obtener efectos visuales del skin actual
     */
    getCurrentEffects() {
        return this.skins[this.currentSkin].effects;
    }

    /**
     * Obtener lista de todos los skins con estado de desbloqueo
     */
    getAllSkins() {
        return Object.keys(this.skins).map(id => ({
            id,
            ...this.skins[id],
            isSelected: id === this.currentSkin
        }));
    }

    /**
     * Obtener skins por rareza
     */
    getSkinsByRarity(rarity) {
        return Object.keys(this.skins)
            .filter(id => this.skins[id].rarity === rarity)
            .map(id => ({ id, ...this.skins[id] }));
    }

    /**
     * Obtener progreso de colección
     */
    getCollectionProgress() {
        const total = Object.keys(this.skins).length;
        const unlocked = Object.values(this.skins).filter(s => s.unlocked).length;

        const byRarity = {
            common: { total: 0, unlocked: 0 },
            rare: { total: 0, unlocked: 0 },
            epic: { total: 0, unlocked: 0 },
            legendary: { total: 0, unlocked: 0 }
        };

        Object.values(this.skins).forEach(skin => {
            byRarity[skin.rarity].total++;
            if (skin.unlocked) {
                byRarity[skin.rarity].unlocked++;
            }
        });

        return {
            total,
            unlocked,
            percentage: (unlocked / total) * 100,
            byRarity
        };
    }

    /**
     * Obtener descripción de condición de desbloqueo
     */
    getUnlockDescription(skinId) {
        const skin = this.skins[skinId];
        if (!skin) return '';

        if (skin.unlocked) return 'Desbloqueado ✓';

        const cond = skin.unlockCondition;

        switch (cond.type) {
            case 'level':
                return `Alcanza nivel ${cond.value}`;
            case 'score':
                return `Consigue ${cond.value.toLocaleString()} puntos`;
            case 'streak':
                return `Racha de ${cond.value} días`;
            case 'combo':
                return `Consigue combo x${cond.value}`;
            case 'totalXP':
                return `Acumula ${cond.value.toLocaleString()} XP total`;
            case 'mission':
                return `Completa ${cond.value} misiones`;
            case 'achievement':
                return `Desbloquea logro: ${cond.value}`;
            case 'mode':
                if (cond.requirement) {
                    return `Sobrevive ${cond.requirement}s en ${cond.value}`;
                }
                return `Gana en modo ${cond.value}`;
            default:
                return 'Condición desconocida';
        }
    }

    /**
     * Obtener siguiente skin a desbloquear
     */
    getNextToUnlock(playerStats) {
        const locked = Object.keys(this.skins).filter(id => !this.skins[id].unlocked);

        if (locked.length === 0) return null;

        // Calcular "cercanía" a desbloquear cada uno
        const withProgress = locked.map(id => {
            const skin = this.skins[id];
            const cond = skin.unlockCondition;
            let progress = 0;

            switch (cond.type) {
                case 'level':
                    progress = (playerStats.level / cond.value) * 100;
                    break;
                case 'score':
                    progress = (playerStats.bestScore / cond.value) * 100;
                    break;
                case 'combo':
                    progress = (playerStats.maxCombo / cond.value) * 100;
                    break;
                // ... etc
                default:
                    progress = 0;
            }

            return { id, skin, progress: Math.min(100, progress) };
        });

        // Ordenar por progreso descendente
        withProgress.sort((a, b) => b.progress - a.progress);

        return withProgress[0];
    }
}

export default SkinManager;
