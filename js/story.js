console.log("This script is working: " + document.title);


// ===========================
// Story Page JS
// ===========================

document.addEventListener("DOMContentLoaded", () => {
    const storyContinue = document.getElementById("story-continue-btn");

    if (storyContinue) {
        storyContinue.addEventListener("click", () => {
            // For now, just move to battle page
            showPage("battle-page");
            console.log("Moved to Battle Page");
        });
    }

    console.log("Story page script loaded!");
});


//==========================
// Final Test Log
//==========================
console.log("final test log for story.js");