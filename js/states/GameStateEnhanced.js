/**
 * Estado Principal del Juego - REVOLUCIONARIO
 * Integra TODOS los nuevos sistemas para experiencia 10/10
 */

import { CONFIG } from '../config.js';
import { Collision } from '../utils/Collision.js';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import Flag from '../entities/Flag.js';
import PowerUp from '../entities/PowerUp.js';

// Nuevos sistemas revolucionarios
import StreakSystem from '../systems/StreakSystem.js';
import MissionSystem from '../systems/MissionSystem.js';
import ProgressionSystem from '../systems/ProgressionSystem.js';
import AIManager from '../systems/AIManager.js';
import GameModeManager from '../systems/GameModeManager.js';
import ComboSystem from '../systems/ComboSystem.js';
import MusicEngine from '../systems/MusicEngine.js';
import SkinManager from '../systems/SkinManager.js';
import ScreenEffects from '../systems/ScreenEffects.js';
import TutorialSystem from '../systems/TutorialSystem.js';
import LeaderboardSystem from '../systems/LeaderboardSystem.js';
import VisualEffectsManager from '../visual/VisualEffectsManager.js';

export class GameStateEnhanced {
    constructor(game) {
        this.game = game;
        this.player = null;
        this.enemies = [];
        this.flags = [];
        this.powerups = [];
        this.level = 1;
        this.timeRemaining = 0;
        this.paused = false;
        this.gameStartTime = 0;
        this.levelStartTime = 0;
        this.perfectLevel = true;

        // Inicializar TODOS los nuevos sistemas
        this.streakSystem = new StreakSystem();
        this.missionSystem = new MissionSystem();
        this.progressionSystem = new ProgressionSystem();
        this.aiManager = new AIManager();
        this.gameModeManager = new GameModeManager();
        this.comboSystem = new ComboSystem();
        this.musicEngine = new MusicEngine();
        this.skinManager = new SkinManager();
        this.screenEffects = new ScreenEffects(game.canvas, game.ctx);
        this.tutorialSystem = new TutorialSystem();
        this.leaderboardSystem = new LeaderboardSystem();
        this.visualFX = new VisualEffectsManager(game.canvas, game.ctx);

        // Estado del juego
        this.gameMode = 'classic';
        this.frozen = false; // Para freeze frames
        this.nearMissDistance = 50;
        this.nearMissCount = 0;
        this.previousFeverMode = false; // Para detectar cambios en FEVER MODE

        // UI notifications
        this.notifications = [];

        console.log('🚀 GameStateEnhanced inicializado con TODOS los sistemas revolucionarios + Visual FX IMPRESIONANTE');
    }

    enter(data = {}) {
        console.log('🎮 Iniciando juego revolucionario, nivel:', data.level || 1);

        this.level = data.level || 1;
        this.gameMode = data.mode || 'classic';

        // Verificar racha diaria
        const streakResult = this.streakSystem.checkStreak();
        if (streakResult.newStreak) {
            this.addNotification(`🔥 Racha: ${streakResult.currentStreak} días!`, 'success');
        }

        // Generar misiones diarias
        this.missionSystem.generateDailyMissions();

        // Iniciar modo de juego
        const playerLevel = this.progressionSystem.level;
        if (!this.gameModeManager.startMode(this.gameMode, playerLevel)) {
            console.error('No se pudo iniciar el modo de juego');
            this.gameMode = 'classic';
            this.gameModeManager.startMode('classic', playerLevel);
        }

        // Iniciar música
        this.musicEngine.init();
        this.musicEngine.start(this.gameMode);

        // Verificar tutorial
        if (this.tutorialSystem.shouldShow() && this.gameMode === 'classic') {
            this.tutorialSystem.start();
            this.addNotification('Tutorial iniciado', 'info');
        }

        // Registrar inicio de sesión en AI
        this.aiManager.loadProfile();

        this.setupLevel();
    }

