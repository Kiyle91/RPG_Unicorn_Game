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


/* ------------------------------------------------------------
   📎 Utility: Floating damage text (uses realtime_combat.css)
------------------------------------------------------------ */
function showDamageText(text, x, y, color = "#ff69b4") {
  const div = document.createElement("div");
  div.className = "damage-text";
  div.textContent = text;
  div.style.color = color;
  const canvas = document.getElementById("explore-canvas");
  const rect = canvas.getBoundingClientRect();
  div.style.left = `${rect.left + x}px`;
  div.style.top = `${rect.top + y - 20}px`;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 1000);
}

/* ------------------------------------------------------------
   🌈 Fairy Attack Burst (visual feedback when player attacks)
------------------------------------------------------------ */
function showAttackEffect(x, y) {
  // 💖 Central aura
  const aura = document.createElement("div");
  aura.classList.add("fairy-aura");
  const hue = Math.floor(Math.random() * 360);
  aura.style.setProperty("--aura-color", `hsl(${hue}, 100%, 75%)`);
  aura.style.left = `${x}px`;
  aura.style.top = `${y}px`;
  document.body.appendChild(aura);

  // 🌟 Sparkles around it
  const sparkleCount = 20;
  for (let i = 0; i < sparkleCount; i++) {
    const s = document.createElement("div");
    s.classList.add("fairy-sparkle");
    s.style.setProperty("--sparkle-color", `hsl(${hue}, 100%, 85%)`);
    s.style.left = `${x}px`;
    s.style.top = `${y}px`;
    document.body.appendChild(s);

    const angle = Math.random() * 2 * Math.PI;
    const dist = Math.random() * 60 + 20;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;

    s.animate(
      [
        { transform: `translate(${tx}px, ${ty}px) scale(1)`, opacity: 1 },
        { transform: `translate(${tx * 1.2}px, ${ty * 1.2}px) scale(0.2)`, opacity: 0 },
      ],
      { duration: 600 + Math.random() * 300, easing: "linear", fill: "forwards" }
    );

    setTimeout(() => s.remove(), 800);
  }

  // remove aura after burst
  aura.animate(
    [
      { transform: "translate(-50%, -50%) scale(0.8)", opacity: 1 },
      { transform: "translate(-50%, -50%) scale(1.6)", opacity: 0 }
    ],
    { duration: 700, easing: "ease-out", fill: "forwards" }
  );
  setTimeout(() => aura.remove(), 700);
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
     📐 Canvas Resize
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
   ⌨️ Input (Keyboard + Mouse)
---------------------------------------------------------- */
keys = {};

// 🎹 Keyboard Controls
window.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;

  if (e.key === "Shift") keys.shift = true;

  // 🗡️ Spacebar = Melee Attack
  if (e.code === "Space" && uiState === "explore") {
    e.preventDefault();
    playerAttack(); // uses melee logic already in your game
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
  if (e.key === "Shift") keys.shift = false;
});

/* ----------------------------------------------------------
   🖱️ Mouse Click = Ranged Magic Attack
---------------------------------------------------------- */
canvas.addEventListener("click", (e) => {
  if (uiState !== "explore" || !exploreRunning || !player) return;

  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  // 🌈 Unique ranged effect (lighter, more magical)
  const aura = document.createElement("div");
  aura.classList.add("fairy-aura");
  const hue = Math.floor(Math.random() * 360);
  aura.style.setProperty("--aura-color", `hsl(${hue}, 100%, 80%)`);
  aura.style.left = `${e.clientX}px`;
  aura.style.top = `${e.clientY}px`;
  document.body.appendChild(aura);

  aura.animate(
    [
      { transform: "translate(-50%, -50%) scale(0.3)", opacity: 1 },
      { transform: "translate(-50%, -50%) scale(1.2)", opacity: 0.8 },
      { transform: "translate(-50%, -50%) scale(2.5)", opacity: 0 },
    ],
    { duration: 800, easing: "ease-out", fill: "forwards" }
  );
  setTimeout(() => aura.remove(), 700);

  // 🌟 Small sparkles that scatter outward
  for (let i = 0; i < 15; i++) {
    const sparkle = document.createElement("div");
    sparkle.classList.add("fairy-sparkle");
    sparkle.style.setProperty("--sparkle-color", `hsl(${hue + Math.random() * 30 - 15}, 100%, 85%)`);
    sparkle.style.left = `${e.clientX}px`;
    sparkle.style.top = `${e.clientY}px`;
    document.body.appendChild(sparkle);

    const angle = Math.random() * Math.PI * 2;
    const dist = 50 + Math.random() * 30;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;

    sparkle.animate(
      [
        { transform: `translate(-50%, -50%) scale(1)`, opacity: 1 },
        { transform: `translate(${tx}px, ${ty}px) scale(0.1)`, opacity: 0 },
      ],
      { duration: 700 + Math.random() * 200, easing: "ease-out", fill: "forwards" }
    );

    setTimeout(() => sparkle.remove(), 800);
  }

  /* 🎯 Ranged Attack Logic */
  const rangedDamage = player.ranged ?? 10; // fallback in case stat missing
  const range = player.attackRange * 2; // longer range for magic
  let hitEnemy = false;

  enemies.forEach((enemy) => {
    const dist = Math.hypot(enemy.x - clickX, enemy.y - clickY);
    if (dist <= range) {
      enemy.hp = Math.max(0, enemy.hp - rangedDamage);
      showDamageText(`-${rangedDamage}`, enemy.x, enemy.y, "#87cefa"); // blue damage text for ranged
      hitEnemy = true;
    }
  });

  // 💀 Remove dead enemies
  enemies = enemies.filter((e) => e.hp > 0);

  // 🔵 Use mana when casting
  if (player.mana > 0) player.mana = Math.max(0, player.mana - 5);
  updateManaBar();

  // 🔮 Refund small mana if hit
  if (hitEnemy) {
    player.mana = Math.min(player.maxMana, player.mana + 1);
    updateManaBar();
  }
});


