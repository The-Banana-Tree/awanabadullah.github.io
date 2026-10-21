import * as THREE from '../assets/vendor/three.module.min.js';

/* Placeholder geometry, one builder per project. Primitives arranged to
   suggest each build until real CAD exports land - swapping in a .glb
   means replacing the builder, nothing else.

   These are read at about 300px across while the ring is turning, so every
   builder is cut to the fewest parts that still name the thing. Detail that
   only survives at full size is noise here: overlapping edge lines pile up
   into a thicket and the silhouette stops reading. Rule of thumb, under ten
   parts and under a dozen segments on anything round.

   The three on the Other Projects cards - door lock, gearbox, pipeline - are
   read at about 140px on a phone, half the ring's size, so they are cut
   harder still. Two things stop reading first at that size, and both are
   worth knowing before adding anything:

     Thin parts vanish. A 0.1-radius rod is about two pixels there. It does
     not read as a rod, it reads as a smudge on top of whatever is behind it,
     so anything that thin is better deleted than kept.

     Repeated small features turn into a texture. Ten gear teeth at ring size
     are countable; at thumbnail size they are a flickering band around a
     disc. Fewer and chunkier survives the shrink and still says gear.

   Deleting a part is also the cheapest way to make the rest bigger, because
   fitModel scales to the bounding box - drop the long stub shaft and every
   other part grows to fill the space it was holding. */

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
    /* The slab is deep rather than flat - 0.55 where it used to be 0.22. A
       panel that thin has almost no side to it, so for a second or two of
       every revolution the whole model turned edge-on and became a bright
       line. Giving it a real thickness means there is always a face and a
       side in view, which is the thing that says "door" at any angle. */
    g.add(place(shell(new THREE.BoxGeometry(2.6, 4.2, 0.55)), -0.4, 0, 0));
    // One reader panel, not a reader plus a keypad: at this size the two
    // plates sat on top of each other and read as a smudge. Proud of the slab
    // by enough to cast its own outline rather than share the slab's.
    g.add(place(shell(new THREE.BoxGeometry(0.95, 1.7, 0.32), ACCENT), 1.3, 0.2, 0.3));
    /* Handle kept but fattened to 0.18. At 0.1 it was under two pixels on a
       phone card and read as a scratch across the door. */
    g.add(place(shell(new THREE.CylinderGeometry(0.18, 0.18, 0.95, 10)), 0.55, -0.25, 0.45, Math.PI / 2, 0, 0));
    // deadbolt - the one part that says lock rather than door
    g.add(place(shell(new THREE.BoxGeometry(0.6, 0.3, 0.3), MARK), 1.05, 1.5, 0));
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

/* Extrudes a flat profile across the model's width. Both of Tyler's signature
   parts are shapes in side view swept sideways - which is what they are on the
   real machine too, a ramp and a belt loop both drawn in section and given a
   width - and neither is reachable from the primitives the rest of this file
   uses. Profile points are given in world x and y, so the part needs no
   placement at all and the arithmetic in the comments can be read straight off
   the numbers. bevelEnabled is false because a bevel rounds every corner into
   facets that fall under the 25 degree edge test and the outline disappears. */
function extrude(points, width) {
    const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
    const geo = new THREE.ExtrudeGeometry(shape, { depth: width, bevelEnabled: false });
    geo.translate(0, 0, -width / 2);
    return geo;
}

