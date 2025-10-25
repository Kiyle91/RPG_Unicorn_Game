/* ================================
   INVENTORY PAGE LOGIC
================================ */

document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('back-to-explore');
  const inventoryScreen = document.getElementById('inventory-page');

  if (backBtn && inventoryScreen) {
    backBtn.addEventListener('click', () => {
      inventoryScreen.classList.remove('active');
    });
  }
});