/* ------------------ PLAYER JS: Naming + Class Selection ------------------ */

// ----- Naming Page -----
const confirmBtn = document.getElementById('confirm-name');
const playerInput = document.getElementById('player-name');

confirmBtn.addEventListener('click', () => {
  const playerName = playerInput.value.trim();
  if (playerName === "") {
    alert("Please enter your name!");
    return;
  }

  // Store globally
  window.playerName = playerName;

  // Hide Naming Page
  document.getElementById('naming-page').classList.remove('active');

  // Show Class Selection Page
  const classSelection = document.getElementById('class-selection-page');
  if (classSelection) classSelection.classList.add('active');

  // Update welcome header
  const welcomeHeader = document.getElementById('classtextheader');
  if (welcomeHeader) {
    welcomeHeader.textContent = `✨ Welcome, ${playerName}! Choose your class ✨`;
  }
});

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
    name: window.playerName || "Player",
    classKey: selectedClass,
    ...baseClass,
    currentStats: { ...baseClass.baseStats },
    level: 1,
    experience: 0,
    armorUpgrades: []
  };
}

// ----- Handle Class Selection -----
// Grab all class buttons and difficulty screen
const classButtons = document.querySelectorAll(".class-btn");
const difficultyScreen = document.getElementById("difficulty-screen");

// Global player object
let player;

// Function to create the player
function createPlayer(selectedClass) {
  const baseClass = classes[selectedClass];
  if (!baseClass) {
    console.error(`Class "${selectedClass}" does not exist!`);
    return null;
  }

  return {
    name: window.playerName || "Player",
    classKey: selectedClass,
    ...baseClass,
    currentStats: { ...baseClass.baseStats },
    level: 1,
    experience: 0,
    armorUpgrades: []
  };
}

// Hook up each class button
classButtons.forEach(button => {
  button.addEventListener("click", () => {
    const selectedClass = button.dataset.class;
    
    // Create the player object
    player = createPlayer(selectedClass);
    if (!player) return;

    console.log("Player object created:", player);

    // Hide the class selection screen
    document.getElementById("class-selection-page").classList.remove("active");

    // Show the difficulty screen
    if (difficultyScreen) difficultyScreen.classList.add("active");
  });
});


// ----- Display Player Stats -----
function displayPlayerStats(player) {
  const statsDiv = document.getElementById("player-stats");
  if (statsDiv) {
    statsDiv.innerHTML = `
      <p>${player.name} the ${player.classKey}</p>
      <p>HP: ${player.currentStats.hp}</p>
      <p>Mana: ${player.currentStats.mana}</p>
      <p>Attack: ${player.currentStats.attack}</p>
      <p>Ranged: ${player.currentStats.ranged}</p>
      <p>Healing: ${player.currentStats.healing}</p>
      <p>Armor: ${player.currentStats.armor}</p>
      <p>Speed: ${player.currentStats.speed}</p>
      <p>Crit Chance: ${player.currentStats.critChance}%</p>
    `;
  }
}
