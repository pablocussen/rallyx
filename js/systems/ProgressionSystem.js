/**
 * Sistema de Progresión del Jugador
 * Niveles, XP, desbloqueos - da sentido de progreso permanente
 */

import Storage from '../utils/Storage.js';

export class ProgressionSystem {
    constructor() {
        this.level = 1;
        this.xp = 0;
        this.totalXp = 0;
        this.xpCurve = 100; // XP base para level 2
        this.curveMultiplier = 1.5; // Crece exponencialmente

        this.unlocks = {
            powerups: ['speed'], // Empieza con speed
            levels: [1, 2], // Niveles desbloqueados
            skins: ['default'],
            modes: ['classic'],
            achievements: []
        };

        this.levelRewards = {
            2: { powerup: 'shield', bonus: 500 },
            3: { level: 3, bonus: 1000 },
            5: { powerup: 'slowTime', bonus: 2000 },
            7: { level: 4, bonus: 3000 },
            10: { powerup: 'doublePoints', mode: 'timeAttack', bonus: 5000 },
            15: { powerup: 'magnet', level: 5, bonus: 10000 },
            20: { level: 6, skin: 'neon', bonus: 20000 },
            25: { mode: 'survival', bonus: 30000 },
            30: { skin: 'retro', bonus: 50000 },
            50: { skin: 'legendary', mode: 'chaos', bonus: 100000 }
        };

        this.loadProgression();
    }

    loadProgression() {
        const data = Storage.get('rallyx_progression', {
            level: 1,
            xp: 0,
            totalXp: 0,
            unlocks: {
                powerups: ['speed'],
                levels: [1, 2],
                skins: ['default'],
                modes: ['classic'],
                achievements: []
            }
        });

        this.level = data.level;
        this.xp = data.xp;
        this.totalXp = data.totalXp;
        this.unlocks = data.unlocks;
    }

    saveProgression() {
        Storage.set('rallyx_progression', {
            level: this.level,
            xp: this.xp,
            totalXp: this.totalXp,
            unlocks: this.unlocks
        });
    }

    addXP(amount) {
        this.xp += amount;
        this.totalXp += amount;

        const leveledUp = [];
        const rewards = [];

        // Check level ups
        while (this.xp >= this.getXPForNextLevel()) {
            this.xp -= this.getXPForNextLevel();
            this.level++;
            leveledUp.push(this.level);

            // Check rewards
            const reward = this.levelRewards[this.level];
            if (reward) {
                this.processReward(reward);
                rewards.push(reward);
            }
        }

        this.saveProgression();

        return {
            leveledUp: leveledUp.length > 0,
            newLevel: this.level,
            rewards,
            xpGained: amount
        };
    }

    processReward(reward) {
        if (reward.powerup && !this.unlocks.powerups.includes(reward.powerup)) {
            this.unlocks.powerups.push(reward.powerup);
        }
        if (reward.level && !this.unlocks.levels.includes(reward.level)) {
            this.unlocks.levels.push(reward.level);
        }
        if (reward.skin && !this.unlocks.skins.includes(reward.skin)) {
            this.unlocks.skins.push(reward.skin);
        }
        if (reward.mode && !this.unlocks.modes.includes(reward.mode)) {
            this.unlocks.modes.push(reward.mode);
        }
    }

    getXPForNextLevel() {
        // Curva exponencial: level 2 = 100, level 3 = 150, level 4 = 225, etc.
        return Math.floor(this.xpCurve * Math.pow(this.curveMultiplier, this.level - 1));
    }

    getXPPercentage() {
        return (this.xp / this.getXPForNextLevel()) * 100;
    }

    getNextReward() {
        const nextLevels = Object.keys(this.levelRewards)
            .map(Number)
            .filter(l => l > this.level)
            .sort((a, b) => a - b);

        if (nextLevels.length > 0) {
            return {
                level: nextLevels[0],
                reward: this.levelRewards[nextLevels[0]]
            };
        }
        return null;
    }

    isUnlocked(type, item) {
        return this.unlocks[type]?.includes(item) || false;
    }

    getAllUnlocks() {
        return {
            powerups: this.unlocks.powerups.length,
            levels: this.unlocks.levels.length,
            skins: this.unlocks.skins.length,
            modes: this.unlocks.modes.length,
            total: this.unlocks.powerups.length +
                   this.unlocks.levels.length +
                   this.unlocks.skins.length +
                   this.unlocks.modes.length
        };
    }

    getStats() {
        return {
            level: this.level,
            xp: this.xp,
            totalXp: this.totalXp,
            xpForNext: this.getXPForNextLevel(),
            percentage: this.getXPPercentage(),
            nextReward: this.getNextReward(),
            unlocks: this.getAllUnlocks()
        };
    }

    // Convertir score a XP (1 punto = 0.1 XP)
    scoreToXP(score) {
        return Math.floor(score * 0.1);
    }

    // Bonus XP por performance
    calculateSessionXP(stats) {
        let xp = this.scoreToXP(stats.score);

        // Bonus por combo alto
        if (stats.maxCombo >= 10) xp += 50;
        if (stats.maxCombo >= 20) xp += 100;

        // Bonus por nivel perfecto
        if (stats.perfectLevel) xp += 200;

        // Bonus por flags
        xp += stats.flagsCollected * 5;

        // Bonus por supervivencia
        xp += Math.floor(stats.survivalTime / 10);

        return xp;
    }
}

export default ProgressionSystem;
