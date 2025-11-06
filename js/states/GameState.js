/**
 * Estado Principal del Juego
 * Lógica de gameplay completa
 */

import { CONFIG } from '../config.js';
import { Collision } from '../utils/Collision.js';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import Flag from '../entities/Flag.js';
import PowerUp from '../entities/PowerUp.js';

export class GameState {
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
    }

    enter(data = {}) {
        console.log('Iniciando juego, nivel:', data.level || 1);
        this.level = data.level || 1;
        this.setupLevel();
    }

    setupLevel() {
        const levelConfig = CONFIG.LEVELS[this.level];

        if (!levelConfig) {
            // Victoria total - completó todos los niveles
            this.game.setState('gameover', {
                win: true,
                score: this.game.score.score,
                message: '¡CAMPEÓN! Completaste todos los niveles'
            });
            return;
        }

        // Crear jugador
        this.player = new Player(100, 100);

        // Generar banderas
        this.flags = [];
        for (let i = 0; i < levelConfig.flags; i++) {
            let x, y;
            let attempts = 0;

            do {
                x = Math.random() * (CONFIG.CANVAS.WIDTH - 100) + 50;
                y = Math.random() * (CONFIG.CANVAS.HEIGHT - 100) + 50;
                attempts++;
            } while (this.isPositionOccupied(x, y, 80) && attempts < 100);

            this.flags.push(new Flag(x, y, 'normal'));
        }

        // Generar enemigos
        this.enemies = [];
        for (let i = 0; i < levelConfig.enemies; i++) {
            let x, y;
            let attempts = 0;

            do {
                x = Math.random() * (CONFIG.CANVAS.WIDTH - 100) + 50;
                y = Math.random() * (CONFIG.CANVAS.HEIGHT - 100) + 50;
                attempts++;
            } while (
                (this.isPositionOccupied(x, y, 100) ||
                Collision.distance(x, y, this.player.x, this.player.y) < 200) &&
                attempts < 100
            );

            this.enemies.push(new Enemy(x, y, i % 4));
        }

        // Generar power-ups
        this.powerups = [];
        const powerupTypes = Object.keys(CONFIG.POWERUP.TYPES).map(k => k.toLowerCase());

        for (let i = 0; i < levelConfig.powerups; i++) {
            if (Math.random() < CONFIG.POWERUP.SPAWN_CHANCE) continue;

            let x, y;
            let attempts = 0;

            do {
                x = Math.random() * (CONFIG.CANVAS.WIDTH - 100) + 50;
                y = Math.random() * (CONFIG.CANVAS.HEIGHT - 100) + 50;
                attempts++;
            } while (this.isPositionOccupied(x, y, 80) && attempts < 100);

            const type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
            this.powerups.push(new PowerUp(x, y, type));
        }

        this.timeRemaining = levelConfig.timeLimit;
        this.levelStartTime = Date.now();
        this.perfectLevel = true;

        console.log(`Nivel ${this.level}: ${levelConfig.name}`);
        console.log(`Banderas: ${levelConfig.flags}, Enemigos: ${levelConfig.enemies}, Tiempo: ${levelConfig.timeLimit}s`);
    }

    isPositionOccupied(x, y, minDistance) {
        // Verificar contra banderas
        for (const flag of this.flags) {
            if (Collision.distance(x, y, flag.x, flag.y) < minDistance) {
                return true;
            }
        }

        // Verificar contra enemigos
        for (const enemy of this.enemies) {
            if (Collision.distance(x, y, enemy.x, enemy.y) < minDistance) {
                return true;
            }
        }

        // Verificar contra power-ups
        for (const powerup of this.powerups) {
            if (Collision.distance(x, y, powerup.x, powerup.y) < minDistance) {
                return true;
            }
        }

        return false;
    }

    update(deltaTime) {
        if (this.paused) return;

        // Actualizar tiempo
        this.timeRemaining -= deltaTime;

        if (this.timeRemaining <= 0) {
            // Game Over por tiempo
            this.game.setState('gameover', {
                win: false,
                score: this.game.score.score,
                message: '¡Se acabó el tiempo!'
            });
            return;
        }

        // Actualizar jugador
        this.player.update(deltaTime, this.game.input, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);

        // Actualizar banderas
        this.flags.forEach(flag => flag.update(deltaTime));

        // Actualizar enemigos
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime, this.player, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);
        });

        // Actualizar power-ups
        this.powerups.forEach(powerup => powerup.update(deltaTime));

        // Actualizar sistemas
        this.game.score.update(deltaTime);

        // Colisiones con banderas
        for (let i = this.flags.length - 1; i >= 0; i--) {
            const flag = this.flags[i];

            if (Collision.rectRect(this.player.getBounds(), flag.getBounds())) {
                const scoreData = this.game.score.flagCollected();
                this.flags.splice(i, 1);

                // Efectos
                this.game.particles.collect(
                    flag.x + flag.width / 2,
                    flag.y + flag.height / 2,
                    flag.color
                );
                this.game.audio.playSound('flag_collect');

                if (scoreData.combo >= 3) {
                    this.game.audio.playSound('combo');
                }
            }
        }

        // Colisiones con power-ups
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];

            if (Collision.rectRect(this.player.getBounds(), powerup.getBounds())) {
                const powerupData = powerup.collect();
                this.powerups.splice(i, 1);

                // Activar power-up
                this.player.activatePowerup(powerupData.type, powerupData.duration);
                this.game.score.powerupCollected();

                // Efectos especiales según tipo
                if (powerupData.type === 'doublePoints') {
                    this.game.score.setMultiplier(2, powerupData.duration);
                }

                // Efectos visuales y audio
                this.game.particles.powerupAura(
                    powerup.x + powerup.width / 2,
                    powerup.y + powerup.height / 2,
                    powerup.color
                );
                this.game.audio.playSound('powerup_collect');

                if (powerupData.type === 'shield') {
                    this.game.audio.playSound('shield_activate');
                }
            }
        }

        // Colisiones con enemigos
        for (const enemy of this.enemies) {
            if (Collision.rectRect(this.player.getBounds(), enemy.getBounds())) {
                if (this.player.takeDamage()) {
                    this.perfectLevel = false;

                    // Efectos
                    this.game.particles.explosion(
                        this.player.x + this.player.width / 2,
                        this.player.y + this.player.height / 2
                    );
                    this.game.audio.playSound('collision');

                    // Verificar Game Over
                    if (this.player.health <= 0) {
                        this.game.setState('gameover', {
                            win: false,
                            score: this.game.score.score,
                            message: '¡Game Over!'
                        });
                        return;
                    }
                }
            }
        }

        // Verificar victoria del nivel
        if (this.flags.length === 0) {
            this.levelComplete();
        }

        // Actualizar partículas
        this.game.particles.update(deltaTime);

        // Trail del jugador
        if (Math.random() < 0.3) {
            this.game.particles.trail(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height / 2
            );
        }

        // Verificar logros
        this.checkAchievements();
    }

    levelComplete() {
        const timeBonus = Math.floor(this.timeRemaining);
        this.game.score.levelComplete(timeBonus, this.perfectLevel);
        this.game.audio.playSound('level_complete');

        // Pausa breve y siguiente nivel
        setTimeout(() => {
            this.level++;
            this.enter({ level: this.level });
        }, 1500);
    }

    draw(ctx) {
        // Fondo
        ctx.fillStyle = CONFIG.CANVAS.BACKGROUND;
        ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);

        // Grid sutil
        this.drawGrid(ctx);

        // Entidades
        this.powerups.forEach(p => p.draw(ctx));
        this.flags.forEach(f => f.draw(ctx));
        this.enemies.forEach(e => e.draw(ctx));
        this.player.draw(ctx);

        // Partículas
        this.game.particles.draw(ctx);

        // HUD
        this.drawHUD(ctx);

        // Notificaciones de logros
        this.drawAchievementNotifications(ctx);
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

    drawHUD(ctx) {
        ctx.save();
        ctx.font = `bold 24px ${CONFIG.UI.FONT_FAMILY}`;
        ctx.textBaseline = 'top';

        // Puntuación
        ctx.fillStyle = CONFIG.UI.WARNING_COLOR;
        ctx.textAlign = 'left';
        ctx.fillText(`SCORE: ${this.game.score.score.toLocaleString()}`, 20, 20);

        // Nivel
        const levelConfig = CONFIG.LEVELS[this.level];
        ctx.fillStyle = CONFIG.UI.PRIMARY_COLOR;
        ctx.textAlign = 'center';
        ctx.fillText(`LEVEL ${this.level}: ${levelConfig.name}`, CONFIG.CANVAS.WIDTH / 2, 20);

        // Tiempo
        ctx.fillStyle = this.timeRemaining < 10 ? CONFIG.UI.DANGER_COLOR : CONFIG.UI.SUCCESS_COLOR;
        ctx.textAlign = 'right';
        ctx.fillText(`TIME: ${Math.ceil(this.timeRemaining)}s`, CONFIG.CANVAS.WIDTH - 20, 20);

        // Vida
        ctx.textAlign = 'left';
        ctx.fillStyle = CONFIG.UI.DANGER_COLOR;
        ctx.fillText('♥'.repeat(this.player.health), 20, 60);

        // Banderas restantes
        ctx.fillStyle = CONFIG.UI.WARNING_COLOR;
        ctx.fillText(`FLAGS: ${this.flags.length}`, 20, 95);

        // Combo
        if (this.game.score.combo > 1) {
            ctx.save();
            ctx.font = `bold 32px ${CONFIG.UI.FONT_FAMILY}`;
            ctx.fillStyle = CONFIG.UI.SUCCESS_COLOR;
            ctx.textAlign = 'center';
            ctx.shadowBlur = 20;
            ctx.shadowColor = CONFIG.UI.SUCCESS_COLOR;
            ctx.fillText(`COMBO x${this.game.score.combo}!`, CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT - 50);

            // Barra de combo timer
            const barWidth = 200;
            const barHeight = 6;
            const barX = CONFIG.CANVAS.WIDTH / 2 - barWidth / 2;
            const barY = CONFIG.CANVAS.HEIGHT - 20;

            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(barX, barY, barWidth, barHeight);

            ctx.fillStyle = CONFIG.UI.SUCCESS_COLOR;
            ctx.fillRect(barX, barY, barWidth * this.game.score.getComboPercentage(), barHeight);

            ctx.restore();
        }

        // Power-ups activos
        let powerupY = CONFIG.CANVAS.HEIGHT - 60;
        Object.entries(this.player.powerups).forEach(([key, active]) => {
            if (active) {
                const timeLeft = Math.ceil(this.player.powerupTimers[key] / 1000);
                ctx.save();
                ctx.font = `14px ${CONFIG.UI.FONT_FAMILY}`;
                ctx.fillStyle = CONFIG.POWERUP.TYPES[key.toUpperCase()].color;
                ctx.textAlign = 'right';
                ctx.fillText(`${key.toUpperCase()}: ${timeLeft}s`, CONFIG.CANVAS.WIDTH - 20, powerupY);
                powerupY -= 25;
                ctx.restore();
            }
        });

        // Minimapa (simplificado)
        this.drawMinimap(ctx);

        ctx.restore();
    }

    drawMinimap(ctx) {
        const minimapSize = 150;
        const minimapX = CONFIG.CANVAS.WIDTH - minimapSize - 20;
        const minimapY = CONFIG.CANVAS.HEIGHT - minimapSize - 20;
        const scale = minimapSize / CONFIG.CANVAS.WIDTH;

        ctx.save();

        // Fondo del minimapa
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize * (CONFIG.CANVAS.HEIGHT / CONFIG.CANVAS.WIDTH));

        // Borde
        ctx.strokeStyle = CONFIG.UI.PRIMARY_COLOR;
        ctx.lineWidth = 2;
        ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize * (CONFIG.CANVAS.HEIGHT / CONFIG.CANVAS.WIDTH));

        // Banderas
        ctx.fillStyle = CONFIG.FLAG.COLORS.NORMAL;
        this.flags.forEach(flag => {
            ctx.fillRect(
                minimapX + flag.x * scale,
                minimapY + flag.y * scale,
                3, 3
            );
        });

        // Enemigos
        ctx.fillStyle = CONFIG.UI.DANGER_COLOR;
        this.enemies.forEach(enemy => {
            ctx.fillRect(
                minimapX + enemy.x * scale,
                minimapY + enemy.y * scale,
                3, 3
            );
        });

        // Jugador
        ctx.fillStyle = CONFIG.PLAYER.COLOR;
        ctx.fillRect(
            minimapX + this.player.x * scale,
            minimapY + this.player.y * scale,
            4, 4
        );

        ctx.restore();
    }

    drawAchievementNotifications(ctx) {
        const notifications = this.game.achievements.getNotifications();

        notifications.forEach((notif, index) => {
            const elapsed = Date.now() - notif.time;
            const progress = elapsed / notif.duration;
            const y = 100 + index * 80;

            ctx.save();

            // Animación de entrada/salida
            let alpha = 1;
            if (progress < 0.1) {
                alpha = progress / 0.1;
            } else if (progress > 0.9) {
                alpha = 1 - (progress - 0.9) / 0.1;
            }

            ctx.globalAlpha = alpha;

            // Fondo
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(20, y, 300, 60);

            ctx.strokeStyle = CONFIG.UI.SUCCESS_COLOR;
            ctx.lineWidth = 2;
            ctx.strokeRect(20, y, 300, 60);

            // Texto
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

    checkAchievements() {
        this.game.achievements.checkAchievements({
            score: this.game.score.score,
            stats: {
                ...this.game.score.stats,
                levelTime: (Date.now() - this.levelStartTime) / 1000,
                levelComplete: this.flags.length === 0,
                maxCombo: this.game.score.combo,
                totalFlags: this.game.score.stats.flagsCollected
            },
            level: this.level,
            health: this.player.health,
            maxHealth: this.player.maxHealth
        });
    }

    handleInput(input) {
        // Pausa
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
        console.log('Saliendo del juego');
    }
}

export default GameState;
