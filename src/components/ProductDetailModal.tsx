import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, ExternalLink, Tag, Plus } from "lucide-react";
import { getDualZhName, bladeNamesZh, bladeNamesZhTw, assistBladeCodes, overBladeCodes, tierLabelsZh, ui, bitFullNames } from "../data/i18n";
import { ratchetTiers, bitTiers, getBladeTierResolved } from "../data/parts";
import { getSimilarBlades } from "../data/bladeSimilarities";
import { usePartOwnership } from "../hooks/usePartOwnership";
import { useInventory } from "../hooks/useInventory";
import { findProductById } from "../data/products";
import PartImage from "./PartImage";
import type { FlatRow } from "./ProductCatalog";
import type { ProductTag, ProductPart } from "../data/types";
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
  return TIER_META.find(t => t.code === tier)?.color ?? "bg-gray-100 text-gray-500 border-gray-200";
}

function TierBadge({ tier }: { tier: string }) {
  if (tier === "—") return <span className="text-gray-300 text-xs">—</span>;
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold border ${partTierColor(tier)}`}>
      {TIER_LABEL_MAP[tier] ?? tier}
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

/** Ownership indicator dot — extracted to module level to avoid render-body component error. */
function OwnDot({ partType, partName, ownedKeys, gettingKeys }: {
  partType: string; partName: string;
  ownedKeys: Set<string>; gettingKeys: Set<string>;
}) {
  const key = `${partType}:${partName}`;
  const isOwned = ownedKeys.has(key);
  const isGetting = gettingKeys.has(key);
  if (!isOwned && !isGetting) return null;
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${isOwned ? "bg-green-400" : "bg-amber-400"}`}
      title={isOwned ? "Owned (purchased)" : "Getting (ordered)"}
    />
  );
}

/** Small button to add a part as loose/manual */
function AddLooseBtn({ onClick }: {
  onClick: () => void;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="p-0.5 text-gray-300 hover:text-purple-500 transition-colors"
      title={ui.addLoosePart || "Add as loose part"}
    >
      <Plus className="w-3.5 h-3.5" />
    </button>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="text-gray-400 w-16 shrink-0 text-right">{label}</span>
      <div className="flex flex-wrap items-center gap-1">{children}</div>
    </div>
  );
}

