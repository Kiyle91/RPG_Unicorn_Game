/* ------------------ Story Section JS ------------------ */

const storySection = document.getElementById("story-section");
const storyPage1 = document.getElementById("story-page-1");
const continueBtn = document.getElementById("story-continue-btn");

// Example: you could have multiple story pages if needed
const storyPages = [
  {
    title: "✨ Chapter 1: The Awakening ✨",
    text: "Long ago, in the sparkling kingdom of Luminara, unicorns roamed freely, and magic filled the air. But darkness is stirring..."
  },
  {
    title: "✨ Chapter 2: A Hero is Chosen ✨",
    text: "A brave princess wakes from her dreams, destined to protect the unicorns and restore light to the kingdom."
  }
];

let currentPage = 0;

continueBtn.addEventListener("click", () => {
  currentPage++;

  if (currentPage < storyPages.length) {
    // Update title and text for next page
    document.getElementById("story-title").textContent = storyPages[currentPage].title;
    document.getElementById("story-text").textContent = storyPages[currentPage].text;
  } else {
    // End of story, hide story section and go to next screen (e.g., battle or main game)
    storySection.classList.remove("active");
    
    // Example: show battle screen (adjust ID as needed)
    const battleScreen = document.getElementById("battle-screen");
    if (battleScreen) battleScreen.classList.add("active");

    console.log("Story finished, moving to the next screen!");
  }
});
