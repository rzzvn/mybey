/**
 * Part image resolution — local files first, remote Fandom fallback.
 *
 * Local images are stored in public/parts/{blades,bits,assist}/
 * File naming: blades use PascalCase (e.g. BlackShell.png),
 *              bits use the code (e.g. H.png),
 *              assist blades use the name (e.g. Slash.png).
 *
 * Remote fallback uses Special:FilePath which works in browsers
 * (Cloudflare bot protection only blocks automated requests).
 */

// ── Vite base path ────────────────────────────────────────────────────
const BASE = import.meta.env.BASE_URL; // e.g. "/mybey/"

// ── Blade name → local filename (PascalCase, no spaces) ──────────────
const bladeWikiNames: Record<string, string> = {
  // From wiki table — verified Takara Tomy names
  "Black Shell": "BlackShell",
  "Cobalt Dragoon": "CobaltDragoon",
  "Cobalt Drake": "CobaltDrake",
  "Crimson Garuda": "CrimsonGaruda",
  "Dran Dagger": "DranDagger",
  "Dran Sword": "DranSword",
  "Hells Chain": "HellsChain",
  "Hells Scythe": "HellsScythe",
  "Knight Lance": "KnightLance",
  "Knight Shield": "KnightShield",
  "Leon Claw": "LeonClaw",
  "Phoenix Feather": "PhoenixFeather",
  "Phoenix Wing": "PhoenixWing",
  "Rhino Horn": "RhinoHorn",
  "Samurai Calibur": "SamuraiCalibur",
  "Shark Edge": "SharkEdge",
  "Shelter Drake": "ShelterDrake",
  "Sphinx Cowl": "SphinxCowl",
  "Tricera Press": "TriceraPress",
  "Tricera Spiky": "TriceraSpiky",
  "Tyranno Beat": "TyrannoBeat",
  "Unicorn Sting": "UnicornSting",
  "Viper Tail": "ViperTail",
  "Weiss Tiger": "WeissTiger",
  "Whale Wave": "WhaleWave",
  "Wizard Arrow": "WizardArrow",
  "Wyvern Gale": "WyvernGale",

  // Additional blades
  "Bahamut Blitz": "BahamutBlitz",
  "Dran Buster": "DranBuster",
  "Wizard Rod": "WizardRod",
  "Shark Scale": "SharkScale",
  "Meteor Dragoon": "MeteorDragoon",
  "Impact Drake": "ImpactDrake",
  "Silver Wolf": "SilverWolf",
  "Aero Pegasus": "AeroPegasus",
  "Cerberus Flame": "CerberusFlame",
  "Cerberus Dark": "CerberusDark",
  "Hover Wyvern": "HoverWyvern",
  "Wyvern Hover": "HoverWyvern",
  "Clock Mirage": "ClockMirage",
  "Mummy Curse": "MummyCurse",
  "Orochi Cluster": "OrochiCluster",
  "Tyranno Roar": "TyrannoRoar",
  "Whale Flame": "WhaleFlame",
  "Scorpio Spear": "ScorpioSpear",
  "Golem Rock": "GolemRock",
  "Knight Mail": "KnightMail",
  "Samurai Saber": "WarriorSaber",
  "Ghost Circle": "GhostCircle",

  // BX-50 / UX-20 / CX new blades
  "HeavenRing": "HeavenRing",
  "Wolf Flame": "WolfFlame",
  "Cerberus Reaper": "CerberusReaper",
  "Glory Valkyrie": "GloryValkyrie",
  "Drake Brave": "DrakeBrave",

  "Mammoth Tusk": "MammothTusk",
  "Bite Croc": "BiteCroc",
  "CrocCrunch": "CrocCrunch",
  "Talon Ptera": "TalonPtera",
  "Ptera Swing": "PteraSwing",
  "Bear Scratch": "BearScratch",
  "Driger Slash": "DrigerSlash",
  "Dranzer Spiral": "DranzerSpiral",
  "Dragoon Storm": "DragoonStorm",
  "Phoenix Rudder": "PhoenixRudder",
  "Hells Reaper": "HellsReaper",
  "Rhino Reaper": "RhinoReaper",
  "Hells Arc": "HellsArc",
  "Hells Hammer": "HellsHammer",
  "Hells Brave": "HellsBrave",
  "Shinobi Shadow": "ShinobiShadow",
  "Shinobi Knife": "ShinobiKnife",
  "Red Dragoon": "RedDragoon",
  "Gill Shark": "GillShark",
  "War God Crest": "WarGodCrest",
  "Unicorn Delta": "UnicornDelta",
  "Leon Crest": "LeonCrest",
  "Leon Fang": "LeonFang",
  "Perseus Dark": "PerseusDark",
  "Valkyrie Volt": "ValkyrieVolt",
  "Dran Brave": "DranBrave",
  "Dran Strike": "DranStrike",
  "Ragna Rage": "RagnaRage",
  "Pegasus Blast": "PegasusBlast",
  "Pegasus Brush": "PegasusBrush",
  "Knight Fortress": "KnightFortress",
  "Emperor Crest": "EmperorCrest",
  "Green Wizard Rod": "GreenWizardRod",
  "Blue Phoenix Wing": "BluePhoenixWing",
  "Sol Brave": "SolBrave",
  "Sol Eclipse": "SolEclipse",
  "Bullet Griffin": "BulletGriffin",
  "Wizard Arc": "WizardArc",
  // CX-00 Corocoro limited blades
  "Wriggle Kraken": "WriggleKraken",
  "Hornet Fort": "HornetFort",
  "Bucks Antlers": "BucksAntlers",
  "Goat Tackle": "GoatTackle",
  "Wolf Hunt": "WolfHunt",
  "Fox Brush": "FoxBrush",

  "Phoenix Flare": "PhoenixFlare",
  "Phoenix Ladder": "PhoenixLadder",
  "Rock Leone": "RockLeone",
  "Storm Spriggan": "StormSpriggan",
  "Xeno Excalibur": "XenoExcalibur",
  "Samurai Steel": "SamuraiSteel",
  "Storm Pegasis": "StormPegasis",
  "Victory Valkyrie": "VictoryValkyrie",
  "Draciel Shield": "DracielShield",
  "Lightning L-Dragoupper": "LightningLDragoupper",
  "Lightning L-Dragorush": "LightningLDragorush",
  "Ridge Triceratops": "TriceraPress",

  // Hasbro renames — have their own distinct images
  "Circle Ghost": "GhostCircle",
  "Hack Viking": "HackViking",

  // Collaboration blades
  "Evangelion": "Evangelion",
  "Spider-Man": "SpiderMan",
  "Miles Morales": "MilesMorales",
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
  "Chewbacca": "Chewbacca",
  "Stormtrooper": "Stormtrooper",
  "Obi-Wan Kenobi": "ObiWanKenobi",
  "General Grievous": "GeneralGrievous",
  "Captain America": "CaptainAmerica",
  "Red Hulk": "RedHulk",
  "Green Goblin": "GreenGoblin",
  // New blades from missing products
  "Brachiowhip": "Brachiowhip",
  "Dran Arc": "DranArc",
  "Emperor Might": "EmperorMight",
  "Shark Gill": "SharkGill",
  "Warrior Saber": "WarriorSaber",

  };

