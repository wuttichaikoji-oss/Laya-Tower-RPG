(function () {
  const state = {
    gender: 'male',
    selectedClass: 'striker'
  };

  const titleScreen = document.querySelector('.title-screen');
  const createScreen = document.getElementById('createScreen');
  const menuScreen = document.getElementById('menuScreen');
  const saveStatus = document.getElementById('saveStatus');
  const heroNameInput = document.getElementById('heroName');
  const classList = document.getElementById('classList');

  function showScreen(name) {
    titleScreen.classList.add('hidden');
    createScreen.classList.add('hidden');
    menuScreen.classList.add('hidden');

    if (name === 'title') titleScreen.classList.remove('hidden');
    if (name === 'create') createScreen.classList.remove('hidden');
    if (name === 'menu') menuScreen.classList.remove('hidden');
  }

  function getSelectedData() {
    return window.HERO_CLASSES[state.selectedClass];
  }

  function renderClassButtons() {
    classList.innerHTML = '';
    Object.entries(window.HERO_CLASSES).forEach(([key, value]) => {
      const btn = document.createElement('button');
      btn.className = 'class-btn' + (key === state.selectedClass ? ' active' : '');
      btn.innerHTML = `<strong>${value.name}</strong><br><span class="muted">${value.role}</span>`;
      btn.addEventListener('click', () => {
        state.selectedClass = key;
        renderClassButtons();
        renderPreview();
      });
      classList.appendChild(btn);
    });
  }

  function renderPreview() {
    const data = getSelectedData();
    const icon = state.gender === 'male' ? data.iconMale : data.iconFemale;
    document.getElementById('heroPreview').textContent = icon;
    document.getElementById('previewClassName').textContent = data.name;
    document.getElementById('previewRole').textContent = data.role;
    document.getElementById('previewDesc').textContent = data.description;
    document.getElementById('statHP').textContent = data.stats.hp;
    document.getElementById('statMP').textContent = data.stats.mp;
    document.getElementById('statATK').textContent = data.stats.atk;
    document.getElementById('statDEF').textContent = data.stats.def;
    document.getElementById('statSPD').textContent = data.stats.spd;
    document.getElementById('statCRIT').textContent = data.stats.crit + '%';
  }

  function renderMenu(save) {
    const classData = window.HERO_CLASSES[save.heroClass];
    const icon = save.gender === 'male' ? classData.iconMale : classData.iconFemale;
    document.getElementById('menuPreview').textContent = icon;
    document.getElementById('menuHeroName').textContent = save.name;
    document.getElementById('menuClass').textContent = `${classData.name} • ${classData.role}`;
    document.getElementById('menuLevel').textContent = save.level;
    document.getElementById('menuExp').textContent = save.exp;
    document.getElementById('menuHP').textContent = `${save.hp} / ${save.maxHp}`;
    document.getElementById('menuMP').textContent = `${save.mp} / ${save.maxMp}`;
    document.getElementById('menuGold').textContent = save.gold;
    document.getElementById('menuFloor').textContent = save.floor;
  }

  function updateSaveStatus() {
    const save = loadGame();
    const continueBtn = document.getElementById('continueBtn');
    if (save) {
      continueBtn.disabled = false;
      saveStatus.textContent = `พบเซฟ: ${save.name} • Lv.${save.level} • Floor ${save.floor}`;
    } else {
      continueBtn.disabled = true;
      saveStatus.textContent = 'ยังไม่มีข้อมูลเซฟ';
    }
  }

  function createHero() {
    const name = heroNameInput.value.trim();
    if (!name) {
      alert('กรุณาใส่ชื่อตัวละคร');
      heroNameInput.focus();
      return;
    }

    const classData = getSelectedData();
    const save = {
      name,
      gender: state.gender,
      heroClass: state.selectedClass,
      level: 1,
      exp: 0,
      hp: classData.stats.hp,
      mp: classData.stats.mp,
      maxHp: classData.stats.hp,
      maxMp: classData.stats.mp,
      atk: classData.stats.atk,
      def: classData.stats.def,
      spd: classData.stats.spd,
      crit: classData.stats.crit,
      gold: 0,
      floor: 1,
      checkpoint: 1,
      inventory: [],
      equipment: {
        weapon: null,
        armor: null,
        accessory: null,
        ring: null
      },
      version: 'phase1-build1'
    };

    saveGame(save);
    renderMenu(save);
    updateSaveStatus();
    showScreen('menu');
  }

  document.getElementById('newGameBtn').addEventListener('click', () => {
    heroNameInput.value = '';
    state.gender = 'male';
    state.selectedClass = 'striker';
    document.querySelectorAll('#genderRow .choice-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.gender === 'male');
    });
    renderClassButtons();
    renderPreview();
    showScreen('create');
  });

  document.getElementById('continueBtn').addEventListener('click', () => {
    const save = loadGame();
    if (!save) return;
    renderMenu(save);
    showScreen('menu');
  });

  document.getElementById('resetSaveBtn').addEventListener('click', () => {
    const ok = confirm('ลบข้อมูลเซฟทั้งหมดใช่ไหม');
    if (!ok) return;
    resetGame();
    updateSaveStatus();
  });

  document.querySelectorAll('#genderRow .choice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.gender = btn.dataset.gender;
      document.querySelectorAll('#genderRow .choice-btn').forEach(el => {
        el.classList.toggle('active', el === btn);
      });
      renderPreview();
    });
  });

  document.getElementById('createHeroBtn').addEventListener('click', createHero);
  document.getElementById('backToTitleBtn').addEventListener('click', () => showScreen('title'));
  document.getElementById('backTitleFromMenuBtn').addEventListener('click', () => {
    updateSaveStatus();
    showScreen('title');
  });
  document.getElementById('saveBtn').addEventListener('click', () => {
    const save = loadGame();
    if (save) {
      saveGame(save);
      alert('บันทึกข้อมูลเรียบร้อย');
    }
  });
  document.getElementById('enterTowerBtn').addEventListener('click', () => alert('Build 2 จะเพิ่ม Tower Map'));
  document.getElementById('inventoryBtn').addEventListener('click', () => alert('Build 3 จะเพิ่ม Inventory'));

  renderClassButtons();
  renderPreview();
  updateSaveStatus();
})();
