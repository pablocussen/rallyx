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
        BASE_SPEED: 5,
        MAX_SPEED: 12,
        COLOR: '#00d4ff',
        TRAIL_COLOR: 'rgba(0, 212, 255, 0.4)',
        MAX_HEALTH: 3,
        INVINCIBILITY_TIME: 2000, // ms
        ACCELERATION: 0.3,
        FRICTION: 0.85
    },

    // Enemigos
    ENEMY: {
        SIZE: 32,
        BASE_SPEED: 2.5,
        COLORS: ['#ff4757', '#ff6348', '#ff7979', '#ee5a6f'],
        CHASE_RANGE: 300,
        PATROL_SPEED: 2,
        CHASE_SPEED: 4,
        SMART_AI: true,
        UPDATE_PATH_INTERVAL: 500 // ms
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

    // Banderas
    FLAG: {
        SIZE: 30,
        BASE_POINTS: 100,
        COMBO_MULTIPLIER: 1.5,
        COMBO_TIME_WINDOW: 3000, // ms
        COLORS: {
            NORMAL: '#ffd700',
            GOLDEN: '#ffed4e',
            SPECIAL: '#ff00ff'
        },
        PULSE_SPEED: 2
    },

    // Sistema de Niveles
    LEVELS: {
        1: { flags: 8, enemies: 3, powerups: 2, timeLimit: 120, name: "Rookie Drive" },
        2: { flags: 10, enemies: 4, powerups: 3, timeLimit: 100, name: "Speed Circuit" },
        3: { flags: 12, enemies: 5, powerups: 3, timeLimit: 90, name: "Pro Rally" },
        4: { flags: 15, enemies: 6, powerups: 4, timeLimit: 80, name: "Champion Track" },
        5: { flags: 18, enemies: 7, powerups: 4, timeLimit: 70, name: "Ultimate Challenge" },
        6: { flags: 20, enemies: 8, powerups: 5, timeLimit: 60, name: "Legendary Race" }
    },

    // Puntuación
    SCORE: {
        FLAG_BASE: 100,
        ENEMY_DODGE: 50,
        TIME_BONUS_PER_SECOND: 10,
        PERFECT_LEVEL: 5000,
        COMBO_MULTIPLIERS: [1, 1.5, 2, 2.5, 3, 4, 5]
    },

    // Audio
    AUDIO: {
        MASTER_VOLUME: 0.7,
        MUSIC_VOLUME: 0.5,
        SFX_VOLUME: 0.8,
        ENABLED: true
    },

    // Partículas y Efectos
    PARTICLES: {
        FLAG_COLLECT: { count: 20, color: '#ffd700', speed: 3 },
        COLLISION: { count: 30, color: '#ff4757', speed: 5 },
        POWERUP: { count: 15, color: '#00ff88', speed: 2 },
        TRAIL: { maxLength: 20, fadeSpeed: 0.05 }
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
