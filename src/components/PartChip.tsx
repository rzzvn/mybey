import { useNavigate } from "react-router-dom";
import PartImage from "./PartImage";
import { TIER_LABEL_MAP, TIER_META } from "../data/types";

interface PartChipProps {
  partType: "Blade" | "Ratchet" | "Bit" | "Assist Blade" | "Lock Chip" | "Main Blade" | "Metal Blade" | "Over Blade";
  name: string;
  nameZh?: string;
  tier?: string | null;
  className?: string;
  owned?: boolean;
  ordered?: boolean;  // "getting" — on the way but not yet in hand
}

function tierColor(tier: string): string {
  return TIER_META.find(t => t.code === tier)?.color ?? "bg-gray-100 text-gray-500 border-gray-200";
}

export default function PartChip({ partType, name, nameZh, tier, className = "", owned, ordered }: PartChipProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/parts/${partType}/${encodeURIComponent(name)}`);
  };

  const effectiveTier = tier ?? null;
  const tierLabel = effectiveTier ? TIER_LABEL_MAP[effectiveTier] : null;

  // Green ring = you own it (purchased) — takes priority if both purchased and getting
  // Amber ring = you've ordered it (getting/on the way) but don't own yet
  const ringClass = owned
    ? "ring-2 ring-green-400 ring-offset-1"
    : ordered
    ? "ring-2 ring-amber-400 ring-offset-1"
    : "";

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer text-left ${ringClass} ${className}`}
      title={`${partType}: ${name}${owned ? " (owned)" : ""}${!owned && ordered ? " (ordered)" : ""}`}
    >
      {(partType === "Blade" || partType === "Bit" || partType === "Assist Blade" || partType === "Over Blade" || partType === "Metal Blade") && (
        <PartImage type={partType} name={name} tier={effectiveTier as any} className="w-5 h-5 shrink-0" />
      )}
      {effectiveTier && (
        <span className={`inline-flex items-center px-1 py-0.5 rounded text-[10px] font-bold border ${tierColor(effectiveTier)}`}>
          {tierLabel ?? effectiveTier}
        </span>
      )}
      {nameZh ? (
        <span className="text-xs font-medium text-gray-900">
          {nameZh}
          <span className="text-[10px] text-gray-400 ml-0.5">{name}</span>
        </span>
      ) : (
        <span className="text-xs font-medium text-gray-900">{name}</span>
      )}
    </button>
  );
}