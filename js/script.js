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
   🌈 FAIRY CLICK EFFECTS
============================================================ */
document.addEventListener('click', (e) => {
  // 💥 Center burst
  const burst = document.createElement('div');
  burst.classList.add('fairy-burst');
  const hue = Math.floor(Math.random() * 360);
  burst.style.setProperty('--burst-color', `hsl(${hue}, 100%, 75%)`);
  burst.style.left = `${e.clientX}px`;
  burst.style.top = `${e.clientY}px`;
  document.body.appendChild(burst);
  setTimeout(() => burst.remove(), 800);

  // 🌈 Fairy dust
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

  // ✨ Fairy sparks
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
      }, 500);
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
