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
      '#inventory-wrapper, #settings-wrapper, #controls-wrapper, #quests-wrapper'
    )
    .forEach((el) => el.classList.remove('active'));
  uiState = 'explore';
}

/* ============================================================
   🎒 INVENTORY OVERLAY
============================================================ */
const inventoryBtn = document.getElementById('open-inventory');
const inventoryWrapper = document.getElementById('inventory-wrapper');
const backToExploreBtn = document.getElementById('back-to-explore');

function toggleInventory(show) {
  closeAllOverlays();
  uiState = show ? 'inventory' : 'explore';
  inventoryWrapper.classList.toggle('active', show);

  // ✅ Refresh player stats when the inventory opens
  if (show && typeof window.updateStatsUI === 'function') {
    window.updateStatsUI();
  }
}

inventoryBtn?.addEventListener('click', () => toggleInventory(true));
backToExploreBtn?.addEventListener('click', () => toggleInventory(false));

/* ============================================================
   ⚙️ SETTINGS OVERLAY
============================================================ */
const settingsBtn = document.querySelector('.nav-btn[data-action="settings"]');
const settingsWrapper = document.getElementById('settings-wrapper');
const closeSettingsBtn = document.getElementById('close-settings');

function toggleSettings(show) {
  uiState = show ? 'settings' : 'explore';
  settingsWrapper.classList.toggle('active', show);
}

settingsBtn?.addEventListener('click', () => {
  closeAllOverlays();
  toggleSettings(true);
});

closeSettingsBtn?.addEventListener('click', () => toggleSettings(false));

/* ============================================================
   🎵 MUSIC & SFX TOGGLES
============================================================ */
const toggleMusicBtn = document.getElementById('toggle-music');
toggleMusicBtn?.addEventListener('click', () => {
  const music = document.getElementById('bg-music');
  if (!music) return;

  if (music.paused) {
    music.play().catch(() => console.log('🎵 Playback blocked.'));
    toggleMusicBtn.textContent = 'On';
    console.log('🔊 Music unmuted.');
  } else {
    music.pause();
    toggleMusicBtn.textContent = 'Off';
    console.log('🔇 Music muted.');
  }
});

const toggleSfxBtn = document.getElementById('toggle-sfx');
toggleSfxBtn?.addEventListener('click', () => {
  toggleSfxBtn.textContent =
    toggleSfxBtn.textContent === 'On' ? 'Off' : 'On';
  console.log(`🎧 SFX toggled → ${toggleSfxBtn.textContent}`);
});

/* ============================================================
   🎮 CONTROLS OVERLAY
============================================================ */
const controlsBtn = document.querySelector('.nav-btn[data-action="battle"]');
const controlsWrapper = document.getElementById('controls-wrapper');
const closeControlsBtn = document.getElementById('close-controls');

function toggleControls(show) {
  closeAllOverlays();
  uiState = show ? 'controls' : 'explore';
  controlsWrapper.classList.toggle('active', show);
}

controlsBtn?.addEventListener('click', () => toggleControls(true));
closeControlsBtn?.addEventListener('click', () => toggleControls(false));

/* ============================================================
   📜 QUESTS OVERLAY
============================================================ */
const questBtn = document.querySelector('.nav-btn[data-action="quest"]');
const questsWrapper = document.getElementById('quests-wrapper');
const closeQuestsBtn = document.getElementById('close-quests');

function toggleQuests(show) {
  closeAllOverlays();
  uiState = show ? 'quests' : 'explore';
  questsWrapper.classList.toggle('active', show);
}

questBtn?.addEventListener('click', () => toggleQuests(true));
closeQuestsBtn?.addEventListener('click', () => toggleQuests(false));

console.log('✅ Overlay controls initialized successfully.');

/* ============================================================
   🏰 RETURN HOME (Pause + Confirmation + Safe Resume)
============================================================ */
const returnHomeBtn = document.getElementById('return-home');

if (returnHomeBtn) {
  returnHomeBtn.addEventListener('click', () => {
    exploreRunning = false;
    uiState = 'paused';
    console.log('⏸️ Game paused — waiting for home confirmation.');

    (window.showAlert || window.alert)(
      'Are you sure you want to return home? Your current progress will be lost.',
      // ✅ Confirm → exit to main menu
      () => {
        cancelAnimationFrame(window.exploreFrameId);
        console.log('🏰 Returning home — reloading game.');
        window.location.reload();
      },
      // ❌ Cancel → resume game safely
      () => {
        if (window.exploreFrameId) cancelAnimationFrame(window.exploreFrameId);
        exploreRunning = true;
        uiState = 'explore';
        window.exploreFrameId = requestAnimationFrame(step);
        console.log('▶️ Return home cancelled — game resumed safely.');
      }
    );
  });
}


/* ============================================================
   💀 GAME OVER SCREEN – Olivia’s World RPG (Fairy Theme, Fixed)
   ------------------------------------------------------------
   ✦ Pauses gameplay completely
   ✦ Fairy pink glow & fade
   ✦ “OK” now properly returns to landing/start page
============================================================ */
window.showGameOverScreen = function () {
  // Prevent duplicates
  if (document.getElementById('game-over-screen')) return;

  // 🛑 Pause gameplay
  window.exploreRunning = false;
  if (typeof window.stopRespawn === 'function') window.stopRespawn();

  // 💫 Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'game-over-screen';
  overlay.innerHTML = `
    <div class="game-over-content">
      <h1>💀 You Were Defeated 💀</h1>
      <p>Your adventure ends here... for now.</p>
      <button id="gameover-ok-btn">OK</button>
    </div>
  `;
  document.body.appendChild(overlay);

  /* 🌈 Overlay styling */
  Object.assign(overlay.style, {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '100000',
    cursor: 'url("../images/ui/cursor.png"), auto',
    animation: 'fadeIn 0.6s ease'
  });

  /* 🎀 Content box */
  const content = overlay.querySelector('.game-over-content');
  Object.assign(content.style, {
    textAlign: 'center',
    color: '#fff',
    fontFamily: "'Comic Sans MS', cursive",
    padding: '50px 60px',
    border: '4px solid #ff69b4',
    borderRadius: '25px',
    background: 'rgba(255, 192, 203, 0.25)',
    boxShadow: '0 0 25px #ff69b4',
    maxWidth: '480px'
  });

  /* 💖 OK Button */
  const btn = content.querySelector('#gameover-ok-btn');
  Object.assign(btn.style, {
    marginTop: '25px',
    padding: '12px 40px',
    fontSize: '22px',
    borderRadius: '15px',
    border: 'none',
    cursor: 'pointer',
    background: '#ff69b4',
    color: '#fff',
    fontWeight: 'bold',
    boxShadow: '0 0 10px #fff',
    transition: 'all 0.25s ease'
  });
  btn.onmouseenter = () => (btn.style.background = '#ff1493');
  btn.onmouseleave = () => (btn.style.background = '#ff69b4');

  // 💖 OK button logic
  btn.onclick = () => {
    overlay.remove();

    // Reset gameplay flags
    window.__gameOverTriggered = false;
    window.exploreRunning = false;

    // Try to return to your main/landing page
    if (typeof window.showScreen === 'function') {
      window.showScreen('landing-page'); // 👈 Change to your actual landing page ID if needed
    } else {
      // fallback: reload to start fresh
      window.location.reload();
    }
  };

  console.log('💀 Game Over screen displayed — gameplay paused.');
};

/* ✨ Optional fade-in animation */
const fadeStyle = document.createElement('style');
fadeStyle.textContent = `
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
`;
document.head.appendChild(fadeStyle);
