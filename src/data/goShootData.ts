/**
 * Part data from go-shoot.github.io — the authoritative source for
 * weight stats, Chinese descriptions, and attributes.
 *
 * Key format: our part name (e.g. "Slash", "Dran")
 * Value: { weight?, description?, attributes? }
 */

// ── Standard Blade data ────────────────────────────────────────────────────

export const bladeData: Record<string, { weight?: string; description?: string; attributes?: string[] }> = {
  "Dran Strike": { weight: "41+", description: "金屬連接至中央能提高剛性；重量級的六枚刃作強烈連打攻擊。", attributes: ["att", "right", "expand"] },
  "Bison Burrow": { weight: "41=", description: "（此乃AI臨時圖・異色版會在2026/10 DMMくじ中推出）", attributes: ["sta", "right", "UX", "fused"] },
  "Bullet Griffin": { weight: "61-", description: "對戰中分身成內藏平坦軸端以跑動來攻擊對手的「子彈」、及以防禦性能優秀的圓形來抵耐對手攻擊的「本體」。（勝負以本體判定）", attributes: ["bal", "right", "fused"] },
  "Orochi Cluster": { weight: "36+", description: "在兩處大幅度凸出的六枚刃特化於以連打及強擊把對手撞飛。", attributes: ["att", "right"] },
  "Mummy Curse": { weight: "37+", description: "依迴轉速度變形：初段時彈出Counter刃作反擊、後段時以近圓形狀防守到尾。", attributes: ["def", "right"] },
  "Meteor Dragoon": { weight: "39=", description: "搭載大型橡膠的三枚刃不斷作出強烈一擊。", attributes: ["att", "left", "bsb", "mfb"] },
  "Clock Mirage": { weight: "38-", description: "產生驚異持久力的圓盤形狀六十枚刃，特化於長時間持續迴轉。", attributes: ["sta", "right", "mfb", "simple"] },
  "Samurai Calibur": { weight: "36-", description: "一併擁有角度不同的大型刃及小型刃，在水平時發揮防禦、傾斜時發揮攻擊性能。", attributes: ["bal", "right"] },
  "Cobalt Dragoon": { weight: "39=", description: "搭載大型橡膠的三枚刃不斷作出強烈一擊。", attributes: ["att", "left", "bsb", "mfb"] },
  "Silver Wolf": { weight: "37-", description: "四角形的刃以圓形化解攻擊，並以角撞擊。", attributes: ["bal", "right"] },
  "Aero Pegasus": { weight: "38=", description: "搭載橡膠令X Dash性能特化；右旋時高攻擊，左旋時高持久。", attributes: ["att", "left", "mfb"] },
  "Shinobi Shadow": { weight: "36-", description: "（此乃AI臨時圖）四枚刃配合旋轉方向的攻擊模式。", attributes: ["bal", "right"] },
  "Sphinx Cowl": { weight: "36-", description: "上下反轉可切換Upper及Smash兩種攻擊模式。", attributes: ["bal", "right"] },
  "Weiss Tiger": { weight: "36=", description: "大徑的四枚刃以高速產生強烈的Upper Attack。", attributes: ["att", "right"] },
  "Shark Edge": { weight: "35+", description: "三枚銳利刃產生強烈的Smash Attack。", attributes: ["att", "right"] },
  "Hells Reaper": { weight: "37+", description: "反轉可切換攻擊模式的三枚刃。水平迴轉以Upper Attack，傾斜迴轉以Smash Attack。", attributes: ["bal", "right"] },
  "Wyvern Gale": { weight: "35+", description: "四枚刃以離心力穩定迴轉，持久的Upper Attack與連打並存。", attributes: ["bal", "right"] },
  "Viper Tail": { weight: "35=", description: "六枚刃產生連打攻擊，高速時Smash刃彈出增強攻擊。", attributes: ["att", "right"] },
  "Knight Shield": { weight: "36+", description: "圓形刃以高持久力化解攻擊，並以反擊還擊。", attributes: ["def", "right"] },
  "Rhino Reaper": { weight: "37+", description: "反轉可切換攻擊模式的三枚刃。", attributes: ["bal", "right"] },
  "Shark Scale": { weight: "35+", description: "三枚刃特化於Smash Attack。", attributes: ["att", "right"] },
  "Wizard Arc": { weight: "37+", description: "把金屬重量配置在外側的圓弧狀刃產生強離心力及Upper性能。", attributes: ["bal", "right"] },
  "Phoenix Wing": { weight: "36+", description: "三枚刃產生強烈的Smash Attack。", attributes: ["att", "right"] },
  "Dran Sword": { weight: "33=", description: "高撞擊性能重量型的三枚刃。", attributes: ["att", "right"] },
  "Dran Buster": { weight: "39+", description: "金屬連接至中央能提高剛性；重量級的六枚刃作強烈連打攻擊。", attributes: ["att", "right", "expand"] },
  "Dran Dagger": { weight: "34+", description: "搭載橡膠的三枚刃作強烈一擊。", attributes: ["att", "right"] },
  "Valkyrie Volt": { weight: "36+", description: "兼具Smash形狀大型三枚刃與空力構造。", attributes: ["att", "right"] },
  "Fox Brush": { weight: "35+", description: "九枚刃以連打和強攻擊兼備。", attributes: ["bal", "right"] },
  "Leon Fang": { weight: "35+", description: "四枚刃以鋸齒形削弱對手持久。", attributes: ["att", "right"] },
  "Perseus Dark": { weight: "36=", description: "波瀾形狀的連打六枚刃抵擋並撞回攻擊。", attributes: ["def", "right"] },
  "Cobalt Drake": { weight: "38+", description: "搭載大型橡膠的三枚刃以強烈一擊及高持久攻擊。", attributes: ["att", "left", "bsb"] },
  "Phoenix Flare": { weight: "37+", description: "高連打性能的具厚度十五枚刃令反擊性能優秀。", attributes: ["att", "right"] },
  "Wolf Hunt": { weight: "35+", description: "圓滑形狀的連打刃，既有持久又有攻擊性能。", attributes: ["sta", "right"] },
  "Sol Eclipse": { weight: "36+", description: "反轉可切換Upper及Smash兩種攻擊模式。", attributes: ["bal", "right"] },
  "Whale Flame": { weight: "37=", description: "滑順圓形減少空氣抵抗，持久性能優秀。", attributes: ["def", "right"] },
  "Whale Wave": { weight: "36-", description: "圓形刃以持久的連打攻擊持續削弱對手。", attributes: ["sta", "right"] },
  "Emperor Might": { weight: "38+", description: "在側面擁有多面銳角形狀的重量級八枚刃把對手迴轉力削弱。", attributes: ["att", "right"] },
  "Pegasus Blast": { weight: "38-", description: "流線形的厚重三枚刃擅於撞飛對手。", attributes: ["att", "right"] },
  "Warrior Saber": { weight: "36+", description: "反轉可切換連擊或化解模式。", attributes: ["bal", "right"] },
  "Impact Drake": { weight: "38+", description: "搭載大型橡膠的三枚刃不斷作出強烈一擊。", attributes: ["att", "left"] },
  "Scorpio Spear": { weight: "35=", description: "六枚刃產生連打攻擊。", attributes: ["att", "right"] },
  "Ghost Circle": { weight: "34+", description: "圓形刃以持久力持續迴轉。", attributes: ["sta", "right"] },
  "Black Shell": { weight: "37+", description: "圓形化解刃以持久力抵耐攻擊。", attributes: ["def", "right"] },
  "Golem Rock": { weight: "36=", description: "重量集中的形狀令撞擊力特化。", attributes: ["att", "right"] },
  "Knight Mail": { weight: "36+", description: "圓形化解刃以持久力抵耐攻擊並反擊。", attributes: ["def", "right"] },
  "Unicorn Sting": { weight: "35+", description: "三枚刃產生強烈的Smash Attack。", attributes: ["att", "right"] },
  "Cerberus Flame": { weight: "36+", description: "三枚刃以高速迴轉的攻擊性能優秀。", attributes: ["att", "right"] },
  "Shark Gill": { weight: "35-", description: "滑順形狀特化於持久及連打攻擊。", attributes: ["sta", "right"] },
  "Tyranno Beat": { weight: "35-", description: "三枚刃以連打攻擊。", attributes: ["att", "right"] },
  "Tyranno Roar": { weight: "37+", description: "三枚刃以強烈一擊攻擊。", attributes: ["att", "right"] },
  "Hells Hammer": { weight: "37-", description: "反轉可切換攻擊模式。", attributes: ["bal", "right"] },
  "Leon Crest": { weight: "37=", description: "圓形化解刃以持久穩定的迴轉。", attributes: ["sta", "right"] },
  "Mammoth Tusk": { weight: "38+", description: "重量集中的形狀令撞擊力特化。", attributes: ["att", "right"] },
  "Wizard Arrow": { weight: "36-", description: "圓弧狀刃產生強離心力及Upper性能。", attributes: ["bal", "right"] },
  "Hells Chain": { weight: "36+", description: "反轉可切換攻擊模式。", attributes: ["bal", "right"] },
  "Hells Scythe": { weight: "37+", description: "三枚刃的反擊性能優秀。", attributes: ["att", "right"] },
  "Phoenix Rudder": { weight: "36-", description: "流線形減少空氣抵抗，持久性能優秀。", attributes: ["sta", "right"] },
  "Phoenix Feather": { weight: "36-", description: "流線形刃以高持久力持續迴轉。", attributes: ["sta", "right"] },
  "Crimson Garuda": { weight: "37=", description: "反轉可切換Upper及Smash兩種攻擊模式。", attributes: ["bal", "right"] },
  "Goat Tackle": { weight: "35=", description: "重量集中的形狀令撞擊力特化。", attributes: ["att", "right"] },
  "Shelter Drake": { weight: "37+", description: "圓形化解刃以持久力抵耐攻擊。", attributes: ["def", "right"] },
  "Ptera Swing": { weight: "35+", description: "反轉可切換攻擊模式。", attributes: ["bal", "right"] },
  "Bear Scratch": { weight: "34=", description: "三枚刃以連打攻擊。", attributes: ["att", "right"] },
  "Leon Claw": { weight: "34+", description: "三枚刃以鋒利攻擊。", attributes: ["att", "right"] },
  "Rhino Horn": { weight: "36+", description: "反擊性能的三枚刃。", attributes: ["def", "right"] },
  "Samurai Steel": { weight: "35=", description: "反轉可切換攻擊模式。", attributes: ["bal", "right"] },
  "Shinobi Knife": { weight: "34=", description: "三枚刃以連打攻擊。", attributes: ["att", "right"] },
  "Wyvern Hover": { weight: "36+", description: "產生持久力的圓形刃。", attributes: ["sta", "right"] },
  // Expansion blades (composite names)
  "Bahamut Blitz": { weight: undefined, description: "Custom Line Expand: Lock Chip + Metal Blade + Over Blade + Assist Blade", attributes: ["att", "right", "expand"] },
  "Knight Fortress": { weight: undefined, description: "Custom Line Expand: Lock Chip + Metal Blade + Over Blade + Assist Blade", attributes: ["def", "right", "expand"] },
  "Ragna Rage": { weight: undefined, description: "Custom Line Expand: Lock Chip + Metal Blade + Over Blade + Assist Blade", attributes: ["sta", "right", "expand"] },
  "Unicorn Delta": { weight: undefined, description: "Custom Line Expand: Lock Chip + Metal Blade + Over Blade + Assist Blade", attributes: ["bal", "right", "expand"] },
  "Brachiowhip": { weight: undefined, description: "Custom Line Expand: Lock Chip + Metal Blade + Over Blade + Assist Blade", attributes: ["bal", "right", "expand"] },
  // Collab blades have their own descriptions — keeping shorter
  "Victory Valkyrie": { weight: undefined, description: "EVANGELION合作款。", attributes: ["att", "right", "collab"] },
  "Draciel Shield": { weight: undefined, description: "TRANSFORMERS合作款。", attributes: ["def", "right", "collab"] },
  "Lightning L-Drago": { weight: undefined, description: "METAL FIGHT合作款。", attributes: ["att", "left", "collab"] },
};

