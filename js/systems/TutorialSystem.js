/**
 * Tutorial System - Sistema de Tutorial Interactivo
 * Enseña mecánicas del juego paso a paso, adaptativo, para todas las edades
 *
 * Características:
 * - Tutorial paso a paso con checkpoints
 * - Tooltips contextuales
 * - Se adapta al progreso del jugador
 * - Puede saltarse pero se recomienda completarlo
 * - Desbloquea tips avanzados según habilidad
 */

import Storage from '../utils/Storage.js';

export class TutorialSystem {
    constructor() {
        // Estado del tutorial
        this.active = false;
        this.completed = false;
        this.currentStep = 0;
        this.stepsCompleted = [];

        // Tracking de movimiento para el tutorial
        this.movementTracking = {
            movedUp: false,
            movedDown: false,
            movedLeft: false,
            movedRight: false
        };

        // Para detectar "presiona cualquier tecla"
        this.anyKeyPressed = false;

        // Pasos del tutorial
        this.steps = [
            {
                id: 'welcome',
                title: '¡Bienvenido a Rally X!',
                description: 'Aprende las mecánicas básicas para dominar el juego.',
                objective: 'Leer mensaje',
                checkpoint: () => this.anyKeyPressed, // Espera tecla
                hint: 'Presiona cualquier tecla para continuar',
                highlight: null,
                autoComplete: false
            },
            {
                id: 'movement',
                title: 'Movimiento',
                description: 'Usa WASD o las flechas para moverte.',
                objective: 'Muévete en todas las direcciones',
                checkpoint: () => {
                    return this.movementTracking.movedUp &&
                           this.movementTracking.movedDown &&
                           this.movementTracking.movedLeft &&
                           this.movementTracking.movedRight;
                },
                hint: '↑ ↓ ← → o W A S D',
                highlight: 'player',
                helpText: 'Practica moverte en todas las direcciones'
            },
            {
                id: 'flags',
                title: 'Recolectar Banderas',
                description: 'Las banderas son tu objetivo principal. ¡Recógelas todas!',
                objective: 'Recoge 3 banderas',
                checkpoint: (stats) => stats.flagsCollected >= 3,
                hint: 'Busca las banderas 🏁 en el mapa',
                highlight: 'flags',
                helpText: 'Las banderas te dan puntos y son necesarias para completar niveles'
            },
            {
                id: 'enemies',
                title: 'Evitar Enemigos',
                description: 'Los enemigos rojos te persiguen. ¡Evítalos!',
                objective: 'Sobrevive 10 segundos con enemigos',
                checkpoint: (stats) => stats.survivalTime >= 10000,
                hint: 'Mantén distancia de los enemigos rojos',
                highlight: 'enemies',
                helpText: 'Los enemigos te siguen. Usa tu velocidad y agilidad para esquivarlos'
            },
            {
                id: 'powerups',
                title: 'Power-ups',
                description: 'Los power-ups te dan habilidades especiales.',
                objective: 'Recoge un power-up',
                checkpoint: (stats) => stats.powerupsCollected >= 1,
                hint: 'Los power-ups aparecen aleatoriamente',
                highlight: 'powerups',
                helpText: 'Speed, Shield, SlowTime, DoublePoints, Magnet - cada uno te ayuda diferente'
            },
            {
                id: 'combo',
                title: 'Sistema de Combos',
                description: 'Encadena acciones rápidas para multiplicar tu puntuación.',
                objective: 'Consigue combo x5',
                checkpoint: (stats) => stats.maxCombo >= 5,
                hint: 'Recoge banderas y power-ups rápidamente',
                highlight: 'combo',
                helpText: 'Cuanto más rápido encadenes acciones, mayor será tu combo'
            },
            {
                id: 'completion',
                title: '¡Tutorial Completado!',
                description: '¡Excelente! Ya conoces las mecánicas básicas.',
                objective: 'Completado',
                checkpoint: () => true,
                hint: 'Ahora estás listo para jugar',
                highlight: null,
                autoComplete: true,
                rewards: {
                    xp: 500,
                    message: '¡Has desbloqueado tips avanzados!'
                }
            }
        ];

        // Tooltips contextuales (aparecen según situación)
        this.contextualTips = {
            lowHealth: {
                condition: (state) => state.health <= 30,
                message: '¡Cuidado! Tu salud está baja. Busca un power-up de Shield.',
                priority: 'high',
                cooldown: 30000 // 30 segundos entre tips iguales
            },
            nearMiss: {
                condition: (state) => state.nearMissCount > 0,
                message: '¡Casi! Las near misses te dan puntos extra.',
                priority: 'medium',
                cooldown: 20000
            },
            comboBreak: {
                condition: (state) => state.comboBroken && state.brokenCombo >= 10,
                message: '¡Combo roto! Sigue encadenando acciones para mantenerlo.',
                priority: 'medium',
                cooldown: 15000
            },
            feverReady: {
                condition: (state) => state.combo >= 9 && !state.feverMode,
                message: '¡Un combo más y entras en FEVER MODE!',
                priority: 'high',
                cooldown: 60000
            },
            flagsRemaining: {
                condition: (state) => state.flagsRemaining === 1,
                message: '¡Última bandera! Completa el nivel.',
                priority: 'high',
                cooldown: 60000
            },
            missionProgress: {
                condition: (state) => state.missionNearComplete,
                message: 'Estás cerca de completar una misión diaria.',
                priority: 'low',
                cooldown: 45000
            }
        };

        // Tips avanzados (se desbloquean tras completar tutorial)
        this.advancedTips = [
            '💡 Tip: Usa los bordes del mapa para escapar de enemigos',
            '💡 Tip: El power-up SlowTime también afecta a los enemigos',
            '💡 Tip: Los combos altos aumentan el spawn de power-ups',
            '💡 Tip: En modo Survival, la dificultad aumenta cada 30 segundos',
            '💡 Tip: Completa misiones diarias para XP extra',
            '💡 Tip: Los skins legendarios tienen efectos visuales únicos',
            '💡 Tip: Fever Mode duplica tus puntos automáticamente',
            '💡 Tip: Mantén una racha diaria para multiplicadores permanentes'
        ];

        // Estado de tips mostrados (cooldown)
        this.tipsShown = {};

        this.loadProgress();
    }

