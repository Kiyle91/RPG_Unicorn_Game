// ==========================
//       FAIRY DUST & AUDIO
// ==========================

// ------------------ Universal Fairy Dust Effect ------------------
document.addEventListener('click', (e) => {
  const numParticles = 100;

  for (let i = 0; i < numParticles; i++) {
    const particle = document.createElement('div');
    particle.classList.add('fairy-dust');

    // Random swirl direction
    const dirX = Math.random() * 2 - 1;
    const dirY = Math.random() * 2 - 1;
    particle.style.setProperty('--dir-x', dirX);
    particle.style.setProperty('--dir-y', dirY);

    // Position at click
    particle.style.left = `${e.clientX}px`;
    particle.style.top = `${e.clientY}px`;

    document.body.appendChild(particle);

    // Remove after animation
    setTimeout(() => particle.remove(), 1500);
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
