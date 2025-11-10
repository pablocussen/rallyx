# 🏁 Rally X - Professional Edition

<div align="center">

![Rally X](https://img.shields.io/badge/Version-1.0.0-00d4ff?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Canvas](https://img.shields.io/badge/Canvas-API-00d4ff?style=for-the-badge)
![PWA](https://img.shields.io/badge/PWA-Ready-00ff88?style=for-the-badge)

**Experiencia arcade profesional directamente en tu navegador**

[🎮 Jugar Ahora](#características) | [📖 Documentación](#documentación) | [🚀 Instalación](#instalación) | [🤝 Contribuir](#contribuir)

</div>

---

## ✨ Características

### 🎨 Gráficos y UI Profesional
- **Diseño Moderno**: Interfaz con efectos glassmorphism y gradientes dinámicos
- **Animaciones Fluidas**: 60 FPS constantes con requestAnimationFrame
- **Sistema de Partículas**: Efectos visuales profesionales (explosiones, trails, recolección)
- **Responsive Design**: Funciona perfectamente en desktop, tablet y móvil
- **HUD Completo**: Vida, puntuación, tiempo, combo, minimapa y power-ups activos

### 🎮 Gameplay Innovador
- **6 Niveles Progresivos**: Dificultad creciente con nombres únicos
- **Power-ups Estratégicos**:
  - ⚡ **Velocidad**: Aumenta tu velocidad de movimiento
  - 🛡️ **Escudo**: Protección temporal contra enemigos
  - ⏰ **Tiempo Lento**: Ralentiza a todos los enemigos
  - 💰 **Puntos Dobles**: Duplica tu puntuación
  - 🧲 **Imán**: Atrae banderas cercanas
- **IA Inteligente**: Enemigos con pathfinding que persiguen al jugador
- **Sistema de Combos**: Multiplica tu puntuación con recolecciones consecutivas
- **Física Realista**: Aceleración, fricción y colisiones precisas

### 🏆 Sistema de Progresión
- **Logros Desbloqueables**: 8 achievements con notificaciones en tiempo real
- **High Score Local**: Guarda tu mejor puntuación
- **Estadísticas Completas**: Banderas recolectadas, enemigos esquivados, etc.
- **Niveles con Límite de Tiempo**: Añade urgencia y estrategia

### 🔊 Audio Profesional
- **Web Audio API**: Efectos de sonido sintéticos generados en tiempo real
- **Sonidos Contextuales**: Diferentes efectos para cada acción
- **Control de Volumen**: Configurable y mutable
- **Ambiente Dinámico**: Música de fondo adaptativa (opcional)

### 📱 Multiplataforma
- **PWA (Progressive Web App)**: Instálala como aplicación nativa
- **Modo Offline**: Funciona sin conexión a internet
- **Controles Táctiles**: Joystick virtual para dispositivos móviles
- **Teclado Completo**: WASD o flechas + atajos adicionales

### 🛠️ Arquitectura Profesional
- **ES6+ Modules**: Código modular y mantenible
- **Sistema de Estados**: MenuState, GameState, PauseState, GameOverState
- **Patrón de Diseño**: Arquitectura escalable orientada a componentes
- **Service Workers**: Caché inteligente y carga rápida
- **LocalStorage**: Persistencia de datos del jugador

---

## 🚀 Instalación

### Método 1: Servidor Local Simple

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/rallyx.git
cd rallyx

# Iniciar servidor local (Python 3)
python -m http.server 8000

# O con Node.js
npx http-server -p 8000
```

Luego abre tu navegador en `http://localhost:8000`

### Método 2: Abrir Directamente

Simplemente abre `index.html` en tu navegador moderno (Chrome, Firefox, Edge, Safari).

**Nota**: Algunos navegadores pueden bloquear módulos ES6 si abres el archivo directamente. Se recomienda usar un servidor local.

### Método 3: Deploy en la Nube

#### Netlify
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

#### Vercel
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### GitHub Pages
1. Sube el código a tu repositorio de GitHub
2. Ve a Settings → Pages
3. Selecciona la rama `main` y carpeta raíz
4. ¡Listo! Tu juego estará en `https://tu-usuario.github.io/rallyx`

---

## 🎮 Controles

### ⌨️ Teclado
| Tecla | Acción |
|-------|--------|
| `↑` `↓` `←` `→` | Movimiento |
| `W` `A` `S` `D` | Movimiento alternativo |
| `ESC` o `P` | Pausar |
| `R` | Reiniciar nivel |
| `Enter` | Seleccionar en menús |

### 📱 Táctil
- **Joystick Virtual**: Aparece automáticamente en dispositivos móviles
- **Toca y arrastra**: Para controlar la dirección del movimiento

### 🖱️ Mouse
- Navega por los menús haciendo clic

---

## 📖 Documentación

### Estructura del Proyecto

```
rallyx/
├── index.html              # Página principal
├── manifest.json           # Configuración PWA
├── sw.js                   # Service Worker
├── css/
│   └── main.css           # Estilos profesionales
├── js/
│   ├── main.js            # Archivo principal del juego
│   ├── config.js          # Configuración global
│   ├── entities/          # Entidades del juego
│   │   ├── Player.js      # Jugador
│   │   ├── Enemy.js       # Enemigos con IA
│   │   ├── Flag.js        # Banderas coleccionables
│   │   └── PowerUp.js     # Power-ups
│   ├── systems/           # Sistemas del juego
│   │   ├── AudioManager.js      # Gestión de audio
│   │   ├── ParticleSystem.js    # Sistema de partículas
│   │   ├── ScoreSystem.js       # Puntuación y combos
│   │   ├── AchievementSystem.js # Logros
│   │   └── StateManager.js      # Gestor de estados
│   ├── states/            # Estados del juego
│   │   ├── MenuState.js   # Menú principal
│   │   ├── GameState.js   # Juego activo
│   │   ├── PauseState.js  # Pausa
│   │   └── GameOverState.js # Fin del juego
│   └── utils/             # Utilidades
│       ├── Input.js       # Gestión de entrada
│       ├── Collision.js   # Detección de colisiones
│       └── Storage.js     # LocalStorage helper
└── assets/                # Recursos (futuro)
    ├── images/
    └── sounds/
```

### Arquitectura del Código

#### Sistema de Estados
El juego utiliza un patrón de estados para gestionar diferentes pantallas:

```javascript
// Transición entre estados
game.setState('game', { level: 1 });  // Iniciar juego
game.setState('pause');                // Pausar
game.setState('menu');                 // Volver al menú
```

#### Entidades
Todas las entidades heredan una estructura común:
```javascript
class Entity {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = size;
        this.height = size;
    }

    update(deltaTime) { /* ... */ }
    draw(ctx) { /* ... */ }
    getBounds() { /* ... */ }
}
```

#### Sistemas
Los sistemas son singleton que gestionan funcionalidades específicas:
- **AudioManager**: Genera sonidos con Web Audio API
- **ParticleSystem**: Gestiona efectos visuales
- **ScoreSystem**: Puntuación, combos y estadísticas
- **AchievementSystem**: Logros y notificaciones

### Configuración

Todos los ajustes del juego están centralizados en `js/config.js`:

```javascript
export const CONFIG = {
    CANVAS: { WIDTH: 1200, HEIGHT: 800 },
    PLAYER: { SIZE: 32, SPEED: 5, MAX_HEALTH: 3 },
    ENEMY: { SIZE: 32, CHASE_RANGE: 300 },
    // ... más configuración
};
```

### Personalización

#### Cambiar Colores
Edita las variables CSS en `css/main.css`:
```css
:root {
    --primary-color: #00d4ff;    /* Color principal */
    --secondary-color: #ff4757;  /* Color secundario */
    --success-color: #00ff88;    /* Color de éxito */
}
```

#### Añadir Niveles
Edita `CONFIG.LEVELS` en `js/config.js`:
```javascript
LEVELS: {
    7: {
        flags: 25,
        enemies: 10,
        powerups: 6,
        timeLimit: 50,
        name: "Nightmare Mode"
    }
}
```

#### Crear Nuevos Power-ups
1. Añade el tipo en `CONFIG.POWERUP.TYPES`
2. Implementa la lógica en `Player.js`
3. Añade el efecto visual en `PowerUp.js`

---

## 🎯 Objetivos del Juego

### Objetivo Principal
Recolecta todas las banderas doradas del nivel antes de que se acabe el tiempo, mientras esquivas a los enemigos rojos.

### Estrategia
1. **Recoge Power-ups**: Aparecen aleatoriamente y te dan ventajas temporales
2. **Mantén el Combo**: Recolecta banderas rápidamente para multiplicar tu puntuación
3. **Esquiva Enemigos**: Usa tu agilidad para evitar colisiones
4. **Gestiona el Tiempo**: Balancea velocidad con seguridad

### Puntuación
- **Bandera Base**: 100 puntos
- **Combo x2**: 150 puntos por bandera
- **Combo x3**: 200 puntos por bandera
- **Combo x5**: 400 puntos por bandera
- **Bonus de Tiempo**: 10 puntos por segundo restante
- **Nivel Perfecto**: 5000 puntos (sin recibir daño)

---

## 🏆 Logros

| Icono | Nombre | Descripción |
|-------|--------|-------------|
| 🏆 | **Primera Victoria** | Completa el primer nivel |
| ⚡ | **Demonio de Velocidad** | Completa un nivel en menos de 30s |
| 🔥 | **Maestro del Combo** | Consigue un combo x5 |
| 💎 | **Perfeccionista** | Completa un nivel sin recibir daño |
| 🎯 | **Coleccionista** | Recoge 100 banderas en total |
| 🛡️ | **Superviviente** | Esquiva 50 enemigos |
| 👑 | **Campeón** | Completa todos los niveles |
| 💯 | **Alto Puntuador** | Consigue 50,000 puntos |

---

## 🔧 Tecnologías Utilizadas

- **HTML5 Canvas**: Renderizado gráfico de alto rendimiento
- **JavaScript ES6+**: Módulos, clases, arrow functions
- **Web Audio API**: Síntesis de audio en tiempo real
- **CSS3**: Animaciones, gradientes, glassmorphism
- **Service Workers**: Funcionalidad PWA y offline
- **LocalStorage**: Persistencia de datos del cliente
- **RequestAnimationFrame**: Loop de juego a 60 FPS

---

## 🌟 Características Destacadas

### Sistema de Partículas Avanzado
```javascript
// Ejemplo de uso
particles.emit(x, y, {
    count: 30,
    color: '#ffd700',
    speed: 5,
    life: 0.8,
    gravity: 0.15,
    spread: Math.PI * 2
});
```

### IA con Pathfinding
Los enemigos persiguen inteligentemente al jugador:
- **Modo Patrulla**: Movimiento aleatorio cuando estás lejos
- **Modo Persecución**: Te persiguen activamente cuando te acercas
- **Actualización Dinámica**: Recalculan la ruta cada 500ms

### Sistema de Combos Visualizado
- Barra de progreso del combo en pantalla
- Timer visual que muestra cuánto tiempo queda
- Efectos visuales y sonoros al conseguir combos altos

---

## 🐛 Solución de Problemas

### El juego no carga
- **Problema**: Módulos ES6 bloqueados
- **Solución**: Usa un servidor local (ver [Instalación](#instalación))

### Sonidos no funcionan
- **Problema**: Web Audio API bloqueada por el navegador
- **Solución**: El usuario debe interactuar con la página primero (política de autoplay)

### Rendimiento bajo
- **Problema**: Demasiadas partículas o efectos
- **Solución**: Reduce `CONFIG.PARTICLES.FLAG_COLLECT.count` en `config.js`

### Canvas borroso en pantallas Retina
- **Problema**: DPI alto no manejado
- **Solución**: Implementado automáticamente en dispositivos modernos

---

## 📊 Comparación con Versión Anterior

| Característica | Versión Anterior | Professional Edition |
|----------------|------------------|----------------------|
| **Líneas de Código** | 195 | ~3,500+ |
| **Archivos** | 1 | 20+ |
| **Estados** | 1 | 4 |
| **Niveles** | 1 | 6 progresivos |
| **Power-ups** | 0 | 5 tipos |
| **Partículas** | No | Sistema completo |
| **Audio** | No | Web Audio API |
| **Responsive** | No | Sí, completamente |
| **PWA** | No | Sí, instalable |
| **Logros** | No | 8 achievements |
| **IA Enemigos** | Básica | Pathfinding |
| **Sistema Combos** | No | Sí, con multiplicadores |
| **HUD** | Mínimo | Completo (minimapa incluido) |
| **Controles Táctiles** | No | Sí, joystick virtual |
| **Persistencia** | No | LocalStorage |
| **Animaciones** | Básicas | Profesionales |

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si quieres mejorar Rally X:

1. **Fork** el proyecto
2. Crea una **rama** para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. Abre un **Pull Request**

### Ideas para Contribuir
- 🎨 Nuevos efectos visuales o animaciones
- 🎵 Sistema de música de fondo con tracks
- 🗺️ Editor de niveles
- 👥 Modo multijugador local
- 🌐 Integración con backend (leaderboard global)
- 🎮 Soporte para gamepad
- 🌍 Internacionalización (i18n)

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Puedes usarlo, modificarlo y distribuirlo libremente.

```
MIT License

Copyright (c) 2025 Rally X Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 👨‍💻 Autor

**Rally X - Professional Edition**

Desarrollado con ❤️ y ☕ usando tecnologías web modernas.

- 🌐 Web: [rallyx.com](#)
- 📧 Email: contact@rallyx.com
- 🐦 Twitter: [@rallyxgame](#)

---

## 🙏 Agradecimientos

- Inspirado en el clásico arcade **Rally-X** de Namco (1980)
- Comunidad de HTML5 Game Development
- Todos los testers y jugadores

---

## 📈 Roadmap

### v1.1.0 (Próximamente)
- [ ] Modo multijugador local (2 jugadores)
- [ ] Nuevos tipos de enemigos con comportamientos únicos
- [ ] Boss battles al final de cada mundo
- [ ] Sistema de vidas extra

### v2.0.0 (Futuro)
- [ ] Backend con leaderboard global
- [ ] Modo historia con cinemáticas
- [ ] Editor de niveles integrado
- [ ] Soporte para gamepad nativo
- [ ] Sprites y gráficos HD

---

<div align="center">

**¿Te gusta el proyecto? Dale una ⭐ en GitHub!**

[🎮 Jugar Ahora](#) | [🐛 Reportar Bug](https://github.com/tu-usuario/rallyx/issues) | [💡 Sugerir Feature](https://github.com/tu-usuario/rallyx/issues)

---

Hecho con 💙 usando HTML5 Canvas & JavaScript

© 2025 Rally X - Professional Edition

</div>
