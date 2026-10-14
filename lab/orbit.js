import { PROJECTS } from './projects.js';

const box = document.getElementById('orbitBox');
const track = document.getElementById('track');
const detail = document.getElementById('detail');
const N = PROJECTS.length;
const STEP = (Math.PI * 2) / N;

/* The first attempt used rotateY + counter-rotate, which puts every node on a
   flat circle seen edge-on: they collapsed into one overlapping row. Placing
   them by hand on a tilted ellipse keeps them separated and lets depth drive
   scale and fade. */
let R = 230;        // horizontal radius
let TILT = 70;      // how far the ellipse is squashed vertically
let angle = 0;      // current rotation, radians
let target = 0;     // where it is easing to
let index = 0;

const nodes = PROJECTS.map((p, i) => {
    const n = document.createElement('div');
    n.className = 'orbit-node';
    n.innerHTML = `<span class="orbit-dot"></span><button type="button">${p.name}</button>`;
    n.querySelector('button').addEventListener('click', () => go(i));
    track.appendChild(n);
    return n;
});

function measure() {
    R = Math.max(130, Math.min(250, box.clientWidth * 0.29));
    TILT = Math.max(42, Math.min(78, box.clientHeight * 0.16));
    place();
}

function place() {
    nodes.forEach((n, i) => {
        const a = i * STEP + angle;
        const x = Math.sin(a) * R;
        const z = Math.cos(a) * R;
        const y = Math.cos(a) * TILT;

        // depth 0 at the back, 1 at the front
        const depth = (z + R) / (2 * R);
        const scale = 0.72 + depth * 0.28;

        n.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) scale(${scale.toFixed(3)})`;
        n.style.zIndex = String(Math.round(depth * 100));
        n.style.opacity = (0.3 + depth * 0.7).toFixed(2);
        n.classList.toggle('front', i === index);
        // Nodes round the back shouldn't eat clicks meant for the front row.
        n.style.pointerEvents = depth > 0.45 ? 'auto' : 'none';
    });
}

function tick() {
    let diff = target - angle;
    if (Math.abs(diff) > 0.0008) {
        angle += diff * 0.12;
        place();
        requestAnimationFrame(tick);
    } else {
        angle = target;
        place();
    }
}

function go(i) {
    // Rotate so node i sits at the front, taking the short way round.
    let delta = (-i * STEP) - (target % (Math.PI * 2));
    while (delta > Math.PI) delta -= Math.PI * 2;
    while (delta < -Math.PI) delta += Math.PI * 2;
    target += delta;
    index = i;
    show(i);
    requestAnimationFrame(tick);
}

function show(i) {
    const p = PROJECTS[i];
    detail.classList.remove('swap');
    void detail.offsetWidth;
    detail.classList.add('swap');
    detail.innerHTML =
        `<h2>${p.name}</h2>` +
        `<ul class="d-tags">${p.tags.map(t => `<li>${t}</li>`).join('')}</ul>` +
        `<p>${p.blurb}</p>` +
        `<a class="d-link" href="${p.url}" target="_blank" rel="noopener">View code</a>`;
}

document.getElementById('prev').addEventListener('click', () => go((index - 1 + N) % N));
document.getElementById('next').addEventListener('click', () => go((index + 1) % N));
addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  go((index - 1 + N) % N);
    if (e.key === 'ArrowRight') go((index + 1) % N);
});

new ResizeObserver(measure).observe(box);
measure();
show(0);
