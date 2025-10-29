/* ============================================================
   🌸 PLAYER & CLASS SYSTEM – Olivia’s World RPG (Clean Version)
   ------------------------------------------------------------
   ✦ Defines player classes & base stats
   ✦ EXP + Level system
   ✦ Universal sync across UI, combat & exploration
============================================================ */

/* ============================================================
   🧙 CLASS DEFINITIONS (Unified Stat Schema)
============================================================ */
const classes = {
  glitterGuardian: {
    name: "Glitter Guardian",
    baseStats: {
      health: 120,
      attack: 15,  
      mana: 50,
      spellPower: 10,
      healPower: 25,
      rangedAttack: 20,
      armor: 20,
      experience: 0,
      expToNextLevel: 100,
      speed: 1.5,
    },
    classAttacks: [], // reserved for later
  },

  starSage: {
    name: "Star Sage",
    baseStats: {
      health: 80,
      attack: 15,  
      mana: 200,
      spellPower: 25,
      healPower: 25,
      rangedAttack: 10,
      armor: 3,
      experience: 0,
      expToNextLevel: 100,
      speed: 1.5,
    },
    classAttacks: [],
  },

  moonflower: {
    name: "Moonflower",
    baseStats: {
      health: 100,
      attack: 15,  
      mana: 120,
      spellPower: 15,
      healPower: 50,
      rangedAttack: 8,
      armor: 4,
      experience: 0,
      expToNextLevel: 100,
      speed: 1.5,
    },
    classAttacks: [],
  },

  silverArrow: {
    name: "Silver Arrow",
    baseStats: {
      health: 90,
      attack: 15,  
      mana: 60,
      spellPower: 5,
      healPower: 25,
      rangedAttack: 30,
      armor: 5,
      experience: 0,
      expToNextLevel: 100,
      speed: 1.5,
    },
    classAttacks: [],
  },
};

/* ============================================================
   🧍 PLAYER CREATION LOGIC
============================================================ */
function createPlayer(selectedClass) {
  const baseClass = classes[selectedClass];
  if (!baseClass) {
    console.error(`❌ Class "${selectedClass}" not found!`);
    return null;
  }

  window.playerName =
    window.playerName || localStorage.getItem("playerName") || "Player";

  const newPlayer = {
    
    classKey: selectedClass,
    ...baseClass,
    name: window.playerName,
    currentStats: { ...baseClass.baseStats },
    level: 1,
    experience: 0,
  };

  window.player = newPlayer;
  if (typeof saveGame === "function") saveGame();
  window.syncPlayerInGame?.();
  

  console.group("🎀 Player Created");
  console.log("Name:", newPlayer.name);
  console.log("Class:", newPlayer.classKey);
  console.log("Stats:", newPlayer.currentStats);
  console.groupEnd();

  return newPlayer;
  
}

/* ============================================================
   🌟 EXPERIENCE / LEVEL SYSTEM
============================================================ */
window.addExperience = function (amount = 50) {
  const p = window.player;
  if (!p) return console.warn("⚠️ Player not initialized!");

  p.experience = p.experience ?? 0;
  p.expToNextLevel = p.expToNextLevel ?? 100;
  p.level = p.level ?? 1;

  p.experience += amount;
  console.log(`🌟 +${amount} XP → ${p.experience}/${p.expToNextLevel}`);

  window.showDamageText?.(`+${amount} XP`, p.x ?? 200, p.y ?? 200, "#ffd700");

  while (p.experience >= p.expToNextLevel) {
    p.experience -= p.expToNextLevel;
    window.levelUp?.();
  }

  window.updateExpDisplay?.();
};

/* ============================================================
   🆙 LEVEL UP HANDLER
============================================================ */
window.levelUp = function () {
  const p = window.player;
  if (!p) return;

  p.level = (p.level ?? 1) + 1;
  p.expToNextLevel = Math.floor((p.expToNextLevel ?? 100) * 1.25);

  const cs = p.currentStats ?? {};
  const scale = 1.08; // 8% growth per level

  cs.health = Math.round((cs.health ?? 100) + 15);
  cs.mana = Math.round((cs.mana ?? 50) + 20);
  cs.attack = Math.round((cs.attack ?? 10) * scale);
  cs.spellPower = Math.round((cs.spellPower ?? 10) * scale);
  cs.healPower = Math.round((cs.healPower ?? 5) * scale);
  cs.rangedAttack = Math.round((cs.rangedAttack ?? 10) * scale);

  p.currentStats = cs;
  p.hp = cs.health;
  p.maxHp = cs.health;
  p.mana = cs.mana;
  p.maxMana = cs.mana;

  // sync derived fields
  window.syncPlayerInGame?.();

  // feedback
  console.log(`🆙 LEVEL ${p.level}! Updated stats:`, cs);
  window.showDamageText?.(`LEVEL ${p.level}!`, p.x ?? 200, p.y ?? 200, "#00ffcc");
  window.showCritEffect?.(p.x, p.y);

  window.updateHPBar?.();
  window.updateManaBar?.();
  window.updateExpDisplay?.();
  window.updateStatsUI?.();
  window.updateClassIcon?.();

  window.saveGame?.(false);
  window.showStoryMessage("You Levelled up!!");
};

