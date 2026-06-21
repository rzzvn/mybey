import type { PartEntry, PartTier, ContainedInItem } from "./types";
import { products } from "./products";
import { colorVariants } from "./colorVariants";
import { bladeSimilarities } from "./bladeSimilarities";
import { bladeData, lockChipData, mainBladeData, metalBladeData, overBladeData, assistBladeData, bitData } from "./goShootData";

/** Look up go-shoot data for a part by type and name */
function getGoShootPart(type: string, name: string): { weight?: string; description?: string; attributes?: string[] } | undefined {
  switch (type) {
    case "Blade": return bladeData[name];
    case "Lock Chip": return lockChipData[name];
    case "Main Blade": return mainBladeData[name];
    case "Metal Blade": return metalBladeData[name];
    case "Over Blade": return overBladeData[name];
    case "Assist Blade": return assistBladeData[name];
    case "Bit": return bitData[name];
    case "Ratchet": return undefined; // No go-shoot ratchet data yet
    default: return undefined;
  }
}

export const ratchetTiers: Record<string, string> = {
  "1-50": "T0",
  "1-60": "T0",
  "1-70": "T0",
  "7-60": "T0",
  "9-60": "T0",
  "3-60": "T1",
  "4-50": "T1",
  "5-60": "T1",
  "6-60": "T1",
  "9-70": "T1",
  "0-60": "T2",
  "4-60": "T2",
  "7-55": "T2",
  "7-70": "T2",
  "8-70": "T2",
  "0-70": "T3",
  "0-80": "T3",
  "3-70": "T3",
  "7-80": "T3",
  "9-80": "T3",
  "4-55": "T4",
  "5-70": "T4",
  "6-70": "T4",
  "9-65": "T4",
  "M-85": "T4",
  "1-80": "T5",
  "3-80": "T5",
  "3-85": "T5",
  "4-70": "T5",
  "6-80": "T5",
  "2-60": "T6",
  "2-70": "T6",
  "2-80": "T6",
  "4-80": "T6",
  "5-80": "T6",
};
export const bitTiers: Record<string, string> = {
  "B": "T0",
  "E": "T0",
  "H": "T0",
  "K": "T0",
  "L": "T0",
  "LR": "T0",
  "R": "T0",
  "FB": "T1",
  "FF": "T1",
  "J": "T1",
  "LO": "T1",
  "T": "T1",
  "UF": "T1",
  "UN": "T1",
  "F": "T2",
  "LF": "T2",
  "O": "T2",
  "Op": "T2",
  "P": "T2",
  "U": "T2",
  "W": "T2",
  "D": "T3",
  "GR": "T3",
  "GU": "T3",
  "HN": "T3",
  "TK": "T3",
  "WB": "T3",
  "Y": "T3",
  "A": "T4",
  "C": "T4",
  "GP": "T4",
  "I": "T4",
  "TP": "T4",
  "WW": "T4",
  "Z": "T4",
  "DB": "T5",
  "DS": "T5",
  "G": "T5",
  "GB": "T5",
  "GF": "T5",
  "HT": "T5",
  "S": "T5",
  "V": "T5",
  "BS": "T6",
  "GN": "T6",
  "Nr": "T2",
  "M": "T6",
  "MN": "T6",
  "N": "T6",
  "Q": "T6",
  "RA": "T6",
  "Tr": "T6",
};

