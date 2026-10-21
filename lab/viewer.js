import * as THREE from '../assets/vendor/three.module.min.js';
import { MODELS, fitModel, FIT_SIZE, syncPalette, ACCENT } from './models.js?v=19';

/* A small rotating CAD viewport per card.
   Five cards means five little scenes. Rather than five WebGL contexts, they
   all share one renderer that draws into an offscreen canvas and blits the
   result into each card's own 2D canvas - one context, any number of cards,
   and no scroll-syncing like the scissor approach needs. */

let shared = null;
let sharedW = 0, sharedH = 0;

function sharedRenderer() {
    if (shared) return shared;
    const canvas = document.createElement('canvas');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    shared = { canvas, renderer };
    return shared;
}

/* The offscreen buffer has to match the card's aspect. Rendering a square and
   blitting it into a 2:1 slot stretched every model sideways. Cards are all
   the same size, so this resizes at most once per frame. */
function sizeShared(renderer, canvas, w, h) {
    if (sharedW === w && sharedH === h) return;
    renderer.setSize(w, h, false);
    sharedW = w; sharedH = h;
}

const viewers = [];
let running = false;

/* A quarter turn off square: enough to read depth and the side of a part,
   without the foreshortening a 45 degree view puts on the front face. */
const REST = Math.PI * 0.21;
/* ...which then drifts, at about a third of the speed the cards spin at: one
   turn a minute or so. Slow enough to read as a part being shown rather than
   something whirling, fast enough that the model is clearly not a picture. */
const DRIFT = 0.0016;

export function makeViewer(canvas, projectId, { settle = false } = {}) {
    const build = MODELS[projectId];
    if (!build) return null;

    syncPalette();

    const scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const key = new THREE.DirectionalLight(0xffffff, 1.9);
    key.position.set(3, 5, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(ACCENT, 1.2);
    rim.position.set(-5, 2, -4);
    scene.add(rim);

    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    // Pull back far enough that the fitted model fills ~80% of the square.
    camera.position.set(0, 0.9, (FIT_SIZE / 0.8) / (2 * Math.tan(THREE.MathUtils.degToRad(20))));
    camera.lookAt(0, 0, 0);

    /* fitModel wraps the built group in a pivot, so the group itself has to be
       kept hold of separately - that is where a model hangs its own per-frame
       animation, and reaching back through the pivot for it would depend on
       how fitModel happens to nest things. */
    const built = build();
    const pivot = fitModel(built);
    scene.add(pivot);

    const ctx = canvas.getContext('2d');
    const v = {
        scene, camera, pivot, canvas, ctx, build, rim, settle,
        // Optional, and most models have none: a function the model wants run
        // once a frame, for a part that moves independently of the slow spin.
        anim: built.userData.animate || null,
        // A settling viewer always enters from the same side, so the turn it
        // makes on the way to rest is the same every time.
        spin: settle ? REST - Math.PI * 0.8 : Math.random() * Math.PI * 2,
        rest: REST,           // settle only: the angle being chased, which drifts
        speed: 0.004 + Math.random() * 0.002,
        boot: 0,              // 0..1 entry animation
        booting: false
    };
    viewers.push(v);
    if (!running) { running = true; requestAnimationFrame(frame); }
    return v;
}

export function bootViewer(v) {
    if (!v) return;
    v.boot = 0;
    v.booting = true;
    // Rewind a settling viewer so each arrival turns into place again.
    if (v.settle) {
        v.rest = REST;
        v.spin = REST - Math.PI * 0.8;
    }
}

/* Orbit keeps one viewport at the centre of the ring and changes which model
   is in it, so it needs to swap geometry inside a live viewer rather than
   stand up a new one per project. */
export function setViewerModel(v, projectId) {
    const build = MODELS[projectId];
    if (!v || !build || v.build === build) return;
    v.scene.remove(v.pivot);
    disposeGroup(v.pivot);
    v.build = build;
    const built = build();
    v.pivot = fitModel(built);
    // Re-read it: the old model's animation closed over geometry that has just
    // been disposed, so keeping it would move a part that no longer exists.
    v.anim = built.userData.animate || null;
    v.scene.add(v.pivot);
    bootViewer(v);
}

/* Materials take their colours when the geometry is built, so a theme flip
   after load would leave dark bodies sitting on a white card. Cheapest
   correct fix for five small models: rebuild them. */
function disposeGroup(g) {
    g.traverse(o => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) o.material.dispose();
    });
}

