/**
 * Sistema de Audio Optimizado
 * Gestiona música y efectos de sonido usando Web Audio API
 *
 * @class AudioManager
 * @description Sistema de audio con optimizaciones:
 * - Límite de canales simultáneos
 * - Pooling de nodos de audio
 * - Prevención de spam de sonidos
 */

export class AudioManager {
    constructor() {
        this.context = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.enabled = true;
        this.sounds = {};

        // Optimizaciones de audio
        this.maxConcurrentSounds = 8; // Máximo de sonidos simultáneos
        this.activeSounds = new Set();
        this.soundCooldowns = new Map(); // Anti-spam
        this.minSoundInterval = 50; // ms mínimo entre sonidos del mismo tipo

        this.init();
    }

    init() {
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();

            // Nodos de ganancia
            this.masterGain = this.context.createGain();
            this.musicGain = this.context.createGain();
            this.sfxGain = this.context.createGain();

            this.musicGain.connect(this.masterGain);
            this.sfxGain.connect(this.masterGain);
            this.masterGain.connect(this.context.destination);

            this.setVolume('master', 0.7);
            this.setVolume('music', 0.5);
            this.setVolume('sfx', 0.8);
        } catch (error) {
            console.warn('Web Audio API no disponible:', error);
            this.enabled = false;
        }
    }

    setVolume(type, value) {
        if (!this.enabled) return;

        const clampedValue = Math.max(0, Math.min(1, value));

        switch(type) {
            case 'master':
                this.masterGain.gain.value = clampedValue;
                break;
            case 'music':
                this.musicGain.gain.value = clampedValue;
                break;
            case 'sfx':
                this.sfxGain.gain.value = clampedValue;
                break;
        }
    }

    /**
     * Verifica si se puede reproducir un sonido (anti-spam)
     * @param {string} soundId - ID del sonido
     * @returns {boolean}
     * @private
     */
    _canPlaySound(soundId) {
        const now = Date.now();
        const lastPlayed = this.soundCooldowns.get(soundId) || 0;

        if (now - lastPlayed < this.minSoundInterval) {
            return false; // Cooldown activo
        }

        if (this.activeSounds.size >= this.maxConcurrentSounds) {
            return false; // Demasiados sonidos simultáneos
        }

        return true;
    }

    /**
     * Registra que un sonido fue reproducido
     * @param {string} soundId - ID del sonido
     * @param {Object} soundRef - Referencia al oscillator/nodo
     * @private
     */
    _registerSound(soundId, soundRef) {
        this.soundCooldowns.set(soundId, Date.now());
        this.activeSounds.add(soundRef);
    }

    /**
     * Limpia un sonido terminado
     * @param {Object} soundRef - Referencia al oscillator/nodo
     * @private
     */
    _cleanupSound(soundRef) {
        this.activeSounds.delete(soundRef);
    }

    /**
     * Genera tonos sintéticos con limitación de canales
     * @param {number} frequency - Frecuencia en Hz
     * @param {number} duration - Duración en segundos
     * @param {string} type - Tipo de onda (sine, square, etc)
     * @param {number} gain - Volumen
     * @param {string} soundId - ID para anti-spam (opcional)
     */
    playTone(frequency, duration = 0.1, type = 'sine', gain = 0.3, soundId = null) {
        if (!this.enabled) return;

        // Verificar anti-spam si se proporciona soundId
        if (soundId && !this._canPlaySound(soundId)) {
            return;
        }

        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.type = type;
        oscillator.frequency.value = frequency;

        gainNode.gain.setValueAtTime(gain, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGain);

        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + duration);

        // Registrar sonido activo
        if (soundId) {
            this._registerSound(soundId, oscillator);
        } else {
            this.activeSounds.add(oscillator);
        }

        // Cleanup automático cuando termine
        oscillator.addEventListener('ended', () => {
            this._cleanupSound(oscillator);
        });
    }

    // Efectos de sonido específicos del juego
    playSound(soundType) {
        if (!this.enabled) return;

        switch(soundType) {
            case 'flag_collect':
                this.playTone(800, 0.1, 'square', 0.2);
                setTimeout(() => this.playTone(1200, 0.1, 'square', 0.15), 50);
                break;

            case 'powerup_collect':
                this.playTone(400, 0.05, 'sine', 0.2);
                setTimeout(() => this.playTone(600, 0.05, 'sine', 0.2), 50);
                setTimeout(() => this.playTone(800, 0.1, 'sine', 0.2), 100);
                break;

            case 'collision':
                this.playTone(100, 0.2, 'sawtooth', 0.3);
                break;

            case 'game_over':
                this.playTone(300, 0.2, 'sine', 0.25);
                setTimeout(() => this.playTone(250, 0.2, 'sine', 0.25), 150);
                setTimeout(() => this.playTone(200, 0.3, 'sine', 0.25), 300);
                break;

            case 'level_complete':
                [400, 500, 600, 800].forEach((freq, i) => {
                    setTimeout(() => this.playTone(freq, 0.15, 'triangle', 0.2), i * 100);
                });
                break;

            case 'menu_select':
                this.playTone(600, 0.05, 'square', 0.15);
                break;

            case 'menu_hover':
                this.playTone(400, 0.03, 'sine', 0.1);
                break;

            case 'combo':
                this.playTone(1000, 0.08, 'triangle', 0.2);
                setTimeout(() => this.playTone(1200, 0.08, 'triangle', 0.2), 40);
                break;

            case 'shield_activate':
                this.playTone(600, 0.15, 'sine', 0.2);
                setTimeout(() => this.playTone(900, 0.15, 'sine', 0.2), 80);
                break;
        }
    }

    // Música ambiente (tono continuo que cambia con el juego)
    playBackgroundAmbience() {
        if (!this.enabled) return;

        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.type = 'triangle';
        oscillator.frequency.value = 110; // A2

        gainNode.gain.value = 0.03;

        oscillator.connect(gainNode);
        gainNode.connect(this.musicGain);

        oscillator.start();

        return {
            oscillator,
            gainNode,
            stop: () => {
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.5);
                setTimeout(() => oscillator.stop(), 500);
            }
        };
    }

    mute(muted = true) {
        this.enabled = !muted;
        if (this.masterGain) {
            this.masterGain.gain.value = muted ? 0 : 0.7;
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        this.mute(!this.enabled);
    }
}

export default AudioManager;
