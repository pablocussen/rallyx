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
    }

    update(deltaTime, input, canvasWidth, canvasHeight) {
        // Obtener movimiento del input
        const movement = input.getMovement();

        // Aplicar aceleración
        this.vx += movement.dx * CONFIG.PLAYER.ACCELERATION * this.speed;
        this.vy += movement.dy * CONFIG.PLAYER.ACCELERATION * this.speed;

        // Aplicar fricción
        this.vx *= CONFIG.PLAYER.FRICTION;
        this.vy *= CONFIG.PLAYER.FRICTION;

        // Limitar velocidad máxima
        const maxSpeed = this.powerups.speed ? CONFIG.PLAYER.MAX_SPEED : this.speed;
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
        // Dibujar trail
        this.trail.forEach((t, i) => {
            ctx.save();
            ctx.globalAlpha = t.alpha * 0.5;
            ctx.fillStyle = CONFIG.PLAYER.TRAIL_COLOR;
            const size = (i / this.trail.length) * 8;
            ctx.fillRect(t.x - size / 2, t.y - size / 2, size, size);
            ctx.restore();
        });

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

        // Gradiente
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width / 2);
        gradient.addColorStop(0, CONFIG.PLAYER.COLOR);
        gradient.addColorStop(1, 'rgba(0, 212, 255, 0.3)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(this.width / 2, 0);
        ctx.lineTo(-this.width / 2, -this.height / 2);
        ctx.lineTo(-this.width / 2, this.height / 2);
        ctx.closePath();
        ctx.fill();

        // Borde
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
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
