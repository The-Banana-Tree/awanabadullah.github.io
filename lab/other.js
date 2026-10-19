/* projects.js has two importers now - this page and orbit.js - on two separate
   pages, so no fork within a page, but the ?v= on both has to be bumped
   together or one of them keeps serving a stale copy of the project list. */
import { OTHER } from './projects.js?v=13';
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
    // The ring's sub-list links straight to a row, so each one is a target.
    row.id = p.id;
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

/* Rows are built after the document settles, so a #hash the browser already
   gave up on has to be honoured by hand - arriving from the ring's sub-list
   otherwise lands at the top of the page every time. scroll-margin-top in the
   stylesheet is what keeps the fixed bar off the row. */
if (location.hash) {
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) target.scrollIntoView({ block: 'start' });
}
