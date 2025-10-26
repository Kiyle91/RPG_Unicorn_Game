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
// ------------------ Start + Continue Button Logic ------------------
const startBtn = document.getElementById('start-btn');// 🌸 new continue button
const continueBtn =document.getElementById('continue-btn');

// ------------------ START BUTTON ------------------
if (startBtn) {
  startBtn.addEventListener('click', () => {
    const landingScreen = document.querySelector('#landing-page');
    const nextScreen = document.querySelector('#naming-page');

    if (landingScreen && nextScreen) {
      console.log("🌸 Start button clicked! Transitioning in 1s...");

      // 🕐 small transition pause before switching screens
      setTimeout(() => {
        // toggle visibility via classes (keeps CSS in charge)
        landingScreen.classList.remove('active');
        nextScreen.classList.add('active');

        // move keyboard focus to first focusable element in the next screen
        const focusable = nextScreen.querySelector('input, button, [tabindex]:not([tabindex=\"-1\"])');
        if (focusable) focusable.focus();

        console.log("✨ Naming page activated.");
      }, 500);
    }
  });
}

// ------------------ CONTINUE BUTTON ------------------
if (continueBtn) {
  // 💾 Check if a save exists in browser localStorage
  const hasSave = localStorage.getItem('olivia_save');
  if (hasSave) {
    continueBtn.style.display = 'inline-block'; // Show button only if save exists
    console.log("💾 Save found — showing Continue button.");
  } else {
    console.log("⚠️ No save found — hiding Continue button.");
  }

  // ▶️ Continue button click handler
  continueBtn.addEventListener('click', () => {
    console.log("🔄 Continue button clicked!");

    // Try to load saved data
    const save = loadGame?.();
    if (!save) {
      showAlert?.("No saved game found!");
      return;
    }

    // Jump straight into Explore mode
    showScreen("explore-page");
    setTimeout(() => {
      startExploreGame?.();
      console.log(`🌈 Continued as ${window.player?.name || "Unknown Hero"} (${window.player?.classKey || "Unknown Class"})`);
    }, 500);
  });
}

/* ============================================================
   💾 LOAD GAME BUTTON
============================================================ */
const loadBtn = document.getElementById("load-btn");
const loadWrapper = document.getElementById("load-wrapper");
const saveSlotList = document.getElementById("save-slot-list");
const closeLoadBtn = document.getElementById("close-load");

// Show the load overlay
loadBtn.addEventListener("click", () => {
  populateSaveSlots();
  loadWrapper.classList.add("active");
});

// Hide overlay
closeLoadBtn.addEventListener("click", () => {
  loadWrapper.classList.remove("active");
});

// 🗂️ List all saves
function populateSaveSlots() {
  saveSlotList.innerHTML = "";

  const saves = Object.keys(localStorage)
    .filter(k => k.startsWith("olivia_save_"))
    .map(k => ({
      key: k,
      data: JSON.parse(localStorage.getItem(k))
    }));

  if (saves.length === 0) {
    saveSlotList.innerHTML = "<p>No saved characters found!</p>";
    return;
  }

  saves.forEach(save => {
    const btn = document.createElement("button");
    btn.className = "slot-btn";
    btn.textContent = `${save.data.name || "Unknown"} – Lv.${save.data.level || 1}`;
    btn.addEventListener("click", () => {
      const confirmLoad = confirm(`Load ${save.data.name}?`);
      if (!confirmLoad) return;
      window.player = loadSpecificSave(save.key);
      loadWrapper.classList.remove("active");
      document.getElementById("landing-page").classList.remove("active");
      document.getElementById("explore-page").classList.add("active");
      startExploreGame?.();
      alert(`🌸 Welcome back, ${save.data.name}!`);
    });
    saveSlotList.appendChild(btn);
  });
}

// Helper for loading specific saves
function loadSpecificSave(key) {
  const data = localStorage.getItem(key);
  if (!data) return null;
  const save = JSON.parse(data);
  window.player = {
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
  return window.player;
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


/* ============================================================
   🌸 Custom Alert Function
   ============================================================ */
function showAlert(message, onConfirm = null, onCancel = null) {
  const alertBox = document.getElementById("custom-alert");
  const alertMessage = document.getElementById("alert-message");
  const btnContainer = alertBox?.querySelector(".alert-btns");

  if (!alertBox || !alertMessage || !btnContainer) {
    console.warn("⚠️ Custom alert elements missing from DOM.");
    return;
  }

  // Set message text
  alertMessage.textContent = message;

  // Clear previous buttons
  btnContainer.innerHTML = "";

  if (onConfirm || onCancel) {
    // Create Yes / No buttons
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
    // Default OK button
    const okBtn = document.createElement("button");
    okBtn.textContent = "OK";
    okBtn.className = "alert-yes";
    okBtn.onclick = () => {
      alertBox.classList.add("alert-hidden");
      onConfirm?.();
    };
    btnContainer.append(okBtn);
  }

  // Show the alert
  alertBox.classList.remove("alert-hidden");
}


/* ============================================================
   🌸 ENTER KEY ACTIVATION FOR BUTTONS + INPUTS
   ============================================================ */
document.addEventListener("keydown", (e) => {
  // Ignore if user is typing in a textarea or pressing modifier keys
  if (e.key !== "Enter" || e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;

  // Find the currently visible screen
  const activeScreen = document.querySelector(".screen.active");
  if (!activeScreen) return;

  // Try to find the primary button in that screen
  const primaryButton =
    activeScreen.querySelector("button:enabled:not([disabled])") ||
    document.querySelector("button:enabled:not([disabled])");

  // If found, simulate click
  if (primaryButton) {
    e.preventDefault(); // prevent accidental form submissions
    primaryButton.click();
    console.log(`✨ Enter key triggered button: #${primaryButton.id || "unnamed button"}`);
  }
});


// ------------------ Continue Button ------------------

