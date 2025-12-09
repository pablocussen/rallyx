/**
 * Entidad del Jugador
 * Control, movimiento, estado
 */

import { CONFIG } from '../config.js';
import { Collision } from '../utils/Collision.js';

export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.PLAYER.SIZE;
        this.height = CONFIG.PLAYER.SIZE;
        this.speed = CONFIG.PLAYER.BASE_SPEED;
        this.vx = 0;
        this.vy = 0;
        this.health = CONFIG.PLAYER.MAX_HEALTH;
        this.maxHealth = CONFIG.PLAYER.MAX_HEALTH;
        this.invincible = false;
        this.invincibleTimer = 0;
        this.trail = [];
        this.angle = 0;

        // Power-ups activos
        this.powerups = {
            speed: false,
            shield: false,
            slowTime: false,
            doublePoints: false,
            magnet: false
        };

        this.powerupTimers = {};

        // Dash system (nueva mecánica!)
        this.dashAvailable = true;
        this.dashCooldown = 0;
        this.isDashing = false;
        this.dashTimer = 0;
    }

    update(deltaTime, input, canvasWidth, canvasHeight) {
        // Obtener movimiento del input
        const movement = input.getMovement();

        // DASH SYSTEM - Detectar Space/Shift para dash
        if ((input.isKeyDown([' ', 'Shift']) || input.isKeyDown(['Space'])) && this.dashAvailable && !this.isDashing) {
            this.activateDash(movement.dx, movement.dy);
        }

        // Actualizar cooldown de dash
        if (!this.dashAvailable) {
            this.dashCooldown -= deltaTime * 1000;
            if (this.dashCooldown <= 0) {
                this.dashAvailable = true;
            }
        }

        // Actualizar estado de dash
        if (this.isDashing) {
            this.dashTimer -= deltaTime * 1000;
            if (this.dashTimer <= 0) {
                this.isDashing = false;
            }
        }

        // Aplicar aceleración (más fuerte si está dashing)
        const acceleration = this.isDashing ? CONFIG.PLAYER.ACCELERATION * 3 : CONFIG.PLAYER.ACCELERATION;
        this.vx += movement.dx * acceleration * this.speed;
        this.vy += movement.dy * acceleration * this.speed;

        // Aplicar fricción (menos fricción durante dash)
        const friction = this.isDashing ? 0.98 : CONFIG.PLAYER.FRICTION;
        this.vx *= friction;
        this.vy *= friction;

        // Limitar velocidad máxima
        let maxSpeed = this.powerups.speed ? CONFIG.PLAYER.MAX_SPEED * 1.5 : this.speed * 1.5;
        if (this.isDashing) {
            maxSpeed = CONFIG.PLAYER.DASH_SPEED;
        }
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

        if (currentSpeed > maxSpeed) {
            this.vx = (this.vx / currentSpeed) * maxSpeed;
            this.vy = (this.vy / currentSpeed) * maxSpeed;
        }

        // Actualizar posición
        this.x += this.vx;
        this.y += this.vy;

        // Colisión con bordes
        if (this.x < 0) {
            this.x = 0;
            this.vx = 0;
        }
        if (this.x + this.width > canvasWidth) {
            this.x = canvasWidth - this.width;
            this.vx = 0;
        }
        if (this.y < 0) {
            this.y = 0;
            this.vy = 0;
        }
        if (this.y + this.height > canvasHeight) {
            this.y = canvasHeight - this.height;
            this.vy = 0;
        }

        // Calcular ángulo de movimiento
        if (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1) {
            this.angle = Math.atan2(this.vy, this.vx);
        }

        // Actualizar trail
        if (currentSpeed > 1) {
            this.trail.push({
                x: this.x + this.width / 2,
                y: this.y + this.height / 2,
                alpha: 0.8
            });

            if (this.trail.length > CONFIG.PARTICLES.TRAIL.maxLength) {
                this.trail.shift();
            }
        }

        // Fade trail
        this.trail.forEach(t => {
            t.alpha -= CONFIG.PARTICLES.TRAIL.fadeSpeed;
        });
        this.trail = this.trail.filter(t => t.alpha > 0);

        // Actualizar invencibilidad
        if (this.invincible) {
            this.invincibleTimer -= deltaTime * 1000;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
            }
        }

        // Actualizar power-ups
        Object.keys(this.powerupTimers).forEach(key => {
            this.powerupTimers[key] -= deltaTime * 1000;
            if (this.powerupTimers[key] <= 0) {
                this.powerups[key] = false;
                delete this.powerupTimers[key];
            }
        });
    }

    draw(ctx) {
        // Dibujar trail (más intenso si está dashing)
        this.trail.forEach((t, i) => {
            ctx.save();
            const alpha = this.isDashing ? t.alpha * 0.8 : t.alpha * 0.5;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.isDashing ? '#00ffff' : CONFIG.PLAYER.TRAIL_COLOR;
            const size = this.isDashing ? (i / this.trail.length) * 15 : (i / this.trail.length) * 8;
            ctx.fillRect(t.x - size / 2, t.y - size / 2, size, size);
            ctx.restore();
        });

        // Dibujar aura de dash
        if (this.isDashing) {
            ctx.save();
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 4;
            ctx.globalAlpha = 0.6;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#00ffff';
            ctx.beginPath();
            ctx.arc(
                this.x + this.width / 2,
                this.y + this.height / 2,
                this.width / 2 + 12,
                0,
                Math.PI * 2
            );
            ctx.stroke();
            ctx.restore();
        }

        // Dibujar escudo si está activo
        if (this.powerups.shield) {
            ctx.save();
            ctx.strokeStyle = CONFIG.POWERUP.TYPES.SHIELD.color;
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(
                this.x + this.width / 2,
                this.y + this.height / 2,
                this.width / 2 + 8,
                0,
                Math.PI * 2
            );
            ctx.stroke();
            ctx.restore();
        }

        // Dibujar jugador
        ctx.save();

        // Efecto parpadeo si es invencible
        if (this.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        // Forma del jugador (triángulo apuntando en dirección del movimiento)
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.angle);

        // Glow si está dashing
        if (this.isDashing) {
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#00ffff';
        }

        // Gradiente (más brillante si está dashing)
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width / 2);
        const color1 = this.isDashing ? '#00ffff' : CONFIG.PLAYER.COLOR;
        const color2 = this.isDashing ? 'rgba(0, 255, 255, 0.5)' : 'rgba(0, 212, 255, 0.3)';
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(this.width / 2, 0);
        ctx.lineTo(-this.width / 2, -this.height / 2);
        ctx.lineTo(-this.width / 2, this.height / 2);
        ctx.closePath();
        ctx.fill();

        // Borde
        ctx.strokeStyle = this.isDashing ? '#00ffff' : '#ffffff';
        ctx.lineWidth = this.isDashing ? 3 : 2;
        ctx.stroke();

        ctx.restore();
    }

    takeDamage() {
        if (this.invincible || this.powerups.shield) {
            return false;
        }

        this.health--;
        this.invincible = true;
        this.invincibleTimer = CONFIG.PLAYER.INVINCIBILITY_TIME;

        return true;
    }

    heal(amount = 1) {
        this.health = Math.min(this.health + amount, this.maxHealth);
    }

    activatePowerup(type, duration) {
        this.powerups[type] = true;
        this.powerupTimers[type] = duration;
    }

    activateDash(dx, dy) {
        if (!this.dashAvailable || this.isDashing) return;

        this.isDashing = true;
        this.dashTimer = CONFIG.PLAYER.DASH_DURATION;
        this.dashAvailable = false;
        this.dashCooldown = CONFIG.PLAYER.DASH_COOLDOWN;

        // Aplicar impulso en la dirección del movimiento
        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
            const angle = Math.atan2(dy, dx);
            this.vx = Math.cos(angle) * CONFIG.PLAYER.DASH_SPEED;
            this.vy = Math.sin(angle) * CONFIG.PLAYER.DASH_SPEED;
        } else {
            // Si no hay dirección, dash hacia adelante (dirección actual)
            const currentAngle = this.angle || 0;
            this.vx = Math.cos(currentAngle) * CONFIG.PLAYER.DASH_SPEED;
            this.vy = Math.sin(currentAngle) * CONFIG.PLAYER.DASH_SPEED;
        }

        return true;
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.health = this.maxHealth;
        this.invincible = false;
        this.invincibleTimer = 0;
        this.trail = [];
        this.powerups = {
            speed: false,
            shield: false,
            slowTime: false,
            doublePoints: false,
            magnet: false
        };
        this.powerupTimers = {};
        this.dashAvailable = true;
        this.dashCooldown = 0;
        this.isDashing = false;
        this.dashTimer = 0;
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }
}

export default Player;