/** Convert blade name to PascalCase wiki filename (removes spaces & hyphens). */
function bladeNameToWikiName(bladeName: string): string {
  if (bladeWikiNames[bladeName]) return bladeWikiNames[bladeName];
  return bladeName.replace(/[- ]/g, "");
}

// ── Bit code → Fandom wiki name ──────────────────────────────────────
// The local files use short codes (H, FB) but Fandom wiki uses full names (BitHexa, BitFreeBall)
const BIT_CODE_TO_WIKI: Record<string, string> = {
  "H": "Hexa",
  "FB": "FreeBall",
  "LR": "LowRush",
  "R": "Rush",
  "J": "Jolt",
  "LO": "LowOrb",
  "K": "Kick",
  "L": "Level",
  "UN": "UnderNeedle",
  "B": "Ball",
  "W": "Wedge",
  "E": "Elevate",
  "D": "Dot",
  "FF": "FreeFlat",
  "I": "Ignition",
  "UF": "UnderFlat",
  "U": "Unite",
  "T": "Taper",
  "TK": "TransKick",
  "TP": "TransPoint",
  "O": "Orb",
  "Op": "Operate",
  "Y": "Yielding",
  "HN": "HighNeedle",
  "F": "Flat",
  "GR": "GearRush",
  "HT": "HighTaper",
  "GN": "GearNeedle",
  "A": "Accel",
  "RA": "RubberAccel",
  "LF": "LowFlat",
  "Q": "Quake",
  "N": "Needle",
  "G": "Glide",
  "V": "Vortex",
  "GU": "GearUnite",
  "S": "Spike",
  "GF": "GearFlat",
  "WB": "WallBall",
  "BS": "BoundSpike",
  "MN": "MetalNeedle",
  "Tr": "Turbo",
  "DB": "DiskBall",
  "GB": "GearBall",
  "M": "Merge",
  "Z": "Zap",
  "P": "Point",
  "WW": "WallWedge",
  "GP": "GearPoint",
  "C": "Cyclone",
  "DS": "DiskSaber",
};

