import { useMemo, useState } from "react";
import { Package } from "lucide-react";
import { useInventory } from "../hooks/useInventory";
import { products } from "../data/products";
import { bladeTiers, ratchetTiers, bitTiers } from "../data/parts";
import {
  ui,
  bladeNamesZh,
  bladeNamesZhTw,
  assistBladeNamesZh,
  assistBladeNamesZhTw,
  partTypeLabelsZh,
  getDualZhName,
} from "../data/i18n";
import type { ProductTag, PartTier } from "../data/types";

/** Find a product by ID, handling sub-item IDs like "BX-27-1" by falling back to the parent "BX-27" */
function findProduct(productId: string) {
  const direct = products.find((p) => p.id === productId);
  if (direct) return direct;
  const parentMatch = productId.match(/^(.+)-\d+$/);
  if (parentMatch) return products.find((p) => p.id === parentMatch[1]);
  return undefined;
}

/**
 * Parse a sub-item productId like "BX-27-2" to find which bey index it refers to.
 * Returns the 0-based index of the bey within the parent product's beys array.
 * Returns null if the productId is a parent (no sub-index) or cannot be parsed.
 */
function parseBeyIndex(productId: string): number | null {
  const match = productId.match(/^.+-(\d+)$/);
  if (match) return parseInt(match[1], 10) - 1; // "BX-27-2" → index 1
  return null;
}

function tierColor(tier: string | null | undefined): string {
  switch (tier) {
    case "T0": return "bg-red-100 text-red-700 border-red-200";
    case "T0.5": return "bg-pink-100 text-pink-700 border-pink-200";
    case "T1": return "bg-orange-100 text-orange-700 border-orange-200";
    case "T1.5": return "bg-amber-100 text-amber-700 border-amber-200";
    case "T2": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "T3": return "bg-green-100 text-green-700 border-green-200";
    case "T4": return "bg-blue-100 text-blue-700 border-blue-200";
    case "T5": return "bg-purple-100 text-purple-700 border-purple-200";
    default: return "bg-gray-100 text-gray-500 border-gray-200";
  }
}

function tagBgColor(tag: ProductTag): string {
  switch (tag) {
    case "purchased": return "bg-green-50 border-green-200";
    case "wishlist": return "bg-blue-50 border-blue-200";
    case "getting": return "bg-yellow-50 border-yellow-200";
  }
}

function tagBadge(tag: ProductTag): string {
  switch (tag) {
    case "purchased": return "bg-green-100 text-green-700";
    case "wishlist": return "bg-blue-100 text-blue-700";
    case "getting": return "bg-yellow-100 text-yellow-700";
  }
}

function tagLabel(tag: ProductTag): string {
  switch (tag) {
    case "purchased": return ui.tagPurchased;
    case "wishlist": return ui.tagWishlist;
    case "getting": return ui.tagGetting;
  }
}

interface UniquePart {
  key: string;
  name: string;
  zhName: string;
  type: string;
  tier: PartTier;
}

function getZhName(type: string, name: string): string {
  switch (type) {
    case "Blade": return getDualZhName(bladeNamesZh[name] || name, bladeNamesZhTw[name]);
    case "Assist Blade": return getDualZhName(assistBladeNamesZh[name] || name, assistBladeNamesZhTw[name]);
    case "Ratchet": return name;
    case "Bit": return name;
    default: return name;
  }
}

function getTierForPart(type: string, name: string): PartTier {
  switch (type) {
    case "Blade": return (bladeTiers[name] as PartTier) || null;
    case "Assist Blade": return null;
    case "Ratchet": return (ratchetTiers[name] as PartTier) || null;
    case "Bit": return (bitTiers[name] as PartTier) || null;
    default: return null;
  }
}

/**
 * Extract unique parts from a tagged product.
 * - For Pack (random booster) sub-items like "BX-27-2": only extract parts from THAT specific bey
 * - For Set/Deck products: extract parts from ALL beys (you get all of them)
 * - For single-bey products: extract from the one bey
 */
