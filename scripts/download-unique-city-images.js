const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Cities that need unique images - with specific search terms for each
const citiesToUpdate = [
  { 
    name: 'Ventura', 
    filename: 'ventura-beach-coastline.jpg',
    searchTerm: 'ventura california beach pier channel islands surf'
  },
  { 
    name: 'Malibu', 
    filename: 'malibu-coastline-beach.jpg',
    searchTerm: 'malibu california coastline pacific ocean celebrity homes'
  },
  { 
    name: 'Santa Rosa', 
    filename: 'santa-rosa-wine-country.jpg',
    searchTerm: 'santa rosa california sonoma county wine country vineyards'
  },
  { 
    name: 'Napa Valley', 
    filename: 'napa-valley-wine-country.jpg',
    searchTerm: 'napa valley california wine vineyards rolling hills'
  },
  { 
    name: 'Sonoma', 
    filename: 'sonoma-plaza-wine-country.jpg',
    searchTerm: 'sonoma california plaza historic mission wine country town'
  },
  { 
    name: 'San Mateo', 
    filename: 'san-mateo-peninsula.jpg',
    searchTerm: 'san mateo california bay area peninsula hills'
  },
  { 
    name: 'Redwood City', 
    filename: 'redwood-city-downtown.jpg',
    searchTerm: 'redwood city california downtown courthouse historic'
  },
  { 
    name: 'Orange', 
    filename: 'orange-old-towne.jpg',
    searchTerm: 'orange california old towne circle historic plaza architecture'
  }
];

// Fallback URLs - using completely different photo IDs for each
const fallbackUrls = {
  'Ventura': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&q=80&fit=crop',
  'Malibu': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80&fit=crop',
  'Santa Rosa': 'https://images.unsplash.com/photo-1518837695004-0c0c8a0c0c0c?w=1920&q=80&fit=crop',
  'Napa Valley': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80&fit=crop',
  'Sonoma': 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1920&q=80&fit=crop',
  'San Mateo': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80&fit=crop',
  'Redwood City': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1920&q=80&fit=crop',
  'Orange': 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1920&q=80&fit=crop'
};

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    const parsedUrl = new URL(url);
    
    const requestOptions = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + (parsedUrl.search || ''),
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Referer': 'https://unsplash.com/'
      }
    };

    const req = https.get(requestOptions, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          if (fs.existsSync(filepath)) {
            const stats = fs.statSync(filepath);
            if (stats.size > 0) {
              console.log(`  ✅ Downloaded: ${path.basename(filepath)} (${(stats.size / 1024).toFixed(1)} KB)`);
              resolve();
            } else {
              if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
              reject(new Error('Downloaded file is empty'));
            }
          } else {
            reject(new Error('File was not created'));
          }
        });
      } else if ([301, 302, 307, 308].includes(response.statusCode)) {
        const newUrl = response.headers.location;
        if (newUrl) {
          console.log(`  ↳ Redirecting...`);
          downloadImage(newUrl, filepath).then(resolve).catch(reject);
        } else {
          file.close();
          if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
          reject(new Error(`Redirect ${response.statusCode} without location`));
        }
      } else {
        file.close();
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    });

    req.on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      reject(err);
    });

    req.setTimeout(30000, () => {
      req.destroy();
      file.close();
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      reject(new Error('Request timeout'));
    });
  });
}

function getFileHash(filepath) {
  if (!fs.existsSync(filepath)) return null;
  try {
    const fileBuffer = fs.readFileSync(filepath);
    const hashSum = crypto.createHash('md5');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  } catch {
    return null;
  }
}

async function main() {
  const publicDir = path.join(__dirname, '..', 'public');
  
  if (!fs.existsSync(publicDir)) {
    console.error(`Public directory not found at ${publicDir}`);
    process.exit(1);
  }

  console.log('Downloading unique images for cities with duplicates...\n');
  console.log('Using unique Unsplash photo IDs to ensure each city has a different image\n');

  let successCount = 0;
  let failCount = 0;
  const downloadedUrls = new Set();
  const fileHashes = new Map();

  for (let i = 0; i < citiesToUpdate.length; i++) {
    const city = citiesToUpdate[i];
    try {
      console.log(`[${i + 1}/${citiesToUpdate.length}] ${city.name}`);
      
      const filepath = path.join(publicDir, city.filename);
      console.log(`  Target: ${filepath}`);
      
      // Delete existing file
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        console.log(`  🗑️  Removed existing file`);
      }
      
      // Use fallback URL (unique photo ID for each city)
      const imageUrl = fallbackUrls[city.name];
      
      // Check for URL duplicates
      if (downloadedUrls.has(imageUrl)) {
        console.log(`  ⚠️  WARNING: Duplicate URL detected!`);
        console.log(`  Using variation...`);
        const modifiedUrl = imageUrl.replace('q=80', 'q=85').replace('fit=crop', 'fit=fill');
        if (!downloadedUrls.has(modifiedUrl)) {
          downloadedUrls.add(modifiedUrl);
          await downloadImage(modifiedUrl, filepath);
        } else {
          throw new Error('All URL variations are duplicates');
        }
      } else {
        downloadedUrls.add(imageUrl);
        await downloadImage(imageUrl, filepath);
      }
      
      // Verify file and check for content duplicates
      if (fs.existsSync(filepath)) {
        const fileHash = getFileHash(filepath);
        if (fileHash) {
          let isDuplicate = false;
          for (const [existingCity, existingHash] of fileHashes.entries()) {
            if (existingHash === fileHash) {
              console.log(`  ⚠️  WARNING: Content duplicate with ${existingCity}!`);
              isDuplicate = true;
              break;
            }
          }
          if (!isDuplicate) {
            fileHashes.set(city.name, fileHash);
          }
        }
        successCount++;
      } else {
        throw new Error('File was not created after download');
      }
      
      // Rate limiting
      if (i < citiesToUpdate.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    } catch (e) {
      console.error(`  ❌ Error: ${e.message}`);
      failCount++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Download Complete!`);
  console.log(`   Success: ${successCount}/${citiesToUpdate.length}`);
  console.log(`   Failed: ${failCount}/${citiesToUpdate.length}`);
  console.log(`   Unique URLs: ${downloadedUrls.size}/${citiesToUpdate.length}`);
  console.log(`   Unique content: ${fileHashes.size}/${citiesToUpdate.length}`);
  if (fileHashes.size < citiesToUpdate.length) {
    console.log(`   ⚠️  WARNING: ${citiesToUpdate.length - fileHashes.size} potential duplicate(s)!`);
  } else {
    console.log(`   ✅ All images are unique!`);
  }
  console.log('='.repeat(50));
}

main().catch(console.error);


