/**
 * Time Attack Mode
 * Modo de juego enfocado en velocidad - completa niveles lo más rápido posible
 *
 * @class TimeAttackMode
 * @description Modo de juego con:
 * - Contador de tiempo preciso
 * - Penalizaciones por muerte
 * - Bonificaciones por velocidad
 * - Leaderboard por nivel
 * - Ghosts de mejores tiempos (futuro)
 */

export class TimeAttackMode {
    constructor() {
        this.modeName = 'Time Attack';
        this.modeId = 'timeAttack';
        this.description = 'Completa niveles lo más rápido posible';

        // Configuración del modo
        this.config = {
            lives: 3,
            startingHealth: 3,
            timeBonus: true,
            deathPenalty: 5000, // 5 segundos de penalización por muerte
            speedBonusThreshold: 30000, // Bonus si completas en menos de 30s
            perfectRunBonus: 10000, // Bonus por completar sin daño
            comboMultiplier: 1.5, // Multiplicador de combos aumentado
            powerupSpawnRate: 0.8, // Menos powerups (más desafío)
        };

        // Estado del modo
        this.active = false;
        this.currentLevel = 1;
        this.startTime = 0;
        this.totalTime = 0;
        this.levelTimes = []; // Tiempos de cada nivel
        this.deaths = 0;
        this.perfectRuns = 0;
        this.personalBests = {}; // Best times por nivel

        // Cargar personal bests
        this._loadPersonalBests();
    }

    /**
     * Inicializa el modo Time Attack
     * @param {number} startLevel - Nivel inicial
     * @returns {Object} Configuración inicial
     */
    start(startLevel = 1) {
        this.active = true;
        this.currentLevel = startLevel;
        this.startTime = performance.now();
        this.totalTime = 0;
        this.levelTimes = [];
        this.deaths = 0;
        this.perfectRuns = 0;

        console.log(`🏁 Time Attack Mode iniciado - Nivel ${startLevel}`);

        return {
            mode: this.modeId,
            level: this.currentLevel,
            config: this.config,
            ui: {
                showTimer: true,
                timerFormat: 'precise', // mm:ss.ms
                showDeathPenalty: true,
                showPersonalBest: true
            }
        };
    }

    /**
     * Finaliza un nivel en Time Attack
     * @param {Object} levelData - Datos del nivel completado
     * @returns {Object} Resultados y bonificaciones
     */
    completeLevel(levelData) {
        const levelTime = performance.now() - this.startTime;
        const { deaths, damageTaken, flagsCollected, maxCombo } = levelData;

        // Calcular tiempo con penalizaciones
        const deathPenaltyTime = deaths * this.config.deathPenalty;
        const finalTime = levelTime + deathPenaltyTime;

        // Verificar si es perfect run
        const isPerfectRun = damageTaken === 0 && deaths === 0;
        if (isPerfectRun) {
            this.perfectRuns++;
        }

        // Calcular bonificaciones
        const bonuses = this._calculateBonuses(levelTime, isPerfectRun, maxCombo);

        // Guardar tiempo del nivel
        this.levelTimes.push({
            level: this.currentLevel,
            time: levelTime,
            finalTime: finalTime,
            deaths: deaths,
            perfect: isPerfectRun,
            bonuses: bonuses
        });

        this.totalTime += finalTime;

        // Verificar si es personal best
        const isPersonalBest = this._checkPersonalBest(this.currentLevel, finalTime);

        // Preparar siguiente nivel
        this.currentLevel++;
        this.startTime = performance.now();

        return {
            levelTime: this._formatTime(levelTime),
            deathPenalty: deaths > 0 ? this._formatTime(deathPenaltyTime) : null,
            finalTime: this._formatTime(finalTime),
            totalTime: this._formatTime(this.totalTime),
            isPerfectRun,
            isPersonalBest,
            bonuses,
            rank: this._calculateRank(finalTime),
            nextLevel: this.currentLevel
        };
    }

    /**
     * Registra una muerte en Time Attack
     * @returns {Object} Información de la penalización
     */
    registerDeath() {
        this.deaths++;

        return {
            deathCount: this.deaths,
            penalty: this.config.deathPenalty,
            penaltyFormatted: this._formatTime(this.config.deathPenalty)
        };
    }

    /**
     * Obtiene el tiempo actual del nivel
     * @returns {Object} Tiempo formateado
     */
    getCurrentTime() {
        if (!this.active) return { time: 0, formatted: '00:00.000' };

        const currentTime = performance.now() - this.startTime;
        return {
            time: currentTime,
            formatted: this._formatTime(currentTime),
            withPenalty: currentTime + (this.deaths * this.config.deathPenalty),
            formattedWithPenalty: this._formatTime(
                currentTime + (this.deaths * this.config.deathPenalty)
            )
        };
    }

    /**
     * Obtiene el personal best para un nivel
     * @param {number} level - Número de nivel
     * @returns {Object|null} Personal best o null
     */
    getPersonalBest(level) {
        return this.personalBests[level] || null;
    }

