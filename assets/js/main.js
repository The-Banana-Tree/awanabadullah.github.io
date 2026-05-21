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

// === TYPOWRITER EFFECT ===
const name = "Awan Abadullah";
const element = document.getElementById('typewriter');

let i = 0;
element.innerHTML = '';

function typeWriter() {
    if (i < name.length) {
        element.innerHTML += name.charAt(i);
        i++;
        setTimeout(typeWriter, 80);
    }
}

// Start typing after 1 second
setTimeout(typeWriter, 1000);

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
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    
    if (currentScroll <= 100) {
        // At top - show button
        themeToggle.classList.remove('scroll-hide');
    } else {
        // Scrolling down - hide button
        themeToggle.classList.add('scroll-hide');
    }
    
    lastScroll = currentScroll;
});

// Also hide if user scrolls more than 500px
window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        themeToggle.classList.add('scroll-hide');
    }
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
