# Laya Tower RPG v0.4

อัปเกรดจาก v0.3 โดยเพิ่มระบบจัดอุปกรณ์และคลังไอเทม

## ของใหม่ใน v0.4
- migrate save จาก v0.1 / v0.2 / v0.3 อัตโนมัติไป key ใหม่ `layaTowerRpgSaveV4`
- เพิ่มหน้า `inventory.html`
- เพิ่ม Equipment 3 ช่อง: Weapon / Armor / Charm
- เพิ่ม Consumables: Potion / Ether / Phoenix Leaf
- บอสและมินิบอสมีสกิลเฉพาะชัดขึ้น
- หลังชนะมีโอกาสดรอปของ
- เมนูหลักแสดงอุปกรณ์และ consumables

## วิธีใช้งาน
1. เปิด `index.html`
2. ถ้ามี save เก่าระบบจะย้ายขึ้น v0.4 ให้เอง
3. เข้า `Inventory` เพื่อเปลี่ยนอุปกรณ์
4. เข้า `Tower` เพื่อเริ่มต่อสู้

## หมายเหตุ
- ยังเป็นเวอร์ชัน static ไม่มี backend
- เหมาะสำหรับต่อเป็น v0.5 เช่นหลายศัตรู, equipment rarity, shop, firebase save