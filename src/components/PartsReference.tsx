import { useState, useMemo } from "react";
import { Search, ExternalLink } from "lucide-react";
import { buildPartRegistry } from "../data/parts";
import { products } from "../data/products";
import { partTypeLabelsZh, tierLabelsZh, ui } from "../data/i18n";
import type { PartType } from "../data/types";

export default function PartsReference() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<PartType | "All">("All");
  const [tierFilter, setTierFilter] = useState<string>("All");

  const registry = useMemo(() => {
    const reg = buildPartRegistry();
    return Array.from(reg.values());
  }, []);

  /**
   * Relevance score for parts search: lower = more relevant.
   * 0 = exact name match (case-insensitive)
   * 1 = name prefix match (e.g. "wiz" matches "Wizard Arrow")
   * 2 = any other partial match
   */
  function searchRelevance(part: { name: string; type: string }, q: string): number {
    if (!q) return 2;
    const qLower = q.toLowerCase();
    const nameLower = part.name.toLowerCase();
    const typeLower = part.type.toLowerCase();
    if (nameLower === qLower || typeLower === qLower) return 0;           // exact match
    if (nameLower.startsWith(qLower) || typeLower.startsWith(qLower)) return 1; // prefix match
    return 2;                                                              // partial match
  }

  const filtered = useMemo(() => {
    return registry.filter((part) => {
      const matchesSearch =
        !search ||
        part.name.toLowerCase().includes(search.toLowerCase()) ||
        part.type.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "All" || part.type === typeFilter;
      const matchesTier = tierFilter === "All" || part.tier === tierFilter;
      return matchesSearch && matchesType && matchesTier;
    });
  }, [registry, search, typeFilter, tierFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      // When searching, sort by relevance first
      if (search) {
        const relDiff = searchRelevance(a, search) - searchRelevance(b, search);
        if (relDiff !== 0) return relDiff;
      }
      // Then by tier, then by name
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

  const tierTextColor = (tier: string | null | undefined) => {
    switch (tier) {
      case "TIER0": return "text-red-600";
      case "TIER1": return "text-orange-600";
      case "TIER2": return "text-yellow-700";
      case "BONUS": return "text-purple-600";
      default: return "text-gray-500";
    }
  };

  return (
    <div className="space-y-4">
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
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as PartType | "All")}
        >
          <option value="All">{ui.allPartTypes}</option>
          {Object.entries(partTypeLabelsZh).map(([type, label]) => (
            <option key={type} value={type}>{label}</option>
          ))}
        </select>
        <select
          className="search-input w-auto"
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
        >
          <option value="All">All Tiers</option>
          {["T0", "T0.5", "T1", "T1.5", "T2", "T3", "T4", "T5"].map((t) => (
            <option key={t} value={t}>{t}{tierLabelsZh[t] ? ` - ${tierLabelsZh[t]}` : ""}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sorted.map((part) => (
          <div
            key={`${part.type}:${part.name}`}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{partTypeLabelsZh[part.type] || part.type}</div>
                <div className="text-lg font-bold text-gray-900">{part.name}</div>
              </div>
              <span className={`tier-badge ${part.tier ? tierColor(part.tier) : "bg-gray-100 text-gray-400 border-gray-200"}`}>
                {part.tier || "—"}
              </span>
            </div>
            <div className="text-xs text-gray-500 mb-2">
              {ui.foundIn} {part.containedIn.length} {ui.productCountIn}
            </div>
            <div className="space-y-1">
              {part.containedIn.map((productId) => {
                const p = products.find((p) => p.id === productId);
                if (!p) return null;
                return (
                  <a
                    key={productId}
                    href={`https://www.google.com/search?q=Beyblade+X+${encodeURIComponent(p.nameEn)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between text-xs px-2 py-1.5 rounded hover:bg-gray-50 ${tierTextColor(p.tier)}`}
                  >
                    <span className="font-medium">{p.code} - {p.nameEn}</span>
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-500">
        {ui.showing} {sorted.length} 零件
      </div>
    </div>
  );
}
