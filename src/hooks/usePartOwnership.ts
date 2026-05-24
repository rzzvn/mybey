import { useMemo } from "react";
import { useInventory } from "./useInventory";
import { findProductById, parseBeyIndex } from "../data/products";

export interface PartOwnership {
  owned: Set<string>;   // parts from "purchased" tags
  getting: Set<string>;  // parts from "getting" tags
}

/**
 * Compute which parts the user owns (purchased) vs has ordered (getting).
 * Returns two Sets keyed by "PartType:PartName" (e.g. "Blade:Cobalt Dragoon").
 * Purchased takes priority: if the same part appears in both sets,
 * only `owned` will contain it (handled downstream by ring-class logic).
 */
export function usePartOwnership(): PartOwnership {
  const { data } = useInventory();

  return useMemo(() => {
    const owned = new Set<string>();
    const getting = new Set<string>();

    for (const tag of data.tags) {
      if (tag.tag !== "purchased" && tag.tag !== "getting") continue;
      const product = findProductById(tag.productId);
      if (!product) continue;

      const target = tag.tag === "getting" ? getting : owned;
      const beyIndex = parseBeyIndex(tag.productId);
      const beys = beyIndex !== null && beyIndex < product.beys.length
        ? [product.beys[beyIndex]]
        : product.beys;

      for (const bey of beys) {
        if (bey.blade) target.add(`Blade:${bey.blade}`);
        if (bey.ratchet) target.add(`Ratchet:${bey.ratchet}`);
        if (bey.bit) target.add(`Bit:${bey.bit}`);
        if (bey.assistBlade) target.add(`Assist Blade:${bey.assistBlade}`);
        if (bey.lockChip) target.add(`Lock Chip:${bey.lockChip}`);
        if (bey.mainBlade) target.add(`Main Blade:${bey.mainBlade}`);
      }
      for (const extra of product.extras) {
        target.add(`${extra.type}:${extra.name}`);
      }
    }

    return { owned, getting };
  }, [data.tags]);
}

/**
 * Determine the ownership ring CSS class for a part.
 * Green = purchased (owned), Amber = getting (ordered), none = not owned.
 * Purchased takes priority over getting.
 */
export function getOwnershipRingClass(owned: boolean, ordered: boolean): string {
  if (owned) return "ring-2 ring-green-400 ring-offset-1";
  if (ordered) return "ring-2 ring-amber-400 ring-offset-1";
  return "";
}