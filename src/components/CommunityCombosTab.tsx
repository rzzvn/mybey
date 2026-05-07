import { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronUp, Heart } from "lucide-react";
import { commonCombos } from "../data/communityCombos";
import { ui } from "../data/i18n";

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
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return commonCombos.filter((combo) => {
      const matchesSearch =
        !search ||
        combo.blade.toLowerCase().includes(search.toLowerCase()) ||
        combo.bladeZh.toLowerCase().includes(search) ||
        combo.notes.toLowerCase().includes(search.toLowerCase()) ||
        combo.source.toLowerCase().includes(search.toLowerCase()) ||
        (combo.bladeCode && combo.bladeCode.toLowerCase().includes(search.toLowerCase()));
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

      <div className="space-y-3">
        {filtered.map((combo, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow overflow-hidden"
          >
            <button
              onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
              className="w-full p-4 flex items-start justify-between text-left"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-lg text-gray-900">{combo.bladeZh}</span>
                  <span className="text-sm text-gray-500">{combo.blade}</span>
                  {combo.bladeCode && (
                    <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{combo.bladeCode}</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`tier-badge ${categoryColor(combo.category)}`}>{categoryLabelsZh[combo.category] || combo.category}</span>
                  <span className="text-xs text-gray-400">{ui.source}: {combo.source}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-gray-300" />
                {expandedIndex === idx ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>
            
            {expandedIndex === idx && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <div className="mt-3 text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {combo.notes}
                </div>
                {(combo.ratchet || combo.bit) && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{ui.recommendedConfig}</div>
                    <div className="flex flex-wrap gap-2">
                      {combo.ratchet && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">{ui.ratchet}: {combo.ratchet}</span>
                      )}
                      {combo.bit && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">{ui.bit}: {combo.bit}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-500">{ui.showing} {filtered.length} 組合</div>
    </div>
  );
}