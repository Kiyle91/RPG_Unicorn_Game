/* ============================================================
   🌸 NAMING.JS – Olivia’s World RPG
   ------------------------------------------------------------
   Handles:
   ✦ Player name entry and validation
   ✦ Transition to class selection
   ✦ Basic screen switching
============================================================ */


/* ============================================================
   🎀 ELEMENT REFERENCES
============================================================ */
const confirmBtn     = document.getElementById("confirm-name");       // Confirm / Next button
const playerInput    = document.getElementById("player-name");        // Name input field
const namingPage     = document.getElementById("naming-page");        // Naming screen
const classPage      = document.getElementById("class-selection-page"); // Class selection screen
const welcomeHeader  = document.getElementById("classtextheader");    // Header text element


/* ============================================================
   🧭 UNIVERSAL SCREEN SWITCHER
============================================================ */
function showScreen(nextId) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
    screen.style.display = "none";
  });

  const nextScreen = document.getElementById(nextId);
  if (nextScreen) {
    nextScreen.classList.add("active");
    nextScreen.style.display = "flex";
  }
}

// 🎀 Return button on Naming Page
document.getElementById("return-name")?.addEventListener("click", () => {
  showScreen("landing-page"); // 🔙 Return to start screen
});


/* ============================================================
   💖 NAME CONFIRMATION & TRANSITION
============================================================ */
confirmBtn.addEventListener("click", () => {
  const playerName = playerInput.value.trim();

  // 🚫 Prevent blank input
  if (!playerName) {
    showAlert("Every princess has a name!  -   What is yours?");
    return;
  }

  // 🌸 Save player name globally
  window.playerName = playerName;
  console.log("👑 Player name set to:", window.playerName);

  // ⏱ Smooth delay before moving on
  setTimeout(() => {
    showScreen("class-selection-page");

    // ✨ Personalized greeting
    if (welcomeHeader) {
      welcomeHeader.textContent = `✨ Welcome, ${window.playerName}! Choose your class ✨`;
    }

    console.log("🌸 Transitioned to class selection after 500ms delay.");
  }, 500);
});


// 🎀 Return button on Naming Page
document.getElementById("return-btn")?.addEventListener("click", () => {
  showScreen("landing-page"); // 🔙 Return to start screen
});