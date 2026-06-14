#!/usr/bin/env bash
set -uo pipefail

# ── Download images from phstudy.org ──────────────────────────────
# Maps our readable part names → phstudy.org PRD IDs → downloads PNG → converts to WebP
# ──────────────────────────────────────────────────────────────────

MYBEY_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PHSTUDY_BASE="https://beyblade.phstudy.org/images/site"
TMP_DIR="/tmp/phstudy-download"

mkdir -p "$TMP_DIR"

# ── Part Type Mapping ─────────────────────────────────────────────
# For each part type, we map our readable name → phstudy PRD ID
# These are the canonical PRD IDs that have the cleanest images for each part

# Helpers
download_and_convert() {
  local folder="$1"   # e.g. Ratchet, LockChip, MetalBlade, OverBlade
  local prd_id="$2"   # e.g. RC-PRD-910381-00
  local output_name="$3"  # e.g. 3-60
  local output_dir="$4"   # e.g. public/parts/ratchets
  
  local url="${PHSTUDY_BASE}/${folder}/${prd_id}.png"
  local tmp_png="${TMP_DIR}/${prd_id}.png"
  local output_webp="${MYBEY_DIR}/${output_dir}/${output_name}.webp"
  
  # Skip if already exists
  [ -f "$output_webp" ] && return 0
  
  # Download
  if curl -sf "$url" -o "$tmp_png" 2>/dev/null; then
    # Convert to WebP (quality 85, good balance)
    cwebp -quiet -q 85 "$tmp_png" -o "$output_webp" 2>/dev/null
    echo "  ✅ ${output_name}.webp"
    return 0
  else
    echo "  ⚠️  Failed: ${prd_id} → ${output_name}"
    return 1
  fi
}

# ──────────────────────────────────────────────────────────────────
# 1. RATCHETS - map 35 unique ratchet names to phstudy PRD IDs
# ──────────────────────────────────────────────────────────────────
# Key: our ratchet name → phstudy PRD ID
# Picked the best/cleanest image per ratchet

echo "📥 Downloading Ratchets..."

declare -A RATCHET_MAP
RATCHET_MAP["0-60"]="RC-PRD-097242-00"  # CX-10 WolfHunt
RATCHET_MAP["0-70"]="RC-PRD-080558-00"  # BXG-61 ScorpioSpear
RATCHET_MAP["0-80"]="RC-PRD-939566-01"  # UX-12 GhostCircle
RATCHET_MAP["1-50"]="RC-PRD-097259-00"  # CX-13 BahamutBlitz
RATCHET_MAP["1-60"]="RC-PRD-090960-00"  # BXG-52 DranSword
RATCHET_MAP["1-70"]="RC-PRD-982432-02"  # UX-15 TyrannoRoar
RATCHET_MAP["1-80"]="RC-PRD-085690-00"  # BXG-56 WhaleWave
RATCHET_MAP["2-60"]="RC-PRD-085706-00"  # BXG-55 SharkEdge
RATCHET_MAP["2-70"]="RC-PRD-939535-00"  # UX-09 SamuraiSaber
RATCHET_MAP["2-80"]="RC-PRD-096092-05"  # BX-48 DranBuster
RATCHET_MAP["3-60"]="RC-PRD-910381-00"  # BX-01 DranSword
RATCHET_MAP["3-70"]="RC-PRD-096528-00"  # BXG-24 AeroPegasus
RATCHET_MAP["3-80"]="RC-PRD-910404-00"  # BX-04 KnightShield
RATCHET_MAP["3-85"]="RC-PRD-096092-04"  # BX-48 HellsScythe
RATCHET_MAP["4-50"]="RC-PRD-096122-00"  # BX-49 DranStrike
RATCHET_MAP["4-55"]="RC-EVE-088899-00"  # BXH-22 RagnaRage
RATCHET_MAP["4-60"]="RC-PRD-910398-00"  # BX-02 HellsScythe
RATCHET_MAP["4-70"]="RC-PRD-096092-02"  # BX-48 SharkEdge
RATCHET_MAP["4-80"]="RC-PRD-910473-00"  # BX-03 WizardArrow
RATCHET_MAP["5-60"]="RC-PRD-085515-00"  # BXG-54 SamuraiSaber
RATCHET_MAP["5-70"]="RC-PRD-914495-00"  # BXH-09 WizardRod
RATCHET_MAP["5-80"]="RC-PRD-912972-01"  # BX-16 ViperTail
RATCHET_MAP["6-60"]="RC-PRD-939597-00"  # CX-01 DranBrave
RATCHET_MAP["6-70"]="RC-PRD-939580-00"  # BX-45 SamuraiCalibur
RATCHET_MAP["6-80"]="RC-PRD-939610-00"  # CX-03 PerseusDark
RATCHET_MAP["7-55"]="RC-PRD-097167-01"  # UX-18 MummyCurse
RATCHET_MAP["7-60"]="RC-PRD-096092-03"  # BX-48 MammothTusk
RATCHET_MAP["7-70"]="RC-PRD-939542-03"  # UX-10 PteraSwing
RATCHET_MAP["7-80"]="RC-PRD-096146-06"  # CX-17 CrimsonGaruda
RATCHET_MAP["8-70"]="RC-PRD-097266-00"  # CX-14 KnightFortress
RATCHET_MAP["9-60"]="RC-PRD-098843-00"  # BXG-53 CobaltDragoon
RATCHET_MAP["9-65"]="RC-PRD-096146-03"  # CX-17 SamuraiSaber
RATCHET_MAP["9-70"]="RC-PRD-097167-04"  # UX-18 SolBrave
RATCHET_MAP["9-80"]="RC-PRD-096092-01"  # BX-48 CobaltDragoon
RATCHET_MAP["M-85"]="RC-PRD-098775-02"  # CX-11 GolemRock

