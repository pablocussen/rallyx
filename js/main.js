/**
 * RALLY X - Professional Edition
 * Archivo principal del juego
 */

import { CONFIG } from './config.js';
import { Input } from './utils/Input.js';
import Storage from './utils/Storage.js';
import { AudioManager } from './systems/AudioManager.js';
import { ParticleSystem } from './systems/ParticleSystem.js';
import { ScoreSystem } from './systems/ScoreSystem.js';
import { AchievementSystem } from './systems/AchievementSystem.js';
import { StateManager } from './systems/StateManager.js';
import { MenuState } from './states/MenuState.js';
import { GameState } from './states/GameState.js';
import GameStateEnhanced from './states/GameStateEnhanced.js'; // 🚀 Revolutionary Game State
import GameStateSimple from './states/GameStateSimple.js'; // 🧪 Simple test state
import { PauseState } from './states/PauseState.js';
import { GameOverState } from './states/GameOverState.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Configurar canvas
        this.canvas.width = CONFIG.CANVAS.WIDTH;
        this.canvas.height = CONFIG.CANVAS.HEIGHT;

        // Inicializar sistemas
        this.input = new Input();
        this.audio = new AudioManager();
        this.particles = new ParticleSystem();
        this.score = new ScoreSystem();
        this.achievements = new AchievementSystem();
        this.stateManager = new StateManager();

        // Registrar estados
        this.stateManager.register('menu', new MenuState(this));

        // Try to load GameStateEnhanced with detailed error handling
        try {
            console.log('🚀 Attempting to load GameStateEnhanced...');
            this.stateManager.register('game', new GameStateEnhanced(this));
            console.log('✅ GameStateEnhanced loaded successfully!');
        } catch (error) {
            console.error('❌ GameStateEnhanced FAILED to load:', error);
            console.error('Stack:', error.stack);
            // Fallback to simple state
            console.warn('🔄 Falling back to GameStateSimple...');
            this.stateManager.register('game', new GameStateSimple(this));
        }

        this.stateManager.register('pause', new PauseState(this));
        this.stateManager.register('gameover', new GameOverState(this));

        // Variables de tiempo
        this.lastTime = 0;
        this.fps = 60;
        this.frameCount = 0;
        this.fpsTime = 0;

        // Estado inicial
        this.running = false;

        // Cargar configuración guardada
        this.loadSettings();

        // Inicializar
        this.init();
    }

    init() {
        console.log('🎮 Iniciando RALLY X - REVOLUTIONARY EDITION 2.0');
        console.log('🚀 11 Revolutionary Systems Active');
        console.log('Canvas:', this.canvas.width, 'x', this.canvas.height);

        // Empezar en el menú
        this.stateManager.setState('menu');

        // Iniciar loop
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.gameLoop(time));

        // Listeners adicionales
        this.setupEventListeners();

        console.log('✅ Juego iniciado correctamente');
    }

    setupEventListeners() {
        // Prevenir comportamiento por defecto de teclas
        window.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });

        // Manejo de visibilidad de la pestaña
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.stateManager.getCurrentState() === 'game') {
                this.stateManager.setState('pause');
            }
        });

        // Resize del canvas (mantener responsive)
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        this.handleResize();
    }

    handleResize() {
        // Obtener dimensiones de la ventana
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Calcular escala manteniendo aspect ratio
        const scaleX = windowWidth / CONFIG.CANVAS.WIDTH;
        const scaleY = windowHeight / CONFIG.CANVAS.HEIGHT;
        const scale = Math.min(scaleX, scaleY, 1); // No agrandar más del tamaño original

        // Aplicar escala al canvas
        this.canvas.style.width = `${CONFIG.CANVAS.WIDTH * scale}px`;
        this.canvas.style.height = `${CONFIG.CANVAS.HEIGHT * scale}px`;
    }

    gameLoop(currentTime) {
        if (!this.running) return;

        // Calcular deltaTime
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1); // Cap a 0.1s para evitar saltos
        this.lastTime = currentTime;

        // Calcular FPS
        this.frameCount++;
        this.fpsTime += deltaTime;
        if (this.fpsTime >= 1) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsTime = 0;
        }

        // Actualizar
        this.update(deltaTime);

        // Dibujar
        this.draw();

        // Siguiente frame
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        // Actualizar estado actual
        this.stateManager.update(deltaTime);

        // Manejar input
        this.stateManager.handleInput(this.input);
    }

    draw() {
        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Dibujar estado actual
        this.stateManager.draw(this.ctx);

        // Debug info
        if (CONFIG.DEBUG.SHOW_FPS) {
            this.drawDebugInfo();
        }
    }

    drawDebugInfo() {
        this.ctx.save();
        this.ctx.font = '14px monospace';
        this.ctx.fillStyle = '#00ff00';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';

        const debugInfo = [
            `FPS: ${this.fps}`,
            `State: ${this.stateManager.getCurrentState()}`,
            `Particles: ${this.particles.getCount()}`,
            `Score: ${this.score.score}`,
            `Combo: x${this.score.combo}`
        ];

        debugInfo.forEach((info, index) => {
            this.ctx.fillText(info, 10, 10 + index * 20);
        });

        this.ctx.restore();
    }

    // Métodos públicos para control del juego
    startGame(level = 1) {
        this.score.reset();
        this.stateManager.setState('game', { level });
    }

    setState(stateName, data = {}) {
        this.stateManager.setState(stateName, data);
    }

    togglePause() {
        const currentState = this.stateManager.getCurrentState();

        if (currentState === 'game') {
            this.stateManager.setState('pause');
        } else if (currentState === 'pause') {
            this.stateManager.setState('game');
        }
    }

    toggleAudio() {
        this.audio.toggle();
        this.saveSettings();
    }

    // Guardar y cargar configuración
    saveSettings() {
        const settings = {
            audioEnabled: this.audio.enabled,
            highScore: this.score.highScore
        };

        Storage.set(CONFIG.STORAGE_KEYS.SETTINGS, settings);
    }

    loadSettings() {
        const settings = Storage.get(CONFIG.STORAGE_KEYS.SETTINGS);

        if (settings) {
            if (settings.audioEnabled !== undefined) {
                this.audio.enabled = settings.audioEnabled;
                this.audio.mute(!settings.audioEnabled);
            }
        }

        // Cargar estadísticas
        this.score.loadStats();
    }

    // Cleanup
    destroy() {
        this.running = false;
        this.input.reset();
        this.particles.clear();
        console.log('🛑 Juego detenido');
    }
}

// Inicializar juego cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.game = new Game();
    });
} else {
    window.game = new Game();
}

// Exponer Game para debugging
window.Game = Game;
window.CONFIG = CONFIG;

export default Game;
