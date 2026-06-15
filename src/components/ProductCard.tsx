import { Tag } from "lucide-react";
import { getDualZhName, tierLabelsZh, ui, bladeNamesZh, bladeNamesZhTw } from "../data/i18n";
import { ratchetTiers, bitTiers, getBladeTierResolved } from "../data/parts";
import { usePartOwnership } from "../hooks/usePartOwnership";
import PartImage from "./PartImage";
import type { FlatRow } from "./ProductCatalog";
import type { ProductTag } from "../data/types";
import { TIER_LABEL_MAP, TIER_META } from "../data/types";

function getBladeTier(name?: string): string {
  if (!name) return "—";
  return getBladeTierResolved(name) || "—";
}
function getRatchetTier(name?: string): string {
  if (!name) return "—";
  return ratchetTiers[name] || "—";
}
function getBitTier(name?: string): string {
  if (!name) return "—";
  return bitTiers[name] || "—";
}

function partTierColor(tier: string): string {
  return TIER_META.find(t => t.code === tier)?.color ?? "bg-gray-100 text-gray-500 border-gray-200";
}

function tierBadgeClass(tier: string | null | undefined): string {
  switch (tier) {
    case "TIER0": return "tier-p0";
    case "TIER1": return "tier-p1";
    case "TIER2": return "tier-p2";
    case "BONUS": return "tier-bonus";
    default: return "tier-none";
  }
}

const typeIcons: Record<string, string> = {
  Stadium: "🏟️", Launcher: "🚀", Pass: "🎫", Accessory: "🔧",
};

export default function ProductCard({
  row,
  currentTag,
  onClick,
}: {
  row: FlatRow;
  currentTag: ProductTag | undefined;
  onClick: () => void;
}) {
  const hasBlade = !!row.bey?.blade;
  const { owned: ownedKeys, getting: gettingKeys, isExcluded } = usePartOwnership();
  // Check which parts are excluded for this product
  const productId = row.code;
  // Card view shows bey name (e.g. "Cobalt Dragoon 4-60H") instead of product name (e.g. "Cobalt Dragoon Starter")
  const displayNameZh = row.bey?.blade
    ? getDualZhName(bladeNamesZh[row.bey.blade] || row.bey.blade, bladeNamesZhTw[row.bey.blade])
    : getDualZhName(row.nameZh, row.nameZhTw);
  const displayNameEn = row.bey?.name || row.nameEn;

  return (
    <div
      className={`border border-gray-200 rounded-xl bg-white hover:shadow-md transition-shadow cursor-pointer ${currentTag === "purchased" ? "ring-2 ring-green-400" : ""}`}
      onClick={onClick}
    >
      {/* Blade image or type icon */}
      <div className="flex justify-center pt-3">
        {hasBlade ? (
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-0.5">
              <PartImage type="Blade" name={row.bey!.blade!} tier={getBladeTier(row.bey!.blade!)} colorSlug={row.colorSlug} className="w-12 h-12" />
              {row.bey!.ratchet && (
                <PartImage type="Ratchet" name={row.bey!.ratchet} tier={getRatchetTier(row.bey!.ratchet)} className="w-12 h-12" />
              )}
              {row.bey!.bit && (
                <PartImage type="Bit" name={row.bey!.bit} tier={getBitTier(row.bey!.bit)} className="w-12 h-12" />
              )}
            </div>
            <div className="flex gap-1 text-[10px] text-gray-400 mt-0.5">
              {row.bey!.lockChip && <span>LC</span>}
              {row.bey!.mainBlade && <span>MB</span>}
              {row.bey!.assistBlade && <span>AB</span>}
            </div>
          </div>
        ) : (
          <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded-lg">
            <span className="text-3xl">{typeIcons[row.type] || "📦"}</span>
          </div>
        )}
      </div>

      {/* Code + tier badge */}
      <div className="px-3 pt-2 flex items-center justify-between gap-1">
        <span className="font-mono font-semibold text-sm text-gray-900">{row.code}</span>
        <span className={`tier-badge ${tierBadgeClass(row.tier)}`}>
          {row.tier ? (tierLabelsZh[row.tier] || row.tier) : "—"}
        </span>
      </div>

      {/* Bey name (card view shows bey name, not product name) */}
      <div className="px-3 pb-2">
        <div className="text-sm font-medium text-gray-800 leading-tight truncate" title={displayNameZh}>
          {displayNameZh}
        </div>
        <div className="text-xs text-gray-400 truncate">{displayNameEn}</div>
        {/* Tiny tier badges for blade/ratchet/bit: name(tier) format */}
        {hasBlade && (
          <div className="flex items-center gap-1 mt-1 flex-wrap">
            {row.bey!.blade && getBladeTier(row.bey!.blade!) !== "—" && (
              <span className={`inline-flex items-center gap-0.5 px-1 py-0 rounded text-[9px] font-bold border ${
                isExcluded(productId, `Blade:${row.bey!.blade!}`) ? "opacity-40 pointer-events-none " :
                ownedKeys.has(`Blade:${row.bey!.blade!}`) ? "ring-1 ring-green-400 " : gettingKeys.has(`Blade:${row.bey!.blade!}`) ? "ring-1 ring-amber-400 " : ""
              }${partTierColor(getBladeTier(row.bey!.blade!))}`}>
                刃({TIER_LABEL_MAP[getBladeTier(row.bey!.blade!)] ?? getBladeTier(row.bey!.blade!)})
              </span>
            )}
            {row.bey!.ratchet && getRatchetTier(row.bey!.ratchet) !== "—" && (
              <span className={`inline-flex items-center gap-0.5 px-1 py-0 rounded text-[9px] font-bold border ${
                isExcluded(productId, `Ratchet:${row.bey!.ratchet}`) ? "opacity-40 pointer-events-none " :
                ownedKeys.has(`Ratchet:${row.bey!.ratchet}`) ? "ring-1 ring-green-400 " : gettingKeys.has(`Ratchet:${row.bey!.ratchet}`) ? "ring-1 ring-amber-400 " : ""
              }${partTierColor(getRatchetTier(row.bey!.ratchet))}`}>
                {row.bey!.ratchet}({TIER_LABEL_MAP[getRatchetTier(row.bey!.ratchet)] ?? getRatchetTier(row.bey!.ratchet)})
              </span>
            )}
            {row.bey!.bit && getBitTier(row.bey!.bit) !== "—" && (
              <span className={`inline-flex items-center gap-0.5 px-1 py-0 rounded text-[9px] font-bold border ${
                isExcluded(productId, `Bit:${row.bey!.bit}`) ? "opacity-40 pointer-events-none " :
                ownedKeys.has(`Bit:${row.bey!.bit}`) ? "ring-1 ring-green-400 " : gettingKeys.has(`Bit:${row.bey!.bit}`) ? "ring-1 ring-amber-400 " : ""
              }${partTierColor(getBitTier(row.bey!.bit))}`}>
                {row.bey!.bit}({TIER_LABEL_MAP[getBitTier(row.bey!.bit)] ?? getBitTier(row.bey!.bit)})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tag indicator */}
      {currentTag && (
        <div className="px-3 pb-2">
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
            currentTag === "purchased" ? "bg-green-100 text-green-700" :
            currentTag === "wishlist" ? "bg-blue-100 text-blue-700" :
            "bg-yellow-100 text-yellow-700"
          }`}>
            <Tag className="w-2.5 h-2.5 mr-0.5" />
            {currentTag === "purchased" ? ui.tagPurchased : currentTag === "wishlist" ? ui.tagWishlist : ui.tagGetting}
          </span>
        </div>
      )}
    </div>
  );
}