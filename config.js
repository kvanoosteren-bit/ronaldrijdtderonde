/* ============================================
   config.js - Alle instelbare game-waarden
   Pas hier gewicht, snelheid en items aan
   ============================================ */

const CONFIG = {
    // Ronald's startwaarden
    startWeight: 100.0,       // kg bij start
    minWeight: 60.0,          // minimaal bereikbaar gewicht
    weightLossPerSec: 0.6,    // kg verlies per seconde (lager = moeilijker)

    // Speelveld
    gameDuration: 35,         // seconden totale race (korter!)
    laneCount: 3,             // aantal banen (links, midden, rechts)
    laneWidth: 0.28,          // breedte per baan als fractie van canvas

    // Ronald's beweging
    laneSwitchSpeed: 0.18,    // hoe snel Ronald van baan wisselt (0-1)

    // Ronald's schaal (groter = opvallender)
    ronaldScale: 1.6,

    // Items
    items: {
        hamburger: {
            weight: 1.2,      // +1.2 kg
            emoji: null,
            color: '#D2691E',
            label: 'Hamburger',
            spawnChance: 0.35
        },
        bier: {
            weight: 0.8,      // +0.8 kg
            emoji: null,
            color: '#F4A460',
            label: 'Bier',
            spawnChance: 0.35
        },
        frieten: {
            weight: 1.8,      // +1.8 kg
            emoji: null,
            color: '#FFD700',
            label: 'Frieten',
            spawnChance: 0.30
        }
    },

    // Item spawning
    itemSpawnInterval: 0.55,  // nieuwe item elke X seconden
    itemSpeed: 340,           // pixels per seconde
    itemSize: 48,             // grootte items

    // Moeilijkheidsverhoging over tijd
    difficultyRamp: {
        speedIncrease: 1.5,
        spawnDecrease: 0.7
    },

    // Visueel
    roadColor: '#555555',
    kasseienColor: '#777777',
    grassColor: '#4a8c3f',
    skyColors: ['#87CEEB', '#B0E0E6', '#ADD8E6'],

    // Parallax snelheden
    bgScrollSpeed: 40,
    hillScrollSpeed: 80,
    roadScrollSpeed: 200,

    // Ludieke opmerkingen bij botsing (speels, deelbaar, niet grof)
    collisionQuotes: {
        hamburger: [
            'Ronald kan geen nee zeggen tegen een burger!',
            'Eentje voor onderweg kan toch geen kwaad?',
            'Dieet begint na de finish!',
            'Die geur... Ronald was kansloos.',
            'Hamburger? Ronald noemt het wielrenvoeding.',
            'De koers is lang, de burger was dichtbij.',
            'Ronald: "Ik eet voor twee, ik fiets voor een half."',
            'Extra kaas? Uiteraard. Ronald kent zichzelf.',
            'Dat broodje sprong spontaan in zijn mond!',
            'Ronald fietst niet voorbij een burger. Nooit.',
            'Proteïne is belangrijk! ...toch?',
            'Even bijtanken, zegt Ronald dan.'
        ],
        bier: [
            'Een Belgisch biertje hoort erbij!',
            'Proost! Ronald drinkt op de goede afloop.',
            'Herstellingsdrank, noemt Ronald het.',
            'Nog 30 km, nog 3 pintjes.',
            'Bier is vloeibaar brood. Dus technisch gezien...',
            'Ronald: "Een koers zonder bier is geen koers."',
            'Speciaalbiertje! Daar fietst Ronald niet aan voorbij.',
            'Even de dorst lessen. Met een tripel.',
            'Het café langs het parcours lonkte te hard.',
            'Ronald zijn bidon zit vol... Duvel.',
            'Je kunt geen Belgische koers doen zonder bier!',
            'Eentje dan. Oké twee. Vooruit, drie.'
        ],
        frieten: [
            'Echte Belgische frietjes! Ronald is zwak.',
            'Met mayo uiteraard. Ronald is een kenner.',
            'De frituur was sterker dan de wil.',
            'Grote puntzak graag. GROTE.',
            'Ronald: "Frietjes zijn groenten, toch?"',
            'Stoofvleessaus erbij? Waarom niet!',
            'Die geur van de frituur... game over.',
            'Even een frietje pakken, zei Ronald. Even.',
            'De frietboer zwaait al, hij kent Ronald.',
            'Belgische frieten > Belgische heuvels.',
            'Ronald fietst van frituur naar frituur.',
            'Krokant, goudbruin, en veel te lekker.'
        ]
    },

    // Eindscherm berichten op basis van gewicht
    endMessages: [
        { maxWeight: 70, text: 'Klimgeit in wording! Tom Boonen zou jaloers zijn!' },
        { maxWeight: 75, text: 'Chapeau! Bijna klaar voor de Muur van Geraardsbergen!' },
        { maxWeight: 80, text: 'Niet slecht! Je hebt de meeste frituren weerstaan.' },
        { maxWeight: 85, text: 'Gemiddeld rondje. De frietkraam lonkte soms te hard.' },
        { maxWeight: 90, text: 'Net iets te vaak gestopt bij de frituur...' },
        { maxWeight: 95, text: 'Ronald heeft de koers overleefd, maar zijn dieet niet.' },
        { maxWeight: 100, text: 'Ronald rijdt, Ronald eet. Vooral dat laatste.' },
        { maxWeight: Infinity, text: 'Proficiat, je hebt een nieuwe gewichtsklasse uitgevonden!' }
    ]
};
