console.log("This script is working: " + document.title);


// ===========================
// Naming Page JS
// ===========================

document.addEventListener("DOMContentLoaded", () => {
    const nameInput = document.getElementById("player-name");
    const confirmBtn = document.getElementById("name-confirm-btn");

    if (confirmBtn) {
        confirmBtn.addEventListener("click", () => {
            if (!nameInput.value.trim()) {
                alert("Please enter a name!");
                return;
            }
            saveName(nameInput.value);
            showPage("class-page");
        });
    }

    console.log("Naming page script loaded!");
});


//==========================
// Final Test Log
//==========================

console.log("final test log for naming.js");