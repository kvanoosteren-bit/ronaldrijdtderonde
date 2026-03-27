# Ronald Rijdt de Ronde

Een humoristische, mobile-friendly browsergame met Belgisch wielerthema.

## Speel het spel

Open `index.html` in je browser. Geen server nodig!

```bash
# Optie 1: dubbelklik op index.html
# Optie 2: vanuit terminal
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows
```

Of start een simpele server:
```bash
python3 -m http.server 8000
# Open http://localhost:8000
```

## Gameplay

- Ronald fietst automatisch over een Vlaams parcours
- Ontwijk hamburgers, bier en frieten om niet aan te komen
- Ronald start op **100,0 kg** en valt af tijdens het fietsen
- Doel: finish met een zo **laag mogelijk gewicht**

### Besturing
- **Desktop**: pijltjestoetsen (links/rechts) of A/D
- **Mobiel**: swipe links/rechts, tap links/rechts van het scherm, of gebruik de knoppen

## Aanpassen

### Gewicht en snelheid (`config.js`)

| Instelling | Variabele | Standaard |
|---|---|---|
| Startgewicht | `CONFIG.startWeight` | 100.0 kg |
| Minimaal gewicht | `CONFIG.minWeight` | 60.0 kg |
| Gewichtsverlies/sec | `CONFIG.weightLossPerSec` | 0.8 kg |
| Speelduur | `CONFIG.gameDuration` | 45 sec |
| Item snelheid | `CONFIG.itemSpeed` | 280 px/sec |
| Spawn interval | `CONFIG.itemSpawnInterval` | 0.8 sec |

### Item-waardes (`config.js`)

| Item | Gewichtstoename |
|---|---|
| Hamburger | +1.0 kg |
| Bier | +0.7 kg |
| Vlaamse frieten | +1.5 kg |

### Assets vervangen

De game tekent alles met Canvas. Om eigen afbeeldingen te gebruiken:

1. Plaats afbeeldingen in een `assets/` map
2. Laad ze in `renderer.js` met `new Image()` en `drawImage()`
3. Vervang de betreffende `draw`-functie (bijv. `drawHamburger`, `drawRonald`)

## Projectstructuur

```
index.html       - HTML structuur (schermen, HUD, leaderboard)
style.css        - Alle styling (mobile-first, responsive)
config.js        - Instelbare waarden (gewicht, snelheid, items)
leaderboard.js   - Score opslag via localStorage
renderer.js      - Alle tekenfuncties (Ronald, items, achtergrond)
game.js          - Gameloop, input, collision, state management
```

## Technologie

- Puur HTML/CSS/JavaScript
- Canvas API voor rendering
- localStorage voor leaderboard
- Geen dependencies
