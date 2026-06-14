import { useState, useMemo, useRef, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Search, ExternalLink, ArrowUpDown, ArrowUp, ArrowDown, Tag, X, Columns3, LayoutList, LayoutGrid, Palette } from "lucide-react";
import { products, findProductById } from "../data/products";
import { bitTiers, ratchetTiers, getBladeTierResolved } from "../data/parts";
import { colorVariants } from "../data/colorVariants";
// ColorVariants not imported here—runtime resolution uses getBladeVariantImageUrl in partImages.ts
import { getBladeVariantImageUrl } from "../data/partImages";
import { bladeNamesZh, bladeNamesZhTw, assistBladeNamesZh, assistBladeNamesZhTw, typeLabelsZh, tierLabelsZh, ui, productNamesZhTw, getDualZhName } from "../data/i18n";
import { useInventory } from "../hooks/useInventory";
import { commonCombos } from "../data/communityCombos";
import type { ProductTier, ProductPart, BeyConfig, Product } from "../data/types";
import { TIER_LABEL_MAP, TIER_META, TIER_RANK_MAP } from "../data/types";
import PartImage from "./PartImage";
import ProductCard from "./ProductCard";
import ProductDetailModal from "./ProductDetailModal";

function getBladeTier(name?: string): string {
  if (!name) return "—";
  return getBladeTierResolved(name) || "—";
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
  return TIER_META.find(t => t.code === tier)?.color ?? "bg-gray-100 text-gray-500 border-gray-200";
}

