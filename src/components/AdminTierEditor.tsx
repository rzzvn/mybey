import { useState, useMemo, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { buildPartRegistry } from "../data/parts";
import { bladeTiers, ratchetTiers, bitTiers } from "../data/parts";
import { bladeNamesZh, bladeNamesZhTw, bitFullNames, getDualZhName } from "../data/i18n";
import PartImage from "./PartImage";
import type { PartTier } from "../data/types";
import { TIER_META, TIER_LABEL_MAP } from "../data/types";

const ALL_TIERS: string[] = TIER_META.map(t => t.code as string);
// Derive border/bg colors for drag zones — slightly different from badge colors
const TIER_BG: Record<string, string> = {
  T0: "border-red-300 bg-red-50",
  "T0.5": "border-pink-300 bg-pink-50",
  T1: "border-orange-300 bg-orange-50",
  "T1.5": "border-amber-300 bg-amber-50",
  T2: "border-yellow-300 bg-yellow-50",
  "T2.5": "border-lime-300 bg-lime-50",
  T3: "border-green-300 bg-green-50",
  "T3.5": "border-teal-300 bg-teal-50",
  T4: "border-blue-300 bg-blue-50",
  "T4.5": "border-indigo-300 bg-indigo-50",
  T5: "border-purple-300 bg-purple-50",
  "T5.5": "border-gray-300 bg-gray-50",
  T6: "border-gray-200 bg-gray-50",
  unranked: "border-gray-300 bg-gray-50",
};
const TIER_BADGE: Record<string, string> = Object.fromEntries(TIER_META.map(t => [t.code, t.color]));
// Add unranked fallback
TIER_BADGE["unranked"] = "bg-gray-100 text-gray-500 border-gray-200";

type PartTypeKey = "Blade" | "Ratchet" | "Bit";
const PART_TABS: { id: PartTypeKey; label: string }[] = [
  { id: "Blade", label: "⚔️ Blades" },
  { id: "Ratchet", label: "⚙️ Ratchets" },
  { id: "Bit", label: "🔺 Bits" },
];

interface PartItem {
  name: string;
  tier: string;
  zhName: string;
  baselineTier: string;
}

const STORAGE_KEY = "bey-tier-overrides";
interface TierOverrides { Blade: Record<string, string>; Ratchet: Record<string, string>; Bit: Record<string, string>; }
function loadOverrides(): TierOverrides { try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : { Blade: {}, Ratchet: {}, Bit: {} }; } catch { return { Blade: {}, Ratchet: {}, Bit: {} }; } }
function saveOverrides(o: TierOverrides) { localStorage.setItem(STORAGE_KEY, JSON.stringify(o)); }
function clearOverrides() { localStorage.removeItem(STORAGE_KEY); }

function buildPartsList(type: PartTypeKey, overrides: TierOverrides): PartItem[] {
  const registry = buildPartRegistry();
  const overrideMap = overrides[type];
  const baselineMap = type === "Blade" ? bladeTiers : type === "Ratchet" ? ratchetTiers : bitTiers;
  const parts: PartItem[] = [];
  const seen = new Set<string>();
  for (const [, entry] of registry) {
    if (entry.type !== type || seen.has(entry.name)) continue;
    seen.add(entry.name);
    const baseline = baselineMap[entry.name] || "unranked";
    parts.push({
      name: entry.name,
      tier: overrideMap[entry.name] || baseline,
      baselineTier: baseline,
      zhName: type === "Blade" ? getDualZhName(bladeNamesZh[entry.name] || entry.name, bladeNamesZhTw[entry.name]) : entry.name,
    });
  }
  return parts;
}

function generateExportCode(type: PartTypeKey, parts: PartItem[]): string {
  const varName = type === "Blade" ? "bladeTiers" : type === "Ratchet" ? "ratchetTiers" : "bitTiers";
  const lines = parts
    .filter(p => p.tier !== "unranked")
    .sort((a, b) => { const ai = ALL_TIERS.indexOf(a.tier), bi = ALL_TIERS.indexOf(b.tier); return ai !== bi ? ai - bi : a.name.localeCompare(b.name); })
    .map(p => `  "${p.name}": "${p.tier}",`)
    .join("\n");
  return `export const ${varName}: Record<string, string> = {\n${lines}\n};`;
}

// ─── Sortable Card ──────────────────────────────────────────

