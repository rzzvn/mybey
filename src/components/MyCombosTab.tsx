import { useState } from "react";
import { useInventory } from "../hooks/useInventory";
import { bladeTiers, ratchetTiers, bitTiers } from "../data/parts";
import { bladeNamesZh, ui } from "../data/i18n";
import { Wrench, Plus, Trash2 } from "lucide-react";

function getBladeTier(name?: string): string {
  if (!name) return "—";
  return bladeTiers[name] || "T3";
}

function getRatchetTier(name?: string): string {
  if (!name) return "—";
  return ratchetTiers[name] || "T3";
}

function getBitTier(name?: string): string {
  if (!name) return "—";
  return bitTiers[name] || "T3";
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

function TierBadge({ tier }: { tier: string }) {
  if (tier === "—") return <span className="text-gray-300 text-xs">—</span>;
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold border ${partTierColor(tier)}`}>
      {tier}
    </span>
  );
}

const statusLabelsZh: Record<string, string> = {
  Planned: "計劃中",
  Ownable: "可擁有",
  Owned: "已擁有",
  Tested: "已測試",
};

export default function MyCombosTab() {
  const { data, addCombo, removeCombo } = useInventory();
  const [showForm, setShowForm] = useState(false);
  const [newCombo, setNewCombo] = useState({
    name: "",
    blade: "",
    ratchet: "",
    bit: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCombo.name || !newCombo.blade) return;
    addCombo({
      id: crypto.randomUUID(),
      name: newCombo.name,
      blade: newCombo.blade,
      ratchet: newCombo.ratchet,
      bit: newCombo.bit,
      status: "Planned",
      notes: newCombo.notes,
    });
    setShowForm(false);
    setNewCombo({ name: "", blade: "", ratchet: "", bit: "", notes: "" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">{ui.myCombos}</h3>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          <Plus className="w-4 h-4" /> {ui.addCombo}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input className="search-input" placeholder={ui.comboName} value={newCombo.name} onChange={e => setNewCombo({...newCombo, name: e.target.value})} />
            <input className="search-input" placeholder={ui.bladeRequired} value={newCombo.blade} onChange={e => setNewCombo({...newCombo, blade: e.target.value})} />
            <input className="search-input" placeholder={ui.ratchetOptional} value={newCombo.ratchet} onChange={e => setNewCombo({...newCombo, ratchet: e.target.value})} />
            <input className="search-input" placeholder={ui.bitOptional} value={newCombo.bit} onChange={e => setNewCombo({...newCombo, bit: e.target.value})} />
          </div>
          <textarea className="search-input" rows={2} placeholder={ui.notesPlaceholder} value={newCombo.notes} onChange={e => setNewCombo({...newCombo, notes: e.target.value})} />
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary">{ui.save}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">{ui.cancel}</button>
          </div>
        </form>
      )}

      {data.combos.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{ui.noCustomCombos}</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="table-header">{ui.comboName}</th>
                  <th className="table-header">{ui.blade}</th>
                  <th className="table-header">{ui.bladeTier}</th>
                  <th className="table-header">{ui.ratchet}</th>
                  <th className="table-header">{ui.ratchetTier}</th>
                  <th className="table-header">{ui.bit}</th>
                  <th className="table-header">{ui.bitTier}</th>
                  <th className="table-header">{ui.notes}</th>
                  <th className="table-header"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.combos.map(combo => {
                  const bladeZh = bladeNamesZh[combo.blade] || "";
                  return (
                    <tr key={combo.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="table-cell font-medium text-sm">{combo.name}</td>
                      <td className="table-cell">
                        <div className="text-sm font-medium text-gray-900">{bladeZh || combo.blade}</div>
                        {bladeZh && <div className="text-xs text-gray-400">{combo.blade}</div>}
                      </td>
                      <td className="table-cell">
                        <TierBadge tier={getBladeTier(combo.blade)} />
                      </td>
                      <td className="table-cell font-mono text-sm">
                        {combo.ratchet || <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="table-cell">
                        <TierBadge tier={combo.ratchet ? getRatchetTier(combo.ratchet) : "—"} />
                      </td>
                      <td className="table-cell font-mono text-sm">
                        {combo.bit || <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="table-cell">
                        <TierBadge tier={combo.bit ? getBitTier(combo.bit) : "—"} />
                      </td>
                      <td className="table-cell text-gray-500 text-xs max-w-[200px]">{combo.notes || "—"}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${combo.status === "Owned" ? "bg-green-100 text-green-700" : combo.status === "Ownable" ? "bg-blue-100 text-blue-700" : combo.status === "Tested" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                            {statusLabelsZh[combo.status] || combo.status}
                          </span>
                          <button onClick={() => removeCombo(combo.id)} className="p-1 text-gray-400 hover:text-red-600 transition-colors" title={ui.deleteCombo || "刪除"}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}