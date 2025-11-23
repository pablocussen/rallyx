/**
 * Sistema de Efectos Visuales Avanzados
 * Combina parallax backgrounds y weather effects para máxima inmersión
 *
 * @class AdvancedVisualEffects
 * @description Sistema con:
 * - Parallax scrolling multicapa
 * - Weather effects (lluvia, nieve, niebla)
 * - Day/night cycle
 * - Dynamic lighting
 * - Environmental particles
 */

export class AdvancedVisualEffects {
    constructor(canvasWidth, canvasHeight) {
        this.width = canvasWidth;
        this.height = canvasHeight;

        // Parallax layers
        this.parallaxLayers = this._initParallaxLayers();
        this.cameraX = 0;
        this.cameraY = 0;

        // Weather system
        this.currentWeather = 'clear'; // clear, rain, snow, fog
        this.weatherParticles = [];
        this.maxWeatherParticles = 200;

        // Day/night cycle
        this.timeOfDay = 0; // 0-24 hours
        this.dayNightSpeed = 0.01; // Velocidad del ciclo
        this.enableDayNight = false;

        // Lighting
        this.ambientLight = 1.0; // 0-1
        this.lightSources = [];
    }

    /**
     * Inicializa capas de parallax
     * @private
     */
    _initParallaxLayers() {
        return [
            {
                name: 'far-stars',
                depth: 0.1, // Más lejos = menor profundidad
                speed: 0.1,
                elements: this._generateStars(50, 0.5),
                color: '#ffffff',
                alpha: 0.3
            },
            {
                name: 'mid-stars',
                depth: 0.3,
                speed: 0.3,
                elements: this._generateStars(30, 1.0),
                color: '#ffffff',
                alpha: 0.6
            },
            {
                name: 'near-stars',
                depth: 0.5,
                speed: 0.5,
                elements: this._generateStars(20, 1.5),
                color: '#ffffff',
                alpha: 0.9
            },
            {
                name: 'nebula',
                depth: 0.2,
                speed: 0.2,
                elements: this._generateNebulae(5),
                color: 'gradient',
                alpha: 0.2
            }
        ];
    }

