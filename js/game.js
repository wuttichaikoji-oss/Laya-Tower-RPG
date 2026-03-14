
(function () {
  const STORAGE_KEYS = ["layaTowerRpgSaveV3", "layaTowerRpgSaveV2", "layaTowerRpgSaveV1"];
  const WRITE_KEY = "layaTowerRpgSaveV3";

  function getSave() {
    for (const key of STORAGE_KEYS) {
      const raw = localStorage.getItem(key);
      if (raw) {
        const save = JSON.parse(raw);
        if (key !== WRITE_KEY) setSave(migrateSave(save));
        return migrateSave(save);
      }
    }
    return null;
  }

  function migrateSave(save) {
    const heroClass = HERO_CLASSES.find(c => c.id === save.classId) || HERO_CLASSES[0];
    return {
      version: 3,
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
      skills: heroClass.skills
    };
  }

  function setSave(data) {
    const normalized = migrateSave(data);
    localStorage.setItem(WRITE_KEY, JSON.stringify(normalized));
    localStorage.removeItem("layaTowerRpgSaveV2");
    localStorage.removeItem("layaTowerRpgSaveV1");
  }

  function clearSave() {
    STORAGE_KEYS.forEach(k => localStorage.removeItem(k));
  }

  function getSelectedFloor() { return Number(sessionStorage.getItem("layaSelectedFloor") || 1); }
  function setSelectedFloor(floor) { sessionStorage.setItem("layaSelectedFloor", String(floor)); }
  function getClassById(id) { return HERO_CLASSES.find(item => item.id === id); }
  function ensureSaveOrRedirect() {
    const save = getSave();
    if (!save) { location.href = "index.html"; return null; }
    return save;
  }

  function heroArt(heroClass, large = false, id = "") {
    return `<div ${id ? `id="${id}"` : ""} class="hero-avatar ${large ? "large-avatar" : ""}" style="background-image:url('${heroClass.sprite}');"></div>`;
  }

  function skillListHTML(skills) {
    return skills.map(skill => `<li>${skill.icon} <strong>${skill.name}</strong> <span class="muted">— ${skill.note}</span></li>`).join("");
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
      previewWrap.innerHTML = heroArt(heroClass, true, "previewAvatar");
      previewClassName.textContent = heroClass.name;
      previewRole.textContent = `${heroClass.role} • ${heroClass.description}`;
      previewBio.textContent = heroClass.bio;
      previewPassive.textContent = heroClass.passive;
      affinity.textContent = `${heroClass.affinity} • ${heroClass.element} Lv${heroClass.level}`;
      statHp.textContent = heroClass.stats.hp;
      statMp.textContent = heroClass.stats.mp;
      statAtk.textContent = heroClass.stats.atk;
      statDef.textContent = heroClass.stats.def;
      statSpd.textContent = heroClass.stats.spd;
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
        element: selectedClass.element, elementLevel: selectedClass.level, affinity: selectedClass.affinity, skills: selectedClass.skills
      });
      setSave(save);
      msg.textContent = "สร้างฮีโร่สำเร็จ กำลังเข้าสู่เมนูเกม...";
      setTimeout(() => location.href = "menu.html", 600);
    });
  }

  function initMenuPage() {
    const save = ensureSaveOrRedirect();
    if (!save) return;
    const heroClass = getClassById(save.classId);
    document.getElementById("menuHeroAvatarWrap").innerHTML = heroArt(heroClass, true, "menuHeroAvatar");
    document.getElementById("menuHeroName").textContent = save.name;
    document.getElementById("menuHeroClass").textContent = `${save.className} • ${save.role}`;
    document.getElementById("menuHeroFloor").textContent = `Floor ปัจจุบัน ${save.currentFloor} • ปลดล็อกสูงสุด ${save.unlockedFloor}`;
    document.getElementById("menuElement").textContent = `${save.element} Lv${save.elementLevel} • ${save.affinity}`;
    document.getElementById("menuPassive").textContent = save.passive;
    document.getElementById("menuLevel").textContent = save.level;
    document.getElementById("menuHP").textContent = `${save.hp}/${save.maxHp}`;
    document.getElementById("menuMP").textContent = `${save.mp}/${save.maxMp}`;
    document.getElementById("menuGold").textContent = save.gold;
    document.getElementById("menuExp").textContent = `${save.exp}/${save.level * 80}`;
    document.getElementById("menuAtk").textContent = save.atk;
    document.getElementById("menuDef").textContent = save.def;
    document.getElementById("menuSpd").textContent = save.spd;
    document.getElementById("menuSkills").innerHTML = skillListHTML(save.skills);

    document.getElementById("healBtn").addEventListener("click", () => {
      save.hp = save.maxHp; save.mp = save.maxMp; setSave(save);
      document.getElementById("menuHP").textContent = `${save.hp}/${save.maxHp}`;
      document.getElementById("menuMP").textContent = `${save.mp}/${save.maxMp}`;
      document.getElementById("menuMessage").textContent = "พักที่แคมป์แล้ว HP / MP เต็ม";
    });
  }

  function initTowerPage() {
    const save = ensureSaveOrRedirect();
    if (!save) return;
    const floorGrid = document.getElementById("floorGrid");
    document.getElementById("towerHeroName").textContent = save.name;
    document.getElementById("towerHeroInfo").textContent = `${save.className} • ${save.role}`;
    document.getElementById("unlockedFloor").textContent = save.unlockedFloor;
    document.getElementById("currentFloor").textContent = save.currentFloor;
    const zones = ["Azure Hall", "Ember Garden", "Storm Bridge", "Stone Vault", "Moon Chapel", "Shadow Library", "Poison Cellar", "Specter Wing", "Golden Bastion", "Crown Summit"];
    for (let floor = 1; floor <= 100; floor++) {
      const type = window.LayaTower.floorType(floor);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `floor-btn ${type}`;
      if (floor > save.unlockedFloor) btn.classList.add("locked");
      btn.disabled = floor > save.unlockedFloor;
      const zone = zones[Math.floor((floor - 1) / 10)];
      btn.innerHTML = `<div class="floor-no">Floor ${floor}</div><div class="floor-type">${window.LayaTower.labelForType(type)}</div><div class="floor-zone">${zone}</div>`;
      btn.addEventListener("click", () => {
        setSelectedFloor(floor);
        location.href = "battle.html";
      });
      floorGrid.appendChild(btn);
    }
  }

  function initBattlePage() {
    const save = ensureSaveOrRedirect();
    if (!save) return;
    if (window.LayaBattle) window.LayaBattle.startBattle(save, getSelectedFloor(), setSave, getClassById);
  }

  window.LayaGame = { getSave, setSave, clearSave, getSelectedFloor, setSelectedFloor, getClassById, initTitlePage, initCreateCharacterPage, initMenuPage, initTowerPage, initBattlePage };
})();
