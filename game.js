/* ============================================
   game.js - Hoofdlogica, input, gameloop
   Bestuurt de hele game flow
   ============================================ */

const Game = {
    // State
    state: 'start', // 'start', 'playing', 'ended'

    // Ronald
    currentLane: 1,     // 0=links, 1=midden, 2=rechts
    targetLane: 1,
    ronaldX: 0,
    ronaldY: 0,
    weight: CONFIG.startWeight,
    pedaling: 0,

    // Timing
    startTime: 0,
    elapsed: 0,
    lastFrame: 0,
    scrollOffset: 0,

    // Items
    items: [],
    lastSpawnTime: 0,

    // Collision effects
    effects: [],

    // Touch
    touchStartX: 0,
    touchStartY: 0,

    // Mobile button state
    movingLeft: false,
    movingRight: false,

    /* ---- INITIALISATIE ---- */

    init() {
        const canvas = document.getElementById('game-canvas');
        Renderer.init(canvas);

        this.bindEvents();
        this.showScreen('start');

        // Teken Ronald op startscherm
        this.animatePreview();

        // Toon bestaand leaderboard op eindscherm
        Leaderboard.render();
    },

    /* ---- SCHERM WISSELEN ---- */

    showScreen(name) {
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        document.getElementById(name + '-screen').classList.remove('hidden');
    },

    /* ---- EVENT HANDLERS ---- */

    bindEvents() {
        // Start knop
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());

        // Score opslaan
        document.getElementById('save-score-btn').addEventListener('click', () => this.saveScore());
        // Enter in naamveld = opslaan
        document.getElementById('player-name').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.saveScore();
        });

        // Toetsenbord
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));

        // Touch / swipe
        const gameScreen = document.getElementById('game-screen');
        gameScreen.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        gameScreen.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        gameScreen.addEventListener('touchend', (e) => this.onTouchEnd(e));

        // Mobiele knoppen
        const btnLeft = document.getElementById('btn-left');
        const btnRight = document.getElementById('btn-right');

        btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); this.movingLeft = true; });
        btnLeft.addEventListener('touchend', () => { this.movingLeft = false; });
        btnLeft.addEventListener('mousedown', () => { this.movingLeft = true; });
        btnLeft.addEventListener('mouseup', () => { this.movingLeft = false; });

        btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); this.movingRight = true; });
        btnRight.addEventListener('touchend', () => { this.movingRight = false; });
        btnRight.addEventListener('mousedown', () => { this.movingRight = true; });
        btnRight.addEventListener('mouseup', () => { this.movingRight = false; });

        // Resize
        window.addEventListener('resize', () => {
            if (this.state === 'playing') {
                Renderer.resize();
            }
        });
    },

    onKeyDown(e) {
        if (this.state !== 'playing') return;
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            this.moveLeft();
            e.preventDefault();
        }
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            this.moveRight();
            e.preventDefault();
        }
    },

    onKeyUp(e) {
        // Niet nodig voor lane-based movement
    },

    onTouchStart(e) {
        if (this.state !== 'playing') return;
        // Negeer touches op knoppen
        if (e.target.classList.contains('ctrl-btn')) return;
        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
    },

    onTouchMove(e) {
        e.preventDefault(); // voorkom scrollen
    },

    onTouchEnd(e) {
        if (this.state !== 'playing') return;
        if (e.target.classList.contains('ctrl-btn')) return;
        if (!e.changedTouches.length) return;

        const touch = e.changedTouches[0];
        const dx = touch.clientX - this.touchStartX;

        // Swipe detectie (minimaal 30px)
        if (Math.abs(dx) > 30) {
            if (dx < 0) this.moveLeft();
            else this.moveRight();
        } else {
            // Tap: links/rechts van scherm
            const half = window.innerWidth / 2;
            if (touch.clientX < half) this.moveLeft();
            else this.moveRight();
        }
    },

    moveLeft() {
        if (this.targetLane > 0) this.targetLane--;
    },

    moveRight() {
        if (this.targetLane < CONFIG.laneCount - 1) this.targetLane++;
    },

    /* ---- GAME STARTEN ---- */

    startGame() {
        this.state = 'playing';
        this.weight = CONFIG.startWeight;
        this.currentLane = 1;
        this.targetLane = 1;
        this.items = [];
        this.effects = [];
        this.elapsed = 0;
        this.scrollOffset = 0;
        this.lastSpawnTime = 0;
        this.pedaling = 0;
        this.movingLeft = false;
        this.movingRight = false;

        this.showScreen('game');
        Renderer.resize();

        this.lastFrame = performance.now();
        this.startTime = this.lastFrame;
        this.gameLoop();
    },

    restart() {
        this.showScreen('start');
        this.state = 'start';
    },

    /* ---- GAME LOOP ---- */

    gameLoop() {
        if (this.state !== 'playing') return;

        const now = performance.now();
        const dt = Math.min((now - this.lastFrame) / 1000, 0.05); // cap delta
        this.lastFrame = now;
        this.elapsed += dt;
        this.pedaling += dt;

        // Update
        this.update(dt);

        // Render
        this.render();

        // Check einde
        if (this.elapsed >= CONFIG.gameDuration) {
            this.endGame();
            return;
        }

        requestAnimationFrame(() => this.gameLoop());
    },

    /* ---- UPDATE LOGICA ---- */

    update(dt) {
        const w = Renderer.canvas.width;
        const h = Renderer.canvas.height;

        // Continu mobiele knoppen checken
        if (this.movingLeft) this.moveLeft();
        if (this.movingRight) this.moveRight();

        // Gewichtsverlies door fietsen
        this.weight -= CONFIG.weightLossPerSec * dt;
        if (this.weight < CONFIG.minWeight) this.weight = CONFIG.minWeight;

        // Scroll achtergrond
        this.scrollOffset += CONFIG.roadScrollSpeed * dt;

        // Ronald's positie berekenen (soepele overgang tussen banen)
        const roadLeft = w * (0.5 - CONFIG.laneWidth * CONFIG.laneCount / 2);
        const roadWidth = w * CONFIG.laneWidth * CONFIG.laneCount;
        const laneW = roadWidth / CONFIG.laneCount;
        const targetX = roadLeft + laneW * this.targetLane + laneW / 2;

        // Soepele beweging naar doelbaan
        if (!this.ronaldX) this.ronaldX = targetX;
        this.ronaldX += (targetX - this.ronaldX) * CONFIG.laneSwitchSpeed;
        this.ronaldY = h * 0.78;

        // Spawn items
        this.spawnItems(dt);

        // Update items (beweeg naar beneden)
        this.items.forEach(item => {
            item.y += CONFIG.itemSpeed * dt;
        });

        // Collision detectie
        this.checkCollisions();

        // Verwijder items die uit beeld zijn
        this.items = this.items.filter(item => item.y < h + 50);

        // Update effecten
        this.effects = this.effects.filter(fx => {
            fx.progress += dt * 2;
            return fx.progress < 1;
        });

        // HUD updaten
        this.updateHUD();
    },

    spawnItems(dt) {
        this.lastSpawnTime += dt;
        if (this.lastSpawnTime < CONFIG.itemSpawnInterval) return;
        this.lastSpawnTime = 0;

        // Kies random baan
        const lane = Math.floor(Math.random() * CONFIG.laneCount);

        // Kies random item type
        const rand = Math.random();
        let type;
        let cumulative = 0;
        for (const [key, cfg] of Object.entries(CONFIG.items)) {
            cumulative += cfg.spawnChance;
            if (rand <= cumulative) {
                type = key;
                break;
            }
        }
        if (!type) type = 'hamburger';

        const w = Renderer.canvas.width;
        const roadLeft = w * (0.5 - CONFIG.laneWidth * CONFIG.laneCount / 2);
        const roadWidth = w * CONFIG.laneWidth * CONFIG.laneCount;
        const laneW = roadWidth / CONFIG.laneCount;

        this.items.push({
            type: type,
            lane: lane,
            x: roadLeft + laneW * lane + laneW / 2,
            y: -CONFIG.itemSize,
            size: CONFIG.itemSize
        });
    },

    checkCollisions() {
        const hitDistance = CONFIG.itemSize * 0.8;

        this.items = this.items.filter(item => {
            const dx = item.x - this.ronaldX;
            const dy = item.y - this.ronaldY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < hitDistance) {
                // Botsing!
                const itemCfg = CONFIG.items[item.type];
                this.weight += itemCfg.weight;

                // Visueel effect
                this.effects.push({
                    x: item.x,
                    y: item.y,
                    type: item.type,
                    progress: 0
                });

                return false; // verwijder item
            }
            return true;
        });
    },

    updateHUD() {
        // Gewicht
        const weightStr = this.weight.toFixed(1).replace('.', ',');
        document.getElementById('weight-display').textContent = weightStr + ' kg';

        // Kleur gewicht rood als het stijgt
        const weightEl = document.getElementById('weight-display');
        if (this.weight > 95) {
            weightEl.style.color = '#FF4444';
        } else if (this.weight > 85) {
            weightEl.style.color = '#FFA726';
        } else {
            weightEl.style.color = '#FFD700';
        }

        // Progressie
        const progress = Math.min(this.elapsed / CONFIG.gameDuration, 1);
        document.getElementById('progress-bar').style.width = (progress * 100) + '%';
        document.getElementById('progress-text').textContent = Math.floor(progress * 100) + '%';
    },

    /* ---- RENDERING ---- */

    render() {
        Renderer.clear();

        // Achtergrond met parallax
        Renderer.drawBackground(this.scrollOffset);

        // Weg met kasseien
        const road = Renderer.drawRoad(this.scrollOffset);

        // Koersvlaggen
        Renderer.drawFlags(this.scrollOffset);

        // Finish lijn tekenen als bijna klaar
        const progress = this.elapsed / CONFIG.gameDuration;
        if (progress > 0.9) {
            const finishY = Renderer.canvas.height * 0.45 +
                (1 - (progress - 0.9) / 0.1) * (Renderer.canvas.height * 0.3);
            Renderer.drawFinishLine(road.roadLeft, road.roadWidth, finishY);
        }

        // Items
        this.items.forEach(item => {
            Renderer.drawItem(item.x, item.y, item.type, item.size);
        });

        // Ronald
        Renderer.drawRonald(this.ronaldX, this.ronaldY, this.weight, this.pedaling);

        // Collision effecten
        this.effects.forEach(fx => {
            Renderer.drawCollisionEffect(fx.x, fx.y, fx.progress, fx.type);
        });
    },

    /* ---- EINDE SPEL ---- */

    endGame() {
        this.state = 'ended';
        this.showScreen('end');

        // Eindgewicht tonen
        const finalWeight = Math.round(this.weight * 10) / 10;
        document.getElementById('end-weight').textContent =
            finalWeight.toFixed(1).replace('.', ',') + ' kg';

        // Ludieke boodschap kiezen
        const msg = CONFIG.endMessages.find(m => finalWeight <= m.maxWeight);
        document.getElementById('end-message').textContent =
            msg ? msg.text : 'Ronald heeft gefietst!';

        // Titel
        document.getElementById('end-title').textContent =
            finalWeight < 80 ? 'Fantastisch!' : 'De Finish!';

        // Leaderboard tonen
        Leaderboard.render();

        // Focus op naamveld
        const nameInput = document.getElementById('player-name');
        nameInput.value = '';
        nameInput.disabled = false;
        document.getElementById('save-score-btn').disabled = false;
        setTimeout(() => nameInput.focus(), 300);
    },

    saveScore() {
        const nameInput = document.getElementById('player-name');
        const name = nameInput.value.trim();
        if (!name) {
            nameInput.style.borderColor = '#FF4444';
            nameInput.placeholder = 'Vul je naam in!';
            return;
        }

        const finalWeight = Math.round(this.weight * 10) / 10;
        Leaderboard.saveScore(name, finalWeight);
        Leaderboard.render(finalWeight);

        // Disable input na opslaan
        nameInput.disabled = true;
        document.getElementById('save-score-btn').disabled = true;
        document.getElementById('save-score-btn').textContent = 'Opgeslagen!';
    },

    /* ---- STARTSCHERM PREVIEW ---- */

    animatePreview() {
        const previewCanvas = document.getElementById('preview-canvas');
        if (!previewCanvas) return;

        Renderer.drawRonaldPreview(previewCanvas);

        if (this.state === 'start') {
            requestAnimationFrame(() => this.animatePreview());
        }
    }
};

// Start als DOM geladen is
document.addEventListener('DOMContentLoaded', () => Game.init());