export default function ProductDetailModal({
  row,
  currentTag,
  onSetTag,
  onRemoveTag,
  onToggleDropdown,
  openDropdown,
  dropdownRef,
  comboNotesMap,
  onClose,
}: {
  row: FlatRow;
  currentTag: ProductTag | undefined;
  onSetTag: (id: string, tag: ProductTag) => void;
  onRemoveTag: (id: string) => void;
  onToggleDropdown: (id: string) => void;
  openDropdown: string | null;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  comboNotesMap: Map<string, string[]>;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const { owned: ownedKeys, getting: gettingKeys } = usePartOwnership();
  const { addManualPart } = useInventory();
  const hasBlade = !!row.bey?.blade;
  const bladeNotes = hasBlade ? (comboNotesMap.get(row.bey!.blade!) || []) : [];

  /** Add a part as a loose/manual part with source note */
  const addLoosePart = (partType: string, partName: string) => {
    addManualPart(`${partType}:${partName}`, `from ${row.code}`);
  };

  /** Navigate to the Parts page with a specific part selected */
  const goToPart = (partType: string, partName: string) => {
    onClose();
    navigate(`/parts/${encodeURIComponent(partType)}/${encodeURIComponent(partName)}`);
  };

  const modalRef = useRef<HTMLDivElement>(null);
  const tagBtnRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{top: number; left: number; width: number} | null>(null);

  // Reset dropdown position when closed
  useEffect(() => {
    if (openDropdown !== row.productId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDropdownPos(null);
    }
  }, [openDropdown, row.productId]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={handleBackdrop}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto"
      >
        {/* Header with close button */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-100 px-4 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-gray-900">{row.code}</span>
            <span className={`tier-badge ${tierBadgeClass(row.tier)}`}>
              {row.tier ? (tierLabelsZh[row.tier] || row.tier) : "—"}
            </span>
            {row.colorLabel && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 shrink-0">
                {row.colorLabel}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Part images: blade + ratchet + bit */}
        <div className="flex justify-center items-center gap-2 py-4">
          {hasBlade ? (
            <>
              <PartImage type="Blade" name={row.bey!.blade!} tier={getBladeTier(row.bey!.blade!)} colorSlug={row.colorSlug} className="w-20 h-20" />
              {row.bey!.ratchet && (
                <PartImage type="Ratchet" name={row.bey!.ratchet} tier={getRatchetTier(row.bey!.ratchet)} className="w-20 h-20" />
              )}
              {row.bey!.bit && (
                <PartImage type="Bit" name={row.bey!.bit} tier={getBitTier(row.bey!.bit)} className="w-20 h-20" />
              )}
            </>
          ) : (
            <div className="w-24 h-24 flex items-center justify-center bg-gray-100 rounded-lg">
              <span className="text-4xl">{typeIcons[row.type] || "📦"}</span>
            </div>
          )}
        </div>

        {/* Product name */}
        <div className="px-4 text-center">
          <a
            href={`https://www.google.com/search?q=Beyblade+X+${encodeURIComponent(row.nameEn)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-semibold text-blue-600 hover:text-blue-800 hover:underline leading-tight"
          >
            {getDualZhName(row.nameZh, row.nameZhTw)}
            <ExternalLink className="w-3.5 h-3.5 inline ml-1 opacity-50" />
          </a>
          <div className="text-xs text-gray-400 mt-0.5">{row.nameEn}</div>
        </div>

        {/* Product details */}
        <div className="px-4 pt-3 space-y-2">
          {/* Blade */}
          {hasBlade && (
            <DetailRow label={ui.blade}>
              <OwnDot partType="Blade" partName={row.bey!.blade!} ownedKeys={ownedKeys} gettingKeys={gettingKeys} />
              <AddLooseBtn onClick={() => addLoosePart("Blade", row.bey!.blade!)} />
              <button
                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                onClick={() => goToPart("Blade", row.bey!.blade!)}
              >
                {getDualZhName(bladeNamesZh[row.bey!.blade!] || row.bey!.blade!, bladeNamesZhTw[row.bey!.blade!])}
              </button>
              {bladeNamesZh[row.bey!.blade!] && <span className="text-xs text-gray-400">{row.bey!.blade!}</span>}
              <TierBadge tier={getBladeTier(row.bey!.blade!)} />
              {getSimilarBlades(row.bey!.blade!).length > 0 && (
                <span className="text-[10px] text-blue-500">
                  ({getSimilarBlades(row.bey!.blade!).map(s => s.similarTo === row.bey!.blade! ? getDualZhName(bladeNamesZh[s.blade] || s.blade, bladeNamesZhTw[s.blade]) : getDualZhName(bladeNamesZh[s.similarTo] || s.similarTo, bladeNamesZhTw[s.similarTo])).join(", ")})
                </span>
              )}
            </DetailRow>
          )}

          {/* Lock Chip */}
          {row.bey?.lockChip && (
            <DetailRow label={ui.lockChipLabel || "鎖芯"}>
              <OwnDot partType="Lock Chip" partName={row.bey.lockChip} ownedKeys={ownedKeys} gettingKeys={gettingKeys} />
              <AddLooseBtn onClick={() => addLoosePart("Lock Chip", row.bey!.lockChip!)} />
              <button
                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                onClick={() => goToPart("Lock Chip", row.bey!.lockChip!)}
              >
                {row.bey.lockChip}
              </button>
            </DetailRow>
          )}

          {/* Main Blade (Custom Line Original) */}
          {row.bey?.mainBlade && (
            <DetailRow label={ui.mainBladeLabel}>
              <OwnDot partType="Main Blade" partName={row.bey.mainBlade} ownedKeys={ownedKeys} gettingKeys={gettingKeys} />
              <AddLooseBtn onClick={() => addLoosePart("Main Blade", row.bey!.mainBlade!)} />
              <button
                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                onClick={() => goToPart("Main Blade", row.bey!.mainBlade!)}
              >
                {row.bey.mainBlade}
              </button>
            </DetailRow>
          )}

          {/* Metal Blade (Custom Line Expand) */}
          {row.bey?.metalBlade && (
            <DetailRow label={ui.metalBladeLabel}>
              <OwnDot partType="Metal Blade" partName={row.bey.metalBlade} ownedKeys={ownedKeys} gettingKeys={gettingKeys} />
              <AddLooseBtn onClick={() => addLoosePart("Metal Blade", row.bey!.metalBlade!)} />
              <button
                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                onClick={() => goToPart("Metal Blade", row.bey!.metalBlade!)}
              >
                {row.bey.metalBlade}
              </button>
            </DetailRow>
          )}

          {/* Over Blade (Custom Line Expand) */}
          {row.bey?.overBlade && (
            <DetailRow label={ui.overBladeLabel}>
              <OwnDot partType="Over Blade" partName={row.bey.overBlade} ownedKeys={ownedKeys} gettingKeys={gettingKeys} />
              <AddLooseBtn onClick={() => addLoosePart("Over Blade", row.bey!.overBlade!)} />
              <button
                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                onClick={() => goToPart("Over Blade", row.bey!.overBlade!)}
              >
                {row.bey.overBlade}
              </button>
              {overBladeCodes[row.bey.overBlade] && <span className="text-xs text-gray-400 ml-1">({overBladeCodes[row.bey.overBlade]})</span>}
            </DetailRow>
          )}

          {/* Assist Blade */}
          {row.bey?.assistBlade && (
            <DetailRow label={ui.assistBlade}>
              <OwnDot partType="Assist Blade" partName={row.bey.assistBlade} ownedKeys={ownedKeys} gettingKeys={gettingKeys} />
              <AddLooseBtn onClick={() => addLoosePart("Assist Blade", row.bey!.assistBlade!)} />
              <button
                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                onClick={() => goToPart("Assist Blade", row.bey!.assistBlade!)}
              >
                {row.bey.assistBlade}
              </button>
              {assistBladeCodes[row.bey.assistBlade] && <span className="text-xs text-gray-400 ml-1">({assistBladeCodes[row.bey.assistBlade]})</span>}
            </DetailRow>
          )}

          {/* Ratchet */}
          {row.bey?.ratchet && (
            <DetailRow label={ui.ratchet}>
              <OwnDot partType="Ratchet" partName={row.bey.ratchet} ownedKeys={ownedKeys} gettingKeys={gettingKeys} />
              <AddLooseBtn onClick={() => addLoosePart("Ratchet", row.bey!.ratchet!)} />
              <button
                className="font-mono text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                onClick={() => goToPart("Ratchet", row.bey!.ratchet!)}
              >
                {row.bey.ratchet}
              </button>
              <TierBadge tier={getRatchetTier(row.bey.ratchet)} />
            </DetailRow>
          )}

          {/* Bit */}
          {row.bey?.bit && (
            <DetailRow label={ui.bit}>
              <OwnDot partType="Bit" partName={row.bey.bit} ownedKeys={ownedKeys} gettingKeys={gettingKeys} />
              <AddLooseBtn onClick={() => addLoosePart("Bit", row.bey!.bit!)} />
              <button
                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                onClick={() => goToPart("Bit", row.bey!.bit!)}
              >
                {bitFullNames[row.bey.bit] || row.bey.bit}
              </button>
              <span className="text-xs text-gray-400">{row.bey.bit}</span>
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
        </div>

        {/* Tag button */}
        <div className="px-4 pt-2 pb-4">
          <div className="relative" ref={openDropdown === row.productId ? dropdownRef : undefined}>
            <button
              ref={tagBtnRef}
              onClick={(e) => {
                e.stopPropagation();
                onToggleDropdown(row.productId);
                // Calculate fixed position for dropdown after toggle
                if (tagBtnRef.current && openDropdown !== row.productId) {
                  requestAnimationFrame(() => {
                    if (!tagBtnRef.current) return;
                    const rect = tagBtnRef.current.getBoundingClientRect();
                    const top = Math.min(rect.bottom + 4, window.innerHeight - 160);
                    const left = Math.max(8, Math.min(rect.left, window.innerWidth - rect.width - 8));
                    setDropdownPos({ top, left, width: rect.width });
                  });
                }
              }}
              className={`btn text-xs w-full justify-center ${currentTag === "purchased" ? "btn-success" : currentTag === "wishlist" ? "btn-primary" : currentTag === "getting" ? "bg-yellow-500 text-white" : "btn-secondary"}`}
            >
              <Tag className="w-3 h-3" />
              {currentTag ? (currentTag === "purchased" ? ui.tagPurchased : currentTag === "wishlist" ? ui.tagWishlist : ui.tagGetting) : ui.tagProduct}
            </button>
          </div>
        </div>

        {/* Dropdown rendered as a portal-like fixed overlay outside the scroll container */}
        {openDropdown === row.productId && dropdownPos && (
          <>
            {/* Invisible backdrop to close dropdown on outside click */}
            <div
              className="fixed inset-0 z-[60]"
              onClick={(e) => { e.stopPropagation(); onToggleDropdown(row.productId); }}
            />
            <div
              className="fixed z-[70] bg-white border border-gray-200 rounded-lg shadow-lg py-1"
              style={{ top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width }}
              ref={dropdownRef}
            >
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
              {/* Tag All sub-items for multi-bey products */}
              {(() => {
                const product = findProductById(row.productId);
                if (product && product.beys.length > 1) {
                  const subIds = product.beys.map((_, i) => `${product.id}-${i + 1}`);
                  return (
                    <>
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        onClick={(e) => { e.stopPropagation(); subIds.forEach(id => onSetTag(id, "purchased")); onToggleDropdown(row.productId); }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-green-50 text-green-700 font-medium"
                      >
                        ✓ {ui.tagAllPurchased || `Tag All → ${ui.tagPurchased}`}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); subIds.forEach(id => onSetTag(id, "wishlist")); onToggleDropdown(row.productId); }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 text-blue-700 font-medium"
                      >
                        ♡ {ui.tagAllWishlist || `Tag All → ${ui.tagWishlist}`}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); subIds.forEach(id => onSetTag(id, "getting")); onToggleDropdown(row.productId); }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-yellow-50 text-yellow-700 font-medium"
                      >
                        ↗ {ui.tagAllGetting || `Tag All → ${ui.tagGetting}`}
                      </button>
                    </>
                  );
                }
                return null;
              })()}
              {currentTag && (
                <button
                  onClick={(e) => { e.stopPropagation(); onRemoveTag(row.productId); onToggleDropdown(row.productId); }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 text-gray-500"
                >
                  <X className="w-3 h-3 inline" /> {ui.tagNone}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}