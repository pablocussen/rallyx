/**
 * Sistema de Partículas con Object Pooling
 * Efectos visuales profesionales optimizados para performance
 *
 * @class ParticleSystem
 * @description Sistema de partículas con pooling para evitar allocation/deallocation constante
 * - Object pooling para reutilizar partículas
 * - No usa splice() para mejor performance
 * - Manejo eficiente de memoria
 */

export class ParticleSystem {
    constructor() {
        this.maxParticles = 500;
        this.pool = [];
        this.activeParticles = [];

        // Pre-crear pool de partículas
        this._initPool();
    }

    /**
     * Getter para compatibilidad con tests - devuelve solo partículas activas
     * @returns {Array} Array de partículas activas
     */
    get particles() {
        return this.activeParticles.filter(p => p.active);
    }

    /**
     * Inicializa el pool de partículas reutilizables
     * @private
     */
    _initPool() {
        for (let i = 0; i < this.maxParticles; i++) {
            this.pool.push(this._createParticle());
        }
    }

    /**
     * Crea una nueva partícula
     * @private
     */
    _createParticle() {
        return {
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            color: '#ffffff',
            size: 4,
            life: 0,
            maxLife: 1,
            gravity: 0,
            alpha: 1,
            active: false
        };
    }

    /**
     * Obtiene una partícula del pool o crea una nueva
     * @private
     */
    _getParticle() {
        // Buscar partícula inactiva en el pool
        for (let i = 0; i < this.pool.length; i++) {
            if (!this.pool[i].active) {
                return this.pool[i];
            }
        }

        // Si no hay disponibles, buscar en activeParticles una ya muerta
        for (let i = 0; i < this.activeParticles.length; i++) {
            if (!this.activeParticles[i].active) {
                return this.activeParticles[i];
            }
        }

        return null; // Pool lleno
    }

    /**
     * Emite partículas desde una posición
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @param {Object} config - Configuración de emisión
     */
    emit(x, y, config = {}) {
        const defaults = {
            count: 10,
            color: '#ffffff',
            speed: 3,
            size: 4,
            life: 1,
            gravity: 0.1,
            spread: Math.PI * 2
        };

        const settings = { ...defaults, ...config };

        for (let i = 0; i < settings.count; i++) {
            // Verificar límite máximo de partículas
            const currentActive = this.activeParticles.filter(p => p.active).length;
            if (currentActive >= this.maxParticles) break;

            const particle = this._getParticle();
            if (!particle) break; // Pool lleno

            const angle = Math.random() * settings.spread - settings.spread / 2;
            const speed = settings.speed * (0.5 + Math.random() * 0.5);

            // Reutilizar partícula existente
            particle.x = x;
            particle.y = y;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.color = settings.color;
            particle.size = settings.size * (0.5 + Math.random() * 0.5);
            particle.life = settings.life;
            particle.maxLife = settings.life;
            particle.gravity = settings.gravity;
            particle.alpha = 1;
            particle.active = true;

            // Agregar a activeParticles si no está ya
            if (!this.activeParticles.includes(particle)) {
                this.activeParticles.push(particle);
            }
        }
    }

    /**
     * Actualiza todas las partículas activas
     * @param {number} deltaTime - Delta time en segundos
     */
    update(deltaTime) {
        // Iterar hacia atrás para poder desactivar partículas sin problemas
        for (let i = this.activeParticles.length - 1; i >= 0; i--) {
            const p = this.activeParticles[i];

            if (!p.active) continue;

            // Actualizar posición
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;

            // Actualizar vida y alpha
            p.life -= deltaTime;
            p.alpha = Math.max(0, p.life / p.maxLife);

            // Desactivar partículas muertas (no las removemos del array)
            if (p.life <= 0) {
                p.active = false;
            }
        }

        // Limpiar activeParticles cada cierto tiempo para evitar que crezca
        if (this.activeParticles.length > this.maxParticles * 0.8) {
            this.activeParticles = this.activeParticles.filter(p => p.active);
        }
    }

    /**
     * Dibuja todas las partículas activas
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    draw(ctx) {
        for (let i = 0; i < this.activeParticles.length; i++) {
            const p = this.activeParticles[i];
            if (!p.active) continue;

            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    /**
     * Obtiene estadísticas del sistema de partículas
     * @returns {Object} {active, pooled, total}
     */
    getStats() {
        const active = this.activeParticles.filter(p => p.active).length;
        return {
            active,
            pooled: this.pool.filter(p => !p.active).length,
            total: this.maxParticles
        };
    }

    // Efectos específicos
    explosion(x, y, color = '#ff4757') {
        this.emit(x, y, {
            count: 30,
            color,
            speed: 5,
            size: 5,
            life: 0.8,
            gravity: 0.15,
            spread: Math.PI * 2
        });
    }

    collect(x, y, color = '#ffd700') {
        this.emit(x, y, {
            count: 20,
            color,
            speed: 3,
            size: 4,
            life: 1,
            gravity: -0.1,
            spread: Math.PI * 2
        });
    }

    trail(x, y, color = 'rgba(0, 212, 255, 0.6)') {
        this.emit(x, y, {
            count: 3,
            color,
            speed: 0.5,
            size: 3,
            life: 0.5,
            gravity: 0,
            spread: Math.PI * 0.5
        });
    }

    powerupAura(x, y, color = '#00ff88') {
        this.emit(x, y, {
            count: 5,
            color,
            speed: 1,
            size: 3,
            life: 1.5,
            gravity: -0.05,
            spread: Math.PI * 2
        });
    }

    /**
     * Obtiene el número de partículas activas
     * @returns {number} Número de partículas activas
     */
    getCount() {
        return this.activeParticles.filter(p => p.active).length;
    }

    /**
     * Limpia todas las partículas
     */
    clear() {
        this.activeParticles.forEach(p => p.active = false);
        this.activeParticles = [];
    }
}

export default ParticleSystem;
