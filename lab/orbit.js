import { PROJECTS } from './projects.js';
import { makeViewer, bootViewer, setViewerModel } from './viewer.js';
import { sfx } from './sfx.js';

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
    const b = n.querySelector('button');
    b.addEventListener('click', () => { sfx.select(); go(i); });
    // Only the front node answers a hover; the rest are behind and can't be
    // clicked, so ticking at them would be a sound with nothing behind it.
    b.addEventListener('pointerenter', e => {
        if (e.pointerType === 'mouse' && i !== index) sfx.hover();
    });
    track.appendChild(n);
    return n;
});

/* One viewport, parked at the middle of the ring. The model in it is whichever
   project is at the front, so selecting is what loads geometry. */
const viewer = makeViewer(document.getElementById('cad'), PROJECTS[0].id, { settle: true });

const EDGE = 10;    // breathing room between the ring and the box
const GAP  = 14;    // clearance between the model and the nearest node
const DOT  = 18;    // .orbit-dot overhang above the label
const LEAN = 0.36;  // TILT/R, i.e. how far the ring leans away from the viewer
const BULK = 0.42;  // model's footprint as a fraction of its canvas, see below

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
        depth,
        hw: wMax / 2 * s,
        up: DOT * s,
        down: hMax * s
    };
}

/* The ring keeps a fixed lean - a shallow ellipse seen from slightly above,
   the way the hero's torus sits - and the box is sized to fit it rather than
   the other way round. An earlier pass opened the ellipse up until a hole
   appeared at its centre for the model; that bought room but flattened the
   ring into a circle and lost the 3D read entirely.

   So the model is not fitted into a hole. It sits at the centre of the ring
   and the ring passes through it: nodes on the near side paint in front of it,
   nodes on the far side behind, which is what sells the depth. Only the far
   nodes need clearing, and they are cleared against the model's round
   footprint rather than its square canvas - the corners of that canvas are
   transparent, and labels read straight through them. */
function measure() {
    const w = box.clientWidth / 2 - EDGE, h = box.clientHeight / 2 - EDGE;
    const wMax = Math.max(...nodes.map(n => n.offsetWidth)) || 152;
    const hMax = Math.max(...nodes.map(n => n.offsetHeight)) || 40;
    const g = PROJECTS.map((_, i) => nodeBox(i, wMax, hMax));

    // Every node lands inside the box: widest sideways, lowest and highest down
    // and up. Vertical room is asymmetric because the label hangs.
    //
    // Note for the sixth project: an even count puts a node at top dead centre,
    // where its two-line label hangs straight down over the model and becomes
    // the only thing limiting the model's size - which pins the model to its
    // 90px floor here, down from 173px at five. The cap below feeds TILT
    // (TILT = R * LEAN), so raising it lifts that node, but the box width binds
    // R at ~268 before it buys much. Properly recovering the centre means
    // opening up LEAN, giving the box more height, or shortening the labels -
    // all taste calls, so the ring is left as tuned.
    R = Math.min(250, ...g.map(n =>
        Math.abs(n.sin) < 0.01 ? Infinity : (w - n.hw) / Math.abs(n.sin)));
    TILT = Math.min(R * LEAN, ...g.map(n => {
        const reach = n.cos > 0 ? n.down : n.up;   // which end leads the way out
        return Math.abs(n.cos) < 0.01 ? Infinity : (h - reach) / Math.abs(n.cos);
    }));

    box.style.setProperty('--ringD', `${Math.round(R * 2)}px`);
    box.style.setProperty('--ringRot', `${(Math.acos(Math.min(1, TILT / R)) * 180 / Math.PI).toFixed(1)}deg`);

    let size = Math.min(220, w * 2, h * 2);
    for (const n of g) {
        if (n.depth > 0.5) continue;               // near side, draws over it
        // Shortest distance from the centre to this node's box.
        const dx = Math.max(0, Math.abs(n.sin) * R - n.hw);
        const top = n.cos * TILT - n.up, bottom = n.cos * TILT + n.down;
        const dy = top > 0 ? top : bottom < 0 ? -bottom : 0;
        size = Math.min(size, (Math.hypot(dx, dy) - GAP) / BULK);
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
    // Silent on the first paint: sfx stays locked until the visitor acts.
    sfx.arrive();
    detail.classList.remove('swap');
    void detail.offsetWidth;
    detail.classList.add('swap');
    detail.innerHTML =
        `<h2>${p.name}</h2>` +
        `<ul class="d-tags">${p.tags.map(t => `<li>${t}</li>`).join('')}</ul>` +
        `<p>${p.blurb}</p>` +
        // Not every project has a repo - a link-less one just drops the anchor.
        (p.url ? `<a class="d-link" href="${p.url}" target="_blank" rel="noopener">View code</a>` : '');
}

function step(dir) {
    sfx.turn(dir);
    go((index + dir + N) % N);
}

document.getElementById('prev').addEventListener('click', () => step(-1));
document.getElementById('next').addEventListener('click', () => step(1));
addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  step(-1);
    if (e.key === 'ArrowRight') step(1);
});

/* Audio stays shut until the visitor does something. The listeners run before
   the handlers above, so the gesture that opens the context is also the one
   that gets heard. */
['pointerdown', 'keydown'].forEach(ev =>
    addEventListener(ev, () => sfx.unlock(), { once: true, capture: true }));

/* ---------- mute ---------- */
const sfxToggle = document.getElementById('sfxToggle');
function paintToggle() {
    sfxToggle.textContent = sfx.muted ? '🔇' : '🔊';
    sfxToggle.setAttribute('aria-pressed', String(sfx.muted));
}
sfxToggle.addEventListener('click', () => {
    sfx.setMuted(!sfx.muted);
    paintToggle();
    if (!sfx.muted) sfx.select();   // confirm it is back, in its own voice
});
paintToggle();

new ResizeObserver(measure).observe(box);
measure();
show(0);
