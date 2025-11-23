/**
 * Level Editor
 * Editor in-game para crear y compartir niveles personalizados
 *
 * @class LevelEditor
 * @description Editor completo con:
 * - Modo de edición interactivo
 * - Colocación de entidades (enemigos, banderas, powerups)
 * - Sistema de guardado/carga
 * - Exportación/importación JSON
 * - Validación de niveles
 * - Preview y testing
 */

import Storage from '../utils/Storage.js';

export class LevelEditor {
    constructor(canvasWidth, canvasHeight) {
        this.width = canvasWidth;
        this.height = canvasHeight;
        this.gridSize = 32; // Tamaño de la cuadrícula

        // Estado del editor
        this.active = false;
        this.currentTool = 'flag'; // flag, enemy, powerup, spawn, erase
        this.selectedEntity = null;
        this.dragging = false;

        // Datos del nivel
        this.levelData = {
            name: 'Nivel Custom',
            author: 'Anonymous',
            difficulty: 1,
            timeLimit: 60,
            spawn: { x: 100, y: 100 },
            flags: [],
            enemies: [],
            powerups: [],
            obstacles: []
        };

        // Niveles guardados
        this.savedLevels = this._loadSavedLevels();

        // UI state
        this.showGrid = true;
        this.snapToGrid = true;

        // Herramientas disponibles
        this.tools = {
            flag: { icon: '🚩', name: 'Bandera', color: '#ffd700' },
            enemy: { icon: '👾', name: 'Enemigo', color: '#ff4444' },
            powerup: { icon: '⚡', name: 'Power-up', color: '#00ffff' },
            spawn: { icon: '🏠', name: 'Spawn', color: '#00ff00' },
            obstacle: { icon: '🧱', name: 'Obstáculo', color: '#888888' },
            erase: { icon: '🗑️', name: 'Borrar', color: '#ff0000' }
        };
    }

    /**
     * Activa el modo editor
     * @param {Object} existingLevel - Nivel existente para editar (opcional)
     */
    start(existingLevel = null) {
        this.active = true;

        if (existingLevel) {
            this.levelData = { ...existingLevel };
        } else {
            this._resetLevel();
        }

        console.log('🎨 Editor de niveles activado');
    }

    /**
     * Maneja click del mouse/touch
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @param {string} action - Acción (down, move, up)
     */
    handleInput(x, y, action) {
        if (!this.active) return;

        // Snap to grid si está habilitado
        if (this.snapToGrid) {
            x = Math.floor(x / this.gridSize) * this.gridSize + this.gridSize / 2;
            y = Math.floor(y / this.gridSize) * this.gridSize + this.gridSize / 2;
        }

        switch (action) {
            case 'down':
                this._handleMouseDown(x, y);
                break;
            case 'move':
                if (this.dragging) {
                    this._handleMouseMove(x, y);
                }
                break;
            case 'up':
                this.dragging = false;
                this.selectedEntity = null;
                break;
        }
    }

    /**
     * Maneja mouse down
     * @private
     */
    _handleMouseDown(x, y) {
        if (this.currentTool === 'erase') {
            this._eraseAt(x, y);
        } else if (this.currentTool === 'spawn') {
            this.levelData.spawn = { x, y };
        } else {
            this._placeEntity(x, y);
        }
    }

    /**
     * Maneja mouse move (drag)
     * @private
     */
    _handleMouseMove(x, y) {
        if (this.selectedEntity) {
            this.selectedEntity.x = x;
            this.selectedEntity.y = y;
        }
    }

    /**
     * Coloca una entidad en el nivel
     * @private
     */
    _placeEntity(x, y) {
        const entity = { x, y, id: Date.now() };

        switch (this.currentTool) {
            case 'flag':
                this.levelData.flags.push({ ...entity, value: 100 });
                break;
            case 'enemy':
                this.levelData.enemies.push({
                    ...entity,
                    type: 'basic',
                    speed: 2
                });
                break;
            case 'powerup':
                this.levelData.powerups.push({
                    ...entity,
                    type: 'random' // speed, shield, slowtime, etc.
                });
                break;
            case 'obstacle':
                this.levelData.obstacles.push({
                    ...entity,
                    width: this.gridSize,
                    height: this.gridSize
                });
                break;
        }

        this.selectedEntity = this._getEntityAt(x, y);
        this.dragging = true;
    }

