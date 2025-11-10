/**
 * Gestor de Estados del Juego
 * Controla transiciones entre menú, juego, pausa, game over
 */

export class StateManager {
    constructor() {
        this.currentState = null;
        this.states = {};
        this.previousState = null;
    }

    register(name, state) {
        this.states[name] = state;
    }

    setState(name, data = {}) {
        // Salir del estado actual
        if (this.currentState) {
            this.states[this.currentState]?.exit?.();
            this.previousState = this.currentState;
        }

        // Entrar al nuevo estado
        this.currentState = name;

        if (this.states[name]) {
            this.states[name].enter?.(data);
        } else {
            console.warn(`Estado '${name}' no encontrado`);
        }
    }

    update(deltaTime) {
        if (this.currentState && this.states[this.currentState]) {
            this.states[this.currentState].update?.(deltaTime);
        }
    }

    draw(ctx) {
        if (this.currentState && this.states[this.currentState]) {
            this.states[this.currentState].draw?.(ctx);
        }
    }

    handleInput(input) {
        if (this.currentState && this.states[this.currentState]) {
            this.states[this.currentState].handleInput?.(input);
        }
    }

    getCurrentState() {
        return this.currentState;
    }

    getState(name) {
        return this.states[name];
    }

    backToPrevious() {
        if (this.previousState) {
            this.setState(this.previousState);
        }
    }
}

export default StateManager;
