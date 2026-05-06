import { useState, useMemo } from "react";
import { Search, ExternalLink, Check, ShoppingCart } from "lucide-react";
import { products } from "../data/products";
import { bitTiers, ratchetTiers } from "../data/parts";
import { useInventory } from "../hooks/useInventory";
import type { ProductTier } from "../data/types";

export default function ProductCatalog() {
  const { isOwned, toggleProductOwned, addToWishlist } = useInventory();
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");

  const getPartTier = (part: { type: string; name: string }) => {
    if (part.type === "Ratchet") return ratchetTiers[part.name] || "T3";
    if (part.type === "Bit") return bitTiers[part.name] || "T3";
    return "T3";
  };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !search ||
        p.code.toLowerCase().includes(search.toLowerCase()) ||
        p.nameEn.toLowerCase().includes(search.toLowerCase()) ||
        p.nameZh.includes(search) ||
        p.parts.some((part) => part.name.toLowerCase().includes(search.toLowerCase()));
      const matchesTier = tierFilter === "All" || p.tier === tierFilter;
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
      default: return "bg-gray-100 text-gray-500 border-gray-200";
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
        <select
          className="search-input w-auto"
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
        >
          <option value="All">All Tiers</option>
          <option value="TIER0">TIER0 - Must Buy</option>
          <option value="TIER1">TIER1 - Priority</option>
          <option value="TIER2">TIER2 - If You Have Money</option>
          <option value="BONUS">Bonus</option>
        </select>
        <select
          className="search-input w-auto"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="All">All Types</option>
          {productTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="table-header">Tier</th>
                <th className="table-header">Code</th>
                <th className="table-header">English Name</th>
                <th className="table-header">Chinese Name</th>
                <th className="table-header">Parts</th>
                <th className="table-header">Remarks</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((product) => (
                  <tr
                    key={product.id}
                    className={`${isOwned(product.id) ? "bg-green-50/50" : ""} hover:bg-gray-50/80 transition-colors`}
                  >
                    <td className="table-cell">
                      <span className={`tier-badge ${tierBadgeClass(product.tier)}`}>
                        {product.tier || "Other"}
                      </span>
                    </td>
                    <td className="table-cell font-mono font-medium">{product.code}</td>
                    <td className="table-cell font-medium">
                      <a
                        href={product.wikiUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {product.nameEn}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="table-cell">{product.nameZh}</td>
                    <td className="table-cell">
                      <div className="flex flex-wrap gap-1">
                        {product.parts.map((part, i) => {
                          const ptTier = getPartTier(part);
                          const tierColor =
                            ptTier === "T0"
                              ? "bg-red-100 text-red-700"
                              : ptTier === "T1"
                              ? "bg-orange-100 text-orange-700"
                              : ptTier === "T2"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-600";
                          return (
                            <span
                              key={i}
                              className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${tierColor}`}
                              title={`${part.type}: ${part.name} (Tier ${ptTier})`}
                            >
                              {part.name}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="table-cell text-gray-500 text-xs max-w-xs">{product.remarks}</td>
                    <td className="table-cell">
                      <div className="flex gap-1">
                        <button
                          onClick={() => toggleProductOwned(product.id)}
                          className={`btn text-xs ${isOwned(product.id) ? "btn-success" : "btn-secondary"}`}
                          title={isOwned(product.id) ? "Mark as not owned" : "Mark as owned"}
                        >
                          <Check className={`w-3 h-3 ${isOwned(product.id) ? "" : "opacity-50"}`} />
                          {isOwned(product.id) ? "Owned" : "Own"}
                        </button>
                        <button
                          onClick={() =>
                            addToWishlist({
                              productId: product.id,
                              priority: "Medium",
                              notes: "",
                            })
                          }
                          className="btn btn-secondary text-xs"
                          title="Add to wishlist"
                        >
                          <ShoppingCart className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500">
          Showing {filtered.length} of {products.length} products
        </div>
      </div>
    </div>
  );
}
