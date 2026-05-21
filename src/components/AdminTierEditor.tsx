import { useState, useMemo, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type {
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { buildPartRegistry } from "../data/parts";
import {
  bladeTiers,
  ratchetTiers,
  bitTiers,
} from "../data/parts";
import {
  bladeNamesZh,
  bladeNamesZhTw,
  bitFullNames,
  getDualZhName,
} from "../data/i18n";
import PartImage from "./PartImage";
import type { PartTier } from "../data/types";

// ─── Constants ───────────────────────────────────────────

const ALL_TIERS: string[] = ["T0", "T0.5", "T1", "T1.5", "T2", "T3", "T4", "T5"];
const TIER_LABELS: Record<string, string> = {
  T0: "T0 — Meta Defining",
  "T0.5": "T0.5 — Top Tier Alt",
  T1: "T1 — Competitive",
  "T1.5": "T1.5 — Strong Alt",
  T2: "T2 — Viable",
  T3: "T3 — Casual",
  T4: "T4 — Niche",
  T5: "T5 — For Fun",
  unranked: "Unranked",
};

const TIER_COLORS: Record<string, string> = {
  T0: "border-red-300 bg-red-50",
  "T0.5": "border-pink-300 bg-pink-50",
  T1: "border-orange-300 bg-orange-50",
  "T1.5": "border-amber-300 bg-amber-50",
  T2: "border-yellow-300 bg-yellow-50",
  T3: "border-green-300 bg-green-50",
  T4: "border-blue-300 bg-blue-50",
  T5: "border-purple-300 bg-purple-50",
  unranked: "border-gray-300 bg-gray-50",
};

const TIER_BADGE_COLORS: Record<string, string> = {
  T0: "bg-red-100 text-red-700 border-red-200",
  "T0.5": "bg-pink-100 text-pink-700 border-pink-200",
  T1: "bg-orange-100 text-orange-700 border-orange-200",
  "T1.5": "bg-amber-100 text-amber-700 border-amber-200",
  T2: "bg-yellow-100 text-yellow-800 border-yellow-200",
  T3: "bg-green-100 text-green-700 border-green-200",
  T4: "bg-blue-100 text-blue-700 border-blue-200",
  T5: "bg-purple-100 text-purple-700 border-purple-200",
  unranked: "bg-gray-100 text-gray-500 border-gray-200",
};

type PartTypeKey = "Blade" | "Ratchet" | "Bit";
const PART_TABS: { id: PartTypeKey; label: string; icon: string }[] = [
  { id: "Blade", label: "Blades ⚔️", icon: "⚔️" },
  { id: "Ratchet", label: "Ratchets ⚙️", icon: "⚙️" },
  { id: "Bit", label: "Bits 🔺", icon: "🔺" },
];

interface PartItem {
  name: string;
  tier: string; // "T0" | "T0.5" | ... | "T5" | "unranked"
  zhName: string;
  baselineTier: string; // what parts.ts says
}

// ─── Local Storage ────────────────────────────────────────

const STORAGE_KEY = "bey-tier-overrides";

interface TierOverrides {
  Blade: Record<string, string>;
  Ratchet: Record<string, string>;
  Bit: Record<string, string>;
}

function loadOverrides(): TierOverrides {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { Blade: {}, Ratchet: {}, Bit: {} };
}

function saveOverrides(overrides: TierOverrides): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

function clearOverrides(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ─── Build Part Lists ─────────────────────────────────────

function buildPartsList(type: PartTypeKey, overrides: TierOverrides): PartItem[] {
  const registry = buildPartRegistry();
  const overrideMap = overrides[type];
  const baselineMap = type === "Blade" ? bladeTiers : type === "Ratchet" ? ratchetTiers : bitTiers;

  const parts: PartItem[] = [];
  const seen = new Set<string>();

  for (const [, entry] of registry) {
    if (entry.type !== type) continue;
    if (seen.has(entry.name)) continue;
    seen.add(entry.name);

    const baselineTier = baselineMap[entry.name] || "unranked";
    const effectiveTier = overrideMap[entry.name] || baselineTier;

    let zhName = entry.name;
    if (type === "Blade") {
      zhName = getDualZhName(bladeNamesZh[entry.name] || entry.name, bladeNamesZhTw[entry.name]);
    }

    parts.push({
      name: entry.name,
      tier: effectiveTier,
      baselineTier,
      zhName,
    });
  }

  return parts;
}

// ─── Sortable Card ─────────────────────────────────────────

function PartCard({ part, type }: { part: PartItem; type: PartTypeKey }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${type}:${part.name}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasOverride = part.tier !== part.baselineTier;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-2 p-2 rounded-lg border cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md ${
        hasOverride ? "border-amber-300 bg-amber-50" : "border-gray-200 bg-white"
      }`}
    >
      {(type === "Blade" || type === "Bit") && (
        <PartImage type={type} name={part.name} tier={part.tier === "unranked" ? null : (part.tier as PartTier)} className="w-10 h-10 shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-gray-900 truncate">{part.zhName}</div>
        <div className="text-xs text-gray-400 truncate">
          {part.name}
          {type === "Bit" && bitFullNames[part.name] && ` — ${bitFullNames[part.name]}`}
        </div>
      </div>
      <span className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${TIER_BADGE_COLORS[part.tier] || TIER_BADGE_COLORS.unranked}`}>
        {part.tier === "unranked" ? "?" : part.tier}
      </span>
    </div>
  );
}

// ─── Tier Container ───────────────────────────────────────

function TierContainer({ tier, parts, type }: { tier: string; parts: PartItem[]; type: PartTypeKey }) {
  const sortableIds = parts.map(p => `${type}:${p.name}`);

  return (
    <div className={`border rounded-xl p-3 ${TIER_COLORS[tier] || TIER_COLORS.unranked}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-gray-700">
          {TIER_LABELS[tier] || tier}
        </h3>
        <span className="text-xs text-gray-400 bg-white/60 px-2 py-0.5 rounded-full">{parts.length}</span>
      </div>
      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-1.5 min-h-[3rem]">
          {parts.map((part) => (
            <PartCard key={part.name} part={part} type={type} />
          ))}
          {parts.length === 0 && (
            <div className="text-xs text-gray-300 text-center py-3 italic">Drop parts here</div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// ─── Export Generator ──────────────────────────────────────

function generateExportCode(type: PartTypeKey, parts: PartItem[]): string {
  const varName = type === "Blade" ? "bladeTiers" : type === "Ratchet" ? "ratchetTiers" : "bitTiers";

  const lines = parts
    .filter(p => p.tier !== "unranked")
    .sort((a, b) => {
      const tierOrder = ALL_TIERS;
      const ai = tierOrder.indexOf(a.tier);
      const bi = tierOrder.indexOf(b.tier);
      if (ai !== bi) return ai - bi;
      return a.name.localeCompare(b.name);
    })
    .map(p => `  "${p.name}": "${p.tier}",`)
    .join("\n");

  return `export const ${varName}: Record<string, string> = {\n${lines}\n};`;
}

// ─── Main Component ────────────────────────────────────────

export default function AdminTierEditor() {
  const [activeTab, setActiveTab] = useState<PartTypeKey>("Blade");
  const [overrides, setOverrides] = useState<TierOverrides>(loadOverrides);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasChanges, setHasChanges] = useState(() => {
    const o = loadOverrides();
    return Object.keys(o.Blade).length + Object.keys(o.Ratchet).length + Object.keys(o.Bit).length > 0;
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  // Build parts list from baseline + overrides
  const partsList = useMemo(() => buildPartsList(activeTab, overrides), [activeTab, overrides]);

  // Group by tier
  const grouped = useMemo(() => {
    const groups: Record<string, PartItem[]> = {};
    // Initialize all tier containers
    for (const t of ALL_TIERS) groups[t] = [];
    groups["unranked"] = [];
    for (const part of partsList) {
      const tier = part.tier;
      if (!groups[tier]) groups[tier] = [];
      groups[tier].push(part);
    }
    // Sort within each tier by name
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
      if (newTier === baselineTier) {
        // Remove override — matches baseline
        delete map[partName];
      } else {
        map[partName] = newTier;
      }
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

    // Parse the tier from the over container
    // over.id will be like "Blade:Cobalt Dragoon" or a container id like "T1-Blade"
    // We need to figure out which tier container the item was dropped into
    // dnd-kit sortable gives us the item id, we need to check where it ended up

    // Actually, for cross-container drag, we need a different approach.
    // Let's use the drag-end to detect which container the item is now over.
    const activeData = active.id as string; // "Blade:Cobalt Dragoon"
    const overData = over.id as string;

    // If dropped on another card, find that card's tier
    // If dropped on a container, use that container's tier
    const activePartName = activeData.split(":").slice(1).join(":");

    // Find the part that was dragged
    const draggedPart = partsList.find(p => p.name === activePartName);
    if (!draggedPart) return;

    // If dropped on another card, find that card's tier
    const overPartName = overData.includes(":") ? overData.split(":").slice(1).join(":") : "";
    const overPart = partsList.find(p => p.name === overPartName);

    if (overPart) {
      // Dropped on another card — move to that card's tier
      updateTier(activePartName, overPart.tier);
    }
  }, [partsList, updateTier]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  // Export code
  const exportCode = useMemo(() => {
    return generateExportCode(activeTab, partsList);
  }, [activeTab, partsList]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(exportCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [exportCode]);

  const handleMarkSynced = useCallback(() => {
    if (window.confirm("Mark all changes as synced? This will clear your local overrides. Make sure you've already pasted the exported code into parts.ts!")) {
      clearOverrides();
      setOverrides({ Blade: {}, Ratchet: {}, Bit: {} });
      setHasChanges(false);
    }
  }, []);

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

  const overrideCount = Object.keys(overrides.Blade).length + Object.keys(overrides.Ratchet).length + Object.keys(overrides.Bit).length;

  const activePart = activeId ? partsList.find(p => `${activeTab}:${p.name}` === activeId) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold">Admin: Tier Editor</h2>
        <div className="flex items-center gap-2">
          {overrideCount > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
              {overrideCount} override{overrideCount !== 1 ? "s" : ""}
            </span>
          )}
          <button onClick={() => setShowExport(!showExport)} className="btn btn-secondary text-xs">
            📋 Export to Code
          </button>
          {hasChanges && (
            <button onClick={handleMarkSynced} className="btn btn-secondary text-xs">
              ✅ Mark as Synced
            </button>
          )}
        </div>
      </div>

      {showExport && (
        <div className="bg-gray-900 text-green-400 rounded-xl p-4 font-mono text-xs overflow-x-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Copy this into <code className="text-white">src/data/parts.ts</code>:</span>
            <button onClick={handleCopy} className="btn btn-primary text-xs">
              {copied ? "✓ Copied!" : "Copy"}
            </button>
          </div>
          <pre className="whitespace-pre">{exportCode}</pre>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {PART_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-gray-800 text-white shadow-sm"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {tab.label} ({partsList.length})
          </button>
        ))}
      </div>

      {/* Drop-zone buttons — click a tier to move selected part */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
        <strong>How to change tier:</strong> Drag a card onto another card in the target tier. Or use the tier buttons below a card.
      </div>

      {/* Tier containers with DnD */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-4">
          {ALL_TIERS.map(tier => (
            <TierContainer
              key={tier}
              tier={tier}
              parts={grouped[tier] || []}
              type={activeTab}
            />
          ))}
          <TierContainer
            tier="unranked"
            parts={grouped["unranked"] || []}
            type={activeTab}
          />
        </div>

        <DragOverlay>
          {activePart ? (
            <div className="opacity-80 rotate-2">
              <PartCard part={activePart} type={activeTab} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Tier change buttons for each part — alternative to drag */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-bold text-gray-600 mb-3">Quick Tier Change (click tier to move)</h3>
        <div className="space-y-2">
          {partsList
            .filter(p => p.tier !== "unranked" || true) // show all
            .sort((a, b) => {
              const ai = ALL_TIERS.indexOf(a.tier);
              const bi = ALL_TIERS.indexOf(b.tier);
              if (ai !== bi) return ai - bi;
              return a.zhName.localeCompare(b.zhName);
            })
            .map(part => (
              <div key={part.name} className="flex items-center gap-2">
                {(activeTab === "Blade" || activeTab === "Bit") && (
                  <PartImage type={activeTab} name={part.name} tier={part.tier === "unranked" ? null : (part.tier as PartTier)} className="w-6 h-6 shrink-0" />
                )}
                <span className="text-xs font-medium text-gray-700 w-32 truncate" title={part.name}>{part.zhName}</span>
                <span className="text-xs text-gray-400 w-20 truncate hidden sm:inline">{part.name}</span>
                <div className="flex gap-1 flex-wrap">
                  {[...ALL_TIERS, "unranked"].map(tier => (
                    <button
                      key={tier}
                      onClick={() => updateTier(part.name, tier === "unranked" ? "unranked" : tier)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                        part.tier === tier
                          ? TIER_BADGE_COLORS[tier] + " ring-2 ring-offset-1 ring-blue-400"
                          : "bg-white text-gray-400 border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {tier === "unranked" ? "?" : tier.replace("T", "")}
                    </button>
                  ))}
                  {part.tier !== part.baselineTier && (
                    <button
                      onClick={() => handleResetTier(part.name)}
                      className="px-1.5 py-0.5 rounded text-[10px] text-amber-600 border border-amber-200 hover:bg-amber-50"
                      title={`Reset to baseline: ${part.baselineTier}`}
                    >
                      ↺ Reset
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}