/* ----------------------------------------------------------
   ⌨️ Input (Keyboard + Mouse)
---------------------------------------------------------- */
keys = {};

// 🎹 Keyboard Controls — Melee Attack
window.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;

  if (e.key === "Shift") keys.shift = true;

  // 🗡️ Spacebar = Melee Attack (uses attackDamage + mana)
  if (e.code === "Space" && uiState === "explore") {
    e.preventDefault();

    const manaCost = 8;
    if (!player || player.mana < manaCost) {
      showNoManaEffect();
      return;
    }

    player.mana = Math.max(0, player.mana - manaCost);
    updateManaBar();

    playerAttack(); // melee attack logic
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
  if (e.key === "Shift") keys.shift = false;
});

/* ----------------------------------------------------------
   🖱️ Mouse Click = Ranged Magic Attack (uses ranged stat)
---------------------------------------------------------- */
canvas.addEventListener("click", (e) => {
  if (uiState !== "explore" || !exploreRunning || !player) return;

  const manaCost = 10;
  if (player.mana < manaCost) {
    showNoManaEffect(e.clientX, e.clientY);
    return;
  }

  // 💫 Spend mana for ranged attack
  player.mana = Math.max(0, player.mana - manaCost);
  updateManaBar();

  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  // 🌈 Unique blue/purple effect for ranged attacks
  showRangedEffect(e.clientX, e.clientY);

  // 🎯 Deal ranged damage
  const rangedDamage = player.ranged ?? 12;
  const range = player.attackRange * 2.2;
  let hitEnemy = false;

  enemies.forEach((enemy) => {
    const dist = Math.hypot(enemy.x - clickX, enemy.y - clickY);
    if (dist <= range) {
      enemy.hp = Math.max(0, enemy.hp - rangedDamage);
      showDamageText(`-${rangedDamage}`, enemy.x, enemy.y, "#87cefa");
      hitEnemy = true;
    }
  });

  enemies = enemies.filter((e) => e.hp > 0);

  if (hitEnemy) {
    player.mana = Math.min(player.maxMana, player.mana + 3);
    updateManaBar();
  }
});

/* ----------------------------------------------------------
   ✨ Magic Effects Helpers
---------------------------------------------------------- */

// 🩵 Out of Mana Puff
function showNoManaEffect(x = window.innerWidth / 2, y = window.innerHeight / 2) {
  const puff = document.createElement("div");
  puff.classList.add("fairy-aura");
  puff.style.setProperty("--aura-color", "rgba(180, 200, 255, 0.6)");
  puff.style.left = `${x}px`;
  puff.style.top = `${y}px`;
  document.body.appendChild(puff);
  puff.animate(
    [
      { transform: "translate(-50%, -50%) scale(0.6)", opacity: 1 },
      { transform: "translate(-50%, -50%) scale(1.4)", opacity: 0 },
    ],
    { duration: 600, easing: "ease-out", fill: "forwards" }
  );
  setTimeout(() => puff.remove(), 600);
}

