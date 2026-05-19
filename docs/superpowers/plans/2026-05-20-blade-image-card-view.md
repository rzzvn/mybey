# Blade Image + Card View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add blade images to the product catalog table and a compact card view toggle for better mobile experience.

**Architecture:** Add `viewMode` state to `ProductCatalog` for table/card toggle with localStorage persistence. Add `"image"` column to table view using existing `PartImage` component. Create new `ProductCard` component for compact card layout with responsive grid. Both views share the same `filtered` data and filter/sort/tag logic.

**Tech Stack:** React, TypeScript, Tailwind CSS, Lucide React icons, existing `PartImage` component

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/data/i18n.ts` | Modify | Add `image` and `cardView`/`tableView` labels |
| `src/components/ProductCatalog.tsx` | Modify | Add `viewMode` state, toggle buttons, image column, conditional render |
| `src/components/ProductCard.tsx` | Create | Compact card component for grid view |

---

### Task 1: Add i18n labels

**Files:**
- Modify: `src/data/i18n.ts:770-778`

- [ ] **Step 1: Add `image`, `tableView`, and `cardView` labels to the `ui` object**

In `src/data/i18n.ts`, after line 778 (`columns: "欄位",`), add:

```typescript
  image: "圖片",
  tableView: "列表",
  cardView: "卡片",
```

- [ ] **Step 2: Commit**

```bash
git add src/data/i18n.ts
git commit -m "feat: add image, tableView, cardView i18n labels"
```

---

### Task 2: Add image column to table view

**Files:**
- Modify: `src/components/ProductCatalog.tsx`

- [ ] **Step 1: Add `PartImage` import and `image` to ALL_COLUMNS**

In `ProductCatalog.tsx`, add `PartImage` to the imports at the top:

```typescript
import PartImage from "./PartImage";
```

Then modify `ALL_COLUMNS` (line 157) to include `"image"` as the first entry:

```typescript
const ALL_COLUMNS = ["image", "tier", "code", "name", "price", "blade", "bladeTier", "assistBlade", "ratchet", "ratchetTier", "bit", "bitTier", "comboRemarks", "extras", "remarks"] as const;
```

And update `DEFAULT_VISIBLE` (line 159) to include `"image"`:

```typescript
const DEFAULT_VISIBLE: ColumnKey[] = ["image", "tier", "code", "name", "blade", "bladeTier", "ratchet", "bit"];
```

- [ ] **Step 2: Add `image` column header to the table `<thead>`**

In the `<thead>` section (around line 402), add a new `<th>` before the tier column:

```tsx
{show("image") && <th className="table-header">{ui.image}</th>}
```

- [ ] **Step 3: Add `image` column cell to the table `<tbody>` row**

In the `<tbody>` row rendering (inside the `filtered.map` block, around line 439), add a new `<td>` before the tier cell:

```tsx
{show("image") && <td className="table-cell">
  {row.bey?.blade ? (
    <PartImage type="Blade" name={row.bey.blade} tier={getBladeTier(row.bey.blade)} className="w-10 h-10" />
  ) : (
    <span className="text-gray-300 text-xs">—</span>
  )}
</td>}
```

- [ ] **Step 4: Add `image` label to the column menu checkbox list**

In the column menu checkbox list (around line 376-389), add the `image` case at the beginning of the ternary chain:

```tsx
col === "image" ? ui.image :
col === "tier" ? ui.tier :
```

- [ ] **Step 5: Verify changes compile correctly**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 6: Commit**

```bash
git add src/components/ProductCatalog.tsx
git commit -m "feat: add image column to product catalog table"
```

---

### Task 3: Create ProductCard component

**Files:**
- Create: `src/components/ProductCard.tsx`

- [ ] **Step 1: Create the `ProductCard` component**

Create `src/components/ProductCard.tsx` with this content:

```tsx
import { ExternalLink, Tag, X } from "lucide-react";
import { getDualZhName } from "../data/i18n";
import { bladeNamesZh, bladeNamesZhTw, typeLabelsZh, ui } from "../data/i18n";
import { bladeTiers } from "../data/parts";
import PartImage from "./PartImage";
import type { FlatRow } from "./ProductCatalog";
import type { ProductTag } from "../data/types";

function getBladeTier(name?: string): string {
  if (!name) return "—";
  return bladeTiers[name] || "—";
}

function tierBadgeClass(tier: string | null | undefined): string {
  switch (tier) {
    case "TIER0": return "tier-p0";
    case "TIER1": return "tier-p1";
    case "TIER2": return "tier-p2";
    case "BONUS": return "tier-bonus";
    default: return "tier-none";
  }
}

