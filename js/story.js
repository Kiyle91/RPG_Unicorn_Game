/* ------------------ Story Section JS ------------------ */

const storySection = document.getElementById("story-section");
const storyPage1 = document.getElementById("story-page-1");
const continueBtn = document.getElementById("story-continue-btn");

// Example: you could have multiple story pages if needed
const storyPages = [
  {
    title: "✨ Chapter 1: The Awakening ✨",
    text: "Long ago, in the sparkling kingdom of Luminara, unicorns roamed freely, and magic filled the air. But whispers of shadow have begun to creep across the forests and mountains. Ancient prophecies speak of a time when the light will falter, and a brave heart will rise to protect the kingdom. You, the princess of Luminara, are that heart. Your journey begins in the quiet of dawn, as the first rays of sunlight dance across your chamber and the winds carry faint, urgent whispers from the enchanted forests. The air smells of morning dew and jasmine, and somewhere far off, a unicorn’s soft neigh pierces the stillness, calling you toward your destiny."
  },
  {
    title: "✨ Chapter 2: A Hero is Chosen ✨",
    text: "A brave princess awakens, sensing a calling far greater than any ordinary morning. The unicorns of the kingdom, majestic guardians of magic, are in danger, and only one with courage, wisdom, and a spark of magic can guide them to safety. Your heart pounds with purpose as you rise, feeling the weight of destiny settle upon your shoulders. Each step toward the castle gates echoes with the promise of adventure, friendship, and the challenges that lie ahead. The enchanted forests shimmer faintly in the morning light, as if the world itself is holding its breath, waiting to see what you will do next."
  },
  {
    title: "✨ Chapter 3: The First Call ✨",
    text: "Stepping into the courtyard, the morning breeze carries the scent of fresh grass and magical blooms. A gentle glow surrounds the stables, where the unicorns wait, sensing your presence. One of them, a silver-maned unicorn with eyes like liquid sapphires, approaches, bowing its head in recognition. You realize that the journey ahead is not just about courage, but compassion, wisdom, and the bond you share with these creatures. Dark clouds gather on the horizon, hinting at the trials to come, yet your resolve shines brighter than the rising sun. The adventure of a lifetime begins with a single step."
  }
];

let currentPage = 0;

continueBtn.addEventListener("click", () => {
  currentPage++;

  if (currentPage < storyPages.length) {
    // Show next story content
    document.getElementById("story-title").textContent = storyPages[currentPage].title;
    document.getElementById("story-text").textContent = storyPages[currentPage].text;
  } else {
    // Finished the story
    storySection.classList.remove("active");

    // Move to next stage (e.g., battle screen)
    const battleScreen = document.getElementById("battle-screen");
    if (battleScreen) battleScreen.classList.add("active");

    console.log("✅ Story finished — moving to the next screen!");
  }
});