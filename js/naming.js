/* ------------------ PLAYER JS: Naming + Class Selection ------------------ */

/* ------------------ Naming Page JS ------------------ */
const confirmBtn = document.getElementById('confirm-name');
const playerInput = document.getElementById('player-name');

confirmBtn.addEventListener('click', () => {
  const playerName = playerInput.value.trim();
  if (playerName === "") {
    alert("Please enter your name!");
    return;
  }

  // Store globally so it can be accessed anywhere
  window.playerName = playerName;

  // Example usage: you can access it in any other JS file
  console.log("Player name set to:", window.playerName);

  // Hide Naming Page
  document.getElementById('naming-page').classList.remove('active');

  // Show Class Selection Page
  const classSelection = document.getElementById('class-selection-page');
  if (classSelection) classSelection.classList.add('active');

  // Optional: update welcome header
  const welcomeHeader = document.getElementById('classtextheader');
  if (welcomeHeader) {
    welcomeHeader.textContent = `✨ Welcome, ${window.playerName}! Choose your class ✨`;
  }
});
