/* ============================================================
   💬 SPEECH BOX SYSTEM – Olivia’s World
   ------------------------------------------------------------
   Displays story dialogue while the game is running.
============================================================ */
window.showSpeech = function (lines, callback) {
  const box = document.getElementById("speech-box");
  const textEl = document.getElementById("speech-text");
  const nextBtn = document.getElementById("speech-next");

  if (!box || !textEl || !nextBtn) return;

  let index = 0;
  window.exploreRunning = false; // pause game during speech

  const showLine = () => {
    textEl.textContent = lines[index];
    box.classList.remove("hidden");
  };

  const next = () => {
    index++;
    if (index < lines.length) {
      showLine();
    } else {
      // finished
      box.classList.add("hidden");
      window.exploreRunning = true; // resume game
      nextBtn.removeEventListener("click", next);
      if (typeof callback === "function") callback();
    }
  };

  nextBtn.addEventListener("click", next);
  showLine();
};
