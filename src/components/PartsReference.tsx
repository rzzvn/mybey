import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Search } from "lucide-react";
import { buildPartRegistry } from "../data/parts";
import { partTypeLabelsZh, tierLabelsZh, ui, assistBladeCodes, overBladeCodes, bitFullNames, getPartZhName } from "../data/i18n";
import { usePartOwnership } from "../hooks/usePartOwnership";
import PartImage from "./PartImage";
import PartDetailModal from "./PartDetailModal";
import type { PartType, PartInfo } from "../data/types";
import { TIER_META, TIER_LABEL_MAP, TIER_RANK_MAP } from "../data/types";

export default function PartsReference() {
  const { partType, partName } = useParams<{ partType?: string; partName?: string }>();
  const { owned: ownedKeys, getting: gettingKeys } = usePartOwnership();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<PartType | "All">("All");
  const [tierFilter, setTierFilter] = useState<string>("All");
  const [selectedPart, setSelectedPart] = useState<PartInfo | null>(null);

  const registry = useMemo(() => {
    const reg = buildPartRegistry();
    return Array.from(reg.values());
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

  // Deep-link: auto-open part detail when URL has /parts/Blade/Cobalt%20Dragoon etc.
  // Use a ref to track whether we've already auto-opened this part, so dismissing
  // the modal doesn't immediately re-trigger the effect.
  const autoOpenedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!partType || !partName) return;
    const key = `${partType}/${partName}`;
    if (autoOpenedRef.current === key) return; // already opened this exact part
    const decodedName = decodeURIComponent(partName);
    const found = enriched.find(p => p.type === partType && p.name === decodedName);
    if (found) {
      autoOpenedRef.current = key;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedPart(found);
    }
  }, [partType, partName, enriched]);

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
      const tierDiff = (TIER_RANK_MAP[a.tier ?? ""] ?? 99) - (TIER_RANK_MAP[b.tier ?? ""] ?? 99);
      if (tierDiff !== 0) return tierDiff;
      return a.name.localeCompare(b.name);
    });
  }, [filtered, search]);

  const tierColor = (tier: string) => {
    return TIER_META.find(t => t.code === tier)?.color ?? "bg-gray-100 text-gray-600 border-gray-200";
  };

  const handlePartClick = useCallback((part: typeof enriched[number]) => {
    setSelectedPart(part);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedPart(null);
  }, []);

  // Close modal on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedPart(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const typeTabs: { id: PartType | "All"; label: string; icon: string }[] = [
    { id: "All", label: ui.allPartTypes, icon: "📦" },
    { id: "Blade", label: partTypeLabelsZh["Blade"] || "Blade", icon: "⚔️" },
    { id: "Lock Chip", label: partTypeLabelsZh["Lock Chip"] || "Lock Chip", icon: "🔒" },
    { id: "Main Blade", label: partTypeLabelsZh["Main Blade"] || "Main Blade", icon: "🗡️" },
    { id: "Metal Blade", label: partTypeLabelsZh["Metal Blade"] || "Metal Blade", icon: "⚙️" },
    { id: "Over Blade", label: partTypeLabelsZh["Over Blade"] || "Over Blade", icon: "🛡️" },
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
    ...TIER_META.map((t) => ({
      id: t.code as string,
      label: `${t.label}${tierLabelsZh[t.code ?? ""] ? ` - ${tierLabelsZh[t.code ?? ""]}` : ""}`,
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
        {sorted.map((part) => {
          const partKey = `${part.type}:${part.name}`;
          const isPartOwned = ownedKeys.has(partKey);
          const isPartGetting = gettingKeys.has(partKey);
          return (
            <button
              key={partKey}
              onClick={() => handlePartClick(part)}
              className={`bg-white border rounded-xl p-3 hover:shadow-md transition-all text-left cursor-pointer ${
                isPartOwned ? "ring-2 ring-green-400 ring-offset-1 border-green-200" :
                isPartGetting ? "ring-2 ring-amber-400 ring-offset-1 border-amber-200" :
                "border-gray-200 hover:border-gray-300"
              }`}
            >
            <div className="flex items-start gap-2.5">
              {(part.type === "Blade" || part.type === "Bit" || part.type === "Assist Blade" || part.type === "Over Blade" || part.type === "Metal Blade") && (
                <PartImage type={part.type} name={part.name} tier={part.tier} className="w-12 h-12 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{partTypeLabelsZh[part.type] || part.type}</div>
                <div className="text-sm font-bold text-gray-900 truncate">
                  {(isPartOwned || isPartGetting) && (
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${isPartOwned ? "bg-green-400" : "bg-amber-400"}`} />
                  )}
                  {part.type === "Assist Blade" || part.type === "Over Blade" ? part.name : part.zhName}
                </div>
                <div className="text-[10px] text-gray-400 truncate">
                  {part.name}
                  {part.type === "Assist Blade" && assistBladeCodes[part.name] && ` (${assistBladeCodes[part.name]})`}
                  {part.type === "Over Blade" && overBladeCodes[part.name] && ` (${overBladeCodes[part.name]})`}
                  {part.type === "Bit" && bitFullNames[part.name] && ` — ${bitFullNames[part.name]}`}
                  {part.weight && <span className="ml-1 text-gray-300">⚖️{part.weight}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {part.tier && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${tierColor(part.tier)}`}>
                    {TIER_LABEL_MAP[part.tier] ?? part.tier}
                  </span>
                )}
              </div>
            </div>
          </button>
          );
        })}
      </div>

      <div className="text-xs text-gray-500">
        {ui.showing} {sorted.length} 零件
      </div>

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