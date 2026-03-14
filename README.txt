# Laya Tower RPG v0.3

อัปเกรดจาก v0.2 ให้เกมเล่นได้ลึกขึ้นโดยยังคงเป็นเว็บเกม static เปิดผ่าน GitHub Pages ได้

## ของใหม่ใน v0.3
- migrate save จาก v0.1 / v0.2 อัตโนมัติไป key ใหม่ `layaTowerRpgSaveV3`
- หน้า Create Character preview เปลี่ยนข้อมูลทันทีทุกครั้งที่เลือก class
- เพิ่ม lore / passive / SPD stat ในหน้าเลือกอาชีพและเมนูหลัก
- Battle มีระบบ status effects: Poison, Burn, Regen, Shield, Exposed, Arcane Break, Corrode, Slow
- เพิ่ม enemy intent preview
- เพิ่ม passive class บางส่วนและผลลัพธ์หลังจบ battle ดีขึ้น
- เพิ่ม zone label ในหน้า Tower

## วิธีใช้งาน
1. เปิด `index.html`
2. ถ้ามี save เก่าจาก v0.1/v0.2 ระบบจะดึงมาใช้เอง
3. ถ้าอยากเริ่มใหม่ กด Reset Character จากหน้าแรก

## หมายเหตุ
- ยังเป็นเวอร์ชัน static ไม่มี backend
- เหมาะสำหรับต่อเป็น v0.4 เช่น equipment, inventory, multi-enemy wave, boss unique skills
