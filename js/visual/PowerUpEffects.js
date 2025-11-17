/**
 * PowerUp Effects - Efectos Visuales ESPECTACULARES para Power-ups
 * Explosiones, auras, ondas, rayos, partículas avanzadas
 *
 * Características:
 * - Aura pulsante alrededor del jugador
 * - Ring expansion effects
 * - Lightning bolts
 * - Particle explosions
 * - Distortion effects
 * - Color trails
 */

export class PowerUpEffects {
    constructor() {
        this.activeEffects = [];
        this.time = 0;
    }

    update(deltaTime) {
        this.time += deltaTime;

        // Update all active effects
        this.activeEffects = this.activeEffects.filter(effect => {
            effect.age += deltaTime;
            effect.update(deltaTime);
            return effect.age < effect.duration;
        });
    }

    draw(ctx) {
        this.activeEffects.forEach(effect => {
            effect.draw(ctx);
        });
    }

    /**
     * Shield activation effect
     */
    shieldActivate(x, y) {
        this.activeEffects.push({
            type: 'shield',
            x, y,
            age: 0,
            duration: 500,
            rings: [
                { radius: 0, maxRadius: 80, speed: 0.5, alpha: 1 },
                { radius: 0, maxRadius: 100, speed: 0.4, alpha: 0.8 },
                { radius: 0, maxRadius: 120, speed: 0.3, alpha: 0.6 }
            ],
            color: '#00d4ff',
            update(dt) {
                this.rings.forEach(ring => {
                    ring.radius += ring.speed * dt * 0.6;
                    ring.alpha = Math.max(0, 1 - (ring.radius / ring.maxRadius));
                });
            },
            draw(ctx) {
                ctx.save();
                this.rings.forEach(ring => {
                    ctx.strokeStyle = this.color;
                    ctx.lineWidth = 4;
                    ctx.globalAlpha = ring.alpha;
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = this.color;

                    ctx.beginPath();
                    ctx.arc(this.x, this.y, ring.radius, 0, Math.PI * 2);
                    ctx.stroke();
                });
                ctx.restore();
            }
        });
    }

