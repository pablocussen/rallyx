/**
 * Sistema de Partículas
 * Efectos visuales profesionales
 */

export class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 500;
    }

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
            if (this.particles.length >= this.maxParticles) break;

            const angle = Math.random() * settings.spread - settings.spread / 2;
            const speed = settings.speed * (0.5 + Math.random() * 0.5);

            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: settings.color,
                size: settings.size * (0.5 + Math.random() * 0.5),
                life: settings.life,
                maxLife: settings.life,
                gravity: settings.gravity,
                alpha: 1
            });
        }
    }

    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            // Actualizar posición
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;

            // Actualizar vida y alpha
            p.life -= deltaTime;
            p.alpha = Math.max(0, p.life / p.maxLife);

            // Remover partículas muertas
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        this.particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
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

    clear() {
        this.particles = [];
    }

    getCount() {
        return this.particles.length;
    }
}

export default ParticleSystem;
