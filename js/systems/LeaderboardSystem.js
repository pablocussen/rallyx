/**
 * Leaderboard System - Sistema de Rankings Competitivos
 * Rankings locales por modo de juego, stats, comparaciones
 *
 * Características:
 * - Leaderboards por modo (Classic, Time Attack, Survival, Chaos)
 * - Top 10 scores locales
 * - Stats de posición y mejora
 * - Comparación con récord personal
 * - Histórico de runs
 */

import Storage from '../utils/Storage.js';

export class LeaderboardSystem {
    constructor() {
        // Leaderboards por modo
        this.leaderboards = {
            classic: [],
            timeAttack: [],
            survival: [],
            chaos: [],
            overall: [] // Combinado de todos los modos
        };

        // Configuración
        this.maxEntries = 100; // Guardar top 100
        this.displayLimit = 10; // Mostrar top 10

        // Stats globales
        this.globalStats = {
            totalGames: 0,
            totalScore: 0,
            totalPlaytime: 0,
            bestRun: null,
            averageScore: 0
        };

        this.loadLeaderboards();
    }

    /**
     * Cargar leaderboards desde Storage
     */
    loadLeaderboards() {
        const data = Storage.get('rallyx_leaderboards', {
            classic: [],
            timeAttack: [],
            survival: [],
            chaos: [],
            overall: [],
            globalStats: this.globalStats
        });

        this.leaderboards = data;
        this.globalStats = data.globalStats || this.globalStats;
    }

    /**
     * Guardar leaderboards
     */
    saveLeaderboards() {
        const data = {
            ...this.leaderboards,
            globalStats: this.globalStats
        };

        Storage.set('rallyx_leaderboards', data);
    }

    /**
     * Registrar nuevo score
     */
    submitScore(mode, scoreData) {
        const entry = {
            score: scoreData.score,
            mode,
            timestamp: Date.now(),
            date: new Date().toISOString(),
            stats: {
                survivalTime: scoreData.survivalTime,
                flagsCollected: scoreData.flagsCollected,
                maxCombo: scoreData.maxCombo,
                powerupsUsed: scoreData.powerupsUsed,
                enemiesAvoided: scoreData.enemiesAvoided,
                level: scoreData.level || 1,
                perfectLevel: scoreData.perfectLevel || false
            },
            playerInfo: {
                playerLevel: scoreData.playerLevel || 1,
                skin: scoreData.skin || 'default'
            }
        };

        // Agregar a leaderboard del modo
        if (!this.leaderboards[mode]) {
            this.leaderboards[mode] = [];
        }

        this.leaderboards[mode].push(entry);

        // Ordenar por score descendente
        this.leaderboards[mode].sort((a, b) => b.score - a.score);

        // Limitar a maxEntries
        if (this.leaderboards[mode].length > this.maxEntries) {
            this.leaderboards[mode] = this.leaderboards[mode].slice(0, this.maxEntries);
        }

        // Agregar a leaderboard overall
        this.leaderboards.overall.push(entry);
        this.leaderboards.overall.sort((a, b) => b.score - a.score);
        if (this.leaderboards.overall.length > this.maxEntries) {
            this.leaderboards.overall = this.leaderboards.overall.slice(0, this.maxEntries);
        }

        // Actualizar stats globales
        this.globalStats.totalGames++;
        this.globalStats.totalScore += entry.score;
        this.globalStats.totalPlaytime += entry.stats.survivalTime;
        this.globalStats.averageScore = this.globalStats.totalScore / this.globalStats.totalGames;

        if (!this.globalStats.bestRun || entry.score > this.globalStats.bestRun.score) {
            this.globalStats.bestRun = entry;
        }

        // Calcular posición
        const position = this.leaderboards[mode].findIndex(e =>
            e.timestamp === entry.timestamp
        ) + 1;

        const isNewRecord = position === 1;
        const isTopTen = position <= 10;

        this.saveLeaderboards();

        return {
            entry,
            position,
            total: this.leaderboards[mode].length,
            isNewRecord,
            isTopTen,
            percentile: ((this.leaderboards[mode].length - position) / this.leaderboards[mode].length) * 100,
            improvement: this.calculateImprovement(mode, entry.score)
        };
    }

