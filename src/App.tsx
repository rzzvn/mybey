import { useState, useEffect } from "react";
import { GitBranch, Settings, Package, Heart, Star, ListOrdered, Warehouse } from "lucide-react";
import { ui } from "./data/i18n";
import { InventoryProvider } from "./hooks/useInventory";
import ProductCatalog from "./components/ProductCatalog";
import PartsReference from "./components/PartsReference";
import TierListPage from "./components/TierListPage";
import InventoryPage from "./components/InventoryPage";
import CombosPage from "./components/CombosPage";
import SettingsPage from "./components/SettingsPage";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  const [currentPage, setCurrentPage] = useState("products");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const navItems = [
    { id: "products", label: ui.products, icon: Package },
    { id: "parts", label: ui.parts, icon: GitBranch },
    { id: "tierList", label: ui.tierList, icon: ListOrdered },
    { id: "inventory", label: ui.inventory, icon: Warehouse },
    { id: "combos", label: ui.combos, icon: Star },
    { id: "settings", label: ui.settingsNav, icon: Settings },
  ];

  return (
    <InventoryProvider>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Desktop sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 hidden lg:flex flex-col sticky top-0 h-screen overflow-y-auto">
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
          <div className="p-4 pb-20 lg:p-8 lg:pb-8 max-w-7xl mx-auto">
            {currentPage === "products" && (
              <ErrorBoundary name="ProductCatalog">
                <ProductCatalog />
              </ErrorBoundary>
            )}
            {currentPage === "parts" && <PartsReference />}
            {currentPage === "tierList" && <TierListPage />}
            {currentPage === "inventory" && <InventoryPage />}
            {currentPage === "combos" && <CombosPage />}
            {currentPage === "settings" && <SettingsPage />}
          </div>
        </main>

        {/* Mobile bottom tab bar */}
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex justify-around items-center h-14 px-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 text-[10px] font-medium transition-colors ${
                  currentPage === item.id
                    ? "text-blue-700"
                    : "text-gray-500"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="truncate max-w-[64px]">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </InventoryProvider>
  );
}