// ── Lock Chip data ──────────────────────────────────────────────────────────

export const lockChipData: Record<string, { weight?: string; description?: string; attributes?: string[] }> = {
  "Dran": { weight: "2-", attributes: ["right"] },
  "Wizard": { weight: "2-", attributes: ["right"] },
  "Perseus": { weight: "2-", attributes: ["right"] },
  "Hells": { weight: "2-", attributes: ["right"] },
  "Rhino": { weight: "2-", attributes: ["right"] },
  "Wolf": { weight: "2-", attributes: ["right"] },
  "Sol": { weight: "2-", attributes: ["right"] },
  "Pegasus": { weight: "2-", attributes: ["right"] },
  "Phoenix": { weight: "2-", attributes: ["right"] },
  "Emperor": { weight: "5-", description: "金屬零件增加重量。", attributes: ["right"] },
  "Knight": { weight: "2-", attributes: ["right"] },
  "Unicorn": { weight: "2-", description: "", attributes: ["right"] },
  "Bahamut": { weight: "2-", attributes: ["right"] },
  "Ragna": { weight: "2-", attributes: ["right", "bbb"] },
  "Cerberus": { weight: "2-", attributes: ["right"] },
  "Whale": { weight: "2-", attributes: ["right"] },
  "Fox": { weight: "2-", attributes: ["right"] },
  "Valkyrie": { weight: "6-", description: "金屬零件增加重量。", attributes: ["right"] },
  "Leon": { weight: "2-", attributes: ["right"] },
  "Eva": { weight: "2-", description: "（共有三款）", attributes: ["right"] },
  "Mummy": { weight: "2-", attributes: ["right"] },
  "Brachio": { weight: "2-", attributes: ["right"] },
};

