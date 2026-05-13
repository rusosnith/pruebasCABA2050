import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const ASSET_DIR = path.join(ROOT_DIR, 'assets', 'streetview');
const CSV_PATH = path.join(DATA_DIR, 'locations.csv');
const MANIFEST_PATH = path.join(DATA_DIR, 'manifest.json');
const IMAGE_WIDTH = 900;
const IMAGE_HEIGHT = 600;
const FORCE_ALL = process.argv.includes('--all');

function parseStreetViewURL(url) {
  const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (!coordMatch) return null;

  const lat = Number.parseFloat(coordMatch[1]);
  const lng = Number.parseFloat(coordMatch[2]);
  const headingMatch = url.match(/,(\d+(?:\.\d+)?)h[,/]/);
  const heading = headingMatch ? Number.parseFloat(headingMatch[1]) : 0;
  const tiltMatch = url.match(/,(\d+(?:\.\d+)?)t[,/]/);
  const tilt = tiltMatch ? Number.parseFloat(tiltMatch[1]) : 90;
  const pitch = 90 - tilt;

  return { lat, lng, heading, pitch };
}

function parseStreetViewDate(rawDate) {
  if (!rawDate) return null;
  if (/^\d{4}$/.test(rawDate)) return Date.UTC(Number(rawDate), 0, 1);

  if (/^\d{4}-\d{2}$/.test(rawDate)) {
    const [year, month] = rawDate.split('-').map(Number);
    return Date.UTC(year, month - 1, 1);
  }

  const parsed = Date.parse(rawDate);
  return Number.isNaN(parsed) ? null : parsed;
}

function formatDate(rawDate) {
  if (!rawDate) return '?';
  if (/^\d{4}$/.test(rawDate)) return rawDate;

  const timestamp = parseStreetViewDate(rawDate);
  if (timestamp === null) return rawDate;

  return new Intl.DateTimeFormat('es-AR', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(timestamp);
}

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'ubicacion';
}

function safeFileSegment(value) {
  return String(value || 'sin-fecha')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'sin-fecha';
}

function staticURL(panoId, heading, pitch, key, width = IMAGE_WIDTH, height = IMAGE_HEIGHT) {
  return `https://maps.googleapis.com/maps/api/streetview?size=${width}x${height}&pano=${encodeURIComponent(panoId)}&heading=${heading}&pitch=${pitch}&key=${encodeURIComponent(key)}`;
}

async function ensureDir(targetPath) {
  await fs.mkdir(targetPath, { recursive: true });
}

async function syncAssetDirectories(activeSlugs) {
  const entries = await fs.readdir(ASSET_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (activeSlugs.has(entry.name)) continue;

    await fs.rm(path.join(ASSET_DIR, entry.name), { recursive: true, force: true });
  }
}

async function readCSV() {
  const csvRaw = await fs.readFile(CSV_PATH, 'utf8');
  return parse(csvRaw, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
}

async function writeCSV(rows) {
  const csvOut = stringify(rows, {
    header: true,
    columns: ['slug', 'label', 'street_view_url', 'status', 'last_downloaded_at', 'last_error']
  });

  await fs.writeFile(CSV_PATH, csvOut, 'utf8');
}

async function readManifest() {
  try {
    const raw = await fs.readFile(MANIFEST_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { generatedAt: null, locations: [] };
    }

    throw error;
  }
}

async function writeManifest(locations) {
  const manifest = {
    generatedAt: new Date().toISOString(),
    locations
  };

  await fs.writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}

async function loadGoogleMaps(page, apiKey) {
  await page.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>');
  await page.addScriptTag({
    url: `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}`
  });
  await page.waitForFunction(() => Boolean(window.google && window.google.maps && window.google.maps.StreetViewService));
}

async function fetchPanoramaTimeline(page, parsedLocation) {
  return page.evaluate(async ({ lat, lng }) => {
    return await new Promise((resolve, reject) => {
      const service = new google.maps.StreetViewService();
      service.getPanorama(
        {
          location: { lat, lng },
          radius: 80,
          preference: google.maps.StreetViewPreference.NEAREST
        },
        (data, status) => {
          if (status !== 'OK') {
            reject(new Error(`Street View lookup failed with status ${status}`));
            return;
          }

          resolve({
            location: {
              pano: data.location?.pano || '',
              latLng: data.location?.latLng
                ? {
                    lat: data.location.latLng.lat(),
                    lng: data.location.latLng.lng()
                  }
                : null
            },
            time: (data.time || []).map((item) => ({
              pano: item?.pano || '',
              description: item?.description || '',
              date: item?.date || ''
            }))
          });
        }
      );
    });
  }, parsedLocation);
}

async function fetchPanoramaMetadata(apiKey, panoId, fallbackDate, sourceIndex) {
  const url = `https://maps.googleapis.com/maps/api/streetview/metadata?pano=${encodeURIComponent(panoId)}&key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Metadata request failed for pano ${panoId}: HTTP ${response.status}`);
  }

  const metadata = await response.json();
  if (metadata.status !== 'OK') {
    throw new Error(`Metadata request failed for pano ${panoId}: ${metadata.status}`);
  }

  const rawDate = metadata.date || fallbackDate || '';
  return {
    pano: panoId,
    rawDate,
    label: formatDate(rawDate || 'sin fecha'),
    timestamp: parseStreetViewDate(rawDate),
    sourceIndex
  };
}

