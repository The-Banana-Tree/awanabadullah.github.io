import * as THREE from '../assets/vendor/three.module.min.js';

/* Placeholder geometry, one builder per project. Primitives arranged to
   suggest each build until real CAD exports land - swapping in a .glb
   means replacing the builder, nothing else. */

/* Palette is read from the site's CSS variables so the models follow the
   theme instead of carrying their own colours. */
export let LINE = 0x00ff00, ACCENT = 0x00ffff, MARK = 0xff00ff, BODY = 0x101418;

export function syncPalette() {
    const css = getComputedStyle(document.documentElement);
    const read = (name, fallback) => {
        const raw = css.getPropertyValue(name).trim();
        if (!raw) return fallback;
        try { return new THREE.Color(raw).getHex(); } catch (_) { return fallback; }
    };
    const light = document.documentElement.getAttribute('data-theme') === 'light';
    LINE = read('--text', 0x00ff00);
    ACCENT = read('--accent', 0x00ffff);
    MARK = light ? 0x9c009c : 0xff00ff;
    BODY = light ? 0xdcdcdc : 0x101418;
}
syncPalette();

/* Solid dark body plus bright edge lines, so the shapes read as CAD. */
function shell(geometry, color = LINE, bodyColor = BODY) {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
        color: bodyColor, roughness: 0.55, metalness: 0.3
    })));
    g.add(new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry, 25),
        new THREE.LineBasicMaterial({ color })
    ));
    return g;
}

function place(g, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
    g.position.set(x, y, z);
    g.rotation.set(rx, ry, rz);
    return g;
}

/* Centre on the bounding box and scale every model to the same footprint, so
   builders need no hand-tuned offsets and a real .glb frames itself. */
export const FIT_SIZE = 4.4;

export function fitModel(model) {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const centre = box.getCenter(new THREE.Vector3());
    const scale = FIT_SIZE / Math.max(size.x, size.y, size.z);
    model.scale.setScalar(scale);
    model.position.set(-centre.x * scale, -centre.y * scale, -centre.z * scale);
    const pivot = new THREE.Group();
    pivot.add(model);
    return pivot;
}

export function buildDoorLock() {
    const g = new THREE.Group();
    // door slab
    g.add(place(shell(new THREE.BoxGeometry(2.6, 4.2, 0.22)), -0.4, 0, 0));
    // reader panel
    g.add(place(shell(new THREE.BoxGeometry(0.9, 1.3, 0.18), ACCENT), 1.35, 0.5, 0.05));
    // keypad
    g.add(place(shell(new THREE.BoxGeometry(0.7, 0.9, 0.14), ACCENT), 1.35, -0.9, 0.05));
    // handle
    g.add(place(shell(new THREE.CylinderGeometry(0.1, 0.1, 1.0, 12)), 0.6, -0.2, 0.28, Math.PI / 2, 0, 0));
    // deadbolt
    g.add(place(shell(new THREE.BoxGeometry(0.5, 0.22, 0.22), MARK), 1.0, 0.45, 0));
    // floating keycard
    g.add(place(shell(new THREE.BoxGeometry(0.85, 0.55, 0.04), MARK), 2.1, 1.6, 0.4, 0, 0, 0.35));
    return g;
}

export function buildManipulator() {
    const g = new THREE.Group();
    // base
    g.add(place(shell(new THREE.CylinderGeometry(1.1, 1.35, 0.5, 20)), -1.6, -1.9, 0));
    // shoulder joint
    g.add(place(shell(new THREE.SphereGeometry(0.34, 14, 10), ACCENT), -1.6, -1.55, 0));
    // link 1
    g.add(place(shell(new THREE.BoxGeometry(0.42, 2.4, 0.42)), -1.6, -0.35, 0, 0, 0, -0.25));
    // elbow
    g.add(place(shell(new THREE.SphereGeometry(0.28, 14, 10), ACCENT), -1.0, 0.75, 0));
    // link 2
    g.add(place(shell(new THREE.BoxGeometry(0.34, 2.0, 0.34)), -0.35, 1.3, 0, 0, 0, -1.05));
    // wrist
    g.add(place(shell(new THREE.SphereGeometry(0.22, 14, 10), ACCENT), 0.5, 1.75, 0));
    // spray head
    g.add(place(shell(new THREE.ConeGeometry(0.26, 0.6, 12), MARK), 1.0, 1.6, 0, 0, 0, -1.4));
    // the gas cylinder being coated
    g.add(place(shell(new THREE.CylinderGeometry(0.62, 0.62, 2.6, 18), LINE), 2.0, -0.6, 0));
    g.add(place(shell(new THREE.SphereGeometry(0.62, 16, 8), LINE), 2.0, 0.7, 0));
    return g;
}

