import type { PartEntry } from "./types";

export const ratchetTiers: Record<string, string> = {
  "1-70": "T1", "9-70": "T1", "7-70": "T1", "3-60": "T1", "6-60": "T1",
  "4-50": "T2", "8-70": "T2", "5-60": "T2", "0-70": "T2", "6-70": "T2",
  "7-55": "T2", "4-55": "T2", "5-70": "T2", "4-60": "T2", "1-80": "T2", "3-70": "T2",
  "0-60": "T3", "9-80": "T3", "7-80": "T3", "M-85": "T3", "4-70": "T3",
  "0-80": "T4", "3-80": "T4", "2-60": "T4", "3-85": "T4", "9-65": "T4",
  "5-80": "T5", "4-80": "T5", "6-80": "T5", "2-70": "T5", "2-80": "T5",
};

export const bitTiers: Record<string, string> = {
  "H": "T0", "FB": "T0", "LR": "T0", "R": "T0",
  "J": "T1", "LO": "T1", "K": "T1", "L": "T1", "UN": "T1", "B": "T1", "W": "T1", "E": "T1",
  "P": "T2", "D": "T2", "FF": "T2", "I": "T2", "UF": "T2", "U": "T2", "T": "T2",
  "TK": "T2", "TP": "T2", "O": "T2", "Op": "T2", "Y": "T2", "HN": "T2",
  "F": "T3", "GR": "T3", "HT": "T3", "GN": "T3", "A": "T3", "RA": "T3",
  "LF": "T3", "Q": "T3", "N": "T3", "G": "T3", "V": "T3", "GU": "T3",
  "Z": "T3", "WW": "T3",
  "P?": "T4", "WB": "T4", "BS": "T4", "S": "T4", "C": "T4", "GF": "T4",
  "MN": "T4", "Tr": "T4",
  "M": "T5", "DB": "T5", "GB": "T5",
};

export const bladeTiers: Record<string, string> = {
  // User said they will supplement later
  // Placeholder for now
};

// Build a reverse lookup from the products data
import { products } from "./products";

export function buildPartRegistry(): Map<string, PartEntry> {
  const registry = new Map<string, PartEntry>();

  for (const product of products) {
    for (const part of product.parts) {
      const key = `${part.type}:${part.name}`;
      if (!registry.has(key)) {
        let tier: string = "T3"; // default
        if (part.type === "Ratchet") {
          tier = ratchetTiers[part.name] || "T3";
        } else if (part.type === "Bit") {
          tier = bitTiers[part.name] || "T3";
        } else if (part.type === "Blade") {
          tier = bladeTiers[part.name] || "T3";
        }
        registry.set(key, {
          name: part.name,
          type: part.type,
          tier: tier as any,
          containedIn: [product.id],
        });
      } else {
        registry.get(key)!.containedIn.push(product.id);
      }
    }
  }

  return registry;
}
