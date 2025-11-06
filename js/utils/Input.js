/**
 * Sistema de Control de Entrada
 * Gestiona teclado, mouse y touch
 */

export class Input {
    constructor() {
        this.keys = {};
        this.mouse = { x: 0, y: 0, down: false };
        this.touch = { active: false, x: 0, y: 0, startX: 0, startY: 0 };
        this.joystick = { active: false, x: 0, y: 0, angle: 0, distance: 0 };

        this.setupListeners();
    }

    setupListeners() {
        // Teclado
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // Mouse
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('mousedown', (e) => {
            this.mouse.down = true;
        });

        window.addEventListener('mouseup', (e) => {
            this.mouse.down = false;
        });

        // Touch
        window.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                this.touch.active = true;
                this.touch.startX = touch.clientX;
                this.touch.startY = touch.clientY;
                this.touch.x = touch.clientX;
                this.touch.y = touch.clientY;
                this.updateJoystick();
            }
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                this.touch.x = touch.clientX;
                this.touch.y = touch.clientY;
                this.updateJoystick();
            }
        }, { passive: true });

        window.addEventListener('touchend', () => {
            this.touch.active = false;
            this.joystick.active = false;
            this.joystick.x = 0;
            this.joystick.y = 0;
            this.joystick.angle = 0;
            this.joystick.distance = 0;
        });

        // Prevenir comportamiento por defecto en dispositivos móviles
        document.addEventListener('touchmove', (e) => {
            if (e.target.tagName === 'CANVAS') {
                e.preventDefault();
            }
        }, { passive: false });
    }

    updateJoystick() {
        if (!this.touch.active) return;

        const dx = this.touch.x - this.touch.startX;
        const dy = this.touch.y - this.touch.startY;

        this.joystick.angle = Math.atan2(dy, dx);
        this.joystick.distance = Math.min(Math.sqrt(dx * dx + dy * dy), 60);

        if (this.joystick.distance > 20) {
            this.joystick.active = true;
            this.joystick.x = Math.cos(this.joystick.angle) * (this.joystick.distance / 60);
            this.joystick.y = Math.sin(this.joystick.angle) * (this.joystick.distance / 60);
        } else {
            this.joystick.active = false;
            this.joystick.x = 0;
            this.joystick.y = 0;
        }
    }

    isKeyDown(key) {
        if (Array.isArray(key)) {
            return key.some(k => this.keys[k]);
        }
        return this.keys[key];
    }

    getMovement() {
        let dx = 0;
        let dy = 0;

        // Controles de teclado
        if (this.isKeyDown(['ArrowUp', 'w', 'W'])) dy -= 1;
        if (this.isKeyDown(['ArrowDown', 's', 'S'])) dy += 1;
        if (this.isKeyDown(['ArrowLeft', 'a', 'A'])) dx -= 1;
        if (this.isKeyDown(['ArrowRight', 'd', 'D'])) dx += 1;

        // Controles táctiles/joystick
        if (this.joystick.active) {
            dx = this.joystick.x;
            dy = this.joystick.y;
        }

        // Normalizar el vector de movimiento diagonal
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length > 0) {
            dx /= length;
            dy /= length;
        }

        return { dx, dy, length };
    }

    reset() {
        this.keys = {};
        this.mouse = { x: 0, y: 0, down: false };
        this.touch = { active: false, x: 0, y: 0, startX: 0, startY: 0 };
        this.joystick = { active: false, x: 0, y: 0, angle: 0, distance: 0 };
    }
}

export default Input;
