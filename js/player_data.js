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
    name: 'Glitter Guardian',
    baseStats: {
      hp: 120, mana: 40, speed: 1.8, armor: 5,
      healing: 5, attack: 15, ranged: 5, critChance: 10, level: 1, experience: 0, expToNextLevel: 100,
    },
    preferredStats: ['hp', 'attack'],
    classAttacks: [
      { name: 'Glitter Strike', type: 'melee', damage: 10, extraEffect: 'additional glitter damage' },
    ],
  },

  starSage: {
    name: 'Star Sage',
    baseStats: {
      hp: 80, mana: 120, speed: 1.8, armor: 3,
      healing: 5, attack: 5, ranged: 5, critChance: 15, level: 1, experience: 0, expToNextLevel: 100,
    },
    preferredStats: ['mana', 'spell'],
    classAttacks: [
      { name: 'Fireball', type: 'spell', damage: 25 },
      { name: 'Lightning Strike', type: 'spell', damage: 30 },
    ],
  },

  moonflower: {
    name: 'Moonflower',
    baseStats: {
      hp: 100, mana: 100, speed: 1.8, armor: 4,
      healing: 15, attack: 10, ranged: 5, critChance: 10, level: 1, experience: 0, expToNextLevel: 100,
    },
    preferredStats: ['healing', 'mana'],
    classAttacks: [
      { name: 'Healing Bloom', type: 'heal', amount: 25 },
      { name: 'Moonbeam', type: 'spell', damage: 15 },
    ],
  },

  silverArrow: {
    name: 'Silver Arrow',
    baseStats: {
      hp: 90, mana: 50, speed: 1.8, armor: 3,
      healing: 5, attack: 10, ranged: 20, critChance: 15, level: 1, experience: 0, expToNextLevel: 100,
    },
    preferredStats: ['ranged', 'attack'],
    classAttacks: [
      { name: 'Piercing Shot', type: 'ranged', damage: 25, extraEffect: 'chance to dodge enemy attack' },
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
  window.playerName = window.playerName || localStorage.getItem('playerName') || 'Player';

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
  if (typeof saveGame === 'function') {
    saveGame();
    console.log('💾 Player saved after class selection.');
  }

  // 🧩 Debug summary
  console.group('🎀 Player Created');
  console.log('Name:', newPlayer.name);
  console.log('Class:', newPlayer.classKey);
  console.log('Stats:', newPlayer.currentStats);
  console.log('Attacks:', newPlayer.classAttacks);
  console.groupEnd();

  return newPlayer;
}


/* ============================================================
   🧙‍♀️ EXPERIENCE & LEVEL SYSTEM – Olivia’s World RPG
   ------------------------------------------------------------
   ✦ Unified, self-contained leveling logic
   ✦ Works automatically with combat and UI
   ✦ Persists through save/load
============================================================ */

window.addExperience = function (amount = 50) {
  const p = window.player;
  if (!p) return console.warn('⚠️ Player not initialized!');

  // Initialize fields if missing
  p.experience = p.experience ?? 0;
  p.expToNextLevel = p.expToNextLevel ?? 100;
  p.level = p.level ?? 1;

  // Add XP
  p.experience += amount;
  console.log(`🌟 +${amount} XP → ${p.experience}/${p.expToNextLevel}`);

  // Floating XP text
  window.showDamageText?.(`+${amount} XP`, p.x ?? 200, p.y ?? 200, '#ffd700');

  // Check for level-up
  while (p.experience >= p.expToNextLevel) {
    p.experience -= p.expToNextLevel;
    window.levelUp?.();
  }

  // Update on-screen XP info
  window.updateExpDisplay?.();
};


/* ============================================================
   🆙 LEVEL UP HANDLER
============================================================ */
window.levelUp = function () {
  const p = window.player;
  if (!p) return console.warn('⚠️ Player not initialized!');

  p.level = (p.level ?? 1) + 1;
  p.expToNextLevel = Math.floor((p.expToNextLevel ?? 100) * 1.25);

  // Stat gains
  p.maxHp = (p.maxHp ?? p.hp ?? 100) + 10;
  p.hp = p.maxHp;
  p.maxMana = (p.maxMana ?? p.mana ?? 50) + 5;
  p.mana = p.maxMana;

  console.log(`🆙 Level ${p.level}! Next at ${p.expToNextLevel} XP`);

  // Visual & UI feedback
  window.showDamageText?.(`LEVEL ${p.level}!`, p.x ?? 200, p.y ?? 200, '#00ffcc');
  window.updateHPBar?.();
  window.updateManaBar?.();
  window.updateExpDisplay?.();

  // Optional: small golden burst animation
  window.showCritEffect?.(p.x, p.y);

  // Auto-save silently
  window.saveGame?.(false);
};


/* ============================================================
   📊 EXPERIENCE DISPLAY UPDATER
   (Call this from inventory/stats or overlay UI)
============================================================ */
window.updateExpDisplay = function () {
  const p = window.player;
  if (!p) return;

  const levelEl = document.getElementById('stat-level');
  const expEl = document.getElementById('stat-exp');

  if (levelEl) levelEl.textContent = p.level ?? 1;
  if (expEl) expEl.textContent = `${p.experience ?? 0} / ${p.expToNextLevel ?? 100}`;
};
