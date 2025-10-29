/* ============================================================
   💾 SAVE.JS – Olivia’s World RPG (Unified, Size-Safe)
   ------------------------------------------------------------
   ✦ Start / Continue / Load Menu (Landing Page)
   ✦ Multi-save management (max 5 per player)
   ✦ Save slot UI population
   ✦ In-game Save / Load (Settings)
   ✦ ✅ Persists player.size and restores correct class size
============================================================ */

(function () {
  if (window.__saveMenuBound) return;
  window.__saveMenuBound = true;

  // DOM References
  const startBtn       = document.getElementById('start-btn');
  const continueBtn    = document.getElementById('continue-btn');
  const loadBtn        = document.getElementById('load-btn');
  const loadWrapper    = document.getElementById('load-wrapper');
  const saveSlotList   = document.getElementById('save-slot-list');
  const closeLoadBtn   = document.getElementById('close-load');

  /* ============================================================
     🩷 START NEW GAME
  ============================================================ */
  startBtn?.addEventListener('click', () => {
    showScreen('naming-page');
  });

  /* ============================================================
     💾 CONTINUE (Autosave key: "olivia_save")
  ============================================================ */
  if (continueBtn) {
    const hasSave = localStorage.getItem('olivia_save');
    continueBtn.style.display = hasSave ? 'inline-block' : 'none';
    console.log(hasSave ? '💾 Save found — showing Continue button.' : '⚠️ No save found.');

    continueBtn.addEventListener('click', () => {
      const save = window.loadGame?.('olivia_save');
      if (!save) return (window.showAlert || alert)('⚠️ No saved game found!');
      showScreen('explore-page');
      setTimeout(() => window.startExploreGame?.(), 300);
    });
  }

  /* ============================================================
     📂 LOAD MENU (Multi-Save)
  ============================================================ */
  loadBtn?.addEventListener('click', () => {
    console.log('📂 Load button clicked!');
    window.populateSaveSlots?.();
    loadWrapper?.classList.add('active');
  });

  closeLoadBtn?.addEventListener('click', () => {
    loadWrapper?.classList.remove('active');
  });
})();

/* ------------------------------------------------------------
   🌸 Shared per-class size defaults (used on load as fallback)
------------------------------------------------------------ */
const __CLASS_SIZE_MAP__ = {
  glitterGuardian: 72,
  starSage: 68,
  moonflower: 70,
  silverArrow: 66,
};

