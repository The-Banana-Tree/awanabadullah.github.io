import { OTHER } from './projects.js?v=12';
import { makeViewer, bootViewer } from './viewer.js?v=12';

/* The three non-robotics builds, one row each. Rows are generated rather than
   written into other.html so that projects.js stays the only place any of
   them is described - the ring reads the same array for the card that opens
   this page.

   viewer.js shares one WebGL context across every canvas that asks for one,
   so three viewers here cost about what the ring's single one does. */

const list = document.getElementById('list');

OTHER.forEach(p => {
    const row = document.createElement('section');
    row.className = 'op';
    row.innerHTML =
        '<div class="op-cad">' +
            '<canvas></canvas>' +
            '<span class="op-tag">placeholder geometry</span>' +
        '</div>' +
        '<div class="op-text">' +
            `<h2>${p.name}</h2>` +
            `<ul class="op-tags">${p.tags.map(t => `<li>${t}</li>`).join('')}</ul>` +
            `<p>${p.blurb}</p>` +
            (p.url
                ? `<a class="op-link" href="${p.url}" target="_blank" rel="noopener">View code</a>`
                : '') +
        '</div>';
    list.appendChild(row);

    /* Booted on creation, which is what plays the turn-into-place entry the
       ring's model does on arrival. The canvas has no measured size yet at
       this point; the viewer waits for one and draws nothing until it has it,
       so there is no first frame at the wrong aspect. */
    bootViewer(makeViewer(row.querySelector('canvas'), p.id));
});
