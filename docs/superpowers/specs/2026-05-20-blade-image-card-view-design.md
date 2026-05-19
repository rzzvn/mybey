# Blade Image + Card View Design

**Date**: 2026-05-20  
**Status**: Approved  
**Approach**: A — Minimal inline toggle + shared data, separate renderers

## Context

The product catalog currently has a single table view. Two features are needed:

1. **Blade images in the product list** — blades already have local `.webp` images in `public/parts/blades/`, and `PartImage` + `partImages.ts` handle loading with remote fallback and tier-colored placeholders.
2. **Card view for mobile** — a compact card layout that shows blade image, code, name, tier badge, and tag button. Better mobile experience than a wide table.

## Design

### 1. View Toggle

- **Location**: Filter bar, alongside the columns button
- **Controls**: Two Lucide icons — `LayoutList` (table) and `LayoutGrid` (card) — always visible side by side
- **State**: `viewMode: "table" | "card"`, persisted in `localStorage` key `"bey-catalog-view"`, defaults to `"table"`
- **Behavior**: Clicking inactive icon switches instantly. Clicking active icon is a no-op.
- **Rendering**: `ProductCatalog` conditionally renders `<table>` block or `<ProductCardGrid>` based on `viewMode`
- **Shared data**: `filtered` array, `flatRows`, search, sort, tags — all stay in `ProductCatalog`, passed down to both views

### 2. Card View Layout

**Component**: New `ProductCard` in `src/components/ProductCard.tsx`

**Card content (compact — option A)**:
- **Top**: Blade image — `PartImage type="Blade" name={bey.blade} tier={bladeTier}`, ~80x80px, centered
- **Below image**: Product code (font-mono, bold) + tier badge inline
- **Below that**: Chinese name (via `getDualZhName`), English name smaller underneath
- **Bottom**: Tag dropdown button (same purchased/wishlist/getting as table)
- **No ratchet/bit/price/remarks** on card face — compact by design
- **Tap code/name**: Links to wiki search (same behavior as table)

**No-blade products** (stadiums, launchers, etc.):
- Show product type icon from `ExtraPill`'s icon map (🏟️🚀🎫🔧) as placeholder
- Name + code + tag still shown

**Grid**: Responsive CSS grid
- 2 columns: <640px
- 3 columns: 640-1024px
- 4 columns: >1024px
- `gap-3` between cards

**Card styling**: White bg, border, rounded-xl, padding, hover shadow transition

### 3. Image Column in Table View

- **Column key**: `"image"` added as first item in `ALL_COLUMNS`
- **Default visible**: ON by default in `DEFAULT_VISIBLE`
- **Position**: First column (before tier)
- **Cell content**: `PartImage type="Blade" name={bey.blade} tier={getBladeTier(bey.blade)} className="w-10 h-10"` (40x40px thumbnail)
- **No blade**: Empty cell with `"—"` dash
- **Header label**: `ui.image` → `"图片"`
- **Width**: Narrow fixed column. `object-contain` ensures blade fills 40x40 without distortion
- **Toggle**: Existing columns menu shows "图片" checkbox, same as all other columns

### 4. i18n Changes

Add to `src/data/i18n.ts`:
- `ui.image` → `"图片"`

## Files Changed

| File | Change |
|------|--------|
| `src/components/ProductCatalog.tsx` | Add `viewMode` state + localStorage persistence, view toggle buttons, conditional render, add `"image"` column |
| `src/components/ProductCard.tsx` | **NEW** — compact card component |
| `src/data/i18n.ts` | Add `image` label |

## Approach Trade-offs

- **Approach A (chosen)**: Minimal refactoring, `ProductCatalog` stays as orchestrator, `ProductCard` is self-contained. If the file grows too large, extracting views is a natural next step.
- **Approach B** (not chosen): Extract TableView + CardView immediately. Cleaner separation but more files for a small feature scope.
- **Approach C** (not chosen): Full `useProductFilters` hook extraction. Overkill for 2 features.