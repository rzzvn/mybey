import { useState } from "react";
import { Cloud, CloudOff, Link2, AlertTriangle, Download, Upload, Copy, Check } from "lucide-react";
import { useInventory } from "../hooks/useInventory";
import { ui } from "../data/i18n";

export default function SettingsPage() {
  const { data, importAppData, syncStatus, syncCode, syncError, generateSyncCode, enterSyncCode, disconnectSync } = useInventory();
  const [enterCodeInput, setEnterCodeInput] = useState("");
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importStatusType, setImportStatusType] = useState<"success" | "error">("success");
  const [codeCopied, setCodeCopied] = useState(false);

  const handleGenerateSyncCode = async () => {
    await generateSyncCode();
  };

  const handleEnterSyncCode = async () => {
    if (!enterCodeInput.trim()) return;
    await enterSyncCode(enterCodeInput.trim());
    setEnterCodeInput("");
  };

  const handleCopyCode = () => {
    if (syncCode) {
      navigator.clipboard.writeText(syncCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const getStatusDisplay = () => {
    switch (syncStatus) {
      case "connected":
        return { color: "text-green-600", bg: "bg-green-50 border-green-200", icon: <Cloud className="w-4 h-4" />, text: ui.connected };
      case "connecting":
        return { color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200", icon: <Cloud className="w-4 h-4 animate-pulse" />, text: ui.connecting };
      case "error":
        return { color: "text-red-600", bg: "bg-red-50 border-red-200", icon: <AlertTriangle className="w-4 h-4" />, text: ui.disconnected };
      case "disconnected":
      default:
        return { color: "text-gray-600", bg: "bg-gray-50 border-gray-200", icon: <CloudOff className="w-4 h-4" />, text: ui.disconnected };
    }
  };

  const statusDisplay = getStatusDisplay();

  const exportData = () => {
    const exportObj = {
      tags: data.tags,
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
        importAppData(parsed);
        setImportStatus(ui.importSuccess);
        setImportStatusType("success");
      } catch {
        setImportStatus(ui.importFailed);
        setImportStatusType("error");
      }
      setTimeout(() => setImportStatus(null), 3000);
      // Reset the input so the same file can be re-imported
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">{ui.settingsTitle}</h2>

      {/* Sync Code Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Link2 className="w-4 h-4" /> {ui.syncCodeTitle}
        </div>
        <div className="text-xs text-gray-500">
          {ui.syncCodeDescription}
        </div>

        {/* Status indicator */}
        <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 border ${statusDisplay.bg} ${statusDisplay.color}`}>
          {statusDisplay.icon} {statusDisplay.text}
        </div>

        {/* Error display */}
        {syncError && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertTriangle className="w-4 h-4" /> {syncError}
          </div>
        )}

        {syncStatus === "disconnected" || syncStatus === "error" ? (
          <div className="space-y-3">
            <button onClick={handleGenerateSyncCode} className="btn btn-primary">
              <Cloud className="w-4 h-4" /> {ui.generateCode}
            </button>

            <div className="text-xs text-gray-400 text-center">— {ui.enterCode} —</div>

            <div className="flex gap-2">
              <input
                className="search-input flex-1"
                value={enterCodeInput}
                onChange={(e) => setEnterCodeInput(e.target.value)}
                placeholder="BEY-XXXX-XXXX"
                onKeyDown={(e) => { if (e.key === "Enter") handleEnterSyncCode(); }}
              />
              <button
                onClick={handleEnterSyncCode}
                disabled={!enterCodeInput.trim()}
                className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {ui.connect}
              </button>
            </div>
          </div>
        ) : syncStatus === "connected" ? (
          <div className="space-y-3">
            {/* Current sync code display */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <code className="text-sm font-mono font-bold tracking-wider flex-1 select-all">
                {syncCode}
              </code>
              <button
                onClick={handleCopyCode}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Copy sync code"
              >
                {codeCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-xs text-gray-400">{ui.codeCopied}</div>

            <button onClick={disconnectSync} className="btn btn-secondary text-red-600 border-red-200 hover:bg-red-50">
              <CloudOff className="w-4 h-4" /> {ui.disconnect}
            </button>
          </div>
        ) : (
          /* connecting state — just show a spinner-like message */
          <div className="text-sm text-gray-500 animate-pulse">{ui.connecting}...</div>
        )}
      </div>

      {/* Backup & Restore Section */}
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

        {importStatus && (
          <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 ${
            importStatusType === "error"
              ? "text-red-600 bg-red-50 border border-red-200"
              : "text-green-600 bg-green-50 border border-green-200"
          }`}>
            <AlertTriangle className="w-4 h-4" /> {importStatus}
          </div>
        )}
      </div>
    </div>
  );
}