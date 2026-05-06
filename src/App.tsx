import { useState } from "react";
import { GitBranch, Settings, Package, Heart, Star } from "lucide-react";
import { InventoryProvider } from "./hooks/useInventory";
import ProductCatalog from "./components/ProductCatalog";
import PartsReference from "./components/PartsReference";
import WishlistPage from "./components/WishlistPage";
import CombosPage from "./components/CombosPage";
import SettingsPage from "./components/SettingsPage";

export default function App() {
  const [currentPage, setCurrentPage] = useState("products");

  const navItems = [
    { id: "products", label: "Products", icon: Package },
    { id: "parts", label: "Parts", icon: GitBranch },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "combos", label: "Combos", icon: Star },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <InventoryProvider>
      <div className="min-h-screen bg-gray-50 flex">
        <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 hidden lg:flex flex-col sticky top-0 h-screen">
          <div className="p-4 border-b border-gray-100">
            <h1 className="text-xl font-bold tracking-tight text-gray-900">BEYBLADE X</h1>
            <p className="text-xs text-gray-500 mt-0.5">Product Catalog & Reference</p>
          </div>
          <nav className="flex-1 p-2 space-y-0.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === item.id
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            {currentPage === "products" && <ProductCatalog />}
            {currentPage === "parts" && <PartsReference />}
            {currentPage === "wishlist" && <WishlistPage />}
            {currentPage === "combos" && <CombosPage />}
            {currentPage === "settings" && <SettingsPage />}
          </div>
        </main>
      </div>
    </InventoryProvider>
  );
}