    setupLevel() {
        const levelConfig = CONFIG.LEVELS[this.level];

        if (!levelConfig && this.gameMode === 'classic') {
            // Victoria total
            this.handleGameEnd(true);
            return;
        }

        // Crear jugador con skin actual
        this.player = new Player(100, 100);
        const currentSkin = this.skinManager.getCurrentSkin();
        this.player.skin = currentSkin;

        // Obtener dificultad del AI
        const aiDifficulty = this.aiManager.gameState.currentDifficulty;

        // Generar banderas (ajustado por dificultad)
        const flagCount = levelConfig ? Math.floor(levelConfig.flags * aiDifficulty) : 5;
        this.flags = [];
        for (let i = 0; i < flagCount; i++) {
            const pos = this.findEmptyPosition(80);
            this.flags.push(new Flag(pos.x, pos.y, 'normal'));
        }

        // Generar enemigos (ajustado por dificultad y modo)
        const modeModifiers = this.gameModeManager.getCurrentSettings();
        const enemyCount = levelConfig
            ? Math.floor(levelConfig.enemies * aiDifficulty * (modeModifiers.enemyCountMultiplier || 1))
            : 3;

        this.enemies = [];
        for (let i = 0; i < enemyCount; i++) {
            const pos = this.findEmptyPosition(100, 200); // Min 200px del jugador
            const enemy = new Enemy(pos.x, pos.y, i % 4);

            // Aplicar modificadores de velocidad del AI
            const speedMod = this.aiManager.difficultySettings.enemySpeedMultiplier;
            enemy.speed *= speedMod;

            this.enemies.push(enemy);
        }

        // Generar power-ups
        const powerupCount = levelConfig ? levelConfig.powerups : 2;
        this.powerups = [];
        const powerupTypes = Object.keys(CONFIG.POWERUP.TYPES).map(k => k.toLowerCase());

        for (let i = 0; i < powerupCount; i++) {
            if (Math.random() > (modeModifiers.powerupSpawnRate || 1)) continue;

            const pos = this.findEmptyPosition(80);
            const type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
            this.powerups.push(new PowerUp(pos.x, pos.y, type));
        }

        // Tiempo
        if (levelConfig) {
            this.timeRemaining = levelConfig.timeLimit;
        } else {
            // Modos sin nivel tienen tiempo del modo
            this.timeRemaining = modeModifiers.hasTimeLimit ? modeModifiers.timeLimit / 1000 : 999;
        }

        this.levelStartTime = Date.now();
        this.gameStartTime = this.gameStartTime || Date.now();
        this.perfectLevel = true;
        this.nearMissCount = 0;

        // Reset combo
        this.comboSystem.resetStats();

        // EFECTOS VISUALES de inicio de nivel
        this.visualFX.levelStart(this.level);

        console.log(`🎮 Nivel ${this.level} - Modo: ${this.gameMode}`);
        console.log(`Banderas: ${this.flags.length}, Enemigos: ${this.enemies.length}`);
    }

    findEmptyPosition(minDistance, minPlayerDistance = 0) {
        let x, y;
        let attempts = 0;
        const maxAttempts = 100;

        do {
            x = Math.random() * (CONFIG.CANVAS.WIDTH - 100) + 50;
            y = Math.random() * (CONFIG.CANVAS.HEIGHT - 100) + 50;
            attempts++;

            if (attempts >= maxAttempts) break;

            const occupied = this.isPositionOccupied(x, y, minDistance);
            const tooCloseToPlayer = this.player &&
                Collision.distance(x, y, this.player.x, this.player.y) < minPlayerDistance;

            if (!occupied && !tooCloseToPlayer) break;

        } while (attempts < maxAttempts);

        return { x, y };
    }

    isPositionOccupied(x, y, minDistance) {
        const checkCollision = (entities) => {
            return entities.some(entity =>
                Collision.distance(x, y, entity.x, entity.y) < minDistance
            );
        };

        return checkCollision(this.flags) ||
               checkCollision(this.enemies) ||
               checkCollision(this.powerups);
    }

