console.log("This script is working: " + document.title);


// ===========================
// Game Over Page JS
// ===========================

document.addEventListener("DOMContentLoaded", () => {
    const retryBtn = document.getElementById("retry-btn");

    if (retryBtn) {
        retryBtn.addEventListener("click", () => {
            showPage("class-page"); // reset to class selection
            console.log("Returned to Class Menu");
        });
    }

    console.log("Game Over page script loaded!");
});


//==========================
// Final Test Log
//==========================
console.log("final test log for gameover.js");