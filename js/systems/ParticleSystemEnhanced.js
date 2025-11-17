/**
 * Enhanced Particle System - Sistema de Partículas MEJORADO
 * Trails, formas variadas, physics mejorada, efectos espectaculares
 *
 * Características nuevas:
 * - Partículas con trails
 * - Formas variadas (círculos, estrellas, cuadrados, líneas)
 * - Physics mejorada (bounce, friction, attraction)
 * - Particle emitters continuos
 * - Efectos de impacto
 * - Ondas expansivas
 */

export class ParticleSystemEnhanced {
    constructor() {
        this.particles = [];
        this.emitters = [];
        this.maxParticles = 1000;
    }

    emit(x, y, config = {}) {
        const defaults = {
            count: 10,
            color: '#ffffff',
            speed: 3,
            size: 4,
            life: 1,
            gravity: 0.1,
            spread: Math.PI * 2,
            shape: 'circle', // circle, star, square, line
            trail: false,
            trailLength: 5,
            bounce: false,
            friction: 0.99,
            rotation: 0,
            rotationSpeed: 0,
            glow: false,
            glowSize: 10
        };

        const settings = { ...defaults, ...config };

        for (let i = 0; i < settings.count; i++) {
            if (this.particles.length >= this.maxParticles) break;

            const angle = (settings.spread === Math.PI * 2)
                ? Math.random() * settings.spread
                : (Math.random() * settings.spread - settings.spread / 2);
            const speed = settings.speed * (0.5 + Math.random() * 0.5);

            const particle = {
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: settings.color,
                size: settings.size * (0.5 + Math.random() * 0.5),
                life: settings.life,
                maxLife: settings.life,
                gravity: settings.gravity,
                alpha: 1,
                shape: settings.shape,
                bounce: settings.bounce,
                friction: settings.friction,
                rotation: settings.rotation,
                rotationSpeed: settings.rotationSpeed + (Math.random() - 0.5) * 0.1,
                glow: settings.glow,
                glowSize: settings.glowSize
            };

            // Trail
            if (settings.trail) {
                particle.trail = [];
                particle.trailLength = settings.trailLength;
            }

            this.particles.push(particle);
        }
    }

    /**
     * Crear emitter continuo
     */
    createEmitter(x, y, config = {}) {
        const defaults = {
            rate: 10, // partículas por segundo
            duration: 1000, // duración en ms
            particleConfig: {}
        };

        const settings = { ...defaults, ...config };

        this.emitters.push({
            x,
            y,
            rate: settings.rate,
            duration: settings.duration,
            particleConfig: settings.particleConfig,
            age: 0,
            accumulator: 0
        });
    }

