/* ==================================
   SHOOTING STARS - MAIN JAVASCRIPT
   ================================== */

/* === CONFIGURATION === */
const CONFIG = {
    typingDelay: 500,        // ms before typing starts
    typingSpeed: 35,         // ms per character (slower - 0.5x increase)
    backspaceSpeed: 28,      // ms per backspace (slower)
    pauseBeforeBackspace: 400, // ms after typing before backspace (increased)
    pauseBeforeRest: 150,    // ms after backspace before typing rest
    restSpeed: 35,           // ms per character for rest text (slower)
    cursorDelay: 200,        // ms after rest before cursor
    scrollDelay: 1000,       // ms after scroll stops before controls show
    tapPromptDelay: 2000,    // ms after typing completes before tap prompt appears
    tapOverlayFade: 500,     // ms to fade out tap overlay
    cardAnimation: 0.8,      // seconds for card animation
};

/* === THEME TOGGLE === */
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

/* === AUDIO TOGGLE === */
const audio = document.getElementById('backgroundMusic');

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

/* === STATE === */
let firstInteractionDone = false;
let tapEnabled = false;
let overlay;

/* === DOM ELEMENTS === */
const tapOverlay = document.getElementById('tapToStartOverlay');
const tapPrompt = document.querySelector('.tap-prompt');
const cards = document.querySelectorAll('.hidden-cards .card');
const controls = document.querySelector('.controls-row');
const themeToggle = document.querySelector('.theme-toggle');
const audioToggle = document.querySelector('.audio-toggle');

/* === INITIALIZATION === */
document.addEventListener('DOMContentLoaded', () => {
    overlay = document.getElementById('shootingStarsOverlay');
    if (overlay) {
        overlay.style.display = 'block';
        overlay.style.pointerEvents = 'none';
    }
    createShootingStars();
    
    // Update button icons after DOM is ready
    updateThemeIcon();
    updateAudioIcon();
});

/* === SHOOTING STARS === */
let starsCreated = false;

function createShootingStars() {
    if (starsCreated) return;
    starsCreated = true;
    
    if (!overlay) return;
    
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

/* === TAP TO START === */
function showTapOverlay() {
    if (tapOverlay) {
        tapOverlay.classList.add('visible');
        tapOverlay.style.display = 'flex';
    }
    if (tapPrompt) {
        tapPrompt.classList.add('fade-in');
    }
}

function hideTapOverlay() {
    if (tapOverlay) {
        tapOverlay.classList.remove('visible');
        tapOverlay.addEventListener('transitionend', () => {
            if (tapOverlay) tapOverlay.style.display = 'none';
        }, { once: true });
    }
    if (tapPrompt) {
        tapPrompt.classList.remove('fade-in');
    }
}

/* === CARD ANIMATION === */
function revealCards() {
    const cardContainer = document.querySelector('.grid');
    if (cardContainer) cardContainer.classList.remove('hidden-cards');
    
    cards.forEach((card, index) => {
        // Force reveal card styles
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
        card.style.animation = `cardScrollIn ${CONFIG.cardAnimation}s ${index * 0.1}s forwards`;
    });
}

/* === BUTTONS === */
function showButtons() {
    if (controls) controls.classList.add('visible');
}

function hideButtons() {
    if (controls) controls.classList.remove('visible');
}

/* === SCROLL HIDE CONTROLS === */
let scrollTimeout;
window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    if (themeToggle) themeToggle.classList.add('scroll-hide');
    if (audioToggle) audioToggle.classList.add('scroll-hide');
    
    scrollTimeout = setTimeout(() => {
        if (themeToggle) themeToggle.classList.remove('scroll-hide');
        if (audioToggle) audioToggle.classList.remove('scroll-hide');
    }, CONFIG.scrollDelay);
});

/* === TYPING ANIMATION === */
function startTypingAnimation() {
    const element = document.getElementById('typewriter');
    if (!element) return;

    element.innerHTML = '';
    let typoStep = 0;
    let restStep = 0;

    // Step 1: Type "Awab Aba"
    function typeTypo() {
        const typoText = "Awab Aba";
        if (typoStep < typoText.length) {
            element.innerHTML += typoText.charAt(typoStep);
            typoStep++;
            setTimeout(typeTypo, CONFIG.typingSpeed);
        } else {
            setTimeout(backspaceToAwa, CONFIG.pauseBeforeBackspace);
        }
    }

    // Step 2: Backspace to "Awa"
    function backspaceToAwa() {
        const currentText = element.innerHTML;
        if (currentText.length > 3) {
            element.innerHTML = currentText.slice(0, -1);
            setTimeout(backspaceToAwa, CONFIG.backspaceSpeed);
        } else {
            setTimeout(typeRest, CONFIG.pauseBeforeRest);
        }
    }

    // Step 3: Type "n Abadullah"
    function typeRest() {
        const restText = "n Abadullah";
        if (restStep < restText.length) {
            element.innerHTML += restText.charAt(restStep);
            restStep++;
            setTimeout(typeRest, CONFIG.restSpeed);
        } else {
            setTimeout(() => {
                element.innerHTML += '<span class="cursor">_</span>';
            }, CONFIG.cursorDelay);
        }
    }

    setTimeout(typeTypo, CONFIG.typingDelay);
}

/* === FIRST INTERACTION === */
function handleFirstInteraction(e) {
    if (!tapEnabled) {
        if (e) e.preventDefault();
        if (e) e.stopPropagation();
        return;
    }
    
    if (firstInteractionDone) return;
    firstInteractionDone = true;
    
    // Unlock scroll
    document.body.classList.remove('scrolled');
    
    // Show cards
    revealCards();
    
    // Show buttons
    showButtons();
    
    // Fade out tap overlay
    hideTapOverlay();
    setTimeout(() => {
        if (tapOverlay) tapOverlay.style.display = 'none';
    }, CONFIG.tapOverlayFade);
    
    // Unmute audio
    if (audio) {
        audio.muted = false;
        audio.play().catch(err => {
            console.log('Audio play error:', err);
        });
    }
}

/* === SETUP === */
// Start typing animation
setTimeout(startTypingAnimation, 100);

// Lock scroll initially (until tap is complete)
document.body.classList.add('scrolled');

// Enable tap after delay (initial delay for typing to complete)
let tapSetupDelay = CONFIG.tapPromptDelay;

// Show tap prompt after typing + initial delay
setTimeout(() => {
    tapEnabled = true;
    showTapOverlay();
}, tapSetupDelay);

// Listen for first interaction (click or scroll) - remove listener after first interaction
document.body.addEventListener('click', (e) => {
    if (tapEnabled) handleFirstInteraction(e);
}, { once: true });
window.addEventListener('scroll', (e) => {
    if (tapEnabled) handleFirstInteraction(e);
}, { once: true });
