#!/usr/bin/env node
/**
 * Pre-optimize county/city images in public/County so they load faster.
 * Resizes images wider than 1200px to 1200px and compresses (quality 85).
 * Run: node scripts/optimize-county-images.mjs
 * Optional: BACKUP public/County before running (overwrites files).
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COUNTY_DIR = path.join(__dirname, "..", "public", "County");
const MAX_WIDTH = 1200;
const QUALITY = 85;
const EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function getAllImages(dir, list = []) {
  if (!fs.existsSync(dir)) return list;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) getAllImages(full, list);
    else if (EXTS.has(path.extname(e.name).toLowerCase())) list.push(full);
  }
  return list;
}

async function optimizeFile(filePath) {
  const stat = fs.statSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  let img = sharp(filePath);
  const meta = await img.metadata();
  const w = meta.width || 0;
  const needResize = w > MAX_WIDTH;
  if (needResize) img = img.resize(MAX_WIDTH, null, { withoutEnlargement: true });
  let outBuf;
  if (ext === ".png") {
    outBuf = await img.png({ compressionLevel: 6 }).toBuffer();
  } else if (ext === ".webp") {
    outBuf = await img.webp({ quality: QUALITY }).toBuffer();
  } else {
    outBuf = await img.jpeg({ quality: QUALITY }).toBuffer();
  }
  const write = needResize || outBuf.length < stat.size;
  if (!write) return null;
  fs.writeFileSync(filePath, outBuf);
  return { filePath, before: stat.size, after: outBuf.length };
}

async function main() {
  console.log("Scanning public/County for images...");
  const files = getAllImages(COUNTY_DIR);
  console.log(`Found ${files.length} images. Optimizing (max width ${MAX_WIDTH}px, quality ${QUALITY})...`);
  let saved = 0;
  let errs = 0;
  for (const f of files) {
    try {
      const r = await optimizeFile(f);
      if (r && r.after < r.before) {
        saved += r.before - r.after;
        console.log(`  ${path.relative(COUNTY_DIR, f)}: ${(r.before / 1024).toFixed(1)}KB -> ${(r.after / 1024).toFixed(1)}KB`);
      }
    } catch (e) {
      errs++;
      console.error(`  Error ${f}:`, e.message);
    }
  }
  console.log(`\nDone. Total bytes saved: ${(saved / 1024).toFixed(1)}KB. Errors: ${errs}`);
}

main();
