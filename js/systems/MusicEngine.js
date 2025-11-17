/**
 * Music Engine - Sistema de Música Procedural Dinámica
 * Música que responde al juego, crea atmósfera, da VIDA
 *
 * Características:
 * - Música generada proceduralmente con Web Audio API
 * - Se adapta a tensión, combos, health, game mode
 * - Capas que entran/salen dinámicamente
 * - BPM variable según intensidad
 * - Transiciones suaves entre estados
 */

export class MusicEngine {
    constructor() {
        this.audioContext = null;
        this.isInitialized = false;
        this.isPlaying = false;
        this.masterVolume = 0.3;

        // Estado musical
        this.musicState = {
            intensity: 0.5, // 0-1
            tension: 0, // 0-1
            bpm: 120,
            baseBPM: 120,
            minBPM: 90,
            maxBPM: 180
        };

        // Capas de música (se activan/desactivan según estado)
        this.layers = {
            bass: null,        // Capa base, siempre activa
            melody: null,      // Melodía principal
            drums: null,       // Percusión
            synth: null,       // Sintetizadores atmosféricos
            arpeggios: null,   // Arpeggios para combos altos
            tensionDrone: null // Drone para momentos tensos
        };

        // Nodos de audio
        this.nodes = {
            masterGain: null,
            bassGain: null,
            melodyGain: null,
            drumsGain: null,
            synthGain: null,
            arpeggioGain: null,
            droneGain: null,
            compressor: null,
            filter: null
        };

        // Escalas musicales para diferentes modos
        this.scales = {
            classic: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00], // C Mayor (alegre)
            survival: [220.00, 246.94, 261.63, 293.66, 311.13, 349.23], // A Menor (tensión)
            chaos: [277.18, 311.13, 369.99, 415.30, 466.16, 554.37], // Cromática (caótico)
            fever: [392.00, 440.00, 493.88, 523.25, 587.33, 659.25] // C Mayor octava alta (energía)
        };

        this.currentScale = this.scales.classic;

        // Patrones rítmicos
        this.patterns = {
            bass: [1, 0, 0, 0, 1, 0, 0, 0], // Kick en 1 y 5
            drums: [0, 0, 1, 0, 0, 0, 1, 0], // Snare en 3 y 7
            hihat: [1, 1, 1, 1, 1, 1, 1, 1]  // Hi-hat constante
        };

