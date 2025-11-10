/**
 * Entidad Bandera
 * Objetivo coleccionable con animaciones
 */

import { CONFIG } from '../config.js';

export class Flag {
    constructor(x, y, type = 'normal') {
        this.x = x;
        this.y = y;
        this.width = CONFIG.FLAG.SIZE;
        this.height = CONFIG.FLAG.SIZE;
        this.type = type;
        this.color = CONFIG.FLAG.COLORS[type.toUpperCase()] || CONFIG.FLAG.COLORS.NORMAL;
        this.points = CONFIG.FLAG.BASE_POINTS;
        this.collected = false;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.rotation = 0;
        this.scale = 1;
    }

    update(deltaTime) {
        // Animación de pulso
        this.pulsePhase += CONFIG.FLAG.PULSE_SPEED * deltaTime;
        this.scale = 1 + Math.sin(this.pulsePhase) * 0.1;

        // Rotación suave
        this.rotation += deltaTime * 2;
    }

    draw(ctx) {
        if (this.collected) return;

        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);

        // Glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;

        // Gradiente
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width / 2);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.7, this.color);
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');

        ctx.fillStyle = gradient;

        // Dibujar estrella
        this.drawStar(ctx, 0, 0, 5, this.width / 2, this.width / 4);

        // Borde
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();

        // Dibujar anillo exterior
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.width / 2 + 5 + Math.sin(this.pulsePhase) * 3,
            0,
            Math.PI * 2
        );
        ctx.stroke();
        ctx.restore();
    }

    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);

        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }

        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
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
        return this.points;
    }
}

export default Flag;
