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
    gameDuration: 50,         // seconden totale race
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

    // Item spawning - moeilijker: sneller en vaker
    itemSpawnInterval: 0.55,  // nieuwe item elke X seconden
    itemSpeed: 340,           // pixels per seconde (sneller)
    itemSize: 48,             // iets groter

    // Moeilijkheidsverhoging over tijd
    difficultyRamp: {
        speedIncrease: 1.5,   // itemSpeed vermenigvuldiger na halve race
        spawnDecrease: 0.7    // spawnInterval vermenigvuldiger (lager = vaker)
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

    // Cynische opmerkingen bij botsing
    collisionQuotes: {
        hamburger: [
            '"Eentje kan geen kwaad" - Ronald, elke keer',
            'McRonald strikes again!',
            'Dat broodje vloog er zo in...',
            'Hamburger helper!',
            'Nog eentje voor onderweg!',
            'Dieet begint morgen!',
            'Wielrenners eten toch pasta? Dit is bijna pasta.',
            'Hmm, extra kaas ook nog...',
            'De koers is lang, de burger is lekker.',
            'Calorieen zijn brandstof, toch?'
        ],
        bier: [
            'Een goeie Belgische traditie!',
            'Tripel of quadrupel? Maakt niet uit!',
            'Biertje op de fiets, typisch Belgisch.',
            'Cheers! ...wacht, ik fiets nog.',
            'Nog 30 km, nog 3 pintjes.',
            'Dorst is erger dan honger.',
            'Speciaalbiertje! Kon niet weerstaan.',
            'Herstellingsdrank, zeg maar.',
            'Bier is vloeibaar brood. Dus gezond.',
            'Proost! *wankelt even*'
        ],
        frieten: [
            'Met mayo uiteraard!',
            'Echte Belgische frietjes!',
            'De frituur is het echte peloton.',
            'Grote of kleine puntzak? GROTE.',
            'Frieten > finish.',
            'Frietjes zijn groenten, bewijs het tegendeel.',
            'Stoofvleessaus erbij? Waarom niet!',
            'Die geur... onmogelijk te weerstaan.',
            'Frituur Nummer 1 langs het parcours!',
            'Krokant van buiten, vet van binnen. Net als Ronald.'
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
