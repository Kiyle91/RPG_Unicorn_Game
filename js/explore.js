/* ============================================================
   🦄 EXPLORE.JS – Olivia’s World RPG (Enemies Integrated)
   ------------------------------------------------------------
   Handles:
   ✦ Grid-based map + smooth player movement
   ✦ Enemies (spawn, chase, attack) + player attacks
   ✦ HP / Mana bars + floating damage text
   ✦ Overlays (Inventory, Settings, Quests, Controls)
   ✦ Save / Load system
============================================================ */

let uiState = "explore";
let exploreRunning = false;
let keys = {};
let player = null;
let enemies = [];

/* ------------------------------------------------------------
   📎 Utility: Floating damage text (uses realtime_combat.css)
------------------------------------------------------------ */
function showDamageText(text, x, y, color = "#ff69b4") {
  const div = document.createElement("div");
  div.className = "damage-text";
  div.textContent = text;
  div.style.color = color;
  // position relative to canvas viewport
  const canvas = document.getElementById("explore-canvas");
  const rect = canvas.getBoundingClientRect();
  div.style.left = `${rect.left + x}px`;
  div.style.top = `${rect.top + y - 20}px`;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 1000);
}

/* ============================================================
   🎮 BOOTSTRAP
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("explore-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
  canvas.style.willChange = "transform, contents";
  canvas.style.transform = "translateZ(0)";

  /* ----------------------------------------------------------
     📐 Canvas Resize (keeps player in-bounds)
  ---------------------------------------------------------- */
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    if (player) {
      const r = player.size / 2;
      player.x = Math.max(r, Math.min(canvas.width - r, player.x));
      player.y = Math.max(r, Math.min(canvas.height - r, player.y));
    }
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  /* ----------------------------------------------------------
     ⌨️ Input
  ---------------------------------------------------------- */
  keys = {};
  window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === "Shift") keys.shift = true;
    // Space → melee
    if (e.code === "Space" && uiState === "explore") {
      e.preventDefault();
      playerAttack();
    }
  });
  window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
    if (e.key === "Shift") keys.shift = false;
  });

  /* ==========================================================
     🧭 Player + Map
  ========================================================== */
  const tileSize = 20;

  function getMapSize() {
    return {
      cols: Math.ceil(canvas.width / tileSize),
      rows: Math.ceil(canvas.height / tileSize),
    };
  }

  /* ----------------------------------------------------------
     🎨 Draw helpers (exposed globally for future modules)
  ---------------------------------------------------------- */
  function drawBackground() {
    // Could be a gradient or sky – keep simple for perf
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function drawMap() {
    const { cols, rows } = getMapSize();
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        ctx.fillStyle = (x + y) % 2 ? "#fff7da" : "#faf0e6";
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

  // Expose for compatibility/extensibility
  window.drawBackground = drawBackground;
  window.drawMap = drawMap;
  window.drawPlayer = drawPlayer;

  /* ==========================================================
     ❤️ HP & 🔵 Mana
  ========================================================== */
  function updateHPBar() {
    const bar = document.getElementById("player-hp-bar");
    const text = document.getElementById("player-hp-text");
    if (!bar || !text || !player) return;
    const pct = (player.hp / player.maxHp) * 100;
    bar.style.width = `${Math.max(0, pct)}%`;
    // health color shift
    const color =
      pct > 60 ? "linear-gradient(90deg,#00ff00,#32cd32)" :
      pct > 30 ? "linear-gradient(90deg,#ffd700,#ffa500)" :
                 "linear-gradient(90deg,#ff4d4f,#d9363e)";
    bar.style.background = color;
    text.textContent = `HP: ${player.hp} / ${player.maxHp}`;
  }
  window.updateHPBar = updateHPBar;

  function updateManaBar() {
    const bar = document.getElementById("player-mana-bar");
    const text = document.getElementById("player-mana-text");
    if (!bar || !text || !player) return;
    const pct = (player.mana / player.maxMana) * 100;
    bar.style.width = `${Math.max(0, pct)}%`;
    text.textContent = `MP: ${player.mana} / ${player.maxMana}`;
  }
  window.updateManaBar = updateManaBar;

  /* ==========================================================
     👹 Enemies
  ========================================================== */
  class Enemy {
    constructor(x, y, hp = 50, speed = 1.2) {
      this.x = x;
      this.y = y;
      this.hp = hp;
      this.maxHp = hp;
      this.speed = speed;
      this.attackRange = 30;
      this.attackCooldown = 900;
      this.lastAttack = 0;
      this.color = "#9b59b6";
      this.radius = 10;
    }
    update(playerRef) {
      const dx = playerRef.x - this.x;
      const dy = playerRef.y - this.y;
      const dist = Math.hypot(dx, dy) || 0.0001;

      // Move towards player if not in range
      if (dist > this.attackRange) {
        this.x += (dx / dist) * this.speed;
        this.y += (dy / dist) * this.speed;
      } else {
        // Attack
        const now = performance.now();
        if (now - this.lastAttack > this.attackCooldown) {
          damagePlayer(10);
          this.lastAttack = now;
          showDamageText("-10", playerRef.x, playerRef.y, "#ff4d4f");
        }
      }

      // Keep inside bounds
      this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
      this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
    }
    draw(ctx) {
      // body
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();

      // HP bar
      const barW = 22, barH = 4;
      const ratio = this.hp / this.maxHp;
      ctx.fillStyle = "#000";
      ctx.fillRect(this.x - barW / 2, this.y - this.radius - 12, barW, barH);
      ctx.fillStyle = "#ff69b4";
      ctx.fillRect(this.x - barW / 2, this.y - this.radius - 12, barW * ratio, barH);
    }
  }

  function spawnEnemies(n = 3) {
    enemies = [];
    for (let i = 0; i < n; i++) {
      const ex = Math.random() * (canvas.width - 60) + 30;
      const ey = Math.random() * (canvas.height - 60) + 30;
      enemies.push(new Enemy(ex, ey));
    }
    window.enemies = enemies; // for console debug
  }

  /* ----------------------------------------------------------
     🗡️ Player Attack (Spacebar)
  ---------------------------------------------------------- */
  function playerAttack() {
    if (!player) return;
    const now = performance.now();
    if (now - player.lastAttack < player.attackCooldown) return;
    player.lastAttack = now;

    let hits = 0;
    for (const enemy of enemies) {
      const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
      if (dist <= player.attackRange) {
        enemy.hp = Math.max(0, enemy.hp - player.attackDamage);
        showDamageText(`-${player.attackDamage}`, enemy.x, enemy.y, "#ff69b4");
        hits++;
      }
    }
    // Remove dead enemies
    enemies = enemies.filter(e => e.hp > 0);
    window.enemies = enemies;

    // Small mana gain on hit (optional)
    if (hits > 0) {
      player.mana = Math.min(player.maxMana, player.mana + 2 * hits);
      updateManaBar();
    }
  }
  window.playerAttack = playerAttack;

  /* ----------------------------------------------------------
     💥 Damage Player (safe)
  ---------------------------------------------------------- */
  function damagePlayer(amount = 10) {
    if (!player) return;
    player.hp = Math.max(0, player.hp - amount);
    flashPlayerHit();
    updateHPBar();
    if (player.hp <= 0 && !window.__gameOverTriggered) {
      window.__gameOverTriggered = true;
      // If you have a gameover.js trigger, call it here:
      window.triggerGameOver?.();
      // Fallback: alert then reload
      if (!window.triggerGameOver) {
        (window.showAlert || alert)("💀 You were defeated!");
        setTimeout(() => window.location.reload(), 650);
      }
    }
  }
  window.damagePlayer = damagePlayer;

  function flashPlayerHit() {
    if (!player) return;
    const old = player.color;
    player.color = "#ffffff";
    setTimeout(() => (player.color = old), 120);
  }

  /* ==========================================================
     🔁 Main Loop
  ========================================================== */
  function step() {
    if (!exploreRunning || !player) {
      window.exploreFrameId = requestAnimationFrame(step);
      return;
    }

    // Pause movement if overlay is open
    if (uiState === "explore") {
      const spd = (player.currentStats?.speed ?? player.speed) * (keys.shift ? 1.6 : 1);
      if (keys["w"]) player.y -= spd;
      if (keys["s"]) player.y += spd;
      if (keys["a"]) player.x -= spd;
      if (keys["d"]) player.x += spd;

      // Bounds
      player.x = Math.max(player.size / 2, Math.min(canvas.width - player.size / 2, player.x));
      player.y = Math.max(player.size / 2, Math.min(canvas.height - player.size / 2, player.y));

      // Update enemies
      for (const e of enemies) e.update(player);
    }

    // Draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawMap();
    for (const e of enemies) e.draw(ctx);
    drawPlayer();
    updateHPBar();
    updateManaBar();

    window.exploreFrameId = requestAnimationFrame(step);
  }

  /* ==========================================================
     🚀 Start Explore Mode (exposed globally)
  ========================================================== */
  function startExploreGame() {
    if (window.exploreFrameId) cancelAnimationFrame(window.exploreFrameId);
    exploreRunning = false;

    // Build or adopt player
    if (window.player) {
      player = window.player;
      // Position defaults
      if (player.x == null || player.y == null) {
        player.x = canvas.width / 2;
        player.y = canvas.height / 2;
      }
      // Base visuals / stats
      player.size = player.size ?? 15;
      player.color = player.color ?? "#ff69b4";
      player.speed = player.currentStats?.speed ?? player.speed ?? 3;
      player.hp = player.currentStats?.hp ?? player.hp ?? 100;
      player.maxHp = player.currentStats?.hp ?? player.maxHp ?? 100;
      player.mana = player.mana ?? 80;
      player.maxMana = player.maxMana ?? 80;

      // Combat fields
      player.attackRange = player.attackRange ?? 40;
      player.attackDamage = player.attackDamage ?? 15;
      player.attackCooldown = player.attackCooldown ?? 550;
      player.lastAttack = 0;
    } else {
      player = {
        name: "Fallback Hero",
        currentStats: { hp: 100, speed: 3 },
        x: canvas.width / 2,
        y: canvas.height / 2,
        size: 15,
        color: "#ff69b4",
        speed: 3,
        hp: 100, maxHp: 100,
        mana: 80, maxMana: 80,
        attackRange: 40,
        attackDamage: 15,
        attackCooldown: 550,
        lastAttack: 0,
      };
      window.player = player;
    }

    // Spawn enemies if none exist
    if (!enemies || enemies.length === 0) spawnEnemies(4);

    // First draw + run
    drawBackground();
    drawMap();
    drawPlayer();
    updateHPBar();
    updateManaBar();

    exploreRunning = true;
    step();
  }
  window.startExploreGame = startExploreGame;

  /* ==========================================================
     🏰 Return Home (confirm)
  ========================================================== */
  const returnHomeBtn = document.getElementById("return-home");
  if (returnHomeBtn) {
    returnHomeBtn.addEventListener("click", () => {
      (window.showAlert || window.alert)(
        "Are you sure you want to return home? Your current progress will be lost.",
        () => {
          exploreRunning = false;
          cancelAnimationFrame(window.exploreFrameId);
          window.location.reload();
        }
      );
    });
  }

  /* ==========================================================
     🧩 Overlay Controls (Inventory / Settings / Controls / Quests)
  ========================================================== */
  function closeAllOverlays() {
    document
      .querySelectorAll("#inventory-wrapper, #settings-wrapper, #controls-wrapper, #quests-wrapper")
      .forEach((el) => el.classList.remove("active"));
    uiState = "explore";
  }

  // Inventory
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

  // Settings
  const settingsBtn = document.querySelector('.nav-btn[data-action="settings"]');
  const settingsWrapper = document.getElementById("settings-wrapper");
  const closeSettingsBtn = document.getElementById("close-settings");
  function toggleSettings(show) {
    uiState = show ? "settings" : "explore";
    settingsWrapper.classList.toggle("active", show);
  }
  settingsBtn?.addEventListener("click", () => {
    closeAllOverlays();
    toggleSettings(true);
  });
  closeSettingsBtn?.addEventListener("click", () => toggleSettings(false));

  // SFX/Music toggles
  const toggleMusicBtn = document.getElementById("toggle-music");
  toggleMusicBtn?.addEventListener("click", () => {
    const music = document.getElementById("bg-music");
    if (!music) return;
    if (music.paused) { music.play(); toggleMusicBtn.textContent = "On"; }
    else { music.pause(); toggleMusicBtn.textContent = "Off"; }
  });
  const toggleSfxBtn = document.getElementById("toggle-sfx");
  toggleSfxBtn?.addEventListener("click", () => {
    toggleSfxBtn.textContent = toggleSfxBtn.textContent === "On" ? "Off" : "On";
  });

  // Controls (using battle button per your UI)
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

  // Quests
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

}); // DOMContentLoaded



/* ============================================================
   💾 SAVE / LOAD SYSTEM (Global)
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

  localStorage.setItem("olivia_save", JSON.stringify(saveData));
  const key = `olivia_save_${p.name || "Unknown"}`;
  localStorage.setItem(key, JSON.stringify(saveData));

  console.log(`💾 Game saved → "olivia_save" + "${key}"`);
}
window.saveGame = saveGame;

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
    mana: 80,
    maxMana: 80,
    attackRange: 40,
    attackDamage: 15,
    attackCooldown: 550,
    lastAttack: 0,
  };
  window.difficulty = save.difficulty;
  console.log(`🎮 Loaded save for ${window.player.name} (${window.player.classKey}) from "${slotKey}"`);
  return window.player;
}
window.loadGame = loadGame;

// Alias
function loadSpecificSave(key) { return loadGame(key); }
window.loadSpecificSave = loadSpecificSave;

// Auto-save before exit
window.addEventListener("beforeunload", () => {
  if (window.player) saveGame();
});
