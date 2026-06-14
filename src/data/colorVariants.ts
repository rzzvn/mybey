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
  // Knight Lance
  // ═══════════════════════════════════════════════════════════════
  "Knight Lance": [
    { productId: "BX-13", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-21-02", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-24-03", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Phoenix Wing
  // ═══════════════════════════════════════════════════════════════
  "Phoenix Wing": [
    { productId: "BX-23", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-35-05", colorLabel: "Ver. 2", colorSlug: "bx35-05" },
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
  // Shark Scale
  // ═══════════════════════════════════════════════════════════════
  "Shark Scale": [
    { productId: "UX-15-01", colorLabel: "Standard", colorSlug: "standard" },
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
  // Unicorn Sting
  // ═══════════════════════════════════════════════════════════════
  "Unicorn Sting": [
    { productId: "BX-26", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-35-03", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Silver Wolf
  // ═══════════════════════════════════════════════════════════════
  "Silver Wolf": [
    { productId: "UX-08", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Ghost Circle
  // ═══════════════════════════════════════════════════════════════
  "Ghost Circle": [
    { productId: "UX-12-01", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "UX-12-02", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "G2755-1", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Circle Ghost (Hasbro rename of Ghost Circle)
  // ═══════════════════════════════════════════════════════════════
  "Circle Ghost": [
    { productId: "G2755-1", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "G1687-1", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Shinobi Shadow
  // ═══════════════════════════════════════════════════════════════
  "Shinobi Shadow": [
    { productId: "UX-05-01", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "UX-05-02", colorLabel: "Yellow Ver.", colorSlug: "yellow" },
    { productId: "UX-05-03", colorLabel: "Black Ver.", colorSlug: "black" },
    { productId: "UX-12-03", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Shinobi Knife
  // ═══════════════════════════════════════════════════════════════
  "Shinobi Knife": [
    { productId: "BXG-16", colorLabel: "Metallic Coat: Blue", colorSlug: "metallic-blue" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Samurai Calibur
  // ═══════════════════════════════════════════════════════════════
  "Samurai Calibur": [
    { productId: "BX-45", colorLabel: "Standard", colorSlug: "standard" },
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
  // Sol Eclipse
  // ═══════════════════════════════════════════════════════════════
  "Sol Eclipse": [
    { productId: "CX-09", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Fox Brush
  // ═══════════════════════════════════════════════════════════════
  "Fox Brush": [
    { productId: "CX-06-01", colorLabel: "Yellow Ver.", colorSlug: "variant-1" },
    { productId: "CX-06-02", colorLabel: "Blue Ver.", colorSlug: "variant-2" },
    { productId: "CX-06-03", colorLabel: "Red Ver.", colorSlug: "variant-3" },
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
  // Lightning L-Drago
  // ═══════════════════════════════════════════════════════════════
  "Lightning L-Dragoupper": [
    { productId: "BXG-07-00", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Collaboration blades (each has one entry)
  // ═══════════════════════════════════════════════════════════════
  "Phoenix Flare": [
    { productId: "CX-12", colorLabel: "Metallic Coat: Red", colorSlug: "metallic-red" },
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
  // Clock Mirage
  // ═══════════════════════════════════════════════════════════════
  "Clock Mirage": [
    { productId: "UX-16-01", colorLabel: "Teal-Green Ver.", colorSlug: "teal-green" },
    { productId: "UX-16-02", colorLabel: "Black/Clear Ver.", colorSlug: "black-clear" },
    { productId: "UX-16-03", colorLabel: "Magenta/Yellow Ver.", colorSlug: "magenta-yellow" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Unicorn Delta
  // ═══════════════════════════════════════════════════════════════
  "Unicorn Delta": [
    { productId: "CX-17-01", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "CX-17-02", colorLabel: "Ver. 2", colorSlug: "variant-2" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Crimson Garuda
  // ═══════════════════════════════════════════════════════════════
  "Crimson Garuda": [
    { productId: "BX-38", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "CX-17-06", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Emperor Might
  // ═══════════════════════════════════════════════════════════════
  "Emperor Might": [
    { productId: "CX-11-01", colorLabel: "Metallic Coat: Black", colorSlug: "metallic-black" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Golem Rock
  // ═══════════════════════════════════════════════════════════════
  "Golem Rock": [
    { productId: "CX-11-02", colorLabel: "Metallic Coat: Green", colorSlug: "metallic-green" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Bullet Griffin
  // ═══════════════════════════════════════════════════════════════
  "Bullet Griffin": [
    { productId: "UX-19", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Bahamut Blitz
  // ═══════════════════════════════════════════════════════════════
  "Bahamut Blitz": [
    { productId: "CX-13", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "CX-16", colorLabel: "Special Ver.", colorSlug: "special" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Mummy Curse
  // ═══════════════════════════════════════════════════════════════
  "Mummy Curse": [
    { productId: "UX-18-01", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "UX-18-02", colorLabel: "Variant 2", colorSlug: "variant-2" },
  ],


  // ═══════════════════════════════════════════════════════════════
  // Viper Tail
  // ═══════════════════════════════════════════════════════════════
  "Viper Tail": [
    { productId: "BX-16-01", colorLabel: "Standard", colorSlug: "variant-1" },
    { productId: "BX-16-02", colorLabel: "Black Ver.", colorSlug: "variant-2" },
    { productId: "BX-16-03", colorLabel: "Yellow Ver.", colorSlug: "variant-3" },
    { productId: "BX-24-04", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-35-06", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Black Shell
  // ═══════════════════════════════════════════════════════════════
  "Black Shell": [
    { productId: "BX-35-01", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-35-02", colorLabel: "Black/Blue Ver.", colorSlug: "variant-2" },
    { productId: "CX-08-05", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Sphinx Cowl
  // ═══════════════════════════════════════════════════════════════
  "Sphinx Cowl": [
    { productId: "BX-27-01", colorLabel: "Green Ver.", colorSlug: "variant-1" },
    { productId: "BX-27-02", colorLabel: "Orange Ver.", colorSlug: "variant-2" },
    { productId: "BX-27-03", colorLabel: "Purple Ver.", colorSlug: "variant-3" },
    { productId: "UX-07-03", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Whale Wave
  // ═══════════════════════════════════════════════════════════════
  "Whale Wave": [
    { productId: "BX-36-01", colorLabel: "Blue Ver.", colorSlug: "variant-1" },
    { productId: "BX-36-02", colorLabel: "Green Ver.", colorSlug: "variant-2" },
    { productId: "BX-36-03", colorLabel: "Pink Ver.", colorSlug: "variant-3" },
    { productId: "BXG-56", colorLabel: "Metallic Coat: Blue", colorSlug: "metallic-blue" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Shelter Drake
  // ═══════════════════════════════════════════════════════════════
  "Shelter Drake": [
    { productId: "BX-39-01", colorLabel: "Green Ver.", colorSlug: "variant-1" },
    { productId: "BX-39-02", colorLabel: "Orange Ver.", colorSlug: "variant-2" },
    { productId: "BX-39-03", colorLabel: "Purple Ver.", colorSlug: "variant-3" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Shark Edge
  // ═══════════════════════════════════════════════════════════════
  "Shark Edge": [
    { productId: "BX-14-01", colorLabel: "Pink Ver.", colorSlug: "variant-1" },
    { productId: "BX-14-02", colorLabel: "Blue Ver.", colorSlug: "variant-2" },
    { productId: "BX-20-02", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-31-05", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-48-02", colorLabel: "Metallic Coat: Blue", colorSlug: "metallic-blue" },
    { productId: "BXG-06", colorLabel: "Metallic Coat: Blue", colorSlug: "metallic-blue" },
    { productId: "BXG-55", colorLabel: "Metallic Coat: Black", colorSlug: "metallic-black" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Ghost Circle (updated)
  // ═══════════════════════════════════════════════════════════════
  // NOTE: already updated separately with UX-05 entries removed

  // ═══════════════════════════════════════════════════════════════
  // Brachiowhip
  // ═══════════════════════════════════════════════════════════════
  "Brachiowhip": [
    { productId: "CX-18-01", colorLabel: "Purple Ver.", colorSlug: "purple" },
    { productId: "CX-18-02", colorLabel: "Gold Ver.", colorSlug: "gold" },
    { productId: "CX-18-03", colorLabel: "Black Ver.", colorSlug: "black" },
  ],



  // ═══════════════════════════════════════════════════════════════
  // Unicorn Delta (updated)
  // ═══════════════════════════════════════════════════════════════
  // NOTE: already exists, needs CX-17 entries added

  // ═══════════════════════════════════════════════════════════════
  // Tyranno Beat
  // ═══════════════════════════════════════════════════════════════
  "Tyranno Beat": [
    { productId: "BX-31-01", colorLabel: "Red Ver.", colorSlug: "variant-1" },
    { productId: "BX-31-02", colorLabel: "Blue Ver.", colorSlug: "variant-2" },
    { productId: "CX-17-05", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "UX-10-02", colorLabel: "Metallic Coat: Red", colorSlug: "metallic-red" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Wyvern Gale
  // ═══════════════════════════════════════════════════════════════
  "Wyvern Gale": [
    { productId: "BX-24-01", colorLabel: "Blue Ver.", colorSlug: "variant-1" },
    { productId: "BX-24-02", colorLabel: "Red Ver.", colorSlug: "variant-2" },
    { productId: "UX-07-02", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "UX-12-06", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Cobalt Dragoon
  // ═══════════════════════════════════════════════════════════════
  "Cobalt Dragoon": [
    { productId: "BX-34", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-48-01", colorLabel: "Metallic Coat: Black", colorSlug: "metallic-black" },
    { productId: "BXG-09", colorLabel: "Metallic Coat: Blue", colorSlug: "metallic-blue" },
    { productId: "BXG-14", colorLabel: "Metallic Coat: Black", colorSlug: "metallic-black" },
    { productId: "BXG-53", colorLabel: "Metallic Coat: White", colorSlug: "metallic-white" },
    { productId: "CX-08-06", colorLabel: "Yellow", colorSlug: "yellow" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Cobalt Drake
  // ═══════════════════════════════════════════════════════════════
  "Cobalt Drake": [
    { productId: "BXH-01", colorLabel: "Metallic Coat: Blue", colorSlug: "metallic-blue" },
    { productId: "BX-46-01", colorLabel: "Metallic Coat: Red", colorSlug: "metallic-red" },
    { productId: "BXG-23", colorLabel: "Clear Ver.", colorSlug: "clear" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Dran Sword
  // ═══════════════════════════════════════════════════════════════
  "Dran Sword": [
    { productId: "BX-01", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-07", colorLabel: "Special Ver.", colorSlug: "special" },
    { productId: "BX-14-03", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-17-01", colorLabel: "Red Ver.", colorSlug: "red" },
    { productId: "BX-22", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BXG-25-01", colorLabel: "Metallic Coat: White", colorSlug: "metallic-white" },
    { productId: "BXG-52", colorLabel: "Metallic Coat: Black", colorSlug: "metallic-black" },
    { productId: "BXC-00-01", colorLabel: "Metallic Coat: Gold", colorSlug: "metallic-gold" },
    { productId: "BXC-00-02", colorLabel: "Metallic Coat: Silver", colorSlug: "metallic-silver" },
    { productId: "BXC-00-03", colorLabel: "Metallic Coat: Bronze", colorSlug: "metallic-bronze" },
    { productId: "BXC-18", colorLabel: "Metallic Coat: Red", colorSlug: "metallic-red" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Dran Buster (updated with more entries)
  // ═══════════════════════════════════════════════════════════════
  // NOTE: needs UX-01, BX-48-05, BXG-18, BX-48-05, CX-08-04 merged

  // ═══════════════════════════════════════════════════════════════
  // Hells Chain
  // ═══════════════════════════════════════════════════════════════
  "Hells Chain": [
    { productId: "BX-21-01", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-31-03", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BXG-08", colorLabel: "Metallic Coat: Blue", colorSlug: "metallic-blue" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Hells Hammer
  // ═══════════════════════════════════════════════════════════════
  "Hells Hammer": [
    { productId: "CX-17-04", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BXG-19", colorLabel: "Metallic Coat: Red", colorSlug: "metallic-red" },
    { productId: "UX-10-04", colorLabel: "Metallic Coat: Blue", colorSlug: "metallic-blue" },
    { productId: "G2755-2", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Hack Viking (Hasbro rename of Hells Hammer)
  // ═══════════════════════════════════════════════════════════════
  "Hack Viking": [
    { productId: "G2755-2", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Hells Scythe
  // ═══════════════════════════════════════════════════════════════
  "Hells Scythe": [
    { productId: "BX-02", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-08-01", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-14-04", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-48-04", colorLabel: "Metallic Coat: Gold", colorSlug: "metallic-gold" },
    { productId: "BXG-03", colorLabel: "Metallic Coat: Green", colorSlug: "metallic-green" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Knight Shield
  // ═══════════════════════════════════════════════════════════════
  "Knight Shield": [
    { productId: "BX-04", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-06", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-08-02", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-14-05", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-20-03", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BXH-02", colorLabel: "Metallic Coat: Green", colorSlug: "metallic-green" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Knight Mail
  // ═══════════════════════════════════════════════════════════════
  "Knight Mail": [
    { productId: "UX-10-01", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BXG-42", colorLabel: "Metallic Coat: Navy", colorSlug: "metallic-navy" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Leon Claw
  // ═══════════════════════════════════════════════════════════════
  "Leon Claw": [
    { productId: "BX-15", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-24-05", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BXG-05", colorLabel: "Metallic Coat: Green", colorSlug: "metallic-green" },
    { productId: "UX-12-04", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Leon Crest
  // ═══════════════════════════════════════════════════════════════
  "Leon Crest": [
    { productId: "CX-05-04", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "UX-06", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Wizard Rod
  // ═══════════════════════════════════════════════════════════════
  "Wizard Rod": [
    { productId: "BX-35-04", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "UX-03", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "UX-04-02", colorLabel: "Special Ver.", colorSlug: "special" },
    { productId: "BXH-09", colorLabel: "Metallic Coat: Gold", colorSlug: "gold" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Wizard Arrow
  // ═══════════════════════════════════════════════════════════════
  "Wizard Arrow": [
    { productId: "BX-03", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-05", colorLabel: "Standard", colorSlug: "standard" },
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
    { productId: "BXG-43", colorLabel: "Metallic Coat: Blue", colorSlug: "metallic-blue" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Meteor Dragoon
  // ═══════════════════════════════════════════════════════════════
  "Meteor Dragoon": [
    { productId: "UX-17", colorLabel: "Metallic Coat: White", colorSlug: "metallic-white" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Aero Pegasus
  // ═══════════════════════════════════════════════════════════════
  "Aero Pegasus": [
    { productId: "BXH-10", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BXG-24", colorLabel: "Red Ver.", colorSlug: "red" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Leon Fang
  // ═══════════════════════════════════════════════════════════════
  "Leon Fang": [
    { productId: "BXG-38", colorLabel: "Red Ver.", colorSlug: "red" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Warrior Saber
  // ═══════════════════════════════════════════════════════════════
  "Warrior Saber": [
    { productId: "UX-09", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BXC-12", colorLabel: "Metallic Coat: Orange", colorSlug: "metallic-orange" },
    { productId: "BXG-54", colorLabel: "Metallic Coat: Blue", colorSlug: "metallic-blue" },
    { productId: "CX-17-03", colorLabel: "Ver. 2", colorSlug: "cx17-03" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Scorpio Spear
  // ═══════════════════════════════════════════════════════════════
  "Scorpio Spear": [
    { productId: "UX-14", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BXG-61", colorLabel: "Metallic Coat: Magenta", colorSlug: "metallic-magenta" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Ragna Rage
  // ═══════════════════════════════════════════════════════════════
  "Ragna Rage": [
    { productId: "CX-15", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BXH-00-01", colorLabel: "Metallic Coat: Gold", colorSlug: "metallic-gold" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Pegasus Blast
  // ═══════════════════════════════════════════════════════════════
  "Pegasus Blast": [
    { productId: "CX-07", colorLabel: "Metallic Coat: Green", colorSlug: "metallic-green" },
    { productId: "BXG-45", colorLabel: "Metallic Coat: Red", colorSlug: "metallic-red" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Phoenix Rudder
  // ═══════════════════════════════════════════════════════════════
  "Phoenix Rudder": [
    { productId: "CX-05-05", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "UX-07-01", colorLabel: "Metallic Coat: Red", colorSlug: "metallic-red" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Perseus Dark
  // ═══════════════════════════════════════════════════════════════
  "Perseus Dark": [
    { productId: "BXH-15", colorLabel: "Metallic Coat: Gold", colorSlug: "metallic-gold" },
    { productId: "CX-03", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "CX-04-02", colorLabel: "Special Ver.", colorSlug: "special" },
  ],



  // ═══════════════════════════════════════════════════════════════
  // Mammoth Tusk
  // ═══════════════════════════════════════════════════════════════
  "Mammoth Tusk": [
    { productId: "BX-48-03", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BXG-32", colorLabel: "Metallic Coat: Black", colorSlug: "metallic-black" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Dran Dagger
  // ═══════════════════════════════════════════════════════════════
  "Dran Dagger": [
    { productId: "BX-20-01", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-31-04", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BXG-25-03", colorLabel: "Metallic Coat: White", colorSlug: "metallic-white" },
    { productId: "UX-18-05", colorLabel: "Standard", colorSlug: "standard" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Pegasus Brush
  // ═══════════════════════════════════════════════════════════════
  "Pegasus Brush": [
    { productId: "CX-06-01", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "CX-06-02", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "CX-06-03", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "UX-07-03", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "UX-09", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BXH-10", colorLabel: "Metallic Coat: Double Blue/Green", colorSlug: "metallic-double-blue-green" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Sol Brave
  // ═══════════════════════════════════════════════════════════════
  "Sol Brave": [
    { productId: "CX-10", colorLabel: "Metallic Coat: Green", colorSlug: "metallic-green" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Weiss Tiger
  // ═══════════════════════════════════════════════════════════════
  "Weiss Tiger": [
    { productId: "UX-18-06", colorLabel: "Standard", colorSlug: "standard" },
    { productId: "BX-33", colorLabel: "Standard", colorSlug: "standard" },
  ],
  // ═══════════════════════════════════════════════════════════════
  // Evangelion (CX Collaboration)
  // ═══════════════════════════════════════════════════════════════
  "Evangelion": [
    { productId: "BXG-57-01", colorLabel: "Metal Coat: Orange (Unit-00)", colorSlug: "unit-00" },
    { productId: "BXG-57-02", colorLabel: "Metal Coat: Violet (Unit-01)", colorSlug: "unit-01" },
    { productId: "BXG-57-03", colorLabel: "Metal Coat: Red (Unit-02)", colorSlug: "unit-02" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Emperor Crest — not yet in phstudy blade catalog; placeholder
  // ═══════════════════════════════════════════════════════════════
  "Emperor Crest": [
  ],
};