/* ============================================================
   🧩 POPULATE SAVE SLOTS (Globalized)
============================================================ */
window.populateSaveSlots = function populateSaveSlots() {
  const saveSlotList = document.getElementById('save-slot-list');
  const loadWrapper  = document.getElementById('load-wrapper');
  const settingsWrapper = document.getElementById('settings-wrapper');

  if (!saveSlotList) return;
  saveSlotList.innerHTML = '';

  const saves = Object.keys(localStorage)
    .filter((k) => k.startsWith('olivia_save_') && k !== 'olivia_save')
    .map((k) => {
      try {
        const data = JSON.parse(localStorage.getItem(k));
        return { key: k, ...data };
      } catch { return null; }
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  if (saves.length === 0) {
    saveSlotList.innerHTML = '<p class="no-saves">No saved games found.</p>';
    return;
  }

  saves.forEach((save) => {
    const btn = document.createElement('button');
    btn.textContent = `${save.name} (${new Date(save.timestamp).toLocaleString()})`;
    btn.classList.add('save-slot-btn');
    btn.onclick = () => {
      console.log(`📖 Loading save: ${save.key}`);
      window.loadGame(save.key);
      loadWrapper?.classList.remove('active');
      settingsWrapper?.classList.remove('active');

      (window.showAlert || alert)(
        `🌸 Loaded save for ${window.player.name}!`,
        () => {
          showScreen('explore-page');
          setTimeout(() => window.startExploreGame?.(), 300);
          console.log('▶️ Game resumed after loading save.');
        }
      );
    };
    saveSlotList.appendChild(btn);
  });
};

/* ============================================================
   💾 SAVE GAME – LIMITED TO 5 PER PLAYER
============================================================ */
window.saveGame = (showAlertBox = true) => {
  const MAX_SAVES = 5;
  const p = window.player;
  if (!p) {
    console.warn('⚠️ No player data to save!');
    if (showAlertBox) (window.showAlert || alert)('⚠️ No player data to save!');
    return;
  }

  const saveData = {
    name: p.name,
    classKey: p.classKey,
    currentStats: {
      ...p.currentStats,
      currentHp: p.hp,
      maxHp: p.maxHp,
      currentMana: p.mana,
      maxMana: p.maxMana,
      expToNextLevel: p.expToNextLevel,
    },
    level: p.level,
    experience: p.experience,
    difficulty: window.difficulty,
    position: { x: p.x, y: p.y },
    size: p.size ?? __CLASS_SIZE_MAP__[p.classKey] ?? 64, // ✅ persist sprite size
    timestamp: new Date().toISOString(),
  };

  // Autosave & unique slot
  const key = `olivia_save_${p.name}_${saveData.timestamp}`;
  localStorage.setItem('olivia_save', JSON.stringify(saveData)); // overwrite autosave
  localStorage.setItem(key, JSON.stringify(saveData));

  // Enforce per-player max
  const playerSaves = Object.keys(localStorage)
    .filter((k) => k.startsWith(`olivia_save_${p.name}_`))
    .sort(
      (a, b) =>
        new Date(JSON.parse(localStorage[b]).timestamp) -
        new Date(JSON.parse(localStorage[a]).timestamp)
    );

  if (playerSaves.length > MAX_SAVES) {
    const excess = playerSaves.slice(MAX_SAVES);
    excess.forEach((oldKey) => {
      localStorage.removeItem(oldKey);
      console.log(`🗑️ Deleted old save: ${oldKey}`);
    });
  }

  console.log(`💾 Game saved successfully → ${key}`);
  if (showAlertBox) (window.showAlert || alert)(`💾 Game saved as "${p.name}"!`);
};

/* ============================================================
   🔁 LOAD GAME (Helper) — now restores correct size
============================================================ */
window.loadGame = (slotKey = 'olivia_save') => {
  const data = localStorage.getItem(slotKey);
  if (!data) {
    console.warn(`⚠️ No save data found for key: ${slotKey}`);
    (window.showAlert || alert)('⚠️ No saved game found!');
    return null;
  }

  const save = JSON.parse(data);

  // Derive safe stats from save.currentStats
  const cs = save.currentStats || {};

  window.player = {
    ...save,

    // Position
    x: save.position?.x ?? 100,
    y: save.position?.y ?? 100,

    // ✅ Size (saved or class default; avoids tiny sprite)
    size: save.size ?? __CLASS_SIZE_MAP__[save.classKey] ?? 64,

    // Visuals / runtime fields
    color: '#ff69b4',
    lastAttack: 0,

    // Core stats from saved snapshot with fallbacks
    speed: cs.speed ?? 3,

    hp: cs.currentHp ?? cs.hp ?? 100,
    maxHp: cs.maxHp ?? cs.hp ?? 100,

    mana: cs.currentMana ?? cs.mana ?? 80,
    maxMana: cs.maxMana ?? cs.mana ?? 80,

    expToNextLevel: cs.expToNextLevel ?? save.expToNextLevel ?? 100,

    attackRange: save.attackRange ?? 40,
    attackDamage: save.attackDamage ?? 15,
    attackCooldown: save.attackCooldown ?? 550,
  };

  window.difficulty = save.difficulty;

  // Sync UI & systems if available
  window.syncPlayerInGame?.();
  window.updateHPBar?.();
  window.updateManaBar?.();

  console.log(`🎮 Loaded save for ${window.player.name} (${window.player.classKey})`);
  return window.player;
};

/* ============================================================
   💾 IN-GAME SAVE / LOAD (Settings Menu – Instant Reload)
============================================================ */
window.addEventListener('load', () => {
  const saveGameBtn     = document.getElementById('save-game-btn');
  const loadGameBtn     = document.getElementById('load-game-btn');
  const settingsWrapper = document.getElementById('settings-wrapper');

  if (!saveGameBtn && !loadGameBtn) return;

  /* 💾 SAVE BUTTON */
  saveGameBtn?.addEventListener('click', () => {
    console.log('💾 Save button clicked — saving...');
    window.saveGame();
    (window.showAlert || alert)(
      '🌸 Game saved successfully!',
      () => {
        settingsWrapper?.classList.remove('active');
        uiState = 'explore';
        exploreRunning = true;
        console.log('▶️ Game resumed after save.');
      }
    );
  });

  /* 🔁 LOAD BUTTON — Instant reload latest save + resume gameplay */
  loadGameBtn?.addEventListener('click', () => {
    console.log('🔁 Load Game (instant reload) clicked!');

    // Find the latest multi-slot save; fallback to autosave
    const saves = Object.keys(localStorage)
      .filter(k => k.startsWith('olivia_save_') && k !== 'olivia_save')
      .map(k => {
        try {
          const data = JSON.parse(localStorage.getItem(k));
          return { key: k, timestamp: new Date(data.timestamp).getTime() };
        } catch { return null; }
      })
      .filter(Boolean)
      .sort((a, b) => b.timestamp - a.timestamp);

    const latestSave = saves[0]?.key || 'olivia_save';
    const saveData = localStorage.getItem(latestSave);

    if (!saveData) {
      (window.showAlert || alert)('⚠️ No saved game found!');
      return;
    }

    console.log(`📖 Loading latest save: ${latestSave}`);
    window.loadGame(latestSave);

    // ✅ Unpause and resume
    settingsWrapper?.classList.remove('active');
    uiState = 'explore';
    exploreRunning = true;
    showScreen('explore-page');

    // Restart explore loop safely
    cancelAnimationFrame(window.exploreFrameId);
    setTimeout(() => {
      if (typeof window.startExploreGame === 'function') {
        window.startExploreGame();
      } else {
        console.warn('⚠️ startExploreGame() not defined.');
      }
    }, 300);

    console.log('▶️ Game resumed from last save.');
  });

  console.log('✅ In-game Save/Load buttons initialized (instant reload + unpause).');
});
