import { useMemo, useState } from "react";
import { useInventory } from "../hooks/useInventory";
import { products } from "../data/products";
import { ratchetTiers, bitTiers, getBladeTierResolved } from "../data/parts";
import {
  bladeNamesZh,
  bladeNamesZhTw,
  assistBladeNamesZh,
  lockChipNamesZh,
  mainBladeNamesZh,
  ui,
  getDualZhName,
  bitFullNames,
} from "../data/i18n";
import PartPicker from "./PartPicker";
import PartChip from "./PartChip";
import { Wrench, Plus, Trash2 } from "lucide-react";

function getBladeTier(name?: string): string {
  if (!name) return "—";
  return getBladeTierResolved(name) || "—";
}

function getRatchetTier(name?: string): string {
  if (!name) return "—";
  return ratchetTiers[name] || "—";
}

function getBitTier(name?: string): string {
  if (!name) return "—";
  return bitTiers[name] || "—";
}

const statusLabelsZh: Record<string, string> = {
  Planned: "計劃中",
  Ownable: "可擁有",
  Owned: "已擁有",
  Tested: "已測試",
};

/** Compute the set of part keys owned from purchased products */
function computeOwnedPartKeys(purchased: { productId: string; product: typeof products[number] }[]): Set<string> {
  const keys = new Set<string>();
  for (const { productId, product } of purchased) {
    // For Packs, sub-items determine which bey you get
    // For Sets/Starters, you get all beys
    const subMatch = productId.match(/^(.+)-(\d+)$/);
    const isSubItem = subMatch !== null && product.type === "Pack";

    const beysToProcess = isSubItem
      ? (() => {
          const idx = parseInt(subMatch![2], 10) - 1;
          return idx >= 0 && idx < product.beys.length ? [product.beys[idx]] : product.beys;
        })()
      : product.beys;

    for (const bey of beysToProcess) {
      if (bey.blade) keys.add(`Blade:${bey.blade}`);
      if (bey.ratchet) keys.add(`Ratchet:${bey.ratchet}`);
      if (bey.bit) keys.add(`Bit:${bey.bit}`);
      if (bey.assistBlade) keys.add(`Assist Blade:${bey.assistBlade}`);
      if (bey.lockChip) keys.add(`Lock Chip:${bey.lockChip}`);
      if (bey.mainBlade) keys.add(`Main Blade:${bey.mainBlade}`);
    }
  }
  return keys;
}