// 💫 Blue/Purple Ranged Magic Effect
function showRangedEffect(x, y) {
  const aura = document.createElement("div");
  aura.classList.add("fairy-aura");
  const hue = 220 + Math.floor(Math.random() * 60); // blue/purple range
  aura.style.setProperty("--aura-color", `hsl(${hue}, 100%, 70%)`);
  aura.style.left = `${x}px`;
  aura.style.top = `${y}px`;
  document.body.appendChild(aura);

  aura.animate(
    [
      { transform: "translate(-50%, -50%) scale(0.5)", opacity: 1 },
      { transform: "translate(-50%, -50%) scale(2)", opacity: 0 },
    ],
    { duration: 800, easing: "ease-out", fill: "forwards" }
  );
  setTimeout(() => aura.remove(), 700);

  // Scatter sparkles
  for (let i = 0; i < 16; i++) {
    const sparkle = document.createElement("div");
    sparkle.classList.add("fairy-sparkle");
    sparkle.style.setProperty("--sparkle-color", `hsl(${hue + Math.random() * 30 - 15}, 100%, 80%)`);
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    document.body.appendChild(sparkle);

    const angle = Math.random() * Math.PI * 2;
    const dist = 50 + Math.random() * 40;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;

    sparkle.animate(
      [
        { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
        { transform: `translate(${tx}px, ${ty}px) scale(0.1)`, opacity: 0 },
      ],
      { duration: 700 + Math.random() * 200, easing: "ease-out", fill: "forwards" }
    );
    setTimeout(() => sparkle.remove(), 800);
  }
}


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

  function drawBackground() {
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
      if (dist > this.attackRange) {
        this.x += (dx / dist) * this.speed;
        this.y += (dy / dist) * this.speed;
      } else {
        const now = performance.now();
        if (now - this.lastAttack > this.attackCooldown) {
          damagePlayer(3);
          this.lastAttack = now;
        }
      }
      this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
      this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
    }
    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
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
    window.enemies = enemies;
  }

  /* ----------------------------------------------------------
     🗡️ Player Attack
  ---------------------------------------------------------- */
  function playerAttack() {
    if (!player) return;
    const now = performance.now();
    if (now - player.lastAttack < player.attackCooldown) return;
    player.lastAttack = now;
    const canvas = document.getElementById("explore-canvas");
    const rect = canvas.getBoundingClientRect();
    showAttackEffect(rect.left + player.x, rect.top + player.y);

    player.mana = Math.max(0, player.mana - 3);
    updateManaBar();

    let hits = 0;
    for (const enemy of enemies) {
      const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
      if (dist <= player.attackRange) {
        enemy.hp = Math.max(0, enemy.hp - player.attackDamage);
        hits++;
      }
    }
    enemies = enemies.filter(e => e.hp > 0);
    if (hits > 0) {
      player.mana = Math.min(player.maxMana, player.mana + 2 * hits);
      updateManaBar();
    }
  }
  
  window.playerAttack = playerAttack;

  /* ----------------------------------------------------------
     💥 Damage Player
  ---------------------------------------------------------- */
  function damagePlayer(amount = 10) {
    if (!player) return;
    player.hp = Math.max(0, player.hp - amount);
    flashPlayerHit();
    updateHPBar();
    if (player.hp <= 0 && !window.__gameOverTriggered) {
      window.__gameOverTriggered = true;
      window.triggerGameOver?.();
      if (!window.triggerGameOver) {
        (window.showAlert || alert)("💀 You were defeated!");
        setTimeout(() => window.location.reload(), 650);
      }
    }
  }
  window.damagePlayer = damagePlayer;

  function flashPlayerHit() {
    if (!player) return;
    if (!player.baseColor) player.baseColor = player.color || "#ff69b4";
    if (player.__isFlashing) return;
    player.__isFlashing = true;
    player.color = "#ffffff";
    setTimeout(() => {
      player.color = player.baseColor;
      player.__isFlashing = false;
    }, 120);
  }

  /* ==========================================================
     🔁 Main Loop
  ========================================================== */
  /* ============================================================
   🔵 Passive Mana Regeneration
  ============================================================ */
  function startManaRegen() {
    if (!player) return;
    // Clear old regen loop if any (avoid stacking)
    if (window.__manaRegenLoop) clearInterval(window.__manaRegenLoop);

    window.__manaRegenLoop = setInterval(() => {
      if (!exploreRunning || uiState !== "explore" || !player) return;
      if (player.mana < player.maxMana) {
        player.mana = Math.min(player.maxMana, player.mana + 1); // 💧 +1 per second
        updateManaBar();
      }
    }, 2000); // every second
  }

  
  function step() {
    if (!exploreRunning || !player) {
      window.exploreFrameId = requestAnimationFrame(step);
      return;
    }
    if (uiState === "explore") {
      const spd = (player.currentStats?.speed ?? player.speed) * (keys.shift ? 1.6 : 1);
      if (keys["w"]) player.y -= spd;
      if (keys["s"]) player.y += spd;
      if (keys["a"]) player.x -= spd;
      if (keys["d"]) player.x += spd;
      player.x = Math.max(player.size / 2, Math.min(canvas.width - player.size / 2, player.x));
      player.y = Math.max(player.size / 2, Math.min(canvas.height - player.size / 2, player.y));
      for (const e of enemies) e.update(player);
    }
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
     🚀 Start Explore Mode
  ========================================================== */
  function startExploreGame() {
    if (window.exploreFrameId) cancelAnimationFrame(window.exploreFrameId);
    exploreRunning = false;
    if (window.player) {
      player = window.player;
      if (player.x == null || player.y == null) {
        player.x = canvas.width / 2;
        player.y = canvas.height / 2;
      }
      player.size = player.size ?? 15;
      player.color = player.color ?? "#ff69b4";
      player.speed = player.currentStats?.speed ?? player.speed ?? 3;
      player.hp = player.currentStats?.hp ?? player.hp ?? 100;
      player.maxHp = player.currentStats?.hp ?? player.maxHp ?? 100;
      player.mana = player.mana ?? 80;
      player.maxMana = player.maxMana ?? 80;
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
        hp: 100,
        maxHp: 100,
        mana: 80,
        maxMana: 80,
        attackRange: 40,
        attackDamage: 15,
        attackCooldown: 550,
        lastAttack: 0,
      };
      window.player = player;
    }
    setInterval(() => {
      if (!enemies || enemies.length === 0) {spawnEnemies(1);}}, 6000);
    drawBackground();
    drawMap();
    drawPlayer();
    updateHPBar();
    updateManaBar();
    exploreRunning = true;
    step();
    startManaRegen();
  }
  window.startExploreGame = startExploreGame;

