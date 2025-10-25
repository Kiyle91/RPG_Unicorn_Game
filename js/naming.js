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

