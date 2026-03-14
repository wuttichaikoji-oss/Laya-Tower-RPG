
window.HERO_CLASSES = [
  {
    id: "striker",
    name: "Striker",
    role: "Melee DPS",
    description: "ดาบหนัก โจมตีแรง คริติคอลดี",
    color: "#ff8b7e",
    cloak: "linear-gradient(180deg,#ff8b7e,#7c2e38)",
    element: "Fire",
    level: 1,
    stats: { hp: 150, mp: 40, atk: 24, def: 10 },
    skills: [
      { id: "powerSlash", name: "Power Slash", mpCost: 8, power: 1.65, type: "attack", note: "โจมตีแรงเดี่ยว" },
      { id: "crimsonDrive", name: "Crimson Drive", mpCost: 14, power: 2.1, type: "attack", note: "มีโอกาสคริติคอลสูง" }
    ],
    tags: ["Melee", "Crit", "Burst"]
  },
  {
    id: "arcanist",
    name: "Arcanist",
    role: "Magic DPS",
    description: "เมจธาตุ ยิงเวทแรง ใช้ MP สูง",
    color: "#7c7cff",
    cloak: "linear-gradient(180deg,#8c82ff,#2b2668)",
    element: "Ghost",
    level: 2,
    stats: { hp: 110, mp: 90, atk: 29, def: 7 },
    skills: [
      { id: "arcBolt", name: "Arc Bolt", mpCost: 10, power: 1.7, type: "magic", note: "เวทเดี่ยว" },
      { id: "astralBurst", name: "Astral Burst", mpCost: 18, power: 2.25, type: "magic", note: "เวทแรงมาก" }
    ],
    tags: ["Magic", "Burst", "Glass Cannon"]
  },
  {
    id: "support",
    name: "Support",
    role: "Heal & Buff",
    description: "ฮีลตัวเองได้ ยืนระยะดี",
    color: "#70e1b7",
    cloak: "linear-gradient(180deg,#70e1b7,#1d6f63)",
    element: "Holy",
    level: 1,
    stats: { hp: 132, mp: 88, atk: 16, def: 11 },
    skills: [
      { id: "healingLight", name: "Healing Light", mpCost: 12, power: 0, type: "heal", healRatio: 0.34, note: "ฟื้น HP" },
      { id: "holyPulse", name: "Holy Pulse", mpCost: 10, power: 1.45, type: "magic", note: "เวทแสง" }
    ],
    tags: ["Heal", "Safe", "Sustain"]
  },
  {
    id: "server-knight",
    name: "Server Knight",
    role: "Tank",
    description: "เกราะหนา รับดาเมจได้มาก",
    color: "#7bd6ff",
    cloak: "linear-gradient(180deg,#7bd6ff,#205e84)",
    element: "Water",
    level: 2,
    stats: { hp: 185, mp: 36, atk: 19, def: 18 },
    skills: [
      { id: "shieldBash", name: "Shield Bash", mpCost: 8, power: 1.4, type: "attack", note: "โจมตีพร้อมลดดาเมจศัตรู" },
      { id: "ironGuard", name: "Iron Guard", mpCost: 12, power: 0, type: "buff", defendBoost: 0.45, note: "ป้องกันสูงขึ้น" }
    ],
    tags: ["Tank", "Guard", "Safe"]
  },
  {
    id: "host-ranger",
    name: "Host Ranger",
    role: "Ranged DPS",
    description: "โจมตีไว แม่นยำ เน้นจบไว",
    color: "#ffb359",
    cloak: "linear-gradient(180deg,#ffb359,#8a4a18)",
    element: "Wind",
    level: 2,
    stats: { hp: 125, mp: 56, atk: 23, def: 9 },
    skills: [
      { id: "piercingShot", name: "Piercing Shot", mpCost: 9, power: 1.6, type: "attack", note: "ลูกธนูทะลวง" },
      { id: "galeArrow", name: "Gale Arrow", mpCost: 14, power: 1.95, type: "attack", note: "ลมแรงมีโอกาส Weak" }
    ],
    tags: ["Ranged", "Fast", "Crit"]
  },
  {
    id: "bar-alchemist",
    name: "Bar Alchemist",
    role: "Debuff & Utility",
    description: "ใช้พิษและขวดยา ลดความสามารถศัตรู",
    color: "#cf7dff",
    cloak: "linear-gradient(180deg,#cf7dff,#66317e)",
    element: "Poison",
    level: 3,
    stats: { hp: 128, mp: 72, atk: 21, def: 10 },
    skills: [
      { id: "toxicFlask", name: "Toxic Flask", mpCost: 11, power: 1.55, type: "magic", note: "โจมตีพิษ" },
      { id: "acidMix", name: "Acid Mix", mpCost: 16, power: 1.9, type: "magic", note: "ลด DEF ศัตรู" }
    ],
    tags: ["Debuff", "Magic", "Utility"]
  },
  {
    id: "steward-guardian",
    name: "Steward Guardian",
    role: "Defense Fighter",
    description: "บาลานซ์ดี ป้องกันและสวนกลับ",
    color: "#ffe07a",
    cloak: "linear-gradient(180deg,#ffe07a,#937122)",
    element: "Earth",
    level: 2,
    stats: { hp: 165, mp: 46, atk: 20, def: 15 },
    skills: [
      { id: "stoneStrike", name: "Stone Strike", mpCost: 8, power: 1.5, type: "attack", note: "โจมตีธาตุดิน" },
      { id: "guardianWall", name: "Guardian Wall", mpCost: 12, power: 0, type: "buff", defendBoost: 0.35, note: "ลดดาเมจรอบถัดไป" }
    ],
    tags: ["Defense", "Balanced", "Stable"]
  }
];
