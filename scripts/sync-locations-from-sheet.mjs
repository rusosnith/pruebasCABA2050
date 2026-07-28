import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const CSV_PATH = path.join(DATA_DIR, 'locations.csv');
const SHEET_CSV_URL = process.env.GOOGLE_SHEETS_CSV_URL;

const REQUIRED_COLUMNS = ['slug', 'label', 'street_view_url'];
const OUTPUT_COLUMNS = ['slug', 'label', 'street_view_url', 'latitude', 'longitude', 'desactivar', 'status', 'last_downloaded_at', 'last_error'];
const CONTENT_FALLBACK_COLUMNS = ['latitude', 'longitude', 'desactivar'];
const OPERATIONAL_COLUMNS = ['status', 'last_downloaded_at', 'last_error'];

async function readLocalRows() {
  try {
    const csvRaw = await fs.readFile(CSV_PATH, 'utf8');
    return parse(csvRaw, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

function normalizeValue(value) {
  return String(value ?? '').trim();
}

function validateColumns(records) {
  if (!records.length) {
    throw new Error('La exportacion de Google Sheets no contiene filas de datos');
  }

  const firstRow = records[0];
  const missingColumns = REQUIRED_COLUMNS.filter((column) => !(column in firstRow));
  if (missingColumns.length) {
    throw new Error(`Faltan columnas obligatorias en la Sheet: ${missingColumns.join(', ')}`);
  }
}

function buildOperationalStateMap(rows) {
  return new Map(
    rows.map((row) => [normalizeValue(row.slug), {
      status: normalizeValue(row.status),
      last_downloaded_at: normalizeValue(row.last_downloaded_at),
      last_error: normalizeValue(row.last_error),
      latitude: normalizeValue(row.latitude),
      longitude: normalizeValue(row.longitude),
      desactivar: normalizeValue(row.desactivar)
    }])
  );
}

function mergeRows(remoteRows, localStateBySlug) {
  const seenSlugs = new Set();

  return remoteRows.map((row, index) => {
    const mergedRow = {
      slug: normalizeValue(row.slug),
      label: normalizeValue(row.label),
      street_view_url: normalizeValue(row.street_view_url),
      latitude: '',
      longitude: '',
      desactivar: '',
      status: '',
      last_downloaded_at: '',
      last_error: ''
    };

    for (const column of OPERATIONAL_COLUMNS) {
      mergedRow[column] = normalizeValue(row[column]);
    }

    for (const column of CONTENT_FALLBACK_COLUMNS) {
      mergedRow[column] = normalizeValue(row[column]);
    }

    if (!mergedRow.slug) {
      throw new Error(`La fila ${index + 2} no tiene slug`);
    }

    if (!mergedRow.label) {
      throw new Error(`La fila ${index + 2} no tiene label`);
    }

    if (!mergedRow.street_view_url) {
      throw new Error(`La fila ${index + 2} no tiene street_view_url`);
    }

    if (seenSlugs.has(mergedRow.slug)) {
      throw new Error(`Slug duplicado en la Sheet: ${mergedRow.slug}`);
    }

    seenSlugs.add(mergedRow.slug);

    const localState = localStateBySlug.get(mergedRow.slug);
    for (const column of OPERATIONAL_COLUMNS) {
      if (!mergedRow[column] && localState?.[column]) {
        mergedRow[column] = localState[column];
      }
    }

    for (const column of CONTENT_FALLBACK_COLUMNS) {
      if (!mergedRow[column] && localState?.[column]) {
        mergedRow[column] = localState[column];
      }
    }

    return mergedRow;
  });
}

async function fetchRemoteRows() {
  if (!SHEET_CSV_URL) {
    throw new Error('Falta la variable de entorno GOOGLE_SHEETS_CSV_URL');
  }

  const response = await fetch(SHEET_CSV_URL);
  if (!response.ok) {
    throw new Error(`No se pudo descargar la Sheet: HTTP ${response.status}`);
  }

  const csvRaw = await response.text();
  const rows = parse(csvRaw, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  validateColumns(rows);
  return rows;
}

async function writeRows(rows) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const csvOut = stringify(rows, {
    header: true,
    columns: OUTPUT_COLUMNS
  });

  await fs.writeFile(CSV_PATH, csvOut, 'utf8');
}

async function main() {
  const [localRows, remoteRows] = await Promise.all([readLocalRows(), fetchRemoteRows()]);
  const localStateBySlug = buildOperationalStateMap(localRows);
  const mergedRows = mergeRows(remoteRows, localStateBySlug);

  await writeRows(mergedRows);
  process.stdout.write(`Sincronizadas ${mergedRows.length} ubicaciones desde Google Sheets.\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exitCode = 1;
});