mkdir -p "${MYBEY_DIR}/public/parts/ratchets"
for name in "${!RATCHET_MAP[@]}"; do
  download_and_convert "Ratchet" "${RATCHET_MAP[$name]}" "$name" "public/parts/ratchets"
done

echo ""
echo "📥 Downloading Lock Chips..."

# ──────────────────────────────────────────────────────────────────
# 2. LOCK CHIPS
# ──────────────────────────────────────────────────────────────────
declare -A LOCKCHIP_MAP
LOCKCHIP_MAP["Bahamut"]="LC-PRD-097259-00"
LOCKCHIP_MAP["Brachio"]="LC-PRD-096177-01"
LOCKCHIP_MAP["Cerberus"]="LC-PRD-956983-01"
LOCKCHIP_MAP["Drake"]="LC-PRD-097266-00"  # Shelter Drake → Knight Fortress lock chip
LOCKCHIP_MAP["Dran"]="LC-PRD-939597-00"
LOCKCHIP_MAP["Emperor"]="LC-PRD-098775-01"
LOCKCHIP_MAP["Eva"]="LC-PRD-085683-00"
LOCKCHIP_MAP["Fox"]="LC-PRD-956969-01"
LOCKCHIP_MAP["Hells"]="LC-PRD-939627-01"
LOCKCHIP_MAP["Knight"]="LC-PRD-097266-00"
LOCKCHIP_MAP["Leon"]="LC-PRD-994350-00"
LOCKCHIP_MAP["Mummy"]="LC-PRD-098775-01"
LOCKCHIP_MAP["Pegasus"]="LC-PRD-956976-00"
LOCKCHIP_MAP["Perseus"]="LC-PRD-939610-00"
LOCKCHIP_MAP["Phoenix"]="LC-PRD-096153-00"
LOCKCHIP_MAP["Ragna"]="LC-PRD-097273-00"
LOCKCHIP_MAP["Rhino"]="LC-PRD-939627-02"
LOCKCHIP_MAP["Sol"]="LC-PRD-995678-00"
LOCKCHIP_MAP["Unicorn"]="LC-PRD-096146-01"
LOCKCHIP_MAP["Valkyrie"]="LC-PRD-954316-00"
LOCKCHIP_MAP["Whale"]="LC-PRD-956983-02"
LOCKCHIP_MAP["Wizard"]="LC-PRD-939603-00"
LOCKCHIP_MAP["Wolf"]="LC-PRD-097242-00"

