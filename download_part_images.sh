#!/bin/bash
# Download Beyblade part images from Fandom wiki for local serving.
#
# This script uses the Fandom MediaWiki API to resolve image URLs,
# bypassing Cloudflare bot protection that blocks Special:FilePath.
#
# Blades:  PascalCase wiki filenames (e.g. BladeBlackShell.png)
# Bits:    Full wiki names (e.g. BitHexa.png for code "H")
# Assist:  AssistBlade<Name>.png (e.g. AssistBladeSlash.png)
#
# REQUIREMENTS:
#   - bash 3.2+ (no associative arrays needed)
#   - curl, python3
#
# Run from repo root: bash download_part_images.sh

set -euo pipefail

BASE="public/parts"
mkdir -p "$BASE/blades" "$BASE/bits" "$BASE/assist"

API="https://beyblade.fandom.com/api.php"
UA="BeyCatalogBot/1.0 (https://github.com/bey-catalog)"

# ── Helper: resolve a wiki filename to its CDN URL via the API ──
resolve_url() {
  local wiki_file="$1"  # e.g. "BladeDranSword.png"
  # query the API for the image URL
  local json
  json=$(curl -sL "$API?action=query&titles=File:$wiki_file&prop=imageinfo&iiprop=url&format=json" \
    -H "User-Agent: $UA" 2>/dev/null)
  # extract the URL from the first page's imageinfo
  local url
  url=$(echo "$json" | python3 -c "
import sys, json
d = json.load(sys.stdin)
p = list(d['query']['pages'].values())[0]
ii = p.get('imageinfo', [])
if ii:
    print(ii[0]['url'])
" 2>/dev/null)
  echo "$url"
}

# ── Helper: download a file, skip if already present ──
download() {
  local dest="$1"
  local url="$2"
  if [ -f "$dest" ] && [ -s "$dest" ]; then
    return 0  # already downloaded
  fi
  local code
  code=$(curl -sL -w "%{http_code}" --connect-timeout 15 -o "$dest" -H "User-Agent: $UA" "$url" 2>/dev/null)
  if [ "$code" = "200" ] || [ "$code" = "302" ]; then
    if [ -s "$dest" ]; then
      echo "  OK: $(basename "$dest")"
      return 0
    fi
  fi
  rm -f "$dest"
  return 1
}

# ── Helper: try downloading with API resolution ──
# Tries .png then .jpg for a given wiki prefix + name pattern
download_wiki_image() {
  local dest_dir="$1"    # e.g. "public/parts/blades"
  local wiki_prefix="$2" # e.g. "Blade" or "Bit" or "AssistBlade"
  local wiki_name="$3"   # e.g. "DranSword" or "Hexa"
  local local_name="$4"  # e.g. "DranSword" or "H" (local filename without ext)

  # Check for existing files (webp preferred, but also accept .png/.jpg from old runs)
  for ext in webp png jpg; do
    local dest="$dest_dir/${local_name}.${ext}"
    if [ -f "$dest" ] && [ -s "$dest" ]; then
      # If it's an old .png/.jpg file, rename to .webp since Fandom serves WebP
      if [ "$ext" != "webp" ]; then
        mv "$dest" "$dest_dir/${local_name}.webp"
        echo "  MIGRATED: ${local_name}.${ext} -> .webp"
      else
        echo "  CACHED: ${local_name}.webp"
      fi
      return 0
    fi
  done

  # Try .png first (most common), then .jpg
  # Note: Fandom CDN typically returns WebP content regardless of requested extension,
  # so we always save with .webp extension for correct MIME type detection
  for ext in png jpg; do
    local wiki_file="${wiki_prefix}${wiki_name}.${ext}"
    local url
    url=$(resolve_url "$wiki_file")
    if [ -n "$url" ]; then
      local dest="$dest_dir/${local_name}.webp"
      if download "$dest" "$url"; then
        return 0
      fi
    fi
  done

  return 1
}

# =====================
# BLADES
# =====================
# Format: "localname|wikiname" — local filename (PascalCase) | wiki name
# Where wiki name is what appears in BladeXxx.png on Fandom

BLADES=(
  # Main blades
  "BlackShell|BlackShell"
  "CobaltDragoon|CobaltDragoon"
  "CobaltDrake|CobaltDrake"
  "CrimsonGaruda|CrimsonGaruda"
  "DranDagger|DranDagger"
  "DranSword|DranSword"
  "HellsChain|HellsChain"
  "HellsScythe|HellsScythe"
  "KnightLance|KnightLance"
  "KnightShield|KnightShield"
  "LeonClaw|LeonClaw"
  "PhoenixFeather|PhoenixFeather"
  "PhoenixWing|PhoenixWing"
  "RhinoHorn|RhinoHorn"
  "SamuraiCalibur|SamuraiCalibur"
  "SharkEdge|SharkEdge"
  "ShelterDrake|ShelterDrake"
  "SphinxCowl|SphinxCowl"
  "TriceraPress|TriceraPress"
  "TyrannoBeat|TyrannoBeat"
  "UnicornSting|UnicornSting"
  "ViperTail|ViperTail"
  "WeissTiger|WeissTiger"
  "WhaleWave|WhaleWave"
  "WizardArrow|WizardArrow"
  "WyvernGale|WyvernGale"

  # Additional blades
  "BahamutBlitz|BahamutBlitz"
  "DranBuster|DranBuster"
  "WizardRod|WizardRod"
  "SharkScale|SharkScale"
  "MeteorDragoon|MeteorDragoon"
  "ImpactDrake|ImpactDrake"
  "SilverWolf|SilverWolf"
  "AeroPegasus|AeroPegasus"
  "CerberusFlame|CerberusFlame"
  "CerberusDark|CerberusDark"
  "HoverWyvern|HoverWyvern"
  "ClockMirage|ClockMirage"
  "MummyCurse|MummyCurse"
  "OrochiCluster|OrochiCluster"
  "TyrannoRoar|TyrannoRoar"
  "WhaleFlame|WhaleFlame"
  "ScorpioSpear|ScorpioSpear"
  "GolemRock|GolemRock"
  "KnightMail|KnightMail"
  "SamuraiSaber|SamuraiSaber"
  "GhostCircle|GhostCircle"
  "MammothTusk|MammothTusk"
  "BiteCroc|BiteCroc"
  "CrocCrunch|CrocCrunch"
  "TalonPtera|TalonPtera"
  "PteraSwing|PteraSwing"
  "BearScratch|BearScratch"
  "DrigerSlash|DrigerSlash"
  "DranzerSpiral|DranzerSpiral"
  "DragoonStorm|DragoonStorm"
  "PhoenixRudder|PhoenixRudder"
  "HellsReaper|HellsReaper"
  "RhinoReaper|RhinoReaper"
  "HellsArc|HellsArc"
  "HellsHammer|HellsHammer"
  "HellsBrave|HellsBrave"
  "ShinobiShadow|ShinobiShadow"
  "ShinobiKnife|ShinobiKnife"
  "RedDragoon|RedDragoon"
  "GillShark|GillShark"
  "WarGodCrest|WarGodCrest"
  "UnicornDelta|UnicornDelta"
  "LeonCrest|LeonCrest"
  "LeonFang|LeonFang"
  "PerseusDark|PerseusDark"
  "ValkyrieVolt|ValkyrieVolt"
  "DranBrave|DranBrave"
  "DranStrike|DranStrike"
  "RagnaRage|RagnaRage"
  "PegasusBlast|PegasusBlast"
  "PegasusBrush|PegasusBrush"
  "KnightFortress|KnightFortress"
  "EmperorCrest|EmperorCrest"
  "GreenWizardRod|GreenWizardRod"
  "BluePhoenixWing|BluePhoenixWing"
  "SolBrave|SolBrave"
  "SolEclipse|SolEclipse"
  "BulletGriffin|BulletGriffin"
  "WizardArc|WizardArc"
  "GoatTackle|GoatTackle"
  "WolfHunt|WolfHunt"
  "FoxBrush|FoxBrush"
  "PhoenixFlare|PhoenixFlare"
  "PhoenixLadder|PhoenixRudder"
  "RockLeone|RockLeone"
  "StormSpriggan|StormSpriggan"
  "XenoExcalibur|XenoExcalibur"
  "SamuraiSteel|SamuraiSteel"
  "StormPegasis|StormPegasis"
  "VictoryValkyrie|VictoryValkyrie"
  "DracielShield|DracielShield"
  "LightningLDragoupper|LightningLDragoupper"
  "LightningLDragorush|LightningLDragorush"
  "LightningLDrago|LightningLDrago"

  # New blades from missing products
  "Brachiowhip|Brachiowhip"
  "DranArc|DranArc"
  "EmperorMight|EmperorMight"
  "SharkGill|SharkGill"
  "WarriorSaber|WarriorSaber"

  # Collaboration blades
  "Evangelion|Evangelion"
  "SpiderMan|SpiderMan"
  "Venom|Venom"
  "IronMan|IronMan"
  "Thanos|Thanos"
  "LukeSkywalker|LukeSkywalker"
  "DarthVader|DarthVader"
  "Mandalorian|Mandalorian"
  "MoffGideon|MoffGideon"
  "OptimusPrime|OptimusPrime"
  "Megatron|Megatron"
  "OptimusPrimal|OptimusPrimal"
  "Starscream|Starscream"
  "TRex|TRex"
  "Mosasaurus|Mosasaurus"
  "Spinosaurus|Spinosaurus"
  "Quetzalcoatlus|Quetzalcoatlus"
  "Chewbacca|Chewbacca"
  "Stormtrooper|Stormtrooper"
  "ObiWanKenobi|ObiWanKenobi"
  "GeneralGrievous|GeneralGrievous"
  "CaptainAmerica|CaptainAmerica"
  "RedHulk|RedHulk"
  "GreenGoblin|GreenGoblin"
  "RedBurstBlade|RedBurstBlade"
  "BlackAzureSky|BlackAzureSky"

  # Aliases — same image as the main blade
  "SwordDran|DranSword"
  "RidgeTriceratops|TriceraPress"
)

echo "=== Downloading blade images ==="
ok=0; miss=0; cached=0
for entry in "${BLADES[@]}"; do
  local_name="${entry%%|*}"
  wiki_name="${entry##*|}"
  if download_wiki_image "$BASE/blades" "Blade" "$wiki_name" "$local_name"; then
    if [ -f "$BASE/blades/${local_name}.png" ] || [ -f "$BASE/blades/${local_name}.jpg" ]; then
      ok=$((ok+1))
    fi
  else
    miss=$((miss+1))
    echo "  MISS: Blade $local_name (wiki: Blade${wiki_name})"
  fi
done
echo "Blades: $ok ok, $miss miss"
echo ""

# =====================
# BITS
# =====================
# Format: "local_code|wikiname" — local short code | wiki full name
# The wiki uses BitXxx.png where Xxx is the full name (e.g. BitHexa.png)

BITS=(
  "H|Hexa"
  "FB|FreeBall"
  "LR|LowRush"
  "R|Rush"
  "J|Jolt"
  "LO|LowOrb"
  "K|Kick"
  "L|Level"
  "UN|Unite"
  "B|Ball"
  "W|Wedge"
  "E|Elevate"
  "D|Dot"
  "FF|FreeFlat"
  "I|Ignition"
  "UF|UnderFlat"
  "U|Unite"
  "T|Taper"
  "TK|TransKick"
  "TP|TransPoint"
  "O|Orb"
  "Op|LowOrb"
  "Y|Yielding"
  "HN|HighNeedle"
  "F|Flat"
  "GR|GearRush"
  "HT|HighTaper"
  "GN|GearNeedle"
  "A|Accel"
  "RA|RubberAccel"
  "LF|LowFlat"
  "Q|Quake"
  "N|Needle"
  "G|Glide"
  "V|Vortex"
  "GU|GearUnite"
  "S|Spike"
  "GF|GearFlat"
  "WB|WallBall"
  "BS|BoundSpike"
  "MN|MetalNeedle"
  "Tr|Taper"
  "DB|DiskBall"
  "GB|GearBall"
  "M|Merge"
  "Z|Zap"
  "P|Point"
  "WW|WallWedge"
  "GP|GearPoint"
  "C|Cyclone"
  "Nr|Narrow"
  "RA|RubberAccel"
  "HTp|HighTaper"
)

echo "=== Downloading bit images ==="
ok=0; miss=0
for entry in "${BITS[@]}"; do
  local_code="${entry%%|*}"
  wiki_name="${entry##*|}"
  if download_wiki_image "$BASE/bits" "Bit" "$wiki_name" "$local_code"; then
    ok=$((ok+1))
  else
    miss=$((miss+1))
    echo "  MISS: Bit $local_code (wiki: Bit${wiki_name})"
  fi
done
echo "Bits: $ok ok, $miss miss"
echo ""

# =====================
# ASSIST BLADES
# =====================
# The wiki uses AssistBlade<Name>.png

ASSISTS=(
  "Slash|Slash"
  "Turn|Turn"
  "Charge|Charge"
  "Heavy|Heavy"
  "Wheel|Wheel"
  "Bumper|Bumper"
  "Round|Round"
  "Assault|Assault"
  "Jaggy|Jaggy"
  "Flow|Flow"
  "Guard|Guard"
  "Break|Break"
  "Massive|Massive"
  "Zillion|Zillion"
  "Dual|Dual"
  "Free|Free"
  "Wedge|Wedge"
  "Cyclone|Cyclone"
  "Knuckle|Knuckle"
  "Peak|Peak"
  "Odd|Odd"
  "Turbo|Turbo"
  "Operate|Operate"
)

echo "=== Downloading assist blade images ==="
ok=0; miss=0
for entry in "${ASSISTS[@]}"; do
  local_name="${entry%%|*}"
  wiki_name="${entry##*|}"
  if download_wiki_image "$BASE/assist" "AssistBlade" "$wiki_name" "$local_name"; then
    ok=$((ok+1))
  else
    miss=$((miss+1))
    echo "  MISS: Assist $local_name (wiki: AssistBlade${wiki_name})"
  fi
done
echo "Assist Blades: $ok ok, $miss miss"
echo ""

echo "=== Summary ==="
echo "Blades:   $(ls "$BASE/blades/" 2>/dev/null | wc -l | tr -d ' ') files"
echo "Bits:     $(ls "$BASE/bits/" 2>/dev/null | wc -l | tr -d ' ') files"
echo "Assist:   $(ls "$BASE/assist/" 2>/dev/null | wc -l | tr -d ' ') files"