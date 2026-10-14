/* Just the starfield from the live site, without main.js's tap-to-start gate
   (which locks body scroll and waits for an interaction the lab pages have
   no reason to ask for). */
const overlay = document.getElementById('shootingStarsOverlay');
if (overlay) {
    overlay.style.display = 'block';
    overlay.style.pointerEvents = 'none';

    const mobile = window.matchMedia('(max-width: 600px)').matches;
    const count = mobile ? 45 : 80;

    for (let i = 0; i < count; i++) {
        const s = document.createElement('span');
        s.className = 'star';
        if (Math.random() < 0.2) s.classList.add('front-star');
        s.style.left = Math.random() * 100 + 'vw';
        s.style.top = Math.random() * 100 + 'svh';
        s.style.setProperty('--size', (Math.random() * 2.2 + 1) + 'px');
        s.style.setProperty('--opacity', Math.random() * 0.75 + 0.25);
        s.style.setProperty('--delay', Math.random() * 5 + 's');
        s.style.setProperty('--twinkle-speed', (Math.random() * 3 + 2) + 's');
        overlay.appendChild(s);
    }

    const meteor = () => {
        const m = document.createElement('span');
        m.className = 'shooting-star';
        m.style.top = Math.random() * 58 + 'svh';
        m.style.left = Math.random() * 50 + 75 + 'vw';
        m.style.animationDuration = (Math.random() * 1.6 + 1.6) + 's';
        overlay.appendChild(m);
        setTimeout(() => m.remove(), 3500);
    };
    meteor();
    setInterval(meteor, mobile ? 1150 : 800);
}
