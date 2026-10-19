import * as THREE from '../assets/vendor/three.module.min.js';

/* Placeholder geometry, one builder per project. Primitives arranged to
   suggest each build until real CAD exports land - swapping in a .glb
   means replacing the builder, nothing else.

   These are read at about 300px across while the ring is turning, so every
   builder is cut to the fewest parts that still name the thing. Detail that
   only survives at full size is noise here: overlapping edge lines pile up
   into a thicket and the silhouette stops reading. Rule of thumb, under ten
   parts and under a dozen segments on anything round. */

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
    // One reader panel, not a reader plus a keypad: at this size the two
    // plates sat on top of each other and read as a smudge.
    g.add(place(shell(new THREE.BoxGeometry(0.9, 1.6, 0.18), ACCENT), 1.35, 0.2, 0.05));
    // handle
    g.add(place(shell(new THREE.CylinderGeometry(0.1, 0.1, 1.0, 8)), 0.6, -0.2, 0.28, Math.PI / 2, 0, 0));
    // deadbolt - the one part that says lock rather than door
    g.add(place(shell(new THREE.BoxGeometry(0.5, 0.22, 0.22), MARK), 1.0, 1.5, 0));
    return g;
}

export function buildManipulator() {
    const g = new THREE.Group();
    // base
    /* Sixteen sides, not twelve. Edge lines are only drawn where two faces
       meet at more than 25 degrees, so a twelve-sided tube (30 degrees a
       facet) gets striped down its length while a sixteen-sided one (22.5)
       comes out as a clean silhouette. Rounder reads simpler here. */
    g.add(place(shell(new THREE.CylinderGeometry(1.1, 1.35, 0.5, 16)), -1.6, -1.9, 0));
    // link 1
    g.add(place(shell(new THREE.BoxGeometry(0.42, 2.4, 0.42)), -1.6, -0.35, 0, 0, 0, -0.25));
    // Elbow kept, shoulder and wrist dropped: one joint is enough to say the
    // arm articulates, three spheres just crowded the links.
    g.add(place(shell(new THREE.SphereGeometry(0.3, 12, 8), ACCENT), -1.0, 0.75, 0));
    // link 2
    g.add(place(shell(new THREE.BoxGeometry(0.34, 2.0, 0.34)), -0.35, 1.3, 0, 0, 0, -1.05));
    // spray head
    g.add(place(shell(new THREE.ConeGeometry(0.26, 0.6, 8), MARK), 1.0, 1.6, 0, 0, 0, -1.4));
    /* The gas cylinder being coated, one part instead of a tube plus a dome
       cap. A capsule was the obvious single shape but it has no flat face
       anywhere, so no edge passed the 25 degree test and it rendered as an
       unlined dark blob among lined parts. A plain cylinder keeps its two rim
       circles, which is the whole outline it needs. */
    g.add(place(shell(new THREE.CylinderGeometry(0.62, 0.62, 2.6, 16), LINE), 2.0, -0.3, 0));
    return g;
}

export function buildRover() {
    const g = new THREE.Group();
    // chassis
    g.add(place(shell(new THREE.BoxGeometry(3.4, 0.7, 2.0)), 0, 0, 0));
    // collection bin - what the thing is for, so it stays
    g.add(place(shell(new THREE.BoxGeometry(1.5, 0.9, 1.6), ACCENT), -0.75, 0.8, 0));
    // scoop
    g.add(place(shell(new THREE.BoxGeometry(1.1, 0.5, 1.8), MARK), 2.0, -0.2, 0, 0, 0, 0.3));
    // Sensor mast dropped: a thin pole and a small head read as two stray
    // lines above the bin and nothing else.
    const wheel = () => shell(new THREE.CylinderGeometry(0.62, 0.62, 0.36, 10));
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
        gg.add(shell(new THREE.CylinderGeometry(radius, radius, thickness, 16), color));
        const toothGeo = new THREE.BoxGeometry(0.3, thickness * 0.95, 0.4);
        for (let i = 0; i < teeth; i++) {
            const a = (i / teeth) * Math.PI * 2;
            const t = shell(toothGeo, color);
            t.position.set(Math.cos(a) * (radius + 0.13), 0, Math.sin(a) * (radius + 0.13));
            t.rotation.y = -a;
            gg.add(t);
        }
        return gg;
    };
    // Fewer, chunkier teeth. Eighteen and fourteen turned the rims into a
    // band of flicker; ten and eight still say gear and you can count them.
    g.add(place(gear(1.3, 0.4, 10, LINE), -0.85, -0.45, 0, 0.32, 0, 0));
    // Bevel gear stood upright, meeting the first one at ninety degrees.
    g.add(place(gear(0.95, 0.36, 8, ACCENT), 0.95, 0.45, 0, Math.PI / 2, 0, 0));
    // One stub shaft, on the driven gear. A long one would dominate the
    // bounding box and shrink everything else when the model is auto-fitted.
    g.add(place(shell(new THREE.CylinderGeometry(0.16, 0.16, 1.1, 8), MARK), -0.85, 0.35, 0, 0.32, 0, 0));
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
            g.add(place(shell(new THREE.CylinderGeometry(0.07, 0.07, 0.8, 6)), x + 0.95, (i - 0.5) * 0.55, 0, 0, 0, Math.PI / 2));
        }
    }
    // a torus looping back over the top: the automation feeding itself
    g.add(place(shell(new THREE.TorusGeometry(1.5, 0.1, 6, 20), LINE), 0, 1.5, 0, Math.PI / 2.2, 0, 0));
    return g;
}

