/**
 * Sistema de Logros
 * Gestiona achievements y desbloqueos
 */

import { CONFIG } from '../config.js';
import Storage from '../utils/Storage.js';

export class AchievementSystem {
    constructor() {
        this.achievements = CONFIG.ACHIEVEMENTS.map(a => ({
            ...a,
            unlocked: false,
            progress: 0,
            unlockedAt: null
        }));

        this.loadAchievements();
        this.notifications = [];
    }

    loadAchievements() {
        const saved = Storage.get(CONFIG.STORAGE_KEYS.ACHIEVEMENTS, []);
        saved.forEach(savedAch => {
            const ach = this.achievements.find(a => a.id === savedAch.id);
            if (ach) {
                ach.unlocked = savedAch.unlocked;
                ach.progress = savedAch.progress;
                ach.unlockedAt = savedAch.unlockedAt;
            }
        });
    }

    saveAchievements() {
        Storage.set(CONFIG.STORAGE_KEYS.ACHIEVEMENTS, this.achievements);
    }

    unlock(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);

        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            achievement.unlockedAt = Date.now();
            this.saveAchievements();

            // Añadir notificación
            this.notifications.push({
                achievement,
                time: Date.now(),
                duration: 3000
            });

            return achievement;
        }

        return null;
    }

    checkAchievements(gameState) {
        const { score, stats, level, health, maxHealth } = gameState;

        // Primera Victoria
        if (level > 1 && !this.isUnlocked('first_win')) {
            this.unlock('first_win');
        }

        // Demonio de Velocidad
        if (stats.levelTime < 30 && !this.isUnlocked('speed_demon')) {
            this.unlock('speed_demon');
        }

        // Maestro del Combo
        if (stats.maxCombo >= 5 && !this.isUnlocked('combo_master')) {
            this.unlock('combo_master');
        }

        // Perfeccionista
        if (stats.levelComplete && health === maxHealth && !this.isUnlocked('perfectionist')) {
            this.unlock('perfectionist');
        }

        // Coleccionista
        if (stats.totalFlags >= 100 && !this.isUnlocked('collector')) {
            this.unlock('collector');
        }

        // Superviviente
        if (stats.enemiesDodged >= 50 && !this.isUnlocked('survivor')) {
            this.unlock('survivor');
        }

        // Campeón
        if (level > Object.keys(CONFIG.LEVELS).length && !this.isUnlocked('champion')) {
            this.unlock('champion');
        }

        // Alto Puntuador
        if (score >= 50000 && !this.isUnlocked('high_scorer')) {
            this.unlock('high_scorer');
        }
    }

    isUnlocked(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        return achievement ? achievement.unlocked : false;
    }

    getUnlockedCount() {
        return this.achievements.filter(a => a.unlocked).length;
    }

    getTotalCount() {
        return this.achievements.length;
    }

    getProgress() {
        return (this.getUnlockedCount() / this.getTotalCount()) * 100;
    }

    getNotifications() {
        const now = Date.now();
        this.notifications = this.notifications.filter(n => now - n.time < n.duration);
        return this.notifications;
    }

    getAllAchievements() {
        return this.achievements;
    }

    /**
     * Obtiene solo los logros desbloqueados
     * @returns {Array} Array de logros desbloqueados
     */
    getUnlockedAchievements() {
        return this.achievements.filter(a => a.unlocked);
    }

    /**
     * Obtiene solo los logros bloqueados
     * @returns {Array} Array de logros bloqueados
     */
    getLockedAchievements() {
        return this.achievements.filter(a => !a.unlocked);
    }

    /**
     * Obtiene detalles completos del progreso de logros
     * @returns {Object} {unlocked, total, percentage, unlockedList, lockedList}
     */
    getProgressDetails() {
        const unlocked = this.achievements.filter(a => a.unlocked);
        const total = this.achievements.length;
        return {
            unlocked: unlocked.length,
            total,
            percentage: Math.round((unlocked.length / total) * 100),
            unlockedList: unlocked,
            lockedList: this.achievements.filter(a => !a.unlocked)
        };
    }

    reset() {
        this.achievements.forEach(a => {
            a.unlocked = false;
            a.progress = 0;
            a.unlockedAt = null;
        });
        this.saveAchievements();
    }
}

export default AchievementSystem;