// ── Main Blade data (CX Original: CX-01~12) ────────────────────────────────

export const mainBladeData: Record<string, { weight?: string; description?: string; attributes?: string[] }> = {
  "Brave": { weight: "31+", description: "三枚大形Upper刃加上了能産生Down force的空力構造。", attributes: ["att", "right"] },
  "Arc": { weight: "29+", description: "把金屬重量配置在外側的圓弧狀兩枚刃産生強離心力。", attributes: ["bal", "right"] },
  "Dark": { weight: "30+", description: "波浪形狀的連打六枚刃抵擋並撞回攻擊。", attributes: ["def", "right"] },
  "Reaper": { weight: "29=", description: "有起伏的Smash形四枚刃以連打令對手姿勢崩倒。", attributes: ["att", "right"] },
  "Eclipse": { weight: "32+", description: "反轉可切換模式。Upper模式擅於以五枚刃撞飛對手的攻擊、Smash模式擅於以十枚刃連打攻擊。", attributes: ["bal", "right"] },
  "Hunt": { weight: "32-", description: "重量集中外周的圓滑形狀連打刃，既有高持久性能以及攻擊性能。", attributes: ["sta", "right"] },
  "Flare": { weight: "31=", description: "高連打性能的具厚度十五枚刃令反擊性能優秀。", attributes: ["att", "right"] },
  "Blast": { weight: "33-", description: "流線形的厚重三枚刃擅於撞飛對手。", attributes: ["att", "right"] },
  "Curse": { weight: undefined, description: "依迴轉速度變形：初段時彈出Counter刃作反擊、後段時以近圓形狀防守到尾。", attributes: ["def"] },
  "Fortress": { weight: "28-", description: "有高低差的形狀分散對手的攻擊，立體形狀的刃亦產生反擊。", attributes: ["def", "right"] },
  "Volt": { weight: "31+", description: "兼具Smash形狀大型三枚刃與空力構造。", attributes: ["att", "right"] },
  "Brush": { weight: "30+", description: "一級級變大的九枚刃能連打同時強攻擊。", attributes: ["att", "right"] },
  "Fang": { weight: "30+", description: "向下的鋸齒尖刺形四枚刃削弱對手持久。", attributes: ["att", "right"] },
  "Might": { weight: "33+", description: "在側面擁有多面銳角形狀的重量級八枚刃把對手迴轉力削弱。", attributes: ["att", "right"] },
  "Flame": { weight: "29=", description: "滑順圓形減少空氣抵抗，持久性能優秀。", attributes: ["sta", "right"] },
};

