#!/bin/bash

# Rally X - Script de Deployment Automático
# Este script te da varias opciones de deployment

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║           🚀 RALLY X - DEPLOYMENT AUTOMÁTICO                         ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "Selecciona una opción:"
echo ""
echo "  1) 🌐 Crear Pull Request en GitHub (abre navegador)"
echo "  2) 📱 Abrir configuración de GitHub Pages (abre navegador)"
echo "  3) 💻 Iniciar servidor local en puerto 8000"
echo "  4) 🚀 Abrir Netlify Drop para deployment (abre navegador)"
echo "  5) ⚡ Abrir Vercel para deployment (abre navegador)"
echo "  6) 📊 Ver estado del proyecto"
echo "  7) 🔍 Abrir app local en navegador"
echo "  0) ❌ Salir"
echo ""
read -p "Elige una opción (0-7): " option

case $option in
  1)
    echo -e "${BLUE}🔗 Abriendo Pull Request en GitHub...${NC}"
    URL="https://github.com/pablocussen/rallyx/compare/main...claude/professional-app-overhaul-011CUrbQRQRpzFW9gESMZ1EC"
    if command -v xdg-open > /dev/null; then
      xdg-open "$URL"
    elif command -v open > /dev/null; then
      open "$URL"
    else
      echo "Abre esta URL en tu navegador:"
      echo "$URL"
    fi
    echo -e "${GREEN}✅ Instrucciones:${NC}"
    echo "   1. Click en 'Create pull request'"
    echo "   2. Click en 'Merge pull request'"
    echo "   3. ¡Listo!"
    ;;

  2)
    echo -e "${BLUE}⚙️ Abriendo configuración de GitHub Pages...${NC}"
    URL="https://github.com/pablocussen/rallyx/settings/pages"
    if command -v xdg-open > /dev/null; then
      xdg-open "$URL"
    elif command -v open > /dev/null; then
      open "$URL"
    else
      echo "Abre esta URL en tu navegador:"
      echo "$URL"
    fi
    echo -e "${GREEN}✅ Instrucciones:${NC}"
    echo "   1. Source: Deploy from a branch"
    echo "   2. Branch: claude/professional-app-overhaul-..."
    echo "   3. Folder: / (root)"
    echo "   4. Click 'Save'"
    echo "   5. Tu app estará en: https://pablocussen.github.io/rallyx/"
    ;;

  3)
    echo -e "${BLUE}💻 Iniciando servidor local...${NC}"
    echo ""
    echo -e "${GREEN}✅ Servidor corriendo en:${NC}"
    echo "   👉 http://localhost:8000"
    echo ""
    echo "Presiona Ctrl+C para detener el servidor"
    echo ""
    python3 -m http.server 8000
    ;;

  4)
    echo -e "${BLUE}🚀 Abriendo Netlify Drop...${NC}"
    URL="https://app.netlify.com/drop"
    if command -v xdg-open > /dev/null; then
      xdg-open "$URL"
    elif command -v open > /dev/null; then
      open "$URL"
    else
      echo "Abre esta URL en tu navegador:"
      echo "$URL"
    fi
    echo -e "${GREEN}✅ Instrucciones:${NC}"
    echo "   1. Arrastra TODA la carpeta 'rallyx' a la ventana"
    echo "   2. ¡Listo! Tendrás una URL instantánea"
    ;;

  5)
    echo -e "${BLUE}⚡ Abriendo Vercel...${NC}"
    URL="https://vercel.com/new"
    if command -v xdg-open > /dev/null; then
      xdg-open "$URL"
    elif command -v open > /dev/null; then
      open "$URL"
    else
      echo "Abre esta URL en tu navegador:"
      echo "$URL"
    fi
    echo -e "${GREEN}✅ Instrucciones:${NC}"
    echo "   1. Import Git Repository"
    echo "   2. Selecciona: pablocussen/rallyx"
    echo "   3. Branch: claude/professional-app-overhaul-..."
    echo "   4. Click 'Deploy'"
    ;;

  6)
    echo -e "${BLUE}📊 Estado del proyecto Rally X:${NC}"
    echo ""
    echo "📁 Archivos:"
    find . -type f -name "*.js" -o -name "*.css" -o -name "*.html" | grep -v node_modules | wc -l | xargs echo "   Total:"
    echo ""
    echo "📝 Líneas de código:"
    find . -name "*.js" -o -name "*.css" | xargs wc -l 2>/dev/null | tail -1 | awk '{print "   " $1 " líneas"}'
    echo ""
    echo "🌿 Branch actual:"
    git branch --show-current | xargs echo "   "
    echo ""
    echo "📦 Últimos commits:"
    git log --oneline -3 | sed 's/^/   /'
    echo ""
    echo "🔗 URLs disponibles:"
    echo "   Local:  http://localhost:8000"
    echo "   GitHub: https://github.com/pablocussen/rallyx"
    echo "   Pages:  https://pablocussen.github.io/rallyx/ (cuando lo actives)"
    ;;

  7)
    echo -e "${BLUE}🔍 Abriendo app local...${NC}"
    # Verificar si el servidor está corriendo
    if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
      echo -e "${GREEN}✅ Servidor ya está corriendo${NC}"
      URL="http://localhost:8000"
      if command -v xdg-open > /dev/null; then
        xdg-open "$URL"
      elif command -v open > /dev/null; then
        open "$URL"
      else
        echo "Abre esta URL en tu navegador:"
        echo "$URL"
      fi
    else
      echo -e "${YELLOW}⚠️  El servidor no está corriendo${NC}"
      echo "Iniciando servidor..."
      python3 -m http.server 8000 &
      sleep 2
      URL="http://localhost:8000"
      if command -v xdg-open > /dev/null; then
        xdg-open "$URL"
      elif command -v open > /dev/null; then
        open "$URL"
      else
        echo "Abre esta URL en tu navegador:"
        echo "$URL"
      fi
    fi
    ;;

  0)
    echo "👋 ¡Hasta luego!"
    exit 0
    ;;

  *)
    echo -e "${YELLOW}❌ Opción no válida${NC}"
    exit 1
    ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