export const bladeTiers: Record<string, string> = {
  "Aero Pegasus": "T0",
  "Meteor Dragoon": "T0",
  "Pegasus Blast": "T0",
  "Shark Scale": "T0",
  "Wizard Rod": "T0",
  "Bullet Griffin": "T0.5",
  "Clock Mirage": "T0.5",
  "Cobalt Dragoon": "T0.5",
  "Dran Strike": "T0.5",
  "Phoenix Wing": "T0.5",
  "Bahamut Blitz": "T1",
  "Knight Fortress": "T1",
  "Mummy Curse": "T1",
  "Scorpio Spear": "T1",
  "Silver Wolf": "T1",
  "Wyvern Hover": "T1",
  "Emperor Might": "T1.5",
  "Impact Drake": "T1.5",
  "Orochi Cluster": "T1.5",
  "Phoenix Flare": "T1.5",
  "Unicorn Delta": "T1.5",
  "Warrior Saber": "T1.5",
  "Dran Buster": "T2",
  "Knight Mail": "T2",
  "Ragna Rage": "T2",
  "Samurai Calibur": "T2",
  "Tyranno Beat": "T2",
  "Valkyrie Volt": "T2",
  "Cerberus Flame": "T2.5",
  "Dran Brave": "T2.5",
  "Golem Rock": "T2.5",
  "Sol Eclipse": "T2.5",
  "Whale Flame": "T2.5",
  "Whale Wave": "T2.5",
  "Cobalt Drake": "T3",
  "Hells Reaper": "T3",
  "Rhino Reaper": "T3",
  "Shark Edge": "T3",
  "Tyranno Roar": "T3",
  "Wizard Arc": "T3",
  "Bite Croc": "T3.5",
  "CrocCrunch": "T3.5",
  "Fox Brush": "T3.5",
  "Leon Fang": "T3.5",
  "Perseus Dark": "T3.5",
  "Tricera Press": "T3.5",
  "Wolf Hunt": "T3.5",
  "Dran Dagger": "T4",
  "Dran Sword": "T4",
  "Hells Chain": "T4",
  "Hells Scythe": "T4",
  "Knight Shield": "T4",
  "Phoenix Rudder": "T4",

  "Crimson Garuda": "T4.5",
  "Hells Hammer": "T4.5",
  "Leon Crest": "T4.5",
  "Mammoth Tusk": "T4.5",
  "Unicorn Sting": "T4.5",
  "Wizard Arrow": "T4.5",
  "Black Shell": "T5",
  "Ghost Circle": "T5",
  "Shark Gill": "T5",
  "Shelter Drake": "T5",
  "Viper Tail": "T5",
  "Weiss Tiger": "T5",
  "Goat Tackle": "T5.5",
  "Knight Lance": "T5.5",
  "Phoenix Feather": "T5.5",
  "Ptera Swing": "T5.5",
  "Sphinx Cowl": "T5.5",
  "Wyvern Gale": "T5.5",
  // CX-00 Corocoro limited blades
  "Wriggle Kraken": "T5",      // Custom Line Original — CX-00-01
  "Hornet Fort": "T5",         // Custom Line Original — CX-00-02
  "Bucks Antlers": "T5",       // Custom Line Original — CX-00-03
  // Community combo blades (identity-mapped from BLADE_NAME_MAP)
  "Blast": "T0.5",            // CX-07 main blade Blast competitive
  "Sol Brave": "T0.5",        // CX-01 (Dran Brave equivalent tier)

  "Bear Scratch": "T6",
  "Leon Claw": "T6",
  "Rhino Horn": "T6",
  "Samurai Steel": "T6",
  "Shinobi Knife": "T6",
  "Shinobi Shadow": "T6",
};

/**
 * Resolve a blade's tier, falling back to its similar blade's tier
 * for collab/special blades that share the same mold (e.g. Spider-Man → Viper Tail's tier).
 */
export function getBladeTierResolved(bladeName: string): string | undefined {
  // Direct lookup first
  if (bladeTiers[bladeName]) return bladeTiers[bladeName];
  // Fallback: find the standard blade this one is similar to
  const sim = bladeSimilarities.find(s => s.blade === bladeName);
  if (sim && bladeTiers[sim.similarTo]) return bladeTiers[sim.similarTo];
  return undefined;
}

/** Assist Blade tiers — Custom Line letter codes (full names mapped here too) */
export const assistBladeTiers: Record<string, string> = {
  // Tiers to be populated later — leave blank for now
  // Key is the assist blade full name (e.g. "Slash", "Turn", "Charge", "Heavy", "Wheel")
  // Or letter code (e.g. "S" for Slash)
};

/** Lock Chip tiers — to be populated later */
export const lockChipTiers: Record<string, string> = {
  // Tiers to be populated later
};

/** Main Blade tiers — Custom Line Original (CX-01~12) — to be populated later */
export const mainBladeTiers: Record<string, string> = {
  // Tiers to be populated later
};

/** Metal Blade tiers — Custom Line Expand (CX-13+) */
export const metalBladeTiers: Record<string, string> = {
  "Blitz": "T1",
  "Fortress": "T1",
  "Rage": "T2",
  "Whip": "T2",
  "Delta": "T1.5",
  // Future CX Expand metal blades will be added here
};

/** Over Blade tiers — Custom Line Expand (CX-13+) */
export const overBladeTiers: Record<string, string> = {
  "Break": "T1",
  "Guard": "T1",
  "Flow": "T2",
  "Outer": "T2",
  "Peak": "T1.5",
  // Future CX Expand over blades will be added here
};