    /**
     * Calcular mejora respecto a runs anteriores
     */
    calculateImprovement(mode, newScore) {
        const previousScores = this.leaderboards[mode]
            .filter(e => e.score < newScore)
            .map(e => e.score);

        if (previousScores.length === 0) {
            return { improved: false, message: '¡Primer récord!' };
        }

        const previousBest = Math.max(...previousScores);
        const improvement = newScore - previousBest;
        const improvementPercent = (improvement / previousBest) * 100;

        return {
            improved: true,
            previousBest,
            improvement,
            improvementPercent: improvementPercent.toFixed(1),
            message: `¡+${improvement} puntos mejor que tu anterior récord!`
        };
    }

    /**
     * Obtener top N del leaderboard
     */
    getTopScores(mode = 'overall', limit = 10) {
        if (!this.leaderboards[mode]) {
            console.warn(`Modo ${mode} no existe en leaderboards`);
            return [];
        }

        return this.leaderboards[mode]
            .slice(0, limit)
            .map((entry, index) => ({
                rank: index + 1,
                ...entry,
                scoreFormatted: this.formatScore(entry.score),
                timeFormatted: this.formatTime(entry.stats.survivalTime),
                dateFormatted: this.formatDate(entry.timestamp)
            }));
    }

    /**
     * Obtener posición de un score específico
     */
    getScoreRank(mode, score) {
        if (!this.leaderboards[mode]) return null;

        const position = this.leaderboards[mode].findIndex(e => e.score < score) + 1;

        if (position === 0) {
            // Score más bajo que todos
            return this.leaderboards[mode].length + 1;
        }

        return position;
    }

    /**
     * Obtener récord personal en un modo
     */
    getPersonalBest(mode) {
        if (!this.leaderboards[mode] || this.leaderboards[mode].length === 0) {
            return null;
        }

        // El primero es el mejor (ya están ordenados)
        const best = this.leaderboards[mode][0];

        return {
            score: best.score,
            rank: 1,
            date: best.timestamp,
            stats: best.stats,
            scoreFormatted: this.formatScore(best.score),
            timeFormatted: this.formatTime(best.stats.survivalTime),
            dateFormatted: this.formatDate(best.timestamp)
        };
    }

    /**
     * Obtener stats de todos los modos
     */
    getAllModesStats() {
        const modes = ['classic', 'timeAttack', 'survival', 'chaos'];

        return modes.map(mode => {
            const leaderboard = this.leaderboards[mode] || [];
            const personalBest = leaderboard[0];

            return {
                mode,
                gamesPlayed: leaderboard.length,
                personalBest: personalBest ? personalBest.score : 0,
                averageScore: leaderboard.length > 0
                    ? leaderboard.reduce((sum, e) => sum + e.score, 0) / leaderboard.length
                    : 0,
                bestRun: personalBest || null
            };
        });
    }

    /**
     * Obtener runs recientes
     */
    getRecentRuns(limit = 5) {
        const allRuns = this.leaderboards.overall.slice();

        // Ordenar por timestamp descendente (más recientes primero)
        allRuns.sort((a, b) => b.timestamp - a.timestamp);

        return allRuns.slice(0, limit).map((entry, index) => ({
            ...entry,
            scoreFormatted: this.formatScore(entry.score),
            timeFormatted: this.formatTime(entry.stats.survivalTime),
            dateFormatted: this.formatDate(entry.timestamp),
            isRecent: index === 0
        }));
    }

    /**
     * Comparar con otro score
     */
    compareWithScore(mode, targetScore) {
        const currentBest = this.getPersonalBest(mode);

        if (!currentBest) {
            return {
                hasRecord: false,
                message: 'No tienes récord aún en este modo'
            };
        }

        const difference = targetScore - currentBest.score;
        const percentDiff = (difference / currentBest.score) * 100;

        if (difference > 0) {
            return {
                better: true,
                difference,
                percentDiff: percentDiff.toFixed(1),
                message: `¡${difference} puntos mejor que tu récord!`
            };
        } else if (difference < 0) {
            return {
                better: false,
                difference: Math.abs(difference),
                percentDiff: Math.abs(percentDiff).toFixed(1),
                message: `${Math.abs(difference)} puntos por debajo de tu récord`
            };
        } else {
            return {
                better: false,
                difference: 0,
                percentDiff: 0,
                message: '¡Empataste tu récord!'
            };
        }
    }

