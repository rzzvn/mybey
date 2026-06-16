/**
 * patch-variants.mjs
 * Download ALL variant blade/ratchet/bit images from phstudy for ALL products.
 * Uses phstudy BeybladeSeries product-to-part PRD mapping.
 * 
 * Output: public/parts/{blades,ratchets,bits}/{productId}-{subIdx}-{partType}.webp
 * e.g., BX-35-01-blade.webp, BX-35-01-ratchet.webp, BX-35-01-bit.webp
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const PHSTUDY = 'https://beyblade.phstudy.org';
const MYBEY_DIR = process.cwd();
const PARTS_DIR = path.join(MYBEY_DIR, 'public', 'parts');

const PART_CFG = {
  blade:   { dir: 'Blade',   out: 'blades',   field: 'blade_id' },
  ratchet: { dir: 'Ratchet', out: 'ratchets', field: 'ratchet_id' },
  bit:     { dir: 'Bit',     out: 'bits',     field: 'bit_id' },
};

async function dl(url, dest) {
  const resp = await fetch(url, { headers: { 'User-Agent': 'BeyCatalogBot/1.0' }, signal: AbortSignal.timeout(10000) });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const buf = Buffer.from(await resp.arrayBuffer());
  fs.writeFileSync(dest, buf);
}

async function dlAndConvert(url, outPath) {
  const tmp = outPath.replace(/\.webp$/, '.tmp.png');
  try {
    await dl(url, tmp);
    execSync(`ffmpeg -y -i "${tmp}" -q:v 80 -frames:v 1 "${outPath}" 2>/dev/null`, { stdio: 'ignore' });
    fs.unlinkSync(tmp);
    return true;
  } catch (e) {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    return false;
  }
}

async function main() {
  console.log('Loading phstudy data...');
  const resp = await fetch(`${PHSTUDY}/data/main.json`, {
    headers: { 'User-Agent': 'BeyCatalogBot/1.0' },
  });
  const { data } = await resp.json();
  const series = data.BeybladeSeries;

  // Build index: base_set_id -> [series entries]
  const bySet = {};
  for (const v of Object.values(series)) {
    const bsid = v.base_set_id;
    if (!bsid) continue;
    if (!bySet[bsid]) bySet[bsid] = [];
    bySet[bsid].push(v);
  }

  // Load our products
  const productsContent = fs.readFileSync(path.join(MYBEY_DIR, 'src', 'data', 'products.ts'), 'utf-8');
  const productBlocks = productsContent.match(/id:\s*"([^"]+)"[\s\S]*?beys:\s*\[([\s\S]*?)\],/g) || [];
  console.log(`Found ${productBlocks.length} product blocks`);

  let dl = 0, skip = 0, err = 0;

  for (const block of productBlocks) {
    const idMatch = block.match(/id:\s*"([^"]+)"/);
    if (!idMatch) continue;
    const productId = idMatch[1];

    const beysMatch = block.match(/beys:\s*\[([\s\S]*?)\],/);
    if (!beysMatch) continue;

    const beyBlocks = beysMatch[1].match(/\{[^}]+\}/g) || [];
    const phstudyEntries = bySet[productId] || [];

    for (let i = 0; i < beyBlocks.length; i++) {
      const bt = beyBlocks[i];
      if (bt.includes('type:')) continue; // skip launcher/stadium

      // Get phstudy entry for this sub-bey
      const entry = i < phstudyEntries.length ? phstudyEntries[i] : null;
      if (!entry) { skip++; continue; }

      for (const [pt, cfg] of Object.entries(PART_CFG)) {
        const prdId = entry[cfg.field];
        if (!prdId) continue;

        const outName = `${productId}-${i + 1}-${pt}.webp`;
        const outPath = path.join(PARTS_DIR, cfg.out, outName);

        if (fs.existsSync(outPath)) continue;

        const url = `${PHSTUDY}/images/site/${cfg.dir}/${prdId}.png`;
        const ok = await dlAndConvert(url, outPath);
        if (ok) { dl++; process.stdout.write(`✓ ${outName}\n`); }
        else { err++; process.stdout.write(`✗ ${outName} (${prdId})\n`); }
      }
    }
  }

  console.log(`\nDone: ${dl} downloaded, ${skip} skipped (no phstudy match), ${err} errors`);
}

main().catch(console.error);
