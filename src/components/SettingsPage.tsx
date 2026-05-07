import { useState } from "react";
import { Save, Key, Cloud, AlertTriangle, Download, Upload } from "lucide-react";
import { useInventory } from "../hooks/useInventory";
import { ui } from "../data/i18n";

export default function SettingsPage() {
  const { data, setGithubToken, setGistId, syncToGist, syncFromGist } = useInventory();
  const [token, setToken] = useState(data.githubToken);
  const [gistId, setGistIdInput] = useState(data.gistId);
  const [status, setStatus] = useState<string | null>(null);

  const saveSettings = () => {
    setGithubToken(token);
    setGistId(gistId);
    setStatus(ui.settingsSaved);
    setTimeout(() => setStatus(null), 3000);
  };

  const handleSyncToGist = async () => {
    setStatus(ui.syncingToGist);
    await syncToGist();
    setStatus(ui.syncedToGist);
    setTimeout(() => setStatus(null), 3000);
  };

  const handleSyncFromGist = async () => {
    setStatus(ui.syncingFromGist);
    await syncFromGist();
    setStatus(ui.syncedFromGist);
    setTimeout(() => setStatus(null), 3000);
  };

  const exportData = () => {
    const exportObj = {
      inventory: data.inventory,
      wishlist: data.wishlist,
      combos: data.combos,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bey-catalog-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        void parsed; // Will implement state update later
        setStatus(ui.importSuccess);
      } catch {
        setStatus(ui.importFailed);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">{ui.settingsTitle}</h2>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Key className="w-4 h-4" /> {ui.githubGistSync}
        </div>
        <div className="text-xs text-gray-500">
          {ui.gistDescription}
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{ui.githubToken}</label>
            <input
              type="password"
              className="search-input"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{ui.gistId}</label>
            <input
              className="search-input"
              value={gistId}
              onChange={(e) => setGistIdInput(e.target.value)}
              placeholder="xxxxxxxxxxxxxxxxxxxx"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={saveSettings} className="btn btn-primary">
              <Save className="w-4 h-4" /> {ui.save}
            </button>
            <button onClick={handleSyncToGist} className="btn btn-secondary">
              <Cloud className="w-4 h-4" /> {ui.uploadToGist}
            </button>
            <button onClick={handleSyncFromGist} className="btn btn-secondary">
              <Cloud className="w-4 h-4" /> {ui.downloadFromGist}
            </button>
          </div>
        </div>

        {status && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <AlertTriangle className="w-4 h-4" /> {status}
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Download className="w-4 h-4" /> {ui.backupRestore}
        </div>
        <div className="text-xs text-gray-500">{ui.backupDescription}</div>
        <div className="flex gap-2">
          <button onClick={exportData} className="btn btn-secondary">
            <Download className="w-4 h-4" /> {ui.exportJson}
          </button>
          <label className="btn btn-secondary cursor-pointer inline-flex">
            <Upload className="w-4 h-4" /> {ui.importJson}
            <input type="file" accept=".json" className="hidden" onChange={importData} />
          </label>
        </div>
      </div>
    </div>
  );
}
