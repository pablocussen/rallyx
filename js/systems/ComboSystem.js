/**
 * Combo System - Sistema de Combos Explosivos
 * Hace el juego ADICTIVO con cadenas de acciones, multiplicadores y feedback visual
 *
 * Características:
 * - Combo chain creciente (x2, x3, x4, ... x20+)
 * - Time window que se reduce con cada combo
 * - Visual y audio feedback escalante
 * - Bonus scores masivos
 * - Sistema de "fever mode" al llegar a combos altos
 */

export class ComboSystem {
    constructor() {
        // Estado del combo
        this.combo = 0;
        this.maxCombo = 0;
        this.comboMultiplier = 1.0;
        this.timeWindow = 3000; // 3 segundos inicial
        this.minTimeWindow = 500; // Mínimo 0.5 segundos
        this.timeWindowDecay = 0.9; // Se reduce 10% cada combo
        this.lastActionTime = 0;
        this.isActive = false;

        // Fever Mode (activado en combos altos)
        this.feverMode = false;
        this.feverThreshold = 10; // Combo 10+ = fever
        this.feverMultiplier = 2.0;

        // Tipos de acciones que cuentan para combo
        this.comboActions = {
            flagCollected: { points: 100, weight: 1 },
            enemyAvoided: { points: 50, weight: 0.5 },
            powerupCollected: { points: 75, weight: 0.8 },
            nearMiss: { points: 150, weight: 1.5 }, // Pasar muy cerca de enemigo
            perfectTurn: { points: 50, weight: 0.5 }, // Girar sin frenar
            chainReaction: { points: 200, weight: 2.0 } // Múltiples acciones en 1 segundo
        };

        // Milestones de combo con recompensas especiales
        this.comboMilestones = {
            5: { name: 'Nice!', bonus: 500, color: '#00ff00' },
            10: { name: 'Great!!', bonus: 1000, color: '#00ffff', enterFever: true },
            15: { name: 'Excellent!!!', bonus: 2000, color: '#ffff00' },
            20: { name: 'AMAZING!!!!', bonus: 5000, color: '#ff8800' },
            30: { name: 'GODLIKE!!!!!', bonus: 10000, color: '#ff0088' },
            50: { name: '🔥 LEGENDARY 🔥', bonus: 25000, color: '#ff0000' }
        };

        // Historial reciente de acciones
        this.recentActions = [];
        this.chainReactionWindow = 1000; // 1 segundo para chain reaction

        // Stats
        this.stats = {
            totalCombos: 0,
            longestCombo: 0,
            feverModeActivations: 0,
            totalComboPoints: 0,
            milestonesReached: []
        };
    }

    /**
     * Registrar acción que contribuye al combo
     */
    registerAction(actionType, timestamp = Date.now()) {
        const action = this.comboActions[actionType];
        if (!action) {
            console.warn(`Tipo de acción desconocido: ${actionType}`);
            return null;
        }

        // Verificar si el combo sigue activo (dentro del time window)
        const timeSinceLastAction = timestamp - this.lastActionTime;

        if (this.isActive && timeSinceLastAction > this.timeWindow) {
            // Combo roto!
            this.breakCombo();
        }

        // Incrementar combo
        this.combo++;
        this.isActive = true;
        this.lastActionTime = timestamp;
        this.stats.totalCombos++;

        // Agregar a historial reciente
        this.recentActions.push({
            type: actionType,
            timestamp,
            combo: this.combo
        });

        // Limpiar acciones antiguas (más de 1 segundo)
        this.recentActions = this.recentActions.filter(
            a => timestamp - a.timestamp < this.chainReactionWindow
        );

        // Detectar chain reaction (3+ acciones en 1 segundo)
        const isChainReaction = this.recentActions.length >= 3;
        if (isChainReaction) {
            // Bonus extra!
            console.log('⚡ CHAIN REACTION!');
        }

        // Calcular multiplicador
        this.comboMultiplier = 1.0 + (this.combo * 0.1); // +10% por combo

        // Fever mode
        if (this.combo >= this.feverThreshold && !this.feverMode) {
            this.activateFeverMode();
        }

        // Reducir time window (se hace más difícil mantener combo)
        if (this.combo > 1) {
            this.timeWindow = Math.max(
                this.minTimeWindow,
                this.timeWindow * this.timeWindowDecay
            );
        }

        // Verificar milestones
        const milestone = this.checkMilestone();

        // Actualizar max combo
        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }
        if (this.combo > this.stats.longestCombo) {
            this.stats.longestCombo = this.combo;
        }

        // Calcular puntos de esta acción
        let points = action.points * this.comboMultiplier;
        if (this.feverMode) {
            points *= this.feverMultiplier;
        }
        if (isChainReaction) {
            points *= this.comboActions.chainReaction.weight;
        }

        this.stats.totalComboPoints += points;

