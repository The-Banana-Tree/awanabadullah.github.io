import { PROJECTS, OTHER } from './projects.js?v=15';
import { makeViewer, bootViewer, setViewerModel } from './viewer.js?v=16';
import { sfx } from './sfx.js?v=14';

const box = document.getElementById('orbitBox');
const track = document.getElementById('track');
const detail = document.getElementById('detail');
const title = document.getElementById('projectTitle');
const announce = document.getElementById('projectAnnounce');
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
const DOT  = 18;    // .orbit-dot overhang above the label
/* TILT/R, i.e. how far the ring leans away from the viewer. Opened up from
   0.36 when the model went hero-sized: a taller box left a dead band under the
   ring, and the extra lean spends it by dropping the front node clear of the
   model's base and lifting the back node clear of its top. Still a shallow
   ellipse - push this much past 0.5 and the ring reads as a flat circle. */
const LEAN = 0.44;
const HERO = 0.82;  // model's share of the box's short side
const ARC  = 120;   // angles sampled when sizing the ring, see measure()

/* The box a node occupies at ring angle a, in the units place() draws in.
   The point that rides the ring is the dot at the node's TOP - the label hangs
   below it - so the box is lopsided and a node sinks further than it rises.

   Measured as the largest node rather than the one that happens to be there:
   rotating brings a two-line label to the front and the ring must not resize
   under it. */