// ── Public API ─────────────────────────────────────────────────────────

/** Local path to a blade image, e.g. /mybey/parts/blades/BlackShell.webp */
export function getBladeImageUrl(bladeName: string): string {
  const wikiName = bladeNameToWikiName(bladeName);
  return `${BASE}parts/blades/${wikiName}.webp`;
}

/** Local path to a bit image, e.g. /mybey/parts/bits/H.webp */
export function getBitImageUrl(bitCode: string): string {
  return `${BASE}parts/bits/${bitCode}.webp`;
}

/** Local path to an assist blade image, e.g. /mybey/parts/assist/Slash.webp */
export function getAssistBladeImageUrl(assistBladeName: string): string {
  return `${BASE}parts/assist/${assistBladeName}.webp`;
}

/** Remote (Fandom wiki) fallback URL for a blade image */
export function getBladeFallbackUrl(bladeName: string): string {
  const wikiName = bladeNameToWikiName(bladeName);
  return `https://beyblade.fandom.com/wiki/Special:FilePath/Blade${wikiName}.png`;
}

/** Remote (Fandom wiki) fallback URL for a bit image */
export function getBitFallbackUrl(bitCode: string): string {
  // Go-shoot direct URLs for fused/unusual bits that Fandom wiki lacks
  const goShootOverrides: Record<string, string> = {
    "Op": "https://go-shoot.github.io/x/img/bit/Op.png",
    "Tr": "https://go-shoot.github.io/x/img/bit/Tr.png",
  };
  if (bitCode in goShootOverrides) return goShootOverrides[bitCode as keyof typeof goShootOverrides];
  const wikiName = BIT_CODE_TO_WIKI[bitCode] ?? bitCode;
  return `https://beyblade.fandom.com/wiki/Special:FilePath/Bit${wikiName}.png`;
}

/** Remote (Fandom wiki) fallback URL for an assist blade image */
export function getAssistBladeFallbackUrl(assistBladeName: string): string {
  return `https://beyblade.fandom.com/wiki/Special:FilePath/AssistBlade${assistBladeName}.png`;
}

// ── phstudy.org fallback URLs for CX parts ─────────────────────────────
// These are direct image URLs from beyblade.phstudy.org, keyed by part name.

const PHSTUDY_BASE = "https://beyblade.phstudy.org/images/site";

