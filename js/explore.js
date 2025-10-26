/* ============================================================
   EXPLORE.JS – GRID MAP + MOVEMENT + INVENTORY OVERLAY
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("explore-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
  canvas.style.willChange = "transform, contents";
  canvas.style.transform = "translateZ(0)";

  /* ============================================================
     RESIZE HANDLER
  ============================================================ */
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  /* ============================================================
     MAP + PLAYER
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
  let uiState = "explore"; // 🧭 Manage overlay (explore/inventory)

  window.addEventListener("keydown", (e) => (keys[e.key] = true));
  window.addEventListener("keyup", (e) => (keys[e.key] = false));

  /* ============================================================
     DRAW FUNCTIONS
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
     MAIN LOOP
  ============================================================ */
  function update() {
    if (!exploreRunning || !player) return;

    // Pause movement when inventory is open
    if (uiState === "inventory") {
      draw();
      window.exploreFrameId = requestAnimationFrame(update);
      return;
    }

    // WASD Movement
    if (keys["w"]) player.y -= player.speed;
    if (keys["s"]) player.y += player.speed;
    if (keys["a"]) player.x -= player.speed;
    if (keys["d"]) player.x += player.speed;

    // Keep inside map bounds
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
     START EXPLORE
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
      // Fallback player (if none defined)
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

    drawMap(); // Prewarm GPU
    updateHPBar();
    exploreRunning = true;
    update();
  }
  window.startExploreGame = startExploreGame;

  /* ============================================================
     INVENTORY TOGGLE (In-Explore Overlay)
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
     RETURN HOME HANDLER (With Confirmation Prompt)
  ============================================================ */
  const returnHomeBtn = document.getElementById("return-home");

  if (returnHomeBtn) {
    returnHomeBtn.addEventListener("click", () => {
      console.log("🏰 Return Home button clicked.");

      // 🩷 Use your custom alert box if available
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
        // 🧩 Fallback native confirm if custom alert missing
        const confirmExit = confirm(
          "Are you sure you want to return home? Your progress will be lost."
        );
        if (confirmExit) {
          terminateGame(() => {
            window.location.reload();
          });
        }
      }
    });
  }

  /* ============================================================
     TERMINATE GAME
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

  // Expose for debugging
  window.terminateGame = terminateGame;
});
