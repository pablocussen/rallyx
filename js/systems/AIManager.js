/**
 * AI Manager - Sistema de Inteligencia Artificial
 * Ajusta dificultad dinámicamente, personaliza experiencia, hace el juego "vivo"
 *
 * Características:
 * - Analiza performance del jugador en tiempo real
 * - Ajusta dificultad automáticamente
 * - Detecta patrones de juego (agresivo, defensivo, explorador)
 * - Crea desafíos personalizados
 * - Balanceo para todas las edades
 */

import Storage from '../utils/Storage.js';

export class AIManager {
    constructor() {
        // Métricas del jugador
        this.playerProfile = {
            skillLevel: 'beginner', // beginner, intermediate, advanced, expert, master
            playstyle: 'balanced', // aggressive, defensive, explorer, speedrunner
            preferredDifficulty: 'normal',
            gamesPlayed: 0,
            totalPlaytime: 0,
            averageScore: 0,
            averageSurvival: 0,
            deathsAnalysis: {
                byEnemy: 0,
                byObstacle: 0,
                byTime: 0
            }
        };

        // Estado actual del juego
        this.gameState = {
            currentDifficulty: 1.0, // Multiplicador 0.5-3.0
            tensionLevel: 0, // 0-100
            flowState: 0, // 0-100 (estado de flujo óptimo)
            lastAdjustment: 0,
            consecutiveDeaths: 0,
            consecutivePerfects: 0
        };

        // Configuración de dificultad dinámica
        this.difficultySettings = {
            enemySpeedMultiplier: 1.0,
            enemyCountMultiplier: 1.0,
            spawnRateMultiplier: 1.0,
            powerupFrequency: 1.0,
            reactionTimeRequired: 1.0
        };

        // Sistema de análisis en tiempo real
        this.realtimeMetrics = {
            recentDeaths: [], // últimas 10 muertes
            recentScores: [], // últimos 10 scores
            decisionTime: [], // tiempo de reacción promedio
            riskTaking: 0, // 0-100
            efficiency: 0 // 0-100
        };

        this.loadProfile();
    }

    loadProfile() {
        const data = Storage.get('rallyx_ai_profile', this.playerProfile);
        this.playerProfile = { ...this.playerProfile, ...data };
        this.analyzeLongTermProfile();
    }

    saveProfile() {
        Storage.set('rallyx_ai_profile', this.playerProfile);
    }

    /**
     * Análisis del perfil a largo plazo
     */
    analyzeLongTermProfile() {
        const { gamesPlayed, averageScore, averageSurvival } = this.playerProfile;

        // Determinar nivel de habilidad
        if (gamesPlayed < 5) {
            this.playerProfile.skillLevel = 'beginner';
        } else if (averageScore < 3000) {
            this.playerProfile.skillLevel = 'beginner';
        } else if (averageScore < 8000) {
            this.playerProfile.skillLevel = 'intermediate';
        } else if (averageScore < 15000) {
            this.playerProfile.skillLevel = 'advanced';
        } else if (averageScore < 25000) {
            this.playerProfile.skillLevel = 'expert';
        } else {
            this.playerProfile.skillLevel = 'master';
        }

        // Ajustar dificultad base según habilidad
        const skillMultipliers = {
            beginner: 0.7,
            intermediate: 1.0,
            advanced: 1.3,
            expert: 1.6,
            master: 2.0
        };

        this.gameState.currentDifficulty = skillMultipliers[this.playerProfile.skillLevel];
    }

    /**
     * Actualización en tiempo real durante el juego
     */
    update(gameStats, deltaTime) {
        // Analizar estilo de juego
        this.analyzePlaystyle(gameStats);

        // Ajustar tensión
        this.updateTension(gameStats, deltaTime);

        // Calcular estado de flujo
        this.calculateFlowState(gameStats);

        // Ajustar dificultad dinámicamente (cada 5 segundos)
        this.gameState.lastAdjustment += deltaTime;
        if (this.gameState.lastAdjustment >= 5000) {
            this.adjustDifficulty(gameStats);
            this.gameState.lastAdjustment = 0;
        }

        return this.difficultySettings;
    }

