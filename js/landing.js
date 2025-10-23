console.log("This script is working: " + document.title);

// ===========================
// Landing Page JS
// ===========================

document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("start-btn");
    if (startBtn) {
        startBtn.addEventListener("click", () => {
            showPage("naming-page");
            console.log("Moved to Naming Page");
        });
    }

    console.log("Landing page script loaded!");
});

//==========================
// Final Test Log
//==========================

console.log("final test log for landing.js");