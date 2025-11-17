/**
 * Game Mode Manager - Sistema de Modos de Juego
 * Variedad de experiencias para mantener el juego fresco y adictivo
 *
 * Modos:
 * - Classic: Juego original, progresión por niveles
 * - Time Attack: Contra reloj, máximo score en tiempo limitado
 * - Survival: Aguanta lo máximo posible, dificultad creciente
 * - Chaos: Caos total, todo aleatorio, para expertos
 */

import Storage from '../utils/Storage.js';

export class GameModeManager {
    constructor() {
        this.currentMode = 'classic';

        // Definición de modos
        this.modes = {
            classic: {
                name: 'Classic',
                description: 'El juego original. Completa niveles y avanza.',
                icon: '🏁',
                unlockLevel: 1,
                settings: {
                    hasLevels: true,
                    hasTimeLimit: false,
                    difficultyGrowth: 'moderate',
                    livesEnabled: true,
                    startingLives: 3,
                    scoreMultiplier: 1.0,
                    powerupSpawnRate: 1.0
                }
            },

            timeAttack: {
                name: 'Time Attack',
                description: '⏱️ 3 minutos. Máximo score posible.',
                icon: '⚡',
                unlockLevel: 10,
                settings: {
                    hasLevels: false,
                    hasTimeLimit: true,
                    timeLimit: 180000, // 3 minutos
                    difficultyGrowth: 'fast',
                    livesEnabled: false, // No pierdes por morir, solo pierdes tiempo
                    respawnTime: 2000, // Respawn en 2 segundos
                    scoreMultiplier: 1.5,
                    powerupSpawnRate: 1.5,
                    bonusPerSecond: 10 // Bonus por tiempo restante
                }
            },

            survival: {
                name: 'Survival',
                description: '💀 Sobrevive lo máximo posible. Dificultad infinita.',
                icon: '🛡️',
                unlockLevel: 25,
                settings: {
                    hasLevels: false,
                    hasTimeLimit: false,
                    difficultyGrowth: 'exponential',
                    livesEnabled: true,
                    startingLives: 1, // Una sola vida!
                    scoreMultiplier: 2.0,
                    powerupSpawnRate: 0.8,
                    difficultyIncreaseInterval: 30000, // Cada 30 seg más difícil
                    difficultyIncreaseFactor: 1.2
                }
            },

            chaos: {
                name: 'Chaos',
                description: '🌀 Caos total. Aleatorio. Para maestros.',
                icon: '🎲',
                unlockLevel: 50,
                settings: {
                    hasLevels: true,
                    hasTimeLimit: false,
                    difficultyGrowth: 'chaotic',
                    livesEnabled: true,
                    startingLives: 5,
                    scoreMultiplier: 3.0,
                    powerupSpawnRate: 1.5,
                    randomEvents: true,
                    randomEventInterval: 15000, // Evento cada 15 seg
                    unpredictableEnemies: true,
                    randomMapChanges: true
                }
            }
        };

        // Estado actual del modo
        this.modeState = {
            startTime: 0,
            timeElapsed: 0,
            timeRemaining: 0,
            currentDifficultyMultiplier: 1.0,
            lastDifficultyIncrease: 0,
            activeEvents: [],
            deaths: 0,
            respawnTimer: 0
        };

        // Eventos aleatorios para modo Chaos
        this.chaosEvents = [
            {
                id: 'speed_boost',
                name: 'Hyper Speed!',
                description: 'Todo se mueve 2x más rápido',
                duration: 10000,
                effect: { speedMultiplier: 2.0 }
            },
            {
                id: 'slow_motion',
                name: 'Slow Motion',
                description: 'El tiempo se ralentiza',
                duration: 8000,
                effect: { speedMultiplier: 0.5 }
            },
            {
                id: 'invincibility',
                name: 'Invencible!',
                description: 'Eres invencible temporalmente',
                duration: 5000,
                effect: { invincible: true }
            },
            {
                id: 'double_points',
                name: 'Double Points!',
                description: 'Puntos x2',
                duration: 15000,
                effect: { scoreMultiplier: 2.0 }
            },
            {
                id: 'enemy_swarm',
                name: 'Enemy Swarm!',
                description: 'Oleada de enemigos',
                duration: 10000,
                effect: { enemyCountMultiplier: 3.0 }
            },
            {
                id: 'powerup_rain',
                name: 'Powerup Rain!',
                description: 'Lluvia de power-ups',
                duration: 8000,
                effect: { powerupSpawnRate: 5.0 }
            },
            {
                id: 'fog_of_war',
                name: 'Fog of War',
                description: 'Visibilidad reducida',
                duration: 12000,
                effect: { visionRadius: 200 }
            },
            {
                id: 'mega_combo',
                name: 'Mega Combo!',
                description: 'Combos x3',
                duration: 10000,
                effect: { comboMultiplier: 3.0 }
            }
        ];

        this.loadModeStats();
    }

