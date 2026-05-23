export type ProductTier = "TIER0" | "TIER1" | "TIER2" | "BONUS" | null;
export type PartTier = "T0" | "T0.5" | "T1" | "T1.5" | "T2" | "T3" | "T4" | "T5" | null;
export type PartType = "Blade" | "Lock Chip" | "Main Blade" | "Assist Blade" | "Ratchet" | "Bit" | "Stadium" | "Launcher" | "Pass" | "Accessory";

export interface ProductPart {
  type: PartType;
  name: string;
  code?: string;
}

/** A single beyblade configuration inside a product (Blade + Ratchet + Bit) */
export interface BeyConfig {
  name: string;              // e.g., "Hells Reaper T4-70K", "Dran Buster 1-60A"
  blade?: string;            // blade name (full composite, e.g. "Hells Reaper", "Dran Buster")
  lockChip?: string;         // lock chip for Custom Line (e.g. "Hells", "Dran", "Pegasus")
  mainBlade?: string;        // main blade for Custom Line (e.g. "Reaper", "Brave", "Blast")
  assistBlade?: string;      // assist blade for Custom Line (e.g. "Turn", "Slash", "Wheel")
  ratchet?: string;          // ratchet code e.g. "1-60"
  bit?: string;              // bit code e.g. "A"
  colorLabel?: string;       // display label e.g. "Metallic Coat: Cyan", "Red Ver."
  colorSlug?: string;        // machine key e.g. "metallic-cyan", "red" — used for image lookup
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
  mainBlade?: string;       // Custom Line: main blade (e.g. "Reaper", "Brave")
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
}
