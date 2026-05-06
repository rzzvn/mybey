import { useState } from "react";
import { useInventory } from "../hooks/useInventory";
import { Wrench, Plus, Trash2 } from "lucide-react";

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
        <h3 className="text-lg font-bold">My Custom Combos</h3>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Add Combo
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input className="search-input" placeholder="Combo Name" value={newCombo.name} onChange={e => setNewCombo({...newCombo, name: e.target.value})} />
            <input className="search-input" placeholder="Blade*" value={newCombo.blade} onChange={e => setNewCombo({...newCombo, blade: e.target.value})} />
            <input className="search-input" placeholder="Ratchet (optional)" value={newCombo.ratchet} onChange={e => setNewCombo({...newCombo, ratchet: e.target.value})} />
            <input className="search-input" placeholder="Bit (optional)" value={newCombo.bit} onChange={e => setNewCombo({...newCombo, bit: e.target.value})} />
          </div>
          <textarea className="search-input" rows={2} placeholder="Notes..." value={newCombo.notes} onChange={e => setNewCombo({...newCombo, notes: e.target.value})} />
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {data.combos.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No custom combos yet. Create your first combo!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.combos.map(combo => (
            <div key={combo.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-lg">{combo.name}</div>
                  <div className="text-sm text-gray-600">{combo.blade} {combo.ratchet && `/ ${combo.ratchet}`} {combo.bit && `/ ${combo.bit}`}</div>
                  {combo.notes && <div className="text-xs text-gray-500 mt-1">{combo.notes}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">{combo.status}</span>
                  <button onClick={() => removeCombo(combo.id)} className="p-1 text-gray-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
