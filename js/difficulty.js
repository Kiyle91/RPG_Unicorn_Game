console.log("This script is working: " + document.title);



// ===========================
// Difficulty Page JS
// ===========================

document.addEventListener("DOMContentLoaded", () => {
    const diffButtons = document.querySelectorAll(".difficulty-btn");
    const confirmBtn = document.getElementById("difficulty-confirm-btn");
    let selectedDifficulty = null;

    diffButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            selectedDifficulty = btn.dataset.difficulty;
            console.log("Selected difficulty:", selectedDifficulty);
        });
    });

    if (confirmBtn) {
        confirmBtn.addEventListener("click", () => {
            if (!selectedDifficulty) {
                alert("Please select a difficulty!");
                return;
            }
            saveDifficulty(selectedDifficulty);
            showPage("story-page");
        });
    }

    console.log("Difficulty page script loaded!");
});



//==========================
// Final Test Log
//==========================
console.log("final test log for battle.js");