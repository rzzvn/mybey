import { useState, useMemo } from "react";
import { Search, ExternalLink } from "lucide-react";
import { buildPartRegistry } from "../data/parts";
import { products } from "../data/products";
import type { PartType } from "../data/types";

export default function PartsReference() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<PartType | "All">("All");
  const [tierFilter, setTierFilter] = useState<string>("All");

  const registry = useMemo(() => {
    const reg = buildPartRegistry();
    return Array.from(reg.values());
  }, []);

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
      const tierOrder = ["T0", "T1", "T2", "T3", "T4", "T5"];
      const tierDiff = tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier);
      if (tierDiff !== 0) return tierDiff;
      return a.name.localeCompare(b.name);
    });
  }, [filtered]);

  const tierColor = (tier: string) => {
    switch (tier) {
      case "T0": return "bg-red-100 text-red-700 border-red-200";
      case "T1": return "bg-orange-100 text-orange-700 border-orange-200";
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
            placeholder="Search parts..."
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
          <option value="All">All Types</option>
          <option value="Blade">Blade</option>
          <option value="Ratchet">Ratchet</option>
          <option value="Bit">Bit</option>
          <option value="Stadium">Stadium</option>
          <option value="Launcher">Launcher</option>
          <option value="Pass">Pass</option>
          <option value="Accessory">Accessory</option>
        </select>
        <select
          className="search-input w-auto"
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
        >
          <option value="All">All Tiers</option>
          {["T0", "T1", "T2", "T3", "T4", "T5"].map((t) => (
            <option key={t} value={t}>Tier {t}</option>
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
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{part.type}</div>
                <div className="text-lg font-bold text-gray-900">{part.name}</div>
              </div>
              <span className={`tier-badge ${tierColor(part.tier)}`}>
                {part.tier}
              </span>
            </div>
            <div className="text-xs text-gray-500 mb-2">
              Found in {part.containedIn.length} product{part.containedIn.length > 1 ? "s" : ""}
            </div>
            <div className="space-y-1">
              {part.containedIn.map((productId) => {
                const p = products.find((p) => p.id === productId);
                if (!p) return null;
                return (
                  <a
                    key={productId}
                    href={p.wikiUrl}
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
        Showing {sorted.length} parts
      </div>
    </div>
  );
}
