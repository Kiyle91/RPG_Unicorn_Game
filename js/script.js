/* ============================================================
   🌸 OLIVIA’S WORLD – MAIN SCRIPT.JS
   ------------------------------------------------------------
   Handles:
   ✦ Visual Effects (cursor & click particles)
   ✦ Background Music
   ✦ Start / Continue / Load Menu
   ✦ Save / Load Integration
   ✦ Custom Alerts
   ✦ Debug / Developer Tools
============================================================ */


/* ============================================================
   🚪 ENTER EXPLORE MODE
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
   🌈 FAIRY CLICK EFFECTS
============================================================ */
document.addEventListener("click", (e) => {
  const clickX = e.clientX, clickY = e.clientY;
  const burst = document.createElement("div");
  burst.classList.add("fairy-burst");
  const hue = Math.floor(Math.random() * 360);
  burst.style.background = `radial-gradient(circle, hsl(${hue},100%,70%) 30%, hsl(${hue},100%,60%) 60%, transparent 100%)`;
  Object.assign(burst.style, {
    left: `${clickX}px`, top: `${clickY}px`,
    position: "fixed", transform: "translate(-50%, -50%)",
    width: "25px", height: "25px", borderRadius: "50%",
    pointerEvents: "none", zIndex: 9998, filter: "blur(1px)"
  });
  document.body.appendChild(burst);
  burst.animate([
    { transform: "translate(-50%, -50%) scale(0.6)", opacity: 1 },
    { transform: "translate(-50%, -50%) scale(1.6)", opacity: 0.8 },
    { transform: "translate(-50%, -50%) scale(1.8)", opacity: 0 }
  ], { duration: 600, easing: "linear" });
  setTimeout(() => burst.remove(), 550);
});


/* ============================================================
   🎵 BACKGROUND MUSIC + MUTE BUTTON
============================================================ */
const bgMusic = document.getElementById("bg-music");
let musicStarted = true;
document.addEventListener("click", () => {
  if (!musicStarted) {
    bgMusic.play().catch(() => console.log("Autoplay blocked"));
    musicStarted = true;
  }
});
const muteBtn = document.getElementById("mute-btn");
muteBtn?.addEventListener("click", () => {
  if (bgMusic.paused) { bgMusic.play(); muteBtn.textContent = "🔊"; }
  else { bgMusic.pause(); muteBtn.textContent = "🔇"; }
});


/* ============================================================
   🚀 START / CONTINUE / LOAD MENU
============================================================ */
const startBtn = document.getElementById("start-btn");
const continueBtn = document.getElementById("continue-btn");
const loadBtn = document.getElementById("load-btn");
const loadWrapper = document.getElementById("load-wrapper");
const saveSlotList = document.getElementById("save-slot-list");
const closeLoadBtn = document.getElementById("close-load");

// 🩷 START
startBtn?.addEventListener("click", () => {
  showScreen("naming-page");
});

// 💾 CONTINUE
if (continueBtn) {
  const hasSave = localStorage.getItem("olivia_save");
  continueBtn.style.display = hasSave ? "inline-block" : "none";
  console.log(hasSave ? "💾 Save found — showing Continue button." : "⚠️ No save found.");

  continueBtn.addEventListener("click", async () => {
    console.log("🔄 Continue button clicked!");
    await waitForExploreFunctions();

    const save = window.loadGame?.();
    if (!save) return showAlert?.("⚠️ No saved game found!");

    showScreen("explore-page");
    setTimeout(() => startExploreGame?.(), 300);
  });
}

// 📂 LOAD BUTTON (multi-save menu)
loadBtn?.addEventListener("click", async () => {
  console.log("📂 Load button clicked!");
  await waitForExploreFunctions();
  populateSaveSlots();
  loadWrapper.classList.add("active");
});

closeLoadBtn?.addEventListener("click", () => loadWrapper.classList.remove("active"));


/* ============================================================
   🗂️ MULTI-SAVE MENU POPULATION
============================================================ */
function populateSaveSlots() {
  saveSlotList.innerHTML = "";
  const saves = Object.keys(localStorage)
    .filter(k => k.startsWith("olivia_save_") && k !== "olivia_save")
    .map(k => ({ key: k, data: JSON.parse(localStorage.getItem(k)) }));

  if (!saves.length) {
    const msg = document.createElement("p");
    msg.textContent = "No saved characters found!";
    msg.style.color = "#fff";
    msg.style.fontFamily = "'Comic Sans MS', cursive";
    msg.style.fontSize = "1.3rem";
    saveSlotList.appendChild(msg);
    return;
  }

  saves.forEach((save) => {
    const btn = document.createElement("button");
    btn.className = "slot-btn";
    btn.textContent = `${save.data.name || "Unknown"} — Lv.${save.data.level || 1}`;
    btn.addEventListener("click", () => {
      if (!confirm(`Load ${save.data.name}?`)) return;
      const loaded = window.loadGame?.(save.key);
      if (!loaded) return;
      loadWrapper.classList.remove("active");
      document.getElementById("landing-page")?.classList.remove("active");
      document.getElementById("explore-page")?.classList.add("active");
      (window.showAlert || alert)(`🌸 Welcome back, ${loaded.name}!`);
      cancelAnimationFrame(window.exploreFrameId);
      enterExploreMode();
    });

    // ❌ Delete button
    const del = document.createElement("button");
    del.textContent = "❌ Delete";
    del.className = "slot-del";
    del.addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm(`Delete save for ${save.data.name}?`)) {
        localStorage.removeItem(save.key);
        populateSaveSlots();
      }
    });

    const wrapper = document.createElement("div");
    wrapper.className = "slot-row";
    wrapper.append(btn, del);
    saveSlotList.appendChild(wrapper);
  });
}

/* Helper: wait for explore.js to be ready */
async function waitForExploreFunctions() {
  let tries = 0;
  while (typeof window.loadGame !== "function" && tries < 20) {
    await new Promise((r) => setTimeout(r, 100));
    tries++;
  }
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
   ⚠️ CUSTOM ALERT BOX
============================================================ */
function showAlert(message, onConfirm = null, onCancel = null) {
  const box = document.getElementById("custom-alert");
  const msg = document.getElementById("alert-message");
  const btns = box?.querySelector(".alert-btns");
  if (!box || !msg || !btns) return alert(message);

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

  if (onConfirm || onCancel)
    btns.append(makeBtn("Yes", "alert-yes", onConfirm), makeBtn("No", "alert-no", onCancel));
  else btns.append(makeBtn("OK", "alert-yes", onConfirm));

  box.classList.remove("alert-hidden");
}


/* ============================================================
   🧪 DEBUG CONSOLE TOOLS
============================================================ */
window.showStats = function () {
  if (!window.player) return console.warn("⚠️ Player not initialized yet!");
  const p = window.player;
  console.table({
    Name: p.name || "Unknown",
    Class: p.classKey || "Unassigned",
    HP: `${p.hp}/${p.maxHp}`,
    Speed: p.speed,
    Attack: p.attackDamage,
    X: p.x?.toFixed(1) ?? 0,
    Y: p.y?.toFixed(1) ?? 0,
  });
  console.log("🎯 Try: damage(10), heal(10), setHP(50)");
};


/* ============================================================
   ⌨️ ENTER KEY SHORTCUT
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
