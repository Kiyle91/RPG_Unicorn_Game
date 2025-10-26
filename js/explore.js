/* ============================================================
   🦄 EXPLORE.JS – GRID MAP + MOVEMENT + INVENTORY + SETTINGS
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  /* ============================================================
     🎮 CANVAS SETUP
  ============================================================ */
  const canvas = document.getElementById("explore-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
  canvas.style.willChange = "transform, contents";
  canvas.style.transform = "translateZ(0)";

  /* ============================================================
     📏 CANVAS RESIZING
  ============================================================ */
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  /* ============================================================
     🧭 MAP + PLAYER VARIABLES
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
  let uiState = "explore"; // Current UI context (explore / inventory / settings)

  window.addEventListener("keydown", (e) => (keys[e.key] = true));
  window.addEventListener("keyup", (e) => (keys[e.key] = false));

  /* ============================================================
     🎨 DRAW FUNCTIONS
  ============================================================ */
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

  /* ============================================================
     🔁 MAIN LOOP
  ============================================================ */
  function update() {
    if (!exploreRunning || !player) return;

    // Pause movement when inventory is open
    if (uiState === "inventory" || uiState === "settings") {
      draw();
      window.exploreFrameId = requestAnimationFrame(update);
      return;
    }

    // WASD Movement
    if (keys["w"]) player.y -= player.speed;
    if (keys["s"]) player.y += player.speed;
    if (keys["a"]) player.x -= player.speed;
    if (keys["d"]) player.x += player.speed;

    // Keep player within map bounds
    player.x = Math.max(player.size / 2, Math.min(canvas.width - player.size / 2, player.x));
    player.y = Math.max(player.size / 2, Math.min(canvas.height - player.size / 2, player.y));

    draw();
    window.exploreFrameId = requestAnimationFrame(update);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap();
    drawPlayer();
    updateHPBar();
  }

  /* ============================================================
     🚀 START EXPLORE MODE
  ============================================================ */
  function startExploreGame() {
    if (exploreRunning) return;

    if (window.player) {
      // Use existing player data
      player = window.player;
      player.x = canvas.width / 2;
      player.y = canvas.height / 2;
      player.size = 15;
      player.color = "#ff69b4";
      player.speed = player.currentStats?.speed || 3;
      player.hp = player.currentStats?.hp || 100;
      player.maxHp = player.currentStats?.hp || 100;
    } else {
      // Fallback player (no save or new game)
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
    updateHPBar();
    exploreRunning = true;
    update();
  }
  window.startExploreGame = startExploreGame;

  /* ============================================================
     🎒 INVENTORY OVERLAY
  ============================================================ */
  const inventoryBtn = document.getElementById("open-inventory");
  const inventoryWrapper = document.getElementById("inventory-wrapper");
  const backBtn = document.getElementById("back-to-explore");

  function toggleInventory(show) {
    if (!inventoryWrapper) return;
    uiState = show ? "inventory" : "explore";
    inventoryWrapper.classList.toggle("active", show);
  }

  if (inventoryBtn) inventoryBtn.addEventListener("click", () => toggleInventory(true));
  if (backBtn) backBtn.addEventListener("click", () => toggleInventory(false));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && uiState === "inventory") toggleInventory(false);
  });

  /* ============================================================
     🏰 RETURN HOME HANDLER
  ============================================================ */
  const returnHomeBtn = document.getElementById("return-home");

  if (returnHomeBtn) {
    returnHomeBtn.addEventListener("click", () => {
      console.log("🏰 Return Home button clicked.");

      if (typeof showAlert === "function") {
        showAlert(
          "Are you sure you want to return home? Your current progress will be lost.",
          () => {
            console.log("✅ Player confirmed return home.");
            terminateGame(() => {
              window.location.reload();
            });
          }
        );
      } else {
        const confirmExit = confirm("Are you sure you want to return home? Your progress will be lost.");
        if (confirmExit) {
          terminateGame(() => {
            window.location.reload();
          });
        }
      }
    });
  }

  /* ============================================================
     ☠️ TERMINATE GAME
  ============================================================ */
  function terminateGame(callback) {
    console.log("💀 Terminating game...");
    exploreRunning = false;
    cancelAnimationFrame(window.exploreFrameId);

    const canvas = document.getElementById("explore-canvas");
    if (canvas?.getContext) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    window.player = null;
    setTimeout(() => callback?.(), 200);
  }

  window.terminateGame = terminateGame;

  /* ============================================================
     ⚙️ SETTINGS OVERLAY
  ============================================================ */
  const settingsBtn = document.querySelector('.nav-btn[data-action="settings"]');
  const settingsWrapper = document.getElementById("settings-wrapper");
  const closeSettingsBtn = document.getElementById("close-settings");
  const toggleMusicBtn = document.getElementById("toggle-music");
  const toggleSfxBtn = document.getElementById("toggle-sfx");
  const saveGameBtn = document.getElementById("save-game-btn");
  const loadGameBtn = document.getElementById("load-game-btn");

  function toggleSettings(show) {
    uiState = show ? "settings" : "explore";
    settingsWrapper.classList.toggle("active", show);
  }

  // Open / Close
  if (settingsBtn) settingsBtn.addEventListener("click", () => toggleSettings(true));
  if (closeSettingsBtn) closeSettingsBtn.addEventListener("click", () => toggleSettings(false));

  // 🎵 Music Toggle
  if (toggleMusicBtn) {
    toggleMusicBtn.addEventListener("click", () => {
      const music = document.getElementById("bg-music");
      if (music.paused) {
        music.play();
        toggleMusicBtn.textContent = "On";
      } else {
        music.pause();
        toggleMusicBtn.textContent = "Off";
      }
    });
  }

  // 🔊 Sound Effects Toggle (placeholder)
  if (toggleSfxBtn) {
    toggleSfxBtn.addEventListener("click", () => {
      toggleSfxBtn.textContent = toggleSfxBtn.textContent === "On" ? "Off" : "On";
    });
  }

  // 💾 Save Game
  if (saveGameBtn) {
    saveGameBtn.addEventListener("click", () => {
      saveGame();
      showAlert("💾 Game saved successfully!");
    });
  }

  // 📂 Load Game
  if (loadGameBtn) {
    loadGameBtn.addEventListener("click", () => {
      console.log("📂 Load Game button clicked!");

      const save = loadGame?.();
      if (!save) {
        showAlert("⚠️ No saved game found!");
        return;
      }

      showAlert("📂 Game loaded successfully!");
      startExploreGame?.();

      console.log(
        `🔄 Loaded game for ${window.player?.name || "Unknown Hero"} (${window.player?.classKey || "Unknown Class"})`
      );

      settingsWrapper?.classList.remove("active");
      inventoryWrapper?.classList.remove("active");
      uiState = "explore";

      // ✅ Resume explore mode
      startExploreGame?.();
    });
  }
});