    /**
     * Obtener estadísticas de progreso
     */
    getProgressStats() {
        const recentRuns = this.getRecentRuns(10);

        if (recentRuns.length < 2) {
            return {
                trend: 'insufficient_data',
                message: 'Necesitas más partidas para ver tu progreso'
            };
        }

        // Calcular tendencia (últimos 5 vs anteriores 5)
        const recent5 = recentRuns.slice(0, 5);
        const previous5 = recentRuns.slice(5, 10);

        const recentAvg = recent5.reduce((sum, r) => sum + r.score, 0) / recent5.length;
        const previousAvg = previous5.length > 0
            ? previous5.reduce((sum, r) => sum + r.score, 0) / previous5.length
            : recentAvg;

        const improvement = recentAvg - previousAvg;
        const improvementPercent = previousAvg > 0 ? (improvement / previousAvg) * 100 : 0;

        let trend = 'stable';
        let message = 'Tu rendimiento se mantiene estable';

        if (improvementPercent > 10) {
            trend = 'improving';
            message = `¡Mejorando! +${improvementPercent.toFixed(0)}% en tus últimas partidas`;
        } else if (improvementPercent < -10) {
            trend = 'declining';
            message = `Rendimiento bajando. ${Math.abs(improvementPercent).toFixed(0)}% menos que antes`;
        }

        return {
            trend,
            message,
            recentAverage: Math.round(recentAvg),
            previousAverage: Math.round(previousAvg),
            improvement: Math.round(improvement),
            improvementPercent: improvementPercent.toFixed(1)
        };
    }

    /**
     * Limpiar leaderboard (admin/reset)
     */
    clearLeaderboard(mode = null) {
        if (mode) {
            this.leaderboards[mode] = [];
        } else {
            // Limpiar todos
            Object.keys(this.leaderboards).forEach(key => {
                this.leaderboards[key] = [];
            });
            this.globalStats = {
                totalGames: 0,
                totalScore: 0,
                totalPlaytime: 0,
                bestRun: null,
                averageScore: 0
            };
        }

        this.saveLeaderboards();
        console.log(`Leaderboard limpiado: ${mode || 'todos'}`);
    }

    /**
     * Formatear score para display
     */
    formatScore(score) {
        return score.toLocaleString();
    }

    /**
     * Formatear tiempo
     */
    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        if (minutes > 0) {
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
        return `${seconds}s`;
    }

    /**
     * Formatear fecha
     */
    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Justo ahora';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        if (diffHours < 24) return `Hace ${diffHours}h`;
        if (diffDays < 7) return `Hace ${diffDays}d`;

        return date.toLocaleDateString();
    }

    /**
     * Obtener stats globales
     */
    getGlobalStats() {
        return {
            ...this.globalStats,
            totalScoreFormatted: this.formatScore(this.globalStats.totalScore),
            averageScoreFormatted: this.formatScore(Math.round(this.globalStats.averageScore)),
            totalPlaytimeFormatted: this.formatTime(this.globalStats.totalPlaytime),
            bestRunFormatted: this.globalStats.bestRun
                ? {
                    ...this.globalStats.bestRun,
                    scoreFormatted: this.formatScore(this.globalStats.bestRun.score)
                }
                : null
        };
    }

    /**
     * Exportar leaderboards como JSON (para compartir/backup)
     */
    exportData() {
        return {
            leaderboards: this.leaderboards,
            globalStats: this.globalStats,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    }

    /**
     * Importar leaderboards desde JSON
     */
    importData(data) {
        if (!data.leaderboards || !data.version) {
            console.error('Datos de importación inválidos');
            return false;
        }

        this.leaderboards = data.leaderboards;
        this.globalStats = data.globalStats || this.globalStats;
        this.saveLeaderboards();

        console.log('Leaderboards importados exitosamente');
        return true;
    }
}

export default LeaderboardSystem;