    /**
     * Detecta el estilo de juego del jugador
     */
    analyzePlaystyle(stats) {
        const { score, enemiesAvoided, flagsCollected, powerupsCollected, survivalTime } = stats;

        // Calcular métricas
        const flagsPerMinute = (flagsCollected / (survivalTime / 60000)) || 0;
        const riskyMoves = enemiesAvoided / (survivalTime / 1000) || 0;
        const powerupUsage = powerupsCollected / (survivalTime / 60000) || 0;

        // Aggressive: muchos flags, muchos riesgos
        const aggressiveScore = flagsPerMinute * 2 + riskyMoves * 3;

        // Defensive: pocos riesgos, muchos powerups defensivos
        const defensiveScore = (1 / (riskyMoves + 1)) * 5 + powerupUsage;

        // Explorer: recoge todo, explora todo el mapa
        const explorerScore = flagsPerMinute + powerupUsage * 2;

        // Speedrunner: score alto en poco tiempo
        const speedScore = score / (survivalTime / 1000);

        // Determinar estilo dominante
        const styles = {
            aggressive: aggressiveScore,
            defensive: defensiveScore,
            explorer: explorerScore,
            speedrunner: speedScore
        };

        const dominantStyle = Object.keys(styles).reduce((a, b) =>
            styles[a] > styles[b] ? a : b
        );

        this.playerProfile.playstyle = dominantStyle;

        // Calcular risk-taking
        this.realtimeMetrics.riskTaking = Math.min(100, riskyMoves * 20);

        // Calcular efficiency
        this.realtimeMetrics.efficiency = Math.min(100, (score / (survivalTime / 1000)) / 10);
    }

    /**
     * Actualiza el nivel de tensión del juego
     */
    updateTension(stats, deltaTime) {
        const { health, enemiesNearby, combo, hasShield } = stats;

        let tension = 0;

        // Salud baja = más tensión
        if (health <= 20) tension += 40;
        else if (health <= 50) tension += 20;

        // Enemigos cerca = tensión
        tension += Math.min(30, enemiesNearby * 10);

        // Combo alto = adrenalina (tensión positiva)
        tension += Math.min(20, combo * 2);

        // Shield = reduce tensión
        if (hasShield) tension -= 20;

        this.gameState.tensionLevel = Math.max(0, Math.min(100, tension));
    }

    /**
     * Calcula si el jugador está en "flow state" (zona óptima)
     */
    calculateFlowState(stats) {
        const { score, deaths, survivalTime, combo } = stats;

        // Flow = desafío equilibrado con habilidad
        const challenge = this.gameState.tensionLevel;
        const skill = this.realtimeMetrics.efficiency;

        // Flow óptimo cuando challenge ~= skill (±20)
        const difference = Math.abs(challenge - skill);
        let flow = 100 - difference;

        // Bonus por combo (señal de flow)
        if (combo > 5) flow += 10;
        if (combo > 10) flow += 10;

        // Penalización por muertes repetidas (frustración)
        flow -= this.gameState.consecutiveDeaths * 10;

        this.gameState.flowState = Math.max(0, Math.min(100, flow));
    }

    /**
     * Ajusta la dificultad dinámicamente
     */
    adjustDifficulty(stats) {
        const { flowState, consecutiveDeaths, consecutivePerfects } = this.gameState;

        // Flow bajo = jugador frustrado o aburrido
        if (flowState < 30) {
            if (this.realtimeMetrics.efficiency < 40) {
                // Jugador tiene dificultades -> FACILITAR
                this.gameState.currentDifficulty *= 0.9;
                this.difficultySettings.enemySpeedMultiplier *= 0.95;
                this.difficultySettings.powerupFrequency *= 1.1;
                console.log('🤖 AI: Reduciendo dificultad (jugador frustrado)');
            } else {
                // Jugador aburrido -> AUMENTAR DESAFÍO
                this.gameState.currentDifficulty *= 1.1;
                this.difficultySettings.enemyCountMultiplier *= 1.05;
                console.log('🤖 AI: Aumentando dificultad (jugador aburrido)');
            }
        }

        // Flow alto = jugador en la zona óptima
        else if (flowState > 70) {
            // Mantener este estado, ajustes mínimos
            console.log('🤖 AI: Flow state óptimo, manteniendo dificultad');
        }

        // Muertes consecutivas = frustración
        if (consecutiveDeaths >= 3) {
            this.gameState.currentDifficulty *= 0.8;
            this.difficultySettings.powerupFrequency *= 1.3;
            console.log('🤖 AI: Ayudando al jugador (muertes consecutivas)');
        }

        // Perfects consecutivos = demasiado fácil
        if (consecutivePerfects >= 2) {
            this.gameState.currentDifficulty *= 1.2;
            this.difficultySettings.enemySpeedMultiplier *= 1.1;
            console.log('🤖 AI: Aumentando desafío (muy fácil)');
        }

        // Limitar rangos
        this.gameState.currentDifficulty = Math.max(0.5, Math.min(3.0, this.gameState.currentDifficulty));
        this.difficultySettings.enemySpeedMultiplier = Math.max(0.6, Math.min(2.0, this.difficultySettings.enemySpeedMultiplier));
        this.difficultySettings.enemyCountMultiplier = Math.max(0.7, Math.min(2.0, this.difficultySettings.enemyCountMultiplier));
        this.difficultySettings.powerupFrequency = Math.max(0.5, Math.min(2.0, this.difficultySettings.powerupFrequency));
    }

