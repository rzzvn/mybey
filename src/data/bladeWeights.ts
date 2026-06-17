/**
 * Blade & CX component average weight data from go-shoot.github.io (beyblade X database).
 *
 * stat format: "28-" → 28 - 0.3 = 27.7g, "28=" → 28.0g, "27+" → 27 + 0.3 = 27.3g
 *
 * Keyed by PascalCase name (same as bladeNameToWikiName in partImages.ts).
 */

const ADJUST: Record<string, number> = { "+": 0.3, "=": 0.0, "-": -0.3 };

function parseStat(stat: string): number | null {
  if (!stat || !stat[0]?.match(/\d/)) return null;
  const num = parseInt(stat, 10);
  const suffix = stat.at(-1) ?? "=";
  return num + (ADJUST[suffix] ?? 0);
}

// ── Blades (BX / UX / Collab) ───────────────────────────────────────────
export const BLADE_AVERAGE_WEIGHTS: Record<string, number> = {
  DranSword: 35.0,
  DranDagger: 35.0,
  DranBuster: 36.7,
  DranStrike: 41.3,
  HellsScythe: 32.7,
  HellsChain: 33.3,
  HellsHammer: 33.3,
  KnightShield: 32.3,
  KnightLance: 33.0,
  KnightMail: 36.7,
  WizardArrow: 32.0,
  WizardRod: 35.3,
  RhinoHorn: 33.0,
  SharkEdge: 34.7,
  SharkScale: 37.3,
  LeonClaw: 31.7,
  ViperTail: 34.7,
  CobaltDragoon: 37.7,
  CobaltDrake: 37.7,
  WeissTiger: 34.7,
  PhoenixWing: 38.7,
  PhoenixFeather: 33.3,
  PhoenixRudder: 34.7,
  SphinxCowl: 32.7,
  UnicornSting: 33.3,
  WyvernGale: 31.7,
  WhaleWave: 38.0,
  BlackShell: 32.3,
  CrimsonGaruda: 35.0,
  SilverWolf: 37.0,
  AeroPegasus: 38.7,
  LeonCrest: 35.0,
  MeteorDragoon: 39.0,
  ShinobiShadow: 28.0,
  ShinobiKnife: 31.0,
  TyrannoBeat: 37.0,
  TyrannoRoar: 36.0,
  ImpactDrake: 38.7,
  SamuraiCalibur: 35.7,
  SamuraiSaber: 36.3,
  SamuraiSteel: 31.7,
  GhostCircle: 26.7,
  GolemRock: 34.0,
  OrochiCluster: 36.3,
  ClockMirage: 37.7,
  ScorpioSpear: 39.7,
  ShelterDrake: 32.7,
  TriceraPress: 36.3,
  TriceraSpiky: 29.7,
  HeavensRing: 37.3,
  BisonBurrow: 41.0,
  BulletGriffon: 60.7,
  WyvernHover: 35.3,
  BearScratch: 30.3,
  MammothTusk: 32.3,
  PteraSwing: 34.3,
  CrocoCrunch: 33.7,
  GoatTackle: 31.7,
  SharkGill: 30.0,
  DragoonStorm: 33.7,
  DrigerSlash: 33.3,
  DranzerSpiral: 36.0,
  MummyCurse: 37.3,
};

// ── Lock Chip (塑膠層，go-shoot abbr → weight stat) ─────────────────────
// abbr mapping: Br=Brachio, Un=Unicorn, Ev=Eva, Rg=Ragna, Kn=Knight, Bh=Bahamut,
// Ph=Phoenix, Em=Emperor, Wl=Wolf, Sl=Sol, Vl=Valkyrie, Pg=Pegasus,
// Cr=Cerberus, Wh=Whale, Ln=Leon, Fx=Fox, Hl=Hells, Rh=Rhino,
// Dr=Dran, Wz=Wizard, Pr=Perseus, Kr=Kraken, Hr=Hornet, Bc=Bucks, Dk=Drake
export const LOCK_CHIP_AVERAGE_WEIGHTS: Record<string, number> = {
  Brachio: 1.7,
  Unicorn: 1.7,
  Eva: 1.7,
  Ragna: 1.7,
  Knight: 1.7,
  Bahamut: 1.7,
  Phoenix: 1.7,
  Emperor: 4.7,
  Wolf: 1.7,
  Sol: 1.7,
  Valkyrie: 5.7,
  Pegasus: 1.7,
  Cerberus: 1.7,
  Whale: 1.7,
  Leon: 1.7,
  Fox: 1.7,
  Hells: 1.7,
  Rhino: 1.7,
  Dran: 1.7,
  Wizard: 1.7,
  Perseus: 1.7,
  Kraken: 1.7,
  Hornet: 1.7,
  Bucks: 1.7,
  Drake: 1.7,
};

