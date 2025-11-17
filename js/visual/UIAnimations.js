/**
 * UI Animations - Animaciones UI IMPRESIONANTES
 * Floating numbers, animated bars, bouncing icons, glowing text
 *
 * Características:
 * - Floating score numbers
 * - Animated health/XP bars
 * - Bouncing achievement notifications
 * - Glowing power-up indicators
 * - Combo multiplier animations
 * - Level up celebrations
 */

export class UIAnimations {
    constructor() {
        this.floatingTexts = [];
        this.notifications = [];
        this.barAnimations = {};
        this.glowingElements = [];
        this.time = 0;
    }

    update(deltaTime) {
        this.time += deltaTime;

        // Update floating texts
        this.floatingTexts = this.floatingTexts.filter(text => {
            text.y -= text.speed * deltaTime * 0.06;
            text.life -= deltaTime;
            text.alpha = Math.min(1, text.life / 500);
            return text.life > 0;
        });

        // Update notifications
        this.notifications = this.notifications.filter(notif => {
            notif.age += deltaTime;

            // Bounce in animation
            if (notif.age < notif.bounceInDuration) {
                const progress = notif.age / notif.bounceInDuration;
                notif.scale = this.easeOutBounce(progress);
            } else if (notif.age > notif.duration - notif.fadeOutDuration) {
                // Fade out
                const fadeProgress = (notif.age - (notif.duration - notif.fadeOutDuration)) / notif.fadeOutDuration;
                notif.alpha = 1 - fadeProgress;
            }

            return notif.age < notif.duration;
        });

        // Update glowing elements
        this.glowingElements.forEach(element => {
            element.glowPhase += deltaTime * 0.003;
            element.glowIntensity = 0.5 + Math.sin(element.glowPhase) * 0.5;
        });
    }

    /**
     * Spawn floating score text
     */
    floatingScore(x, y, score, color = '#ffdd00') {
        this.floatingTexts.push({
            x,
            y,
            text: `+${score}`,
            color,
            life: 1500,
            speed: 1.5,
            alpha: 1,
            size: 24,
            font: 'bold 24px Arial'
        });
    }

    /**
     * Spawn floating text general
     */
    floatingText(x, y, text, options = {}) {
        this.floatingTexts.push({
            x,
            y,
            text,
            color: options.color || '#ffffff',
            life: options.duration || 1500,
            speed: options.speed || 1.5,
            alpha: 1,
            size: options.size || 20,
            font: options.font || `bold ${options.size || 20}px Arial`
        });
    }

    /**
     * Show notification (achievement, level up, etc)
     */
    showNotification(title, subtitle, icon, color = '#00d4ff') {
        this.notifications.push({
            title,
            subtitle,
            icon,
            color,
            age: 0,
            duration: 4000,
            bounceInDuration: 300,
            fadeOutDuration: 500,
            scale: 0,
            alpha: 1,
            y: 100
        });
    }

    /**
     * Animate bar (health, XP, combo timer)
     */
    animateBar(id, targetValue, duration = 300) {
        this.barAnimations[id] = {
            current: this.barAnimations[id]?.target || 0,
            target: targetValue,
            startValue: this.barAnimations[id]?.current || 0,
            duration,
            elapsed: 0
        };
    }

    updateBar(id, deltaTime) {
        const anim = this.barAnimations[id];
        if (!anim) return 0;

        anim.elapsed += deltaTime;
        const progress = Math.min(1, anim.elapsed / anim.duration);

        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        anim.current = anim.startValue + (anim.target - anim.startValue) * eased;

        return anim.current;
    }

    /**
     * Add glowing element
     */
    addGlowingElement(id, x, y, color) {
        const existing = this.glowingElements.find(e => e.id === id);
        if (existing) {
            existing.x = x;
            existing.y = y;
            existing.color = color;
        } else {
            this.glowingElements.push({
                id,
                x,
                y,
                color,
                glowPhase: 0,
                glowIntensity: 1
            });
        }
    }

    removeGlowingElement(id) {
        this.glowingElements = this.glowingElements.filter(e => e.id !== id);
    }

    /**
     * Draw floating texts
     */
    drawFloatingTexts(ctx) {
        ctx.save();

        this.floatingTexts.forEach(text => {
            ctx.font = text.font;
            ctx.fillStyle = text.color;
            ctx.globalAlpha = text.alpha;
            ctx.textAlign = 'center';
            ctx.shadowBlur = 10;
            ctx.shadowColor = text.color;

            ctx.fillText(text.text, text.x, text.y);
        });

        ctx.restore();
    }

