/**
 * Blade similarity mappings for Beyblade X.
 *
 * Maps collab/special blades to the standard blade they share plastic (and often metal) components with.
 * Bidirectional: if Spider-Man ~ Viper Tail, then looking up either blade shows the other.
 *
 * Source: Beyblade Fandom Wiki — each collab blade's page states which standard blade
 * shares identical plastic components and whether the metal is identical, nearly identical,
 * retooled, or modified.
 *
 * status values:
 *   "identical"    — same mold, only cosmetic difference (sticker/print)
 *   "nearly"      — nearly identical metal, minor cosmetic detail differences
 *   "retooled"    — metal component was meaningfully reshaped, affects performance
 *   "modified"    — somewhere between cosmetic and full retool
 */

export interface BladeSimilarity {
  /** Collab/special blade name (as in products.ts blade field) */
  blade: string;
  /** Standard blade it shares components with */
  similarTo: string;
  /** How similar the metal component is */
  status: "identical" | "nearly" | "retooled" | "modified";
  /** Short label for display */
  label: string;
}

/**
 * One-directional mapping: collab blade → standard blade.
 * Use getSimilarBlades() for bidirectional lookup.
 */
export const bladeSimilarities: BladeSimilarity[] = [
  // ═══════════════════════════════════════
  // Marvel Collaboration
  // ═══════════════════════════════════════
  { blade: "Spider-Man", similarTo: "Viper Tail", status: "nearly", label: "same plastic as" },
  { blade: "Venom", similarTo: "Dran Sword", status: "nearly", label: "same plastic as" },
  { blade: "Captain America", similarTo: "Dran Sword", status: "retooled", label: "based on" },
  { blade: "Red Hulk", similarTo: "Tyranno Beat", status: "retooled", label: "based on" },
  { blade: "Miles Morales", similarTo: "Wizard Arrow", status: "nearly", label: "same plastic as" },
  { blade: "Green Goblin", similarTo: "Wizard Arrow", status: "nearly", label: "same plastic as" },
  { blade: "Iron Man", similarTo: "Knight Shield", status: "nearly", label: "same plastic as" },

  // ═══════════════════════════════════════
  // Star Wars Collaboration
  // ═══════════════════════════════════════
  { blade: "Obi-Wan Kenobi", similarTo: "Knight Lance", status: "nearly", label: "same plastic as" },
  { blade: "General Grievous", similarTo: "Rhino Horn", status: "nearly", label: "same plastic as" },
  { blade: "Luke Skywalker", similarTo: "Knight Shield", status: "nearly", label: "same plastic as" },
  { blade: "Darth Vader", similarTo: "Knight Lance", status: "nearly", label: "same plastic as" },
  { blade: "Chewbacca", similarTo: "Shelter Drake", status: "modified", label: "based on" },
  { blade: "Stormtrooper", similarTo: "Rhino Horn", status: "nearly", label: "same plastic as" },
  { blade: "The Mandalorian", similarTo: "Leon Claw", status: "nearly", label: "same plastic as" },
  { blade: "Moff Gideon", similarTo: "Hells Scythe", status: "nearly", label: "same plastic as" },

  // ═══════════════════════════════════════
  // Transformers Collaboration
  // ═══════════════════════════════════════
  { blade: "Optimus Prime", similarTo: "Knight Shield", status: "nearly", label: "same plastic as" },
  { blade: "Megatron", similarTo: "Hells Scythe", status: "nearly", label: "same plastic as" },
  { blade: "Optimus Primal", similarTo: "Shark Edge", status: "nearly", label: "same plastic as" },
  { blade: "Starscream", similarTo: "Wizard Arrow", status: "nearly", label: "same plastic as" },

  // ═══════════════════════════════════════
  // Jurassic World Collaboration
  // ═══════════════════════════════════════
  { blade: "T-Rex", similarTo: "Tyranno Beat", status: "retooled", label: "based on" },
  { blade: "Mosasaurus", similarTo: "Sphinx Cowl", status: "retooled", label: "based on" },
  { blade: "Spinosaurus", similarTo: "Phoenix Wing", status: "modified", label: "based on" },
  { blade: "Quetzalcoatlus", similarTo: "Viper Tail", status: "nearly", label: "same plastic as" },

  // ═══════════════════════════════════════
  // Thanos (Marvel)
  // ═══════════════════════════════════════
  { blade: "Thanos", similarTo: "Knight Lance", status: "nearly", label: "same plastic as" },
];

/**
 * Bidirectional lookup: given a blade name, return all blades similar to it.
 * Returns both directions:
 *   - If blade is collab → returns the standard blade it's based on
 *   - If blade is standard → returns all collab blades based on it
 */
export function getSimilarBlades(bladeName: string): BladeSimilarity[] {
  const results: BladeSimilarity[] = [];

  // Forward: blade is the collab blade
  for (const sim of bladeSimilarities) {
    if (sim.blade === bladeName) {
      results.push(sim);
    }
  }

  // Reverse: blade is the standard blade, find collab blades based on it
  for (const sim of bladeSimilarities) {
    if (sim.similarTo === bladeName) {
      results.push({
        blade: bladeName,
        similarTo: sim.blade,
        status: sim.status,
        label: sim.status === "retooled" || sim.status === "modified" ? "base of" : "same plastic as",
      });
    }
  }

  return results;
}

/**
 * Quick check: does a blade have any similarity links?
 */
export function hasSimilarBlades(bladeName: string): boolean {
  return bladeSimilarities.some(s => s.blade === bladeName || s.similarTo === bladeName);
}