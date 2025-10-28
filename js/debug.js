/* ============================================================
   🧪 DEBUG TOOLS – Olivia’s World RPG
   ------------------------------------------------------------
   Enables developer commands for testing and diagnostics:
   ✦ Player stats inspection & modification
   ✦ Spawn / clear enemies
   ✦ HP / Mana / EXP / teleport utilities
   ✦ Save / Load shortcuts
   ✦ Toggle systems (AI, collisions, mana regen)
============================================================ */

console.log('🧩 Debug Tools Initialized — type helpDebug() for a full list.');

/* ============================================================
   🎯 PLAYER STAT VIEW
============================================================ */
window.showStats = function () {
  if (!window.player) return console.warn('⚠️ Player not initialized yet!');
  const p = window.player;
  console.table({
    Name: p.name || 'Unknown',
    Class: p.classKey || 'Unassigned',
    HP: `${p.hp}/${p.maxHp}`,
    MP: `${p.mana}/${p.maxMana}`,
    Speed: p.speed,
    Attack: p.attackDamage,
    Range: p.attackRange,
    X: p.x?.toFixed(1) ?? 0,
    Y: p.y?.toFixed(1) ?? 0,
  });
  console.log('🎯 Try: heal(50), damage(25), addXP(100), setHP(100), moveTo(400,200)');
};

/* ============================================================
   ❤️ HP / MANA MANIPULATION
============================================================ */
window.heal = function (amount = 10) {
  if (!window.player) return console.warn('⚠️ Player not initialized!');
  window.player.hp = Math.min(window.player.maxHp, window.player.hp + amount);
  window.updateHPBar?.();
  console.log(`💖 Healed +${amount} HP → ${window.player.hp}/${window.player.maxHp}`);
};

window.damage = function (amount = 10) {
  if (!window.player) return console.warn('⚠️ Player not initialized!');
  window.player.hp = Math.max(0, window.player.hp - amount);
  window.updateHPBar?.();
  console.log(`💢 Took ${amount} damage → ${window.player.hp}/${window.player.maxHp}`);
};

window.setHP = function (value) {
  if (!window.player) return console.warn('⚠️ Player not initialized!');
  window.player.hp = Math.max(0, Math.min(value, window.player.maxHp));
  window.updateHPBar?.();
  console.log(`❤️ HP set to ${window.player.hp}/${window.player.maxHp}`);
};

window.restoreMana = function (amount = 10) {
  if (!window.player) return console.warn('⚠️ Player not initialized!');
  window.player.mana = Math.min(window.player.maxMana, window.player.mana + amount);
  window.updateManaBar?.();
  console.log(`🔮 Mana restored +${amount} → ${window.player.mana}/${window.player.maxMana}`);
};

window.setMana = function (value) {
  if (!window.player) return console.warn('⚠️ Player not initialized!');
  window.player.mana = Math.max(0, Math.min(value, window.player.maxMana));
  window.updateManaBar?.();
  console.log(`🔵 Mana set to ${window.player.mana}/${window.player.maxMana}`);
};

/* ============================================================
   🧍 PLAYER MOVEMENT & TELEPORT
============================================================ */
window.moveTo = function (x, y) {
  if (!window.player) return console.warn('⚠️ Player not initialized!');
  window.player.x = x;
  window.player.y = y;
  console.log(`🚶 Teleported player to (${x}, ${y})`);
};

window.addSpeed = function (amount = 0.5) {
  if (!window.player) return console.warn('⚠️ Player not initialized!');
  window.player.speed += amount;
  console.log(`💨 Speed increased → ${window.player.speed}`);
};

window.resetSpeed = function () {
  if (!window.player) return console.warn('⚠️ Player not initialized!');
  window.player.speed = window.player.currentStats?.speed ?? 3;
  console.log(`🏃 Speed reset to base → ${window.player.speed}`);
};

/* ============================================================
   ⚔️ ENEMY CONTROL
============================================================ */
window.spawnEnemy = function (x = 200, y = 200, hp = 50) {
  if (!window.enemies) window.enemies = [];
  const e = new (window.Enemy || class { constructor(x,y,hp){this.x=x;this.y=y;this.hp=hp;this.maxHp=hp;this.speed=1.2;this.attackRange=30;}})(x, y, hp);
  window.enemies.push(e);
  console.log(`👹 Spawned enemy at (${x}, ${y}) with ${hp} HP.`);
};

