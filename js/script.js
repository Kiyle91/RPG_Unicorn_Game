/* ============================================================
   🌸 OLIVIA’S WORLD – MAIN SCRIPT.JS
   Handles: visual effects, music, navigation, saving, loading,
   start/continue logic, alerts, and debug tools.
============================================================ */


/* ============================================================
   🚪 ENTER EXPLORE MODE (ensures canvas has size before start)
============================================================ */
function enterExploreMode() {
  // Show the Explore screen first
  showScreen("explore-page");

  // Next frame: force a resize so explore.js's resizeCanvas() runs
  requestAnimationFrame(() => {
    // Triggers the window 'resize' listener in explore.js
    window.dispatchEvent(new Event('resize'));

    // Start on the next tick so layout is fully settled
    setTimeout(() => {
      cancelAnimationFrame(window.exploreFrameId);
      startExploreGame?.();
    }, 0);
  });
}

/* ============================================================
   🪄 FAIRY CURSOR LOGIC
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const cursor = document.createElement("div");
  cursor.classList.add("custom-cursor");
  document.body.appendChild(cursor);

  // follow cursor
  document.addEventListener("mousemove", (e) => {
    cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });

  // gentle pulse effect on click
  document.addEventListener("click", () => {
    cursor.animate(
      [
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        { transform: 'translate(-50%, -50%) scale(1.8)', opacity: 0.6 },
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
      ],
      { duration: 400, easing: 'ease-out' }
    );
  });
});



/* ============================================================
   🌈 FAIRY CLICK EFFECTS – Olivia’s World (Restored Style)
   ============================================================ */