    update(deltaTime) {
        if (this.paused) return;

        // Actualizar screen effects
        this.screenEffects.update(deltaTime);

        // Actualizar Visual Effects Manager
        this.visualFX.update(deltaTime, {
            playerSpeed: this.player ? this.player.speed : 0,
            feverMode: this.comboSystem.feverMode
        });

        // Verificar freeze frame
        if (this.screenEffects.isFrozen()) {
            // Durante freeze, solo actualizar efectos y música
            this.updateMusicAndEffects(deltaTime);
            return;
        }

        // Actualizar modo de juego
        const modeUpdate = this.gameModeManager.update(deltaTime, this.getGameContext());
        if (modeUpdate.gameEnded) {
            this.handleGameEnd(modeUpdate.reason !== 'timeUp');
            return;
        }

        if (modeUpdate.respawnPlayer) {
            this.respawnPlayer();
        }

        // Actualizar tiempo
        this.timeRemaining -= deltaTime / 1000;

        if (this.timeRemaining <= 0 && this.gameModeManager.getCurrentSettings().hasTimeLimit) {
            this.handleGameEnd(false);
            return;
        }

        // Actualizar jugador
        this.player.update(deltaTime, this.game.input, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);

        // Actualizar banderas
        this.flags.forEach(flag => flag.update(deltaTime));

        // Actualizar enemigos (con modificadores del modo y AI)
        const modifiers = this.gameModeManager.getActiveModifiers();
        this.enemies.forEach(enemy => {
            enemy.speed = CONFIG.ENEMY.BASE_SPEED * modifiers.speedMultiplier || 1;
            enemy.update(deltaTime, this.player, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);
        });

        // Actualizar power-ups
        this.powerups.forEach(powerup => powerup.update(deltaTime));

        // Actualizar sistemas base
        this.game.score.update(deltaTime);
        this.comboSystem.update(Date.now());

        // Actualizar AI
        this.aiManager.update(this.getGameStatsForAI(), deltaTime);

        // Colisiones con banderas
        this.handleFlagCollisions();

        // Colisiones con power-ups
        this.handlePowerupCollisions();

        // Colisiones con enemigos y near misses
        this.handleEnemyCollisions();

        // Verificar victoria del nivel
        if (this.flags.length === 0 && this.gameModeManager.getCurrentSettings().hasLevels) {
            this.levelComplete();
        }

        // Actualizar partículas
        this.game.particles.update(deltaTime);

        // Trail del jugador (mejorado con skin effects)
        const skinEffects = this.skinManager.getCurrentEffects();
        if (Math.random() < 0.3) {
            const colors = this.skinManager.getCurrentColors();
            this.game.particles.trail(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height / 2,
                colors.primary
            );
        }

        // Actualizar tutorial
        if (this.tutorialSystem.active) {
            const tutorialUpdate = this.tutorialSystem.update(this.getTutorialStats());
            if (tutorialUpdate && tutorialUpdate.stepCompleted) {
                this.addNotification(`✅ ${tutorialUpdate.step.title}`, 'success');
            }
            if (tutorialUpdate && tutorialUpdate.tutorialCompleted) {
                this.addNotification('🎉 Tutorial completado!', 'success');
                if (tutorialUpdate.rewards) {
                    this.progressionSystem.addXP(tutorialUpdate.rewards.xp);
                }
            }
        }

        // Actualizar música y efectos visuales
        this.updateMusicAndEffects(deltaTime);

        // Verificar logros
        this.checkAchievements();

        // Verificar desbloqueos de skins
        this.checkSkinUnlocks();

        // Detectar cambios en FEVER MODE
        const currentFeverMode = this.comboSystem.feverMode;
        if (currentFeverMode && !this.previousFeverMode) {
            // FEVER MODE INICIADO - ¡EFECTOS ÉPICOS!
            this.visualFX.feverModeStart(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height / 2
            );
        } else if (!currentFeverMode && this.previousFeverMode) {
            // FEVER MODE TERMINADO
            this.visualFX.feverModeEnd();
        }
        this.previousFeverMode = currentFeverMode;

        // Actualizar notificaciones
        this.updateNotifications(deltaTime);
    }

    handleFlagCollisions() {
        for (let i = this.flags.length - 1; i >= 0; i--) {
            const flag = this.flags[i];

            if (Collision.rectRect(this.player.getBounds(), flag.getBounds())) {
                // Registrar en combo system
                const comboResult = this.comboSystem.registerAction('flagCollected');

                // Score system (con multiplier del combo)
                const scoreData = this.game.score.flagCollected();
                const finalPoints = Math.floor(scoreData.points * comboResult.multiplier);

                // Actualizar misiones
                this.missionSystem.updateProgress('flags', 1);

                this.flags.splice(i, 1);

                // Efectos visuales IMPRESIONANTES
                const flagX = flag.x + flag.width / 2;
                const flagY = flag.y + flag.height / 2;

                // Visual FX Manager (nuevos efectos espectaculares)
                this.visualFX.flagCollected(flagX, flagY, finalPoints);

                // Mantener compatibilidad con efectos originales
                const colors = this.skinManager.getCurrentColors();
                this.game.particles.collect(flagX, flagY, colors.primary);

                // Screen effects
                this.screenEffects.flagCollected();

                // Audio
                this.game.audio.playSound('flag_collect');

                // Notificación de combo y EFECTOS ESPECTACULARES
                if (comboResult.milestone) {
                    // Visual FX Manager (explosión espectacular de combo)
                    this.visualFX.comboMilestone(flagX, flagY, comboResult.combo, comboResult.milestone);

                    this.addNotification(`${comboResult.milestone.name}`, 'combo');
                    this.screenEffects.comboMilestone(comboResult.combo);
                    this.musicEngine.triggerEvent('milestone');
                }

                // Feedback visual de puntos
                this.addNotification(`+${finalPoints}`, 'points');
            }
        }
    }

    handlePowerupCollisions() {
        const modeModifiers = this.gameModeManager.getActiveModifiers();

        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];