        return {
            combo: this.combo,
            multiplier: this.comboMultiplier,
            points: Math.floor(points),
            timeWindow: this.timeWindow,
            feverMode: this.feverMode,
            isChainReaction,
            milestone,
            action: actionType
        };
    }

    /**
     * Verificar si se alcanzó un milestone
     */
    checkMilestone() {
        const milestone = this.comboMilestones[this.combo];
        if (milestone) {
            console.log(`🎯 Milestone alcanzado: ${milestone.name} (Combo x${this.combo})`);

            // Agregar a stats si es primera vez
            if (!this.stats.milestonesReached.includes(this.combo)) {
                this.stats.milestonesReached.push(this.combo);
            }

            // Activar fever mode si corresponde
            if (milestone.enterFever && !this.feverMode) {
                this.activateFeverMode();
            }

            return {
                combo: this.combo,
                name: milestone.name,
                bonus: milestone.bonus,
                color: milestone.color
            };
        }
        return null;
    }

    /**
     * Activar Fever Mode
     */
    activateFeverMode() {
        if (this.feverMode) return;

        this.feverMode = true;
        this.stats.feverModeActivations++;
        console.log('🔥🔥🔥 FEVER MODE ACTIVATED! 🔥🔥🔥');

        return {
            activated: true,
            multiplier: this.feverMultiplier,
            message: 'FEVER MODE!'
        };
    }

    /**
     * Desactivar Fever Mode
     */
    deactivateFeverMode() {
        if (!this.feverMode) return;

        this.feverMode = false;
        console.log('Fever Mode terminado');
    }

    /**
     * Romper combo
     */
    breakCombo() {
        if (!this.isActive || this.combo === 0) return null;

        const brokenCombo = this.combo;
        const wasInFever = this.feverMode;

        console.log(`💔 Combo roto en x${brokenCombo}`);

        // Reset
        this.combo = 0;
        this.comboMultiplier = 1.0;
        this.timeWindow = 3000; // Reset a 3 segundos
        this.isActive = false;
        this.recentActions = [];
        this.deactivateFeverMode();

        return {
            brokenCombo,
            wasInFever,
            message: `Combo roto en x${brokenCombo}`
        };
    }

    /**
     * Actualizar combo system (verificar time window)
     */
    update(timestamp = Date.now()) {
        if (!this.isActive) return null;

        const timeSinceLastAction = timestamp - this.lastActionTime;

        // Verificar si el combo se rompió por tiempo
        if (timeSinceLastAction > this.timeWindow) {
            return this.breakCombo();
        }

        // Calcular tiempo restante
        const timeRemaining = this.timeWindow - timeSinceLastAction;
        const percentageRemaining = (timeRemaining / this.timeWindow) * 100;

        return {
            combo: this.combo,
            timeRemaining,
            percentageRemaining,
            feverMode: this.feverMode,
            multiplier: this.comboMultiplier
        };
    }

    /**
     * Obtener estado actual del combo para UI
     */
    getStatus() {
        const now = Date.now();
        const timeSinceLastAction = this.isActive ? now - this.lastActionTime : 0;
        const timeRemaining = this.isActive ? Math.max(0, this.timeWindow - timeSinceLastAction) : 0;

        return {
            combo: this.combo,
            maxCombo: this.maxCombo,
            multiplier: this.comboMultiplier,
            isActive: this.isActive,
            feverMode: this.feverMode,
            timeWindow: this.timeWindow,
            timeRemaining,
            percentageRemaining: this.isActive ? (timeRemaining / this.timeWindow) * 100 : 0,
            nextMilestone: this.getNextMilestone()
        };
    }

    /**
     * Obtener próximo milestone
     */
    getNextMilestone() {
        const nextMilestones = Object.keys(this.comboMilestones)
            .map(Number)
            .filter(m => m > this.combo)
            .sort((a, b) => a - b);

        if (nextMilestones.length > 0) {
            const next = nextMilestones[0];
            return {
                combo: next,
                ...this.comboMilestones[next]
            };
        }
        return null;
    }

    /**
     * Obtener estadísticas del combo
     */
    getStats() {
        return {
            ...this.stats,
            currentCombo: this.combo,
            currentMaxCombo: this.maxCombo
        };
    }

    /**
     * Reset stats (nuevo juego)
     */
    resetStats() {
        this.maxCombo = 0;
        this.breakCombo();
    }

    /**
     * Calcular feedback visual basado en combo
     */
    getVisualFeedback() {
        const combo = this.combo;

        // Escalamiento de efectos visuales
        let scale = 1.0;
        let shake = 0;
        let flashIntensity = 0;
        let particleCount = 0;
        let color = '#ffffff';

        if (combo >= 50) {
            scale = 2.5;
            shake = 15;
            flashIntensity = 1.0;
            particleCount = 50;
            color = '#ff0000';
        } else if (combo >= 30) {
            scale = 2.2;
            shake = 12;
            flashIntensity = 0.9;
            particleCount = 40;
            color = '#ff0088';
        } else if (combo >= 20) {
            scale = 2.0;
            shake = 10;
            flashIntensity = 0.8;
            particleCount = 30;
            color = '#ff8800';
        } else if (combo >= 15) {
            scale = 1.8;
            shake = 8;
            flashIntensity = 0.6;
            particleCount = 25;
            color = '#ffff00';
        } else if (combo >= 10) {
            scale = 1.6;
            shake = 6;
            flashIntensity = 0.5;
            particleCount = 20;
            color = '#00ffff';
        } else if (combo >= 5) {
            scale = 1.4;
            shake = 4;
            flashIntensity = 0.3;
            particleCount = 15;
            color = '#00ff00';
        } else if (combo >= 3) {
            scale = 1.2;
            shake = 2;
            flashIntensity = 0.2;
            particleCount = 10;
            color = '#ffffff';
        }

        return {
            scale,
            shake,
            flashIntensity,
            particleCount,
            color,
            feverMode: this.feverMode
        };
    }

    /**
     * Obtener nivel de intensidad de audio basado en combo
     */
    getAudioIntensity() {
        const combo = this.combo;

        if (combo >= 30) return 1.0; // Máximo volumen, pitch alto
        if (combo >= 20) return 0.9;
        if (combo >= 15) return 0.8;
        if (combo >= 10) return 0.7;
        if (combo >= 5) return 0.6;
        if (combo >= 3) return 0.5;

        return 0.3; // Mínimo
    }

    /**
     * Forzar reset completo (game over)
     */
    reset() {
        this.breakCombo();
        this.maxCombo = 0;
        this.lastActionTime = 0;
        this.recentActions = [];
    }
}

export default ComboSystem;