        // Secuenciadores
        this.sequencers = {
            bass: { index: 0, interval: null },
            drums: { index: 0, interval: null },
            melody: { index: 0, interval: null },
            arpeggio: { index: 0, interval: null }
        };
    }

    /**
     * Inicializar audio context (requiere interacción del usuario)
     */
    init() {
        if (this.isInitialized) return true;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Crear nodos principales
            this.nodes.masterGain = this.audioContext.createGain();
            this.nodes.masterGain.gain.value = this.masterVolume;

            // Compressor para evitar clipping
            this.nodes.compressor = this.audioContext.createDynamicsCompressor();
            this.nodes.compressor.threshold.value = -20;
            this.nodes.compressor.ratio.value = 12;

            // Filtro para efectos
            this.nodes.filter = this.audioContext.createBiquadFilter();
            this.nodes.filter.type = 'lowpass';
            this.nodes.filter.frequency.value = 5000;

            // Crear gain nodes para cada capa
            this.nodes.bassGain = this.createGainNode(0.6);
            this.nodes.melodyGain = this.createGainNode(0.4);
            this.nodes.drumsGain = this.createGainNode(0.5);
            this.nodes.synthGain = this.createGainNode(0.3);
            this.nodes.arpeggioGain = this.createGainNode(0.3);
            this.nodes.droneGain = this.createGainNode(0.0); // Empieza silenciado

            // Conectar cadena de audio
            this.nodes.bassGain.connect(this.nodes.filter);
            this.nodes.melodyGain.connect(this.nodes.filter);
            this.nodes.drumsGain.connect(this.nodes.filter);
            this.nodes.synthGain.connect(this.nodes.filter);
            this.nodes.arpeggioGain.connect(this.nodes.filter);
            this.nodes.droneGain.connect(this.nodes.filter);

            this.nodes.filter.connect(this.nodes.compressor);
            this.nodes.compressor.connect(this.nodes.masterGain);
            this.nodes.masterGain.connect(this.audioContext.destination);

            this.isInitialized = true;
            console.log('🎵 Music Engine inicializado');
            return true;
        } catch (error) {
            console.error('Error inicializando audio:', error);
            return false;
        }
    }

    /**
     * Crear gain node helper
     */
    createGainNode(initialValue = 0) {
        const gain = this.audioContext.createGain();
        gain.gain.value = initialValue;
        return gain;
    }

    /**
     * Iniciar música
     */
    start(gameMode = 'classic') {
        if (!this.isInitialized && !this.init()) {
            console.warn('No se pudo inicializar audio');
            return false;
        }

        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        // Seleccionar escala según modo
        this.currentScale = this.scales[gameMode] || this.scales.classic;

        // Iniciar capas base
        this.startBassLayer();
        this.startDrumsLayer();
        this.startMelodyLayer();
        this.startSynthLayer();

        this.isPlaying = true;
        console.log('🎵 Música iniciada');
        return true;
    }

    /**
     * Detener música
     */
    stop() {
        // Detener secuenciadores
        Object.values(this.sequencers).forEach(seq => {
            if (seq.interval) {
                clearInterval(seq.interval);
                seq.interval = null;
            }
        });

        // Fade out
        if (this.nodes.masterGain) {
            this.nodes.masterGain.gain.linearRampToValueAtTime(
                0,
                this.audioContext.currentTime + 1
            );
        }

        this.isPlaying = false;
        console.log('🎵 Música detenida');
    }

    /**
     * Capa de bajo (siempre activa)
     */
    startBassLayer() {
        const beatLength = 60 / this.musicState.bpm / 2; // 8th notes

        this.sequencers.bass.interval = setInterval(() => {
            const step = this.sequencers.bass.index % this.patterns.bass.length;

            if (this.patterns.bass[step] === 1) {
                this.playBass(this.currentScale[0]); // Tónica
            }

            this.sequencers.bass.index++;
        }, beatLength * 1000);
    }

    /**
     * Tocar nota de bajo
     */
    playBass(frequency) {
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.value = frequency / 2; // Octava baja

        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.connect(gain);
        gain.connect(this.nodes.bassGain);

        osc.start(now);
        osc.stop(now + 0.3);
    }

    /**
     * Capa de percusión
     */
    startDrumsLayer() {
        const beatLength = 60 / this.musicState.bpm / 2;

        this.sequencers.drums.interval = setInterval(() => {
            const step = this.sequencers.drums.index % this.patterns.drums.length;

            if (this.patterns.drums[step] === 1) {
                this.playSnare();
            }

            if (this.patterns.hihat[step] === 1) {
                this.playHihat();
            }

            this.sequencers.drums.index++;
        }, beatLength * 1000);
    }

    /**
     * Tocar snare
     */
    playSnare() {
        const now = this.audioContext.currentTime;
        const noise = this.audioContext.createBufferSource();
        const buffer = this.createNoiseBuffer();
        noise.buffer = buffer;

        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1000;

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.nodes.drumsGain);

        noise.start(now);
        noise.stop(now + 0.1);
    }

    /**
     * Tocar hi-hat
     */
    playHihat() {
        const now = this.audioContext.currentTime;
        const noise = this.audioContext.createBufferSource();
        const buffer = this.createNoiseBuffer();
        noise.buffer = buffer;

        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 5000;

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.nodes.drumsGain);

        noise.start(now);
        noise.stop(now + 0.05);
    }

    /**
     * Crear buffer de ruido blanco para percusión
     */
    createNoiseBuffer() {
        const bufferSize = this.audioContext.sampleRate * 0.1;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        return buffer;
    }

    /**
     * Capa de melodía
     */
    startMelodyLayer() {
        const beatLength = 60 / this.musicState.bpm;

        this.sequencers.melody.interval = setInterval(() => {
            const noteIndex = Math.floor(Math.random() * this.currentScale.length);
            const frequency = this.currentScale[noteIndex];
            this.playMelodyNote(frequency);

            this.sequencers.melody.index++;
        }, beatLength * 1000 * 2); // Cada 2 beats
    }

    /**
     * Tocar nota melódica
     */
    playMelodyNote(frequency) {
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'triangle';
        osc.frequency.value = frequency;

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        osc.connect(gain);
        gain.connect(this.nodes.melodyGain);

        osc.start(now);
        osc.stop(now + 0.5);
    }

    /**
     * Capa de sintetizadores atmosféricos
     */
    startSynthLayer() {
        const playPad = () => {
            const now = this.audioContext.currentTime;

            this.currentScale.forEach((freq, i) => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();

                osc.type = 'sawtooth';
                osc.frequency.value = freq / 2;

                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.05, now + 0.5);
                gain.gain.setValueAtTime(0.05, now + 4);
                gain.gain.linearRampToValueAtTime(0, now + 5);

                osc.connect(gain);
                gain.connect(this.nodes.synthGain);

                osc.start(now);
                osc.stop(now + 5);
            });

            setTimeout(playPad, 4000);
        };

        playPad();
    }

    /**
     * Iniciar arpeggios (para combos altos / fever mode)
     */
    startArpeggios() {
        if (this.sequencers.arpeggio.interval) return; // Ya activo

        const beatLength = 60 / this.musicState.bpm / 4; // 16th notes

        this.sequencers.arpeggio.interval = setInterval(() => {
            const noteIndex = this.sequencers.arpeggio.index % this.currentScale.length;
            const frequency = this.currentScale[noteIndex] * 2; // Octava alta
            this.playArpeggioNote(frequency);

            this.sequencers.arpeggio.index++;
        }, beatLength * 1000);
    }

    /**
     * Detener arpeggios
     */
    stopArpeggios() {
        if (this.sequencers.arpeggio.interval) {
            clearInterval(this.sequencers.arpeggio.interval);
            this.sequencers.arpeggio.interval = null;

            // Fade out
            this.nodes.arpeggioGain.gain.linearRampToValueAtTime(
                0,
                this.audioContext.currentTime + 0.5
            );
        }
    }

    /**
     * Tocar nota de arpegio
     */
    playArpeggioNote(frequency) {
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'square';
        osc.frequency.value = frequency;

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.connect(gain);
        gain.connect(this.nodes.arpeggioGain);

        osc.start(now);
        osc.stop(now + 0.2);
    }

    /**
     * Actualizar música según estado del juego
     */
    update(gameState) {
        if (!this.isPlaying || !this.audioContext) return;

        const { health, combo, tension, feverMode, intensity } = gameState;

        // Validar y sanitizar valores (prevenir NaN)
        const safeHealth = Number.isFinite(health) ? Math.max(0, Math.min(100, health)) : 100;
        const safeCombo = Number.isFinite(combo) ? Math.max(0, combo) : 0;
        const safeTension = Number.isFinite(tension) ? Math.max(0, Math.min(1, tension)) : 0;
        const safeIntensity = Number.isFinite(intensity) ? Math.max(0, Math.min(1, intensity)) : 0.5;

        // Calcular nueva intensidad (0-1)
        this.musicState.intensity = Math.max(
            safeIntensity,
            safeCombo / 50, // Combo aumenta intensidad
            (100 - safeHealth) / 100, // Health bajo aumenta intensidad
            safeTension
        );

        // Ajustar BPM según intensidad
        const targetBPM = this.musicState.baseBPM +
            (this.musicState.maxBPM - this.musicState.baseBPM) * this.musicState.intensity;
        this.musicState.bpm = targetBPM;

        // Ajustar volúmenes de capas
        const now = this.audioContext.currentTime;

        // Melody: más fuerte con combos altos
        const melodyVolume = Math.max(0, Math.min(1, 0.2 + (safeCombo / 100) * 0.4));
        this.nodes.melodyGain.gain.linearRampToValueAtTime(melodyVolume, now + 0.5);

        // Drums: más intensos con tensión alta
        const drumsVolume = Math.max(0, Math.min(1, 0.3 + safeTension * 0.4));
        this.nodes.drumsGain.gain.linearRampToValueAtTime(drumsVolume, now + 0.5);

        // Drone de tensión: activo cuando health bajo
        const droneVolume = safeHealth < 30 ? Math.max(0, Math.min(1, (30 - safeHealth) / 30 * 0.3)) : 0;
        this.nodes.droneGain.gain.linearRampToValueAtTime(droneVolume, now + 1);

        // Arpeggios: activos en fever mode o combo alto
        if (feverMode || safeCombo >= 15) {
            if (!this.sequencers.arpeggio.interval) {
                this.startArpeggios();
                this.nodes.arpeggioGain.gain.linearRampToValueAtTime(0.3, now + 0.5);
            }
        } else {
            this.stopArpeggios();
        }

        // Filtro: se abre con intensidad alta
        const filterFreq = 1000 + (this.musicState.intensity * 8000);
        this.nodes.filter.frequency.linearRampToValueAtTime(filterFreq, now + 0.5);
    }

    /**
     * Trigger evento musical especial
     */
    triggerEvent(eventType) {
        switch (eventType) {
            case 'milestone':
                this.playFanfare();
                break;
            case 'death':
                this.playDeathSound();
                break;
            case 'levelComplete':
                this.playVictoryChord();
                break;
            case 'feverStart':
                this.startArpeggios();
                break;
            case 'feverEnd':
                this.stopArpeggios();
                break;
        }
    }

    /**
     * Tocar fanfare (milestone alcanzado)
     */
    playFanfare() {
        const now = this.audioContext.currentTime;
        [0, 2, 4, 5].forEach((noteIndex, i) => {
            const freq = this.currentScale[noteIndex] * 2;
            setTimeout(() => this.playMelodyNote(freq), i * 100);
        });
    }

    /**
     * Sonido de muerte
     */
    playDeathSound() {
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.5);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        osc.connect(gain);
        gain.connect(this.nodes.masterGain);

        osc.start(now);
        osc.stop(now + 0.5);
    }

    /**
     * Acorde de victoria
     */
    playVictoryChord() {
        const now = this.audioContext.currentTime;
        [0, 2, 4].forEach((noteIndex) => {
            const freq = this.currentScale[noteIndex] * 2;
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 2);

            osc.connect(gain);
            gain.connect(this.nodes.masterGain);

            osc.start(now);
            osc.stop(now + 2);
        });
    }

    /**
     * Cambiar volumen maestro
     */
    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.nodes.masterGain) {
            this.nodes.masterGain.gain.linearRampToValueAtTime(
                this.masterVolume,
                this.audioContext.currentTime + 0.1
            );
        }
    }

    /**
     * Obtener estado para debugging
     */
    getStatus() {
        return {
            isPlaying: this.isPlaying,
            bpm: this.musicState.bpm,
            intensity: this.musicState.intensity,
            arpeggiosActive: !!this.sequencers.arpeggio.interval
        };
    }
}

export default MusicEngine;
