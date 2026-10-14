import { PROJECTS } from './projects.js';
import { makeViewer, bootViewer } from './viewer.js';

const deck = document.getElementById('deck');
const count = document.getElementById('count');
const N = PROJECTS.length;
const sleep = ms => new Promise(r => setTimeout(r, ms));

const FLING = 110;      // px of travel that commits to a swipe
const VISIBLE = 3;      // how many cards in the stack are drawn

let order = PROJECTS.map((_, i) => i);   // order[0] is the top card
let cards = [];
let viewers = [];
let busy = false;

/* ---------- build the deck once ---------- */
PROJECTS.forEach((p, i) => {
    const el = document.createElement('article');
    el.className = 'deck-card';
    el.innerHTML = `
        <span class="card-streak"></span>
        <span class="card-cue left">&#9664; NEXT</span>
        <span class="card-cue right">NEXT &#9654;</span>
        <div class="card-cad">
            <canvas></canvas>
            <span class="cad-tag">placeholder geometry</span>
        </div>
        <div class="card-body">
            <span class="card-meta">Signal ${String(i + 1).padStart(2, '0')} / ${N}</span>
            <h2 class="card-name"></h2>
            <p class="card-text"></p>
            <ul class="card-tags">${p.tags.map(t => `<li>${t}</li>`).join('')}</ul>
            <a class="card-link" href="${p.url}" target="_blank" rel="noopener">View code</a>
        </div>`;
    deck.appendChild(el);
    cards.push(el);
    viewers.push(makeViewer(el.querySelector('canvas'), p.id));
});

/* ---------- stack geometry ---------- */
function restack() {
    order.forEach((projIndex, depth) => {
        const el = cards[projIndex];
        const shown = depth < VISIBLE;
        el.classList.toggle('top', depth === 0);
        el.style.display = shown ? '' : 'none';
        el.style.zIndex = String(N - depth);
        if (shown) {
            el.style.transform =
                `translate3d(0, ${depth * 14}px, 0) scale(${1 - depth * 0.05})`;
            el.style.opacity = depth === 0 ? '1' : String(1 - depth * 0.35);
        }
    });
    count.textContent = `${String(order[0] + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')}`;
}

/* ---------- bring whatever is on top to life ---------- */
function decodeTop() {
    const i = order[0];
    const el = cards[i];
    const p = PROJECTS[i];

    el.classList.remove('arriving');
    void el.offsetWidth;
    el.classList.add('arriving');

    bootViewer(viewers[i]);

    const name = el.querySelector('.card-name');
    const text = el.querySelector('.card-text');
    name.textContent = p.name;
    text.textContent = p.blurb;

    // The streak and the model booting carry the arrival; the text just fades
    // in behind them rather than being typed out on every swipe.
    el.querySelector('.card-body').animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 260, easing: 'ease-out', fill: 'backwards' }
    );
}

/* ---------- advancing ---------- */
async function advance(dir) {
    if (busy) return;
    busy = true;

    const el = cards[order[0]];
    el.classList.remove('settling');
    el.classList.add('flung');
    el.style.transform =
        `translate3d(${dir * (innerWidth * 0.9)}px, 0, 0) rotate(${dir * 28}deg)`;

    await sleep(430);

    // Retire it to the back of the stack and reset it for its next turn.
    el.classList.remove('flung');
    el.style.opacity = '';
    order = [...order.slice(1), order[0]];
    restack();

    busy = false;
    decodeTop();
}

function rewind() {
    if (busy) return;
    order = [order[N - 1], ...order.slice(0, N - 1)];
    restack();
    decodeTop();
}

/* ---------- drag ---------- */
let dragging = false, startX = 0, startY = 0, dx = 0, dragEl = null;
let axis = null;          // null until the gesture commits to 'x' or 'y'
const AXIS_SLOP = 8;      // px of travel before deciding which way it is going

deck.addEventListener('pointerdown', e => {
    if (busy) return;
    // Let the links and the model's own drag-to-spin keep their behaviour.
    if (e.target.closest('a')) return;
    dragEl = cards[order[0]];
    if (!dragEl.contains(e.target)) return;

    dragging = true;
    axis = null;
    startX = e.clientX; startY = e.clientY; dx = 0;
    dragEl.classList.remove('settling');
});

deck.addEventListener('pointermove', e => {
    if (!dragging || !dragEl) return;
    const mx = e.clientX - startX;
    const my = e.clientY - startY;

    // Decide the gesture's axis once, then stick to it. A mostly-vertical
    // drag is someone scrolling the page, so hand it back rather than
    // dragging the card around under their finger.
    if (!axis) {
        if (Math.abs(mx) < AXIS_SLOP && Math.abs(my) < AXIS_SLOP) return;
        axis = Math.abs(mx) > Math.abs(my) ? 'x' : 'y';
        if (axis === 'y') { dragging = false; dragEl = null; return; }
        dragEl.setPointerCapture(e.pointerId);
    }

    dx = mx;
    // Y is pinned: the card only travels sideways.
    dragEl.style.transform = `translate3d(${dx}px, 0, 0) rotate(${dx * 0.055}deg)`;

    const t = Math.min(1, Math.abs(dx) / FLING);
    dragEl.querySelector('.card-cue.left').style.opacity  = dx < 0 ? t : 0;
    dragEl.querySelector('.card-cue.right').style.opacity = dx > 0 ? t : 0;
});

function endDrag(e) {
    if (!dragging || !dragEl) return;
    dragging = false;
    const el = dragEl;
    dragEl = null;
    try { el.releasePointerCapture(e.pointerId); } catch (_) {}

    el.querySelectorAll('.card-cue').forEach(c => { c.style.opacity = 0; });

    if (Math.abs(dx) > FLING) {
        advance(dx > 0 ? 1 : -1);
    } else {
        el.classList.add('settling');
        el.style.transform = 'translate3d(0, 0, 0) scale(1)';
        setTimeout(() => el.classList.remove('settling'), 420);
    }
}
deck.addEventListener('pointerup', endDrag);
deck.addEventListener('pointercancel', endDrag);

/* ---------- buttons + keys ---------- */
document.getElementById('next').addEventListener('click', () => advance(1));
document.getElementById('prev').addEventListener('click', rewind);
addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') advance(1);
    if (e.key === 'ArrowLeft')  rewind();
});

restack();
decodeTop();