    /**
     * Draw notifications
     */
    drawNotifications(ctx, canvasWidth) {
        ctx.save();

        this.notifications.forEach((notif, index) => {
            const x = canvasWidth / 2;
            const y = notif.y + index * 100;

            ctx.save();
            ctx.translate(x, y);
            ctx.scale(notif.scale, notif.scale);
            ctx.globalAlpha = notif.alpha;

            // Background
            const width = 400;
            const height = 80;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            ctx.strokeStyle = notif.color;
            ctx.lineWidth = 3;
            ctx.shadowBlur = 20;
            ctx.shadowColor = notif.color;

            this.roundRect(ctx, -width/2, -height/2, width, height, 10);
            ctx.fill();
            ctx.stroke();

            // Icon
            if (notif.icon) {
                ctx.font = 'bold 40px Arial';
                ctx.fillStyle = notif.color;
                ctx.textAlign = 'left';
                ctx.fillText(notif.icon, -width/2 + 20, 10);
            }

            // Title
            ctx.font = 'bold 24px Arial';
            ctx.fillStyle = notif.color;
            ctx.textAlign = 'center';
            ctx.fillText(notif.title, 0, -5);

            // Subtitle
            if (notif.subtitle) {
                ctx.font = '16px Arial';
                ctx.fillStyle = '#ffffff';
                ctx.fillText(notif.subtitle, 0, 20);
            }

            ctx.restore();
        });

        ctx.restore();
    }

    /**
     * Draw glowing elements
     */
    drawGlowingElements(ctx) {
        ctx.save();

        this.glowingElements.forEach(element => {
            ctx.shadowBlur = 20 * element.glowIntensity;
            ctx.shadowColor = element.color;
            ctx.fillStyle = element.color;
            ctx.globalAlpha = element.glowIntensity;

            ctx.beginPath();
            ctx.arc(element.x, element.y, 5, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }

    /**
     * Draw animated progress bar
     */
    drawAnimatedBar(ctx, x, y, width, height, percentage, color, label = null) {
        const animPercentage = this.updateBar(`bar_${label}`, 16.67) || percentage;

        ctx.save();

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.roundRect(ctx, x, y, width, height, height/2);
        ctx.fill();

        // Border
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Fill
        const fillWidth = (width - 4) * (animPercentage / 100);
        if (fillWidth > 0) {
            const gradient = ctx.createLinearGradient(x, y, x + fillWidth, y);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, this.lightenColor(color, 40));

            ctx.fillStyle = gradient;
            ctx.shadowBlur = 10;
            ctx.shadowColor = color;
            this.roundRect(ctx, x + 2, y + 2, fillWidth, height - 4, height/2 - 1);
            ctx.fill();
        }

        // Label
        if (label) {
            ctx.shadowBlur = 0;
            ctx.font = 'bold 12px Arial';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(label, x + width/2, y + height/2 + 4);
        }

        ctx.restore();
    }

    /**
     * Combo multiplier animation
     */
    drawComboMultiplier(ctx, x, y, combo, color) {
        ctx.save();

        const pulse = 1 + Math.sin(this.time * 0.01) * 0.1;
        const baseSize = 48;
        const size = baseSize * pulse * (1 + combo * 0.02);

        ctx.translate(x, y);
        ctx.scale(pulse, pulse);

        // Glow
        ctx.shadowBlur = 30 + combo * 2;
        ctx.shadowColor = color;

        // Text
        ctx.font = `bold ${size}px Arial`;
        ctx.fillStyle = color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const text = `x${combo}`;
        ctx.strokeText(text, 0, 0);
        ctx.fillText(text, 0, 0);

        // Particles around text
        const particleCount = Math.min(combo, 20);
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + this.time * 0.002;
            const radius = size + 20;
            const px = Math.cos(angle) * radius;
            const py = Math.sin(angle) * radius;

            ctx.fillStyle = color;
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.arc(px, py, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    /**
     * Level up celebration animation
     */
    levelUpAnimation(x, y, level) {
        // Big flashy notification
        this.showNotification(
            `LEVEL ${level}!`,
            '¡Subiste de nivel!',
            '⭐',
            '#ffdd00'
        );

        // Fireworks particles
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            setTimeout(() => {
                this.floatingText(
                    x + Math.cos(angle) * 50,
                    y + Math.sin(angle) * 50,
                    '★',
                    {
                        color: `hsl(${Math.random() * 360}, 100%, 70%)`,
                        duration: 2000,
                        speed: 2,
                        size: 30
                    }
                );
            }, i * 50);
        }
    }

    // Helper methods
    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    easeOutBounce(x) {
        const n1 = 7.5625;
        const d1 = 2.75;

        if (x < 1 / d1) {
            return n1 * x * x;
        } else if (x < 2 / d1) {
            return n1 * (x -= 1.5 / d1) * x + 0.75;
        } else if (x < 2.5 / d1) {
            return n1 * (x -= 2.25 / d1) * x + 0.9375;
        } else {
            return n1 * (x -= 2.625 / d1) * x + 0.984375;
        }
    }

    lightenColor(color, percent) {
        // Simple color lightening (assuming hex color)
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;

        return '#' + (
            0x1000000 +
            (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
            (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
            (B < 255 ? (B < 1 ? 0 : B) : 255)
        ).toString(16).slice(1);
    }

    clear() {
        this.floatingTexts = [];
        this.notifications = [];
        this.glowingElements = [];
    }
}

export default UIAnimations;
