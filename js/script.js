// ===========================
// Global script.js
// ===========================

console.log("Global script loaded for:", document.title);

// ===========================
// Player Data
// ===========================

const player = {
    name: "",
    class: "",
    difficulty: ""
};

// ===========================
// Global Functions
// ===========================

// Switch between pages/screens
function showPage(pageId) {
    const screens = document.querySelectorAll(".screen");
    screens.forEach(screen => screen.classList.remove("active"));
    const page = document.getElementById(pageId);
    if (page) page.classList.add("active");
}

// Save player data
function saveName(name) {
    player.name = name.trim();
    console.log("Player name saved:", player.name);
}

function saveClass(playerClass) {
    player.class = playerClass;
    console.log("Player class saved:", player.class);
}

function saveDifficulty(level) {
    player.difficulty = level;
    console.log("Difficulty saved:", player.difficulty);
}

// Log current player object
function logPlayer() {
    console.log("Current player data:", player);
}