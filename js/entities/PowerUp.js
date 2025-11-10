/**
 * Entidad Power-Up
 * Mejoras temporales para el jugador
 */

import { CONFIG } from '../config.js';

export class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.POWERUP.SIZE;
        this.height = CONFIG.POWERUP.SIZE;
        this.type = type;
        this.config = CONFIG.POWERUP.TYPES[type.toUpperCase()];
        this.color = this.config.color;
        this.duration = this.config.duration || CONFIG.POWERUP.DURATION;
        this.collected = false;
        this.pulsePhase = 0;
        this.rotation = 0;
        this.floatOffset = 0;
    }

    update(deltaTime) {
        if (this.collected) return;

        // Animaciones
        this.pulsePhase += deltaTime * 4;
        this.rotation += deltaTime * 3;
        this.floatOffset = Math.sin(this.pulsePhase) * 5;
    }

    draw(ctx) {
        if (this.collected) return;

        ctx.save();

        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2 + this.floatOffset;

        // Glow effect
        ctx.shadowBlur = 25;
        ctx.shadowColor = this.color;

        // Anillo exterior pulsante
        ctx.globalAlpha = 0.3 + Math.sin(this.pulsePhase) * 0.2;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.width / 2 + 8, 0, Math.PI * 2);
        ctx.stroke();

        // Forma principal
        ctx.globalAlpha = 1;
        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotation);

        // Gradiente
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width / 2);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, this.color);
        gradient.addColorStop(1, this.color);

        ctx.fillStyle = gradient;

        // Dibujar forma según tipo
        switch(this.type) {
            case 'speed':
                this.drawLightning(ctx);
                break;
            case 'shield':
                this.drawShield(ctx);
                break;
            case 'slowTime':
                this.drawClock(ctx);
                break;
            case 'doublePoints':
                this.drawStar(ctx);
                break;
            case 'magnet':
                this.drawMagnet(ctx);
                break;
            default:
                this.drawCircle(ctx);
        }

        ctx.restore();
    }

    drawLightning(ctx) {
        const size = this.width / 2;
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size / 4, -size / 4);
        ctx.lineTo(size / 4, -size / 4);
        ctx.lineTo(size / 2, 0);
        ctx.lineTo(0, size / 4);
        ctx.lineTo(0, size / 2);
        ctx.lineTo(-size / 4, size);
        ctx.lineTo(-size / 4, 0);
        ctx.lineTo(-size / 2, -size / 4);
        ctx.closePath();
        ctx.fill();
    }

    drawShield(ctx) {
        const size = this.width / 2;
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.quadraticCurveTo(size, -size / 2, size, size / 2);
        ctx.quadraticCurveTo(size, size, 0, size);
        ctx.quadraticCurveTo(-size, size, -size, size / 2);
        ctx.quadraticCurveTo(-size, -size / 2, 0, -size);
        ctx.closePath();
        ctx.fill();
    }

    drawClock(ctx) {
        const size = this.width / 2;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -size / 2);
        ctx.moveTo(0, 0);
        ctx.lineTo(size / 3, 0);
        ctx.stroke();
    }

    drawStar(ctx) {
        const size = this.width / 2;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
            const x = Math.cos(angle) * size;
            const y = Math.sin(angle) * size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);

            const innerAngle = angle + Math.PI / 5;
            const ix = Math.cos(innerAngle) * size / 2;
            const iy = Math.sin(innerAngle) * size / 2;
            ctx.lineTo(ix, iy);
        }
        ctx.closePath();
        ctx.fill();
    }

    drawMagnet(ctx) {
        const size = this.width / 2;
        ctx.lineWidth = size / 2;
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, Math.PI, 0);
        ctx.stroke();
    }

    drawCircle(ctx) {
        const size = this.width / 2;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
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

    collect() {
        this.collected = true;
        return {
            type: this.type,
            duration: this.duration,
            config: this.config
        };
    }
}

export default PowerUp;