    /**
     * Registrar muerte para análisis
     */
    recordDeath(cause, stats) {
        this.realtimeMetrics.recentDeaths.push({
            cause,
            score: stats.score,
            time: stats.survivalTime,
            timestamp: Date.now()
        });

        // Mantener solo últimas 10
        if (this.realtimeMetrics.recentDeaths.length > 10) {
            this.realtimeMetrics.recentDeaths.shift();
        }

        // Actualizar análisis
        this.playerProfile.deathsAnalysis[cause] = (this.playerProfile.deathsAnalysis[cause] || 0) + 1;

        // Consecutivas
        this.gameState.consecutiveDeaths++;
        this.gameState.consecutivePerfects = 0;

        this.saveProfile();
    }

    /**
     * Registrar nivel completado
     */
    recordLevelComplete(stats, wasPerfect) {
        this.realtimeMetrics.recentScores.push(stats.score);
        if (this.realtimeMetrics.recentScores.length > 10) {
            this.realtimeMetrics.recentScores.shift();
        }

        // Actualizar promedios
        this.playerProfile.gamesPlayed++;
        this.playerProfile.totalPlaytime += stats.survivalTime;
        this.playerProfile.averageScore = (
            (this.playerProfile.averageScore * (this.playerProfile.gamesPlayed - 1) + stats.score) /
            this.playerProfile.gamesPlayed
        );
        this.playerProfile.averageSurvival = (
            (this.playerProfile.averageSurvival * (this.playerProfile.gamesPlayed - 1) + stats.survivalTime) /
            this.playerProfile.gamesPlayed
        );

        // Consecutivos
        if (wasPerfect) {
            this.gameState.consecutivePerfects++;
        } else {
            this.gameState.consecutivePerfects = 0;
        }
        this.gameState.consecutiveDeaths = 0;

        this.analyzeLongTermProfile();
        this.saveProfile();
    }

    /**
     * Obtener recomendaciones personalizadas
     */
    getRecommendations() {
        const recs = [];

        // Basado en estilo de juego
        if (this.playerProfile.playstyle === 'aggressive') {
            recs.push('Intenta un enfoque más defensivo en niveles difíciles');
        } else if (this.playerProfile.playstyle === 'defensive') {
            recs.push('¡Atrévete a tomar más riesgos para mayor puntuación!');
        }

        // Basado en muertes
        const topCause = Object.keys(this.playerProfile.deathsAnalysis).reduce((a, b) =>
            this.playerProfile.deathsAnalysis[a] > this.playerProfile.deathsAnalysis[b] ? a : b
        );

        if (topCause === 'byEnemy') {
            recs.push('Usa más el power-up de Shield contra enemigos');
        } else if (topCause === 'byObstacle') {
            recs.push('Practica esquivar obstáculos en niveles fáciles');
        }

        // Basado en nivel
        if (this.playerProfile.skillLevel === 'beginner') {
            recs.push('Completa el tutorial para aprender mecánicas avanzadas');
        } else if (this.playerProfile.skillLevel === 'master') {
            recs.push('¡Prueba el modo Chaos para el desafío definitivo!');
        }

        return recs;
    }

    /**
     * Estado del AI para debugging/UI
     */
    getStatus() {
        return {
            profile: this.playerProfile,
            gameState: this.gameState,
            difficulty: this.difficultySettings,
            metrics: this.realtimeMetrics,
            recommendations: this.getRecommendations()
        };
    }
}

export default AIManager;
