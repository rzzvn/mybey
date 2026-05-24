import { createContext, useContext, useState, useEffect, useMemo } from "react";
import type { TaggedItem, ProductTag, Combo, CostsMap, CurrencyCode } from "../data/types";
import { products } from "../data/products";
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
  // Sync Code (cloud sync)
  syncStatus: SyncStatus;
  syncCode: string | null;
  syncError: string | null;
  generateSyncCode: () => Promise<void>;
  enterSyncCode: (code: string) => Promise<void>;
  disconnectSync: () => void;
}

export const InventoryContext = createContext<InventoryContextType | null>(null);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => {
    const loaded = loadData();
    return migrateIfNeeded(loaded);
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
    onRemoteData: (remoteData) => {
      setData((prev) => ({
        ...prev,
        tags: remoteData.tags,
        combos: remoteData.combos,
        costs: remoteData.costs ?? {},
        currency: (remoteData.currency ?? "HKD") as CurrencyCode,
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