function extractPartsForTag(productId: string, product: typeof products[number]): UniquePart[] {
  const parts: UniquePart[] = [];
  const seen = new Set<string>();
  const add = (type: string, name: string) => {
    if (!name) return;
    const key = `${type}:${name}`;
    if (seen.has(key)) return;
    seen.add(key);
    parts.push({ key, name, zhName: getZhName(type, name), type, tier: getTierForPart(type, name) });
  };

  const addBey = (bey: typeof product.beys[number]) => {
    if (bey.blade) add("Blade", bey.blade);
    if (bey.assistBlade) add("Assist Blade", bey.assistBlade);
    if (bey.ratchet) add("Ratchet", bey.ratchet);
    if (bey.bit) add("Bit", bey.bit);
  };

  const beyIndex = parseBeyIndex(productId);

  // Pack (random booster): sub-item → only that specific bey
  if (product.type === "Pack" && beyIndex !== null && beyIndex < product.beys.length) {
    addBey(product.beys[beyIndex]);
  }
  // Set/Deck/Collaboration multi-bey: you get ALL beys
  else if (product.beys.length > 0) {
    for (const bey of product.beys) {
      addBey(bey);
    }
  }

  return parts;
}

export default function InventoryPage() {
  const { data, removeTag } = useInventory();
  const [activeTag, setActiveTag] = useState<ProductTag | "all">("purchased");

  // Products grouped by tag, with resolved product info
  const taggedProducts = useMemo(() => {
    const result: { productId: string; product: typeof products[number]; tagItem: typeof data.tags[number] }[] = [];
    for (const t of data.tags) {
      const product = findProduct(t.productId);
      if (product) {
        result.push({ productId: t.productId, product, tagItem: t });
      }
    }
    return result;
  }, [data.tags]);

  const productsByTag = useMemo(() => {
    const result: Record<ProductTag, typeof taggedProducts> = {
      purchased: [],
      wishlist: [],
      getting: [],
    };
    for (const tp of taggedProducts) {
      result[tp.tagItem.tag].push(tp);
    }
    return result;
  }, [taggedProducts]);

  // All unique parts from products with the active tag (deduplicated, no counting)
  const partsForTag = useMemo(() => {
    const tagged = activeTag === "all"
      ? [...productsByTag.purchased, ...productsByTag.wishlist, ...productsByTag.getting]
      : productsByTag[activeTag];
    const partSet = new Map<string, UniquePart>();
    for (const tp of tagged) {
      for (const part of extractPartsForTag(tp.productId, tp.product)) {
        if (!partSet.has(part.key)) {
          partSet.set(part.key, part);
        }
      }
    }
    return Array.from(partSet.values()).sort((a, b) => {
      const typeOrder = ["Blade", "Assist Blade", "Ratchet", "Bit"];
      const typeDiff = typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
      if (typeDiff !== 0) return typeDiff;
      return a.name.localeCompare(b.name);
    });
  }, [productsByTag, activeTag]);

  // Group parts by type
  const partsByType = useMemo(() => {
    const groups = new Map<string, UniquePart[]>();
    for (const part of partsForTag) {
      const list = groups.get(part.type) || [];
      list.push(part);
      groups.set(part.type, list);
    }
    return groups;
  }, [partsForTag]);

  // Parts from "purchased" products (for marking duplicates in wishlist/getting)
  const purchasedParts = useMemo(() => {
    const partSet = new Set<string>();
    for (const tp of productsByTag.purchased) {
      for (const part of extractPartsForTag(tp.productId, tp.product)) {
        partSet.add(part.key);
      }
    }
    return partSet;
  }, [productsByTag.purchased]);

  const tagCounts = {
    purchased: productsByTag.purchased.length,
    wishlist: productsByTag.wishlist.length,
    getting: productsByTag.getting.length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">{ui.inventoryTitle}</h2>
        <p className="text-sm text-gray-500 mt-1">
          {ui.ownedProducts}: <span className="font-semibold text-green-600">{tagCounts.purchased}</span> ·{" "}
          {ui.tagWishlist}: <span className="font-semibold text-blue-600">{tagCounts.wishlist}</span> ·{" "}
          {ui.tagGetting}: <span className="font-semibold text-yellow-600">{tagCounts.getting}</span>
        </p>
      </div>

      {/* Tag filter tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveTag("all")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            activeTag === "all"
              ? "bg-gray-800 text-white shadow-sm"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {ui.allTags} ({tagCounts.purchased + tagCounts.wishlist + tagCounts.getting})
        </button>
        {(["purchased", "wishlist", "getting"] as ProductTag[]).map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTag === tag
                ? `${tagBadge(tag)} shadow-sm`
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {tagLabel(tag)} ({tagCounts[tag]})
          </button>
        ))}
      </div>

      {/* Products list for active tag */}
      {(activeTag === "all" ? [...productsByTag.purchased, ...productsByTag.wishlist, ...productsByTag.getting] : productsByTag[activeTag]).length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{ui.inventoryEmpty}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {(activeTag === "all" ? [...productsByTag.purchased, ...productsByTag.wishlist, ...productsByTag.getting] : productsByTag[activeTag]).map((tp) => {
            const parts = extractPartsForTag(tp.productId, tp.product);
            return (
              <div
                key={tp.productId}
                className={`bg-white border rounded-xl p-4 ${tagBgColor(tp.tagItem.tag)}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-semibold text-gray-900">{tp.product.code}</span>
                      <span className="text-xs text-gray-500">·</span>
                      <span className="text-sm font-medium text-gray-700 truncate">{tp.product.nameZh}</span>
                      <span className="text-xs text-gray-400 hidden sm:inline">{tp.product.nameEn}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {parts.slice(0, 8).map((p) => (
                        <span key={p.key} className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                          p.tier ? tierColor(p.tier) : "bg-gray-50 text-gray-400 border-gray-200"
                        }`}>
                          {p.zhName}
                        </span>
                      ))}
                      {parts.length > 8 && (
                        <span className="text-[10px] text-gray-400">+{parts.length - 8} more</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeTag(tp.productId)}
                    className="btn btn-secondary text-xs shrink-0"
                    title={ui.tagNone}
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Parts summary for active tag */}
      {partsForTag.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold">
              {activeTag === "all" ? ui.allTags : activeTag === "purchased" ? ui.tagPurchased :
               activeTag === "wishlist" ? ui.tagWishlist : ui.tagGetting} {ui.uniqueParts}
            </h3>
            <span className="text-sm text-gray-500">{partsForTag.length}</span>
          </div>
          {Array.from(partsByType.entries()).map(([type, parts]) => (
            <div key={type} className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-3">
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 text-sm">{partTypeLabelsZh[type] || type}</h4>
                <span className="text-xs text-gray-500">{parts.length}</span>
              </div>
              <div className="divide-y divide-gray-50">
                {parts.map((part) => {
                  const isDuplicate = activeTag !== "purchased" && purchasedParts.has(part.key);
                  return (
                    <div
                      key={part.key}
                      className={`px-4 py-2 flex items-center justify-between gap-2 ${isDuplicate ? "bg-green-50/50" : ""}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 ${
                          part.tier ? tierColor(part.tier) : "bg-gray-50 text-gray-400 border-gray-200"
                        }`}>
                          {part.tier || "—"}
                        </span>
                        <span className={`text-sm font-medium truncate ${isDuplicate ? "text-green-700" : "text-gray-900"}`}>
                          {part.zhName}
                        </span>
                        <span className="text-xs text-gray-400 truncate hidden sm:inline">{part.name}</span>
                        {isDuplicate && (
                          <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700">
                            {ui.alreadyOwned}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 shrink-0 hidden sm:inline">{partTypeLabelsZh[part.type] || part.type}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