const lockChipFallbackUrls: Record<string, string> = {
  "Dran": `${PHSTUDY_BASE}/LockChip/LC-PRD-939597-00.png`,
  "Wizard": `${PHSTUDY_BASE}/LockChip/LC-PRD-939603-00.png`,
  "Perseus": `${PHSTUDY_BASE}/LockChip/LC-PRD-939610-00.png`,
  "Hells": `${PHSTUDY_BASE}/LockChip/LC-PRD-939627-01.png`,
  "Rhino": `${PHSTUDY_BASE}/LockChip/LC-PRD-939627-02.png`,
  "Wolf": `${PHSTUDY_BASE}/LockChip/LC-PRD-097242-00.png`,
  "Sol": `${PHSTUDY_BASE}/LockChip/LC-PRD-995678-00.png`,
  "Pegasus": `${PHSTUDY_BASE}/LockChip/LC-PRD-956976-00.png`,
  "Phoenix": `${PHSTUDY_BASE}/LockChip/LC-PRD-096153-00.png`,
  "Mummy": `${PHSTUDY_BASE}/LockChip/LC-PRD-098775-01.png`,
  "Knight": `${PHSTUDY_BASE}/LockChip/LC-PRD-097266-00.png`,
  "Unicorn": `${PHSTUDY_BASE}/LockChip/LC-PRD-096146-01.png`,
  "Bahamut": `${PHSTUDY_BASE}/LockChip/LC-PRD-097259-00.png`,
  "Ragna": `${PHSTUDY_BASE}/LockChip/LC-PRD-097273-00.png`,
  "Drake": `${PHSTUDY_BASE}/LockChip/LC-PRD-097266-00.png`,
  "Cerberus": `${PHSTUDY_BASE}/LockChip/LC-PRD-956983-01.png`,
  "Whale": `${PHSTUDY_BASE}/LockChip/LC-PRD-956983-02.png`,
  "Fox": `${PHSTUDY_BASE}/LockChip/LC-PRD-956969-01.png`,
  "Valkyrie": `${PHSTUDY_BASE}/LockChip/LC-PRD-954316-00.png`,
  "Leon": `${PHSTUDY_BASE}/LockChip/LC-PRD-994350-00.png`,
  "Eva": `${PHSTUDY_BASE}/LockChip/LC-PRD-085683-01.png`,
  "Emperor": `${PHSTUDY_BASE}/LockChip/LC-PRD-098775-01.png`,
  "Brachio": `${PHSTUDY_BASE}/LockChip/LC-PRD-096177-01.png`,
  // CX-00 Corocoro limited lock chips
  "Wriggle": `${PHSTUDY_BASE}/LockChip/LC-PRD-100004-00.png`,
  "Hornet": `${PHSTUDY_BASE}/LockChip/LC-PRD-100005-00.png`,
  "Bucks": `${PHSTUDY_BASE}/LockChip/LC-PRD-100006-00.png`,
};

const mainBladeFallbackUrls: Record<string, string> = {
  "Brave": `${PHSTUDY_BASE}/MainBlade/MB-PRD-939597-00.png`,
  "Arc": `${PHSTUDY_BASE}/MainBlade/MB-PRD-939603-00.png`,
  "Dark": `${PHSTUDY_BASE}/MainBlade/MB-PRD-939610-00.png`,
  "Reaper": `${PHSTUDY_BASE}/MainBlade/MB-PRD-939627-02.png`,
  "Eclipse": `${PHSTUDY_BASE}/MainBlade/MB-PRD-995678-00.png`,
  "Hunt": `${PHSTUDY_BASE}/MainBlade/MB-PRD-097242-00.png`,
  "Flare": `${PHSTUDY_BASE}/MainBlade/MB-PRD-096153-00.png`,
  "Blast": `${PHSTUDY_BASE}/MainBlade/MB-PRD-956976-00.png`,
  "Curse": `${PHSTUDY_BASE}/MainBlade/MB-PRD-098775-01.png`,
  "Fortress": `${PHSTUDY_BASE}/MainBlade/MB-PRD-097266-00.png`,
  "Volt": `${PHSTUDY_BASE}/MainBlade/MB-PRD-954316-00.png`,
  "Brush": `${PHSTUDY_BASE}/MainBlade/MB-PRD-956969-01.png`,
  "Fang": `${PHSTUDY_BASE}/MainBlade/MB-PRD-994350-00.png`,
  "Might": `${PHSTUDY_BASE}/MainBlade/MB-PRD-098775-01.png`,
  "Dagger": `${PHSTUDY_BASE}/MainBlade/MB-PRD-080572-00.png`,
  // CX-00 Corocoro limited main blades
  "Kraken": `${PHSTUDY_BASE}/MainBlade/MB-PRD-100004-00.png`,
  "Fort": `${PHSTUDY_BASE}/MainBlade/MB-PRD-100005-00.png`,
  "Antlers": `${PHSTUDY_BASE}/MainBlade/MB-PRD-100006-00.png`,
};

