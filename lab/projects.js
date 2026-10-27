/* The projects the orbit carries. Presentation lives in orbit.js; this file is
   only what is being presented.

   Two lists, one ring, one page. PROJECTS are the builds that get their own
   seat on the ring; OTHER are the three that are not robots and share a single
   seat. Selecting that seat puts OTHER on screen as a row of CAD boxes under
   the ring - there is no separate page for them any more, which is what he
   asked for: everything lives on orbit.html. */

/* Order is the ring's order, clockwise from the front: the first entry is what
   the page opens on, and `other` is always the last seat because it is the door
   out rather than a project. Everything between those two is his call on what
   should be seen first. */
export const PROJECTS = [
    // First in the list is first at the front of the ring, so the current build
    // is what the page opens on.
    {
        id: 'hexapod',
        name: 'Hexapod Robot',
        blurb: 'I am building a six-legged walker about 270 mm across: three body-mounted servos per leg driving lightweight printed links, with the knee driven from the hip through a four-bar rather than a servo at the joint. M3 bolts run as axles through 623ZZ bearings. One leg has to walk before the other five get built.',
        tags: ['Robotics', 'CAD', '3D Printing'],
        // In progress, so there is no repo to send anyone to - the build log is
        // the thing worth reading instead.
        log: 'hexapod.html'
    },
    /* Second seat, moved up from third on 2026-10-27 at his word (it came up
       from fifth to third earlier the same day). The only employer project on
       the ring and the only one with no repo at all - so its panel carries the
       CAD button and nothing else. Professional humanoid hardware now opens the
       rotation straight after the build in progress, ahead of the capstone.

       Scope, because it is the one entry on the ring where the honest claim is
       narrower than the machine: his work was the LEFT chest plate - its
       mechanical design, its code and its assembly - not the indicator as a
       whole, not the chest, and not Phoenix. The blurb says "left chest plate"
       on purpose and the word should not quietly come out again. */
    {
        id: 'ledchest',
        name: 'LED Chest Plate Indicator',
        blurb: 'I designed and integrated the left chest plate of the LED state indicator on Phoenix, the humanoid robot prototype at Sanctuary AI: I modelled that plate in CAD around its LED strip, printed thin-wall diffusers so it reads as a lit panel rather than a row of dots, and a small controller running Python turns a mode command into colour. The robot carrying it was later covered by Bloomberg.',
        tags: ['CAD', 'Embedded', 'Integration'],
        page: 'ledchest.html'
    },
    /* Third seat, down one from second on 2026-10-27 to let the employer
       project in ahead of it. Still the capstone, and still ahead of the two
       older university builds. */
    {
        id: 'mapsy',
        name: 'MAPSY — Pool Cleaner',
        blurb: 'I designed a pool cleaner that did all four jobs instead of one — skim, vacuum, chlorinate, hold pH — for my final year at Western University. Debris detection in MATLAB, sensors and propulsion in C/C++, ballast and thrust sized from the drag numbers, FEA on every subassembly. It took the Innovative Design Prize at the Western Engineering Competition.',
        tags: ['C/C++', 'MATLAB', 'Autonomous'],
        /* No url: there is no repo for this one, so show() renders no 'View
           code' button. `page` rather than `log` because the project is
           finished - the hexapod's log is a dated diary that grows, this is a
           write-up of something that already happened, and show() words the
           panel button differently for each. */
        page: 'mapsy.html'
    },
    {
        id: 'manipulator',
        name: 'Cylinder Painting Manipulator',
        blurb: 'I worked out the kinematics for a 3-DOF articulated manipulator that coats gas cylinders in a plant — modelled in MATLAB, then driven through the full coating envelope.',
        tags: ['MATLAB', 'Robotics', 'Kinematics'],
        url: 'https://github.com/awanabad/Cylinder-Painting-Manipulator'
    },
    {
        id: 'tyler',
        name: 'Tyler v2 — Part Collector',
        /* His wording, less the plural: "our mechatronics systems lab" became
           "the", because `we`/`our`/`us` are barred across his portfolio - the
           plural implies the collaborators the names were removed to avoid.
           One word back if he ever wants it. The v1 report is folded in here
           rather than given a project of its own, which was his call. */
        /* Kept to roughly the length of the blurb it replaced on purpose: this
           is the one card with two buttons, so its panel is the tallest on the
           ring and the box is sized to it. probe.js fails the moment the panel
           stops ending level with the box - an earlier, fuller version of this
           blurb ran it 84px over. */
        blurb: 'I built a robot that sweeps the mechatronics lab at Western University for dropped hardware and carries it back to a charging station to tip out: a belt-and-ramp pickup under a measured 14 cm ceiling, ultrasonic and bumper obstacle avoidance, infrared homing every 90 s. It collected parts; docking never got reliable.',
        tags: ['C++', 'Autonomous', 'Controls'],
        url: 'https://github.com/awanabad/Tyler-Version-2',
        /* Both keys on purpose, and the only entry carrying both: `url` puts
           'View code' in the panel for the repo, `page` puts 'View project
           CADs' beside it. show() builds that link row from whichever keys it
           finds, so the two appear together with no special case. */
        page: 'tyler.html'
    },
    /* Last seat on the ring, and the only one that is a door rather than a
       project: it carries no repo of its own, just the page the three below
       are laid out on. Its model is a placeholder heap of cubes on purpose -
       see buildOtherStack in models.js. */
    {
        id: 'other',
        name: 'Other Projects',
        blurb: 'Three builds with no legs or wheels on them: an RFID door lock, a bevel-and-helical gearbox, and the pile of Python that keeps the day from repeating itself. They share one seat on the ring and have a page of their own.',
        /* No url, no log and no page of its own. orbit.js matches its id in
           COLLECTIONS and puts the three below as CAD boxes, each linking
           straight to that project's code - so this card needs nothing to
           point at itself. Its tags and blurb are unused while the boxes are
           showing (they replace the detail panel) and kept only so the card
           still describes itself if that ever changes. */
        tags: ['Embedded', 'Mech Design', 'Python']
    }
];

export const OTHER = [
    {
        id: 'rfid',
        name: 'RFID Door Lock',
        blurb: 'RFID door lock mechanism with a backup keypad, built for work and residential doors. Reader, controller and a fail-safe entry path in one enclosure.',
        tags: ['C', 'Embedded', 'RFID'],
        url: 'https://github.com/awanabad/RFID-Door-Lock'
    },
    {
        id: 'drill',
        name: 'Electric Angle Drill',
        blurb: 'Machine component design of a gearbox built from a bevel and a helical gear. Sized for load, then checked against the failure modes that actually bite.',
        tags: ['MATLAB', 'CAD', 'Mech Design'],
        url: 'https://github.com/awanabad/Electric-Angle-Drill-Design'
    },
    {
        id: 'python',
        name: 'Python Automation Scripts',
        blurb: 'The pile of Python that quietly removes repetitive work from the day. Less a project, more an ongoing refusal to do the same thing twice.',
        tags: ['Python', 'Automation', 'Tooling'],
        url: 'https://github.com/awanabad/PythonAutomationScripts'
    }
];
