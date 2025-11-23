/**
 * Sistema de Debug UI
 * Herramienta de desarrollo para monitorear y controlar el juego
 *
 * @class DebugUI
 * @description Panel de debug con:
 * - FPS y performance metrics
 * - Game state inspection
 * - Quick controls
 * - Console de comandos
 */

export class DebugUI {
    constructor(game) {
        this.game = game;
        this.enabled = false;
        this.visible = false;
        this.metrics = {
            fps: 0,
            frameTime: 0,
            updateTime: 0,
            drawTime: 0,
            particles: 0,
            entities: 0
        };

        this.history = {
            fps: [],
            frameTime: []
        };
        this.historyLength = 60; // 1 segundo a 60fps

        // Performance tracking
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.fpsUpdateInterval = 500; // ms
        this.lastFpsUpdate = performance.now();
    }

    /**
     * Activa/desactiva el debug UI
     */
    toggle() {
        this.visible = !this.visible;
        this.enabled = this.visible;

        if (this.visible) {
            this._createUI();
        } else {
            this._destroyUI();
        }
    }

    /**
     * Crea la interfaz de debug
     * @private
     */
    _createUI() {
        // Crear contenedor si no existe
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'debug-ui';
            this.container.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.85);
                color: #00ff00;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                padding: 15px;
                border-radius: 8px;
                border: 2px solid #00ff00;
                z-index: 10000;
                min-width: 300px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
            `;
            document.body.appendChild(this.container);
        }
    }

    /**
     * Destruye la interfaz de debug
     * @private
     */
    _destroyUI() {
        if (this.container) {
            document.body.removeChild(this.container);
            this.container = null;
        }
    }

    /**
     * Actualiza las métricas de performance
     * @param {number} deltaTime - Delta time en ms
     */
    update(deltaTime) {
        if (!this.enabled) return;

        const now = performance.now();
        this.frameCount++;

        // Actualizar FPS cada intervalo
        if (now - this.lastFpsUpdate >= this.fpsUpdateInterval) {
            this.metrics.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = now;

            // Actualizar historial
            this.history.fps.push(this.metrics.fps);
            if (this.history.fps.length > this.historyLength) {
                this.history.fps.shift();
            }
        }

        // Métricas de frame
        this.metrics.frameTime = deltaTime;
        this.history.frameTime.push(deltaTime);
        if (this.history.frameTime.length > this.historyLength) {
            this.history.frameTime.shift();
        }

        // Actualizar UI si es visible
        if (this.visible) {
            this._updateUI();
        }
    }

    /**
     * Recopila métricas del juego
     * @private
     */
    _collectMetrics() {
        const game = this.game;

        // Partículas
        if (game.particles) {
            this.metrics.particles = game.particles.activeParticles?.filter(p => p.active).length || 0;
        }

        // Entidades (si estamos en GameState)
        if (game.currentState?.enemies && game.currentState?.flags) {
            this.metrics.entities =
                1 + // player
                game.currentState.enemies.length +
                game.currentState.flags.length +
                (game.currentState.powerups?.length || 0);
        }
    }

    /**
     * Actualiza la UI con métricas actuales
     * @private
     */
    _updateUI() {
        if (!this.container) return;

        this._collectMetrics();

        const avgFps = this._average(this.history.fps);
        const minFps = Math.min(...this.history.fps);
        const maxFps = Math.max(...this.history.fps);
        const avgFrameTime = this._average(this.history.frameTime).toFixed(2);

        let html = '<h3 style="margin: 0 0 10px 0; color: #00ff00; border-bottom: 1px solid #00ff00; padding-bottom: 5px;">🐛 DEBUG MODE</h3>';

        // Performance
        html += '<div style="margin-bottom: 10px;">';
        html += '<strong>⚡ PERFORMANCE</strong><br>';
        html += `FPS: ${this.metrics.fps} (avg: ${avgFps.toFixed(0)}, min: ${minFps}, max: ${maxFps})<br>`;
        html += `Frame Time: ${avgFrameTime}ms<br>`;
        html += this._getFPSBar(this.metrics.fps);
        html += '</div>';

        // Game State
        html += '<div style="margin-bottom: 10px;">';
        html += '<strong>🎮 GAME STATE</strong><br>';
        html += `State: ${this.game.currentStateName || 'Unknown'}<br>`;
        if (this.game.currentState?.level) {
            html += `Level: ${this.game.currentState.level}<br>`;
        }
        if (this.game.score) {
            html += `Score: ${this.game.score.score.toLocaleString()}<br>`;
        }
        html += '</div>';

        // Entities
        html += '<div style="margin-bottom: 10px;">';
        html += '<strong>📦 ENTITIES</strong><br>';
        html += `Particles: ${this.metrics.particles}<br>`;
        html += `Total Entities: ${this.metrics.entities}<br>`;
        html += '</div>';

        // Memory (si está disponible)
        if (performance.memory) {
            const usedMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(1);
            const totalMB = (performance.memory.totalJSHeapSize / 1048576).toFixed(1);
            html += '<div style="margin-bottom: 10px;">';
            html += '<strong>💾 MEMORY</strong><br>';
            html += `Used: ${usedMB} MB / ${totalMB} MB<br>`;
            html += '</div>';
        }

        // Quick Controls
        html += '<div style="margin-bottom: 10px; border-top: 1px solid #00ff00; padding-top: 10px;">';
        html += '<strong>🎛️ QUICK CONTROLS</strong><br>';
        html += '<div style="display: flex; gap: 5px; flex-wrap: wrap; margin-top: 5px;">';
        html += this._button('God Mode', () => this._toggleGodMode());
        html += this._button('+1000 Score', () => this._addScore(1000));
        html += this._button('Spawn Enemy', () => this._spawnEnemy());
        html += this._button('Clear Particles', () => this._clearParticles());
        html += '</div>';
        html += '</div>';

        // Comandos
        html += '<div style="font-size: 10px; color: #888; margin-top: 10px; padding-top: 10px; border-top: 1px solid #444;">';
        html += 'Press ~ to toggle | ESC to close<br>';
        html += 'Console: window.game for access';
        html += '</div>';

        this.container.innerHTML = html;
    }

    /**
     * Genera una barra visual de FPS
     * @param {number} fps - FPS actual
     * @returns {string} HTML de la barra
     * @private
     */
    _getFPSBar(fps) {
        const percentage = Math.min(100, (fps / 60) * 100);
        const color = fps >= 55 ? '#00ff00' : fps >= 30 ? '#ffaa00' : '#ff0000';

        return `
            <div style="width: 100%; height: 10px; background: #333; border-radius: 3px; overflow: hidden; margin-top: 5px;">
                <div style="width: ${percentage}%; height: 100%; background: ${color}; transition: width 0.3s;"></div>
            </div>
        `;
    }

    /**
     * Genera un botón HTML
     * @param {string} label - Texto del botón
     * @param {Function} onclick - Función al hacer click
     * @returns {string} HTML del botón
     * @private
     */
    _button(label, onclick) {
        const id = 'btn-' + label.replace(/\s+/g, '-').toLowerCase();

        // Agregar event listener después del render
        setTimeout(() => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.onclick = onclick;
            }
        }, 0);

        return `<button id="${id}" style="
            background: #003300;
            color: #00ff00;
            border: 1px solid #00ff00;
            padding: 5px 10px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 10px;
            font-family: inherit;
        ">${label}</button>`;
    }

    /**
     * Calcula promedio de un array
     * @param {Array<number>} arr - Array de números
     * @returns {number} Promedio
     * @private
     */
    _average(arr) {
        if (arr.length === 0) return 0;
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    }

    // Quick Control Actions
    _toggleGodMode() {
        if (this.game.currentState?.player) {
            this.game.currentState.player.invulnerable = !this.game.currentState.player.invulnerable;
            console.log('God Mode:', this.game.currentState.player.invulnerable ? 'ON' : 'OFF');
        }
    }

    _addScore(amount) {
        if (this.game.score) {
            this.game.score.addScore(amount);
            console.log(`Added ${amount} points`);
        }
    }

    _spawnEnemy() {
        if (this.game.currentState?.spawnEnemy) {
            this.game.currentState.spawnEnemy();
            console.log('Enemy spawned');
        }
    }

    _clearParticles() {
        if (this.game.particles) {
            this.game.particles.activeParticles = [];
            console.log('Particles cleared');
        }
    }

    /**
     * Dibuja overlay de debug en el canvas
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    drawOverlay(ctx) {
        if (!this.enabled || !this.visible) return;

        // Mostrar bounds de entidades (opcional)
        if (this.game.currentState?.player) {
            this._drawEntityBounds(ctx, this.game.currentState.player, '#00ff00');
        }

        if (this.game.currentState?.enemies) {
            this.game.currentState.enemies.forEach(enemy => {
                this._drawEntityBounds(ctx, enemy, '#ff0000');
            });
        }
    }

    /**
     * Dibuja los bounds de una entidad
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {Object} entity - Entidad
     * @param {string} color - Color del bound
     * @private
     */
    _drawEntityBounds(ctx, entity, color) {
        const bounds = entity.getBounds ? entity.getBounds() : {
            x: entity.x,
            y: entity.y,
            width: entity.width || entity.size,
            height: entity.height || entity.size
        };

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);

        // Centro
        ctx.fillStyle = color;
        ctx.fillRect(
            bounds.x + bounds.width / 2 - 2,
            bounds.y + bounds.height / 2 - 2,
            4,
            4
        );
    }

    /**
     * Log de debug con estilo
     * @param {string} message - Mensaje
     * @param {string} level - Nivel (info, warn, error)
     */
    log(message, level = 'info') {
        const styles = {
            info: 'color: #00ff00',
            warn: 'color: #ffaa00',
            error: 'color: #ff0000'
        };

        console.log(`%c[DEBUG] ${message}`, styles[level]);
    }
}

export default DebugUI;
