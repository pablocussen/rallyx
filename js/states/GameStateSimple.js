/**
 * GameState SIMPLE para debugging
 * Sin efectos visuales espectaculares
 */

import { CONFIG } from '../config.js';

export class GameStateSimple {
    constructor(game) {
        this.game = game;
        console.log('✅ GameStateSimple constructor - OK');
    }

    enter(data = {}) {
        console.log('✅ GameStateSimple enter - OK');
    }

    update(deltaTime) {
        // Nada por ahora
    }

    draw(ctx) {
        ctx.fillStyle = '#0a0e27';
        ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);

        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME STATE WORKS!', CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT / 2);

        ctx.font = '24px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Press SPACE to return to menu', CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT / 2 + 50);
    }

    handleInput(input) {
        if (input.isKeyDown([' ', 'Space'])) {
            this.game.setState('menu');
        }
    }

    exit() {
        console.log('✅ GameStateSimple exit - OK');
    }
}

export default GameStateSimple;