// ── Main Blade (金屬層) ─────────────────────────────────────────────────
export const MAIN_BLADE_AVERAGE_WEIGHTS: Record<string, number> = {
  Flare: 31.0,
  Might: 33.3,
  Hunt: 31.7,
  Eclipse: 32.3,
  Flame: 29.0,
  Blast: 32.7,
  Volt: 31.3,
  Fang: 30.3,
  Brush: 30.3,
  Reaper: 29.0,
  Dark: 30.3,
  Arc: 29.3,
  Brave: 31.3,
  Wriggle: 29.3,
  Fort: 29.0,
  Antlers: 29.0,
  Kraken: 29.3,
};

// ── Metal Blade (金屬層) ────────────────────────────────────────────────
export const METAL_BLADE_AVERAGE_WEIGHTS: Record<string, number> = {
  Whip: 27.7,
  Delta: 28.0,
  Rage: 27.3,
  Fortress: 27.7,
  Blitz: 29.7,
};

// ── Over Blade (塑膠層) ────────────────────────────────────────────────
export const OVER_BLADE_AVERAGE_WEIGHTS: Record<string, number> = {
  Peak: 3.3,
  Break: 3.7,
  Guard: 3.3,
  Flow: 3.7,
  Outer: 3.7,
};

// ── Assist Blade (塑膠層) ──────────────────────────────────────────────
export const ASSIST_BLADE_AVERAGE_WEIGHTS: Record<string, number> = {
  Odd: 4.3,
  Knuckle: 5.0,
  Vertical: 5.3,
  Erase: 6.0,
  Heavy: 8.0,
  Free: 5.7,
  Dual: 6.0,
  Massive: 5.3,
  Wheel: 7.0,
  Assault: 5.0,
  Jaggy: 4.7,
  Slash: 4.7,
  Turn: 5.7,
  Charge: 5.0,
  Bumper: 5.3,
  Round: 4.7,
  Zillion: 6.7,
};

// ── Aliases ──────────────────────────────────────────────────────────────
const BLADE_ALIASES: Record<string, string> = {
  "WarriorSaber": "SamuraiSaber",
  "BiteCroc": "CrocoCrunch",
  "ScropioSpear": "ScorpioSpear",
  "Samurai Saber": "SamuraiSaber",
};

// Single-letter assist blade codes used in product data
const ASSIST_ALIASES: Record<string, string> = {
  "B": "Bumper",
  "D": "Dual",
  "G": "Gravity",
};

/**
 * Get average weight for a blade or CX component.
 * partType: "Blade" | "Lock Chip" | "Main Blade" | "Metal Blade" | "Over Blade" | "Assist Blade"
 * name: e.g. "Dran Sword", "Bahamut", "Blitz", "Break", "Heavy"
 */
export function getPartAverageWeight(partType: string, name: string): number | null {
  const normalized = name.replace(/[- ]/g, "");

  switch (partType) {
    case "Blade": {
      const alias = BLADE_ALIASES[normalized];
      return BLADE_AVERAGE_WEIGHTS[alias ?? normalized] ?? null;
    }
    case "Lock Chip":
      return LOCK_CHIP_AVERAGE_WEIGHTS[normalized] ?? null;
    case "Main Blade":
      return MAIN_BLADE_AVERAGE_WEIGHTS[normalized] ?? null;
    case "Metal Blade":
      return METAL_BLADE_AVERAGE_WEIGHTS[normalized] ?? null;
    case "Over Blade":
      return OVER_BLADE_AVERAGE_WEIGHTS[normalized] ?? null;
    case "Assist Blade":
      return ASSIST_BLADE_AVERAGE_WEIGHTS[ASSIST_ALIASES[normalized] ?? normalized] ?? null;
    default:
      return null;
  }
}

/** Backward compat: blade only */
export function getBladeAverageWeight(bladeName: string): number | null {
  return getPartAverageWeight("Blade", bladeName);
}
