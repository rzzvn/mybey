import { useState } from "react";
import { GitBranch, Settings, Package, Heart, Star, ListOrdered } from "lucide-react";
import { ui } from "./data/i18n";
import { InventoryProvider } from "./hooks/useInventory";
import ProductCatalog from "./components/ProductCatalog";
import PartsReference from "./components/PartsReference";
import TierListPage from "./components/TierListPage";
import WishlistPage from "./components/WishlistPage";
import CombosPage from "./components/CombosPage";
import SettingsPage from "./components/SettingsPage";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  const [currentPage, setCurrentPage] = useState("products");

  const navItems = [
    { id: "products", label: ui.products, icon: Package },
    { id: "parts", label: ui.parts, icon: GitBranch },
    { id: "tierList", label: ui.tierList, icon: ListOrdered },
    { id: "wishlist", label: ui.wishlist, icon: Heart },
    { id: "combos", label: ui.combos, icon: Star },
    { id: "settings", label: ui.settingsNav, icon: Settings },
  ];

  return (
    <InventoryProvider>
      <div className="min-h-screen bg-gray-50 flex">
        <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 hidden lg:flex flex-col sticky top-0 h-screen">
          <div className="p-4 border-b border-gray-100">
            <h1 className="text-xl font-bold tracking-tight text-gray-900">{ui.appTitle}</h1>
            <p className="text-xs text-gray-500 mt-0.5">{ui.appSubtitle}</p>
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
            {currentPage === "products" && (
              <ErrorBoundary name="ProductCatalog">
                <ProductCatalog />
              </ErrorBoundary>
            )}
            {currentPage === "parts" && <PartsReference />}
            {currentPage === "tierList" && <TierListPage />}
            {currentPage === "wishlist" && <WishlistPage />}
            {currentPage === "combos" && <CombosPage />}
            {currentPage === "settings" && <SettingsPage />}
          </div>
        </main>
      </div>
    </InventoryProvider>
  );
}
