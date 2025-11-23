/**
 * Endless Mode
 * Modo de supervivencia infinito con dificultad creciente
 *
 * @class EndlessMode
 * @description Modo de juego con:
 * - Dificultad que aumenta progresivamente
 * - Oleadas infinitas de enemigos
 * - Sistema de power-ups más frecuente
 * - Leaderboard de supervivencia
 * - Eventos especiales aleatorios
 */

export class EndlessMode {
    constructor() {
        this.modeName = 'Endless';
        this.modeId = 'endless';
        this.description = 'Sobrevive el mayor tiempo posible con dificultad creciente';

        // Configuración base
        this.baseConfig = {
            startingHealth: 3,
            startingEnemies: 3,
            startingFlags: 10,
            powerupSpawnRate: 1.5, // Más powerups
            difficultyIncreaseRate: 0.15, // 15% por oleada
            maxDifficultyMultiplier: 5.0, // Máximo 5x dificultad
            waveInterval: 30000, // Nueva oleada cada 30 segundos
            bossWaveInterval: 5, // Boss cada 5 oleadas
        };

        // Estado del modo
        this.active = false;
        this.wave = 0;
        this.score = 0;
        this.survivalTime = 0;
        this.startTime = 0;
        this.lastWaveTime = 0;
        this.difficultyMultiplier = 1.0;
        this.totalKills = 0;
        this.totalFlagsCollected = 0;
        this.personalBest = this._loadPersonalBest();

        // Eventos especiales
        this.events = [
            {
                name: 'Flag Frenzy',
                description: '¡El doble de banderas aparecen!',
                probability: 0.15,
                duration: 15000,
                effect: { flagMultiplier: 2 }
            },
            {
                name: 'Power Hour',
                description: '¡Power-ups por todas partes!',
                probability: 0.12,
                duration: 20000,
                effect: { powerupSpawnRate: 3 }
            },
            {
                name: 'Enemy Swarm',
                description: '¡Horda de enemigos!',
                probability: 0.10,
                duration: 10000,
                effect: { enemyMultiplier: 2, scoreMultiplier: 2 }
            },
            {
                name: 'Slow Motion',
                description: 'Todo se mueve más lento',
                probability: 0.08,
                duration: 12000,
                effect: { timeScale: 0.5, scoreMultiplier: 1.5 }
            },
            {
                name: 'Speed Boost',
                description: '¡Velocidad máxima!',
                probability: 0.10,
                duration: 15000,
                effect: { playerSpeedMultiplier: 1.5 }
            }
        ];

        this.activeEvent = null;
        this.eventEndTime = 0;
    }

    /**
     * Inicia el modo Endless
     * @returns {Object} Configuración inicial
     */
    start() {
        this.active = true;
        this.wave = 0;
        this.score = 0;
        this.survivalTime = 0;
        this.startTime = Date.now();
        this.lastWaveTime = this.startTime;
        this.difficultyMultiplier = 1.0;
        this.totalKills = 0;
        this.totalFlagsCollected = 0;
        this.activeEvent = null;

        console.log('♾️ Endless Mode iniciado');

        return this._generateWave();
    }

    /**
     * Actualiza el modo Endless
     * @param {number} deltaTime - Delta en ms
     * @returns {Object|null} Cambios si hay nueva oleada o evento
     */
    update(deltaTime) {
        if (!this.active) return null;

        this.survivalTime = Date.now() - this.startTime;
        const timeSinceWave = Date.now() - this.lastWaveTime;

        const updates = {};

        // Verificar si es tiempo de nueva oleada
        if (timeSinceWave >= this.baseConfig.waveInterval) {
            updates.newWave = this._generateWave();
            this.lastWaveTime = Date.now();
        }

        // Actualizar evento activo
        if (this.activeEvent && Date.now() >= this.eventEndTime) {
            updates.eventEnded = this.activeEvent.name;
            this.activeEvent = null;
        }

        // Posibilidad de nuevo evento
        if (!this.activeEvent && Math.random() < 0.05) { // 5% cada update
            const event = this._triggerRandomEvent();
            if (event) {
                updates.newEvent = event;
            }
        }

        return Object.keys(updates).length > 0 ? updates : null;
    }

    /**
     * Genera una nueva oleada
     * @returns {Object} Configuración de la oleada
     * @private
     */
    _generateWave() {
        this.wave++;

        // Aumentar dificultad
        this.difficultyMultiplier = Math.min(
            1 + (this.wave * this.baseConfig.difficultyIncreaseRate),
            this.baseConfig.maxDifficultyMultiplier
        );

        // Verificar si es oleada de boss
        const isBossWave = this.wave % this.baseConfig.bossWaveInterval === 0;

        // Calcular cantidad de entidades
        const enemies = Math.floor(
            this.baseConfig.startingEnemies * this.difficultyMultiplier
        );
        const flags = Math.floor(
            this.baseConfig.startingFlags * (1 + this.difficultyMultiplier * 0.3)
        );

        return {
            wave: this.wave,
            enemies,
            flags,
            difficulty: this.difficultyMultiplier,
            isBossWave,
            powerupSpawnRate: this.baseConfig.powerupSpawnRate * (this.activeEvent?.effect.powerupSpawnRate || 1),
            announcement: isBossWave
                ? `¡OLEADA ${this.wave} - BOSS WAVE!`
                : `Oleada ${this.wave} - Dificultad x${this.difficultyMultiplier.toFixed(1)}`
        };
    }

