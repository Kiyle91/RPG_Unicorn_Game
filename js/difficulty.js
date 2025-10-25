/* ============================================================
   DIFFICULTY SELECTION – OLIVIA’S WORLD RPG
   ============================================================ */

const difficultyButtons = document.querySelectorAll(".difficulty-btn");
const difficultyScreen = document.getElementById("difficulty-screen");
const difficultyBox = document.getElementById("difficulty-box");
const storySection = document.getElementById("story-section");
const storyTitle = document.getElementById("story-title");
const storyText = document.getElementById("story-text");

/* ============================================================
   Helper: Hide All Screens
   ============================================================ */
function hideAllScreens() {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
    screen.style.display = "none";
  });
}

/* ============================================================
   Load Story Screen Function
   ============================================================ */
function loadStory(selectedDifficulty) {
  // 🌈 Difficulty-based intro text
  const storyContent = {
    easy: {
      title: " ",
      text: `${window.playerName || "The brave princess"} takes her first gentle steps into the magical fields of Luminara. The skies shimmer softly — even the unicorns sense your calm courage.`
    },
    medium: {
      title: " ",
      text: `${window.playerName || "Our brave heroine"} feels the air shift — this journey will test both heart and magic. Shadows stir in the enchanted woods ahead...`
    },
    hard: {
      title: " ",
      text: `${window.playerName || "The destined one"} stands before a storm of fire and fury. The unicorns neigh restlessly — destiny has chosen you to face the impossible.`
    }
  };

  const content = storyContent[selectedDifficulty] || storyContent.medium;

  // ✨ Fill in story screen
  if (storyTitle) storyTitle.textContent = content.title;
  if (storyText) storyText.textContent = content.text;

  // Show story screen after fade-out
  hideAllScreens();
  storySection.style.display = "flex";
  storySection.classList.add("active");

  console.log("Story screen loaded for difficulty:", selectedDifficulty);
}

/* ============================================================
   Difficulty Selection Handler (with fade-out animation)
   ============================================================ */
difficultyButtons.forEach(button => {
  button.addEventListener("click", () => {
    const selectedDifficulty = button.dataset.difficulty;
    window.difficulty = selectedDifficulty;

    console.log("=== Difficulty Selected ===");
    console.log("Difficulty:", window.difficulty);
    console.log("===========================");

    // Add fade-out animation class for visuals only
    if (difficultyBox) {
      difficultyBox.classList.add("fade-out");
    }

    // ⚡ Immediately transition to story (no delay)
    loadStory(selectedDifficulty);
  });
});