    /**
     * Speed boost effect
     */
    speedBoost(x, y) {
        const particleCount = 30;
        const particles = [];

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * 5,
                vy: Math.sin(angle) * 5,
                size: Math.random() * 3 + 2,
                life: 1,
                color: `hsl(${Math.random() * 60 + 180}, 100%, 70%)`
            });
        }

        this.activeEffects.push({
            type: 'speedBoost',
            x, y,
            age: 0,
            duration: 800,
            particles,
            update(dt) {
                this.particles.forEach(p => {
                    p.x += p.vx * dt * 0.06;
                    p.y += p.vy * dt * 0.06;
                    p.life -= dt / this.duration;
                    p.vx *= 0.98;
                    p.vy *= 0.98;
                });
            },
            draw(ctx) {
                ctx.save();
                this.particles.forEach(p => {
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = p.life;
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = p.color;

                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                });
                ctx.restore();
            }
        });
    }

    /**
     * Double points effect
     */
    doublePoints(x, y) {
        this.activeEffects.push({
            type: 'doublePoints',
            x, y,
            age: 0,
            duration: 1000,
            spirals: Array.from({ length: 3 }, (_, i) => ({
                angle: (Math.PI * 2 * i) / 3,
                radius: 0,
                maxRadius: 100,
                particles: []
            })),
            update(dt) {
                this.spirals.forEach(spiral => {
                    spiral.angle += 0.1 * dt * 0.001;
                    spiral.radius = Math.min(spiral.maxRadius, spiral.radius + dt * 0.15);

                    // Spawn particles along spiral
                    if (Math.random() < 0.3) {
                        const x = this.x + Math.cos(spiral.angle) * spiral.radius;
                        const y = this.y + Math.sin(spiral.angle) * spiral.radius;

                        spiral.particles.push({
                            x, y,
                            life: 1,
                            size: Math.random() * 2 + 1
                        });
                    }

                    // Update particles
                    spiral.particles = spiral.particles.filter(p => {
                        p.life -= dt / this.duration;
                        return p.life > 0;
                    });
                });
            },
            draw(ctx) {
                ctx.save();
                ctx.strokeStyle = '#ffdd00';
                ctx.fillStyle = '#ffdd00';
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#ffdd00';

                this.spirals.forEach(spiral => {
                    // Draw spiral trail
                    ctx.globalAlpha = 0.3;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    for (let r = 0; r <= spiral.radius; r += 5) {
                        const a = spiral.angle - (spiral.radius - r) * 0.05;
                        const x = this.x + Math.cos(a) * r;
                        const y = this.y + Math.sin(a) * r;
                        if (r === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                    }
                    ctx.stroke();

                    // Draw particles
                    spiral.particles.forEach(p => {
                        ctx.globalAlpha = p.life;
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                        ctx.fill();
                    });
                });

                ctx.restore();
            }
        });
    }

    /**
     * Magnet effect
     */
    magnet(x, y) {
        this.activeEffects.push({
            type: 'magnet',
            x, y,
            age: 0,
            duration: 600,
            pulseRadius: 0,
            maxPulseRadius: 150,
            lightningBolts: [],
            update(dt) {
                this.pulseRadius = (this.age / this.duration) * this.maxPulseRadius;

                // Spawn lightning bolts
                if (Math.random() < 0.2) {
                    const angle = Math.random() * Math.PI * 2;
                    this.lightningBolts.push({
                        angle,
                        length: Math.random() * 50 + 30,
                        segments: 8,
                        life: 1,
                        color: '#ff00ff'
                    });
                }

                // Update bolts
                this.lightningBolts = this.lightningBolts.filter(bolt => {
                    bolt.life -= dt / 200;
                    return bolt.life > 0;
                });
            },
            draw(ctx) {
                ctx.save();

                // Pulse ring
                ctx.strokeStyle = '#ff00ff';
                ctx.lineWidth = 3;
                ctx.globalAlpha = 1 - (this.pulseRadius / this.maxPulseRadius);
                ctx.shadowBlur = 25;
                ctx.shadowColor = '#ff00ff';

                ctx.beginPath();
                ctx.arc(this.x, this.y, this.pulseRadius, 0, Math.PI * 2);
                ctx.stroke();

                // Lightning bolts
                this.lightningBolts.forEach(bolt => {
                    ctx.strokeStyle = bolt.color;
                    ctx.lineWidth = 2;
                    ctx.globalAlpha = bolt.life;

                    ctx.beginPath();
                    let x = this.x;
                    let y = this.y;
                    ctx.moveTo(x, y);

                    for (let i = 0; i < bolt.segments; i++) {
                        x += Math.cos(bolt.angle) * (bolt.length / bolt.segments) + (Math.random() - 0.5) * 10;
                        y += Math.sin(bolt.angle) * (bolt.length / bolt.segments) + (Math.random() - 0.5) * 10;
                        ctx.lineTo(x, y);
                    }
                    ctx.stroke();
                });

                ctx.restore();
            }
        });
    }

    /**
     * Slow time effect
     */
    slowTime(x, y) {
        this.activeEffects.push({
            type: 'slowTime',
            x, y,
            age: 0,
            duration: 800,
            waves: [],
            waveInterval: 0,
            update(dt) {
                this.waveInterval += dt;

                if (this.waveInterval > 100) {
                    this.waves.push({
                        radius: 0,
                        maxRadius: 200,
                        speed: 0.3,
                        alpha: 1
                    });
                    this.waveInterval = 0;
                }

                this.waves = this.waves.filter(wave => {
                    wave.radius += wave.speed * dt * 0.6;
                    wave.alpha = Math.max(0, 1 - (wave.radius / wave.maxRadius));
                    return wave.radius < wave.maxRadius;
                });
            },
            draw(ctx) {
                ctx.save();

                this.waves.forEach(wave => {
                    ctx.strokeStyle = '#8800ff';
                    ctx.lineWidth = 4;
                    ctx.globalAlpha = wave.alpha;
                    ctx.shadowBlur = 30;
                    ctx.shadowColor = '#8800ff';
                    ctx.setLineDash([10, 10]);

                    ctx.beginPath();
                    ctx.arc(this.x, this.y, wave.radius, 0, Math.PI * 2);
                    ctx.stroke();
                });

                ctx.setLineDash([]);
                ctx.restore();
            }
        });
    }

    /**
     * Combo milestone celebration
     */
    comboMilestone(x, y, combo) {
        const particleCount = combo * 5;
        const particles = [];

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 3;
            particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 4 + 2,
                life: 1,
                color: `hsl(${Math.random() * 360}, 100%, 70%)`,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2
            });
        }

        this.activeEffects.push({
            type: 'comboMilestone',
            x, y,
            age: 0,
            duration: 1500,
            particles,
            explosionRing: { radius: 0, maxRadius: 150 },
            update(dt) {
                this.explosionRing.radius = Math.min(
                    this.explosionRing.maxRadius,
                    this.explosionRing.radius + dt * 0.4
                );

                this.particles.forEach(p => {
                    p.x += p.vx * dt * 0.06;
                    p.y += p.vy * dt * 0.06;
                    p.rotation += p.rotationSpeed;
                    p.life -= dt / this.duration;
                    p.vy += 0.1; // Gravity
                });
            },
            draw(ctx) {
                ctx.save();

                // Explosion ring
                const ringAlpha = 1 - (this.explosionRing.radius / this.explosionRing.maxRadius);
                ctx.strokeStyle = '#ffff00';
                ctx.lineWidth = 5;
                ctx.globalAlpha = ringAlpha;
                ctx.shadowBlur = 40;
                ctx.shadowColor = '#ffff00';

                ctx.beginPath();
                ctx.arc(this.x, this.y, this.explosionRing.radius, 0, Math.PI * 2);
                ctx.stroke();

                // Particles
                this.particles.forEach(p => {
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rotation);
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = p.life;
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = p.color;

                    // Star shape
                    ctx.beginPath();
                    for (let i = 0; i < 5; i++) {
                        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                        const radius = i % 2 === 0 ? p.size : p.size / 2;
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;
                        if (i === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                    }
                    ctx.closePath();
                    ctx.fill();

                    ctx.restore();
                });

                ctx.restore();
            }
        });
    }

    /**
     * Level complete celebration
     */
    levelComplete(x, y) {
        const fireworks = [];

        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const fx = x + (Math.random() - 0.5) * 200;
                const fy = y + (Math.random() - 0.5) * 100;
                this.firework(fx, fy);
            }, i * 200);
        }
    }

    firework(x, y) {
        const particleCount = 50;
        const particles = [];
        const color = `hsl(${Math.random() * 360}, 100%, 60%)`;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = Math.random() * 5 + 3;
            particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 3 + 1,
                life: 1,
                trail: []
            });
        }

        this.activeEffects.push({
            type: 'firework',
            x, y,
            age: 0,
            duration: 1000,
            particles,
            color,
            update(dt) {
                this.particles.forEach(p => {
                    p.x += p.vx * dt * 0.06;
                    p.y += p.vy * dt * 0.06;
                    p.vy += 0.15; // Gravity
                    p.life -= dt / this.duration;

                    // Trail
                    p.trail.push({ x: p.x, y: p.y });
                    if (p.trail.length > 10) {
                        p.trail.shift();
                    }
                });
            },
            draw(ctx) {
                ctx.save();
                ctx.strokeStyle = this.color;
                ctx.fillStyle = this.color;

                this.particles.forEach(p => {
                    // Trail
                    ctx.globalAlpha = p.life * 0.5;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    p.trail.forEach((point, index) => {
                        if (index === 0) {
                            ctx.moveTo(point.x, point.y);
                        } else {
                            ctx.lineTo(point.x, point.y);
                        }
                    });
                    ctx.stroke();

                    // Particle
                    ctx.globalAlpha = p.life;
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = this.color;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                });

                ctx.restore();
            }
        });
    }

    clear() {
        this.activeEffects = [];
    }
}

export default PowerUpEffects;
