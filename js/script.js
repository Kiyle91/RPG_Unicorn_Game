document.addEventListener('click', (e) => {
  // 💥 Center burst at click
  const burst = document.createElement('div');
  burst.classList.add('fairy-burst');

  // Random bright pastel colour
  const hue = Math.floor(Math.random() * 360);
  burst.style.setProperty('--burst-color', `hsl(${hue}, 100%, 75%)`);

  burst.style.left = `${e.clientX}px`;
  burst.style.top = `${e.clientY}px`;

  document.body.appendChild(burst);
  setTimeout(() => burst.remove(), 800);

  // 🌈 Main fairy dust particles
  const numDust = 35;
  for (let i = 0; i < numDust; i++) {
    const particle = document.createElement('div');
    particle.classList.add('fairy-dust');

    const angle = Math.random() * Math.PI * 2;
    const dirX = Math.cos(angle);
    const dirY = Math.sin(angle);
    particle.style.setProperty('--dir-x', dirX);
    particle.style.setProperty('--dir-y', dirY);

    const hueDust = Math.floor(Math.random() * 360);
    particle.style.setProperty('--dust-color', `hsl(${hueDust}, 100%, 80%)`);

    const speed = 0.6 + Math.random() * 0.8;
    particle.style.setProperty('--speed-multiplier', speed);

    const size = 4 + Math.random() * 4;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.animationDuration = `${1.2 + Math.random() * 0.8}s`;

    particle.style.left = `${e.clientX}px`;
    particle.style.top = `${e.clientY}px`;

    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 2200);
  }

  // ✨ Extra quick sparks
  const numSparks = 10;
  for (let i = 0; i < numSparks; i++) {
    const spark = document.createElement('div');
    spark.classList.add('fairy-spark');

    const angle = Math.random() * Math.PI * 2;
    const dirX = Math.cos(angle);
    const dirY = Math.sin(angle);
    spark.style.setProperty('--dir-x', dirX);
    spark.style.setProperty('--dir-y', dirY);
    spark.style.animationDuration = `${0.6 + Math.random() * 0.5}s`;

    spark.style.left = `${e.clientX}px`;
    spark.style.top = `${e.clientY}px`;

    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 1000);
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


