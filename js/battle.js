console.log("This script is working: " + document.title);;


// ===========================
// Battle Page JS
// ===========================

document.addEventListener("DOMContentLoaded", () => {
    const actionButtons = document.querySelectorAll(".battle-btn");

    actionButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            console.log("Player chose action:", btn.dataset.action);
            // TODO: add battle logic here
        });
    });

    console.log("Battle page script loaded!");
});



//==========================
// Final Test Log
//==========================
console.log("final test log for battle.js");
