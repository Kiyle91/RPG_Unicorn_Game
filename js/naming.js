/* ------------------ PLAYER JS: Naming + Class Selection ------------------ */

/* ------------------ Naming Page JS ------------------ */
const confirmBtn = document.getElementById('confirm-name');   // Confirm / Next button
const playerInput = document.getElementById('player-name');   // Name input
const namingPage = document.getElementById('naming-page');    // Naming page
const classPage = document.getElementById('class-selection-page'); // Class selection page
const welcomeHeader = document.getElementById('classtextheader');  // Header text

// 🧩 Universal screen switcher
function showScreen(nextId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
    screen.style.display = 'none';
  });

  const nextScreen = document.getElementById(nextId);
  if (nextScreen) {
    nextScreen.classList.add('active');
    nextScreen.style.display = 'flex';
  }
}

// ✨ Name confirmation + transition
confirmBtn.addEventListener('click', () => {
  const playerName = playerInput.value.trim();

  if (!playerName) {
    alert("Please enter your name!");
    return;
  }

  // Store player name globally
  window.playerName = playerName;
  console.log("Player name set to:", window.playerName);

  // Move to class selection screen
  showScreen('class-selection-page');

  // Update header greeting
  if (welcomeHeader) {
    welcomeHeader.textContent = `✨ Welcome, ${window.playerName}! Choose your class ✨`;
  }
});


