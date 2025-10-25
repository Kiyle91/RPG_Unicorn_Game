/* ============================================================
   STORY SCREEN – OLIVIA’S WORLD RPG
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const storySection = document.getElementById("story-section");
  const storyText = document.getElementById("story-text");
  const continueBtn = document.getElementById("story-continue-btn");

  if (!storySection || !continueBtn) {
    console.error("❌ Story section or Continue button not found in the DOM!");
    return;
  }

  // 🌸 STORY PAGES
  const storyPages = [
    {
      text: "Long ago, in the sparkling kingdom of Luminara, unicorns roamed freely under pastel skies. The gentle magic of the land kept everything in harmony — but tonight, the stars whisper of change..."
    },
    {
      text: "A brave princess awakens, sensing a calling far greater than any ordinary morning. The unicorns, once playful, now seem restless. Something stirs in the enchanted forest beyond the palace walls..."
    },
    {
      text: "⚠️ Scalability stops here so we can focus on other more advanced html mechanics.⚠️"
    }
  ];

  let currentPage = 0;

  // 🌈 Initial setup
  storyText.textContent = storyPages[0].text;

  continueBtn.addEventListener("click", () => {
    console.log("✨ Continue button clicked!");

    // 💫 Disable button briefly to prevent spamming
    continueBtn.disabled = true;
    continueBtn.classList.add("fade-out-btn");

    // Re-enable after 4 seconds
    setTimeout(() => {
      continueBtn.disabled = false;
      continueBtn.classList.remove("fade-out-btn");
    }, 1500);

    // ➡️ Advance the story
    currentPage++;

    if (currentPage < storyPages.length) {
      // Fade-out and update text
      storyText.classList.add("fade-out");

      setTimeout(() => {
        storyText.textContent = storyPages[currentPage].text;
        storyText.classList.remove("fade-out");
      }, 300);
    } else {
      // 🌸 End of story → move to Explore Page
      console.log("✅ Story finished — moving to explore mode!");
      storySection.classList.remove("active");
      storySection.style.display = "none";

      // Show Explore Page
      showScreen("explore-page");

      // Ensure startExploreGame exists before calling
      if (typeof startExploreGame === "function") {
        console.log("🌸 Explore mode started via story transition!");
        startExploreGame();
      } else {
        console.warn("⚠️ startExploreGame() not found — check script load order.");
      }
    }
  });
});
