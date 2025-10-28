/* ============================================================
   🦄 EXPLORE.JS – Olivia’s World RPG (Core Explore Loop)
   ------------------------------------------------------------
   Responsibilities:
   ✦ Screen entry + canvas setup + resize
   ✦ Player movement (WASD + Shift speed)
   ✦ Draw helpers (background / map / player) for shared canvas
   ✦ Main loop tick (movement + clamping only)
   ✦ Mana regen while exploring
   ✦ Emits "explore:start" so realtime_combat.js can attach
============================================================ */


function updateManaBar() {
    const bar = document.getElementById("player-mana-bar");
    const text = document.getElementById("player-mana-text");
    if (!bar || !text || !player) return;
    const pct = (player.mana / player.maxMana) * 100;
    bar.style.width = `${Math.max(0, pct)}%`;
    text.textContent = `MP: ${player.mana} / ${player.maxMana}`;
  }
  window.updateManaBar = updateManaBar;

function updateHPBar() {
    const bar = document.getElementById("player-hp-bar");
    const text = document.getElementById("player-hp-text");
    if (!bar || !text || !player) return;
    const pct = (player.hp / player.maxHp) * 100;
    bar.style.width = `${Math.max(0, pct)}%`;
    const color =
      pct > 60 ? "linear-gradient(90deg,#00ff00,#32cd32)" :
      pct > 30 ? "linear-gradient(90deg,#ffd700,#ffa500)" :
                 "linear-gradient(90deg,#ff4d4f,#d9363e)";
    bar.style.background = color;
    text.textContent = `HP: ${player.hp} / ${player.maxHp}`;
  }
  window.updateHPBar = updateHPBar;



/* ------------------------------------------------------------
   🌐 Shared State (kept on window for other modules)
------------------------------------------------------------ */
window.uiState         = window.uiState ?? "explore";   // "explore", "inventory", "settings", etc.
window.exploreRunning  = window.exploreRunning === true; // boolean
window.player          = window.player ?? null;          // set by player_data.js or class selection
window.enemies         = window.enemies ?? [];           // owned by realtime_combat.js
let keys               = {};                             // input state (local to this file)

/* ------------------------------------------------------------
   🎨 Canvas + Context (shared to other systems via event)
------------------------------------------------------------ */
let canvas = null;
let ctx    = null;


const testImg = new Image();
testImg.src = "../images/canvasbg.png";  // or whatever relative path you think
testImg.onload = () => {
  console.log("✅ Background image loaded correctly");
  ctx.drawImage(testImg, 0, 0, canvas.width, canvas.height);
};
testImg.onerror = () => console.error("❌ Could not load background image");

/* ------------------------------------------------------------
   ⌨️ Keyboard Input (WASD + Shift)
------------------------------------------------------------ */
window.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
});
window.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

/* ------------------------------------------------------------
   📐 Canvas Sizing
------------------------------------------------------------ */
function resizeCanvas() {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  // Set pixel size to CSS size to keep drawing crisp
  canvas.width  = Math.max(1, Math.floor(rect.width));
  canvas.height = Math.max(1, Math.floor(rect.height));

  // Keep player inside bounds after resize
  const p = window.player;
  if (p) {
    const r = (p.size ?? 15) / 2;
    p.x = Math.max(r, Math.min(canvas.width  - r, p.x ?? canvas.width  / 2));
    p.y = Math.max(r, Math.min(canvas.height - r, p.y ?? canvas.height / 2));
  }
}

/* ------------------------------------------------------------
   🗺️ Simple Map + Draw Helpers (used by combat renderer too)
------------------------------------------------------------ */
const tileSize = 20;

function getMapSize() {
  return {
    cols: Math.ceil((canvas?.width  ?? 0) / tileSize),
    rows: Math.ceil((canvas?.height ?? 0) / tileSize),
  };
}

const bgImage = new Image();
bgImage.src = "../images/canvasbg.png";
bgImage.onload = () => {
  console.log("🖼️ Background image loaded!");
  drawBackground(); // draw once loaded
};

