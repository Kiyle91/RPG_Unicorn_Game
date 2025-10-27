/* ============================================================
   📖 STORY.JS – Olivia’s World RPG (2-Page Version)
   ------------------------------------------------------------
   Handles:
   ✦ Short two-page intro sequence
   ✦ Smooth fade transitions
   ✦ Transition into Explore / courtyard scene
============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const storySection = document.getElementById("story-section");
  const storyText    = document.getElementById("story-text");
  const continueBtn  = document.getElementById("story-continue-btn");

  if (!storySection || !continueBtn) {
    console.error("❌ Story section or Continue button not found!");
    return;
  }

  /* ============================================================
     🌸 TWO-PAGE STORY
  ============================================================ */
  const storyPages = [
    {
      text: "The gates of Queen Nebaya’s castle shimmer under a lavender sky as you arrive beside Princess Ariana. Her smile glows like moonlight on water. “You made it!” she says warmly. “Mother will be thrilled. Come, there’s so much to see.” She guides you through halls of crystal and song — portraits of queens watching as chandeliers sparkle above. The air hums with soft enchantment, and every step feels like a welcome home.",
    },
    {
      text: "“This way,” Ariana says, leading you through tall doors that open onto the training courtyard. Laughter and the ring of steel fill the air. “These are the Queen’s recruits — brave, if a little clumsy.” She winks. “How about showing them what real courage looks like?” The soldiers grin nervously as sunlight flares across their wooden blades. Ariana steps back, eyes bright. “The courtyard is yours, Princess.” The next chapter of your story begins here.",
    },
  ];

  let currentPage = 0;
  storyText.textContent = storyPages[0].text;

  /* ============================================================
     ✨ CONTINUE BUTTON HANDLER
  ============================================================ */
  continueBtn.addEventListener("click", () => {
    continueBtn.disabled = true;
    storyText.classList.add("fade-out");

    setTimeout(() => {
      currentPage++;

      if (currentPage < storyPages.length) {
        storyText.textContent = storyPages[currentPage].text;
        storyText.classList.remove("fade-out");
        continueBtn.disabled = false;
      } else {
        // ✅ End of story → Move to Explore / courtyard
        storySection.classList.remove("active");
        storySection.style.display = "none";
        showScreen("explore-page");

        if (typeof startExploreGame === "function") {
          startExploreGame();
        } else {
          console.warn("⚠️ startExploreGame() not found — check script load order.");
        }
      }
    }, 600);
  });
});
