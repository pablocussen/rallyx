/**
 * Visual Effects Manager - Orquestador de TODOS los Efectos Visuales IMPRESIONANTES
 * Coordina: Starfield, PowerUpEffects, Transitions, UIAnimations, ParticlesEnhanced
 *
 * API simple para usar desde GameState
 */

import { StarfieldBackground } from './StarfieldBackground.js';
import { PowerUpEffects } from './PowerUpEffects.js';
import { TransitionEffects } from './TransitionEffects.js';
import { UIAnimations } from './UIAnimations.js';
import { ParticleSystemEnhanced } from '../systems/ParticleSystemEnhanced.js';

export class VisualEffectsManager {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;

        // Inicializar todos los sistemas visuales
        this.starfield = new StarfieldBackground(canvas.width, canvas.height);
        this.powerupFX = new PowerUpEffects();
        this.transitions = new TransitionEffects(canvas, ctx);
        this.uiAnims = new UIAnimations();
        this.particles = new ParticleSystemEnhanced();

        // Estado
        this.enabled = true;
    }

    update(deltaTime, gameState = {}) {
        if (!this.enabled) return;

        // Update starfield con velocidad del jugador y fever mode
        this.starfield.update(
            deltaTime,
            gameState.playerSpeed || 0,
            gameState.feverMode || false
        );

        // Update power-up effects
        this.powerupFX.update(deltaTime);

        // Update transitions
        this.transitions.update(deltaTime);

        // Update UI animations
        this.uiAnims.update(deltaTime);

        // Update particles
        this.particles.update(deltaTime);
    }

    draw() {
        if (!this.enabled) return;

        // Layer 1: Starfield (fondo)
        this.starfield.draw(this.ctx);

        // Layer 2: Particles (detrás de entidades del juego)
        this.particles.draw(this.ctx);
        this.particles.drawSpecialParticles(this.ctx);

        // Layer 3: Power-up effects
        this.powerupFX.draw(this.ctx);

        // Layer 4: El juego se dibuja aquí (en GameState)

        // Layer 5: UI Animations (encima del juego)
        this.uiAnims.drawFloatingTexts(this.ctx);
        this.uiAnims.drawGlowingElements(this.ctx);

        // Layer 6: Notifications
        this.uiAnims.drawNotifications(this.ctx, this.canvas.width);

        // Layer 7: Transitions (siempre encima)
        this.transitions.draw();
    }

    // ======== API SIMPLIFICADA ========

    /**
     * Player actions
     */
    playerDeath(x, y) {
        this.particles.explosion(x, y, '#ff0000', 2);
        this.powerupFX.comboMilestone(x, y, 0); // Explosion sin combo
        this.uiAnims.floatingText(x, y - 30, '💀', {
            color: '#ff0000',
            size: 40,
            duration: 2000
        });
    }

    playerHit(x, y) {
        this.particles.impact(x, y, Math.random() * Math.PI * 2, '#ffaa00');
        this.uiAnims.floatingText(x, y - 20, 'HIT!', {
            color: '#ff0000',
            size: 20
        });
    }

    /**
     * Collectibles
     */
    flagCollected(x, y, points) {
        this.particles.collectEnhanced(x, y, '#00ff00');
        this.uiAnims.floatingScore(x, y, points, '#00ff00');
    }

    powerupCollected(x, y, type) {
        const colors = {
            speed: '#00d4ff',
            shield: '#0088ff',
            doublePoints: '#ffdd00',
            magnet: '#ff00ff',
            slowTime: '#8800ff'
        };

        const color = colors[type] || '#ffffff';

        this.particles.collectEnhanced(x, y, color);

        // Efecto específico del power-up
        switch (type) {
            case 'shield':
                this.powerupFX.shieldActivate(x, y);
                break;
            case 'speed':
                this.powerupFX.speedBoost(x, y);
                break;
            case 'doublePoints':
                this.powerupFX.doublePoints(x, y);
                break;
            case 'magnet':
                this.powerupFX.magnet(x, y);
                break;
            case 'slowTime':
                this.powerupFX.slowTime(x, y);
                break;
        }

        this.uiAnims.showNotification(
            type.toUpperCase(),
            'Power-up activado!',
            '⚡',
            color
        );
    }

    /**
     * Combo effects
     */
    comboAction(x, y, combo) {
        if (combo >= 5) {
            this.particles.spiral(x, y, '#ffff00', 2);
        }
    }

    comboMilestone(x, y, combo, milestone) {
        this.powerupFX.comboMilestone(x, y, combo);
        this.particles.firework(x, y - 50);

        this.uiAnims.showNotification(
            milestone.name,
            `Combo x${combo}!`,
            '🔥',
            milestone.color
        );
    }

    feverModeStart(x, y) {
        this.powerupFX.comboMilestone(x, y, 10);
        this.transitions.feverModeTransition();
        this.starfield.flashNebula();

        this.uiAnims.showNotification(
            'FEVER MODE!',
            '¡Puntos x2!',
            '🔥',
            '#ff00ff'
        );

        // Fuegos artificiales
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const fx = x + (Math.random() - 0.5) * 200;
                const fy = y + (Math.random() - 0.5) * 100;
                this.particles.firework(fx, fy);
            }, i * 200);
        }
    }

    feverModeEnd() {
        this.uiAnims.floatingText(
            this.canvas.width / 2,
            this.canvas.height / 2,
            'Fever Mode terminado',
            { color: '#ff00ff', size: 30, duration: 2000 }
        );
    }

    /**
     * Level events
     */
    levelComplete(callback) {
        this.transitions.levelCompleteTransition(callback);
        this.powerupFX.levelComplete(
            this.canvas.width / 2,
            this.canvas.height / 2
        );

        this.uiAnims.showNotification(
            '¡NIVEL COMPLETADO!',
            'Excelente trabajo',
            '🏁',
            '#00ff00'
        );
    }

    levelStart(levelNumber) {
        this.transitions.levelStartTransition();

        this.uiAnims.floatingText(
            this.canvas.width / 2,
            this.canvas.height / 3,
            `NIVEL ${levelNumber}`,
            {
                color: '#00d4ff',
                size: 48,
                duration: 2000,
                speed: 0
            }
        );
    }

    /**
     * Game events
     */
    gameOver(callback) {
        this.transitions.gameOverTransition(callback);

        setTimeout(() => {
            this.uiAnims.showNotification(
                'GAME OVER',
                'Inténtalo de nuevo',
                '💀',
                '#ff0000'
            );
        }, 500);
    }

    levelUp(x, y, level) {
        this.uiAnims.levelUpAnimation(x, y, level);

        // Explosión de fuegos artificiales
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const angle = (Math.PI * 2 * i) / 8;
                const distance = 100;
                const fx = x + Math.cos(angle) * distance;
                const fy = y + Math.sin(angle) * distance;
                this.particles.firework(fx, fy);
            }, i * 150);
        }
    }

    achievementUnlocked(achievement) {
        this.uiAnims.showNotification(
            achievement.name,
            achievement.description,
            '🏆',
            '#ffdd00'
        );

        // Confetti
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const x = Math.random() * this.canvas.width;
                const y = -20;
                this.particles.emit(x, y, {
                    count: 1,
                    color: `hsl(${Math.random() * 360}, 100%, 70%)`,
                    speed: Math.random() * 3 + 2,
                    size: 4,
                    life: 3,
                    gravity: 0.1,
                    spread: 0,
                    shape: 'square',
                    rotationSpeed: 0.2,
                    glow: true
                });
            }, i * 20);
        }
    }

    missionComplete(mission) {
        this.uiAnims.showNotification(
            'Misión Completada!',
            mission.title,
            '✅',
            '#00ff88'
        );

        this.particles.spiral(
            this.canvas.width / 2,
            this.canvas.height / 2,
            '#00ff88',
            3
        );
    }

    /**
     * Trails y efectos continuos
     */
    playerTrail(x, y, velocity, color) {
        this.particles.trailEnhanced(x, y, color, velocity);
    }

    enemyTrail(x, y, color = '#ff0000') {
        this.particles.emit(x, y, {
            count: 2,
            color,
            speed: 0.5,
            size: 3,
            life: 0.5,
            gravity: 0,
            spread: Math.PI * 0.5,
            trail: false,
            glow: true,
            glowSize: 5
        });
    }

    powerupActive(x, y, type, duration) {
        const colors = {
            speed: '#00d4ff',
            shield: '#0088ff',
            doublePoints: '#ffdd00',
            magnet: '#ff00ff',
            slowTime: '#8800ff'
        };

        const color = colors[type] || '#ffffff';
        this.particles.powerupAuraEnhanced(x, y, color, duration);
    }

    /**
     * UI Effects
     */
    showFloatingScore(x, y, score, color) {
        this.uiAnims.floatingScore(x, y, score, color);
    }

    showComboMultiplier(x, y, combo, color) {
        this.uiAnims.drawComboMultiplier(this.ctx, x, y, combo, color);
    }

    animateHealthBar(value) {
        this.uiAnims.animateBar('health', value);
    }

    animateXPBar(value) {
        this.uiAnims.animateBar('xp', value);
    }

    /**
     * Special effects
     */
    meteorShower(duration) {
        this.starfield.meteorShower(duration);
    }

    screenFlash(color = '#ffffff', duration = 150) {
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.globalAlpha = 0.5;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }

    /**
     * Utility
     */
    clear() {
        this.particles.clear();
        this.powerupFX.clear();
        this.uiAnims.clear();
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }

    isTransitioning() {
        return this.transitions.isActive();
    }

    // Getters para sistemas individuales
    getStarfield() {
        return this.starfield;
    }

    getPowerUpEffects() {
        return this.powerupFX;
    }

    getTransitions() {
        return this.transitions;
    }

    getUIAnimations() {
        return this.uiAnims;
    }

    getParticles() {
        return this.particles;
    }
}

export default VisualEffectsManager;
