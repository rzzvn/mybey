import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { usePartOwnership } from "../hooks/usePartOwnership";
import { commonCombos, resolveBladeName } from "../data/communityCombos";
import { getBladeTierResolved, ratchetTiers, bitTiers } from "../data/parts";
import { bladeNamesZh, bladeNamesZhTw, bitFullNames, getDualZhName, assistBladeNamesZh, assistBladeNamesZhTw, ui } from "../data/i18n";
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


export default function CommunityCombosTab() {
  const { owned: ownedKeys, getting: gettingKeys } = usePartOwnership();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

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
      return matchesSearch && matchesCategory;
    });
  }, [search, categoryFilter]);

  const categories = [
    "All",
    ...Array.from(new Set(commonCombos.map((c) => c.category))),
  ];

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

      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="table-header w-12"></th>
                    <th className="table-header">{ui.comboBlade}</th>
                    <th className="table-header">{ui.ratchet}</th>
                    <th className="table-header">{ui.bit}</th>
                    <th className="table-header">{ui.assistBlade}</th>
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
                    <td className="table-cell">
                      {combo.assistBlades && combo.assistBlades.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {combo.assistBlades.map((a) => (
                            <PartChip
                              key={a}
                              partType="Assist Blade"
                              name={a}
                              nameZh={getDualZhName(assistBladeNamesZh[a] || a, assistBladeNamesZhTw[a])}
                              owned={ownedKeys.has(`Assist Blade:${a}`)}
                              ordered={gettingKeys.has(`Assist Blade:${a}`)}
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