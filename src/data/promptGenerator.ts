/**
 * Generate a text prompt from owned inventory data.
 * Lists all owned parts grouped by type (no tiers),
 * formatted for pasting into an AI chat to ask for deck recommendations.
 */

import { products } from "./products";
import {
  bladeNamesZh,
  bladeNamesZhTw,
  assistBladeNamesZh,
  assistBladeNamesZhTw,
  lockChipNamesZh,
  lockChipNamesZhTw,
  mainBladeNamesZh,
  mainBladeNamesZhTw,
  bitFullNames,
  getDualZhName,
} from "./i18n";
import type { TaggedItem } from "./types";

/** Compute the set of owned part keys from purchased products */
function computeOwnedPartKeys(purchased: { productId: string; product: typeof products[number] }[]): Set<string> {
  const keys = new Set<string>();
  for (const { productId, product } of purchased) {
    const subMatch = productId.match(/^(.+)-(\d+)$/);
    const isSubItem = subMatch !== null && product.type === "Pack";

    const beysToProcess = isSubItem
      ? (() => {
          const idx = parseInt(subMatch![2], 10) - 1;
          return idx >= 0 && idx < product.beys.length ? [product.beys[idx]] : product.beys;
        })()
      : product.beys;

    for (const bey of beysToProcess) {
      if (bey.blade) keys.add(`Blade:${bey.blade}`);
      if (bey.ratchet) keys.add(`Ratchet:${bey.ratchet}`);
      if (bey.bit) keys.add(`Bit:${bey.bit}`);
      if (bey.assistBlade) keys.add(`Assist Blade:${bey.assistBlade}`);
      if (bey.lockChip) keys.add(`Lock Chip:${bey.lockChip}`);
      if (bey.mainBlade) keys.add(`Main Blade:${bey.mainBlade}`);
    }

    for (const extra of product.extras) {
      keys.add(`${extra.type}:${extra.name}`);
    }
  }
  return keys;
}

export function generatePrompt(tags: TaggedItem[]): string {
  // Get purchased products
  const purchased = tags
    .filter(t => t.tag === "purchased")
    .map(t => {
      const product = products.find(p => p.id === t.productId);
      return product ? { productId: t.productId, product } : null;
    })
    .filter(Boolean) as { productId: string; product: typeof products[number] }[];

  const ownedKeys = computeOwnedPartKeys(purchased);

  // Group owned keys by type
  const ownedBlades: { name: string; zhName: string }[] = [];
  const ownedRatchets: { name: string }[] = [];
  const ownedBits: { name: string; fullName: string }[] = [];
  const ownedLockChips: { name: string; zhName: string }[] = [];
  const ownedMainBlades: { name: string; zhName: string }[] = [];
  const ownedAssistBlades: { name: string; zhName: string }[] = [];

  for (const key of ownedKeys) {
    const [type, name] = key.split(":");
    switch (type) {
      case "Blade": {
        const zhName = getDualZhName(bladeNamesZh[name] || name, bladeNamesZhTw[name]);
        ownedBlades.push({ name, zhName });
        break;
      }
      case "Ratchet": {
        ownedRatchets.push({ name });
        break;
      }
      case "Bit": {
        const fullName = bitFullNames[name] || name;
        ownedBits.push({ name, fullName });
        break;
      }
      case "Lock Chip": {
        const zhName = getDualZhName(lockChipNamesZh[name] || name, lockChipNamesZhTw[name]);
        ownedLockChips.push({ name, zhName });
        break;
      }
      case "Main Blade": {
        const zhName = getDualZhName(mainBladeNamesZh[name] || name, mainBladeNamesZhTw[name]);
        ownedMainBlades.push({ name, zhName });
        break;
      }
      case "Assist Blade": {
        const zhName = getDualZhName(assistBladeNamesZh[name] || name, assistBladeNamesZhTw[name]);
        ownedAssistBlades.push({ name, zhName });
        break;
      }
    }
  }

  // Sort alphabetically
  ownedBlades.sort((a, b) => a.name.localeCompare(b.name));
  ownedRatchets.sort((a, b) => a.name.localeCompare(b.name));
  ownedBits.sort((a, b) => a.name.localeCompare(b.name));

  // Build sections
  const sections: string[] = [];

  if (ownedBlades.length > 0) {
    sections.push("**Blades:**\n" + ownedBlades.map(b =>
      `- ${b.name} (${b.zhName})`
    ).join("\n"));
  }

  if (ownedRatchets.length > 0) {
    sections.push("**Ratchets:**\n" + ownedRatchets.map(r =>
      `- ${r.name}`
    ).join("\n"));
  }

  if (ownedBits.length > 0) {
    sections.push("**Bits:**\n" + ownedBits.map(b =>
      `- ${b.name} — ${b.fullName}`
    ).join("\n"));
  }

  if (ownedLockChips.length > 0) {
    sections.push("**Lock Chips:**\n" + ownedLockChips.map(lc =>
      `- ${lc.name} (${lc.zhName})`
    ).join("\n"));
  }

  if (ownedMainBlades.length > 0) {
    sections.push("**Main Blades:**\n" + ownedMainBlades.map(mb =>
      `- ${mb.name} (${mb.zhName})`
    ).join("\n"));
  }

  if (ownedAssistBlades.length > 0) {
    sections.push("**Assist Blades:**\n" + ownedAssistBlades.map(ab =>
      `- ${ab.name} (${ab.zhName})`
    ).join("\n"));
  }

  if (sections.length === 0) {
    return "I don't own any Beyblade X parts yet. What should I buy first to build a competitive deck?";
  }

  const header = `I have the following Beyblade X parts in my collection:\n`;
  const footer = `\nWhat is the best deck/combo I can build with these parts? Please suggest the strongest combination considering tier synergies, attack/defense/stamina balance, and meta relevance.`;

  return header + sections.join("\n\n") + footer;
}