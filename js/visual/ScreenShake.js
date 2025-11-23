/**
 * Sistema de Screen Shake Mejorado
 * Añade juice al juego con sacudidas de cámara contextuales
 *
 * @class ScreenShake
 * @description Sistema profesional de screen shake con:
 * - Múltiples intensidades
 * - Decay natural
 * - Combinación de sacudidas simultáneas
 * - Trauma system (inspirado en GDC talk)
 */

export class ScreenShake {
    constructor() {
        this.trauma = 0; // 0-1, se convierte en shake
        this.traumaDecay = 1.5; // Trauma decay per second
        this.maxAngle = 10; // Grados máximos de rotación
        this.maxOffset = 20; // Pixels máximos de desplazamiento

        this.currentShake = {
            x: 0,
            y: 0,
            rotation: 0
        };
    }

    /**
     * Añade trauma al sistema (0-1)
     * @param {number} amount - Cantidad de trauma (0-1)
     */
    addTrauma(amount) {
        this.trauma = Math.min(1, this.trauma + amount);
    }

    /**
     * Sacudida pequeña (recolectar items, colisiones leves)
     */
    small() {
        this.addTrauma(0.2);
    }

    /**
     * Sacudida mediana (explosiones, daño)
     */
    medium() {
        this.addTrauma(0.4);
    }

    /**
     * Sacudida grande (muerte, level complete)
     */
    large() {
        this.addTrauma(0.7);
    }

    /**
     * Sacudida masiva (boss death, game over)
     */
    massive() {
        this.addTrauma(1.0);
    }

    /**
     * Sacudida custom con duración específica
     * @param {number} intensity - Intensidad (0-1)
     */
    shake(intensity) {
        this.addTrauma(Math.min(1, Math.max(0, intensity)));
    }

    /**
     * Actualiza el sistema de shake
     * @param {number} deltaTime - Delta en segundos
     */
    update(deltaTime) {
        // Decay de trauma con el tiempo
        if (this.trauma > 0) {
            this.trauma = Math.max(0, this.trauma - this.traumaDecay * deltaTime);
        }

        // Convertir trauma a shake usando función cuadrática para más impacto
        const shake = this.trauma * this.trauma;

        // Generar valores aleatorios de shake
        if (shake > 0.01) {
            this.currentShake.x = this.maxOffset * shake * (Math.random() * 2 - 1);
            this.currentShake.y = this.maxOffset * shake * (Math.random() * 2 - 1);
            this.currentShake.rotation = this.maxAngle * shake * (Math.random() * 2 - 1);
        } else {
            // Reset si el shake es insignificante
            this.currentShake.x = 0;
            this.currentShake.y = 0;
            this.currentShake.rotation = 0;
        }
    }

    /**
     * Obtiene los valores actuales de shake
     * @returns {Object} {x, y, rotation}
     */
    getShake() {
        return { ...this.currentShake };
    }

    /**
     * Aplica el shake al contexto del canvas
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {number} centerX - Centro X del canvas
     * @param {number} centerY - Centro Y del canvas
     */
    apply(ctx, centerX, centerY) {
        if (this.trauma > 0.01) {
            ctx.save();
            ctx.translate(centerX + this.currentShake.x, centerY + this.currentShake.y);
            ctx.rotate((this.currentShake.rotation * Math.PI) / 180);
            ctx.translate(-centerX, -centerY);
        }
    }

    /**
     * Restaura el contexto del canvas
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    restore(ctx) {
        if (this.trauma > 0.01) {
            ctx.restore();
        }
    }

    /**
     * Resetea todo el shake
     */
    reset() {
        this.trauma = 0;
        this.currentShake = { x: 0, y: 0, rotation: 0 };
    }

    /**
     * Obtiene el nivel de trauma actual
     * @returns {number} Trauma (0-1)
     */
    getTrauma() {
        return this.trauma;
    }

    /**
     * Verifica si hay shake activo
     * @returns {boolean}
     */
    isShaking() {
        return this.trauma > 0.01;
    }
}

export default ScreenShake;
