
/* ============================================================
   🎀 ELEMENT REFERENCES
============================================================ */
const confirmBtn     = document.getElementById("confirm-name");         // Confirm / Next button
const playerInput    = document.getElementById("player-name");          // Name input field
const namingPage     = document.getElementById("naming-page");          // Naming screen
const classPage      = document.getElementById("class-selection-page"); // Class selection screen
const welcomeHeader  = document.getElementById("classtextheader");      // Header text element

const difficultyButtons = document.querySelectorAll(".difficulty-btn");
const difficultyScreen  = document.getElementById("difficulty-screen");
const difficultyBox     = document.getElementById("difficulty-box");
const storySection      = document.getElementById("story-section");
const storyTitle        = document.getElementById("story-title");
const storyText         = document.getElementById("story-text");


/* ============================================================
   🧭 UNIVERSAL SCREEN SWITCHER
============================================================ */
function showScreen(nextId) {
  document.querySelectorAll(".screen").forEach((s) => {
    s.classList.remove("active");
    s.style.display = "none";
  });
  const next = document.getElementById(nextId);
  if (next) {
    next.classList.add("active");
    next.style.display = "flex";
  }
}



/* ============================================================
   🧹 HIDE ALL SCREENS HELPER
============================================================ */
function hideAllScreens() {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
    screen.style.display = "none";
  });
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


/* ============================================================
   ✨ CLASS SELECTION HANDLER
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const classButtons = document.querySelectorAll(".class-btn");
  const returnButton = document.getElementById("return-class");

  // 🧩 Attach class button listeners
  classButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedClass = button.dataset.class;
      const player = createPlayer(selectedClass);
      if (!player) return;

      // 💾 Optional silent save
      if (typeof window.saveGame === "function") {
        window.saveGame(false);
      }

      // 🌸 Personalized message
      const playerName = window.playerName || "Adventurer";

      // 💬 Use custom showAlert if available
      if (typeof window.showAlert === "function") {
        window.showAlert(
          `Let's go ${playerName}, the Queen and our Castle await you!`,
          () => {
            showScreen("difficulty-screen");
            console.log("🌸 Transitioned to difficulty screen after OK.");
          }
        );
      } else {
        alert(`Let's go Princess ${playerName}, the castle awaits us!`);
        showScreen("difficulty-screen");
      }

      console.log(`✨ Class selected: ${selectedClass}`);
    });
  });

  // 🔙 Return button logic
  if (returnButton) {
    returnButton.addEventListener("click", () => {
      console.log("🔙 Return button clicked — going back to landing page.");
      showScreen("landing-page");
    });
  }
});


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


/* ============================================================
   ⚠️ CUSTOM ALERT BOX — Smooth OK / YES-NO Handling
============================================================ */
function showAlert(message, onConfirm = null, onCancel = null) {
  const box = document.getElementById("custom-alert");
  const msg = document.getElementById("alert-message");
  const btns = box?.querySelector(".alert-btns");
  if (!box || !msg || !btns) return alert(message);

  msg.textContent = message;
  btns.innerHTML = "";

  // Helper to build buttons
  const makeBtn = (text, cls, action) => {
    const b = document.createElement("button");
    b.textContent = text;
    b.className = cls;
    b.onclick = () => {
      box.classList.add("alert-hidden");
      action?.();
    };
    return b;
  };

  // ✅ Determine button type
  const hasBoth = typeof onConfirm === "function" && typeof onCancel === "function";

  if (hasBoth) {
    // Confirmation dialog (Yes / No)
    btns.append(
      makeBtn("Yes", "alert-yes", onConfirm),
      makeBtn("No", "alert-no", onCancel)
    );
  } else {
    // Informational dialog (OK)
    btns.append(makeBtn("OK", "alert-ok", onConfirm));
  }

  // Show the alert box
  box.classList.remove("alert-hidden");
}