// ── Metal Blade data (CX Expand: CX-13+) ────────────────────────────────────

export const metalBladeData: Record<string, { weight?: string; description?: string; attributes?: string[] }> = {
  "Blitz": { weight: "30-", description: "高撞擊性能的重量級五枚刃，一併持有重心偏側的大型刃以提高重擊性能。", attributes: ["att", "right"] },
  "Fortress": { weight: "28-", description: "有高低差的形狀分散對手的攻擊，立體形狀的刃亦產生反擊。", attributes: ["def", "right"] },
  "Rage": { weight: "27+", description: "流線形滑順的刃化解對手攻擊，減低迴轉損失。", attributes: ["sta", "right"] },
  "Whip": { weight: undefined, description: "順滑圓弧狀四枚刃化解對手攻擊。", attributes: ["bal", "right"] },
  "Delta": { weight: "28=", description: "一併持有攻擊的刃及防禦的刃，左右形狀相異的兩枚刃。", attributes: ["bal", "right"] },
};

// ── Over Blade data (CX Expand: CX-13+) ──────────────────────────────────────

export const overBladeData: Record<string, { weight?: string; description?: string; attributes?: string[] }> = {
  "Break": { weight: "4-", description: "重心偏側提高撞擊性能。", attributes: ["att", "right"] },
  "Guard": { weight: "3+", description: "三枚大型刃以向上配置，把對手的Smash攻擊撞回，實現強力反擊。", attributes: ["def", "right"] },
  "Flow": { weight: "4-", description: "薄且順滑的形狀減輕空氣抵抗，維持迴轉力。", attributes: ["sta", "right", "bbb"] },
  "Peak": { weight: "3+", description: "重量集中在一處的形狀可調整Blade的重心。", attributes: ["bal", "right"] },
  "Outer": { weight: undefined, description: "外側加厚的五枚刃形狀提高離心力。", attributes: ["sta", "right"] },
};