    loadModeStats() {
        this.stats = Storage.get('rallyx_mode_stats', {
            classic: { bestScore: 0, gamesPlayed: 0, wins: 0 },
            timeAttack: { bestScore: 0, gamesPlayed: 0, bestTime: 0 },
            survival: { bestScore: 0, gamesPlayed: 0, longestTime: 0 },
            chaos: { bestScore: 0, gamesPlayed: 0, wins: 0 }
        });
    }

    saveModeStats() {
        Storage.set('rallyx_mode_stats', this.stats);
    }

    /**
     * Iniciar modo de juego
     */
    startMode(modeName, playerLevel = 1) {
        const mode = this.modes[modeName];

        if (!mode) {
            console.error(`Modo ${modeName} no existe`);
            return false;
        }

        // Verificar unlock
        if (playerLevel < mode.unlockLevel) {
            console.warn(`Modo ${modeName} bloqueado. Requiere nivel ${mode.unlockLevel}`);
            return false;
        }

        this.currentMode = modeName;

        // Reset estado
        this.modeState = {
            startTime: Date.now(),
            timeElapsed: 0,
            timeRemaining: mode.settings.hasTimeLimit ? mode.settings.timeLimit : 0,
            currentDifficultyMultiplier: 1.0,
            lastDifficultyIncrease: 0,
            activeEvents: [],
            deaths: 0,
            respawnTimer: 0,
            isRespawning: false
        };

        // Incrementar contador
        if (!this.stats[modeName]) {
            this.stats[modeName] = { bestScore: 0, gamesPlayed: 0 };
        }
        this.stats[modeName].gamesPlayed++;

        console.log(`🎮 Modo iniciado: ${mode.name}`);
        return true;
    }

    /**
     * Actualizar modo durante el juego
     */
    update(deltaTime, gameContext) {
        const mode = this.modes[this.currentMode];
        if (!mode) return {};

        this.modeState.timeElapsed += deltaTime;

        // Time Attack: actualizar tiempo restante
        if (mode.settings.hasTimeLimit) {
            this.modeState.timeRemaining -= deltaTime;
            if (this.modeState.timeRemaining <= 0) {
                return { gameEnded: true, reason: 'timeUp' };
            }
        }

        // Survival: aumentar dificultad
        if (this.currentMode === 'survival') {
            this.modeState.lastDifficultyIncrease += deltaTime;
            if (this.modeState.lastDifficultyIncrease >= mode.settings.difficultyIncreaseInterval) {
                this.modeState.currentDifficultyMultiplier *= mode.settings.difficultyIncreaseFactor;
                this.modeState.lastDifficultyIncrease = 0;
                console.log(`📈 Dificultad aumentada: ${this.modeState.currentDifficultyMultiplier.toFixed(2)}x`);
            }
        }

        // Chaos: eventos aleatorios
        if (this.currentMode === 'chaos' && mode.settings.randomEvents) {
            // Eliminar eventos expirados
            this.modeState.activeEvents = this.modeState.activeEvents.filter(event => {
                event.timeRemaining -= deltaTime;
                if (event.timeRemaining <= 0) {
                    console.log(`🌀 Evento terminado: ${event.name}`);
                    return false;
                }
                return true;
            });

            // Generar nuevo evento
            if (Math.random() < (deltaTime / mode.settings.randomEventInterval)) {
                this.triggerChaosEvent();
            }
        }

        // Time Attack: respawn automático
        if (this.currentMode === 'timeAttack' && this.modeState.isRespawning) {
            this.modeState.respawnTimer -= deltaTime;
            if (this.modeState.respawnTimer <= 0) {
                this.modeState.isRespawning = false;
                return { respawnPlayer: true };
            }
        }

        // Calcular modificadores activos
        const modifiers = this.getActiveModifiers();

        return { modifiers, modeState: this.modeState };
    }

    /**
     * Trigger evento aleatorio en modo Chaos
     */
    triggerChaosEvent() {
        const availableEvents = this.chaosEvents.filter(
            e => !this.modeState.activeEvents.find(active => active.id === e.id)
        );

        if (availableEvents.length === 0) return;

        const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];
        const activeEvent = {
            ...event,
            timeRemaining: event.duration,
            startedAt: Date.now()
        };

        this.modeState.activeEvents.push(activeEvent);
        console.log(`🌀 Evento activado: ${event.name} - ${event.description}`);

