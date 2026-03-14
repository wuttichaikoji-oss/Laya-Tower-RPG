(function () {
  const STORAGE_KEYS = ["layaTowerRpgSaveV4", "layaTowerRpgSaveV3", "layaTowerRpgSaveV2", "layaTowerRpgSaveV1"];
  const WRITE_KEY = "layaTowerRpgSaveV4";

  const ITEM_CATALOG = {
    bronzeBlade: { id:"bronzeBlade", name:"Bronze Blade", slot:"weapon", type:"weapon", desc:"ดาบเริ่มต้น เพิ่มพลังโจมตี", bonuses:{ atk:4 }, icon:"🗡️" },
    runeTome: { id:"runeTome", name:"Rune Tome", slot:"weapon", type:"weapon", desc:"ตำรารูน เพิ่มพลังเวทและ MP", bonuses:{ atk:5, mp:10 }, icon:"📘" },
    graceStaff: { id:"graceStaff", name:"Grace Staff", slot:"weapon", type:"weapon", desc:"คทาแห่งแสง เพิ่ม MP และพลังฟื้นฟู", bonuses:{ atk:2, mp:14, hp:6 }, icon:"✨" },
    towerShield: { id:"towerShield", name:"Tower Shield", slot:"weapon", type:"weapon", desc:"โล่หนัก เพิ่มพลังป้องกันสูง", bonuses:{ atk:1, def:5 }, icon:"🛡️" },
    hunterBow: { id:"hunterBow", name:"Hunter Bow", slot:"weapon", type:"weapon", desc:"คันธนูเบา เพิ่ม ATK และ SPD", bonuses:{ atk:4, spd:2 }, icon:"🏹" },
    toxicKit: { id:"toxicKit", name:"Toxic Kit", slot:"weapon", type:"weapon", desc:"ชุดปรุงยา เพิ่ม ATK และ MP", bonuses:{ atk:3, mp:12 }, icon:"🧪" },
    earthHammer: { id:"earthHammer", name:"Earth Hammer", slot:"weapon", type:"weapon", desc:"ค้อนพิทักษ์ เพิ่ม HP และ DEF", bonuses:{ atk:3, def:3, hp:8 }, icon:"🔨" },
    travelerMail: { id:"travelerMail", name:"Traveler Mail", slot:"armor", type:"armor", desc:"เกราะเดินทางมาตรฐาน", bonuses:{ hp:18, def:2 }, icon:"🥋" },
    mysticVest: { id:"mysticVest", name:"Mystic Vest", slot:"armor", type:"armor", desc:"เสื้อคลุมเวท เพิ่ม MP และ DEF", bonuses:{ mp:10, def:2 }, icon:"🪄" },
    windBoots: { id:"windBoots", name:"Wind Boots", slot:"armor", type:"armor", desc:"รองเท้าเบา เพิ่มความเร็ว", bonuses:{ hp:10, spd:2 }, icon:"👢" },
    wardCharm: { id:"wardCharm", name:"Ward Charm", slot:"charm", type:"charm", desc:"เครื่องรางป้องกัน เพิ่ม DEF เล็กน้อย", bonuses:{ def:2 }, icon:"📿" },
    emberRing: { id:"emberRing", name:"Ember Ring", slot:"charm", type:"charm", desc:"แหวนเพลิง เพิ่ม ATK", bonuses:{ atk:2 }, icon:"💍" },
    moonCharm: { id:"moonCharm", name:"Moon Charm", slot:"charm", type:"charm", desc:"เครื่องรางจันทรา เพิ่ม MP", bonuses:{ mp:8 }, icon:"🌙" },
    potion: { id:"potion", name:"Potion", slot:"consumable", type:"consumable", desc:"ฟื้น HP 40", effect:{ heal:40 }, icon:"🧴" },
    ether: { id:"ether", name:"Ether", slot:"consumable", type:"consumable", desc:"ฟื้น MP 20", effect:{ mp:20 }, icon:"🔷" },
    phoenixLeaf: { id:"phoenixLeaf", name:"Phoenix Leaf", slot:"consumable", type:"consumable", desc:"ฟื้น HP 70 แบบฉุกเฉิน", effect:{ heal:70 }, icon:"🍃" },
    bossSigil: { id:"bossSigil", name:"Boss Sigil", slot:"charm", type:"charm", desc:"ตราประทับจากบอส เพิ่ม ATK/DEF/HP", bonuses:{ atk:3, def:3, hp:14 }, icon:"👑" }
  };

  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
  function getClassById(id) { return HERO_CLASSES.find(item => item.id === id) || HERO_CLASSES[0]; }

  function starterEquipment(classId) {
    const map = {
      striker: { weapon:"bronzeBlade", armor:"travelerMail", charm:"emberRing" },
      arcanist: { weapon:"runeTome", armor:"mysticVest", charm:"moonCharm" },
      support: { weapon:"graceStaff", armor:"mysticVest", charm:"wardCharm" },
      "server-knight": { weapon:"towerShield", armor:"travelerMail", charm:"wardCharm" },
      "host-ranger": { weapon:"hunterBow", armor:"windBoots", charm:"emberRing" },
      "bar-alchemist": { weapon:"toxicKit", armor:"mysticVest", charm:"moonCharm" },
      "steward-guardian": { weapon:"earthHammer", armor:"travelerMail", charm:"wardCharm" }
    };
    return map[classId] || map.striker;
  }

  function starterInventory(classId) {
    const eq = starterEquipment(classId);
    return [
      { id:eq.weapon, qty:1 }, { id:eq.armor, qty:1 }, { id:eq.charm, qty:1 },
      { id:"potion", qty:3 }, { id:"ether", qty:1 },
      { id:"travelerMail", qty:eq.armor === "travelerMail" ? 1 : 0 },
      { id:"mysticVest", qty:eq.armor === "mysticVest" ? 1 : 0 },
      { id:"windBoots", qty:eq.armor === "windBoots" ? 1 : 0 },
      { id:"wardCharm", qty:eq.charm === "wardCharm" ? 1 : 0 },
      { id:"emberRing", qty:eq.charm === "emberRing" ? 1 : 0 },
      { id:"moonCharm", qty:eq.charm === "moonCharm" ? 1 : 0 }
    ].filter(item => item.qty > 0);
  }

  function normalizeInventory(inventory) {
    const map = new Map();
    (inventory || []).forEach(item => {
      if (!ITEM_CATALOG[item.id]) return;
      map.set(item.id, (map.get(item.id) || 0) + (item.qty || 1));
    });
    return Array.from(map.entries()).map(([id, qty]) => ({ id, qty }));
  }

  function getItem(id) { return ITEM_CATALOG[id] || null; }
  function getInventoryQty(save, id) { return (save.inventory || []).find(x => x.id === id)?.qty || 0; }
  function addItemToSave(save, id, qty = 1) {
    if (!ITEM_CATALOG[id] || qty <= 0) return save;
    const found = (save.inventory || []).find(x => x.id === id);
    if (found) found.qty += qty; else save.inventory.push({ id, qty });
    save.inventory = normalizeInventory(save.inventory);
    return save;
  }
  function consumeItemFromSave(save, id, qty = 1) {
    const found = (save.inventory || []).find(x => x.id === id);
    if (!found || found.qty < qty) return false;
    found.qty -= qty;
    save.inventory = normalizeInventory((save.inventory || []).filter(x => x.qty > 0));
    return true;
  }

  function migrateSave(save) {
    const heroClass = getClassById(save.classId);
    const base = {
      version: 4,
      name: save.name || "Hero",
      classId: heroClass.id,
      className: heroClass.name,
      role: heroClass.role,
      currentFloor: save.currentFloor || 1,
      unlockedFloor: save.unlockedFloor || 1,
      gold: save.gold ?? 120,
      level: save.level || 1,
      exp: save.exp || 0,
      hp: save.hp || heroClass.stats.hp,
      mp: save.mp || heroClass.stats.mp,
      maxHp: save.maxHp || heroClass.stats.hp,
      maxMp: save.maxMp || heroClass.stats.mp,
      atk: save.atk || heroClass.stats.atk,
      def: save.def || heroClass.stats.def,
      spd: save.spd || heroClass.stats.spd,
      element: save.element || heroClass.element,
      elementLevel: save.elementLevel || heroClass.level,
      affinity: save.affinity || heroClass.affinity,
      sprite: heroClass.sprite,
      passive: heroClass.passive,
      skills: heroClass.skills,
      inventory: normalizeInventory(save.inventory || starterInventory(heroClass.id)),
      equipment: save.equipment || starterEquipment(heroClass.id),
      unlockedDrops: save.unlockedDrops || []
    };
    ["weapon","armor","charm"].forEach(slot => {
      if (!base.equipment[slot]) base.equipment[slot] = starterEquipment(heroClass.id)[slot];
      if (!getInventoryQty(base, base.equipment[slot])) addItemToSave(base, base.equipment[slot], 1);
    });
    return base;
  }

  function getEquippedItems(save) {
    const equipment = save.equipment || {};
    return {
      weapon: getItem(equipment.weapon),
      armor: getItem(equipment.armor),
      charm: getItem(equipment.charm)
    };
  }

  function getDerivedStats(save) {
    const result = { maxHp: save.maxHp, maxMp: save.maxMp, atk: save.atk, def: save.def, spd: save.spd };
    const items = getEquippedItems(save);
    Object.values(items).forEach(item => {
      if (!item?.bonuses) return;
      result.maxHp += item.bonuses.hp || 0;
      result.maxMp += item.bonuses.mp || 0;
      result.atk += item.bonuses.atk || 0;
      result.def += item.bonuses.def || 0;
      result.spd += item.bonuses.spd || 0;
    });
    return result;
  }

  function setSave(data) {
    const normalized = migrateSave(data);
    localStorage.setItem(WRITE_KEY, JSON.stringify(normalized));
    ["layaTowerRpgSaveV3", "layaTowerRpgSaveV2", "layaTowerRpgSaveV1"].forEach(k => localStorage.removeItem(k));
  }
  function getSave() {
    for (const key of STORAGE_KEYS) {
      const raw = localStorage.getItem(key);
      if (raw) {
        const save = migrateSave(JSON.parse(raw));
        if (key !== WRITE_KEY) setSave(save);
        return save;
      }
    }
    return null;
  }
  function clearSave() { STORAGE_KEYS.forEach(k => localStorage.removeItem(k)); }
  function getSelectedFloor() { return Number(sessionStorage.getItem("layaSelectedFloor") || 1); }
  function setSelectedFloor(floor) { sessionStorage.setItem("layaSelectedFloor", String(floor)); }
  function ensureSaveOrRedirect() { const save = getSave(); if (!save) { location.href = "index.html"; return null; } return save; }
  function heroArt(heroClass, large = false, id = "") { return `<div ${id ? `id="${id}"` : ""} class="hero-avatar ${large ? "large-avatar" : ""}" style="background-image:url('${heroClass.sprite}');"></div>`; }
  function skillListHTML(skills) { return skills.map(skill => `<li>${skill.icon} <strong>${skill.name}</strong> <span class="muted">— ${skill.note}</span></li>`).join(""); }
  function equipmentHTML(save) {
    const items = getEquippedItems(save);
    return ["weapon","armor","charm"].map(slot => {
      const item = items[slot];
      return `<div class="equip-chip"><span>${slot.toUpperCase()}</span><strong>${item ? `${item.icon} ${item.name}` : "-"}</strong></div>`;
    }).join("");
  }
  function consumableSummary(save) {
    return ["potion","ether","phoenixLeaf"].map(id => `${ITEM_CATALOG[id].icon} ${ITEM_CATALOG[id].name} x${getInventoryQty(save,id)}`).join(" • ");
  }

  function initTitlePage() {
    const continueBtn = document.getElementById("continueBtn");
    const startGameBtn = document.getElementById("startGameBtn");
    const resetBtn = document.getElementById("resetBtn");
    const saveStatus = document.getElementById("saveStatus");
    const titleHeroArt = document.getElementById("titleHeroArt");
    const save = getSave();
    const heroClass = save ? getClassById(save.classId) : HERO_CLASSES[0];
    titleHeroArt.innerHTML = `<img class="hero-silhouette" src="${heroClass.sprite}" alt="Hero preset"/>`;
    document.getElementById("titleHeroName").textContent = save ? save.name : heroClass.name;
    document.getElementById("titleHeroClass").textContent = save ? `${save.className} • Lv ${save.level}` : `${heroClass.role} • ${heroClass.element} Lv${heroClass.level}`;
    document.getElementById("titleHeroPassive").textContent = heroClass.passive;
    document.getElementById("titleLoadout").textContent = save ? consumableSummary(save) : "เริ่มเกมใหม่จะได้รับ Potion และอุปกรณ์เริ่มต้น";
    if (save) {
      continueBtn.style.display = "inline-flex";
      startGameBtn.textContent = "Create New Hero";
      saveStatus.textContent = `พบเซฟของ ${save.name} • Floor ${save.currentFloor} • Gold ${save.gold}`;
    } else {
      continueBtn.style.display = "none";
      saveStatus.textContent = "ยังไม่มีตัวละคร เริ่มสร้างฮีโร่ได้ทันที";
    }
    resetBtn.addEventListener("click", () => {
      clearSave();
      saveStatus.textContent = "ลบเซฟตัวละครแล้ว";
      continueBtn.style.display = "none";
      startGameBtn.textContent = "Start Game";
      document.getElementById("titleHeroName").textContent = HERO_CLASSES[0].name;
      document.getElementById("titleHeroClass").textContent = `${HERO_CLASSES[0].role} • ${HERO_CLASSES[0].element} Lv${HERO_CLASSES[0].level}`;
      document.getElementById("titleHeroPassive").textContent = HERO_CLASSES[0].passive;
      document.getElementById("titleLoadout").textContent = "เริ่มเกมใหม่จะได้รับ Potion และอุปกรณ์เริ่มต้น";
    });
  }

  function initCreateCharacterPage() {
    const grid = document.getElementById("classGrid");
    const previewWrap = document.getElementById("previewAvatarWrap");
    const previewClassName = document.getElementById("previewClassName");
    const previewRole = document.getElementById("previewRole");
    const previewBio = document.getElementById("previewBio");
    const previewPassive = document.getElementById("previewPassive");
    const previewSkills = document.getElementById("previewSkills");
    const statHp = document.getElementById("statHp");
    const statMp = document.getElementById("statMp");
    const statAtk = document.getElementById("statAtk");
    const statDef = document.getElementById("statDef");
    const statSpd = document.getElementById("statSpd");
    const affinity = document.getElementById("previewAffinity");
    const createBtn = document.getElementById("createHeroBtn");
    const heroNameInput = document.getElementById("heroName");
    const msg = document.getElementById("createMessage");
    let selectedClass = HERO_CLASSES[0];

    HERO_CLASSES.forEach(heroClass => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = `class-card ${heroClass.id === selectedClass.id ? "selected" : ""}`;
      card.innerHTML = `${heroArt(heroClass)}<div><h3>${heroClass.name}</h3><p>${heroClass.role}</p><p>${heroClass.description}</p><div class="class-tags">${heroClass.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}</div></div>`;
      card.addEventListener("click", () => {
        document.querySelectorAll(".class-card").forEach(el => el.classList.remove("selected"));
        card.classList.add("selected");
        selectedClass = heroClass;
        renderPreview(heroClass);
      });
      grid.appendChild(card);
    });

    function renderPreview(heroClass) {
      const tempSave = migrateSave({ classId: heroClass.id, name: heroClass.name });
      const derived = getDerivedStats(tempSave);
      previewWrap.innerHTML = heroArt(heroClass, true, "previewAvatar");
      previewClassName.textContent = heroClass.name;
      previewRole.textContent = `${heroClass.role} • ${heroClass.description}`;
      previewBio.textContent = heroClass.bio;
      previewPassive.textContent = `${heroClass.passive} • เริ่มพร้อม ${consumableSummary(tempSave)}`;
      affinity.textContent = `${heroClass.affinity} • ${heroClass.element} Lv${heroClass.level}`;
      statHp.textContent = derived.maxHp;
      statMp.textContent = derived.maxMp;
      statAtk.textContent = derived.atk;
      statDef.textContent = derived.def;
      statSpd.textContent = derived.spd;
      previewSkills.innerHTML = skillListHTML(heroClass.skills);
    }
    renderPreview(selectedClass);

    createBtn.addEventListener("click", () => {
      const heroName = heroNameInput.value.trim();
      if (!heroName) { msg.textContent = "กรุณาใส่ชื่อตัวละคร"; return; }
      const save = migrateSave({
        name: heroName, classId: selectedClass.id, className: selectedClass.name, role: selectedClass.role,
        currentFloor: 1, unlockedFloor: 1, gold: 120, level: 1, exp: 0,
        hp: selectedClass.stats.hp, mp: selectedClass.stats.mp, maxHp: selectedClass.stats.hp, maxMp: selectedClass.stats.mp,
        atk: selectedClass.stats.atk, def: selectedClass.stats.def, spd: selectedClass.stats.spd,
        element: selectedClass.element, elementLevel: selectedClass.level, affinity: selectedClass.affinity, skills: selectedClass.skills,
        inventory: starterInventory(selectedClass.id), equipment: starterEquipment(selectedClass.id)
      });
      setSave(save);
      msg.textContent = "สร้างฮีโร่สำเร็จ กำลังเข้าสู่เมนูเกม...";
      setTimeout(() => location.href = "menu.html", 600);
    });
  }

  function initMenuPage() {
    const save = ensureSaveOrRedirect(); if (!save) return;
    const heroClass = getClassById(save.classId); const derived = getDerivedStats(save);
    document.getElementById("menuHeroAvatarWrap").innerHTML = heroArt(heroClass, true, "menuHeroAvatar");
    document.getElementById("menuHeroName").textContent = save.name;
    document.getElementById("menuHeroClass").textContent = `${save.className} • ${save.role}`;
    document.getElementById("menuHeroFloor").textContent = `Floor ปัจจุบัน ${save.currentFloor} • ปลดล็อกสูงสุด ${save.unlockedFloor}`;
    document.getElementById("menuElement").textContent = `${save.element} Lv${save.elementLevel} • ${save.affinity}`;
    document.getElementById("menuPassive").textContent = save.passive;
    document.getElementById("menuEquipment").innerHTML = equipmentHTML(save);
    document.getElementById("menuLevel").textContent = save.level;
    document.getElementById("menuHP").textContent = `${save.hp}/${derived.maxHp}`;
    document.getElementById("menuMP").textContent = `${save.mp}/${derived.maxMp}`;
    document.getElementById("menuGold").textContent = save.gold;
    document.getElementById("menuExp").textContent = `${save.exp}/${save.level * 80}`;
    document.getElementById("menuAtk").textContent = derived.atk;
    document.getElementById("menuDef").textContent = derived.def;
    document.getElementById("menuSpd").textContent = derived.spd;
    document.getElementById("menuSkills").innerHTML = skillListHTML(save.skills);
    document.getElementById("menuConsumables").textContent = consumableSummary(save);
    document.getElementById("healBtn").addEventListener("click", () => {
      save.hp = derived.maxHp; save.mp = derived.maxMp; setSave(save);
      document.getElementById("menuHP").textContent = `${save.hp}/${derived.maxHp}`;
      document.getElementById("menuMP").textContent = `${save.mp}/${derived.maxMp}`;
      document.getElementById("menuMessage").textContent = "พักที่แคมป์แล้ว HP / MP เต็ม";
    });
  }

  function renderInventoryPage() {
    const save = ensureSaveOrRedirect(); if (!save) return;
    const heroClass = getClassById(save.classId); const derived = getDerivedStats(save);
    const msg = document.getElementById("inventoryMessage");
    document.getElementById("inventoryHeroAvatarWrap").innerHTML = heroArt(heroClass, true, "inventoryHeroAvatar");
    document.getElementById("inventoryHeroName").textContent = save.name;
    document.getElementById("inventoryHeroClass").textContent = `${save.className} • ${save.role}`;
    document.getElementById("inventoryHeroStats").textContent = `HP ${save.hp}/${derived.maxHp} • MP ${save.mp}/${derived.maxMp} • ATK ${derived.atk} • DEF ${derived.def} • SPD ${derived.spd}`;
    const slots = document.getElementById("equipmentSlots");
    slots.innerHTML = ["weapon","armor","charm"].map(slot => {
      const item = getItem(save.equipment[slot]);
      return `<div class="slot-card"><span>${slot.toUpperCase()}</span><strong>${item ? `${item.icon} ${item.name}` : "Empty"}</strong><small>${item?.desc || "-"}</small></div>`;
    }).join("");
    const consumables = document.getElementById("consumableQuick");
    consumables.innerHTML = ["potion","ether","phoenixLeaf"].map(id => {
      const item = getItem(id); const qty = getInventoryQty(save,id);
      return `<button class="slot-card ${qty ? "usable" : "disabled"}" data-use="${id}" ${qty ? "" : "disabled"}><span>${item.icon} ${item.name}</span><strong>x${qty}</strong><small>${item.desc}</small></button>`;
    }).join("");
    consumables.querySelectorAll("[data-use]").forEach(btn => btn.addEventListener("click", () => {
      const id = btn.dataset.use; const item = getItem(id); if (!item || !consumeItemFromSave(save, id, 1)) return;
      if (item.effect?.heal) save.hp = Math.min(derived.maxHp, save.hp + item.effect.heal);
      if (item.effect?.mp) save.mp = Math.min(derived.maxMp, save.mp + item.effect.mp);
      setSave(save); msg.textContent = `ใช้ ${item.name} สำเร็จ`; renderInventoryPage();
    }));
    const grid = document.getElementById("inventoryGrid");
    grid.innerHTML = "";
    save.inventory.filter(entry => entry.qty > 0).forEach(entry => {
      const item = getItem(entry.id); if (!item) return;
      const card = document.createElement("div"); card.className = "inventory-card";
      const equipped = Object.values(save.equipment || {}).includes(item.id);
      const stats = item.bonuses ? Object.entries(item.bonuses).map(([k,v]) => `+${v} ${k.toUpperCase()}`).join(" • ") : item.desc;
      card.innerHTML = `<div class="inventory-card-top"><strong>${item.icon} ${item.name}</strong><span>x${entry.qty}</span></div><p class="small-note">${item.desc}</p><p class="small-note">${stats}</p><div class="inventory-actions"></div>`;
      const actions = card.querySelector(".inventory-actions");
      if (["weapon","armor","charm"].includes(item.slot)) {
        const btn = document.createElement("button"); btn.className = `btn ${equipped ? "btn-secondary" : "btn-primary"}`; btn.type = "button"; btn.textContent = equipped ? "Equipped" : `Equip ${item.slot}`;
        btn.disabled = equipped;
        btn.addEventListener("click", () => {
          save.equipment[item.slot] = item.id; if (!getInventoryQty(save,item.id)) addItemToSave(save,item.id,1); setSave(save); msg.textContent = `สวมใส่ ${item.name} แล้ว`; renderInventoryPage();
        });
        actions.appendChild(btn);
      } else if (item.type === "consumable") {
        const btn = document.createElement("button"); btn.className = "btn btn-secondary"; btn.type = "button"; btn.textContent = "Use";
        btn.addEventListener("click", () => {
          if (!consumeItemFromSave(save,item.id,1)) return;
          if (item.effect?.heal) save.hp = Math.min(derived.maxHp, save.hp + item.effect.heal);
          if (item.effect?.mp) save.mp = Math.min(derived.maxMp, save.mp + item.effect.mp);
          setSave(save); msg.textContent = `ใช้ ${item.name} สำเร็จ`; renderInventoryPage();
        });
        actions.appendChild(btn);
      }
      grid.appendChild(card);
    });
  }

  function initTowerPage() {
    const save = ensureSaveOrRedirect(); if (!save) return;
    const floorGrid = document.getElementById("floorGrid");
    document.getElementById("towerHeroName").textContent = save.name;
    document.getElementById("towerHeroInfo").textContent = `${save.className} • ${save.role}`;
    document.getElementById("unlockedFloor").textContent = save.unlockedFloor;
    document.getElementById("currentFloor").textContent = save.currentFloor;
    const zones = ["Azure Hall", "Ember Garden", "Storm Bridge", "Stone Vault", "Moon Chapel", "Shadow Library", "Poison Cellar", "Specter Wing", "Golden Bastion", "Crown Summit"];
    for (let floor = 1; floor <= 100; floor++) {
      const type = window.LayaTower.floorType(floor); const btn = document.createElement("button"); btn.type = "button"; btn.className = `floor-btn ${type}`;
      if (floor > save.unlockedFloor) btn.classList.add("locked"); btn.disabled = floor > save.unlockedFloor;
      const zone = zones[Math.floor((floor - 1) / 10)];
      btn.innerHTML = `<div class="floor-no">Floor ${floor}</div><div class="floor-type">${window.LayaTower.labelForType(type)}</div><div class="floor-zone">${zone}</div>`;
      btn.addEventListener("click", () => { setSelectedFloor(floor); location.href = "battle.html"; });
      floorGrid.appendChild(btn);
    }
  }

  function initBattlePage() {
    const save = ensureSaveOrRedirect(); if (!save) return;
    if (window.LayaBattle) window.LayaBattle.startBattle(save, getSelectedFloor(), setSave, getClassById, { ITEM_CATALOG, getDerivedStats, addItemToSave, consumeItemFromSave, getInventoryQty });
  }

  window.LayaGame = { getSave, setSave, clearSave, getSelectedFloor, setSelectedFloor, getClassById, getDerivedStats, getEquippedItems, getInventoryQty, addItemToSave, consumeItemFromSave, ITEM_CATALOG, initTitlePage, initCreateCharacterPage, initMenuPage, initInventoryPage: renderInventoryPage, initTowerPage, initBattlePage };
})();