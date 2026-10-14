/* Shared project data for the three prototypes, so they're compared on
   presentation alone and not on different content. */
export const PROJECTS = [
    {
        id: 'rfid',
        name: 'RFID Door Lock',
        blurb: 'RFID door lock mechanism with a backup keypad, built for work and residential doors. Reader, controller and a fail-safe entry path in one enclosure.',
        tags: ['C', 'Embedded', 'RFID'],
        url: 'https://github.com/awanabad/RFID-Door-Lock',
        // Position on the constellation canvas, 0-1 of the field.
        at: { x: 0.14, y: 0.26 }
    },
    {
        id: 'manipulator',
        name: 'Cylinder Painting Manipulator',
        blurb: 'A 3-DOF articulated manipulator for coating gas cylinders in a plant. Kinematics worked out in MATLAB, then driven through the full coating envelope.',
        tags: ['MATLAB', 'Robotics', 'Kinematics'],
        url: 'https://github.com/awanabad/Cylinder-Painting-Manipulator',
        at: { x: 0.34, y: 0.72 }
    },
    {
        id: 'tyler',
        name: 'Tyler v2 — Part Collector',
        blurb: 'Revision of an autonomous part collector, rebuilt around a systematic sensor and actuator selection process instead of whatever was in the parts bin.',
        tags: ['C++', 'Autonomous', 'Controls'],
        url: 'https://github.com/awanabad/Tyler-Version-2',
        at: { x: 0.55, y: 0.34 }
    },
    {
        id: 'drill',
        name: 'Electric Angle Drill',
        blurb: 'Machine component design of a gearbox built from a bevel and a helical gear. Sized for load, then checked against the failure modes that actually bite.',
        tags: ['MATLAB', 'CAD', 'Mech Design'],
        url: 'https://github.com/awanabad/Electric-Angle-Drill-Design',
        at: { x: 0.74, y: 0.70 }
    },
    {
        id: 'python',
        name: 'Python Automation Scripts',
        blurb: 'The pile of Python that quietly removes repetitive work from the day. Less a project, more an ongoing refusal to do the same thing twice.',
        tags: ['Python', 'Automation', 'Tooling'],
        url: 'https://github.com/awanabad/PythonAutomationScripts',
        at: { x: 0.86, y: 0.16 }
    }
];

/* Which stars are joined, as index pairs - a constellation needs a shape,
   and connecting every node to every other turns it into a mesh. */
export const LINKS = [[0, 1], [1, 2], [2, 3], [3, 4], [2, 4]];