    /**
     * Obtiene estadísticas completas del modo
     * @returns {Object} Stats completas
     */
    getStats() {
        return {
            totalTime: this._formatTime(this.totalTime),
            levelsCompleted: this.levelTimes.length,
            deaths: this.deaths,
            perfectRuns: this.perfectRuns,
            averageTime: this.levelTimes.length > 0
                ? this._formatTime(this.totalTime / this.levelTimes.length)
                : '00:00.000',
            levelTimes: this.levelTimes,
            personalBests: this.personalBests
        };
    }

    /**
     * Calcula bonificaciones por velocidad
     * @param {number} time - Tiempo del nivel
     * @param {boolean} isPerfect - Si fue perfect run
     * @param {number} maxCombo - Combo máximo alcanzado
     * @returns {Object} Bonificaciones
     * @private
     */
    _calculateBonuses(time, isPerfect, maxCombo) {
        const bonuses = {
            speed: 0,
            perfect: 0,
            combo: 0,
            total: 0
        };

        // Speed bonus (menos de 30 segundos)
        if (time < this.config.speedBonusThreshold) {
            bonuses.speed = Math.round((this.config.speedBonusThreshold - time) / 100);
        }

        // Perfect run bonus
        if (isPerfect) {
            bonuses.perfect = this.config.perfectRunBonus;
        }

        // Combo bonus
        if (maxCombo >= 5) {
            bonuses.combo = maxCombo * 100;
        }

        bonuses.total = bonuses.speed + bonuses.perfect + bonuses.combo;
        return bonuses;
    }

    /**
     * Calcula el rank basado en el tiempo
     * @param {number} time - Tiempo en ms
     * @returns {string} Rank (S, A, B, C, D)
     * @private
     */
    _calculateRank(time) {
        const seconds = time / 1000;

        if (seconds < 20) return 'S';
        if (seconds < 30) return 'A';
        if (seconds < 45) return 'B';
        if (seconds < 60) return 'C';
        return 'D';
    }

    /**
     * Verifica y guarda personal best
     * @param {number} level - Nivel
     * @param {number} time - Tiempo
     * @returns {boolean} Si es nuevo record
     * @private
     */
    _checkPersonalBest(level, time) {
        const currentBest = this.personalBests[level];

        if (!currentBest || time < currentBest.time) {
            this.personalBests[level] = {
                time: time,
                formatted: this._formatTime(time),
                date: Date.now(),
                rank: this._calculateRank(time)
            };

            this._savePersonalBests();
            return true;
        }

        return false;
    }

    /**
     * Formatea tiempo en formato mm:ss.ms
     * @param {number} ms - Milisegundos
     * @returns {string} Tiempo formateado
     * @private
     */
    _formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = Math.floor(ms % 1000);

        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
    }

    /**
     * Carga personal bests del storage
     * @private
     */
    _loadPersonalBests() {
        try {
            const saved = localStorage.getItem('rallyx_timeattack_bests');
            if (saved) {
                this.personalBests = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Error cargando personal bests:', error);
            this.personalBests = {};
        }
    }

    /**
     * Guarda personal bests en storage
     * @private
     */
    _savePersonalBests() {
        try {
            localStorage.setItem('rallyx_timeattack_bests', JSON.stringify(this.personalBests));
        } catch (error) {
            console.warn('Error guardando personal bests:', error);
        }
    }

    /**
     * Resetea el modo
     */
    reset() {
        this.active = false;
        this.currentLevel = 1;
        this.startTime = 0;
        this.totalTime = 0;
        this.levelTimes = [];
        this.deaths = 0;
        this.perfectRuns = 0;
    }

    /**
     * Finaliza el modo completamente
     * @returns {Object} Resultados finales
     */
    end() {
        this.active = false;

        const stats = this.getStats();
        const grade = this._calculateOverallGrade();

        return {
            ...stats,
            overallGrade: grade,
            message: this._getGradeMessage(grade)
        };
    }

    /**
     * Calcula grade general del run completo
     * @returns {string} Grade
     * @private
     */
    _calculateOverallGrade() {
        if (this.levelTimes.length === 0) return 'F';

        const avgTime = this.totalTime / this.levelTimes.length;
        const perfectRatio = this.perfectRuns / this.levelTimes.length;

        // Grade basado en tiempo promedio y perfect runs
        if (avgTime < 25000 && perfectRatio > 0.8) return 'S';
        if (avgTime < 30000 && perfectRatio > 0.6) return 'A';
        if (avgTime < 40000 && perfectRatio > 0.4) return 'B';
        if (avgTime < 50000) return 'C';
        return 'D';
    }

    /**
     * Obtiene mensaje según el grade
     * @param {string} grade - Grade obtenido
     * @returns {string} Mensaje
     * @private
     */
    _getGradeMessage(grade) {
        const messages = {
            'S': '¡INCREÍBLE! ¡Eres un maestro del tiempo!',
            'A': '¡Excelente! Muy rápido y preciso.',
            'B': '¡Bien hecho! Buen tiempo general.',
            'C': 'No está mal, pero puedes mejorar.',
            'D': 'Necesitas practicar más.',
            'F': 'Intenta de nuevo.'
        };

        return messages[grade] || messages['F'];
    }
}

export default TimeAttackMode;
