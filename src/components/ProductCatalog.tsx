import { useState, useMemo } from "react";
import { Search, ExternalLink, Check, ShoppingCart, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { products } from "../data/products";
import { bitTiers, ratchetTiers, bladeTiers } from "../data/parts";
import { bladeNamesZh, typeLabelsZh, tierLabelsZh, ui } from "../data/i18n";
import { useInventory } from "../hooks/useInventory";
import type { ProductTier, ProductPart, BeyConfig, Product } from "../data/types";

function getBladeTier(name?: string): string {
  if (!name) return "—";
  return bladeTiers[name] || "T3";
}

function getRatchetTier(name?: string): string {
  if (!name) return "—";
  return ratchetTiers[name] || "T3";
}

function getBitTier(name?: string): string {
  if (!name) return "—";
  return bitTiers[name] || "T3";
}

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

function TierBadge({ tier }: { tier: string }) {
  if (tier === "—") return <span className="text-gray-300 text-xs">—</span>;
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold border ${partTierColor(tier)}`}>
      {tier}
    </span>
  );
}

function ExtraPill({ part }: { part: ProductPart }) {
  const icon: Record<string, string> = {
    Stadium: "🏟️", Launcher: "🚀", Pass: "🎫", Accessory: "🔧",
  };
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200">
      {icon[part.type] || "📦"} {part.name}
    </span>
  );
}

type SortKey = "none" | "bladeTier" | "ratchetTier" | "bitTier";
type SortDir = "asc" | "desc";

/** A flattened row: either a single product row or one bey from an expanded pack */
interface FlatRow {
  id: string;        // unique key for React
  productId: string; // original product ID (for owned/wishlist)
  code: string;      // display code (e.g. "UX-16-1")
  tier: ProductTier;
  nameZh: string;
  nameEn: string;
  wikiUrl: string;
  price?: number;
  bey: BeyConfig | null;  // null if product has no beys
  extras: ProductPart[];
  remarks: string;
  type: string;
  isPackExpansion: boolean; // true if this is a sub-row from a pack
}

function flattenProducts(products: Product[]): FlatRow[] {
  const rows: FlatRow[] = [];
  for (const p of products) {
    if (p.type === "Pack" && p.beys.length > 0) {
      // Expand each bey into its own row
      p.beys.forEach((bey, i) => {
        rows.push({
          id: `${p.id}-${i + 1}`,
          productId: p.id,
          code: `${p.code}-${i + 1}`,
          tier: p.tier,
          nameZh: p.nameZh,
          nameEn: p.nameEn,
          wikiUrl: p.wikiUrl,
          price: i === 0 ? p.price : undefined, // only first shows price
          bey,
          extras: i === 0 ? p.extras : [],       // only first row shows extras
          remarks: i === 0 ? p.remarks : "",
          type: p.type,
          isPackExpansion: true,
        });
      });
    } else {
      // Single row for non-packs, or packs with no beys
      rows.push({
        id: p.id,
        productId: p.id,
        code: p.code,
        tier: p.tier,
        nameZh: p.nameZh,
        nameEn: p.nameEn,
        wikiUrl: p.wikiUrl,
        price: p.price,
        bey: p.beys.length > 0 ? p.beys[0] : null,
        extras: p.extras,
        remarks: p.remarks,
        type: p.type,
        isPackExpansion: false,
      });
    }
  }
  return rows;
}

function tierSortValue(tier: string): number {
  if (tier === "—") return 99;
  const order: Record<string, number> = { T0: 0, T1: 1, T2: 2, T3: 3, T4: 4, T5: 5 };
  return order[tier] ?? 99;
}

export default function ProductCatalog() {
  const { isOwned, toggleProductOwned, addToWishlist } = useInventory();
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [sortKey, setSortKey] = useState<SortKey>("none");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function toggleSort(key: SortKey) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortKey("none");
    }
  }

  function SortIcon({ column }: { column: SortKey }) {
    if (sortKey !== column) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    return sortDir === "asc"
      ? <ArrowUp className="w-3 h-3 text-blue-600" />
      : <ArrowDown className="w-3 h-3 text-blue-600" />;
  }

  const flatRows = useMemo(() => flattenProducts(products), []);

  const filtered = useMemo(() => {
    let result = flatRows.filter((row) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search ||
        row.code.toLowerCase().includes(searchLower) ||
        row.nameEn.toLowerCase().includes(searchLower) ||
        row.nameZh.includes(search) ||
        (row.bey?.blade && row.bey.blade.toLowerCase().includes(searchLower)) ||
        (row.bey?.ratchet && row.bey.ratchet.toLowerCase().includes(searchLower)) ||
        (row.bey?.bit && row.bey.bit.toLowerCase().includes(searchLower)) ||
        row.extras.some((e) => e.name.toLowerCase().includes(searchLower));
      const matchesTier = tierFilter === "All" 
        ? true 
        : tierFilter === "null" 
          ? row.tier === null 
          : row.tier === tierFilter;
      const matchesType = typeFilter === "All" || row.type === typeFilter;
      return matchesSearch && matchesTier && matchesType;
    });

    if (sortKey !== "none") {
      result = [...result].sort((a, b) => {
        let aTier: string, bTier: string;
        if (sortKey === "bladeTier") {
          aTier = a.bey?.blade ? getBladeTier(a.bey.blade) : "—";
          bTier = b.bey?.blade ? getBladeTier(b.bey.blade) : "—";
        } else if (sortKey === "ratchetTier") {
          aTier = a.bey?.ratchet ? getRatchetTier(a.bey.ratchet) : "—";
          bTier = b.bey?.ratchet ? getRatchetTier(b.bey.ratchet) : "—";
        } else {
          aTier = a.bey?.bit ? getBitTier(a.bey.bit) : "—";
          bTier = b.bey?.bit ? getBitTier(b.bey.bit) : "—";
        }
        const diff = tierSortValue(aTier) - tierSortValue(bTier);
        return sortDir === "asc" ? diff : -diff;
      });
    }

    return result;
  }, [search, tierFilter, typeFilter, sortKey, sortDir, flatRows]);

  const productTypes = [...new Set(products.map((p) => p.type))];

  const tierBadgeClass = (tier: ProductTier) => {
    switch (tier) {
      case "TIER0": return "tier-p0";
      case "TIER1": return "tier-p1";
      case "TIER2": return "tier-p2";
      case "BONUS": return "tier-bonus";
      default: return "tier-none";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={ui.searchPlaceholder}
            className="search-input pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="search-input w-auto" value={tierFilter} onChange={(e) => setTierFilter(e.target.value)}>
          <option value="All">{ui.allTiers}</option>
          <option value="TIER0">{ui.tier0Label}</option>
          <option value="TIER1">{ui.tier1Label}</option>
          <option value="TIER2">{ui.tier2Label}</option>
          <option value="BONUS">{ui.bonusLabel}</option>
          <option value="null">{ui.otherTier}</option>
        </select>
        <select className="search-input w-auto" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="All">{ui.allTypes}</option>
          {productTypes.map((t) => (
            <option key={t} value={t}>{typeLabelsZh[t] || t}</option>
          ))}
        </select>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="table-header">{ui.tier}</th>
                <th className="table-header">{ui.code}</th>
                <th className="table-header">{ui.productName}</th>
                <th className="table-header">{ui.price}</th>
                <th className="table-header cursor-pointer select-none" onClick={() => toggleSort("bladeTier")}>
                  <span className="inline-flex items-center gap-1">{ui.blade} <SortIcon column="bladeTier" /></span>
                </th>
                <th className="table-header cursor-pointer select-none" onClick={() => toggleSort("bladeTier")}>
                  <span className="inline-flex items-center gap-1">{ui.bladeTier} <SortIcon column="bladeTier" /></span>
                </th>
                <th className="table-header cursor-pointer select-none" onClick={() => toggleSort("ratchetTier")}>
                  <span className="inline-flex items-center gap-1">{ui.ratchet} <SortIcon column="ratchetTier" /></span>
                </th>
                <th className="table-header cursor-pointer select-none" onClick={() => toggleSort("ratchetTier")}>
                  <span className="inline-flex items-center gap-1">{ui.ratchetTier} <SortIcon column="ratchetTier" /></span>
                </th>
                <th className="table-header cursor-pointer select-none" onClick={() => toggleSort("bitTier")}>
                  <span className="inline-flex items-center gap-1">{ui.bit} <SortIcon column="bitTier" /></span>
                </th>
                <th className="table-header cursor-pointer select-none" onClick={() => toggleSort("bitTier")}>
                  <span className="inline-flex items-center gap-1">{ui.bitTier} <SortIcon column="bitTier" /></span>
                </th>
                <th className="table-header">{ui.extras}</th>
                <th className="table-header">{ui.remarks}</th>
                <th className="table-header"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((row) => {
                const owned = isOwned(row.productId);
                return (
                  <tr
                    key={row.id}
                    className={`${owned ? "bg-green-50/60" : ""} ${row.isPackExpansion ? "bg-yellow-50/30" : ""} hover:bg-gray-50/80 transition-colors`}
                  >
                    <td className="table-cell">
                      <span className={`tier-badge ${tierBadgeClass(row.tier)}`}>
                        {row.tier ? tierLabelsZh[row.tier] || row.tier : "—"}
                      </span>
                    </td>
                    <td className="table-cell font-mono font-semibold text-sm whitespace-nowrap">{row.code}</td>
                    <td className="table-cell">
                      <a
                        href={row.wikiUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        {row.nameZh}
                        <ExternalLink className="w-3 h-3 opacity-50" />
                      </a>
                      <div className="text-xs text-gray-400 mt-0.5">{row.nameEn}</div>
                    </td>
                    <td className="table-cell text-xs text-gray-500 whitespace-nowrap">
                      {row.price ? `¥${row.price.toLocaleString()}` : "—"}
                    </td>
                    <td className="table-cell">
                      {row.bey?.blade ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">{bladeNamesZh[row.bey.blade] || row.bey.blade}</div>
                          {bladeNamesZh[row.bey.blade] && (
                            <div className="text-xs text-gray-400">{row.bey.blade}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <TierBadge tier={row.bey?.blade ? getBladeTier(row.bey.blade) : "—"} />
                    </td>
                    <td className="table-cell font-mono text-sm">
                      {row.bey?.ratchet || <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="table-cell">
                      <TierBadge tier={row.bey?.ratchet ? getRatchetTier(row.bey.ratchet) : "—"} />
                    </td>
                    <td className="table-cell font-mono text-sm">
                      {row.bey?.bit || <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="table-cell">
                      <TierBadge tier={row.bey?.bit ? getBitTier(row.bey.bit) : "—"} />
                    </td>
                    <td className="table-cell">
                      <div className="flex flex-wrap gap-1">
                        {row.extras.map((part, i) => (
                          <ExtraPill key={i} part={part} />
                        ))}
                      </div>
                    </td>
                    <td className="table-cell text-gray-500 text-xs max-w-[200px]">{row.remarks}</td>
                    <td className="table-cell">
                      <div className="flex gap-1">
                        <button
                          onClick={() => toggleProductOwned(row.productId)}
                          className={`btn text-xs ${owned ? "btn-success" : "btn-secondary"}`}
                          title={owned ? "標記為未擁有" : "標記為已擁有"}
                        >
                          <Check className={`w-3 h-3 ${owned ? "" : "opacity-50"}`} />
                          {owned ? ui.owned : ui.own}
                        </button>
                        <button
                          onClick={() => addToWishlist({ productId: row.productId, priority: "Medium", notes: "" })}
                          className="btn btn-secondary text-xs"
                          title={ui.addToWishlist}
                        >
                          <ShoppingCart className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500 border-t border-gray-100">
          {ui.showing} {filtered.length} {ui.of} {products.length} {ui.productCount} ·{" "}
          <span className="text-green-600 font-medium">{products.filter(p => isOwned(p.id)).length} {ui.ownedCount}</span>
        </div>
      </div>
    </div>
  );
}