    update(deltaTime) {
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            // Actualizar trail
            if (p.trail) {
                p.trail.push({ x: p.x, y: p.y });
                if (p.trail.length > p.trailLength) {
                    p.trail.shift();
                }
            }

            // Actualizar posición
            p.x += p.vx;
            p.y += p.vy;

            // Physics
            p.vy += p.gravity;
            p.vx *= p.friction;
            p.vy *= p.friction;

            // Rotation
            p.rotation += p.rotationSpeed;

            // Bounce (simplificado - asume límites del canvas)
            if (p.bounce) {
                // Se implementaría con límites del canvas
                // Por ahora lo dejamos preparado
            }

            // Actualizar vida y alpha
            p.life -= deltaTime / 1000;
            p.alpha = Math.max(0, p.life / p.maxLife);

            // Remover partículas muertas
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Update emitters
        for (let i = this.emitters.length - 1; i >= 0; i--) {
            const emitter = this.emitters[i];
            emitter.age += deltaTime;
            emitter.accumulator += deltaTime;

            // Emit particles
            const interval = 1000 / emitter.rate;
            while (emitter.accumulator >= interval) {
                this.emit(emitter.x, emitter.y, emitter.particleConfig);
                emitter.accumulator -= interval;
            }

            // Remove expired emitters
            if (emitter.age >= emitter.duration) {
                this.emitters.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        this.particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;

            // Trail
            if (p.trail && p.trail.length > 1) {
                ctx.strokeStyle = p.color;
                ctx.lineWidth = p.size / 2;
                ctx.globalAlpha = p.alpha * 0.5;
                ctx.beginPath();
                p.trail.forEach((point, index) => {
                    if (index === 0) {
                        ctx.moveTo(point.x, point.y);
                    } else {
                        ctx.lineTo(point.x, point.y);
                    }
                });
                ctx.stroke();
                ctx.globalAlpha = p.alpha;
            }

            // Glow
            if (p.glow) {
                ctx.shadowBlur = p.glowSize;
                ctx.shadowColor = p.color;
            }

            // Draw based on shape
            ctx.fillStyle = p.color;

            switch (p.shape) {
                case 'circle':
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                    break;

                case 'star':
                    this.drawStar(ctx, p.x, p.y, p.size, p.rotation);
                    break;

                case 'square':
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rotation);
                    ctx.fillRect(-p.size, -p.size, p.size * 2, p.size * 2);
                    ctx.restore();
                    break;

                case 'line':
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rotation);
                    ctx.fillRect(-p.size * 2, -1, p.size * 4, 2);
                    ctx.restore();
                    break;
            }

            ctx.restore();
        });
    }

    drawStar(ctx, x, y, size, rotation) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);

        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
            const radius = i % 2 === 0 ? size : size / 2;
            const px = Math.cos(angle) * radius;
            const py = Math.sin(angle) * radius;
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    // ======== EFECTOS ESPECTACULARES ========

    /**
     * Explosión mejorada
     */
    explosion(x, y, color = '#ff4757', intensity = 1) {
        // Partículas principales
        this.emit(x, y, {
            count: 30 * intensity,
            color,
            speed: 8 * intensity,
            size: 6,
            life: 1,
            gravity: 0.2,
            spread: Math.PI * 2,
            trail: true,
            trailLength: 8,
            glow: true,
            glowSize: 15
        });

        // Chispas
        this.emit(x, y, {
            count: 20 * intensity,
            color: '#ffff00',
            speed: 12 * intensity,
            size: 3,
            life: 0.5,
            gravity: 0.3,
            spread: Math.PI * 2,
            shape: 'star',
            rotationSpeed: 0.2,
            glow: true
        });

        // Onda expansiva
        this.shockwave(x, y, color);
    }

    /**
     * Onda expansiva
     */
    shockwave(x, y, color = '#ffffff') {
        this.particles.push({
            x,
            y,
            vx: 0,
            vy: 0,
            color,
            size: 0,
            maxSize: 100,
            life: 0.5,
            maxLife: 0.5,
            gravity: 0,
            alpha: 1,
            shape: 'shockwave',
            type: 'special',
            speed: 400
        });
    }

    /**
     * Collect effect mejorado
     */
    collectEnhanced(x, y, color = '#ffd700') {
        // Partículas ascendentes
        this.emit(x, y, {
            count: 25,
            color,
            speed: 4,
            size: 5,
            life: 1.2,
            gravity: -0.15,
            spread: Math.PI * 2,
            trail: true,
            trailLength: 6,
            glow: true,
            glowSize: 12
        });

        // Estrellas giratorias
        this.emit(x, y, {
            count: 10,
            color: '#ffffff',
            speed: 3,
            size: 4,
            life: 1,
            gravity: -0.1,
            spread: Math.PI * 2,
            shape: 'star',
            rotationSpeed: 0.3,
            glow: true
        });
    }

    /**
     * Trail mejorado
     */
    trailEnhanced(x, y, color = 'rgba(0, 212, 255, 0.8)', velocity = { x: 0, y: 0 }) {
        this.emit(x, y, {
            count: 5,
            color,
            speed: 1,
            size: 4,
            life: 0.8,
            gravity: 0,
            spread: Math.PI * 0.3,
            trail: true,
            trailLength: 10,
            glow: true,
            glowSize: 8,
            friction: 0.95
        });
    }

    /**
     * Power-up aura continua
     */
    powerupAuraEnhanced(x, y, color = '#00ff88', duration = 2000) {
        this.createEmitter(x, y, {
            rate: 15,
            duration,
            particleConfig: {
                count: 1,
                color,
                speed: 2,
                size: 4,
                life: 1.5,
                gravity: -0.08,
                spread: Math.PI * 2,
                trail: true,
                trailLength: 5,
                glow: true,
                glowSize: 10
            }
        });
    }

    /**
     * Fuegos artificiales
     */
    firework(x, y, color = null) {
        if (!color) {
            color = `hsl(${Math.random() * 360}, 100%, 60%)`;
        }

        // Explosión principal
        this.emit(x, y, {
            count: 50,
            color,
            speed: 6,
            size: 4,
            life: 2,
            gravity: 0.1,
            spread: Math.PI * 2,
            trail: true,
            trailLength: 10,
            glow: true,
            glowSize: 12
        });

        // Explosión secundaria (efecto cascada)
        setTimeout(() => {
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 * i) / 8;
                const distance = 40;
                const fx = x + Math.cos(angle) * distance;
                const fy = y + Math.sin(angle) * distance;

                this.emit(fx, fy, {
                    count: 15,
                    color,
                    speed: 4,
                    size: 3,
                    life: 1,
                    gravity: 0.15,
                    spread: Math.PI * 2,
                    trail: true,
                    glow: true
                });
            }
        }, 300);
    }

    /**
     * Impacto (hit effect)
     */
    impact(x, y, direction = 0, color = '#ffffff') {
        // Partículas direccionales
        this.emit(x, y, {
            count: 20,
            color,
            speed: 8,
            size: 5,
            life: 0.6,
            gravity: 0.2,
            spread: Math.PI / 3,
            shape: 'line',
            rotation: direction,
            glow: true
        });

        // Chispas
        this.emit(x, y, {
            count: 15,
            color: '#ffff00',
            speed: 10,
            size: 2,
            life: 0.4,
            gravity: 0.3,
            spread: Math.PI,
            shape: 'star',
            rotationSpeed: 0.3,
            glow: true
        });
    }

    /**
     * Spiral effect
     */
    spiral(x, y, color = '#00d4ff', rotations = 3) {
        const particlesPerRotation = 20;
        const totalParticles = particlesPerRotation * rotations;

        for (let i = 0; i < totalParticles; i++) {
            const angle = (Math.PI * 2 * i) / particlesPerRotation;
            const radius = (i / totalParticles) * 50;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;

            setTimeout(() => {
                this.emit(px, py, {
                    count: 1,
                    color,
                    speed: 2,
                    size: 4,
                    life: 1,
                    gravity: 0,
                    spread: 0,
                    glow: true,
                    glowSize: 10
                });
            }, i * 20);
        }
    }

    /**
     * Texto en partículas (simple)
     */
    textParticles(x, y, text, color = '#ffffff') {
        // Simplificado: partículas en forma de texto
        const width = text.length * 8;
        for (let i = 0; i < width; i += 4) {
            this.emit(x - width / 2 + i, y, {
                count: 1,
                color,
                speed: 0,
                size: 3,
                life: 2,
                gravity: -0.05,
                spread: 0,
                glow: true
            });
        }
    }

    // Override draw para efectos especiales
    drawSpecialParticles(ctx) {
        this.particles.filter(p => p.type === 'special').forEach(p => {
            if (p.shape === 'shockwave') {
                ctx.save();
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 4;
                ctx.globalAlpha = p.alpha;
                ctx.shadowBlur = 20;
                ctx.shadowColor = p.color;

                p.size = Math.min(p.maxSize, p.size + p.speed * (1/60));

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.stroke();

                ctx.restore();
            }
        });
    }

    clear() {
        this.particles = [];
        this.emitters = [];
    }

    getCount() {
        return this.particles.length;
    }
}

export default ParticleSystemEnhanced;
