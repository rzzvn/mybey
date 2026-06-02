# Beyblade X Catalog & Collection Manager

A reference and personal tracking app for the Beyblade X product line. Users look up products, parts, and tiers, and track their personal collection (ownership, wishlists, combos).

## Language

**Product**:
A boxed retail item sold by Takara Tomy (or Hasbro). The primary entity in the catalog.
_Avoid_: Item, box, release

**Part**:
A single component of a beyblade assembly (Blade, Ratchet, Bit, Lock Chip, etc.). Extracted from Products via the part registry.
_Avoid_: Piece, component

**Combo**:
A specific assembly of Parts into a battle-ready beyblade configuration.
_Avoid_: Build, setup, loadout

**Standard Line**:
BX and UX products. A Combo has three Parts: Blade + Ratchet + Bit.
_Avoid_: Basic line, normal line, 3-part

**Custom Line**:
CX products. A Combo has five or six Parts depending on the generation.
_Avoid_: Premium line, advanced line

**Custom Line Expand**:
CX-13+ products. The second generation of Custom Line. A Combo has six Parts: Lock Chip + Metal Blade + Over Blade + Assist Blade + Ratchet + Bit.
_Avoid_: Extended, Extended Line, CX Expand

**Custom Line Original**:
CX-01~12 products. The first generation of Custom Line. A Combo has five Parts: Lock Chip + Main Blade + Assist Blade + Ratchet + Bit.
_Avoid_: Base Custom, non-Expand, Original Line

### Blading Parts

**Blade**:
The topmost striking layer of a beyblade. The umbrella term for all line variants.
_Avoid_: Layer, attack piece

**Lock Chip**:
Custom Line only. The chip that locks the blade assembly together and determines spin direction.
_Avoid_: Chip, lock

**Main Blade**:
Custom Line Original only (CX-01~12). The primary plastic/metal attacking component.
_Avoid_: Primary blade, main layer

**Metal Blade**:
Custom Line Expand only (CX-13+). The weighted metal core of the blade assembly.
_Avoid_: Metal core, inner blade

**Over Blade**:
Custom Line Expand only (CX-13+). The outer shell layer that sits over the Metal Blade.
_Avoid_: Outer blade, shell, cover

**Assist Blade**:
Custom Line only. The secondary blade layer attached below the main blade assembly.
_Avoid_: Support blade, secondary blade

**Ratchet**:
The locking ring that connects the blade assembly to the Bit. Identified by number-dash-number format (e.g., 1-60, 3-80).
_Avoid_: Ring, lock ring, connector

**Bit**:
The performance tip at the bottom of the beyblade that determines movement pattern. Identified by letter code (e.g., A, FB, DB).
_Avoid_: Tip, bottom, performance tip

**Pack** (Random Booster):
A product where the buyer does not know which specific bey they will receive. Random from a pool. May vary by configuration (different Ratchet+Bit) or by color.
_Avoid_: Random pack, blind box

**Color Variant**:
A Part released in a different paint job. Same shape, same stats, different color. Belongs to the Part, not the Product. A Product with `variantOf` is a Color Variant release of the parent Product.
_Avoid_: Color way, recolor, paint variant

### Ownership Tags

**purchased**:
The user owns this product. Arrived and in hand.
_Avoid_: Owned, have

**getting**:
The user has ordered this product. In transit, not yet arrived.
_Avoid_: Ordered, shipping, incoming

**wishlist**:
The user wants this product but has not ordered it yet.
_Avoid_: Wanted, desired

### Tiers

**Product Tier**:
A purchase recommendation for a Product. Four levels: TIER0 (must buy), TIER1 (priority), TIER2 (if spare money), BONUS (bonus).
_Avoid_: Buy tier, purchase tier

**Part Tier**:
A competitive ranking for a Part. Thirteen levels from T0 (X tier) through T6 (E tier), with half-tier steps (e.g., T0.5, T1.5).
_Avoid_: Competitive tier, meta tier

## Relationships

- A **Product** contains one or more **Combos** (via `beys[]`)
- A **Combo** consists of 3–6 **Parts** depending on the product line
- A **Part** appears in one or more **Products** (via `containedIn[]`)
- **Custom Line** has two generations: **Custom Line Original** (CX-01~12) and **Custom Line Expand** (CX-13+)
- A **Color Variant** is a per-Part attribute — the same Part in a different paint job, often released as a separate Product with `variantOf`
- A **Pack** contains multiple possible Combos; the buyer receives one at random

## Example dialogue

> **Dev:** "I'm adding a new **Custom Line Expand** **Product** — CX-20 Bahamut Guard. It has a **Lock Chip**, **Metal Blade**, **Over Blade**, **Assist Blade**, **Ratchet**, and **Bit**. That's six **Parts** total, right?"
> **Domain expert:** "Yes — **Custom Line Expand** always has six **Parts**. The **Combo** from this **Product** would be Bahamut + Guard + the **Over Blade** and **Assist Blade** plus **Ratchet** and **Bit**."
>
> **Dev:** "And the **Blade** field — do I still set it?"
> **Domain expert:** "Yes, set `blade` to the composite name: `{LockChip}{MetalBlade}`. So 'Bahamut Guard'. That composite exists as a **Blade** in the registry for catalog browsing, but the individual **Parts** are what matter for competitive tiering."
>
> **Dev:** "What about the **Color Variant** release? Same product or separate?"
> **Domain expert:** "Separate **Product** entry with `variantOf` pointing to the parent. The variant is a per-**Part** attribute — same shape, same stats, different paint job. Tag the variant **Product** with `purchased` if you own that specific color, not the original."
>
> **Dev:** "And if it's a **Pack**?"
> **Domain expert:** "Then the buyer gets one **Combo** at random from the pool. Each possibility gets a sub-item ID like `CX-20-1`, `CX-20-2`. The **Product Tier** covers the whole **Pack** purchase recommendation, but each **Part** inside gets its own **Part Tier**."

## Flagged ambiguities

- `code` duplicates exist in products data beyond Random Booster Pack sub-items (which legitimately share a parent code). These are data errors — `code` should be unique except for Pack sub-items. Known duplicates involve color variant overlap and synthetic `id` entries reusing a retail code already assigned to another product.
- The **Product Number** (printed on packaging, e.g., BX-00) is NOT always unique — multiple special/collab products can share "BX-00". The retail code/SKU (e.g., BXG-57) IS unique per product. The app's `id` field is a synthetic key that disambiguates non-unique product numbers (e.g., `BX-00-eva`).
- Blade names have three sources of variation: official aliases (e.g., "Wand Wizard" = "Wizard Rod"), community nicknames (e.g., "左龍" = Cobalt Dragoon), and data errors. The app resolves community names via `BLADE_NAME_MAP` and cross-brand names via `bladeSimilarities`, but some name inconsistencies in the dataset are data errors that need fixing.