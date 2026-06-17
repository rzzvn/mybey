/**
 * Blade average weight data from go-shoot.github.io (beyblade X database).
 *
 * Weight format: "37+" → 37 + 0.3 = 37.3g, "41=" → 41.0g, "61-" → 61 - 0.3 = 60.7g
 *
 * Keyed by PascalCase (no spaces) blade name — same as bladeNameToWikiName() in partImages.ts.
 */

export const BLADE_AVERAGE_WEIGHTS: Record<string, number> = {
  // BX
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
  SamuraiSaber: 36.3, // same as WarriorSaber (Hasbro rename)
  SamuraiSteel: 31.7,
  GhostCircle: 26.7,
  GolemRock: 34.0,
  OrochiCluster: 36.3,
  ClockMirage: 37.7,
  ScorpioSpear: 39.7,
  ShelterDrake: 32.7,
  TriceraPress: 36.3,
  TriceraSpiky: 29.7,
  // UX
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
  // Collab / Hasbro
  DragoonStorm: 33.7,
  DrigerSlash: 33.3,
  DranzerSpiral: 36.0,
  MummyCurse: 37.3,
};

// Aliases: some blade names are different in our app vs go-shoot
const NAME_ALIASES: Record<string, string> = {
  "WarriorSaber": "SamuraiSaber",
  "BiteCroc": "CrocoCrunch",
  "ScropioSpear": "ScorpioSpear",
  "Samurai Saber": "SamuraiSaber",
};

/**
 * Get the average weight for a blade by its standard name (e.g. "Dran Sword").
 * Uses the same PascalCase normalization as bladeNameToWikiName in partImages.ts.
 */
export function getBladeAverageWeight(bladeName: string): number | null {
  // Normalize: remove spaces, handle aliases
  const normalized = bladeName.replace(/[- ]/g, "");
  const alias = NAME_ALIASES[normalized];
  const key = alias ?? normalized;

  const weight = BLADE_AVERAGE_WEIGHTS[key];
  return weight ?? null;
}