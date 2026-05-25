import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { usePartOwnership } from "../hooks/usePartOwnership";
import { commonCombos, resolveBladeName } from "../data/communityCombos";
import { getBladeTierResolved, ratchetTiers, bitTiers } from "../data/parts";
import { bladeNamesZh, bladeNamesZhTw, bitFullNames, getDualZhName, assistBladeCodes, ui } from "../data/i18n";
import PartImage from "./PartImage";
import PartChip from "./PartChip";

const categoryLabelsZh: Record<string, string> = {
  "Attack": "攻擊",
  "Defense-Stamina": "防禦持久",
  "Stamina": "持久",
  "Balance": "平衡",
  "Anti-Left": "左迴旋對策",
  "Beginner": "新手",
};

function categoryColor(cat: string): string {
  switch (cat) {
    case "Attack": return "bg-red-100 text-red-700 border-red-200";
    case "Defense-Stamina": return "bg-blue-100 text-blue-700 border-blue-200";
    case "Stamina": return "bg-green-100 text-green-700 border-green-200";
    case "Balance": return "bg-purple-100 text-purple-700 border-purple-200";
    case "Anti-Left": return "bg-orange-100 text-orange-700 border-orange-200";
    case "Beginner": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default: return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

/** Is this combo a Custom Line (CX Original or CX Expand)? */
function isCustomLine(combo: typeof commonCombos[number]): boolean {
  return !!(combo.lockChip || combo.mainBlade || combo.metalBlade || combo.overBlade);
}

export default function CommunityCombosTab() {
  const { owned: ownedKeys, getting: gettingKeys } = usePartOwnership();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [lineFilter, setLineFilter] = useState<"standard" | "custom">("standard");

  const stripHyphens = (s: string) => s.replace(/-/g, "");

  const filtered = useMemo(() => {
    return commonCombos.filter((combo) => {
      const searchLower = search.toLowerCase();
      const searchNoHyphen = stripHyphens(searchLower);
      const matchesSearch =
        !search ||
        combo.blade.toLowerCase().includes(searchLower) ||
        combo.bladeZh.toLowerCase().includes(search) ||
        (combo.ratchets && combo.ratchets.some(r => r.toLowerCase().includes(searchNoHyphen) || r.toLowerCase().includes(searchLower))) ||
        (combo.bits && combo.bits.some(b => b.toLowerCase().includes(searchLower))) ||
        combo.notes.toLowerCase().includes(searchLower) ||
        combo.source.toLowerCase().includes(searchLower) ||
        (combo.bladeCode && stripHyphens(combo.bladeCode.toLowerCase()).includes(searchNoHyphen));
      const matchesCategory =
        categoryFilter === "All" || combo.category === categoryFilter;
      const matchesLine =
        (lineFilter === "standard" && !isCustomLine(combo)) ||
        (lineFilter === "custom" && isCustomLine(combo));
      return matchesSearch && matchesCategory && matchesLine;
    });
  }, [search, categoryFilter, lineFilter]);

  const categories = [
    "All",
    ...Array.from(new Set(commonCombos.map((c) => c.category))),
  ];

  const lineLabelsZh: Record<string, string> = {
    standard: "UX/BX",
    custom: "CX",
  };

  const showCustomCols = lineFilter === "custom";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={ui.searchCombos}
            className="search-input pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="search-input w-auto"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat === "All" ? ui.allCategories : `${categoryLabelsZh[cat] || cat}`}</option>
          ))}
        </select>
      </div>

      {/* Line type filter tabs */}
      <div className="flex gap-2">
        {(["standard", "custom"] as const).map((line) => (
          <button
            key={line}
            onClick={() => setLineFilter(line)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              lineFilter === line
                ? "bg-gray-800 text-white shadow-sm"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {lineLabelsZh[line]} ({line === "standard" ? commonCombos.filter(c => !isCustomLine(c)).length : commonCombos.filter(c => isCustomLine(c)).length})
          </button>
        ))}
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="table-header w-12"></th>
                <th className="table-header">{ui.comboBlade}</th>
                {showCustomCols && <th className="table-header">LC</th>}
                {showCustomCols && <th className="table-header">MB</th>}
                {showCustomCols && <th className="table-header">OB</th>}
                {showCustomCols && <th className="table-header">AB</th>}
                <th className="table-header">{ui.ratchet}</th>
                <th className="table-header">{ui.bit}</th>
                <th className="table-header">{ui.remarks}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((combo, idx) => {
                const canonicalBlade = resolveBladeName(combo.blade);
                const bladeZhName = bladeNamesZh[canonicalBlade] || combo.bladeZh;
                const bladeTwName = bladeNamesZhTw[canonicalBlade];
                const bladeDisplayZh = getDualZhName(bladeZhName, bladeTwName);
                const tier = getBladeTierResolved(canonicalBlade) || null;
                const ratchetTier = (r: string) => ratchetTiers[r] || null;
                const bitTier = (b: string) => bitTiers[b] || null;
                const custom = isCustomLine(combo);

                return (
                  <tr
                    key={`${combo.blade}-${combo.category}-${idx}`}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="table-cell">
                      <PartImage type="Blade" name={canonicalBlade} tier={tier} className="w-10 h-10" />
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2 flex-wrap">
                        <PartChip
                          partType="Blade"
                          name={canonicalBlade}
                          nameZh={bladeDisplayZh}
                          tier={tier}
                          owned={ownedKeys.has(`Blade:${canonicalBlade}`)}
                          ordered={gettingKeys.has(`Blade:${canonicalBlade}`)}
                        />
                        <span className={`tier-badge ${categoryColor(combo.category)}`}>
                          {categoryLabelsZh[combo.category] || combo.category}
                        </span>
                      </div>
                    </td>
                    {/* Custom Line columns */}
                    {showCustomCols && (
                      <td className="table-cell">
                        {custom && combo.lockChip ? (
                          <PartChip partType="Lock Chip" name={combo.lockChip} owned={ownedKeys.has(`Lock Chip:${combo.lockChip}`)} ordered={gettingKeys.has(`Lock Chip:${combo.lockChip}`)} />
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    )}
                    {showCustomCols && (
                      <td className="table-cell">
                        {custom && (combo.mainBlade || combo.metalBlade) ? (
                          <PartChip
                            partType={combo.metalBlade ? "Metal Blade" : "Main Blade"}
                            name={combo.mainBlade || combo.metalBlade!}
                            owned={ownedKeys.has(`Main Blade:${combo.mainBlade || ""}`) || ownedKeys.has(`Metal Blade:${combo.metalBlade || ""}`)}
                            ordered={gettingKeys.has(`Main Blade:${combo.mainBlade || ""}`) || gettingKeys.has(`Metal Blade:${combo.metalBlade || ""}`)}
                          />
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    )}
                    {showCustomCols && (
                      <td className="table-cell">
                        {custom && combo.overBlade ? (
                          <PartChip
                            partType="Over Blade"
                            name={combo.overBlade}
                            owned={ownedKeys.has(`Over Blade:${combo.overBlade}`)}
                            ordered={gettingKeys.has(`Over Blade:${combo.overBlade}`)}
                          />
                        ) : custom ? (
                          <span className="text-gray-300 text-xs">—</span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    )}
                    {showCustomCols && (
                      <td className="table-cell">
                        {custom && combo.assistBlades && combo.assistBlades.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {combo.assistBlades.map((a) => (
                              <PartChip
                                key={a}
                                partType="Assist Blade"
                                name={a}
                                nameZh={assistBladeCodes[a] ? `${a} (${assistBladeCodes[a]})` : a}
                                tier={null}
                                owned={ownedKeys.has(`Assist Blade:${a}`)}
                                ordered={gettingKeys.has(`Assist Blade:${a}`)}
                              />
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    )}
                    <td className="table-cell">
                      {combo.ratchets && combo.ratchets.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {combo.ratchets.map((r) => (
                            <PartChip
                              key={r}
                              partType="Ratchet"
                              name={r}
                              tier={ratchetTier(r)}
                              owned={ownedKeys.has(`Ratchet:${r}`)}
                              ordered={gettingKeys.has(`Ratchet:${r}`)}
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="table-cell">
                      {combo.bits && combo.bits.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {combo.bits.map((b) => (
                            <PartChip
                              key={b}
                              partType="Bit"
                              name={b}
                              nameZh={bitFullNames[b] || undefined}
                              tier={bitTier(b)}
                              owned={ownedKeys.has(`Bit:${b}`)}
                              ordered={gettingKeys.has(`Bit:${b}`)}
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="table-cell text-gray-500 text-xs max-w-[500px] whitespace-pre-line leading-relaxed">
                      {combo.notes || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500 border-t border-gray-100">
          {ui.showing} {filtered.length} {ui.comboCount}
        </div>
      </div>
    </div>
  );
}