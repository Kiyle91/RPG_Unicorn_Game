/* ============================================================
   STORY SCREEN – OLIVIA’S WORLD RPG
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const storySection = document.getElementById("story-section");
  const storyTitle = document.getElementById("story-title");
  const storyText = document.getElementById("story-text");
  const continueBtn = document.getElementById("story-continue-btn");

  if (!storySection || !continueBtn) {
    console.error("❌ Story section or Continue button not found in the DOM!");
    return;
  }

  const storyPages = [
    {
    
      text: "Long ago, in the sparkling kingdom of Luminara, unicorns roamed freely under pastel skies. The gentle magic of the land kept everything in harmony — but tonight, the stars whisper of change..."
    },
    {
      
      text: "A brave princess awakens, sensing a calling far greater than any ordinary morning. The unicorns, once playful, now seem restless. Something stirs in the enchanted forest beyond the palace walls..."
    },
    {
      
      text: "Stepping into the courtyard, the air hums with power. A silver-maned unicorn bows before you, its eyes filled with urgency. The light is fading — and your destiny begins now..."
    }
  ];

  let currentPage = 0;

  // Initial setup
  storyTitle.textContent = storyPages[0].title;
  storyText.textContent = storyPages[0].text;

  continueBtn.addEventListener("click", () => {
    console.log("✨ Continue button clicked!");

    // 💫 Disable button briefly to prevent spamming
    continueBtn.disabled = true;
    continueBtn.classList.add("fade-out-btn");

    // Re-enable after 1 second
    setTimeout(() => {
      continueBtn.disabled = false;
      continueBtn.classList.remove("fade-out-btn");
    }, 4000);

    // Advance the story
    currentPage++;

    if (currentPage < storyPages.length) {
      // Fade the text out, change content, fade back in
      storyText.classList.add("fade-out");
      storyTitle.classList.add("fade-out");

      setTimeout(() => {
        storyTitle.textContent = storyPages[currentPage].title;
        storyText.textContent = storyPages[currentPage].text;
        storyText.classList.remove("fade-out");
        storyTitle.classList.remove("fade-out");
      }, 300);
    } else {
      // End of story → next screen
      storySection.classList.remove("active");
      storySection.style.display = "none";

      const battleScreen = document.getElementById("battle-screen");
      if (battleScreen) {
        battleScreen.classList.add("active");
        battleScreen.style.display = "flex";
      }

      console.log("✅ Story finished — moving to battle!");
    }
  });
});
