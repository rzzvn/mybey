import { useState } from "react";
import { getPartImageUrl, getPartFallbackUrl, getBladeVariantImageUrl } from "../data/partImages";

/**
 * Renders a part image with local-first, remote-fallback, then placeholder.
 * 1. Try local file in /parts/{blades,bits,assist}/
 * 2. On error, try Fandom wiki Special:FilePath as fallback
 * 3. On both failing, show a tier-colored placeholder with the first letter.
 *
 * For blades with colorSlug, uses the variant image (e.g. DranBuster__metallic-cyan.webp).
 */
export default function PartImage({ type, name, tier, colorSlug, className = "" }: {
  type: string;
  name: string;
  tier: string | null | undefined;
  colorSlug?: string;
  className?: string;
}) {
  const [error, setError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);

  // For blades with a color variant, use the variant image URL
  const localUrl: string | null = (type === "Blade" && colorSlug && colorSlug !== "standard")
    ? getBladeVariantImageUrl(name, colorSlug)
    : getPartImageUrl(type, name);

  const fallbackUrl = getPartFallbackUrl(type, name);

  if (!localUrl || (error && (fallbackError || !fallbackUrl))) {
    return <PartPlaceholder name={name} tier={tier} className={className} />;
  }

  if (error && fallbackUrl) {
    return (
      <img
        src={fallbackUrl}
        alt={name}
        className={`object-contain ${className}`}
        loading="lazy"
        onError={() => setFallbackError(true)}
      />
    );
  }

  return (
    <img
      src={localUrl}
      alt={name}
      className={`object-contain ${className}`}
      loading="lazy"
      onError={() => setError(true)}
    />
  );
}

function tierBg(tier: string | null | undefined): string {
  switch (tier) {
    case "T0": return "bg-red-100";
    case "T0.5": return "bg-pink-100";
    case "T1": return "bg-orange-100";
    case "T1.5": return "bg-amber-100";
    case "T2": return "bg-yellow-100";
    case "T3": return "bg-green-100";
    case "T4": return "bg-blue-100";
    case "T5": return "bg-purple-100";
    default: return "bg-gray-100";
  }
}

function PartPlaceholder({ name, tier, className = "" }: {
  name: string;
  tier: string | null | undefined;
  className?: string;
}) {
  const initial = name.charAt(0);
  return (
    <div className={`flex items-center justify-center ${tierBg(tier)} rounded-lg ${className}`}>
      <span className="text-2xl font-bold opacity-30">{initial}</span>
    </div>
  );
}
