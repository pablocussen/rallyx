/**
 * Estado de Pausa
 * Overlay con opciones
 */

import { CONFIG } from '../config.js';

export class PauseState {
    constructor(game) {
        this.game = game;
        this.selectedOption = 0;
        this.options = ['CONTINUAR', 'REINICIAR', 'MENÚ PRINCIPAL'];
    }

    enter() {
        console.log('Juego pausado');
    }

    update(deltaTime) {
        // No actualizar gameplay, solo animaciones del menú si es necesario
    }

    draw(ctx) {
        // Dibujar el estado del juego con overlay oscuro
        const gameState = this.game.stateManager.getState('game');
        if (gameState) {
            gameState.draw(ctx);
        }

        // Overlay oscuro
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);

        // Título de pausa
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `bold 60px ${CONFIG.UI.FONT_FAMILY}`;
        ctx.fillStyle = CONFIG.UI.PRIMARY_COLOR;
        ctx.shadowBlur = 30;
        ctx.shadowColor = CONFIG.UI.PRIMARY_COLOR;
        ctx.fillText('PAUSA', CONFIG.CANVAS.WIDTH / 2, 150);

        // Opciones
        const startY = 300;
        const spacing = 70;

        this.options.forEach((option, index) => {
            const y = startY + index * spacing;
            const isSelected = index === this.selectedOption;

            // Fondo de opción
            if (isSelected) {
                ctx.fillStyle = 'rgba(0, 212, 255, 0.2)';
                ctx.fillRect(
                    CONFIG.CANVAS.WIDTH / 2 - 200,
                    y - 30,
                    400,
                    50
                );

                ctx.strokeStyle = CONFIG.UI.PRIMARY_COLOR;
                ctx.lineWidth = 2;
                ctx.strokeRect(
                    CONFIG.CANVAS.WIDTH / 2 - 200,
                    y - 30,
                    400,
                    50
                );
            }

            // Texto
            ctx.shadowBlur = isSelected ? 20 : 0;
            ctx.font = `${isSelected ? 'bold' : ''} 28px ${CONFIG.UI.FONT_FAMILY}`;
            ctx.fillStyle = isSelected ? '#ffffff' : '#aaa';
            ctx.fillText(option, CONFIG.CANVAS.WIDTH / 2, y);
        });

        // Controles
        ctx.shadowBlur = 0;
        ctx.font = `16px ${CONFIG.UI.FONT_FAMILY}`;
        ctx.fillStyle = '#888';
        ctx.fillText(
            '↑↓ Navegar  |  ENTER Seleccionar  |  ESC Continuar',
            CONFIG.CANVAS.WIDTH / 2,
            CONFIG.CANVAS.HEIGHT - 40
        );

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
        } else if (input.isKeyDown(['Escape'])) {
            if (!this.escPressed) {
                this.game.setState('game');
                this.escPressed = true;
            }
        } else {
            this.keyPressed = false;
            this.enterPressed = false;
            this.escPressed = false;
        }
    }

    selectOption() {
        switch(this.selectedOption) {
            case 0: // CONTINUAR
                this.game.setState('game');
                break;
            case 1: // REINICIAR
                this.game.startGame();
                break;
            case 2: // MENÚ PRINCIPAL
                this.game.setState('menu');
                break;
        }
    }

    exit() {
        console.log('Saliendo de pausa');
    }
}

export default PauseState;
