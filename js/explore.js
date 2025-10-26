/* ============================================================
   🦄 EXPLORE.JS – GRID MAP + MOVEMENT + ALL OVERLAYS
   ============================================================ */

let uiState = "explore";

document.addEventListener("DOMContentLoaded", () => {

  /* ============================================================
     🎮 CANVAS SETUP
  ============================================================ */
  const canvas = document.getElementById("explore-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
  canvas.style.willChange = "transform, contents";
  canvas.style.transform = "translateZ(0)";

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    if (window.player) {
      const p = window.player;
      const r = p.size ? p.size / 2 : 7.5;
      p.x = Math.max(r, Math.min(canvas.width - r, p.x));
      p.y = Math.max(r, Math.min(canvas.height - r, p.y));
    }
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  /* ============================================================
     🧭 PLAYER + MAP
  ============================================================ */
  const tileSize = 20;
  function getMapSize() {
    return {
      cols: Math.ceil(canvas.width / tileSize),
      rows: Math.ceil(canvas.height / tileSize)
    };
  }

  let player = null;
  const keys = {};
  let exploreRunning = false;

  window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === "Shift") keys.shift = true;
  });
  window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
    if (e.key === "Shift") keys.shift = false;
  });

  function drawMap() {
    const { cols, rows } = getMapSize();
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        ctx.fillStyle = (x + y) % 2 ? "#fffacd" : "#faf0e6";
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
  }

  function drawPlayer() {
    if (!player) return;
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  function updateHPBar() {
    const bar = document.getElementById("player-hp-bar");
    const text = document.getElementById("player-hp-text");
    if (!bar || !text || !player) return;
    const hpPercent = (player.hp / player.maxHp) * 100;
    bar.style.width = `${hpPercent}%`;
    text.textContent = `HP: ${player.hp} / ${player.maxHp}`;
  }
  window.updateHPBar = updateHPBar;

  function updateManaBar() {
  const bar = document.getElementById("player-mana-bar");
  const text = document.getElementById("player-mana-text");
  if (!bar || !text || !player) return;
  window.updateManaBar = updateManaBar;

  const manaPercent = (player.mana / player.maxMana) * 100;
  bar.style.width = `${manaPercent}%`;
  text.textContent = `MP: ${player.mana} / ${player.maxMana}`;
}

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap();
    drawPlayer();
    updateHPBar();
    updateManaBar();
  }



  function update() {
    if (!exploreRunning || !player) return;

    // pause when overlay active
    if (uiState !== "explore") {
      draw();
      window.exploreFrameId = requestAnimationFrame(update);
      return;
    }

    if (keys["w"]) player.y -= player.speed;
    if (keys["s"]) player.y += player.speed;
    if (keys["a"]) player.x -= player.speed;
    if (keys["d"]) player.x += player.speed;

    player.x = Math.max(player.size / 2, Math.min(canvas.width - player.size / 2, player.x));
    player.y = Math.max(player.size / 2, Math.min(canvas.height - player.size / 2, player.y));

    draw();
    window.exploreFrameId = requestAnimationFrame(update);
  }

  /* ============================================================
     🚀 START EXPLORE GAME
  ============================================================ */
  function startExploreGame() {
    if (window.exploreFrameId) cancelAnimationFrame(window.exploreFrameId);
    exploreRunning = false;
    if (exploreRunning) return;

    if (window.player) {
      player = window.player;
      if (player.x == null || player.y == null) {
        player.x = canvas.width / 2;
        player.y = canvas.height / 2;
      }
      player.size  = player.size  ?? 15;
      player.color = player.color ?? "#ff69b4";
      player.speed = player.currentStats?.speed || 3;
      player.hp    = player.currentStats?.hp    || 100;
      player.maxHp = player.currentStats?.hp    || 100;
    } else {
      player = {
        name: "Fallback Hero",
        currentStats: { hp: 100, speed: 3 },
        x: canvas.width / 2,
        y: canvas.height / 2,
        size: 15,
        color: "#ff69b4",
        speed: 3,
        hp: 100,
        maxHp: 100,
      };
      window.player = player;
    }

    drawMap();
    drawPlayer();
    updateHPBar();
    updateManaBar();
    exploreRunning = true;
    update();
  }
  window.startExploreGame = startExploreGame;

  /* ============================================================
     🏰 RETURN HOME
  ============================================================ */
  const returnHomeBtn = document.getElementById("return-home");
  if (returnHomeBtn) {
    returnHomeBtn.addEventListener("click", () => {
      showAlert(
        "Are you sure you want to return home? Your current progress will be lost.",
        () => {
          exploreRunning = false;
          cancelAnimationFrame(window.exploreFrameId);
          window.location.reload();
        }
      );
    });
  }

  /* ============================================================
     🧩 GLOBAL HELPER
  ============================================================ */
  function closeAllOverlays() {
    document.querySelectorAll(
      "#inventory-wrapper, #settings-wrapper, #controls-wrapper, #quests-wrapper"
    ).forEach(el => el.classList.remove("active"));
    uiState = "explore";
  }

  /* ============================================================
     🎒 INVENTORY
  ============================================================ */
  const inventoryBtn = document.getElementById("open-inventory");
  const inventoryWrapper = document.getElementById("inventory-wrapper");
  const backToExploreBtn = document.getElementById("back-to-explore");

  function toggleInventory(show) {
    closeAllOverlays();
    uiState = show ? "inventory" : "explore";
    inventoryWrapper.classList.toggle("active", show);
  }
  if (inventoryBtn) inventoryBtn.addEventListener("click", () => toggleInventory(true));
  if (backToExploreBtn) backToExploreBtn.addEventListener("click", () => toggleInventory(false));

  /* ============================================================
     ⚙️ SETTINGS
  ============================================================ */
  const settingsBtn = document.querySelector('.nav-btn[data-action="settings"]');
  const settingsWrapper = document.getElementById("settings-wrapper");
  const closeSettingsBtn = document.getElementById("close-settings");

  if (settingsBtn) settingsBtn.addEventListener("click", () => {
    closeAllOverlays();
    uiState = "settings";
    settingsWrapper.classList.add("active");
  });
  if (closeSettingsBtn) closeSettingsBtn.addEventListener("click", () => toggleSettings(false));

  function toggleSettings(show) {
    uiState = show ? "settings" : "explore";
    settingsWrapper.classList.toggle("active", show);
  }

  /* === SAVE/LOAD BUTTONS + AUDIO TOGGLES (added back) === */
  const toggleMusicBtn = document.getElementById("toggle-music");
  const toggleSfxBtn   = document.getElementById("toggle-sfx");
  const saveGameBtn    = document.getElementById("save-game-btn");
  const loadGameBtn    = document.getElementById("load-game-btn");

  // 🎵 Music Toggle
  if (toggleMusicBtn) {
    toggleMusicBtn.addEventListener("click", () => {
      const music = document.getElementById("bg-music");
      if (!music) return;
      if (music.paused) {
        music.play();
        toggleMusicBtn.textContent = "On";
      } else {
        music.pause();
        toggleMusicBtn.textContent = "Off";
      }
    });
  }

  // 🔊 SFX Toggle
  if (toggleSfxBtn) {
    toggleSfxBtn.addEventListener("click", () => {
      toggleSfxBtn.textContent = toggleSfxBtn.textContent === "On" ? "Off" : "On";
    });
  }

  // 💾 Save Game
  if (saveGameBtn) {
    saveGameBtn.addEventListener("click", () => {
      if (!window.player) {
        (window.showAlert || alert)("No player to save yet!");
        return;
      }
      saveGame();
      (window.showAlert || alert)("💾 Game saved successfully!");
    });
  }

  // 📂 Load Game
  if (loadGameBtn) {
    loadGameBtn.addEventListener("click", () => {
      const save = loadGame?.();
      if (!save) {
        (window.showAlert || alert)("⚠️ No saved game found!");
        return;
      }
      closeAllOverlays();
      cancelAnimationFrame(window.exploreFrameId);
      startExploreGame?.();
      (window.showAlert || alert)("📂 Game loaded successfully!");
    });
  }

  /* ============================================================
     🎮 CONTROLS / ABILITIES
  ============================================================ */
  const controlsBtn = document.querySelector('.nav-btn[data-action="battle"]');
  const controlsWrapper = document.getElementById("controls-wrapper");
  const closeControlsBtn = document.getElementById("close-controls");

  function toggleControls(show) {
    closeAllOverlays();
    uiState = show ? "controls" : "explore";
    controlsWrapper.classList.toggle("active", show);
  }
  if (controlsBtn) controlsBtn.addEventListener("click", () => toggleControls(true));
  if (closeControlsBtn) closeControlsBtn.addEventListener("click", () => toggleControls(false));

  /* ============================================================
     📜 QUESTS
  ============================================================ */
  const questBtn = document.querySelector('.nav-btn[data-action="quest"]');
  const questsWrapper = document.getElementById("quests-wrapper");
  const closeQuestsBtn = document.getElementById("close-quests");

  function toggleQuests(show) {
    closeAllOverlays();
    uiState = show ? "quests" : "explore";
    questsWrapper.classList.toggle("active", show);
  }
  if (questBtn) questBtn.addEventListener("click", () => toggleQuests(true));
  if (closeQuestsBtn) closeQuestsBtn.addEventListener("click", () => toggleQuests(false));
});

