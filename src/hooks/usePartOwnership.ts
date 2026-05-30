import { useMemo } from "react";
import { useInventory } from "./useInventory";
import { findProductById, parseBeyIndex } from "../data/products";
import type { PartOwnershipEntry, PartOwnershipResult, PartSource } from "../data/types";

/**
 * Compute which parts the user owns (purchased) vs has ordered (getting).
 * Returns enriched PartOwnershipResult with per-part source detail and
 * exclusion-aware owned/getting sets.
 *
 * Ownership = purchased tags ∪ manualParts − excludedParts
 */
export function usePartOwnership(): PartOwnershipResult {
  const { data } = useInventory();

  return useMemo(() => {
    const owned = new Set<string>();
    const getting = new Set<string>();
    const entryMap = new Map<string, PartOwnershipEntry>();

    // Build an exclusion lookup: productId → Set<partKey>
    const exclusionLookup = new Map<string, Set<string>>();
    for (const excl of data.excludedParts) {
      if (!exclusionLookup.has(excl.productId)) {
        exclusionLookup.set(excl.productId, new Set());
      }
      exclusionLookup.get(excl.productId)!.add(excl.partKey);
    }

    // Helper: add a source to an entry
    const addSource = (partKey: string, source: PartSource, targetSet: Set<string>) => {
      if (!entryMap.has(partKey)) {
        entryMap.set(partKey, { partKey, sources: [] });
      }
      const entry = entryMap.get(partKey)!;
      // Avoid duplicate sources
      const exists = entry.sources.some(
        (s) =>
          s.type === source.type &&
          s.productId === source.productId &&
          s.note === source.note
      );
      if (!exists) {
        entry.sources.push(source);
      }
      targetSet.add(partKey);
    };

    // 1. Build owned/getting from tags
    for (const tag of data.tags) {
      if (tag.tag !== "purchased" && tag.tag !== "getting") continue;
      const product = findProductById(tag.productId);
      if (!product) continue;

      const target = tag.tag === "getting" ? getting : owned;
      const beyIndex = parseBeyIndex(tag.productId);
      const beys = beyIndex !== null && beyIndex < product.beys.length
        ? [product.beys[beyIndex]]
        : product.beys;

      // Check exclusions for this productId
      const productExclusions = exclusionLookup.get(tag.productId);

      for (const bey of beys) {
        const partEntries: [string, string][] = [];
        if (bey.blade) partEntries.push(["Blade", bey.blade]);
        if (bey.ratchet) partEntries.push(["Ratchet", bey.ratchet]);
        if (bey.bit) partEntries.push(["Bit", bey.bit]);
        if (bey.assistBlade) partEntries.push(["Assist Blade", bey.assistBlade]);
        if (bey.lockChip) partEntries.push(["Lock Chip", bey.lockChip]);
        if (bey.mainBlade) partEntries.push(["Main Blade", bey.mainBlade]);
        if (bey.metalBlade) partEntries.push(["Metal Blade", bey.metalBlade]);
        if (bey.overBlade) partEntries.push(["Over Blade", bey.overBlade]);

        for (const [type, name] of partEntries) {
          const partKey = `${type}:${name}`;
          const isExcluded = productExclusions?.has(partKey) ?? false;
          if (!isExcluded) {
            addSource(partKey, { type: "product", productId: tag.productId }, target);
          }
        }
      }

      for (const extra of product.extras) {
        const partKey = `${extra.type}:${extra.name}`;
        const isExcluded = productExclusions?.has(partKey) ?? false;
        if (!isExcluded) {
          addSource(partKey, { type: "product", productId: tag.productId }, target);
        }
      }
    }

    // 2. Add manual parts to owned set
    for (const manual of data.manualParts) {
      addSource(manual.partKey, { type: "manual", note: manual.note }, owned);
    }

    // 3. Purchased takes priority over getting: remove from getting if in owned
    for (const key of owned) {
      getting.delete(key);
    }

    // Build isExcluded helper
    const isExcluded = (productId: string, partKey: string): boolean => {
      return exclusionLookup.get(productId)?.has(partKey) ?? false;
    };

    return {
      owned,
      getting,
      entries: Array.from(entryMap.values()),
      isExcluded,
    };
  }, [data.tags, data.excludedParts, data.manualParts]);
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