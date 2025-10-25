/* ==========================
   CLASS SELECTION + PLAYER DATA
   ========================== */

// ----- Class Definitions -----
const classes = {
  glitterGuardian: {
    name: "Glitter Guardian",
    baseStats: { hp: 120, mana: 40, speed: 10, armor: 5, healing: 5, attack: 15, ranged: 5, critChance: 10 },
    preferredStats: ['hp', 'attack'],
    classAttacks: [
      { name: "Glitter Strike", type: "melee", damage: 10, extraEffect: "additional glitter damage" }
    ]
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

// ----- Universal Screen Switcher -----
function showScreen(nextId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
    screen.style.display = 'none';
  });

  const nextScreen = document.getElementById(nextId);
  if (nextScreen) {
    nextScreen.classList.add('active');
    nextScreen.style.display = 'flex';
  }
}

// ----- Create Player Object -----
function createPlayer(selectedClass) {
  const baseClass = classes[selectedClass];
  if (!baseClass) {
    console.error(`❌ Class "${selectedClass}" does not exist!`);
    return null;
  }

  // 🧩 Build player object
  const player = {
    classKey: selectedClass,                    // internal class ID (e.g., 'starSage')
    ...baseClass,                               // includes stats, attacks, etc.
    name: window.playerName || "Player",        // ✅ player's chosen name takes priority
    currentStats: { ...baseClass.baseStats },   // copy of base stats (modifiable)
    level: 1,
    experience: 0,
    armorUpgrades: []
  };

  // 🪄 Sync global name if necessary
  if (window.playerName) {
    player.name = window.playerName;
    console.log("👑 Player name synced:", player.name);
  }

  // ✅ Save globally
  window.player = player;

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


// ----- Handle Class Selection -----
const classButtons = document.querySelectorAll(".class-btn");

classButtons.forEach(button => {
  button.addEventListener("click", () => {
    const selectedClass = button.dataset.class;

    // Create global player object
    window.player = createPlayer(selectedClass);
    if (!window.player) return;

    // Debug info
    console.group("=== Player Selected ===");
    console.log("Name:", window.player.name);
    console.log("Class Key:", window.player.classKey);
    console.log("Level:", window.player.level);
    console.log("Stats:", window.player.currentStats);
    console.log("Attacks:", window.player.classAttacks);
    console.groupEnd();

    // Move from class page → difficulty screen
    showScreen('difficulty-screen');
  });
});

// ----- Optional Helper -----
function printPlayerName() {
  if (window.playerName) {
    console.log("Player name is:", window.playerName);
  } else {
    console.log("Player name not set yet.");
  }
}