export default function MyCombosTab() {
  const { data, addCombo, removeCombo } = useInventory();
  const [showForm, setShowForm] = useState(false);
  const [newCombo, setNewCombo] = useState({
    name: "",
    blade: "",
    lockChip: "",
    mainBlade: "",
    assistBlade: "",
    ratchet: "",
    bit: "",
    notes: "",
  });

  // Compute owned part keys from purchased products
  const ownedKeys = useMemo(() => {
    const purchased = data.tags
      .filter(t => t.tag === "purchased")
      .map(t => {
        const product = products.find(p => p.id === t.productId);
        return product ? { productId: t.productId, product } : null;
      })
      .filter(Boolean) as { productId: string; product: typeof products[number] }[];
    return computeOwnedPartKeys(purchased);
  }, [data.tags]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCombo.name || !newCombo.blade) return;
    addCombo({
      id: crypto.randomUUID(),
      name: newCombo.name,
      blade: newCombo.blade,
      lockChip: newCombo.lockChip || undefined,
      mainBlade: newCombo.mainBlade || undefined,
      assistBlade: newCombo.assistBlade || undefined,
      ratchet: newCombo.ratchet,
      bit: newCombo.bit,
      status: "Planned",
      notes: newCombo.notes,
    });
    setShowForm(false);
    setNewCombo({ name: "", blade: "", lockChip: "", mainBlade: "", assistBlade: "", ratchet: "", bit: "", notes: "" });
  };

  // Build option lists for Custom Line dropdowns
  const lockChipOptions = useMemo(() => {
    return Object.entries(lockChipNamesZh).map(([name, zh]) => ({ name, zh }));
  }, []);

  const mainBladeOptions = useMemo(() => {
    return Object.entries(mainBladeNamesZh).map(([name, zh]) => ({ name, zh }));
  }, []);

  const assistBladeOptions = useMemo(() => {
    return Object.entries(assistBladeNamesZh).map(([name, zh]) => ({ name, zh }));
  }, []);

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
          <input className="search-input" placeholder={ui.comboName} value={newCombo.name} onChange={e => setNewCombo({...newCombo, name: e.target.value})} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{ui.bladeRequired}</label>
              <PartPicker
                type="Blade"
                value={newCombo.blade}
                onChange={v => setNewCombo({...newCombo, blade: v})}
                ownedKeys={ownedKeys}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{ui.ratchetOptional}</label>
              <PartPicker
                type="Ratchet"
                value={newCombo.ratchet}
                onChange={v => setNewCombo({...newCombo, ratchet: v})}
                placeholder={ui.ratchetOptional}
                ownedKeys={ownedKeys}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{ui.bitOptional}</label>
              <PartPicker
                type="Bit"
                value={newCombo.bit}
                onChange={v => setNewCombo({...newCombo, bit: v})}
                placeholder={ui.bitOptional}
                ownedKeys={ownedKeys}
              />
            </div>
          </div>
          {/* Custom Line fields */}
          <details className="group">
            <summary className="text-xs font-medium text-gray-500 cursor-pointer hover:text-gray-700">
              {ui.customLine || "Custom Line（選填）"} ▾
            </summary>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">{ui.lockChipLabel}</label>
                <select
                  className="search-input"
                  value={newCombo.lockChip}
                  onChange={e => setNewCombo({...newCombo, lockChip: e.target.value})}
                >
                  <option value="">—</option>
                  {lockChipOptions.map(opt => (
                    <option key={opt.name} value={opt.name}>{opt.zh} ({opt.name})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">{ui.mainBladeLabel}</label>
                <select
                  className="search-input"
                  value={newCombo.mainBlade}
                  onChange={e => setNewCombo({...newCombo, mainBlade: e.target.value})}
                >
                  <option value="">—</option>
                  {mainBladeOptions.map(opt => (
                    <option key={opt.name} value={opt.name}>{opt.zh} ({opt.name})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">{ui.assistBladeLabel}</label>
                <select
                  className="search-input"
                  value={newCombo.assistBlade}
                  onChange={e => setNewCombo({...newCombo, assistBlade: e.target.value})}
                >
                  <option value="">—</option>
                  {assistBladeOptions.map(opt => (
                    <option key={opt.name} value={opt.name}>{opt.zh} ({opt.name})</option>
                  ))}
                </select>
              </div>
            </div>
          </details>
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
        <div className="space-y-2">
          {data.combos.map(combo => {
            const bladeZh = getDualZhName(bladeNamesZh[combo.blade] || combo.blade, bladeNamesZhTw[combo.blade]) || combo.blade;
            const bladeOwned = ownedKeys.has(`Blade:${combo.blade}`);
            const ratchetOwned = combo.ratchet ? ownedKeys.has(`Ratchet:${combo.ratchet}`) : true;
            const bitOwned = combo.bit ? ownedKeys.has(`Bit:${combo.bit}`) : true;
            const assistBladeOwned = combo.assistBlade ? ownedKeys.has(`Assist Blade:${combo.assistBlade}`) : true;
            const allOwned = bladeOwned && ratchetOwned && bitOwned && assistBladeOwned;

            // Build full Custom Line name
            const hasCustomLine = combo.lockChip || combo.mainBlade || combo.assistBlade;
            const customLineParts: string[] = [];
            if (combo.lockChip) customLineParts.push(combo.lockChip);
            if (combo.mainBlade) customLineParts.push(combo.mainBlade);
            if (combo.assistBlade) customLineParts.push(combo.assistBlade);

            return (
              <div key={combo.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{combo.name}</span>
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                        combo.status === "Owned" ? "bg-green-100 text-green-700" :
                        combo.status === "Ownable" ? "bg-blue-100 text-blue-700" :
                        combo.status === "Tested" ? "bg-purple-100 text-purple-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {statusLabelsZh[combo.status] || combo.status}
                      </span>
                      {allOwned && (
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700">✓ {ui.ownIt}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {/* Blade */}
                      {combo.blade && (
                        <div className="flex items-center gap-1 relative">
                          <PartChip
                            partType="Blade"
                            name={combo.blade}
                            nameZh={bladeZh}
                            tier={getBladeTier(combo.blade) === "—" ? null : getBladeTier(combo.blade)}
                          />
                          {bladeOwned && <span className="text-green-500 text-xs absolute -top-1 -right-1">✓</span>}
                        </div>
                      )}
                      {/* Custom Line parts */}
                      {hasCustomLine && customLineParts.length > 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-50 border border-purple-100 text-xs">
                          <span className="text-purple-600 font-medium">CL:</span>
                          {combo.lockChip && <span className="text-purple-700">{lockChipNamesZh[combo.lockChip] || combo.lockChip}</span>}
                          {combo.mainBlade && <span className="text-purple-700">{mainBladeNamesZh[combo.mainBlade] || combo.mainBlade}</span>}
                          {combo.assistBlade && <span className="text-purple-700">{assistBladeNamesZh[combo.assistBlade] || combo.assistBlade}</span>}
                        </div>
                      )}
                      {/* Ratchet */}
                      {combo.ratchet && (
                        <div className="flex items-center gap-1 relative">
                          <PartChip
                            partType="Ratchet"
                            name={combo.ratchet}
                            tier={getRatchetTier(combo.ratchet) === "—" ? null : getRatchetTier(combo.ratchet)}
                          />
                          {ratchetOwned && <span className="text-green-500 text-xs absolute -top-1 -right-1">✓</span>}
                        </div>
                      )}
                      {/* Bit */}
                      {combo.bit && (
                        <div className="flex items-center gap-1 relative">
                          <PartChip
                            partType="Bit"
                            name={combo.bit}
                            nameZh={bitFullNames[combo.bit] ? `${combo.bit} ${bitFullNames[combo.bit]}` : undefined}
                            tier={getBitTier(combo.bit) === "—" ? null : getBitTier(combo.bit)}
                          />
                          {bitOwned && <span className="text-green-500 text-xs absolute -top-1 -right-1">✓</span>}
                        </div>
                      )}
                    </div>
                    {combo.notes && (
                      <p className="text-xs text-gray-500 mt-2">{combo.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeCombo(combo.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors shrink-0"
                    title={ui.deleteCombo || "刪除"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}