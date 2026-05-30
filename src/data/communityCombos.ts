export interface CommunityCombo {
  blade: string;
  bladeZh: string;
  bladeCode?: string;
  ratchets?: string[];   // all recommended ratchets from remarks
  bits?: string[];       // all recommended bits from remarks
  assistBlades?: string[]; // assist blade(s) from the product's beys (e.g. "Slash", "Round")
  lockChip?: string;     // Custom Line: lock chip (e.g. "Hells", "Dran")
  mainBlade?: string;    // Custom Line Original: main blade (e.g. "Reaper", "Arc")
  metalBlade?: string;   // Custom Line Expand: metal blade (e.g. "Blitz", "Fortress")
  overBlades?: string[];   // Custom Line Expand: over blade options (e.g. ["Break", "Flow"])
  notes: string;
  source: string;
  category: "Defense-Stamina" | "Attack" | "Balance" | "Stamina" | "Anti-Left" | "Beginner";
}

/**
 * Maps community combo blade names to canonical part names used in bladeNamesZh / bladeTiers.
 * Some community names differ from the canonical system names (e.g. "Devil Red Scythe" → "Hells Scythe").
 * Identity mappings are included for blades whose community name IS the canonical name
 * but which don't yet exist in bladeNamesZh / bladeTiers.
 */
export const BLADE_NAME_MAP: Record<string, string> = {
  // Non-identity mappings (community name → canonical system name)
  "Devil Red Scythe": "Hells Scythe",
  "Wizard Mirage": "Wizard Rod",
  "Clock": "Clock Mirage",
  "Left Dragon": "Cobalt Dragoon",
  "Meteor Dragon": "Meteor Dragoon",
  "Stone": "Golem Rock",
  "Courage": "Sol Brave",

  // Identity mappings — used by community combos
  "Blast": "Pegasus Blast",   // CX-07 "爆擊" is the Pegasus Blast blade

  // Additional non-identity mappings (community name → canonical)
  "Mummy": "Mummy Curse",
  "Samurai Holy Sword": "Samurai Calibur",
};

/**
 * Resolve a community combo blade name to its canonical part name.
 * Falls back to the original name if not in the map.
 */
export function resolveBladeName(comboBladeName: string): string {
  return BLADE_NAME_MAP[comboBladeName] ?? comboBladeName;
}

/**
 * Resolve assist blades for a community combo by looking up its bladeCode in the products array.
 * Collects all unique assistBlade names from all beys of all products matching the code.
 */
export function resolveAssistBlades(
  bladeCode: string | undefined,
  products: { code: string; beys: { assistBlade?: string }[] }[]
): string[] {
  if (!bladeCode) return [];
  const matched = products.filter(p => p.code === bladeCode);
  const set = new Set<string>();
  for (const product of matched) {
    for (const bey of product.beys) {
      if (bey.assistBlade) set.add(bey.assistBlade);
    }
  }
  return [...set].sort();
}

