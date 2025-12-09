/**
 * RallyX - Configuración Global
 * Todos los ajustes y constantes del juego
 */

export const CONFIG = {
    // Canvas y Visuales
    CANVAS: {
        WIDTH: 960,
        HEIGHT: 640,
        BACKGROUND: '#0a0e27',
        GRID_SIZE: 40,
        PARTICLE_COUNT: 100
    },

    // Jugador
    PLAYER: {
        SIZE: 32,
        BASE_SPEED: 6,
        MAX_SPEED: 14,
        COLOR: '#00d4ff',
        TRAIL_COLOR: 'rgba(0, 212, 255, 0.4)',
        MAX_HEALTH: 3,
        INVINCIBILITY_TIME: 2000, // ms
        ACCELERATION: 0.6, // Más responsivo!
        FRICTION: 0.88, // Mejor control
        DASH_SPEED: 20, // Boost instantáneo
        DASH_COOLDOWN: 3000, // 3 segundos
        DASH_DURATION: 200 // 0.2 segundos
    },

    // Enemigos - MENOS AGRESIVOS AL INICIO
    ENEMY: {
        SIZE: 32,
        BASE_SPEED: 2.0, // Más lento
        COLORS: ['#ff4757', '#ff6348', '#ff7979', '#ee5a6f'],
        CHASE_RANGE: 250, // Más corto
        PATROL_SPEED: 1.8,
        CHASE_SPEED: 3.5, // Menos rápido
        SMART_AI: true,
        UPDATE_PATH_INTERVAL: 600 // ms - Actualizan menos frecuente
    },

    // Power-ups
    POWERUP: {
        SIZE: 28,
        SPAWN_CHANCE: 0.3,
        DURATION: 5000, // ms
        TYPES: {
            SPEED: { color: '#ffd700', multiplier: 1.8 },
            SHIELD: { color: '#00ff88', duration: 8000 },
            SLOW_TIME: { color: '#a29bfe', multiplier: 0.4 },
            DOUBLE_POINTS: { color: '#fd79a8', multiplier: 2 },
            MAGNET: { color: '#74b9ff', range: 200 }
        }
    },

    // Banderas - MÁS VISIBLES Y ATRACTIVAS!
    FLAG: {
        SIZE: 35, // Más grandes
        BASE_POINTS: 150, // Alineado con SCORE.FLAG_BASE
        COMBO_MULTIPLIER: 1.5,
        COMBO_TIME_WINDOW: 3000, // ms
        COLORS: {
            NORMAL: '#ffd700',
            GOLDEN: '#ffed4e',
            SPECIAL: '#ff00ff'
        },
        PULSE_SPEED: 2.5 // Pulsan más rápido = más atractivas
    },

    // Sistema de Niveles - BALANCEADO PARA DIVERSIÓN!
    LEVELS: {
        1: { flags: 5, enemies: 2, powerups: 3, timeLimit: 180, name: "🌟 Tutorial Drive" },
        2: { flags: 7, enemies: 3, powerups: 3, timeLimit: 150, name: "⚡ Speed Circuit" },
        3: { flags: 10, enemies: 4, powerups: 4, timeLimit: 120, name: "🔥 Pro Rally" },
        4: { flags: 12, enemies: 5, powerups: 4, timeLimit: 100, name: "💎 Champion Track" },
        5: { flags: 15, enemies: 6, powerups: 5, timeLimit: 90, name: "👑 Ultimate Challenge" },
        6: { flags: 18, enemies: 7, powerups: 5, timeLimit: 75, name: "🚀 Legendary Race" }
    },

    // Puntuación - MÁS GENEROSO!
    SCORE: {
        FLAG_BASE: 150, // Más puntos
        ENEMY_DODGE: 75,
        TIME_BONUS_PER_SECOND: 15,
        PERFECT_LEVEL: 8000, // Mejor recompensa
        COMBO_MULTIPLIERS: [1, 1.5, 2, 2.5, 3, 4, 5, 6, 7, 8] // Más niveles
    },

    // Audio
    AUDIO: {
        MASTER_VOLUME: 0.7,
        MUSIC_VOLUME: 0.5,
        SFX_VOLUME: 0.8,
        ENABLED: true
    },

    // Partículas y Efectos - ¡MÁS EXPLOSIVO!
    PARTICLES: {
        FLAG_COLLECT: { count: 40, color: '#ffd700', speed: 5 },
        COLLISION: { count: 60, color: '#ff4757', speed: 8 },
        POWERUP: { count: 30, color: '#00ff88', speed: 4 },
        TRAIL: { maxLength: 30, fadeSpeed: 0.03 },
        COMBO_MILESTONE: { count: 50, speed: 6 },
        DASH: { count: 25, speed: 7 }
    },

    // UI y HUD
    UI: {
        FONT_FAMILY: "'Orbitron', 'Courier New', monospace",
        PRIMARY_COLOR: '#00d4ff',
        SECONDARY_COLOR: '#ff4757',
        SUCCESS_COLOR: '#00ff88',
        WARNING_COLOR: '#ffd700',
        DANGER_COLOR: '#ff4757',
        GLASSMORPHISM: 'rgba(255, 255, 255, 0.05)',
        BLUR_AMOUNT: '10px'
    },

    // Logros
    ACHIEVEMENTS: [
        { id: 'first_win', name: 'Primera Victoria', desc: 'Completa el primer nivel', icon: '🏆' },
        { id: 'speed_demon', name: 'Demonio de Velocidad', desc: 'Completa un nivel en menos de 30s', icon: '⚡' },
        { id: 'combo_master', name: 'Maestro del Combo', desc: 'Consigue un combo x5', icon: '🔥' },
        { id: 'perfectionist', name: 'Perfeccionista', desc: 'Completa un nivel sin recibir daño', icon: '💎' },
        { id: 'collector', name: 'Coleccionista', desc: 'Recoge 100 banderas', icon: '🎯' },
        { id: 'survivor', name: 'Superviviente', desc: 'Esquiva 50 enemigos', icon: '🛡️' },
        { id: 'champion', name: 'Campeón', desc: 'Completa todos los niveles', icon: '👑' },
        { id: 'high_scorer', name: 'Alto Puntuador', desc: 'Consigue 50,000 puntos', icon: '💯' }
    ],

    // Controles
    CONTROLS: {
        KEYBOARD: {
            UP: ['ArrowUp', 'w', 'W'],
            DOWN: ['ArrowDown', 's', 'S'],
            LEFT: ['ArrowLeft', 'a', 'A'],
            RIGHT: ['ArrowRight', 'd', 'D'],
            PAUSE: ['Escape', 'p', 'P'],
            RESTART: ['r', 'R']
        },
        TOUCH: {
            JOYSTICK_SIZE: 120,
            JOYSTICK_DEAD_ZONE: 20,
            BUTTON_SIZE: 60
        }
    },

    // Almacenamiento
    STORAGE_KEYS: {
        HIGH_SCORE: 'rallyx_high_score',
        SETTINGS: 'rallyx_settings',
        ACHIEVEMENTS: 'rallyx_achievements',
        STATS: 'rallyx_stats',
        CURRENT_LEVEL: 'rallyx_current_level'
    },

    // Desarrollo y Debug
    DEBUG: {
        SHOW_FPS: false,
        SHOW_HITBOXES: false,
        GOD_MODE: false,
        SHOW_PATHFINDING: false
    }
};

export default CONFIG;
