/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useMemo } from "react";
import type { TaggedItem, ProductTag, Combo, CostsMap, CurrencyCode, ExcludedPart, ManualPart } from "../data/types";
import { products, findProductById, parseBeyIndex } from "../data/products";
import { useSync } from "./useSync";
import type { SyncStatus } from "./useSync";

interface AppData {
  tags: TaggedItem[];
  combos: Combo[];
  syncCode: string;
  uid: string;
  lastCloudSync: string | null;
  costs: CostsMap;
  currency: CurrencyCode;
  excludedParts: ExcludedPart[];
  manualParts: ManualPart[];
  // Legacy fields for migration
  inventory: { productId: string; owned: boolean; acquiredDate?: string; notes?: string }[];
  wishlist: { productId: string; priority: string; notes: string }[];
}

const defaultData: AppData = {
  tags: [],
  combos: [],
  syncCode: "",
  uid: "",
  lastCloudSync: null,
  costs: {},
  currency: "HKD",
  excludedParts: [],
  manualParts: [],
  inventory: [],
  wishlist: [],
};

const STORAGE_KEY = "bey-catalog-data";

function loadData(): AppData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { ...defaultData };
  try {
    return { ...defaultData, ...JSON.parse(raw) };
  } catch {
    return { ...defaultData };
  }
}

function migrateIfNeeded(data: AppData): AppData {
  // If tags are already populated, no migration needed
  if (data.tags.length > 0) return data;

  const tags: TaggedItem[] = [];

  // Migrate inventory: owned=true → "purchased"
  if (data.inventory && Array.isArray(data.inventory)) {
    for (const item of data.inventory) {
      if (item.owned) {
        tags.push({ productId: item.productId, tag: "purchased" });
      }
    }
  }

  // Migrate wishlist → "wishlist" tag
  if (data.wishlist && Array.isArray(data.wishlist)) {
    for (const item of data.wishlist) {
      // Don't duplicate if already purchased
      if (!tags.some((t) => t.productId === item.productId)) {
        tags.push({ productId: item.productId, tag: "wishlist" });
      }
    }
  }

  return { ...data, tags };
}

function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

interface InventoryContextType {
  data: AppData;
  stats: {
    totalProducts: number;
    totalParts: number;
    purchasedCount: number;
    wishlistCount: number;
    gettingCount: number;
    comboCount: number;
  };
  setTag: (productId: string, tag: ProductTag | null) => void;
  getTag: (productId: string) => ProductTag | null;
  removeTag: (productId: string) => void;
  moveTag: (productId: string, newTag: ProductTag) => void;
  moveAllToPurchased: (productIds: string[]) => void;
  addCombo: (combo: Combo) => void;
  updateCombo: (combo: Combo) => void;
  removeCombo: (id: string) => void;
  importAppData: (imported: Partial<AppData>) => void;
  getCost: (productId: string) => number | undefined;
  setCost: (productId: string, amount: number) => void;
  removeCost: (productId: string) => void;
  clearAllCosts: () => void;
  setCurrency: (code: CurrencyCode) => void;
  // Excluded parts & manual parts
  excludedParts: ExcludedPart[];
  manualParts: ManualPart[];
  addExcludedPart: (productId: string, partKey: string) => void;
  removeExcludedPart: (productId: string, partKey: string) => void;
  addManualPart: (partKey: string, note?: string) => void;
  removeManualPart: (partKey: string, note?: string) => void;
  // Sync Code (cloud sync)
  syncStatus: SyncStatus;
  syncCode: string | null;
  syncError: string | null;
  generateSyncCode: () => Promise<void>;
  enterSyncCode: (code: string) => Promise<void>;
  disconnectSync: () => void;
}

export const InventoryContext = createContext<InventoryContextType | null>(null);

/** Migrate CX-18 → CX-18-01 for any user who tagged CX-18 in their inventory.
 *  CX-18 was split into 3 color variants (Red/Blue/Green); default to Red (01). */
