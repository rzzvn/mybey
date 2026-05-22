/**
 * Color variants for Beyblade X blades.
 *
 * Maps blade name → list of {productId, colorLabel, colorSlug}.
 * This is the single source of truth for the Parts page modal:
 * "What color variants does this blade come in, and which product has it?"
 *
 * Data sourced from beyblade.phstudy.org blade catalog.
 * Standalone metallic/special/clear releases (BXG, BXH, BXC) and
 * sub-product color variants (e.g. UX-16-01) are both listed here.
 *
 * Conventions:
 * - colorLabel: Human-readable display, e.g. "Metallic Coat: Cyan"
 * - colorSlug: Machine-usable key, e.g. "metallic-cyan"
 *   Used for image file lookup: DranBuster__metallic-cyan.webp
 */

export interface ColorVariant {
  productId: string;
  colorLabel: string;
  colorSlug: string;
}

export const colorVariants: Record<string, ColorVariant[]> = {
  // ═══════════════════════════════════════════════════════════════
  // Dran Buster
  // ═══════════════════════════════════════════════════════════════
  "Dran Buster": [
    { productId: "UX-01", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "UX-04-01", colorLabel: "Special Ver.", colorSlug: "special" },
    { productId: "BXG-31-01", colorLabel: "Metallic Coat: Cyan", colorSlug: "metallic-cyan" },
    { productId: "BXG-31-02", colorLabel: "Metallic Coat: Black", colorSlug: "metallic-black" },
    { productId: "BXG-31-03", colorLabel: "Metallic Coat: Violet", colorSlug: "metallic-violet" },
    { productId: "BXG-25-02", colorLabel: "Metallic Coat: White", colorSlug: "metallic-white" },
    { productId: "BXG-18", colorLabel: "Metallic Coat: Blue FC Barcelona Ver.", colorSlug: "metallic-blue-fc-barcelona" },
    { productId: "CX-08-04", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BXC-03", colorLabel: "Metallic Coat: Red", colorSlug: "metallic-red" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Dran Sword
  // ═══════════════════════════════════════════════════════════════
  "Dran Sword": [
    { productId: "BX-22", colorLabel: "Metallic Coat: Red", colorSlug: "metallic-red" },
    { productId: "BX-07", colorLabel: "Special Ver.", colorSlug: "special" },
    { productId: "BX-14-03", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-17-01", colorLabel: "Red Ver.", colorSlug: "red" },
    { productId: "BXC-00-01", colorLabel: "Metallic Coat: Gold", colorSlug: "metallic-gold" },
    { productId: "BXC-00-02", colorLabel: "Metallic Coat: Silver", colorSlug: "metallic-silver" },
    { productId: "BXC-00-03", colorLabel: "Metallic Coat: Bronze", colorSlug: "metallic-bronze" },
    { productId: "BXG-25-01", colorLabel: "Metallic Coat: White", colorSlug: "metallic-white" },
    { productId: "BXG-12-04", colorLabel: "Holo Sticker Ver.", colorSlug: "holo-sticker" },
    { productId: "BXC-03", colorLabel: "Metallic Coat: Blue", colorSlug: "metallic-blue" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Dran Dagger
  // ═══════════════════════════════════════════════════════════════
  "Dran Dagger": [
    { productId: "BX-20-01", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-31-04", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BXG-25-03", colorLabel: "Metallic Coat: White", colorSlug: "metallic-white" },
    { productId: "BXG-14", colorLabel: "Metallic Coat: Black", colorSlug: "metallic-black" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Dran Brave
  // ═══════════════════════════════════════════════════════════════
  "Dran Brave": [
    { productId: "BXG-51", colorLabel: "Metallic Coat: Black", colorSlug: "metallic-black" },
    { productId: "BXH-16-01", colorLabel: "Metallic Coat: Gold", colorSlug: "metallic-gold" },
    { productId: "BXH-16-02", colorLabel: "Metallic Coat: Silver", colorSlug: "metallic-silver" },
    { productId: "BXH-16-03", colorLabel: "Metallic Coat: Bronze", colorSlug: "metallic-bronze" },
    { productId: "CX-04-01", colorLabel: "Special Ver.", colorSlug: "special" },
    { productId: "CX-01", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Dran Strike
  // ═══════════════════════════════════════════════════════════════
  "Dran Strike": [
    { productId: "BX-49", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BXH-25-01", colorLabel: "Metallic Coat: Gold", colorSlug: "metallic-gold" },
    { productId: "BXH-25-02", colorLabel: "Metallic Coat: Silver", colorSlug: "metallic-silver" },
    { productId: "BXH-25-03", colorLabel: "Metallic Coat: Bronze", colorSlug: "metallic-bronze" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Dran Arc
  // ═══════════════════════════════════════════════════════════════
  "Dran Arc": [
    { productId: "BXC-13", colorLabel: "Metallic Coat: Blue", colorSlug: "metallic-blue" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Wizard Rod
  // ═══════════════════════════════════════════════════════════════
  "Wizard Rod": [
    { productId: "UX-03", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "UX-04-02", colorLabel: "Special Ver.", colorSlug: "special" },
    { productId: "BXH-09", colorLabel: "Metallic Coat: Gold", colorSlug: "metallic-gold" },
    { productId: "BX-35-04", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-39-03", colorLabel: "Green Ver.", colorSlug: "green" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Wizard Arrow
  // ═══════════════════════════════════════════════════════════════
  "Wizard Arrow": [
    { productId: "BX-05", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-03", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-08-03", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-14-06", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-17-02", colorLabel: "Blue Ver.", colorSlug: "blue" },
    { productId: "BX-21-03", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-24-06", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Wizard Arc
  // ═══════════════════════════════════════════════════════════════
  "Wizard Arc": [
    { productId: "CX-02", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BXG-43", colorLabel: "Metallic Coat: Black", colorSlug: "metallic-black" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Hells Scythe
  // ═══════════════════════════════════════════════════════════════
  "Hells Scythe": [
    { productId: "BX-02", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-08-01", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-14-04", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BXG-03", colorLabel: "Metallic Coat: Gold", colorSlug: "metallic-gold" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Hells Chain
  // ═══════════════════════════════════════════════════════════════
  "Hells Chain": [
    { productId: "BX-21-01", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-31-03", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BXG-08", colorLabel: "Metallic Coat: Black", colorSlug: "metallic-black" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Hells Hammer
  // ═══════════════════════════════════════════════════════════════
  "Hells Hammer": [
    { productId: "UX-10-04", colorLabel: "Metallic Coat: Blue", colorSlug: "metallic-blue" },
    { productId: "BXG-19", colorLabel: "Metallic Coat: Red FC Barcelona Ver.", colorSlug: "metallic-red-fc-barcelona" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Hells Brave
  // ═══════════════════════════════════════════════════════════════
  "Hells Brave": [
    { productId: "UX-15-03", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Hells Reaper
  // ═══════════════════════════════════════════════════════════════
  "Hells Reaper": [
    { productId: "CX-05-01", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Hells Arc
  // ═══════════════════════════════════════════════════════════════
  "Hells Arc": [
    { productId: "CX-05-03", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Knight Shield
  // ═══════════════════════════════════════════════════════════════
  "Knight Shield": [
    { productId: "BX-06", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-04", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-08-02", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-20-03", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-14-05", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BXH-02", colorLabel: "Metallic Coat: Gold", colorSlug: "metallic-gold" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Knight Lance
  // ═══════════════════════════════════════════════════════════════
  "Knight Lance": [
    { productId: "BX-13", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-21-02", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-24-03", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Knight Mail
  // ═══════════════════════════════════════════════════════════════
  "Knight Mail": [
    { productId: "UX-10-01", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BXG-42", colorLabel: "Metallic Coat: Navy", colorSlug: "metallic-navy" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Phoenix Wing
  // ═══════════════════════════════════════════════════════════════
  "Phoenix Wing": [
    { productId: "BX-23", colorLabel: "Metallic Coat: Red", colorSlug: "metallic-red" },
    { productId: "BX-35-05", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BXG-35", colorLabel: "Metallic Coat: Black", colorSlug: "metallic-black" },
    { productId: "BXC-05", colorLabel: "Metallic Coat: Navy", colorSlug: "metallic-navy" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Phoenix Feather
  // ═══════════════════════════════════════════════════════════════
  "Phoenix Feather": [
    { productId: "UX-12-05", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BXC-08", colorLabel: "Metallic Coat: Orange", colorSlug: "metallic-orange" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Phoenix Rudder
  // ═══════════════════════════════════════════════════════════════
  "Phoenix Rudder": [
    { productId: "CX-05-05", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "UX-07-01", colorLabel: "Metallic Coat: Red", colorSlug: "metallic-red" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Shark Edge
  // ═══════════════════════════════════════════════════════════════
  "Shark Edge": [
    { productId: "BX-14-01", colorLabel: "Blue/Pink", colorSlug: "blue-pink" },
    { productId: "BX-14-02", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-20-02", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-31-05", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BXG-06", colorLabel: "Metallic Coat: Blue", colorSlug: "metallic-blue" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Shark Scale
  // ═══════════════════════════════════════════════════════════════
  "Shark Scale": [
    { productId: "UX-15-01", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Cobalt Drake
  // ═══════════════════════════════════════════════════════════════
  "Cobalt Drake": [
    { productId: "BXH-01", colorLabel: "Metallic Coat: Blue", colorSlug: "metallic-blue" },
    { productId: "BXG-23", colorLabel: "Clear Ver.", colorSlug: "clear" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Cobalt Dragoon
  // ═══════════════════════════════════════════════════════════════
  "Cobalt Dragoon": [
    { productId: "BX-34", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BXG-09", colorLabel: "Metallic Coat: Black", colorSlug: "metallic-black" },
    { productId: "CX-08-06", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Leon Claw
  // ═══════════════════════════════════════════════════════════════
  "Leon Claw": [
    { productId: "BX-15", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-24-05", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "UX-12-04", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BXG-05", colorLabel: "Metallic Coat: Gold", colorSlug: "metallic-gold" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Leon Crest
  // ═══════════════════════════════════════════════════════════════
  "Leon Crest": [
    { productId: "UX-06", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "CX-05-04", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Viper Tail
  // ═══════════════════════════════════════════════════════════════
  "Viper Tail": [
    { productId: "BX-16-01", colorLabel: "Black/Pink", colorSlug: "black-pink" },
    { productId: "BX-16-02", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-16-03", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-24-04", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-35-06", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Rhino Horn
  // ═══════════════════════════════════════════════════════════════
  "Rhino Horn": [
    { productId: "BX-19", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-31-06", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Rhino Reaper
  // ═══════════════════════════════════════════════════════════════
  "Rhino Reaper": [
    { productId: "CX-05-02", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Black Shell
  // ═══════════════════════════════════════════════════════════════
  "Black Shell": [
    { productId: "BX-35-01", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-35-02", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "CX-08-05", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Unicorn Sting
  // ═══════════════════════════════════════════════════════════════
  "Unicorn Sting": [
    { productId: "BX-26", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-35-03", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Wyvern Gale
  // ═══════════════════════════════════════════════════════════════
  "Wyvern Gale": [
    { productId: "BX-24-01", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-24-02", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "UX-07-02", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "UX-12-06", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Tyranno Beat
  // ═══════════════════════════════════════════════════════════════
  "Tyranno Beat": [
    { productId: "BX-31-01", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-31-02", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "UX-10-02", colorLabel: "Metallic Coat: Red", colorSlug: "metallic-red" },
    { productId: "CX-17-05", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Whale Wave
  // ═══════════════════════════════════════════════════════════════
  "Whale Wave": [
    { productId: "BX-36-01", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-36-02", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-36-03", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "CX-05-06", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Silver Wolf
  // ═══════════════════════════════════════════════════════════════
  "Silver Wolf": [
    { productId: "UX-08", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Aero Pegasus
  // ═══════════════════════════════════════════════════════════════
  "Aero Pegasus": [
    { productId: "BXH-10", colorLabel: "Metallic Coat: Double (Blue & Green)", colorSlug: "metallic-double-blue-green" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Pegasus Blast
  // ═══════════════════════════════════════════════════════════════
  "Pegasus Blast": [
    { productId: "BXG-45", colorLabel: "Metallic Coat: Red", colorSlug: "metallic-red" },
    { productId: "CX-07", colorLabel: "Metallic Coat: Green", colorSlug: "metallic-green" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Ghost Circle
  // ═══════════════════════════════════════════════════════════════
  "Ghost Circle": [
    { productId: "UX-12-01", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "UX-12-02", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "UX-05-01", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "UX-05-02", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "UX-05-03", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Shinobi Shadow
  // ═══════════════════════════════════════════════════════════════
  "Shinobi Shadow": [
    { productId: "UX-12-03", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "UX-05-03", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "UX-05-02", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "UX-05-01", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Shinobi Knife
  // ═══════════════════════════════════════════════════════════════
  "Shinobi Knife": [
    { productId: "BXG-16", colorLabel: "Metallic Coat: Blue", colorSlug: "metallic-blue" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Sphinx Cowl
  // ═══════════════════════════════════════════════════════════════
  "Sphinx Cowl": [
    { productId: "BX-27-01", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-27-02", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-27-03", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "UX-07-03", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Samurai Calibur
  // ═══════════════════════════════════════════════════════════════
  "Samurai Calibur": [
    { productId: "BX-45", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Cobalt Dragoon (CX-08)
  // ═══════════════════════════════════════════════════════════════
  "Cobalt Dragoon": [
    { productId: "BX-34", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BXG-09", colorLabel: "Metallic Coat: Black", colorSlug: "metallic-black" },
    { productId: "CX-08-06", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Cerberus Flame
  // ═══════════════════════════════════════════════════════════════
  "Cerberus Flame": [
    { productId: "CX-08-01", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Cerberus Dark
  // ═══════════════════════════════════════════════════════════════
  "Cerberus Dark": [
    { productId: "CX-08-03", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Whale Flame
  // ═══════════════════════════════════════════════════════════════
  "Whale Flame": [
    { productId: "CX-08-02", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Perseus Dark
  // ═══════════════════════════════════════════════════════════════
  "Perseus Dark": [
    { productId: "CX-04-02", colorLabel: "Special Ver.", colorSlug: "special" },
    { productId: "CX-03", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BXH-15", colorLabel: "Metallic Coat: Gold", colorSlug: "metallic-gold" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Sol Eclipse
  // ═══════════════════════════════════════════════════════════════
  "Sol Eclipse": [
    { productId: "CX-09", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Warrior Saber
  // ═══════════════════════════════════════════════════════════════
  "Warrior Saber": [
    { productId: "UX-09", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BXC-12", colorLabel: "Metallic Coat: Orange", colorSlug: "metallic-orange" },
    { productId: "BXG-54", colorLabel: "Metallic Coat: Blue", colorSlug: "metallic-blue" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Fox Brush
  // ═══════════════════════════════════════════════════════════════
  "Fox Brush": [
    { productId: "CX-06-01", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "CX-06-02", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "CX-06-03", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Brachiowhip
  // ═══════════════════════════════════════════════════════════════
  "Brachiowhip": [
    { productId: "CX-18-01", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "CX-18-02", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "CX-18-03", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Shelter Drake
  // ═══════════════════════════════════════════════════════════════
  "Shelter Drake": [
    { productId: "BX-39-01", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-39-02", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-39-03", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Bite Croc / CrocCrunch
  // ═══════════════════════════════════════════════════════════════
  "Bite Croc": [
    { productId: "BXC-07", colorLabel: "Metallic Coat: Green", colorSlug: "metallic-green" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // X-Over Project blades
  // ═══════════════════════════════════════════════════════════════
  "Driger Slash": [
    { productId: "BXG-04", colorLabel: "Standard", colorSlug: "standard" },
  ],

  "Dranzer Spiral": [
    { productId: "BXG-01", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BXG-15", colorLabel: "Black Ver.", colorSlug: "black" },
  ],

  "Dragoon Storm": [
    { productId: "BXG-12-01", colorLabel: "Standard", colorSlug: "standard" },
  ],

  "Storm Pegasis": [
    { productId: "BXG-12-02", colorLabel: "Standard", colorSlug: "standard" },
  ],

  "Victory Valkyrie": [
    { productId: "BXG-12-03", colorLabel: "Standard", colorSlug: "standard" },
  ],

  "Rock Leone": [
    { productId: "BXG-20", colorLabel: "Standard", colorSlug: "standard" },
  ],

  "Xeno Excalibur": [
    { productId: "BXG-13", colorLabel: "Standard", colorSlug: "standard" },
  ],

  "Draciel Shield": [
    { productId: "BXG-11", colorLabel: "Standard", colorSlug: "standard" },
  ],

  "Samurai Steel": [
    { productId: "BXC-11", colorLabel: "Metallic Coat: White", colorSlug: "metallic-white" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Valkyrie Volt
  // ═══════════════════════════════════════════════════════════════
  "Valkyrie Volt": [
    { productId: "BXH-14", colorLabel: "Metallic Coat: Gold", colorSlug: "metallic-gold" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Mammoth Tusk
  // ═══════════════════════════════════════════════════════════════
  "Mammoth Tusk": [
    { productId: "BXG-32", colorLabel: "Metallic Coat: Black", colorSlug: "metallic-black" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Lightning L-Drago
  // ═══════════════════════════════════════════════════════════════
  "Lightning L-Dragoupper": [
    { productId: "BXG-07-00", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Collaboration blades (each has one entry)
  // ═══════════════════════════════════════════════════════════════
  "Evangelion": [
    { productId: "CX-12", colorLabel: "Standard", colorSlug: "standard" },
  ],

  "Spider-Man": [
    { productId: "BXG-29-01", colorLabel: "Standard", colorSlug: "standard" },
  ],

  "Venom": [
    { productId: "BXG-29-02", colorLabel: "Standard", colorSlug: "standard" },
  ],

  "Iron Man": [
    { productId: "BXG-30-01", colorLabel: "Standard", colorSlug: "standard" },
  ],

  "Thanos": [
    { productId: "BXG-30-02", colorLabel: "Standard", colorSlug: "standard" },
  ],

  "Luke Skywalker": [
    { productId: "BXG-33-01", colorLabel: "Standard", colorSlug: "standard" },
  ],

  "Darth Vader": [
    { productId: "BXG-33-02", colorLabel: "Standard", colorSlug: "standard" },
  ],

  "Mandalorian": [
    { productId: "BXG-34-01", colorLabel: "Standard", colorSlug: "standard" },
  ],

  "Moff Gideon": [
    { productId: "BXG-34-02", colorLabel: "Standard", colorSlug: "standard" },
  ],

  "Optimus Prime": [
    { productId: "BXG-36-01", colorLabel: "Standard", colorSlug: "standard" },
  ],

  "Megatron": [
    { productId: "BXG-36-02", colorLabel: "Standard", colorSlug: "standard" },
  ],

  "Optimus Primal": [
    { productId: "BXG-37-01", colorLabel: "Standard", colorSlug: "standard" },
  ],

  "Starscream": [
    { productId: "BXG-37-02", colorLabel: "Standard", colorSlug: "standard" },
  ],

  "T-Rex": [
    { productId: "BXG-40-01", colorLabel: "Standard", colorSlug: "standard" },
  ],

  "Mosasaurus": [
    { productId: "BXG-40-02", colorLabel: "Standard", colorSlug: "standard" },
  ],

  "Spinosaurus": [
    { productId: "BXG-41-01", colorLabel: "Standard", colorSlug: "standard" },
  ],

  "Quetzalcoatlus": [
    { productId: "BXG-41-02", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Unicorn Delta
  // ═══════════════════════════════════════════════════════════════
  "Unicorn Delta": [
    { productId: "CX-17-06", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Crimson Garuda
  // ═══════════════════════════════════════════════════════════════
  "Crimson Garuda": [
    { productId: "BX-38", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "CX-17-06", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Weiss Tiger
  // ═══════════════════════════════════════════════════════════════
  "Weiss Tiger": [
    { productId: "BX-33", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Bullet Griffin
  // ═══════════════════════════════════════════════════════════════
  "Bullet Griffin": [
    { productId: "CX-11", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Ragna Rage
  // ═══════════════════════════════════════════════════════════════
  "Ragna Rage": [
    { productId: "CX-15", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Sol Brave
  // ═══════════════════════════════════════════════════════════════
  "Sol Brave": [
    { productId: "CX-10", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Emperor Crest
  // ═══════════════════════════════════════════════════════════════
  "Emperor Crest": [
    { productId: "CX-16-1", colorLabel: "Standard", colorSlug: "standard" },
  ],
};