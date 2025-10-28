/* ============================================================
   🌿 HEAL ABILITY – Restores HP using Mana
============================================================ */
function castHeal() {
  const p = getPlayer();
  if (!p || !canvas || !isRunning()) return;

  const now = performance.now();
  if (now - lastHealCast < HEAL_COOLDOWN) return; // still recharging

  // 💧 Check Mana
  if ((p.mana ?? 0) < HEAL_COST) {
    window.showNoManaEffect?.(); // now spawns at player
    return;
  }

  // 🩷 Spend Mana
  p.mana = Math.max(0, (p.mana ?? 0) - HEAL_COST);
  updateManaBar();
  lastHealCast = now;

  // 🌿 Restore HP
  const baseHeal = p.healing ?? 25;
  const healAmount = Math.round(baseHeal * (p.classKey === "moonflowerHealer" ? 1.8 : 1));
  const oldHP = p.hp;
  p.hp = Math.min(p.maxHp, (p.hp ?? 0) + healAmount);
  updateHPBar();

  // ✅ Get rect *before* using it
  const rect = canvas.getBoundingClientRect();
  const px = rect.left + p.x;
  const py = rect.top + p.y;

  // 💖 Floating +HP text
  window.showDamageText?.(`+${Math.round(healAmount)} HP`, p.x, p.y, "#00ff99");

  // 🌈 Healing Visual Effect
  const aura = document.createElement("div");
  aura.classList.add("fairy-aura");
  aura.style.setProperty("--aura-color", "rgba(100, 255, 150, 0.8)");
  aura.style.left = `${px}px`;
  aura.style.top = `${py}px`;
  document.body.appendChild(aura);

  aura.animate(
    [
      { transform: "translate(-50%, -50%) scale(0.5)", opacity: 1 },
      { transform: "translate(-50%, -50%) scale(2.8)", opacity: 0.8 },
      { transform: "translate(-50%, -50%) scale(4)", opacity: 0 },
    ],
    { duration: 800, easing: "ease-out", fill: "forwards" }
  );
  setTimeout(() => aura.remove(), 800);

  // ✨ Sparkle burst
  for (let i = 0; i < 30; i++) {
    const sparkle = document.createElement("div");
    sparkle.classList.add("fairy-sparkle");
    sparkle.style.setProperty("--sparkle-color", "hsl(140, 100%, 75%)");
    sparkle.style.left = `${px}px`;
    sparkle.style.top = `${py}px`;
    document.body.appendChild(sparkle);

    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 60;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;

    sparkle.animate(
      [
        { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
        { transform: `translate(${tx}px, ${ty}px) scale(0.2)`, opacity: 0 },
      ],
      { duration: 700 + Math.random() * 200, easing: "ease-out", fill: "forwards" }
    );
    setTimeout(() => sparkle.remove(), 900);
  }

  console.log(`💚 Healed for ${healAmount} HP (from ${oldHP} → ${p.hp})`);
}
