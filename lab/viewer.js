import * as THREE from '../assets/vendor/three.module.min.js';
import { MODELS, fitModel, FIT_SIZE, syncPalette, ACCENT } from './models.js';

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

export function makeViewer(canvas, projectId) {
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

    const pivot = fitModel(build());
    scene.add(pivot);

    const ctx = canvas.getContext('2d');
    const v = {
        scene, camera, pivot, canvas, ctx,
        spin: Math.random() * Math.PI * 2,
        speed: 0.004 + Math.random() * 0.002,
        boot: 0,              // 0..1 entry animation
        booting: false
    };
    viewers.push(v);
    if (!running) { running = true; requestAnimationFrame(frame); }
    return v;
}

export function bootViewer(v) { if (v) { v.boot = 0; v.booting = true; } }

function frame() {
    requestAnimationFrame(frame);
    const { canvas: off, renderer } = sharedRenderer();

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

        v.spin += v.speed;
        if (v.booting && v.boot < 1) v.boot = Math.min(1, v.boot + 0.04);
        const ease = 1 - Math.pow(1 - v.boot, 3);

        v.pivot.rotation.y = v.spin;
        v.pivot.scale.setScalar(0.4 + 0.6 * ease);
        v.pivot.rotation.x = (1 - ease) * 0.9;

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
