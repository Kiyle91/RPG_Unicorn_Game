/* ============================================================
   ⚔️ REALTIME_COMBAT.JS – Olivia’s World RPG
   ------------------------------------------------------------
   Integrates with explore.js:
   ✦ Melee (Space) + Ranged (Click) attacks
   ✦ Enemy AI (chase + attack) with HP bars
   ✦ Floating damage text + fairy FX
   ✦ Auto-respawn enemies while exploring
   ✦ Pauses automatically when overlays/menus open
============================================================ */
(() => {
  if (window.__combatLoaded) {
    console.warn('⚠️ realtime_combat.js already loaded. Skipping re-init.');
    return;
  }
  window.__combatLoaded = true;

  /* ----------------------------------------------------------
   Shared state references provided by explore.js / overlays
  ---------------------------------------------------------- */
  const getPlayer = () => window.player;
  const isRunning = () => window.exploreRunning === true && window.uiState === 'explore';

  let canvas = null;
  let ctx = null;
  let lastSpellCast = 0; // cooldown tracker
  const SPELL_COOLDOWN = 3000; // 3 seconds
  const SPELL_COST = 40; // mana cost per cast
  let lastHealCast = 0;
  const HEAL_COOLDOWN = 3000; // 3 seconds
  const HEAL_COST = 30; 
  const ENEMY_SEPARATION_RADIUS = 30;  // how close before pushing away
  const ENEMY_SEPARATION_FORCE  = 0.4;

  /* ==========================================================
     👹 Enemy Class + Collection
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
      this.radius = 10;
      this.color = '#9b59b6';
    }

    update(p) {
      if (!p) return;
        const dx = p.x - this.x;
        const dy = p.y - this.y;
        const dist = Math.hypot(dx, dy) || 0.0001;

    // --- 💥 Enemy separation logic ---
      for (const other of window.enemies ?? []) {
        if (other === this) continue;
      const ox = this.x - other.x;
      const oy = this.y - other.y;
      const od = Math.hypot(ox, oy);
      if (od > 0 && od < ENEMY_SEPARATION_RADIUS) {
        const push = (ENEMY_SEPARATION_RADIUS - od) / ENEMY_SEPARATION_RADIUS;
        this.x += (ox / od) * push * ENEMY_SEPARATION_FORCE;
        this.y += (oy / od) * push * ENEMY_SEPARATION_FORCE;
      }
  }
  // --------------------------------

  // 🧭 Movement toward player
  if (dist > this.attackRange) {
    this.x += (dx / dist) * this.speed;
    this.y += (dy / dist) * this.speed;
  } else {
    const now = performance.now();
    if (now - this.lastAttack > this.attackCooldown) {
      window.damagePlayer?.(3);
      this.lastAttack = now;
    }
  }

  // Keep inside canvas
  if (canvas) {
    this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
  }
}

    draw(ctx) {
      // Body
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();

      // HP bar
      const barW = 22, barH = 4;
      const ratio = Math.max(0, this.hp / this.maxHp);
      ctx.fillStyle = '#000';
      ctx.fillRect(this.x - barW / 2, this.y - this.radius - 12, barW, barH);
      ctx.fillStyle = '#ff69b4';
      ctx.fillRect(this.x - barW / 2, this.y - this.radius - 12, barW * ratio, barH);
    }
  }

  let enemies = [];
  window.enemies = enemies; // expose reference (reassigned on spawn)

  function spawnEnemies(n = 3) {
    if (!canvas) return;
    enemies = [];
    for (let i = 0; i < n; i++) {
      const ex = Math.random() * (canvas.width - 60) + 30;
      const ey = Math.random() * (canvas.height - 60) + 30;
      enemies.push(new Enemy(ex, ey));
    }
    window.enemies = enemies;
  }
  window.spawnEnemies = spawnEnemies;



/* === CRIT HELPERS (must be defined before use) ================= */

// % chance from player.currentStats.critChance (defaults to 10)
function isCritical(p) {
  const chance = p?.currentStats?.critChance ?? 10;
  return Math.random() * 100 < chance;
}

// Gold burst at a canvas-relative position (x, y)
window.showCritEffect = function (x, y) {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const px = rect.left + x;
  const py = rect.top + y;

  const aura = document.createElement('div');
  aura.classList.add('fairy-aura');
  aura.style.setProperty('--aura-color', 'rgba(255, 215, 0, 0.9)');
  aura.style.left = `${px}px`;
  aura.style.top  = `${py}px`;
  document.body.appendChild(aura);

  aura.animate(
    [
      { transform: 'translate(-50%, -50%) scale(0.6)', opacity: 1 },
      { transform: 'translate(-50%, -50%) scale(2.4)', opacity: 0 }
    ],
    { duration: 400, easing: 'ease-out', fill: 'forwards' }
  );
  setTimeout(() => aura.remove(), 450);

  // quick sparkles
  for (let i = 0; i < 22; i++) {
    const s = document.createElement('div');
    s.classList.add('fairy-sparkle');
    s.style.setProperty('--sparkle-color', 'hsl(50,100%,70%)');
    s.style.left = `${px}px`;
    s.style.top  = `${py}px`;
    document.body.appendChild(s);

    const a = Math.random() * Math.PI * 2;
    const d = 24 + Math.random() * 36;
    const tx = Math.cos(a) * d;
    const ty = Math.sin(a) * d;

    s.animate(
      [
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        { transform: `translate(${tx}px, ${ty}px) scale(0.2)`, opacity: 0 }
      ],
      { duration: 420 + Math.random() * 180, easing: 'ease-out', fill: 'forwards' }
    );
    setTimeout(() => s.remove(), 650);
  }
};

  /* ============================================================
   ✨ VISUAL FX HELPERS – Always globally available
============================================================ */

/* 💧 Out-of-Mana puff — always spawns on the player */
window.showNoManaEffect = function () {
  const p = getPlayer?.() ?? window.player;
  if (!p || !canvas) return;

  const rect = canvas.getBoundingClientRect();
  const px = rect.left + p.x;
  const py = rect.top + p.y;

  // 💧 central glow
  const aura = document.createElement('div');
  aura.classList.add('fairy-aura');
  aura.style.setProperty('--aura-color', 'rgba(120,180,255,0.8)');
  aura.style.left = `${px}px`;
  aura.style.top = `${py}px`;
  aura.style.filter = 'blur(1px)';
  document.body.appendChild(aura);

  // inward collapse animation
  aura.animate(
    [
      { transform: 'translate(-50%, -50%) scale(1.4)', opacity: 0.8 },
      { transform: 'translate(-50%, -50%) scale(0.2)', opacity: 0 }
    ],
    { duration: 500, easing: 'ease-in', fill: 'forwards' }
  );

  // 💫 inward sparkles
  for (let i = 0; i < 15; i++) {
    const s = document.createElement('div');
    s.classList.add('fairy-sparkle');
    s.style.setProperty('--sparkle-color', 'hsl(210,100%,80%)');
    s.style.left = `${px}px`;
    s.style.top = `${py}px`;
    document.body.appendChild(s);

    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 30;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;

    // sparkles move inward
    s.animate(
      [
        { transform: `translate(${tx}px, ${ty}px) scale(1)`, opacity: 1 },
        { transform: 'translate(0,0) scale(0)', opacity: 0 }
      ],
      { duration: 500 + Math.random() * 100, easing: 'ease-in', fill: 'forwards' }
    );
    setTimeout(() => s.remove(), 600);
  }

  setTimeout(() => aura.remove(), 550);
};



// 🩸 Floating damage text
window.showDamageText = function (text, x, y, color = '#ff69b4') {
  const rect = canvas?.getBoundingClientRect?.() ?? { left: 0, top: 0 };
  const screenX = rect.left + x;
  const screenY = rect.top + y - 20;

  const div = document.createElement('div');
  div.className = 'damage-text';
  div.textContent = (typeof text === 'number') ? Math.round(text) : text;
  div.style.color = color;
  div.style.position = 'absolute';
  div.style.left = `${screenX}px`;
  div.style.top = `${screenY}px`;
  div.style.zIndex = '100000';
  document.body.appendChild(div);

  div.animate(
    [
      { transform: 'translateY(0)', opacity: 1 },
      { transform: 'translateY(-40px)', opacity: 0 }
    ],
    { duration: 1000, easing: 'ease-out', fill: 'forwards' }
  );

  setTimeout(() => div.remove(), 1100);
};

window.showAttackEffect = function () {
  const p = getPlayer?.();
  if (!p || !canvas) return;

  const rect = canvas.getBoundingClientRect();

  // 💥 Create aura container
  const aura = document.createElement('div');
  aura.classList.add('fairy-aura');

  // 🎨 Color tint (can adjust by class)
  const hue = Math.floor(Math.random() * 360);
  aura.style.setProperty('--aura-color', `hsl(${hue}, 100%, 75%)`);

  // Initial placement
  aura.style.left = `${rect.left + p.x}px`;
  aura.style.top  = `${rect.top + p.y}px`;
  document.body.appendChild(aura);

  // Track position so it follows player as they move
  let active = true;
  const updatePosition = () => {
    if (!active) return;
    const r = canvas.getBoundingClientRect();
    aura.style.left = `${r.left + p.x}px`;
    aura.style.top  = `${r.top + p.y}px`;
    requestAnimationFrame(updatePosition);
  };
  updatePosition();

  // 🗡️ Aura animation (smaller melee flash)
  aura.animate(
    [
      { transform: 'translate(-50%, -50%) scale(0.5)', opacity: 1 },
      { transform: 'translate(-50%, -50%) scale(1.0)', opacity: 0.9 },
      { transform: 'translate(-50%, -50%) scale(1.3)', opacity: 0 }
    ],
    { duration: 450, easing: 'ease-out', fill: 'forwards' }
  );

  // ✨ Compact sparkles that stay near player
  for (let i = 0; i < 8; i++) {
    const s = document.createElement('div');
    s.classList.add('fairy-sparkle');
    s.style.setProperty('--sparkle-color', `hsl(${hue}, 100%, 85%)`);
    s.style.left = `${rect.left + p.x}px`;
    s.style.top  = `${rect.top + p.y}px`;
    document.body.appendChild(s);

    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 20 + 10;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;

    s.animate(
      [
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        { transform: `translate(${tx}px, ${ty}px) scale(0.3)`, opacity: 0 }
      ],
      { duration: 400 + Math.random() * 150, easing: 'ease-out', fill: 'forwards' }
    );
    setTimeout(() => s.remove(), 500);
  }

  // 🕓 Cleanup after animation ends
  setTimeout(() => {
    active = false;
    aura.remove();
  }, 500);
};





  /* ==========================================================
     ❤️ HP / 🔵 Mana helpers (use existing if defined)
  ========================================================== */
  function updateHPBar()  { window.updateHPBar?.(); }
  function updateManaBar(){ window.updateManaBar?.(); }

  /* ==========================================================
     💥 Damage Player (exported)
  ========================================================== */
  function flashPlayerHit() {
    const p = getPlayer();
    if (!p) return;
    if (!p.baseColor) p.baseColor = p.color || '#ff69b4';
    if (p.__isFlashing) return;
    p.__isFlashing = true;
    p.color = '#ffffff';
    setTimeout(() => {
      p.color = p.baseColor;
      p.__isFlashing = false;
    }, 120);
  }

  function damagePlayer(amount = 10) {
    const p = getPlayer();
    if (!p) return;
    p.hp = Math.max(0, p.hp - amount);
    flashPlayerHit();
    updateHPBar();
    if (p.hp <= 0 && !window.__gameOverTriggered) {
      window.__gameOverTriggered = true;
      window.triggerGameOver?.();
      if (!window.triggerGameOver) {
        (window.showAlert || alert)('💀 You were defeated!');
        setTimeout(() => window.location.reload(), 650);
      }
    }
  }
  window.damagePlayer = damagePlayer;

  function resolvePlayerEnemyCollisions() {
    const p = window.player;
    if (!p || !window.enemies || !canvas) return;

    for (const e of window.enemies) {
      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const dist = Math.hypot(dx, dy);
      const minDist = (p.size ?? 15) + (e.radius ?? 10);

      if (dist < minDist && dist > 0) {
        // 🧭 calculate push direction
        const overlap = minDist - dist;
        const nx = dx / dist;
        const ny = dy / dist;

        // push player slightly away
        p.x += nx * overlap * 0.5;
        p.y += ny * overlap * 0.5;

        // optional: push enemy back too (for more dynamic feel)
        e.x -= nx * overlap * 0.25;
        e.y -= ny * overlap * 0.25;
      }
    }

  // keep player inside canvas bounds
    const r = (p.size ?? 15) / 2;
    p.x = Math.max(r, Math.min(canvas.width - r, p.x));
    p.y = Math.max(r, Math.min(canvas.height - r, p.y));
  }
  window.resolvePlayerEnemyCollisions = resolvePlayerEnemyCollisions;



  

  /* ==========================================================
     🗡️ Melee + 🔮 Ranged Attacks (exported melee)
  ========================================================== */
  function playerAttack() {
  const p = getPlayer();
  if (!p || !canvas) return;
  const now = performance.now();
  const cd = p.attackCooldown ?? 550;
  if (p.lastAttack && now - p.lastAttack < cd) return;
  p.lastAttack = now;

  // 🗡️ Melee attack — no mana cost now
  const rect = canvas.getBoundingClientRect();
  window.showAttackEffect?.(rect.left + p.x, rect.top + p.y);

    let hits = 0;
    for (const e of enemies) {
      const dist = Math.hypot(e.x - p.x, e.y - p.y);
      if (dist <= (p.attackRange ?? 80)) {
        let dmg = p.attackDamage ?? 15;

                  // roll crit
        const crit = isCritical(p);
        if (crit) {
          dmg *= 1.8;
          window.showCritEffect?.(p.x, p.y); // flash at player position
        }

        // class melee bonus (if you already use this)
        if (p.classKey === 'glitterGuardian') dmg *= 1.5;

        e.hp = Math.max(0, e.hp - dmg);

        // floating text (gold if crit, pink otherwise)
        window.showDamageText?.(
          crit ? `CRIT! -${Math.floor(dmg)}` : `-${Math.floor(dmg)}`,
          e.x, e.y,
          crit ? '#ffd700' : '#ff69b4'
        );
        hits++;
      }
    }
    enemies = enemies.filter(e => e.hp > 0);
    window.enemies = enemies;

    if (hits > 0) {
      p.mana = Math.min(p.maxMana ?? 80, (p.mana ?? 0) + 2 * hits);
      updateManaBar();
    }
  }
  window.playerAttack = playerAttack;

  /* ==========================================================
     ⌨️/🖱️ Controls (attack-only; movement is in explore.js)
  ========================================================== */
  let keydownBound = false;
  let clickBound = false;

  function bindInput() {
    if (!keydownBound) {
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
      keydownBound = true;
    }
    if (!clickBound && canvas) {
      canvas.addEventListener('click', onCanvasClick);
      clickBound = true;
    }
  }
  function unbindInput() {
    if (keydownBound) {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      keydownBound = false;
    }
    if (clickBound && canvas) {
      canvas.removeEventListener('click', onCanvasClick);
      clickBound = false;
    }
  }

  function onKeyDown(e) {
    // Melee – Space
    if (e.code === 'Space' && isRunning()) {
      e.preventDefault();
      const p = getPlayer();
      if (!p) return;
      // Optionally require mana; currently light cost handled in playerAttack()
      playerAttack();
    }

    // 🔮 Spell cast – Shift key
    if (e.key === 'f' && isRunning()) {
      e.preventDefault();
      castSpell();
    }

    // 🌿 Heal – E key
    if (e.key.toLowerCase() === 'e' && isRunning()) {
      e.preventDefault();
      castHeal();
    }

    
  }
  function onKeyUp(_e) {
    // reserved if needed later
  }

function onCanvasClick(e) {
  if (!isRunning()) return;
  const p = getPlayer();
  if (!p || !canvas) return;

  const now = performance.now();
  const reloadDelay = 600;

  if (now - lastRangedAttack < reloadDelay) return;
  lastRangedAttack = now;

  // Determine canvas-relative click coordinates
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  // 🚀 Launch projectile
  spawnProjectile(p, clickX, clickY);
}

/* ============================================================
   🔮 CAST SPELL – Epic burst of magical energy
============================================================ */
function castSpell() {
  const p = getPlayer();
  if (!p || !canvas || !isRunning()) return;

  const now = performance.now();
  if (now - lastSpellCast < SPELL_COOLDOWN) return; // still recharging

  if ((p.mana ?? 0) < SPELL_COST) {
    showNoManaEffect(p.x, p.y);
    return;
  }

  // 💫 Deduct Mana
  p.mana = Math.max(0, (p.mana ?? 0) - SPELL_COST);
  updateManaBar();
  lastSpellCast = now;

  const radius = 180; // large AoE radius
  let baseDamage = p.spellDamage ?? 40;
  if (p.classKey === 'starSage') baseDamage *= 1.6; // 🔮 Spell bonus

  // 💥 Damage all enemies in range
  for (const e of enemies) {
    const dist = Math.hypot(e.x - p.x, e.y - p.y);
    if (dist <= radius) {
      const dmg = Math.floor(baseDamage * (0.9 + Math.random() * 0.2));
      e.hp = Math.max(0, e.hp - dmg);
      showDamageText(`-${Math.round(dmg)}`, e.x, e.y, '#dda0dd');
      if (e.hp <= 0) {
        enemies = enemies.filter(en => en.hp > 0);
        window.enemies = enemies;
      }
    }
  }

  // 🌈 VISUAL EFFECT
  const rect = canvas.getBoundingClientRect();
  const px = rect.left + p.x;
  const py = rect.top + p.y;

  // Glowing aura pulse
  const aura = document.createElement('div');
  aura.classList.add('fairy-aura');
  aura.style.setProperty('--aura-color', 'rgba(180, 120, 255, 0.8)');
  aura.style.left = `${px}px`;
  aura.style.top = `${py}px`;
  aura.style.width = '0px';
  aura.style.height = '0px';
  document.body.appendChild(aura);

  aura.animate(
    [
      { transform: 'translate(-50%, -50%) scale(0.2)', opacity: 1 },
      { transform: 'translate(-50%, -50%) scale(3.5)', opacity: 0.8 },
      { transform: 'translate(-50%, -50%) scale(5.5)', opacity: 0 },
    ],
    { duration: 800, easing: 'ease-out', fill: 'forwards' }
  );
  setTimeout(() => aura.remove(), 800);

  // Burst sparkles
  for (let i = 0; i < 60; i++) {
    const sparkle = document.createElement('div');
    sparkle.classList.add('fairy-sparkle');
    sparkle.style.setProperty(
      '--sparkle-color',
      `hsl(${260 + Math.random() * 40}, 100%, 80%)`
    );
    sparkle.style.left = `${px}px`;
    sparkle.style.top = `${py}px`;
    document.body.appendChild(sparkle);

    const angle = Math.random() * Math.PI * 2;
    const distance = 60 + Math.random() * 140;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;

    sparkle.animate(
      [
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        { transform: `translate(${tx}px, ${ty}px) scale(0.2)`, opacity: 0 },
      ],
      { duration: 900 + Math.random() * 300, easing: 'ease-out', fill: 'forwards' }
    );
    setTimeout(() => sparkle.remove(), 1000);
  }

  console.log('💥 Spell Cast!');
}

/* ============================================================
   🌿 HEAL ABILITY – Restores HP using Mana
============================================================ */
function castHeal() {
  const p = getPlayer();
  if (!p || !canvas || !isRunning()) return;

  const now = performance.now();
  if (now - lastHealCast < HEAL_COOLDOWN) return; // still recharging

  // 💧 Check Mana
  if ((p.mana ?? 0) < HEAL_COST) {
    window.showNoManaEffect?.(); // now spawns at player
    return;
  }

  // 🩷 Spend Mana
  p.mana = Math.max(0, (p.mana ?? 0) - HEAL_COST);
  updateManaBar();
  lastHealCast = now;

  // 🌿 Restore HP
  const baseHeal = p.healing ?? 25;
  const healAmount = Math.round(baseHeal * (p.classKey === 'moonflowerHealer' ? 1.8 : 1));
  const oldHP = p.hp;
  p.hp = Math.min(p.maxHp, (p.hp ?? 0) + healAmount);
  updateHPBar();

  // ✅ Get rect *before* using it
  const rect = canvas.getBoundingClientRect();
  const px = rect.left + p.x;
  const py = rect.top + p.y;

  // 💖 Floating +HP text
  window.showDamageText?.(`+${Math.round(healAmount)} HP`, p.x, p.y, '#00ff99');

  // 🌈 Healing Visual Effect
  const aura = document.createElement('div');
  aura.classList.add('fairy-aura');
  aura.style.setProperty('--aura-color', 'rgba(100, 255, 150, 0.8)');
  aura.style.left = `${px}px`;
  aura.style.top = `${py}px`;
  document.body.appendChild(aura);

  aura.animate(
    [
      { transform: 'translate(-50%, -50%) scale(0.5)', opacity: 1 },
      { transform: 'translate(-50%, -50%) scale(2.8)', opacity: 0.8 },
      { transform: 'translate(-50%, -50%) scale(4)', opacity: 0 },
    ],
    { duration: 800, easing: 'ease-out', fill: 'forwards' }
  );
  setTimeout(() => aura.remove(), 800);

  // ✨ Sparkle burst
  for (let i = 0; i < 30; i++) {
    const sparkle = document.createElement('div');
    sparkle.classList.add('fairy-sparkle');
    sparkle.style.setProperty('--sparkle-color', 'hsl(140, 100%, 75%)');
    sparkle.style.left = `${px}px`;
    sparkle.style.top = `${py}px`;
    document.body.appendChild(sparkle);

    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 60;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;

    sparkle.animate(
      [
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        { transform: `translate(${tx}px, ${ty}px) scale(0.2)`, opacity: 0 },
      ],
      { duration: 700 + Math.random() * 200, easing: 'ease-out', fill: 'forwards' }
    );
    setTimeout(() => sparkle.remove(), 900);
  }

  console.log(`💚 Healed for ${healAmount} HP (from ${oldHP} → ${p.hp})`);
}



/* ============================================================
   🎯 PROJECTILE SYSTEM – Canvas-based ranged attacks
============================================================ */
let projectiles = [];
let lastRangedAttack = 0; 

function spawnProjectile(p, targetX, targetY) {
  const dx = targetX - p.x;
  const dy = targetY - p.y;
  const dist = Math.hypot(dx, dy);
  const speed = 8;

  projectiles.push({
    x: p.x,
    y: p.y,
    dx: (dx / dist) * speed,
    dy: (dy / dist) * speed,
    radius: 4,
    color: '#87cefa',
    damage: (p.classKey === 'silverArrow')
  ?   (p.ranged ?? 12) * 1.4   // 🏹 Ranged bonus
  :   (p.ranged ?? 12),
    life: 100, // frames before despawn
  });
}

/* ------------------------------------------------------------
   Update + Draw Projectiles (called inside combatLoop)
------------------------------------------------------------ */
function updateProjectiles(ctx) {
  const p = getPlayer();
  for (const proj of projectiles) {
    proj.x += proj.dx;
    proj.y += proj.dy;
    proj.life--;

    // 🧱 Remove if off-screen
    if (
      proj.x < 0 ||
      proj.x > canvas.width ||
      proj.y < 0 ||
      proj.y > canvas.height ||
      proj.life <= 0
    ) {
      proj.remove = true;
      continue;
    }

    // 👹 Collision check with enemies
    for (const e of enemies) {
      const dist = Math.hypot(e.x - proj.x, e.y - proj.y);
      if (dist < e.radius + proj.radius) {
        const crit = isCritical(p);
        let dmg = proj.damage;
        if (crit) {
          dmg *= 1.8;
          window.showCritEffect?.(e.x, e.y);
        }

        e.hp = Math.max(0, e.hp - dmg);

        window.showDamageText?.(
          crit ? `CRIT! -${Math.round(dmg)}` : `-${Math.round(dmg)}`,
          e.x, e.y,
          crit ? '#ffd700' : '#87cefa'
        );

        proj.remove = true;

        if (e.hp <= 0) {
          enemies = enemies.filter(en => en.hp > 0);
          window.enemies = enemies;
        }
        break;
      }
    }

    // ✨ Draw projectile
    const angle = Math.atan2(proj.dy, proj.dx); // direction of travel
    const length = 24; // arrow length
    const width = 4;   // shaft thickness

    ctx.save();
    ctx.translate(proj.x, proj.y);
    ctx.rotate(angle);

    // 🌈 Silver gradient
    const gradient = ctx.createLinearGradient(0, 0, length, 0);
    gradient.addColorStop(0, '#f0f0f0'); // bright silver tip
    gradient.addColorStop(0.5, '#b0b0b0');
    gradient.addColorStop(1, '#e0e0e0');
    ctx.fillStyle = gradient;

    // 🩶 Arrow shaft
    ctx.beginPath();  
    ctx.rect(0, -width / 2, length, width);
    ctx.fill();

    

    // Optional glow
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#d9d9d9';
    ctx.fill();

    // Restore context
    ctx.restore();
  }

  // Clean up
  projectiles = projectiles.filter(p => !p.remove);
}




  /* ============================================================
   ⚔️ COMBAT LOOP – Shared Canvas Renderer
   ------------------------------------------------------------
   Draws the full explore scene (background, map, enemies, player)
   each frame while explore mode is active.
============================================================ */
let combatFrameId = null;

function combatLoop() {
  // 🎨 Ensure we have a valid canvas and context
  if (!canvas || !ctx) return;

  // 🧍 Get the current player reference
  const p = typeof getPlayer === 'function' ? getPlayer() : window.player;

  // ✅ Only update/draw when the game is running and in explore state
  if (window.exploreRunning && window.uiState === 'explore' && p) {
    // 1️⃣ Update enemies
    for (const e of window.enemies ?? []) {
      if (typeof e.update === 'function') e.update(p);
    }

    // 2️⃣ Clear + Draw Background + Map
    // (Background drawn every frame to prevent flicker)
    if (typeof window.drawBackground === 'function') window.drawBackground();

    // 3️⃣ Draw all enemies
    for (const e of window.enemies ?? []) {
      if (typeof e.draw === 'function') e.draw(ctx);
    }

    updateProjectiles(ctx);

    // 4️⃣ Draw player
    if (typeof window.drawPlayer === 'function') window.drawPlayer();

    // 5️⃣ Update UI bars
    window.updateHPBar?.();
    window.updateManaBar?.();
    resolvePlayerEnemyCollisions();
  }

  // 🔁 Continue animation loop
  combatFrameId = requestAnimationFrame(combatLoop);
}
window.combatLoop = combatLoop;


  /* ==========================================================
     🔄 Respawn Controller (auto while exploring)
  ========================================================== */
  let respawnTimer = null;
  function startRespawn() {
    stopRespawn();
    respawnTimer = setInterval(() => {
      if (!isRunning()) return;            // paused/overlay → do nothing
      if (!enemies || enemies.length === 0) {
        spawnEnemies(1);
      }
    }, 6000);
  }
  function stopRespawn() {
    if (respawnTimer) {
      clearInterval(respawnTimer);
      respawnTimer = null;
    }
  }

  /* ==========================================================
     🔌 Wiring to Explore lifecycle
     - Waits for explore:start to grab canvas/context
     - Binds inputs and starts loops
     - Pauses automatically when uiState changes
  ========================================================== */
  function initFromExplore(detail) {
    canvas = document.getElementById('explore-canvas');
    ctx = canvas?.getContext('2d') || detail?.ctx || null;

    if (!canvas || !ctx) {
      console.warn('⚠️ Combat: missing explore canvas/ctx.');
      return;
    }

    // Ensure player has basic combat stats
    const p = getPlayer();
    if (p) {
      p.attackRange   = p.attackRange   ?? 40;
      p.attackDamage  = p.attackDamage  ?? 15;
      p.attackCooldown= p.attackCooldown?? 550;
      p.lastAttack    = 0;
      p.mana          = p.mana          ?? 80;
      p.maxMana       = p.maxMana       ?? 80;
    }

    // (Re)bind inputs
    bindInput();

    // Fresh spawn if needed
    if (!enemies || enemies.length === 0) spawnEnemies(2);

    // Start loops (idempotent)
    if (!combatFrameId) combatLoop();
    startRespawn();

    console.log('🗡️ Real-time combat initialized on explore canvas.');
  }

  // Listen for explore start (emitted by your explore.js)
  window.addEventListener('explore:start', (ev) => initFromExplore(ev.detail || {}));

  /* ==========================================================
     🛑 Pause / Resume guards (observe uiState changes)
     - No direct listener to uiState, but loops check isRunning()
     - Respawn interval continues but is gated by isRunning()
     - Inputs remain bound; they do nothing when paused
  ========================================================== */

  // Safety: also hook when the explore page is shown manually without event
  // If your flow shows the explore screen directly, try to attach once DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    const page = document.getElementById('explore-page');
    if (page?.classList.contains('active')) {
      // simulate explore:start if explore already visible
      setTimeout(() => initFromExplore({}), 0);
    }
  });

  console.log('✅ realtime_combat.js loaded (shared-canvas, overlay-aware, auto-respawn).');
})();
