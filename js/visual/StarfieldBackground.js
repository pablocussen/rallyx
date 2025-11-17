/**
 * Starfield Background - Fondo Estelar Animado IMPRESIONANTE
 * Parallax, nebulosas, estrellas titilantes, efectos de velocidad
 *
 * Características:
 * - 3 capas de parallax (cercanas, medias, lejanas)
 * - Estrellas titilantes con colores
 * - Nebulosas con gradientes animados
 * - Speed lines cuando vas rápido
 * - Meteoros ocasionales
 * - Efectos de warp en FEVER MODE
 */

export class StarfieldBackground {
    constructor(width, height) {
        this.width = width;
        this.height = height;

        // Capas de estrellas (parallax)
        this.layers = [
            { stars: [], speed: 0.3, size: 1, count: 100, color: '#ffffff', twinkle: true },
            { stars: [], speed: 0.6, size: 1.5, count: 60, color: '#aaccff', twinkle: true },
            { stars: [], speed: 1.0, size: 2, count: 40, color: '#ffddaa', twinkle: false }
        ];

        // Nebulosas de fondo
        this.nebulae = [];
        this.nebulaCount = 5;

        // Meteoros
        this.meteors = [];
        this.meteorSpawnChance = 0.001; // 0.1% por frame

        // Speed lines (cuando vas rápido)
        this.speedLines = [];
        this.speedLinesActive = false;

        // Warp effect (FEVER MODE)
        this.warpActive = false;
        this.warpLines = [];

        // Animation
        this.time = 0;

        this.init();
    }

