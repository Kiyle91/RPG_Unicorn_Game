/* ------------------ FAIRY DUST PARTICLES ------------------ */
const particlePool = [];
const maxParticles = 100;
let nextParticle = 0;

// create particle pool once
for (let i = 0; i < maxParticles; i++) {
  const p = document.createElement('div');
  p.classList.add('fairy-dust');
  document.body.appendChild(p);
  particlePool.push(p);
}

// click anywhere to trigger particles
document.addEventListener('click', (e) => {
  for (let i = 0; i < 30; i++) {
    const particle = particlePool[nextParticle];
    nextParticle = (nextParticle + 1) % maxParticles;

    // reset particle
    particle.style.opacity = 1;
    particle.style.transform = 'translate3d(0,0,0) scale(1)';

    // random swirl direction
    particle.style.setProperty('--dir-x', Math.random() * 2 - 1);
    particle.style.setProperty('--dir-y', Math.random() * 2 - 1);

    // position at click
    particle.style.left = `${e.clientX}px`;
    particle.style.top = `${e.clientY}px`;

    // restart animation
    particle.classList.remove('swirl');
    void particle.offsetWidth; // force reflow
    particle.classList.add('swirl');
  }
});

/* ------------------ BACKGROUND MUSIC & MUTE ------------------ */
const bgMusic = document.getElementById('bg-music');
const muteBtn = document.getElementById('mute-btn');

let isMuted = false;       // music starts unmuted
let musicStarted = false;

// set initial icon
muteBtn.textContent = isMuted ? "🔇" : "🔊";

// autoplay-safe: start music on first click if not muted
document.addEventListener('click', function startMusic() {
  if (!musicStarted && !isMuted) {
    bgMusic.play().catch(() => console.log("Autoplay blocked"));
    musicStarted = true;
  }
});

// mute/unmute button click
muteBtn.addEventListener('click', () => {
  if (isMuted) {
    // unmute / play
    bgMusic.play().catch(() => console.log("Autoplay blocked"));
    muteBtn.textContent = "🔊";
    isMuted = false;
  } else {
    // mute / pause
    bgMusic.pause();
    muteBtn.textContent = "🔇";
    isMuted = true;
  }
});