// ── Assist Blade data ────────────────────────────────────────────────────────

export const assistBladeData: Record<string, { weight?: string; description?: string; attributes?: string[] }> = {
  "Odd": { weight: "4+", description: "非對稱構造一併持有連打攻擊刃及圓形化解刃。", attributes: ["bal", "right"] },
  "Knuckle": { weight: "5=", description: "五枚刃中的一枚有重擊點，提升撞擊性能。", attributes: ["att", "right"] },
  "Vertical": { weight: "5+", description: "向下方伸出的十二枚垂直刃阻止對Ratchet的攻擊，提高Burst抵耐性。", attributes: ["def", "right"] },
  "Erase": { weight: "6=", description: "順滑連打刃使持久損失最小化，同時能活用持久力作連續攻擊。", attributes: ["sta", "right"] },
  "Heavy": { weight: "8=", description: "搭載金屬零件以提高離心力的低處六枚刃，強化打擊力及安定性。", attributes: ["bal", "right"] },
  "Free": { weight: "6-", description: "外周Free Ring能迴轉，卸開攻擊以維持持久。", attributes: ["sta", "right"] },
  "Dual": { weight: "6=", description: "把外周的刃反轉可切換至Upper或Smash模式。", attributes: ["bal", "right"] },
  "Massive": { weight: "5+", description: "大徑幅Smash形狀五枚刃的連打擅於令對手姿勢崩倒。", attributes: ["bal", "right"] },
  "Wheel": { weight: "7=", description: "有厚度的圓柱形狀刃持續地把從任何高度而來的攻擊都化解。", attributes: ["sta", "right"] },
  "Assault": { weight: "5=", description: "有厚度的三枚刃實現高撞擊性能。", attributes: ["att", "right"] },
  "Jaggy": { weight: "5-", description: "向下擴闊的低重心九枚刃擅於如下潛的連打攻擊。", attributes: ["att", "right"] },
  "Slash": { weight: "5-", description: "高度較低的高撞擊性能三枚刃，擅於善用低重心的攻擊性能。", attributes: ["att", "right"] },
  "Turn": { weight: "6-", description: "把外周的刃反轉可切換至連擊或化解模式。", attributes: ["bal", "right"] },
  "Charge": { weight: "5=", description: "小徑三枚刃以内重心令安定性優秀。", attributes: ["def", "right"] },
  "Bumper": { weight: "5+", description: "容易吸收衝擊的阻尼器形狀的刃緩和並卸走對手攻擊。", attributes: ["def", "right"] },
  "Round": { weight: "5-", description: "内側鏤空的圓形刃提升Blade的離心力。", attributes: ["sta", "right"] },
  "Zillion": { weight: "7-", description: "排列成圓形的重厚十二枚刃把攻擊撞開及抵耐。", attributes: ["def", "right"] },
};

