/**
 * Backend Connector
 * Capa de abstracción para conectar con backend (REST API, Firebase, Supabase, etc.)
 *
 * @class BackendConnector
 * @description Proporciona:
 * - Leaderboard global
 * - Cloud saves
 * - User authentication
 * - Stats sincronizadas
 * - Multiplayer matchmaking (futuro)
 */

export class BackendConnector {
    constructor(config = {}) {
        this.config = {
            endpoint: config.endpoint || 'https://api.rallyx.example.com',
            apiKey: config.apiKey || null,
            provider: config.provider || 'rest', // rest, firebase, supabase
            enableCloudSaves: config.enableCloudSaves !== false,
            enableLeaderboard: config.enableLeaderboard !== false,
            cacheTimeout: config.cacheTimeout || 60000, // 1 minuto
        };

        this.connected = false;
        this.user = null;
        this.cache = new Map();
        this.pendingRequests = new Map();

        // Initialize según el provider
        this._initialize();
    }

    /**
     * Inicializa la conexión con el backend
     * @private
     */
    async _initialize() {
        try {
            // Aquí se puede agregar lógica específica de cada provider
            switch (this.config.provider) {
                case 'rest':
                    await this._initREST();
                    break;
                case 'firebase':
                    await this._initFirebase();
                    break;
                case 'supabase':
                    await this._initSupabase();
                    break;
                default:
                    console.warn('Provider desconocido:', this.config.provider);
            }
        } catch (error) {
            console.error('Error inicializando backend:', error);
        }
    }

    /**
     * Inicializa REST API
     * @private
     */
    async _initREST() {
        // Verificar conectividad con ping
        try {
            const response = await fetch(`${this.config.endpoint}/health`, {
                method: 'GET',
                headers: this._getHeaders()
            });

            if (response.ok) {
                this.connected = true;
                console.log('✅ Backend conectado (REST)');
            }
        } catch (error) {
            console.warn('⚠️ Backend no disponible, modo offline');
            this.connected = false;
        }
    }

    /**
     * Inicializa Firebase (placeholder)
     * @private
     */
    async _initFirebase() {
        console.log('🔥 Firebase initialization placeholder');
        // Aquí iría la lógica de Firebase SDK
        this.connected = false;
    }

    /**
     * Inicializa Supabase (placeholder)
     * @private
     */
    async _initSupabase() {
        console.log('⚡ Supabase initialization placeholder');
        // Aquí iría la lógica de Supabase SDK
        this.connected = false;
    }

