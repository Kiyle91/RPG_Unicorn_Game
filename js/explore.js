/* ============================================================
   EXPLORE.JS – FULL-SCREEN GRID MAP + SMOOTH MOVEMENT + HP + CLASS INTEGRATION
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("explore-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d")
;

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
     PLAYER INITIALIZATION (wait until explore starts)
  ============================================================ */
  let player = null;
  const keys = {};
  window.addEventListener("keydown", (e) => (keys[e.key] = true));
  window.addEventListener("keyup", (e) => (keys[e.key] = false));

  let exploreRunning = false;

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
    if (document.getElementById("inventory-page").classList.contains("active")) return; // 🧩 pause when inventory open

    // Movement input
    if (keys["ArrowUp"]) player.y -= player.speed;
    if (keys["ArrowDown"]) player.y += player.speed;
    if (keys["ArrowLeft"]) player.x -= player.speed;
    if (keys["ArrowRight"]) player.x += player.speed;

    // Keep player inside bounds
    player.x = Math.max(player.size / 2, Math.min(canvas.width - player.size / 2, player.x));
    player.y = Math.max(player.size / 2, Math.min(canvas.height - player.size / 2, player.y));

    draw();
    requestAnimationFrame(update);
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

    // Safely set up player
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

    // Initialize HP bar
    updateHPBar();

    // Expose globally for console control
    window.player = player;

    exploreRunning = true;
    console.log("🌸 Explore mode started – Full screen active!");
    update();
  }

  window.startExploreGame = startExploreGame;

  /* ============================================================
     CONSOLE DEBUG TOOLS
  ============================================================ */
showStats

  window.setHP = (value) => {
    if (!window.player) return console.warn("⚠️ Player not initialized yet!");
    player.hp = Math.max(0, Math.min(player.maxHp, value));
    updateHPBar();
    console.log(`❤️ HP set to ${player.hp}/${player.maxHp}`);
  };

  window.damage = (amount = 10) => {
    if (!window.player) return console.warn("⚠️ Player not initialized yet!");
    player.hp = Math.max(0, player.hp - amount);
    updateHPBar();
    console.log(`💔 Took ${amount} damage → ${player.hp}/${player.maxHp}`);
  };

  window.heal = (amount = 10) => {
    if (!window.player) return console.warn("⚠️ Player not initialized yet!");
    player.hp = Math.min(player.maxHp, player.hp + amount);
    updateHPBar();
    console.log(`💖 Healed ${amount} → ${player.hp}/${player.maxHp}`);
  };

  window.boost = (stat, value) => {
    if (!window.player) return console.warn("⚠️ Player not initialized yet!");
    if (!(stat in player)) return console.warn(`⚠️ Unknown stat: ${stat}`);
    player[stat] = value;
    console.log(`✨ ${stat} set to ${value}`);
    showStats();
  };
});


/* ============================================================
   EXPLORE NAVIGATION – OPEN INVENTORY SCREEN
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
  });

  // ⬅️ Back to explore
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      console.log("⬅️ Returning to explore page...");
      inventoryPage.classList.remove("active");
      explorePage.classList.add("active");
    });
  }

  // ESC key also closes inventory
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && inventoryPage.classList.contains("active")) {
      inventoryPage.classList.remove("active");
      explorePage.classList.add("active");
    }
  });
});
