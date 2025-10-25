// ==========================
//       FAIRY DUST & AUDIO
// ==========================

// ------------------ Universal Fairy Dust Effect ------------------
document.addEventListener('click', (e) => {
  const numParticles = 100;

  for (let i = 0; i < numParticles; i++) {
    const particle = document.createElement('div');
    particle.classList.add('fairy-dust');

    // Random swirl direction
    const dirX = Math.random() * 2 - 1;
    const dirY = Math.random() * 2 - 1;
    particle.style.setProperty('--dir-x', dirX);
    particle.style.setProperty('--dir-y', dirY);

    // Position at click
    particle.style.left = `${e.clientX}px`;
    particle.style.top = `${e.clientY}px`;

    document.body.appendChild(particle);

    // Remove after animation
    setTimeout(() => particle.remove(), 1500);
  }
});

// ------------------ Background Music ------------------
const bgMusic = document.getElementById('bg-music');
let musicStarted = true;

document.addEventListener('click', () => {
  if (!musicStarted) {
    bgMusic.play().catch(() => {
      console.log("Autoplay blocked, waiting for user interaction.");
    });
    musicStarted = true;
  }
});

// ------------------ Mute / Unmute Button ------------------
const muteBtn = document.getElementById('mute-btn');
if (muteBtn) {
  muteBtn.addEventListener('click', () => {
    if (bgMusic.paused) {
      bgMusic.play();
      
      muteBtn.textContent = "🔊";
    } else {
      bgMusic.pause();
      muteBtn.textContent = "🔇";
    }
  });
}


// ------------------ Start Button Listener ------------------
const startBtn = document.getElementById('start-btn');
if (startBtn) {
  startBtn.addEventListener('click', () => {
    const landingScreen = document.querySelector('#landing-page');
    const nextScreen = document.querySelector('#naming-page');

    if (landingScreen && nextScreen) {
      // toggle visibility via classes (keeps CSS in charge)
      landingScreen.classList.remove('active');
      nextScreen.classList.add('active');

      // move keyboard focus to first focusable element in the next screen
      const focusable = nextScreen.querySelector('input, button, [tabindex]:not([tabindex="-1"])');
      if (focusable) focusable.focus();
    }

    console.log("Start button clicked! Game starting...");
  });
}

function showScreen(nextId) {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
    screen.style.display = 'none';
  });

  // Show the requested screen
  const nextScreen = document.getElementById(nextId);
  if (nextScreen) {
    nextScreen.classList.add('active');
    nextScreen.style.display = 'flex';
  }

  
}


/* ============================================================
   🌟 GLOBAL DEBUG & PLAYER CONSOLE TOOLS
   ============================================================ */

/* ============================================================
   🌟 GLOBAL DEBUG: SHOW PLAYER STATS (VISIBLE + SAFE)
   ============================================================ */
window.showStats = function () {
  try {
    if (!window.player) {
      console.warn("⚠️ Player not initialized yet!");
      return "⚠️ No player found.";
    }

    const p = window.player;

    const stats = {
      Name: p.name || "Unknown",
      Class: p.classKey || "Unassigned",
      HP: `${p.hp ?? p.currentStats?.hp ?? 0} / ${p.maxHp ?? p.currentStats?.hp ?? 0}`,
      Speed: p.speed ?? p.currentStats?.speed ?? "N/A",
      Attack: p.attack ?? p.currentStats?.attack ?? "N/A",
      X: (p.x ?? 0).toFixed ? p.x.toFixed(1) : 0,
      Y: (p.y ?? 0).toFixed ? p.y.toFixed(1) : 0,
    };

    // ✅ Clear space and print clearly (no auto-hide)
    console.log("\n🧭 %cPLAYER STATUS", "color: hotpink; font-weight: bold;");
    console.table(stats);
    console.log("🎯 Tip: You can run `damage(10)`, `heal(10)`, `setHP(50)`, or `boost('speed', 8)` next.");

    return "✅ Player stats printed to console.";
  } catch (err) {
    console.error("❌ showStats() failed:", err);
    return "❌ Error printing stats.";
  }
};


window.setHP = (value) => {
  if (!window.player) return console.warn("⚠️ Player not initialized yet!");
  player.hp = Math.max(0, Math.min(player.maxHp, value));
  updateHPBar?.();
  console.log(`❤️ HP set to ${player.hp}/${player.maxHp}`);
  return `❤️ HP set to ${player.hp}/${player.maxHp}`;
};

window.damage = (amount = 10) => {
  if (!window.player) return console.warn("⚠️ Player not initialized yet!");
  player.hp = Math.max(0, player.hp - amount);
  updateHPBar?.();
  console.log(`💔 Took ${amount} damage → ${player.hp}/${player.maxHp}`);
  return `💔 Took ${amount} damage → ${player.hp}/${player.maxHp}`;
};

window.heal = (amount = 10) => {
  if (!window.player) return console.warn("⚠️ Player not initialized yet!");
  player.hp = Math.min(player.maxHp, player.hp + amount);
  updateHPBar?.();
  console.log(`💖 Healed ${amount} → ${player.hp}/${player.maxHp}`);
  return `💖 Healed ${amount} → ${player.hp}/${player.maxHp}`;
};

window.boost = (stat, value) => {
  if (!window.player) return console.warn("⚠️ Player not initialized yet!");
  if (!(stat in player)) return console.warn(`⚠️ Unknown stat: ${stat}`);
  player[stat] = value;
  console.log(`✨ ${stat} boosted to ${value}`);
  window.showStats?.();
  return `✨ ${stat} boosted to ${value}`;
};

function updateStatsDisplay(stats) {
  document.getElementById('stat-health').textContent = stats.health;
  document.getElementById('stat-mana').textContent = stats.mana;
  document.getElementById('stat-attack').textContent = stats.attack;
  document.getElementById('stat-armor').textContent = stats.armor;
  document.getElementById('stat-speed').textContent = stats.speed;
}