    /**
     * Cargar progreso del tutorial
     */
    loadProgress() {
        const data = Storage.get('rallyx_tutorial', {
            completed: false,
            stepsCompleted: [],
            skipped: false
        });

        this.completed = data.completed;
        this.stepsCompleted = data.stepsCompleted;
        this.skipped = data.skipped;
    }

    /**
     * Guardar progreso
     */
    saveProgress() {
        Storage.set('rallyx_tutorial', {
            completed: this.completed,
            stepsCompleted: this.stepsCompleted,
            skipped: this.skipped
        });
    }

    /**
     * Iniciar tutorial
     */
    start() {
        if (this.completed || this.skipped) {
            console.log('Tutorial ya completado o saltado');
            return false;
        }

        this.active = true;
        this.currentStep = 0;

        // Resetear tracking
        this.movementTracking = {
            movedUp: false,
            movedDown: false,
            movedLeft: false,
            movedRight: false
        };
        this.anyKeyPressed = false;

        console.log('🎓 Tutorial iniciado');
        return true;
    }

    /**
     * Saltar tutorial
     */
    skip() {
        this.active = false;
        this.skipped = true;
        this.saveProgress();
        console.log('Tutorial saltado');
        return true;
    }

    /**
     * Actualizar tutorial (verificar checkpoints)
     */
    update(gameStats) {
        if (!this.active || this.completed) return null;

        // Actualizar tracking de movimiento (acumulativo)
        if (gameStats.movedUp) this.movementTracking.movedUp = true;
        if (gameStats.movedDown) this.movementTracking.movedDown = true;
        if (gameStats.movedLeft) this.movementTracking.movedLeft = true;
        if (gameStats.movedRight) this.movementTracking.movedRight = true;

        // Detectar si se presionó cualquier tecla
        if (gameStats.anyKeyPressed) {
            this.anyKeyPressed = true;
        }

        const currentStepData = this.steps[this.currentStep];

        // Verificar si el paso actual se completó
        if (currentStepData.checkpoint(gameStats)) {
            return this.completeCurrentStep();
        }

        return {
            active: true,
            step: currentStepData,
            stepNumber: this.currentStep + 1,
            totalSteps: this.steps.length,
            progress: (this.currentStep / this.steps.length) * 100
        };
    }

