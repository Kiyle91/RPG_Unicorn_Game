/* ============================================================
   🌸 FAIRY AURA CLICK EFFECT — Simple, Elegant, Magical
   ------------------------------------------------------------
   Handles:
   ✦ Aura expansion and sparkle animation on click
   ✦ Random hue variation for color diversity
   ✦ Automatic cleanup for performance
============================================================ */

document.addEventListener("click", (e) => {
  const canvas = document.getElementById("explore-canvas");
  const clickX = e.clientX;
  const clickY = e.clientY;
  const hue = Math.floor(Math.random() * 360); // 🌈 different hue each click

  /* 💖 MAIN GLOW CIRCLE */
  const aura = document.createElement("div");
  aura.classList.add("fairy-aura");
  aura.style.setProperty("--aura-color", `hsl(${hue}, 100%, 75%)`);
  aura.style.left = `${clickX}px`;
  aura.style.top = `${clickY}px`;
  document.body.appendChild(aura);

  // Animate expansion + fade
  aura.animate(
    [
      { transform: "translate(-50%, -50%) scale(0.3)", opacity: 1 },
      { transform: "translate(-50%, -50%) scale(1.4)", opacity: 0.6 },
      { transform: "translate(-50%, -50%) scale(5.0)", opacity: 0 },
    ],
    { duration: 700, easing: "ease-out", fill: "forwards" }
  );
  setTimeout(() => aura.remove(), 650);

  /* ✨ SMALL SPARKLES */
  const sparkleCount = 25;
  for (let i = 0; i < sparkleCount; i++) {
    const sparkle = document.createElement("div");
    sparkle.classList.add("fairy-sparkle");
    sparkle.style.setProperty(
      "--sparkle-color",
      `hsl(${hue + Math.random() * 40 - 20}, 100%, 80%)`
    );
    sparkle.style.left = `${clickX}px`;
    sparkle.style.top = `${clickY}px`;
    document.body.appendChild(sparkle);

    const angle = (Math.PI * 2 * i) / sparkleCount;
    const distance = 50 + Math.random() * 25;
    const xMove = Math.cos(angle) * distance;
    const yMove = Math.sin(angle) * distance;

    sparkle.animate(
      [
        { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
        {
          transform: `translate(${xMove}px, ${yMove}px) scale(0.2)`,
          opacity: 0,
        },
      ],
      { duration: 600 + Math.random() * 200, easing: "ease-out", fill: "forwards" }
    );

    setTimeout(() => sparkle.remove(), 800);
  }
});

/* ============================================================
   🎵 BACKGROUND MUSIC + MUTE BUTTON
   ------------------------------------------------------------
   Handles:
   ✦ Background looped music
   ✦ Manual mute / unmute toggle
   ✦ Autoplay-safe activation
============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const bgMusic = document.getElementById("bg-music");
  const muteBtn = document.getElementById("mute-btn");
  if (!bgMusic) return console.warn("🎵 bg-music element not found in DOM.");

  // Autoplay protection
  let musicStarted = false;

  // 🎵 Resume music on first user click (browsers block autoplay)
  document.addEventListener("click", () => {
    if (!musicStarted && !bgMusic.paused) return; // already playing
    if (!musicStarted) {
      bgMusic
        .play()
        .then(() => console.log("🎶 Music playback started."))
        .catch(() => console.log("🎵 Autoplay blocked until user interaction."));
      musicStarted = true;
    }
  });

  // 🎚️ Mute / Unmute Button
  muteBtn?.addEventListener("click", () => {
    if (bgMusic.paused) {
      bgMusic.play().catch(() => console.log("🎵 Playback blocked."));
      muteBtn.textContent = "🔊";
      console.log("🔊 Music unmuted.");
    } else {
      bgMusic.pause();
      muteBtn.textContent = "🔇";
      console.log("🔇 Music muted.");
    }
  });
});


/* ----------------------------------------------------------
   ✨ Magic Effects Helpers
---------------------------------------------------------- */

// 🩵 Out of Mana Puff
function showNoManaEffect(x = window.innerWidth / 2, y = window.innerHeight / 2) {
  const puff = document.createElement("div");
  puff.classList.add("fairy-aura");
  puff.style.setProperty("--aura-color", "rgba(180, 200, 255, 0.6)");
  puff.style.left = `${x}px`;
  puff.style.top = `${y}px`;
  document.body.appendChild(puff);
  puff.animate(
    [
      { transform: "translate(-50%, -50%) scale(0.6)", opacity: 1 },
      { transform: "translate(-50%, -50%) scale(1.4)", opacity: 0 },
    ],
    { duration: 600, easing: "ease-out", fill: "forwards" }
  );
  setTimeout(() => puff.remove(), 600);
}

// 💫 Blue/Purple Ranged Magic Effect
function showRangedEffect(x, y) {
  const aura = document.createElement("div");
  aura.classList.add("fairy-aura");
  const hue = 220 + Math.floor(Math.random() * 60); // blue/purple range
  aura.style.setProperty("--aura-color", `hsl(${hue}, 100%, 70%)`);
  aura.style.left = `${x}px`;
  aura.style.top = `${y}px`;
  document.body.appendChild(aura);

  aura.animate(
    [
      { transform: "translate(-50%, -50%) scale(0.5)", opacity: 1 },
      { transform: "translate(-50%, -50%) scale(2)", opacity: 0 },
    ],
    { duration: 800, easing: "ease-out", fill: "forwards" }
  );
  setTimeout(() => aura.remove(), 700);

  // Scatter sparkles
  for (let i = 0; i < 16; i++) {
    const sparkle = document.createElement("div");
    sparkle.classList.add("fairy-sparkle");
    sparkle.style.setProperty("--sparkle-color", `hsl(${hue + Math.random() * 30 - 15}, 100%, 80%)`);
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    document.body.appendChild(sparkle);

    const angle = Math.random() * Math.PI * 2;
    const dist = 50 + Math.random() * 40;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;

    sparkle.animate(
      [
        { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
        { transform: `translate(${tx}px, ${ty}px) scale(0.1)`, opacity: 0 },
      ],
      { duration: 700 + Math.random() * 200, easing: "ease-out", fill: "forwards" }
    );
    setTimeout(() => sparkle.remove(), 800);
  }
}