        return activeEvent;
    }

    /**
     * Obtener modificadores activos de todos los eventos
     */
    getActiveModifiers() {
        const mode = this.modes[this.currentMode];
        const modifiers = {
            scoreMultiplier: mode.settings.scoreMultiplier,
            speedMultiplier: 1.0,
            enemyCountMultiplier: 1.0,
            powerupSpawnRate: mode.settings.powerupSpawnRate,
            comboMultiplier: 1.0,
            invincible: false,
            visionRadius: null,
            difficultyMultiplier: this.modeState.currentDifficultyMultiplier
        };

        // Aplicar efectos de eventos activos (Chaos mode)
        this.modeState.activeEvents.forEach(event => {
            Object.keys(event.effect).forEach(key => {
                if (typeof modifiers[key] === 'number' && typeof event.effect[key] === 'number') {
                    modifiers[key] *= event.effect[key];
                } else {
                    modifiers[key] = event.effect[key];
                }
            });
        });

        return modifiers;
    }

    /**
     * Manejar muerte del jugador según el modo
     */
    handleDeath() {
        const mode = this.modes[this.currentMode];
        this.modeState.deaths++;

        // Time Attack: respawn automático
        if (this.currentMode === 'timeAttack') {
            this.modeState.isRespawning = true;
            this.modeState.respawnTimer = mode.settings.respawnTime;
            return { allowContinue: true, penaltyTime: mode.settings.respawnTime };
        }

        // Survival: game over inmediato (1 vida)
        if (this.currentMode === 'survival') {
            return { allowContinue: false, gameOver: true };
        }

        // Classic y Chaos: sistema de vidas normal
        return { allowContinue: true, loseLife: true };
    }

    /**
     * Finalizar partida y guardar stats
     */
    endGame(finalScore, finalStats) {
        const mode = this.modes[this.currentMode];
        const modeStats = this.stats[this.currentMode];

        // Actualizar best score
        if (finalScore > modeStats.bestScore) {
            modeStats.bestScore = finalScore;
            console.log(`🏆 ¡Nuevo récord en ${mode.name}!`);
        }

        // Stats específicos por modo
        if (this.currentMode === 'timeAttack') {
            const timeUsed = this.modeState.timeElapsed;
            if (!modeStats.bestTime || timeUsed < modeStats.bestTime) {
                modeStats.bestTime = timeUsed;
            }
        } else if (this.currentMode === 'survival') {
            const survivalTime = this.modeState.timeElapsed;
            if (!modeStats.longestTime || survivalTime > modeStats.longestTime) {
                modeStats.longestTime = survivalTime;
            }
        } else if (this.currentMode === 'classic' || this.currentMode === 'chaos') {
            if (finalStats.won) {
                modeStats.wins = (modeStats.wins || 0) + 1;
            }
        }

        this.saveModeStats();

        return {
            mode: this.currentMode,
            newRecord: finalScore > modeStats.bestScore - finalScore,
            stats: modeStats
        };
    }

    /**
     * Obtener configuración del modo actual
     */
    getCurrentSettings() {
        return this.modes[this.currentMode]?.settings || null;
    }

    /**
     * Obtener información del modo actual
     */
    getCurrentMode() {
        return {
            name: this.currentMode,
            info: this.modes[this.currentMode],
            state: this.modeState,
            modifiers: this.getActiveModifiers()
        };
    }

    /**
     * Obtener lista de modos disponibles según nivel del jugador
     */
    getAvailableModes(playerLevel) {
        return Object.keys(this.modes).map(key => {
            const mode = this.modes[key];
            return {
                id: key,
                name: mode.name,
                description: mode.description,
                icon: mode.icon,
                unlocked: playerLevel >= mode.unlockLevel,
                unlockLevel: mode.unlockLevel,
                stats: this.stats[key] || {}
            };
        });
    }

    /**
     * Calcular bonus de tiempo (Time Attack)
     */
    calculateTimeBonus() {
        if (this.currentMode !== 'timeAttack') return 0;

        const mode = this.modes.timeAttack;
        const timeRemaining = Math.max(0, this.modeState.timeRemaining);
        const secondsRemaining = Math.floor(timeRemaining / 1000);

        return secondsRemaining * mode.settings.bonusPerSecond;
    }

    /**
     * Obtener status para UI
     */
    getUIStatus() {
        const mode = this.modes[this.currentMode];

        return {
            modeName: mode.name,
            icon: mode.icon,
            hasTimeLimit: mode.settings.hasTimeLimit,
            timeRemaining: this.modeState.timeRemaining,
            timeElapsed: this.modeState.timeElapsed,
            difficultyMultiplier: this.modeState.currentDifficultyMultiplier,
            activeEvents: this.modeState.activeEvents,
            isRespawning: this.modeState.isRespawning,
            respawnTimer: this.modeState.respawnTimer,
            deaths: this.modeState.deaths
        };
    }
}

export default GameModeManager;
