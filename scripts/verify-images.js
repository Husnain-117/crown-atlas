#!/usr/bin/env node

/**
 * Verify all required images exist before deployment
 * This script checks that all images referenced in the code actually exist
 */

const fs = require('fs');

// List of all images that should exist
const REQUIRED_IMAGES = {
  // Los Angeles County
  '/County/Los-angelous/Bel-Air.jpg': 'public/County/Los-angelous/Bel-Air.jpg',
  '/County/Los-angelous/DowntownLA.jpg': 'public/County/Los-angelous/DowntownLA.jpg',
  '/County/Los-angelous/EchoPark.jpg': 'public/County/Los-angelous/EchoPark.jpg',
  '/County/Los-angelous/Griffith.jpg': 'public/County/Los-angelous/Griffith.jpg',
  '/County/Los-angelous/HollywoodHills.jpg': 'public/County/Los-angelous/HollywoodHills.jpg',
  '/County/Los-angelous/HollywoodSign.jpg': 'public/County/Los-angelous/HollywoodSign.jpg',
  '/County/Los-angelous/Koreatown.jpg': 'public/County/Los-angelous/Koreatown.jpg',
  '/County/Los-angelous/Malibucoastline.jpg': 'public/County/Los-angelous/Malibucoastline.jpg',
  '/County/Los-angelous/PacificPalisades.jpg': 'public/County/Los-angelous/PacificPalisades.jpg',
  '/County/Los-angelous/RodeoDrive.jpg': 'public/County/Los-angelous/RodeoDrive.jpg',
  '/County/Los-angelous/SanVicente.jpg': 'public/County/Los-angelous/SanVicente.jpg',
  '/County/Los-angelous/SantaMonica.jpg': 'public/County/Los-angelous/SantaMonica.jpg',
  '/County/Los-angelous/SilverLake.jpg': 'public/County/Los-angelous/SilverLake.jpg',
  '/County/Los-angelous/VeniceCanals.jpg': 'public/County/Los-angelous/VeniceCanals.jpg',
  '/County/Los-angelous/WestHollywood.jpg': 'public/County/Los-angelous/WestHollywood.jpg',
  '/County/Los-angelous/heroandcard.jpg': 'public/County/Los-angelous/heroandcard.jpg',
  
  // Property images
  '/luxury-modern-house-exterior.jpg': 'public/luxury-modern-house-exterior.jpg',
  '/modern-beach-house.png': 'public/modern-beach-house.png',
  '/california-coastal-sunset.png': 'public/california-coastal-sunset.png',
  '/malibu-coastline-beach.jpg': 'public/malibu-coastline-beach.jpg',
  '/napa-valley-wine-country.jpg': 'public/napa-valley-wine-country.jpg',
  '/san-diego-bay-sunset.png': 'public/san-diego-bay-sunset.png',
  '/santa-barbara-american-riviera.jpg': 'public/santa-barbara-american-riviera.jpg',
  '/modern-ocean-living.png': 'public/modern-ocean-living.png',
  '/luxury-master-bedroom.png': 'public/luxury-master-bedroom.png',
  '/coursel.webp': 'public/coursel.webp',
  '/coursel2.webp': 'public/coursel2.webp',
  '/coursel3.webp': 'public/coursel3.webp',
  '/placeholder.jpg': 'public/placeholder.jpg',
};

let missingImages = [];
let existingImages = [];

console.log('🔍 Verifying required images...\n');

for (const [url, filePath] of Object.entries(REQUIRED_IMAGES)) {
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    existingImages.push({
      url,
      path: filePath,
      size: `${(stats.size / 1024).toFixed(2)} KB`,
    });
  } else {
    missingImages.push({
      url,
      path: filePath,
    });
  }
}

// Print results
console.log(`✅ Found ${existingImages.length} images:`);
existingImages.forEach(img => {
  console.log(`   ${img.url} (${img.size})`);
});

if (missingImages.length > 0) {
  console.log(`\n❌ Missing ${missingImages.length} images:`);
  missingImages.forEach(img => {
    console.log(`   ${img.url} -> ${img.path}`);
  });
  console.log('\n⚠️  Please add missing images before deploying!');
  process.exit(1);
} else {
  console.log('\n✅ All required images are present!');
  console.log('🚀 Safe to deploy!');
}

// Check for common issues
console.log('\n🔍 Checking for common deployment issues...');

// Check if public folder exists
if (!fs.existsSync('public')) {
  console.log('❌ Public folder not found!');
  process.exit(1);
}

// Check if County folder exists
if (!fs.existsSync('public/County')) {
  console.log('❌ County folder not found in public!');
  process.exit(1);
}

// Check if Los-angelous folder exists
if (!fs.existsSync('public/County/Los-angelous')) {
  console.log('❌ Los-angelous folder not found!');
  process.exit(1);
}

console.log('✅ No common issues detected!');
