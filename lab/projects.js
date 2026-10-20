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
        blurb: 'Six-legged walker about 270 mm across, three body-mounted servos per leg driving lightweight printed links. M3 bolts run as axles through 623ZZ bearings; one leg has to walk before the other five get built.',
        tags: ['Robotics', 'CAD', '3D Printing'],
        // In progress, so there is no repo to send anyone to - the build log is
        // the thing worth reading instead.
        log: 'hexapod.html'
    },
    /* Second seat, his call - straight after the build in progress rather than
       at the back of the queue. */
    {
        id: 'mapsy',
        name: 'MAPSY — Pool Cleaner',
        blurb: 'Mobile Autonomous Pool Cleaner built at Western University: one robot doing four jobs, everything from vacuuming to chemical dosing. Sensors and propulsion written in C/C++, an image detection system in MATLAB, and the Innovative Design Prize at the Western Engineering Competition.',
        tags: ['C/C++', 'MATLAB', 'Autonomous'],
        /* No url: there is no repo for this one, so show() renders no 'View
           code' button. `page` rather than `log` because the project is
           finished - the hexapod's log is a dated diary that grows, this is a
           write-up of something that already happened, and show() words both
           the sticker and the panel button differently for each. */
        page: 'mapsy.html'
    },
    {
        id: 'manipulator',
        name: 'Cylinder Painting Manipulator',
        blurb: 'A 3-DOF articulated manipulator for coating gas cylinders in a plant. Kinematics worked out in MATLAB, then driven through the full coating envelope.',
        tags: ['MATLAB', 'Robotics', 'Kinematics'],
        url: 'https://github.com/awanabad/Cylinder-Painting-Manipulator'
    },
    {
        id: 'tyler',
        name: 'Tyler v2 — Part Collector',
        blurb: 'Revision of an autonomous part collector, rebuilt around a systematic sensor and actuator selection process instead of whatever was in the parts bin.',
        tags: ['C++', 'Autonomous', 'Controls'],
        url: 'https://github.com/awanabad/Tyler-Version-2'
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
