/**
 * Local Multiplayer System
 * Sistema de multiplayer local con split-screen para 2 jugadores
 *
 * @class LocalMultiplayer
 * @description Proporciona:
 * - Split-screen vertical/horizontal
 * - Controles independientes para cada jugador
 * - Modos: Cooperativo, Competitivo
 * - Stats y scoring separado
 * - Viewport independent rendering
 */

export class LocalMultiplayer {
    constructor(canvasWidth, canvasHeight) {
        this.width = canvasWidth;
        this.height = canvasHeight;

        // Estado del multiplayer
        this.active = false;
        this.mode = 'cooperative'; // cooperative, competitive
        this.splitMode = 'vertical'; // vertical, horizontal

        // Jugadores
        this.players = {
            player1: {
                id: 1,
                name: 'Player 1',
                controls: {
                    up: ['w', 'W'],
                    down: ['s', 'S'],
                    left: ['a', 'A'],
                    right: ['d', 'D'],
                    action: ['q', 'Q']
                },
                viewport: {
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0
                },
                camera: { x: 0, y: 0 },
                score: 0,
                health: 3,
                flagsCollected: 0,
                active: true
            },
            player2: {
                id: 2,
                name: 'Player 2',
                controls: {
                    up: ['ArrowUp'],
                    down: ['ArrowDown'],
                    left: ['ArrowLeft'],
                    right: ['ArrowRight'],
                    action: ['Enter']
                },
                viewport: {
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0
                },
                camera: { x: 0, y: 0 },
                score: 0,
                health: 3,
                flagsCollected: 0,
                active: true
            }
        };

        // Game state compartido
        this.sharedState = {
            totalFlags: 0,
            totalEnemies: 0,
            timeRemaining: 60,
            comboBonusActive: false
        };

        this._calculateViewports();
    }

    /**
     * Inicia el modo multiplayer
     * @param {string} mode - Modo de juego (cooperative, competitive)
     * @param {string} splitMode - Modo de split (vertical, horizontal)
     * @returns {Object} Configuración inicial
     */
    start(mode = 'cooperative', splitMode = 'vertical') {
        this.active = true;
        this.mode = mode;
        this.splitMode = splitMode;

        this._calculateViewports();
        this._resetPlayers();

        console.log(`🎮 Multiplayer ${mode} iniciado (${splitMode} split)`);

        return {
            mode: this.mode,
            splitMode: this.splitMode,
            players: this.getPlayersInfo()
        };
    }

    /**
     * Calcula viewports para cada jugador
     * @private
     */
    _calculateViewports() {
        if (this.splitMode === 'vertical') {
            // Split vertical (lado a lado)
            const halfWidth = this.width / 2;

            this.players.player1.viewport = {
                x: 0,
                y: 0,
                width: halfWidth,
                height: this.height
            };

            this.players.player2.viewport = {
                x: halfWidth,
                y: 0,
                width: halfWidth,
                height: this.height
            };
        } else {
            // Split horizontal (arriba/abajo)
            const halfHeight = this.height / 2;

            this.players.player1.viewport = {
                x: 0,
                y: 0,
                width: this.width,
                height: halfHeight
            };

            this.players.player2.viewport = {
                x: 0,
                y: halfHeight,
                width: this.width,
                height: halfHeight
            };
        }
    }

    /**
     * Resetea stats de jugadores
     * @private
     */
    _resetPlayers() {
        Object.values(this.players).forEach(player => {
            player.score = 0;
            player.health = 3;
            player.flagsCollected = 0;
            player.active = true;
        });
    }

    /**
     * Actualiza la cámara de un jugador
     * @param {number} playerId - ID del jugador (1 o 2)
     * @param {number} x - Posición X del jugador
     * @param {number} y - Posición Y del jugador
     */
    updatePlayerCamera(playerId, x, y) {
        const player = this.players[`player${playerId}`];
        if (!player) return;

        const viewport = player.viewport;

        // Centrar cámara en el jugador
        player.camera.x = x - viewport.width / 2;
        player.camera.y = y - viewport.height / 2;

        // Limitar cámara a los bordes del mundo
        // (esto asume que el mundo es del tamaño del canvas original)
        player.camera.x = Math.max(0, Math.min(this.width - viewport.width, player.camera.x));
        player.camera.y = Math.max(0, Math.min(this.height - viewport.height, player.camera.y));
    }

    /**
     * Registra flag colectada por un jugador
     * @param {number} playerId - ID del jugador
     * @param {number} points - Puntos base
     * @returns {Object} Resultado
     */
    playerCollectedFlag(playerId, points) {
        const player = this.players[`player${playerId}`];
        if (!player) return;

        player.flagsCollected++;
        player.score += points;

        // En modo cooperativo, sumar a ambos jugadores
        if (this.mode === 'cooperative') {
            Object.values(this.players).forEach(p => {
                if (p.id !== playerId) {
                    p.score += Math.floor(points * 0.5); // 50% para el compañero
                }
            });
        }

        return {
            playerId,
            newScore: player.score,
            totalFlagsCollected: player.flagsCollected
        };
    }

    /**
     * Registra daño recibido por un jugador
     * @param {number} playerId - ID del jugador
     * @param {number} damage - Cantidad de daño
     * @returns {Object} Resultado
     */
    playerTookDamage(playerId, damage = 1) {
        const player = this.players[`player${playerId}`];
        if (!player) return;

        player.health = Math.max(0, player.health - damage);

        if (player.health <= 0) {
            player.active = false;

            // En cooperativo, game over si ambos mueren
            if (this.mode === 'cooperative') {
                const allDead = Object.values(this.players).every(p => !p.active);
                return {
                    playerId,
                    health: 0,
                    active: false,
                    gameOver: allDead
                };
            }

            return {
                playerId,
                health: 0,
                active: false,
                gameOver: false
            };
        }

        return {
            playerId,
            health: player.health,
            active: true,
            gameOver: false
        };
    }

