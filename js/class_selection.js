console.log("This script is working: " + document.title);


// ===========================
// Class Selection Page JS
// ===========================

document.addEventListener("DOMContentLoaded", () => {
    const classButtons = document.querySelectorAll(".class-btn");
    const confirmBtn = document.getElementById("class-confirm-btn");
    let selectedClass = null;

    classButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            selectedClass = btn.dataset.class;
            console.log("Selected class:", selectedClass);
        });
    });

    if (confirmBtn) {
        confirmBtn.addEventListener("click", () => {
            if (!selectedClass) {
                alert("Please select a class!");
                return;
            }
            saveClass(selectedClass);
            showPage("difficulty-page");
        });
    }

    console.log("Class selection script loaded!");
});


//==========================
// Final Test Log
//==========================
console.log("final test log for class_selection.js");