    /**
     * Borra entidad en una posición
     * @private
     */
    _eraseAt(x, y) {
        const toRemove = this._getEntityAt(x, y);
        if (!toRemove) return;

        // Buscar y remover en cada array
        ['flags', 'enemies', 'powerups', 'obstacles'].forEach(type => {
            this.levelData[type] = this.levelData[type].filter(
                e => e.id !== toRemove.id
            );
        });
    }

    /**
     * Obtiene entidad en una posición
     * @private
     */
    _getEntityAt(x, y) {
        const range = this.gridSize / 2;

        // Buscar en todos los tipos de entidades
        for (const type of ['flags', 'enemies', 'powerups', 'obstacles']) {
            const entity = this.levelData[type].find(e =>
                Math.abs(e.x - x) < range && Math.abs(e.y - y) < range
            );
            if (entity) return entity;
        }

        return null;
    }

    /**
     * Cambia la herramienta activa
     * @param {string} tool - Nombre de la herramienta
     */
    setTool(tool) {
        if (this.tools[tool]) {
            this.currentTool = tool;
        }
    }

    /**
     * Valida el nivel
     * @returns {Object} Resultado de la validación
     */
    validateLevel() {
        const errors = [];
        const warnings = [];

        // Validaciones críticas
        if (this.levelData.flags.length === 0) {
            errors.push('El nivel debe tener al menos una bandera');
        }

        if (!this.levelData.spawn) {
            errors.push('El nivel debe tener un punto de spawn');
        }

        // Validaciones de advertencia
        if (this.levelData.enemies.length === 0) {
            warnings.push('El nivel no tiene enemigos (puede ser muy fácil)');
        }

        if (this.levelData.powerups.length === 0) {
            warnings.push('El nivel no tiene power-ups');
        }

        if (this.levelData.flags.length > 50) {
            warnings.push('Muchas banderas (puede afectar performance)');
        }

        if (this.levelData.enemies.length > 20) {
            warnings.push('Muchos enemigos (puede ser muy difícil)');
        }

        // Verificar que las entidades estén dentro del canvas
        const allEntities = [
            ...this.levelData.flags,
            ...this.levelData.enemies,
            ...this.levelData.powerups
        ];

        allEntities.forEach((entity, i) => {
            if (entity.x < 0 || entity.x > this.width ||
                entity.y < 0 || entity.y > this.height) {
                warnings.push(`Entidad ${i} está fuera del mapa`);
            }
        });

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Guarda el nivel
     * @param {string} name - Nombre del nivel
     * @returns {Object} Resultado
     */
    saveLevel(name) {
        if (name) {
            this.levelData.name = name;
        }

        const validation = this.validateLevel();
        if (!validation.valid) {
            return {
                success: false,
                errors: validation.errors
            };
        }

        // Añadir metadata
        this.levelData.savedAt = Date.now();
        this.levelData.version = '1.0.0';

        // Guardar en array de niveles
        const existingIndex = this.savedLevels.findIndex(
            l => l.name === this.levelData.name
        );

        if (existingIndex >= 0) {
            this.savedLevels[existingIndex] = { ...this.levelData };
        } else {
            this.savedLevels.push({ ...this.levelData });
        }

        this._saveLevelsToStorage();

        return {
            success: true,
            levelName: this.levelData.name,
            warnings: validation.warnings
        };
    }

    /**
     * Carga un nivel guardado
     * @param {string} name - Nombre del nivel
     * @returns {boolean} Éxito
     */
    loadLevel(name) {
        const level = this.savedLevels.find(l => l.name === name);

        if (level) {
            this.levelData = { ...level };
            return true;
        }

        return false;
    }

    /**
     * Exporta el nivel como JSON
     * @returns {string} JSON del nivel
     */
    exportLevel() {
        return JSON.stringify(this.levelData, null, 2);
    }

    /**
     * Importa nivel desde JSON
     * @param {string} json - JSON del nivel
     * @returns {Object} Resultado
     */
    importLevel(json) {
        try {
            const level = JSON.parse(json);

            // Validar estructura básica
            if (!level.spawn || !level.flags) {
                return {
                    success: false,
                    error: 'JSON inválido: falta estructura básica'
                };
            }

            this.levelData = level;

            const validation = this.validateLevel();

            return {
                success: true,
                levelName: level.name,
                warnings: validation.warnings
            };
        } catch (error) {
            return {
                success: false,
                error: 'Error parseando JSON: ' + error.message
            };
        }
    }

    /**
     * Descarga el nivel como archivo JSON
     */
    downloadLevel() {
        const json = this.exportLevel();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.levelData.name.replace(/\s+/g, '_')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log(`📥 Nivel descargado: ${this.levelData.name}`);
    }

    /**
     * Copia el nivel al portapapeles
     * @returns {Promise<boolean>} Éxito
     */
    async copyToClipboard() {
        try {
            await navigator.clipboard.writeText(this.exportLevel());
            console.log('📋 Nivel copiado al portapapeles');
            return true;
        } catch (error) {
            console.error('Error copiando al portapapeles:', error);
            return false;
        }
    }

    /**
     * Obtiene lista de niveles guardados
     * @returns {Array} Lista de niveles
     */
    getSavedLevels() {
        return this.savedLevels.map(l => ({
            name: l.name,
            author: l.author,
            difficulty: l.difficulty,
            savedAt: l.savedAt,
            stats: {
                flags: l.flags.length,
                enemies: l.enemies.length,
                powerups: l.powerups.length
            }
        }));
    }

    /**
     * Elimina un nivel guardado
     * @param {string} name - Nombre del nivel
     */
    deleteLevel(name) {
        this.savedLevels = this.savedLevels.filter(l => l.name !== name);
        this._saveLevelsToStorage();
    }

    /**
     * Resetea el nivel actual
     * @private
     */
    _resetLevel() {
        this.levelData = {
            name: 'Nivel Custom',
            author: 'Anonymous',
            difficulty: 1,
            timeLimit: 60,
            spawn: { x: this.width / 2, y: this.height / 2 },
            flags: [],
            enemies: [],
            powerups: [],
            obstacles: []
        };
    }

    /**
     * Dibuja el editor
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    draw(ctx) {
        if (!this.active) return;

        ctx.save();

        // Dibujar grid
        if (this.showGrid) {
            this._drawGrid(ctx);
        }

        // Dibujar spawn point
        if (this.levelData.spawn) {
            ctx.fillStyle = this.tools.spawn.color;
            ctx.globalAlpha = 0.5;
            ctx.fillRect(
                this.levelData.spawn.x - 20,
                this.levelData.spawn.y - 20,
                40,
                40
            );
            ctx.globalAlpha = 1.0;
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.tools.spawn.icon, this.levelData.spawn.x, this.levelData.spawn.y);
        }

        // Dibujar entidades
        this._drawEntities(ctx, this.levelData.flags, 'flag');
        this._drawEntities(ctx, this.levelData.enemies, 'enemy');
        this._drawEntities(ctx, this.levelData.powerups, 'powerup');
        this._drawEntities(ctx, this.levelData.obstacles, 'obstacle');

        ctx.restore();
    }

    /**
     * Dibuja la cuadrícula
     * @private
     */
    _drawGrid(ctx) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        for (let x = 0; x < this.width; x += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }

        for (let y = 0; y < this.height; y += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }
    }

    /**
     * Dibuja entidades
     * @private
     */
    _drawEntities(ctx, entities, type) {
        const tool = this.tools[type];

        entities.forEach(entity => {
            ctx.fillStyle = tool.color;
            ctx.globalAlpha = 0.7;
            ctx.fillRect(entity.x - 12, entity.y - 12, 24, 24);
            ctx.globalAlpha = 1.0;
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(tool.icon, entity.x, entity.y);
        });
    }

    /**
     * Guarda niveles en storage
     * @private
     */
    _saveLevelsToStorage() {
        try {
            Storage.set('rallyx_custom_levels', this.savedLevels);
        } catch (error) {
            console.error('Error guardando niveles:', error);
        }
    }

    /**
     * Carga niveles desde storage
     * @private
     */
    _loadSavedLevels() {
        try {
            return Storage.get('rallyx_custom_levels', []);
        } catch (error) {
            console.error('Error cargando niveles:', error);
            return [];
        }
    }

    /**
     * Obtiene datos del nivel actual
     * @returns {Object} Datos del nivel
     */
    getLevelData() {
        return { ...this.levelData };
    }

    /**
     * Desactiva el editor
     */
    stop() {
        this.active = false;
    }
}

export default LevelEditor;