function drawBackground() {
  if (!ctx || !canvas) return;
  if (bgImage.complete && bgImage.naturalWidth > 0) {
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#ffeef6"; // fallback pastel
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function drawMap() {
  if (!ctx || !canvas) return;
  const { cols, rows } = getMapSize();
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      ctx.fillStyle = (x + y) % 2 ? "#fff7da" : "#faf0e6";
      ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }
}

function drawPlayer() {
  if (!ctx || !window.player) return;
  const p = window.player;
  ctx.fillStyle = p.color ?? "#ff69b4";
  ctx.beginPath();
  ctx.arc(p.x ?? 0, p.y ?? 0, (p.size ?? 15) / 2, 0, Math.PI * 2);
  ctx.fill();
}

// Expose for realtime_combat.js
window.drawBackground = drawBackground;
window.drawMap        = drawMap;
window.drawPlayer     = drawPlayer;

/* ------------------------------------------------------------
   💧 Passive Mana Regen (gated by uiState/exploreRunning)
------------------------------------------------------------ */
function startManaRegen() {
  if (window.__manaRegenLoop) clearInterval(window.__manaRegenLoop);
  window.__manaRegenLoop = setInterval(() => {
    if (!window.exploreRunning || window.uiState !== "explore") return;
    const p = window.player;
    if (!p || p.maxMana == null) return;
    if ((p.mana ?? 0) < p.maxMana) {
      p.mana = Math.min(p.maxMana, (p.mana ?? 0) + 1);
      // Call only if present to avoid load-order errors
      window.updateManaBar?.();
    }
  }, 500);
}

/* ------------------------------------------------------------
   🔁 Main Explore Loop (movement + clamping)
   Rendering is handled by realtime_combat.js to avoid double-draw.
------------------------------------------------------------ */
function step() {
  if (!window.exploreRunning) {
    window.exploreFrameId = requestAnimationFrame(step);
    return;
  }

  const p = window.player;
  if (window.uiState === "explore" && p && canvas) {
    // ✅ Fixed-speed movement (no Shift modifier)
    const spd = p.currentStats?.speed ?? p.speed ?? 3;

    // Movement keys
    if (keys["w"]) p.y -= spd;
    if (keys["s"]) p.y += spd;
    if (keys["a"]) p.x -= spd;
    if (keys["d"]) p.x += spd;

    // Clamp to canvas
    const r = (p.size ?? 15) / 2;
    p.x = Math.max(r, Math.min(canvas.width  - r, p.x));
    p.y = Math.max(r, Math.min(canvas.height - r, p.y));
  }

  // Update bars (safe even if handled by combat)
  window.updateHPBar?.();
  window.updateManaBar?.();

  // Continue loop
  window.exploreFrameId = requestAnimationFrame(step);
}


/* ------------------------------------------------------------
   🚀 Start Explore Mode (public)
------------------------------------------------------------ */
function startExploreGame() {
  if (!canvas || !ctx) {
    console.warn("⚠️ Explore: canvas not ready yet.");
    return;
  }

  // Cancel previous loop (if any)
  if (window.exploreFrameId) cancelAnimationFrame(window.exploreFrameId);
  window.exploreRunning = false;

  // Ensure player exists and has sane defaults
  const p = window.player ?? {};
  window.player = {
    name: p.name ?? "Fallback Hero",
    classKey: p.classKey ?? p.classKey,
    currentStats: p.currentStats ?? { hp: 100, speed: 3, mana: 80 },
    x: p.x ?? canvas.width / 2,
    y: p.y ?? canvas.height / 2,
    size: p.size ?? 15,
    color: p.color ?? "#ff69b4",
    hp: p.hp ?? p.currentStats?.hp ?? 100,
    maxHp: p.maxHp ?? p.currentStats?.hp ?? 100,
    mana: p.mana ?? p.currentStats?.mana ?? 80,
    maxMana: p.maxMana ?? p.currentStats?.mana ?? 80,
    attackRange: p.attackRange ?? 40,
    attackDamage: p.attackDamage ?? 15,
    attackCooldown: p.attackCooldown ?? 550,
    lastAttack: 0,
    level: p.level ?? 1,
    experience: p.experience ?? 0,
  };

  // First draw (so the canvas isn't blank for a frame)
  drawBackground();
  drawMap();
  drawPlayer();
  window.updateHPBar?.();
  window.updateManaBar?.();

  // Run systems
  window.exploreRunning = true;
  step();
  startManaRegen();

  // 🔔 Tell realtime_combat.js to attach (bind input, spawn, render)
  window.dispatchEvent(new CustomEvent("explore:start", { detail: { canvas, ctx } }));

  console.log("✅ Explore started.");
}
window.startExploreGame = startExploreGame;

/* ------------------------------------------------------------
   🚪 Enter Explore Screen Helper (optional UX)
------------------------------------------------------------ */
function enterExploreMode() {
  // If you have a screen switcher, use it:
  window.showScreen?.("explore-page");

  // Defer one frame to allow layout to settle, then start
  requestAnimationFrame(() => {
    window.dispatchEvent(new Event("resize")); // triggers resizeCanvas via listener below
    setTimeout(() => {
      if (window.exploreFrameId) cancelAnimationFrame(window.exploreFrameId);
      startExploreGame();
    }, 0);
  });
}
window.enterExploreMode = enterExploreMode;

/* ------------------------------------------------------------
   🧰 DOM Bootstrapping
------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  canvas = document.getElementById("explore-canvas");
  if (!canvas) {
    console.warn("⚠️ Explore: #explore-canvas not found.");
    return;
  }
  ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
  canvas.style.willChange = "transform, contents";
  canvas.style.transform  = "translateZ(0)";

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // If your flow lands directly on explore, auto-start
  const page = document.getElementById("explore-page");
  if (page?.classList.contains("active")) {
    startExploreGame();
  }
});