/* ============================================================
   💾 SAVE / LOAD SYSTEM
============================================================ */
function saveGame() {
  if (!window.player) {
    console.warn("⚠️ No player to save!");
    return;
  }

  const saveData = {
    name: player.name,
    classKey: player.classKey,
    currentStats: player.currentStats,
    level: player.level,
    experience: player.experience,
    difficulty: window.difficulty,
    position: { x: player.x, y: player.y },
    timestamp: new Date().toISOString(),
  };

  localStorage.setItem("olivia_save", JSON.stringify(saveData));
  console.log("💾 Game saved:", saveData);
}

function loadGame() {
  const data = localStorage.getItem("olivia_save");
  if (!data) {
    console.warn("⚠️ No saved game found!");
    return null;
  }

  const save = JSON.parse(data);
  console.log("📂 Loaded save:", save);

  window.player = {
    name: save.name,
    classKey: save.classKey,
    currentStats: save.currentStats,
    level: save.level,
    experience: save.experience,
    ...save,
    x: save.position?.x || 100,
    y: save.position?.y || 100,
    size: 15,
    color: "#ff69b4",
    speed: save.currentStats?.speed || 3,
    hp: save.currentStats?.hp || 100,
    maxHp: save.currentStats?.hp || 100,
  };

  window.difficulty = save.difficulty;
  console.log(`🎮 Game loaded for ${window.player.name} (${window.player.classKey})`);
  return window.player;
}

window.saveGame = saveGame;
window.loadGame = loadGame;

// 💾 Auto-save before unload
window.addEventListener("beforeunload", () => {
  if (window.player) saveGame();
});
