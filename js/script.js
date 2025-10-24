// Universal fairy dust effect
document.addEventListener('click', (e) => {
  const numParticles = 30;

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


