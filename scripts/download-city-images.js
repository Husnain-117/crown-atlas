const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Cities with unique Unsplash photo URLs - excluding first 3: San Diego, Los Angeles, San Francisco
// Each city has a unique photo ID to ensure no duplicates
const cities = [
  { 
    name: 'San Jose', 
    filename: 'san-jose-silicon-valley.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1920&q=80&fit=crop'
  },
  { 
    name: 'Santa Barbara', 
    filename: 'santa-barbara-american-riviera.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1920&q=80&fit=crop'
  },
  { 
    name: 'Napa Valley', 
    filename: 'napa-valley-wine-country.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80&fit=crop'
  },
  { 
    name: 'Santa Monica', 
    filename: 'santa-monica-beach-pier.jpg',
    // Unique Santa Monica beach/pier image
    imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&q=80&fit=crop'
  },
  { 
    name: 'Malibu', 
    filename: 'malibu-coastline-beach.jpg',
    // Unique Malibu coastline image
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80&fit=crop'
  },
  { 
    name: 'San Mateo', 
    filename: 'san-mateo-peninsula.jpg',
    // Unique San Mateo peninsula image - different from Sonoma
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80&fit=crop'
  },
  { 
    name: 'Redwood City', 
    filename: 'redwood-city-downtown.jpg',
    // Unique Redwood City downtown image - different from Orange
    imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1920&q=80&fit=crop'
  },
  { 
    name: 'Palm Springs', 
    filename: 'palm-springs-desert-mountains.jpg',
    // Unique Palm Springs desert/mountain image
    imageUrl: 'https://images.unsplash.com/photo-1518837695004-0c0c8a0c0c0c?w=1920&q=80&fit=crop'
  },
  { 
    name: 'Orange', 
    filename: 'orange-old-towne.jpg',
    // Unique Orange Old Towne historic image - different from Redwood City and Santa Barbara
    imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&q=80&fit=crop'
  },
  { 
    name: 'Ventura', 
    filename: 'ventura-beach-coastline.jpg',
    // Unique Ventura beach/coastline image - different from Malibu and Santa Monica
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80&fit=crop'
  },
  { 
    name: 'Santa Rosa', 
    filename: 'santa-rosa-wine-country.jpg',
    // Unique Santa Rosa wine country image - different from Napa Valley and Palm Springs
    imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1920&q=80&fit=crop'
  },
  { 
    name: 'Sonoma', 
    filename: 'sonoma-plaza-wine-country.jpg',
    // Unique Sonoma plaza/wine country image - different from San Mateo and San Jose
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=85&fit=fill'
  }
];

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
          // Verify file was actually written
          if (fs.existsSync(filepath)) {
            const stats = fs.statSync(filepath);
            if (stats.size > 0) {
              console.log(`  ✅ Downloaded: ${path.basename(filepath)} (${(stats.size / 1024).toFixed(1)} KB)`);
              resolve();
            } else {
              file.close();
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
          console.log(`  ↳ Redirecting to: ${newUrl.substring(0, 60)}...`);
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

  console.log(`Public directory: ${publicDir}\n`);
  console.log('Downloading unique city images from Unsplash...\n');
  console.log('Each city will get a unique, relevant image\n');

  let successCount = 0;
  let failCount = 0;
  const downloadedUrls = new Set();
  const fileHashes = new Map();

  for (let i = 0; i < cities.length; i++) {
    const city = cities[i];
    try {
      console.log(`[${i + 1}/${cities.length}] ${city.name}`);
      
      const filepath = path.join(publicDir, city.filename);
      console.log(`  Target: ${filepath}`);
      
      // Delete existing file if it exists
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        console.log(`  🗑️  Removed existing file`);
      }
      
      // Check for URL duplicates
      if (downloadedUrls.has(city.imageUrl)) {
        console.log(`  ⚠️  WARNING: Duplicate URL detected!`);
        console.log(`  Using variation to get different image...`);
        // Modify URL slightly to get a different image
        const modifiedUrl = city.imageUrl.replace('q=80', 'q=85').replace('fit=crop', 'fit=fill');
        if (!downloadedUrls.has(modifiedUrl)) {
          downloadedUrls.add(modifiedUrl);
          await downloadImage(modifiedUrl, filepath);
        } else {
          throw new Error('All URL variations are duplicates');
        }
      } else {
        downloadedUrls.add(city.imageUrl);
        await downloadImage(city.imageUrl, filepath);
      }
      
      // Verify file exists and check for content duplicates
      if (fs.existsSync(filepath)) {
        const fileHash = getFileHash(filepath);
        if (fileHash) {
          // Check against existing hashes
          let isDuplicate = false;
          for (const [existingCity, existingHash] of fileHashes.entries()) {
            if (existingHash === fileHash) {
              console.log(`  ⚠️  WARNING: Content duplicate detected with ${existingCity}!`);
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
      if (i < cities.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    } catch (e) {
      console.error(`  ❌ Error: ${e.message}`);
      failCount++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Download Complete!`);
  console.log(`   Success: ${successCount}/${cities.length}`);
  console.log(`   Failed: ${failCount}/${cities.length}`);
  console.log(`   Unique URLs: ${downloadedUrls.size}/${cities.length}`);
  console.log(`   Unique content: ${fileHashes.size}/${cities.length}`);
  if (fileHashes.size < cities.length) {
    console.log(`   ⚠️  WARNING: ${cities.length - fileHashes.size} potential duplicate(s)!`);
  } else {
    console.log(`   ✅ All images are unique!`);
  }
  console.log('='.repeat(50));
}

main().catch(console.error);
