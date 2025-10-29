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
  const bar = document.getElementById('player-mana-bar');
  const text = document.getElementById('player-mana-text');
  if (!bar || !text || !player) return;
  const pct = (player.mana / player.maxMana) * 100;
  bar.style.width = `${Math.max(0, pct)}%`;
  text.textContent = `MP: ${player.mana} / ${player.maxMana}`;
}
window.updateManaBar = updateManaBar;

function updateHPBar() {
  const bar = document.getElementById('player-hp-bar');
  const text = document.getElementById('player-hp-text');
  if (!bar || !text || !player) return;
  const pct = (player.hp / player.maxHp) * 100;
  bar.style.width = `${Math.max(0, pct)}%`;
  const color =
    pct > 60 ? 'linear-gradient(90deg,#00ff00,#32cd32)' :
    pct > 30 ? 'linear-gradient(90deg,#ffd700,#ffa500)' :
               'linear-gradient(90deg,#ff4d4f,#d9363e)';
  bar.style.background = color;
  text.textContent = `HP: ${player.hp} / ${player.maxHp}`;
}
window.updateHPBar = updateHPBar;


/* ------------------------------------------------------------
   🌐 Shared State (kept on window for other modules)
------------------------------------------------------------ */
window.uiState         = window.uiState ?? 'explore';   // "explore", "inventory", "settings", etc.
window.exploreRunning  = window.exploreRunning === true; // boolean
window.player          = window.player ?? null;          // set by player_data.js or class selection
window.enemies         = window.enemies ?? [];           // owned by realtime_combat.js
window.keys            = {};                             // input state (global for other systems too)

/* ------------------------------------------------------------
   ⌨️ Keyboard Input (WASD + Shift, Diagonal, Safe)
------------------------------------------------------------ */
const ignoredKeys = ['meta', 'alt', 'control', 'capslock', 'tab'];

window.addEventListener('keydown', (e) => {
  if (!e.key) return;
  const key = e.key.toLowerCase();
  if (ignoredKeys.includes(key)) return;
  keys[key] = true;
});

window.addEventListener('keyup', (e) => {
  if (!e.key) return;
  const key = e.key.toLowerCase();
  if (ignoredKeys.includes(key)) return;
  keys[key] = false;
});

// Prevent “stuck keys” when the window loses focus
window.addEventListener('blur', () => {
  for (let k in keys) keys[k] = false;
});


/* ------------------------------------------------------------
   🎨 Canvas + Context (shared to other systems via event)
------------------------------------------------------------ */
let canvas = null;
let ctx    = null;


/* ------------------------------------------------------------
   📐 Canvas Sizing
------------------------------------------------------------ */
function resizeCanvas() {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  canvas.width  = Math.max(1, Math.floor(rect.width));
  canvas.height = Math.max(1, Math.floor(rect.height));

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
bgImage.src = '../images/canvasbg.png';
bgImage.onload = () => {
  console.log('🖼️ Background image loaded!');
  drawBackground();
};

function drawBackground() {
  if (!ctx || !canvas) return;
  if (bgImage.complete && bgImage.naturalWidth > 0) {
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = '#ffeef6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function drawMap() {
  if (!ctx || !canvas) return;
  const { cols, rows } = getMapSize();
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      ctx.fillStyle = (x + y) % 2 ? '#fff7da' : '#faf0e6';
      ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }
}

function drawPlayer() {
  if (!ctx || !window.player) return;
  const p = window.player;
  ctx.fillStyle = p.color ?? '#ff69b4';
  ctx.beginPath();
  ctx.arc(p.x ?? 0, p.y ?? 0, p.size ?? 15, 0, Math.PI * 2);
  ctx.fill();
}

window.drawBackground = drawBackground;
window.drawMap        = drawMap;
window.drawPlayer     = drawPlayer;


/* ------------------------------------------------------------
   💧 Passive Mana Regen
------------------------------------------------------------ */
function startManaRegen() {
  if (window.__manaRegenLoop) clearInterval(window.__manaRegenLoop);
  window.__manaRegenLoop = setInterval(() => {
    if (!window.exploreRunning || window.uiState !== 'explore') return;
    const p = window.player;
    if (!p || p.maxMana == null) return;
    if (p.mana < p.maxMana) {
      p.mana = Math.min(p.maxMana, p.mana + 1);
      window.updateManaBar?.();
    }
  }, 500);
}


/* ------------------------------------------------------------
   🔁 Main Explore Loop (movement + clamping)
------------------------------------------------------------ */
function step() {
  if (!window.exploreRunning) {
    window.exploreFrameId = requestAnimationFrame(step);
    return;
  }

  const p = window.player;
  if (window.uiState === 'explore' && p && canvas) {
    const spd = p.currentStats?.speed ?? p.speed ?? 3;

    let dx = 0;
    let dy = 0;
    if (keys['w'] || keys['arrowup']) dy -= 1;
    if (keys['s'] || keys['arrowdown']) dy += 1;
    if (keys['a'] || keys['arrowleft']) dx -= 1;
    if (keys['d'] || keys['arrowright']) dx += 1;

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      dx *= Math.SQRT1_2;
      dy *= Math.SQRT1_2;
    }

    // Sprint modifier
    const isSprinting = keys['shift'];
    const moveSpeed = isSprinting ? spd * 1.5 : spd;

    p.x += dx * moveSpeed;
    p.y += dy * moveSpeed;

    // Clamp to canvas
    const r = (p.size ?? 15) / 2;
    p.x = Math.max(r, Math.min(canvas.width  - r, p.x));
    p.y = Math.max(r, Math.min(canvas.height - r, p.y));
  }

  window.updateHPBar?.();
  window.updateManaBar?.();

  window.exploreFrameId = requestAnimationFrame(step);
}


