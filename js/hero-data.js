window.HERO_CLASSES = {
  striker: {
    name: 'Striker',
    role: 'Melee DPS',
    description: 'นักสู้ระยะประชิด เน้นโจมตีแรง คริติคอลสูง และปิดศัตรูตัวอันตรายอย่างรวดเร็ว',
    iconMale: '⚔️',
    iconFemale: '🗡️',
    stats: { hp: 1200, mp: 80, atk: 110, def: 70, spd: 90, crit: 8 }
  },
  arcanist: {
    name: 'Arcanist',
    role: 'Magic DPS',
    description: 'จอมเวทสายธาตุ ใช้ MP สูง แต่สร้างความเสียหายเป็นวงกว้างและแพ้ทางธาตุได้ดีมาก',
    iconMale: '🔮',
    iconFemale: '✨',
    stats: { hp: 900, mp: 140, atk: 95, def: 45, spd: 85, crit: 6 }
  },
  support: {
    name: 'Support',
    role: 'Healer / Buffer',
    description: 'สายช่วยเหลือ ฟื้นฟู HP เพิ่มบัฟ และทำให้การไต่หอปลอดภัยขึ้นในระยะยาว',
    iconMale: '💚',
    iconFemale: '🕊️',
    stats: { hp: 980, mp: 130, atk: 70, def: 60, spd: 88, crit: 4 }
  },
  serverKnight: {
    name: 'Server Knight',
    role: 'Tank',
    description: 'อัศวินแนวหน้าที่มี HP และ DEF สูง เหมาะกับการยืนชนศัตรูและรับดาเมจหนัก',
    iconMale: '🛡️',
    iconFemale: '🛡️',
    stats: { hp: 1450, mp: 70, atk: 85, def: 100, spd: 70, crit: 3 }
  },
  hostRanger: {
    name: 'Host Ranger',
    role: 'Ranged DPS',
    description: 'โจมตีจากระยะไกล ความเร็วสูงและแม่นยำ เหมาะกับการกำจัดเป้าหมายเดี่ยวอย่างต่อเนื่อง',
    iconMale: '🏹',
    iconFemale: '🎯',
    stats: { hp: 1020, mp: 95, atk: 98, def: 55, spd: 102, crit: 10 }
  },
  barAlchemist: {
    name: 'Bar Alchemist',
    role: 'Debuff / Utility',
    description: 'ใช้พิษ ขวดยา และสถานะผิดปกติในการคุมเกม ทำดาเมจต่อเนื่องและตัดกำลังศัตรู',
    iconMale: '🧪',
    iconFemale: '⚗️',
    stats: { hp: 970, mp: 120, atk: 84, def: 58, spd: 92, crit: 5 }
  },
  stewardGuardian: {
    name: 'Steward Guardian',
    role: 'Defense / Holy',
    description: 'ผู้พิทักษ์สายป้องกัน มีสมดุลระหว่างความอึดและเวทป้องกัน เหมาะกับไฟต์ยาว',
    iconMale: '🔰',
    iconFemale: '🌟',
    stats: { hp: 1300, mp: 90, atk: 88, def: 92, spd: 75, crit: 4 }
  }
};