for name in "${!LOCKCHIP_MAP[@]}"; do
  download_and_convert "LockChip" "${LOCKCHIP_MAP[$name]}" "$name" "public/parts/lockChip"
done

echo ""
echo "📥 Downloading Main Blades..."

# ──────────────────────────────────────────────────────────────────
# 3. MAIN BLADES (CX top halves)
# ──────────────────────────────────────────────────────────────────
declare -A MAINBLADE_MAP
MAINBLADE_MAP["Arc"]="MB-PRD-939603-00"
MAINBLADE_MAP["Blast"]="MB-PRD-956976-00"
MAINBLADE_MAP["Brave"]="MB-PRD-939597-00"
MAINBLADE_MAP["Brush"]="MB-PRD-956969-01"
MAINBLADE_MAP["Curse"]="MB-PRD-098775-01"  # Emperor Might
MAINBLADE_MAP["Dark"]="MB-PRD-939610-00"
MAINBLADE_MAP["Eclipse"]="MB-PRD-995678-00"
MAINBLADE_MAP["Fang"]="MB-PRD-994350-00"
MAINBLADE_MAP["Flame"]="MB-PRD-956983-01"  # Cerberus
MAINBLADE_MAP["Flare"]="MB-PRD-096153-00"
MAINBLADE_MAP["Hunt"]="MB-PRD-097242-00"
MAINBLADE_MAP["Might"]="MB-PRD-098775-01"
MAINBLADE_MAP["Reaper"]="MB-PRD-939627-02"
MAINBLADE_MAP["Volt"]="MB-PRD-954316-00"

for name in "${!MAINBLADE_MAP[@]}"; do
  download_and_convert "MainBlade" "${MAINBLADE_MAP[$name]}" "$name" "public/parts/mainBlade"
done

echo ""
echo "📥 Downloading Metal Blades..."

# ──────────────────────────────────────────────────────────────────
# 4. METAL BLADES (CX mid layers)
# ──────────────────────────────────────────────────────────────────
declare -A METALBLADE_MAP
METALBLADE_MAP["Blitz"]="ME-PRD-097259-00"
METALBLADE_MAP["Delta"]="ME-PRD-096146-01"
METALBLADE_MAP["Fortress"]="ME-PRD-097266-00"
METALBLADE_MAP["Rage"]="ME-PRD-097273-00"
METALBLADE_MAP["Whip"]="ME-PRD-096177-01"

for name in "${!METALBLADE_MAP[@]}"; do
  download_and_convert "MetalBlade" "${METALBLADE_MAP[$name]}" "$name" "public/parts/metalBlade"
done

echo ""
echo "📥 Downloading Over Blades..."

# ──────────────────────────────────────────────────────────────────
# 5. OVER BLADES (CX bottom layers)
# ──────────────────────────────────────────────────────────────────
declare -A OVERBLADE_MAP
OVERBLADE_MAP["Break"]="OV-PRD-097259-00"
OVERBLADE_MAP["Flow"]="OV-PRD-097273-00"
OVERBLADE_MAP["Guard"]="OV-PRD-097266-00"
OVERBLADE_MAP["Outer"]="OV-PRD-096177-01"
OVERBLADE_MAP["Peak"]="OV-PRD-096146-01"

for name in "${!OVERBLADE_MAP[@]}"; do
  download_and_convert "OverBlade" "${OVERBLADE_MAP[$name]}" "$name" "public/parts/overBlade"
done

echo ""
echo "✅ All done!"
echo ""
echo "📊 Summary:"
for dir in ratchets lockChip mainBlade metalBlade overBlade; do
  count=$(ls -1 "${MYBEY_DIR}/public/parts/${dir}/"*.webp 2>/dev/null | wc -l)
  echo "  ${dir}: ${count} images"
done