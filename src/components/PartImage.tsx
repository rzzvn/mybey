import { useState } from "react";
import { getPartVariantImageUrl, getPartVariantFallbackUrl } from "../data/partImages";

/**
 * Renders a part image with local-first, remote-fallback, then placeholder.
 * 1. Try local file in /parts/{blades,bits,assist,lockChip,ratchets,...}/
 * 2. On error, try phstudy.org or Fandom wiki fallback
 * 3. On both failing, show a tier-colored placeholder with the first letter.
 *
 * Supports colorSlug for Blades (e.g. DranBuster__metallic-cyan.webp),
 * Lock Chips (e.g. Cerberus__dark.webp), and Bits (e.g. V__metallic-gold.webp).
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

  // Use variant image if colorSlug is specified and non-standard
  const localUrl: string | null = getPartVariantImageUrl(type, name, colorSlug ?? "standard");
  const fallbackUrl = getPartVariantFallbackUrl(type, name);

  // Determine which URL to show
  // Priority: local → fallback → placeholder
  const showUrl = error ? fallbackUrl : localUrl;

  if (!showUrl || (error && (fallbackError || !fallbackUrl))) {
    return <PartPlaceholder name={name} tier={tier} className={className} />;
  }

  // If we're showing fallback after local failed, track errors on fallback
  const handleError = error && fallbackUrl
    ? () => setFallbackError(true)
    : () => setError(true);

  return (
    <img
      src={showUrl}
      alt={name}
      className={`object-contain ${className}`}
      loading="lazy"
      onError={handleError}
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
