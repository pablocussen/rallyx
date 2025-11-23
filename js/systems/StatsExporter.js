/**
 * Sistema de Exportación de Estadísticas
 * Permite a los jugadores exportar y compartir sus estadísticas
 *
 * @class StatsExporter
 * @description Exporta estadísticas del juego en múltiples formatos:
 * - JSON para backup
 * - CSV para análisis
 * - Texto formateado para compartir
 * - Imagen con resumen visual (futuro)
 */

export class StatsExporter {
    constructor() {
        this.version = '1.0.0';
    }

    /**
     * Recopila todas las estadísticas del juego
     * @param {Object} game - Instancia del juego
     * @returns {Object} Estadísticas completas
     */
    collectStats(game) {
        const stats = {
            version: this.version,
            exportDate: new Date().toISOString(),
            player: {
                level: game.progressionSystem?.level || 1,
                totalXP: game.progressionSystem?.totalXp || 0,
                currentStreak: game.streakSystem?.currentStreak || 0,
                longestStreak: game.streakSystem?.longestStreak || 0
            },
            score: {
                currentScore: game.score?.score || 0,
                highScore: game.score?.highScore || 0,
                totalScore: game.score?.stats?.totalScore || 0
            },
            gameplay: {
                flagsCollected: game.score?.stats?.flagsCollected || 0,
                enemiesDodged: game.score?.stats?.enemiesDodged || 0,
                powerupsUsed: game.score?.stats?.powerupsUsed || 0,
                perfectLevels: game.score?.stats?.perfectLevels || 0,
                totalPlayTime: this._formatTime(game.score?.stats?.totalPlayTime || 0)
            },
            combos: {
                maxCombo: game.comboSystem?.maxCombo || 0,
                longestCombo: game.comboSystem?.stats?.longestCombo || 0,
                totalCombos: game.comboSystem?.stats?.totalCombos || 0,
                feverModeActivations: game.comboSystem?.stats?.feverModeActivations || 0
            },
            achievements: {
                unlocked: game.achievements?.getUnlockedCount() || 0,
                total: game.achievements?.getTotalCount() || 0,
                percentage: game.achievements?.getProgress() || 0,
                list: game.achievements?.getUnlockedAchievements()?.map(a => ({
                    id: a.id,
                    name: a.name,
                    unlockedAt: a.unlockedAt ? new Date(a.unlockedAt).toISOString() : null
                })) || []
            },
            missions: {
                completedToday: game.missionSystem?.getCompletedCount() || 0,
                totalCompleted: game.missionSystem?.missionsCompleted || 0,
                todayProgress: game.missionSystem?.getDailyProgress() || { completed: 0, total: 0 }
            },
            leaderboard: {
                personalBests: this._getPersonalBests(game.leaderboardSystem)
            }
        };

        return stats;
    }

    /**
     * Obtiene los records personales del leaderboard
     * @param {Object} leaderboardSystem - Sistema de leaderboard
     * @returns {Object} Records por modo
     * @private
     */
    _getPersonalBests(leaderboardSystem) {
        if (!leaderboardSystem) return {};

        const modes = ['classic', 'timeAttack', 'endless', 'survival', 'overall'];
        const bests = {};

        modes.forEach(mode => {
            const best = leaderboardSystem.getPersonalBest(mode);
            if (best) {
                bests[mode] = {
                    score: best.score,
                    date: new Date(best.date).toISOString()
                };
            }
        });

        return bests;
    }

