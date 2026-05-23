import { useState, useMemo, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Search, ExternalLink, X, Palette } from "lucide-react";
import { buildPartRegistry } from "../data/parts";
import { products } from "../data/products";
import { colorVariants } from "../data/colorVariants";
import { getBladeVariantImageUrl, getBladeBaseImageUrl } from "../data/partImages";
import { getSimilarBlades } from "../data/bladeSimilarities";
import { partTypeLabelsZh, tierLabelsZh, ui, bladeNamesZh, bladeNamesZhTw, assistBladeNamesZh, assistBladeNamesZhTw, assistBladeCodes, getDualZhName, bitFullNames } from "../data/i18n";
import PartImage from "./PartImage";
import type { PartType, PartTier, ContainedInItem } from "../data/types";

function getPartZhName(part: { type: string; name: string }): string {
  switch (part.type) {
    case "Blade": return getDualZhName(bladeNamesZh[part.name] || part.name, bladeNamesZhTw[part.name]);
    case "Assist Blade": return getDualZhName(assistBladeNamesZh[part.name] || part.name, assistBladeNamesZhTw[part.name]);
    default: return part.name;
  }
}

interface PartInfo {
  type: string;
  name: string;
  zhName: string;
  tier: PartTier;
  containedIn: ContainedInItem[];
}

