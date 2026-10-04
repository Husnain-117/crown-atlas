const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const cities = [
  'ventura-beach-coastline.jpg',
  'malibu-coastline-beach.jpg',
  'santa-rosa-wine-country.jpg',
  'napa-valley-wine-country.jpg',
  'sonoma-plaza-wine-country.jpg',
  'san-mateo-peninsula.jpg',
  'redwood-city-downtown.jpg',
  'orange-old-towne.jpg'
];

const publicDir = path.join(__dirname, '..', 'public');
const hashes = {};

console.log('Checking image uniqueness...\n');

cities.forEach(city => {
  const filepath = path.join(publicDir, city);
  if (fs.existsSync(filepath)) {
    const fileBuffer = fs.readFileSync(filepath);
    const hash = crypto.createHash('md5').update(fileBuffer).digest('hex');
    hashes[city] = hash;
    console.log(city.padEnd(35), hash.substring(0, 16) + '...');
  }
});

const groups = {};
Object.keys(hashes).forEach(city => {
  const hash = hashes[city];
  if (!groups[hash]) groups[hash] = [];
  groups[hash].push(city);
});

const duplicates = Object.values(groups).filter(g => g.length > 1);

console.log('\n' + '='.repeat(50));
if (duplicates.length > 0) {
  console.log('❌ DUPLICATES FOUND:');
  duplicates.forEach(dupes => console.log('  -', dupes.join(' and ')));
} else {
  console.log('✅ All images are unique!');
  console.log(`   Total unique images: ${Object.keys(hashes).length}`);
}
console.log('='.repeat(50));


