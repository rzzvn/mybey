/** Product ID → cost amount in user's chosen currency */
export type CostsMap = Record<string, number>;

/** Supported currency codes */
export type CurrencyCode = "HKD" | "USD" | "JPY" | "EUR" | "TWD" | "GBP" | "KRW" | "CNY";

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  HKD: "HK$",
  USD: "$",
  JPY: "¥",
  EUR: "€",
  TWD: "NT$",
  GBP: "£",
  KRW: "₩",
  CNY: "¥",
};

export const CURRENCY_OPTIONS: { code: CurrencyCode; symbol: string; label: string }[] = [
  { code: "HKD", symbol: "HK$", label: "港幣 HKD" },
  { code: "USD", symbol: "$", label: "美元 USD" },
  { code: "JPY", symbol: "¥", label: "日圓 JPY" },
  { code: "EUR", symbol: "€", label: "歐元 EUR" },
  { code: "TWD", symbol: "NT$", label: "新台幣 TWD" },
  { code: "GBP", symbol: "£", label: "英鎊 GBP" },
  { code: "KRW", symbol: "₩", label: "韓圜 KRW" },
  { code: "CNY", symbol: "¥", label: "人民幣 CNY" },
];

export type ProductTier = "TIER0" | "TIER1" | "TIER2" | "BONUS" | null;
export type PartTier = "T0" | "T0.5" | "T1" | "T1.5" | "T2" | "T2.5" | "T3" | "T3.5" | "T4" | "T4.5" | "T5" | "T5.5" | "T6" | null;

/** Tier metadata — single source of truth for display labels, sort order, and colors.
 *  Internal data uses T0–T6 codes. Display labels (X, S+, etc.) are resolved here.
 *  Empty tiers (T2.5, T3.5, T4.5, T5.5, T6) have no data yet but are ready for future use.
 */