    /**
     * Registra flag colectada
     * @param {number} points - Puntos base
     * @returns {number} Puntos con multiplicador
     */
    flagCollected(points) {
        this.totalFlagsCollected++;
        const multiplier = this.activeEvent?.effect.scoreMultiplier || 1;
        const finalPoints = Math.floor(points * this.difficultyMultiplier * multiplier);
        this.score += finalPoints;
        return finalPoints;
    }

    /**
     * Registra enemigo eliminado/esquivado
     */
    enemyKilled() {
        this.totalKills++;
        const killPoints = Math.floor(50 * this.difficultyMultiplier);
        this.score += killPoints;
        return killPoints;
    }

    /**
     * Activa un evento aleatorio
     * @returns {Object|null} Evento activado o null
     * @private
     */
    _triggerRandomEvent() {
        // Filtrar eventos disponibles por probabilidad
        const availableEvents = this.events.filter(e =>
            Math.random() < e.probability
        );

        if (availableEvents.length === 0) return null;

        // Seleccionar evento aleatorio
        const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];

        this.activeEvent = event;
        this.eventEndTime = Date.now() + event.duration;

        console.log(`🎲 Evento activado: ${event.name}`);

        return {
            name: event.name,
            description: event.description,
            duration: event.duration,
            effect: event.effect
        };
    }

    /**
     * Obtiene el evento activo actual
     * @returns {Object|null} Evento activo o null
     */
    getActiveEvent() {
        if (!this.activeEvent) return null;

        return {
            ...this.activeEvent,
            timeRemaining: Math.max(0, this.eventEndTime - Date.now())
        };
    }

    /**
     * Obtiene estadísticas actuales
     * @returns {Object} Stats en tiempo real
     */
    getStats() {
        return {
            wave: this.wave,
            score: this.score,
            survivalTime: this.survivalTime,
            survivalTimeFormatted: this._formatTime(this.survivalTime),
            difficulty: this.difficultyMultiplier.toFixed(2),
            totalKills: this.totalKills,
            totalFlags: this.totalFlagsCollected,
            activeEvent: this.getActiveEvent(),
            personalBest: this.personalBest,
            isNewRecord: this.score > (this.personalBest?.score || 0)
        };
    }

    /**
     * Finaliza el modo (game over)
     * @returns {Object} Resultados finales
     */
    end() {
        this.active = false;

        const isNewRecord = this.score > (this.personalBest?.score || 0);

        if (isNewRecord) {
            this.personalBest = {
                score: this.score,
                wave: this.wave,
                survivalTime: this.survivalTime,
                survivalTimeFormatted: this._formatTime(this.survivalTime),
                difficulty: this.difficultyMultiplier,
                date: Date.now()
            };
            this._savePersonalBest();
        }

        const rank = this._calculateRank();

        return {
            finalScore: this.score,
            finalWave: this.wave,
            survivalTime: this._formatTime(this.survivalTime),
            totalKills: this.totalKills,
            totalFlags: this.totalFlagsCollected,
            difficulty: this.difficultyMultiplier.toFixed(2),
            rank,
            isNewRecord,
            personalBest: this.personalBest,
            message: this._getRankMessage(rank)
        };
    }

    /**
     * Calcula rank basado en oleada alcanzada
     * @returns {string} Rank
     * @private
     */
    _calculateRank() {
        if (this.wave >= 50) return 'S';
        if (this.wave >= 30) return 'A';
        if (this.wave >= 20) return 'B';
        if (this.wave >= 10) return 'C';
        if (this.wave >= 5) return 'D';
        return 'F';
    }

    /**
     * Obtiene mensaje según rank
     * @param {string} rank - Rank obtenido
     * @returns {string} Mensaje
     * @private
     */
    _getRankMessage(rank) {
        const messages = {
            'S': '¡LEGENDARIO! ¡Eres imparable!',
            'A': '¡Increíble! Gran supervivencia.',
            'B': '¡Excelente! Muy buena resistencia.',
            'C': 'Buen intento, sigue mejorando.',
            'D': 'Necesitas más práctica.',
            'F': 'Apenas comenzaste, ¡no te rindas!'
        };

        return messages[rank] || messages['F'];
    }

    /**
     * Formatea tiempo en mm:ss
     * @param {number} ms - Milisegundos
     * @returns {string} Tiempo formateado
     * @private
     */
    _formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    /**
     * Carga personal best del storage
     * @returns {Object|null} Personal best o null
     * @private
     */
    _loadPersonalBest() {
        try {
            const saved = localStorage.getItem('rallyx_endless_best');
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.warn('Error cargando personal best:', error);
            return null;
        }
    }

    /**
     * Guarda personal best en storage
     * @private
     */
    _savePersonalBest() {
        try {
            localStorage.setItem('rallyx_endless_best', JSON.stringify(this.personalBest));
        } catch (error) {
            console.warn('Error guardando personal best:', error);
        }
    }

    /**
     * Resetea el modo
     */
    reset() {
        this.active = false;
        this.wave = 0;
        this.score = 0;
        this.survivalTime = 0;
        this.difficultyMultiplier = 1.0;
        this.totalKills = 0;
        this.totalFlagsCollected = 0;
        this.activeEvent = null;
    }
}

export default EndlessMode;
