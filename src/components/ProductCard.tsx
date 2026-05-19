import { ExternalLink, Tag, X } from "lucide-react";
import { getDualZhName, bladeNamesZh, bladeNamesZhTw, typeLabelsZh, ui } from "../data/i18n";
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
  onSetTag,
  onRemoveTag,
  onToggleDropdown,
  openDropdown,
  dropdownRef,
}: {
  row: FlatRow;
  currentTag: ProductTag | undefined;
  onSetTag: (id: string, tag: ProductTag) => void;
  onRemoveTag: (id: string) => void;
  onToggleDropdown: (id: string) => void;
  openDropdown: string | null;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}) {
  const hasBlade = !!row.bey?.blade;

  return (
    <div className={`border border-gray-200 rounded-xl bg-white p-3 hover:shadow-md transition-shadow ${currentTag === "purchased" ? "ring-2 ring-green-400" : ""}`}>
      {/* Blade image or type icon */}
      <div className="flex justify-center mb-2">
        {hasBlade ? (
          <PartImage type="Blade" name={row.bey!.blade!} tier={getBladeTier(row.bey!.blade)} className="w-20 h-20" />
        ) : (
          <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded-lg">
            <span className="text-3xl">{typeIcons[row.type] || "📦"}</span>
          </div>
        )}
      </div>

      {/* Code + tier badge */}
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="font-mono font-semibold text-sm text-gray-900">{row.code}</span>
        <span className={`tier-badge ${tierBadgeClass(row.tier)}`}>
          {row.tier ? (typeLabelsZh[row.type] || row.tier) : "—"}
        </span>
      </div>

      {/* Product name */}
      <a
        href={`https://www.google.com/search?q=Beyblade+X+${encodeURIComponent(row.nameEn)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline leading-tight mb-0.5"
      >
        {getDualZhName(row.nameZh, row.nameZhTw)}
        <ExternalLink className="w-3 h-3 inline ml-0.5 opacity-50" />
      </a>
      <div className="text-xs text-gray-400 mb-2">{row.nameEn}</div>

      {/* Tag button */}
      <div className="relative" ref={openDropdown === row.productId ? dropdownRef : undefined}>
        <button
          onClick={() => onToggleDropdown(row.productId)}
          className={`btn text-xs w-full justify-center ${currentTag === "purchased" ? "btn-success" : currentTag === "wishlist" ? "btn-primary" : currentTag === "getting" ? "bg-yellow-500 text-white" : "btn-secondary"}`}
        >
          <Tag className="w-3 h-3" />
          {currentTag ? (currentTag === "purchased" ? ui.tagPurchased : currentTag === "wishlist" ? ui.tagWishlist : ui.tagGetting) : ui.tagProduct}
        </button>
        {openDropdown === row.productId && (
          <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
            <button
              onClick={() => { onSetTag(row.productId, "purchased"); onToggleDropdown(row.productId); }}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-green-50 text-green-700"
            >
              ✓ {ui.tagPurchased}
            </button>
            <button
              onClick={() => { onSetTag(row.productId, "wishlist"); onToggleDropdown(row.productId); }}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 text-blue-700"
            >
              ♡ {ui.tagWishlist}
            </button>
            <button
              onClick={() => { onSetTag(row.productId, "getting"); onToggleDropdown(row.productId); }}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-yellow-50 text-yellow-700"
            >
              ↗ {ui.tagGetting}
            </button>
            {currentTag && (
              <button
                onClick={() => { onRemoveTag(row.productId); onToggleDropdown(row.productId); }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 text-gray-500"
              >
                <X className="w-3 h-3 inline" /> {ui.tagNone}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}