/* ============================================================
   🔁 UNIVERSAL PLAYER SYNC
============================================================ */
window.syncPlayerInGame = function () {
  const p = window.player;
  if (!p) return;

  const cs = p.currentStats ?? {};

  p.attackDamage = cs.rangedAttack ?? 10;
  p.spellDamage = cs.spellPower ?? 20;
  p.healAmount = cs.healPower ?? 10;
  p.armor = cs.armor ?? 3;
  p.speed = cs.speed ?? 1.8;

  window.updateHPBar?.();
  window.updateManaBar?.();
  window.updateStatsUI?.();
  window.updateClassIcon?.();
  window.updatePlayerPortrait?.();
  window.updatePlayerInfoBox?.();

  console.log(
    `%c🔄 Player Synced | ${p.classKey} | HP:${cs.health} | MP:${cs.mana} | Spell:${cs.spellPower} | Heal:${cs.healPower} | ATK:${cs.rangedAttack} | ARM:${cs.armor}`,
    "color:#87cefa; font-weight:bold;"
  );
};

/* ============================================================
   🪞 CLASS ICON HANDLER
============================================================ */
window.updateClassIcon = function () {
  const p = window.player;
  if (!p) return;

  const icon = document.getElementById("class-icon");
  if (!icon) return;

  const icons = {
    glitterGuardian: { src: "../images/guardian_icon.png", glow: "0 0 15px #ff69b4" },
    starSage: { src: "../images/starsage_icon.png", glow: "0 0 15px #87cefa" },
    moonflower: { src: "../images/moonflower_icon.png", glow: "0 0 15px #98ffb2" },
    silverArrow: { src: "../images/silver_icon.png", glow: "0 0 15px #d0d0d0" },
  };

  const iconData = icons[p.classKey] || { src: "../images/default_icon.png", glow: "0 0 10px #fff" };
  icon.src = iconData.src;
  icon.alt = p.classKey;
  icon.style.filter = `drop-shadow(${iconData.glow})`;

  icon.style.transition = "filter 0.4s ease, transform 0.2s ease";
  icon.onmouseenter = () => (icon.style.transform = "scale(1.1)");
  icon.onmouseleave = () => (icon.style.transform = "scale(1)");
};

/* ============================================================
   📊 EXPERIENCE DISPLAY UPDATER
============================================================ */
window.updateExpDisplay = function () {
  const p = window.player;
  if (!p) return;
  const levelEl = document.getElementById("stat-level");
  const expEl = document.getElementById("stat-exp");
  if (levelEl) levelEl.textContent = p.level ?? 1;
  if (expEl) expEl.textContent = `${p.experience ?? 0} / ${p.expToNextLevel ?? 100}`;
};

/* ============================================================
   🎛️ STATS UI UPDATER (Safe Assignments)
============================================================ */
window.updateStatsUI = function () {
  const p = window.player;
  if (!p) return;

  const cs = p.currentStats ?? {};

  const update = (id, value) => {
    const el = document.getElementById(id);
    if (el) {
      const span = el.querySelector("span");
      if (span) span.textContent = value;
    }
  };

  update("stat-health", cs.health);
  update("stat-attack", cs.attack);
  update("stat-mana", cs.mana);
  update("stat-spellpower", cs.spellPower);
  update("stat-healpower", cs.healPower);
  update("stat-ranged", cs.rangedAttack);
  update("stat-armor", cs.armor);
};

/* ============================================================
   🖼️ PLAYER PORTRAIT LOADER
============================================================ */
window.updatePlayerPortrait = function () {
  const p = window.player;
  if (!p) return;

  const portrait = document.getElementById("player-portrait");
  if (!portrait) return;

  const portraits = {
    glitterGuardian: "../images/portrait_glitter.png",
    starSage: "../images/portait_star_sage.png",
    moonflower: "../images/portait_moonflower.png",
    silverArrow: "../images/portait_silver_arrow.png",
  };

  portrait.src = portraits[p.classKey] || "";
};

/* ============================================================
   🩷 PLAYER INFO BOX UPDATER
============================================================ */
window.updatePlayerInfoBox = function () {
  const p = window.player;
  if (!p) return;

  const nameEl = document.getElementById("player-info-name");
  const levelEl = document.getElementById("player-info-level");

  if (nameEl) nameEl.textContent = `Princess ${p.name ?? "Unknown"}`;
  if (levelEl) levelEl.textContent = `Level ${p.level ?? 1}`;
};;