function nodeBox(a, wMax, hMax) {
    const depth = (Math.cos(a) + 1) / 2;
    const s = 0.72 + depth * 0.28;
    return {
        sin: Math.sin(a),
        cos: Math.cos(a),
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
   nodes on the far side behind, which is what sells the depth.

   Nothing here counts the projects. An earlier pass sized the ring from the N
   node positions, which meant the layout jumped every time a project was added
   - six put a node at top dead centre and its hanging label crushed the model
   to a third of its size. So the ring is sized against a node at EVERY angle
   instead: the result is the same for five projects or fifty, and adding one
   never moves anything that is already on screen. */
function measure() {
    const w = box.clientWidth / 2 - EDGE, h = box.clientHeight / 2 - EDGE;
    const wMax = Math.max(...nodes.map(n => n.offsetWidth)) || 152;
    const hMax = Math.max(...nodes.map(n => n.offsetHeight)) || 40;
    const g = Array.from({ length: ARC }, (_, k) => nodeBox(k * (Math.PI * 2 / ARC), wMax, hMax));

    // A node at any angle lands inside the box: widest sideways, lowest and
    // highest down and up. Vertical room is asymmetric because the label hangs.
    /* The ceiling used to be 250, which never bound at the box's usual width -
       the label-clearance constraint below lands around 237 there - but did
       the moment the box went full-width on a collection card. The ring then
       stayed its old size in a box nearly twice as wide and the thing read as
       a frame around nothing, which is the failure this page keeps finding.
       420 is high enough to let the ring open out and still be the constraint
       that decides, so normal cards are completely unaffected. */
    R = Math.min(420, ...g.map(n =>
        Math.abs(n.sin) < 0.01 ? Infinity : (w - n.hw) / Math.abs(n.sin)));
    TILT = Math.min(R * LEAN, ...g.map(n => {
        const reach = n.cos > 0 ? n.down : n.up;   // which end leads the way out
        return Math.abs(n.cos) < 0.01 ? Infinity : (h - reach) / Math.abs(n.cos);
    }));

    box.style.setProperty('--ringD', `${Math.round(R * 2)}px`);
    box.style.setProperty('--ringRot', `${(Math.acos(Math.min(1, TILT / R)) * 180 / Math.PI).toFixed(1)}deg`);

    // The model is the hero, so it takes a fixed share of the box rather than
    // whatever the labels leave over. It is free to do that because the ring
    // interleaves with it by z-index: far nodes pass behind it and are quieted
    // by the veil, near nodes paint across its base. Overlap is the depth read,
    // not a collision to be sized around.
    box.style.setProperty('--stage', `${Math.round(Math.min(w, h) * 2 * HERO)}px`);
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
        // Two bands with the model sitting between them: the far half goes
        // under the veil, which quiets it where it crosses the model, and the
        // near half paints over the stage. A single 0-100 ramp put both halves
        // on the same side of the model and the ring stopped reading as 3D.
        n.style.zIndex = String(depth > 0.5
            ? Math.round(60 + (depth - 0.5) * 80)
            : Math.round(2 + depth * 80));
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

const sticker = document.getElementById('sticker');

/* ---- the heading types itself ----
   Same effect as the home page hero: a character at a time, then a blinking
   underscore. Faster here, because the hero types once on arrival while this
   fires on every press of the arrows - 35ms a character is a pause when you
   are stepping through six projects, 16ms keeps up with you. The hero's
   deliberate typo-and-backspace is left behind; that is a joke about spelling
   one specific name, not a thing to do to "RFID Door Lock".

   `run` is the cancel token. Press next twice quickly and the first run must
   stop, or two timers interleave their characters into the same element. */
const TYPE_MS = 16;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
let run = 0;

function typeTitle(text) {
    const mine = ++run;
    // aria-label holds the whole name from the first frame, so the heading is
    // never exposed half-typed; the live region announces the change once.
    title.setAttribute('aria-label', text);
    title.textContent = '';
    announce.textContent = text;
    if (reduceMotion.matches) {
        title.textContent = text;
        return;
    }
    // One text node that grows, rather than appending a node per character:
    // the cursor then simply stays after it, with nothing to reposition.
    const typed = document.createTextNode('');
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    cursor.textContent = '_';
    title.append(typed, cursor);
    let n = 0;
    (function step() {
        if (mine !== run || n >= text.length) return;
        typed.data = text.slice(0, ++n);
        setTimeout(step, TYPE_MS);
    })();
}

const subCards = document.getElementById('subCards');
const layout = document.querySelector('.orbit-layout');
const counter = document.getElementById('counter');

/* A card that stands for several projects shows them as CAD boxes under the
   ring instead of hiding them behind a press. Which projects is decided here
   rather than by an id check in show(), so a second collection card would need
   no new code. */
const COLLECTIONS = { other: OTHER };

/* Built once, on the first card that needs them, and then only shown and
   hidden. Rebuilding per selection would stand up three WebGL viewers every
   time the ring came back round to this card; viewer.js retires a viewer when
   its canvas leaves the document, so the old ones would churn for nothing. */
let cardViewers = null;

function buildCards(p, items) {
    /* Each card carries what the standalone page used to: the model, the name,
       its tags, the blurb and the way to the code. An article rather than one
       big anchor - the View code button is the link, and a button nested
       inside a link is not markup a browser will accept. */
    subCards.innerHTML = items.map(o =>
        `<article class="ocard">` +
            `<canvas data-model="${o.id}"></canvas>` +
            `<span class="ocard-tag">placeholder</span>` +
            `<div class="ocard-body">` +
                `<h3 class="ocard-name">${o.name}</h3>` +
                `<ul class="ocard-tags">${o.tags.map(t => `<li>${t}</li>`).join('')}</ul>` +
                `<p>${o.blurb}</p>` +
                (o.url
                    ? `<a class="ocard-link" href="${o.url}" target="_blank" rel="noopener">View code</a>`
                    : '') +
            `</div>` +
        `</article>`).join('');
    cardViewers = [...subCards.querySelectorAll('canvas')]
        .map(c => makeViewer(c, c.dataset.model))
        .filter(Boolean);
}

function show(i) {
    const p = PROJECTS[i];

    // Counted from the list, not written down anywhere: adding a project to
    // projects.js moves the total on its own.
    counter.innerHTML = `<b>${i + 1}</b>/${N}`;

    /* What the card leads to, and how it says so. Three shapes:
         log:   a build still being written - sticker over the model
         items: a card standing for several projects - a row of CAD cards
                below, replacing the detail panel entirely. Each one carries
                its own model, tags, blurb and View code button, so the card
                itself needs no sticker and no button of its own
         url:   a finished project - 'View code' in the panel
       The sticker rides the model, so re-triggering its animation is what
       makes it read as being pressed on each time rather than fading in with
       the panel. */
    const items = COLLECTIONS[p.id];
    sticker.hidden = !p.log;
    if (p.log) {
        sticker.href = p.log;
        sticker.setAttribute('aria-label', `Read the ${p.name} build log`);
        sticker.style.animation = 'none';
        void sticker.offsetWidth;
        sticker.style.animation = '';
    }

    // setViewerModel only boots when the geometry actually changes, so boot
    // again here: that covers the first paint and re-picking the front node.
    setViewerModel(viewer, p.id);
    bootViewer(viewer);
    // Silent on the first paint: sfx stays locked until the visitor acts.
    sfx.arrive();
    // The page heading is the front project's name, typed out. No swap class
    // on it any more - a fade-and-rise fighting a type-on read as a stutter.
    typeTitle(p.name);

    /* The CAD boxes and the detail panel are alternatives, never both: the
       boxes went in precisely because the numbered list and the blurb were the
       two things he wanted gone from this card. */
    subCards.hidden = !items;
    detail.hidden = !!items;
    /* With the panel gone the second column is free, so the ring box takes it
       rather than leaving a lake of starfield beside itself. Only on this kind
       of card - every other one still needs that column for its panel. */
    layout.classList.toggle('wide', !!items);
    if (items) {
        if (!cardViewers) buildCards(p, items);
        subCards.setAttribute('aria-label', `The ${items.length} projects on ${p.name}`);
        // Turn into place on each arrival, the way the ring's own model does.
        cardViewers.forEach(bootViewer);
        return;
    }

    detail.classList.remove('swap');
    void detail.offsetWidth;
    detail.classList.add('swap');
    /* A finished project points at its repo; one still being built points at
       its log. A project with neither just drops the anchor rather than
       rendering a dead button. */
    const links = [
        p.url && `<a class="d-link" href="${p.url}" target="_blank" rel="noopener">View code</a>`,
        p.log && `<a class="d-link" href="${p.log}">Build log</a>`,
    ].filter(Boolean).join('');
    // No name in the panel: the heading above the model already carries it,
    // and printed twice on one screen it read as a mistake.
    detail.innerHTML =
        `<ul class="d-tags">${p.tags.map(t => `<li>${t}</li>`).join('')}</ul>` +
        `<p>${p.blurb}</p>` +
        links;
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
// The icon goes in the inner span, not on the button: that is the shape the
// home page's .audio-toggle uses, and this now borrows its styling whole.
const sfxIcon = sfxToggle.querySelector('.audio-icon');
function paintToggle() {
    sfxIcon.textContent = sfx.muted ? '🔇' : '🔊';
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
