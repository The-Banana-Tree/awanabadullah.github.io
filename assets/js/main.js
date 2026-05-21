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
    updateThemeIcon();
}

function updateThemeIcon() {
    const current = document.documentElement.getAttribute('data-theme');
    const icon = document.querySelector('.theme-icon');
    if (icon) {
        icon.textContent = current === 'light' ? '☀️' : '🌙';
    }
}

// === AUDIO UNMUTE ON FIRST INTERACTION ===
// Browsers block autoplay with sound, so we start muted and unmute on first interaction
const audio = document.getElementById('backgroundMusic');
const body = document.body;
const tapOverlay = document.getElementById('tapToStartOverlay');
const cards = document.querySelectorAll('.hidden-cards .card');
console.log('Audio element found:', audio !== null); // Debug log

let firstInteractionDone = false;

// Lock scroll initially
body.classList.add('scrolled');

// Show tap overlay after typing completes (fade in after 2.5s)
setTimeout(() => {
    if (tapOverlay) {
        tapOverlay.style.display = 'block';
    }
}, 2500); // show after typing + blink + pause

// Unmute + reveal cards on first interaction
function handleFirstInteraction() {
    if (firstInteractionDone) return;
    firstInteractionDone = true;
    
    // Unlock scroll
    body.classList.remove('scrolled');
    
    // Show buttons (only after cards finish)
    const controls = document.querySelector('.controls-row');
    if (controls) controls.classList.add('visible');
    
    // Fade out tap overlay FAST (500ms matches CSS)
    if (tapOverlay) {
        tapOverlay.style.opacity = '0';
        setTimeout(() => { tapOverlay.style.display = 'none'; }, 500);
    }
    
    // Show cards with scroll-in animation
    cards.forEach((card, index) => {
        card.style.animation = `cardScrollIn 0.8s ${index * 0.1}s forwards`;
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    });    // Unmute audio
    if (audio) {
        audio.muted = false;
        audio.play().catch(err => {
            console.log('Audio play error:', err);
        });
    }
    
    firstInteractionDone = true;
}

// First interaction: click anywhere
document.body.addEventListener('click', handleFirstInteraction, { once: true });

// First interaction: first scroll too
window.addEventListener('scroll', handleFirstInteraction, { once: true });

// === AUDIO TOGGLE ===
function toggleAudio() {
    audio.muted = !audio.muted;
    updateAudioIcon();
}

function updateAudioIcon() {
    const icon = document.querySelector('.audio-icon');
    if (icon) {
        icon.textContent = audio.muted ? '🔇' : '🔊';
    }
}

// Initialize icon on load
updateAudioIcon();

// Initialize icons on load
updateThemeIcon();
updateAudioIcon();

// === TYPOWRITER EFFECT (with backspace and highlight) ===
const element = document.getElementById('typewriter');

// Expected sequence:
// Type: "Awab Aba" (typo)
// Pause
// Backspace: "Awab Aba" → "Awa" (remove "b Aba" = 4 chars)
// Continue: "n Abadullah" (to complete "Awan Abadullah")
// Result: "Awan Abadullah" (corrected)

// Initialize counters
let typoStep = 0;
let restStep = 0;

// Initialize
element.innerHTML = '';

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

// Start the typing sequence
setTimeout(typeTypo, 1000);

// Add blinking cursor animation via CSS
const style = document.createElement('style');
style.innerHTML = `
.cursor {
    animation: blink 1s infinite;
    color: inherit; /* Match text color */
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

// === SCROLL HIDE CONTROLS ===
const themeToggle = document.querySelector('.theme-toggle');
const audioToggle = document.querySelector('.audio-toggle');
let scrollTimeout;

window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    
    clearTimeout(scrollTimeout);
    
    // Fade out when scrolling
    themeToggle.classList.add('scroll-hide');
    audioToggle.classList.add('scroll-hide');
    
    // Set timeout to fade back in when scrolling stops
    scrollTimeout = setTimeout(() => {
        // Show buttons when scrolling stops
        themeToggle.classList.remove('scroll-hide');
        audioToggle.classList.remove('scroll-hide');
    }, 500); // 500ms delay after scrolling stops
});

// === SHOOTING STARS (only after first interaction) ===
let starsCreated = false;
let overlay;

// Initialize overlay on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    overlay = document.getElementById("shootingStarsOverlay");
    console.log('Overlay found:', !!overlay); // Debug log
    
    // Hide overlay initially
    if (overlay) {
        overlay.style.display = 'none';
    }
});

function createShootingStars() {
    console.log('createShootingStars called'); // Debug log
    if (starsCreated) return;
    starsCreated = true;
    
    // Show overlay and remove pointer-events:none to allow clicks
    if (overlay) {
        overlay.style.display = 'block';
        overlay.style.pointerEvents = 'none'; // still allow clicks to pass through
    }
    
    const isMobile = window.matchMedia("(max-width: 600px)").matches;
    const starCount = isMobile ? 45 : 80;
    const meteorInterval = isMobile ? 1150 : 800;

    // Create stars
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement("span");
        star.className = "star";
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
}

// Trigger stars creation on first interaction
const originalHandleFirstInteraction = handleFirstInteraction;
handleFirstInteraction = function() {
    console.log('First interaction!');
    originalHandleFirstInteraction();
    createShootingStars();
    console.log('Stars created:', starsCreated);
};
