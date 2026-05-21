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

// === TYPOWRITER EFFECT (with backspace and correction) ===
const element = document.getElementById('typewriter');

// Typing sequence:
// 1. Type "Awab Aba" (typo) - fast
// 2. Backspace characters one by one
// 3. Type "Awan Abadullah" (corrected) - fast
// 4. Show blinking cursor

const typoText = "Awab Aba";
const correctedText = "Awan Abadullah";
let typoStep = 0;
let backspaceStep = 0;
let correctStep = 0;

element.innerHTML = '';

// Step 1: Type "Awab Aba" (typo) - FAST (40ms)
function typeTypo() {
    if (typoStep < typoText.length) {
        element.innerHTML += typoText.charAt(typoStep);
        element.style.color = 'var(--text)'; // Highlight in current color
        element.style.backgroundColor = 'var(--accent)'; // Same as background color
        typoStep++;
        setTimeout(typeTypo, 40); // Speed up
    } else {
        // Pause at typo, then backspace
        setTimeout(backspace, 800);
    }
}

// Step 2: Backspace characters one by one (visual effect)
function backspace() {
    const currentText = element.innerHTML;
    if (currentText.length > 0) {
        // Show backspace effect (remove last char)
        element.innerHTML = currentText.slice(0, -1);
        setTimeout(backspace, 40); // Fast backspace
    } else {
        // When text is empty, start typing corrected text
        setTimeout(typeCorrected, 300);
    }
}

// Step 3: Type "Awan Abadullah" (corrected) - FAST (40ms)
function typeCorrected() {
    if (correctStep < correctedText.length) {
        element.innerHTML += correctedText.charAt(correctStep);
        element.style.color = 'var(--text)'; // Highlight in current color
        element.style.backgroundColor = 'var(--accent)'; // Same as background color
        correctStep++;
        setTimeout(typeCorrected, 40); // Speed up
    } else {
        // After typing, show blinking cursor
        setTimeout(() => {
            element.innerHTML += '<span class="cursor">_</span>';
        }, 500);
    }
}

// Start the typing sequence
setTimeout(typeTypo, 1000);

// Add blinking cursor animation via CSS
const style = document.createElement('style');
style.innerHTML = `
.cursor {
    animation: blink 1s infinite;
    color: var(--accent);
}
@keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
}
`;
document.head.appendChild(style);

// === LAST UPDATED TIMESTAMP ===
function updateLastUpdated() {
    const lastUpdatedEl = document.getElementById('last-updated');
    if (lastUpdatedEl) {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear().toString().slice(-2);
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        lastUpdatedEl.textContent = 'Last updated on: ' + day + '/' + month + '/' + year + ' ' + hours + ':' + minutes;
    }
}

updateLastUpdated();

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