export function buildTyler() {
    const g = new THREE.Group();
    /* Tyler is a parts collector, and it is a vehicle - which makes it the one
       model here where wheels are the right answer rather than the trap they
       were on MAPSY. The risk runs the other way instead: a box on wheels with
       a bin on top is the generic rover this builder replaced, and it said
       nothing about this machine. Two things in the final design report are
       what make it itself, and both of them are shapes rather than details.

       Built against the report's CAD: the assembly isos (Part Container on
       Final Assembly, DC Motor Mounted to Chassis and Pulleys, Infrared Sensor
       Mounts), the Belt Mechanism and Ramp part drawings, the Chassis and
       Three Wheel Base views, the Lift Mechanism Progression strip, and the
       photograph of the carpeted belt on the built prototype.

         The front end is a carpeted belt running round two rollers, slung over
         a hinged ramp whose leading edge rides flush to the floor. Parts get
         dragged up the throat between the two. Nothing else on the ring has a
         nose that reaches the ground, so this is the silhouette.

         The part container does not just sit there. A geared three-bar linkage
         on a servo lifts it and tips it backwards over the collection bins -
         lift-then-tip, which the report says was forced by the 14 cm height
         limit, because there was no height left to store parts high enough to
         pour them out. So it is modelled mid-tip, at 30 degrees, rather than
         lying flat. Flat, it is a lid; tipped, it is the mechanism, and a tray
         standing up in the air cannot be confused with MAPSY's drums or with
         the old rover's bin.

       Ten parts, which is the rule of thumb for this file rather than an
       overrun, but the budget is tight enough to say where it went. The two
       lift links are one part each and both are load-bearing on the read: a
       tray tipped 30 degrees with nothing under it looks broken rather than
       lifted, and one link reads as a prop while two read as a linkage. The
       caster is a sliver of a part and stays because three wheels is the
       design decision - two drive wheels centred on the length so it can spin
       on the spot, one caster carrying the rear - and four would quietly make
       it a rover again. What did not survive: the open ladder chassis (the
       real one is see-through in every render, but the tray covers it, so the
       eight members that would cost bought nothing), the four slotted roller
       arms, the side drive belt and pulleys, and every sensor. Four ultrasonic
       cans, two infrared and two bumper switches are eight small objects on
       the rim of the machine, which is the repeated-small-features failure -
       they would read as a rash, not as a sensor fit.

       Built nose-left. The viewer rests at 0.21pi, which shows the -x side, so
       the belt, the ramp and the raised end of the tray are all on -x and the
       tail is what spends the slow turn round the back.

       Box is 2.44 wide x 4.05 long x 2.16 tall. Width/length is 0.603, which
       is the rover's 0.595 and well inside the 0.65 ceiling; the fitted
       diagonal is FIT_SIZE * sqrt(1 + 0.603^2) = 5.137, between the rover's
       5.13 and MAPSY's 5.15, so it cannot swing wider than the viewport
       part-way round the turn the way a model chunky in two axes at once
       does. The height is free - fitModel only normalises the longest axis,
       which is the 4.05 length, and height never rotates into the camera - so
       the tray could be tipped as far as it needed to be without costing
       anything on screen. It fits to 2.35 tall, against MAPSY's 2.63. */

    const FLOOR = -1.00;

    /* Chassis. The real one is an open rectangular ladder - side rails, cross
       members, a gearbox cage at the rear corner, holes everywhere. All of
       that is under the part container, which covers it, so it is one slab:
       3.10 long, 0.36 thick, sitting 0.24 clear of the floor. Thin enough that
       the wheels stand proud of it the way they do in the rear view, thick
       enough not to turn into a line when the spin takes it edge-on. */
    g.add(place(shell(new THREE.BoxGeometry(3.10, 0.36, 2.00)), 0.20, -0.58, 0));

    /* The ramp: a wedge, thin at the lip and 0.26 thick where it meets the
       chassis, hinged on the mount crossbeam at the front third so the leading
       edge stays flush to the floor as the machine drives. Drawn as a profile
       rather than as an inclined box because the part drawing is a wedge and
       because a 0.16 plate seen at a glancing angle is a bright line and
       nothing else - the report's own figure is a plate that tapers to a point.

       Its lip is at y -1.00, which is the floor, and the wheels and the lip
       are the only things that touch it. The top face climbs 0.62 over 1.50,
       so 22.5 degrees - shallower than the belt above it, which is what opens
       the throat out towards the back instead of pinching it shut.

       1.92 wide against the belt's 1.64. On the real machine the ramp, the
       rollers and the belt are all the same width, 172 mm. Here the ramp is
       wider on purpose: equal widths put two inclined masses in exactly the
       same plan outline and they merged into one wedge from above and from
       the nose, so the 0.14 of ramp showing each side of the belt is the only
       thing that says these are two parts and that one runs over the other. */
    g.add(shell(extrude([
        [-1.95, FLOOR], [-0.45, -0.38], [-0.45, -0.64]
    ], 1.92)));

    /* The belt, and the part that names the machine. A loop of thick shag
       carpet round two 15 mm rollers - so in side view it is a stadium, two
       circles and the two tangents between them, which is one profile rather
       than a slab plus two cylinders. Drawn as ten points: four 45 degree
       facets round each roller end and a straight run along each side. Forty
       five degrees clears the 25 degree edge test comfortably, so both ends
       carry their facet lines and read as something wrapped round a roller;
       a smooth arc would have come out as an unlined dark blob among lined
       parts, which is the failure a lathe or a cone gives you here.

       Rollers at (-2.00, -0.58) and (-0.46, 0.12), belt half-thickness 0.30.
       That puts the lowest point of the loop at -0.86, which is 0.14 above the
       floor and 0.33 ahead of the ramp's lip - the report is specific that the
       lead edge of the belt extends forward over the floor beyond the end of
       the ramp, and that overhang is what makes the nose read as reaching for
       something rather than as a bumper. The gap to the ramp below opens from
       0.12 at the lip to 0.18 at the crossbeam: a throat, and the one place on
       the model where daylight means a mechanism.

       Accent, with the tray. These two are the machine and everything else is
       the trolley they are carried on. */
    const A = [-2.00, -0.58], B = [-0.46, 0.12], R = 0.30;
    const axis = Math.atan2(B[1] - A[1], B[0] - A[0]) + Math.PI / 2;
    const loop = [];
    [A, B].forEach((c, end) => {
        for (let i = 0; i <= 4; i++) {
            const a = axis + end * Math.PI + i * Math.PI / 4;
            loop.push([c[0] + Math.cos(a) * R, c[1] + Math.sin(a) * R]);
        }
    });
    g.add(shell(extrude(loop, 1.64), ACCENT));

    /* The part container, caught mid-tip. A flat platform with low walls on
       the real machine; here one slab, because four walls 0.08 thick is four
       parts spent on something that is a hairline at ring size.

       Tipped 30 degrees with the front end up, which is the direction the lift
       works: the short links swing further than the long ones through the
       36/60 tooth gear pair, so the tray is dragged backwards along its slot
       joint as it rises and then tips off the back into the bins. A turn in
       the rz slot of place() is a sideways tip rather than a spin about the
       part's own axis, which is exactly what is wanted - and the sign matters,
       because rz sends +x towards +y, so a positive angle would raise the tail
       and pour the parts over the ramp. It is -0.52.

       Centred at x 0.72 so the low end finishes at 1.77, a hair past the back
       of the chassis at 1.75, which is where the report puts it at full
       extension; the raised end reaches y 1.16 and hangs out over the back of
       the belt. It is the tallest thing on the model and it cost nothing. */
    g.add(place(shell(new THREE.BoxGeometry(2.30, 0.20, 1.90), ACCENT),
        0.72, 0.50, 0, 0, 0, -0.52));

    /* The two lift links, in the wedge of daylight the tipped tray opens up.
       Long link forward, short link aft, both leaning back at 0.26 - the
       proportions off the Lift Mechanism figure, where the pair are plainly
       different lengths and that difference is the whole trick. Centred on z
       rather than doubled either side: a pair each side is four parts for a
       detail that, from the rest angle, is behind a 0.52 wheel anyway.

       Both run a little way into the tray and into the chassis at their ends,
       so they read as pinned rather than as two sticks balanced in a gap. */
    g.add(place(shell(new THREE.BoxGeometry(0.22, 1.06, 0.26)), 0.32, 0.08, 0, 0, 0, -0.26));
    g.add(place(shell(new THREE.BoxGeometry(0.20, 0.62, 0.24)), 1.06, -0.14, 0, 0, 0, -0.26));

    /* Drive wheels. 0.52 radius against the 0.36 chassis, so two fifths of
       each one stands above the deck the way the rear view shows, and
       they are the widest thing on the model at 1.22 a side - they set the
       2.44 and therefore the plan ratio. Ten sides: 36 degree facets, so they
       are lined across the tread instead of coming out as dark discs.

       At x 0.10, which is the middle of the chassis rather than the middle of
       the whole machine. The report centres them on the length of the device
       so it can rotate on the spot, but the nose that reaches the floor is
       0.9 of overhang in front of the chassis, and putting the wheels at the
       middle of that drags them forward under the ramp where they look like
       they are holding the belt up. */
    [-1.08, 1.08].forEach(z => {
        g.add(place(shell(new THREE.CylinderGeometry(0.52, 0.52, 0.28, 10)),
            0.10, -0.48, z, Math.PI / 2, 0, 0));
    });

    /* The caster, at the rear centre. Small, and most of it is up inside the
       chassis - only 0.24 of it shows below the slab, which is all a caster
       ever shows. It earns the part because the three-point stance is a
       decision the report defends at length (two driven wheels to keep the
       mass down, one idler to carry a rear-biased centre of gravity), and
       because a fourth corner wheel is the first thing that would make this
       read as the generic rover again. Eight sides, not ten: it is a little
       over half the radius of a drive wheel, and at that size ten facets stop
       resolving and come back as a smudge.

       At x 1.46 rather than the 1.54 it was first given, so its rim finishes
       at 1.74 and stays inside the chassis. A caster trailing past the tail is
       what a caster does, but it was setting the back of the bounding box by
       0.05 - and the length is the axis fitModel normalises on, so a detail
       part was quietly deciding the scale of the whole model. */
    g.add(place(shell(new THREE.CylinderGeometry(0.28, 0.28, 0.18, 8)),
        1.46, -0.72, 0, Math.PI / 2, 0, 0));

    /* MSEduino and the 7.4V battery, as one block on the deck just behind the
       crossbeam. The only mark colour on the model, and it is spent here for
       the same reason MAPSY's deck stack was: the tipped tray opens a wedge of
       empty dark air almost a unit deep over the chassis, and a bright chip is
       what stops that being a hole. It is also the honest answer to where the
       electronics live - the report is explicit that the height limit forced
       the board, the battery and the linkage down inside the chassis and under
       the container, out of sight.

       It has to stand 0.86 tall to be worth drawing at all, and that number
       was found twice rather than chosen. At 0.34, lying flat on the deck the
       way the real board does, it was inside the drive wheel's own x range
       from -0.40 to 0.60 and below the wheel's crown at 0.04, so through most
       of the turn there was a 0.52 octagon parked directly in front of it and
       the mark colour showed as a magenta hairline or not at all - the same
       part spent for nothing that MAPSY's camera bar was before it was raised
       above the tanks. Taking it to 0.74 cleared the wheels and brought it
       back at the two side-on views, and still left it covered at the rest
       angle, because the belt crowns at 0.40 and the belt is what stands
       between the deck and the camera at 0.21pi. 0.86 puts the top at 0.46,
       just over the belt, which is the height that buys the one view the card
       actually sits on. Checked by shooting nine angles through the turn, not
       by reasoning about it - the first two heights both looked fine in the
       side elevation this was drawn in.

       Threaded between the three things that share that deck: forward of the
       belt's rear end at -0.179, and pushed out to z -0.47 so it misses the
       forward lift link, which is 0.26 wide on the centreline. Off-centre also
       means the spin carries it across the gap rather than parking it dead
       middle, and it is on the -z side with the board and battery bay that the
       chassis drawing puts at the rear left. */
    g.add(place(shell(new THREE.BoxGeometry(0.60, 0.86, 0.66), MARK), 0.16, 0.03, -0.47));
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
    /* Fewer, chunkier teeth again. Eighteen and fourteen turned the rims into
       a band of flicker; ten and eight fixed that at ring size but came back
       as a texture on a phone card. Eight and six, on fatter teeth, is the
       first pair that still reads as two meshing gears at 140px. */
    g.add(place(gear(1.3, 0.42, 8, LINE), -0.85, -0.45, 0, 0.32, 0, 0));
    // Bevel gear stood upright, meeting the first one at ninety degrees.
    g.add(place(gear(0.95, 0.38, 6, ACCENT), 0.95, 0.45, 0, Math.PI / 2, 0, 0));
    /* The stub shaft is gone. At thumbnail size it was a two-pixel stripe
       lying across the driven gear, and it was the tallest thing in the
       bounding box - so dropping it both removes the smudge and lets
       fitModel scale the two gears up into the room it was holding. */
    return g;
}

