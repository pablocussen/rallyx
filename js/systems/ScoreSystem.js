/**
 * Sistema de Puntuación y Combos
 * Gestiona puntos, multiplicadores y estadísticas
 */

import { CONFIG } from '../config.js';
import Storage from '../utils/Storage.js';

export class ScoreSystem {
    constructor() {
        this.score = 0;
        this.highScore = Storage.get(CONFIG.STORAGE_KEYS.HIGH_SCORE, 0);
        this.combo = 0;
        this.comboTimer = 0;
        this.comboTimeWindow = CONFIG.FLAG.COMBO_TIME_WINDOW;
        this.multiplier = 1;
        this.stats = {
            flagsCollected: 0,
            enemiesDodged: 0,
            powerupsUsed: 0,
            perfectLevels: 0,
            totalPlayTime: 0
        };
    }

    addScore(points, type = 'default') {
        const finalPoints = Math.floor(points * this.multiplier);
        this.score += finalPoints;

        if (this.score > this.highScore) {
            this.highScore = this.score;
            Storage.set(CONFIG.STORAGE_KEYS.HIGH_SCORE, this.highScore);
        }

        return { points: finalPoints, multiplier: this.multiplier, combo: this.combo };
    }

    flagCollected() {
        this.combo++;
        this.comboTimer = this.comboTimeWindow;
        this.stats.flagsCollected++;

        // Calcular multiplicador de combo
        const comboIndex = Math.min(this.combo - 1, CONFIG.SCORE.COMBO_MULTIPLIERS.length - 1);
        this.multiplier = CONFIG.SCORE.COMBO_MULTIPLIERS[comboIndex];

        return this.addScore(CONFIG.SCORE.FLAG_BASE, 'flag');
    }

    enemyDodged() {
        this.stats.enemiesDodged++;
        return this.addScore(CONFIG.SCORE.ENEMY_DODGE, 'dodge');
    }

    powerupCollected() {
        this.stats.powerupsUsed++;
        return this.addScore(50, 'powerup');
    }

    levelComplete(timeRemaining, perfect = false) {
        let bonus = timeRemaining * CONFIG.SCORE.TIME_BONUS_PER_SECOND;

        if (perfect) {
            bonus += CONFIG.SCORE.PERFECT_LEVEL;
            this.stats.perfectLevels++;
        }

        return this.addScore(bonus, 'level_complete');
    }

    update(deltaTime) {
        if (this.combo > 0) {
            this.comboTimer -= deltaTime * 1000;

            if (this.comboTimer <= 0) {
                this.resetCombo();
            }
        }
    }

    resetCombo() {
        this.combo = 0;
        this.multiplier = 1;
        this.comboTimer = 0;
    }

    setMultiplier(value, duration = 0) {
        this.multiplier = value;

        if (duration > 0) {
            setTimeout(() => {
                this.multiplier = 1;
            }, duration);
        }
    }

    reset() {
        this.score = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.multiplier = 1;
    }

    getComboPercentage() {
        return this.comboTimer / this.comboTimeWindow;
    }

    getStats() {
        return {
            score: this.score,
            highScore: this.highScore,
            combo: this.combo,
            multiplier: this.multiplier,
            ...this.stats
        };
    }

    saveStats() {
        Storage.set(CONFIG.STORAGE_KEYS.STATS, this.stats);
    }

    loadStats() {
        const saved = Storage.get(CONFIG.STORAGE_KEYS.STATS);
        if (saved) {
            this.stats = { ...this.stats, ...saved };
        }
    }
}

export default ScoreSystem;
