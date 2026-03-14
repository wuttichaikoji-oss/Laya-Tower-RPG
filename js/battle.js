(function () {
  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  const enemyPool = [
    { id:"slime", name:"Slime Pudding", sprite:"assets/sprites/slime.svg", element:"Water", kind:"normal" },
    { id:"wolf", name:"Ember Wolf", sprite:"assets/sprites/wolf.svg", element:"Fire", kind:"normal" },
    { id:"golem", name:"Root Golem", sprite:"assets/sprites/golem.svg", element:"Earth", kind:"normal" },
    { id:"bat", name:"Night Bat", sprite:"assets/sprites/bat.svg", element:"Shadow", kind:"normal" },
    { id:"bloom", name:"Venom Bloom", sprite:"assets/sprites/bloom.svg", element:"Poison", kind:"normal" },
    { id:"spirit", name:"Wind Spirit", sprite:"assets/sprites/spirit.svg", element:"Wind", kind:"normal" }
  ];
  const miniBosses = [
    { id:"wolf", name:"Abyss Fang", sprite:"assets/sprites/wolf.svg", element:"Shadow", kind:"mini", special:"Night Rend" },
    { id:"bloom", name:"Mire Basilisk Bloom", sprite:"assets/sprites/bloom.svg", element:"Poison", kind:"mini", special:"Venom Burst" },
    { id:"golem", name:"Coral Sentinel", sprite:"assets/sprites/golem.svg", element:"Water", kind:"mini", special:"Tidal Crush" }
  ];
  const bosses = [
    { id:"warden", name:"Tower Warden", sprite:"assets/sprites/warden.svg", element:"Holy", kind:"boss", special:"Judgement Ray" },
    { id:"warden", name:"Infernal Archivist", sprite:"assets/sprites/warden.svg", element:"Fire", kind:"boss", special:"Inferno Script" },
    { id:"warden", name:"Phantom Queen", sprite:"assets/sprites/warden.svg", element:"Ghost", kind:"boss", special:"Soul Eclipse" },
    { id:"warden", name:"Storm Regent", sprite:"assets/sprites/warden.svg", element:"Wind", kind:"boss", special:"Sky Rupture" }
  ];

  let state = null;
  let saveFn = null;
  let actionLocked = false;
  let helpers = null;

  function pickEnemy(floor) {
    const type = floor % 10 === 0 ? "boss" : floor % 5 === 0 ? "mini" : "normal";
    const source = type === "boss" ? bosses : type === "mini" ? miniBosses : enemyPool;
    const base = source[(floor - 1) % source.length];
    const scale = 1 + floor * (type === "boss" ? 0.24 : type === "mini" ? 0.16 : 0.105);
    return {
      type, floor, id: base.id, name: base.name, sprite: base.sprite, element: base.element, special: base.special || "Heavy Strike",
      elementLevel: Math.min(4, 1 + Math.floor(floor / 25)),
      maxHp: Math.round((type === "boss" ? 215 : type === "mini" ? 152 : 110) * scale),
      hp: Math.round((type === "boss" ? 215 : type === "mini" ? 152 : 110) * scale),
      atk: Math.round((type === "boss" ? 24 : type === "mini" ? 18 : 13) * scale),
      def: Math.round((type === "boss" ? 13 : type === "mini" ? 9 : 6) * scale),
      statuses: [], enrage: false, intent: null, usedUltimate:false
    };
  }

  function updateBars() {
    const h = state.hero, e = state.enemy;
    setWidth("heroHpBar", h.hp / h.maxHp); setWidth("heroMpBar", h.mp / h.maxMp); setWidth("enemyHpBar", e.hp / e.maxHp);
    text("heroHpText", `${Math.max(0, h.hp)} / ${h.maxHp}`); text("heroMpText", `${Math.max(0, h.mp)} / ${h.maxMp}`); text("enemyHpText", `${Math.max(0, e.hp)} / ${e.maxHp}`);
    text("heroItemText", `Potion x${helpers.getInventoryQty(state.baseSave,"potion")} • Ether x${helpers.getInventoryQty(state.baseSave,"ether")}`);
  }
  function setWidth(id, ratio) { document.getElementById(id).style.width = `${Math.max(0, Math.min(1, ratio)) * 100}%`; }
  function text(id, value) { const el = document.getElementById(id); if (el) el.textContent = value; }
  function setTimeline(turn) { document.querySelectorAll(".timeline .token").forEach(el => el.classList.remove("active")); document.getElementById(turn === "hero" ? "timelineHero" : "timelineEnemy").classList.add("active"); }
  function renderStatuses() { document.getElementById("heroStatusRow").innerHTML = state.hero.statuses.map(statusPill).join("") || `<span class="status-pill neutral">No Status</span>`; document.getElementById("enemyStatusRow").innerHTML = state.enemy.statuses.map(statusPill).join("") || `<span class="status-pill neutral">No Status</span>`; }
  function statusPill(s) { const map={shield:"Shield",regen:"Regen",poison:"Poison",burn:"Burn",exposed:"Exposed",arcaneBreak:"Arcane Break",corrode:"Corrode",slow:"Slow",focus:"Focus"}; const cls=["shield","regen","focus"].includes(s.name)?"good":["poison","burn","exposed","arcaneBreak","corrode","slow"].includes(s.name)?"bad":"neutral"; return `<span class="status-pill ${cls}">${map[s.name]||s.name} ${s.turns}</span>`; }
  function addLog(textValue) { const log = document.getElementById("battleLog"); const line = document.createElement("div"); line.className = "log-line"; line.textContent = textValue; log.prepend(line); }
  function showCenter(textValue) { document.getElementById("battleCenterText").textContent = textValue; }
  function popup(targetId, amount, flavor = "") { const target = document.getElementById(targetId); const pop = document.createElement("div"); pop.className = `damage-popup ${flavor}`; pop.textContent = flavor === "heal" ? `+${amount}` : `-${amount}`; target.appendChild(pop); setTimeout(() => pop.remove(), 1000); }
  function ringFx(targetId, kind = "") { const target = document.getElementById(targetId); const ring = document.createElement("div"); ring.className = `fx-ring ${kind}`; target.appendChild(ring); setTimeout(() => ring.remove(), 520); }
  function animateAttack(attackerId, defenderId) { const attacker = document.getElementById(attackerId); const defender = document.getElementById(defenderId); attacker.classList.add("attack-lunge"); setTimeout(() => defender.classList.add("hit-shake"), 180); setTimeout(() => { attacker.classList.remove("attack-lunge"); defender.classList.remove("hit-shake"); }, 360); }
  function applyStatus(target, status) { if (!status) return; const found = target.statuses.find(s => s.name === status.name); if (found) Object.assign(found, status); else target.statuses.push({ ...status }); }

  function tickStatusPhase(unit, targetId, unitLabel) {
    let msg = [];
    unit.statuses.forEach(status => {
      if (status.name === "poison") { const dmg = status.power || 8; unit.hp -= dmg; popup(targetId, dmg, "weak"); ringFx(targetId, "poison"); msg.push(`${unitLabel} ถูก Poison ${dmg}`); }
      if (status.name === "burn") { const dmg = status.power || 7; unit.hp -= dmg; popup(targetId, dmg, "critical"); ringFx(targetId, "fire"); msg.push(`${unitLabel} ถูก Burn ${dmg}`); }
      if (status.name === "regen") { const heal = status.power || 10; unit.hp = Math.min(unit.maxHp, unit.hp + heal); popup(targetId, heal, "heal"); ringFx(targetId, "heal"); msg.push(`${unitLabel} ฟื้นจาก Regen ${heal}`); }
      status.turns -= 1;
    });
    unit.statuses = unit.statuses.filter(s => s.turns > 0);
    if (msg.length) addLog(msg.join(" • "));
  }
  function activeAmp(defender) { let amp = 0; defender.statuses.forEach(s => { if (s.name === "exposed") amp += s.amp || 0.18; if (s.name === "arcaneBreak") amp += s.amp || 0.18; if (s.name === "slow") amp += s.amp || 0.1; }); return amp; }
  function shieldReduction(defender) { let reduce = 0; defender.statuses.forEach(s => { if (s.name === "shield") reduce = Math.max(reduce, s.reduce || 0.22); }); return reduce; }
  function corrodePenalty(defender) { let shred = 0; defender.statuses.forEach(s => { if (s.name === "corrode") shred += s.shred || 3; }); return shred; }

  function calcDamage(attacker, defender, power = 1, critBonus = 0) {
    const effectiveDef = Math.max(0, defender.def - corrodePenalty(defender));
    const base = Math.max(1, Math.round((attacker.atk * power) - effectiveDef * 0.55 + rand(0, 6)));
    const mult = window.ElementROC ? window.ElementROC.getMultiplier(attacker.element, defender.element, attacker.elementLevel || 1, defender.elementLevel || 1) : 1;
    const focusBonus = attacker.statuses?.find(s => s.name === "focus") ? 0.12 : 0;
    const crit = Math.random() < (0.12 + critBonus + focusBonus);
    const amplified = 1 + activeAmp(defender);
    const shielded = 1 - shieldReduction(defender);
    const total = Math.max(0, Math.round(base * mult * amplified * shielded * (crit ? 1.55 : 1)));
    const label = mult === 0 ? "No Effect" : mult > 1 ? (crit ? "Critical Weak!" : "Weak!") : crit ? "Critical!" : "Hit";
    return { total, mult, crit, label };
  }

  function renderSkillPanel() {
    const panel = document.getElementById("skillPanel"); panel.innerHTML = "";
    state.hero.skills.forEach(skill => {
      const btn = document.createElement("button"); btn.className = "skill-option"; btn.type = "button";
      btn.innerHTML = `<strong>${skill.icon} ${skill.name}</strong><br><small>MP ${skill.mpCost} • ${skill.note}</small>`;
      btn.addEventListener("click", () => useSkill(skill)); panel.appendChild(btn);
    });
  }
  function lockActions(flag) { actionLocked = flag; ["attackBtn","skillBtn","defendBtn","itemBtn"].forEach(id => document.getElementById(id).disabled = flag); document.querySelectorAll(".skill-option").forEach(btn => btn.disabled = flag); }

  function planEnemyIntent() {
    const enemy = state.enemy;
    if (enemy.type === "boss" && enemy.hp < enemy.maxHp * 0.45 && !enemy.usedUltimate) {
      enemy.intent = { type:"ultimate", label: enemy.special };
      return updateIntentText();
    }
    if (enemy.type === "boss" && enemy.hp < enemy.maxHp * 0.5 && !enemy.enrage) {
      enemy.intent = { type:"enrage", label:"Enrage: ATK Up" };
      return updateIntentText();
    }
    const roll = Math.random();
    if (roll < 0.16 && !enemy.statuses.find(s => s.name === "shield")) enemy.intent = { type:"guard", label:"Guard: ลดดาเมจ" };
    else if (roll < (enemy.type === "normal" ? 0.46 : 0.68)) enemy.intent = { type:"special", label: enemy.special };
    else enemy.intent = { type:"attack", label:"Basic Attack" };
    updateIntentText();
  }
  function updateIntentText() { text("enemyIntentText", state.enemy.intent ? state.enemy.intent.label : "Unknown"); }

  function grantLoot(win) {
    if (!win) return [];
    const loot = [];
    if (Math.random() < 0.45) { helpers.addItemToSave(state.baseSave, "potion", 1); loot.push("Potion x1"); }
    if (state.enemy.type !== "normal" && Math.random() < 0.5) { helpers.addItemToSave(state.baseSave, "ether", 1); loot.push("Ether x1"); }
    if (state.enemy.type === "boss") {
      const possible = ["wardCharm","emberRing","moonCharm","bossSigil"];
      const id = possible[(state.floor / 10 - 1) % possible.length];
      if (!state.baseSave.unlockedDrops.includes(id)) {
        state.baseSave.unlockedDrops.push(id); helpers.addItemToSave(state.baseSave, id, 1); loot.push(`${helpers.ITEM_CATALOG[id].name} x1`);
      }
    }
    return loot;
  }

  function rewardSave(win) {
    const save = state.baseSave; if (!save) return null;
    if (win) {
      const rewardGold = 20 + state.floor * 4 + (state.enemy.type === "boss" ? 80 : state.enemy.type === "mini" ? 35 : 0);
      const rewardExp = 15 + state.floor * 3 + (state.enemy.type === "boss" ? 24 : state.enemy.type === "mini" ? 12 : 0);
      save.gold += rewardGold; save.exp += rewardExp; save.currentFloor = state.floor; save.unlockedFloor = Math.min(100, Math.max(save.unlockedFloor, state.floor + 1)); save.hp = Math.max(1, state.hero.hp); save.mp = Math.max(0, state.hero.mp);
      const loot = grantLoot(true);
      let leveled = false;
      while (save.exp >= save.level * 80) {
        save.level += 1; save.maxHp += 18; save.maxMp += 8; save.atk += 4; save.def += 2; save.spd += 1; const derived = helpers.getDerivedStats(save); save.hp = derived.maxHp; save.mp = derived.maxMp; leveled = true; addLog(`${save.name} เลเวลอัปเป็น ${save.level}!`);
      }
      saveFn(save);
      return { rewardGold, rewardExp, leveled, loot };
    } else {
      const derived = helpers.getDerivedStats(save); save.hp = derived.maxHp; save.mp = derived.maxMp; saveFn(save); return null;
    }
  }

  function endBattle(win) {
    lockActions(true); const summary = document.getElementById("battleSummary"); summary.classList.remove("hidden");
    if (win) {
      const rewards = rewardSave(true); showCenter("Victory"); addLog(`ชนะการต่อสู้ ได้รับ ${rewards.rewardGold} Gold / ${rewards.rewardExp} EXP`);
      summary.innerHTML = `<h3>Victory</h3><p class="muted">Floor ${state.floor} เคลียร์แล้ว</p><div class="stats-box compact-grid"><div><span>Gold</span><strong>+${rewards.rewardGold}</strong></div><div><span>EXP</span><strong>+${rewards.rewardExp}</strong></div><div><span>Next Floor</span><strong>${Math.min(100, state.floor + 1)}</strong></div><div><span>Status</span><strong>${rewards.leveled ? "Level Up!" : "Ready"}</strong></div></div><p class="small-note">Loot: ${rewards.loot.length ? rewards.loot.join(" • ") : "No drop"}</p><div class="create-actions"><a class="btn btn-primary" href="menu.html">Back to Menu</a><a class="btn btn-secondary" href="inventory.html">Open Inventory</a></div>`;
    } else {
      rewardSave(false); showCenter("Defeat"); addLog("แพ้การต่อสู้ ระบบพากลับแคมป์และฟื้นพลังเต็ม");
      summary.innerHTML = `<h3>Defeat</h3><p class="muted">กลับไปเตรียมตัวใหม่ได้จาก Main Menu</p><a class="btn btn-primary" href="menu.html">Back to Menu</a>`;
    }
  }
  function postActionCheck() { updateBars(); renderStatuses(); if (state.enemy.hp <= 0) { state.enemy.hp = 0; updateBars(); endBattle(true); return true; } if (state.hero.hp <= 0) { state.hero.hp = 0; updateBars(); endBattle(false); return true; } return false; }
  function startHeroTurn() { state.turn += 1; setTimeline("hero"); showCenter(`Turn ${state.turn} • Your Turn`); tickStatusPhase(state.hero, "heroSpriteWrap", state.hero.name); if (postActionCheck()) return; planEnemyIntent(); lockActions(false); }

  function enemyUltimate(enemy) {
    if (enemy.element === "Fire") { applyStatus(state.hero, { name:"burn", turns:3, power:10 }); return { power:1.95, effect:"burn", log:"Inferno Script" }; }
    if (enemy.element === "Ghost") { applyStatus(state.hero, { name:"arcaneBreak", turns:2, amp:0.22 }); return { power:1.8, effect:"magic", log:"Soul Eclipse" }; }
    if (enemy.element === "Wind") { applyStatus(state.hero, { name:"slow", turns:2, amp:0.14 }); return { power:1.7, effect:"magic", log:"Sky Rupture" }; }
    applyStatus(enemy, { name:"focus", turns:2 }); return { power:1.65, effect:"magic", log:"Judgement Ray" };
  }

  function enemyTurn() {
    if (state.enemy.hp <= 0 || state.hero.hp <= 0) return;
    setTimeline("enemy"); lockActions(true); showCenter("Enemy Turn");
    setTimeout(() => {
      tickStatusPhase(state.enemy, "enemySpriteWrap", state.enemy.name); if (postActionCheck()) return;
      const enemy = state.enemy;
      if (enemy.intent?.type === "enrage") {
        enemy.enrage = true; enemy.atk += 10; applyStatus(enemy, { name:"shield", turns:1, reduce:0.2 }); addLog(`${enemy.name} เข้าสู่สถานะ Enrage!`); ringFx("enemySpriteWrap", "fire");
      } else if (enemy.intent?.type === "guard") {
        applyStatus(enemy, { name:"shield", turns:1, reduce:0.24 }); addLog(`${enemy.name} ตั้งการ์ด ลดดาเมจรอบถัดไป`); ringFx("enemySpriteWrap", "magic");
      } else {
        let power = enemy.intent?.type === "special" ? 1.5 : 1;
        let fx = enemy.element === "Fire" ? "fire" : enemy.element === "Poison" ? "poison" : "magic";
        let label = enemy.intent?.label || "โจมตี";
        if (enemy.intent?.type === "ultimate") {
          const ult = enemyUltimate(enemy); power = ult.power; fx = ult.effect; label = ult.log; enemy.usedUltimate = true;
        }
        const result = calcDamage(enemy, state.hero, power, enemy.enrage ? 0.06 : 0);
        animateAttack("enemySpriteWrap", "heroSpriteWrap"); state.hero.hp -= result.total; popup("heroSpriteWrap", result.total, result.crit ? "critical" : result.mult > 1 ? "weak" : ""); ringFx("heroSpriteWrap", fx);
        addLog(`${enemy.name} ใช้ ${label} ใส่ ${state.hero.name} ${result.total} ดาเมจ (${result.label})`);
        if (enemy.intent?.type === "special") {
          if (enemy.element === "Poison") applyStatus(state.hero, { name:"poison", turns:2, power:7 });
          if (enemy.element === "Fire") applyStatus(state.hero, { name:"burn", turns:2, power:7 });
        }
      }
      if (postActionCheck()) return; startHeroTurn();
    }, 540);
  }

  function doHeroHit(result, skill, kind = "attack") {
    animateAttack("heroSpriteWrap", "enemySpriteWrap"); state.enemy.hp -= result.total;
    popup("enemySpriteWrap", result.total, result.crit ? "critical" : result.mult > 1 ? "weak" : "");
    ringFx("enemySpriteWrap", kind === "magic" ? "magic" : (skill?.apply?.name === "burn" ? "fire" : skill?.apply?.name === "poison" ? "poison" : ""));
    addLog(`${state.hero.name} ใช้ ${skill ? skill.name : "การโจมตีปกติ"} ใส่ ${state.enemy.name} ${result.total} ดาเมจ (${result.label})`);
    if (skill?.apply) applyStatus(state.enemy, skill.apply); if (skill?.applySelf) applyStatus(state.hero, skill.applySelf);
    if (state.hero.classId === "arcanist" && kind === "magic") state.hero.mp = Math.min(state.hero.maxMp, state.hero.mp + 3);
    if (state.hero.classId === "support") state.hero.hp = Math.min(state.hero.maxHp, state.hero.hp + 4);
    if (postActionCheck()) return; setTimeout(enemyTurn, 700);
  }

  function basicAttack() { if (actionLocked) return; lockActions(true); const extraCrit = state.hero.classId === "striker" ? 0.08 : state.hero.classId === "host-ranger" ? 0.06 : 0; const result = calcDamage(state.hero, state.enemy, 1.1, extraCrit); doHeroHit(result, null, "attack"); }
  function useSkill(skill) {
    if (actionLocked) return;
    if (state.hero.mp < skill.mpCost) { addLog("MP ไม่พอใช้สกิลนี้"); return; }
    state.hero.mp -= skill.mpCost; updateBars(); lockActions(true); showCenter(skill.name);
    if (skill.type === "heal") {
      const healAmount = Math.round(state.hero.maxHp * skill.healRatio); state.hero.hp = Math.min(state.hero.maxHp, state.hero.hp + healAmount); if (skill.applySelf) applyStatus(state.hero, skill.applySelf);
      popup("heroSpriteWrap", healAmount, "heal"); ringFx("heroSpriteWrap", "heal"); addLog(`${state.hero.name} ใช้ ${skill.name} ฟื้น HP ${healAmount}`); if (postActionCheck()) return; setTimeout(enemyTurn, 620); return;
    }
    if (skill.type === "buff") {
      if (skill.applySelf) applyStatus(state.hero, skill.applySelf); state.hero.defBuff = Math.max(state.hero.defBuff || 0, Math.round(state.hero.def * (skill.defendBoost || 0.3))); addLog(`${state.hero.name} ใช้ ${skill.name} เพิ่มพลังป้องกันชั่วคราว`); ringFx("heroSpriteWrap", "magic"); renderStatuses(); setTimeout(enemyTurn, 620); return;
    }
    let critBonus = 0; if (skill.id === "crimsonDrive") critBonus = 0.18; if (skill.id === "galeArrow") critBonus = 0.08;
    const result = calcDamage(state.hero, state.enemy, skill.power || 1.4, critBonus); doHeroHit(result, skill, skill.type);
  }
  function defend() { if (actionLocked) return; applyStatus(state.hero, { name:"shield", turns:1, reduce: state.hero.classId === "steward-guardian" ? 0.28 : 0.2 }); state.hero.defBuff = Math.max(state.hero.defBuff || 0, Math.round(state.hero.def * 0.45)); addLog(`${state.hero.name} ตั้งการ์ด ลดดาเมจรอบถัดไป`); ringFx("heroSpriteWrap", "magic"); renderStatuses(); lockActions(true); setTimeout(enemyTurn, 450); }
  function usePotion() {
    if (actionLocked) return;
    const used = helpers.consumeItemFromSave(state.baseSave, "potion", 1);
    if (!used) { addLog("Potion หมดแล้ว"); return; }
    const healAmount = 40; state.hero.hp = Math.min(state.hero.maxHp, state.hero.hp + healAmount); popup("heroSpriteWrap", healAmount, "heal"); ringFx("heroSpriteWrap", "heal"); addLog(`${state.hero.name} ใช้ Potion ฟื้น HP ${healAmount}`); updateBars(); saveFn(state.baseSave); if (postActionCheck()) return; lockActions(true); setTimeout(enemyTurn, 450);
  }

  function startBattle(save, floor, setSaveFunc, getClassById, helperBag) {
    helpers = helperBag; saveFn = setSaveFunc; const heroClass = getClassById(save.classId); const derived = helpers.getDerivedStats(save); const enemy = pickEnemy(floor);
    state = { turn:0, floor, baseSave: save, hero:{ ...save, classId: save.classId, skills: heroClass.skills.slice(), statuses: [], defBuff:0, maxHp: derived.maxHp, maxMp: derived.maxMp, atk: derived.atk, def: derived.def, spd: derived.spd, hp: Math.min(save.hp, derived.maxHp), mp: Math.min(save.mp, derived.maxMp) }, enemy };
    text("battleFloorTitle", `Floor ${floor}`); text("heroBattleName", save.name); text("enemyName", enemy.name); text("heroElementBadge", `${save.element} Lv${save.elementLevel}`); text("enemyElementBadge", `${enemy.element} Lv${enemy.elementLevel}`);
    document.getElementById("heroSprite").src = heroClass.sprite; document.getElementById("enemySprite").src = enemy.sprite; text("heroPassiveText", heroClass.passive); text("enemyTypeLabel", enemy.type === "boss" ? "Boss Encounter" : enemy.type === "mini" ? "Mini Boss" : "Standard Encounter"); document.getElementById("bossBanner").classList.toggle("hidden", enemy.type === "normal"); text("bossBanner", enemy.type === "boss" ? "Boss Battle" : "Mini Boss"); text("bossSkillHint", enemy.type === "normal" ? "" : `Signature Skill: ${enemy.special}`);
    const equipped = window.LayaGame.getEquippedItems(save); text("battleLoadout", [equipped.weapon?.name,equipped.armor?.name,equipped.charm?.name].filter(Boolean).join(" • "));
    renderSkillPanel(); updateBars(); renderStatuses(); addLog(`${save.name} เข้าสู่ชั้น ${floor}`); addLog(`พบศัตรู ${enemy.name}`);
    document.getElementById("attackBtn").addEventListener("click", basicAttack); document.getElementById("skillBtn").addEventListener("click", () => document.getElementById("skillPanel").classList.toggle("hidden")); document.getElementById("defendBtn").addEventListener("click", defend); document.getElementById("itemBtn").addEventListener("click", usePotion);
    startHeroTurn();
  }

  window.LayaBattle = { startBattle };
})();