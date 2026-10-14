import { PROJECTS, LINKS } from './projects.js';

const SVGNS = 'http://www.w3.org/2000/svg';
const svg = document.getElementById('fieldSvg');
const field = document.getElementById('field');
const detail = document.getElementById('detail');

let W = 0, H = 0;
let selected = null;

const el = (tag, attrs = {}) => {
    const n = document.createElementNS(SVGNS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    return n;
};

/* Background dust. Seeded off the index rather than Math.random so the field
   is the same every repaint - a reshuffling sky on each resize reads as a
   glitch, not as stars. */
function seeded(i) {
    const x = Math.sin(i * 127.1) * 43758.5453;
    return x - Math.floor(x);
}

function draw() {
    W = field.clientWidth;
    H = field.clientHeight;
    if (!W || !H) return;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = '';

    // --- background dust
    const dust = el('g');
    for (let i = 0; i < 110; i++) {
        dust.appendChild(el('circle', {
            class: 'bg-star',
            cx: (seeded(i * 2) * W).toFixed(1),
            cy: (seeded(i * 2 + 1) * H).toFixed(1),
            r: (seeded(i * 3) * 1.1 + 0.4).toFixed(2),
            opacity: (seeded(i * 5) * 0.35 + 0.08).toFixed(2)
        }));
    }
    svg.appendChild(dust);

    const pt = p => ({ x: p.at.x * W, y: p.at.y * H });

    // --- links, drawn under the nodes
    const linkG = el('g');
    LINKS.forEach(([a, b], i) => {
        const A = pt(PROJECTS[a]), B = pt(PROJECTS[b]);
        const line = el('line', {
            class: 'link', x1: A.x, y1: A.y, x2: B.x, y2: B.y,
            'data-a': a, 'data-b': b
        });
        line.dataset.i = i;
        linkG.appendChild(line);
    });
    svg.appendChild(linkG);

    // --- project stars
    PROJECTS.forEach((p, i) => {
        const { x, y } = pt(p);
        const g = el('g', { class: 'node', tabindex: '0', role: 'button' });
        g.dataset.i = i;
        g.setAttribute('aria-label', p.name);

        g.appendChild(el('circle', { class: 'node-halo', cx: x, cy: y, r: 26 }));
        const core = el('circle', { class: 'node-core', cx: x, cy: y, r: 5 });
        core.style.setProperty('--pulse', (3 + seeded(i * 11) * 2.5).toFixed(2) + 's');
        g.appendChild(core);

        // Keep the label inside the panel: flip it left near the right edge.
        const flip = x > W - 170;
        const label = el('text', {
            class: 'node-label',
            x: flip ? x - 14 : x + 14,
            y: y + 4,
            'text-anchor': flip ? 'end' : 'start'
        });
        label.textContent = p.name;
        g.appendChild(label);

        // Generous invisible hit area - a 5px star is a cruel click target.
        g.appendChild(el('circle', { cx: x, cy: y, r: 24, fill: 'transparent' }));

        g.addEventListener('mouseenter', () => hot(i, true));
        g.addEventListener('mouseleave', () => hot(i, false));
        g.addEventListener('focus', () => hot(i, true));
        g.addEventListener('blur', () => hot(i, false));
        g.addEventListener('click', () => pick(i));
        g.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(i); }
        });

        svg.appendChild(g);
    });

    if (selected !== null) markSelected();
}

/* Light the links touching this star, so hovering shows how it connects. */
function hot(i, on) {
    svg.querySelectorAll('.link').forEach(l => {
        if (+l.dataset.a === i || +l.dataset.b === i) l.classList.toggle('hot', on);
    });
}

function markSelected() {
    svg.querySelectorAll('.node').forEach(n => {
        n.classList.toggle('on', +n.dataset.i === selected);
    });
}

function pick(i) {
    selected = i;
    markSelected();
    const p = PROJECTS[i];
    detail.classList.remove('empty', 'swap');
    void detail.offsetWidth;
    detail.classList.add('swap');
    detail.innerHTML =
        `<h2>${p.name}</h2>` +
        `<ul class="d-tags">${p.tags.map(t => `<li>${t}</li>`).join('')}</ul>` +
        `<p>${p.blurb}</p>` +
        `<a class="d-link" href="${p.url}" target="_blank" rel="noopener">View code</a>`;
}

new ResizeObserver(draw).observe(field);
draw();
