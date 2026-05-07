import { useMemo } from "react";
import { buildPartRegistry } from "../data/parts";
import { bladeNamesZh, partTypeLabelsZh, ui } from "../data/i18n";

function partTierColor(tier: string): string {
  switch (tier) {
    case "T0": return "bg-red-100 text-red-700 border-red-200";
    case "T1": return "bg-orange-100 text-orange-700 border-orange-200";
    case "T2": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "T3": return "bg-green-100 text-green-700 border-green-200";
    case "T4": return "bg-blue-100 text-blue-700 border-blue-200";
    case "T5": return "bg-purple-100 text-purple-700 border-purple-200";
    default: return "bg-gray-100 text-gray-500 border-gray-200";
  }
}

const typeOrder: Record<string, number> = {
  Blade: 0,
  Ratchet: 1,
  Bit: 2,
  Stadium: 3,
  Launcher: 4,
  Pass: 5,
  Accessory: 6,
};

const typeIcons: Record<string, string> = {
  Blade: "⚔️",
  Ratchet: "⚙️",
  Bit: "🔺",
  Stadium: "🏟️",
  Launcher: "🚀",
  Pass: "🎫",
  Accessory: "🔧",
};

export default function TierListPage() {
  const registry = useMemo(() => {
    const reg = buildPartRegistry();
    return Array.from(reg.values()).sort((a, b) => {
      // Sort by type first (Blade, Ratchet, Bit, then others)
      const typeDiff = (typeOrder[a.type] ?? 99) - (typeOrder[b.type] ?? 99);
      if (typeDiff !== 0) return typeDiff;
      // Then by tier (T0 first)
      const tierOrder = ["T0", "T1", "T2", "T3", "T4", "T5"];
      const tierDiff = tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier);
      if (tierDiff !== 0) return tierDiff;
      // Then alphabetically
      return a.name.localeCompare(b.name);
    });
  }, []);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof registry> = {};
    for (const part of registry) {
      if (!groups[part.type]) groups[part.type] = [];
      groups[part.type].push(part);
    }
    // Return in type order
    return Object.entries(groups).sort(([a], [b]) => 
      (typeOrder[a] ?? 99) - (typeOrder[b] ?? 99)
    );
  }, [registry]);

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold">{ui.tierList}</h2>

      {grouped.map(([type, parts]) => (
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
                      <td className="table-cell font-medium">
                        {type === "Blade" && bladeNamesZh[part.name]
                          ? bladeNamesZh[part.name]
                          : part.name}
                      </td>
                      {type === "Blade" && (
                        <td className="table-cell text-sm text-gray-400">
                          {bladeNamesZh[part.name] ? part.name : "—"}
                        </td>
                      )}
                      <td className="table-cell">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${partTierColor(part.tier)}`}>
                          {part.tier}
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