async function buildTimelineEntries(rawTimelineData, apiKey) {
  const panoEntries = [];

  (rawTimelineData.time || []).forEach((item, index) => {
    if (item?.pano) {
      panoEntries.push({
        pano: item.pano,
        fallbackDate: item.description || item.date || '',
        sourceIndex: index
      });
    }
  });

  if (rawTimelineData.location?.pano) {
    panoEntries.push({
      pano: rawTimelineData.location.pano,
      fallbackDate: panoEntries[panoEntries.length - 1]?.fallbackDate || '',
      sourceIndex: panoEntries.length
    });
  }

  const seen = new Set();
  const uniqueEntries = panoEntries.filter((entry) => {
    if (seen.has(entry.pano)) return false;
    seen.add(entry.pano);
    return true;
  });

  const timelineEntries = await Promise.all(
    uniqueEntries.map((entry) => fetchPanoramaMetadata(apiKey, entry.pano, entry.fallbackDate, entry.sourceIndex))
  );

  return timelineEntries.sort((a, b) => {
    if (Number.isFinite(a.timestamp) && Number.isFinite(b.timestamp) && a.timestamp !== b.timestamp) {
      return a.timestamp - b.timestamp;
    }

    if (Number.isFinite(a.timestamp) && !Number.isFinite(b.timestamp)) return -1;
    if (!Number.isFinite(a.timestamp) && Number.isFinite(b.timestamp)) return 1;
    return a.sourceIndex - b.sourceIndex;
  });
}

async function downloadImage(url, destinationPath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Image request failed: HTTP ${response.status}`);
  }

  const fileBuffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(destinationPath, fileBuffer);
}

async function buildLocationManifestEntry(page, row, apiKey) {
  const parsedLocation = parseStreetViewURL(row.street_view_url);
  if (!parsedLocation) {
    throw new Error(`No se pudo parsear la URL de Street View para ${row.label || row.slug || 'sin-nombre'}`);
  }

  const timelineData = await fetchPanoramaTimeline(page, parsedLocation);
  let panos = await buildTimelineEntries(timelineData, apiKey);

  if (!panos.length && timelineData.location?.pano) {
    panos = [{
      pano: timelineData.location.pano,
      rawDate: 'actual',
      label: 'actual',
      timestamp: null,
      sourceIndex: 0
    }];
  }

  if (!panos.length) {
    throw new Error('No se encontraron panoramas para esta ubicacion');
  }

  const slug = slugify(row.slug || row.label || row.street_view_url);
  const targetDir = path.join(ASSET_DIR, slug);
  await fs.rm(targetDir, { recursive: true, force: true });
  await ensureDir(targetDir);

  const panosWithImages = [];
  for (const [index, entry] of panos.entries()) {
    const fileName = `${String(index).padStart(3, '0')}_${safeFileSegment(entry.rawDate || entry.label)}.jpg`;
    const destinationPath = path.join(targetDir, fileName);
    const imageURL = staticURL(entry.pano, parsedLocation.heading, parsedLocation.pitch, apiKey);

    await downloadImage(imageURL, destinationPath);

    panosWithImages.push({
      pano: entry.pano,
      rawDate: entry.rawDate,
      label: entry.label,
      timestamp: entry.timestamp,
      image: path.posix.join('assets', 'streetview', slug, fileName)
    });
  }

  return {
    slug,
    label: row.label || slug,
    sourceUrl: row.street_view_url,
    lat: timelineData.location?.latLng?.lat ?? parsedLocation.lat,
    lng: timelineData.location?.latLng?.lng ?? parsedLocation.lng,
    heading: parsedLocation.heading,
    pitch: parsedLocation.pitch,
    imageWidth: IMAGE_WIDTH,
    imageHeight: IMAGE_HEIGHT,
    panos: panosWithImages
  };
}

async function main() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('Falta la variable de entorno GOOGLE_MAPS_API_KEY');
  }

  await ensureDir(DATA_DIR);
  await ensureDir(ASSET_DIR);

  const rows = await readCSV();
  const existingManifest = await readManifest();
  const existingLocations = new Map((existingManifest.locations || []).map((location) => [location.slug, location]));
  const nextLocations = [];

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await loadGoogleMaps(page, apiKey);

    for (const row of rows) {
      const slug = slugify(row.slug || row.label || row.street_view_url);
      const shouldProcess = FORCE_ALL || row.status !== 'done' || !existingLocations.has(slug);

      if (!shouldProcess) {
        nextLocations.push(existingLocations.get(slug));
        continue;
      }

      process.stdout.write(`Procesando ${row.label || slug}...\n`);

      try {
        const locationEntry = await buildLocationManifestEntry(page, row, apiKey);
        nextLocations.push(locationEntry);
        row.slug = locationEntry.slug;
        row.status = 'done';
        row.last_downloaded_at = new Date().toISOString();
        row.last_error = '';
      } catch (error) {
        row.slug = slug;
        row.status = 'error';
        row.last_error = error instanceof Error ? error.message : String(error);
        process.stderr.write(`Error en ${row.label || slug}: ${row.last_error}\n`);

        if (existingLocations.has(slug)) {
          nextLocations.push(existingLocations.get(slug));
        }
      }

      await writeCSV(rows);
    }
  } finally {
    await browser.close();
  }

  await syncAssetDirectories(new Set(nextLocations.map((location) => location.slug)));
  await writeCSV(rows);
  await writeManifest(nextLocations);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exitCode = 1;
});
