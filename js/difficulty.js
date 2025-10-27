/* ============================================================
   🌈 DIFFICULTY.JS – Olivia’s World RPG
   ------------------------------------------------------------
   Handles:
   ✦ Difficulty selection
   ✦ Difficulty-based story intro
   ✦ Transition to the Story screen
============================================================ */


/* ============================================================
   🎀 ELEMENT REFERENCES
============================================================ */
const difficultyButtons = document.querySelectorAll(".difficulty-btn");
const difficultyScreen  = document.getElementById("difficulty-screen");
const difficultyBox     = document.getElementById("difficulty-box");
const storySection      = document.getElementById("story-section");
const storyTitle        = document.getElementById("story-title");
const storyText         = document.getElementById("story-text");


/* ============================================================
   🪄 HELPER – HIDE ALL SCREENS
============================================================ */
function hideAllScreens() {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
    screen.style.display = "none";
  });
}


/* ============================================================
   📖 LOAD STORY SCREEN
============================================================ */
function loadStory(selectedDifficulty) {
  // ✨ Difficulty-based intro text
  const storyContent = {
    easy: {
      title: "🌷 The Gentle Path ",
      text: `"Princess Ariana welcomes you into Queen Nebaya’s radiant castle, where laughter fills the marble halls. 'You’ve arrived safely,' she says with a smile. 'Come — the recruits are training in the courtyard. It’s peaceful there… perfect for your first lesson.' Sunlight dances on crystal windows as the gates open to the warm, pastel courtyard beyond."`,
    },
    medium: {
      title: "🌸 The Path of Balance",
      text: `"The castle hums with quiet power as Princess Ariana guides you through enchanted halls. 'Mother says courage must grow through challenge,' she explains. The air grows sharper as you near the courtyard, where steel meets sunlight and laughter turns to focus. 'Let’s see what strength lies in your heart,' she says — and the training begins."`,
    },
    hard: {
      title: "🔥 The Path of Storms",
      text: `"Thunder rolls above Nebaya’s towers as Princess Ariana strides beside you. 'The Queen believes in your potential,' she says. 'Now prove her right.' The air thickens with the scent of steel and rain as the courtyard gates open. Rookie soldiers pause mid-duel — and all eyes turn to you.",
}`,
    },
  };

  const content = storyContent[selectedDifficulty] || storyContent.medium;

  // 🧩 Update story UI
  if (storyTitle) storyTitle.textContent = content.title;
  if (storyText)  storyText.textContent  = content.text;

  // 🎬 Show story section
  hideAllScreens();
  storySection.style.display = "flex";
  storySection.classList.add("active");

  console.log(`📖 Story screen loaded for difficulty: ${selectedDifficulty}`);
}


/* ============================================================
   🧭 DIFFICULTY SELECTION HANDLER
============================================================ */
difficultyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedDifficulty = button.dataset.difficulty;
    window.difficulty = selectedDifficulty;

    console.group("🎯 Difficulty Selected");
    console.log("Difficulty:", window.difficulty);
    console.groupEnd();

    // Add CSS fade-out (handled visually in CSS)
    if (difficultyBox) difficultyBox.classList.add("fade-out");

    // ⏳ Smooth 500ms delay before story screen
    console.log("✨ Transitioning to story in 500 ms...");
    setTimeout(() => {
      loadStory(selectedDifficulty);
      console.log("🌸 Story screen now active.");
    }, 500);
  });
});