function TierBadge({ tier }: { tier: string }) {
  if (tier === "—") return <span className="text-gray-300 text-xs">—</span>;
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold border ${partTierColor(tier)}`}>
      {TIER_LABEL_MAP[tier] ?? tier}
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

/** Sort indicator arrow — extracted to module level to avoid render-body component errors. */
function SortIndicator({ sortKey, sortDir, column: col }: { sortKey: SortKey; sortDir: SortDir; column: string }) {
  if (sortKey !== col) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
  return sortDir === "asc"
    ? <ArrowUp className="w-3 h-3 text-blue-600" />
    : <ArrowDown className="w-3 h-3 text-blue-600" />;
}

/** A flattened row: either a single product row or one bey from an expanded pack */
export interface FlatRow {
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
  variantOf?: string;       // parent product ID for color-variant sub-products (e.g. "UX-16")
  colorLabel?: string;      // e.g. "Metallic Coat: Cyan"
  colorSlug?: string;       // e.g. "metallic-cyan"
  variantCount?: number;    // number of color variants this product has (set on parent row)
}

function flattenProducts(products: Product[]): FlatRow[] {
  const rows: FlatRow[] = [];

  // Build a map: parentId → variant sub-products for variant count badges
  const variantMap = new Map<string, Product[]>();
  for (const p of products) {
    if (p.variantOf) {
      if (!variantMap.has(p.variantOf)) variantMap.set(p.variantOf, []);
      variantMap.get(p.variantOf)!.push(p);
    }
  }

  // Build a normalized lookup: "bladeName:normalizedProductId" → { colorLabel, colorSlug }
  // This resolves color variants for pack sub-rows (e.g. BX-27-1 → Sphinx Cowl green variant)
  // where the product entry doesn't carry colorLabel/colorSlug but colorVariants does.
  // Normalization: BX-27-01 → BX-27-1 (strip leading zeros after last dash)
  const normalizeId = (id: string) => id.replace(/-(\d+)$/, (_, d) => `-${parseInt(d, 10)}`);
  const colorVariantLookup = new Map<string, { colorLabel: string; colorSlug: string }>();
  for (const [bladeName, variants] of Object.entries(colorVariants)) {
    for (const v of variants) {
      const normalizedId = normalizeId(v.productId);
      colorVariantLookup.set(`${bladeName}:${normalizedId}`, { colorLabel: v.colorLabel, colorSlug: v.colorSlug });
    }
  }

  for (const p of products) {
    // Skip variant sub-products — they're shown via expand on the parent
    if (p.variantOf) continue;

    const twName = productNamesZhTw[p.id] || p.nameZh;
    const variants = variantMap.get(p.id) || [];
    const variantCount = variants.length;

    if (p.beys.length > 1) {
      // Expand each bey into its own row (Packs, multi-bey Sets, Collaborations, etc.)
      p.beys.forEach((bey, i) => {
        const subId = `${p.id}-${i + 1}`;
        const subTwName = productNamesZhTw[subId] || productNamesZhTw[p.id] || twName;
        // Resolve colorSlug from colorVariants if the bey doesn't have one
        let colorLabel = bey.colorLabel;
        let colorSlug = bey.colorSlug;
        if (!colorSlug && bey.blade) {
          const resolved = colorVariantLookup.get(`${bey.blade}:${normalizeId(subId)}`);
          if (resolved) {
            colorLabel = resolved.colorLabel;
            colorSlug = resolved.colorSlug;
          }
        }
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
          variantCount: i === 0 ? variantCount : undefined,
          colorLabel,
          colorSlug,
        });
      });
    } else {
      // Single row for single-bey or no-bey products
      const bey0 = p.beys.length > 0 ? p.beys[0] : null;
      // Resolve colorSlug from colorVariants if the bey doesn't have one
      let colorLabel = bey0?.colorLabel;
      let colorSlug = bey0?.colorSlug;
      if (!colorSlug && bey0?.blade) {
        const resolved = colorVariantLookup.get(`${bey0.blade}:${normalizeId(p.id)}`);
        if (resolved) {
          colorLabel = resolved.colorLabel;
          colorSlug = resolved.colorSlug;
        }
      }
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
        bey: bey0,
        extras: p.extras,
        remarks: p.remarks,
        type: p.type,
        isPackExpansion: false,
        variantCount: variantCount || undefined,
        colorLabel,
        colorSlug,
      });
    }

    // Also add variant sub-rows (hidden by default, shown on expand)
    for (const v of variants) {
      const vTwName = productNamesZhTw[v.id] || v.nameZh;
      const vBey = v.beys.length > 0 ? v.beys[0] : null;
      rows.push({
        id: v.id,
        productId: v.id,
        code: v.code,
        tier: v.tier,
        nameZh: v.nameZh,
        nameZhTw: vTwName,
        nameEn: v.nameEn,
        wikiUrl: v.wikiUrl,
        price: undefined, // variant sub-products don't show price
        bey: vBey ? { ...vBey, colorLabel: vBey.colorLabel, colorSlug: vBey.colorSlug } : null,
        extras: [],
        remarks: "",
        type: v.type,
        isPackExpansion: false,
        variantOf: v.variantOf,
        colorLabel: vBey?.colorLabel,
        colorSlug: vBey?.colorSlug,
      });
    }
  }
  return rows;
}

function tierSortValue(tier: string): number {
  if (tier === "—") return 99;
      const order = TIER_RANK_MAP;
  return order[tier] ?? 99;
}

export default function ProductCatalog() {
  const { code } = useParams<{ code?: string }>();
  const location = useLocation();
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
  const [search, setSearch] = useState(() => {
    // Accept search pre-fill from location state (e.g. from Parts page navigation)
    const locState = location.state as { searchQuery?: string } | null;
    return locState?.searchQuery || "";
  });
  const [tierFilter, setTierFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [sortKey, setSortKey] = useState<SortKey>("none");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [tagFilter, setTagFilter] = useState<string>("all");

  // View mode — persisted in localStorage, default to card on mobile
  const [viewMode, setViewMode] = useState<"table" | "card">(() => {
    try {
      const saved = localStorage.getItem("bey-catalog-view");
      if (saved === "card" || saved === "table") return saved;
    } catch { /* localStorage unavailable */ }
    // Default to card on small screens, table on desktop
    return window.innerWidth < 768 ? "card" : "table";
  });

  // Column visibility — persisted in localStorage
  const ALL_COLUMNS = ["image", "tier", "code", "name", "price", "blade", "assistBlade", "ratchet", "bit", "comboRemarks", "extras", "remarks"] as const;
  type ColumnKey = typeof ALL_COLUMNS[number];
  const DEFAULT_VISIBLE: ColumnKey[] = ["image", "tier", "code", "name", "blade", "ratchet", "bit"];
  const [visibleCols, setVisibleCols] = useState<ColumnKey[]>(() => {
    try {
      const saved = localStorage.getItem("bey-catalog-columns");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Migrate old column keys: bladeTier/ratchetTier/bitTier are now merged into blade/ratchet/bit
          const migrated = parsed.filter((c: string) => c !== "bladeTier" && c !== "ratchetTier" && c !== "bitTier");
          // Deduplicate in case both "blade" and "bladeTier" were visible
          return [...new Set(migrated)] as ColumnKey[];
        }
      }
    } catch { /* localStorage unavailable */ }
    return DEFAULT_VISIBLE;
  });
  const [showColMenu, setShowColMenu] = useState(false);
  const colMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("bey-catalog-columns", JSON.stringify(visibleCols));
  }, [visibleCols]);

  useEffect(() => {
    localStorage.setItem("bey-catalog-view", viewMode);
  }, [viewMode]);

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
  const [modalRow, setModalRow] = useState<FlatRow | null>(null);

  // Variant visibility — global toggle and per-product expand
  const [showVariants, setShowVariants] = useState(false);
  const [expandedVariants, setExpandedVariants] = useState<Set<string>>(new Set());
  const [variantPickerFor, setVariantPickerFor] = useState<string | null>(null); // parent product being tagged

  // Track which product codes have been auto-opened (prevents re-opening after dismiss)
  const autoOpenedRef = useRef<Set<string>>(new Set());

  // Deep-linking: auto-open modal when URL has a product code (only once per code)
  // Also supports highlightProductId from location state (e.g. from Parts page navigation)
  const flatRows = useMemo(() => flattenProducts(products), []);
  const highlightProductId = useMemo(() => {
    const locState = location.state as { highlightProductId?: string } | null;
    return locState?.highlightProductId || null;
  }, [location.state]);

  useEffect(() => {
    if (!code || modalRow) return;
    // Don't re-auto-open a code the user has already dismissed
    const codeLower = code.toLowerCase();
    if (autoOpenedRef.current.has(codeLower)) return;

    // If we have a highlightProductId (e.g. "CX-17-2"), find that exact row first
    if (highlightProductId) {
      const highlightLower = highlightProductId.toLowerCase();
      const highlightRow = flatRows.find(r => r.productId.toLowerCase() === highlightLower || r.id.toLowerCase() === highlightLower);
      if (highlightRow) {
        autoOpenedRef.current.add(codeLower);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setModalRow(highlightRow);
        return;
      }
    }

    // Fallback: try exact match first, then prefix match (for packs: G2755 → G2755-1)
    const row = flatRows.find(r => r.code.toLowerCase() === codeLower || r.productId.toLowerCase() === codeLower)
      || flatRows.find(r => r.code.toLowerCase().startsWith(codeLower + "-") || r.productId.toLowerCase().startsWith(codeLower + "-"));
    if (row) {
      autoOpenedRef.current.add(codeLower);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setModalRow(row);
    }
  }, [code, flatRows, modalRow, highlightProductId]);

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
      // Hide variant sub-rows unless variants are shown or their parent is expanded
      if (row.variantOf) {
        const parentExpanded = expandedVariants.has(row.variantOf);
        if (!showVariants && !parentExpanded) return false;
      }

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
        (row.colorLabel && row.colorLabel.toLowerCase().includes(searchLower)) ||
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
  }, [search, tierFilter, typeFilter, sortKey, sortDir, tagFilter, flatRows, getTag, showVariants, expandedVariants]);

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
                  {col === "image" ? ui.image :
                   col === "tier" ? ui.tier :
                   col === "code" ? ui.code :
                   col === "name" ? ui.productName :
                   col === "price" ? ui.price :
                   col === "blade" ? ui.blade :
                   col === "assistBlade" ? ui.assistBlade :
                   col === "ratchet" ? ui.ratchet :
                   col === "bit" ? ui.bit :
                   col === "comboRemarks" ? ui.comboRemarks :
                   col === "extras" ? ui.extras :
                   col === "remarks" ? ui.remarks : col}
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-0.5 border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 ${viewMode === "table" ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
            title={ui.tableView}
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("card")}
            className={`p-2 ${viewMode === "card" ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
            title={ui.cardView}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={() => setShowVariants(!showVariants)}
          className={`btn text-xs flex items-center gap-1 ${showVariants ? "btn-primary" : "btn-secondary"}`}
          title={showVariants ? ui.hideVariants : ui.showVariants}
        >
          <Palette className="w-3.5 h-3.5" />
          {showVariants ? ui.hideVariants : ui.showVariants}
        </button>
      </div>

      {viewMode === "table" ? (
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {show("image") && <th className="table-header">{ui.image}</th>}
                {show("tier") && <th className="table-header">{ui.tier}</th>}
                {show("code") && <th className="table-header">{ui.code}</th>}
                {show("name") && <th className="table-header">{ui.productName}</th>}
                {show("price") && <th className="table-header">{ui.price}</th>}
                {show("blade") && <th className="table-header cursor-pointer select-none" onClick={() => toggleSort("bladeTier")}>
                  <span className="inline-flex items-center gap-1">{ui.blade} <SortIndicator sortKey={sortKey} sortDir={sortDir} column="bladeTier" /></span>
                </th>}
                {show("assistBlade") && <th className="table-header">{ui.assistBlade}</th>}
                {show("ratchet") && <th className="table-header cursor-pointer select-none" onClick={() => toggleSort("ratchetTier")}>
                  <span className="inline-flex items-center gap-1">{ui.ratchet} <SortIndicator sortKey={sortKey} sortDir={sortDir} column="ratchetTier" /></span>
                </th>}
                {show("bit") && <th className="table-header cursor-pointer select-none" onClick={() => toggleSort("bitTier")}>
                  <span className="inline-flex items-center gap-1">{ui.bit} <SortIndicator sortKey={sortKey} sortDir={sortDir} column="bitTier" /></span>
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
                    {show("image") && <td className="table-cell">
                      {row.bey?.blade ? (
                        <PartImage type="Blade" name={row.bey.blade} tier={getBladeTier(row.bey.blade)} colorSlug={row.colorSlug} className="w-12 h-12" />
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>}
                    {show("tier") && <td className="table-cell">
                      <span className={`tier-badge ${tierBadgeClass(row.tier)}`}>
                        {row.tier ? tierLabelsZh[row.tier] || row.tier : "—"}
                      </span>
                    </td>}
                    {show("code") && <td className="table-cell font-mono font-semibold text-sm whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {row.code}
                        {(row.variantCount ?? 0) > 0 && !row.variantOf && (
                          <button
                            onClick={() => {
                              const next = new Set(expandedVariants);
                              if (next.has(row.productId)) next.delete(row.productId);
                              else next.add(row.productId);
                              setExpandedVariants(next);
                            }}
                            className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                          >
                            <Palette className="w-3 h-3" />
                            {row.variantCount}
                          </button>
                        )}
                        {row.colorLabel && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                            {row.colorLabel}
                          </span>
                        )}
                      </div>
                    </td>}
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
                        <div className="flex items-center gap-1.5">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{getDualZhName(bladeNamesZh[row.bey.blade] || row.bey.blade, bladeNamesZhTw[row.bey.blade])}</div>
                            {bladeNamesZh[row.bey.blade] && (
                              <div className="text-xs text-gray-400">{row.bey.blade}</div>
                            )}
                          </div>
                          <TierBadge tier={getBladeTier(row.bey.blade)} />
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
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
                    {show("ratchet") && <td className="table-cell">
                      {row.bey?.ratchet ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-sm">{row.bey.ratchet}</span>
                          <TierBadge tier={getRatchetTier(row.bey.ratchet)} />
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>}
                    {show("bit") && <td className="table-cell">
                      {row.bey?.bit ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-sm font-semibold">{row.bey.bit}</span>
                          <TierBadge tier={getBitTier(row.bey.bit)} />
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
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
                        {variantPickerFor === row.productId ? (
                          // ── Step 1: Variant picker ──
                          <div className="absolute right-0 bottom-full mb-1 z-50 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                            <div className="px-3 pb-1.5 text-xs font-semibold text-gray-700 border-b border-gray-100 mb-1">
                              {ui.whichVariant}
                            </div>
                            {flatRows
                              .filter(r => r.variantOf === row.productId)
                              .map(vr => (
                                <button
                                  key={vr.productId}
                                  onClick={() => {
                                    setOpenDropdown(vr.productId);
                                    setVariantPickerFor(null);
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center gap-2"
                                >
                                  {vr.bey?.blade && (
                                    <img
                                      src={getBladeVariantImageUrl(vr.bey.blade, vr.colorSlug || "standard")}
                                      alt={vr.colorLabel}
                                      className="w-8 h-8 object-contain shrink-0"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = `/parts/blades/${vr.bey!.blade!.replace(/[- ]/g, "")}.webp`;
                                        (e.target as HTMLImageElement).onerror = null;
                                      }}
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="font-mono font-medium text-gray-900">{vr.code}</div>
                                    {vr.colorLabel && <div className="text-gray-500 truncate">{vr.colorLabel}</div>}
                                  </div>
                                </button>
                              ))}
                            <button
                              onClick={() => setVariantPickerFor(null)}
                              className="w-full text-left px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-50 border-t border-gray-100 mt-1"
                            >
                              <X className="w-3 h-3 inline" /> {ui.cancel}
                            </button>
                          </div>
                        ) : null}
                        <button
                           onClick={() => {
                            if ((row.variantCount ?? 0) > 0 && !row.variantOf) {
                              // Product has variants — show variant picker first
                              setVariantPickerFor(variantPickerFor === row.productId ? null : row.productId);
                            } else {
                              setOpenDropdown(openDropdown === row.productId ? null : row.productId);
                            }
                          }}
                          className={`btn text-xs ${currentTag === "purchased" ? "btn-success" : currentTag === "wishlist" ? "btn-primary" : currentTag === "getting" ? "btn-warning" : "btn-secondary"}`}
                        >
                          <Tag className="w-3 h-3" />
                          {currentTag ? (currentTag === "purchased" ? ui.tagPurchased : currentTag === "wishlist" ? ui.tagWishlist : ui.tagGetting) : ui.tagProduct}
                          {(row.variantCount ?? 0) > 0 && !currentTag ? (
                            <span className="ml-1 text-[10px] opacity-60">🎨{row.variantCount}</span>
                          ) : null}
                        </button>
                        {openDropdown === row.productId && (
                          <div className="absolute right-0 z-50 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
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
                            {/* Tag All sub-items for multi-bey products */}
                            {(() => {
                              const product = findProductById(row.productId);
                              if (product && product.beys.length > 1) {
                                const subIds = product.beys.map((_, i) => `${product.id}-${i + 1}`);
                                return (
                                  <>
                                    <div className="border-t border-gray-100 my-1" />
                                    <button
                                      onClick={() => { subIds.forEach(id => setTag(id, "purchased")); setOpenDropdown(null); }}
                                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-green-50 text-green-700 font-medium"
                                    >
                                      ✓ {ui.tagAllPurchased || `Tag All → ${ui.tagPurchased}`}
                                    </button>
                                    <button
                                      onClick={() => { subIds.forEach(id => setTag(id, "wishlist")); setOpenDropdown(null); }}
                                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 text-blue-700 font-medium"
                                    >
                                      ♡ {ui.tagAllWishlist || `Tag All → ${ui.tagWishlist}`}
                                    </button>
                                    <button
                                      onClick={() => { subIds.forEach(id => setTag(id, "getting")); setOpenDropdown(null); }}
                                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-yellow-50 text-yellow-700 font-medium"
                                    >
                                      ↗ {ui.tagAllGetting || `Tag All → ${ui.tagGetting}`}
                                    </button>
                                  </>
                                );
                              }
                              return null;
                            })()}
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
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((row) => {
              const currentTag = getTag(row.productId);
              return (
                <ProductCard
                  key={row.id}
                  row={row}
                  currentTag={currentTag ?? undefined}
                  onClick={() => setModalRow(row)}
                />
              );
            })}
          </div>
          <div className="px-4 py-3 text-xs text-gray-500">
            {ui.showing} {filtered.length} {ui.of} {flatRows.length} {ui.productCount} ·{" "}
            <span className="text-green-600 font-medium">{flatRows.filter(r => getTag(r.productId) === "purchased").length} {ui.tagPurchased}</span>
            {" · "}
            <span className="text-blue-600 font-medium">{flatRows.filter(r => getTag(r.productId) === "wishlist").length} {ui.tagWishlist}</span>
            {" · "}
            <span className="text-yellow-600 font-medium">{flatRows.filter(r => getTag(r.productId) === "getting").length} {ui.tagGetting}</span>
          </div>
        </>
      )}

      {/* Product detail modal */}
      {modalRow && (
        <ProductDetailModal
          row={modalRow}
          currentTag={getTag(modalRow.productId) ?? undefined}
          onSetTag={setTag}
          onRemoveTag={removeTag}
          onToggleDropdown={(id) => setOpenDropdown(openDropdown === id ? null : id)}
          openDropdown={openDropdown}
          dropdownRef={dropdownRef}
          comboNotesMap={comboNotesMap}
          onClose={() => setModalRow(null)}
        />
      )}
    </div>
  );
}
