export type ProductTier = "TIER0" | "TIER1" | "TIER2" | "BONUS" | null;
export type PartTier = "T0" | "T1" | "T2" | "T3" | "T4" | "T5";
export type PartType = "Blade" | "Ratchet" | "Bit" | "Stadium" | "Launcher" | "Pass" | "Accessory";

export interface ProductPart {
  type: PartType;
  name: string;
  code?: string;
}

/** A single beyblade configuration inside a product (Blade + Ratchet + Bit) */
export interface BeyConfig {
  name: string;       // e.g., "Dran Buster", "Wizard Rod"
  blade?: string;     // blade name
  ratchet?: string;   // ratchet code e.g. "1-60"
  bit?: string;       // bit code e.g. "A"
}

export interface Product {
  id: string;          // e.g., "BX-23"
  code: string;        // e.g., "BX-23"
  nameEn: string;
  nameZh: string;
  tier: ProductTier;
  type: "Starter" | "Booster" | "Set" | "Stadium" | "Launcher" | "Pass" | "Pack" | "Accessory" | "Collaboration";
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

export interface PartEntry {
  name: string;
  type: PartType;
  tier: PartTier;
  containedIn: string[]; // product IDs
  wikiUrl?: string;
}

export interface InventoryItem {
  productId: string;
  owned: boolean;
  acquiredDate?: string;
  notes?: string;
}

export interface Combo {
  id: string;
  name: string;
  blade: string;
  ratchet: string;
  bit: string;
  status: "Planned" | "Ownable" | "Owned" | "Tested";
  rating?: 1 | 2 | 3 | 4 | 5;
  notes: string;
}

export interface WishlistItem {
  productId: string;
  priority: "High" | "Medium" | "Low";
  notes: string;
}
