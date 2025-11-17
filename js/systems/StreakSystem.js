/**
 * Sistema de Rachas Diarias (Daily Streaks)
 * Hace el juego adictivo manteniendo a los jugadores regresando
 */

import Storage from '../utils/Storage.js';

export class StreakSystem {
    constructor() {
        this.currentStreak = 0;
        this.longestStreak = 0;
        this.lastPlayDate = null;
        this.streakRewards = [
            { day: 1, reward: 'Welcome back!', bonus: 100 },
            { day: 3, reward: 'On fire! 🔥', bonus: 300 },
            { day: 7, reward: 'Week warrior! 🏆', bonus: 1000 },
            { day: 14, reward: 'Two weeks strong! 💪', bonus: 2500 },
            { day: 30, reward: 'LEGENDARY! 👑', bonus: 10000 },
            { day: 50, reward: 'UNSTOPPABLE! ⚡', bonus: 25000 },
            { day: 100, reward: 'IMMORTAL! 💎', bonus: 100000 }
        ];
        this.loadStreak();
        this.checkStreak();
    }

    loadStreak() {
        const data = Storage.get('rallyx_streak', {
            currentStreak: 0,
            longestStreak: 0,
            lastPlayDate: null
        });

        this.currentStreak = data.currentStreak;
        this.longestStreak = data.longestStreak;
        this.lastPlayDate = data.lastPlayDate;
    }

    saveStreak() {
        Storage.set('rallyx_streak', {
            currentStreak: this.currentStreak,
            longestStreak: this.longestStreak,
            lastPlayDate: this.lastPlayDate
        });
    }

    checkStreak() {
        const today = this.getToday();

        if (!this.lastPlayDate) {
            // Primera vez jugando
            this.currentStreak = 1;
            this.lastPlayDate = today;
            this.saveStreak();
            return { isNew: true, bonus: this.getStreakBonus() };
        }

        const lastPlay = new Date(this.lastPlayDate);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate - lastPlay) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            // Ya jugó hoy
            return { continued: true, streak: this.currentStreak };
        } else if (diffDays === 1) {
            // Jugó ayer, continúa la racha
            this.currentStreak++;
            this.lastPlayDate = today;

            if (this.currentStreak > this.longestStreak) {
                this.longestStreak = this.currentStreak;
            }

            this.saveStreak();
            return {
                continued: true,
                streak: this.currentStreak,
                bonus: this.getStreakBonus(),
                isNewRecord: this.currentStreak === this.longestStreak
            };
        } else {
            // Perdió la racha
            const oldStreak = this.currentStreak;
            this.currentStreak = 1;
            this.lastPlayDate = today;
            this.saveStreak();
            return {
                broken: true,
                oldStreak,
                newStreak: 1
            };
        }
    }

    getToday() {
        const now = new Date();
        return now.toISOString().split('T')[0];
    }

    getStreakBonus() {
        const bonus = this.streakRewards.find(r => r.day === this.currentStreak);
        return bonus || null;
    }

    getNextMilestone() {
        return this.streakRewards.find(r => r.day > this.currentStreak);
    }

    getStreakMultiplier() {
        // Multiplica el score basado en la racha
        if (this.currentStreak >= 100) return 5.0;
        if (this.currentStreak >= 50) return 3.0;
        if (this.currentStreak >= 30) return 2.5;
        if (this.currentStreak >= 14) return 2.0;
        if (this.currentStreak >= 7) return 1.5;
        if (this.currentStreak >= 3) return 1.25;
        return 1.0;
    }

    getStats() {
        return {
            current: this.currentStreak,
            longest: this.longestStreak,
            multiplier: this.getStreakMultiplier(),
            nextMilestone: this.getNextMilestone(),
            lastPlay: this.lastPlayDate
        };
    }
}

export default StreakSystem;
