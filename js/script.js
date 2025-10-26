/* ============================================================
   🌸 OLIVIA’S WORLD – MAIN SCRIPT.JS
   ------------------------------------------------------------
   Handles:
   ✦ Visual Effects (cursor & click particles)
   ✦ Background Music
   ✦ Start / Continue Buttons
   ✦ Save / Load System
   ✦ Custom Alerts
   ✦ Debug / Developer Tools
============================================================ */


/* ============================================================
   🚪 ENTER EXPLORE MODE
   Ensures canvas sizing before starting the explore loop.
============================================================ */
function enterExploreMode() {
  showScreen("explore-page");

  requestAnimationFrame(() => {
    window.dispatchEvent(new Event("resize"));
    setTimeout(() => {
      cancelAnimationFrame(window.exploreFrameId);
      startExploreGame?.();
    }, 0);
  });
}


/* ============================================================
   🪄 CUSTOM FAIRY CURSOR
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const cursor = document.createElement("div");
  cursor.classList.add("custom-cursor");
  document.body.appendChild(cursor);

  document.addEventListener("mousemove", (e) => {
    cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });

  document.addEventListener("click", () => {
    cursor.animate(
      [
        { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
        { transform: "translate(-50%, -50%) scale(1.8)", opacity: 0.6 },
        { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
      ],
      { duration: 400, easing: "ease-out" }
    );
  });
});


/* ============================================================
   🌈 FAIRY CLICK EFFECTS – Olivia’s World
============================================================ */
document.addEventListener("click", (e) => {
  const clickX = e.clientX;
  const clickY = e.clientY;

  /* 💥 CENTER BURST */
  const burst = document.createElement("div");
  burst.classList.add("fairy-burst");

  const hue = Math.floor(Math.random() * 360);
  burst.style.background = `radial-gradient(circle, hsl(${hue}, 100%, 70%) 30%, hsl(${hue}, 100%, 60%) 60%, transparent 100%)`;
  Object.assign(burst.style, {
    left: `${clickX}px`,
    top: `${clickY}px`,
    position: "fixed",
    transform: "translate(-50%, -50%)",
    width: "25px",
    height: "25px",
    borderRadius: "50%",
    pointerEvents: "none",
    zIndex: 9998,
    filter: "blur(1px)",
  });
  document.body.appendChild(burst);

  burst.animate(
    [
      { transform: "translate(-50%, -50%) scale(0.6)", opacity: 1 },
      { transform: "translate(-50%, -50%) scale(1.6)", opacity: 0.8 },
      { transform: "translate(-50%, -50%) scale(1.8)", opacity: 0 },
    ],
    { duration: 600, easing: "linear" }
  );

  setTimeout(() => burst.remove(), 550);

  /* ✨ OUTER FAIRY PARTICLES */
  const numParticles = 50;
  for (let i = 0; i < numParticles; i++) {
    const particle = document.createElement("div");
    particle.classList.add("fairy-dust");

    const hueDust = Math.floor(Math.random() * 360);
    const size = Math.random() * 6 + 4;
    const angle = Math.random() * Math.PI * 2;
    const distance = 50 + Math.random() * 80;

    Object.assign(particle.style, {
      background: `radial-gradient(circle, hsl(${hueDust}, 100%, 75%) 0%, transparent 80%)`,
      width: `${size}px`,
      height: `${size}px`,
      left: `${clickX}px`,
      top: `${clickY}px`,
      position: "fixed",
      borderRadius: "50%",
      pointerEvents: "none",
      zIndex: 9999,
    });
    document.body.appendChild(particle);

    const xMove = Math.cos(angle) * distance;
    const yMove = Math.sin(angle) * distance;

    particle.animate(
      [
        { transform: "translate(0, 0) scale(1)", opacity: 1 },
        { transform: `translate(${xMove}px, ${yMove}px) scale(0.3)`, opacity: 0 },
      ],
      { duration: 1000 + Math.random() * 400, easing: "ease-out" }
    );

    setTimeout(() => particle.remove(), 1400);
  }
});