/* ============================================================
   💾 SAVE / LOAD SYSTEM
============================================================ */
/* ============================================================
   💾 SAVE / LOAD SYSTEM (Unified for Continue + Load Menu + Settings)
============================================================ */
function saveGame() {
  const p = window.player;
  if (!p) return console.warn("⚠️ No player to save!");

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

  // ✅ 1️⃣ Primary save (used for “Continue” button)
  localStorage.setItem("olivia_save", JSON.stringify(saveData));

  // ✅ 2️⃣ Character-named slot save (used for Load Game menu)
  const key = `olivia_save_${p.name || "Unknown"}`;
  localStorage.setItem(key, JSON.stringify(saveData));

  console.log(`💾 Game saved for ${p.name} (${p.classKey}) → Slots: "olivia_save" + "${key}"`);
}


/* ============================================================
   📂 LOAD GAME (Continue, Load Menu, and Settings Panel)
============================================================ */
function loadGame(slotKey = "olivia_save") {
  const data = localStorage.getItem(slotKey);
  if (!data) {
    console.warn(`⚠️ No save data found for key: ${slotKey}`);
    return null;
  }

  const save = JSON.parse(data);
  window.player = {
    name: save.name,
    classKey: save.classKey,
    currentStats: save.currentStats,
    level: save.level,
    experience: save.experience,
    ...save,
    x: save.position?.x ?? 100,
    y: save.position?.y ?? 100,
    size: 15,
    color: "#ff69b4",
    speed: save.currentStats?.speed || 3,
    hp: save.currentStats?.hp || 100,
    maxHp: save.currentStats?.hp || 100,
  };

  window.difficulty = save.difficulty;
  console.log(`🎮 Loaded save for ${window.player.name} (${window.player.classKey}) from "${slotKey}"`);
  return window.player;
}


/* ============================================================
   🧭 LOAD SPECIFIC SLOT (for Load Game Menu)
============================================================ */
function loadSpecificSave(key) {
  return loadGame(key); // direct alias for menu use
}


/* ============================================================
   💾 GLOBAL HOOKS (so all scripts can call these)
============================================================ */
window.saveGame = saveGame;
window.loadGame = loadGame;
window.loadSpecificSave = loadSpecificSave;


/* ============================================================
   💾 AUTO-SAVE ON EXIT
============================================================ */
window.addEventListener("beforeunload", () => {
  if (window.player) saveGame();
});