export function buildPipeline() {
    const g = new THREE.Group();
    /* Three stages: in -> transform -> out. Bigger and closer together than
       they were, because the two thin rods that used to wire them up are
       gone - at 0.07 radius they were barely a pixel on a phone and read as
       dirt between the boxes. Three blocks stepping up in a line says
       "pipeline" without needing the connectors drawn. */
    const colors = [ACCENT, LINE, MARK];
    for (let i = 0; i < 3; i++) {
        g.add(place(shell(new THREE.BoxGeometry(1.45, 1.45, 1.45), colors[i]),
            (i - 1) * 1.85, (i - 1) * 0.62, 0, 0.3, 0.5, 0));
    }
    /* A torus looping back over the top: the automation feeding itself.
       Fatter tube and fewer segments round it - a 0.1 tube at 20 segments was
       a hairline drawn in a hundred short strokes, which at thumbnail size is
       a grey smear rather than a ring. */
    g.add(place(shell(new THREE.TorusGeometry(1.6, 0.17, 5, 14), LINE), 0, 1.6, 0, Math.PI / 2.2, 0, 0));
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

export function buildMapsy() {
    const g = new THREE.Group();
    /* MAPSY is not a crawler. It is a submersible that swims: two big ballast
       tanks carried high over an open PVC cage, four teardrop thruster pods
       slung at the corners and a wide flat vacuum mouth across the nose. The
       thing it replaced here - a closed box hull with a brush roller and two
       drive wheels - was a different machine entirely. Nothing on the real one
       rolls, and this pass is about making sure nothing on the model looks
       like it does either.

       Second fidelity pass, against lab/img/mapsy/final-design-iso.jpg. The
       first rebuild had the right parts in the right places and still read
       wrong in two ways, both of which are about silhouette rather than
       inventory:

         The corner pods were CylinderGeometry drums. A short fat cylinder on
         the fore-aft axis is a duct seen from the side, which is what they
         were meant to be - but it is also exactly a wheel seen from the side,
         and four of them at the corners of a frame is a rover no matter what
         is sitting on top. They are lathed teardrops now (below).

         The frame was two horizontal rails plus a tail cross pipe, all at one
         height. That is a sled. The render is a tall open cage: corner
         uprights carrying rails top and bottom, with the tanks riding on the
         top rails and daylight the full length between tank belly and bottom
         rail. Height is the thing that stops it being a flat chassis with
         cargo on it.

       Sixteen parts, against eleven before and the ten this file usually
       holds to. The overrun is bought with the two things above and nothing
       else. Four pods are the corners of the silhouette and cannot be three.
       The cage is eight members - two bottom rails, two top rails, four
       uprights - and every one of them is load-bearing on the read: drop the
       top rails and the tanks float on two posts; drop the uprights and it is
       the old sled again. It cost nothing to close the tail, because the two
       rear uprights and the rails they join already make a portal there, so
       the old tail cross pipe is gone. The camera bar and the render's dark
       deck cluster merged into one part rather than two - same chip of mark
       colour in the trough between the tanks, now reading as the equipment
       stack it is on the real machine.

       It is built nose-left. The viewer rests at 0.21pi, which shows the -x
       side, so anything on +x spends most of the slow turn round the back.
       The intake stays on -x; so does the bulbous end of every pod, which is
       the half of the teardrop worth seeing.

       Stylised narrower than the real robot, deliberately, and the height
       added here had to be paid for in plan. fitModel only normalises the
       LONGEST axis, so a model chunky in two axes at once carries a plan
       diagonal far wider than the FIT_SIZE it was fitted to, and the spin
       swings that diagonal across the camera once a revolution - cropped at
       both ends for most of every turn, while every assertion still passes,
       because litPct goes up when a model overflows. New box is 2.58 wide x
       4.23 long x 2.35 tall. Width/length is 0.610, against 0.613 before and
       the rover's 0.595, and since the fitted diagonal is just
       FIT_SIZE * sqrt(1 + ratio^2) it lands at 5.154 - a hair tighter than the
       5.17 it was, and beside the rover's 5.12. Height fits to 2.447, which is
       the rover's 2.426, so the cage got taller without the model getting
       bigger on screen: the length grew with it.

       The tank-to-pod size ratio is doing more work than it looks. A first
       cut had 0.44 tanks against 0.37 thrusters, and because there are four
       pods and only two tanks, the corners outweighed the top: the model read
       as a heap of six similar drums rather than as two tanks carried over
       four pods. 0.50 against 0.35, roughly 8:5, is what separates them - the
       same proportion the render has, and it survives the pods changing
       shape. */

    /* The two ballast tanks, and the whole reason the machine is
       recognisable. Big, teal, lying fore-and-aft, side by side with a slot
       of daylight between them, and now riding on top of the cage rather than
       sitting in it. They are the top of the silhouette from every angle.

       Ten sides, not sixteen. Edge lines are only drawn where two faces meet
       at more than 25 degrees, so a sixteen-sided tube (22.5 a facet) comes
       out as an unlined dark mass among lined parts - the smooth-cone
       failure. Ten gives 36 degree facets, so the tanks are fluted down their
       length and read as cylinders rather than as two dark lozenges.

       y of 1.054 is not arbitrary: the top rails run at z +-0.78 with a 0.16
       radius, so their crowns are at 0.58, and a 0.50 tank centred on z +-0.62
       meets that height exactly 0.16 off its own axis. The tanks rest on the
       rails instead of floating above them or sinking through. */
    [-0.62, 0.62].forEach(z => {
        g.add(place(shell(new THREE.CylinderGeometry(0.50, 0.50, 2.50, 10), ACCENT),
            0.12, 1.054, z, 0, 0, Math.PI / 2));
    });

    /* The four thruster pods, and the fix this pass exists for. In the render
       they are ovoids: a blunt rounded dome at the front swelling to a
       shoulder a third of the way back, then a long taper to a point at the
       tail. A lathe is the one primitive that gives that in a single part -
       nine profile points turned about the fore-aft axis - and the shape has
       no circular side view at any angle, which is the whole point. A drum
       has one, and four drums at the corners of a frame read as wheels
       however the rest of the model is dressed.

       Eight segments round, not twenty. A smooth surface has no edge that
       passes the 25 degree test and renders as an unlined dark blob among
       lined parts; eight gives 45 degree facets, so each pod carries eight
       meridian lines running nose to tail. Those lines do as much work as the
       outline does - they run along the body, so they say "pod" rather than
       "disc" even where the silhouette is foreshortened.

       The profile reaches full radius a quarter of the way back and then
       tapers for the remaining three quarters. A first cut put the shoulder
       at the middle and the pod came out a lemon - tapered at both ends,
       symmetrical, no telling which way it faced. Blunt in front and long
       behind is what makes it read as something pointed into the water.

       That shaping also places two circumferential rings in the front third
       (70 to 41 degrees at the first joint, 41 to 13 at the second, both over
       the threshold) and none in the back two thirds, which is the seam the
       render's pods have. More rings would have banded the body into a stack
       of discs, which is the failure mode this part is escaping.

       Dome on -x, point on +x, same orientation on all four: the bulbous end
       faces the viewer's rest angle, and the taper runs away round the back
       where it is read as depth rather than as detail. The rz slot of place()
       is a sideways tip, not a spin about the part's own axis - which for a
       surface of revolution is exactly what is wanted here, since -PI/2 lays
       the lathe's Y axis down onto world +x. */
    const POD = [
        [0.000, -0.62], [0.215, -0.540], [0.312, -0.430], [0.350, -0.270],
        [0.348, -0.080], [0.325, 0.140], [0.255, 0.380], [0.145, 0.570],
        [0.000, 0.700]
    ].map(([r, y]) => new THREE.Vector2(r, y));
    /* Fore and aft pairs set 0.30 apart. At 0.12 the four of them ran into one
       another from side on and read as one lumpy mass under the frame rather
       than as four pods, which is most of the way back to the problem this
       part was redrawn to fix. */
    [-0.62, 1.00].forEach(x => {
        [-0.94, 0.94].forEach(z => {
            g.add(place(shell(new THREE.LatheGeometry(POD, 8), ACCENT),
                x, -0.48, z, 0, 0, -Math.PI / 2));
        });
    });

    /* The PVC cage. A faithful plumbing diagram - every rail, elbow, tee and
       union - would be a thicket of thin rods, and at 0.1 radius each one is
       a smudge rather than a pipe. So it is the fewest, chunkiest members
       that still read as a skeleton with height in it: a long rail at each
       corner of the plan, twice over at two heights, and four uprights
       joining them. Eight sides each, so the 45 degree facets outline and
       they read as pipe rather than as wire.

       Bottom rails at y -0.48 and top rails at y 0.42 put 0.90 of clear air
       between them, which is more than the 0.68 the bottom rail and the pods
       occupy together - so from side on the open middle of the cage is the
       biggest single thing in the silhouette after the tanks. That gap is the
       daylight the render has under the tanks and the old flat frame had
       nowhere to put. */
    [-0.48, 0.42].forEach(y => {
        [-0.78, 0.78].forEach(z => {
            g.add(place(shell(new THREE.CylinderGeometry(0.16, 0.16, 3.61, 8)),
                0.105, y, z, 0, 0, Math.PI / 2));
        });
    });
    /* The uprights, set at -1.55 and 1.75 so they land near the ends of the
       rails rather than under the tanks - which is where the render puts
       them, and which leaves the tank spans visibly unsupported in the middle
       the way a real pair of saddles would. The 0.15 of rail left proud
       beyond each one reads as the stub past an elbow. 0.15 rather than 0.16
       radius so an upright crossing a rail still shows the rail's line. */
    [-1.55, 1.75].forEach(x => {
        [-0.78, 0.78].forEach(z => {
            g.add(place(shell(new THREE.CylinderGeometry(0.15, 0.15, 0.90, 8)),
                x, -0.03, z));
        });
    });

    /* The vacuum intake: wide, flat, flared, and projecting off the nose. Over
       five times as wide as it is tall, which is the proportion that says
       "mouth" rather than "bumper". 2.16 across against the cage's 1.88, so it
       overhangs the rails by 0.14 a side - the render's scoop is noticeably
       wider than the frame it is bolted to, and that overhang is most of what
       distinguishes it from a front bumper at this size.

       It is deliberately not as wide as the pods, which reach 2.58. A first
       cut had the scoop at 2.34 and from dead nose-on it covered all four of
       them, so the one view that should show the pods standing outboard of
       everything showed a plain slab instead. The cage and the tanks came in
       0.06 and 0.04 a side to pay for it, which costs the plan nothing: the
       pods were already the widest thing on the model and still set the
       2.58, so the width/length ratio and the fitted diagonal are untouched.
       It still doubles as
       the cage's front closure, its back face biting 0.18 into both bottom
       rails, which is both what the real one does and how the part count is
       not seventeen. Left in the line colour because it is white on the real
       machine and because the teal is spoken for: tanks and pods are the
       accent, and a third accent mass would flatten them.

       A box was the obvious shape and read as a slab bolted to the nose. The
       render's is a horn that opens out, so this is a four-sided frustum -
       the only primitive here that tapers - turned flat-side up with a
       thetaStart of PI/4, then scaled out of square. Scale is applied inside
       the part's own frame before the rotation, so the two factors are on
       local x and z (height and width) while local y stays the 0.80 length.
       Every facet of a square frustum meets its neighbour at ninety degrees
       whatever it is scaled to, so the outline survives the stretch; only the
       shading is slightly off, which on a flat white part nobody reads. */
    const scoop = shell(new THREE.CylinderGeometry(0.30, 0.20, 0.80, 4, 1, false, Math.PI / 4));
    scoop.scale.set(1.037, 1, 5.092);
    g.add(place(scoop, -1.92, -0.26, 0, 0, 0, Math.PI / 2));

    /* The deck equipment stack, in the trough between the tanks - the render's
       dark cluster of housings and the camera bar, taken as one part rather
       than as two small ones that would have fought each other at this size.
       The only mark colour on the model, which is what buys it the space: at
       ring size it is a bright chip in the dark valley between two big teal
       drums, and that valley is otherwise the one place where nothing
       happens. It is also the autonomy - the vision that picks the debris out
       is the A in MAPSY - so if a single small part is going to carry a
       colour, this is the one worth spending it on.

       Proud in both axes it is seen in. 0.46 wide against the 0.24 trough, so
       it bridges the two tanks rather than sinking between them, and tall
       enough to clear the tank crowns by 0.18 - at 0.54 it sat entirely below
       them and was invisible from every angle the slow spin passes through,
       which is a part spent for nothing. Standing over the tanks it also
       splits them: from three quarters on, two teal drums 0.32 apart merge
       into one mass, and a bright block in the gap is what keeps them two.

       It is the only thing on the model that sets the overall height, and
       that is affordable in a way plan size is not. fitModel scales on the
       longest axis, which is the 4.23 length, so height neither changes the
       scale nor rotates into the camera - it fills 2.63 of the 5.5 units the
       viewport covers and cannot crop. The plan diagonal is the one that
       swings, and this part does not touch it. */
    g.add(place(shell(new THREE.BoxGeometry(0.85, 0.90, 0.46), MARK), 0.15, 1.25, 0));
    return g;
}

export function buildOtherArrow() {
    const g = new THREE.Group();
    /* The Other Projects card, and the one model here that is not a thing
       being built. Any of the three real models - door lock, gearbox, pile of
       scripts - would have quietly claimed the shared card for that one
       project, and the cube stack this started as was a stand-in for all
       three. His call was to drop the cubes and keep only the arrow, which
       stops it pretending to be an object at all: it is a pointer, down at the
       three project cards sitting under the ring.

       Four sides on the head rather than a round cone. Every facet then meets
       its neighbour at ninety degrees, so the whole head is outlined; a smooth
       cone has no edge that passes the 25 degree test and renders as an
       unlined dark blob among lined parts. */
    const arrow = new THREE.Group();
    arrow.add(place(shell(new THREE.BoxGeometry(0.30, 1.50, 0.30), MARK), 0, 0.85, 0));
    // rx only. An extra turn in the rz slot does not spin the head about its
    // own axis, it tips the whole thing sideways, and the arrow stops pointing
    // anywhere in particular.
    arrow.add(place(shell(new THREE.ConeGeometry(0.62, 1.00, 4), MARK), 0, -0.40, 0, Math.PI, 0, 0));
    g.add(arrow);

    /* The bounce. Exposed as a function on the group rather than run from a
       timer in here: viewer.js already has the only frame loop on the page, so
       it calls this once per frame and nothing else has to keep time. `bob` is
       hung on userData too, so a headless check can prove the arrow moves
       without having to read pixels.

       Amplitude is in model units, applied after fitModel has scaled the
       group, so it has to stay inside the 20% of margin the camera leaves
       around a fitted model. The arrow is 2.5 units tall and fits to 4.4, so
       0.22 here lands at about 0.39 on a 0.44 margin - slight, and it does not
       clip at the top of the swing. Grow the arrow and this can grow with it;
       shrink the arrow without shrinking this and it will. */
    const restY = arrow.position.y;
    g.userData.bob = arrow;
    g.userData.animate = (t) => {
        arrow.position.y = restY + Math.sin(t * 2.6) * 0.22;
    };
    return g;
}

export const MODELS = {
    rfid: buildDoorLock,
    manipulator: buildManipulator,
    tyler: buildTyler,
    drill: buildGearbox,
    python: buildPipeline,
    hexapod: buildHexapod,
    mapsy: buildMapsy,
    other: buildOtherArrow
};
