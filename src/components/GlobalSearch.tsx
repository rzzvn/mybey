import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Package, GitBranch, ExternalLink } from "lucide-react";
import { products } from "../data/products";
import { buildPartRegistry } from "../data/parts";
import { getPartZhName, ui } from "../data/i18n";

interface SearchResult {
  type: "product" | "part";
  id: string;
  label: string;
  subtitle: string;
  path: string;
  icon: "product" | "part";
  relevance: number; // 0=exact, 1=prefix, 2=fuzzy
}

function stripHyphens(s: string): string {
  return s.replace(/[- ]/g, "").toLowerCase();
}

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const queryNoHyphen = stripHyphens(query);

  // Build part registry once
  const registry = useMemo(() => {
    const reg = buildPartRegistry();
    return Array.from(reg.values());
  }, []);

  // Search results
  const results = useMemo(() => {
    if (!query.trim()) return { products: [] as SearchResult[], parts: [] as SearchResult[] };

    const q = query.trim();
    const productResults: SearchResult[] = [];
    const partResults: SearchResult[] = [];
    const seenProductIds = new Set<string>();

    // ── Products ──
    for (const p of products) {
      const idNoHyphen = stripHyphens(p.id);
      const codeNoHyphen = stripHyphens(p.code);
      const nameEnLower = p.nameEn.toLowerCase();
      const nameZhLower = p.nameZh.toLowerCase();

      let relevance = 99;
      // For short queries (1-2 chars): only match exact code/ID, don't match names
      if (q.length <= 2) {
        if (idNoHyphen === queryNoHyphen || codeNoHyphen === queryNoHyphen) relevance = 0.5;
        else if (p.id.toLowerCase().startsWith(q.toLowerCase()) || p.code.toLowerCase().startsWith(q.toLowerCase())) relevance = 1.5;
      } else {
        if (idNoHyphen === queryNoHyphen || codeNoHyphen === queryNoHyphen) relevance = 0;
        else if (nameEnLower === q.toLowerCase() || nameZhLower === q) relevance = 0;
        else if (p.id.toLowerCase().startsWith(q.toLowerCase()) || p.code.toLowerCase().startsWith(q.toLowerCase())) relevance = 1;
        else if (nameEnLower.startsWith(q.toLowerCase()) || nameZhLower.startsWith(q)) relevance = 1;
        else if (nameEnLower.includes(q.toLowerCase()) || nameZhLower.includes(q)) relevance = 2;
        else {
          // Check beys
          for (const bey of p.beys) {
            if (bey.blade?.toLowerCase().includes(q.toLowerCase()) ||
                bey.ratchet?.toLowerCase().includes(q.toLowerCase()) ||
                bey.bit?.toLowerCase().includes(q.toLowerCase()) ||
                bey.name.toLowerCase().includes(q.toLowerCase())) {
              relevance = 2.5;
              break;
            }
          }
        }
      }

      if (relevance < 99 && !seenProductIds.has(p.id)) {
        seenProductIds.add(p.id);
        // Use id (not code) for display — sub-products like BXG-57-01 have unique ids
        const displayCode = p.id;
        productResults.push({
          type: "product",
          id: p.id,
          label: `${displayCode} ${p.nameEn}`,
          subtitle: p.nameZh,
          path: p.variantOf ? `/products/${p.variantOf}` : `/products/${p.code}`,
          icon: "product",
          relevance,
        });
      }
    }

    // ── Parts ──
    for (const part of registry) {
      const zhName = getPartZhName(part);
      const nameLower = part.name.toLowerCase();
      const zhLower = zhName.toLowerCase();
      const typeLower = part.type.toLowerCase();

      let relevance = 99;
      // For very short queries (1-2 chars), prefer bits and blades (code-like matches)
      if (q.length <= 2) {
        // Exact bit/ratchet code match → highest priority
        if (nameLower === q.toLowerCase() || typeLower.startsWith(q.toLowerCase())) relevance = 0;
        else if (nameLower.startsWith(q.toLowerCase())) relevance = 0.5;
        else if (nameLower.includes(q.toLowerCase()) || zhLower.includes(q)) relevance = 2;
      } else {
        if (nameLower === q.toLowerCase() || zhLower === q) relevance = 0;
        else if (nameLower.startsWith(q.toLowerCase()) || zhLower.startsWith(q)) relevance = 1;
        else if (nameLower.includes(q.toLowerCase()) || zhLower.includes(q) || typeLower.includes(q.toLowerCase())) relevance = 2;
      }

      if (relevance < 99) {
        partResults.push({
          type: "part",
          id: part.name,
          label: part.name,
          subtitle: `${part.type}${part.tier ? ` · ${part.tier}` : ""}`,
          path: `/parts/${part.type}/${encodeURIComponent(part.name)}`,
          icon: "part",
          relevance,
        });
      }
    }

    // Sort by relevance then alphabetically
    const sortFn = (a: SearchResult, b: SearchResult) => {
      if (a.relevance !== b.relevance) return a.relevance - b.relevance;
      return a.label.localeCompare(b.label);
    };

    return {
      products: productResults.sort(sortFn).slice(0, 10),
      parts: partResults.sort(sortFn).slice(0, 10),
    };
  }, [query, queryNoHyphen, registry]);

  const handleSelect = useCallback((result: SearchResult) => {
    setOpen(false);
    setQuery("");
    navigate(result.path);
  }, [navigate]);

  const totalResults = results.products.length + results.parts.length;

  return (
    <>
      {/* Trigger button — shown in sidebar */}
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        title={ui.searchPlaceholder || "搜尋..."}
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">{ui.searchPlaceholder || "搜尋..."}</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-50 border border-gray-200 rounded">
          <span>⌘</span>K
        </kbd>
      </button>

      {/* Overlay / Modal */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/30 backdrop-blur-sm">
          <div
            ref={overlayRef}
            className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={ui.searchPlaceholder || "搜尋產品、零件、代號..."}
                className="flex-1 text-base bg-transparent outline-none placeholder:text-gray-400"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {!query.trim() && (
                <div className="p-8 text-center text-sm text-gray-400">
                  {ui.searchPlaceholder || "輸入關鍵字搜尋..."}
                </div>
              )}

              {query.trim() && totalResults === 0 && (
                <div className="p-8 text-center text-sm text-gray-400">
                  找不到結果
                </div>
              )}

              {/* Parts section — show first (parts are what users search most) */}
              {results.parts.length > 0 && (
                <div>
                  <div className="sticky top-0 bg-gray-50 px-4 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    {ui.parts || "零件"} ({results.parts.length})
                  </div>
                  {results.parts.map((r) => (
                    <button
                      key={`t-${r.id}`}
                      onClick={() => handleSelect(r)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0"
                    >
                      <GitBranch className="w-4 h-4 text-gray-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{r.label}</div>
                        <div className="text-xs text-gray-500 truncate">{r.subtitle}</div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Products section */}
              {results.products.length > 0 && (
                <div>
                  <div className="sticky top-0 bg-gray-50 px-4 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    {ui.products || "產品"} ({results.products.length})
                  </div>
                  {results.products.map((r) => (
                    <button
                      key={`p-${r.id}`}
                      onClick={() => handleSelect(r)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0"
                    >
                      <Package className="w-4 h-4 text-gray-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{r.label}</div>
                        <div className="text-xs text-gray-500 truncate">{r.subtitle}</div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400 flex items-center gap-3">
              <span><kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded text-[9px]">↑↓</kbd> 選擇</span>
              <span><kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded text-[9px]">Enter</kbd> 打開</span>
              <span><kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded text-[9px]">Esc</kbd> 關閉</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}