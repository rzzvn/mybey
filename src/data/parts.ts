import type { PartEntry } from "./types";
import { products } from "./products";

export const ratchetTiers: Record<string, string> = {
  // T0
  "1-60": "T0", "1-50": "T0", "9-60": "T0", "7-60": "T0",
  // T1
  "1-70": "T1", "9-70": "T1", "7-70": "T1", "3-60": "T1", "6-60": "T1",
  // T2
  "4-50": "T2", "8-70": "T2", "5-60": "T2", "0-70": "T2", "6-70": "T2",
  "7-55": "T2", "4-55": "T2", "5-70": "T2", "4-60": "T2", "1-80": "T2", "3-70": "T2",
  // T3
  "0-60": "T3", "9-80": "T3", "7-80": "T3", "M-85": "T3", "4-70": "T3",
  // T4
  "0-80": "T4", "3-80": "T4", "2-60": "T4", "3-85": "T4", "9-65": "T4",
  // T5
  "5-80": "T5", "4-80": "T5", "6-80": "T5", "2-70": "T5", "2-80": "T5",
};

export const bitTiers: Record<string, string> = {
  // T0
  "H": "T0", "FB": "T0", "LR": "T0", "R": "T0",
  // T1
  "J": "T1", "LO": "T1", "K": "T1", "L": "T1", "UN": "T1", "B": "T1", "W": "T1", "E": "T1",
  // T2
  "D": "T2", "FF": "T2", "I": "T2", "UF": "T2", "U": "T2", "T": "T2",
  "TK": "T2", "TP": "T2", "O": "T2", "Op": "T2", "Y": "T2", "HN": "T2",
  // T3
  "F": "T3", "GR": "T3", "HT": "T3", "GN": "T3", "A": "T3", "RA": "T3",
  "LF": "T3", "Q": "T3", "N": "T3", "G": "T3", "V": "T3", "GU": "T3",
  "Z": "T3", "WW": "T3",
  // T4
  "P": "T4", "GF": "T4", "WB": "T4", "BS": "T4", "S": "T4", "C": "T4", "MN": "T4", "Tr": "T4",
  // T5
  "M": "T5", "DB": "T5", "GB": "T5",
};

export const bladeTiers: Record<string, string> = {
  // User said they will supplement later
};

export function buildPartRegistry(): Map<string, PartEntry> {
  const registry = new Map<string, PartEntry>();

  for (const product of products) {
    // Collect parts from each bey config
    for (const bey of product.beys) {
      if (bey.blade) {
        const key = `Blade:${bey.blade}`;
        if (!registry.has(key)) {
          registry.set(key, {
            name: bey.blade,
            type: "Blade",
            tier: (bladeTiers[bey.blade] || "T3") as any,
            containedIn: [product.id],
          });
        } else {
          registry.get(key)!.containedIn.push(product.id);
        }
      }
      if (bey.ratchet) {
        const key = `Ratchet:${bey.ratchet}`;
        if (!registry.has(key)) {
          registry.set(key, {
            name: bey.ratchet,
            type: "Ratchet",
            tier: (ratchetTiers[bey.ratchet] || "T3") as any,
            containedIn: [product.id],
          });
        } else {
          registry.get(key)!.containedIn.push(product.id);
        }
      }
      if (bey.bit) {
        const key = `Bit:${bey.bit}`;
        if (!registry.has(key)) {
          registry.set(key, {
            name: bey.bit,
            type: "Bit",
            tier: (bitTiers[bey.bit] || "T3") as any,
            containedIn: [product.id],
          });
        } else {
          registry.get(key)!.containedIn.push(product.id);
        }
      }
    }
    // Collect extras
    for (const part of product.extras) {
      const key = `${part.type}:${part.name}`;
      if (!registry.has(key)) {
        registry.set(key, {
          name: part.name,
          type: part.type,
          tier: "T3" as any,
          containedIn: [product.id],
        });
      } else {
        registry.get(key)!.containedIn.push(product.id);
      }
    }
  }

  return registry;
}