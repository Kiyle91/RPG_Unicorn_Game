/* ============================================================
   💾 GLOBAL SAVE / LOAD SYSTEM — Always Available
============================================================ */
window.saveGame = (showAlert = true) => {
  const MAX_SAVES = 5; // 🔒 Limit number of individual character saves
  const p = window.player;
  if (!p) {
    console.warn("⚠️ No player found to save!");
    if (showAlert) (window.showAlert || alert)("⚠️ No player data to save!");
    return;
  }

  // 🧩 Check existing save slots (character saves only)
  const saves = Object.keys(localStorage).filter(
    (k) => k.startsWith("olivia_save_") && k !== "olivia_save"
  );

  // 🛑 Stop new save creation if limit reached (unless overwriting same character)
  if (saves.length >= MAX_SAVES && !localStorage.getItem(`olivia_save_${p.name}`)) {
    const msg = `⚠️ You have reached the maximum of ${MAX_SAVES} save slots.\nPlease delete an old save before creating a new one.`;
    if (showAlert) (window.showAlert || alert)(msg);
    console.warn(msg);
    return;
  }

  const saveData = {
    name: p.name,
    classKey: p.classKey,
    currentStats: p.currentStats,
    level: p.level,
    experience: p.experience,
    difficulty: window.difficulty,
    position: { x: p.x, y: p.y },
    timestamp: new Date().toISOString(),
  };

  localStorage.setItem("olivia_save", JSON.stringify(saveData));
  const key = `olivia_save_${p.name || "Unknown"}`;
  localStorage.setItem(key, JSON.stringify(saveData));

  console.log(`💾 Game saved successfully → ${key}`);
  if (showAlert) (window.showAlert || alert)(`💾 Game saved as "${p.name}"!`);
};

window.loadGame = (slotKey = "olivia_save") => {
  const data = localStorage.getItem(slotKey);
  if (!data) {
    console.warn(`⚠️ No save data found for key: ${slotKey}`);
    (window.showAlert || alert)("⚠️ No save data found!");
    return null;
  }

  const save = JSON.parse(data);
  window.player = {
    ...save,
    x: save.position?.x ?? 100,
    y: save.position?.y ?? 100,
    size: 15,
    color: "#ff69b4",
    speed: save.currentStats?.speed || 3,
    hp: save.currentStats?.hp || 100,
    maxHp: save.currentStats?.hp || 100,
    mana: 80,
    maxMana: 80,
    attackRange: 40,
    attackDamage: 15,
    attackCooldown: 550,
    lastAttack: 0,
  };

  window.difficulty = save.difficulty;
  console.log(`🎮 Loaded save for ${window.player.name} (${window.player.classKey})`);
  return window.player;
};

window.loadSpecificSave = (key) => window.loadGame(key);

// Auto-save before unload
window.addEventListener("beforeunload", () => {
  if (window.player) window.saveGame(false);
});

/* ==========================================================
   💾 SETTINGS: SAVE + RESTART BUTTONS 
   (Auto-close Settings + Resume Game on OK)
========================================================== */
window.addEventListener("load", () => {
  const saveGameBtn = document.getElementById("save-game-btn");
  const restartGameBtn = document.getElementById("load-game-btn"); // button still called 'load' in HTML
  const settingsWrapper = document.getElementById("settings-wrapper");

  if (!saveGameBtn && !restartGameBtn) {
    console.warn("⚠️ Settings buttons not found in DOM. Check IDs in HTML.");
    return;
  }

  /* ----------------------------------------------------------
     💾 SAVE BUTTON
  ---------------------------------------------------------- */
  if (saveGameBtn) {
    saveGameBtn.addEventListener("click", () => {
      if (typeof window.saveGame !== "function") {
        console.error("❌ saveGame() not defined globally.");
        (window.showAlert || alert)("⚠️ Save function missing!");
        return;
      }

      console.log("💾 Save button clicked — attempting save...");
      window.saveGame();

      // ✅ Confirmation → Close Settings → Unpause game
      (window.showAlert || alert)(
        "🌸 Game saved successfully!",
        () => {
          settingsWrapper?.classList.remove("active");
          uiState = "explore";
          exploreRunning = true;
          step?.(); // resume main loop
          console.log("▶️ Game resumed after save.");
        }
      );
    });
  }


});