const metalBladeFallbackUrls: Record<string, string> = {
  "Blitz": `${PHSTUDY_BASE}/MetalBlade/ME-PRD-097259-00.png`,
  "Fortress": `${PHSTUDY_BASE}/MetalBlade/ME-PRD-097266-00.png`,
  "Rage": `${PHSTUDY_BASE}/MetalBlade/ME-PRD-097273-00.png`,
  "Whip": `${PHSTUDY_BASE}/MetalBlade/ME-PRD-096177-01.png`,
  "Delta": `${PHSTUDY_BASE}/MetalBlade/ME-PRD-096146-01.png`,
};

const overBladeFallbackUrls: Record<string, string> = {
  "Break": `${PHSTUDY_BASE}/OverBlade/OV-PRD-097259-00.png`,
  "Guard": `${PHSTUDY_BASE}/OverBlade/OV-PRD-097266-00.png`,
  "Flow": `${PHSTUDY_BASE}/OverBlade/OV-PRD-097273-00.png`,
  "Peak": `${PHSTUDY_BASE}/OverBlade/OV-PRD-096146-01.png`,
  "Outer": `${PHSTUDY_BASE}/OverBlade/OV-PRD-096177-01.png`,
};

/** Remote (phstudy.org) fallback URL for a Lock Chip image */
export function getLockChipFallbackUrl(name: string): string | null {
  return lockChipFallbackUrls[name] ?? null;
}

/** Remote (phstudy.org) fallback URL for a Main Blade image */
export function getMainBladeFallbackUrl(name: string): string | null {
  return mainBladeFallbackUrls[name] ?? null;
}

/** Remote (phstudy.org) fallback URL for a Metal Blade image */
export function getMetalBladeFallbackUrl(name: string): string | null {
  return metalBladeFallbackUrls[name] ?? null;
}

/** Remote (phstudy.org) fallback URL for an Over Blade image */
export function getOverBladeFallbackUrl(name: string): string | null {
  return overBladeFallbackUrls[name] ?? null;
}

/** Local path to a ratchet image, e.g. /mybey/parts/ratchets/3-60.webp */
export function getRatchetImageUrl(ratchetName: string): string {
  return `${BASE}parts/ratchets/${ratchetName}.webp`;
}

/** Local path to a lock chip image, e.g. /mybey/parts/lockChip/Dran.webp */
export function getLockChipImageUrl(name: string): string {
  return `${BASE}parts/lockChip/${name}.webp`;
}

/** Local path to a main blade image, e.g. /mybey/parts/mainBlade/Brave.webp */
export function getMainBladeImageUrl(name: string): string {
  return `${BASE}parts/mainBlade/${name}.webp`;
}

/** Local path to a metal blade image, e.g. /mybey/parts/metalBlade/Blitz.webp */
export function getMetalBladeImageUrl(name: string): string {
  return `${BASE}parts/metalBlade/${name}.webp`;
}

/** Local path to an over blade image, e.g. /mybey/parts/overBlade/Break.webp */
export function getOverBladeImageUrl(name: string): string {
  return `${BASE}parts/overBlade/${name}.webp`;
}

/** Generic local path — delegates by part type */
export function getPartImageUrl(type: string, name: string): string | null {
  switch (type) {
    case "Blade": return getBladeImageUrl(name);
    case "Bit": return getBitImageUrl(name);
    case "Assist Blade": return getAssistBladeImageUrl(name);
    case "Lock Chip": return getLockChipImageUrl(name);
    case "Main Blade": return getMainBladeImageUrl(name);
    case "Metal Blade": return getMetalBladeImageUrl(name);
    case "Over Blade": return getOverBladeImageUrl(name);
    case "Ratchet":
      return getRatchetImageUrl(name);
    default: return null;
  }
}