/* ==========================================================
   🏰 Return Home (Pause + Confirmation + Safe Resume)
========================================================== */
const returnHomeBtn = document.getElementById("return-home");
if (returnHomeBtn) {
  returnHomeBtn.addEventListener("click", () => {
    // 🧩 Pause game while confirming
    exploreRunning = false;
    uiState = "paused";
    console.log("⏸️ Game paused — waiting for home confirmation.");

    (window.showAlert || window.alert)(
      "Are you sure you want to return home? Your current progress will be lost.",
      // ✅ On Confirm → end game and reload
      () => {
        cancelAnimationFrame(window.exploreFrameId);
        console.log("🏰 Returning home — reloading game.");
        window.location.reload();
      },
      // ❌ On Cancel → resume game safely
      () => {
        if (window.exploreFrameId) cancelAnimationFrame(window.exploreFrameId);
        exploreRunning = true;
        uiState = "explore";
        window.exploreFrameId = requestAnimationFrame(step);
        console.log("▶️ Return home cancelled — game resumed safely.");
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

  const toggleSfxBtn = document.getElementById("toggle-sfx");
  toggleSfxBtn?.addEventListener("click", () => {
    toggleSfxBtn.textContent =
      toggleSfxBtn.textContent === "On" ? "Off" : "On";
  });

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

  /* ----------------------------------------------------------
     🔁 RESTART BUTTON (uses loadGame logic)
  ---------------------------------------------------------- */
  if (restartGameBtn) {
    restartGameBtn.addEventListener("click", () => {
      if (typeof window.loadGame !== "function") {
        console.error("❌ loadGame() not defined globally.");
        (window.showAlert || alert)("⚠️ Load function missing!");
        return;
      }

      console.log("🔁 Restart button clicked — attempting reload...");
      const loaded = window.loadGame?.();
      if (!loaded) {
        (window.showAlert || alert)("⚠️ No save data found!");
        return;
      }

      // ✅ Confirmation → Close Settings → Resume Explore mode
      (window.showAlert || alert)(
        `🌸 Welcome back, ${loaded.name}!`,
        () => {
          settingsWrapper?.classList.remove("active");
          uiState = "explore";
          exploreRunning = true;
          cancelAnimationFrame?.(window.exploreFrameId);
          showScreen?.("explore-page");
          setTimeout(() => startExploreGame?.(), 250);
          console.log("🔄 Restart complete — game resumed.");
        }
      );
    });
  }

  console.log("✅ Save/Restart buttons initialized (auto-close + resume).");
});
