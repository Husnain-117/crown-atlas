const https = require('https');
const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

// Pexels fallback (used if Street View returns no imagery for a location)
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'County', 'San-Joaquin');

// ─────────────────────────────────────────────────────────────────────────────
// SAN JOAQUIN COUNTY CITIES
// Each city has:
//   streetView: exact GPS + heading + pitch to capture the iconic landmark
//   pexelsQueries: fallback search terms if Street View has no panorama
// ─────────────────────────────────────────────────────────────────────────────
const SAN_JOAQUIN_CITIES = [
  {
    name: 'Stockton',
    filename: 'stockton-ca.jpg',
    icon: 'Bob Hope Theatre — 242 E Main St, Stockton',
    streetView: {
      lat: 37.95765,
      lng: -121.29054,
      heading: 270,   // facing west along E Main St toward the theatre marquee
      pitch: 5,
      fov: 80
    },
    pexelsQueries: [
      'Stockton California downtown theatre',
      'Stockton California waterfront arena',
      'Stockton CA city skyline'
    ]
  },
  {
    name: 'Lodi',
    filename: 'lodi-ca.jpg',
    icon: 'Lodi Arch — Pine St & School St, Lodi',
    streetView: {
      lat: 38.13024,
      lng: -121.27298,
      heading: 180,   // looking south down Pine St directly at the arch
      pitch: 8,
      fov: 75
    },
    pexelsQueries: [
      'Lodi California wine arch gateway',
      'Lodi wine country vineyard California',
      'California downtown arch historic'
    ]
  },
  {
    name: 'Tracy',
    filename: 'tracy-ca.jpg',
    icon: 'Tracy City Hall / 10th St historic downtown',
    streetView: {
      lat: 37.73966,
      lng: -121.42535,
      heading: 0,     // looking north along 10th St toward City Hall
      pitch: 5,
      fov: 80
    },
    pexelsQueries: [
      'Tracy California city hall downtown',
      'California Central Valley downtown city hall',
      'California suburban city main street'
    ]
  },
  {
    name: 'Manteca',
    filename: 'manteca-ca.jpg',
    icon: 'Manteca downtown — Yosemite Ave & Main St',
    streetView: {
      lat: 37.79743,
      lng: -121.21614,
      heading: 90,    // facing east along Yosemite Ave through downtown
      pitch: 5,
      fov: 80
    },
    pexelsQueries: [
      'Manteca California downtown Yosemite',
      'California Central Valley small town downtown',
      'California suburban downtown main street'
    ]
  },
  {
    name: 'Lathrop',
    filename: 'lathrop-ca.jpg',
    icon: 'Mossdale Crossing Bridge — San Joaquin River, Lathrop',
    streetView: {
      lat: 37.82055,
      lng: -121.27600,
      heading: 270,   // looking west over the San Joaquin River crossing
      pitch: 0,
      fov: 90
    },
    pexelsQueries: [
      'San Joaquin River California bridge',
      'California delta river crossing bridge',
      'California waterway river suburban'
    ]
  },
  {
    name: 'Ripon',
    filename: 'ripon-ca.jpg',
    icon: 'W Main St / Almond Capital downtown, Ripon',
    streetView: {
      lat: 37.74175,
      lng: -121.12260,
      heading: 90,    // looking east along Main St
      pitch: 5,
      fov: 80
    },
    pexelsQueries: [
      'almond blossom orchard California spring pink white',
      'California Central Valley orchard bloom',
      'California almond farm blossom'
    ]
  },
  {
    name: 'Escalon',
    filename: 'escalon-ca.jpg',
    icon: 'McHenry Ave downtown, Escalon',
    streetView: {
      lat: 37.79717,
      lng: -120.99971,
      heading: 0,     // looking north along McHenry Ave through downtown
      pitch: 5,
      fov: 80
    },
    pexelsQueries: [
      'California Central Valley agricultural farmland orchard',
      'San Joaquin County farm landscape California',
      'California vineyard rolling hills farmland'
    ]
  }
];

// --- Helpers ---

