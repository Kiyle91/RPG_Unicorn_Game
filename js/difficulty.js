/* ==========================
   DIFFICULTY SELECTION
   ========================== */
const difficultyButtons = document.querySelectorAll(".difficulty-btn");

difficultyButtons.forEach(button => {
  button.addEventListener("click", () => {
    const selectedDifficulty = button.dataset.difficulty;

    // Store globally
    window.difficulty = selectedDifficulty;

    console.log("=== Difficulty Selected ===");
    console.log("Difficulty:", window.difficulty);
    console.log("===========================");

    // Hide the difficulty screen
    // Hide the difficulty screen
    document.getElementById("difficulty-screen").classList.remove("active");

// Show the story section
    document.getElementById("story-section").classList.add("active");


    // TODO: show the next screen (story, battle, etc.)
  });
});
