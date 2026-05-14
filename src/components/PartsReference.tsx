import { useState, useMemo, useCallback } from "react";
import { Search, ExternalLink, X } from "lucide-react";
import { buildPartRegistry } from "../data/parts";
import { products } from "../data/products";
import { partTypeLabelsZh, tierLabelsZh, ui, bladeNamesZh, bladeNamesZhTw, assistBladeNamesZh, assistBladeNamesZhTw, assistBladeCodes, getDualZhName, bitFullNames } from "../data/i18n";
import PartImage from "./PartImage";
import type { PartType, PartTier, ContainedInItem } from "../data/types";

function getPartZhName(part: { type: string; name: string }): string {
  switch (part.type) {
    case "Blade": return getDualZhName(bladeNamesZh[part.name] || part.name, bladeNamesZhTw[part.name]);
    case "Assist Blade": return getDualZhName(assistBladeNamesZh[part.name] || part.name, assistBladeNamesZhTw[part.name]);
    default: return part.name;
  }
}

interface PartInfo {
  type: string;
  name: string;
  zhName: string;
  tier: PartTier;
  containedIn: ContainedInItem[];
}

function PartDetailModal({ part, onClose }: { part: PartInfo; onClose: () => void }) {
  const containingProducts = useMemo(() => {
    return part.containedIn
      .map((item) => {
        // Try exact match first, then fall back to parent product ID
        // e.g. "UX-15" stays as-is, "CX-05-1" falls back to "CX-05"
        let product = products.find((p) => p.id === item.productId);
        if (!product) {
          const parentId = item.productId.replace(/-\d+$/, "");
          product = products.find((p) => p.id === parentId);
        }
        return product ? { ...item, product } : null;
      })
      .filter(Boolean) as (ContainedInItem & { product: typeof products[number] })[];
  }, [part.containedIn]);

  const tierColor = (tier: string) => {
    switch (tier) {
      case "T0": return "bg-red-100 text-red-700 border-red-200";
      case "T0.5": return "bg-pink-100 text-pink-700 border-pink-200";
      case "T1": return "bg-orange-100 text-orange-700 border-orange-200";
      case "T1.5": return "bg-amber-100 text-amber-700 border-amber-200";
      case "T2": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "T3": return "bg-green-100 text-green-700 border-green-200";
      case "T4": return "bg-blue-100 text-blue-700 border-blue-200";
      case "T5": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{ui.partDetail}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4">
          {/* Part header */}
          <div className="flex items-start gap-4 mb-4">
            {(part.type === "Blade" || part.type === "Bit" || part.type === "Assist Blade") && (
              <PartImage type={part.type} name={part.name} tier={part.tier} className="w-24 h-24 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                {partTypeLabelsZh[part.type] || part.type}
              </div>
              <div className="text-xl font-bold text-gray-900">{part.zhName}</div>
              <div className="text-sm text-gray-500">
                {part.name}
                {part.type === "Assist Blade" && assistBladeCodes[part.name] && (
                  <span className="ml-1 text-gray-400">({assistBladeCodes[part.name]})</span>
                )}
                {part.type === "Bit" && bitFullNames[part.name] && (
                  <span className="ml-1 text-gray-400">— {bitFullNames[part.name]}</span>
                )}
              </div>
              {part.tier && (
                <span className={`inline-flex items-center mt-2 px-2.5 py-1 rounded-md text-sm font-bold border ${tierColor(part.tier)}`}>
                  {part.tier}
                </span>
              )}
            </div>
          </div>

          {/* Containing products */}
          <div className="border-t border-gray-100 pt-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              {ui.containsIn} <span className="text-gray-400">({containingProducts.length})</span>
            </h3>
            <div className="space-y-1.5">
              {containingProducts.map((item) => {
                const isSubItem = item.productId !== item.product.id;
                const displayCode = isSubItem ? item.productId : item.product.code;
                return (
                <a
                  key={item.productId}
                  href={`https://www.google.com/search?q=Beyblade+X+${encodeURIComponent(item.beyName || item.product.nameEn)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-sm px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-gray-500 shrink-0">{displayCode}</span>
                      {!isSubItem && <span className="font-medium text-gray-900 truncate">{item.product.nameZh}</span>}
                      <span className="text-xs text-gray-400 hidden sm:inline truncate">{item.beyName || item.product.nameEn}</span>
                    </div>
                    {item.beyName && !isSubItem && (
                      <div className="text-xs text-gray-400 mt-0.5 truncate">{item.beyName}</div>
                    )}
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0 ml-2" />
                </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PartsReference() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<PartType | "All">("All");
  const [tierFilter, setTierFilter] = useState<string>("All");
  const [selectedPart, setSelectedPart] = useState<PartInfo | null>(null);

  const registry = useMemo(() => {
    const reg = buildPartRegistry();
    return Array.from(reg.values()).filter((p) => p.type !== "Lock Chip");
  }, []);

  function searchRelevance(part: { name: string; type: string; zhName: string }, q: string): number {
    if (!q) return 2;
    const qLower = q.toLowerCase();
    const nameLower = part.name.toLowerCase();
    const zhLower = part.zhName.toLowerCase();
    const typeLower = part.type.toLowerCase();
    if (nameLower === qLower || typeLower === qLower || zhLower === qLower) return 0;
    if (nameLower.startsWith(qLower) || typeLower.startsWith(qLower) || zhLower.includes(qLower)) return 1;
    return 2;
  }

  const enriched = useMemo(() => {
    return registry.map((part) => ({
      ...part,
      zhName: getPartZhName(part),
    }));
  }, [registry]);

  const filtered = useMemo(() => {
    return enriched.filter((part) => {
      const matchesSearch =
        !search ||
        part.name.toLowerCase().includes(search.toLowerCase()) ||
        part.type.toLowerCase().includes(search.toLowerCase()) ||
        part.zhName.includes(search);
      const matchesType = typeFilter === "All" || part.type === typeFilter;
      const matchesTier = tierFilter === "All" || part.tier === tierFilter;
      return matchesSearch && matchesType && matchesTier;
    });
  }, [enriched, search, typeFilter, tierFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (search) {
        const relDiff = searchRelevance(a, search) - searchRelevance(b, search);
        if (relDiff !== 0) return relDiff;
      }
      const tierOrder = ["T0", "T0.5", "T1", "T1.5", "T2", "T3", "T4", "T5"];
      const aIdx = a.tier ? tierOrder.indexOf(a.tier) : 99;
      const bIdx = b.tier ? tierOrder.indexOf(b.tier) : 99;
      const tierDiff = aIdx - bIdx;
      if (tierDiff !== 0) return tierDiff;
      return a.name.localeCompare(b.name);
    });
  }, [filtered, search]);

  const tierColor = (tier: string) => {
    switch (tier) {
      case "T0": return "bg-red-100 text-red-700 border-red-200";
      case "T0.5": return "bg-pink-100 text-pink-700 border-pink-200";
      case "T1": return "bg-orange-100 text-orange-700 border-orange-200";
      case "T1.5": return "bg-amber-100 text-amber-700 border-amber-200";
      case "T2": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "T3": return "bg-green-100 text-green-700 border-green-200";
      case "T4": return "bg-blue-100 text-blue-700 border-blue-200";
      case "T5": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const handlePartClick = useCallback((part: typeof enriched[number]) => {
    setSelectedPart(part);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedPart(null);
  }, []);

  // Close modal on Escape
  if (typeof window !== "undefined") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useMemo(() => {
      const handler = (e: KeyboardEvent) => {
        if (e.key === "Escape") setSelectedPart(null);
      };
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }, []);
  }

  const typeTabs: { id: PartType | "All"; label: string; icon: string }[] = [
    { id: "All", label: ui.allPartTypes, icon: "📦" },
    { id: "Blade", label: partTypeLabelsZh["Blade"] || "Blade", icon: "⚔️" },
    { id: "Assist Blade", label: partTypeLabelsZh["Assist Blade"] || "Assist Blade", icon: "🗡️" },
    { id: "Ratchet", label: partTypeLabelsZh["Ratchet"] || "Ratchet", icon: "⚙️" },
    { id: "Bit", label: partTypeLabelsZh["Bit"] || "Bit", icon: "🔺" },
  ];

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { All: enriched.length };
    for (const part of enriched) {
      counts[part.type] = (counts[part.type] || 0) + 1;
    }
    return counts;
  }, [enriched]);

  const tierTabs: { id: string; label: string }[] = [
    { id: "All", label: "All Tiers" },
    ...["T0", "T0.5", "T1", "T1.5", "T2", "T3", "T4", "T5"].map((t) => ({
      id: t,
      label: `${t}${tierLabelsZh[t] ? ` - ${tierLabelsZh[t]}` : ""}`,
    })),
  ];

  return (
    <div className="space-y-4">
      {/* Search + Tier filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={ui.searchParts}
            className="search-input pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="search-input w-auto"
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
        >
          {tierTabs.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Type tabs */}
      <div className="flex gap-2 flex-wrap">
        {typeTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTypeFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              typeFilter === tab.id
                ? "bg-gray-800 text-white shadow-sm"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {tab.icon} {tab.label} ({typeCounts[tab.id] || 0})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
        {sorted.map((part) => (
          <button
            key={`${part.type}:${part.name}`}
            onClick={() => handlePartClick(part)}
            className="bg-white border border-gray-200 rounded-xl p-3 hover:shadow-md hover:border-gray-300 transition-all text-left cursor-pointer"
          >
            <div className="flex items-start gap-2.5">
              {(part.type === "Blade" || part.type === "Bit" || part.type === "Assist Blade") && (
                <PartImage type={part.type} name={part.name} tier={part.tier} className="w-12 h-12 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{partTypeLabelsZh[part.type] || part.type}</div>
                <div className="text-sm font-bold text-gray-900 truncate">{part.zhName}</div>
                <div className="text-[10px] text-gray-400 truncate">
                  {part.name}
                  {part.type === "Assist Blade" && assistBladeCodes[part.name] && ` (${assistBladeCodes[part.name]})`}
                  {part.type === "Bit" && bitFullNames[part.name] && ` — ${bitFullNames[part.name]}`}
                </div>
              </div>
              {part.tier && (
                <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded border ${tierColor(part.tier)}`}>
                  {part.tier}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="text-xs text-gray-500">
        {ui.showing} {sorted.length} 零件
      </div>

      {/* Part detail modal */}
      {selectedPart && (
        <PartDetailModal part={selectedPart} onClose={handleCloseModal} />
      )}
    </div>
  );
}