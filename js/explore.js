/* ============================================================
   EXPLORE.JS – FULL-SCREEN GRID MAP + SMOOTH MOVEMENT + UI INTEGRATION
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("explore-canvas");
  if (!canvas) return;

  // ⚡ Use GPU-optimized 2D context
  const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });

  /* ============================================================
     AUTO-SIZE CANVAS TO SCREEN
  ============================================================ */
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  /* ============================================================
     GRID MAP SETTINGS
  ============================================================ */
  const tileSize = 20; // 🔧 Adjust for density
  function getMapSize() {
    const cols = Math.ceil(canvas.width / tileSize);
    const rows = Math.ceil(canvas.height / tileSize);
    return { cols, rows };
  }

  /* ============================================================
     PLAYER INITIALIZATION
  ============================================================ */
  let player = null;
  const keys = {};
  let exploreRunning = false;
  window.addEventListener("keydown", (e) => (keys[e.key] = true));
  window.addEventListener("keyup", (e) => (keys[e.key] = false));

  /* ============================================================
     DRAW GRID MAP
  ============================================================ */
  function drawMap() {
    const { cols, rows } = getMapSize();
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        ctx.fillStyle = (x + y) % 2 ? "#fffacd" : "#faf0e6";
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        ctx.strokeStyle = "rgba(255,105,180,0.15)";
        ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
  }

  /* ============================================================
     UPDATE + DRAW LOOP
  ============================================================ */
  function update() {
    if (!exploreRunning || !player) return;

    // Movement input
    if (keys["ArrowUp"]) player.y -= player.speed;
    if (keys["ArrowDown"]) player.y += player.speed;
    if (keys["ArrowLeft"]) player.x -= player.speed;
    if (keys["ArrowRight"]) player.x += player.speed;

    // Keep player inside bounds
    player.x = Math.max(player.size / 2, Math.min(canvas.width - player.size / 2, player.x));
    player.y = Math.max(player.size / 2, Math.min(canvas.height - player.size / 2, player.y));

    draw();
    window.exploreFrameId = requestAnimationFrame(update);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap();

    if (!player) return;

    // Draw player
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size / 2, 0, Math.PI * 2);
    ctx.fill();

    updateHPBar();
  }

  /* ============================================================
     HP BAR HANDLER
  ============================================================ */
  function updateHPBar() {
    const hpBar = document.getElementById("player-hp-bar");
    const hpText = document.getElementById("player-hp-text");
    if (!hpBar || !hpText || !player) return;

    const hpPercent = (player.hp / player.maxHp) * 100;
    hpBar.style.width = `${hpPercent}%`;
    hpText.textContent = `HP: ${player.hp} / ${player.maxHp}`;
  }

  /* ============================================================
     START EXPLORE MODE
  ============================================================ */
  function startExploreGame() {
    if (exploreRunning) return;

    if (window.player) {
      console.log("🎀 Using existing player data from class selection");
      player = window.player;
      player.x = canvas.width / 2;
      player.y = canvas.height / 2;
      player.size = 15;
      player.color = "#ff69b4";
      player.speed = player.currentStats?.speed || 3;
      player.hp = player.currentStats?.hp || 100;
      player.maxHp = player.currentStats?.hp || 100;
    } else {
      console.warn("⚠️ No class data found — creating fallback player");
      player = {
        name: "Fallback Hero",
        classKey: "glitterGuardian",
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

    updateHPBar();
    exploreRunning = true;
    console.log("🌸 Explore mode started – Full screen active!");
    update();
  }

  window.startExploreGame = startExploreGame;

  /* ============================================================
     DEBUG COMMANDS
  ============================================================ */
  window.setHP = (value) => {
    if (!window.player) return console.warn("⚠️ Player not initialized!");
    player.hp = Math.max(0, Math.min(player.maxHp, value));
    updateHPBar();
    console.log(`❤️ HP set to ${player.hp}/${player.maxHp}`);
  };

  window.damage = (amount = 10) => {
    if (!window.player) return console.warn("⚠️ Player not initialized!");
    player.hp = Math.max(0, player.hp - amount);
    updateHPBar();
    console.log(`💔 Took ${amount} damage → ${player.hp}/${player.maxHp}`);
  };

  window.heal = (amount = 10) => {
    if (!window.player) return console.warn("⚠️ Player not initialized!");
    player.hp = Math.min(player.maxHp, player.hp + amount);
    updateHPBar();
    console.log(`💖 Healed ${amount} → ${player.hp}/${player.maxHp}`);
  };
});

/* ============================================================
   🛑 UNIVERSAL GAME TERMINATION FUNCTION
   ============================================================ */

function terminateGame(callback) {
  console.log("💀 Terminating game...");

  // 1️⃣ Stop explore loop
  if (typeof exploreRunning !== "undefined") exploreRunning = false;
  if (window.exploreFrameId) {
    cancelAnimationFrame(window.exploreFrameId);
    window.exploreFrameId = null;
  }

  // 2️⃣ Stop all audio
  document.querySelectorAll("audio").forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });

  // 3️⃣ Clear and disable the canvas
  const canvas = document.getElementById("explore-canvas");
  if (canvas?.getContext) {
    const ctx = canvas.getContext("2d", { alpha: false });
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "-1";
    canvas.style.position = "relative";
  }

  // 4️⃣ Hide all screens
  document.querySelectorAll(".screen.active").forEach(s => s.classList.remove("active"));

  // 5️⃣ Reset data
  window.player = null;
  window.selectedClass = null;
  window.selectedDifficulty = null;
  window.currentStoryStep = null;

  // 6️⃣ Wait for GPU flush
  setTimeout(() => {
    console.log("✅ Game fully terminated.");
    if (typeof callback === "function") callback();
  }, 150);
}

/* ============================================================
   INVENTORY NAVIGATION
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const inventoryBtn = document.getElementById("open-inventory");
  const inventoryPage = document.getElementById("inventory-page");
  const explorePage = document.getElementById("explore-page");
  const backBtn = document.getElementById("back-to-explore");

  if (!inventoryBtn || !inventoryPage || !explorePage) {
    console.warn("⚠️ Missing one or more elements for inventory toggle.");
    return;
  }

  // 👜 Open inventory
  inventoryBtn.addEventListener("click", () => {
    console.log("🎒 Opening inventory page...");
    explorePage.classList.remove("active");
    inventoryPage.classList.add("active");
    if (typeof exploreRunning !== "undefined") exploreRunning = false; // pause
  });

  // ⬅️ Back to explore
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      console.log("⬅️ Returning to explore page...");
      inventoryPage.classList.remove("active");
      explorePage.classList.add("active");
      if (typeof exploreRunning !== "undefined") exploreRunning = true;
      requestAnimationFrame(update);
    });
  }

  // ESC closes inventory
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && inventoryPage.classList.contains("active")) {
      inventoryPage.classList.remove("active");
      explorePage.classList.add("active");
    }
  });
});

/* ============================================================
   🏰 RETURN HOME BUTTON – TERMINATE GAME & GO TO LANDING
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const returnHomeBtn = document.getElementById("return-home");
  const landingPage = document.getElementById("landing-page");
  if (!returnHomeBtn || !landingPage) return;

  returnHomeBtn.addEventListener("click", () => {
    console.log("🏰 Returning to landing page...");
    terminateGame(() => {
      landingPage.classList.add("active");
      window.scrollTo({ top: 0, behavior: "auto" });
      console.log("🌸 Landing page now visible after full termination.");
    });
  });

  // ESC also terminates and returns home
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") returnHomeBtn.click();
  });
});
