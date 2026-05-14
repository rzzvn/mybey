import { useMemo, useState } from "react";
import { buildPartRegistry } from "../data/parts";
import { bladeNamesZh, bladeNamesZhTw, partTypeLabelsZh, ui, getDualZhName, bitFullNames, assistBladeCodes } from "../data/i18n";
import PartImage from "./PartImage";
import type { PartTier, PartType } from "../data/types";

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

const typeOrder: Record<string, number> = {
  Blade: 0,
  "Assist Blade": 1,
  Ratchet: 2,
  Bit: 3,
};

const typeIcons: Record<string, string> = {
  Blade: "⚔️",
  Ratchet: "⚙️",
  Bit: "🔺",
  "Assist Blade": "🗡️",
};

const tabTypes: PartType[] = ["Blade", "Assist Blade", "Ratchet", "Bit"];

export default function TierListPage() {
  const [activeTab, setActiveTab] = useState<PartType | "All">("All");

  const registry = useMemo(() => {
    const reg = buildPartRegistry();
    return Array.from(reg.values()).filter((p) => p.type !== "Lock Chip").sort((a, b) => {
      const typeDiff = (typeOrder[a.type] ?? 99) - (typeOrder[b.type] ?? 99);
      if (typeDiff !== 0) return typeDiff;
      const tierOrder = ["T0", "T0.5", "T1", "T1.5", "T2", "T3", "T4", "T5"];
      const tierDiff = tierOrder.indexOf(a.tier ?? "T3") - tierOrder.indexOf(b.tier ?? "T3");
      if (tierDiff !== 0) return tierDiff;
      return a.name.localeCompare(b.name);
    });
  }, []);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof registry> = {};
    for (const part of registry) {
      if (!groups[part.type]) groups[part.type] = [];
      groups[part.type].push(part);
    }
    return Object.entries(groups).sort(([a], [b]) =>
      (typeOrder[a] ?? 99) - (typeOrder[b] ?? 99)
    );
  }, [registry]);

  const filteredGroups = useMemo(() => {
    if (activeTab === "All") return grouped;
    return grouped.filter(([type]) => type === activeTab);
  }, [grouped, activeTab]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { All: registry.length };
    for (const [type, parts] of grouped) {
      counts[type] = parts.length;
    }
    return counts;
  }, [registry, grouped]);

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
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {(type === "Blade" || type === "Bit" || type === "Assist Blade") && <th className="table-header w-12"></th>}
                  <th className="table-header">{ui.partName}</th>
                  {(type === "Blade") && <th className="table-header">{ui.partNameEn}</th>}
                  <th className="table-header">{ui.tier}</th>
                  <th className="table-header">{ui.foundIn}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {parts.map((part) => {
                  const partKey = `${part.type}:${part.name}`;
                  return (
                    <tr key={partKey} className="hover:bg-gray-50/80 transition-colors">
                      {(type === "Blade" || type === "Bit" || type === "Assist Blade") && (
                        <td className="table-cell">
                          <PartImage type={part.type} name={part.name} tier={part.tier as PartTier | null | undefined} className="w-10 h-10" />
                        </td>
                      )}
                      <td className="table-cell font-medium">
                        {type === "Blade" && bladeNamesZh[part.name]
                          ? getDualZhName(bladeNamesZh[part.name], bladeNamesZhTw[part.name])
                          : part.name}
                        {type === "Bit" && bitFullNames[part.name] && (
                          <span className="text-gray-400 ml-1">— {bitFullNames[part.name]}</span>
                        )}
                        {type === "Assist Blade" && assistBladeCodes[part.name] && (
                          <span className="text-gray-400 ml-1">({assistBladeCodes[part.name]})</span>
                        )}
                      </td>
                      {type === "Blade" && (
                        <td className="table-cell text-sm text-gray-400">
                          {bladeNamesZh[part.name] ? part.name : "—"}
                        </td>
                      )}
                      <td className="table-cell">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${partTierColor(part.tier ?? "T3")}`}>
                          {part.tier ?? "T3"}
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
      ))}
    </div>
  );
}