document.addEventListener('click', (e) => {
  const clickX = e.clientX;
  const clickY = e.clientY;

  /* ============================================================
     💥 CENTER BURST CIRCLE
  ============================================================ */
  const burst = document.createElement('div');
burst.classList.add('fairy-burst');

// Random hue for variation
const hue = Math.floor(Math.random() * 360);
burst.style.background = `radial-gradient(circle, hsl(${hue}, 100%, 70%) 30%, hsl(${hue}, 100%, 60%) 60%, transparent 100%)`;

// Exact placement at click point
burst.style.left = `${e.clientX}px`;
burst.style.top = `${e.clientY}px`;
burst.style.position = 'fixed';
burst.style.transform = 'translate(-50%, -50%)'; // centers it precisely
burst.style.width = '25px';
burst.style.height = '25px';
burst.style.borderRadius = '50%';
burst.style.pointerEvents = 'none';
burst.style.zIndex = 9998;
burst.style.filter = 'blur(1px)';
document.body.appendChild(burst);

// More solid + longer presence + smooth fade
burst.animate(
  [
    { transform: 'translate(-50%, -50%) scale(0.6)', opacity: 1 },
    { transform: 'translate(-50%, -50%) scale(1.6)', opacity: 0.8 },
    { transform: 'translate(-50%, -50%) scale(1.8)', opacity: 0 },
  ],
  { duration: 600, easing: 'linear' }
);

setTimeout(() => burst.remove(), 550);

  /* ============================================================
     ✨ OUTER FAIRY PARTICLES
  ============================================================ */
  const numParticles = 50;
  for (let i = 0; i < numParticles; i++) {
    const particle = document.createElement('div');
    particle.classList.add('fairy-dust');
    const hueDust = Math.floor(Math.random() * 360);
    const size = Math.random() * 6 + 4;
    const angle = Math.random() * 2 * Math.PI;
    const distance = 50 + Math.random() * 80;

    particle.style.background = `radial-gradient(circle, hsl(${hueDust}, 100%, 75%) 0%, transparent 80%)`;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${clickX}px`;
    particle.style.top = `${clickY}px`;
    particle.style.position = 'fixed';
    particle.style.borderRadius = '50%';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = 9999;
    document.body.appendChild(particle);

    const xMove = Math.cos(angle) * distance;
    const yMove = Math.sin(angle) * distance;

    // Animate outward drift + fade
    particle.animate(
      [
        { transform: `translate(0, 0) scale(1)`, opacity: 1 },
        { transform: `translate(${xMove}px, ${yMove}px) scale(0.3)`, opacity: 0 },
      ],
      { duration: 1000 + Math.random() * 400, easing: 'ease-out' }
    );

    setTimeout(() => particle.remove(), 1400);
  }
});



/* ============================================================
   🎵 BACKGROUND MUSIC + MUTE BUTTON
============================================================ */
const bgMusic = document.getElementById('bg-music');
let musicStarted = true;

// 🔈 Autoplay handling
document.addEventListener('click', () => {
  if (!musicStarted) {
    bgMusic.play().catch(() => console.log("Autoplay blocked, waiting for user interaction."));
    musicStarted = true;
  }
});

// 🔇 Mute toggle
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


/* ============================================================
   🚀 START + CONTINUE BUTTON LOGIC
============================================================ */
const startBtn = document.getElementById('start-btn');
const continueBtn = document.getElementById('continue-btn');

// 🩷 START BUTTON
if (startBtn) {
  startBtn.addEventListener('click', () => {
    const landingScreen = document.querySelector('#landing-page');
    const nextScreen = document.querySelector('#naming-page');

    if (landingScreen && nextScreen) {
      console.log("🌸 Start button clicked! Transitioning...");

      setTimeout(() => {
        landingScreen.classList.remove('active');
        nextScreen.classList.add('active');

        const focusable = nextScreen.querySelector('input, button, [tabindex]:not([tabindex=\"-1\"])');
        if (focusable) focusable.focus();

        console.log("✨ Naming page activated.");
      }, 50);
    }
  });
}

// 💾 CONTINUE BUTTON
if (continueBtn) {
  const hasSave = localStorage.getItem('olivia_save');
  if (hasSave) {
    continueBtn.style.display = 'inline-block';
    console.log("💾 Save found — showing Continue button.");
  } else {
    console.log("⚠️ No save found — hiding Continue button.");
  }

  continueBtn.addEventListener('click', () => {
    console.log("🔄 Continue button clicked!");
    const save = loadGame?.();
    if (!save) {
      showAlert?.("No saved game found!");
      return;
    }

    showScreen("explore-page");
    setTimeout(() => {
      startExploreGame?.();
      console.log(`🌈 Continued as ${window.player?.name || "Unknown Hero"} (${window.player?.classKey || "Unknown Class"})`);
    }, 500);
  });
}


/* ============================================================
   💾 LOAD GAME MENU LOGIC
============================================================ */
const loadBtn = document.getElementById("load-btn");
const loadWrapper = document.getElementById("load-wrapper");
const saveSlotList = document.getElementById("save-slot-list");
const closeLoadBtn = document.getElementById("close-load");

// ✅ Show overlay
if (loadBtn) {
  loadBtn.addEventListener("click", () => {
    populateSaveSlots();
    loadWrapper.classList.add("active");
  });
}

// ✅ Hide overlay
if (closeLoadBtn) {
  closeLoadBtn.addEventListener("click", () => {
    loadWrapper.classList.remove("active");
  });
}

// 🗂️ Populate list of saves
function populateSaveSlots() {
  saveSlotList.innerHTML = "";

  const saves = Object.keys(localStorage)
    .filter(key => key.startsWith("olivia_save_"))
    .map(key => ({
      key,
      data: JSON.parse(localStorage.getItem(key))
    }));

  if (saves.length === 0) {
    const msg = document.createElement("p");
    msg.textContent = "No saved characters found!";
    msg.style.color = "#fff";
    msg.style.fontFamily = "'Comic Sans MS', cursive";
    msg.style.fontSize = "1.3rem";
    saveSlotList.appendChild(msg);
    return;
  }

  saves.forEach(save => {
    const btn = document.createElement("button");
    btn.className = "slot-btn";
    btn.textContent = `${save.data.name || "Unknown"} — Lv.${save.data.level || 1}`;
    
    btn.addEventListener("click", () => {
      const confirmLoad = confirm(`Load ${save.data.name}?`);
      if (!confirmLoad) return;

      const loadedPlayer = loadSpecificSave(save.key);
      if (loadedPlayer) {
        loadWrapper.classList.remove("active");
        const landing = document.getElementById("landing-page");
        const explore = document.getElementById("explore-page");
        if (landing && explore) {
          landing.classList.remove("active");
          explore.classList.add("active");
        }
        
        (window.showAlert || alert)(`🌸 Welcome back, ${loadedPlayer.name}!`);
        cancelAnimationFrame(window.exploreFrameId);
        enterExploreMode();
      }
    });

    saveSlotList.appendChild(btn);
  });
}

// 🎯 Load specific save
function loadSpecificSave(key) {
  const data = localStorage.getItem(key);
  if (!data) return null;

  const save = JSON.parse(data);
  window.player = {
    name: save.name,
    classKey: save.classKey,
    currentStats: save.currentStats,
    level: save.level,
    experience: save.experience,
    ...save,
    x: save.position?.x ?? 100,
    y: save.position?.y ?? 100,
    size: 15,
    color: "#ff69b4",
    speed: save.currentStats?.speed || 3,
    hp: save.currentStats?.hp || 100,
    maxHp: save.currentStats?.hp || 100,
  };

  window.difficulty = save.difficulty;
  console.log(`🎮 Loaded save for ${window.player.name} (${window.player.classKey})`);
  return window.player;
}


/* ============================================================
   🧭 SCREEN SWITCHER
============================================================ */
function showScreen(nextId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
    screen.style.display = 'none';
  });

  const nextScreen = document.getElementById(nextId);
  if (nextScreen) {
    nextScreen.classList.add('active');
    nextScreen.style.display = 'flex';
  }
}


/* ============================================================
   🧪 DEBUG / PLAYER CONSOLE TOOLS
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

    console.log("\n🧭 %cPLAYER STATUS", "color: hotpink; font-weight: bold;");
    console.table(stats);
    console.log("🎯 Tip: You can run `damage(10)`, `heal(10)`, or `setHP(50)` next.");

    return "✅ Player stats printed to console.";
  } catch (err) {
    console.error("❌ showStats() failed:", err);
    return "❌ Error printing stats.";
  }
};

// 🎯 Console helpers
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

window.setMP = (value) => {
  if (!window.player) return console.warn("⚠️ Player not initialized yet!");
  player.mana = Math.max(0, Math.min(player.maxMana, value));
  updateManaBar?.();
  console.log(`🔵 Mana set to ${player.mana}/${player.maxMana}`);
  return `🔵 Mana set to ${player.mana}/${player.maxMana}`;
};

window.useMana = (amount = 10) => {
  if (!window.player) return console.warn("⚠️ Player not initialized yet!");
  player.mana = Math.max(0, player.mana - amount);
  updateManaBar?.();
  console.log(`💧 Used ${amount} mana → ${player.mana}/${player.maxMana}`);
  return `💧 Used ${amount} mana → ${player.mana}/${player.maxMana}`;
};

window.restoreMana = (amount = 10) => {
  if (!window.player) return console.warn("⚠️ Player not initialized yet!");
  player.mana = Math.min(player.maxMana, player.mana + amount);
  updateManaBar?.();
  console.log(`🔮 Restored ${amount} mana → ${player.mana}/${player.maxMana}`);
  return `🔮 Restored ${amount} mana → ${player.mana}/${player.maxMana}`;
};



/* ============================================================
   ⚠️ CUSTOM ALERT BOX
============================================================ */
function showAlert(message, onConfirm = null, onCancel = null) {
  const alertBox = document.getElementById("custom-alert");
  const alertMessage = document.getElementById("alert-message");
  const btnContainer = alertBox?.querySelector(".alert-btns");
  if (!alertBox || !alertMessage || !btnContainer) {
    console.warn("⚠️ Custom alert elements missing from DOM.");
    return;
  }

  alertMessage.textContent = message;
  btnContainer.innerHTML = "";

  if (onConfirm || onCancel) {
    const yesBtn = document.createElement("button");
    yesBtn.textContent = "Yes";
    yesBtn.className = "alert-yes";
    yesBtn.onclick = () => {
      alertBox.classList.add("alert-hidden");
      onConfirm?.();
    };

    const noBtn = document.createElement("button");
    noBtn.textContent = "No";
    noBtn.className = "alert-no";
    noBtn.onclick = () => {
      alertBox.classList.add("alert-hidden");
      onCancel?.();
    };

    btnContainer.append(yesBtn, noBtn);
  } else {
    const okBtn = document.createElement("button");
    okBtn.textContent = "OK";
    okBtn.className = "alert-yes";
    okBtn.onclick = () => {
      alertBox.classList.add("alert-hidden");
      onConfirm?.();
    };
    btnContainer.append(okBtn);
  }

  alertBox.classList.remove("alert-hidden");
}


/* ============================================================
   ⌨️ ENTER KEY = PRIMARY BUTTON CLICK
============================================================ */
document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" || e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;

  const activeScreen = document.querySelector(".screen.active");
  if (!activeScreen) return;

  const primaryButton =
    activeScreen.querySelector("button:enabled:not([disabled])") ||
    document.querySelector("button:enabled:not([disabled])");

  if (primaryButton) {
    e.preventDefault();
    primaryButton.click();
    console.log(`✨ Enter key triggered button: #${primaryButton.id || "unnamed button"}`);
  }
});