window.clearEnemies = function () {
  if (!window.enemies?.length) return console.log('✨ No enemies to clear.');
  const count = window.enemies.length;
  window.enemies = [];
  console.log(`🧹 Cleared ${count} enemies from the map.`);
};

/* ============================================================
   🧙‍♀️ EXPERIENCE / LEVEL
============================================================ */
window.addXP = function (amount = 100) {
  if (!window.player) return console.warn('⚠️ Player not initialized!');
  window.player.experience = (window.player.experience ?? 0) + amount;
  console.log(`🌟 Added ${amount} XP → Total: ${window.player.experience}`);
};

window.levelUp = function () {
  if (!window.player) return console.warn('⚠️ Player not initialized!');
  window.player.level = (window.player.level ?? 1) + 1;
  window.player.maxHp += 10;
  window.player.hp = window.player.maxHp;
  console.log(`🆙 Level Up! → Level ${window.player.level}, Max HP: ${window.player.maxHp}`);
  window.updateHPBar?.();
};

/* ============================================================
   💾 SAVE / LOAD SHORTCUTS
============================================================ */
window.quickSave = function () {
  if (typeof window.saveGame !== 'function') return console.warn('⚠️ saveGame() not available.');
  window.saveGame(false);
  console.log('💾 Quick saved current game.');
};

window.quickLoad = function () {
  if (typeof window.loadGame !== 'function') return console.warn('⚠️ loadGame() not available.');
  window.loadGame();
  console.log('📂 Quick loaded last autosave.');
};

window.listSaves = function () {
  const saves = Object.keys(localStorage).filter(k => k.startsWith('olivia_save_'));
  console.table(saves.map(k => {
    const s = JSON.parse(localStorage[k] || '{}');
    return { key: k, name: s.name, time: s.timestamp };
  }));
};

/* ============================================================
   🧩 SYSTEM TOGGLES
============================================================ */
window.toggleAI = function () {
  window.disableAI = !window.disableAI;
  console.log(window.disableAI ? '🧠 Enemy AI disabled.' : '🧠 Enemy AI enabled.');
};

window.toggleRegen = function () {
  window.disableRegen = !window.disableRegen;
  console.log(window.disableRegen ? '💧 Mana regen disabled.' : '💧 Mana regen enabled.');
};

window.toggleCollisions = function () {
  window.disableCollisions = !window.disableCollisions;
  console.log(window.disableCollisions ? '🚧 Collisions disabled.' : '🚧 Collisions enabled.');
};

/* ============================================================
   🧾 ENVIRONMENT UTILITIES
============================================================ */
window.clearLocalSaves = function () {
  Object.keys(localStorage)
    .filter(k => k.startsWith('olivia_save'))
    .forEach(k => localStorage.removeItem(k));
  console.log('🗑️ Cleared all Olivia’s World save data.');
};

window.reloadExplore = function () {
  if (typeof startExploreGame === 'function') {
    startExploreGame();
    console.log('🔄 Restarted explore loop manually.');
  } else console.warn('⚠️ startExploreGame() not defined.');
};

/* ============================================================
   🧭 HELP SUMMARY
============================================================ */
window.helpDebug = function () {
  console.group('🧪 Olivia\'s World – Debug Commands');
  console.log('🎯 Player Info → showStats()');
  console.log('❤️ HP / Mana → heal(x), damage(x), setHP(x), restoreMana(x), setMana(x)');
  console.log('🚶 Movement → moveTo(x,y), addSpeed(x), resetSpeed()');
  console.log('👹 Enemies → spawnEnemy(x,y,hp), clearEnemies()');
  console.log('🌟 Progress → addXP(x), levelUp()');
  console.log('💾 Save / Load → quickSave(), quickLoad(), listSaves()');
  console.log('🧩 Toggles → toggleAI(), toggleRegen(), toggleCollisions()');
  console.log('🧹 Environment → clearLocalSaves(), reloadExplore()');
  console.groupEnd();
};
