/**
 * Sistema de Misiones Diarias
 * Objetivos que cambian cada día para mantener el juego fresco
 */

import Storage from '../utils/Storage.js';

export class MissionSystem {
    constructor() {
        this.dailyMissions = [];
        this.completedMissions = [];
        this.missionTemplates = [
            // Misiones de Score
            { id: 'score_5k', type: 'score', target: 5000, reward: 500, title: 'Score Master', desc: 'Alcanza 5,000 puntos' },
            { id: 'score_10k', type: 'score', target: 10000, reward: 1000, title: 'Score Legend', desc: 'Alcanza 10,000 puntos' },
            { id: 'score_25k', type: 'score', target: 25000, reward: 2500, title: 'Score God', desc: 'Alcanza 25,000 puntos' },

            // Misiones de Combos
            { id: 'combo_5', type: 'combo', target: 5, reward: 300, title: 'Combo Starter', desc: 'Consigue combo x5' },
            { id: 'combo_10', type: 'combo', target: 10, reward: 800, title: 'Combo Master', desc: 'Consigue combo x10' },
            { id: 'combo_20', type: 'combo', target: 20, reward: 2000, title: 'Combo Legend', desc: 'Consigue combo x20' },

            // Misiones de Flags
            { id: 'flags_10', type: 'flags', target: 10, reward: 200, title: 'Flag Collector', desc: 'Recoge 10 banderas' },
            { id: 'flags_25', type: 'flags', target: 25, reward: 600, title: 'Flag Hunter', desc: 'Recoge 25 banderas' },
            { id: 'flags_50', type: 'flags', target: 50, reward: 1500, title: 'Flag Master', desc: 'Recoge 50 banderas' },

            // Misiones de Supervivencia
            { id: 'survive_3min', type: 'survival', target: 180, reward: 400, title: 'Survivor', desc: 'Sobrevive 3 minutos' },
            { id: 'survive_5min', type: 'survival', target: 300, reward: 800, title: 'Endurance', desc: 'Sobrevive 5 minutos' },

            // Misiones sin daño
            { id: 'perfect_level', type: 'perfect', target: 1, reward: 1000, title: 'Flawless', desc: 'Completa un nivel sin daño' },
            { id: 'perfect_3', type: 'perfect', target: 3, reward: 3000, title: 'Untouchable', desc: 'Completa 3 niveles perfectos' },

            // Misiones de Power-ups
            { id: 'powerup_5', type: 'powerups', target: 5, reward: 300, title: 'Power User', desc: 'Usa 5 power-ups' },
            { id: 'powerup_10', type: 'powerups', target: 10, reward: 700, title: 'Power Master', desc: 'Usa 10 power-ups' },

            // Misiones de Enemies
            { id: 'dodge_20', type: 'dodges', target: 20, reward: 400, title: 'Dodger', desc: 'Esquiva 20 enemigos' },
            { id: 'dodge_50', type: 'dodges', target: 50, reward: 1000, title: 'Matrix', desc: 'Esquiva 50 enemigos' }
        ];

        this.loadMissions();
        this.generateDailyMissions();
    }

    loadMissions() {
        const data = Storage.get('rallyx_missions', {
            date: null,
            missions: [],
            completed: []
        });

        const today = this.getToday();
        if (data.date === today) {
            this.dailyMissions = data.missions;
            this.completedMissions = data.completed;
        }
    }

    saveMissions() {
        Storage.set('rallyx_missions', {
            date: this.getToday(),
            missions: this.dailyMissions,
            completed: this.completedMissions
        });
    }

    getToday() {
        const now = new Date();
        return now.toISOString().split('T')[0];
    }

    generateDailyMissions() {
        if (this.dailyMissions.length > 0) {
            return; // Ya tiene misiones del día
        }

        // Generar 5 misiones aleatorias balanceadas
        const selected = [];
        const types = ['score', 'combo', 'flags', 'survival', 'perfect', 'powerups', 'dodges'];

        // Una misión de cada tipo
        types.forEach(type => {
            const options = this.missionTemplates.filter(m =>
                m.type === type && !selected.includes(m.id)
            );
            if (options.length > 0) {
                const random = options[Math.floor(Math.random() * options.length)];
                selected.push(random.id);
            }
        });

        // Seleccionar 5 aleatorias
        const shuffled = selected.sort(() => Math.random() - 0.5).slice(0, 5);

        this.dailyMissions = shuffled.map(id => {
            const template = this.missionTemplates.find(m => m.id === id);
            return {
                ...template,
                progress: 0,
                completed: false
            };
        });

        this.saveMissions();
    }

    updateProgress(type, value) {
        let completedNew = false;

        this.dailyMissions.forEach(mission => {
            if (mission.completed || mission.type !== type) {
                return;
            }

            if (type === 'score' || type === 'survival') {
                mission.progress = Math.max(mission.progress, value);
            } else {
                mission.progress += value;
            }

            if (mission.progress >= mission.target && !mission.completed) {
                mission.completed = true;
                this.completedMissions.push(mission.id);
                completedNew = true;
            }
        });

        if (completedNew) {
            this.saveMissions();
        }

        return completedNew;
    }

    checkCompletion(type, value) {
        const completed = this.updateProgress(type, value);
        if (completed) {
            return this.dailyMissions.filter(m =>
                m.type === type && m.completed && !this.completedMissions.includes(m.id)
            );
        }
        return [];
    }

    getMissions() {
        return this.dailyMissions.map(m => ({
            ...m,
            percentage: Math.min(100, (m.progress / m.target) * 100)
        }));
    }

    getCompletedCount() {
        return this.dailyMissions.filter(m => m.completed).length;
    }

    getTotalRewards() {
        return this.dailyMissions
            .filter(m => m.completed)
            .reduce((sum, m) => sum + m.reward, 0);
    }

    getAllCompleted() {
        return this.getCompletedCount() === this.dailyMissions.length;
    }

    reset() {
        this.dailyMissions = [];
        this.completedMissions = [];
        this.generateDailyMissions();
    }
}

export default MissionSystem;
