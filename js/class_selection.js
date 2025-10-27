/* ============================================================
   🌸 CLASS_SELECTION.JS – Olivia’s World RPG
   ------------------------------------------------------------
   Handles:
   ✦ Class definitions & base stats
   ✦ Player creation logic
   ✦ Screen transitions to difficulty select
   ✦ Return button navigation
   ✦ Initial save creation
============================================================ */


/* ============================================================
   🧙 CLASS DEFINITIONS
============================================================ */
const classes = {
  glitterGuardian: {
    name: "Glitter Guardian",
    baseStats: {
      hp: 120, mana: 40, speed: 1.5, armor: 5,
      healing: 5, attack: 15, ranged: 5, critChance: 10,
    },
    preferredStats: ["hp", "attack"],
    classAttacks: [
      { name: "Glitter Strike", type: "melee", damage: 10, extraEffect: "additional glitter damage" },
    ],
  },

  starSage: {
    name: "Star Sage",
    baseStats: {
      hp: 80, mana: 120, speed: 2, armor: 3,
      healing: 5, attack: 5, ranged: 5, critChance: 15,
    },
    preferredStats: ["mana", "spell"],
    classAttacks: [
      { name: "Fireball", type: "spell", damage: 25 },
      { name: "Lightning Strike", type: "spell", damage: 30 },
    ],
  },

  moonflower: {
    name: "Moonflower",
    baseStats: {
      hp: 100, mana: 100, speed: 2, armor: 4,
      healing: 15, attack: 10, ranged: 5, critChance: 10,
    },
    preferredStats: ["healing", "mana"],
    classAttacks: [
      { name: "Healing Bloom", type: "heal", amount: 25 },
      { name: "Moonbeam", type: "spell", damage: 15 },
    ],
  },

  silverArrow: {
    name: "Silver Arrow",
    baseStats: {
      hp: 90, mana: 50, speed: 2.5, armor: 3,
      healing: 5, attack: 10, ranged: 20, critChance: 15,
    },
    preferredStats: ["ranged", "attack"],
    classAttacks: [
      { name: "Piercing Shot", type: "ranged", damage: 25, extraEffect: "chance to dodge enemy attack" },
    ],
  },
};


/* ============================================================
   👑 PLAYER CREATION LOGIC
============================================================ */
function createPlayer(selectedClass) {
  const baseClass = classes[selectedClass];
  if (!baseClass) {
    console.error(`❌ Class "${selectedClass}" does not exist!`);
    return null;
  }

  // 🩷 Retrieve or set default player name
  window.playerName = window.playerName || localStorage.getItem("playerName") || "Player";

  // 🎮 Build player object
  const player = {
    classKey: selectedClass,
    ...baseClass,
    name: window.playerName,
    currentStats: { ...baseClass.baseStats },
    level: 1,
    experience: 0,
    armorUpgrades: [],
  };

  window.player = player;

  // 💾 Save initial state
  if (typeof saveGame === "function") {
    saveGame();
    console.log("💾 Player saved after class selection.");
  }

  // 🧩 Debug summary
  console.group("🎀 Player Created");
  console.log("Name:", player.name);
  console.log("Class:", player.classKey);
  console.log("Stats:", player.currentStats);
  console.log("Attacks:", player.classAttacks);
  console.groupEnd();

  return player;
}


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
   🧾 HELPER – PRINT PLAYER NAME
============================================================ */
function printPlayerName() {
  if (window.playerName) {
    console.log("👑 Player name is:", window.playerName);
  } else {
    console.log("⚠️ Player name not set yet.");
  }
}
