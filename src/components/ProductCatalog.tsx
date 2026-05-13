import { useState, useMemo, useRef, useEffect } from "react";
import { Search, ExternalLink, ArrowUpDown, ArrowUp, ArrowDown, Tag, X, Columns3 } from "lucide-react";
import { products } from "../data/products";
import { bitTiers, ratchetTiers, bladeTiers } from "../data/parts";
import { bladeNamesZh, bladeNamesZhTw, assistBladeNamesZh, assistBladeNamesZhTw, typeLabelsZh, tierLabelsZh, ui, productNamesZhTw, getDualZhName } from "../data/i18n";
import { useInventory } from "../hooks/useInventory";
import { commonCombos } from "../data/communityCombos";
import type { ProductTier, ProductPart, BeyConfig, Product } from "../data/types";

function getBladeTier(name?: string): string {
  if (!name) return "—";
  return bladeTiers[name] || "—";
}

function getRatchetTier(name?: string): string {
  if (!name) return "—";
  return ratchetTiers[name] || "—";
}

function getBitTier(name?: string): string {
  if (!name) return "—";
  return bitTiers[name] || "—";
}

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
  nameZhTw: string;   // Taiwan Mandarin name (may be same as nameZh)
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
    const twName = productNamesZhTw[p.id] || p.nameZh;
    if (p.beys.length > 1) {
      // Expand each bey into its own row (Packs, multi-bey Sets, Collaborations, etc.)
      p.beys.forEach((bey, i) => {
        const subId = `${p.id}-${i + 1}`;
        const subTwName = productNamesZhTw[subId] || productNamesZhTw[p.id] || twName;
        rows.push({
          id: subId,
          productId: subId,
          code: `${p.code}-${i + 1}`,
          tier: p.tier,
          nameZh: p.nameZh,
          nameZhTw: subTwName,
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
      // Single row for single-bey or no-bey products
      rows.push({
        id: p.id,
        productId: p.id,
        code: p.code,
        tier: p.tier,
        nameZh: p.nameZh,
        nameZhTw: twName,
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
      const order: Record<string, number> = { T0: 0, "T0.5": 0.5, T1: 1, "T1.5": 1.5, T2: 2, T3: 3, T4: 4, T5: 5 };
  return order[tier] ?? 99;
}

export default function ProductCatalog() {
  const { getTag, setTag, removeTag } = useInventory();
  const comboNotesMap = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const combo of commonCombos) {
      if (!map.has(combo.blade)) map.set(combo.blade, []);
      map.get(combo.blade)!.push(combo.notes || "");
      if (combo.bladeZh) {
        if (!map.has(combo.bladeZh)) map.set(combo.bladeZh, []);
        map.get(combo.bladeZh)!.push(combo.notes || "");
      }
    }
    return map;
  }, []);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [sortKey, setSortKey] = useState<SortKey>("none");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [tagFilter, setTagFilter] = useState<string>("all");

  // Column visibility — persisted in localStorage
  const ALL_COLUMNS = ["tier", "code", "name", "price", "blade", "bladeTier", "assistBlade", "ratchet", "ratchetTier", "bit", "bitTier", "comboRemarks", "extras", "remarks"] as const;
  type ColumnKey = typeof ALL_COLUMNS[number];
  const DEFAULT_VISIBLE: ColumnKey[] = ["tier", "code", "name", "blade", "bladeTier", "ratchet", "bit"];
  const [visibleCols, setVisibleCols] = useState<ColumnKey[]>(() => {
    try {
      const saved = localStorage.getItem("bey-catalog-columns");
      if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed)) return parsed; }
    } catch {}
    return DEFAULT_VISIBLE;
  });
  const [showColMenu, setShowColMenu] = useState(false);
  const colMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("bey-catalog-columns", JSON.stringify(visibleCols));
  }, [visibleCols]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (colMenuRef.current && !colMenuRef.current.contains(e.target as Node)) setShowColMenu(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const show = (col: ColumnKey) => visibleCols.includes(col);
  const toggleCol = (col: ColumnKey) => {
    setVisibleCols(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]);
  };
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  /** Strip hyphens for fuzzy code matching: "bx13" → "bx13", matches "BX-13" */
  const stripHyphens = (s: string) => s.replace(/-/g, "");

  /**
   * Relevance score: lower = more relevant.
   * 0 = exact code match (hyphen-stripped, case-insensitive)
   * 1 = code prefix match (e.g. "bx" matches "BX-23" and "BX-14")
   * 2 = any other partial match
   */
  function searchRelevance(row: FlatRow, q: string): number {
    if (!q) return 2;
    const qLower = q.toLowerCase();
    const qNoHyphen = stripHyphens(qLower);
    const codeNoHyphen = stripHyphens(row.code.toLowerCase());
    if (codeNoHyphen === qNoHyphen) return 0;          // exact match
    if (codeNoHyphen.startsWith(qNoHyphen)) return 1;  // prefix match
    return 2;                                            // partial/fuzzy match
  }

  const filtered = useMemo(() => {
    const searchLower = search.toLowerCase();
    const searchNoHyphen = stripHyphens(searchLower);
    let result = flatRows.filter((row) => {
      const matchesSearch =
        !search ||
        stripHyphens(row.code.toLowerCase()).includes(searchNoHyphen) ||
        row.code.toLowerCase().includes(searchLower) ||
        row.nameEn.toLowerCase().includes(searchLower) ||
        row.nameZh.includes(search) ||
        row.nameZhTw.includes(search) ||
        (row.bey?.blade && row.bey.blade.toLowerCase().includes(searchLower)) ||
        (row.bey?.ratchet && stripHyphens(row.bey.ratchet.toLowerCase()).includes(searchNoHyphen)) ||
        (row.bey?.bit && row.bey.bit.toLowerCase().includes(searchLower)) ||
        row.extras.some((e) => e.name.toLowerCase().includes(searchLower));
      const matchesTier = tierFilter === "All" 
        ? true 
        : tierFilter === "null" 
          ? row.tier === null 
          : row.tier === tierFilter;
      const matchesType = typeFilter === "All" || row.type === typeFilter;
      const matchesTag = tagFilter === "all" || getTag(row.productId) === tagFilter;
      return matchesSearch && matchesTier && matchesType && matchesTag;
    });

    // Sort by search relevance when searching, then by explicit sort if active
    if (search) {
      result = [...result].sort((a, b) => {
        const relDiff = searchRelevance(a, search) - searchRelevance(b, search);
        if (relDiff !== 0) return relDiff;
        // Same relevance → fall through to explicit sort or natural code order
        if (sortKey !== "none") {
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
          const tierDiff = tierSortValue(aTier) - tierSortValue(bTier);
          const diff = sortDir === "asc" ? tierDiff : -tierDiff;
          if (diff !== 0) return diff;
        }
        // Natural order: code ascending
        return stripHyphens(a.code.toLowerCase()).localeCompare(stripHyphens(b.code.toLowerCase()));
      });
    } else if (sortKey !== "none") {
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
  }, [search, tierFilter, typeFilter, sortKey, sortDir, tagFilter, flatRows, getTag]);

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
        <select
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className="search-input w-auto"
        >
          <option value="all">{ui.allTags}</option>
          <option value="purchased">{ui.tagPurchased}</option>
          <option value="wishlist">{ui.tagWishlist}</option>
          <option value="getting">{ui.tagGetting}</option>
        </select>
        <div className="relative" ref={colMenuRef}>
          <button
            onClick={() => setShowColMenu(!showColMenu)}
            className="btn btn-secondary text-xs flex items-center gap-1"
          >
            <Columns3 className="w-3.5 h-3.5" />
            {ui.columns}
          </button>
          {showColMenu && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 max-h-80 overflow-y-auto">
              {ALL_COLUMNS.map((col) => (
                <label key={col} className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={show(col)}
                    onChange={() => toggleCol(col)}
                    className="rounded"
                  />
                  {col === "tier" ? ui.tier :
                   col === "code" ? ui.code :
                   col === "name" ? ui.productName :
                   col === "price" ? ui.price :
                   col === "blade" ? ui.blade :
                   col === "bladeTier" ? ui.bladeTier :
                   col === "assistBlade" ? ui.assistBlade :
                   col === "ratchet" ? ui.ratchet :
                   col === "ratchetTier" ? ui.ratchetTier :
                   col === "bit" ? ui.bit :
                   col === "bitTier" ? ui.bitTier :
                   col === "comboRemarks" ? ui.comboRemarks :
                   col === "extras" ? ui.extras :
                   col === "remarks" ? ui.remarks : col}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {show("tier") && <th className="table-header">{ui.tier}</th>}
                {show("code") && <th className="table-header">{ui.code}</th>}
                {show("name") && <th className="table-header">{ui.productName}</th>}
                {show("price") && <th className="table-header">{ui.price}</th>}
                {show("blade") && <th className="table-header cursor-pointer select-none" onClick={() => toggleSort("bladeTier")}>
                  <span className="inline-flex items-center gap-1">{ui.blade} <SortIcon column="bladeTier" /></span>
                </th>}
                {show("bladeTier") && <th className="table-header cursor-pointer select-none" onClick={() => toggleSort("bladeTier")}>
                  <span className="inline-flex items-center gap-1">{ui.bladeTier} <SortIcon column="bladeTier" /></span>
                </th>}
                {show("assistBlade") && <th className="table-header">{ui.assistBlade}</th>}
                {show("ratchet") && <th className="table-header cursor-pointer select-none" onClick={() => toggleSort("ratchetTier")}>
                  <span className="inline-flex items-center gap-1">{ui.ratchet} <SortIcon column="ratchetTier" /></span>
                </th>}
                {show("ratchetTier") && <th className="table-header cursor-pointer select-none" onClick={() => toggleSort("ratchetTier")}>
                  <span className="inline-flex items-center gap-1">{ui.ratchetTier} <SortIcon column="ratchetTier" /></span>
                </th>}
                {show("bit") && <th className="table-header cursor-pointer select-none" onClick={() => toggleSort("bitTier")}>
                  <span className="inline-flex items-center gap-1">{ui.bit} <SortIcon column="bitTier" /></span>
                </th>}
                {show("bitTier") && <th className="table-header cursor-pointer select-none" onClick={() => toggleSort("bitTier")}>
                  <span className="inline-flex items-center gap-1">{ui.bitTier} <SortIcon column="bitTier" /></span>
                </th>}
                {show("comboRemarks") && <th className="table-header">{ui.comboRemarks}</th>}
                {show("extras") && <th className="table-header">{ui.extras}</th>}
                {show("remarks") && <th className="table-header">{ui.remarks}</th>}
                <th className="table-header"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((row) => {
                const currentTag = getTag(row.productId);
                return (
                  <tr
                    key={row.id}
                    className={`${currentTag === "purchased" ? "bg-green-50/60" : ""} ${row.isPackExpansion ? "bg-yellow-50/30" : ""} hover:bg-gray-50/80 transition-colors`}
                  >
                    {show("tier") && <td className="table-cell">
                      <span className={`tier-badge ${tierBadgeClass(row.tier)}`}>
                        {row.tier ? tierLabelsZh[row.tier] || row.tier : "—"}
                      </span>
                    </td>}
                    {show("code") && <td className="table-cell font-mono font-semibold text-sm whitespace-nowrap">{row.code}</td>}
                    {show("name") && <td className="table-cell">
                      <a
                        href={`https://www.google.com/search?q=Beyblade+X+${encodeURIComponent(row.nameEn)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        {getDualZhName(row.nameZh, row.nameZhTw)}
                        <ExternalLink className="w-3 h-3 opacity-50" />
                      </a>
                      <div className="text-xs text-gray-400 mt-0.5">{row.nameEn}</div>
                    </td>}
                    {show("price") && <td className="table-cell text-xs text-gray-500 whitespace-nowrap">
                      {row.price ? `¥${row.price.toLocaleString()}` : "—"}
                    </td>}
                    {show("blade") && <td className="table-cell">
                      {row.bey?.blade ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">{getDualZhName(bladeNamesZh[row.bey.blade] || row.bey.blade, bladeNamesZhTw[row.bey.blade])}</div>
                          {bladeNamesZh[row.bey.blade] && (
                            <div className="text-xs text-gray-400">{row.bey.blade}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>}
                    {show("bladeTier") && <td className="table-cell">
                      <TierBadge tier={row.bey?.blade ? getBladeTier(row.bey.blade) : "—"} />
                    </td>}
                    {show("assistBlade") && <td className="table-cell">
                      {row.bey?.assistBlade ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">{getDualZhName(assistBladeNamesZh[row.bey.assistBlade] || row.bey.assistBlade, assistBladeNamesZhTw[row.bey.assistBlade])}</div>
                          {assistBladeNamesZh[row.bey.assistBlade] && (
                            <div className="text-xs text-gray-400">{row.bey.assistBlade}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>}
                    {show("ratchet") && <td className="table-cell font-mono text-sm">
                      {row.bey?.ratchet || <span className="text-gray-300 text-xs">—</span>}
                    </td>}
                    {show("ratchetTier") && <td className="table-cell">
                      <TierBadge tier={row.bey?.ratchet ? getRatchetTier(row.bey.ratchet) : "—"} />
                    </td>}
                    {show("bit") && <td className="table-cell font-mono text-sm">
                      {row.bey?.bit || <span className="text-gray-300 text-xs">—</span>}
                    </td>}
                    {show("bitTier") && <td className="table-cell">
                      <TierBadge tier={row.bey?.bit ? getBitTier(row.bey.bit) : "—"} />
                    </td>}
                    {show("comboRemarks") && <td className="table-cell relative group">
                      {(() => {
                        const bladeName = row.bey?.blade;
                        if (!bladeName) return <span className="text-gray-300">—</span>;
                        const notes = comboNotesMap.get(bladeName) || [];
                        if (notes.length === 0) return <span className="text-gray-300">—</span>;
                        return (
                          <>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-medium">
                              組合
                            </span>
                            <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block z-50 w-64 p-2 bg-white border border-gray-200 rounded-lg shadow-lg text-xs text-gray-600">
                              {notes.map((n, i) => (
                                <p key={i} className="mb-1 last:mb-0">{n}</p>
                              ))}
                            </div>
                          </>
                        );
                      })()}
                    </td>}
                    {show("extras") && <td className="table-cell">
                      <div className="flex flex-wrap gap-1">
                        {row.extras.map((part, i) => (
                          <ExtraPill key={i} part={part} />
                        ))}
                      </div>
                    </td>}
                    {show("remarks") && <td className="table-cell text-gray-500 text-xs max-w-[200px]">{row.remarks}</td>}
                    <td className="table-cell">
                      <div className="relative" ref={openDropdown === row.productId ? dropdownRef : undefined}>
                        <button
                          onClick={() => setOpenDropdown(openDropdown === row.productId ? null : row.productId)}
                          className={`btn text-xs ${currentTag === "purchased" ? "btn-success" : currentTag === "wishlist" ? "btn-primary" : currentTag === "getting" ? "btn-warning" : "btn-secondary"}`}
                        >
                          <Tag className="w-3 h-3" />
                          {currentTag ? (currentTag === "purchased" ? ui.tagPurchased : currentTag === "wishlist" ? ui.tagWishlist : ui.tagGetting) : ui.tagProduct}
                        </button>
                        {openDropdown === row.productId && (
                          <div className="absolute right-0 z-50 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                            <button
                              onClick={() => { setTag(row.productId, "purchased"); setOpenDropdown(null); }}
                              className="w-full text-left px-3 py-1.5 text-xs hover:bg-green-50 text-green-700"
                            >
                              ✓ {ui.tagPurchased}
                            </button>
                            <button
                              onClick={() => { setTag(row.productId, "wishlist"); setOpenDropdown(null); }}
                              className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 text-blue-700"
                            >
                              ♡ {ui.tagWishlist}
                            </button>
                            <button
                              onClick={() => { setTag(row.productId, "getting"); setOpenDropdown(null); }}
                              className="w-full text-left px-3 py-1.5 text-xs hover:bg-yellow-50 text-yellow-700"
                            >
                              ↗ {ui.tagGetting}
                            </button>
                            {currentTag && (
                              <button
                                onClick={() => { removeTag(row.productId); setOpenDropdown(null); }}
                                className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 text-gray-500"
                              >
                                <X className="w-3 h-3 inline" /> {ui.tagNone}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500 border-t border-gray-100">
          {ui.showing} {filtered.length} {ui.of} {flatRows.length} {ui.productCount} ·{" "}
          <span className="text-green-600 font-medium">{flatRows.filter(r => getTag(r.productId) === "purchased").length} {ui.tagPurchased}</span>
          {" · "}
          <span className="text-blue-600 font-medium">{flatRows.filter(r => getTag(r.productId) === "wishlist").length} {ui.tagWishlist}</span>
          {" · "}
          <span className="text-yellow-600 font-medium">{flatRows.filter(r => getTag(r.productId) === "getting").length} {ui.tagGetting}</span>
        </div>
      </div>
    </div>
  );
}