            if (Collision.rectRect(this.player.getBounds(), powerup.getBounds())) {
                const comboResult = this.comboSystem.registerAction('powerupCollected');
                const powerupData = powerup.collect();
                this.powerups.splice(i, 1);

                // Activar power-up
                this.player.activatePowerup(powerupData.type, powerupData.duration);
                this.game.score.powerupCollected();

                // Misiones
                this.missionSystem.updateProgress('powerups', 1);

                // Efectos especiales
                if (powerupData.type === 'doublePoints') {
                    const multiplier = 2 * (modeModifiers.scoreMultiplier || 1);
                    this.game.score.setMultiplier(multiplier, powerupData.duration);
                }

                // Efectos visuales IMPRESIONANTES
                const powerupX = powerup.x + powerup.width / 2;
                const powerupY = powerup.y + powerup.height / 2;

                // Visual FX Manager (efectos espectaculares específicos por tipo)
                this.visualFX.powerupCollected(powerupX, powerupY, powerupData.type);

                // Mantener compatibilidad con efectos originales
                this.game.particles.powerupAura(powerupX, powerupY, powerup.color);

                this.screenEffects.powerupCollected();

                // Audio
                this.game.audio.playSound('powerup_collect');
                if (powerupData.type === 'shield') {
                    this.game.audio.playSound('shield_activate');
                }

                this.addNotification(`Power-up: ${powerupData.type}!`, 'powerup');
            }
        }
    }

    handleEnemyCollisions() {
        for (const enemy of this.enemies) {
            const distance = Collision.distance(
                this.player.x, this.player.y,
                enemy.x, enemy.y
            );

            // Near miss
            if (distance < this.nearMissDistance && distance > 20) {
                this.nearMissCount++;
                this.comboSystem.registerAction('nearMiss');
                this.missionSystem.updateProgress('nearMisses', 1);
                this.screenEffects.nearMiss();
                this.addNotification('+150 Near Miss!', 'bonus');
            }

            // Colisión real
            if (Collision.rectRect(this.player.getBounds(), enemy.getBounds())) {
                if (this.player.takeDamage()) {
                    this.perfectLevel = false;

                    // Romper combo
                    const brokenCombo = this.comboSystem.breakCombo();

                    // Registrar en AI
                    this.aiManager.gameState.consecutiveDeaths++;
                    this.aiManager.gameState.consecutivePerfects = 0;

                    const playerX = this.player.x + this.player.width / 2;
                    const playerY = this.player.y + this.player.height / 2;

                    // EFECTOS ESPECTACULARES de muerte/hit
                    if (this.player.health <= 0) {
                        // Muerte total - explosión masiva
                        this.visualFX.playerDeath(playerX, playerY);
                    } else {
                        // Solo hit - efectos menores
                        this.visualFX.playerHit(playerX, playerY);
                    }

                    // Mantener efectos originales
                    this.game.particles.explosion(playerX, playerY);

                    this.screenEffects.death();
                    this.game.audio.playSound('collision');
                    this.musicEngine.triggerEvent('death');

                    // Verificar Game Over
                    if (this.player.health <= 0) {
                        const modeResult = this.gameModeManager.handleDeath();

                        if (!modeResult.allowContinue || !modeResult.respawnPlayer) {
                            this.handleGameEnd(false);
                        }
                        return;
                    }
                }
            }
        }
    }

    respawnPlayer() {
        this.player.health = this.player.maxHealth;
        const pos = this.findEmptyPosition(100, 200);
        this.player.x = pos.x;
        this.player.y = pos.y;
        this.addNotification('Respawn!', 'info');
    }

    levelComplete() {
        const timeBonus = Math.floor(this.timeRemaining);
        this.game.score.levelComplete(timeBonus, this.perfectLevel);

        // XP por completar nivel
        const sessionStats = {
            score: this.game.score.score,
            maxCombo: this.comboSystem.maxCombo,
            perfectLevel: this.perfectLevel,
            flagsCollected: this.game.score.stats.flagsCollected,
            survivalTime: Date.now() - this.levelStartTime
        };

        const xpGained = this.progressionSystem.calculateSessionXP(sessionStats);
        const progressResult = this.progressionSystem.addXP(xpGained);

        if (progressResult.leveledUp) {
            this.addNotification(`🎉 Level UP! Nivel ${progressResult.newLevel}`, 'levelup');
        }

        // Actualizar misiones
        this.missionSystem.updateProgress('score', this.game.score.score);
        this.missionSystem.updateProgress('combo', this.comboSystem.maxCombo);

        // AI
        this.aiManager.recordLevelComplete(sessionStats, this.perfectLevel);

        // Screen effects
        this.screenEffects.levelComplete();
        this.game.audio.playSound('level_complete');
        this.musicEngine.triggerEvent('levelComplete');

        // EFECTOS VISUALES ESPECTACULARES de nivel completado
        this.visualFX.levelComplete(() => {
            // Callback cuando termina la transición
            this.level++;
            this.setupLevel();
        });
    }

    handleGameEnd(won) {
        // Detener música
        this.musicEngine.stop();

        // Calcular stats finales
        const finalScore = this.game.score.score;
        const survivalTime = Date.now() - this.gameStartTime;

        // Calcular XP
        const sessionStats = {
            score: finalScore,
            maxCombo: this.comboSystem.maxCombo,
            perfectLevel: this.perfectLevel,
            flagsCollected: this.game.score.stats.flagsCollected,
            survivalTime
        };

        const xpGained = this.progressionSystem.calculateSessionXP(sessionStats);
        const progressResult = this.progressionSystem.addXP(xpGained);

        // Registrar en leaderboard
        const leaderboardResult = this.leaderboardSystem.submitScore(this.gameMode, {
            score: finalScore,
            survivalTime,
            flagsCollected: this.game.score.stats.flagsCollected,
            maxCombo: this.comboSystem.maxCombo,
            powerupsUsed: this.game.score.stats.powerupsUsed,
            enemiesAvoided: this.game.score.stats.enemiesAvoided,
            level: this.level,
            perfectLevel: this.perfectLevel,
            playerLevel: this.progressionSystem.level,
            skin: this.skinManager.currentSkin
        });

        // Registrar en AI
        this.aiManager.recordLevelComplete(sessionStats, won);

        // Screen effect + VISUAL FX ESPECTACULARES
        if (won) {
            this.screenEffects.levelComplete();
        } else {
            this.screenEffects.gameOver();
            // Game Over con transición cinematográfica
            this.visualFX.gameOver(() => {
                // La transición se completó
            });
        }

        // Cambiar a pantalla de game over con todos los datos
        this.game.setState('gameover', {
            win: won,
            score: finalScore,
            message: won ? '¡VICTORIA!' : '¡Game Over!',
            stats: {
                ...sessionStats,
                xpGained,
                progressResult,
                leaderboardResult,
                comboStats: this.comboSystem.getStats(),
                missionsCompleted: this.missionSystem.getDailyProgress().completed
            }
        });
    }

    updateMusicAndEffects(deltaTime) {
        // Actualizar música según estado del juego
        this.musicEngine.update({
            health: this.player.health,
            combo: this.comboSystem.combo,
            tension: this.aiManager.gameState.tensionLevel,
            feverMode: this.comboSystem.feverMode,
            intensity: this.aiManager.gameState.currentDifficulty / 2
        });

        // Actualizar screen effects según estado
        this.screenEffects.updateFromGameState({
            health: this.player.health,
            combo: this.comboSystem.combo,
            feverMode: this.comboSystem.feverMode,
            tension: this.aiManager.gameState.tensionLevel
        });
    }

    getGameContext() {
        return {
            health: this.player.health,
            enemiesNearby: this.enemies.filter(e =>
                Collision.distance(this.player.x, this.player.y, e.x, e.y) < 150
            ).length,
            combo: this.comboSystem.combo,
            hasShield: this.player.powerups.shield,
            score: this.game.score.score,
            flags: this.flags.length,
            survivalTime: Date.now() - this.levelStartTime
        };
    }

    getGameStatsForAI() {
        return {
            score: this.game.score.score,
            deaths: this.aiManager.realtimeMetrics.recentDeaths.length,
            survivalTime: Date.now() - this.gameStartTime,
            combo: this.comboSystem.combo,
            health: this.player.health,
            enemiesAvoided: this.game.score.stats.enemiesAvoided,
            flagsCollected: this.game.score.stats.flagsCollected,
            powerupsCollected: this.game.score.stats.powerupsUsed
        };
    }

    getTutorialStats() {
        return {
            movedUp: this.game.input.isKeyDown(['w', 'W', 'ArrowUp']),
            movedDown: this.game.input.isKeyDown(['s', 'S', 'ArrowDown']),
            movedLeft: this.game.input.isKeyDown(['a', 'A', 'ArrowLeft']),
            movedRight: this.game.input.isKeyDown(['d', 'D', 'ArrowRight']),
            flagsCollected: this.game.score.stats.flagsCollected,
            survivalTime: Date.now() - this.levelStartTime,
            powerupsCollected: this.game.score.stats.powerupsUsed,
            maxCombo: this.comboSystem.maxCombo
        };
    }

    checkAchievements() {
        this.game.achievements.checkAchievements({
            score: this.game.score.score,
            stats: {
                ...this.game.score.stats,
                levelTime: (Date.now() - this.levelStartTime) / 1000,
                levelComplete: this.flags.length === 0,
                maxCombo: this.comboSystem.maxCombo,
                totalFlags: this.game.score.stats.flagsCollected,
                nearMisses: this.nearMissCount,
                feverMode: this.comboSystem.feverMode
            },
            level: this.level,
            health: this.player.health,
            maxHealth: this.player.maxHealth
        });
    }

    checkSkinUnlocks() {
        const playerStats = {
            level: this.progressionSystem.level,
            bestScore: this.leaderboardSystem.getPersonalBest('overall')?.score || 0,
            currentStreak: this.streakSystem.currentStreak,
            longestStreak: this.streakSystem.longestStreak,
            maxCombo: this.comboSystem.stats.longestCombo,
            totalXp: this.progressionSystem.totalXp,
            missionsCompleted: this.missionSystem.missionsCompleted,
            achievements: this.game.achievements.unlockedAchievements.map(a => a.id),
            modes: {}
        };

        const newUnlocks = this.skinManager.checkUnlockConditions(playerStats);
        newUnlocks.forEach(unlock => {
            this.addNotification(`🎨 Skin desbloqueado: ${unlock.skin.name}!`, 'unlock');
        });
    }

    addNotification(message, type = 'info') {
        this.notifications.push({
            message,
            type,
            timestamp: Date.now(),
            duration: 3000
        });
    }

    updateNotifications(deltaTime) {
        const now = Date.now();
        this.notifications = this.notifications.filter(n =>
            now - n.timestamp < n.duration
        );
    }

    draw(ctx) {
        // Pre-render effects (shake, zoom)
        this.screenEffects.preRender();

        // LAYER 1: Starfield Background
        this.visualFX.getStarfield().draw(ctx);

        // Fondo semi-transparente sobre starfield (opcional, para no perder visibilidad)
        ctx.fillStyle = 'rgba(10, 14, 39, 0.3)';
        ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);

        // Grid
        this.drawGrid(ctx);

        // LAYER 2: Particles (detrás de entidades)
        this.visualFX.getParticles().draw(ctx);
        this.visualFX.getParticles().drawSpecialParticles(ctx);

        // LAYER 3: PowerUp Effects
        this.visualFX.getPowerUpEffects().draw(ctx);

        // LAYER 4: Entidades del juego
        this.powerups.forEach(p => p.draw(ctx));
        this.flags.forEach(f => f.draw(ctx));
        this.enemies.forEach(e => e.draw(ctx));
        this.player.draw(ctx);

        // Partículas del sistema original (mantener compatibilidad)
        this.game.particles.draw(ctx);

        // LAYER 5: UI Animations (floating texts, glowing elements)
        this.visualFX.getUIAnimations().drawFloatingTexts(ctx);
        this.visualFX.getUIAnimations().drawGlowingElements(ctx);

        // Post-render effects (vignette, glow, flash, etc)
        this.screenEffects.postRender();

        // HUD (siempre encima de efectos)
        this.drawEnhancedHUD(ctx);

        // Tutorial overlay
        if (this.tutorialSystem.active) {
            this.drawTutorialOverlay(ctx);
        }

        // LAYER 6: Notificaciones (tanto las nuevas como las viejas)
        this.visualFX.getUIAnimations().drawNotifications(ctx, CONFIG.CANVAS.WIDTH);
        this.drawNotifications(ctx);

        // Achievement notifications
        this.drawAchievementNotifications(ctx);

        // LAYER 7: Transitions (siempre encima de todo)
        this.visualFX.getTransitions().draw();
    }

    drawGrid(ctx) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;

        for (let x = 0; x < CONFIG.CANVAS.WIDTH; x += CONFIG.CANVAS.GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, CONFIG.CANVAS.HEIGHT);
            ctx.stroke();
        }

        for (let y = 0; y < CONFIG.CANVAS.HEIGHT; y += CONFIG.CANVAS.GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(CONFIG.CANVAS.WIDTH, y);
            ctx.stroke();
        }

        ctx.restore();
    }

    drawEnhancedHUD(ctx) {
        ctx.save();
        ctx.font = `bold 24px ${CONFIG.UI.FONT_FAMILY}`;
        ctx.textBaseline = 'top';

        // Score con multiplier
        const streakMultiplier = this.streakSystem.getStreakMultiplier();
        const scoreText = `SCORE: ${this.game.score.score.toLocaleString()}`;
        ctx.fillStyle = CONFIG.UI.WARNING_COLOR;
        ctx.textAlign = 'left';
        ctx.fillText(scoreText, 20, 20);

        if (streakMultiplier > 1) {
            ctx.font = `14px ${CONFIG.UI.FONT_FAMILY}`;
            ctx.fillText(`x${streakMultiplier.toFixed(1)} streak bonus`, 25, 50);
            ctx.font = `bold 24px ${CONFIG.UI.FONT_FAMILY}`;
        }

        // Level y modo
        ctx.fillStyle = CONFIG.UI.PRIMARY_COLOR;
        ctx.textAlign = 'center';
        const modeInfo = this.gameModeManager.getCurrentMode();
        ctx.fillText(`${modeInfo.info.icon} ${modeInfo.name} - LVL ${this.level}`, CONFIG.CANVAS.WIDTH / 2, 20);

        // Tiempo (si aplica)
        if (this.gameModeManager.getCurrentSettings().hasTimeLimit) {
            const timeLeft = Math.ceil(this.timeRemaining);
            ctx.fillStyle = timeLeft < 10 ? CONFIG.UI.DANGER_COLOR : CONFIG.UI.SUCCESS_COLOR;
            ctx.textAlign = 'right';
            ctx.fillText(`⏱️ ${timeLeft}s`, CONFIG.CANVAS.WIDTH - 20, 20);
        }

        // Vida
        ctx.textAlign = 'left';
        ctx.fillStyle = CONFIG.UI.DANGER_COLOR;
        ctx.fillText('♥'.repeat(this.player.health), 20, 60);

        // Player level y XP bar
        ctx.font = `16px ${CONFIG.UI.FONT_FAMILY}`;
        ctx.fillStyle = CONFIG.UI.PRIMARY_COLOR;
        ctx.fillText(`LVL ${this.progressionSystem.level}`, 20, 95);

        const xpPercent = this.progressionSystem.getXPPercentage() / 100;
        const barWidth = 150;
        const barHeight = 8;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(80, 98, barWidth, barHeight);
        ctx.fillStyle = CONFIG.UI.PRIMARY_COLOR;
        ctx.fillRect(80, 98, barWidth * xpPercent, barHeight);

        // Combo (mejorado)
        const comboStatus = this.comboSystem.getStatus();
        if (comboStatus.combo > 1) {
            ctx.save();
            ctx.font = `bold 48px ${CONFIG.UI.FONT_FAMILY}`;

            const feedback = this.comboSystem.getVisualFeedback();
            ctx.fillStyle = feedback.color;
            ctx.textAlign = 'center';
            ctx.shadowBlur = 30;
            ctx.shadowColor = feedback.color;

            const text = comboStatus.feverMode ? `🔥 FEVER x${comboStatus.combo}! 🔥` : `COMBO x${comboStatus.combo}!`;
            ctx.fillText(text, CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT - 80);

            // Barra de tiempo de combo
            const barW = 300;
            const barH = 10;
            const barX = CONFIG.CANVAS.WIDTH / 2 - barW / 2;
            const barY = CONFIG.CANVAS.HEIGHT - 30;

            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(barX, barY, barW, barH);

            ctx.fillStyle = feedback.color;
            ctx.fillRect(barX, barY, barW * (comboStatus.percentageRemaining / 100), barH);

            ctx.restore();
        }

        // Missions indicator
        const dailyProgress = this.missionSystem.getDailyProgress();
        ctx.font = `14px ${CONFIG.UI.FONT_FAMILY}`;
        ctx.fillStyle = CONFIG.UI.SUCCESS_COLOR;
        ctx.textAlign = 'right';
        ctx.fillText(`📋 Misiones: ${dailyProgress.completed}/${dailyProgress.total}`, CONFIG.CANVAS.WIDTH - 20, 60);

        // Minimap (mantenido del original)
        this.drawMinimap(ctx);

        ctx.restore();
    }

    drawMinimap(ctx) {
        const minimapSize = 150;
        const minimapX = CONFIG.CANVAS.WIDTH - minimapSize - 20;
        const minimapY = CONFIG.CANVAS.HEIGHT - minimapSize - 20;
        const scale = minimapSize / CONFIG.CANVAS.WIDTH;

        ctx.save();

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize * (CONFIG.CANVAS.HEIGHT / CONFIG.CANVAS.WIDTH));

        ctx.strokeStyle = CONFIG.UI.PRIMARY_COLOR;
        ctx.lineWidth = 2;
        ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize * (CONFIG.CANVAS.HEIGHT / CONFIG.CANVAS.WIDTH));

        ctx.fillStyle = CONFIG.FLAG.COLORS.NORMAL;
        this.flags.forEach(flag => {
            ctx.fillRect(minimapX + flag.x * scale, minimapY + flag.y * scale, 3, 3);
        });

        ctx.fillStyle = CONFIG.UI.DANGER_COLOR;
        this.enemies.forEach(enemy => {
            ctx.fillRect(minimapX + enemy.x * scale, minimapY + enemy.y * scale, 3, 3);
        });

        const colors = this.skinManager.getCurrentColors();
        ctx.fillStyle = colors.primary;
        ctx.fillRect(minimapX + this.player.x * scale, minimapY + this.player.y * scale, 4, 4);

        ctx.restore();
    }

    drawTutorialOverlay(ctx) {
        const step = this.tutorialSystem.getCurrentStep();
        if (!step) return;

        ctx.save();

        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);

        // Tutorial box
        const boxWidth = 600;
        const boxHeight = 200;
        const boxX = CONFIG.CANVAS.WIDTH / 2 - boxWidth / 2;
        const boxY = CONFIG.CANVAS.HEIGHT / 2 - boxHeight / 2;

        ctx.fillStyle = 'rgba(10, 14, 39, 0.95)';
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

        ctx.strokeStyle = CONFIG.UI.PRIMARY_COLOR;
        ctx.lineWidth = 3;
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        // Title
        ctx.font = `bold 32px ${CONFIG.UI.FONT_FAMILY}`;
        ctx.fillStyle = CONFIG.UI.PRIMARY_COLOR;
        ctx.textAlign = 'center';
        ctx.fillText(step.title, CONFIG.CANVAS.WIDTH / 2, boxY + 40);

        // Description
        ctx.font = `18px ${CONFIG.UI.FONT_FAMILY}`;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(step.description, CONFIG.CANVAS.WIDTH / 2, boxY + 80);

        // Objective
        ctx.font = `bold 20px ${CONFIG.UI.FONT_FAMILY}`;
        ctx.fillStyle = CONFIG.UI.SUCCESS_COLOR;
        ctx.fillText(`Objetivo: ${step.objective}`, CONFIG.CANVAS.WIDTH / 2, boxY + 120);

        // Hint
        ctx.font = `16px ${CONFIG.UI.FONT_FAMILY}`;
        ctx.fillStyle = CONFIG.UI.WARNING_COLOR;
        ctx.fillText(step.hint, CONFIG.CANVAS.WIDTH / 2, boxY + 155);

        // Progress
        const progress = this.tutorialSystem.getProgress();
        ctx.fillText(`Paso ${step.stepNumber} de ${step.totalSteps}`, CONFIG.CANVAS.WIDTH / 2, boxY + 180);

        ctx.restore();
    }

    drawNotifications(ctx) {
        ctx.save();

        this.notifications.forEach((notif, index) => {
            const elapsed = Date.now() - notif.timestamp;
            const progress = elapsed / notif.duration;
            const y = 150 + index * 40;

            let alpha = 1;
            if (progress < 0.1) {
                alpha = progress / 0.1;
            } else if (progress > 0.8) {
                alpha = 1 - (progress - 0.8) / 0.2;
            }

            ctx.globalAlpha = alpha;

            let color = CONFIG.UI.PRIMARY_COLOR;
            if (notif.type === 'success') color = CONFIG.UI.SUCCESS_COLOR;
            else if (notif.type === 'combo') color = '#ffff00';
            else if (notif.type === 'points') color = CONFIG.UI.WARNING_COLOR;

            ctx.font = `bold 20px ${CONFIG.UI.FONT_FAMILY}`;
            ctx.fillStyle = color;
            ctx.textAlign = 'center';
            ctx.shadowBlur = 10;
            ctx.shadowColor = color;
            ctx.fillText(notif.message, CONFIG.CANVAS.WIDTH / 2, y);
        });

        ctx.restore();
    }

    drawAchievementNotifications(ctx) {
        const notifications = this.game.achievements.getNotifications();

        notifications.forEach((notif, index) => {
            const elapsed = Date.now() - notif.time;
            const progress = elapsed / notif.duration;
            const y = 100 + index * 80;

            ctx.save();

            let alpha = 1;
            if (progress < 0.1) alpha = progress / 0.1;
            else if (progress > 0.9) alpha = 1 - (progress - 0.9) / 0.1;

            ctx.globalAlpha = alpha;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            ctx.fillRect(20, y, 300, 60);

            ctx.strokeStyle = CONFIG.UI.SUCCESS_COLOR;
            ctx.lineWidth = 2;
            ctx.strokeRect(20, y, 300, 60);

            ctx.font = `20px ${CONFIG.UI.FONT_FAMILY}`;
            ctx.fillStyle = CONFIG.UI.SUCCESS_COLOR;
            ctx.textAlign = 'left';
            ctx.fillText('🏆 LOGRO DESBLOQUEADO', 30, y + 25);

            ctx.font = `16px ${CONFIG.UI.FONT_FAMILY}`;
            ctx.fillStyle = '#ffffff';
            ctx.fillText(notif.achievement.name, 30, y + 45);

            ctx.restore();
        });
    }

    handleInput(input) {
        if (input.isKeyDown(['Escape', 'p', 'P'])) {
            if (!this.pausePressed) {
                this.game.setState('pause');
                this.pausePressed = true;
            }
        } else {
            this.pausePressed = false;
        }
    }

    exit() {
        this.musicEngine.stop();
        this.visualFX.clear(); // Limpiar efectos visuales
        console.log('Saliendo del juego revolucionario');
    }
}

export default GameStateEnhanced;