    /**
     * Verifica si un input pertenece a un jugador
     * @param {string} key - Tecla presionada
     * @returns {Object|null} {playerId, action} o null
     */
    getPlayerInput(key) {
        for (const [playerKey, player] of Object.entries(this.players)) {
            for (const [action, keys] of Object.entries(player.controls)) {
                if (keys.includes(key)) {
                    return {
                        playerId: player.id,
                        action
                    };
                }
            }
        }

        return null;
    }

    /**
     * Dibuja ambos viewports
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {Function} renderCallback - Función de renderizado del juego
     */
    draw(ctx, renderCallback) {
        if (!this.active) return;

        // Dibujar viewport del Player 1
        this._drawViewport(ctx, this.players.player1, renderCallback);

        // Dibujar separador
        this._drawSeparator(ctx);

        // Dibujar viewport del Player 2
        this._drawViewport(ctx, this.players.player2, renderCallback);

        // Dibujar UI de multiplayer
        this._drawMultiplayerUI(ctx);
    }

    /**
     * Dibuja viewport de un jugador
     * @private
     */
    _drawViewport(ctx, player, renderCallback) {
        const vp = player.viewport;

        ctx.save();

        // Clip al viewport
        ctx.beginPath();
        ctx.rect(vp.x, vp.y, vp.width, vp.height);
        ctx.clip();

        // Trasladar según la cámara del jugador
        ctx.translate(vp.x - player.camera.x, vp.y - player.camera.y);

        // Renderizar el juego para este jugador
        if (renderCallback) {
            renderCallback(ctx, player);
        }

        ctx.restore();

        // Dibujar borde del viewport
        ctx.strokeStyle = player.id === 1 ? '#00ffff' : '#ff00ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(vp.x, vp.y, vp.width, vp.height);
    }

    /**
     * Dibuja separador entre viewports
     * @private
     */
    _drawSeparator(ctx) {
        ctx.save();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;

        if (this.splitMode === 'vertical') {
            const centerX = this.width / 2;
            ctx.beginPath();
            ctx.moveTo(centerX, 0);
            ctx.lineTo(centerX, this.height);
            ctx.stroke();
        } else {
            const centerY = this.height / 2;
            ctx.beginPath();
            ctx.moveTo(0, centerY);
            ctx.lineTo(this.width, centerY);
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * Dibuja UI de multiplayer (scores, etc.)
     * @private
     */
    _drawMultiplayerUI(ctx) {
        ctx.save();
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';

        // Player 1 info
        const p1 = this.players.player1;
        ctx.fillStyle = '#00ffff';
        ctx.fillText(
            `${p1.name}: ${p1.score} pts | HP: ${p1.health} | Flags: ${p1.flagsCollected}`,
            10,
            25
        );

        // Player 2 info
        const p2 = this.players.player2;
        ctx.fillStyle = '#ff00ff';
        ctx.fillText(
            `${p2.name}: ${p2.score} pts | HP: ${p2.health} | Flags: ${p2.flagsCollected}`,
            this.width - 350,
            25
        );

        // Modo de juego
        ctx.fillStyle = '#ffff00';
        ctx.textAlign = 'center';
        ctx.fillText(
            this.mode === 'cooperative' ? '🤝 COOPERATIVO' : '⚔️ COMPETITIVO',
            this.width / 2,
            this.height - 20
        );

        ctx.restore();
    }

    /**
     * Obtiene información de los jugadores
     * @returns {Object} Info de jugadores
     */
    getPlayersInfo() {
        return {
            player1: {
                id: this.players.player1.id,
                name: this.players.player1.name,
                score: this.players.player1.score,
                health: this.players.player1.health,
                active: this.players.player1.active
            },
            player2: {
                id: this.players.player2.id,
                name: this.players.player2.name,
                score: this.players.player2.score,
                health: this.players.player2.health,
                active: this.players.player2.active
            }
        };
    }

    /**
     * Obtiene el ganador en modo competitivo
     * @returns {Object|null} Ganador o null
     */
    getWinner() {
        if (this.mode !== 'competitive') return null;

        const p1 = this.players.player1;
        const p2 = this.players.player2;

        if (p1.score > p2.score) {
            return { playerId: 1, name: p1.name, score: p1.score };
        } else if (p2.score > p1.score) {
            return { playerId: 2, name: p2.name, score: p2.score };
        } else {
            return { tie: true, score: p1.score };
        }
    }

    /**
     * Finaliza el modo multiplayer
     * @returns {Object} Resultados finales
     */
    end() {
        this.active = false;

        const results = {
            mode: this.mode,
            players: this.getPlayersInfo()
        };

        if (this.mode === 'competitive') {
            results.winner = this.getWinner();
        } else {
            results.totalScore = this.players.player1.score + this.players.player2.score;
            results.totalFlags = this.players.player1.flagsCollected + this.players.player2.flagsCollected;
        }

        return results;
    }

    /**
     * Verifica si el modo está activo
     * @returns {boolean} Si está activo
     */
    isActive() {
        return this.active;
    }

    /**
     * Obtiene el modo actual
     * @returns {string} Modo
     */
    getMode() {
        return this.mode;
    }

    /**
     * Cambia el modo de split
     * @param {string} mode - vertical o horizontal
     */
    setSplitMode(mode) {
        if (mode === 'vertical' || mode === 'horizontal') {
            this.splitMode = mode;
            this._calculateViewports();
        }
    }
}

export default LocalMultiplayer;