export function buildRover() {
    const g = new THREE.Group();
    // chassis
    g.add(place(shell(new THREE.BoxGeometry(3.4, 0.7, 2.0)), 0, 0, 0));
    // collection bin
    g.add(place(shell(new THREE.BoxGeometry(1.5, 0.9, 1.6), ACCENT), -0.75, 0.8, 0));
    // scoop
    g.add(place(shell(new THREE.BoxGeometry(1.1, 0.5, 1.8), MARK), 2.0, -0.2, 0, 0, 0, 0.3));
    // sensor mast + head
    g.add(place(shell(new THREE.CylinderGeometry(0.08, 0.08, 1.3, 10)), 0.6, 0.95, 0));
    g.add(place(shell(new THREE.BoxGeometry(0.6, 0.3, 0.5), ACCENT), 0.6, 1.7, 0));
    // wheels
    const wheel = () => shell(new THREE.CylinderGeometry(0.62, 0.62, 0.36, 16));
    [[-1.1, 1.1], [1.1, 1.1], [-1.1, -1.1], [1.1, -1.1]].forEach(([x, z]) => {
        g.add(place(wheel(), x, -0.5, z, Math.PI / 2, 0, 0));
    });
    return g;
}

export function buildGearbox() {
    const g = new THREE.Group();
    // a gear = hub + teeth ringed around it
    const gear = (radius, thickness, teeth, color) => {
        const gg = new THREE.Group();
        gg.add(shell(new THREE.CylinderGeometry(radius, radius, thickness, 28), color));
        const toothGeo = new THREE.BoxGeometry(0.26, thickness * 0.95, 0.34);
        for (let i = 0; i < teeth; i++) {
            const a = (i / teeth) * Math.PI * 2;
            const t = shell(toothGeo, color);
            t.position.set(Math.cos(a) * (radius + 0.11), 0, Math.sin(a) * (radius + 0.11));
            t.rotation.y = -a;
            gg.add(t);
        }
        return gg;
    };
    // Driven gear: tilted off flat so it reads as a gear, not a table top.
    g.add(place(gear(1.3, 0.4, 18, LINE), -0.85, -0.45, 0, 0.32, 0, 0));
    // Bevel gear stood upright, meeting the first one at ninety degrees.
    g.add(place(gear(0.95, 0.36, 14, ACCENT), 0.95, 0.45, 0, Math.PI / 2, 0, 0));
    // Short stub shafts - a long one would dominate the bounding box and
    // shrink everything else when the model is auto-fitted.
    g.add(place(shell(new THREE.CylinderGeometry(0.16, 0.16, 1.1, 12), MARK), -0.85, 0.35, 0, 0.32, 0, 0));
    g.add(place(shell(new THREE.CylinderGeometry(0.14, 0.14, 1.1, 12), MARK), 1.95, 0.45, 0, 0, 0, Math.PI / 2));
    return g;
}

export function buildPipeline() {
    const g = new THREE.Group();
    // three stages wired together: in -> transform -> out
    const colors = [ACCENT, LINE, MARK];
    for (let i = 0; i < 3; i++) {
        const x = (i - 1) * 1.9;
        g.add(place(shell(new THREE.BoxGeometry(1.2, 1.2, 1.2), colors[i]), x, (i - 1) * 0.55, 0, 0.3, 0.5, 0));
        if (i < 2) {
            g.add(place(shell(new THREE.CylinderGeometry(0.07, 0.07, 0.8, 8)), x + 0.95, (i - 0.5) * 0.55, 0, 0, 0, Math.PI / 2));
        }
    }
    // a torus looping back over the top: the automation feeding itself
    g.add(place(shell(new THREE.TorusGeometry(1.5, 0.08, 8, 40), LINE), 0, 1.5, 0, Math.PI / 2.2, 0, 0));
    return g;
}


export const MODELS = {
    rfid: buildDoorLock,
    manipulator: buildManipulator,
    tyler: buildRover,
    drill: buildGearbox,
    python: buildPipeline
};
