import { useState, useRef, useEffect, useMemo } from "react";
import { bladeTiers, ratchetTiers, bitTiers } from "../data/parts";
import {
  bladeNamesZh,
  bladeNamesZhTw,
  bitFullNames,
  getDualZhName,
  ui,
} from "../data/i18n";
import type { PartTier } from "../data/types";
import { TIER_META, TIER_LABEL_MAP, TIER_RANK_MAP } from "../data/types";
import PartImage from "./PartImage";

function tierSortKey(tier: string | null | undefined): number {
  if (!tier) return 100;
  return TIER_RANK_MAP[tier] ?? 100;
}

function tierColorBg(tier: string | null | undefined): string {
  if (!tier) return "bg-gray-100 text-gray-500 border-gray-200";
  return TIER_META.find(t => t.code === tier)?.color ?? "bg-gray-100 text-gray-500 border-gray-200";
}

export type PartPickerType = "Blade" | "Ratchet" | "Bit";

interface PartOption {
  key: string;       // unique key for React
  name: string;      // English name (the value stored)
  zhName: string;    // Chinese display name
  tier: PartTier;
  detail?: string;   // extra info like bit full name
  hasImage: boolean; // whether to show PartImage
}

interface PartPickerProps {
  type: PartPickerType;
  value: string;          // current selected value (English name)
  onChange: (value: string) => void;
  placeholder?: string;
  ownedKeys?: Set<string>; // keys of owned parts (e.g. "Blade:Cobalt Dragoon") — shows ✓
}

function getBladeOptions(): PartOption[] {
  const seen = new Set<string>();
  const options: PartOption[] = [];
  // Add all blades from bladeTiers (has tier data)
  for (const [name, tier] of Object.entries(bladeTiers)) {
    if (seen.has(name)) continue;
    seen.add(name);
    const zh = getDualZhName(bladeNamesZh[name] || name, bladeNamesZhTw[name]);
    options.push({ key: name, name, zhName: zh, tier: tier as PartTier, hasImage: true });
  }
  // Also add blades from i18n that aren't in bladeTiers
  for (const [name, zh] of Object.entries(bladeNamesZh)) {
    if (seen.has(name)) continue;
    seen.add(name);
    const zhTw = bladeNamesZhTw[name];
    options.push({ key: name, name, zhName: getDualZhName(zh, zhTw), tier: null, hasImage: true });
  }
  // Sort by tier
  options.sort((a, b) => tierSortKey(a.tier) - tierSortKey(b.tier) || a.name.localeCompare(b.name));
  return options;
}

function getRatchetOptions(): PartOption[] {
  const options: PartOption[] = [];
  for (const [name, tier] of Object.entries(ratchetTiers)) {
    options.push({ key: name, name, zhName: name, tier: tier as PartTier, hasImage: false });
  }
  options.sort((a, b) => tierSortKey(a.tier) - tierSortKey(b.tier) || a.name.localeCompare(b.name));
  return options;
}

function getBitOptions(): PartOption[] {
  const options: PartOption[] = [];
  for (const [name, tier] of Object.entries(bitTiers)) {
    const fullName = bitFullNames[name];
    const detail = fullName ? `— ${fullName}` : undefined;
    options.push({ key: name, name, zhName: name, tier: tier as PartTier, detail, hasImage: true });
  }
  options.sort((a, b) => tierSortKey(a.tier) - tierSortKey(b.tier) || a.name.localeCompare(b.name));
  return options;
}

const OPTIONS_MAP: Record<PartPickerType, () => PartOption[]> = {
  Blade: getBladeOptions,
  Ratchet: getRatchetOptions,
  Bit: getBitOptions,
};

export default function PartPicker({ type, value, onChange, placeholder, ownedKeys }: PartPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allOptions = useMemo(() => OPTIONS_MAP[type](), [type]);

  // Filter by search query
  const filtered = useMemo(() => {
    if (!query.trim()) return allOptions;
    const q = query.toLowerCase().trim();
    return allOptions.filter(opt =>
      opt.name.toLowerCase().includes(q) || opt.zhName.toLowerCase().includes(q)
    );
  }, [allOptions, query]);

  const selected = allOptions.find(opt => opt.name === value);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Focus search input when opened
  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const partKey = (name: string) => `${type}:${name}`;

  return (
    <div ref={containerRef} className="relative">
      {/* Selected value display / trigger */}
      <button
        type="button"
        onClick={() => { setOpen(!open); setQuery(""); }}
        className={`search-input w-full text-left flex items-center gap-2 ${
          !value ? "text-gray-400" : ""
        }`}
      >
        {selected ? (
          <>
            {selected.hasImage && (
              <PartImage type={type} name={selected.name} tier={selected.tier} className="w-6 h-6 shrink-0" />
            )}
            {selected.tier && (
                <span className={`inline-flex items-center px-1 py-0.5 rounded text-[10px] font-bold border shrink-0 ${tierColorBg(selected.tier)}`}>
                  {TIER_LABEL_MAP[selected.tier!] ?? selected.tier}
                </span>
            )}
            <span className="text-sm font-medium truncate">{selected.zhName}</span>
            <span className="text-xs text-gray-400 truncate hidden sm:inline">{selected.name}</span>
            {selected.detail && (
              <span className="text-xs text-gray-400 truncate hidden md:inline">{selected.detail}</span>
            )}
          </>
        ) : (
          <span>{placeholder || ui.selectPart}</span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-[50vh] overflow-hidden flex flex-col">
          {/* Search */}
          <div className="p-2 border-b border-gray-100 shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={ui.searchParts}
              className="search-input text-sm"
              autoFocus
            />
          </div>
          {/* Options */}
          <div className="overflow-y-auto flex-1">
            {/* Clear option */}
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); setQuery(""); }}
              className="w-full px-3 py-2 text-left text-sm text-gray-400 hover:bg-gray-50 flex items-center gap-2"
            >
              ✕ {ui.clear || "清除"}
            </button>
            {filtered.map(opt => {
              const isOwned = ownedKeys?.has(partKey(opt.name));
              const isSelected = opt.name === value;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => { onChange(opt.name); setOpen(false); setQuery(""); }}
                  className={`w-full px-3 py-1.5 text-left text-sm hover:bg-blue-50 flex items-center gap-2 ${
                    isSelected ? "bg-blue-50 ring-1 ring-blue-200" : ""
                  }`}
                >
                  {opt.hasImage && (
                    <PartImage type={type} name={opt.name} tier={opt.tier} className="w-6 h-6 shrink-0" />
                  )}
                  {opt.tier && (
                    <span className={`inline-flex items-center px-1 py-0.5 rounded text-[10px] font-bold border shrink-0 ${tierColorBg(opt.tier)}`}>
                      {TIER_LABEL_MAP[opt.tier!] ?? opt.tier}
                    </span>
                  )}
                  <span className="font-medium truncate">{opt.zhName}</span>
                  <span className="text-xs text-gray-400 truncate">{opt.name}</span>
                  {opt.detail && (
                    <span className="text-xs text-gray-400 truncate hidden md:inline">{opt.detail}</span>
                  )}
                  {isOwned && (
                    <span className="ml-auto text-green-500 text-xs font-bold shrink-0">✓</span>
                  )}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="px-3 py-4 text-sm text-gray-400 text-center">{ui.noResults || "無結果"}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}