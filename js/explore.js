/* ============================================================
   EXPLORE.JS – FULL-SCREEN GRID MAP + SMOOTH MOVEMENT + HP
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("explore-canvas");
  if (!canvas) {
    console.warn("🟡 Explore canvas not found yet.");
    return;
  }

  const ctx = canvas.getContext("2d");

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
  const tileSize = 20; // 🔧 Adjust for grid density (20 = small squares)

  function getMapSize() {
    const cols = Math.ceil(canvas.width / tileSize);
    const rows = Math.ceil(canvas.height / tileSize);
    return { cols, rows };
  }

  /* ============================================================
     PLAYER SETTINGS
  ============================================================ */
  const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 15,
    color: "#ff69b4",
    speed: 3,
    hp: 100,
    maxHp: 100,
  };

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
     UPDATE + DRAW
  ============================================================ */
  function update() {
    if (!exploreRunning) return;

    // Movement input
    if (keys["ArrowUp"]) player.y -= player.speed;
    if (keys["ArrowDown"]) player.y += player.speed;
    if (keys["ArrowLeft"]) player.x -= player.speed;
    if (keys["ArrowRight"]) player.x += player.speed;

    // Keep player inside screen bounds
    player.x = Math.max(player.size / 2, Math.min(canvas.width - player.size / 2, player.x));
    player.y = Math.max(player.size / 2, Math.min(canvas.height - player.size / 2, player.y));

    draw();
    requestAnimationFrame(update);
  }

  /* ============================================================
     DRAW PLAYER + UI
  ============================================================ */
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap();

    // Draw player
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Update player HP UI if it exists
    updateHPBar();
  }

  /* ============================================================
     PLAYER HP UI HANDLER
  ============================================================ */
  function updateHPBar() {
    const hpBar = document.getElementById("player-hp-bar");
    const hpText = document.getElementById("player-hp-text");
    if (!hpBar || !hpText) return;

    const hpPercent = (player.hp / player.maxHp) * 100;
    hpBar.style.width = `${hpPercent}%`;
    hpText.textContent = `HP: ${player.hp} / ${player.maxHp}`;
  }

  /* ============================================================
     START GAME
  ============================================================ */
  function startExploreGame() {
    if (exploreRunning) return;
    exploreRunning = true;
    console.log("🌸 Explore mode started – Full screen active!");
    update();
  }

  // Expose globally for showScreen() controller
  window.startExploreGame = startExploreGame;
});
