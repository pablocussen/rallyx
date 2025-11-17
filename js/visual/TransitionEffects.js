/**
 * Transition Effects - Transiciones Cinematográficas IMPRESIONANTES
 * Wipes, fades, zooms, distortions para cambios de nivel y eventos
 *
 * Características:
 * - Circle wipe (expansión/contracción circular)
 * - Diagonal wipe
 * - Pixel dissolve
 * - Zoom transition
 * - Radial blur
 * - Color shift
 */

export class TransitionEffects {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.active = false;
        this.type = null;
        this.progress = 0;
        this.duration = 1000;
        this.callback = null;

        // Buffer canvas para efectos complejos
        this.buffer = document.createElement('canvas');
        this.buffer.width = canvas.width;
        this.buffer.height = canvas.height;
        this.bufferCtx = this.buffer.getContext('2d');
    }

    /**
     * Iniciar transición
     */
    start(type, duration = 1000, callback = null) {
        this.active = true;
        this.type = type;
        this.progress = 0;
        this.duration = duration;
        this.callback = callback;
        this.startTime = Date.now();
    }

    update(deltaTime) {
        if (!this.active) return;

        this.progress = Math.min(1, (Date.now() - this.startTime) / this.duration);

        if (this.progress >= 1) {
            this.active = false;
            if (this.callback) {
                this.callback();
                this.callback = null;
            }
        }
    }

    draw() {
        if (!this.active) return;

        switch (this.type) {
            case 'circleWipeOut':
                this.drawCircleWipe(false);
                break;
            case 'circleWipeIn':
                this.drawCircleWipe(true);
                break;
            case 'diagonalWipe':
                this.drawDiagonalWipe();
                break;
            case 'pixelDissolve':
                this.drawPixelDissolve();
                break;
            case 'zoomOut':
                this.drawZoom(false);
                break;
            case 'zoomIn':
                this.drawZoom(true);
                break;
            case 'colorShift':
                this.drawColorShift();
                break;
            case 'radialBlur':
                this.drawRadialBlur();
                break;
            case 'curtain':
                this.drawCurtain();
                break;
        }
    }

    /**
     * Circle wipe effect
     */
    drawCircleWipe(wipeIn) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);

        this.ctx.save();

        if (wipeIn) {
            // Wipe in: empieza con círculo pequeño que se expande
            const radius = this.progress * maxRadius * 1.5;
            this.ctx.globalCompositeOperation = 'destination-in';

            this.ctx.fillStyle = '#000000';
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.fill();
        } else {
            // Wipe out: empieza con pantalla completa y se cierra
            const radius = (1 - this.progress) * maxRadius * 1.5;

            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.globalCompositeOperation = 'destination-in';
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.restore();
    }

    /**
     * Diagonal wipe effect
     */
    drawDiagonalWipe() {
        const diagonal = this.canvas.width + this.canvas.height;
        const currentPos = this.progress * diagonal;

        this.ctx.save();
        this.ctx.fillStyle = '#000000';
        this.ctx.globalAlpha = 1;

        this.ctx.beginPath();
        this.ctx.moveTo(0, currentPos);
        this.ctx.lineTo(currentPos, 0);
        this.ctx.lineTo(this.canvas.width + this.canvas.height, 0);
        this.ctx.lineTo(this.canvas.width + this.canvas.height, this.canvas.height);
        this.ctx.lineTo(0, this.canvas.height);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.restore();
    }

    /**
     * Pixel dissolve effect
     */
    drawPixelDissolve() {
        const blockSize = 20;
        const cols = Math.ceil(this.canvas.width / blockSize);
        const rows = Math.ceil(this.canvas.height / blockSize);

        this.ctx.save();
        this.ctx.fillStyle = '#000000';

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                // Random threshold para cada bloque
                const threshold = (x + y) / (cols + rows);
                if (this.progress > threshold) {
                    this.ctx.fillRect(
                        x * blockSize,
                        y * blockSize,
                        blockSize,
                        blockSize
                    );
                }
            }
        }

        this.ctx.restore();
    }

    /**
     * Zoom effect
     */
    drawZoom(zoomIn) {
        this.ctx.save();

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        if (zoomIn) {
            // Zoom in: empieza pequeño, crece
            const scale = this.progress;
            this.ctx.translate(centerX, centerY);
            this.ctx.scale(scale, scale);
            this.ctx.translate(-centerX, -centerY);
        } else {
            // Zoom out: empieza normal, se aleja
            const scale = 1 + this.progress * 2;
            this.ctx.globalAlpha = 1 - this.progress;
            this.ctx.translate(centerX, centerY);
            this.ctx.scale(scale, scale);
            this.ctx.translate(-centerX, -centerY);
        }

        this.ctx.restore();
    }

    /**
     * Color shift effect
     */
    drawColorShift() {
        this.ctx.save();

        // Separación de canales RGB
        const offset = Math.sin(this.progress * Math.PI) * 10;

        this.ctx.globalCompositeOperation = 'lighter';

        // Red channel
        this.ctx.globalAlpha = 0.33;
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(-offset, 0, this.canvas.width, this.canvas.height);

        // Green channel
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Blue channel
        this.ctx.fillStyle = '#0000ff';
        this.ctx.fillRect(offset, 0, this.canvas.width, this.canvas.height);

        this.ctx.restore();
    }

    /**
     * Radial blur effect
     */
    drawRadialBlur() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const intensity = Math.sin(this.progress * Math.PI) * 20;

        this.ctx.save();

        // Dibujar múltiples copias con alpha bajo
        for (let i = 0; i < 8; i++) {
            const scale = 1 + (intensity / 100) * i;
            this.ctx.globalAlpha = 0.1;
            this.ctx.translate(centerX, centerY);
            this.ctx.scale(scale, scale);
            this.ctx.translate(-centerX, -centerY);
        }

        this.ctx.restore();
    }

    /**
     * Curtain effect (teatro)
     */
    drawCurtain() {
        const leftCurtain = (this.progress) * (this.canvas.width / 2);
        const rightCurtain = this.canvas.width - leftCurtain;

        this.ctx.save();

        // Cortina izquierda
        const gradientLeft = this.ctx.createLinearGradient(0, 0, leftCurtain, 0);
        gradientLeft.addColorStop(0, '#000000');
        gradientLeft.addColorStop(0.8, '#1a1a1a');
        gradientLeft.addColorStop(1, '#333333');

        this.ctx.fillStyle = gradientLeft;
        this.ctx.fillRect(0, 0, leftCurtain, this.canvas.height);

        // Cortina derecha
        const gradientRight = this.ctx.createLinearGradient(
            rightCurtain,
            0,
            this.canvas.width,
            0
        );
        gradientRight.addColorStop(0, '#333333');
        gradientRight.addColorStop(0.2, '#1a1a1a');
        gradientRight.addColorStop(1, '#000000');

        this.ctx.fillStyle = gradientRight;
        this.ctx.fillRect(rightCurtain, 0, this.canvas.width - rightCurtain, this.canvas.height);

        // Sombra en el borde
        this.ctx.shadowBlur = 30;
        this.ctx.shadowColor = '#000000';
        this.ctx.fillRect(leftCurtain - 5, 0, 10, this.canvas.height);
        this.ctx.fillRect(rightCurtain - 5, 0, 10, this.canvas.height);

        this.ctx.restore();
    }

    /**
     * Secuencia de transición completa
     */
    sequence(transitions, onComplete) {
        let index = 0;

        const next = () => {
            if (index >= transitions.length) {
                if (onComplete) onComplete();
                return;
            }

            const transition = transitions[index];
            index++;

            this.start(
                transition.type,
                transition.duration || 1000,
                next
            );
        };

        next();
    }

    /**
     * Level complete transition
     */
    levelCompleteTransition(onMidpoint) {
        this.sequence([
            { type: 'zoomOut', duration: 500 },
            { type: 'circleWipeOut', duration: 600 }
        ], onMidpoint);
    }

    /**
     * Level start transition
     */
    levelStartTransition() {
        this.start('circleWipeIn', 800);
    }

    /**
     * Game over transition
     */
    gameOverTransition(onComplete) {
        this.sequence([
            { type: 'colorShift', duration: 400 },
            { type: 'curtain', duration: 1000 }
        ], onComplete);
    }

    /**
     * Fever mode transition
     */
    feverModeTransition() {
        this.start('radialBlur', 400);
    }

    isActive() {
        return this.active;
    }
}

export default TransitionEffects;