function pexelsSearch(query) {
  return new Promise((resolve, reject) => {
    const encodedQuery = encodeURIComponent(query);
    const options = {
      hostname: 'api.pexels.com',
      path: `/v1/search?query=${encodedQuery}&per_page=15&orientation=landscape&size=large`,
      headers: { Authorization: PEXELS_API_KEY }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`JSON parse error: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (res) => {
      // Follow redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        downloadImage(res.headers.location, destPath).then(resolve).catch(reject);
        return;
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Pick the best photo: prefer highest resolution
function pickBestPhoto(photos) {
  if (!photos || photos.length === 0) return null;
  return photos.reduce((best, p) => {
    return (p.width * p.height) > (best.width * best.height) ? p : best;
  });
}

// --- Main ---

async function main() {
  if (!PEXELS_API_KEY) {
    throw new Error('PEXELS_API_KEY is required.');
  }

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`\nCreated directory: ${OUTPUT_DIR}`);
  }

  console.log('\n========================================');
  console.log('  San Joaquin County - Image Downloader');
  console.log('  Using Pexels API (HD, copyright-free)');
  console.log('========================================\n');

  const results = [];

  for (const city of SAN_JOAQUIN_CITIES) {
    const destPath = path.join(OUTPUT_DIR, city.filename);

    if (fs.existsSync(destPath)) {
      console.log(`[SKIP] ${city.name} — already exists: ${city.filename}`);
      results.push({ city: city.name, status: 'skipped', file: city.filename });
      continue;
    }

    console.log(`\n[SEARCHING] ${city.name}`);
    console.log(`  Iconic target: ${city.icon}`);

    let selectedPhoto = null;
    let usedQuery = null;

    for (const query of city.pexelsQueries) {
      console.log(`  Query: "${query}"`);
      try {
        const data = await pexelsSearch(query);
        await sleep(300); // Respect rate limits

        if (data.photos && data.photos.length > 0) {
          selectedPhoto = pickBestPhoto(data.photos);
          usedQuery = query;
          console.log(`  Found ${data.photos.length} results — selected best (${selectedPhoto.width}x${selectedPhoto.height})`);
          console.log(`  Photo by: ${selectedPhoto.photographer} | Pexels ID: ${selectedPhoto.id}`);
          console.log(`  URL: ${selectedPhoto.url}`);
          break;
        } else {
          console.log(`  No results, trying next query...`);
        }
      } catch (err) {
        console.log(`  Error: ${err.message}, trying next query...`);
        await sleep(500);
      }
    }

    if (!selectedPhoto) {
      console.log(`  [FAILED] No suitable image found for ${city.name}`);
      results.push({ city: city.name, status: 'failed', file: city.filename });
      continue;
    }

    // Use the large2x (HD) version, fallback to large
    const imageUrl = selectedPhoto.src.large2x || selectedPhoto.src.large || selectedPhoto.src.original;

    try {
      console.log(`  Downloading HD image...`);
      await downloadImage(imageUrl, destPath);
      const stats = fs.statSync(destPath);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
      console.log(`  [SUCCESS] Saved: ${city.filename} (${sizeMB} MB)`);
      results.push({
        city: city.name,
        status: 'success',
        file: city.filename,
        query: usedQuery,
        photographer: selectedPhoto.photographer,
        pexelsId: selectedPhoto.id,
        resolution: `${selectedPhoto.width}x${selectedPhoto.height}`,
        size: `${sizeMB} MB`
      });
    } catch (err) {
      console.log(`  [FAILED] Download error: ${err.message}`);
      results.push({ city: city.name, status: 'failed', error: err.message });
    }

    await sleep(500); // Rate limit between cities
  }

  // Summary
  console.log('\n========================================');
  console.log('  SUMMARY');
  console.log('========================================');
  const succeeded = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status === 'failed');
  const skipped = results.filter(r => r.status === 'skipped');

  console.log(`  SUCCESS: ${succeeded.length} cities`);
  console.log(`  SKIPPED: ${skipped.length} cities (already had images)`);
  console.log(`  FAILED:  ${failed.length} cities`);

  if (succeeded.length > 0) {
    console.log('\n  Downloaded images:');
    succeeded.forEach(r => {
      console.log(`    ✓ ${r.city.padEnd(12)} → ${r.file} (${r.resolution}, ${r.size})`);
      console.log(`      Query: "${r.query}"`);
      console.log(`      Photo by: ${r.photographer} (Pexels ID: ${r.pexelsId})`);
    });
  }

  if (failed.length > 0) {
    console.log('\n  Failed cities:');
    failed.forEach(r => console.log(`    ✗ ${r.city}: ${r.error || 'no image found'}`));
  }

  console.log('\n  Output folder:', OUTPUT_DIR);
  console.log('========================================\n');
}

main().catch(console.error);
