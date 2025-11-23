/**
 * Sistema de Configuración de Calidad Gráfica
 * Permite ajustar el rendimiento del juego según el dispositivo
 *
 * @class QualitySettings
 * @description Gestiona presets de calidad y configuración dinámica:
 * - Presets: Low, Medium, High, Ultra
 * - Auto-detección basada en dispositivo
 * - Configuración persistente
 */

import Storage from '../utils/Storage.js';

export class QualitySettings {
    constructor() {
        this.presets = {
            low: {
                name: 'Bajo',
                maxParticles: 100,
                particleQuality: 0.5,
                enableShadows: false,
                enableGlow: false,
                enableTrails: false,
                targetFPS: 30,
                renderScale: 0.75
            },
            medium: {
                name: 'Medio',
                maxParticles: 250,
                particleQuality: 0.75,
                enableShadows: false,
                enableGlow: true,
                enableTrails: false,
                targetFPS: 60,
                renderScale: 1.0
            },
            high: {
                name: 'Alto',
                maxParticles: 500,
                particleQuality: 1.0,
                enableShadows: true,
                enableGlow: true,
                enableTrails: true,
                targetFPS: 60,
                renderScale: 1.0
            },
            ultra: {
                name: 'Ultra',
                maxParticles: 1000,
                particleQuality: 1.0,
                enableShadows: true,
                enableGlow: true,
                enableTrails: true,
                targetFPS: 60,
                renderScale: 1.0,
                enableMotionBlur: true
            }
        };

        this.current = this._loadSettings();
        this.listeners = [];
    }

    /**
     * Carga la configuración guardada o auto-detecta
     * @returns {string} Preset name
     * @private
     */
    _loadSettings() {
        const saved = Storage.get('rallyx_quality', null);

        if (saved && this.presets[saved]) {
            return saved;
        }

        // Auto-detect calidad basado en dispositivo
        return this._autoDetectQuality();
    }

    /**
     * Auto-detecta la calidad óptima basándose en el dispositivo
     * @returns {string} Preset name
     * @private
     */
    _autoDetectQuality() {
        // Detectar si es móvil
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Detectar cores de CPU (si está disponible)
        const cores = navigator.hardwareConcurrency || 2;

        // Detectar memoria (si está disponible)
        const memory = navigator.deviceMemory || 4; // GB

        if (isMobile) {
            // Dispositivos móviles: low o medium
            return memory >= 4 ? 'medium' : 'low';
        } else {
            // Desktop: basado en cores y memoria
            if (cores >= 8 && memory >= 8) {
                return 'ultra';
            } else if (cores >= 4 && memory >= 4) {
                return 'high';
            } else {
                return 'medium';
            }
        }
    }

    /**
     * Obtiene la configuración actual
     * @returns {Object} Current quality settings
     */
    getSettings() {
        return { ...this.presets[this.current] };
    }

    /**
     * Obtiene el preset actual
     * @returns {string} Current preset name
     */
    getCurrentPreset() {
        return this.current;
    }

    /**
     * Establece un preset de calidad
     * @param {string} preset - Nombre del preset
     * @returns {boolean} Éxito de la operación
     */
    setPreset(preset) {
        if (!this.presets[preset]) {
            console.warn(`Preset desconocido: ${preset}`);
            return false;
        }

        this.current = preset;
        Storage.set('rallyx_quality', preset);
        this._notifyListeners();
        return true;
    }

    /**
     * Obtiene todos los presets disponibles
     * @returns {Array} Lista de presets con info
     */
    getAvailablePresets() {
        return Object.keys(this.presets).map(key => ({
            id: key,
            name: this.presets[key].name,
            description: this._getPresetDescription(key)
        }));
    }

    /**
     * Genera descripción de un preset
     * @param {string} preset - Nombre del preset
     * @returns {string} Descripción
     * @private
     */
    _getPresetDescription(preset) {
        const settings = this.presets[preset];
        const features = [];

        if (settings.enableShadows) features.push('Sombras');
        if (settings.enableGlow) features.push('Glow');
        if (settings.enableTrails) features.push('Estelas');
        if (settings.enableMotionBlur) features.push('Motion blur');

        return `${settings.maxParticles} partículas${features.length > 0 ? ', ' + features.join(', ') : ''}`;
    }

    /**
     * Agrega un listener para cambios de calidad
     * @param {Function} callback - Función a ejecutar al cambiar calidad
     */
    addChangeListener(callback) {
        this.listeners.push(callback);
    }

    /**
     * Notifica a los listeners de cambios
     * @private
     */
    _notifyListeners() {
        const settings = this.getSettings();
        this.listeners.forEach(callback => {
            try {
                callback(settings, this.current);
            } catch (error) {
                console.error('Error en listener de calidad:', error);
            }
        });
    }

    /**
     * Aplica la configuración a los sistemas del juego
     * @param {Object} game - Instancia del juego
     */
    applyToGame(game) {
        const settings = this.getSettings();

        // Aplicar a sistema de partículas
        if (game.particles) {
            game.particles.maxParticles = settings.maxParticles;
        }

        // Aplicar a canvas (render scale)
        if (game.canvas && settings.renderScale !== 1.0) {
            const width = game.canvas.width;
            const height = game.canvas.height;
            game.canvas.style.width = width + 'px';
            game.canvas.style.height = height + 'px';
            game.canvas.width = width * settings.renderScale;
            game.canvas.height = height * settings.renderScale;
        }

        console.log(`✅ Calidad aplicada: ${settings.name}`);
    }

    /**
     * Obtiene estadísticas de rendimiento recomendadas
     * @returns {Object} Performance stats
     */
    getPerformanceStats() {
        const settings = this.getSettings();
        return {
            preset: this.current,
            targetFPS: settings.targetFPS,
            maxParticles: settings.maxParticles,
            renderScale: settings.renderScale,
            estimatedMemory: Math.round(settings.maxParticles * 0.001) + 'MB' // Rough estimate
        };
    }
}

export default QualitySettings;
