/* ------------------ PLAYER JS: Naming + Class Selection ------------------ */

/* ------------------ Naming Page JS ------------------ */
const confirmBtn = document.getElementById('confirm-name'); // Confirm / Next button
const playerInput = document.getElementById('player-name'); // Name input
const namingPage = document.getElementById('naming-page'); // Naming page container
const classPage = document.getElementById('class-selection-page'); // Class selection container
const welcomeHeader = document.getElementById('classtextheader'); // Optional welcome text

confirmBtn.addEventListener('click', () => {
    const playerName = playerInput.value.trim();

    // Prevent empty name
    if (!playerName) {
        alert("Please enter your name!");
        return;
    }

    // Store globally for access in other scripts
    window.playerName = playerName;
    console.log("Player name set to:", window.playerName);

    // Hide Naming Page and show Class Selection Page
    namingPage.style.display = 'none';
    classPage.style.display = 'flex'; // assumes class page uses flex layout

    // Update welcome header if it exists
    if (welcomeHeader) {
        welcomeHeader.textContent = `✨ Welcome, ${window.playerName}! Choose your class ✨`;
    }
});

// ⚡ Rapid looping fireworks – more bursts, faster pace
document.addEventListener("DOMContentLoaded", () => {
  const namingPage = document.getElementById("naming-page");

  // Helper to create a single firework dynamically
  const createFirework = (side) => {
    const fw = document.createElement("div");
    fw.classList.add("firework", side);
    namingPage.appendChild(fw);

    // Trigger animation
    setTimeout(() => {
      fw.classList.add("active");
    }, 50);

    // Remove after animation ends
    setTimeout(() => fw.remove(), 1500);
  };

  // Function that spawns multiple fireworks per side
  const triggerFireworks = () => {
    const sides = ["left", "right"];
    sides.forEach((side) => {
      for (let i = 0; i < 3; i++) { // 💥 three bursts per side
        setTimeout(() => createFirework(side), i * 200);
      }
    });
  };

  // Start after 2s, then keep going faster
  setTimeout(() => {
    triggerFireworks();
    setInterval(triggerFireworks, 2000); // 🎇 every 2 seconds
  }, 2000);
});




