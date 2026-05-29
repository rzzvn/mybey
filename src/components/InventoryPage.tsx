import { useMemo, useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { ClipboardCopy, Check, Package, DollarSign } from "lucide-react";
import { useInventory } from "../hooks/useInventory";
import { usePartOwnership } from "../hooks/usePartOwnership";
import { products, findProductById, parseBeyIndex } from "../data/products";
import { buildPartRegistry, ratchetTiers, bitTiers, getBladeTierResolved } from "../data/parts";
import { generatePrompt } from "../data/promptGenerator";
import { getSimilarBlades } from "../data/bladeSimilarities";
import { ui, partTypeLabelsZh, getDualZhName, bladeNamesZh, bladeNamesZhTw, bitFullNames, getPartZhName } from "../data/i18n";
import PartImage from "./PartImage";
import PartDetailModal from "./PartDetailModal";
import type { ProductTag, PartTier, PartInfo } from "../data/types";
import { TIER_META, TIER_LABEL_MAP, TIER_RANK_MAP, CURRENCY_SYMBOLS } from "../data/types";

function tierColor(tier: string | null | undefined): string {
  if (!tier) return "bg-gray-100 text-gray-500 border-gray-200";
  return TIER_META.find(t => t.code === tier)?.color ?? "bg-gray-100 text-gray-500 border-gray-200";
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

function getZhName(type: string, name: string): string {
  switch (type) {
    case "Blade": return getDualZhName(bladeNamesZh[name] || name, bladeNamesZhTw[name]);
    case "Assist Blade": return name;
    case "Metal Blade": return name;
    case "Over Blade": return name;
    case "Lock Chip": return name;
    case "Main Blade": return name;
    case "Bit": return name;
    default: return name;
  }
}

function getTierForPart(type: string, name: string): PartTier {
  switch (type) {
    case "Blade": return (getBladeTierResolved(name) as PartTier) || null;
    case "Assist Blade": return null;
    case "Ratchet": return (ratchetTiers[name] as PartTier) || null;
    case "Bit": return (bitTiers[name] as PartTier) || null;
    default: return null;
  }
}

interface UniquePart {
  key: string;
  name: string;
  zhName: string;
  type: string;
  tier: PartTier;
  colorSlug?: string;
  colorLabel?: string;
  sources: { code: string; nameZh: string }[];
}

/**
 * Parse a sub-item productId like "BX-27-2" to find which bey index it refers to.
 * Returns the 0-based index of the bey within the parent product's beys array.
 * Returns null if the productId is a parent (no sub-index) or cannot be parsed.
 * Uses parseBeyIndex from products.ts.
 */

/** Find a product by ID, handling sub-item IDs like "BX-27-1" by falling back to the parent "BX-27" */
function extractPartsForTag(productId: string, product: typeof products[number]): UniquePart[] {
  const parts: UniquePart[] = [];
  const seen = new Set<string>();
  const sourceInfo = { code: product.code, nameZh: product.nameZh };
  const add = (type: string, name: string, colorSlug?: string, colorLabel?: string) => {
    if (!name) return;
    // For blades, include colorSlug in the key so different variants appear as separate rows
    const key = type === "Blade" && colorSlug && colorSlug !== "standard"
      ? `${type}:${name}__${colorSlug}`
      : `${type}:${name}`;
    if (seen.has(key)) return;
    seen.add(key);
    parts.push({ key, name, zhName: getZhName(type, name), type, tier: getTierForPart(type, name), colorSlug: type === "Blade" ? colorSlug : undefined, colorLabel: type === "Blade" ? colorLabel : undefined, sources: [sourceInfo] });
  };

  const addBey = (bey: typeof product.beys[number]) => {
    if (bey.blade) add("Blade", bey.blade, bey.colorSlug, bey.colorLabel);
    if (bey.assistBlade) add("Assist Blade", bey.assistBlade);
    if (bey.ratchet) add("Ratchet", bey.ratchet);
    if (bey.bit) add("Bit", bey.bit);
    if (bey.lockChip) add("Lock Chip", bey.lockChip);
    if (bey.mainBlade) add("Main Blade", bey.mainBlade);
    if (bey.metalBlade) add("Metal Blade", bey.metalBlade);
    if (bey.overBlade) add("Over Blade", bey.overBlade);
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
  const { tag } = useParams<{ tag?: string }>();
  const { data, removeTag, moveTag, moveAllToPurchased, setCost, removeCost } = useInventory();
  const { owned: ownedKeys, getting: gettingKeys } = usePartOwnership();
  const [activeTag, setActiveTag] = useState<ProductTag | "all">("purchased");
  const [activeTab, setActiveTab] = useState<"inventory" | "spending">("inventory");
  const [selectedPart, setSelectedPart] = useState<PartInfo | null>(null);

  // Build part registry for looking up full PartInfo on click
  const partRegistry = useMemo(() => buildPartRegistry(), []);

  // Convert a PartEntry from the registry to a PartInfo (adds zhName)
  const toPartInfo = useCallback((entry: typeof partRegistry extends Map<string, infer V> ? V : never): PartInfo => {
    return { ...entry, zhName: getPartZhName(entry) };
  }, []);

  // Deep-link: set active tag from URL param
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (tag === "wishlist") setActiveTag("wishlist");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    else if (tag === "getting") setActiveTag("getting");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    else if (tag === "all") setActiveTag("all");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    else if (tag) setActiveTag("purchased");
  }, [tag]);

  // Products grouped by tag, with resolved product info
  const taggedProducts = useMemo(() => {
    const result: { productId: string; product: typeof products[number]; tagItem: typeof data.tags[number] }[] = [];
    for (const t of data.tags) {
      const product = findProductById(t.productId);
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
        } else {
          // Merge sources: add this product as a source if not already listed
          const existing = partSet.get(part.key)!;
          if (!existing.sources.some(s => s.code === part.sources[0].code)) {
            existing.sources.push(part.sources[0]);
          }
        }
      }
    }
    const tierRank = (t: PartTier): number => {
      if (!t) return 100; // unranked last
      return TIER_RANK_MAP[t] ?? 100;
    };
    return Array.from(partSet.values()).sort((a, b) => {
      const typeOrder = ["Blade", "Assist Blade", "Ratchet", "Bit"];
      const typeDiff = typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
      if (typeDiff !== 0) return typeDiff;
      // Sort by tier (T0 first, T5 last, unranked at bottom)
      const tierDiff = tierRank(a.tier) - tierRank(b.tier);
      if (tierDiff !== 0) return tierDiff;
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
  // Use normalized key (blade name only, no colorSlug) so any variant counts as "owned"
  const purchasedParts = useMemo(() => {
    const partSet = new Set<string>();
    for (const tp of productsByTag.purchased) {
      for (const part of extractPartsForTag(tp.productId, tp.product)) {
        // Normalize: for blades with colorSlug, use just the blade name
        const normalizedKey = part.type === "Blade" ? `Blade:${part.name}` : part.key;
        partSet.add(normalizedKey);
      }
    }
    return partSet;
  }, [productsByTag.purchased]);

  const tagCounts = {
    purchased: productsByTag.purchased.length,
    wishlist: productsByTag.wishlist.length,
    getting: productsByTag.getting.length,
  };

  // Copy as Prompt: generate a structured text from owned parts
  const [copyState, setCopyState] = useState<"idle" | "copied" | "empty">("idle");

  const copyAsPrompt = useCallback(() => {
    if (productsByTag.purchased.length === 0) {
      setCopyState("empty");
      setTimeout(() => setCopyState("idle"), 2000);
      return;
    }

    const prompt = generatePrompt(data.tags);
    navigator.clipboard.writeText(prompt).then(() => {
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    });
  }, [data.tags, productsByTag.purchased.length]);

  // Spending tab: products tagged purchased or getting
  const spendingProducts = useMemo(() => {
    return taggedProducts.filter(tp => tp.tagItem.tag === "purchased" || tp.tagItem.tag === "getting");
  }, [taggedProducts]);

  // Compute total spent
  const totalSpent = useMemo(() => {
    let total = 0;
    for (const tp of spendingProducts) {
      const cost = data.costs[tp.productId];
      if (cost !== undefined && cost !== null) total += cost;
    }
    return total;
  }, [spendingProducts, data.costs]);

  const currencySymbol = CURRENCY_SYMBOLS[data.currency] ?? CURRENCY_SYMBOLS.HKD;

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

      {/* Tab bar: Inventory / Track Spending */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("inventory")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "inventory"
              ? "bg-gray-800 text-white shadow-sm"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          <Package className="w-4 h-4" />
          {ui.tabInventory}
        </button>
        <button
          onClick={() => setActiveTab("spending")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "spending"
              ? "bg-gray-800 text-white shadow-sm"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          {ui.tabSpending}
        </button>
      </div>

      {activeTab === "inventory" ? (
        <>
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
          {/* "Mark all received" button for getting tab */}
          {activeTag === "getting" && productsByTag.getting.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={() => moveAllToPurchased(productsByTag.getting.map(tp => tp.productId))}
                className="btn btn-primary text-sm"
              >
                ✓ {ui.markAllReceived}
              </button>
            </div>
          )}
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
                      <div className="flex items-center gap-1.5 shrink-0">
                        {tp.tagItem.tag === "getting" && (
                          <button
                            onClick={() => moveTag(tp.productId, "purchased")}
                            className="px-2 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                            title={ui.markReceived}
                          >
                            ✓ {ui.markReceived}
                          </button>
                        )}
                        <button
                          onClick={() => removeTag(tp.productId)}
                          className="btn btn-secondary text-xs"
                          title={ui.tagNone}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Parts summary for active tag */}
          {partsForTag.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-lg font-bold flex-1">
                  {activeTag === "all" ? ui.allTags : activeTag === "purchased" ? ui.tagPurchased :
                   activeTag === "wishlist" ? ui.tagWishlist : ui.tagGetting} {ui.uniqueParts}
                </h3>
                <span className="text-sm text-gray-500">{partsForTag.length}</span>
                {(activeTag === "purchased" || activeTag === "all") && productsByTag.purchased.length > 0 && (
                  <button
                    onClick={copyAsPrompt}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      copyState === "copied"
                        ? "bg-green-100 text-green-700"
                        : copyState === "empty"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    }`}
                    title="Copy owned parts as AI prompt"
                  >
                    {copyState === "copied" ? <Check className="w-3.5 h-3.5" /> : <ClipboardCopy className="w-3.5 h-3.5" />}
                    {copyState === "copied" ? ui.copyAsPromptDone : copyState === "empty" ? ui.copyAsPromptEmpty : ui.copyAsPrompt}
                  </button>
                )}
              </div>
              {Array.from(partsByType.entries()).map(([type, parts]) => (
                <div key={type} className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-3">
                  <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900 text-sm">{partTypeLabelsZh[type] || type}</h4>
                    <span className="text-xs text-gray-500">{parts.length}</span>
                  </div>
                  <div className="divide-y divide-gray-50">
                      {parts.map((part) => {
                      // For blades, normalize key to check if any variant is already owned
                      const normalizedKey = part.type === "Blade" ? `Blade:${part.name}` : part.key;
                      const isDuplicate = activeTag !== "purchased" && purchasedParts.has(normalizedKey);
                      const isPartOwned = ownedKeys.has(normalizedKey);
                      const isPartGetting = gettingKeys.has(normalizedKey);
                        return (
                          <div
                            key={part.key}
                            className={`px-4 py-2 flex items-center justify-between gap-2 cursor-pointer hover:bg-gray-50 transition-colors ${isDuplicate ? "bg-green-50/50" : isPartOwned ? "bg-green-50/30" : isPartGetting ? "bg-amber-50/30" : ""}`}
                            onClick={() => {
                              const registryKey = `${part.type}:${part.name}`;
                              const entry = partRegistry.get(registryKey);
                              if (entry) setSelectedPart(toPartInfo(entry));
                            }}
                          >
                          <div className="flex items-center gap-2 min-w-0">
                            {(part.type === "Blade" || part.type === "Bit" || part.type === "Assist Blade") && (
                              <div className={`shrink-0 ${isPartOwned ? "ring-2 ring-green-400 ring-offset-1 rounded" : isPartGetting ? "ring-2 ring-amber-400 ring-offset-1 rounded" : ""}`}>
                                <PartImage type={part.type} name={part.name} tier={part.tier} colorSlug={part.colorSlug} className="w-8 h-8" />
                              </div>
                            )}
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 ${
                              part.tier ? tierColor(part.tier) : "bg-gray-50 text-gray-400 border-gray-200"
                            }`}>
                              {part.tier ? (TIER_LABEL_MAP[part.tier] ?? part.tier) : "—"}
                            </span>
                            {(isPartOwned || isPartGetting) && (
                              <span className={`w-2 h-2 rounded-full shrink-0 ${isPartOwned ? "bg-green-400" : "bg-amber-400"}`} title={isPartOwned ? "Owned" : "Getting"} />
                            )}
                            <span className={`text-sm font-medium truncate ${isDuplicate ? "text-green-700" : isPartOwned ? "text-green-700" : isPartGetting ? "text-amber-700" : "text-gray-900"}`}>
                              {part.zhName}
                            </span>
                            {part.colorLabel && part.colorSlug && part.colorSlug !== "standard" && (
                              <span className="text-[10px] text-gray-400 hidden sm:inline">({part.colorLabel})</span>
                            )}
                            {part.type === "Blade" && getSimilarBlades(part.name).length > 0 && (
                              <span className="text-[10px] text-blue-500 hidden sm:inline">
                                ({getSimilarBlades(part.name).map(s => s.similarTo === part.name ? s.blade : s.similarTo).join(", ")})
                              </span>
                            )}
                            {part.type === "Bit" && bitFullNames[part.name] && (
                              <span className="text-xs text-gray-400 hidden sm:inline">— {bitFullNames[part.name]}</span>
                            )}
                            <span className="text-xs text-gray-400 truncate hidden sm:inline">{part.name}</span>
                            {part.sources.length > 0 && (
                              <span className="text-[10px] text-gray-400 truncate">
                                ← {part.sources.map(s => s.code).join(", ")}
                              </span>
                            )}
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
        </>
      ) : (
        /* ===== Track Spending tab ===== */
        spendingProducts.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{ui.inventoryEmpty}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {spendingProducts.map((tp) => {
              const costValue = data.costs[tp.productId];
              return (
                <div
                  key={tp.productId}
                  className={`bg-white border rounded-xl p-4 ${tagBgColor(tp.tagItem.tag)}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-semibold text-gray-900">{tp.product.code}</span>
                        <span className="text-xs text-gray-500">·</span>
                        <span className="text-sm font-medium text-gray-700 truncate">{tp.product.nameZh}</span>
                        <span className="text-xs text-gray-400 hidden sm:inline">{tp.product.nameEn}</span>
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${tagBadge(tp.tagItem.tag)}`}>
                          {tagLabel(tp.tagItem.tag)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-sm font-medium text-gray-500">{currencySymbol}</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={costValue !== undefined && costValue !== null ? costValue : ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            removeCost(tp.productId);
                          } else {
                            const num = Number(val);
                            if (!isNaN(num) && num >= 0) {
                              setCost(tp.productId, num);
                            }
                          }
                        }}
                        placeholder={ui.costPlaceholder}
                        className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-right font-mono focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Sticky total at bottom */}
            <div className="sticky bottom-16 lg:bottom-0 bg-white border-2 border-blue-200 rounded-xl p-4 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-700">{ui.totalSpent}</span>
              <span className="text-xl font-bold text-blue-700">
                {currencySymbol} {totalSpent.toLocaleString()}
              </span>
            </div>
          </div>
        )
      )}

      {/* Part detail modal */}
      {selectedPart && (
        <PartDetailModal
          part={selectedPart}
          onClose={() => setSelectedPart(null)}
          onNavigateToPart={(bladeName) => {
            const registryKey = `Blade:${bladeName}`;
            const found = partRegistry.get(registryKey);
            if (found) setSelectedPart(toPartInfo(found));
          }}
        />
      )}
    </div>
  );
}