// ── Bit data ─────────────────────────────────────────────────────────────────
// stat format: weight (e.g. "3-"), some have burstHeight/burstCount/burstTotal
// Some bits have variable burst stats shown as "X<>Y" or "X>Y" — stored as strings

export const bitData: Record<string, { weight?: string; burstHeight?: number; burstCount?: number; burstTotal?: number | string; description?: string; attributes?: string[]; group?: string; englishName?: string }> = {
  "A": { weight: "3-", burstHeight: 16, burstCount: 80, burstTotal: 122, description: "由平坦軸端加上大型Gear組成，提高X Dash性能。", attributes: ["att"], group: "flat", englishName: "Accel" },
  "B": { weight: "2=", burstHeight: 12, burstCount: 30, burstTotal: 124, description: "球狀軸端以適度移動來躱避攻擊及實現高持久力。", attributes: ["sta"], group: "round", englishName: "Ball" },
  "C": { weight: "2=", burstHeight: 12, burstCount: 80, burstTotal: 123, description: "渦形的平坦軸端在左迴轉時提高與對戰盤的緊咬度，能高速攻擊；右迴轉時則減輕與對戰盤的摩擦，能作高持久力的攻擊。", attributes: ["att"], group: "flat", englishName: "Cyclone" },
  "D": { weight: "2=", burstHeight: 12, burstCount: 30, burstTotal: 123, description: "在軸端的多數突起提高與對戰盤的摩擦，受攻擊時也難以被推走。", attributes: ["def"], group: "sharp", englishName: "Dot" },
  "E": { weight: "3+", burstHeight: 12, burstCount: 30, burstTotal: 118, description: "附有大型Guide（移動引導物）的設計容易保持姿勢；X Dash時軸端浮上，可作Smash攻擊。", attributes: ["bal"], group: "flat", englishName: "Elevate" },
  "F": { weight: "2+", burstHeight: 12, burstCount: 80, burstTotal: 123, description: "平坦軸端令陀螺跑動，提高以X Dash決勝的容易度。", attributes: ["att"], group: "flat", englishName: "Flat" },
  "G": { weight: "3-", burstHeight: 16, burstCount: 30, burstTotal: 124, description: "以低摩擦素材製的半球形軸端及其周圍容易使姿勢維持的形狀，實現高持久性能。", attributes: ["sta"], group: "round", englishName: "Glide" },
  "H": { weight: "3-", burstHeight: 16, burstCount: 80, burstTotal: 122, description: "軸端側面六個平面形狀抑制陀螺的傾斜，持續保持安定姿勢。", attributes: ["bal"], group: "sharp", englishName: "Hexa" },
  "I": { weight: "2+", burstHeight: 16, burstCount: 80, burstTotal: 100, description: "設有多個突起的大型圓筒形軸端強力抓向對戰盤，實現高速機動的攻擊。", attributes: ["att"], group: "flat", englishName: "Ignition" },
  "J": { weight: "3-", burstHeight: 16, burstCount: 80, burstTotal: 122, description: "一併展現以幼細平坦軸端來壓抑持久損失的攻擊、及大型Gear的高速X Dash。", attributes: ["att"], group: "flat", englishName: "Jolt" },
  "K": { weight: "2+", burstHeight: 12, burstCount: 80, burstTotal: 125, description: "有角的軸端側面於對戰盤内踢蹴，實現連續攻擊或反擊防禦的動態。", attributes: ["bal"], group: "flat", englishName: "Kick" },
  "L": { weight: "3-", burstHeight: 16, burstCount: 80, burstTotal: 125, description: "軸端有三級的高度，實現低速、中速、高速三種攻擊速度。", attributes: ["att"], group: "flat", englishName: "Level" },
  "M": { weight: "3+", burstHeight: 18, burstCount: 80, burstTotal: 154, description: "高摩擦的橡膠素材圍繞鈍角的尖軸端，抓力及持久力兼備。", attributes: ["bal"], group: "sharp", englishName: "Merge" },
  "N": { weight: "2=", burstHeight: 12, burstCount: 30, burstTotal: 123, description: "尖鋭軸端令陀螺傾斜，提高反擊性能。", attributes: ["def"], group: "sharp", englishName: "Needle" },
  "O": { weight: "2=", burstHeight: 12, burstCount: 30, burstTotal: 123, description: "小型半球狀的軸端減低摩擦，提高持久性能。", attributes: ["sta"], group: "round", englishName: "Orb" },
  "P": { weight: "2+", burstHeight: 12, burstCount: 80, burstTotal: 124, description: "在中心設有突起的平坦軸端，令動態由活躍變化為平靜的機動。", attributes: ["bal"], group: "round", englishName: "Point" },
  "Q": { weight: "2+", burstHeight: 12, burstCount: 80, burstTotal: 123, description: "斜向切割形狀的軸端，四處跳躍地暴走，産生不規則的動態。", attributes: ["att"], group: "flat", englishName: "Quake" },
  "R": { weight: "2=", burstHeight: 10, burstCount: 80, burstTotal: 123, description: "十枚刃Gear以壓抑X Dash的速度來增加衝刺次數。", attributes: ["att"], group: "flat", englishName: "Rush" },
  "S": { weight: "2=", burstHeight: 12, burstCount: 30, burstTotal: 123, description: "細小尖鋭的軸端持續穩守對戰盤中央，提高反擊機會。", attributes: ["def"], group: "sharp", englishName: "Spike" },
  "T": { weight: "2+", burstHeight: 12, burstCount: 80, burstTotal: 123, description: "收細的軸端既有頭段的攻擊力及尾段的持久力。", attributes: ["bal"], group: "flat", englishName: "Taper" },
  "U": { weight: "2+", burstHeight: 12, burstCount: 80, burstTotal: 123, description: "球狀軸端的尖端磨平同時在中央設有突起，迴避、衝刺、反擊三種軌道都可能。", attributes: ["bal"], group: "round", englishName: "Unite" },
  "V": { weight: "2+", burstHeight: 12, burstCount: 80, burstTotal: 123, description: "渦形的粗大平坦軸端在右迴轉時提高與對戰盤的緊咬性，能高速攻擊。", attributes: ["att"], group: "flat", englishName: "Vortex" },
  "W": { weight: "2=", burstHeight: 10, burstCount: 30, burstTotal: 127, description: "鈍角的尖銳軸端難以傾斜；十枚齒Gear於X Dash時減輕持久損失。", attributes: ["def"], group: "sharp", englishName: "Wedge" },
  "Y": { weight: "4+", burstHeight: 20, burstCount: 30, burstTotal: 150, description: "大型球狀軸端既有持久性能，四方向突出的重量器亦具姿勢制御性能。", attributes: ["sta"], group: "round", englishName: "Yielding" },
  "Z": { weight: "3-", burstHeight: 16, burstCount: 80, burstTotal: 115, description: "大形Gear上一併擁有平軸帶來的活躍攻擊及中央突起帶來的平靜防守。", attributes: ["bal"], group: "round", englishName: "Zap" },
  // Variant/special bits
  "RA": { weight: "3=", burstTotal: 123, description: "提高接地摩擦，在對戰盤内高速跑動。" },
  "DB": { weight: "3+", burstTotal: 146, description: "産生離心力及堅韌的迴轉。" },
  "FB": { weight: "2=", burstTotal: 123, description: "收細的球狀軸端減少迴轉力的損失。" },
  "GB": { weight: "2=", burstTotal: 123, description: "使大型球狀軸亦能實現反擊。" },
  "WB": { weight: "2+", burstHeight: 16, burstCount: 30, burstTotal: 130, description: "減低陀螺傾斜。球軸較小。" },
  "FF": { weight: "2+", description: "少許變幼的平坦軸端既減輕持久損失也確保衝刺的速度。軸端亦稍幼。" },
  "GF": { weight: "2+", burstTotal: 123, description: "更容易勾住X Line，實現更高速的X Dash。" },
  "UF": { weight: "2=", burstTotal: 102, description: "能在更低位置攻擊。" },
  "LF": { weight: "2+", burstTotal: 113, description: "提高X Dash的加速力。軸端的凹洞亦被填滿。" },
  "HN": { weight: "2+", burstTotal: 133, description: "提高因傾斜的反擊力。軸端尖鋭度亦減低。" },
  "GN": { weight: "2=", burstTotal: 120, description: "同時容易穩守對戰盤中央及X Dash。尖端亦較圓滑。" },
  "MN": { weight: "3-", burstTotal: 124, description: "以重量及減低的摩擦提高安定性。" },
  "UN": { weight: "2=", burstTotal: 102, description: "高度下降20的〔N〕Bit，降低陀螺重心，以支援在低位置的反擊。", englishName: "UnderNeedle" },
  "LO": { weight: "2=", burstTotal: 112, description: "低重心化令持久性能向上。" },
  "GP": { weight: "2+", burstTotal: 124, description: "實現巨大的動態變化。" },
  "GR": { weight: "2=", burstTotal: 123, description: "提升勾住X Line的容易度。" },
  "LR": { weight: "2=", burstTotal: 113, description: "擅長Upper攻擊。" },
  "BS": { weight: "2=", burstTotal: "123<>136", description: "吸收着地的衝擊。軸端亦稍為增大。" },
  "HT": { weight: "2+", burstTotal: 133, description: "兼備Smash力及持久力。" },
  "GU": { weight: "2+", burstTotal: 121, description: "球軸亦較凸出。" },
  "WW": { weight: "2+", burstHeight: 16, burstCount: 30, burstTotal: 132, description: "進一步減低陀螺傾斜。" },
  "Nr": { burstTotal: 10, description: "細球狀軸端長久地迴轉；十枚齒Gear於X Dash時減輕持久損失。", attributes: ["sta"], group: "round", englishName: "Narrow" },
  "Op": { weight: "14+", burstHeight: 14, burstTotal: "85<>80", description: "可選擇以化解性四枚刃及幼細軸端來抵耐攻擊的防禦模式、或以擁有空力構造的兩枚刃及粗大軸端來環迴的攻擊模式。", attributes: ["bal", "fused"], group: "multi", englishName: "Operate" },
  "Tr": { weight: "13-", burstHeight: 16, burstTotal: "90>65", description: "高速迴轉時以幼軸保持安定的動態；迴轉下降後變形至粗軸及再加速以作X Dash。調整發射力度能分別使用兩種狀態。", attributes: ["att", "fused"], group: "multi", englishName: "Turbo" },
};