    /**
     * Completar paso actual
     */
    completeCurrentStep() {
        const step = this.steps[this.currentStep];

        if (!this.stepsCompleted.includes(step.id)) {
            this.stepsCompleted.push(step.id);
        }

        console.log(`✅ Tutorial paso completado: ${step.title}`);

        // Avanzar al siguiente paso
        this.currentStep++;

        // Verificar si terminó el tutorial
        if (this.currentStep >= this.steps.length) {
            return this.completeTutorial();
        }

        // Auto-complete siguiente paso si corresponde
        const nextStep = this.steps[this.currentStep];
        if (nextStep.autoComplete) {
            // Dar un momento para que se vea el mensaje
            setTimeout(() => {
                if (this.active) {
                    this.completeCurrentStep();
                }
            }, 2000);
        }

        this.saveProgress();

        return {
            stepCompleted: true,
            step,
            nextStep: this.steps[this.currentStep],
            stepNumber: this.currentStep + 1,
            totalSteps: this.steps.length
        };
    }

    /**
     * Completar tutorial completo
     */
    completeTutorial() {
        this.active = false;
        this.completed = true;
        this.saveProgress();

        console.log('🎉 ¡Tutorial completado!');

        const finalStep = this.steps[this.steps.length - 1];
        return {
            tutorialCompleted: true,
            rewards: finalStep.rewards,
            message: '¡Ya estás listo para dominar Rally X!'
        };
    }

    /**
     * Verificar y mostrar contextual tips
     */
    checkContextualTips(gameState) {
        if (!this.completed && !this.skipped) return null; // Solo después del tutorial

        const now = Date.now();
        const eligibleTips = [];

        Object.keys(this.contextualTips).forEach(tipId => {
            const tip = this.contextualTips[tipId];

            // Verificar cooldown
            const lastShown = this.tipsShown[tipId] || 0;
            if (now - lastShown < tip.cooldown) return;

            // Verificar condición
            if (tip.condition(gameState)) {
                eligibleTips.push({ id: tipId, ...tip });
            }
        });

        // Ordenar por prioridad
        eligibleTips.sort((a, b) => {
            const priorities = { high: 3, medium: 2, low: 1 };
            return priorities[b.priority] - priorities[a.priority];
        });

        // Mostrar el tip de mayor prioridad
        if (eligibleTips.length > 0) {
            const tip = eligibleTips[0];
            this.tipsShown[tip.id] = now;
            return tip;
        }

        return null;
    }

    /**
     * Obtener random advanced tip
     */
    getRandomAdvancedTip() {
        if (!this.completed) return null;

        const index = Math.floor(Math.random() * this.advancedTips.length);
        return this.advancedTips[index];
    }

    /**
     * Obtener paso actual
     */
    getCurrentStep() {
        if (!this.active) return null;
        return {
            ...this.steps[this.currentStep],
            stepNumber: this.currentStep + 1,
            totalSteps: this.steps.length
        };
    }

    /**
     * Verificar si debe mostrarse el tutorial
     */
    shouldShow() {
        return !this.completed && !this.skipped;
    }

    /**
     * Obtener progreso
     */
    getProgress() {
        return {
            active: this.active,
            completed: this.completed,
            skipped: this.skipped,
            currentStep: this.currentStep,
            totalSteps: this.steps.length,
            stepsCompleted: this.stepsCompleted.length,
            progress: (this.stepsCompleted.length / this.steps.length) * 100
        };
    }

    /**
     * Reiniciar tutorial (para replay)
     */
    reset() {
        this.active = false;
        this.completed = false;
        this.skipped = false;
        this.currentStep = 0;
        this.stepsCompleted = [];
        this.tipsShown = {};

        // Resetear tracking
        this.movementTracking = {
            movedUp: false,
            movedDown: false,
            movedLeft: false,
            movedRight: false
        };
        this.anyKeyPressed = false;

        this.saveProgress();

        console.log('Tutorial reiniciado');
    }

    /**
     * Forzar siguiente paso (para debug/testing)
     */
    forceNextStep() {
        if (!this.active) return false;

        return this.completeCurrentStep();
    }

    /**
     * Obtener info de un paso específico
     */
    getStepInfo(stepId) {
        return this.steps.find(s => s.id === stepId);
    }

    /**
     * Obtener todas las stats de completitud
     */
    getCompletionStats() {
        return {
            completed: this.completed,
            skipped: this.skipped,
            stepsCompleted: this.stepsCompleted.length,
            totalSteps: this.steps.length,
            percentComplete: (this.stepsCompleted.length / this.steps.length) * 100,
            advancedTipsUnlocked: this.completed,
            currentStreak: this.stepsCompleted.length
        };
    }
}

export default TutorialSystem;