export function buildPartRegistry(): Map<string, PartEntry> {
  const registry = new Map<string, PartEntry>();

  for (const product of products) {
    // For multi-bey products (Pack/Set/Collaboration with 2+ beys or extras),
    // use sub-IDs like "productId-1", "productId-2" for each bey/extras.
    // For single-bey products (including sub-items like UX-16-01), just use the product ID.
    const needsSubIds = product.beys.length > 1 || product.extras.length > 0;

    // Collect parts from each bey config
    for (let beyIndex = 0; beyIndex < product.beys.length; beyIndex++) {
      const bey = product.beys[beyIndex];
      const subId = needsSubIds
        ? `${product.id}-${beyIndex + 1}`
        : product.id;
      const container: ContainedInItem = { productId: subId, beyName: bey.name };
      if (bey.blade) {
        const key = `Blade:${bey.blade}`;
        const goShoot = getGoShootPart("Blade", bey.blade);
        if (!registry.has(key)) {
          registry.set(key, { name: bey.blade, type: "Blade", tier: (getBladeTierResolved(bey.blade) || null) as PartTier, containedIn: [container], weight: goShoot?.weight, description: goShoot?.description, attributes: goShoot?.attributes });
        } else {
          registry.get(key)!.containedIn.push(container);
        }
      }
      if (bey.assistBlade) {
        const key = `Assist Blade:${bey.assistBlade}`;
        const goShoot = getGoShootPart("Assist Blade", bey.assistBlade);
        if (!registry.has(key)) {
          registry.set(key, { name: bey.assistBlade, type: "Assist Blade", tier: (assistBladeTiers[bey.assistBlade] || null) as PartTier, containedIn: [container], weight: goShoot?.weight, description: goShoot?.description, attributes: goShoot?.attributes });
        } else {
          registry.get(key)!.containedIn.push(container);
        }
      }
      if (bey.lockChip) {
        const key = `Lock Chip:${bey.lockChip}`;
        const goShoot = getGoShootPart("Lock Chip", bey.lockChip);
        if (!registry.has(key)) {
          registry.set(key, { name: bey.lockChip, type: "Lock Chip", tier: (lockChipTiers[bey.lockChip] || null) as PartTier, containedIn: [container], weight: goShoot?.weight, description: goShoot?.description, attributes: goShoot?.attributes });
        } else {
          registry.get(key)!.containedIn.push(container);
        }
      }
      if (bey.mainBlade) {
        const key = `Main Blade:${bey.mainBlade}`;
        const goShoot = getGoShootPart("Main Blade", bey.mainBlade);
        if (!registry.has(key)) {
          registry.set(key, { name: bey.mainBlade, type: "Main Blade", tier: (mainBladeTiers[bey.mainBlade] || null) as PartTier, containedIn: [container], weight: goShoot?.weight, description: goShoot?.description, attributes: goShoot?.attributes });
        } else {
          registry.get(key)!.containedIn.push(container);
        }
      }
      if (bey.metalBlade) {
        const key = `Metal Blade:${bey.metalBlade}`;
        const goShoot = getGoShootPart("Metal Blade", bey.metalBlade);
        if (!registry.has(key)) {
          registry.set(key, { name: bey.metalBlade, type: "Metal Blade", tier: (metalBladeTiers[bey.metalBlade] || null) as PartTier, containedIn: [container], weight: goShoot?.weight, description: goShoot?.description, attributes: goShoot?.attributes });
        } else {
          registry.get(key)!.containedIn.push(container);
        }
      }
      if (bey.overBlade) {
        const key = `Over Blade:${bey.overBlade}`;
        const goShoot = getGoShootPart("Over Blade", bey.overBlade);
        if (!registry.has(key)) {
          registry.set(key, { name: bey.overBlade, type: "Over Blade", tier: (overBladeTiers[bey.overBlade] || null) as PartTier, containedIn: [container], weight: goShoot?.weight, description: goShoot?.description, attributes: goShoot?.attributes });
        } else {
          registry.get(key)!.containedIn.push(container);
        }
      }
      if (bey.ratchet) {
        const key = `Ratchet:${bey.ratchet}`;
        const goShoot = getGoShootPart("Ratchet", bey.ratchet);
        if (!registry.has(key)) {
          registry.set(key, { name: bey.ratchet, type: "Ratchet", tier: (ratchetTiers[bey.ratchet] || null) as PartTier, containedIn: [container], description: goShoot?.description });
        } else {
          registry.get(key)!.containedIn.push(container);
        }
      }
      if (bey.bit) {
        const key = `Bit:${bey.bit}`;
        const bs = bitData[bey.bit];
        if (!registry.has(key)) {
          registry.set(key, { name: bey.bit, type: "Bit", tier: (bitTiers[bey.bit] || null) as PartTier, containedIn: [container], weight: bs?.weight, description: bs?.description, attributes: bs?.attributes, burstHeight: bs?.burstHeight, burstCount: bs?.burstCount, burstTotal: bs?.burstTotal, group: bs?.group });
        } else {
          registry.get(key)!.containedIn.push(container);
        }
      }
    }
    // Collect extras — extras in Packs/Sets get sub-IDs continuing after beys
    // (e.g. UX-10-4 for the 4th item: 3 beys + 1st extra = UX-10-4)
    for (let extraIndex = 0; extraIndex < product.extras.length; extraIndex++) {
      const part = product.extras[extraIndex];
      const key = `${part.type}:${part.name}`;
      const extraSubId = needsSubIds
        ? `${product.id}-${product.beys.length + extraIndex + 1}`
        : product.id;
      const container: ContainedInItem = { productId: extraSubId };
      if (!registry.has(key)) {
        registry.set(key, { name: part.name, type: part.type, tier: null as PartTier, containedIn: [container] });
      } else {
        registry.get(key)!.containedIn.push(container);
      }
    }
  }

  // ── Enrich with color variant data from colorVariants.ts ──────────
  // colorVariants.ts provides color metadata (colorLabel, colorSlug) for
  // parts that appear in products but don't carry that info in products.ts.
  //
  // IMPORTANT: colorVariants is NOT a source of truth for product-part
  // relationships. Only products.ts determines which parts belong to which
  // products. This phase ONLY enriches existing containedIn entries with
  // color info — it NEVER adds new containedIn entries.
  //
  // Keys in colorVariants are either:
  //   - Plain blade names: "Dran Buster", "Sol Brave"
  //   - Prefixed part names: "Lock Chip:Sol", "Bit:V", "Ratchet:5-70"
  const normalizeId = (id: string) => id.replace(/-(\d+)$/, (_, d) => `-${parseInt(d, 10)}`);

  for (const [variantKey, variants] of Object.entries(colorVariants)) {
    // Derive the registry key and part type from the colorVariants key
    let registryKey: string;
    let partName: string;

    if (variantKey.includes(":")) {
      // Prefixed keys like "Lock Chip:Sol", "Bit:V", "Ratchet:5-70"
      // These already match the registry key format
      registryKey = variantKey;
      partName = variantKey.split(":").slice(1).join(":");
    } else {
      // Plain blade names
      registryKey = `Blade:${variantKey}`;
      partName = variantKey;
    }

    const entry = registry.get(registryKey);
    if (!entry) {
      // Part not in registry — it doesn't exist in any product yet.
      // Don't create ghost entries; skip entirely.
      // This can happen for community blades or data not yet in products.ts.
      if (variants.length > 0) {
        console.warn(
          `[buildPartRegistry] colorVariants key "${variantKey}" not found in registry.` +
          ` Part "${partName}" has no product entries. Add it to products.ts first.`
        );
      }
      continue;
    }

    for (const variant of variants) {
      const normalizedVariantId = normalizeId(variant.productId);
      // Find existing containedIn entry by normalized ID
      const existing = entry.containedIn.find(c => normalizeId(c.productId) === normalizedVariantId);
      if (existing) {
        // Enrich existing entry with color info from colorVariants
        existing.colorLabel = variant.colorLabel;
        existing.colorSlug = variant.colorSlug;
      } else {
        // Dev-only validation: warn when colorVariants references a productId
        // that doesn't match any containedIn entry. This means either:
        // 1. The productId in colorVariants is wrong, OR
        // 2. The product exists but doesn't actually contain this part
        // In both cases, color enrichment silently fails — not a data integrity
        // bug (Phase 2 no longer adds wrong containedIn), but worth fixing.
        if (import.meta.env.DEV) {
          const available = entry.containedIn.map(c => c.productId).join(", ");
          console.warn(
            `[buildPartRegistry] colorVariant mismatch: "${variantKey}" references productId "${variant.productId}"` +
            ` but no matching containedIn found. Available: [${available}].` +
            ` Fix colorVariants.ts or add the product to products.ts.`
          );
        }
      }
    }
  }

  return registry;
}