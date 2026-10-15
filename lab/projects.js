/* The projects the orbit carries. Presentation lives in orbit.js; this file is
   only what is being presented. */
export const PROJECTS = [
    {
        id: 'rfid',
        name: 'RFID Door Lock',
        blurb: 'RFID door lock mechanism with a backup keypad, built for work and residential doors. Reader, controller and a fail-safe entry path in one enclosure.',
        tags: ['C', 'Embedded', 'RFID'],
        url: 'https://github.com/awanabad/RFID-Door-Lock'
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