export const TIER_META: { code: PartTier; label: string; rank: number; color: string }[] = [
  { code: "T0",   label: "X",  rank: 0,   color: "bg-red-100 text-red-700 border-red-200" },
  { code: "T0.5", label: "S+", rank: 1,   color: "bg-pink-100 text-pink-700 border-pink-200" },
  { code: "T1",   label: "S",  rank: 2,   color: "bg-orange-100 text-orange-700 border-orange-200" },
  { code: "T1.5", label: "A+", rank: 3,   color: "bg-amber-100 text-amber-700 border-amber-200" },
  { code: "T2",   label: "A",  rank: 4,   color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { code: "T2.5", label: "B+", rank: 5,   color: "bg-lime-100 text-lime-700 border-lime-200" },
  { code: "T3",   label: "B",  rank: 6,   color: "bg-green-100 text-green-700 border-green-200" },
  { code: "T3.5", label: "C+", rank: 7,   color: "bg-teal-100 text-teal-700 border-teal-200" },
  { code: "T4",   label: "C",  rank: 8,   color: "bg-blue-100 text-blue-700 border-blue-200" },
  { code: "T4.5", label: "D+", rank: 9,   color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { code: "T5",   label: "D",  rank: 10,  color: "bg-purple-100 text-purple-700 border-purple-200" },
  { code: "T5.5", label: "E+", rank: 11,  color: "bg-gray-200 text-gray-600 border-gray-300" },
  { code: "T6",   label: "E",  rank: 12,  color: "bg-gray-100 text-gray-500 border-gray-200" },
];

/** Lookup maps derived from TIER_META */
export const TIER_LABEL_MAP: Record<string, string> = Object.fromEntries(TIER_META.map(t => [t.code, t.label]));
export const TIER_RANK_MAP: Record<string, number> = Object.fromEntries(TIER_META.map(t => [t.code, t.rank]));
export const TIER_COLOR_MAP: Record<string, string> = Object.fromEntries(TIER_META.map(t => [t.code, t.color]));
export type PartType = "Blade" | "Lock Chip" | "Main Blade" | "Metal Blade" | "Over Blade" | "Assist Blade" | "Ratchet" | "Bit" | "Stadium" | "Launcher" | "Pass" | "Accessory";

export interface ProductPart {
  type: PartType;
  name: string;
  code?: string;
}

/** A single beyblade configuration inside a product (Blade + Ratchet + Bit)
 *  
 *  Standard Line: blade + ratchet + bit (3 parts)
 *  Custom Line (CX-01~12): blade = lockChip + mainBlade + assistBlade (5-6 parts)
 *  Custom Line Expand (CX-13+): blade = lockChip + metalBlade + overBlade + assistBlade (6 parts)
 */
export interface BeyConfig {
  name: string;              // e.g., "Hells Reaper T4-70K", "Dran Buster 1-60A"
  blade?: string;            // blade name (full composite, e.g. "Hells Reaper", "Dran Buster")
  lockChip?: string;         // lock chip for Custom Line (e.g. "Hells", "Dran", "Pegasus")
  mainBlade?: string;        // main blade for Custom Line Original — CX-01~12 (e.g. "Reaper", "Brave", "Blast")
  metalBlade?: string;        // metal blade for Custom Line Expand — CX-13+ (e.g. "Blitz", "Fortress", "Rage")
  overBlade?: string;         // over blade for Custom Line Expand — CX-13+ (e.g. "Break", "Guard", "Flow")
  assistBlade?: string;      // assist blade for Custom Line (e.g. "Turn", "Slash", "Wheel")
  ratchet?: string;           // ratchet code e.g. "1-60"
  bit?: string;               // bit code e.g. "A"
  colorLabel?: string;        // display label e.g. "Metallic Coat: Cyan", "Red Ver."
  colorSlug?: string;         // machine key e.g. "metallic-cyan", "red" — used for image lookup
}

export interface Product {
  id: string;          // e.g., "BX-23"
  code: string;        // e.g., "BX-23"
  nameEn: string;
  nameZh: string;      // Hong Kong / Cantonese name
  nameZhTw?: string;   // Taiwan / Mandarin name (if different from HK)
  tier: ProductTier;
  type: "Starter" | "Booster" | "Set" | "Stadium" | "Launcher" | "Pass" | "Pack" | "Accessory" | "Collaboration";
  /// For color-variant sub-products: the parent product ID (e.g. "UX-16")
  /// When set, the ProductCatalog collapses these under the parent
  variantOf?: string;
  /// Price in JPY (null if unknown)
  price?: number;
  /// For single bey products (Starter/Booster): one config with the bey name matching nameEn
  /// For multi-bey products (Set/Deck): multiple configs, one per bey
  beys: BeyConfig[];
  /// Additional items that aren't beyblades (stadiums, launchers, accessories)
  extras: ProductPart[];
  remarks: string;
  wikiUrl: string;
}

export interface ContainedInItem {
  productId: string;  // e.g., "CX-05-1" for sub-items or "BX-27" for single-bey products
  beyName?: string;    // e.g., "Hells Reaper T4-70K" — the full bey config name
  colorLabel?: string; // display label e.g. "Metallic Coat: Cyan"
  colorSlug?: string;  // machine key e.g. "metallic-cyan" — for image lookup
}

export interface PartEntry {
  name: string;
  type: PartType;
  tier: PartTier;
  containedIn: ContainedInItem[];
  wikiUrl?: string;
  /** Weight string from go-shoot (e.g. "41+", "6-", "3+") */
  weight?: string;
  /** Chinese description from go-shoot */
  description?: string;
  /** Attribute tags from go-shoot (e.g. ["att", "right"], ["sta", "right"]) */
  attributes?: string[];
  /** Bit-specific: burst resistance height (mm) */
  burstHeight?: number;
  /** Bit-specific: burst resistance count */
  burstCount?: number;
  /** Bit-specific: burst resistance total (may be a range string like "85<>80") */
  burstTotal?: number | string;
  /** Bit-specific: group classification (e.g. "flat", "round", "sharp", "multi") */
  group?: string;
}

/** A part excluded (given away/lost) from a specific tagged product */
export interface ExcludedPart {
  productId: string;  // e.g. "BX-27"
  partKey: string;     // e.g. "Ratchet:1-60" — format "PartType:PartName"
}

/** A manually-added loose part (gift, trade, individual purchase) */
export interface ManualPart {
  partKey: string;     // e.g. "Bit:FB" — format "PartType:PartName"
  note?: string;       // e.g. "from trade"
}

/** Source info for an owned part entry */
export interface PartSource {
  type: "product" | "manual";
  productId?: string;  // present when type="product"
  note?: string;       // present when type="manual"
}

/** A single part with all its ownership sources */
export interface PartOwnershipEntry {
  partKey: string;
  sources: PartSource[];
}

/** Result of ownership computation: enriched with per-part source detail */
export interface PartOwnershipResult {
  owned: Set<string>;         // partKeys with ≥1 source after exclusions
  getting: Set<string>;      // parts from "getting" tags only
  entries: PartOwnershipEntry[];  // full source detail for UI
  isExcluded: (productId: string, partKey: string) => boolean;
}

export type ProductTag = "purchased" | "wishlist" | "getting";

export interface TaggedItem {
  productId: string;
  tag: ProductTag;
  notes?: string;
}

export interface Combo {
  id: string;
  name: string;
  blade: string;
  lockChip?: string;        // Custom Line: lock chip (e.g. "Hells", "Dran")
  mainBlade?: string;       // Custom Line Original: main blade (e.g. "Reaper", "Brave")
  metalBlade?: string;      // Custom Line Expand: metal blade (e.g. "Blitz", "Fortress")
  overBlade?: string;       // Custom Line Expand: over blade (e.g. "Break", "Guard")
  assistBlade?: string;     // Custom Line: assist blade (e.g. "Turn", "Slash")
  ratchet: string;
  bit: string;
  status: "Planned" | "Ownable" | "Owned" | "Tested";
  rating?: 1 | 2 | 3 | 4 | 5;
  notes: string;
}

// WishlistItem merged into TaggedItem

/** Info about a specific part, used in PartDetailModal and tier list */
export interface PartInfo {
  type: string;
  name: string;
  zhName: string;
  tier: PartTier;
  containedIn: ContainedInItem[];
  weight?: string;
  description?: string;
  attributes?: string[];
  /** Bit-specific: burst resistance height (mm) */
  burstHeight?: number;
  /** Bit-specific: burst resistance count */
  burstCount?: number;
  /** Bit-specific: burst resistance total (may be a range string like "85<>80") */
  burstTotal?: number | string;
  /** Bit-specific: group classification (flat, round, sharp, multi) */
  group?: string;
}
