/* ============================================
   config.js - Alle instelbare game-waarden
   Pas hier gewicht, snelheid en items aan
   ============================================ */

const CONFIG = {
    // Ronald's startwaarden
    startWeight: 100.0,       // kg bij start
    minWeight: 60.0,          // minimaal bereikbaar gewicht
    weightLossPerSec: 0.8,    // kg verlies per seconde (door fietsen)

    // Speelveld
    gameDuration: 45,         // seconden totale race
    laneCount: 3,             // aantal banen (links, midden, rechts)
    laneWidth: 0.28,          // breedte per baan als fractie van canvas

    // Ronald's beweging
    laneSwitchSpeed: 0.15,    // hoe snel Ronald van baan wisselt (0-1, hoger = sneller)

    // Items
    items: {
        hamburger: {
            weight: 1.0,      // +1.0 kg
            emoji: null,      // we tekenen zelf
            color: '#D2691E',
            label: 'Hamburger',
            spawnChance: 0.35
        },
        bier: {
            weight: 0.7,      // +0.7 kg
            emoji: null,
            color: '#F4A460',
            label: 'Bier',
            spawnChance: 0.35
        },
        frieten: {
            weight: 1.5,      // +1.5 kg
            emoji: null,
            color: '#FFD700',
            label: 'Frieten',
            spawnChance: 0.30
        }
    },

    // Item spawning
    itemSpawnInterval: 0.8,   // nieuwe item elke X seconden (gemiddeld)
    itemSpeed: 280,           // pixels per seconde dat items naar beneden bewegen
    itemSize: 44,             // grootte van items in pixels

    // Visueel
    roadColor: '#555555',
    kasseienColor: '#777777',
    grassColor: '#4a8c3f',
    skyColors: ['#87CEEB', '#B0E0E6', '#ADD8E6'],

    // Parallax snelheden (pixels per seconde)
    bgScrollSpeed: 40,
    hillScrollSpeed: 80,
    roadScrollSpeed: 200,

    // Eindscherm berichten op basis van gewicht
    endMessages: [
        { maxWeight: 70, text: 'Klimgeit in wording! Tom Boonen zou jaloers zijn!' },
        { maxWeight: 75, text: 'Chapeau! Bijna klaar voor de Muur van Geraardsbergen!' },
        { maxWeight: 80, text: 'Niet slecht! Je hebt de meeste frituren weerstaan.' },
        { maxWeight: 85, text: 'Gemiddeld rondje. De frietkraam lonkte soms te hard.' },
        { maxWeight: 90, text: 'Net iets te vaak gestopt bij de frituur...' },
        { maxWeight: 95, text: 'Ronald heeft de koers overleefd, maar zijn dieet niet.' },
        { maxWeight: Infinity, text: 'Proficiat, je hebt een nieuwe gewichtsklasse uitgevonden!' }
    ]
};
