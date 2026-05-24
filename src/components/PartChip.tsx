import { useNavigate } from "react-router-dom";
import PartImage from "./PartImage";
import { TIER_LABEL_MAP, TIER_META } from "../data/types";

interface PartChipProps {
  partType: "Blade" | "Ratchet" | "Bit" | "Assist Blade" | "Lock Chip" | "Main Blade";
  name: string;
  nameZh?: string;
  tier?: string | null;
  className?: string;
}

function tierColor(tier: string): string {
  return TIER_META.find(t => t.code === tier)?.color ?? "bg-gray-100 text-gray-500 border-gray-200";
}

export default function PartChip({ partType, name, nameZh, tier, className = "" }: PartChipProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/parts/${partType}/${encodeURIComponent(name)}`);
  };

  const effectiveTier = tier ?? null;
  const tierLabel = effectiveTier ? TIER_LABEL_MAP[effectiveTier] : null;

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer text-left ${className}`}
      title={`${partType}: ${name}`}
    >
      {(partType === "Blade" || partType === "Bit" || partType === "Assist Blade") && (
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