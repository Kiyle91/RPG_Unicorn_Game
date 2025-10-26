/* ============================================================
   ⚔️ REALTIME_COMBAT.JS – Olivia’s World RPG
   ------------------------------------------------------------
   Integrates with explore.js to provide:
   ✦ Real-time player attacks
   ✦ Enemy AI + proximity detection
   ✦ Collision + safe damage system
============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  if (!window.startExploreGame) {
    console.warn("⚠️ Explore system not loaded yet!");
    return;
  }

  /* ============================================================
     🧍‍♀️ PLAYER COMBAT STATS
  ============================================================ */
  const player = window.player || {};
  player.attackRange = 40;          // pixels
  player.attackDamage = 15;
  player.attackCooldown = 600;      // ms
  player.lastAttack = 0;

  /* ============================================================
     👹 ENEMY CLASS
  ============================================================ */
  class Enemy {
    constructor(x, y, hp = 50, speed = 1.2) {
      this.x = x;
      this.y = y;
      this.hp = hp;
      this.maxHp = hp;
      this.speed = speed;
      this.attackRange = 30;
      this.attackCooldown = 1000;
      this.lastAttack = 0;
      this.color = "#9b59b6"; // purple enemy
    }

    update(player) {
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const dist = Math.hypot(dx, dy);

      // 🧭 Move toward player
      if (dist > this.attackRange) {
        this.x += (dx / dist) * this.speed;
        this.y += (dy / dist) * this.speed;
      } 
      // 💥 Attack when in range
      else if (Date.now() - this.lastAttack > this.attackCooldown) {
        if (window.player?.hp > 0) {
          damagePlayer(10);
          this.lastAttack = Date.now();
          console.log(`💢 Enemy hit player for 10 damage`);
        }
      }
    }

    draw(ctx) {
      // Draw enemy (no background clearing)
      ctx.beginPath();
      ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();

      // Small HP bar above enemy
      const barWidth = 20;
      const hpRatio = this.hp / this.maxHp;
      ctx.fillStyle = "#000";
      ctx.fillRect(this.x - barWidth / 2, this.y - 20, barWidth, 4);
      ctx.fillStyle = "#ff69b4";
      ctx.fillRect(this.x - barWidth / 2, this.y - 20, barWidth * hpRatio, 4);
    }
  }

  /* ============================================================
     ⚔️ COMBAT SYSTEM INIT
  ============================================================ */
  const enemies = [
    new Enemy(250, 250),
    new Enemy(500, 300),
  ];
  window.enemies = enemies;

  /* ============================================================
     🗡️ PLAYER ATTACK HANDLER
  ============================================================ */
  function playerAttack() {
    const now = Date.now();
    if (now - player.lastAttack < player.attackCooldown) return; // cooldown
    player.lastAttack = now;

    console.log("⚔️ Player attacks!");
    for (const enemy of enemies) {
      const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
      if (dist <= player.attackRange) {
        const dmg = player.attackDamage;
        enemy.hp = Math.max(0, enemy.hp - dmg);
        console.log(`💥 Hit enemy for ${dmg} (HP: ${enemy.hp}/${enemy.maxHp})`);

        // Floating damage text
        showDamageText(`-${dmg}`, enemy.x, enemy.y, "#ff69b4");

        if (enemy.hp <= 0) {
          console.log("☠️ Enemy defeated!");
          enemies.splice(enemies.indexOf(enemy), 1);
        }
      }
    }
  }

  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") playerAttack();
  });

  /* ============================================================
     💥 DAMAGE PLAYER (SAFE)
  ============================================================ */
  function damagePlayer(amount = 10) {
    if (!window.player) return console.warn("⚠️ No player found!");
    player.hp = Math.max(0, player.hp - amount);
    updateHPBar?.();
    flashPlayerHit();

    if (player.hp <= 0 && !window.__gameOverTriggered) {
      console.log("💀 Player died! Triggering Game Over...");
      window.__gameOverTriggered = true;
      triggerGameOver?.();
    }
  }
  window.damagePlayer = damagePlayer;

  /* ============================================================
     ✨ VISUAL FX HELPERS
  ============================================================ */
  function showDamageText(text, x, y, color = "#ff69b4") {
    const div = document.createElement("div");
    div.className = "damage-text";
    div.textContent = text;
    div.style.color = color;
    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 1000);
  }

  function flashPlayerHit() {
  const canvas = document.getElementById("explore-canvas");
  if (!canvas) return;

  // Create a quick white overlay flash
  const flash = document.createElement("div");
  Object.assign(flash.style, {
    position: "absolute",
    left: `${canvas.offsetLeft}px`,
    top: `${canvas.offsetTop}px`,
    width: `${canvas.clientWidth}px`,
    height: `${canvas.clientHeight}px`,
    background: "rgba(255,255,255,0.6)",
    pointerEvents: "none",
    zIndex: 9999,
    transition: "opacity 0.25s ease-out",
  });
  document.body.appendChild(flash);
  setTimeout(() => (flash.style.opacity = 0), 50);
  setTimeout(() => flash.remove(), 250);
}

  /* ============================================================
     🧭 EXTEND EXPLORE LOOP (SHARED CANVAS, NO BACKGROUND CLEAR)
  ============================================================ */
  const oldStartExploreGame = window.startExploreGame;
  window.startExploreGame = function () {
    oldStartExploreGame?.();
    console.log("🗡️ Real-time combat enabled!");
    startCombatLoop();
  };

  function startCombatLoop() {
    const canvas = document.getElementById("explore-canvas");
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    function loop() {
      if (!window.player || !ctx) return;
      if (!window.exploreRunning) return;

      // Update enemies
      enemies.forEach((enemy) => enemy.update(window.player));

      // Redraw everything using existing explore.js functions
      window.drawBackground?.();   // pastel background
      window.drawMap?.();          // grid
      enemies.forEach((enemy) => enemy.draw(ctx)); // 👹 enemies
      window.drawPlayer?.();       // 🧍 player
      window.updateHPBar?.();
      window.updateManaBar?.();

      requestAnimationFrame(loop);
    }

    loop();
  }

  console.log("🧩 Realtime Combat System Loaded (Shared Canvas, No Background Fill)");
});
