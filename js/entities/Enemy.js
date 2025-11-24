/**
 * Entidad Enemigo
 * IA con pathfinding y comportamiento inteligente
 */

import { CONFIG } from '../config.js';
import { Collision } from '../utils/Collision.js';

export class Enemy {
    constructor(x, y, type = 0) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.ENEMY.SIZE;
        this.height = CONFIG.ENEMY.SIZE;
        this.speed = CONFIG.ENEMY.BASE_SPEED + Math.random();
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.type = type;
        this.color = CONFIG.ENEMY.COLORS[type % CONFIG.ENEMY.COLORS.length];
        this.state = 'patrol'; // patrol, chase
        this.targetX = x;
        this.targetY = y;
        this.pathUpdateTimer = 0;
        this.angle = 0;
    }

    update(deltaTime, player, canvasWidth, canvasHeight) {
        // Calcular distancia al jugador
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);

        // Determinar comportamiento basado en distancia
        if (CONFIG.ENEMY.SMART_AI && distanceToPlayer < CONFIG.ENEMY.CHASE_RANGE) {
            this.state = 'chase';

            // Actualizar target cada cierto tiempo
            this.pathUpdateTimer += deltaTime * 1000;
            if (this.pathUpdateTimer > CONFIG.ENEMY.UPDATE_PATH_INTERVAL) {
                // PREDICCIÓN PRO: Anticipar movimiento del jugador
                const predictionFactor = 0.4; // Qué tan adelante predecir
                const playerSpeed = Math.sqrt(player.vx * player.vx + player.vy * player.vy);

                if (playerSpeed > 0.5) {
                    // Predecir posición futura del jugador
                    const predictionDistance = playerSpeed * predictionFactor * 100;
                    const playerAngle = Math.atan2(player.vy, player.vx);
                    this.targetX = player.x + Math.cos(playerAngle) * predictionDistance;
                    this.targetY = player.y + Math.sin(playerAngle) * predictionDistance;
                } else {
                    // Si el jugador está quieto, ir directo
                    this.targetX = player.x;
                    this.targetY = player.y;
                }

                this.pathUpdateTimer = 0;
            }

            // Perseguir al jugador con velocidad aumentada (más agresivo)
            const targetDx = this.targetX - this.x;
            const targetDy = this.targetY - this.y;
            const targetDistance = Math.sqrt(targetDx * targetDx + targetDy * targetDy);

            if (targetDistance > 0) {
                // Velocidad adaptativa: más cerca = más rápido
                const speedBoost = Math.min(1.5, 1 + (1 - distanceToPlayer / CONFIG.ENEMY.CHASE_RANGE) * 0.5);
                this.vx = (targetDx / targetDistance) * CONFIG.ENEMY.CHASE_SPEED * speedBoost;
                this.vy = (targetDy / targetDistance) * CONFIG.ENEMY.CHASE_SPEED * speedBoost;
            }
        } else {
            this.state = 'patrol';
            // Movimiento de patrulla más inteligente
            // Los enemigos mantienen su dirección hasta chocar con un borde
        }

        // Actualizar posición
        this.x += this.vx;
        this.y += this.vy;

        // Rebotar en bordes con variación
        if (this.x <= 0 || this.x + this.width >= canvasWidth) {
            this.vx *= -1;
            // Añadir variación al rebote para movimiento menos predecible
            this.vy += (Math.random() - 0.5) * 2;
            this.x = Math.max(0, Math.min(this.x, canvasWidth - this.width));
        }

        if (this.y <= 0 || this.y + this.height >= canvasHeight) {
            this.vy *= -1;
            // Añadir variación al rebote
            this.vx += (Math.random() - 0.5) * 2;
            this.y = Math.max(0, Math.min(this.y, canvasHeight - this.height));
        }

        // Calcular ángulo
        this.angle = Math.atan2(this.vy, this.vx);

        // Variación de velocidad en patrulla (más errático)
        if (this.state === 'patrol') {
            this.vx += (Math.random() - 0.5) * 0.2; // Más variación
            this.vy += (Math.random() - 0.5) * 0.2;

            // Limitar velocidad
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (speed > CONFIG.ENEMY.PATROL_SPEED) {
                this.vx = (this.vx / speed) * CONFIG.ENEMY.PATROL_SPEED;
                this.vy = (this.vy / speed) * CONFIG.ENEMY.PATROL_SPEED;
            }
        }
    }

    draw(ctx) {
        ctx.save();

        // Efecto de glow si está persiguiendo
        if (this.state === 'chase') {
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color;
        }

        // Forma del enemigo
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.angle);

        // Gradiente
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width / 2);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'rgba(255, 71, 87, 0.3)');

        ctx.fillStyle = gradient;

        // Dibujar forma (cuadrado con esquinas redondeadas)
        const size = this.width / 2;
        ctx.beginPath();
        ctx.moveTo(size - 5, -size);
        ctx.lineTo(size, -size + 5);
        ctx.lineTo(size, size - 5);
        ctx.lineTo(size - 5, size);
        ctx.lineTo(-size + 5, size);
        ctx.lineTo(-size, size - 5);
        ctx.lineTo(-size, -size + 5);
        ctx.lineTo(-size + 5, -size);
        ctx.closePath();
        ctx.fill();

        // Borde
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Ojo/indicador de dirección
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(size / 3, 0, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Dibujar indicador de estado (debug)
        if (CONFIG.DEBUG.SHOW_PATHFINDING && this.state === 'chase') {
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y + this.height / 2);
            ctx.lineTo(this.targetX, this.targetY);
            ctx.stroke();
            ctx.restore();
        }
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

export default Enemy;
