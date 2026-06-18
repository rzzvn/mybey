import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, X, Palette } from "lucide-react";
import { findProductById } from "../data/products";
import { colorVariants } from "../data/colorVariants";
import { getPartImageUrl, getPartVariantImageUrl } from "../data/partImages";
import { getSimilarBlades } from "../data/bladeSimilarities";
import { partTypeLabelsZh, ui, bladeNamesZh, bladeNamesZhTw, assistBladeCodes, getDualZhName, bitFullNames } from "../data/i18n";
import PartImage from "./PartImage";
import type { PartInfo } from "../data/types";
import { TIER_META, TIER_LABEL_MAP } from "../data/types";

function tierColor(tier: string): string {
  return TIER_META.find(t => t.code === tier)?.color ?? "bg-gray-100 text-gray-600 border-gray-200";
}

export default function PartDetailModal({ part, onClose, onNavigateToPart }: { part: PartInfo; onClose: () => void; onNavigateToPart?: (partName: string) => void }) {
  const navigate = useNavigate();
  // Track the currently selected color variant for image swapping
  const [activeColorSlug, setActiveColorSlug] = useState<string | null>(null);

  /** Navigate to the Products page with a specific product code.
   *  Uses location state to pre-fill the search and highlight the correct sub-item.
   *  For sub-items like "CX-17-2", passes the full ID so the product page
   *  can show the correct bey instead of defaulting to the first one. */
  const goToProduct = (productCode: string, subItemId?: string) => {
    onClose();
    navigate(`/products/${encodeURIComponent(productCode)}`, { state: { searchQuery: productCode, highlightProductId: subItemId || productCode } });
  };

  // Resolve product data for each containedIn entry
  const containingProducts = useMemo(() => {
    return part.containedIn
      .map((item) => {
        const product = findProductById(item.productId);
        return { item, product: product ?? null };
      })
      // Keep all entries — even those without a product match (graceful display)
  }, [part.containedIn]);

  // Get color variants for this part from colorVariants.ts
  const partVariantKey = useMemo(() => {
    return part.type === "Lock Chip"
      ? `Lock Chip:${part.name}`
      : part.type === "Bit"
      ? `Bit:${part.name}`
      : part.name;
  }, [part.type, part.name]);
  const partVariants = useMemo(() => colorVariants[partVariantKey] || [], [partVariantKey]);
  const bladeVariants = useMemo(() => {
    return part.type === "Blade" ? (colorVariants[part.name] || []) : partVariants;
  }, [part.type, part.name, partVariants]);

  // Build a lookup: productId → color variant info
  const variantLookup = useMemo(() => {
    const lookup = new Map<string, { colorLabel: string; colorSlug: string }>();
    const normalizeId = (id: string) => id.replace(/-(\d+)$/, (_, d) => '-' + parseInt(d, 10));
    for (const v of (part.type !== "Blade" ? partVariants : bladeVariants)) {
      lookup.set(normalizeId(v.productId), { colorLabel: v.colorLabel, colorSlug: v.colorSlug });
    }
    // Also enrich from containedIn items that already have color info
    for (const item of part.containedIn) {
      if (item.colorLabel && item.colorSlug && !lookup.has(normalizeId(item.productId))) {
        lookup.set(normalizeId(item.productId), { colorLabel: item.colorLabel, colorSlug: item.colorSlug });
      }
    }
    return lookup;
  }, [bladeVariants, partVariants, part.type, part.containedIn]);

  // Determine current image source based on active color variant
  const currentImageUrl = useMemo(() => {
    if (!activeColorSlug) return null;
    // Find the productId for the active color slug
    let activeProductId: string | undefined;
    for (const [pid, v] of variantLookup) {
      if (v.colorSlug === activeColorSlug) {
        activeProductId = pid;
        break;
      }
    }
    return getPartVariantImageUrl(part.type, part.name, activeColorSlug, activeProductId, 1);
  }, [activeColorSlug, part.name, part.type, variantLookup]);

  const baseImageUrl = part.type === "Blade" ? getPartImageUrl(part.type, part.name) : null;

  // Count how many entries have color variants
  const colorVariantCount = part.containedIn.filter(
    (item) => variantLookup.has(item.productId) && variantLookup.get(item.productId)!.colorSlug !== "standard"
  ).length;

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
                    {TIER_LABEL_MAP[part.tier!] ?? part.tier}
                  </span>
                )}
                {colorVariantCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-200">
                    <Palette className="w-3 h-3" />
                    {colorVariantCount} {ui.colorVariants || "variants"}
                  </span>
                )}
              </div>
              {/* Weight & attributes from go-shoot */}
              {(part.weight || part.attributes) && (
                <div className="flex items-center gap-2 mt-1.5">
                  {part.weight && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                      ⚖️ {part.weight}
                    </span>
                  )}
                  {part.attributes && part.attributes.length > 0 && (
                    <span className="inline-flex items-center gap-1">
                      {part.attributes.map((attr, i) => (
                        <span key={i} className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${
                          attr === "att" ? "bg-red-50 text-red-600 border-red-200" :
                          attr === "def" ? "bg-blue-50 text-blue-600 border-blue-200" :
                          attr === "sta" ? "bg-green-50 text-green-600 border-green-200" :
                          attr === "bal" ? "bg-purple-50 text-purple-600 border-purple-200" :
                          "bg-gray-50 text-gray-600 border-gray-200"
                        }`}>
                          {attr}
                        </span>
                      ))}
                    </span>
                  )}
                </div>
              )}
              {/* Description from go-shoot */}
              {part.description && (
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">{part.description}</p>
              )}
              {/* Bit-specific stats */}
              {(part.burstHeight || part.burstCount || part.burstTotal || part.group) && (
                <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                  {part.burstHeight && <span>H={part.burstHeight}</span>}
                  {part.burstCount && <span>C={part.burstCount}</span>}
                  {part.burstTotal && <span>T={part.burstTotal}</span>}
                  {part.group && <span className="px-1.5 py-0.5 rounded-md bg-gray-100 border border-gray-200 capitalize">{part.group}</span>}
                </div>
              )}
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

          {/* Containing products */}
          <div className="border-t border-gray-100 pt-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              {ui.containsIn} <span className="text-gray-400">({part.containedIn.length})</span>
            </h3>
            <div className="space-y-1.5">
              {containingProducts
                .sort((a, b) => {
                  const aId = a.product?.id ?? a.item.productId;
                  const bId = b.product?.id ?? b.item.productId;
                  return aId.localeCompare(bId, undefined, { numeric: true });
                })
                .map(({ item, product }) => {
                const variantInfo = variantLookup.get(item.productId);
                const displayCode = product ? (item.productId !== product.id ? item.productId : product.code) : item.productId;
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
                  {/* Variant image thumbnail (or small base part image) */}
                  {variantInfo && (
                    <div className="shrink-0">
                      <img
                        src={variantInfo.colorSlug && variantInfo.colorSlug !== "standard"
                          ? getPartVariantImageUrl(part.type, part.name, variantInfo.colorSlug, item.productId, 1) ?? ""
                          : getPartImageUrl(part.type, part.name) ?? ""}
                        alt={variantInfo.colorLabel}
                        className={`w-10 h-10 object-contain rounded border ${
                          isActive ? "border-blue-400 shadow-sm" : "border-gray-200"
                        }`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = baseImageUrl || getPartImageUrl(part.type, part.name) || "";
                          (e.target as HTMLImageElement).onerror = null;
                        }}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {product ? (
                        <button
                          className="font-mono text-blue-600 hover:text-blue-800 hover:underline shrink-0 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            goToProduct(product.code, item.productId);
                          }}
                        >
                          {displayCode}
                        </button>
                      ) : (
                        <span className="font-mono text-gray-500 shrink-0">{displayCode}</span>
                      )}
                      <span className="font-medium text-gray-900 truncate">{product?.nameZh || item.productId}</span>
                      <span className="text-xs text-gray-400 hidden sm:inline truncate">{item.beyName || product?.nameEn}</span>
                    </div>
                    {item.beyName && (
                      <div className="text-xs text-gray-400 mt-0.5 truncate">{item.beyName}</div>
                    )}
                    {product?.remarks && (
                      <div className="text-[10px] text-gray-400 mt-0.5 truncate italic">{product.remarks}</div>
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
        </div>
      </div>
    </div>
  );
}