/* ============================================================
   🦄 EXPLORE.JS – Olivia’s World RPG (Core Explore Loop)
   ------------------------------------------------------------
   ✦ Handles player movement, sprite rendering, and HUD updates
   ✦ Fixes sticky keys + ensures consistent sprite size on reload
   ✦ Integrates with save/load + enemy systems
============================================================ */

/* ------------------------------------------------------------
   ❤️ UI BARS
------------------------------------------------------------ */
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
   🌐 Shared State
------------------------------------------------------------ */
window.uiState        = window.uiState ?? 'explore';
window.exploreRunning = window.exploreRunning === true;
window.player         = window.player ?? null;
window.enemies        = window.enemies ?? [];
window.keys           = {};

/* ------------------------------------------------------------
   ⌨️ Input + Sticky-Key Prevention
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

window.addEventListener('blur', () => {
  for (let k in keys) keys[k] = false;
});

function resetKeys() {
  for (const k in keys) keys[k] = false;
}
window.resetKeys = resetKeys;

window.addEventListener('visibilitychange', () => {
  if (document.hidden) resetKeys();
});

/* ------------------------------------------------------------
   🎨 Canvas Setup
------------------------------------------------------------ */
let canvas = null;
let ctx = null;

function resizeCanvas() {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.floor(rect.width));
  canvas.height = Math.max(1, Math.floor(rect.height));

  const p = window.player;
  if (p) {
    const r = (p.size ?? 64) / 2;
    p.x = Math.max(r, Math.min(canvas.width - r, p.x ?? canvas.width / 2));
    p.y = Math.max(r, Math.min(canvas.height - r, p.y ?? canvas.height / 2));
  }
}

/* ------------------------------------------------------------
   🗺️ Map + Draw Helpers
------------------------------------------------------------ */
const tileSize = 20;
function getMapSize() {
  return {
    cols: Math.ceil((canvas?.width ?? 0) / tileSize),
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


/* ------------------------------------------------------------
   🧍 Draw Player (Sprite-Based)
------------------------------------------------------------ */
function drawPlayer() {
  if (!ctx || !window.player) return;
  const p = window.player;

  const spriteMap = {
    glitterGuardian: '../images/glitter_sprite.png',
    starSage: '../images/star_sprite.png',
    moonflower: '../images/moon_sprite.png',
    silverArrow: '../images/silver_sprite.png',
  };

  const sizeMap = {
    glitterGuardian: 72,
    starSage: 68,
    moonflower: 70,
    silverArrow: 66,
  };

  if (!p.sprite) {
    const img = new Image();
    img.src = spriteMap[p.classKey] || '../images/glitter_sprite.png';
    p.sprite = img;
  }

  const size = p.size ?? sizeMap[p.classKey] ?? 64;
  const half = size / 2;
  const sprite = p.sprite;

  if (sprite.complete) {
    ctx.save();
    ctx.shadowColor = 'rgba(255,255,255,0.6)';
    ctx.shadowBlur = 15;
    ctx.drawImage(sprite, p.x - half, p.y - half, size, size);
    ctx.shadowBlur = 0;
    ctx.restore();
  } else {
    ctx.fillStyle = '#ff69b4';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 15, 0, Math.PI * 2);
    ctx.fill();
  }
}

window.drawBackground = drawBackground;
window.drawPlayer = drawPlayer;

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
   🔁 Main Explore Loop
------------------------------------------------------------ */
function step() {
  if (!window.exploreRunning) {
    window.exploreFrameId = requestAnimationFrame(step);
    return;
  }

  const p = window.player;
  if (window.uiState === 'explore' && p && canvas) {
    const spd = p.currentStats?.speed ?? p.speed ?? 3;
    let dx = 0, dy = 0;

    if (keys['w'] || keys['arrowup']) dy -= 1;
    if (keys['s'] || keys['arrowdown']) dy += 1;
    if (keys['a'] || keys['arrowleft']) dx -= 1;
    if (keys['d'] || keys['arrowright']) dx += 1;
    if (dx !== 0 && dy !== 0) { dx *= Math.SQRT1_2; dy *= Math.SQRT1_2; }

    const isSprinting = keys['shift'];
    const moveSpeed = isSprinting ? spd * 1.5 : spd;
    p.x += dx * moveSpeed;
    p.y += dy * moveSpeed;

    const r = (p.size ?? 64) / 2;
    p.x = Math.max(r, Math.min(canvas.width - r, p.x));
    p.y = Math.max(r, Math.min(canvas.height - r, p.y));
  }

  drawBackground();
  drawPlayer();
  window.updateHPBar?.();
  window.updateManaBar?.();
  window.exploreFrameId = requestAnimationFrame(step);
}

/* ------------------------------------------------------------
   🚀 Start Explore Mode
------------------------------------------------------------ */
function startExploreGame() {
  if (!canvas || !ctx) {
    console.warn('⚠️ Explore: canvas not ready yet.');
    return;
  }
  if (window.exploreFrameId) cancelAnimationFrame(window.exploreFrameId);
  window.exploreRunning = false;

  const p = window.player;
  if (!p) { console.error('❌ No Player Found'); return; }

  // 🌈 Safety fix for older save data – force correct sprite size
  const sizeMap = {
    glitterGuardian: 72,
    starSage: 68,
    moonflower: 70,
    silverArrow: 66,
  };
  if (!p.size || p.size < 32) {
    p.size = sizeMap[p.classKey] ?? 64;
  }

  p.x ??= canvas.width / 2;
  p.y ??= canvas.height / 2;
  p.hp ??= p.currentStats?.hp ?? 100;
  p.maxHp ??= p.currentStats?.hp ?? 100;
  p.mana ??= p.currentStats?.mana ?? 80;
  p.maxMana ??= p.currentStats?.mana ?? 80;
  p.lastAttack ??= 0;

  if (bgImage.complete && bgImage.naturalWidth > 0) {
    drawBackground();
  } else {
    bgImage.onload = () => {
      drawBackground();
    };
  }
  drawPlayer();
  window.updateHPBar?.();
  window.updateManaBar?.();
  window.syncPlayerInGame?.();

  window.initializeEnemies?.();

  window.exploreRunning = true;
  resetKeys?.();
  step();
  startManaRegen();

  window.dispatchEvent(new CustomEvent('explore:start', { detail: { canvas, ctx } }));
  console.log('✅ Explore started.');
}
window.startExploreGame = startExploreGame;

/* ------------------------------------------------------------
   🚪 Enter Explore Screen Helper
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
  if (!canvas) return console.warn('⚠️ Explore: #explore-canvas not found.');
  ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  const page = document.getElementById('explore-page');
  if (page?.classList.contains('active')) startExploreGame();
});
