/**
 * Estado de Game Over / Victoria
 * Muestra resultados y opciones
 */

import { CONFIG } from '../config.js';

export class GameOverState {
    constructor(game) {
        this.game = game;
        this.selectedOption = 0;
        this.options = ['REINTENTAR', 'MENÚ PRINCIPAL'];
        this.win = false;
        this.score = 0;
        this.message = '';
        this.particles = [];
        this.animationTime = 0;
    }

    enter(data = {}) {
        this.win = data.win || false;
        this.score = data.score || 0;
        this.message = data.message || '';
        this.animationTime = 0;

        console.log(this.win ? '¡Victoria!' : 'Game Over', 'Score:', this.score);

        // Reproducir sonido
        if (this.win) {
            this.game.audio.playSound('level_complete');
        } else {
            this.game.audio.playSound('game_over');
        }

        // Partículas de celebración si ganó
        if (this.win) {
            for (let i = 0; i < 100; i++) {
                this.particles.push({
                    x: CONFIG.CANVAS.WIDTH / 2,
                    y: CONFIG.CANVAS.HEIGHT / 2,
                    vx: (Math.random() - 0.5) * 10,
                    vy: (Math.random() - 0.5) * 10 - 5,
                    color: ['#ffd700', '#00d4ff', '#ff4757', '#00ff88'][Math.floor(Math.random() * 4)],
                    size: Math.random() * 6 + 2,
                    life: Math.random() * 2 + 1,
                    gravity: 0.2
                });
            }
        }
    }

    update(deltaTime) {
        this.animationTime += deltaTime;

        // Actualizar partículas
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.life -= deltaTime;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        // Fondo con gradiente
        const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS.HEIGHT);
        if (this.win) {
            gradient.addColorStop(0, '#0a1e0a');
            gradient.addColorStop(1, '#0a0e27');
        } else {
            gradient.addColorStop(0, '#1e0a0a');
            gradient.addColorStop(1, '#0a0e27');
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);

