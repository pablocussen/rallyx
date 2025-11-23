# 🚀 Rally X - Guía de Deployment

Esta aplicación está lista para deployarse en múltiples plataformas. A continuación, las opciones disponibles:

## ✅ Opción 1: GitHub Pages (Recomendado - Automático)

**Estado**: ✅ Configurado y listo

El repositorio ya incluye un workflow de GitHub Actions que deploya automáticamente a GitHub Pages.

### Pasos para activar:

1. Ve a tu repositorio en GitHub: `https://github.com/pablocussen/rallyx`
2. Click en **Settings** > **Pages**
3. En **Source**, selecciona **GitHub Actions**
4. Haz push a la rama `main` o `master` (o ejecuta el workflow manualmente)
5. El sitio estará disponible en: `https://pablocussen.github.io/rallyx/`

### Deployment manual del workflow:
```bash
# Desde GitHub:
Actions > Deploy to GitHub Pages > Run workflow
```

---

## ⚡ Opción 2: Vercel (Deployment Instantáneo)

**Estado**: ✅ Configurado

### Deploy con Vercel CLI:
```bash
# Instalar Vercel CLI (si no está instalado)
npm install -g vercel

# Login
vercel login

# Deploy a producción
vercel --prod
```

### Deploy con Git (más fácil):
1. Ve a [vercel.com](https://vercel.com)
2. Click en **Add New Project**
3. Importa el repositorio `pablocussen/rallyx`
4. Vercel detectará automáticamente la configuración
5. Click en **Deploy**

**URL de producción**: Se generará automáticamente (ej: `rallyx.vercel.app`)

---

## 🌐 Opción 3: Netlify

**Estado**: ✅ Configurado

### Deploy con Netlify CLI:
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### Deploy con Git (recomendado):
1. Ve a [netlify.com](https://netlify.com)
2. Click en **Add new site** > **Import an existing project**
3. Conecta con GitHub y selecciona `pablocussen/rallyx`
4. Netlify detectará automáticamente:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Click en **Deploy site**

**URL de producción**: Se generará automáticamente (ej: `rallyx.netlify.app`)

---

## 📦 Build Local

Para probar el build de producción localmente:

```bash
# Build
npm run build

# Preview del build
npm run preview
```

El preview estará disponible en `http://localhost:4173`

---

## 🔧 Configuración Técnica

### Build Output:
- **Directorio**: `dist/`
- **Comando**: `npm run build`
- **Bundle size**: ~156 kB (43 kB gzipped)

### Archivos de Configuración:
- `vercel.json` - Configuración de Vercel
- `netlify.toml` - Configuración de Netlify
- `.github/workflows/deploy.yml` - GitHub Actions para GitHub Pages

### Características del Build:
- ✅ Minificación y optimización automática
- ✅ Code splitting
- ✅ Asset hashing para cache busting
- ✅ Gzip compression
- ✅ Security headers configurados
- ✅ Service Worker support
- ✅ PWA ready

---

## 🎯 Recomendación

**Para máxima simplicidad**: Usa **GitHub Pages** - Ya está todo configurado, solo necesitas activarlo en Settings.

**Para máximo control**: Usa **Vercel** o **Netlify** - Ofrecen analytics, preview deployments, y más features.

---

## 📊 Monitoreo Post-Deployment

Una vez deployado, puedes verificar:

1. **Performance**: 
   - Lighthouse score (aim for 90+)
   - Core Web Vitals

2. **Funcionalidad**:
   - Todas las 361 tests están pasando ✅
   - Sistema de achievements funcional
   - Power-ups y combos
   - Tutorial system
   - Music engine
   - Particle effects
   - Y todas las 8 features del roadmap extendido

3. **Compatibilidad**:
   - Desktop browsers (Chrome, Firefox, Safari, Edge)
   - Mobile devices
   - Different screen sizes

---

## 🆘 Troubleshooting

### Error: "Build failed"
- Verificar que `node_modules` esté instalado: `npm install`
- Verificar versión de Node: `node --version` (recomendado: v18+)

### Error: "Tests failing"
- Correr tests localmente: `npm test`
- Todos los 361 tests deberían pasar

### Error: "Page not loading"
- Verificar que GitHub Pages esté habilitado en Settings
- Verificar que el workflow haya corrido exitosamente en Actions
- Esperar 1-2 minutos para propagación de DNS

---

¡Listo para deployar! 🚀