function rebuildAll() {
    syncPalette();
    for (const v of viewers) {
        const spinWas = v.pivot.rotation.y;
        v.scene.remove(v.pivot);
        disposeGroup(v.pivot);
        const built = v.build();
        v.pivot = fitModel(built);
        // Same as in setViewerModel: the rebuilt model owns a new animation,
        // and the old one points at geometry that has just been disposed.
        v.anim = built.userData.animate || null;
        v.pivot.rotation.y = spinWas;
        v.scene.add(v.pivot);
        v.rim.color.setHex(ACCENT);
    }
}

new MutationObserver(rebuildAll).observe(document.documentElement, {
    attributes: true, attributeFilter: ['data-theme']
});

/* A part that moves on its own - the Other Projects arrow bouncing - is the
   one thing in here worth holding still for someone who asked for less motion.
   The slow spin stays either way: it is what says the thing is a model rather
   than a picture, and it predates this. */
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

function frame() {
    requestAnimationFrame(frame);
    const { canvas: off, renderer } = sharedRenderer();
    // One clock for every viewer, so two of the same model stay in step.
    const now = performance.now() / 1000;

    for (let vi = viewers.length - 1; vi >= 0; vi--) {
        const v = viewers[vi];
        // Replay rebuilds the cards, so retire viewers whose canvas is gone
        // instead of animating detached nodes forever.
        if (!v.canvas.isConnected) { viewers.splice(vi, 1); continue; }

        // Match the card canvas to its CSS box once it has one.
        const w = v.canvas.clientWidth, h = v.canvas.clientHeight;
        if (!w || !h) continue;
        const dpr = Math.min(devicePixelRatio, 2);
        if (v.canvas.width !== w * dpr || v.canvas.height !== h * dpr) {
            v.canvas.width = w * dpr;
            v.canvas.height = h * dpr;
        }

        /* A settling viewer chases an angle rather than being given a speed.
           That angle drifts, so one mechanism does both jobs: the big turn into
           place on arrival is the chase closing a large gap, and the slow spin
           afterwards is it tracking the drift. Easing keeps the handover
           invisible - there is no moment where one takes over from the other. */
        if (v.settle) {
            v.rest += DRIFT;
            const gap = v.rest - v.spin;
            v.spin += Math.atan2(Math.sin(gap), Math.cos(gap)) * 0.055;
        } else {
            v.spin += v.speed;
        }
        if (v.booting && v.boot < 1) v.boot = Math.min(1, v.boot + 0.04);
        const ease = 1 - Math.pow(1 - v.boot, 3);

        v.pivot.rotation.y = v.spin;
        v.pivot.scale.setScalar(0.4 + 0.6 * ease);
        v.pivot.rotation.x = (1 - ease) * 0.9;
        // Run after the pivot is posed: the model moves a part inside it, and
        // the pivot's own transform carries that along for free.
        if (v.anim && !reduceMotion.matches) v.anim(now);

        sizeShared(renderer, off, v.canvas.width, v.canvas.height);
        v.camera.aspect = w / h;
        v.camera.updateProjectionMatrix();
        renderer.render(v.scene, v.camera);

        v.ctx.clearRect(0, 0, v.canvas.width, v.canvas.height);
        if (v.boot > 0) {
            v.ctx.globalAlpha = Math.min(1, v.boot * 1.4);
            v.ctx.drawImage(off, 0, 0, v.canvas.width, v.canvas.height);
            v.ctx.globalAlpha = 1;
        }
    }
}