/** Remote (phstudy.org) fallback URL for a Ratchet image */
export function getRatchetFallbackUrl(ratchetName: string): string | null {
  return `${PHSTUDY_BASE}/Ratchet/${RATCHET_FALLBACK_ID_MAP[ratchetName] ?? "unknown"}.png`;
}

/** Fallback ID map for ratchets — best PRD ID per ratchet */
const RATCHET_FALLBACK_ID_MAP: Record<string, string> = {
  "0-60": "RC-PRD-097242-00",
  "0-70": "RC-PRD-080558-00",
  "0-80": "RC-PRD-939566-01",
  "1-50": "RC-PRD-097259-00",
  "1-60": "RC-PRD-090960-00",
  "1-70": "RC-PRD-982432-02",
  "1-80": "RC-PRD-085690-00",
  "2-60": "RC-PRD-085706-00",
  "2-70": "RC-PRD-939535-00",
  "2-80": "RC-PRD-096092-05",
  "3-60": "RC-PRD-910381-00",
  "3-70": "RC-PRD-096528-00",
  "3-80": "RC-PRD-910404-00",
  "3-85": "RC-PRD-096092-04",
  "4-50": "RC-PRD-096122-00",
  "4-55": "RC-EVE-088899-00",
  "4-60": "RC-PRD-910398-00",
  "4-70": "RC-PRD-096092-02",
  "4-80": "RC-PRD-910473-00",
  "5-60": "RC-PRD-085515-00",
  "5-70": "RC-PRD-914495-00",
  "5-80": "RC-PRD-912972-01",
  "6-60": "RC-PRD-939597-00",
  "6-70": "RC-PRD-939580-00",
  "6-80": "RC-PRD-939610-00",
  "7-55": "RC-PRD-097167-01",
  "7-60": "RC-PRD-096092-03",
  "7-70": "RC-PRD-939542-03",
  "7-80": "RC-PRD-096146-06",
  "8-70": "RC-PRD-097266-00",
  "9-60": "RC-PRD-098843-00",
  "9-65": "RC-PRD-096146-03",
  "9-70": "RC-PRD-097167-04",
  "9-80": "RC-PRD-096092-01",
  "M-85": "RC-PRD-098775-02",
};

/** Generic remote fallback URL — delegates by part type */
export function getPartFallbackUrl(type: string, name: string): string | null {
  switch (type) {
    case "Blade": return getBladeFallbackUrl(name);
    case "Bit": return getBitFallbackUrl(name);
    case "Assist Blade": return getAssistBladeFallbackUrl(name);
    case "Lock Chip": return getLockChipFallbackUrl(name);
    case "Main Blade": return getMainBladeFallbackUrl(name);
    case "Metal Blade": return getMetalBladeFallbackUrl(name);
    case "Over Blade": return getOverBladeFallbackUrl(name);
    case "Ratchet": return getRatchetFallbackUrl(name);
    default: return null;
  }
}

// ── Color Variant Images ──────────────────────────────────────────────

/**
 * Local path to a color-variant blade image.
 * Naming convention: {WikiName}__{colorSlug}.webp
 * e.g. DranBuster__metallic-cyan.webp
 */
export function getBladeVariantImageUrl(bladeName: string, colorSlug: string): string {
  const wikiName = bladeNameToWikiName(bladeName);
  return `${BASE}parts/blades/${wikiName}__${colorSlug}.webp`;
}

/**
 * Local path to a color-variant lock chip image.
 * Naming convention: {Name}__{colorSlug}.webp
 * e.g. Bahamut__cx16.webp, Cerberus__dark.webp
 */
export function getLockChipVariantImageUrl(name: string, colorSlug: string): string {
  return `${BASE}parts/lockChip/${name}__${colorSlug}.webp`;
}

/**
 * Local path to a color-variant ratchet image.
 * Naming convention: {Size}__{colorSlug}.webp
 * e.g. 5-70__cx18-purple.webp, 6-60__metallic-gold.webp
 */
