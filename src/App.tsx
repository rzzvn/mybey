import { useEffect, useState } from "react";
import { HashRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { GitBranch, Settings, Package, Star, ListOrdered, Warehouse, Search } from "lucide-react";
import { ui } from "./data/i18n";
import { InventoryProvider } from "./hooks/useInventory";
import ProductCatalog from "./components/ProductCatalog";
import PartsReference from "./components/PartsReference";
import TierListPage from "./components/TierListPage";
import InventoryPage from "./components/InventoryPage";
import CombosPage from "./components/CombosPage";
import SettingsPage from "./components/SettingsPage";
import AdminTierEditor from "./components/AdminTierEditor";
import ErrorBoundary from "./components/ErrorBoundary";
import GlobalSearch from "./components/GlobalSearch";
import GlobalSearchOverlay from "./components/GlobalSearchOverlay";

const navItems = [
  { id: "products", path: "/", label: ui.products, icon: Package },
  { id: "parts", path: "/parts", label: ui.parts, icon: GitBranch },
  { id: "tierList", path: "/tier-list", label: ui.tierList, icon: ListOrdered },
  { id: "inventory", path: "/inventory", label: ui.inventory, icon: Warehouse },
  { id: "combos", path: "/combos", label: ui.combos, icon: Star },
  { id: "settings", path: "/settings", label: ui.settingsNav, icon: Settings },
];

function NavSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 hidden lg:flex flex-col sticky top-0 h-screen overflow-y-auto">
      <div className="p-4 border-b border-gray-100">
        <h1 className="text-xl font-bold tracking-tight text-gray-900">{ui.appTitle}</h1>
        <p className="text-xs text-gray-500 mt-0.5">{ui.appSubtitle}</p>
      </div>
      <div className="px-2 pt-2">
        <GlobalSearch />
      </div>
      <nav className="flex-1 p-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = item.path === "/"
            ? location.pathname === "/" || location.pathname.startsWith("/products")
            : location.pathname === item.path || location.pathname.startsWith(item.path + "/");
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function MobileNavBar({ onSearchOpen }: { onSearchOpen: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex justify-around items-center h-14 px-0.5">
        {navItems.slice(0, 4).map((item) => {
          const isActive = item.path === "/"
            ? location.pathname === "/" || location.pathname.startsWith("/products")
            : location.pathname === item.path || location.pathname.startsWith(item.path + "/");
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 text-[10px] font-medium transition-colors ${
                isActive
                  ? "text-blue-700"
                  : "text-gray-500"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="truncate max-w-[64px]">{item.label}</span>
            </button>
          );
        })}

        {/* Search button — always at the end */}
        <button
          onClick={onSearchOpen}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 text-[10px] font-medium text-gray-500 transition-colors"
        >
          <Search className="w-5 h-5" />
          <span className="truncate max-w-[64px]">搜尋</span>
        </button>
      </div>
    </nav>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

function AppLayout() {
  const [searchOpen, setSearchOpen] = useState(false);
  return (
    <InventoryProvider>
      <ScrollToTop />
      <div className="min-h-screen bg-gray-50 flex">
        <NavSidebar />

        <main className="flex-1 min-w-0">
          <div className="p-4 pb-24 lg:p-8 lg:pb-8 max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<ErrorBoundary name="ProductCatalog"><ProductCatalog /></ErrorBoundary>} />
              <Route path="/products/:code?" element={<ErrorBoundary name="ProductCatalog"><ProductCatalog /></ErrorBoundary>} />
              <Route path="/parts" element={<PartsReference />} />
              <Route path="/parts/:partType/:partName" element={<PartsReference />} />
              <Route path="/tier-list" element={<TierListPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/inventory/:tag" element={<InventoryPage />} />
              <Route path="/combos" element={<CombosPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/admin/tiers" element={<AdminTierEditor />} />
            </Routes>
          </div>
        </main>

        {/* Mobile floating search FAB — always visible */}
        <button
          onClick={() => setSearchOpen(true)}
          className="lg:hidden fixed bottom-20 right-4 z-40 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 active:bg-blue-800 transition-colors"
          aria-label="搜尋"
        >
          <Search className="w-5 h-5" />
        </button>

        <MobileNavBar onSearchOpen={() => setSearchOpen(true)} />
        {searchOpen && <GlobalSearchOverlay onClose={() => setSearchOpen(false)} />}
      </div>
    </InventoryProvider>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppLayout />
    </HashRouter>
  );
}