    /**
     * Formatea tiempo en segundos a string legible
     * @param {number} seconds - Segundos
     * @returns {string} Tiempo formateado
     * @private
     */
    _formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }

    /**
     * Exporta estadísticas como JSON
     * @param {Object} game - Instancia del juego
     * @returns {string} JSON string
     */
    exportJSON(game) {
        const stats = this.collectStats(game);
        return JSON.stringify(stats, null, 2);
    }

    /**
     * Exporta estadísticas como CSV
     * @param {Object} game - Instancia del juego
     * @returns {string} CSV string
     */
    exportCSV(game) {
        const stats = this.collectStats(game);
        let csv = 'Category,Metric,Value\n';

        // Player stats
        csv += `Player,Level,${stats.player.level}\n`;
        csv += `Player,Total XP,${stats.player.totalXP}\n`;
        csv += `Player,Current Streak,${stats.player.currentStreak}\n`;
        csv += `Player,Longest Streak,${stats.player.longestStreak}\n`;

        // Score stats
        csv += `Score,Current Score,${stats.score.currentScore}\n`;
        csv += `Score,High Score,${stats.score.highScore}\n`;

        // Gameplay stats
        csv += `Gameplay,Flags Collected,${stats.gameplay.flagsCollected}\n`;
        csv += `Gameplay,Enemies Dodged,${stats.gameplay.enemiesDodged}\n`;
        csv += `Gameplay,Powerups Used,${stats.gameplay.powerupsUsed}\n`;
        csv += `Gameplay,Perfect Levels,${stats.gameplay.perfectLevels}\n`;
        csv += `Gameplay,Total Play Time,${stats.gameplay.totalPlayTime}\n`;

        // Combos
        csv += `Combos,Max Combo,${stats.combos.maxCombo}\n`;
        csv += `Combos,Total Combos,${stats.combos.totalCombos}\n`;
        csv += `Combos,Fever Mode Activations,${stats.combos.feverModeActivations}\n`;

        // Achievements
        csv += `Achievements,Unlocked,${stats.achievements.unlocked}\n`;
        csv += `Achievements,Total,${stats.achievements.total}\n`;
        csv += `Achievements,Percentage,${stats.achievements.percentage}%\n`;

        return csv;
    }

    /**
     * Exporta estadísticas como texto formateado
     * @param {Object} game - Instancia del juego
     * @returns {string} Texto formateado
     */
    exportText(game) {
        const stats = this.collectStats(game);
        let text = '🏁 RALLY X - ESTADÍSTICAS DEL JUGADOR 🏁\n';
        text += '═'.repeat(50) + '\n\n';

        text += '👤 PROGRESO DEL JUGADOR\n';
        text += `   Nivel: ${stats.player.level}\n`;
        text += `   XP Total: ${stats.player.totalXP.toLocaleString()}\n`;
        text += `   Racha Actual: ${stats.player.currentStreak}\n`;
        text += `   Racha Más Larga: ${stats.player.longestStreak}\n\n`;

        text += '🎯 PUNTUACIÓN\n';
        text += `   Puntuación Actual: ${stats.score.currentScore.toLocaleString()}\n`;
        text += `   Récord Personal: ${stats.score.highScore.toLocaleString()}\n\n`;

        text += '🎮 GAMEPLAY\n';
        text += `   Banderas Recolectadas: ${stats.gameplay.flagsCollected}\n`;
        text += `   Enemigos Esquivados: ${stats.gameplay.enemiesDodged}\n`;
        text += `   Power-ups Usados: ${stats.gameplay.powerupsUsed}\n`;
        text += `   Niveles Perfectos: ${stats.gameplay.perfectLevels}\n`;
        text += `   Tiempo Total Jugado: ${stats.gameplay.totalPlayTime}\n\n`;

        text += '🔥 COMBOS\n`;
        text += `   Combo Máximo: x${stats.combos.maxCombo}\n`;
        text += `   Total de Combos: ${stats.combos.totalCombos}\n`;
        text += `   Activaciones Fever Mode: ${stats.combos.feverModeActivations}\n\n`;

        text += '🏆 LOGROS\n';
        text += `   Desbloqueados: ${stats.achievements.unlocked}/${stats.achievements.total} (${stats.achievements.percentage}%)\n`;
        if (stats.achievements.list.length > 0) {
            text += '   Últimos desbloqueados:\n';
            stats.achievements.list.slice(-5).forEach(a => {
                text += `   • ${a.name}\n`;
            });
        }
        text += '\n';

        text += '📊 MISIONES\n';
        text += `   Completadas Hoy: ${stats.missions.completedToday}/${stats.missions.todayProgress.total}\n`;
        text += `   Total Completadas: ${stats.missions.totalCompleted}\n\n`;

        text += '═'.repeat(50) + '\n';
        text += `Exportado: ${new Date().toLocaleString()}\n`;
        text += '🎮 ¡Sigue jugando para mejorar tus estadísticas! 🎮\n';

        return text;
    }

    /**
     * Descarga las estadísticas como archivo
     * @param {Object} game - Instancia del juego
     * @param {string} format - Formato (json, csv, txt)
     */
    downloadStats(game, format = 'json') {
        let content, filename, mimeType;

        switch (format) {
            case 'json':
                content = this.exportJSON(game);
                filename = `rallyx-stats-${Date.now()}.json`;
                mimeType = 'application/json';
                break;
            case 'csv':
                content = this.exportCSV(game);
                filename = `rallyx-stats-${Date.now()}.csv`;
                mimeType = 'text/csv';
                break;
            case 'txt':
                content = this.exportText(game);
                filename = `rallyx-stats-${Date.now()}.txt`;
                mimeType = 'text/plain';
                break;
            default:
                console.error('Formato no soportado:', format);
                return;
        }

        // Crear y descargar archivo
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log(`✅ Estadísticas exportadas: ${filename}`);
    }

    /**
     * Copia las estadísticas al portapapeles
     * @param {Object} game - Instancia del juego
     * @param {string} format - Formato (json, csv, txt)
     * @returns {Promise<boolean>} Éxito de la operación
     */
    async copyToClipboard(game, format = 'txt') {
        let content;

        switch (format) {
            case 'json':
                content = this.exportJSON(game);
                break;
            case 'csv':
                content = this.exportCSV(game);
                break;
            case 'txt':
                content = this.exportText(game);
                break;
            default:
                console.error('Formato no soportado:', format);
                return false;
        }

        try {
            await navigator.clipboard.writeText(content);
            console.log('✅ Estadísticas copiadas al portapapeles');
            return true;
        } catch (error) {
            console.error('Error al copiar al portapapeles:', error);
            return false;
        }
    }
}

export default StatsExporter;
