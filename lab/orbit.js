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

const EDGE = 10;   // breathing room between the ring and the box
const GAP  = 14;   // clearance between the model and the nearest node
const DOT  = 18;   // .orbit-dot overhang above the label

/* The box a node occupies at ring position i, in the units place() draws in.
   The point that rides the ring is the dot at the node's TOP - the label hangs
   below it - so the box is lopsided and a node sinks further than it rises.

   Measured as the largest node rather than the one that happens to be there:
   rotating brings a two-line label to the front and the ring must not resize
   under it. */
function nodeBox(i, wMax, hMax) {
    const depth = (Math.cos(i * STEP) + 1) / 2;
    const s = 0.72 + depth * 0.28;
    return {
        sin: Math.sin(i * STEP),
        cos: Math.cos(i * STEP),
        hw: wMax / 2 * s,
        up: DOT * s,
        down: hMax * s
    };
}

/* The ring is sized from the room it has rather than from fixed fractions of
   the box, so the model can sit dead centre: open the ellipse as wide and as
   tall as the box allows, and the model is then however big the hole in the
   middle turns out to be. Opening it up is the whole trick - the squashed
   ellipse this started as leaves no centre worth filling. */
function measure() {
    const w = box.clientWidth / 2 - EDGE, h = box.clientHeight / 2 - EDGE;
    const wMax = Math.max(...nodes.map(n => n.offsetWidth)) || 152;
    const hMax = Math.max(...nodes.map(n => n.offsetHeight)) || 40;
    const g = PROJECTS.map((_, i) => nodeBox(i, wMax, hMax));

    // Every node lands inside the box: widest sideways, lowest and highest down
    // and up. Vertical room is asymmetric because the label hangs.
    R = Math.min(250, ...g.map(n =>
        Math.abs(n.sin) < 0.01 ? Infinity : (w - n.hw) / Math.abs(n.sin)));
    // TILT cannot pass R: the ring's tilt is acos(TILT/R), and tilting a circle
    // only ever makes it shorter.
    TILT = Math.min(R, ...g.map(n => {
        const reach = n.cos > 0 ? n.down : n.up;   // which end leads the way out
        return Math.abs(n.cos) < 0.01 ? Infinity : (h - reach) / Math.abs(n.cos);
    }));

    box.style.setProperty('--ringD', `${Math.round(R * 2)}px`);
    box.style.setProperty('--ringRot', `${(Math.acos(Math.min(1, TILT / R)) * 180 / Math.PI).toFixed(1)}deg`);

    /* Biggest centred square every node clears, on one axis or the other - a
       node off to the side may sit at the model's height and still be clear. */
    let size = Math.min(220, w);
    for (const n of g) {
        const sideways = Math.abs(n.sin) * R - n.hw;
        const vertical = Math.max(n.cos * TILT - n.up, -(n.cos * TILT + n.down));
        size = Math.min(size, (Math.max(sideways, vertical) - GAP) * 2);
    }
    box.style.setProperty('--stage', `${Math.round(Math.max(90, size))}px`);
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
