/**
 * Screen Effects - Sistema de Efectos Visuales (JUICE)
 * Screen shake, freeze frames, flashes, chromatic aberration, zoom
 * Hace que el juego se SIENTA INCREÍBLE
 *
 * Características:
 * - Screen shake con diferentes intensidades
 * - Freeze frames para momentos impactantes
 * - Flash effects para eventos especiales
 * - Chromatic aberration para impactos
 * - Zoom effects para énfasis
 * - Vignette dinámico según tensión
 * - Glow/bloom para combos altos
 */

export class ScreenEffects {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;

        // Estado de screen shake
        this.shake = {
            active: false,
            intensity: 0,
            duration: 0,
            elapsed: 0,
            offsetX: 0,
            offsetY: 0,
            frequency: 60 // Hz
        };

        // Estado de freeze frame
        this.freeze = {
            active: false,
            duration: 0,
            elapsed: 0
        };

        // Estado de flash
        this.flash = {
            active: false,
            color: '#ffffff',
            opacity: 0,
            duration: 0,
            elapsed: 0
        };

        // Estado de chromatic aberration
        this.chromatic = {
            active: false,
            intensity: 0,
            duration: 0,
            elapsed: 0
        };

        // Estado de zoom
        this.zoom = {
            active: false,
            current: 1.0,
            target: 1.0,
            speed: 0.1
        };

        // Estado de vignette
        this.vignette = {
            intensity: 0,
            targetIntensity: 0
        };

        // Estado de glow/bloom
        this.glow = {
            active: false,
            intensity: 0,
            color: '#00d4ff'
        };

