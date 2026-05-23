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
  "Goat Tackle": "GoatTackle",
  "Wolf Hunt": "WolfHunt",
  "Fox Brush": "FoxBrush",
  "Fox Brush J": "FoxBrushJ",
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
  "UN": "Unite",
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
  "Op": "LowOrb",
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
  "Tr": "Taper",
  "DB": "DiskBall",
  "GB": "GearBall",
  "M": "Merge",
  "Z": "Zap",
  "P": "Point",
  "WW": "WallWedge",
  "GP": "GearPoint",
  "C": "Cyclone",
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
  const wikiName = BIT_CODE_TO_WIKI[bitCode] ?? bitCode;
  return `https://beyblade.fandom.com/wiki/Special:FilePath/Bit${wikiName}.png`;
}

/** Remote (Fandom wiki) fallback URL for an assist blade image */
export function getAssistBladeFallbackUrl(assistBladeName: string): string {
  return `https://beyblade.fandom.com/wiki/Special:FilePath/AssistBlade${assistBladeName}.png`;
}

/** Generic local path — delegates by part type */
export function getPartImageUrl(type: string, name: string): string | null {
  switch (type) {
    case "Blade": return getBladeImageUrl(name);
    case "Bit": return getBitImageUrl(name);
    case "Assist Blade": return getAssistBladeImageUrl(name);
    default: return null;
  }
}

/** Generic remote fallback URL — delegates by part type */
export function getPartFallbackUrl(type: string, name: string): string | null {
  switch (type) {
    case "Blade": return getBladeFallbackUrl(name);
    case "Bit": return getBitFallbackUrl(name);
    case "Assist Blade": return getAssistBladeFallbackUrl(name);
    default: return null;
  }
}

// ── Color Variant Images ──────────────────────────────────────────────

/**
 * Local path to a color-variant blade image.
 * Naming convention: {WikiName}__{colorSlug}.webp
 * e.g. DranBuster__metallic-cyan.webp
 *
 * Use this when a blade has a specific color variant image.
 * Falls back to the base blade image if no variant image exists.
 */
export function getBladeVariantImageUrl(bladeName: string, colorSlug: string): string {
  const wikiName = bladeNameToWikiName(bladeName);
  return `${BASE}parts/blades/${wikiName}__${colorSlug}.webp`;
}

/**
 * Remote fallback URL for a color-variant blade image.
 * Falls back to the base blade Fandom image.
 */
export function getBladeVariantFallbackUrl(bladeName: string, _colorSlug: string): string {
  // Fandom wiki doesn't have per-variant images — fall back to base
  return getBladeFallbackUrl(bladeName);
}

/**
 * Get the base blade image URL (used as fallback when variant image is missing).
 * This is just an alias for getBladeImageUrl for clarity.
 */
export function getBladeBaseImageUrl(bladeName: string): string {
  return getBladeImageUrl(bladeName);
}