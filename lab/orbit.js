import { PROJECTS } from './projects.js';
import { makeViewer, bootViewer, setViewerModel } from './viewer.js';

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

/* One viewport, parked at the middle of the ring. The model in it is whichever
   project is at the front, so selecting is what loads geometry. */
const viewer = makeViewer(document.getElementById('cad'), PROJECTS[0].id);

function measure() {
    const w = box.clientWidth, h = box.clientHeight;
    /* R used to have a 130px floor, which on a phone pushed the widest pair of
       nodes past the box edge and clipped them. It scales all the way down now. */
    R = Math.min(250, w * 0.32);
    // Capped under R: the ring's tilt is acos(TILT/R), which is NaN past it.
    TILT = Math.max(42, Math.min(78, h * 0.16, R * 0.92));

    /* The ring system sits low in the box and the model floats above it. The
       ellipse the nodes travel on is squashed to TILT, so the gap at its centre
       is far too shallow to hold a model - lifting it out is what buys the room.
       Rings are given that same ellipse (diameter 2R, tilted to acos(TILT/R)) so
       the nodes ride the outer ring exactly. */
    const ringY = Math.round(h * 0.12);
    box.style.setProperty('--ringY', `${ringY}px`);
    box.style.setProperty('--ringD', `${Math.round(R * 2)}px`);
    box.style.setProperty('--ringRot', `${(Math.acos(Math.min(1, TILT / R)) * 180 / Math.PI).toFixed(1)}deg`);

    const size = Math.max(140, Math.min(220, w * 0.38, h * 0.46));
    // Park the model's lower edge just above the highest node on the ring.
    const topNodeY = ringY + Math.min(...PROJECTS.map((_, i) => Math.cos(i * STEP))) * TILT;
    const nodeHalf = (nodes[0].offsetHeight || 50) / 2;
    const lift = topNodeY - nodeHalf - 10 - size / 2;
    box.style.setProperty('--stage', `${Math.round(size)}px`);
    box.style.setProperty('--lift', `${Math.round(lift)}px`);
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
    // setViewerModel only boots when the geometry actually changes, so boot
    // again here: that covers the first paint and re-picking the front node.
    setViewerModel(viewer, p.id);
    bootViewer(viewer);
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