        // Buffer canvas para efectos
        this.effectCanvas = document.createElement('canvas');
        this.effectCanvas.width = canvas.width;
        this.effectCanvas.height = canvas.height;
        this.effectCtx = this.effectCanvas.getContext('2d');
    }

    /**
     * Actualizar todos los efectos
     */
    update(deltaTime) {
        // Update screen shake
        if (this.shake.active) {
            this.shake.elapsed += deltaTime;

            if (this.shake.elapsed >= this.shake.duration) {
                this.shake.active = false;
                this.shake.offsetX = 0;
                this.shake.offsetY = 0;
            } else {
                // Generar offset aleatorio basado en intensidad
                const progress = this.shake.elapsed / this.shake.duration;
                const falloff = 1 - progress; // Se reduce con el tiempo
                const intensity = this.shake.intensity * falloff;

                this.shake.offsetX = (Math.random() - 0.5) * intensity;
                this.shake.offsetY = (Math.random() - 0.5) * intensity;
            }
        }

        // Update freeze frame
        if (this.freeze.active) {
            this.freeze.elapsed += deltaTime;

            if (this.freeze.elapsed >= this.freeze.duration) {
                this.freeze.active = false;
                this.freeze.elapsed = 0;
            }
            // Durante freeze, el juego NO avanza (se maneja en GameState)
        }

        // Update flash
        if (this.flash.active) {
            this.flash.elapsed += deltaTime;
            const progress = this.flash.elapsed / this.flash.duration;

            if (progress >= 1.0) {
                this.flash.active = false;
                this.flash.opacity = 0;
            } else {
                // Fade out
                this.flash.opacity = 1.0 - progress;
            }
        }

        // Update chromatic aberration
        if (this.chromatic.active) {
            this.chromatic.elapsed += deltaTime;
            const progress = this.chromatic.elapsed / this.chromatic.duration;

            if (progress >= 1.0) {
                this.chromatic.active = false;
                this.chromatic.intensity = 0;
            } else {
                // Fade out
                this.chromatic.intensity *= 0.95;
            }
        }

        // Update zoom (smooth interpolation)
        if (this.zoom.current !== this.zoom.target) {
            const diff = this.zoom.target - this.zoom.current;
            this.zoom.current += diff * this.zoom.speed;

            if (Math.abs(diff) < 0.001) {
                this.zoom.current = this.zoom.target;
            }
        }

        // Update vignette (smooth transition)
        if (this.vignette.intensity !== this.vignette.targetIntensity) {
            const diff = this.vignette.targetIntensity - this.vignette.intensity;
            this.vignette.intensity += diff * 0.1;
        }
    }

    /**
     * Aplicar efectos antes de render
     */
    preRender() {
        // Aplicar zoom
        if (this.zoom.current !== 1.0) {
            this.ctx.save();
            const scale = this.zoom.current;
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;

            this.ctx.translate(centerX, centerY);
            this.ctx.scale(scale, scale);
            this.ctx.translate(-centerX, -centerY);
        }

        // Aplicar screen shake
        if (this.shake.active) {
            this.ctx.save();
            this.ctx.translate(this.shake.offsetX, this.shake.offsetY);
        }
    }

    /**
     * Aplicar efectos después de render
     */
    postRender() {
        // Restaurar transformaciones
        if (this.shake.active) {
            this.ctx.restore();
        }

        if (this.zoom.current !== 1.0) {
            this.ctx.restore();
        }

        // Aplicar vignette
        if (this.vignette.intensity > 0) {
            this.renderVignette();
        }

        // Aplicar glow
        if (this.glow.active && this.glow.intensity > 0) {
            this.renderGlow();
        }

        // Aplicar chromatic aberration
        if (this.chromatic.active && this.chromatic.intensity > 0) {
            this.renderChromaticAberration();
        }

        // Aplicar flash
        if (this.flash.active && this.flash.opacity > 0) {
            this.renderFlash();
        }
    }

    /**
     * Trigger screen shake
     */
    screenShake(intensity = 10, duration = 200) {
        this.shake.active = true;
        this.shake.intensity = intensity;
        this.shake.duration = duration;
        this.shake.elapsed = 0;
    }

    /**
     * Trigger freeze frame
     */
    freezeFrame(duration = 100) {
        this.freeze.active = true;
        this.freeze.duration = duration;
        this.freeze.elapsed = 0;
        return true; // Señal para GameState de que debe pausar
    }

    /**
     * Trigger flash
     */
    flashScreen(color = '#ffffff', duration = 150) {
        this.flash.active = true;
        this.flash.color = color;
        this.flash.duration = duration;
        this.flash.elapsed = 0;
        this.flash.opacity = 1.0;
    }

    /**
     * Trigger chromatic aberration
     */
    chromaticAberration(intensity = 5, duration = 300) {
        this.chromatic.active = true;
        this.chromatic.intensity = intensity;
        this.chromatic.duration = duration;
        this.chromatic.elapsed = 0;
    }

    /**
     * Set zoom level
     */
    setZoom(targetZoom, speed = 0.1) {
        this.zoom.target = Math.max(0.5, Math.min(2.0, targetZoom));
        this.zoom.speed = speed;
    }

    /**
     * Reset zoom
     */
    resetZoom() {
        this.setZoom(1.0, 0.2);
    }

    /**
     * Set vignette intensity
     */
    setVignette(intensity) {
        this.vignette.targetIntensity = Math.max(0, Math.min(1, intensity));
    }

    /**
     * Set glow effect
     */
    setGlow(active, intensity = 0.5, color = '#00d4ff') {
        this.glow.active = active;
        this.glow.intensity = intensity;
        this.glow.color = color;
    }

    /**
     * Render vignette effect
     */
    renderVignette() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxRadius = Math.max(this.canvas.width, this.canvas.height);

        const gradient = this.ctx.createRadialGradient(
            centerX, centerY, maxRadius * 0.3,
            centerX, centerY, maxRadius * 0.8
        );

        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, `rgba(0, 0, 0, ${this.vignette.intensity})`);

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Render glow effect
     */
    renderGlow() {
        this.ctx.shadowBlur = 20 * this.glow.intensity;
        this.ctx.shadowColor = this.glow.color;
        // El glow se aplica automáticamente a lo que se dibuja después
        // Se resetea en el próximo frame
    }

    /**
     * Render chromatic aberration (simplified)
     */
    renderChromaticAberration() {
        const offset = this.chromatic.intensity;

        // Copiar canvas actual al buffer
        this.effectCtx.clearRect(0, 0, this.effectCanvas.width, this.effectCanvas.height);
        this.effectCtx.drawImage(this.canvas, 0, 0);

        // Limpiar canvas
        this.ctx.globalAlpha = 0.3;

        // Dibujar canal rojo offset
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.fillStyle = 'red';
        this.ctx.drawImage(this.effectCanvas, -offset, 0);

        // Dibujar canal cyan offset
        this.ctx.fillStyle = 'cyan';
        this.ctx.drawImage(this.effectCanvas, offset, 0);

        // Restaurar
        this.ctx.globalAlpha = 1.0;
        this.ctx.globalCompositeOperation = 'source-over';
    }

    /**
     * Render flash effect
     */
    renderFlash() {
        this.ctx.fillStyle = this.flash.color;
        this.ctx.globalAlpha = this.flash.opacity * 0.7;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalAlpha = 1.0;
    }

    /**
     * Combos de efectos para eventos específicos
     */

    // Efecto para milestone de combo
    comboMilestone(combo) {
        const intensity = Math.min(combo / 10, 5);

        this.screenShake(5 + intensity * 2, 150);
        this.freezeFrame(50 + intensity * 10);
        this.flashScreen('#ffff00', 200);

        if (combo >= 20) {
            this.chromaticAberration(8, 400);
        }

        return this.freeze.active;
    }

    // Efecto para muerte
    death() {
        this.screenShake(20, 400);
        this.freezeFrame(200);
        this.flashScreen('#ff0000', 300);
        this.chromaticAberration(10, 500);
        this.setVignette(0.8);

        return this.freeze.active;
    }

    // Efecto para recoger flag
    flagCollected() {
        this.screenShake(2, 100);
        this.flashScreen('#00ff00', 100);
    }

    // Efecto para power-up
    powerupCollected() {
        this.screenShake(3, 120);
        this.flashScreen('#00d4ff', 150);
        this.setZoom(1.1, 0.3);
        setTimeout(() => this.resetZoom(), 200);
    }

    // Efecto para near miss (pasar muy cerca de enemigo)
    nearMiss() {
        this.screenShake(8, 150);
        this.chromaticAberration(5, 200);
        this.flashScreen('#ffaa00', 100);
    }

    // Efecto para fever mode activado
    feverModeStart() {
        this.screenShake(15, 300);
        this.freezeFrame(150);
        this.flashScreen('#ff00ff', 250);
        this.chromaticAberration(12, 600);
        this.setGlow(true, 1.0, '#ff00ff');

        return this.freeze.active;
    }

    // Efecto para level complete
    levelComplete() {
        this.flashScreen('#00ff00', 400);
        this.setZoom(1.2, 0.15);
        setTimeout(() => this.resetZoom(), 1000);
    }

    // Efecto para game over
    gameOver() {
        this.screenShake(30, 600);
        this.freezeFrame(300);
        this.flashScreen('#000000', 500);
        this.setVignette(1.0);

        return this.freeze.active;
    }

    /**
     * Actualizar efectos según estado del juego
     */
    updateFromGameState(gameState) {
        // Vignette basado en health
        const healthVignette = Math.max(0, (100 - gameState.health) / 100 * 0.6);
        this.setVignette(healthVignette);

        // Glow basado en combo
        if (gameState.combo >= 10) {
            const intensity = Math.min(gameState.combo / 50, 1.0);
            let color = '#00d4ff';

            if (gameState.combo >= 30) color = '#ff00ff';
            else if (gameState.combo >= 20) color = '#ff8800';
            else if (gameState.combo >= 15) color = '#ffff00';

            this.setGlow(true, intensity, color);
        } else {
            this.setGlow(false);
        }

        // Zoom ligero en fever mode
        if (gameState.feverMode && this.zoom.target === 1.0) {
            this.setZoom(1.05, 0.05);
        } else if (!gameState.feverMode && this.zoom.target === 1.05) {
            this.resetZoom();
        }
    }

    /**
     * Reset todos los efectos
     */
    reset() {
        this.shake.active = false;
        this.shake.offsetX = 0;
        this.shake.offsetY = 0;

        this.freeze.active = false;

        this.flash.active = false;
        this.flash.opacity = 0;

        this.chromatic.active = false;
        this.chromatic.intensity = 0;

        this.zoom.current = 1.0;
        this.zoom.target = 1.0;

        this.vignette.intensity = 0;
        this.vignette.targetIntensity = 0;

        this.glow.active = false;
    }

    /**
     * Verificar si está en freeze frame
     */
    isFrozen() {
        return this.freeze.active;
    }

    /**
     * Obtener offset de screen shake (para UI)
     */
    getShakeOffset() {
        return {
            x: this.shake.offsetX,
            y: this.shake.offsetY
        };
    }

    /**
     * Obtener estado para debugging
     */
    getStatus() {
        return {
            shake: this.shake.active,
            freeze: this.freeze.active,
            flash: this.flash.active,
            chromatic: this.chromatic.active,
            zoom: this.zoom.current.toFixed(2),
            vignette: this.vignette.intensity.toFixed(2),
            glow: this.glow.active
        };
    }
}

export default ScreenEffects;
