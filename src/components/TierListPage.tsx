import { useMemo, useState, useCallback } from "react";
import { buildPartRegistry } from "../data/parts";
import { partTypeLabelsZh, ui, bitFullNames, assistBladeCodes, overBladeCodes, getPartZhName } from "../data/i18n";
import { usePartOwnership } from "../hooks/usePartOwnership";
import PartImage from "./PartImage";
import PartDetailModal from "./PartDetailModal";
import type { PartTier, PartType, PartInfo } from "../data/types";
import { TIER_META, TIER_LABEL_MAP, TIER_RANK_MAP } from "../data/types";

const typeOrder: Record<string, number> = {
  Blade: 0,
  "Lock Chip": 1,
  "Main Blade": 2,
  "Metal Blade": 3,
  "Over Blade": 4,
  "Assist Blade": 5,
  Ratchet: 6,
  Bit: 7,
};

const typeIcons: Record<string, string> = {
  Blade: "⚔️",
  "Lock Chip": "🔒",
  "Main Blade": "🗡️",
  "Metal Blade": "⚙️",
  "Over Blade": "🛡️",
  Ratchet: "🔧",
  Bit: "🔺",
  "Assist Blade": "🗡️",
};

const tabTypes: PartType[] = ["Blade", "Lock Chip", "Main Blade", "Metal Blade", "Over Blade", "Assist Blade", "Ratchet", "Bit"];

export default function TierListPage() {
  const [activeTab, setActiveTab] = useState<PartType | "All">("All");
  const [selectedPart, setSelectedPart] = useState<PartInfo | null>(null);
  const { owned: ownedKeys, getting: gettingKeys } = usePartOwnership();

  const handlePartClick = useCallback((part: typeof enriched[number]) => {
    setSelectedPart({
      type: part.type,
      name: part.name,
      zhName: part.zhName,
      tier: part.tier,
      containedIn: part.containedIn,
    });
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedPart(null);
  }, []);

  const registry = useMemo(() => {
     const reg = buildPartRegistry();
    return Array.from(reg.values()).sort((a, b) => {
      const typeDiff = (typeOrder[a.type] ?? 99) - (typeOrder[b.type] ?? 99);
      if (typeDiff !== 0) return typeDiff;
      const tierDiff = (TIER_RANK_MAP[a.tier ?? ""] ?? 99) - (TIER_RANK_MAP[b.tier ?? ""] ?? 99);
      if (tierDiff !== 0) return tierDiff;
      return a.name.localeCompare(b.name);
    });
  }, []);

  const enriched = useMemo(() => {
    return registry.map((part) => ({
      ...part,
      zhName: getPartZhName(part),
    }));
  }, [registry]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof enriched> = {};
    for (const part of enriched) {
      if (!groups[part.type]) groups[part.type] = [];
      groups[part.type].push(part);
    }
    return Object.entries(groups).sort(([a], [b]) =>
      (typeOrder[a] ?? 99) - (typeOrder[b] ?? 99)
    );
  }, [enriched]);

  const filteredGroups = useMemo(() => {
    if (activeTab === "All") return grouped;
    return grouped.filter(([type]) => type === activeTab);
  }, [grouped, activeTab]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { All: enriched.length };
    for (const [type, parts] of grouped) {
      counts[type] = parts.length;
    }
    return counts;
  }, [enriched, grouped]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">{ui.tierList}</h2>

      {/* Tab bar */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveTab("All")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "All"
              ? "bg-gray-800 text-white shadow-sm"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {ui.allPartTypes} ({tabCounts.All})
        </button>
        {tabTypes.map((type) => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === type
                ? "bg-gray-800 text-white shadow-sm"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {typeIcons[type]} {partTypeLabelsZh[type] || type} ({tabCounts[type] || 0})
          </button>
        ))}
      </div>

      {/* Tables */}
      {filteredGroups.map(([type, parts]) => (
        <div key={type}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{typeIcons[type] || "📦"}</span>
            <h3 className="text-lg font-bold text-gray-900">
              {partTypeLabelsZh[type] || type}
            </h3>
            <span className="text-sm text-gray-400">({parts.length})</span>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {(type === "Blade" || type === "Bit" || type === "Assist Blade" || type === "Over Blade" || type === "Metal Blade") && <th className="table-header w-12"></th>}
                  <th className="table-header">{ui.partName}</th>
                  {(type === "Blade") && <th className="table-header">{ui.partNameEn}</th>}
                  <th className="table-header">{ui.tier}</th>
                  <th className="table-header">{ui.foundIn}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                  {parts.map((part) => {
                    const partKey = `${part.type}:${part.name}`;
                    const isOwned = ownedKeys.has(partKey);
                    const isGetting = gettingKeys.has(partKey);
                    return (
                      <tr key={partKey} className="hover:bg-gray-50/80 transition-colors cursor-pointer" onClick={() => handlePartClick(part)}>
                        {(type === "Blade" || type === "Bit" || type === "Assist Blade" || type === "Over Blade" || type === "Metal Blade") && (
                          <td className="table-cell">
                            <PartImage type={part.type} name={part.name} tier={part.tier as PartTier | null | undefined} className={`w-10 h-10 ${isOwned ? "ring-2 ring-green-400 ring-offset-1" : isGetting ? "ring-2 ring-amber-400 ring-offset-1" : ""}`} />
                          </td>
                        )}
                        <td className="table-cell font-medium">
                          {isOwned && <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-1.5" title="Owned" />}
                          {!isOwned && isGetting && <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1.5" title="Ordered" />}
                          {type === "Assist Blade" ? part.name : part.zhName}
                        {type === "Bit" && bitFullNames[part.name] && (
                          <span className="text-gray-400 ml-1">— {bitFullNames[part.name]}</span>
                        )}
                        {type === "Assist Blade" && assistBladeCodes[part.name] && (
                          <span className="text-gray-400 ml-1">({assistBladeCodes[part.name]})</span>
                        )}
                        {type === "Over Blade" && overBladeCodes[part.name] && (
                          <span className="text-gray-400 ml-1">({overBladeCodes[part.name]})</span>
                        )}
                      </td>
                      {type === "Blade" && (
                        <td className="table-cell text-sm text-gray-400">
                          {part.name}
                        </td>
                      )}
                      <td className="table-cell">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${TIER_LABEL_MAP[part.tier ?? ""] ? (TIER_META.find(t => t.code === part.tier)?.color ?? "bg-gray-100 text-gray-500 border-gray-200") : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                          {TIER_LABEL_MAP[part.tier ?? ""] ?? "—"}
                        </span>
                      </td>
                      <td className="table-cell text-xs text-gray-500">
                        {part.containedIn.length} {ui.productCountIn}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        </div>
       ))}

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