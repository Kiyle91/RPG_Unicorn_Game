/* ============================================================
   🌸 EFFECTS.JS — Olivia’s World RPG
   ------------------------------------------------------------
   ✦ UI / Story click sparkles
   ✦ Healing, magic, and alert visuals (optional hooks)
   ✦ Never triggers during Explore / Combat
============================================================ */

/* ------------------------------------------------------------
   🩵 Utility: Check if Explore/Combat is active
------------------------------------------------------------ */
function isGameplayActive() {
  return (
    window.exploreRunning === true ||
    document.getElementById('explore-page')?.classList.contains('active')
  );
}

/* ------------------------------------------------------------
   ✨ Click Sparkle Effect (UI + Story Screens)
------------------------------------------------------------ */
function playClickEffect(e) {
  if (isGameplayActive()) return; // 🚫 skip if in explore/combat

  const x = e.clientX;
  const y = e.clientY;
  const hue = Math.floor(Math.random() * 360);

  // Main aura
  const aura = document.createElement('div');
  aura.classList.add('fairy-aura');
  aura.style.setProperty('--aura-color', `hsl(${hue}, 100%, 75%)`);
  aura.style.left = `${x}px`;
  aura.style.top = `${y}px`;
  document.body.appendChild(aura);

  aura.animate(
    [
      { transform: 'translate(-50%, -50%) scale(0.3)', opacity: 1 },
      { transform: 'translate(-50%, -50%) scale(1.4)', opacity: 0.7 },
      { transform: 'translate(-50%, -50%) scale(3.5)', opacity: 0 },
    ],
    { duration: 700, easing: 'ease-out', fill: 'forwards' }
  );
  setTimeout(() => aura.remove(), 650);

  // Tiny sparkles
  const sparkleCount = 15;
  for (let i = 0; i < sparkleCount; i++) {
    const sparkle = document.createElement('div');
    sparkle.classList.add('fairy-sparkle');
    sparkle.style.setProperty(
      '--sparkle-color',
      `hsl(${hue + Math.random() * 40 - 20}, 100%, 80%)`
    );
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    document.body.appendChild(sparkle);

    const angle = Math.random() * Math.PI * 2;
    const distance = 40 + Math.random() * 30;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;

    sparkle.animate(
      [
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        { transform: `translate(${tx}px, ${ty}px) scale(0.2)`, opacity: 0 },
      ],
      { duration: 600 + Math.random() * 200, easing: 'ease-out', fill: 'forwards' }
    );

    setTimeout(() => sparkle.remove(), 800);
  }
}

/* ------------------------------------------------------------
   🌸 Global Click Listener
------------------------------------------------------------ */
document.addEventListener('click', playClickEffect);

/* ------------------------------------------------------------
   💖 Optional: UI/Story-specific effects (can be called manually)
------------------------------------------------------------ */
function showHealEffect(x, y) {
  if (isGameplayActive()) return;
  const aura = document.createElement('div');
  aura.classList.add('fairy-aura');
  aura.style.setProperty('--aura-color', 'hsl(150, 100%, 80%)');
  aura.style.left = `${x}px`;
  aura.style.top = `${y}px`;
  document.body.appendChild(aura);
  aura.animate(
    [
      { transform: 'translate(-50%, -50%) scale(0.8)', opacity: 1 },
      { transform: 'translate(-50%, -50%) scale(2)', opacity: 0 },
    ],
    { duration: 800, easing: 'ease-out', fill: 'forwards' }
  );
  setTimeout(() => aura.remove(), 750);
}

// Export helpers globally
window.playClickEffect = playClickEffect;
window.showHealEffect = showHealEffect;