function PartDetailModal({ part, onClose, onNavigateToPart }: { part: PartInfo; onClose: () => void; onNavigateToPart?: (partName: string) => void }) {
  // Track the currently selected color variant for image swapping
  const [activeColorSlug, setActiveColorSlug] = useState<string | null>(null);

  // Resolve product data for each containedIn entry
  const containingProducts = useMemo(() => {
    return part.containedIn
      .map((item) => {
        // Try exact match first, then fall back to parent product ID
        let product = products.find((p) => p.id === item.productId);
        if (!product) {
          const parentId = item.productId.replace(/-\d+$/, "");
          product = products.find((p) => p.id === parentId);
        }
        return { item, product: product ?? null };
      })
      // Keep all entries — even those without a product match (graceful display)
  }, [part.containedIn]);

  // Get color variants for this blade from colorVariants.ts
  const bladeVariants = part.type === "Blade" ? (colorVariants[part.name] || []) : [];

  // Build a lookup: productId → color variant info
  const variantLookup = useMemo(() => {
    const lookup = new Map<string, { colorLabel: string; colorSlug: string }>();
    for (const v of bladeVariants) {
      lookup.set(v.productId, { colorLabel: v.colorLabel, colorSlug: v.colorSlug });
    }
    // Also enrich from containedIn items that already have color info
    for (const item of part.containedIn) {
      if (item.colorLabel && item.colorSlug && !lookup.has(item.productId)) {
        lookup.set(item.productId, { colorLabel: item.colorLabel, colorSlug: item.colorSlug });
      }
    }
    return lookup;
  }, [bladeVariants, part.containedIn]);

  // Determine current image source based on active color variant
  const currentImageUrl = useMemo(() => {
    if (!activeColorSlug || part.type !== "Blade") return null;
    return getBladeVariantImageUrl(part.name, activeColorSlug);
  }, [activeColorSlug, part.name, part.type]);

  const baseImageUrl = part.type === "Blade" ? getBladeBaseImageUrl(part.name) : null;

  // Count how many entries have color variants
  const colorVariantCount = part.containedIn.filter(
    (item) => variantLookup.has(item.productId) && variantLookup.get(item.productId)!.colorSlug !== "standard"
  ).length;

  const tierColor = (tier: string) => {
    switch (tier) {
      case "T0": return "bg-red-100 text-red-700 border-red-200";
      case "T0.5": return "bg-pink-100 text-pink-700 border-pink-200";
      case "T1": return "bg-orange-100 text-orange-700 border-orange-200";
      case "T1.5": return "bg-amber-100 text-amber-700 border-amber-200";
      case "T2": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "T3": return "bg-green-100 text-green-700 border-green-200";
      case "T4": return "bg-blue-100 text-blue-700 border-blue-200";
      case "T5": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  // Map color slug to a visual accent color for badges
  const colorAccent = (slug: string): string => {
    if (slug.includes("red") || slug.includes("crimson")) return "bg-red-100 text-red-700 border-red-200";
    if (slug.includes("blue") || slug.includes("cyan") || slug.includes("navy")) return "bg-blue-100 text-blue-700 border-blue-200";
    if (slug.includes("green")) return "bg-green-100 text-green-700 border-green-200";
    if (slug.includes("gold") || slug.includes("yellow") || slug.includes("bronze") || slug.includes("orange")) return "bg-amber-100 text-amber-700 border-amber-200";
    if (slug.includes("silver") || slug.includes("white") || slug.includes("clear")) return "bg-gray-100 text-gray-600 border-gray-300";
    if (slug.includes("violet") || slug.includes("purple") || slug.includes("pink")) return "bg-purple-100 text-purple-700 border-purple-200";
    if (slug.includes("black")) return "bg-gray-800 text-gray-100 border-gray-700";
    if (slug.includes("special") || slug.includes("holo")) return "bg-gradient-to-r from-amber-100 to-purple-100 text-purple-700 border-purple-200";
    if (slug.includes("double")) return "bg-gradient-to-r from-blue-100 to-green-100 text-green-700 border-green-200";
    return "bg-gray-100 text-gray-600 border-gray-200";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{ui.partDetail}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4">
          {/* Part header — image changes with active color variant */}
          <div className="flex items-start gap-4 mb-4">
            {(part.type === "Blade" || part.type === "Bit" || part.type === "Assist Blade") && (
              <div className="relative w-24 h-24 shrink-0">
                {activeColorSlug && currentImageUrl ? (
                  <img
                    src={currentImageUrl}
                    alt={`${part.name} — ${variantLookup.get(part.containedIn.find(c => c.colorSlug === activeColorSlug)?.productId ?? "")?.colorLabel ?? ""}`}
                    className="w-24 h-24 object-contain"
                    onError={(e) => {
                      // Fallback to base blade image if variant image doesn't exist
                      (e.target as HTMLImageElement).src = baseImageUrl!;
                      (e.target as HTMLImageElement).onerror = null;
                    }}
                  />
                ) : (
                  <PartImage type={part.type} name={part.name} tier={part.tier} className="w-24 h-24" />
                )}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                {partTypeLabelsZh[part.type] || part.type}
              </div>
              <div className="text-xl font-bold text-gray-900">{part.zhName}</div>
              <div className="text-sm text-gray-500">
                {part.name}
                {part.type === "Assist Blade" && assistBladeCodes[part.name] && (
                  <span className="ml-1 text-gray-400">({assistBladeCodes[part.name]})</span>
                )}
                {part.type === "Bit" && bitFullNames[part.name] && (
                  <span className="ml-1 text-gray-400">— {bitFullNames[part.name]}</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                {part.tier && (
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-bold border ${tierColor(part.tier)}`}>
                    {part.tier}
                  </span>
                )}
                {colorVariantCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-200">
                    <Palette className="w-3 h-3" />
                    {colorVariantCount} {ui.colorVariants || "variants"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Containing products */}
          <div className="border-t border-gray-100 pt-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              {ui.containsIn} <span className="text-gray-400">({part.containedIn.length})</span>
            </h3>
            <div className="space-y-1.5">
              {containingProducts.map(({ item, product }) => {
                const variantInfo = variantLookup.get(item.productId);
                const isSubItem = product ? item.productId !== product.id : false;
                const displayCode = isSubItem ? item.productId : (product?.code || item.productId);
                const isActive = activeColorSlug && variantInfo && variantInfo.colorSlug === activeColorSlug;

                return (
                <div
                  key={item.productId}
                  className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors group cursor-pointer ${
                    isActive ? "bg-blue-50 ring-1 ring-blue-200" : "hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    if (variantInfo) {
                      setActiveColorSlug(activeColorSlug === variantInfo.colorSlug ? null : variantInfo.colorSlug);
                    }
                  }}
                >
                  {/* Variant image thumbnail (or small base blade image) */}
                  {(part.type === "Blade" && variantInfo) && (
                    <div className="shrink-0">
                      <img
                        src={variantInfo.colorSlug && variantInfo.colorSlug !== "standard"
                          ? getBladeVariantImageUrl(part.name, variantInfo.colorSlug)
                          : getBladeBaseImageUrl(part.name)}
                        alt={variantInfo.colorLabel}
                        className={`w-10 h-10 object-contain rounded border ${
                          isActive ? "border-blue-400 shadow-sm" : "border-gray-200"
                        }`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = baseImageUrl || "";
                          (e.target as HTMLImageElement).onerror = null;
                        }}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-gray-500 shrink-0">{displayCode}</span>
                      {product && !isSubItem && <span className="font-medium text-gray-900 truncate">{product.nameZh}</span>}
                      {!product && <span className="text-xs text-gray-400 truncate">{item.productId}</span>}
                      <span className="text-xs text-gray-400 hidden sm:inline truncate">{item.beyName || product?.nameEn}</span>
                      {/* Color variant label inline */}
                      {variantInfo && variantInfo.colorSlug !== "standard" && (
                        <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded border ${colorAccent(variantInfo.colorSlug)}`}>
                          {variantInfo.colorLabel}
                        </span>
                      )}
                    </div>
                    {item.beyName && product && !isSubItem && (
                      <div className="text-xs text-gray-400 mt-0.5 truncate">{item.beyName}</div>
                    )}
                  </div>
                  {product && (
                    <a
                      href={`https://www.google.com/search?q=Beyblade+X+${encodeURIComponent(item.beyName || product.nameEn)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </a>
                  )}
                </div>
                );
              })}
            </div>
          </div>

          {/* Similar blades section */}
          {part.type === "Blade" && getSimilarBlades(part.name).length > 0 && (
            <div className="border-t border-gray-100 pt-3 mt-3">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                {ui.similarBlades}
              </h3>
              <div className="space-y-1.5">
                {getSimilarBlades(part.name).map((sim) => {
                  const simZhName = getDualZhName(bladeNamesZh[sim.similarTo] || sim.similarTo, bladeNamesZhTw[sim.similarTo]);
                  return (
                    <button
                      key={sim.similarTo}
                      className="flex items-center gap-2.5 text-sm px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                      onClick={() => {
                        if (onNavigateToPart) onNavigateToPart(sim.similarTo);
                      }}
                    >
                      <PartImage type="Blade" name={sim.similarTo} tier={null} className="w-8 h-8" />
                      <span className="font-medium text-gray-900">{simZhName}</span>
                      <span className="text-xs text-gray-400">{sim.similarTo}</span>
                      <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                        sim.status === "retooled" ? "bg-amber-100 text-amber-700 border-amber-200" :
                        sim.status === "modified" ? "bg-orange-100 text-orange-700 border-orange-200" :
                        "bg-blue-50 text-blue-600 border-blue-200"
                      }`}>
                        {sim.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PartsReference() {
  const { partType, partName } = useParams<{ partType?: string; partName?: string }>();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<PartType | "All">("All");
  const [tierFilter, setTierFilter] = useState<string>("All");
  const [selectedPart, setSelectedPart] = useState<PartInfo | null>(null);

  const registry = useMemo(() => {
    const reg = buildPartRegistry();
    return Array.from(reg.values()).filter((p) => p.type !== "Lock Chip");
  }, []);

  function searchRelevance(part: { name: string; type: string; zhName: string }, q: string): number {
    if (!q) return 2;
    const qLower = q.toLowerCase();
    const nameLower = part.name.toLowerCase();
    const zhLower = part.zhName.toLowerCase();
    const typeLower = part.type.toLowerCase();
    if (nameLower === qLower || typeLower === qLower || zhLower === qLower) return 0;
    if (nameLower.startsWith(qLower) || typeLower.startsWith(qLower) || zhLower.includes(qLower)) return 1;
    return 2;
  }

  const enriched = useMemo(() => {
    return registry.map((part) => ({
      ...part,
      zhName: getPartZhName(part),
    }));
  }, [registry]);

  // Deep-link: auto-open part detail when URL has /parts/Blade/Cobalt%20Dragoon etc.
  useEffect(() => {
    if (!partType || !partName || selectedPart) return;
    const decodedName = decodeURIComponent(partName);
    const found = enriched.find(p => p.type === partType && p.name === decodedName);
    if (found) setSelectedPart(found);
  }, [partType, partName, enriched, selectedPart]);

  const filtered = useMemo(() => {
    return enriched.filter((part) => {
      const matchesSearch =
        !search ||
        part.name.toLowerCase().includes(search.toLowerCase()) ||
        part.type.toLowerCase().includes(search.toLowerCase()) ||
        part.zhName.includes(search);
      const matchesType = typeFilter === "All" || part.type === typeFilter;
      const matchesTier = tierFilter === "All" || part.tier === tierFilter;
      return matchesSearch && matchesType && matchesTier;
    });
  }, [enriched, search, typeFilter, tierFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (search) {
        const relDiff = searchRelevance(a, search) - searchRelevance(b, search);
        if (relDiff !== 0) return relDiff;
      }
      const tierOrder = ["T0", "T0.5", "T1", "T1.5", "T2", "T3", "T4", "T5"];
      const aIdx = a.tier ? tierOrder.indexOf(a.tier) : 99;
      const bIdx = b.tier ? tierOrder.indexOf(b.tier) : 99;
      const tierDiff = aIdx - bIdx;
      if (tierDiff !== 0) return tierDiff;
      return a.name.localeCompare(b.name);
    });
  }, [filtered, search]);

  const tierColor = (tier: string) => {
    switch (tier) {
      case "T0": return "bg-red-100 text-red-700 border-red-200";
      case "T0.5": return "bg-pink-100 text-pink-700 border-pink-200";
      case "T1": return "bg-orange-100 text-orange-700 border-orange-200";
      case "T1.5": return "bg-amber-100 text-amber-700 border-amber-200";
      case "T2": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "T3": return "bg-green-100 text-green-700 border-green-200";
      case "T4": return "bg-blue-100 text-blue-700 border-blue-200";
      case "T5": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const handlePartClick = useCallback((part: typeof enriched[number]) => {
    setSelectedPart(part);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedPart(null);
  }, []);

  // Close modal on Escape
  if (typeof window !== "undefined") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useMemo(() => {
      const handler = (e: KeyboardEvent) => {
        if (e.key === "Escape") setSelectedPart(null);
      };
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }, []);
  }

  const typeTabs: { id: PartType | "All"; label: string; icon: string }[] = [
    { id: "All", label: ui.allPartTypes, icon: "📦" },
    { id: "Blade", label: partTypeLabelsZh["Blade"] || "Blade", icon: "⚔️" },
    { id: "Assist Blade", label: partTypeLabelsZh["Assist Blade"] || "Assist Blade", icon: "🗡️" },
    { id: "Ratchet", label: partTypeLabelsZh["Ratchet"] || "Ratchet", icon: "⚙️" },
    { id: "Bit", label: partTypeLabelsZh["Bit"] || "Bit", icon: "🔺" },
  ];

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { All: enriched.length };
    for (const part of enriched) {
      counts[part.type] = (counts[part.type] || 0) + 1;
    }
    return counts;
  }, [enriched]);

  const tierTabs: { id: string; label: string }[] = [
    { id: "All", label: "All Tiers" },
    ...["T0", "T0.5", "T1", "T1.5", "T2", "T3", "T4", "T5"].map((t) => ({
      id: t,
      label: `${t}${tierLabelsZh[t] ? ` - ${tierLabelsZh[t]}` : ""}`,
    })),
  ];

  return (
    <div className="space-y-4">
      {/* Search + Tier filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={ui.searchParts}
            className="search-input pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="search-input w-auto"
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
        >
          {tierTabs.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Type tabs */}
      <div className="flex gap-2 flex-wrap">
        {typeTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTypeFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              typeFilter === tab.id
                ? "bg-gray-800 text-white shadow-sm"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {tab.icon} {tab.label} ({typeCounts[tab.id] || 0})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
        {sorted.map((part) => (
          <button
            key={`${part.type}:${part.name}`}
            onClick={() => handlePartClick(part)}
            className="bg-white border border-gray-200 rounded-xl p-3 hover:shadow-md hover:border-gray-300 transition-all text-left cursor-pointer"
          >
            <div className="flex items-start gap-2.5">
              {(part.type === "Blade" || part.type === "Bit" || part.type === "Assist Blade") && (
                <PartImage type={part.type} name={part.name} tier={part.tier} className="w-12 h-12 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{partTypeLabelsZh[part.type] || part.type}</div>
                <div className="text-sm font-bold text-gray-900 truncate">{part.zhName}</div>
                <div className="text-[10px] text-gray-400 truncate">
                  {part.name}
                  {part.type === "Assist Blade" && assistBladeCodes[part.name] && ` (${assistBladeCodes[part.name]})`}
                  {part.type === "Bit" && bitFullNames[part.name] && ` — ${bitFullNames[part.name]}`}
                </div>
              </div>
              {part.tier && (
                <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded border ${tierColor(part.tier)}`}>
                  {part.tier}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="text-xs text-gray-500">
        {ui.showing} {sorted.length} 零件
      </div>

      {/* Part detail modal */}
      {selectedPart && (
        <PartDetailModal
          part={selectedPart}
          onClose={handleCloseModal}
          onNavigateToPart={(bladeName) => {
            const found = enriched.find(p => p.type === "Blade" && p.name === bladeName);
            if (found) setSelectedPart(found);
          }}
        />
      )}
    </div>
  );
}