/* ============================================================
   🎵 BACKGROUND MUSIC + MUTE BUTTON
============================================================ */
const bgMusic = document.getElementById("bg-music");
let musicStarted = true;

// 🔈 Autoplay unlock
document.addEventListener("click", () => {
  if (!musicStarted) {
    bgMusic.play().catch(() => console.log("Autoplay blocked, waiting for user interaction."));
    musicStarted = true;
  }
});

// 🔇 Toggle mute
const muteBtn = document.getElementById("mute-btn");
if (muteBtn) {
  muteBtn.addEventListener("click", () => {
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
   🚀 START + CONTINUE BUTTONS
============================================================ */
const startBtn = document.getElementById("start-btn");
const continueBtn = document.getElementById("continue-btn");

// 🩷 START BUTTON
if (startBtn) {
  startBtn.addEventListener("click", () => {
    const landing = document.getElementById("landing-page");
    const naming = document.getElementById("naming-page");

    if (landing && naming) {
      console.log("🌸 Start button clicked! Transitioning...");
      setTimeout(() => {
        landing.classList.remove("active");
        naming.classList.add("active");

        const focusable = naming.querySelector("input, button, [tabindex]:not([tabindex='-1'])");
        if (focusable) focusable.focus();

        console.log("✨ Naming page activated.");
      }, 50);
    }
  });
}

// 💾 CONTINUE BUTTON
if (continueBtn) {
  const hasSave = localStorage.getItem("olivia_save");
  continueBtn.style.display = hasSave ? "inline-block" : "none";
  console.log(hasSave ? "💾 Save found — showing Continue button." : "⚠️ No save found.");

  continueBtn.addEventListener("click", () => {
    console.log("🔄 Continue button clicked!");
    const save = loadGame?.();
    if (!save) return showAlert?.("No saved game found!");

    showScreen("explore-page");
    setTimeout(() => {
      startExploreGame?.();
      console.log(`🌈 Continued as ${window.player?.name || "Unknown Hero"} (${window.player?.classKey || "Unknown Class"})`);
    }, 500);
  });
}


/* ============================================================
   💾 LOAD GAME MENU (MULTI-SAVE SUPPORT)
============================================================ */
const loadBtn = document.getElementById("load-btn");
const loadWrapper = document.getElementById("load-wrapper");
const saveSlotList = document.getElementById("save-slot-list");
const closeLoadBtn = document.getElementById("close-load");

// ✅ Open / Close
loadBtn?.addEventListener("click", () => {
  populateSaveSlots();
  loadWrapper.classList.add("active");
});
closeLoadBtn?.addEventListener("click", () => loadWrapper.classList.remove("active"));

// 🗂️ Populate Save Slots
function populateSaveSlots() {
  saveSlotList.innerHTML = "";

  const saves = Object.keys(localStorage)
    .filter((key) => key.startsWith("olivia_save_"))
    .map((key) => ({ key, data: JSON.parse(localStorage.getItem(key)) }));

  if (!saves.length) {
    const msg = document.createElement("p");
    Object.assign(msg.style, {
      color: "#fff",
      fontFamily: "'Comic Sans MS', cursive",
      fontSize: "1.3rem",
    });
    msg.textContent = "No saved characters found!";
    saveSlotList.appendChild(msg);
    return;
  }

  saves.forEach((save) => {
    const btn = document.createElement("button");
    btn.className = "slot-btn";
    btn.textContent = `${save.data.name || "Unknown"} — Lv.${save.data.level || 1}`;

    btn.addEventListener("click", () => {
      if (!confirm(`Load ${save.data.name}?`)) return;

      const loadedPlayer = loadSpecificSave(save.key);
      if (!loadedPlayer) return;

      loadWrapper.classList.remove("active");
      document.getElementById("landing-page")?.classList.remove("active");
      document.getElementById("explore-page")?.classList.add("active");

      (window.showAlert || alert)(`🌸 Welcome back, ${loadedPlayer.name}!`);
      cancelAnimationFrame(window.exploreFrameId);
      enterExploreMode();
    });

    saveSlotList.appendChild(btn);
  });
}

// 🎯 Load a specific save
function loadSpecificSave(key) {
  const data = localStorage.getItem(key);
  if (!data) return null;

  const save = JSON.parse(data);
  window.player = {
    ...save,
    name: save.name,
    classKey: save.classKey,
    currentStats: save.currentStats,
    level: save.level,
    experience: save.experience,
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
   🧭 UNIVERSAL SCREEN SWITCHER
============================================================ */
function showScreen(nextId) {
  document.querySelectorAll(".screen").forEach((s) => {
    s.classList.remove("active");
    s.style.display = "none";
  });
  const next = document.getElementById(nextId);
  if (next) {
    next.classList.add("active");
    next.style.display = "flex";
  }
}


/* ============================================================
   🧪 DEBUG CONSOLE TOOLS
============================================================ */
window.showStats = function () {
  if (!window.player) return console.warn("⚠️ Player not initialized yet!");

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
  console.log("🎯 Try: damage(10), heal(10), setHP(50)");
};

window.setHP = (v) => { if (!window.player) return; player.hp = Math.max(0, Math.min(player.maxHp, v)); updateHPBar?.(); };
window.damage = (n = 10) => { if (!window.player) return; player.hp = Math.max(0, player.hp - n); updateHPBar?.(); };
window.heal = (n = 10) => { if (!window.player) return; player.hp = Math.min(player.maxHp, player.hp + n); updateHPBar?.(); };
window.boost = (s, v) => { if (!window.player || !(s in player)) return; player[s] = v; window.showStats?.(); };

function updateStatsDisplay(stats) {
  ["health", "mana", "attack", "armor", "speed"].forEach((key) => {
    const el = document.getElementById(`stat-${key}`);
    if (el) el.textContent = stats[key];
  });
}

// 🔮 Mana control helpers
window.setMP = (v) => { if (!window.player) return; player.mana = Math.max(0, Math.min(player.maxMana, v)); updateManaBar?.(); };
window.useMana = (n = 10) => { if (!window.player) return; player.mana = Math.max(0, player.mana - n); updateManaBar?.(); };
window.restoreMana = (n = 10) => { if (!window.player) return; player.mana = Math.min(player.maxMana, player.mana + n); updateManaBar?.(); };


/* ============================================================
   ⚠️ CUSTOM ALERT BOX
============================================================ */
function showAlert(message, onConfirm = null, onCancel = null) {
  const box = document.getElementById("custom-alert");
  const msg = document.getElementById("alert-message");
  const btns = box?.querySelector(".alert-btns");
  if (!box || !msg || !btns) return console.warn("⚠️ Alert elements missing.");

  msg.textContent = message;
  btns.innerHTML = "";

  const makeBtn = (text, cls, action) => {
    const b = document.createElement("button");
    b.textContent = text;
    b.className = cls;
    b.onclick = () => {
      box.classList.add("alert-hidden");
      action?.();
    };
    return b;
  };

  if (onConfirm || onCancel) btns.append(makeBtn("Yes", "alert-yes", onConfirm), makeBtn("No", "alert-no", onCancel));
  else btns.append(makeBtn("OK", "alert-yes", onConfirm));

  box.classList.remove("alert-hidden");
}


/* ============================================================
   ⌨️ ENTER KEY SHORTCUT (Simulates click)
============================================================ */
document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" || e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;
  const screen = document.querySelector(".screen.active");
  const btn = screen?.querySelector("button:enabled") || document.querySelector("button:enabled");
  if (!btn) return;
  e.preventDefault();
  btn.click();
  console.log(`✨ Enter key triggered: #${btn.id || "unnamed"}`);
});