export function buildHexapod() {
    const g = new THREE.Group();
    // Hex body plate - six sides, so the silhouette says six legs on its own.
    g.add(place(shell(new THREE.CylinderGeometry(1.5, 1.5, 0.32, 6)), 0, 0, 0));
    /* Six matching two-part legs. The old model built one leg out in full -
       bearings, pushrod, body servos - and left the other five as stubs; at
       ring size that asymmetry read as a broken machine rather than a
       deliberate one. The story survives in colour instead: the lead leg is
       the accent, the five waiting on it are plain. The joint detail that
       went is all on the build log page, drawn flat where it can be read. */
    for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const col = i === 0 ? ACCENT : LINE;
        // femur, reaching out from the plate edge
        const femur = shell(new THREE.BoxGeometry(1.1, 0.2, 0.26), col);
        femur.position.set(Math.cos(a) * 1.9, -0.08, Math.sin(a) * 1.9);
        femur.rotation.y = -a;
        g.add(femur);
        // tibia, folding down from the femur tip
        const tibia = shell(new THREE.BoxGeometry(0.2, 1.1, 0.22), col);
        tibia.position.set(Math.cos(a) * 2.45, -0.68, Math.sin(a) * 2.45);
        tibia.rotation.y = -a;
        g.add(tibia);
    }
    return g;
}

export function buildOtherStack() {
    const g = new THREE.Group();
    /* Deliberately a placeholder and nothing else. This one rides the ring
       card that stands for three unrelated builds - a door lock, a gearbox, a
       pile of scripts - and whichever of their three models went here would
       have quietly claimed the card for that project. Assorted blocks claim it
       for none of them, and the three real models are on the page it opens.

       A heap rather than a stack: three blocks taking the weight, three small
       ones tumbled on and beside them, no two at the same angle. Cubes are the
       one shape where every edge passes the 25 degree test, so the pile reads
       as outlines however it is turned. */
    const cube = (s, x, y, z, rx, ry, color) =>
        place(shell(new THREE.BoxGeometry(s, s, s), color), x, y, z, rx, ry, 0);
    g.add(cube(1.70, -0.90, -0.85,  0.20,  0.00,  0.22, LINE));
    g.add(cube(1.40,  0.85, -0.95, -0.35,  0.00, -0.50, LINE));
    g.add(cube(1.20, -0.15,  0.35,  0.55,  0.18,  0.75, ACCENT));
    g.add(cube(0.80,  1.00,  0.25,  0.45,  0.40,  0.30, MARK));
    g.add(cube(0.62, -1.25,  0.50, -0.60, -0.30,  0.90, ACCENT));
    g.add(cube(0.50,  0.10,  1.25, -0.10,  0.25, -0.35, MARK));
    return g;
}

export const MODELS = {
    rfid: buildDoorLock,
    manipulator: buildManipulator,
    tyler: buildRover,
    drill: buildGearbox,
    python: buildPipeline,
    hexapod: buildHexapod,
    other: buildOtherStack
};
