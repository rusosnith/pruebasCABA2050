# Contexto del proyecto: CABA 2050 / Street View comparador histórico

## 1) Resumen general

Este proyecto es una app estática de comparación histórica de imágenes de Google Street View para ubicaciones de la Ciudad de Buenos Aires. La idea es permitir comparar una vista antigua y una vista moderna de la misma ubicación, con modos de comparación por divisor, opacidad y línea de tiempo.

La app está pensada para publicarse en GitHub Pages y no requiere backend propio en producción. La capa de datos se genera previamente y se entrega como archivos estáticos.

## 2) Estado actual del repositorio

Estructura principal:

- `index.html`: la interfaz principal del sitio.
- `assets/styles.css`: estilos del sitio.
- `assets/compare-slider.js`: lógica de drag/comparador para móvil y desktop.
- `data/locations.csv`: fuente de ubicaciones a procesar.
- `data/manifest.json`: manifest generado con todas las ubicaciones y sus secuencias de imágenes.
- `assets/streetview/`: imágenes descargadas y organizadas por ubicación.
- `scripts/preload-streetview.mjs`: script para precargar panoramas e imágenes.
- `scripts/sync-locations-from-sheet.mjs`: sincroniza la lista de ubicaciones desde Google Sheets.
- `tests/`: pruebas unitarias para utilidades y comportamiento del comparador.
- `.github/workflows/`: automations de GitHub Actions.

## 3) Cómo funciona la app

### Flujo principal

1. El repositorio define una lista de ubicaciones en `data/locations.csv`.
2. El script `scripts/preload-streetview.mjs` recorre esas ubicaciones y usa Playwright + Google Maps Street View para:
   - resolver la panorámica base,
   - consultar la línea de tiempo histórica del panorama,
   - descargar imágenes por fecha,
   - generar el manifest `data/manifest.json`.
3. Las imágenes quedan guardadas bajo `assets/streetview/<slug>/`.
4. `index.html` lee el `manifest.json` y genera la interfaz con selector de ubicación, comparación y modo de línea de tiempo.

### Modelo de datos

El manifest generado tiene este tipo de estructura:

- `generatedAt`: tiempo de generación.
- `locations`: array de ubicaciones.
  - `slug`
  - `label`
  - `sourceUrl`
  - `lat`, `lng`
  - `fov`, `heading`, `pitch`
  - `panos`: secuencia ordenada por tiempo con imágenes y fechas.

Cada entrada de `panos` tiene normalmente:

- `pano`
- `rawDate`
- `label`
- `timestamp`
- `image`: ruta local de la imagen en `assets/streetview/`

## 4) Archivos clave y su rol

### `index.html`

Es la vista principal del sitio. Incluye:

- header y footer visuales,
- selector de ubicación,
- botónes para tres modos: comparador, opacidad y línea de tiempo,
- estructura HTML del `div` comparador con imágenes y divisor,
- lógica de inicialización del frontend en un bloque de script.

### `assets/compare-slider.js`

Contiene las utilidades para el control del divisor y la coordinación del dragging. Tiene funciones utilitarias como:

- `clamp(value, min, max)`
- `getPointerClientX(event)`
- `getSplitPercentFromPointer(event, rect)`

Esto permite que el comparador funcione tanto en mouse como en eventos táctiles, que es clave para mobile.

### `scripts/preload-streetview.mjs`

Es el script central de preparación. Tiene responsabilidades como:

- leer CSV local,
- validar ubicaciones,
- parsear URLs de Street View,
- detectar camara/heading/pitch/fov,
- consultar timeline de panorama,
- preservar y limpiar assets no usados,
- escribir `data/locations.csv` y `data/manifest.json`.

### `scripts/sync-locations-from-sheet.mjs`

Sirve para traer la lista de localizaciones desde una CSV pública de Google Sheets, preservando ciertos campos operativos locales (status, last_downloaded_at, etc.) si ya existen. Esto ayuda a mantener la fuente de datos sincronizada sin destruir el estado del pipeline.

