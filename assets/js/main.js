/* ==================================
   SHOOTING STARS - MAIN JAVASCRIPT
   ================================== */

// === THEME TOGGLE ===
const storedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', storedTheme);

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// === TYPOWRITER EFFECT (with backspace and highlight) ===
const element = document.getElementById('typewriter');

// Expected sequence:
// Type: "Awab Aba" (typo)
// Pause
// Backspace: "Awab Aba" → "Awa" (remove "b Aba" = 4 chars)
// Continue: "n Abadullah" (to complete "Awan Abadullah")
// Result: "Awan Abadullah" (corrected)

// Step 1: Type "Awab Aba" (typo)
function typeTypo() {
    const typoText = "Awab Aba";
    if (typoStep < typoText.length) {
        element.innerHTML += typoText.charAt(typoStep);
        typoStep++;
        setTimeout(typeTypo, 50);
    } else {
        // Pause at typo, then backspace to "Awa"
        setTimeout(backspaceToAwa, 800);
    }
}

// Step 2: Backspace to "Awa" (remove "b Aba" = 4 chars)
function backspaceToAwa() {
    const currentText = element.innerHTML; // "Awab Aba" (8 chars)
    // We want to remove last 4 chars to get "Awa" (3 chars)
    // But let's do it one char at a time for animation
    if (currentText.length > 3) {
        element.innerHTML = currentText.slice(0, -1);
        setTimeout(backspaceToAwa, 40);
    } else {
        // Now we have "Awa", type "n Abadullah"
        setTimeout(typeRest, 300);
    }
}

// Step 3: Type "n Abadullah" to complete "Awan Abadullah"
let restStep = 0;
function typeRest() {
    const restText = "n Abadullah";
    if (restStep < restText.length) {
        element.innerHTML += restText.charAt(restStep);
        restStep++;
        setTimeout(typeRest, 50);
    } else {
        // After typing, show blinking cursor
        setTimeout(() => {
            element.innerHTML += '<span class="cursor">_</span>';
        }, 400);
    }
}

let typoStep = 0;
let restStep = 0;

// Initialize
element.innerHTML = '';

// Start the typing sequence
setTimeout(typeTypo, 1000);

// Add blinking cursor animation via CSS
const style = document.createElement('style');
style.innerHTML = `
.cursor {
    animation: blink 1s infinite;
    color: var(--text); /* Same as text color */
}
@keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
}
`;
document.head.appendChild(style);

// === HIGHLIGHT EFFECT FOR TYPED TEXT ===
// Apply highlight styles when text is being typed
function applyHighlight() {
    element.style.color = 'var(--bg)';
    element.style.backgroundColor = 'var(--text)';
}

// Apply highlight initially (in dark theme)
if (storedTheme === 'dark') {
    element.style.color = '#0a0a0a'; // Dark bg color
    element.style.backgroundColor = '#00ff00'; // Text color
} else {
    element.style.color = '#f0f0f0'; // Light bg color (approx)
    element.style.backgroundColor = '#0a0a0a'; // Text color (approx)
}

// Update highlight on theme toggle
const originalToggle = toggleTheme;
toggleTheme = function() {
    originalToggle();
    const current = document.documentElement.getAttribute('data-theme');
    if (current === 'dark') {
        element.style.color = '#0a0a0a';
        element.style.backgroundColor = '#00ff00';
    } else {
        element.style.color = '#f0f0f0';
        element.style.backgroundColor = '#0a0a0a';
    }
};

// === LAST UPDATED TIMESTAMP (REMOVED - no longer needed) ===

// === SCROLL HIDE THEME TOGGLE ===
const themeToggle = document.querySelector('.theme-toggle');
let scrollTimeout;

window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    
    clearTimeout(scrollTimeout);
    
    // Fade out when scrolling
    themeToggle.classList.add('scroll-hide');
    
    // Set timeout to fade back in when scrolling stops
    scrollTimeout = setTimeout(() => {
        // Show button when scrolling stops
        themeToggle.classList.remove('scroll-hide');
    }, 300); // 300ms after scrolling stops
});

// === SHOOTING STARS ===
const overlay = document.getElementById("shootingStarsOverlay");
const isMobile = window.matchMedia("(max-width: 600px)").matches;
const starCount = isMobile ? 45 : 80;
const meteorInterval = isMobile ? 1150 : 800;

// Create stars
for (let i = 0; i < starCount; i++) {
    const star = document.createElement("span");
    star.className = "star";
    // 20% of stars are front stars (higher z-index, appear in front of cards)
    if (Math.random() < 0.2) {
        star.classList.add("front-star");
    }
    const size = Math.random() * 2.2 + 1;
    star.style.left = Math.random() * 100 + "vw";
    star.style.top = Math.random() * 100 + "svh";
    star.style.setProperty("--size", size + "px");
    star.style.setProperty("--opacity", Math.random() * 0.75 + 0.25);
    star.style.setProperty("--delay", Math.random() * 5 + "s");
    star.style.setProperty("--twinkle-speed", Math.random() * 3 + 2 + "s");
    overlay.appendChild(star);
}

// Create meteors
function createMeteor() {
    const meteor = document.createElement("span");
    meteor.className = "shooting-star";
    meteor.style.top = Math.random() * 58 + "svh";
    meteor.style.left = Math.random() * 50 + 75 + "vw";
    meteor.style.animationDuration = Math.random() * 1.6 + 1.6 + "s";
    overlay.appendChild(meteor);
    setTimeout(() => { meteor.remove(); }, 3500);
}

createMeteor();
setInterval(createMeteor, meteorInterval);
