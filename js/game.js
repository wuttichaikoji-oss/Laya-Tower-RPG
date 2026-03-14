
(function () {
  const STORAGE_KEY = "layaTowerRpgSaveV1";

  function getSave() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  function setSave(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function clearSave() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function getSelectedFloor() {
    return Number(sessionStorage.getItem("layaSelectedFloor") || 1);
  }

  function setSelectedFloor(floor) {
    sessionStorage.setItem("layaSelectedFloor", String(floor));
  }

  function makeAvatarHTML(heroClass, large = false) {
    return `<div class="hero-avatar ${large ? "large-avatar" : ""}" style="--avatar-color:${heroClass.color};--avatar-cloak:${heroClass.cloak};"></div>`;
  }

  function ensureSaveOrRedirect() {
    const save = getSave();
    if (!save) {
      location.href = "index.html";
      return null;
    }
    return save;
  }

  function initTitlePage() {
    const continueBtn = document.getElementById("continueBtn");
    const startGameBtn = document.getElementById("startGameBtn");
    const resetBtn = document.getElementById("resetBtn");
    const saveStatus = document.getElementById("saveStatus");
    const save = getSave();

    if (save) {
      continueBtn.classList.remove("hidden");
      continueBtn.style.display = "inline-flex";
      startGameBtn.textContent = "New Hero";
      saveStatus.textContent = `พบเซฟของ ${save.name} (${save.className}) - Floor ${save.currentFloor}`;
    } else {
      continueBtn.style.display = "none";
      saveStatus.textContent = "ยังไม่มีตัวละคร เริ่มสร้างฮีโร่ได้ทันที";
    }

    resetBtn.addEventListener("click", () => {
      clearSave();
      saveStatus.textContent = "ลบตัวละครแล้ว";
      continueBtn.style.display = "none";
      startGameBtn.textContent = "Start Game";
    });
  }

  function initCreateCharacterPage() {
    const grid = document.getElementById("classGrid");
    const previewAvatar = document.getElementById("previewAvatar");
    const previewClassName = document.getElementById("previewClassName");
    const previewRole = document.getElementById("previewRole");
    const previewSkills = document.getElementById("previewSkills");
    const statHp = document.getElementById("statHp");
    const statMp = document.getElementById("statMp");
    const statAtk = document.getElementById("statAtk");
    const statDef = document.getElementById("statDef");
    const createBtn = document.getElementById("createHeroBtn");
    const heroNameInput = document.getElementById("heroName");
    const msg = document.getElementById("createMessage");

    let selectedClass = null;

    HERO_CLASSES.forEach(heroClass => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "class-card";
      card.innerHTML = `
        ${makeAvatarHTML(heroClass)}
        <div>
          <h3>${heroClass.name}</h3>
          <p>${heroClass.role}</p>
          <p>${heroClass.description}</p>
          <div class="class-tags">
            ${heroClass.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}
          </div>
        </div>
      `;
      card.addEventListener("click", () => {
        document.querySelectorAll(".class-card").forEach(el => el.classList.remove("selected"));
        card.classList.add("selected");
        selectedClass = heroClass;
        renderPreview(heroClass);
      });
      grid.appendChild(card);
    });

    function renderPreview(heroClass) {
      previewAvatar.outerHTML = makeAvatarHTML(heroClass, true).replace('class="hero-avatar large-avatar"', 'id="previewAvatar" class="hero-avatar large-avatar"');
      previewClassName.textContent = heroClass.name;
      previewRole.textContent = `${heroClass.role} • ${heroClass.description}`;
      statHp.textContent = heroClass.stats.hp;
      statMp.textContent = heroClass.stats.mp;
      statAtk.textContent = heroClass.stats.atk;
      statDef.textContent = heroClass.stats.def;
      previewSkills.innerHTML = heroClass.skills.map(skill => `<li>${skill.name} — ${skill.note}</li>`).join("");
    }

    createBtn.addEventListener("click", () => {
      const heroName = heroNameInput.value.trim();
      if (!heroName) {
        msg.textContent = "กรุณาใส่ชื่อตัวละคร";
        return;
      }
      if (!selectedClass) {
        msg.textContent = "กรุณาเลือกอาชีพ";
        return;
      }

      const save = {
        name: heroName,
        classId: selectedClass.id,
        className: selectedClass.name,
        role: selectedClass.role,
        currentFloor: 1,
        unlockedFloor: 1,
        gold: 120,
        level: 1,
        exp: 0,
        hp: selectedClass.stats.hp,
        mp: selectedClass.stats.mp,
        maxHp: selectedClass.stats.hp,
        maxMp: selectedClass.stats.mp,
        atk: selectedClass.stats.atk,
        def: selectedClass.stats.def,
        element: selectedClass.element,
        elementLevel: selectedClass.level,
        skills: selectedClass.skills
      };
      setSave(save);
      msg.textContent = "สร้างฮีโร่สำเร็จ กำลังเข้าสู่เมนูเกม...";
      setTimeout(() => location.href = "menu.html", 700);
    });
  }

  function initMenuPage() {
    const save = ensureSaveOrRedirect();
    if (!save) return;

    document.getElementById("menuHeroAvatar").outerHTML = makeAvatarHTML(getClassById(save.classId), true).replace('class="hero-avatar large-avatar"', 'id="menuHeroAvatar" class="hero-avatar large-avatar"');
    document.getElementById("menuHeroName").textContent = save.name;
    document.getElementById("menuHeroClass").textContent = `${save.className} • ${save.role}`;
    document.getElementById("menuHeroFloor").textContent = `Floor ปัจจุบัน ${save.currentFloor} | ปลดล็อกสูงสุด ${save.unlockedFloor}`;
    document.getElementById("menuLevel").textContent = save.level;
    document.getElementById("menuHP").textContent = `${save.hp}/${save.maxHp}`;
    document.getElementById("menuMP").textContent = `${save.mp}/${save.maxMp}`;
    document.getElementById("menuGold").textContent = save.gold;

    document.getElementById("healBtn").addEventListener("click", () => {
      save.hp = save.maxHp;
      save.mp = save.maxMp;
      setSave(save);
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

    for (let floor = 1; floor <= 100; floor++) {
      const btn = document.createElement("button");
      btn.type = "button";
      const stateClass = floor % 10 === 0 ? "boss" : floor % 5 === 0 ? "mini" : "normal";
      btn.className = `floor-btn ${stateClass}`;
      if (floor > save.unlockedFloor) btn.classList.add("locked");
      btn.innerHTML = `<span>Floor ${floor}</span>`;
      btn.disabled = floor > save.unlockedFloor;
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
    if (window.LayaBattle) {
      window.LayaBattle.startBattle(save, getSelectedFloor(), setSave, getClassById);
    }
  }

  function getClassById(id) {
    return HERO_CLASSES.find(item => item.id === id);
  }

  window.LayaGame = {
    getSave,
    setSave,
    clearSave,
    getSelectedFloor,
    setSelectedFloor,
    getClassById,
    initTitlePage,
    initCreateCharacterPage,
    initMenuPage,
    initTowerPage,
    initBattlePage
  };
})();