    /**
     * Genera estrellas para parallax
     * @private
     */
    _generateStars(count, sizeMultiplier = 1.0) {
        const stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * this.width * 2,
                y: Math.random() * this.height * 2,
                size: (Math.random() * 2 + 1) * sizeMultiplier,
                brightness: Math.random() * 0.5 + 0.5,
                twinkleSpeed: Math.random() * 0.02 + 0.01
            });
        }
        return stars;
    }

    /**
     * Genera nebulosas para el fondo
     * @private
     */
    _generateNebulae(count) {
        const nebulae = [];
        const colors = ['#ff00ff', '#00ffff', '#ff00aa', '#aa00ff'];

        for (let i = 0; i < count; i++) {
            nebulae.push({
                x: Math.random() * this.width * 2,
                y: Math.random() * this.height * 2,
                radius: Math.random() * 100 + 50,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: Math.random() * 0.3 + 0.1
            });
        }
        return nebulae;
    }

    /**
     * Actualiza la cámara para parallax
     * @param {number} x - Posición X de la cámara
     * @param {number} y - Posición Y de la cámara
     */
    updateCamera(x, y) {
        this.cameraX = x;
        this.cameraY = y;
    }

    /**
     * Cambia el clima
     * @param {string} weather - Tipo de clima (clear, rain, snow, fog)
     */
    setWeather(weather) {
        if (this.currentWeather === weather) return;

        this.currentWeather = weather;
        this.weatherParticles = [];

        console.log(`🌦️ Clima cambiado a: ${weather}`);
    }

    /**
     * Actualiza efectos visuales
     * @param {number} deltaTime - Delta en segundos
     */
    update(deltaTime) {
        // Actualizar day/night cycle
        if (this.enableDayNight) {
            this.timeOfDay = (this.timeOfDay + this.dayNightSpeed * deltaTime) % 24;
            this.ambientLight = this._calculateAmbientLight();
        }

        // Actualizar estrellas (twinkle)
        this.parallaxLayers.forEach(layer => {
            if (layer.name.includes('stars')) {
                layer.elements.forEach(star => {
                    star.brightness = 0.5 + Math.sin(Date.now() * star.twinkleSpeed) * 0.5;
                });
            }
        });

        // Actualizar clima
        this._updateWeather(deltaTime);
    }

    /**
     * Actualiza partículas de clima
     * @param {number} deltaTime - Delta en segundos
     * @private
     */
    _updateWeather(deltaTime) {
        // Generar nuevas partículas si es necesario
        while (this.weatherParticles.length < this.maxWeatherParticles &&
               this.currentWeather !== 'clear') {
            this.weatherParticles.push(this._createWeatherParticle());
        }

        // Actualizar y limpiar partículas
        for (let i = this.weatherParticles.length - 1; i >= 0; i--) {
            const p = this.weatherParticles[i];

            switch (this.currentWeather) {
                case 'rain':
                    p.y += p.speed * deltaTime;
                    p.x += p.wind * deltaTime;
                    if (p.y > this.height) {
                        this.weatherParticles.splice(i, 1);
                    }
                    break;

                case 'snow':
                    p.y += p.speed * deltaTime;
                    p.x += Math.sin(p.y * 0.01) * 0.5;
                    p.rotation += 0.01;
                    if (p.y > this.height) {
                        this.weatherParticles.splice(i, 1);
                    }
                    break;

                case 'fog':
                    p.x += p.speed * deltaTime;
                    p.y += Math.sin(Date.now() * 0.001 + p.offset) * 0.2;
                    if (p.x > this.width + p.size) {
                        p.x = -p.size;
                    }
                    break;
            }
        }
    }

    /**
     * Crea una partícula de clima
     * @private
     */
    _createWeatherParticle() {
        const particle = {
            x: Math.random() * this.width,
            y: -10,
            wind: 0,
            offset: Math.random() * Math.PI * 2
        };

        switch (this.currentWeather) {
            case 'rain':
                particle.speed = Math.random() * 400 + 300;
                particle.length = Math.random() * 20 + 10;
                particle.width = Math.random() * 1 + 0.5;
                particle.wind = Math.random() * 20 - 10;
                particle.alpha = Math.random() * 0.3 + 0.3;
                break;

            case 'snow':
                particle.speed = Math.random() * 50 + 30;
                particle.size = Math.random() * 4 + 2;
                particle.rotation = Math.random() * Math.PI * 2;
                particle.alpha = Math.random() * 0.6 + 0.4;
                break;

            case 'fog':
                particle.y = Math.random() * this.height;
                particle.x = -100;
                particle.speed = Math.random() * 20 + 10;
                particle.size = Math.random() * 200 + 100;
                particle.alpha = Math.random() * 0.1 + 0.05;
                break;
        }

        return particle;
    }

    /**
     * Calcula luz ambiental según hora del día
     * @private
     */
    _calculateAmbientLight() {
        // 0 = medianoche, 12 = mediodía
        const normalizedTime = Math.abs(12 - this.timeOfDay) / 12;
        return 0.3 + (0.7 * (1 - normalizedTime));
    }

    /**
     * Dibuja todos los efectos visuales
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    draw(ctx) {
        ctx.save();

        // Dibujar parallax layers (de atrás hacia adelante)
        this._drawParallax(ctx);

        // Dibujar clima
        this._drawWeather(ctx);

        // Aplicar lighting
        if (this.enableDayNight) {
            this._applyLighting(ctx);
        }

        ctx.restore();
    }

    /**
     * Dibuja capas de parallax
     * @private
     */
    _drawParallax(ctx) {
        this.parallaxLayers.forEach(layer => {
            ctx.save();
            ctx.globalAlpha = layer.alpha;

            // Calcular offset basado en cámara y profundidad
            const offsetX = -this.cameraX * layer.speed;
            const offsetY = -this.cameraY * layer.speed;

            if (layer.name.includes('stars')) {
                // Dibujar estrellas
                layer.elements.forEach(star => {
                    const x = (star.x + offsetX) % (this.width * 2);
                    const y = (star.y + offsetY) % (this.height * 2);

                    ctx.fillStyle = layer.color;
                    ctx.globalAlpha = layer.alpha * star.brightness;
                    ctx.beginPath();
                    ctx.arc(x, y, star.size, 0, Math.PI * 2);
                    ctx.fill();
                });
            } else if (layer.name === 'nebula') {
                // Dibujar nebulosas
                layer.elements.forEach(nebula => {
                    const x = (nebula.x + offsetX) % (this.width * 2);
                    const y = (nebula.y + offsetY) % (this.height * 2);

                    const gradient = ctx.createRadialGradient(x, y, 0, x, y, nebula.radius);
                    gradient.addColorStop(0, nebula.color);
                    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

                    ctx.fillStyle = gradient;
                    ctx.globalAlpha = nebula.alpha;
                    ctx.beginPath();
                    ctx.arc(x, y, nebula.radius, 0, Math.PI * 2);
                    ctx.fill();
                });
            }

            ctx.restore();
        });
    }

    /**
     * Dibuja efectos de clima
     * @private
     */
    _drawWeather(ctx) {
        if (this.currentWeather === 'clear') return;

        ctx.save();

        this.weatherParticles.forEach(p => {
            ctx.globalAlpha = p.alpha;

            switch (this.currentWeather) {
                case 'rain':
                    ctx.strokeStyle = '#aaaaff';
                    ctx.lineWidth = p.width;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x + p.wind * 0.1, p.y + p.length);
                    ctx.stroke();
                    break;

                case 'snow':
                    ctx.fillStyle = '#ffffff';
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rotation);
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                    break;

                case 'fog':
                    const gradient = ctx.createRadialGradient(
                        p.x, p.y, 0,
                        p.x, p.y, p.size
                    );
                    gradient.addColorStop(0, 'rgba(200, 200, 200, ' + p.alpha + ')');
                    gradient.addColorStop(1, 'rgba(200, 200, 200, 0)');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
                    break;
            }
        });

        ctx.restore();
    }

    /**
     * Aplica overlay de lighting
     * @private
     */
    _applyLighting(ctx) {
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = `rgba(0, 0, 30, ${1 - this.ambientLight})`;
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.restore();
    }

    /**
     * Añade una fuente de luz dinámica
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @param {number} radius - Radio de la luz
     * @param {string} color - Color de la luz
     * @param {number} intensity - Intensidad (0-1)
     */
    addLight(x, y, radius, color = '#ffffff', intensity = 1.0) {
        this.lightSources.push({ x, y, radius, color, intensity });
    }

    /**
     * Limpia todas las luces dinámicas
     */
    clearLights() {
        this.lightSources = [];
    }

    /**
     * Activa/desactiva el ciclo día/noche
     * @param {boolean} enabled - Estado
     */
    setDayNightCycle(enabled) {
        this.enableDayNight = enabled;
    }

    /**
     * Obtiene el clima actual
     * @returns {string} Clima actual
     */
    getCurrentWeather() {
        return this.currentWeather;
    }

    /**
     * Obtiene la hora del día (0-24)
     * @returns {number} Hora
     */
    getTimeOfDay() {
        return this.timeOfDay;
    }
}

export default AdvancedVisualEffects;
