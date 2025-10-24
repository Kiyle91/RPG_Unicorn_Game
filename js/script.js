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
let musicStarted = false;

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

muteBtn.addEventListener('click', () => {
  if (bgMusic.paused) {
    bgMusic.play();
    muteBtn.textContent = "🔊";
  } else {
    bgMusic.pause();
    muteBtn.textContent = "🔇";
  }
});


// ------------------ Start Button Listener ------------------
const startBtn = document.getElementById('start-btn');

startBtn.addEventListener('click', () => {
  // Example: hide landing page and show next screen
  const landingScreen = document.querySelector('#landing-page');
  const nextScreen = document.querySelector('#naming-page'); // replace with your actual screen ID

  if (landingScreen && nextScreen) {
    landingScreen.classList.remove('active');
    landingScreen.style.display = 'none';
    nextScreen.classList.add('active');
  }

  // You can also trigger other startup logic here
  console.log("Start button clicked! Game starting...");
});
