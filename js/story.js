/* ============================================================
   📖 STORY SCREEN – OLIVIA’S WORLD RPG
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const storySection = document.getElementById("story-section");
  const storyText = document.getElementById("story-text");
  const continueBtn = document.getElementById("story-continue-btn");

  // 🧩 Safety check
  if (!storySection || !continueBtn) {
    console.error("❌ Story section or Continue button not found in the DOM!");
    return;
  }

  /* ============================================================
     🌸 STORY PAGES – Extendable Narrative System
  ============================================================ */
  const storyPages = [
    {
      text: "Long ago, in the sparkling kingdom of Luminara, unicorns roamed freely under pastel skies. The gentle magic of the land kept everything in harmony — but tonight, the stars whisper of change..."
    },
    {
      text: "A brave princess awakens, sensing a calling far greater than any ordinary morning. The unicorns, once playful, now seem restless. Something stirs in the enchanted forest beyond the palace walls..."
    },
    {
      text: "⚠️ Scalability stops here so we can focus on other more advanced HTML mechanics.⚠️"
    }
  ];

  let currentPage = 0;
  storyText.textContent = storyPages[0].text;

  /* ============================================================
     ✨ CONTINUE BUTTON HANDLER
  ============================================================ */
  continueBtn.addEventListener("click", () => {
    console.log("✨ Continue button clicked!");

    // 💫 Prevent button spamming
    continueBtn.disabled = true;
    continueBtn.classList.add("fade-out-btn");

    setTimeout(() => {
      continueBtn.disabled = false;
      continueBtn.classList.remove("fade-out-btn");
    }, 500);

    // ➡️ Advance story after a short delay
    setTimeout(() => {
      currentPage++;

      if (currentPage < storyPages.length) {
        // Smooth fade between pages
        storyText.classList.add("fade-out");

        setTimeout(() => {
          storyText.textContent = storyPages[currentPage].text;
          storyText.classList.remove("fade-out");
        }, 300);

      } else {
        // 🌸 End of story → Move to Explore Page
        console.log("✅ Story finished — moving to Explore mode...");

        // Fade-out current section before switching
        storySection.classList.remove("active");
        storySection.style.display = "none";

        // Show Explore Page
        showScreen("explore-page");

        // Start explore mode safely
        if (typeof startExploreGame === "function") {
          console.log("🌷 Starting Explore mode via Story transition...");
          startExploreGame();
        } else {
          console.warn("⚠️ startExploreGame() not found — check script load order.");
        }
      }
    }, 500); // ⏳ 500 ms delay before transitioning
  });
});