export const commonCombos: CommunityCombo[] = [
  // Defense-Stamina
  {
    blade: "Blast", bladeZh: "爆擊", bladeCode: "CX-07",
    ratchets: ["6-60", "7-60", "9-60", "9-70", "6-70", "7-70"], bits: ["H", "UN", "FB"],
    lockChip: "Pegasus", mainBlade: "Blast", assistBlades: ["Free", "Heavy", "Wheel"],
    notes: "賽場主流防禦持久陀螺。夠重，打甩咗漆面會更圓。F抵消攻擊。H增加重量難被打走。W重量好、持久力好。可用 ratchets: 6-60, 7-60, 9-60, 9-70, 6-70, 7-70。Bits: H(支撐力強但暴走), UN(持久較好需平衡), FB(自由迴旋持久中等需平衡)。注意紋章緊度重要過重量！",
    source: "Day17", category: "Defense-Stamina"
  },
  {
    blade: "Knight Shield", bladeZh: "騎士護盾", bladeCode: "BX-04",
    ratchets: ["3-60", "9-60"], bits: ["B", "FB", "LO"], assistBlades: [],
    notes: "較圓，重量較輕。3-60配合3點結構。9-60內重心不易爆。B持久較好但暴走，FB自由迴旋，LO高度較低持久好。可玩攻擊型（配置同石人）。注意限定陀螺不包括。",
    source: "Day10", category: "Defense-Stamina"
  },
  {
    blade: "Phoenix Flare", bladeZh: "鳳凰閃焰", bladeCode: "CX-12",
    ratchets: ["7-60", "9-60"], bits: ["H", "FB", "LO"],
    lockChip: "Phoenix", mainBlade: "Flare", assistBlades: ["Vertical"],
    notes: "現時隨處可見。V抵禦攻擊。9-60內重心防禦鎖。7-60增加重量。FB自由迴旋易打逆軌。H對左迴旋有優勢但暴走。LO持久較好但暴走。",
    source: "Day8", category: "Defense-Stamina"
  },
  {
    blade: "Devil Red Scythe", bladeZh: "惡魔鐮刀", bladeCode: "BX-02",
    ratchets: ["9-60"], bits: ["FB", "B"], assistBlades: [],
    notes: "神杖之前賽場主流。9-60內重心防禦鎖。FB自由迴旋。B持久力較好，但容易暴走且爆開。改動空間不大，盡量照抄。建議用金色版",
    source: "Day7", category: "Defense-Stamina"
  },
  {
    blade: "Mummy", bladeZh: "木乃伊", bladeCode: "UX-18",
    ratchets: ["1-60", "1-50", "1-70"], bits: ["W", "H"], assistBlades: [],
    notes: "對付任何右迴旋都得。1-60/1-50調整偏重復活流。1-70高度較高。W高持久但支撐點細。H對左迴旋有優勢但暴走。",
    source: "Day6", category: "Defense-Stamina"
  },
  {
    blade: "Samurai Holy Sword", bladeZh: "武士聖劍", bladeCode: "BX-45",
    ratchets: ["9-60", "9-70"], bits: ["LO", "FB"], assistBlades: [],
    notes: "練習型陀螺。持久力排名第5。重量較輕但能贏持久戰。9-60/9-70/LO/FB。新手學防禦持久必練。",
    source: "Day13", category: "Defense-Stamina"
  },

  // Stamina
  {
    blade: "Wizard Mirage", bladeZh: "魔導幻影", bladeCode: "",
    ratchets: ["9-60"], bits: ["H"], assistBlades: [],
    notes: "強勢原因：無明顯偏重/易調教、盤面夠大、夠圓滑。對付方法：(1) 時鐘4-55Lo（鬥持久唔好比切開），(2) 天馬爆擊W/H + 7-70/6-70/9-70/9-60/7-60/6-60H（更重更持久有機會撞走），(3) 霜輝銀狼6-60/3-60/9-60Lo/FB（優秀銀狼絕對有機會轉贏）。",
    source: "Day17 Notes", category: "Stamina"
  },
  {
    blade: "Clock", bladeZh: "時鐘", bladeCode: "",
    ratchets: ["4-55"], bits: ["LO", "UN"], assistBlades: [],
    notes: "4-55平衡性較好加強迴旋。LO高度較低持久（避免爆裂）。UN最低持久但建議平衡性好嘅Clock用。",
    source: "Day2", category: "Stamina"
  },

  // Anti-Left
  {
    blade: "Left Dragon", bladeZh: "左龍", bladeCode: "BX-34",
    ratchets: ["4-55", "9-65"], bits: ["E"], assistBlades: [],
    notes: "最好用黑色版。4-55新手友好，不需挑公差。9-65功能同9-60/70一樣，不需挑公差。E提供極大盤面但極易爆開。除非對左迴旋，否則請用中速拉。",
    source: "Day4", category: "Anti-Left"
  },
  {
    blade: "Meteor Dragon", bladeZh: "殞星龍", bladeCode: "UX-17",
    ratchets: ["7-70"], bits: ["L"], assistBlades: [],
    notes: "7-70增加衝擊高度，發揮橡膠吸引能力。L底吸收能力好，有利吸收右迴旋。",
    source: "Day1", category: "Anti-Left"
  },

  // Beginner
  {
    blade: "Courage", bladeZh: "勇者", bladeCode: "CX-01",
    ratchets: ["3-60", "7-60"], bits: ["R", "LR", "LF", "F", "K", "T", "U"],
    lockChip: "Hells", mainBlade: "Brave", assistBlades: ["Heavy", "Jaggy", "Slash"],
    notes: "3點打擊。H增加重量加強打擊。J向下延伸由下打擊。S配合3點打擊。7-60戰車流增加重量。3-60加強3點打擊。可使用攻擊底：R, LR, LF, F, K, T, U。",
    source: "Day12", category: "Beginner"
  },
  {
    blade: "Aero Pegasus", bladeZh: "天馬飛翼", bladeCode: "BX-23",
    ratchets: ["1-60", "3-60", "7-60"], bits: ["F", "R", "LR", "K"], assistBlades: [],
    notes: "1-60復活流加強單點打擊（鳳凰難啲復活）。3-60加強3點打擊。7-60戰車流。F新手友好攻擊軸。R/LR持久較好攻擊軸接軌多。K高機動性支撐強。",
    source: "Day9", category: "Beginner"
  },

  // Attack
  {
    blade: "Bahamut Blitz", bladeZh: "閃擊", bladeCode: "CX-13",
    ratchets: ["1-60", "1-50", "7-60"], bits: ["R", "LR"],
    lockChip: "Bahamut", metalBlade: "Blitz", overBlades: ["Flow"], assistBlades: ["Heavy", "Slash"],
    notes: "暫時最重上蓋。F高度較低減風阻。H增加重量。S攻擊輔助刃。1-60/1-50配合單點打擊。7-60增加重量。R/LR持久較好攻擊軌。",
    source: "Day16", category: "Attack"
  },
  {
    blade: "Wizard Arc", bladeZh: "弧光", bladeCode: "CX-02",
    ratchets: ["2-60", "6-60"], bits: ["K", "T", "F"],
    lockChip: "Wizard", mainBlade: "Arc", assistBlades: ["Slash", "Heavy"],
    notes: "表面圓滑有撞擊力。S攻擊輔助刃。H增加重量。2-60識復活配合2點打擊。6-60提升迴旋增加尾速。K機動高持久好。T是K下位。F新手友好攻擊軸。",
    source: "Day14", category: "Attack"
  },
  {
    blade: "Whale Wave", bladeZh: "戰鯨波浪", bladeCode: "BX-26",
    ratchets: ["M-85", "5-60"], bits: ["B", "H"], assistBlades: [],
    notes: "較大逆刃，重量優秀。M-85配合上盤5點。5-60配合外拋性強。B反擊流持久好。H對付左迴旋有優勢。",
    source: "Day11", category: "Attack"
  },
  {
    blade: "Tyranno Beat", bladeZh: "暴龍狂擊", bladeCode: "UX-10",
    ratchets: ["1-60", "5-60", "7-60"], bits: ["H", "B", "J", "R", "LR"], assistBlades: [],
    notes: "衝擊力強，平衡好，但重量較鯊魚低。1-60偏重加強打擊。5-60外拋增加接軌。7-60增加重量。H有鎖血但暴走。B不易暴走但易爆。J對付左迴旋優勢但支撐細。R/LR對攻擊型有優勢但無法對付左迴旋。",
    source: "Day3", category: "Attack"
  },
  {
    blade: "Stone", bladeZh: "石人", bladeCode: "CX-11",
    ratchets: ["1-60", "3-60"], bits: ["F", "R", "LR"], assistBlades: [],
    notes: "重量偏輕但撞擊力強。綠色版最好。1-60偏重加強撞擊。3-60平衡陀螺。F新手友好。R/LR持久好接軌多。可玩防禦持久型。",
    source: "Day5", category: "Attack"
  },
  {
    blade: "Shark Edge", bladeZh: "鮫鯊狂刃", bladeCode: "BX-14",
    ratchets: ["1-60", "3-60", "5-60", "7-60"], bits: ["F", "FF", "R", "LR"],
    notes: "能力同UX鯊魚差唔多，但係切開能力較差。1-60增強單點打擊。3-60加強偏重同樣增強單點打擊。5-60增加外拋。7-60增加整體重量。F新手適合攻擊軸。FF比F更穩定攻擊次數亦較F多。R/LR持久力於攻擊軸中較好。注意部件編號不包括限定陀螺。",
    source: "Day22", category: "Attack"
  },
  {
    blade: "Hells Chain", bladeZh: "煉獄鎖鏈", bladeCode: "BX-21",
    ratchets: ["1-60", "1-50", "5-60", "7-60", "9-60"], bits: ["J", "R", "LR", "K", "FF", "F"],
    notes: "煉獄惡鐮進化版，但係佢打防禦持久偏弱，所以會玩攻擊。1-60加強單點打擊並且可以復活。1-50功能同1-60一樣高度較低。5-60可以配合5點重心亦可加強外拋。7-60增加整體重量使撞擊力加強。9-60內重心唔容易爆開。J半攻擊半持久支撐性較弱。R/LR持久力於攻擊軸中較好。K高機動性。FF穩定性高使接軌次數增加。F新手適用嘅攻擊軸。",
    source: "Day23", category: "Attack"
  },
];