function migrateCX18(data: AppData): AppData {
  const hasCX18 = data.tags.some(t => t.productId === "CX-18");
  if (!hasCX18) return data;
  return {
    ...data,
    tags: data.tags.map(t =>
      t.productId === "CX-18" ? { ...t, productId: "CX-18-01" } : t
    ),
  };
}

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => {
    let loaded = loadData();
    loaded = migrateIfNeeded(loaded);
    loaded = migrateCX18(loaded);
    return loaded;
  });

  useEffect(() => {
    saveData(data);
  }, [data]);

  const stats = useMemo(() => {
    return {
      totalProducts: products.length,
      totalParts: Array.from(new Set(products.flatMap(p => [
        ...p.beys.flatMap(b => [
          b.blade ? `Blade:${b.blade}` : null,
          b.ratchet ? `Ratchet:${b.ratchet}` : null,
          b.bit ? `Bit:${b.bit}` : null,
        ].filter(Boolean) as string[]),
        ...p.extras.map(e => `${e.type}:${e.name}`),
      ]))).length,
      purchasedCount: data.tags.filter(t => t.tag === "purchased").length,
      wishlistCount: data.tags.filter(t => t.tag === "wishlist").length,
      gettingCount: data.tags.filter(t => t.tag === "getting").length,
      comboCount: data.combos.length,
    };
  }, [data]);

  const setTag = (productId: string, tag: ProductTag | null) => {
    if (tag === null) { removeTag(productId); return; }
    setData((prev) => {
      const existing = prev.tags.findIndex((t) => t.productId === productId);
      if (existing >= 0) {
        const next = [...prev.tags];
        next[existing] = { ...next[existing], tag };
        return { ...prev, tags: next };
      }
      return { ...prev, tags: [...prev.tags, { productId, tag }] };
    });
  };

  const removeTag = (productId: string) => {
    setData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t.productId !== productId),
      // Cascade: delete all excludedParts for this productId
      excludedParts: prev.excludedParts.filter((e) => e.productId !== productId),
    }));
  };

  const moveTag = (productId: string, newTag: ProductTag) => {
    setData((prev) => ({
      ...prev,
      tags: prev.tags.map((t) =>
        t.productId === productId ? { ...t, tag: newTag } : t
      ),
    }));
  };

  const moveAllToPurchased = (productIds: string[]) => {
    const idSet = new Set(productIds);
    setData((prev) => ({
      ...prev,
      tags: prev.tags.map((t) =>
        idSet.has(t.productId) && t.tag === "getting"
          ? { ...t, tag: "purchased" }
          : t
      ),
    }));
  };

  const getTag = (productId: string): ProductTag | null => {
    return data.tags.find((t) => t.productId === productId)?.tag ?? null;
  };

  const addCombo = (combo: Combo) => {
    setData((prev) => ({
      ...prev,
      combos: [...prev.combos, combo],
    }));
  };

  const updateCombo = (combo: Combo) => {
    setData((prev) => ({
      ...prev,
      combos: prev.combos.map((c) => (c.id === combo.id ? combo : c)),
    }));
  };

  const removeCombo = (id: string) => {
    setData((prev) => ({
      ...prev,
      combos: prev.combos.filter((c) => c.id !== id),
    }));
  };

  const importAppData = (imported: Partial<AppData>) => {
    setData((prev) => ({
      ...prev,
      tags: Array.isArray(imported.tags) ? imported.tags : prev.tags,
      combos: Array.isArray(imported.combos) ? imported.combos : prev.combos,
      syncCode: imported.syncCode ?? prev.syncCode,
      uid: imported.uid ?? prev.uid,
      lastCloudSync: imported.lastCloudSync ?? prev.lastCloudSync,
      costs: imported.costs && typeof imported.costs === "object" ? imported.costs : prev.costs,
      currency: (imported.currency as CurrencyCode) ?? prev.currency,
      excludedParts: Array.isArray(imported.excludedParts) ? imported.excludedParts : prev.excludedParts,
      manualParts: Array.isArray(imported.manualParts) ? imported.manualParts : prev.manualParts,
      // Update legacy fields too for export compatibility
      inventory: Array.isArray(imported.inventory) ? imported.inventory : prev.inventory,
      wishlist: Array.isArray(imported.wishlist) ? imported.wishlist : prev.wishlist,
    }));
  };

  const getCost = (productId: string): number | undefined => {
    return data.costs[productId];
  };

  const setCost = (productId: string, amount: number) => {
    setData((prev) => ({
      ...prev,
      costs: { ...prev.costs, [productId]: amount },
    }));
  };

  const removeCost = (productId: string) => {
    setData((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [productId]: _, ...rest } = prev.costs;
      return { ...prev, costs: rest };
    });
  };

  const clearAllCosts = () => {
    setData((prev) => ({ ...prev, costs: {} }));
  };

  const setCurrency = (code: CurrencyCode) => {
    setData((prev) => ({ ...prev, currency: code as CurrencyCode }));
  };

  // --- Excluded Parts & Manual Parts CRUD ---

  const addExcludedPart = (productId: string, partKey: string) => {
    setData((prev) => {
      // Check if already excluded
      const exists = prev.excludedParts.some(
        (e) => e.productId === productId && e.partKey === partKey
      );
      if (exists) return prev;

      const newExcluded = [...prev.excludedParts, { productId, partKey }];

      // Check auto-untag: if all parts of this product are now excluded, remove the tag
      const product = findProductById(productId);
      if (product) {
        const tag = prev.tags.find((t) => t.productId === productId);
        if (tag && (tag.tag === "purchased" || tag.tag === "getting")) {
          // Collect all parts from this product
          const allPartKeys = new Set<string>();
          const beyIndex = parseBeyIndex(productId);
          const beys = beyIndex !== null && beyIndex < product.beys.length
            ? [product.beys[beyIndex]]
            : product.beys;
          for (const bey of beys) {
            if (bey.blade) allPartKeys.add(`Blade:${bey.blade}`);
            if (bey.ratchet) allPartKeys.add(`Ratchet:${bey.ratchet}`);
            if (bey.bit) allPartKeys.add(`Bit:${bey.bit}`);
            if (bey.assistBlade) allPartKeys.add(`Assist Blade:${bey.assistBlade}`);
            if (bey.lockChip) allPartKeys.add(`Lock Chip:${bey.lockChip}`);
            if (bey.mainBlade) allPartKeys.add(`Main Blade:${bey.mainBlade}`);
            if (bey.metalBlade) allPartKeys.add(`Metal Blade:${bey.metalBlade}`);
            if (bey.overBlade) allPartKeys.add(`Over Blade:${bey.overBlade}`);
          }
          for (const extra of product.extras) {
            allPartKeys.add(`${extra.type}:${extra.name}`);
          }

          // Check if every part is excluded
          const allExcluded = Array.from(allPartKeys).every((key) =>
            newExcluded.some((e) => e.productId === productId && e.partKey === key)
          );
          if (allExcluded) {
            // Auto-untag: remove the tag AND cascade-delete all exclusions
            return {
              ...prev,
              tags: prev.tags.filter((t) => t.productId !== productId),
              excludedParts: prev.excludedParts.filter((e) => e.productId !== productId),
            };
          }
        }
      }

      return { ...prev, excludedParts: newExcluded };
    });
  };

  const removeExcludedPart = (productId: string, partKey: string) => {
    setData((prev) => ({
      ...prev,
      excludedParts: prev.excludedParts.filter(
        (e) => !(e.productId === productId && e.partKey === partKey)
      ),
    }));
  };

  const addManualPart = (partKey: string, note?: string) => {
    setData((prev) => ({
      ...prev,
      manualParts: [...prev.manualParts, { partKey, note }],
    }));
  };

  const removeManualPart = (partKey: string, note?: string) => {
    setData((prev) => ({
      ...prev,
      manualParts: prev.manualParts.filter((m) => {
        // Match by partKey+note (composite identity per spec)
        if (m.partKey !== partKey) return true;
        if (note === undefined) return m.note !== undefined;
        return m.note !== note;
      }),
    }));
  };

  // Sync Code helpers for useSync integration
  const setSyncCode = (code: string | null) => {
    setData((prev) => ({ ...prev, syncCode: code ?? "" }));
  };

  const setUid = (uid: string | null) => {
    setData((prev) => ({ ...prev, uid: uid ?? "" }));
  };

  const getLastCloudSync = () => data.lastCloudSync;

  const setLastCloudSync = (ts: string | null) => {
    setData((prev) => ({ ...prev, lastCloudSync: ts }));
  };

  // Wire useSync hook
  const sync = useSync({
    getTags: () => data.tags,
    getCombos: () => data.combos,
    getCosts: () => data.costs,
    getCurrency: () => data.currency,
    getExcludedParts: () => data.excludedParts,
    getManualParts: () => data.manualParts,
    onRemoteData: (remoteData) => {
      setData((prev) => ({
        ...prev,
        tags: remoteData.tags,
        combos: remoteData.combos,
        costs: remoteData.costs ?? {},
        currency: (remoteData.currency ?? "HKD") as CurrencyCode,
        excludedParts: remoteData.excludedParts ?? [],
        manualParts: remoteData.manualParts ?? [],
      }));
    },
    setSyncCode,
    setUid,
    getLastCloudSync,
    setLastCloudSync,
    getSyncCode: () => data.syncCode,
    getUid: () => data.uid,
  });

  return (
    <InventoryContext.Provider
      value={{
        data,
        stats,
        setTag,
        getTag,
        removeTag,
        moveTag,
        moveAllToPurchased,
        addCombo,
        updateCombo,
        removeCombo,
        importAppData,
        getCost,
        setCost,
        removeCost,
        clearAllCosts,
        setCurrency,
        excludedParts: data.excludedParts,
        manualParts: data.manualParts,
        addExcludedPart,
        removeExcludedPart,
        addManualPart,
        removeManualPart,
        syncStatus: sync.status,
        syncCode: sync.syncCode,
        syncError: sync.error,
        generateSyncCode: sync.generateCode,
        enterSyncCode: sync.enterCode,
        disconnectSync: sync.disconnect,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error("useInventory must be inside InventoryProvider");
  return ctx;
}