function PartCard({ part, type, selected, onSelect }: { part: PartItem; type: PartTypeKey; selected: boolean; onSelect: (name: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `${type}:${part.name}` });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const hasOverride = part.tier !== part.baselineTier;
  const hasImage = type === "Blade" || type === "Bit";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelect(part.name)}
      className={`flex flex-col items-center gap-1 p-2 rounded-lg border cursor-grab active:cursor-grabbing transition-all hover:shadow-md 
        ${hasOverride ? "border-amber-400 bg-amber-50 ring-2 ring-amber-200" : "border-gray-200 bg-white"}
        ${selected ? "ring-2 ring-blue-500 border-blue-300" : ""}
      `}
    >
      {hasImage && (
        <PartImage type={type} name={part.name} tier={part.tier === "unranked" ? null : (part.tier as PartTier)} className="w-12 h-12" />
      )}
      {type === "Ratchet" && (
        <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
          <span className="font-mono text-sm font-bold text-gray-700">{part.name}</span>
        </div>
      )}
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${TIER_BADGE[part.tier] || TIER_BADGE.unranked}`}>
        {part.tier === "unranked" ? "?" : (TIER_LABEL_MAP[part.tier] ?? part.tier)}
      </span>
      <div className="text-[11px] font-medium text-gray-900 text-center leading-tight truncate w-full" title={part.zhName}>
        {part.zhName}
      </div>
      <div className="text-[10px] text-gray-400 text-center truncate w-full" title={part.name}>
        {part.name}
        {type === "Bit" && bitFullNames[part.name] && <span className="hidden sm:inline"> — {bitFullNames[part.name]}</span>}
      </div>
    </div>
  );
}

// ─── Tier Container ────────────────────────────────────────

function TierContainer({ tier, parts, type, selectedPart, onSelectPart }: { tier: string; parts: PartItem[]; type: PartTypeKey; selectedPart: string | null; onSelectPart: (name: string) => void }) {
  const sortableIds = parts.map(p => `${type}:${p.name}`);

  return (
    <div className={`border rounded-xl p-3 ${TIER_BG[tier] || TIER_BG.unranked}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">
          {tier === "unranked" ? "❓ Unranked" : `${TIER_LABEL_MAP[tier] ?? tier}`}
        </h3>
        <span className="text-[10px] text-gray-400 bg-white/60 px-2 py-0.5 rounded-full">{parts.length}</span>
      </div>
      <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1.5 min-h-[4rem]">
          {parts.map((part) => (
            <PartCard key={part.name} part={part} type={type} selected={selectedPart === part.name} onSelect={onSelectPart} />
          ))}
          {parts.length === 0 && (
            <div className="col-span-full text-xs text-gray-300 text-center py-4 italic">Drop parts here</div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// ─── Tier Picker Popup ──────────────────────────────────────

function TierPicker({ part, onSet, onReset, onClose }: { part: PartItem; onSet: (tier: string) => void; onReset: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl p-4 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-3">
          <PartImage type="Blade" name={part.name} tier={part.tier === "unranked" ? null : (part.tier as PartTier)} className="w-12 h-12" />
          <div>
            <div className="font-bold text-gray-900">{part.zhName}</div>
            <div className="text-xs text-gray-400">{part.name}</div>
          </div>
          <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="text-xs text-gray-500 mb-2">Select tier:</div>
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {[...ALL_TIERS, "unranked"].map(tier => (
            <button
              key={tier}
              onClick={() => { onSet(tier === "unranked" ? "unranked" : tier); onClose(); }}
              className={`px-2 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                part.tier === tier
                  ? TIER_BADGE[tier] + " ring-2 ring-blue-400 ring-offset-1"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:bg-gray-50"
              }`}
            >
              {tier === "unranked" ? "Unranked" : (TIER_LABEL_MAP[tier] ?? tier)}
            </button>
          ))}
        </div>
        {part.tier !== part.baselineTier && (
          <div className="flex items-center justify-between border-t border-gray-100 pt-2">
            <span className="text-[10px] text-amber-600">Baseline: {part.baselineTier}</span>
            <button onClick={() => { onReset(); onClose(); }} className="text-xs text-amber-600 hover:text-amber-800 border border-amber-200 rounded px-2 py-1">
              ↺ Reset to baseline
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────

export default function AdminTierEditor() {
  const [activeTab, setActiveTab] = useState<PartTypeKey>("Blade");
  const [overrides, setOverrides] = useState<TierOverrides>(loadOverrides);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(() => {
    const o = loadOverrides();
    return Object.keys(o.Blade).length + Object.keys(o.Ratchet).length + Object.keys(o.Bit).length > 0;
  });

  // Build parts lists for ALL tabs (for tab counts)
  const allPartsLists = useMemo(() => ({
    Blade: buildPartsList("Blade", overrides),
    Ratchet: buildPartsList("Ratchet", overrides),
    Bit: buildPartsList("Bit", overrides),
  }), [overrides]);

  // Current tab's parts list
  const partsList = allPartsLists[activeTab];

  const [showQuickChange, setShowQuickChange] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const grouped = useMemo(() => {
    const groups: Record<string, PartItem[]> = {};
    for (const t of ALL_TIERS) groups[t] = [];
    groups["unranked"] = [];
    for (const part of partsList) {
      if (!groups[part.tier]) groups[part.tier] = [];
      groups[part.tier].push(part);
    }
    for (const tier of Object.keys(groups)) {
      groups[tier].sort((a, b) => a.zhName.localeCompare(b.zhName));
    }
    return groups;
  }, [partsList]);

  const updateTier = useCallback((partName: string, newTier: string) => {
    const baselineMap = activeTab === "Blade" ? bladeTiers : activeTab === "Ratchet" ? ratchetTiers : bitTiers;
    const baselineTier = baselineMap[partName] || "unranked";
    setOverrides(prev => {
      const next = { ...prev };
      const map = { ...prev[activeTab] };
      if (newTier === baselineTier) delete map[partName]; else map[partName] = newTier;
      next[activeTab] = map;
      saveOverrides(next);
      return next;
    });
    setHasChanges(true);
  }, [activeTab]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const activePartName = (active.id as string).split(":").slice(1).join(":");
    const overPartName = (over.id as string).includes(":") ? (over.id as string).split(":").slice(1).join(":") : "";
    const overPart = partsList.find(p => p.name === overPartName);
    if (overPart) updateTier(activePartName, overPart.tier);
  }, [partsList, updateTier]);

  const handleDragStart = useCallback((event: DragStartEvent) => { setActiveId(event.active.id as string); }, []);

  const handleResetTier = useCallback((partName: string) => {
    setOverrides(prev => {
      const next = { ...prev };
      const map = { ...prev[activeTab] };
      delete map[partName];
      next[activeTab] = map;
      saveOverrides(next);
      return next;
    });
    setHasChanges(true);
  }, [activeTab]);

  const exportCode = useMemo(() => generateExportCode(activeTab, partsList), [activeTab, partsList]);
  const handleCopy = useCallback(() => { navigator.clipboard.writeText(exportCode).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }, [exportCode]);
  const handleMarkSynced = useCallback(() => {
    if (window.confirm("Mark all changes as synced? This clears local overrides. Make sure you pasted the code into parts.ts!")) {
      clearOverrides(); setOverrides({ Blade: {}, Ratchet: {}, Bit: {} }); setHasChanges(false);
    }
  }, []);

  const overrideCount = Object.keys(overrides.Blade).length + Object.keys(overrides.Ratchet).length + Object.keys(overrides.Bit).length;
  const activePart = activeId ? partsList.find(p => `${activeTab}:${p.name}` === activeId) : null;
  const selectedPartItem = selectedPart ? partsList.find(p => p.name === selectedPart) : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold">Admin: Tier Editor</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {overrideCount > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
              {overrideCount} override{overrideCount !== 1 ? "s" : ""}
            </span>
          )}
          <button onClick={() => setShowExport(!showExport)} className="btn btn-secondary text-xs">📋 Export</button>
          <button onClick={() => setShowQuickChange(!showQuickChange)} className={`btn text-xs ${showQuickChange ? "btn-primary" : "btn-secondary"}`}>⚡ Quick Change</button>
          {hasChanges && <button onClick={handleMarkSynced} className="btn btn-secondary text-xs">✅ Synced</button>}
        </div>
      </div>

      {showExport && (
        <div className="bg-gray-900 text-green-400 rounded-xl p-4 font-mono text-xs overflow-x-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Copy into <code className="text-white">src/data/parts.ts</code>:</span>
            <button onClick={handleCopy} className="btn btn-primary text-xs">{copied ? "✓ Copied!" : "Copy"}</button>
          </div>
          <pre className="whitespace-pre">{exportCode}</pre>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {PART_TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-gray-800 text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
            {tab.label} ({allPartsLists[tab.id].length})
          </button>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-xs text-blue-700">
        <strong>Drag</strong> a card onto another card in the target tier, or <strong>click</strong> a card to pick a tier.
      </div>

      {/* Tier grid */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="space-y-3">
          {ALL_TIERS.map(tier => (
            <TierContainer key={tier} tier={tier} parts={grouped[tier] || []} type={activeTab} selectedPart={selectedPart} onSelectPart={setSelectedPart} />
          ))}
          <TierContainer tier="unranked" parts={grouped["unranked"] || []} type={activeTab} selectedPart={selectedPart} onSelectPart={setSelectedPart} />
        </div>
        <DragOverlay>
          {activePart ? <div className="opacity-80 rotate-2"><PartCard part={activePart} type={activeTab} selected={false} onSelect={() => {}} /></div> : null}
        </DragOverlay>
      </DndContext>

      {/* Quick tier change — compact list with tier buttons */}
      {showQuickChange && (
        <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-700">Quick Tier Change</h3>
            <span className="text-xs text-gray-400">{partsList.length} parts</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {(activeTab === "Blade" || activeTab === "Bit") && <th className="table-header w-12"></th>}
                  <th className="table-header">中文名</th>
                  <th className="table-header">EN</th>
                  <th className="table-header">Current</th>
                  <th className="table-header">Set Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {partsList
                  .sort((a, b) => {
                    const ai = ALL_TIERS.indexOf(a.tier), bi = ALL_TIERS.indexOf(b.tier);
                    if (ai !== bi) { if (ai === -1) return 1; if (bi === -1) return -1; return ai - bi; }
                    return a.zhName.localeCompare(b.zhName);
                  })
                  .map(part => {
                    const hasOverride = part.tier !== part.baselineTier;
                    return (
                      <tr key={part.name} className={hasOverride ? "bg-amber-50/60" : ""}>
                        {(activeTab === "Blade" || activeTab === "Bit") && (
                          <td className="table-cell">
                            <PartImage type={activeTab} name={part.name} tier={part.tier === "unranked" ? null : (part.tier as PartTier)} className="w-8 h-8" />
                          </td>
                        )}
                        <td className="table-cell text-sm font-medium truncate max-w-[120px]">{part.zhName}</td>
                        <td className="table-cell text-xs text-gray-400 truncate max-w-[100px]">{part.name}</td>
                        <td className="table-cell">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${TIER_BADGE[part.tier] || TIER_BADGE.unranked}`}>
                            {part.tier === "unranked" ? "?" : (TIER_LABEL_MAP[part.tier] ?? part.tier)}
                          </span>
                          {hasOverride && <span className="ml-1 text-[9px] text-amber-500">({part.baselineTier})</span>}
                        </td>
                        <td className="table-cell">
                          <div className="flex gap-0.5 flex-wrap">
                            {ALL_TIERS.map(tier => (
                              <button
                                key={tier}
                                onClick={() => updateTier(part.name, tier)}
                                className={`px-1 py-0.5 rounded text-[9px] font-bold border transition-colors ${
                                  part.tier === tier
                                    ? TIER_BADGE[tier] + " ring-1 ring-blue-400"
                                    : "bg-white text-gray-400 border-gray-200 hover:border-gray-400"
                                }`}
                              >
                                {TIER_LABEL_MAP[tier] || tier.replace("T0.5", "0.5").replace("T", "")}
                              </button>
                            ))}
                            <button
                              onClick={() => updateTier(part.name, "unranked")}
                              className={`px-1 py-0.5 rounded text-[9px] font-bold border transition-colors ${
                                part.tier === "unranked"
                                  ? "bg-gray-100 text-gray-500 border-gray-300 ring-1 ring-blue-400"
                                  : "bg-white text-gray-400 border-gray-200 hover:border-gray-400"
                              }`}
                            >
                              ?
                            </button>
                            {hasOverride && (
                              <button
                                onClick={() => handleResetTier(part.name)}
                                className="px-1 py-0.5 rounded text-[9px] text-amber-600 border border-amber-200 hover:bg-amber-50"
                                title={`Reset to ${part.baselineTier}`}
                              >
                                ↺
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tier picker modal */}
      {selectedPartItem && (
        <TierPicker
          part={selectedPartItem}
          onSet={(tier) => updateTier(selectedPartItem.name, tier)}
          onReset={() => handleResetTier(selectedPartItem.name)}
          onClose={() => setSelectedPart(null)}
        />
      )}
    </div>
  );
}