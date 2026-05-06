import { createContext, useContext, useState, useEffect, useMemo } from "react";
import type { InventoryItem, WishlistItem, Combo } from "../data/types";
import { products } from "../data/products";

interface AppData {
  inventory: InventoryItem[];
  wishlist: WishlistItem[];
  combos: Combo[];
  githubToken: string;
  gistId: string;
  lastSync: string | null;
}

const defaultData: AppData = {
  inventory: [],
  wishlist: [],
  combos: [],
  githubToken: "",
  gistId: "",
  lastSync: null,
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

function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

interface InventoryContextType {
  data: AppData;
  stats: {
    totalProducts: number;
    totalParts: number;
    ownedCount: number;
    wishlistCount: number;
    comboCount: number;
  };
  toggleProductOwned: (productId: string) => void;
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (productId: string) => void;
  addCombo: (combo: Combo) => void;
  updateCombo: (combo: Combo) => void;
  removeCombo: (id: string) => void;
  setGithubToken: (token: string) => void;
  setGistId: (id: string) => void;
  isOwned: (productId: string) => boolean;
  syncToGist: () => Promise<void>;
  syncFromGist: () => Promise<void>;
}

export const InventoryContext = createContext<InventoryContextType | null>(null);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(loadData);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const stats = useMemo(() => {
    return {
      totalProducts: products.length,
      totalParts: Array.from(new Set(products.flatMap(p => p.parts.map(part => `${part.type}:${part.name}`)))).length,
      ownedCount: data.inventory.filter(i => i.owned).length,
      wishlistCount: data.wishlist.length,
      comboCount: data.combos.length,
    };
  }, [data]);

  const setField = <K extends keyof AppData>(key: K, value: AppData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleProductOwned = (productId: string) => {
    setData((prev) => {
      const existing = prev.inventory.find((i) => i.productId === productId);
      let next: InventoryItem[];
      if (existing) {
        next = prev.inventory.map((i) =>
          i.productId === productId ? { ...i, owned: !i.owned } : i
        );
      } else {
        next = [...prev.inventory, { productId, owned: true, acquiredDate: new Date().toISOString().split("T")[0] }];
      }
      return { ...prev, inventory: next };
    });
  };

  const isOwned = (productId: string) => {
    return data.inventory.some((i) => i.productId === productId && i.owned);
  };

  const addToWishlist = (item: WishlistItem) => {
    setData((prev) => ({
      ...prev,
      wishlist: [...prev.wishlist.filter((w) => w.productId !== item.productId), item],
    }));
  };

  const removeFromWishlist = (productId: string) => {
    setData((prev) => ({
      ...prev,
      wishlist: prev.wishlist.filter((w) => w.productId !== productId),
    }));
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

  const syncToGist = async () => {
    if (!data.githubToken || !data.gistId) return;
    const payload = {
      files: {
        "bey-catalog-data.json": {
          content: JSON.stringify({
            inventory: data.inventory,
            wishlist: data.wishlist,
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
        inventory: parsed.inventory || prev.inventory,
        wishlist: parsed.wishlist || prev.wishlist,
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
        toggleProductOwned,
        addToWishlist,
        removeFromWishlist,
        addCombo,
        updateCombo,
        removeCombo,
        setGithubToken: (t) => setField("githubToken", t),
        setGistId: (id) => setField("gistId", id),
        isOwned,
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
