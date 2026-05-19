import { ExternalLink, Tag, X, ChevronDown } from "lucide-react";
import { getDualZhName, bladeNamesZh, bladeNamesZhTw, assistBladeNamesZh, assistBladeNamesZhTw, tierLabelsZh, ui } from "../data/i18n";
import { bladeTiers, ratchetTiers, bitTiers } from "../data/parts";
import PartImage from "./PartImage";
import type { FlatRow } from "./ProductCatalog";
import type { ProductTag, ProductPart } from "../data/types";

function getBladeTier(name?: string): string {
  if (!name) return "—";
  return bladeTiers[name] || "—";
}

function getRatchetTier(name?: string): string {
  if (!name) return "—";
  return ratchetTiers[name] || "—";
}

function getBitTier(name?: string): string {
  if (!name) return "—";
  return bitTiers[name] || "—";
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

function partTierColor(tier: string): string {
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

function TierBadge({ tier }: { tier: string }) {
  if (tier === "—") return <span className="text-gray-300 text-xs">—</span>;
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold border ${partTierColor(tier)}`}>
      {tier}
    </span>
  );
}

const typeIcons: Record<string, string> = {
  Stadium: "🏟️", Launcher: "🚀", Pass: "🎫", Accessory: "🔧",
};

function ExtraPill({ part }: { part: ProductPart }) {
  const icon: Record<string, string> = {
    Stadium: "🏟️", Launcher: "🚀", Pass: "🎫", Accessory: "🔧",
  };
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200">
      {icon[part.type] || "📦"} {part.name}
    </span>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="text-gray-400 w-14 shrink-0 text-right">{label}</span>
      <div className="flex flex-wrap items-center gap-1">{children}</div>
    </div>
  );
}

export default function ProductCard({
  row,
  currentTag,
  onSetTag,
  onRemoveTag,
  onToggleDropdown,
  openDropdown,
  dropdownRef,
  expanded,
  onToggleExpand,
  comboNotesMap,
}: {
  row: FlatRow;
  currentTag: ProductTag | undefined;
  onSetTag: (id: string, tag: ProductTag) => void;
  onRemoveTag: (id: string) => void;
  onToggleDropdown: (id: string) => void;
  openDropdown: string | null;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  expanded: boolean;
  onToggleExpand: () => void;
  comboNotesMap: Map<string, string[]>;
}) {
  const hasBlade = !!row.bey?.blade;
  const bladeNotes = hasBlade ? (comboNotesMap.get(row.bey!.blade!) || []) : [];
  const bladeZh = hasBlade ? bladeNamesZh[row.bey!.blade!] : undefined;

  return (
    <div className={`border border-gray-200 rounded-xl bg-white hover:shadow-md transition-shadow ${currentTag === "purchased" ? "ring-2 ring-green-400" : ""} ${expanded ? "shadow-md" : ""}`}>
      {/* Clickable card body — expands/collapses */}
      <div
        className="p-3 cursor-pointer"
        onClick={onToggleExpand}
      >
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
            {row.tier ? (tierLabelsZh[row.tier] || row.tier) : "—"}
          </span>
        </div>

        {/* Product name */}
        <a
          href={`https://www.google.com/search?q=Beyblade+X+${encodeURIComponent(row.nameEn)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline leading-tight mb-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          {getDualZhName(row.nameZh, row.nameZhTw)}
          <ExternalLink className="w-3 h-3 inline ml-0.5 opacity-50" />
        </a>
        <div className="text-xs text-gray-400 mb-1">{row.nameEn}</div>

        {/* Expand indicator */}
        <div className="flex justify-center">
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </div>

      {/* Expanded details — accordion content */}
      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-gray-100 space-y-2">
          {/* Blade */}
          {hasBlade && (
            <DetailRow label={ui.blade}>
              <span className="text-sm font-medium text-gray-900">
                {getDualZhName(bladeNamesZh[row.bey!.blade!] || row.bey!.blade!, bladeNamesZhTw[row.bey!.blade!])}
              </span>
              {bladeZh && <span className="text-xs text-gray-400">{row.bey!.blade!}</span>}
              <TierBadge tier={getBladeTier(row.bey!.blade!)} />
            </DetailRow>
          )}

          {/* Assist Blade */}
          {row.bey?.assistBlade && (
            <DetailRow label={ui.assistBlade}>
              <span className="text-sm font-medium text-gray-900">
                {getDualZhName(assistBladeNamesZh[row.bey.assistBlade] || row.bey.assistBlade, assistBladeNamesZhTw[row.bey.assistBlade])}
              </span>
              {assistBladeNamesZh[row.bey.assistBlade] && <span className="text-xs text-gray-400">{row.bey.assistBlade}</span>}
            </DetailRow>
          )}

          {/* Ratchet */}
          {row.bey?.ratchet && (
            <DetailRow label={ui.ratchet}>
              <span className="font-mono text-sm text-gray-900">{row.bey.ratchet}</span>
              <TierBadge tier={getRatchetTier(row.bey.ratchet)} />
            </DetailRow>
          )}

          {/* Bit */}
          {row.bey?.bit && (
            <DetailRow label={ui.bit}>
              <span className="font-mono text-sm text-gray-900">{row.bey.bit}</span>
              <TierBadge tier={getBitTier(row.bey.bit)} />
            </DetailRow>
          )}

          {/* Price */}
          {row.price != null && (
            <DetailRow label={ui.price}>
              <span className="text-sm text-gray-600">¥{row.price.toLocaleString()}</span>
            </DetailRow>
          )}

          {/* Extras */}
          {row.extras.length > 0 && (
            <DetailRow label={ui.extras}>
              {row.extras.map((part, i) => (
                <ExtraPill key={i} part={part} />
              ))}
            </DetailRow>
          )}

          {/* Combo Remarks */}
          {bladeNotes.length > 0 && (
            <DetailRow label={ui.comboRemarks}>
              {bladeNotes.map((note, i) => (
                <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-medium">
                  {note}
                </span>
              ))}
            </DetailRow>
          )}

          {/* Remarks */}
          {row.remarks && (
            <DetailRow label={ui.remarks}>
              <span className="text-xs text-gray-500">{row.remarks}</span>
            </DetailRow>
          )}

          {/* Tag button */}
          <div className="pt-1">
            <div className="relative" ref={openDropdown === row.productId ? dropdownRef : undefined}>
              <button
                onClick={(e) => { e.stopPropagation(); onToggleDropdown(row.productId); }}
                className={`btn text-xs w-full justify-center ${currentTag === "purchased" ? "btn-success" : currentTag === "wishlist" ? "btn-primary" : currentTag === "getting" ? "bg-yellow-500 text-white" : "btn-secondary"}`}
              >
                <Tag className="w-3 h-3" />
                {currentTag ? (currentTag === "purchased" ? ui.tagPurchased : currentTag === "wishlist" ? ui.tagWishlist : ui.tagGetting) : ui.tagProduct}
              </button>
              {openDropdown === row.productId && (
                <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); onSetTag(row.productId, "purchased"); onToggleDropdown(row.productId); }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-green-50 text-green-700"
                  >
                    ✓ {ui.tagPurchased}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onSetTag(row.productId, "wishlist"); onToggleDropdown(row.productId); }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 text-blue-700"
                  >
                    ♡ {ui.tagWishlist}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onSetTag(row.productId, "getting"); onToggleDropdown(row.productId); }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-yellow-50 text-yellow-700"
                  >
                    ↗ {ui.tagGetting}
                  </button>
                  {currentTag && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemoveTag(row.productId); onToggleDropdown(row.productId); }}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 text-gray-500"
                    >
                      <X className="w-3 h-3 inline" /> {ui.tagNone}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}