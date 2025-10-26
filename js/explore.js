/* ============================================================
   🦄 EXPLORE.JS – Olivia’s World RPG
   ------------------------------------------------------------
   Handles:
   ✦ Grid-based map and player movement
   ✦ HP / Mana bars
   ✦ All in-game overlays (Inventory, Settings, Quests, Controls)
   ✦ Save / Load system
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

  // Responsive resizing
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
      rows: Math.ceil(canvas.height / tileSize),
    };
  }

  let player = null;
  const keys = {};
  let exploreRunning = false;

  // Keyboard handling
  window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === "Shift") keys.shift = true;
  });
  window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
    if (e.key === "Shift") keys.shift = false;
  });

  // Map rendering
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


  /* ============================================================
     ❤️ HP & MANA BARS
  ============================================================ */
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
    const manaPercent = (player.mana / player.maxMana) * 100;
    bar.style.width = `${manaPercent}%`;
    text.textContent = `MP: ${player.mana} / ${player.maxMana}`;
  }
  window.updateManaBar = updateManaBar;


  /* ============================================================
     🎨 DRAW LOOP
  ============================================================ */
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap();
    drawPlayer();
    updateHPBar();
    updateManaBar();
  }

  function update() {
    if (!exploreRunning || !player) return;

    // Pause player movement if overlay is active
    if (uiState !== "explore") {
      draw();
      window.exploreFrameId = requestAnimationFrame(update);
      return;
    }

    // WASD Movement
    if (keys["w"]) player.y -= player.speed;
    if (keys["s"]) player.y += player.speed;
    if (keys["a"]) player.x -= player.speed;
    if (keys["d"]) player.x += player.speed;

    // Keep player inside bounds
    player.x = Math.max(player.size / 2, Math.min(canvas.width - player.size / 2, player.x));
    player.y = Math.max(player.size / 2, Math.min(canvas.height - player.size / 2, player.y));

    draw();
    window.exploreFrameId = requestAnimationFrame(update);
  }


  /* ============================================================
     🚀 START EXPLORE MODE
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
     🧩 GLOBAL OVERLAY CONTROL
  ============================================================ */
  function closeAllOverlays() {
    document.querySelectorAll(
      "#inventory-wrapper, #settings-wrapper, #controls-wrapper, #quests-wrapper"
    ).forEach((el) => el.classList.remove("active"));
    uiState = "explore";
  }


  /* ============================================================
     🎒 INVENTORY OVERLAY
  ============================================================ */
  const inventoryBtn = document.getElementById("open-inventory");
  const inventoryWrapper = document.getElementById("inventory-wrapper");
  const backToExploreBtn = document.getElementById("back-to-explore");

  function toggleInventory(show) {
    closeAllOverlays();
    uiState = show ? "inventory" : "explore";
    inventoryWrapper.classList.toggle("active", show);
  }
  inventoryBtn?.addEventListener("click", () => toggleInventory(true));
  backToExploreBtn?.addEventListener("click", () => toggleInventory(false));


  /* ============================================================
     ⚙️ SETTINGS OVERLAY
  ============================================================ */
  const settingsBtn = document.querySelector('.nav-btn[data-action="settings"]');
  const settingsWrapper = document.getElementById("settings-wrapper");
  const closeSettingsBtn = document.getElementById("close-settings");

  function toggleSettings(show) {
    uiState = show ? "settings" : "explore";
    settingsWrapper.classList.toggle("active", show);
  }

  settingsBtn?.addEventListener("click", () => {
    closeAllOverlays();
    uiState = "settings";
    settingsWrapper.classList.add("active");
  });
  closeSettingsBtn?.addEventListener("click", () => toggleSettings(false));

  // 🎵 Music Toggle
  const toggleMusicBtn = document.getElementById("toggle-music");
  toggleMusicBtn?.addEventListener("click", () => {
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

  // 🔊 SFX Toggle
  const toggleSfxBtn = document.getElementById("toggle-sfx");
  toggleSfxBtn?.addEventListener("click", () => {
    toggleSfxBtn.textContent = toggleSfxBtn.textContent === "On" ? "Off" : "On";
  });

  // 💾 Save / Load buttons
  const saveGameBtn = document.getElementById("save-game-btn");
  const loadGameBtn = document.getElementById("load-game-btn");

  saveGameBtn?.addEventListener("click", () => {
    if (!window.player) return (window.showAlert || alert)("No player to save yet!");
    saveGame();
    (window.showAlert || alert)("💾 Game saved successfully!");
  });

  loadGameBtn?.addEventListener("click", () => {
    const save = loadGame?.();
    if (!save) return (window.showAlert || alert)("⚠️ No saved game found!");
    closeAllOverlays();
    cancelAnimationFrame(window.exploreFrameId);
    startExploreGame?.();
    (window.showAlert || alert)("📂 Game loaded successfully!");
  });


  /* ============================================================
     🎮 CONTROLS OVERLAY
  ============================================================ */
  const controlsBtn = document.querySelector('.nav-btn[data-action="battle"]');
  const controlsWrapper = document.getElementById("controls-wrapper");
  const closeControlsBtn = document.getElementById("close-controls");

  function toggleControls(show) {
    closeAllOverlays();
    uiState = show ? "controls" : "explore";
    controlsWrapper.classList.toggle("active", show);
  }
  controlsBtn?.addEventListener("click", () => toggleControls(true));
  closeControlsBtn?.addEventListener("click", () => toggleControls(false));


  /* ============================================================
     📜 QUESTS OVERLAY
  ============================================================ */
  const questBtn = document.querySelector('.nav-btn[data-action="quest"]');
  const questsWrapper = document.getElementById("quests-wrapper");
  const closeQuestsBtn = document.getElementById("close-quests");

  function toggleQuests(show) {
    closeAllOverlays();
    uiState = show ? "quests" : "explore";
    questsWrapper.classList.toggle("active", show);
  }
  questBtn?.addEventListener("click", () => toggleQuests(true));
  closeQuestsBtn?.addEventListener("click", () => toggleQuests(false));
});


/* ============================================================
   💾 SAVE / LOAD SYSTEM
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

  // Main save + named slot save
  localStorage.setItem("olivia_save", JSON.stringify(saveData));
  const key = `olivia_save_${p.name || "Unknown"}`;
  localStorage.setItem(key, JSON.stringify(saveData));

  console.log(`💾 Game saved for ${p.name} (${p.classKey}) → Slots: "olivia_save" + "${key}"`);
}


function loadGame(slotKey = "olivia_save") {
  const data = localStorage.getItem(slotKey);
  if (!data) {
    console.warn(`⚠️ No save data found for key: ${slotKey}`);
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
  };

  window.difficulty = save.difficulty;
  console.log(`🎮 Loaded save for ${window.player.name} (${window.player.classKey}) from "${slotKey}"`);
  return window.player;
}


// 🎯 Alias for load menu
function loadSpecificSave(key) {
  return loadGame(key);
}


// 🌐 Global access
window.saveGame = saveGame;
window.loadGame = loadGame;
window.loadSpecificSave = loadSpecificSave;


// 💾 Auto-save before exit
window.addEventListener("beforeunload", () => {
  if (window.player) saveGame();
});
