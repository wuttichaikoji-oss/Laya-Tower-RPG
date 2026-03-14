
(function () {
  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const enemyPool = [
    { name: "Slime Pudding", body: "linear-gradient(180deg,#75d6ff,#266486)", element: "Water" },
    { name: "Ember Wolf", body: "linear-gradient(180deg,#ff936a,#792c26)", element: "Fire" },
    { name: "Root Golem", body: "linear-gradient(180deg,#c0a472,#544127)", element: "Earth" },
    { name: "Night Bat", body: "linear-gradient(180deg,#c78cff,#4d246c)", element: "Shadow" },
    { name: "Venom Bloom", body: "linear-gradient(180deg,#7ee58f,#26653e)", element: "Poison" },
    { name: "Wind Sprout", body: "linear-gradient(180deg,#9cf4ff,#318294)", element: "Wind" }
  ];

  const miniBosses = [
    { name: "Abyss Keeper", body: "linear-gradient(180deg,#ff8fb7,#7f2b5a)", element: "Shadow" },
    { name: "Coral Sentinel", body: "linear-gradient(180deg,#84d8ff,#2d4d7a)", element: "Water" },
    { name: "Mire Basilisk", body: "linear-gradient(180deg,#9de07f,#476228)", element: "Poison" }
  ];

  const bosses = [
    { name: "Tower Warden", body: "linear-gradient(180deg,#ffd585,#7a5221)", element: "Holy" },
    { name: "Infernal Archivist", body: "linear-gradient(180deg,#ff7c72,#6f221f)", element: "Fire" },
    { name: "Phantom Queen", body: "linear-gradient(180deg,#c89cff,#4b2f80)", element: "Ghost" }
  ];

  let state = null;
  let saveFn = null;
  let classResolver = null;
  let actionLocked = false;

  function pickEnemy(floor) {
    const type = floor % 10 === 0 ? "boss" : floor % 5 === 0 ? "mini" : "normal";
    const base = type === "boss" ? bosses[floor % bosses.length] : type === "mini" ? miniBosses[floor % miniBosses.length] : enemyPool[floor % enemyPool.length];
    const scale = 1 + floor * (type === "boss" ? 0.22 : type === "mini" ? 0.16 : 0.1);
    return {
      type,
      floor,
      name: base.name,
      maxHp: Math.round(110 * scale + (type === "boss" ? 180 : type === "mini" ? 80 : 0)),
      hp: Math.round(110 * scale + (type === "boss" ? 180 : type === "mini" ? 80 : 0)),
      atk: Math.round(16 * scale + (type === "boss" ? 10 : 0)),
      def: Math.round(8 * scale + (type === "boss" ? 6 : 0)),
      body: base.body,
      element: base.element,
      elementLevel: Math.min(4, 1 + Math.floor(floor / 25))
    };
  }

  function updateBars() {
    const { hero, enemy } = state;
    document.getElementById("heroHpBar").style.width = `${Math.max(0, (hero.hp / hero.maxHp) * 100)}%`;
    document.getElementById("heroMpBar").style.width = `${Math.max(0, (hero.mp / hero.maxMp) * 100)}%`;
    document.getElementById("enemyHpBar").style.width = `${Math.max(0, (enemy.hp / enemy.maxHp) * 100)}%`;
    document.getElementById("heroHpText").textContent = `${Math.max(0, hero.hp)} / ${hero.maxHp}`;
    document.getElementById("heroMpText").textContent = `${Math.max(0, hero.mp)} / ${hero.maxMp}`;
    document.getElementById("enemyHpText").textContent = `${Math.max(0, enemy.hp)} / ${enemy.maxHp}`;
  }

  function addLog(text) {
    const wrap = document.getElementById("battleLog");
    const line = document.createElement("div");
    line.className = "log-line";
    line.textContent = text;
    wrap.prepend(line);
  }

  function showCenter(text) {
    document.getElementById("battleCenterText").textContent = text;
  }

  function popup(targetId, amount, type) {
    const el = document.getElementById(targetId);
    const div = document.createElement("div");
    div.className = `damage-popup ${type || ""}`;
    div.textContent = type === "heal" ? `+${amount}` : `-${amount}`;
    el.appendChild(div);
    setTimeout(() => div.remove(), 900);
  }

  function animateAttack(attackerId, defenderId) {
    const attacker = document.getElementById(attackerId);
    const defender = document.getElementById(defenderId);
    attacker.classList.add("attack-lunge");
    setTimeout(() => {
      attacker.classList.remove("attack-lunge");
      defender.classList.add("hit-shake");
      setTimeout(() => defender.classList.remove("hit-shake"), 300);
    }, 220);
  }

  function calcDamage(attacker, defender, power = 1, critBonus = 0) {
    const base = Math.max(1, Math.round((attacker.atk * power) - defender.def * 0.55 + rand(0, 6)));
    const mult = window.ElementROC ? window.ElementROC.getMultiplier(attacker.element, defender.element, attacker.elementLevel || 1, defender.elementLevel || 1) : 1;
    const crit = Math.random() < (0.12 + critBonus);
    const total = Math.max(0, Math.round(base * mult * (crit ? 1.55 : 1)));
    const label = mult === 0 ? "No Effect" : mult > 1 ? (crit ? "Critical Weak!" : "Weak!") : crit ? "Critical!" : "Hit";
    return { total, mult, crit, label };
  }

  function renderSkillPanel() {
    const panel = document.getElementById("skillPanel");
    panel.innerHTML = "";
    state.hero.skills.forEach(skill => {
      const btn = document.createElement("button");
      btn.className = "skill-option";
      btn.type = "button";
      btn.innerHTML = `<strong>${skill.name}</strong><br><small>MP ${skill.mpCost} • ${skill.note}</small>`;
      btn.addEventListener("click", () => useSkill(skill));
      panel.appendChild(btn);
    });
  }

  function lockActions(flag) {
    actionLocked = flag;
    ["attackBtn","skillBtn","defendBtn","itemBtn"].forEach(id => {
      document.getElementById(id).disabled = flag;
    });
    document.querySelectorAll(".skill-option").forEach(btn => btn.disabled = flag);
  }

  function endBattle(win) {
    lockActions(true);
    const save = window.LayaGame.getSave();
    if (!save) return;

    if (win) {
      const rewardGold = 20 + state.floor * 4 + (state.enemy.type === "boss" ? 80 : state.enemy.type === "mini" ? 35 : 0);
      save.gold += rewardGold;
      save.exp += 15 + state.floor * 3;
      save.currentFloor = state.floor;
      save.unlockedFloor = Math.min(100, Math.max(save.unlockedFloor, state.floor + 1));
      save.hp = Math.max(1, state.hero.hp);
      save.mp = Math.max(0, state.hero.mp);

      const nextLevelThreshold = save.level * 80;
      if (save.exp >= nextLevelThreshold) {
        save.level += 1;
        save.maxHp += 18;
        save.maxMp += 8;
        save.atk += 4;
        save.def += 2;
        save.hp = save.maxHp;
        save.mp = save.maxMp;
        addLog(`${save.name} เลเวลอัปเป็น ${save.level}!`);
      }

      saveFn(save);
      showCenter(`Victory • +${rewardGold} Gold`);
      addLog(`ชนะการต่อสู้ ได้รับ ${rewardGold} Gold`);
    } else {
      save.hp = save.maxHp;
      save.mp = save.maxMp;
      saveFn(save);
      showCenter("Defeat...");
      addLog("แพ้การต่อสู้ ระบบพากลับแคมป์และฟื้นพลังเต็ม");
    }

    setTimeout(() => {
      location.href = "menu.html";
    }, 1800);
  }

  function enemyTurn() {
    if (state.enemy.hp <= 0 || state.hero.hp <= 0) return;
    lockActions(true);
    showCenter("Enemy Turn");
    setTimeout(() => {
      const result = calcDamage(state.enemy, state.hero, 1);
      animateAttack("enemySprite", "heroSprite");
      state.hero.hp -= result.total;
      popup("heroSprite", result.total, result.crit ? "critical" : result.mult > 1 ? "weak" : "");
      addLog(`${state.enemy.name} โจมตี ${state.hero.name} ${result.total} ดาเมจ (${result.label})`);
      updateBars();

      if (state.hero.hp <= 0) {
        state.hero.hp = 0;
        updateBars();
        endBattle(false);
        return;
      }

      showCenter("Your Turn");
      lockActions(false);
    }, 540);
  }

  function basicAttack() {
    if (actionLocked) return;
    lockActions(true);
    const result = calcDamage(state.hero, state.enemy, 1.1, state.hero.classId === "striker" ? 0.08 : 0);
    animateAttack("heroSprite", "enemySprite");
    state.enemy.hp -= result.total;
    popup("enemySprite", result.total, result.crit ? "critical" : result.mult > 1 ? "weak" : "");
    addLog(`${state.hero.name} ใช้การโจมตีปกติใส่ ${state.enemy.name} ${result.total} ดาเมจ (${result.label})`);
    updateBars();
    if (state.enemy.hp <= 0) {
      state.enemy.hp = 0;
      updateBars();
      endBattle(true);
      return;
    }
    setTimeout(enemyTurn, 650);
  }

  function useSkill(skill) {
    if (actionLocked) return;
    if (state.hero.mp < skill.mpCost) {
      addLog("MP ไม่พอใช้สกิลนี้");
      return;
    }
    state.hero.mp -= skill.mpCost;
    updateBars();
    lockActions(true);

    if (skill.type === "heal") {
      const healAmount = Math.round(state.hero.maxHp * skill.healRatio);
      state.hero.hp = Math.min(state.hero.maxHp, state.hero.hp + healAmount);
      popup("heroSprite", healAmount, "heal");
      addLog(`${state.hero.name} ใช้ ${skill.name} ฟื้น HP ${healAmount}`);
      updateBars();
      setTimeout(enemyTurn, 650);
      return;
    }

    if (skill.type === "buff") {
      state.hero.tempDefBuff = Math.round(state.hero.def * (skill.defendBoost || 0.3));
      addLog(`${state.hero.name} ใช้ ${skill.name} เพิ่มพลังป้องกันชั่วคราว`);
      showCenter(skill.name);
      setTimeout(enemyTurn, 650);
      return;
    }

    let critBonus = 0;
    if (skill.id === "crimsonDrive") critBonus = 0.18;
    const result = calcDamage(state.hero, state.enemy, skill.power || 1.4, critBonus);
    if (skill.id === "acidMix") state.enemy.def = Math.max(0, state.enemy.def - 3);
    animateAttack("heroSprite", "enemySprite");
    state.enemy.hp -= result.total;
    popup("enemySprite", result.total, result.crit ? "critical" : result.mult > 1 ? "weak" : "");
    addLog(`${state.hero.name} ใช้ ${skill.name} ใส่ ${state.enemy.name} ${result.total} ดาเมจ (${result.label})`);
    updateBars();
    if (state.enemy.hp <= 0) {
      state.enemy.hp = 0;
      updateBars();
      endBattle(true);
      return;
    }
    setTimeout(enemyTurn, 700);
  }

  function defend() {
    if (actionLocked) return;
    state.hero.tempDefBuff = Math.round(state.hero.def * 0.5);
    addLog(`${state.hero.name} ตั้งการ์ด ลดดาเมจรอบถัดไป`);
    lockActions(true);
    setTimeout(enemyTurn, 450);
  }

  function usePotion() {
    if (actionLocked) return;
    const healAmount = 35;
    state.hero.hp = Math.min(state.hero.maxHp, state.hero.hp + healAmount);
    popup("heroSprite", healAmount, "heal");
    addLog(`${state.hero.name} ใช้ Potion ฟื้น HP ${healAmount}`);
    updateBars();
    lockActions(true);
    setTimeout(enemyTurn, 450);
  }

  function decorateSprites(heroClass, enemy) {
    const hero = document.getElementById("heroSprite");
    const enemySprite = document.getElementById("enemySprite");
    hero.style.setProperty("--sprite-body", heroClass.cloak);
    enemySprite.style.setProperty("--sprite-body", enemy.body);
  }

  function startBattle(save, floor, setSaveFunc, getClassById) {
    saveFn = setSaveFunc;
    classResolver = getClassById;
    const heroClass = getClassById(save.classId);
    const enemy = pickEnemy(floor);
    state = {
      floor,
      hero: {
        ...save,
        classId: save.classId,
        skills: heroClass.skills.slice(),
        tempDefBuff: 0
      },
      enemy
    };

    document.getElementById("battleFloorTitle").textContent = `Floor ${floor}`;
    document.getElementById("heroBattleName").textContent = save.name;
    document.getElementById("enemyName").textContent = enemy.name;
    document.getElementById("heroElementBadge").textContent = `${save.element} Lv${save.elementLevel}`;
    document.getElementById("enemyElementBadge").textContent = `${enemy.element} Lv${enemy.elementLevel}`;
    decorateSprites(heroClass, enemy);
    renderSkillPanel();
    updateBars();
    addLog(`${save.name} เข้าสู่ชั้น ${floor}`);
    addLog(`พบศัตรู ${enemy.name} (${enemy.type.toUpperCase()})`);
    showCenter("Your Turn");

    document.getElementById("attackBtn").addEventListener("click", basicAttack);
    document.getElementById("skillBtn").addEventListener("click", () => {
      document.getElementById("skillPanel").classList.toggle("hidden");
    });
    document.getElementById("defendBtn").addEventListener("click", defend);
    document.getElementById("itemBtn").addEventListener("click", usePotion);

    const baseEnemyTurn = enemyTurn;
    enemyTurn = function () {
      const originalDef = state.hero.def;
      if (state.hero.tempDefBuff) state.hero.def += state.hero.tempDefBuff;
      baseEnemyTurn();
      setTimeout(() => {
        state.hero.def = originalDef;
        state.hero.tempDefBuff = 0;
      }, 100);
    };
  }

  window.LayaBattle = { startBattle };
})();