### `tests/*.test.mjs`

Hay pruebas de Node para validar:

- parsing de URLs de Street View,
- construcción de query params de imagen,
- funciones de clamp y cálculo del split del slider.

## 5) Dependencias y comandos

### Instalación

```bash
npm install
npx playwright install --with-deps chromium
```

### Preload local

```bash
export GOOGLE_MAPS_API_KEY="tu-key"
npm run preload
```

Para regenerar todo:

```bash
npm run preload -- --all
```

### Sincronizar ubicación desde Google Sheets

```bash
export GOOGLE_SHEETS_CSV_URL="https://docs.google.com/....csv"
node scripts/sync-locations-from-sheet.mjs
```

### Servir localmente

```bash
python3 -m http.server 8080 --bind 0.0.0.0
```

Luego abrir en el navegador el sitio apuntando a `http://127.0.0.1:8080`.

### Pruebas

```bash
node --test tests/*.test.mjs
```

## 6) GitHub Actions y despliegue

### Workflow: `Preload Street View Assets`

- Dispara manualmente (`workflow_dispatch`)
- O también cuando hay cambios en:
  - `data/locations.csv`
  - `scripts/preload-streetview.mjs`
  - `package.json`
  - `package-lock.json`
  - el workflow mismo
- Requiere el secret `GOOGLE_MAPS_API_KEY`
- Ejecuta Playwright + preload script
- Hace `git add` y `git push` de:
  - `data/locations.csv`
  - `data/manifest.json`
  - `assets/streetview/`

### Workflow: `Sync Locations From Google Sheets`

- Dispara manualmente
- Descarga el CSV desde Google Sheets
- Actualiza `data/locations.csv`
- Hace commit del cambio si hubo diferencia

## 7) Secretos y variables que se usan

- `GOOGLE_MAPS_API_KEY`: clave para resolver Street View y descargar imágenes.
- `GOOGLE_SHEETS_CSV_URL`: URL pública del CSV de Google Sheets para sincronizar ubicaciones.

Se espera que la key tenga acceso a servicios de Google Maps relevantes para uso de Street View.

## 8) Notas de mantenimiento

- El sitio es estático: no hay backend ni API en producción.
- El contenido útil se genera y versiona en `data/manifest.json` y `assets/streetview/`.
- Si se cambia la fuente de locales o la lógica del preload, conviene revisar `data/locations.csv`, `scripts/preload-streetview.mjs` y el workflow de GitHub Actions.
- Para agregar ubicaciones, normalmente se actualiza la fuente de datos y luego se vuelve a ejecutar el preload.
- El código front-end assume que el manifest ya existe con datos bien formados.

## 9) Riesgos / puntos a revisar si algo falla

- `GOOGLE_MAPS_API_KEY` ausente o sin permisos.
- `data/manifest.json` desactualizado respecto a `assets/streetview/`.
- Archivos de imagenes faltantes para un slug.
- URLs de Street View que ya no tienen el mismo formato esperado por `parseStreetViewURL`.
- Cambios en la estructura del CSV o del manifest que rompen el frontend.
- Error de navegador o falta de Playwright Chromium para la precarga local.

## 10) Resumen operativo para retomar trabajo

Cuando se vuelva a retomar este proyecto, lo más importante es revisar en este orden:

1. `data/locations.csv` para ver la fuente de lugares.
2. `scripts/preload-streetview.mjs` para revisar cómo se genera el manifest.
3. `data/manifest.json` para validar que las fechas e imágenes quedaron bien armadas.
4. `index.html` y `assets/compare-slider.js` para ajustar la interacción visual.
5. `.github/workflows/` si se necesita automatizar sincronización y generación de assets.

## 11) Dato útil para continuidad

El repositorio ya tiene una base de funcionamiento comprobada, con pruebas y generación de assets, y está preparado para implementarse como sitio estático sencillo. La parte más sensible del proyecto es el pipeline de precarga de Street View, porque depende de una clave de Google Maps y de la estabilidad del formato de URLs del servicio.
