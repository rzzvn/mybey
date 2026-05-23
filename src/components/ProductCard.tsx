import { Tag } from "lucide-react";
import { getDualZhName, tierLabelsZh, ui, bladeNamesZh, bladeNamesZhTw } from "../data/i18n";
import { bladeTiers } from "../data/parts";
import PartImage from "./PartImage";
import type { FlatRow } from "./ProductCatalog";
import type { ProductTag } from "../data/types";

function getBladeTier(name?: string): string {
  if (!name) return "—";
  return bladeTiers[name] || "—";
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
          <PartImage type="Blade" name={row.bey!.blade!} tier={getBladeTier(row.bey!.blade!)} colorSlug={row.colorSlug} className="w-20 h-20" />
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