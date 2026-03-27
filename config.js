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

    // Cynische opmerkingen bij botsing (grover!)
    collisionQuotes: {
        hamburger: [
            'Wat een varken!',
            'McRonald, de vetzak!',
            'Je wielrenbroek scheurt bijna!',
            'Weer een kin erbij!',
            'Dat broodje ging er in als een suppositoire!',
            'Dieet? Nooit van gehoord!',
            'Je lijkt meer op een vrachtwagen dan een wielrenner!',
            'De weegschaal heeft PTSD door jou.',
            'Die burger had meer calorieën dan je training.',
            'Zelfs de hamburger had medelijden met je.',
            'Ronald eet. Ronald groeit. Ronald walst.',
            'Big Mac? Big Ronald!'
        ],
        bier: [
            'Zuipschuit op wielen!',
            'Lansen bansen Ronald!',
            'Je BAC is hoger dan je snelheid!',
            'Proost dikzak!',
            'Nog eentje en je valt van je fiets!',
            'Belgisch bier: de vijand van elke weegschaal.',
            'Je fietst in zigzag, gaat het?',
            'Herstellingsdrank? Je bent niet eens gevallen!',
            'Bier is vloeibaar brood. Jij bent een bakkerij.',
            'Je lever stuurt een noodkreet.',
            'Tour de France? Tour de Frisdrank!',
            'Alcoholist op twee wielen!'
        ],
        frieten: [
            'PUNTZAK! Net als je lichaam!',
            'Die frituur was je echte finish!',
            'Fransen zeggen frites. Belgen zeggen FRIETEN. Ronald zegt ALLES.',
            'Grote puntzak met alles. Net als Ronald.',
            'Je bent meer aardappel dan atleet.',
            'Die mayo druipt van je kin!',
            'Frituur > Fitheid. Altijd.',
            'Krokant van buiten, vet van binnen. Net als jij.',
            'Stoofvleessaus erbij? Natuurlijk. ALLES erbij.',
            'De frietboer kent je al bij naam!',
            'Je wielrenfiets kreunt onder het gewicht.',
            'Dat is geen sixpack, dat is een vaatje!'
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
