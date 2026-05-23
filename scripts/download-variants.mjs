/**
 * Download blade variant images from phstudy.org and convert to .webp
 *
 * Usage: node scripts/download-variants.mjs
 *
 * Reads /tmp/phstudy_blades.json (expects array of { src, alt } objects)
 * Maps product codes → blade names → color slugs using colorVariants.ts
 * Downloads PNG from phstudy → saves as .webp in public/parts/blades/
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// ── Hardcoded blade name → wiki filename stem ─────────────────────
const bladeWikiMap = {
  "Dran Buster": "DranBuster",
  "Dran Sword": "DranSword",
  "Dran Dagger": "DranDagger",
  "Dran Brave": "DranBrave",
  "Dran Strike": "DranStrike",
  "Dran Arc": "DranArc",
  "Wizard Rod": "WizardRod",
  "Wizard Arrow": "WizardArrow",
  "Wizard Arc": "WizardArc",
  "Hells Scythe": "HellsScythe",
  "Hells Chain": "HellsChain",
  "Hells Hammer": "HellsHammer",
  "Hells Brave": "HellsBrave",
  "Hells Reaper": "HellsReaper",
  "Hells Arc": "HellsArc",
  "Knight Shield": "KnightShield",
  "Knight Lance": "KnightLance",
  "Knight Mail": "KnightMail",
  "Phoenix Wing": "PhoenixWing",
  "Phoenix Feather": "PhoenixFeather",
  "Phoenix Rudder": "PhoenixRudder",
  "Shark Edge": "SharkEdge",
  "Shark Scale": "SharkScale",
  "Cobalt Drake": "CobaltDrake",
  "Cobalt Dragoon": "CobaltDragoon",
  "Leon Claw": "LeonClaw",
  "Leon Crest": "LeonCrest",
  "Viper Tail": "ViperTail",
  "Rhino Horn": "RhinoHorn",
  "Rhino Reaper": "RhinoReaper",
  "Black Shell": "BlackShell",
  "Unicorn Sting": "UnicornSting",
  "Wyvern Gale": "WyvernGale",
  "Tyranno Beat": "TyrannoBeat",
  "Whale Wave": "WhaleWave",
  "Silver Wolf": "SilverWolf",
  "Aero Pegasus": "AeroPegasus",
  "Pegasus Blast": "PegasusBlast",
  "Ghost Circle": "GhostCircle",
  "Shinobi Shadow": "ShinobiShadow",
  "Shinobi Knife": "ShinobiKnife",
  "Sphinx Cowl": "SphinxCowl",
  "Samurai Calibur": "SamuraiCalibur",
  "Samurai Steel": "SamuraiSteel",
  "Bear Scratch": "BearScratch",
  "Impact Drake": "ImpactDrake",
  "Scorpio Spear": "ScorpioSpear",
  "Golem Rock": "GolemRock",
  "Crimson Garuda": "CrimsonGaruda",
  "Perseus Dark": "PerseusDark",
  "Sol Eclipse": "SolEclipse",
  "Warrior Saber": "WarriorSaber",
  "Fox Brush": "FoxBrush",
  "Brachiowhip": "Brachiowhip",
  "Shelter Drake": "ShelterDrake",
  "Bite Croc": "BiteCroc",
  "CrocCrunch": "CrocCrunch",
  "Driger Slash": "DrigerSlash",
  "Dranzer Spiral": "DranzerSpiral",
  "Dragoon Storm": "DragoonStorm",
  "Storm Pegasis": "StormPegasis",
  "Victory Valkyrie": "VictoryValkyrie",
  "Draciel Shield": "DracielShield",
  "Xeno Excalibur": "XenoExcalibur",
  "Valkyrie Volt": "ValkyrieVolt",
  "Mammoth Tusk": "MammothTusk",
  "Lightning L-Dragoupper": "LightningLDragoupper",
  "Bullet Griffin": "BulletGriffin",
  "Ragna Rage": "RagnaRage",
  "Sol Brave": "SolBrave",
  "Emperor Crest": "EmperorCrest",
  "Evangelion": "Evangelion",
  "Spider-Man": "Spider-Man",
  "Venom": "Venom",
  "Iron Man": "IronMan",
  "Thanos": "Thanos",
  "Luke Skywalker": "LukeSkywalker",
  "Darth Vader": "DarthVader",
  "Mandalorian": "Mandalorian",
  "Moff Gideon": "MoffGideon",
  "Optimus Prime": "OptimusPrime",
  "Megatron": "Megatron",
  "Optimus Primal": "OptimusPrimal",
  "Starscream": "Starscream",
  "T-Rex": "TRex",
  "Mosasaurus": "Mosasaurus",
  "Spinosaurus": "Spinosaurus",
  "Quetzalcoatlus": "Quetzalcoatlus",
  "Unicorn Delta": "UnicornDelta",
  "Weiss Tiger": "WeissTiger",
  "Samurai Saber": "SamuraiSaber",
  "Cerberus Flame": "CerberusFlame",
  "Cerberus Dark": "CerberusDark",
  "Whale Flame": "WhaleFlame",
  "Phoenix Flare": "PhoenixFlare",
  "Wolf Hunt": "WolfHunt",
  "Clock Mirage": "ClockMirage",
  "Ptera Swing": "PteraSwing",
  "Shark Gill": "SharkGill",
  "Emperor Might": "EmperorMight",
  "Meteor Dragoon": "MeteorDragoon",
  "Bahamut Blitz": "BahamutBlitz",
  "Knight Fortress": "KnightFortress",
  "Mummy Curse": "MummyCurse",
  "Orochi Cluster": "OrochiCluster",
};

// ── Parse colorVariants.ts (no TS import needed) ─────────────────
function parseColorVariants() {
  const content = fs.readFileSync("src/data/colorVariants.ts", "utf8");
  // Remove JS-style comments for easier parsing
  const clean = content.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");

  const result = {};
  // Match:  "Blade Name": [ ... ]
  const bladeRegex = /"([^"]+)":\s*\[([\s\S]*?)\]/g;
  let m;

  while ((m = bladeRegex.exec(clean)) !== null) {
    const bladeName = m[1];
    const arrayContent = m[2];
    const variants = [];

    // Match individual { productId: "...", colorLabel: "...", colorSlug: "..." }
    const variantRegex = /{\s*productId:\s*"([^"]+)",\s*colorLabel:\s*"([^"]+)",\s*colorSlug:\s*"([^"]+)"\s*}/g;
    let vm;
    while ((vm = variantRegex.exec(arrayContent)) !== null) {
      variants.push({
        productId: vm[1],
        colorLabel: vm[2],
        colorSlug: vm[3],
      });
    }

    if (variants.length > 0) {
      result[bladeName] = variants;
    }
  }

  return result;
}

// ── Build download list (skip standard + already exists) ──────────
function buildDownloadList(variants) {
  const list = [];
  for (const [bladeName, variantArray] of Object.entries(variants)) {
    const wikiName = bladeWikiMap[bladeName];
    if (!wikiName) {
      console.warn(`⚠ No wiki name for blade: ${bladeName}`);
      continue;
    }
    for (const v of variantArray) {
      if (v.colorSlug === "standard") continue; // base image already exists
      const outName = `${wikiName}__${v.colorSlug}.webp`;
      const outPath = path.join("public", "parts", "blades", outName);
      if (fs.existsSync(outPath)) continue;

      list.push({
        productId: v.productId,
        bladeName,
        wikiName,
        colorLabel: v.colorLabel,
        colorSlug: v.colorSlug,
        outPath,
        outName,
      });
    }
  }
  return list;
}

// ── Load phstudy JSON and map productCode → image URL ─────────────
function loadPhstudyData() {
  if (!fs.existsSync("/tmp/phstudy_blades.json")) {
    throw new Error("Missing /tmp/phstudy_blades.json — run scrape first.");
  }
  const data = JSON.parse(fs.readFileSync("/tmp/phstudy_blades.json", "utf8"));
  const urlMap = {};

  for (const entry of data) {
    const alt = entry.alt || "";
    // Product code is the first token in the alt text, e.g. "BXG-31-01 DRANBUSTER ..."
    const match = alt.trim().match(/^([A-Z0-9-]+)/);
    if (match) {
      urlMap[match[1]] = entry.src;
    }
  }

  return urlMap;
}

// ── Download + convert one image ──────────────────────────────────
function downloadAndConvert(item, urlMap) {
  const url = urlMap[item.productId];
  if (!url) {
    console.log(`  ⚠ NO URL [${item.productId}] ${item.bladeName} — ${item.colorLabel}`);
    return false;
  }

  const tmpPng = `/tmp/v_${item.productId.replace(/[^a-zA-Z0-9]/g, "_")}.png`;

  try {
    // Download
    execSync(`curl -sL -o "${tmpPng}" "${url}"`, { timeout: 15000, stdio: "pipe" });

    // Validate downloaded file
    const stats = fs.statSync(tmpPng);
    if (stats.size < 500) {
      console.log(`  ⚠ TOO SMALL [${item.productId}] ${item.outName}`);
      return false;
    }

    // Convert to WebP
    let converted = false;
    try {
      execSync(`cwebp -q 85 "${tmpPng}" -o "${item.outPath}"`, { timeout: 15000, stdio: "pipe" });
      converted = true;
    } catch {
      try {
        execSync(`convert "${tmpPng}" -quality 85 "${item.outPath}"`, { timeout: 15000, stdio: "pipe" });
        converted = true;
      } catch {
        // Fallback: copy PNG (browser may still load it)
        fs.copyFileSync(tmpPng, item.outPath.replace(/\.webp$/, ".png"));
        console.log(`  ⚠ SAVED PNG [${item.productId}] ${item.outName.replace(/\.webp$/, ".png")}`);
        converted = true;
      }
    }

    if (converted && fs.existsSync(item.outPath)) {
      const outSize = fs.statSync(item.outPath).size;
      console.log(`  ✓ SAVED [${item.productId}] ${item.outName} (${(outSize / 1024).toFixed(1)} KB)`);
    }

    // Cleanup
    if (fs.existsSync(tmpPng)) fs.unlinkSync(tmpPng);
    return converted;
  } catch (e) {
    console.log(`  ✗ ERROR [${item.productId}] ${item.outName}:`, e.message?.split("\n")[0] || e);
    if (fs.existsSync(tmpPng)) fs.unlinkSync(tmpPng);
    return false;
  }
}

// ── Main ──────────────────────────────────────────────────────────
function main() {
  console.log("Parsing colorVariants.ts...");
  const variants = parseColorVariants();

  console.log("Building download list...");
  const toDownload = buildDownloadList(variants);
  console.log(`→ ${toDownload.length} variant images need downloading\n`);

  if (toDownload.length === 0) {
    console.log("Everything already up to date!");
    return;
  }

  console.log("Loading phstudy URL mapping...");
  const urlMap = loadPhstudyData();
  console.log(`→ ${Object.keys(urlMap).length} phstudy URLs loaded\n`);

  let success = 0;
  let missing = 0;

  for (const item of toDownload) {
    const ok = downloadAndConvert(item, urlMap);
    if (ok) success++;
    else missing++;
  }

  console.log(`\n========================================`);
  console.log(`Done!  Success: ${success}  Missing/Error: ${missing}`);
  console.log(`Output dir: ${path.resolve("public/parts/blades")}`);
}

main();
