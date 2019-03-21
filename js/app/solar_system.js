/**
 * @module SolarSystem
 */
define(['astronomical_object'], function (AstronomicalObject) {

    var galaxy = new AstronomicalObject({
        name:          'Galaxy',
        origin:        [0, 0, 0],
        radius:        6000000,
        texture:       'textures/galaxy.jpg',
        spins:         false
    });

    var theSun = new AstronomicalObject({
        name:          'Sun',
        origin:        [0, 0, 0],
        spinPeriod:    29,
        radius:        432500,
        axis:          7.25,
        texture:       'textures/sunmap.jpg',
        useLighting:   false
    });

    var mercury = new AstronomicalObject({
        name:          'Mercury',
        orbits:        theSun,
        orbitDistance: 36000000,    // distance in miles from the object we're orbiting
        orbitalPeriod: 87.66,       // number of Earth days required to make a full orbit
        spinPeriod:    58.65,       // number of Earth days required to spin once on its axis
        radius:        1516,        // radius in miles
        axis:          0,           // axial tilt (in degrees)
        texture:       'textures/mercurymap.jpg',
        shortcutKey:   '1'
    });

    var venus = new AstronomicalObject({
        name:           'Venus',
        orbits:         theSun,
        orbitDistance:  67000000,
        orbitalPeriod:  226.46,
        spinPeriod:     243,
        spinsClockwise: true,
        radius:         3761,
        axis:           177.36,
        texture:        'textures/venusmap.jpg',
        shortcutKey:    '2'
    });

    var earth = new AstronomicalObject({
        name:            'Earth',
        orbits:          theSun,
        orbitDistance:   93000000,
        orbitalPeriod:   365.25,
        spinPeriod:      1,
        radius:          3959,
        axis:            23.45,
        texture:         'textures/earthmap1k.jpg',
        specularTexture: 'textures/earthspecular1k.gif',
        shortcutKey:     '3'
    });

    var mars = new AstronomicalObject({
        name:          'Mars',
        orbits:        theSun,
        orbitDistance: 141000000,
        orbitalPeriod: 686.67,
        spinPeriod:    1.03,
        radius:        2460,
        axis:          25.19,
        texture:       'textures/marsmap1k.jpg',
        shortcutKey:   '4'
    });

    var jupiter = new AstronomicalObject({
        name:          'Jupiter',
        orbits:        theSun,
        orbitDistance: 483000000,
        orbitalPeriod: 4331.87,
        spinPeriod:    0.41,
        radius:        43441,
        axis:          3.13,
        texture:       'textures/jupitermap.jpg',
        shortcutKey:   '5'
    });

    var saturn = new AstronomicalObject({
        name:          'Saturn',
        orbits:        theSun,
        orbitDistance: 886000000,
        orbitalPeriod: 10760.27,
        spinPeriod:    0.44,
        radius:        36184,
        axis:          26.73,
        texture:       'textures/saturnmap.jpg',
        shortcutKey:   '6'
    });

    var uranus = new AstronomicalObject({
        name:           'Uranus',
        orbits:         theSun,
        orbitDistance:  1782000000,
        orbitalPeriod:  30684.65,
        spinPeriod:     0.72,
        spinsClockwise: true,
        radius:         15759,
        axis:           97.77,
        texture:        'textures/uranusmap.jpg',
        shortcutKey:    '7'
    });

    var neptune = new AstronomicalObject({
        name:          'Neptune',
        orbits:        theSun,
        orbitDistance: 2794000000,
        orbitalPeriod: 60193.2,
        spinPeriod:    0.72,
        radius:        15299,
        axis:          28.32,
        texture:       'textures/neptunemap.jpg',
        shortcutKey:   '8'
    });

    var earthsMoon = new AstronomicalObject({
        name:          'Earth\'s Moon',
        orbits:        earth,
        orbitDistance: 2400000,
        orbitalPeriod: 27.3,
        spinPeriod:    27.3,
        radius:        1000,
        axis:          1.5
    });

    var jupiterGalileanMoon1 = new AstronomicalObject({
        name:          'Io',
        orbits:        jupiter,
        orbitDistance: 220000,
        orbitalPeriod: 1.769,
        spinPeriod:    1.769,
        radius:        1075,
        axis:          0.050
    });

    var jupiterGalileanMoon2 = new AstronomicalObject({
        name:          'Europa',
        orbits:        jupiter,
        orbitDistance: 420000,
        orbitalPeriod: 3.551,
        spinPeriod:    3.551,
        radius:        970,
        axis:          0.471
    });

    var jupiterGalileanMoon3 = new AstronomicalObject({
        name:          'Ganymede',
        orbits:        jupiter,
        orbitDistance: 664000,
        orbitalPeriod: 7.155,
        spinPeriod:    7.155,
        radius:        1635,
        axis:          0.204
    });

    var jupiterGalileanMoon4 = new AstronomicalObject({
        name:          'Callisto',
        orbits:        jupiter,
        orbitDistance: 1170000,
        orbitalPeriod: 16.69,
        spinPeriod:    16.69,
        radius:        1497.5,
        axis:          0.205
    });

    var saturnsRings = new AstronomicalObject({
        name:          'Saturn\'s Rings',
        orbits:        saturn,
        spherical:     false,
        radius:        85000,
        axis:          27,
        texture:       'textures/ringsRGBA.png',
        useLighting:   false
    });

    return [
        galaxy,
        theSun,
        mercury,
        venus,
        earth,
        mars,
        jupiter,
        saturn,
        uranus,
        neptune,
        earthsMoon,
        jupiterGalileanMoon1,
        jupiterGalileanMoon2,
        jupiterGalileanMoon3,
        jupiterGalileanMoon4,
        saturnsRings
    ];
});