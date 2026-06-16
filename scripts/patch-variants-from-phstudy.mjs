/**
 * patch-variants-from-phstudy.mjs
 * 
 * For each product sub-bey, download the specific blade/ratchet/bit images
 * from phstudy using the product-to-part PRD mapping.
 * 
 * Images are saved as: {productId}-{subIndex}-{partType}.webp
 * e.g., BX-35-01-blade.webp, BX-35-01-ratchet.webp, BX-35-01-bit.webp
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import https from 'https';

const PHSTUDY = 'https://beyblade.phstudy.org';
const MYBEY_DIR = path.resolve(process.cwd());
const PARTS_DIR = path.join(MYBEY_DIR, 'public', 'parts');

// Part type to phstudy image directory mapping
const PART_DIR_MAP = {
  blade: 'Blade',
  ratchet: 'Ratchet',
  bit: 'Bit',
  lockChip: 'LockChip',
  mainBlade: 'MainBlade',
  assistBlade: 'AssistBlade',
  metalBlade: 'MetalBlade',
  overBlade: 'OverBlade',
};

// Part type to PRD ID field in series data
const PART_ID_FIELD = {
  blade: 'blade_id',
  ratchet: 'ratchet_id',
  bit: 'bit_id',
  lockChip: 'lock_chip_id',
  mainBlade: 'main_blade_id',
  assistBlade: 'assist_blade_id',
  metalBlade: 'metal_blade_id',
  overBlade: 'over_blade_id',
};

// Part type to output subdirectory
const PART_OUT_DIR = {
  blade: 'blades',
  ratchet: 'ratchets',
  bit: 'bits',
  lockChip: 'lockChip',
  mainBlade: 'mainBlade',
  assistBlade: 'assist',
  metalBlade: 'metalBlade',
  overBlade: 'overBlade',
};

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, {
      headers: { 'User-Agent': 'BeyCatalogBot/1.0' },
      timeout: 10000,
    }, (res) => {
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        reject(new Error(`HTTP ${res.statusCode}: ${url}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      fs.unlinkSync(dest, () => {});
      reject(err);
    });
  });
}

async function downloadAndConvert(url, outputPath) {
  const tmpFile = outputPath.replace(/\.webp$/, '.tmp.png');
  try {
    await download(url, tmpFile);
    execSync(`ffmpeg -y -i "${tmpFile}" -q:v 80 -frames:v 1 "${outputPath}" 2>/dev/null`, { stdio: 'ignore' });
    fs.unlinkSync(tmpFile);
    return true;
  } catch (e) {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    return false;
  }
}

async function main() {
  console.log('=== Loading phstudy data ===');
  
  // Fetch phstudy data
  const resp = await fetch(`${PHSTUDY}/data/main.json`, {
    headers: { 'User-Agent': 'BeyCatalogBot/1.0' },
  });
  const phstudy = await resp.json();
  const data = phstudy.data;
  
  const series = data.BeybladeSeries;
  const blades = data.BeybladePartsBlade;
  const ratchets = data.BeybladePartsRatchet;
  const bits = data.BeybladePartsBit;
  
  // Build index: base_set_id -> [series entries]
  const bySet = {};
  for (const [k, v] of Object.entries(series)) {
    const bsid = v.base_set_id;
    if (!bsid) continue;
    if (!bySet[bsid]) bySet[bsid] = [];
    bySet[bsid].push(v);
  }
  
  // Load our products
  const productsPath = path.join(MYBEY_DIR, 'src', 'data', 'products.ts');
  const productsContent = fs.readFileSync(productsPath, 'utf-8');
  
  // Extract all product IDs and their beys
  const productBlocks = productsContent.match(/id:\s*"([^"]+)"[\s\S]*?beys:\s*\[([\s\S]*?)\],/g) || [];
  
  console.log(`Found ${productBlocks.length} product blocks`);
  
  let totalDownloaded = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  
  for (const block of productBlocks) {
    const idMatch = block.match(/id:\s*"([^"]+)"/);
    if (!idMatch) continue;
    const productId = idMatch[1];
    
    // Extract beys from this block
    const beysMatch = block.match(/beys:\s*\[([\s\S]*?)\],/);
    if (!beysMatch) continue;
    const beysText = beysMatch[1];
    
    // Parse individual bey entries
    const beyBlocks = beysText.match(/\{[^}]+\}/g) || [];
    
    for (let subIdx = 0; subIdx < beyBlocks.length; subIdx++) {
      const beyText = beyBlocks[subIdx];
      
      // Skip non-bey entries (launcher, stadium, etc.)
      if (beyText.includes('type:')) continue;
      
      // Extract blade name
      const bladeMatch = beyText.match(/blade:\s*"([^"]+)"/);
      if (!bladeMatch) continue;
      const bladeName = bladeMatch[1];
      
      // Extract ratchet and bit
      const ratchetMatch = beyText.match(/ratchet:\s*"([^"]+)"/);
      const bitMatch = beyText.match(/bit:\s*"([^"]+)"/);
      const colorSlugMatch = beyText.match(/colorSlug:\s*"([^"]+)"/);
      
      const ratchetName = ratchetMatch ? ratchetMatch[1] : null;
      const bitName = bitMatch ? bitMatch[1] : null;
      const colorSlug = colorSlugMatch ? colorSlugMatch[1] : null;
      
      // Generate output prefix
      const subIndex = subIdx + 1;
      const prefix = colorSlug ? `${productId}-${subIndex}` : null;
      
      // Try to find matching phstudy series entry
      const phstudyEntries = bySet[productId] || [];
      
      // Find matching entry by catalog title or index
      let matchingEntry = null;
      if (phstudyEntries.length > 0) {
        // Try to match by index (most reliable for random boosters)
        if (subIdx < phstudyEntries.length) {
          matchingEntry = phstudyEntries[subIdx];
        }
      }
      
      if (!matchingEntry) {
        totalSkipped++;
        continue;
      }
      
      // Download each part type
      for (const [partType, idField] of Object.entries(PART_ID_FIELD)) {
        const prdId = matchingEntry[idField];
        if (!prdId) continue;
        
        const outDir = PART_OUT_DIR[partType];
        const phstudyDir = PART_DIR_MAP[partType];
        
        // Determine output filename
        let outName;
        if (prefix) {
          outName = `${prefix}-${partType}.webp`;
        } else {
          // Single-variant product - use part name
          if (partType === 'blade') {
            outName = `${bladeName.replace(/\s+/g, '')}.webp`;
          } else if (partType === 'ratchet' && ratchetName) {
            outName = `${ratchetName}.webp`;
          } else if (partType === 'bit' && bitName) {
            outName = `${bitName}.webp`;
          } else {
            continue;
          }
        }
        
        const outputPath = path.join(PARTS_DIR, outDir, outName);
        
        // Skip if already exists
        if (fs.existsSync(outputPath)) {
          continue;
        }
        
        // Download from phstudy
        const url = `${PHSTUDY}/images/site/${phstudyDir}/${prdId}.png`;
        const success = await downloadAndConvert(url, outputPath);
        
        if (success) {
          totalDownloaded++;
          console.log(`  ✓ ${productId}-${subIndex} ${partType}: ${prdId} → ${outName}`);
        } else {
          totalErrors++;
          console.log(`  ✗ ${productId}-${subIndex} ${partType}: ${prdId} FAILED`);
        }
      }
    }
  }
  
  console.log(`\n=== Summary ===`);
  console.log(`Downloaded: ${totalDownloaded}`);
  console.log(`Skipped (no phstudy match): ${totalSkipped}`);
  console.log(`Errors: ${totalErrors}`);
}

main().catch(console.error);
