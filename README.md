# pruebasCABA2050

Comparador historico de Street View preparado para funcionar como sitio estatico en GitHub Pages.

## Como funciona

El sitio publico no usa tokens en el navegador. En su lugar:

1. Un workflow de GitHub Actions toma una lista de URLs desde `data/locations.csv`.
2. El workflow usa el secret `GOOGLE_MAPS_API_KEY` para resolver el timeline historico y descargar imagenes.
3. Las imagenes se guardan en `assets/streetview/`.
4. El script genera `data/manifest.json`.
5. `index.html` consume ese manifiesto y muestra solo ubicaciones precargadas.

## Archivos clave

- `data/locations.csv`: ubicaciones fuente a procesar.
- `data/manifest.json`: inventario generado para el frontend.
- `scripts/preload-streetview.mjs`: script de generacion offline.
- `.github/workflows/preload-streetview.yml`: workflow que ejecuta la precarga y commitea resultados.

## Formato del CSV

Columnas esperadas:

- `slug`
- `label`
- `street_view_url`
- `status`
- `last_downloaded_at`
- `last_error`

`status` se actualiza automaticamente a `done` o `error` despues de cada corrida.

## Secret requerido

Configura en GitHub el secret del repositorio:

- `GOOGLE_MAPS_API_KEY`

La key debe tener habilitadas:

- Maps JavaScript API
- Street View Static API

La sincronizacion del CSV ya quedo apuntando a esta URL publica de Google Sheets:

```bash
https://docs.google.com/spreadsheets/d/e/2PACX-1vRKholbrk6Rg_5H0KgaFTEBhnUcscCItkJ-gCbvmuh6QENESjCuFs1Ma4GEy0TM6hOQGg7tj1a8BV84/pub?gid=0&single=true&output=csv
```

## Ejecutar localmente

Instalar dependencias:

```bash
npm install
npx playwright install --with-deps chromium
```

Generar assets pendientes:

```bash
export GOOGLE_MAPS_API_KEY="tu-key"
npm run preload
```

Sincronizar `data/locations.csv` desde Google Sheets:

```bash
export GOOGLE_SHEETS_CSV_URL="https://docs.google.com/spreadsheets/d/e/2PACX-1vRKholbrk6Rg_5H0KgaFTEBhnUcscCItkJ-gCbvmuh6QENESjCuFs1Ma4GEy0TM6hOQGg7tj1a8BV84/pub?gid=0&single=true&output=csv"
node scripts/sync-locations-from-sheet.mjs
```

Reprocesar todo:

```bash
npm run preload -- --all
```

Levantar el sitio estatico:

```bash
python3 -m http.server 8080 --bind 0.0.0.0
```

## GitHub Actions

El workflow `Preload Street View Assets` se puede ejecutar de dos formas:

- manualmente con `workflow_dispatch`
- automaticamente cuando cambia `data/locations.csv`

Tambien existe el workflow `Sync Locations From Google Sheets`, que se ejecuta manualmente desde GitHub Actions y actualiza `data/locations.csv` usando la URL publica ya configurada en el workflow.

Si hay cambios, el workflow hace commit de:

- `data/locations.csv`
- `data/manifest.json`
- `assets/streetview/`

## GitHub Pages

Configura GitHub Pages para publicar desde la rama `main` y la raiz del repositorio. Como el sitio final solo usa archivos estaticos, no hace falta backend adicional.