    init() {
        // Generar estrellas para cada capa
        this.layers.forEach(layer => {
            for (let i = 0; i < layer.count; i++) {
                layer.stars.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    alpha: Math.random() * 0.5 + 0.5,
                    twinkleSpeed: Math.random() * 0.02 + 0.01,
                    twinklePhase: Math.random() * Math.PI * 2
                });
            }
        });

        // Generar nebulosas
        for (let i = 0; i < this.nebulaCount; i++) {
            this.nebulae.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 200 + 100,
                color1: this.randomNebulaColor(),
                color2: this.randomNebulaColor(),
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.001,
                pulsePhase: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.005 + 0.002
            });
        }
    }

    randomNebulaColor() {
        const colors = [
            'rgba(100, 50, 200, 0.05)',
            'rgba(200, 50, 100, 0.05)',
            'rgba(50, 100, 200, 0.05)',
            'rgba(200, 100, 50, 0.05)',
            'rgba(50, 200, 150, 0.05)'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update(deltaTime, playerSpeed = 0, feverMode = false) {
        this.time += deltaTime;

        // Actualizar estrellas (parallax)
        this.layers.forEach(layer => {
            layer.stars.forEach(star => {
                // Movimiento parallax
                star.y += layer.speed * (1 + playerSpeed * 0.1) * deltaTime * 0.06;

                // Wrap around
                if (star.y > this.height) {
                    star.y = 0;
                    star.x = Math.random() * this.width;
                }

                // Twinkle
                if (layer.twinkle) {
                    star.twinklePhase += star.twinkleSpeed;
                    star.alpha = 0.3 + Math.sin(star.twinklePhase) * 0.4 + 0.3;
                }
            });
        });

        // Actualizar nebulosas
        this.nebulae.forEach(nebula => {
            nebula.rotation += nebula.rotationSpeed;
            nebula.pulsePhase += nebula.pulseSpeed;
            nebula.y += 0.05 * deltaTime * 0.06;

            if (nebula.y > this.height + nebula.radius) {
                nebula.y = -nebula.radius;
                nebula.x = Math.random() * this.width;
            }
        });

        // Speed lines cuando vas rápido
        this.speedLinesActive = playerSpeed > 5;
        if (this.speedLinesActive) {
            // Spawn new speed lines
            if (Math.random() < 0.3) {
                this.speedLines.push({
                    x: Math.random() * this.width,
                    y: 0,
                    length: Math.random() * 50 + 30,
                    speed: Math.random() * 10 + 15,
                    alpha: Math.random() * 0.5 + 0.5
                });
            }
        }

        // Update speed lines
        this.speedLines = this.speedLines.filter(line => {
            line.y += line.speed * deltaTime * 0.06;
            return line.y < this.height + line.length;
        });

        // Meteoros ocasionales
        if (Math.random() < this.meteorSpawnChance) {
            this.spawnMeteor();
        }

        // Update meteors
        this.meteors = this.meteors.filter(meteor => {
            meteor.x += meteor.vx * deltaTime * 0.06;
            meteor.y += meteor.vy * deltaTime * 0.06;
            meteor.life -= deltaTime;

            // Update trail
            meteor.trail.push({ x: meteor.x, y: meteor.y });
            if (meteor.trail.length > 20) {
                meteor.trail.shift();
            }

            return meteor.life > 0 &&
                   meteor.x > -100 && meteor.x < this.width + 100 &&
                   meteor.y > -100 && meteor.y < this.height + 100;
        });

        // Warp effect (FEVER MODE)
        this.warpActive = feverMode;
        if (this.warpActive) {
            // Spawn warp lines
            if (Math.random() < 0.2) {
                this.warpLines.push({
                    x: Math.random() * this.width,
                    y: 0,
                    length: Math.random() * 100 + 100,
                    speed: Math.random() * 20 + 30,
                    width: Math.random() * 3 + 2,
                    alpha: Math.random() * 0.7 + 0.3,
                    color: `hsl(${180 + Math.random() * 60}, 100%, 70%)`
                });
            }
        }

        // Update warp lines
        this.warpLines = this.warpLines.filter(line => {
            line.y += line.speed * deltaTime * 0.06;
            line.alpha -= 0.01;
            return line.y < this.height + line.length && line.alpha > 0;
        });
    }

    spawnMeteor() {
        const side = Math.random() < 0.5 ? 'left' : 'top';
        const meteor = {
            x: side === 'left' ? 0 : Math.random() * this.width,
            y: side === 'left' ? Math.random() * this.height : 0,
            vx: Math.random() * 8 + 5,
            vy: Math.random() * 8 + 5,
            size: Math.random() * 3 + 2,
            life: 3000,
            trail: [],
            color: Math.random() < 0.5 ? '#ffaa00' : '#ff6600'
        };

        this.meteors.push(meteor);
    }

    draw(ctx) {
        // Dibujar nebulosas primero (más atrás)
        this.drawNebulae(ctx);

        // Dibujar estrellas (3 capas)
        this.drawStars(ctx);

        // Dibujar meteoros
        this.drawMeteors(ctx);

        // Dibujar speed lines
        if (this.speedLinesActive) {
            this.drawSpeedLines(ctx);
        }

        // Dibujar warp effect
        if (this.warpActive) {
            this.drawWarpEffect(ctx);
        }
    }

    drawNebulae(ctx) {
        ctx.save();

        this.nebulae.forEach(nebula => {
            const pulse = Math.sin(nebula.pulsePhase) * 0.3 + 0.7;
            const radius = nebula.radius * pulse;

            ctx.save();
            ctx.translate(nebula.x, nebula.y);
            ctx.rotate(nebula.rotation);

            // Gradiente radial
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
            gradient.addColorStop(0, nebula.color1);
            gradient.addColorStop(0.5, nebula.color2);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(-radius, -radius, radius * 2, radius * 2);

            ctx.restore();
        });

        ctx.restore();
    }

    drawStars(ctx) {
        ctx.save();

        this.layers.forEach(layer => {
            layer.stars.forEach(star => {
                ctx.fillStyle = layer.color;
                ctx.globalAlpha = star.alpha;

                // Estrella como punto brillante
                ctx.beginPath();
                ctx.arc(star.x, star.y, layer.size, 0, Math.PI * 2);
                ctx.fill();

                // Brillo extra para estrellas grandes
                if (layer.size > 1.5) {
                    ctx.globalAlpha = star.alpha * 0.3;
                    ctx.beginPath();
                    ctx.arc(star.x, star.y, layer.size * 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        });

        ctx.globalAlpha = 1;
        ctx.restore();
    }

    drawMeteors(ctx) {
        ctx.save();

        this.meteors.forEach(meteor => {
            // Trail
            ctx.strokeStyle = meteor.color;
            ctx.lineWidth = meteor.size;
            ctx.globalAlpha = 0.5;

            ctx.beginPath();
            meteor.trail.forEach((point, index) => {
                if (index === 0) {
                    ctx.moveTo(point.x, point.y);
                } else {
                    ctx.lineTo(point.x, point.y);
                }
                ctx.globalAlpha = 0.5 * (index / meteor.trail.length);
            });
            ctx.stroke();

            // Head
            ctx.globalAlpha = 1;
            ctx.fillStyle = meteor.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = meteor.color;

            ctx.beginPath();
            ctx.arc(meteor.x, meteor.y, meteor.size, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 0;
        });

        ctx.globalAlpha = 1;
        ctx.restore();
    }

    drawSpeedLines(ctx) {
        ctx.save();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;

        this.speedLines.forEach(line => {
            ctx.globalAlpha = line.alpha;
            ctx.beginPath();
            ctx.moveTo(line.x, line.y);
            ctx.lineTo(line.x, line.y + line.length);
            ctx.stroke();
        });

        ctx.globalAlpha = 1;
        ctx.restore();
    }

    drawWarpEffect(ctx) {
        ctx.save();

        this.warpLines.forEach(line => {
            ctx.strokeStyle = line.color;
            ctx.lineWidth = line.width;
            ctx.globalAlpha = line.alpha;

            ctx.shadowBlur = 15;
            ctx.shadowColor = line.color;

            ctx.beginPath();
            ctx.moveTo(line.x, line.y);
            ctx.lineTo(line.x, line.y + line.length);
            ctx.stroke();
        });

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        ctx.restore();
    }

    // Efectos especiales que pueden ser llamados externamente
    flashNebula() {
        this.nebulae.forEach(nebula => {
            nebula.pulseSpeed *= 3;
            setTimeout(() => {
                nebula.pulseSpeed /= 3;
            }, 500);
        });
    }

    meteorShower(duration = 3000) {
        const interval = setInterval(() => {
            this.spawnMeteor();
        }, 100);

        setTimeout(() => {
            clearInterval(interval);
        }, duration);
    }
}

export default StarfieldBackground;
