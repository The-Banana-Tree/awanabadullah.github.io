/* ==================================
   RETRO NEON - MAIN JAVASCRIPT
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
        setTimeout(typeWriter, 80); // Speed
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

// Set timestamp once when page loads
updateLastUpdated();

// === RETRO NEON CANVAS ANIMATION ===
const neonCanvas = document.getElementById("neonCanvas");
const ctx = neonCanvas.getContext("2d");

let animationOffset = 0;
const gridSize = 50;
let animationId;

function resizeCanvas() {
    neonCanvas.width = window.innerWidth;
    neonCanvas.height = window.innerHeight;
}

function getThemeColors() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'light') {
        return {
            line: 'rgba(255, 0, 255, 0.7)',
            glow: 'rgb(255, 0, 255)',
            bg: '#f0f0f0'
        };
    }
    return {
        line: 'rgba(0, 255, 255, 0.8)',
        glow: 'rgb(0, 255, 255)',
        bg: '#0a0a0a'
    };
}

function drawNeonGrid() {
    const colors = getThemeColors();
    
    // Fill background
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, neonCanvas.width, neonCanvas.height);
    
    // Neon settings
    ctx.strokeStyle = colors.line;
    ctx.lineWidth = 1;
    ctx.shadowBlur = 20;
    ctx.shadowColor = colors.glow;
    
    // Vertical lines with wave effect
    for (let x = 0; x < neonCanvas.width; x += gridSize) {
        ctx.beginPath();
        const offsetY = Math.sin((x + animationOffset) * 0.05) * 10;
        ctx.moveTo(x, 0 + offsetY);
        ctx.lineTo(x, neonCanvas.height + offsetY);
        ctx.stroke();
    }
    
    // Horizontal lines with wave effect
    for (let y = 0; y < neonCanvas.height; y += gridSize) {
        ctx.beginPath();
        const offsetX = Math.cos((y + animationOffset) * 0.05) * 10;
        ctx.moveTo(0 + offsetX, y);
        ctx.lineTo(neonCanvas.width + offsetX, y);
        ctx.stroke();
    }
    
    // Add a subtle glow overlay
    ctx.shadowBlur = 0;
    const gradient = ctx.createRadialGradient(
        neonCanvas.width / 2, neonCanvas.height / 2, 0,
        neonCanvas.width / 2, neonCanvas.height / 2, neonCanvas.width
    );
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, neonCanvas.width, neonCanvas.height);
}

function animateNeon() {
    animationOffset += 1; // Animation speed
    drawNeonGrid();
    animationId = requestAnimationFrame(animateNeon);
}

// Initialize
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
animateNeon();
