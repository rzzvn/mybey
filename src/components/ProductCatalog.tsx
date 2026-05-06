import { useState, useMemo } from "react";
import { Search, ExternalLink, Check, ShoppingCart } from "lucide-react";
import { products } from "../data/products";
import { bitTiers, ratchetTiers } from "../data/parts";
import { useInventory } from "../hooks/useInventory";
import type { ProductTier, BeyConfig, ProductPart } from "../data/types";

function getRatchetTier(name?: string): string {
  if (!name) return "—";
  return ratchetTiers[name] || "—";
}

function getBitTier(name?: string): string {
  if (!name) return "—";
  return bitTiers[name] || "—";
}

function partTierColor(tier: string): string {
  switch (tier) {
    case "T0": return "bg-red-100 text-red-700 border-red-200";
    case "T1": return "bg-orange-100 text-orange-700 border-orange-200";
    case "T2": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "T3": return "bg-green-100 text-green-700 border-green-200";
    case "T4": return "bg-blue-100 text-blue-700 border-blue-200";
    case "T5": return "bg-purple-100 text-purple-700 border-purple-200";
    default: return "bg-gray-100 text-gray-500 border-gray-200";
  }
}

function PartPill({ label, value, tier }: { label: string; value?: string; tier?: string }) {
  if (!value) return <span className="text-gray-300 text-xs">—</span>;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border ${tier ? partTierColor(tier) : "bg-gray-50 text-gray-400 border-gray-200"}`}>
      <span className="text-[10px] font-bold opacity-50 uppercase">{label}</span>
      {value}
      {tier && <span className="font-black opacity-60 text-[10px]">{tier}</span>}
    </span>
  );
}

function BeyRow({ bey }: { bey: BeyConfig }) {
  const ratchetTier = getRatchetTier(bey.ratchet);
  const bitTier = getBitTier(bey.bit);
  return (
    <div className="flex flex-wrap items-center gap-1.5 py-1">
      {bey.blade && <PartPill label="blade" value={bey.blade} />}
      {bey.ratchet && <PartPill label="r" value={bey.ratchet} tier={ratchetTier} />}
      {bey.bit && <PartPill label="bit" value={bey.bit} tier={bitTier} />}
    </div>
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

export default function ProductCatalog() {
  const { isOwned, toggleProductOwned, addToWishlist } = useInventory();
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search ||
        p.code.toLowerCase().includes(searchLower) ||
        p.nameEn.toLowerCase().includes(searchLower) ||
        p.nameZh.includes(search) ||
        p.beys.some(
          (b) =>
            (b.name && b.name.toLowerCase().includes(searchLower)) ||
            (b.blade && b.blade.toLowerCase().includes(searchLower)) ||
            (b.ratchet && b.ratchet.toLowerCase().includes(searchLower)) ||
            (b.bit && b.bit.toLowerCase().includes(searchLower))
        ) ||
        p.extras.some((e) => e.name.toLowerCase().includes(searchLower));
      const matchesTier = tierFilter === "All" 
        ? true 
        : tierFilter === "null" 
          ? p.tier === null 
          : p.tier === tierFilter;
      const matchesType = typeFilter === "All" || p.type === typeFilter;
      return matchesSearch && matchesTier && matchesType;
    });
  }, [search, tierFilter, typeFilter]);

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
            placeholder="Search by code, name, or part..."
            className="search-input pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="search-input w-auto" value={tierFilter} onChange={(e) => setTierFilter(e.target.value)}>
          <option value="All">All Tiers</option>
          <option value="TIER0">TIER0 — Must Buy</option>
          <option value="TIER1">TIER1 — Priority</option>
          <option value="TIER2">TIER2 — If You Have Money</option>
          <option value="BONUS">Bonus</option>
          <option value="null">Other (No Tier)</option>
        </select>
        <select className="search-input w-auto" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="All">All Types</option>
          {productTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="table-header">Tier</th>
                <th className="table-header">Code</th>
                <th className="table-header">Product Name</th>
                <th className="table-header">Price</th>
                <th className="table-header">Bey</th>
                <th className="table-header">Extras</th>
                <th className="table-header">Remarks</th>
                <th className="table-header"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((product) => {
                const owned = isOwned(product.id);
                const isMultiBey = product.beys.length > 1;
                return (
                  <tr
                    key={product.id}
                    className={`${owned ? "bg-green-50/60" : ""} hover:bg-gray-50/80 transition-colors`}
                  >
                    <td className="table-cell">
                      <span className={`tier-badge ${tierBadgeClass(product.tier)}`}>
                        {product.tier || "—"}
                      </span>
                    </td>
                    <td className="table-cell font-mono font-semibold text-sm whitespace-nowrap">{product.code}</td>
                    <td className="table-cell text-xs text-gray-500 whitespace-nowrap">
                      {product.price ? `¥${product.price.toLocaleString()}` : "—"}
                    </td>
                    <td className="table-cell">
                      <a
                        href={product.wikiUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        {product.nameEn}
                        <ExternalLink className="w-3 h-3 opacity-50" />
                      </a>
                      <div className="text-xs text-gray-400 mt-0.5">{product.nameZh}</div>
                    </td>
                    <td className="table-cell">
                      {product.beys.length === 0 && (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                      {product.beys.map((bey, i) => (
                        <div key={i} className={`${isMultiBey && i > 0 ? "border-t border-gray-100 pt-1.5 mt-1.5" : ""}`}>
                          {isMultiBey && (
                            <div className="text-xs font-bold text-gray-600 mb-0.5">{bey.name}</div>
                          )}
                          <BeyRow bey={bey} />
                        </div>
                      ))}
                    </td>
                    <td className="table-cell">
                      <div className="flex flex-wrap gap-1">
                        {product.extras.map((part, i) => (
                          <ExtraPill key={i} part={part} />
                        ))}
                      </div>
                    </td>
                    <td className="table-cell text-gray-500 text-xs max-w-[200px]">{product.remarks}</td>
                    <td className="table-cell">
                      <div className="flex gap-1">
                        <button
                          onClick={() => toggleProductOwned(product.id)}
                          className={`btn text-xs ${owned ? "btn-success" : "btn-secondary"}`}
                          title={owned ? "Mark as not owned" : "Mark as owned"}
                        >
                          <Check className={`w-3 h-3 ${owned ? "" : "opacity-50"}`} />
                          {owned ? "✓" : "Own"}
                        </button>
                        <button
                          onClick={() => addToWishlist({ productId: product.id, priority: "Medium", notes: "" })}
                          className="btn btn-secondary text-xs"
                          title="Add to wishlist"
                        >
                          <ShoppingCart className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500 border-t border-gray-100">
          Showing {filtered.length} of {products.length} products ·{" "}
          <span className="text-green-600 font-medium">{products.filter(p => isOwned(p.id)).length} owned</span>
        </div>
      </div>
    </div>
  );
}