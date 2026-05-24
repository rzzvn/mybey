export interface CommunityCombo {
  blade: string;
  bladeZh: string;
  bladeCode?: string;
  ratchet?: string;
  bit?: string;
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

  // Identity mappings — these blades need entries in bladeNamesZh / bladeTiers
  "Phoenix Blaze": "Phoenix Blaze",
  "Pegasus Flight": "Pegasus Flight",
  "Flash Strike": "Flash Strike",
  "Arc Light": "Arc Light",
  "Blast": "Blast",

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

export const commonCombos: CommunityCombo[] = [
  // Defense-Stamina
  {
    blade: "Blast", bladeZh: "爆擊", bladeCode: "CX-07",
    ratchet: "9-60", bit: "H",
    notes: "賽場主流防禦持久陀螺。夠重，打甩咗漆面會更圓。F抵消攻擊。H增加重量難被打走。W重量好、持久力好。可用 ratchets: 6-60, 7-60, 9-60, 9-70, 6-70, 7-70。Bits: H(支撐力強但暴走), UN(持久較好需平衡), FB(自由迴旋持久中等需平衡)。注意紋章緊度重要過重量！",
    source: "Day17", category: "Defense-Stamina"
  },
  {
    blade: "Knight Shield", bladeZh: "騎士盾", bladeCode: "BX-04",
    ratchet: "9-60", bit: "LO",
    notes: "較圓，現時最平$40左右。重量較輕。3-60配合3點結構。9-60內重心不易爆。B持久較好但暴走，FB自由迴旋，LO高度較低持久好。可玩攻擊型（配置同Stone）。注意限定陀螺不包括。",
    source: "Day10", category: "Defense-Stamina"
  },
  {
    blade: "Phoenix Blaze", bladeZh: "鳳凰閃焰", bladeCode: "CX-12",
    ratchet: "9-60", bit: "H",
    notes: "現時隨處可見。V抵禦攻擊。9-60內重心防禦鎖。7-60增加重量。FB自由迴旋易打逆軌。H對左迴旋有優勢但暴走。LO持久較好但暴走。",
    source: "Day8", category: "Defense-Stamina"
  },
  {
    blade: "Devil Red Scythe", bladeZh: "惡魔鐮刀", bladeCode: "BX-02",
    ratchet: "9-60", bit: "FB",
    notes: "神杖之前賽場主流。9-60內重心防禦鎖。FB自由迴旋。B持久好但暴走。改動空間不大，盡量照抄。",
    source: "Day7", category: "Defense-Stamina"
  },
  {
    blade: "Mummy", bladeZh: "木乃伊", bladeCode: "UX-18",
    ratchet: "1-60", bit: "W",
    notes: "對付任何右迴旋都得。1-60/1-50調整偏重復活流。1-70高度較高。W高持久但支撐點細。H對左迴旋有優勢但暴走。",
    source: "Day6", category: "Defense-Stamina"
  },
  {
    blade: "Samurai Holy Sword", bladeZh: "武士聖劍", bladeCode: "BX-45",
    ratchet: "9-60", bit: "LO",
    notes: "練習型陀螺。持久力排名第5。重量較輕但能贏持久戰。9-60/9-70/LO/FB。新手學防禦持久必練。",
    source: "Day13", category: "Defense-Stamina"
  },

  // Stamina
  {
    blade: "Wizard Mirage", bladeZh: "魔導幻影", bladeCode: "",
    ratchet: "9-60", bit: "H",
    notes: "強勢原因：無明顯偏重/易調教、盤面夠大、夠圓滑。對付方法：(1) 時鐘4-55Lo（鬥持久唔好比切開），(2) 天馬爆擊W/H + 7-70/6-70/9-70/9-60/7-60/6-60H（更重更持久有機會撞走），(3) 霜輝銀狼6-60/3-60/9-60Lo/FB（優秀銀狼絕對有機會轉贏）。",
    source: "Day17 Notes", category: "Stamina"
  },
  {
    blade: "Clock", bladeZh: "時鐘", bladeCode: "",
    ratchet: "4-55", bit: "LO",
    notes: "4-55平衡性較好加強迴旋。LO高度較低持久（避免爆裂）。UN最低持久但建議平衡性好嘅Clock用。",
    source: "Day2", category: "Stamina"
  },

  // Anti-Left
  {
    blade: "Left Dragon", bladeZh: "左龍", bladeCode: "BX-34",
    ratchet: "4-55", bit: "E",
    notes: "最好用黑色版。4-55新手友好，不需挑公差。9-65功能同9-60/70一樣，不需挑公差。E提供極大盤面但極易爆開。除非對左迴旋，否則請用中速拉。",
    source: "Day4", category: "Anti-Left"
  },
  {
    blade: "Meteor Dragon", bladeZh: "殞星龍", bladeCode: "UX-17",
    ratchet: "7-70", bit: "L",
    notes: "7-70增加衝擊高度，發揮橡膠吸引能力。L底吸收能力好，有利吸收右迴旋。",
    source: "Day1", category: "Anti-Left"
  },

  // Beginner
  {
    blade: "Courage", bladeZh: "勇者", bladeCode: "CX-01",
    ratchet: "7-60", bit: "H",
    notes: "3點打擊。H增加重量加強打擊。J向下延伸由下打擊。S配合3點打擊。7-60戰車流增加重量。3-60加強3點打擊。可使用攻擊底：R, LR, LF, F, K, T, U。",
    source: "Day12", category: "Beginner"
  },
  {
    blade: "Pegasus Flight", bladeZh: "天馬飛翼", bladeCode: "BX-23",
    ratchet: "1-60", bit: "F",
    notes: "1-60復活流加強單點打擊（鳳凰難啲復活）。3-60加強3點打擊。7-60戰車流。F新手友好攻擊軸。R/LR持久較好攻擊軸接軌多。K高機動性支撐強。",
    source: "Day9", category: "Beginner"
  },

  // Attack
  {
    blade: "Flash Strike", bladeZh: "閃擊", bladeCode: "CX-13",
    ratchet: "1-60", bit: "F",
    notes: "暫時最重上蓋。F高度較低減風阻。H增加重量。S攻擊輔助刃。1-60/1-50配合單點打擊。7-60增加重量。R/LR持久較好攻擊軌。",
    source: "Day16", category: "Attack"
  },
  {
    blade: "Arc Light", bladeZh: "弧光", bladeCode: "CX-02",
    ratchet: "2-60", bit: "S",
    notes: "表面圓滑有撞擊力。S攻擊輔助刃。H增加重量。2-60識復活配合2點打擊。6-60提升迴旋增加尾速。K機動高持久好。T是K下位。F新手友好攻擊軸。",
    source: "Day14", category: "Attack"
  },
  {
    blade: "Whale Wave", bladeZh: "鯨浪", bladeCode: "BX-26",
    ratchet: "M-85", bit: "B",
    notes: "較大逆刃，重量優秀。M-85配合上盤5點。5-60配合外拋性強。B反擊流持久好。H對付左迴旋有優勢。",
    source: "Day11", category: "Attack"
  },
  {
    blade: "Tyranno Beat", bladeZh: "暴龍狂擊", bladeCode: "UX-10",
    ratchet: "1-60", bit: "H",
    notes: "衝擊力強，平衡好，但重量較鯊魚低。1-60偏重加強打擊。5-60外拋增加接軌。7-60增加重量。H有鎖血但暴走。B不易暴走但易爆。J對付左迴旋優勢但支撐細。R/LR對攻擊型有優勢但無法對付左迴旋。",
    source: "Day3", category: "Attack"
  },
  {
    blade: "Stone", bladeZh: "石人", bladeCode: "CX-11",
    ratchet: "1-60", bit: "F",
    notes: "重量偏輕但撞擊力強。綠色版最好。1-60偏重加強撞擊。3-60平衡陀螺。F新手友好。R/LR持久好接軌多。可玩防禦持久型。",
    source: "Day5", category: "Attack"
  },
];