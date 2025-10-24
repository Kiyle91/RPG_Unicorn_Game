/* ==========================
   CLASS SELECTION + PLAYER DATA
   ========================== */

// ----- Class Definitions -----
const classes = {
  glitterGuardian: {
    name: "Glitter Guardian",
    baseStats: { hp: 120, mana: 40, speed: 10, armor: 5, healing: 5, attack: 15, ranged: 5, critChance: 10 },
    preferredStats: ['hp', 'attack'],
    classAttacks: [{ name: "Glitter Strike", type: "melee", damage: 10, extraEffect: "additional glitter damage" }]
  },
  starSage: {
    name: "Star Sage",
    baseStats: { hp: 80, mana: 120, speed: 12, armor: 3, healing: 5, attack: 5, ranged: 5, critChance: 15 },
    preferredStats: ['mana', 'spell'],
    classAttacks: [
      { name: "Fireball", type: "spell", damage: 25 },
      { name: "Lightning Strike", type: "spell", damage: 30 }
    ]
  },
  moonflower: {
    name: "Moonflower",
    baseStats: { hp: 100, mana: 100, speed: 10, armor: 4, healing: 15, attack: 10, ranged: 5, critChance: 10 },
    preferredStats: ['healing', 'mana'],
    classAttacks: [
      { name: "Healing Bloom", type: "heal", amount: 25 },
      { name: "Moonbeam", type: "spell", damage: 15 }
    ]
  },
  silverArrow: {
    name: "Silver Arrow",
    baseStats: { hp: 90, mana: 50, speed: 14, armor: 3, healing: 5, attack: 10, ranged: 20, critChance: 15 },
    preferredStats: ['ranged', 'attack'],
    classAttacks: [
      { name: "Piercing Shot", type: "ranged", damage: 25, extraEffect: "chance to dodge enemy attack" }
    ]
  }
};

// ----- Create Player Object -----
function createPlayer(selectedClass) {
  const baseClass = classes[selectedClass];
  if (!baseClass) {
    console.error(`Class "${selectedClass}" does not exist!`);
    return null;
  }

  return {
    name: window.playerName || "Player", // Global name set from naming page
    classKey: selectedClass,
    ...baseClass,
    currentStats: { ...baseClass.baseStats },
    level: 1,
    experience: 0,
    armorUpgrades: []
  };
}

// ----- Handle Class Selection -----
const classButtons = document.querySelectorAll(".class-btn");
const difficultyScreen = document.getElementById("difficulty-screen");

classButtons.forEach(button => {
  button.addEventListener("click", () => {
    const selectedClass = button.dataset.class;

    // Create the player object globally
    window.player = createPlayer(selectedClass);
    if (!window.player) return;

    // Print player info to console
    console.log("=== Player Selected ===");
    console.log("Name:", window.player.name);
    console.log("Class:", window.player.name);
    console.log("Class Key:", window.player.classKey);
    console.log("Level:", window.player.level);
    console.log("Stats:", window.player.currentStats);
    console.log("Attacks:", window.player.classAttacks);
    console.log("=======================");

    // Hide the class selection screen
    document.getElementById("class-selection-page").classList.remove("active");

    // Show the difficulty screen
    if (difficultyScreen) difficultyScreen.classList.add("active");
  });
});

// ----- Optional Helper Function to Print Player Name -----
function printPlayerName() {
  if (window.playerName) {
    console.log("Player name is:", window.playerName);
  } else {
    console.log("Player name not set yet.");
  }
}
