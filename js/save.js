/* ============================================================
   💾 SAVE.JS – Olivia’s World RPG (Unified)
   ------------------------------------------------------------
   ✦ Start / Continue / Load Menu (Landing Page)
   ✦ Multi-save management (max 5 per player)
   ✦ Save slot UI population
   ✦ In-game Save / Load (Settings)
============================================================ */

if (!window.__saveMenuBound) {
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
     💾 CONTINUE (Latest Autosave)
  ============================================================ */
  if (continueBtn) {
    const hasSave = localStorage.getItem('olivia_save');
    continueBtn.style.display = hasSave ? 'inline-block' : 'none';
    console.log(hasSave ? '💾 Save found — showing Continue button.' : '⚠️ No save found.');

    continueBtn.addEventListener('click', async () => {
      const save = window.loadGame?.();
      if (!save) return showAlert?.('⚠️ No saved game found!');
      showScreen('explore-page');
      setTimeout(() => startExploreGame?.(), 300);
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

    loadBtn?.addEventListener('click', () => {
    
    window.populateSaveSlots?.();
    loadWrapper?.classList.add('active');
  });

  closeLoadBtn?.addEventListener('click', () => {
    loadWrapper?.classList.remove('active');
  });
}




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
    saveSlotList.innerHTML = '<p class=\'no-saves\'>No saved games found.</p>';
    return;
  }

  saves.forEach((save) => {
    const btn = document.createElement('button');
    btn.textContent = `${save.name} (${new Date(save.timestamp).toLocaleString()})`;
    btn.classList.add('save-slot-btn');
    btn.onclick = async () => {
      console.log(`📖 Loading save: ${save.key}`);
      window.loadGame(save.key);
      loadWrapper?.classList.remove('active');
      settingsWrapper?.classList.remove('active');

      // Use custom alert if available
      (window.showAlert || alert)(
        `🌸 Loaded save for ${window.player.name}!`,
        () => {
          showScreen('explore-page');
          setTimeout(() => startExploreGame?.(), 300);
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
    timestamp: new Date().toISOString(),
  };

  const key = `olivia_save_${p.name}_${saveData.timestamp}`;
  localStorage.setItem('olivia_save', JSON.stringify(saveData)); // overwrite autosave
  localStorage.setItem(key, JSON.stringify(saveData));

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
  if (showAlertBox) {
    (window.showAlert || alert)(`💾 Game saved as "${p.name}"!`);
  }
};

/* ============================================================
   🔁 LOAD GAME (Helper)
============================================================ */
window.loadGame = (slotKey = 'olivia_save') => {
  const data = localStorage.getItem(slotKey);
  if (!data) {
    console.warn(`⚠️ No save data found for key: ${slotKey}`);
    (window.showAlert || alert)('⚠️ No save data found!');
    return null;
  }

  const save = JSON.parse(data);
  window.player = {
    ...save,
    x: save.position?.x ?? 100,
    y: save.position?.y ?? 100,
    size: 15,
    color: '#ff69b4',
    speed: save.currentStats?.speed || 3,
    hp: save.currentStats?.currentHp ?? save.currentStats?.hp ?? 100,
    maxHp: save.currentStats?.maxHp ?? save.currentStats?.hp ?? 100,
    mana: save.currentStats?.currentMana ?? save.currentStats?.mana ?? 80,
    maxMana: save.currentStats?.maxMana ?? save.currentStats?.mana ?? 80,
    expToNextLevel: save.expToNextLevel ?? 100,
    attackRange: 40,
    attackDamage: 15,
    attackCooldown: 550,
    lastAttack: 0,
  };

  window.difficulty = save.difficulty;
  console.log(`🎮 Loaded save for ${window.player.name} (${window.player.classKey})`);
  return window.player;
};

/* ============================================================
   💾 IN-GAME SAVE / LOAD (Settings Menu – Instant Reload + Unpause)
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

    // Find the latest save key
    const saves = Object.keys(localStorage)
      .filter(k => k.startsWith('olivia_save_') && k !== 'olivia_save')
      .map(k => {
        try {
          const data = JSON.parse(localStorage.getItem(k));
          return { key: k, timestamp: new Date(data.timestamp).getTime() };
        } catch {
          return null;
        }
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

    // ✅ Unpause and resume game
    settingsWrapper?.classList.remove('active');
    uiState = 'explore';
    exploreRunning = true;
    showScreen('explore-page');

    // restart loop safely
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
