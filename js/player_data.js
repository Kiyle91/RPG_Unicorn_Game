/* ============================================================
   🌸 PLAYER & CLASS SYSTEM – Olivia’s World RPG
   ------------------------------------------------------------
   Handles:
   ✦ Player name + class selection
   ✦ Base stats + derived combat fields
   ✦ EXP + Level system with scaling
   ✦ Real-time stat syncing across UI and combat
============================================================ */

/* ============================================================
   🧍‍♀️ PLAYER COMBAT DEFAULTS
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
      healing: 5, attack: 25, ranged: 5, critChance: 10,
      level: 1, experience: 0, expToNextLevel: 100,
    },
    preferredStats: ['hp', 'attack'],
    classAttacks: [
      { name: 'Glitter Strike', type: 'melee', damage: 10, extraEffect: 'glitter damage' },
    ],
  },

  starSage: {
    name: 'Star Sage',
    baseStats: {
      hp: 80, mana: 200, speed: 1.8, armor: 3,
      healing: 5, attack: 5, ranged: 5, critChance: 15,
      level: 1, experience: 0, expToNextLevel: 100,
    },
    preferredStats: ['mana', 'spell'],
    classAttacks: [
      { name: 'Fireball', type: 'spell', damage: 50 },
      { name: 'Lightning Strike', type: 'spell', damage: 50 },
    ],
  },

  moonflower: {
    name: 'Moonflower',
    baseStats: {
      hp: 100, mana: 100, speed: 1.8, armor: 4,
      healing: 15, attack: 10, ranged: 5, critChance: 10,
      level: 1, experience: 0, expToNextLevel: 100,
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
      healing: 5, attack: 10, ranged: 20, critChance: 15,
      level: 1, experience: 0, expToNextLevel: 100,
    },
    preferredStats: ['ranged', 'attack'],
    classAttacks: [
      { name: 'Piercing Shot', type: 'ranged', damage: 25, extraEffect: 'dodge chance' },
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

  // Retrieve or set player name
  window.playerName = window.playerName || localStorage.getItem('playerName') || 'Player';

  // Build player object
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

  // Save initial state
  if (typeof saveGame === 'function') {
    saveGame();
    console.log('💾 Player saved after class selection.');
  }

  

  // Debug summary
  console.group('🎀 Player Created');
  console.log('Name:', newPlayer.name);
  console.log('Class:', newPlayer.classKey);
  console.log('Stats:', newPlayer.currentStats);
  console.log('Attacks:', newPlayer.classAttacks);
  console.groupEnd();

  return newPlayer;
}

/* ============================================================
   🧙‍♀️ EXPERIENCE / LEVEL SYSTEM – Olivia’s World RPG
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

  // Level-up check
  while (p.experience >= p.expToNextLevel) {
    p.experience -= p.expToNextLevel;
    window.levelUp?.();
  }

  // Update display
  window.updateExpDisplay?.();
};

/* ============================================================
   🆙 LEVEL UP HANDLER – Stat Scaling + In-Game Sync (Final)
============================================================ */
window.levelUp = function () {
  const p = window.player;
  if (!p) return console.warn('⚠️ Player not initialized!');

  // 🎚️ Level progression
  p.level = (p.level ?? 1) + 1;
  p.expToNextLevel = Math.floor((p.expToNextLevel ?? 100) * 1.25);

  // 📊 Core stat growth
  const hpGain = 10;
  const manaGain = 20;

  p.maxHp = (p.maxHp ?? p.hp ?? 100) + hpGain;
  p.hp = p.maxHp;

  // ✅ Proper mana growth and restore
  p.maxMana = (p.maxMana ?? p.mana ?? 50) + manaGain;
  p.mana = Math.min(p.maxMana, p.mana + manaGain); // grow + restore slightly

  // ⚔️ Combat stat scaling
  const cs = p.currentStats ?? {};
  const scale = 1.08; // +8% per level
  const allowed = ['attack', 'ranged', 'healing', 'armor', 'critChance','mana']; // speed excluded

  for (const key of allowed) {
    if (typeof cs[key] === 'number') {
      cs[key] = key === 'critChance'
        ? Math.min(100, Math.round(cs[key] * scale))
        : Math.round(cs[key] * scale);
    }
  }

  p.currentStats = cs;

  // 💥 Derived stats + sync
  p.attackDamage = cs.attack ?? p.attackDamage ?? 15;
  p.currentStats.attack = p.attackDamage;

  p.rangedDamage = cs.ranged ?? p.rangedDamage ?? 10;
  p.currentStats.ranged = p.rangedDamage;

  p.healing = cs.healing ?? p.healing ?? 10;
  p.armor = cs.armor ?? p.armor ?? 3;
  p.critChance = cs.critChance ?? p.critChance ?? 10;

  // 🚫 Speed remains constant — not scaled
  p.speed = p.speed ?? 1.8;

  // 🔁 Sync live game + UI
  window.syncPlayerInGame?.();

  // 🎉 Feedback
  console.log(`🆙 Level ${p.level}!`);
  console.log('📈 Updated stats:', p.currentStats);

  window.showDamageText?.(`LEVEL ${p.level}!`, p.x ?? 200, p.y ?? 200, '#00ffcc');
  window.showCritEffect?.(p.x, p.y);

  window.updateHPBar?.();
  window.updateManaBar?.();
  window.updateExpDisplay?.();
  window.updateStatsUI?.();
  window.updateClassIcon?.(); 

  // 💾 Auto-save silently
  window.saveGame?.(false);
};


