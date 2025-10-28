/* ============================================================
   🌸 CLASS_SELECTION.JS – Olivia’s World RPG
   ------------------------------------------------------------
   Handles:
   ✦ Player name entry and validation
   ✦ Class definitions & base stats
   ✦ Player creation logic
   ✦ Screen transitions to difficulty select
   ✦ Return button navigation
   ✦ Initial save creation
============================================================ */

/* ============================================================
   🧍‍♀️ PLAYER COMBAT STATS (Base Defaults)
============================================================ */
const playerDefaults = window.player || {};
playerDefaults.attackRange = 40;     // pixels
playerDefaults.attackDamage = 15;
playerDefaults.attackCooldown = 600; // ms
playerDefaults.lastAttack = 0;

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
  const newPlayer = {
    classKey: selectedClass,
    ...baseClass,
    name: window.playerName,
    currentStats: { ...baseClass.baseStats },
    level: 1,
    experience: 0,
    armorUpgrades: [],
  };

  window.player = newPlayer;

  // 💾 Save initial state
  if (typeof saveGame === "function") {
    saveGame();
    console.log("💾 Player saved after class selection.");
  }

  // 🧩 Debug summary
  console.group("🎀 Player Created");
  console.log("Name:", newPlayer.name);
  console.log("Class:", newPlayer.classKey);
  console.log("Stats:", newPlayer.currentStats);
  console.log("Attacks:", newPlayer.classAttacks);
  console.groupEnd();

  return newPlayer;
}

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
