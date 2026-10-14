import { PROJECTS } from './projects.js';
import { makeViewer, bootViewer } from './viewer.js';

const grid = document.getElementById('grid');
const status = document.getElementById('status');
const replay = document.getElementById('replay');

const sleep = ms => new Promise(r => setTimeout(r, ms));
let run = 0;   // bumped on replay so a stale sequence stops typing

let viewers = [];

function build() {
    viewers = [];
    grid.innerHTML = PROJECTS.map((p, i) => `
        <article class="sig-card" data-i="${i}">
            <span class="sig-streak"></span>
            <div class="sig-cad-wrap">
                <canvas class="sig-cad" data-id="${p.id}"></canvas>
                <span class="sig-cad-tag">placeholder geometry</span>
            </div>
            <span class="sig-meta">Signal ${String(i + 1).padStart(2, '0')} / ${PROJECTS.length}</span>
            <h2 class="sig-name"></h2>
            <p class="sig-body"></p>
            <ul class="sig-tags"></ul>
            <a class="sig-link" href="${p.url}" target="_blank" rel="noopener">View code</a>
        </article>`).join('');
}

async function type(node, text, speed, token) {
    node.textContent = '';
    const cur = document.createElement('span');
    cur.className = 'cursor';
    cur.textContent = '_';
    node.appendChild(cur);
    for (let i = 0; i < text.length; i++) {
        if (token !== run) return;
        cur.before(text[i]);
        await sleep(speed);
    }
    cur.remove();
}

async function receive() {
    const token = ++run;
    build();
    status.textContent = 'Receiving…';

    const cards = [...grid.querySelectorAll('.sig-card')];
    for (let i = 0; i < cards.length; i++) {
        if (token !== run) return;
        const card = cards[i];
        const p = PROJECTS[i];

        card.classList.add('incoming');
        await sleep(240);
        if (token !== run) return;
        card.classList.add('landed');

        // The model boots in as the streak lands, before the name types.
        const cv = card.querySelector('.sig-cad');
        if (!viewers[i]) viewers[i] = makeViewer(cv, p.id);
        bootViewer(viewers[i]);
        await sleep(160);
        if (token !== run) return;

        await type(card.querySelector('.sig-name'), p.name, 22, token);
        if (token !== run) return;

        // Body is too long to type character by character without testing
        // the visitor's patience, so it fades in as one block.
        const body = card.querySelector('.sig-body');
        body.textContent = p.blurb;
        body.animate([{ opacity: 0 }, { opacity: 0.85 }], { duration: 300, fill: 'forwards' });

        card.querySelector('.sig-tags').innerHTML =
            p.tags.map(t => `<li>${t}</li>`).join('');

        await sleep(130);
    }

    if (token === run) status.textContent = `${PROJECTS.length} signals decoded`;
}

replay.addEventListener('click', receive);
receive();
