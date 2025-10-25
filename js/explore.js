/* ============================================================
   EXPLORE.JS – FULL-SCREEN GRID MAP + SMOOTH MOVEMENT
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("explore-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  /* ============================================================
     AUTO-SIZE CANVAS TO SCREEN
  ============================================================ */
  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  /* ============================================================
     GRID MAP SETTINGS
  ============================================================ */
  const tileSize = 50; // 🔧 Adjust tile size here for scale

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
    size: 30,
    color: "#ff69b4",
    speed: 4,
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

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap();

    // Draw player
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size / 2, 0, Math.PI * 2);
    ctx.fill();
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

  // Expose globally so showScreen() can call it
  window.startExploreGame = startExploreGame;
});


// Set canvas resolution to match its display size (16:9 ratio)
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);