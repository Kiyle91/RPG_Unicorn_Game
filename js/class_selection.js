/* ============================================================
   🌸 CLASS SELECTION + PLAYER DATA
   ============================================================ */

// ----- CLASS DEFINITIONS -----
const classes = {
  glitterGuardian: {
    name: "Glitter Guardian",
    baseStats: {
      hp: 120, mana: 40, speed: 1.5, armor: 5,
      healing: 5, attack: 15, ranged: 5, critChance: 10
    },
    preferredStats: ["hp", "attack"],
    classAttacks: [
      { name: "Glitter Strike", type: "melee", damage: 10, extraEffect: "additional glitter damage" }
    ]
  },

  starSage: {
    name: "Star Sage",
    baseStats: {
      hp: 80, mana: 120, speed: 2, armor: 3,
      healing: 5, attack: 5, ranged: 5, critChance: 15
    },
    preferredStats: ["mana", "spell"],
    classAttacks: [
      { name: "Fireball", type: "spell", damage: 25 },
      { name: "Lightning Strike", type: "spell", damage: 30 }
    ]
  },

  moonflower: {
    name: "Moonflower",
    baseStats: {
      hp: 100, mana: 100, speed: 2, armor: 4,
      healing: 15, attack: 10, ranged: 5, critChance: 10
    },
    preferredStats: ["healing", "mana"],
    classAttacks: [
      { name: "Healing Bloom", type: "heal", amount: 25 },
      { name: "Moonbeam", type: "spell", damage: 15 }
    ]
  },

  silverArrow: {
    name: "Silver Arrow",
    baseStats: {
      hp: 90, mana: 50, speed: 2.5, armor: 3,
      healing: 5, attack: 10, ranged: 20, critChance: 15
    },
    preferredStats: ["ranged", "attack"],
    classAttacks: [
      { name: "Piercing Shot", type: "ranged", damage: 25, extraEffect: "chance to dodge enemy attack" }
    ]
  }
};

/* ============================================================
   🔄 UNIVERSAL SCREEN SWITCHER
   ============================================================ */
function showScreen(nextId) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
    screen.style.display = "none";
  });

  const nextScreen = document.getElementById(nextId);
  if (nextScreen) {
    nextScreen.classList.add("active");
    nextScreen.style.display = "flex";
  }
}

/* ============================================================
   🧩 PLAYER CREATION LOGIC
   ============================================================ */
function createPlayer(selectedClass) {
  const baseClass = classes[selectedClass];
  if (!baseClass) {
    console.error(`❌ Class "${selectedClass}" does not exist!`);
    return null;
  }

  // Build player object
  const player = {
    classKey: selectedClass,
    ...baseClass,
    name: window.playerName || "Player",
    currentStats: { ...baseClass.baseStats },
    level: 1,
    experience: 0,
    armorUpgrades: []
  };

  // Sync name globally
  if (window.playerName) {
    player.name = window.playerName;
    console.log("👑 Player name synced:", player.name);
  }

  // Save player globally
  window.player = player;

  if (typeof saveGame === "function") {
    saveGame();
    console.log("💾 Initial player save created after class selection.");
  }

  // Debug info
  console.group("🎀 Player Created");
  console.log("Name:", player.name);
  console.log("Class:", player.classKey);
  console.log("Base Stats:", player.baseStats);
  console.log("Current Stats:", player.currentStats);
  console.log("Attacks:", player.classAttacks);
  console.groupEnd();

  return player;
}

/* ============================================================
   ✨ CLASS SELECTION HANDLER
   ============================================================ */
const classButtons = document.querySelectorAll(".class-btn");

classButtons.forEach(button => {
  button.addEventListener("click", () => {
    const selectedClass = button.dataset.class;
    window.player = createPlayer(selectedClass);
    if (!window.player) return;

    console.group("=== PLAYER SELECTED ===");
    console.log("Name:", window.player.name);
    console.log("Class Key:", window.player.classKey);
    console.log("Level:", window.player.level);
    console.log("Stats:", window.player.currentStats);
    console.log("Attacks:", window.player.classAttacks);
    console.groupEnd();

    // Smooth transition delay
    console.log(`✨ Class selected: ${selectedClass} — transitioning in 500ms...`);
    setTimeout(() => {
      showScreen("difficulty-screen");
      console.log("🌸 Transitioned to difficulty screen.");
    }, 500);
  });
});

/* ============================================================
   🧾 OPTIONAL HELPER
   ============================================================ */
function printPlayerName() {
  if (window.playerName) {
    console.log("Player name is:", window.playerName);
  } else {
    console.log("Player name not set yet.");
  }
}