const typeIcons: Record<string, string> = {
  Stadium: "🏟️", Launcher: "🚀", Pass: "🎫", Accessory: "🔧",
};

export default function ProductCard({
  row,
  currentTag,
  onSetTag,
  onRemoveTag,
  onToggleDropdown,
  openDropdown,
  dropdownRef,
}: {
  row: FlatRow;
  currentTag: ProductTag | undefined;
  onSetTag: (id: string, tag: ProductTag) => void;
  onRemoveTag: (id: string) => void;
  onToggleDropdown: (id: string) => void;
  openDropdown: string | null;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}) {
  const hasBlade = !!row.bey?.blade;

  return (
    <div className={`border border-gray-200 rounded-xl bg-white p-3 hover:shadow-md transition-shadow ${currentTag === "purchased" ? "ring-2 ring-green-400" : ""}`}>
      {/* Blade image or type icon */}
      <div className="flex justify-center mb-2">
        {hasBlade ? (
          <PartImage type="Blade" name={row.bey!.blade!} tier={getBladeTier(row.bey!.blade)} className="w-20 h-20" />
        ) : (
          <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded-lg">
            <span className="text-3xl">{typeIcons[row.type] || "📦"}</span>
          </div>
        )}
      </div>

      {/* Code + tier badge */}
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="font-mono font-semibold text-sm text-gray-900">{row.code}</span>
        <span className={`tier-badge ${tierBadgeClass(row.tier)}`}>
          {row.tier ? (typeLabelsZh[row.type] || row.tier) : "—"}
        </span>
      </div>

      {/* Product name */}
      <a
        href={`https://www.google.com/search?q=Beyblade+X+${encodeURIComponent(row.nameEn)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline leading-tight mb-0.5"
      >
        {getDualZhName(row.nameZh, row.nameZhTw)}
        <ExternalLink className="w-3 h-3 inline ml-0.5 opacity-50" />
      </a>
      <div className="text-xs text-gray-400 mb-2">{row.nameEn}</div>

      {/* Tag button */}
      <div className="relative" ref={openDropdown === row.productId ? dropdownRef : undefined}>
        <button
          onClick={() => onToggleDropdown(row.productId)}
          className={`btn text-xs w-full justify-center ${currentTag === "purchased" ? "btn-success" : currentTag === "wishlist" ? "btn-primary" : currentTag === "getting" ? "bg-yellow-500 text-white" : "btn-secondary"}`}
        >
          <Tag className="w-3 h-3" />
          {currentTag ? (currentTag === "purchased" ? ui.tagPurchased : currentTag === "wishlist" ? ui.tagWishlist : ui.tagGetting) : ui.tagProduct}
        </button>
        {openDropdown === row.productId && (
          <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
            <button
              onClick={() => { onSetTag(row.productId, "purchased"); onToggleDropdown(row.productId); }}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-green-50 text-green-700"
            >
              ✓ {ui.tagPurchased}
            </button>
            <button
              onClick={() => { onSetTag(row.productId, "wishlist"); onToggleDropdown(row.productId); }}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 text-blue-700"
            >
              ♡ {ui.tagWishlist}
            </button>
            <button
              onClick={() => { onSetTag(row.productId, "getting"); onToggleDropdown(row.productId); }}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-yellow-50 text-yellow-700"
            >
              ↗ {ui.tagGetting}
            </button>
            {currentTag && (
              <button
                onClick={() => { onRemoveTag(row.productId); onToggleDropdown(row.productId); }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 text-gray-500"
              >
                <X className="w-3 h-3 inline" /> {ui.tagNone}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ProductCard.tsx
git commit -m "feat: create ProductCard component for card view"
```

---

### Task 4: Add view toggle and conditional rendering to ProductCatalog

**Files:**
- Modify: `src/components/ProductCatalog.tsx`

- [ ] **Step 1: Export `FlatRow` type and add view toggle state**

In `ProductCatalog.tsx`:

1. Change the `FlatRow` interface (line 63) from private to exported so `ProductCard` can import it:
   - Change `interface FlatRow {` to `export interface FlatRow {`

2. Add `LayoutList` and `LayoutGrid` to the Lucide imports at line 2:
```typescript
import { Search, ExternalLink, ArrowUpDown, ArrowUp, ArrowDown, Tag, X, Columns3, LayoutList, LayoutGrid } from "lucide-react";
```

3. Add `ProductCard` import:
```typescript
import ProductCard from "./ProductCard";
```

4. Add `viewMode` state after the `tagFilter` state (line 154):
```typescript
const [viewMode, setViewMode] = useState<"table" | "card">(() => {
  try {
    const saved = localStorage.getItem("bey-catalog-view");
    if (saved === "card" || saved === "table") return saved;
  } catch {}
  return "table";
});
```

5. Add localStorage persistence for viewMode after the existing `useEffect` for columns (after line 172):
```typescript
useEffect(() => {
  localStorage.setItem("bey-catalog-view", viewMode);
}, [viewMode]);
```

- [ ] **Step 2: Add view toggle buttons in the filter bar**

In the filter bar section (around line 395, after the column menu `</div>` and before the closing `</div>` of the filter bar), add the view toggle:

```tsx
<div className="flex items-center gap-0.5 border border-gray-200 rounded-lg overflow-hidden">
  <button
    onClick={() => setViewMode("table")}
    className={`p-2 ${viewMode === "table" ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
    title={ui.tableView}
  >
    <LayoutList className="w-4 h-4" />
  </button>
  <button
    onClick={() => setViewMode("card")}
    className={`p-2 ${viewMode === "card" ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
    title={ui.cardView}
  >
    <LayoutGrid className="w-4 h-4" />
  </button>
</div>
```

- [ ] **Step 3: Add conditional rendering — card view**

Currently the table is wrapped in a `<div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">`. We need to wrap the entire table + footer in a conditional and add a card grid alternative.

Find the section starting at the current table wrapper (line 397: `<div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">`) and replace the entire block from that `<div>` through the closing `</div>` that contains the table and footer (ending at line 582) with:

```tsx
{viewMode === "table" ? (
  <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
    <div className="overflow-x-auto">
      <table className="w-full">
        {/* ... existing thead ... */}
        {/* ... existing tbody ... */}
      </table>
    </div>
    <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500 border-t border-gray-100">
      {/* ... existing footer ... */}
    </div>
  </div>
) : (
  <>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {filtered.map((row) => {
        const currentTag = getTag(row.productId);
        return (
          <ProductCard
            key={row.id}
            row={row}
            currentTag={currentTag}
            onSetTag={setTag}
            onRemoveTag={removeTag}
            onToggleDropdown={(id) => setOpenDropdown(openDropdown === id ? null : id)}
            openDropdown={openDropdown}
            dropdownRef={dropdownRef}
          />
        );
      })}
    </div>
    <div className="px-4 py-3 text-xs text-gray-500">
      {ui.showing} {filtered.length} {ui.of} {flatRows.length} {ui.productCount} ·{" "}
      <span className="text-green-600 font-medium">{flatRows.filter(r => getTag(r.productId) === "purchased").length} {ui.tagPurchased}</span>
      {" · "}
      <span className="text-blue-600 font-medium">{flatRows.filter(r => getTag(r.productId) === "wishlist").length} {ui.tagWishlist}</span>
      {" · "}
      <span className="text-yellow-600 font-medium">{flatRows.filter(r => getTag(r.productId) === "getting").length} {ui.tagGetting}</span>
    </div>
  </>
)}
```

**Important**: The entire existing table section (the `<div className="border...">` containing `<table>...</table>` and the footer `<div>`) gets wrapped in the ternary. The table content itself stays unchanged — only the wrapping conditional and card branch are new.

- [ ] **Step 4: Verify changes compile**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 5: Commit**

```bash
git add src/components/ProductCatalog.tsx
git commit -m "feat: add view toggle and card view rendering to ProductCatalog"
```

---

### Task 5: Verify visually and handle edge cases

- [ ] **Step 1: Run dev server and verify table view still works**

Run: `npm run dev`
Check: Table view shows blade images in new first column, all existing columns still work, column toggle includes "圖片" (image)

- [ ] **Step 2: Switch to card view and verify**

Check: Card view shows blade images (80x80), code+tier badge, name+link, tag button. Grid is responsive (2 cols mobile, 3 tablet, 4 desktop). No-blade products show type icon.

- [ ] **Step 3: Verify view persistence**

Toggle to card view, refresh page → should stay in card view. Toggle to table, refresh → should stay in table view.

- [ ] **Step 4: Verify image column toggle**

In table view, open columns menu. Uncheck "圖片". Image column disappears. Re-check it. Image column reappears. This should persist on refresh.

- [ ] **Step 5: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: card view and image column edge cases"
```