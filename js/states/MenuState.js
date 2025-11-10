/**
 * Estado del Menú Principal
 * UI atractiva con animaciones
 */

import { CONFIG } from '../config.js';
import Storage from '../utils/Storage.js';

export class MenuState {
    constructor(game) {
        this.game = game;
        this.selectedOption = 0;
        this.options = ['JUGAR', 'LOGROS', 'CONFIGURACIÓN', 'CRÉDITOS'];
        this.particles = [];
        this.stars = [];
        this.titleAnimation = 0;
        this.hoverAnimation = [0, 0, 0, 0];

        // Inicializar estrellas de fondo
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * CONFIG.CANVAS.WIDTH,
                y: Math.random() * CONFIG.CANVAS.HEIGHT,
                size: Math.random() * 2,
                speed: Math.random() * 0.5 + 0.1,
                alpha: Math.random()
            });
        }
    }

    enter() {
        console.log('Entrando al menú principal');
        this.selectedOption = 0;
    }

    update(deltaTime) {
        // Actualizar animación del título
        this.titleAnimation += deltaTime;

        // Actualizar estrellas de fondo
        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > CONFIG.CANVAS.HEIGHT) {
                star.y = 0;
                star.x = Math.random() * CONFIG.CANVAS.WIDTH;
            }
            star.alpha = 0.3 + Math.sin(this.titleAnimation * 2 + star.x) * 0.3;
        });

        // Actualizar animaciones de hover
        this.hoverAnimation.forEach((val, i) => {
            if (i === this.selectedOption) {
                this.hoverAnimation[i] = Math.min(1, val + deltaTime * 4);
            } else {
                this.hoverAnimation[i] = Math.max(0, val - deltaTime * 4);
            }
        });
    }

    draw(ctx) {
        // Fondo oscuro con gradiente
        const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS.HEIGHT);
        gradient.addColorStop(0, '#0a0e27');
        gradient.addColorStop(1, '#1a1e3f');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);

        // Dibujar estrellas
        this.stars.forEach(star => {
            ctx.save();
            ctx.globalAlpha = star.alpha;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(star.x, star.y, star.size, star.size);
            ctx.restore();
        });

        // Título con efecto glow
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Sombra del título
        ctx.shadowBlur = 30;
        ctx.shadowColor = CONFIG.UI.PRIMARY_COLOR;

        // Título principal
        ctx.font = `bold 80px ${CONFIG.UI.FONT_FAMILY}`;
        const titleY = 150 + Math.sin(this.titleAnimation) * 10;

        // Gradiente de texto
        const titleGradient = ctx.createLinearGradient(
            CONFIG.CANVAS.WIDTH / 2 - 200,
            titleY,
            CONFIG.CANVAS.WIDTH / 2 + 200,
            titleY
        );
        titleGradient.addColorStop(0, CONFIG.UI.PRIMARY_COLOR);
        titleGradient.addColorStop(0.5, '#ffffff');
        titleGradient.addColorStop(1, CONFIG.UI.PRIMARY_COLOR);

        ctx.fillStyle = titleGradient;
        ctx.fillText('RALLY X', CONFIG.CANVAS.WIDTH / 2, titleY);

        // Subtítulo
        ctx.shadowBlur = 10;
        ctx.font = `20px ${CONFIG.UI.FONT_FAMILY}`;
        ctx.fillStyle = '#888';
        ctx.fillText('PROFESSIONAL EDITION', CONFIG.CANVAS.WIDTH / 2, titleY + 60);

        ctx.restore();

        // Menú de opciones
        const startY = 350;
        const spacing = 80;

        this.options.forEach((option, index) => {
            const y = startY + index * spacing;
            const isSelected = index === this.selectedOption;
            const hoverAmount = this.hoverAnimation[index];

            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Fondo de la opción (glassmorphism)
            if (isSelected) {
                ctx.fillStyle = `rgba(0, 212, 255, ${0.1 + hoverAmount * 0.15})`;
                ctx.strokeStyle = CONFIG.UI.PRIMARY_COLOR;
                ctx.lineWidth = 2 + hoverAmount * 2;
            } else {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.lineWidth = 1;
            }

            const boxWidth = 400 + hoverAmount * 40;
            const boxHeight = 60;
            const boxX = CONFIG.CANVAS.WIDTH / 2 - boxWidth / 2;
            const boxY = y - boxHeight / 2;

            // Dibujar caja con bordes redondeados
            this.roundRect(ctx, boxX, boxY, boxWidth, boxHeight, 10);
            ctx.fill();
            ctx.stroke();

            // Texto de la opción
            ctx.font = `${isSelected ? 'bold' : ''} ${24 + hoverAmount * 4}px ${CONFIG.UI.FONT_FAMILY}`;
            ctx.fillStyle = isSelected ? '#ffffff' : '#aaa';

            if (isSelected) {
                ctx.shadowBlur = 20;
                ctx.shadowColor = CONFIG.UI.PRIMARY_COLOR;
            }

            ctx.fillText(option, CONFIG.CANVAS.WIDTH / 2, y);

            ctx.restore();

            // Indicador de selección (flecha)
            if (isSelected) {
                ctx.save();
                ctx.fillStyle = CONFIG.UI.PRIMARY_COLOR;
                const arrowX = boxX - 30 - Math.sin(this.titleAnimation * 3) * 5;
                ctx.beginPath();
                ctx.moveTo(arrowX, y);
                ctx.lineTo(arrowX - 10, y - 8);
                ctx.lineTo(arrowX - 10, y + 8);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
        });

        // High Score
        const highScore = Storage.get(CONFIG.STORAGE_KEYS.HIGH_SCORE, 0);
        ctx.save();
        ctx.font = `16px ${CONFIG.UI.FONT_FAMILY}`;
        ctx.fillStyle = CONFIG.UI.WARNING_COLOR;
        ctx.textAlign = 'center';
        ctx.fillText(`HIGH SCORE: ${highScore.toLocaleString()}`, CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT - 50);
        ctx.restore();

        // Controles
        ctx.save();
        ctx.font = `14px ${CONFIG.UI.FONT_FAMILY}`;
        ctx.fillStyle = '#666';
        ctx.textAlign = 'center';
        ctx.fillText('↑↓ Navegar  |  ENTER Seleccionar', CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT - 20);
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
            case 0: // JUGAR
                this.game.startGame();
                break;
            case 1: // LOGROS
                this.showAchievements();
                break;
            case 2: // CONFIGURACIÓN
                this.showSettings();
                break;
            case 3: // CRÉDITOS
                this.showCredits();
                break;
        }
    }

    showAchievements() {
        // Mostrar pantalla de logros (simplificado)
        alert('Logros\n\n' +
              this.game.achievements.getAllAchievements()
                  .map(a => `${a.icon} ${a.name}: ${a.unlocked ? '✓' : '✗'}`)
                  .join('\n'));
    }

    showSettings() {
        // Configuración simple
        const muted = !this.game.audio.enabled;
        const toggleAudio = confirm('Audio está ' + (muted ? 'DESACTIVADO' : 'ACTIVADO') + '\n\n¿Cambiar estado?');
        if (toggleAudio) {
            this.game.audio.toggle();
        }
    }

    showCredits() {
        alert('RALLY X - Professional Edition\n\n' +
              'Desarrollado con ❤️ usando:\n' +
              '• HTML5 Canvas\n' +
              '• JavaScript ES6+\n' +
              '• Web Audio API\n\n' +
              '© 2025 - Versión Profesional');
    }

    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    exit() {
        console.log('Saliendo del menú');
    }
}

export default MenuState;