/* ------------------------------------------------------------
   🚀 Start Explore Mode (public)
------------------------------------------------------------ */
function startExploreGame() {
  if (!canvas || !ctx) {
    console.warn('⚠️ Explore: canvas not ready yet.');
    return;
  }

  if (window.exploreFrameId) cancelAnimationFrame(window.exploreFrameId);
  window.exploreRunning = false;

  const p = window.player;
  if (!p) {
    console.error('❌ No Player Found')
    return;
  }

  p.x = p.x ?? canvas.width / 2;
  p.y = p.y ?? canvas.height / 2;
  p.hp = p.hp ?? p.currentStats?.hp ?? 100;
  p.maxHp = p.maxHp ?? p.currentStats?.hp ?? 100;
  p.mana = p.mana ?? p.currentStats?.mana ?? 80;
  p.maxMana = p.maxMana ?? p.currentStats?.mana ?? 80;
  p.lastAttack = p.lastAttack ?? 0;


  drawBackground();
  drawMap();
  drawPlayer();
  window.updateHPBar?.();
  window.updateManaBar?.();
  window.syncPlayerInGame?.();

  window.exploreRunning = true;
  step();
  startManaRegen();

  window.dispatchEvent(new CustomEvent('explore:start', { detail: { canvas, ctx } }));

  console.log('✅ Explore started.');
}
window.startExploreGame = startExploreGame;


/* ------------------------------------------------------------
   🚪 Enter Explore Screen Helper (optional UX)
------------------------------------------------------------ */
function enterExploreMode() {
  window.showScreen?.('explore-page');

  requestAnimationFrame(() => {
    window.dispatchEvent(new Event('resize'));
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
document.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('explore-canvas');
  if (!canvas) {
    console.warn('⚠️ Explore: #explore-canvas not found.');
    return;
  }
  ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
  canvas.style.willChange = 'transform, contents';
  canvas.style.transform  = 'translateZ(0)';

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const page = document.getElementById('explore-page');
  if (page?.classList.contains('active')) {
    startExploreGame();
  }
});


/* ============================================================
   💀 GAME OVER SCREEN – Olivia’s World RPG (Fairy Theme, Fixed)
   ------------------------------------------------------------
   ✦ Pauses gameplay completely
   ✦ Fairy pink glow & fade
   ✦ “OK” now properly returns to landing/start page
============================================================ */
window.showGameOverScreen = function () {
  // Prevent duplicates
  if (document.getElementById('game-over-screen')) return;

  // 🛑 Pause gameplay
  window.exploreRunning = false;
  if (typeof window.stopRespawn === 'function') window.stopRespawn();

  // 💫 Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'game-over-screen';
  overlay.innerHTML = `
    <div class="game-over-content">
      <h1>💀 You Were Defeated 💀</h1>
      <p>Your adventure ends here... for now.</p>
      <button id="gameover-ok-btn">OK</button>
    </div>
  `;
  document.body.appendChild(overlay);

  /* 🌈 Overlay styling */
  Object.assign(overlay.style, {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '100000',
    cursor: 'url("../images/ui/cursor.png"), auto',
    animation: 'fadeIn 0.6s ease'
  });

  /* 🎀 Content box */
  const content = overlay.querySelector('.game-over-content');
  Object.assign(content.style, {
    textAlign: 'center',
    color: '#fff',
    fontFamily: "'Comic Sans MS', cursive",
    padding: '50px 60px',
    border: '4px solid #ff69b4',
    borderRadius: '25px',
    background: 'rgba(255, 192, 203, 0.25)',
    boxShadow: '0 0 25px #ff69b4',
    maxWidth: '480px'
  });

  /* 💖 OK Button */
  const btn = content.querySelector('#gameover-ok-btn');
  Object.assign(btn.style, {
    marginTop: '25px',
    padding: '12px 40px',
    fontSize: '22px',
    borderRadius: '15px',
    border: 'none',
    cursor: 'pointer',
    background: '#ff69b4',
    color: '#fff',
    fontWeight: 'bold',
    boxShadow: '0 0 10px #fff',
    transition: 'all 0.25s ease'
  });
  btn.onmouseenter = () => (btn.style.background = '#ff1493');
  btn.onmouseleave = () => (btn.style.background = '#ff69b4');

  // 💖 OK button logic
  btn.onclick = () => {
    overlay.remove();

    // Reset gameplay flags
    window.__gameOverTriggered = false;
    window.exploreRunning = false;

    // Try to return to your main/landing page
    if (typeof window.showScreen === 'function') {
      window.showScreen('landing-page'); // 👈 Change to your actual landing page ID if needed
    } else {
      // fallback: reload to start fresh
      window.location.reload();
    }
  };

  console.log('💀 Game Over screen displayed — gameplay paused.');
};

/* ✨ Optional fade-in animation */
const style = document.createElement('style');
style.textContent = `
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
`;
document.head.appendChild(style);


/* ============================================================
   🌸 AUTO INTRO MESSAGE ON EXPLORE START
============================================================ */
window.addEventListener("explore:start", () => {
  window.showGameMessage(
    "The air sparkles with magic in the Royal Courtyard..",
    () => {
      console.log("✨ Exploration resumes!");
    }
  );
});