/* ============================================================
   🔁 UNIVERSAL PLAYER SYNC – Keeps All Game Systems Aligned
   ------------------------------------------------------------
   Ensures stats, combat values, UI bars, and icons are
   updated across Explore, Combat, and Inventory systems.
============================================================ */
window.syncPlayerInGame = function () {
  const p = window.player;
  if (!p) return;

  // --- ⚔️ Sync Derived Combat Stats ---
  p.attackDamage = p.currentStats?.attack ?? p.attackDamage ?? 15;
  p.rangedDamage = p.currentStats?.ranged ?? p.rangedDamage ?? 10;
  p.armor        = p.currentStats?.armor ?? p.armor ?? 3;
  p.healing      = p.currentStats?.healing ?? p.healing ?? 10;
  p.critChance   = p.currentStats?.critChance ?? p.critChance ?? 10;

  // 🚫 Speed remains constant (not scaled)
  p.speed = p.speed ?? 1.8;

  // --- 🧠 Refresh UI ---
  window.updateHPBar?.();
  window.updateManaBar?.();
  window.updateStatsUI?.();
  window.updateClassIcon?.();

  // --- 🧾 Debug Output ---
  console.log(
    `%c🔄 Player Synced → Class: ${p.classKey || 'Unknown'} | ATK: ${
      p.attackDamage
    } | RNG: ${p.rangedDamage} | CRIT: ${p.critChance}% | HP: ${p.hp}/${
      p.maxHp
    }`,
    'color:#87cefa; font-weight:bold;'
  );
};

/* ============================================================
   🪞 CLASS ICON HANDLER – Auto Updates Player UI
   ------------------------------------------------------------
   Loads the correct class icon near HP/Mana bars and
   applies a glowing border based on class type.
============================================================ */
window.updateClassIcon = function () {
  const p = window.player;
  if (!p) return;

  const icon = document.getElementById('class-icon');
  if (!icon) return;

  // 🎨 Map each class to its corresponding icon and color glow
  const icons = {
    glitterGuardian: {
      src: '../images/guardian_icon.png',
      glow: '0 0 15px #ff69b4', // pink
    },
    starSage: {
      src: '../images/starsage_icon.png',
      glow: '0 0 15px #87cefa', // soft blue
    },
    moonflower: {
      src: '../images/moonflower_icon.png',
      glow: '0 0 15px #98ffb2', // mint green
    },
    silverArrow: {
      src: '../images/silver_icon.png',
      glow: '0 0 15px #d0d0d0', // silver white
    },
  };

  // ✨ Fallback to default if missing
  const iconData = icons[p.classKey] || {
    src: '../images/default_icon.png',
    glow: '0 0 10px #fff',
  };

  // 🖼️ Apply image + glow
  icon.src = iconData.src;
  icon.alt = p.classKey ?? 'Unknown';
  icon.style.filter = `drop-shadow(${iconData.glow})`;

  // 💫 Smooth animation (optional aesthetic)
  icon.style.transition = 'filter 0.4s ease, transform 0.2s ease';
  icon.onmouseenter = () => (icon.style.transform = 'scale(1.1)');
  icon.onmouseleave = () => (icon.style.transform = 'scale(1)');
};

/* ============================================================
   📊 EXPERIENCE DISPLAY UPDATER
============================================================ */
window.updateExpDisplay = function () {
  const p = window.player;
  if (!p) return;
  const levelEl = document.getElementById('stat-level');
  const expEl = document.getElementById('stat-exp');
  if (levelEl) levelEl.textContent = p.level ?? 1;
  if (expEl) expEl.textContent = `${p.experience ?? 0} / ${p.expToNextLevel ?? 100}`;
};

/* ============================================================
   🎛️ STATS PANEL UPDATER – Inventory UI (Simplified)
============================================================ */
window.updateStatsUI = function () {
  const p = window.player;
  if (!p) return;

  const stats = p.currentStats ?? {};
  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  // Core Info
  set('stat-class', p.classKey 
  ? p.classKey
      .replace(/([A-Z])/g, ' $1') // split CamelCase
      .replace(/^./, str => str.toUpperCase()) // capitalize first letter
  : 'Unknown');
  set('stat-level', p.level ?? 1);
  set('stat-exp', `${p.experience ?? 0} / ${p.expToNextLevel ?? 100}`);
  set('stat-hp', `${Math.round(p.hp)} / ${Math.round(p.maxHp)}`);
  set('stat-mana', `${Math.round(p.mana)} / ${Math.round(p.maxMana)}`);

  // Combat Stats
  set('stat-attack', stats.attack ?? p.attackDamage ?? 0);
  set('stat-ranged-attack', stats.ranged ?? p.rangedDamage ?? 0);
  set('stat-healing', stats.healing ?? 0);
  set('stat-armor', stats.armor ?? 0);
  set('stat-crit', `${stats.critChance ?? 0}%`);
};