        // Dibujar partículas
        this.particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
            ctx.restore();
        });

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Título principal
        const titleY = 150 + Math.sin(this.animationTime * 2) * 10;
        ctx.font = `bold 70px ${CONFIG.UI.FONT_FAMILY}`;

        if (this.win) {
            ctx.fillStyle = CONFIG.UI.SUCCESS_COLOR;
            ctx.shadowBlur = 40;
            ctx.shadowColor = CONFIG.UI.SUCCESS_COLOR;
            ctx.fillText('¡VICTORIA!', CONFIG.CANVAS.WIDTH / 2, titleY);
        } else {
            ctx.fillStyle = CONFIG.UI.DANGER_COLOR;
            ctx.shadowBlur = 40;
            ctx.shadowColor = CONFIG.UI.DANGER_COLOR;
            ctx.fillText('GAME OVER', CONFIG.CANVAS.WIDTH / 2, titleY);
        }

        // Mensaje
        ctx.shadowBlur = 0;
        ctx.font = `24px ${CONFIG.UI.FONT_FAMILY}`;
        ctx.fillStyle = '#aaa';
        ctx.fillText(this.message, CONFIG.CANVAS.WIDTH / 2, titleY + 60);

        // Panel de estadísticas
        this.drawStatsPanel(ctx);

        // Opciones
        const startY = 550;
        const spacing = 70;

        this.options.forEach((option, index) => {
            const y = startY + index * spacing;
            const isSelected = index === this.selectedOption;

            // Fondo de opción
            if (isSelected) {
                ctx.fillStyle = this.win ?
                    'rgba(0, 255, 136, 0.2)' :
                    'rgba(255, 71, 87, 0.2)';

                const boxWidth = 350;
                const boxHeight = 50;
                const boxX = CONFIG.CANVAS.WIDTH / 2 - boxWidth / 2;
                const boxY = y - boxHeight / 2;

                ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

                ctx.strokeStyle = this.win ? CONFIG.UI.SUCCESS_COLOR : CONFIG.UI.DANGER_COLOR;
                ctx.lineWidth = 2;
                ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
            }

            // Texto
            ctx.font = `${isSelected ? 'bold' : ''} 28px ${CONFIG.UI.FONT_FAMILY}`;
            ctx.fillStyle = isSelected ? '#ffffff' : '#888';
            ctx.fillText(option, CONFIG.CANVAS.WIDTH / 2, y);
        });

        // Controles
        ctx.font = `16px ${CONFIG.UI.FONT_FAMILY}`;
        ctx.fillStyle = '#666';
        ctx.fillText(
            '↑↓ Navegar  |  ENTER Seleccionar',
            CONFIG.CANVAS.WIDTH / 2,
            CONFIG.CANVAS.HEIGHT - 30
        );

        ctx.restore();
    }

    drawStatsPanel(ctx) {
        const panelWidth = 500;
        const panelHeight = 200;
        const panelX = CONFIG.CANVAS.WIDTH / 2 - panelWidth / 2;
        const panelY = 280;

        // Fondo del panel
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

        ctx.strokeStyle = this.win ? CONFIG.UI.SUCCESS_COLOR : CONFIG.UI.DANGER_COLOR;
        ctx.lineWidth = 2;
        ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

        // Estadísticas
        ctx.font = `20px ${CONFIG.UI.FONT_FAMILY}`;
        ctx.textAlign = 'left';

        const stats = [
            { label: 'PUNTUACIÓN FINAL', value: this.score.toLocaleString(), color: CONFIG.UI.WARNING_COLOR },
            { label: 'HIGH SCORE', value: this.game.score.highScore.toLocaleString(), color: CONFIG.UI.PRIMARY_COLOR },
            { label: 'BANDERAS COLECTADAS', value: this.game.score.stats.flagsCollected, color: CONFIG.UI.SUCCESS_COLOR },
            { label: 'ENEMIGOS ESQUIVADOS', value: this.game.score.stats.enemiesDodged, color: '#aaa' }
        ];

        stats.forEach((stat, index) => {
            const y = panelY + 40 + index * 40;

            ctx.fillStyle = '#888';
            ctx.fillText(stat.label, panelX + 30, y);

            ctx.fillStyle = stat.color;
            ctx.textAlign = 'right';
            ctx.fillText(String(stat.value), panelX + panelWidth - 30, y);
            ctx.textAlign = 'left';
        });

        // Nuevo récord
        if (this.score >= this.game.score.highScore && this.score > 0) {
            ctx.save();
            ctx.font = `bold 18px ${CONFIG.UI.FONT_FAMILY}`;
            ctx.fillStyle = CONFIG.UI.WARNING_COLOR;
            ctx.textAlign = 'center';
            ctx.shadowBlur = 20;
            ctx.shadowColor = CONFIG.UI.WARNING_COLOR;
            ctx.fillText(
                '★ ¡NUEVO RÉCORD! ★',
                CONFIG.CANVAS.WIDTH / 2,
                panelY + panelHeight + 30
            );
            ctx.restore();
        }

        ctx.restore();
    }

    handleInput(input) {
        // Navegación
        if (input.isKeyDown(['ArrowUp', 'w', 'W'])) {
            if (!this.keyPressed) {
                this.selectedOption = (this.selectedOption - 1 + this.options.length) % this.options.length;
                this.game.audio.playSound('menu_hover');
                this.keyPressed = true;
            }
        } else if (input.isKeyDown(['ArrowDown', 's', 'S'])) {
            if (!this.keyPressed) {
                this.selectedOption = (this.selectedOption + 1) % this.options.length;
                this.game.audio.playSound('menu_hover');
                this.keyPressed = true;
            }
        } else if (input.isKeyDown(['Enter', ' '])) {
            if (!this.enterPressed) {
                this.selectOption();
                this.game.audio.playSound('menu_select');
                this.enterPressed = true;
            }
        } else {
            this.keyPressed = false;
            this.enterPressed = false;
        }
    }

    selectOption() {
        switch(this.selectedOption) {
            case 0: // REINTENTAR
                this.game.startGame();
                break;
            case 1: // MENÚ PRINCIPAL
                this.game.setState('menu');
                break;
        }
    }

    exit() {
        this.particles = [];
    }
}

export default GameOverState;
