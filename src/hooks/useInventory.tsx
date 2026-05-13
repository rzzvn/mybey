import { createContext, useContext, useState, useEffect, useMemo } from "react";
import type { TaggedItem, ProductTag, Combo } from "../data/types";
import { products } from "../data/products";

interface AppData {
  tags: TaggedItem[];
  combos: Combo[];
  githubToken: string;
  gistId: string;
  lastSync: string | null;
  // Legacy fields for migration
  inventory: { productId: string; owned: boolean; acquiredDate?: string; notes?: string }[];
  wishlist: { productId: string; priority: string; notes: string }[];
}

const defaultData: AppData = {
  tags: [],
  combos: [],
  githubToken: "",
  gistId: "",
  lastSync: null,
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
  addCombo: (combo: Combo) => void;
  updateCombo: (combo: Combo) => void;
  removeCombo: (id: string) => void;
  setGithubToken: (token: string) => void;
  setGistId: (id: string) => void;
  syncToGist: () => Promise<void>;
  syncFromGist: () => Promise<void>;
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

  const setField = <K extends keyof AppData>(key: K, value: AppData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const syncToGist = async () => {
    if (!data.githubToken || !data.gistId) return;
    const payload = {
      files: {
        "bey-catalog-data.json": {
          content: JSON.stringify({
            tags: data.tags,
            combos: data.combos,
          }, null, 2),
        },
      },
    };
    await fetch(`https://api.github.com/gists/${data.gistId}`, {
      method: "PATCH",
      headers: {
        Authorization: `token ${data.githubToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    setField("lastSync", new Date().toISOString());
  };

  const syncFromGist = async () => {
    if (!data.githubToken || !data.gistId) return;
    const res = await fetch(`https://api.github.com/gists/${data.gistId}`, {
      headers: { Authorization: `token ${data.githubToken}` },
    });
    const gist = await res.json();
    const content = gist.files["bey-catalog-data.json"]?.content;
    if (content) {
      const parsed = JSON.parse(content);
      setData((prev) => ({
        ...prev,
        tags: parsed.tags || prev.tags,
        combos: parsed.combos || prev.combos,
        lastSync: new Date().toISOString(),
      }));
    }
  };

  return (
    <InventoryContext.Provider
      value={{
        data,
        stats,
        setTag,
        getTag,
        removeTag,
        addCombo,
        updateCombo,
        removeCombo,
        setGithubToken: (t) => setField("githubToken", t),
        setGistId: (id) => setField("gistId", id),
        syncToGist,
        syncFromGist,
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