export function getRatchetVariantImageUrl(name: string, colorSlug: string): string {
  return `${BASE}parts/ratchets/${name}__${colorSlug}.webp`;
}
/**
 * Naming convention: {Code}__{colorSlug}.webp
 * e.g. V__metallic-gold.webp, A__metallic-cyan.webp
 */
export function getBitVariantImageUrl(code: string, colorSlug: string): string {
  return `${BASE}parts/bits/${code}__${colorSlug}.webp`;
}

// Import manifest of existing product-specific images
import productImageManifest from "./productImageManifest.json";

/**
 * Get the appropriate variant or base image URL for any part type.
 * Used by PartImage.tsx for colorSlug-aware rendering.
 *
 * Priority:
 * 1. Product-specific image: parts/{dir}/{productId}-{subIdx}-{partType}.webp
 * 2. Color variant image: parts/{dir}/{name}__{colorSlug}.webp
 * 3. Base image: parts/{dir}/{name}.webp
 */
export function getPartVariantImageUrl(type: string, name: string, colorSlug: string, productId?: string, subIdx?: number): string | null {
  // Product-specific image (from phstudy product-to-part mapping)
  if (productId && subIdx !== undefined) {
    const dir = partTypeToDir(type);
    if (dir) {
      const key = `${productId}-${subIdx}`;
      const manifestKey = partTypeToManifestKey(type);
      if (manifestKey && (productImageManifest as Record<string, string[]>)[manifestKey]?.includes(key)) {
        return `${BASE}parts/${dir}/${key}-${partTypeToSuffix(type)}.webp`;
      }
    }
  }

  // Color variant image
  if (colorSlug && colorSlug !== "standard") {
    switch (type) {
      case "Blade": return getBladeVariantImageUrl(name, colorSlug);
      case "Lock Chip": return getLockChipVariantImageUrl(name, colorSlug);
      case "Bit": return getBitVariantImageUrl(name, colorSlug);
      case "Ratchet": return getRatchetVariantImageUrl(name, colorSlug);
      default: return getPartImageUrl(type, name);
    }
  }

  // Base image
  return getPartImageUrl(type, name);
}

function partTypeToDir(type: string): string | null {
  switch (type) {
    case "Blade": return "blades";
    case "Ratchet": return "ratchets";
    case "Bit": return "bits";
    case "Lock Chip": return "lockChip";
    case "Main Blade": return "mainBlade";
    case "Assist Blade": return "assist";
    case "Metal Blade": return "metalBlade";
    case "Over Blade": return "overBlade";
    default: return null;
  }
}

function partTypeToSuffix(type: string): string {
  switch (type) {
    case "Blade": return "blade";
    case "Ratchet": return "ratchet";
    case "Bit": return "bit";
    case "Lock Chip": return "lockchip";
    case "Main Blade": return "mainblade";
    case "Assist Blade": return "assist";
    case "Metal Blade": return "metalblade";
    case "Over Blade": return "overblade";
    default: return type.toLowerCase();
  }
}

function partTypeToManifestKey(type: string): string | null {
  switch (type) {
    case "Blade": return "blades";
    case "Ratchet": return "ratchets";
    case "Bit": return "bits";
    default: return null;
  }
}

/**
 * Remote fallback URL for a color-variant image.
 */
export function getPartVariantFallbackUrl(type: string, name: string): string | null {
  switch (type) {
    case "Blade": return getBladeFallbackUrl(name);
    case "Lock Chip": return getLockChipFallbackUrl(name);
    case "Bit": return getBitFallbackUrl(name);
    default: return getPartFallbackUrl(type, name);
  }
}

/**
 * Remote fallback URL for a color-variant blade image.
 * Falls back to the base blade Fandom image.
 */
export function getBladeVariantFallbackUrl(bladeName: string): string {
  return getBladeFallbackUrl(bladeName);
}

/**
 * Get the base blade image URL (used as fallback when variant image is missing).
 */
export function getBladeBaseImageUrl(bladeName: string): string {
  return getBladeImageUrl(bladeName);
}