    /**
     * Obtiene headers para requests
     * @private
     */
    _getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.config.apiKey) {
            headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        }

        if (this.user?.token) {
            headers['X-User-Token'] = this.user.token;
        }

        return headers;
    }

    // ===========================================
    // LEADERBOARD METHODS
    // ===========================================

    /**
     * Envía score al leaderboard
     * @param {Object} scoreData - Datos del score
     * @returns {Promise<Object>} Resultado
     */
    async submitScore(scoreData) {
        if (!this.config.enableLeaderboard) {
            return { success: false, error: 'Leaderboard deshabilitado' };
        }

        if (!this.connected) {
            return this._storeOfflineScore(scoreData);
        }

        try {
            const response = await fetch(`${this.config.endpoint}/leaderboard/submit`, {
                method: 'POST',
                headers: this._getHeaders(),
                body: JSON.stringify({
                    ...scoreData,
                    userId: this.user?.id || 'anonymous',
                    timestamp: Date.now()
                })
            });

            const result = await response.json();

            if (response.ok) {
                return {
                    success: true,
                    rank: result.rank,
                    isTopScore: result.rank <= 10,
                    ...result
                };
            } else {
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('Error submitting score:', error);
            return this._storeOfflineScore(scoreData);
        }
    }

    /**
     * Obtiene leaderboard global
     * @param {string} mode - Modo de juego
     * @param {number} limit - Número de entradas
     * @returns {Promise<Array>} Leaderboard
     */
    async getLeaderboard(mode = 'overall', limit = 100) {
        if (!this.config.enableLeaderboard) return [];

        // Verificar cache
        const cacheKey = `leaderboard_${mode}_${limit}`;
        const cached = this._getFromCache(cacheKey);
        if (cached) return cached;

        if (!this.connected) {
            return this._getLocalLeaderboard(mode, limit);
        }

        try {
            const response = await fetch(
                `${this.config.endpoint}/leaderboard?mode=${mode}&limit=${limit}`,
                {
                    method: 'GET',
                    headers: this._getHeaders()
                }
            );

            if (response.ok) {
                const data = await response.json();
                this._setCache(cacheKey, data.leaderboard);
                return data.leaderboard;
            }
        } catch (error) {
            console.error('Error getting leaderboard:', error);
        }

        return this._getLocalLeaderboard(mode, limit);
    }

    /**
     * Obtiene el rank de un usuario
     * @param {string} userId - ID del usuario
     * @param {string} mode - Modo de juego
     * @returns {Promise<Object|null>} Rank info
     */
    async getUserRank(userId, mode = 'overall') {
        if (!this.connected) return null;

        try {
            const response = await fetch(
                `${this.config.endpoint}/leaderboard/rank/${userId}?mode=${mode}`,
                {
                    method: 'GET',
                    headers: this._getHeaders()
                }
            );

            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Error getting user rank:', error);
        }

        return null;
    }

    // ===========================================
    // CLOUD SAVE METHODS
    // ===========================================

    /**
     * Guarda progreso en la nube
     * @param {Object} saveData - Datos a guardar
     * @returns {Promise<Object>} Resultado
     */
    async saveToCloud(saveData) {
        if (!this.config.enableCloudSaves) {
            return { success: false, error: 'Cloud saves deshabilitado' };
        }

        if (!this.connected || !this.user) {
            return { success: false, error: 'No conectado o no autenticado' };
        }

        try {
            const response = await fetch(`${this.config.endpoint}/saves/${this.user.id}`, {
                method: 'PUT',
                headers: this._getHeaders(),
                body: JSON.stringify({
                    data: saveData,
                    timestamp: Date.now(),
                    version: '1.0.0'
                })
            });

            if (response.ok) {
                return { success: true };
            }
        } catch (error) {
            console.error('Error saving to cloud:', error);
        }

        return { success: false, error: 'Error al guardar' };
    }

    /**
     * Carga progreso desde la nube
     * @returns {Promise<Object|null>} Datos guardados
     */
    async loadFromCloud() {
        if (!this.config.enableCloudSaves || !this.connected || !this.user) {
            return null;
        }

        try {
            const response = await fetch(`${this.config.endpoint}/saves/${this.user.id}`, {
                method: 'GET',
                headers: this._getHeaders()
            });

            if (response.ok) {
                const result = await response.json();
                return result.data;
            }
        } catch (error) {
            console.error('Error loading from cloud:', error);
        }

        return null;
    }

    // ===========================================
    // AUTHENTICATION METHODS
    // ===========================================

    /**
     * Login con email/password
     * @param {string} email - Email
     * @param {string} password - Password
     * @returns {Promise<Object>} Resultado
     */
    async login(email, password) {
        try {
            const response = await fetch(`${this.config.endpoint}/auth/login`, {
                method: 'POST',
                headers: this._getHeaders(),
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                this.user = data.user;
                return { success: true, user: data.user };
            }
        } catch (error) {
            console.error('Error during login:', error);
        }

        return { success: false, error: 'Login failed' };
    }

    /**
     * Login anónimo (guest)
     * @returns {Promise<Object>} Resultado
     */
    async loginAnonymous() {
        this.user = {
            id: 'guest_' + Date.now(),
            username: 'Guest',
            isAnonymous: true
        };

        return { success: true, user: this.user };
    }

    /**
     * Logout
     */
    logout() {
        this.user = null;
    }

    // ===========================================
    // CACHE & OFFLINE METHODS
    // ===========================================

    /**
     * Obtiene datos del cache
     * @private
     */
    _getFromCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        if (Date.now() - cached.timestamp > this.config.cacheTimeout) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    /**
     * Guarda en cache
     * @private
     */
    _setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    /**
     * Almacena score offline para enviar después
     * @private
     */
    _storeOfflineScore(scoreData) {
        try {
            const offline = JSON.parse(localStorage.getItem('rallyx_offline_scores') || '[]');
            offline.push({
                ...scoreData,
                timestamp: Date.now()
            });
            localStorage.setItem('rallyx_offline_scores', JSON.stringify(offline));

            return {
                success: true,
                offline: true,
                message: 'Score guardado localmente, se enviará cuando haya conexión'
            };
        } catch (error) {
            return { success: false, error: 'Error guardando offline' };
        }
    }

    /**
     * Sincroniza scores offline
     * @returns {Promise<Object>} Resultado
     */
    async syncOfflineScores() {
        if (!this.connected) return { synced: 0 };

        try {
            const offline = JSON.parse(localStorage.getItem('rallyx_offline_scores') || '[]');
            let synced = 0;

            for (const score of offline) {
                const result = await this.submitScore(score);
                if (result.success) synced++;
            }

            if (synced > 0) {
                localStorage.setItem('rallyx_offline_scores', '[]');
            }

            return { synced, total: offline.length };
        } catch (error) {
            console.error('Error syncing offline scores:', error);
            return { synced: 0, error };
        }
    }

    /**
     * Obtiene leaderboard local
     * @private
     */
    _getLocalLeaderboard(mode, limit) {
        // Placeholder - retorna leaderboard local si existe
        return [];
    }

    /**
     * Verifica estado de conexión
     * @returns {boolean} Si está conectado
     */
    isConnected() {
        return this.connected;
    }

    /**
     * Obtiene usuario actual
     * @returns {Object|null} Usuario
     */
    getCurrentUser() {
        return this.user;
    }
}

export default BackendConnector;
