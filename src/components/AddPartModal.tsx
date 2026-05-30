import { useState } from "react";
import { X } from "lucide-react";
import PartPicker, { type PartPickerType } from "./PartPicker";
import { useInventory } from "../hooks/useInventory";
import { usePartOwnership } from "../hooks/usePartOwnership";
import { ui } from "../data/i18n";

interface AddPartModalProps {
  onClose: () => void;
}

const PART_TABS: { type: PartPickerType; label: string }[] = [
  { type: "Blade", label: "刃 Blade" },
  { type: "Ratchet", label: "鎖 Ratchet" },
  { type: "Bit", label: "軸 Bit" },
  { type: "Lock Chip", label: "Lock Chip" },
  { type: "Metal Blade", label: "Metal" },
  { type: "Over Blade", label: "Over" },
  { type: "Assist Blade", label: "Assist" },
  { type: "Main Blade", label: "Main" },
];

export default function AddPartModal({ onClose }: AddPartModalProps) {
  const { addManualPart } = useInventory();
  const { owned: ownedKeys } = usePartOwnership();
  const [activeTab, setActiveTab] = useState<PartPickerType>("Blade");
  const [selectedPart, setSelectedPart] = useState("");

  const handleAdd = () => {
    if (!selectedPart) return;
    const partKey = `${activeTab}:${selectedPart}`;
    addManualPart(partKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 overflow-hidden rounded-t-2xl">
          <h3 className="font-bold text-gray-900">{ui.addPart || "新增零件"}</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type tabs */}
        <div className="flex flex-wrap border-b border-gray-100">
          {PART_TABS.map((tab) => (
            <button
              key={tab.type}
              onClick={() => {
                setActiveTab(tab.type);
                setSelectedPart("");
              }}
              className={`px-2.5 py-2 text-xs font-medium transition-colors ${
                activeTab === tab.type
                  ? "text-blue-700 border-b-2 border-blue-600 bg-blue-50/50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Part picker */}
        <div className="p-4">
          <PartPicker
            type={activeTab}
            value={selectedPart}
            onChange={setSelectedPart}
            ownedKeys={ownedKeys}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-100 bg-gray-50/50 overflow-hidden rounded-b-2xl">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            {ui.cancel}
          </button>
          <button
            onClick={handleAdd}
            disabled={!selectedPart}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {ui.save}
          </button>
        </div>
      </div>
    </div>
  );
}