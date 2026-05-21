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
