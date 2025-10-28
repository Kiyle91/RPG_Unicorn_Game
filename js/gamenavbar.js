/* ============================================================
   🧩 OVERLAY CONTROLS – Inventory / Settings / Controls / Quests
   ------------------------------------------------------------
   Handles:
   ✦ Opening & closing overlay menus
   ✦ Music / SFX toggle
   ✦ State-safe screen switching
============================================================ */

/* ============================================================
   🧹 CLOSE ALL OVERLAYS
============================================================ */
function closeAllOverlays() {
  document
    .querySelectorAll(
      "#inventory-wrapper, #settings-wrapper, #controls-wrapper, #quests-wrapper"
    )
    .forEach((el) => el.classList.remove("active"));
  uiState = "explore";
}

/* ============================================================
   🎒 INVENTORY OVERLAY
============================================================ */
const inventoryBtn = document.getElementById("open-inventory");
const inventoryWrapper = document.getElementById("inventory-wrapper");
const backToExploreBtn = document.getElementById("back-to-explore");

function toggleInventory(show) {
  closeAllOverlays();
  uiState = show ? "inventory" : "explore";
  inventoryWrapper.classList.toggle("active", show);
}

inventoryBtn?.addEventListener("click", () => toggleInventory(true));
backToExploreBtn?.addEventListener("click", () => toggleInventory(false));

/* ============================================================
   ⚙️ SETTINGS OVERLAY
============================================================ */
const settingsBtn = document.querySelector('.nav-btn[data-action="settings"]');
const settingsWrapper = document.getElementById("settings-wrapper");
const closeSettingsBtn = document.getElementById("close-settings");

function toggleSettings(show) {
  uiState = show ? "settings" : "explore";
  settingsWrapper.classList.toggle("active", show);
}

settingsBtn?.addEventListener("click", () => {
  closeAllOverlays();
  toggleSettings(true);
});

closeSettingsBtn?.addEventListener("click", () => toggleSettings(false));

/* ============================================================
   🎵 MUSIC & SFX TOGGLES
============================================================ */
const toggleMusicBtn = document.getElementById("toggle-music");
toggleMusicBtn?.addEventListener("click", () => {
  const music = document.getElementById("bg-music");
  if (!music) return;

  if (music.paused) {
    music.play().catch(() => console.log("🎵 Playback blocked."));
    toggleMusicBtn.textContent = "On";
    console.log("🔊 Music unmuted.");
  } else {
    music.pause();
    toggleMusicBtn.textContent = "Off";
    console.log("🔇 Music muted.");
  }
});

const toggleSfxBtn = document.getElementById("toggle-sfx");
toggleSfxBtn?.addEventListener("click", () => {
  toggleSfxBtn.textContent =
    toggleSfxBtn.textContent === "On" ? "Off" : "On";
  console.log(`🎧 SFX toggled → ${toggleSfxBtn.textContent}`);
});

/* ============================================================
   🎮 CONTROLS OVERLAY
============================================================ */
const controlsBtn = document.querySelector('.nav-btn[data-action="battle"]');
const controlsWrapper = document.getElementById("controls-wrapper");
const closeControlsBtn = document.getElementById("close-controls");

function toggleControls(show) {
  closeAllOverlays();
  uiState = show ? "controls" : "explore";
  controlsWrapper.classList.toggle("active", show);
}

controlsBtn?.addEventListener("click", () => toggleControls(true));
closeControlsBtn?.addEventListener("click", () => toggleControls(false));

/* ============================================================
   📜 QUESTS OVERLAY
============================================================ */
const questBtn = document.querySelector('.nav-btn[data-action="quest"]');
const questsWrapper = document.getElementById("quests-wrapper");
const closeQuestsBtn = document.getElementById("close-quests");

function toggleQuests(show) {
  closeAllOverlays();
  uiState = show ? "quests" : "explore";
  questsWrapper.classList.toggle("active", show);
}

questBtn?.addEventListener("click", () => toggleQuests(true));
closeQuestsBtn?.addEventListener("click", () => toggleQuests(false));

console.log("✅ Overlay controls initialized successfully.");

/* ============================================================
   🏰 RETURN HOME (Pause + Confirmation + Safe Resume)
============================================================ */
const returnHomeBtn = document.getElementById("return-home");

if (returnHomeBtn) {
  returnHomeBtn.addEventListener("click", () => {
    exploreRunning = false;
    uiState = "paused";
    console.log("⏸️ Game paused — waiting for home confirmation.");

    (window.showAlert || window.alert)(
      "Are you sure you want to return home? Your current progress will be lost.",
      // ✅ Confirm → exit to main menu
      () => {
        cancelAnimationFrame(window.exploreFrameId);
        console.log("🏰 Returning home — reloading game.");
        window.location.reload();
      },
      // ❌ Cancel → resume game safely
      () => {
        if (window.exploreFrameId) cancelAnimationFrame(window.exploreFrameId);
        exploreRunning = true;
        uiState = "explore";
        window.exploreFrameId = requestAnimationFrame(step);
        console.log("▶️ Return home cancelled — game resumed safely.");
      }
    );
  });
}
