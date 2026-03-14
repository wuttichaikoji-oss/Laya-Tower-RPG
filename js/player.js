
window.HERO_CLASSES = [
  {
    id: "striker", name: "Striker", role: "Melee DPS", affinity: "Burst", element: "Fire", level: 1,
    description: "นักสู้ระยะประชิด โจมตีหนัก เน้นดาเมจและคริติคอล", bio: "นักล่าชัยชนะที่พุ่งเข้าหาศัตรูโดยไม่ลังเล",
    color: "#ff8b7e", sprite: "assets/sprites/striker.svg", cloak: "linear-gradient(180deg,#ff8b7e,#7c2e38)",
    stats: { hp: 150, mp: 42, atk: 24, def: 10, spd: 12 },
    passive: "Critical Ember — โจมตีปกติมีโอกาสคริติคอลเพิ่ม",
    skills: [
      { id: "powerSlash", name: "Power Slash", mpCost: 8, power: 1.65, type: "attack", note: "โจมตีเดี่ยวแรง", icon: "⚔️" },
      { id: "crimsonDrive", name: "Crimson Drive", mpCost: 14, power: 2.1, type: "attack", note: "คริติคอลสูงและติด Burn", icon: "🔥", apply: { name: "burn", turns: 2, power: 8 } }
    ], tags: ["Melee", "Crit", "Burst"]
  },
  {
    id: "arcanist", name: "Arcanist", role: "Magic DPS", affinity: "Arcane", element: "Ghost", level: 2,
    description: "เมจธาตุ ยิงเวทแรง ใช้ MP สูง แต่มีพลังระเบิดสูงมาก", bio: "ผู้ควบคุมพลังดวงดาวและอักษรรูนแห่งหอคอย",
    color: "#8c82ff", sprite: "assets/sprites/arcanist.svg", cloak: "linear-gradient(180deg,#8c82ff,#2b2668)",
    stats: { hp: 112, mp: 92, atk: 29, def: 7, spd: 10 },
    passive: "Astral Surge — ใช้เวทแล้ว MP ฟื้นกลับเล็กน้อย",
    skills: [
      { id: "arcBolt", name: "Arc Bolt", mpCost: 10, power: 1.7, type: "magic", note: "เวทเดี่ยว", icon: "🔮" },
      { id: "astralBurst", name: "Astral Burst", mpCost: 18, power: 2.25, type: "magic", note: "เวทแรงมากและติด Arcane Break", icon: "✨", apply: { name: "arcaneBreak", turns: 2, amp: 0.18 } }
    ], tags: ["Magic", "Burst", "Glass Cannon"]
  },
  {
    id: "support", name: "Support", role: "Heal & Sustain", affinity: "Grace", element: "Holy", level: 1,
    description: "ฮีลตัวเองได้ ยืนระยะดี พร้อมเวทแสงโจมตีศัตรู", bio: "ผู้เชื่อมแสงศักดิ์สิทธิ์และการปกป้องตนเอง",
    color: "#70e1b7", sprite: "assets/sprites/support.svg", cloak: "linear-gradient(180deg,#70e1b7,#1d6f63)",
    stats: { hp: 134, mp: 88, atk: 16, def: 11, spd: 11 },
    passive: "Kindled Light — ชนะเทิร์นจะฟื้น HP เล็กน้อย",
    skills: [
      { id: "healingLight", name: "Healing Light", mpCost: 12, type: "heal", healRatio: 0.34, note: "ฟื้น HP", icon: "✚" },
      { id: "holyPulse", name: "Holy Pulse", mpCost: 10, power: 1.45, type: "magic", note: "เวทแสงและเพิ่ม Regen", icon: "☀️", applySelf: { name: "regen", turns: 2, power: 10 } }
    ], tags: ["Heal", "Safe", "Sustain"]
  },
  {
    id: "server-knight", name: "Server Knight", role: "Tank", affinity: "Guard", element: "Water", level: 2,
    description: "เกราะหนา รับดาเมจได้มาก เหมาะกับผู้เล่นสายปลอดภัย", bio: "อัศวินโล่ที่ยืนแนวหน้าไม่ยอมถอย",
    color: "#7bd6ff", sprite: "assets/sprites/server-knight.svg", cloak: "linear-gradient(180deg,#7bd6ff,#205e84)",
    stats: { hp: 186, mp: 38, atk: 19, def: 18, spd: 8 },
    passive: "Fortified Core — ลดดาเมจจาก Boss เล็กน้อย",
    skills: [
      { id: "shieldBash", name: "Shield Bash", mpCost: 8, power: 1.4, type: "attack", note: "โจมตีพร้อมทำให้ศัตรู Exposed", icon: "🛡️", apply: { name: "exposed", turns: 1, amp: 0.2 } },
      { id: "ironGuard", name: "Iron Guard", mpCost: 12, type: "buff", defendBoost: 0.45, note: "ป้องกันสูงขึ้น 2 เทิร์น", icon: "🔷", applySelf: { name: "shield", turns: 2, reduce: 0.28 } }
    ], tags: ["Tank", "Guard", "Safe"]
  },
  {
    id: "host-ranger", name: "Host Ranger", role: "Ranged DPS", affinity: "Swift", element: "Wind", level: 2,
    description: "โจมตีไว แม่นยำ จบศึกได้รวดเร็วจากระยะไกล", bio: "นักลมผู้ไม่ปล่อยให้ศัตรูได้พักหายใจ",
    color: "#ffb359", sprite: "assets/sprites/host-ranger.svg", cloak: "linear-gradient(180deg,#ffb359,#8a4a18)",
    stats: { hp: 126, mp: 58, atk: 23, def: 9, spd: 14 },
    passive: "Eagle Eye — เริ่มต่อสู้ด้วย crit chance เพิ่ม",
    skills: [
      { id: "piercingShot", name: "Piercing Shot", mpCost: 9, power: 1.6, type: "attack", note: "ลูกธนูทะลวง", icon: "🏹" },
      { id: "galeArrow", name: "Gale Arrow", mpCost: 14, power: 1.95, type: "attack", note: "โจมตีแรงและทำให้เป้าหมาย Exposed", icon: "💨", apply: { name: "exposed", turns: 2, amp: 0.18 } }
    ], tags: ["Ranged", "Fast", "Crit"]
  },
  {
    id: "bar-alchemist", name: "Bar Alchemist", role: "Debuff & Utility", affinity: "Toxic", element: "Poison", level: 3,
    description: "ใช้พิษและขวดยา ลดความสามารถศัตรูและคุมจังหวะ", bio: "นักปรุงยาที่เปลี่ยนสนามรบให้เป็นกับดัก",
    color: "#cf7dff", sprite: "assets/sprites/bar-alchemist.svg", cloak: "linear-gradient(180deg,#cf7dff,#66317e)",
    stats: { hp: 128, mp: 74, atk: 21, def: 10, spd: 11 },
    passive: "Toxic Study — สถานะผิดปกติของศัตรูแรงขึ้นเล็กน้อย",
    skills: [
      { id: "toxicFlask", name: "Toxic Flask", mpCost: 11, power: 1.55, type: "magic", note: "โจมตีพิษและติด Poison", icon: "🧪", apply: { name: "poison", turns: 3, power: 9 } },
      { id: "acidMix", name: "Acid Mix", mpCost: 16, power: 1.9, type: "magic", note: "ลด DEF ศัตรูและติด Corrode", icon: "☣️", apply: { name: "corrode", turns: 2, shred: 3 } }
    ], tags: ["Debuff", "Magic", "Utility"]
  },
  {
    id: "steward-guardian", name: "Steward Guardian", role: "Defense Fighter", affinity: "Ward", element: "Earth", level: 2,
    description: "บาลานซ์ดี ป้องกันและสวนกลับ เหมาะกับการไต่หอแบบเสถียร", bio: "ผู้พิทักษ์ดินที่ยืนหยัดจนกว่าจะชนะ",
    color: "#ffe07a", sprite: "assets/sprites/steward-guardian.svg", cloak: "linear-gradient(180deg,#ffe07a,#937122)",
    stats: { hp: 166, mp: 48, atk: 20, def: 15, spd: 9 },
    passive: "Stone Discipline — เมื่อ Guard จะได้ shield เพิ่ม",
    skills: [
      { id: "stoneStrike", name: "Stone Strike", mpCost: 8, power: 1.5, type: "attack", note: "โจมตีธาตุดินและทำให้ศัตรูช้าลง", icon: "🪨", apply: { name: "slow", turns: 2, amp: 0.1 } },
      { id: "guardianWall", name: "Guardian Wall", mpCost: 12, type: "buff", defendBoost: 0.35, note: "ลดดาเมจรอบถัดไปและได้ Shield", icon: "🧱", applySelf: { name: "shield", turns: 2, reduce: 0.22 } }
    ], tags: ["Defense", "Balanced", "Stable"]
  }
];
