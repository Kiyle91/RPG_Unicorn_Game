const confirmBtn = document.getElementById('confirm-name');
const playerInput = document.getElementById('player-name');

confirmBtn.addEventListener('click', () => {
  const playerName = playerInput.value.trim();
  if(playerName === "") {
    alert("Please enter your name!");
    return;
  }

  // Store name globally (for top-left display later)
  window.playerName = playerName;

  // Hide Naming Page
  document.getElementById('naming-page').classList.remove('active');

  // Show next screen (replace 'class-selection-page' with your actual ID)
  const nextScreen = document.getElementById('class-selection-page');
  if(nextScreen) {
    nextScreen.classList.add('active');
  }
});


