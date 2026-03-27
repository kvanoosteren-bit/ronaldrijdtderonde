/* ============================================
   game.js - Hoofdlogica, input, gameloop
   Bestuurt de hele game flow
   ============================================ */

const Game = {
    // State
    state: 'start', // 'start', 'playing', 'ended'

    // Ronald
    currentLane: 1,
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

    // Collision effects (met quotes)
    effects: [],

    // Touch
    touchStartX: 0,
    touchStartY: 0,

    // Debounce: voorkom dat knoppen continu vuren
    lastMoveTime: 0,
    moveDebounce: 150, // ms tussen stappen

    // Muziek
    musicPlaying: false,

    /* ---- INITIALISATIE ---- */

    init() {
        const canvas = document.getElementById('game-canvas');
        Renderer.init(canvas);

        this.bindEvents();
        this.showScreen('start');
        this.animatePreview();
        Leaderboard.render();
    },

    /* ---- SCHERM WISSELEN ---- */

    showScreen(name) {
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        document.getElementById(name + '-screen').classList.remove('hidden');
    },

    /* ---- EVENT HANDLERS ---- */

    bindEvents() {
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());

        document.getElementById('save-score-btn').addEventListener('click', () => this.saveScore());
        document.getElementById('player-name').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.saveScore();
        });

        // Toetsenbord - één stap per keydown
        document.addEventListener('keydown', (e) => this.onKeyDown(e));

        // Touch / swipe op game-screen
        const gameScreen = document.getElementById('game-screen');
        gameScreen.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        gameScreen.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
        gameScreen.addEventListener('touchend', (e) => this.onTouchEnd(e));

        // Mobiele knoppen - één stap per tik (niet continu!)
        const btnLeft = document.getElementById('btn-left');
        const btnRight = document.getElementById('btn-right');

        // Touch: één stap per aanraking
        btnLeft.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.debouncedMoveLeft();
        });
        btnRight.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.debouncedMoveRight();
        });

        // Mouse: één stap per klik
        btnLeft.addEventListener('click', (e) => {
            e.stopPropagation();
            this.debouncedMoveLeft();
        });
        btnRight.addEventListener('click', (e) => {
            e.stopPropagation();
            this.debouncedMoveRight();
        });

        // Resize
        window.addEventListener('resize', () => {
            if (this.state === 'playing') Renderer.resize();
        });
    },

    // Debounced movement - voorkomt te snel schakelen
    debouncedMoveLeft() {
        const now = performance.now();
        if (now - this.lastMoveTime < this.moveDebounce) return;
        this.lastMoveTime = now;
        this.moveLeft();
    },

    debouncedMoveRight() {
        const now = performance.now();
        if (now - this.lastMoveTime < this.moveDebounce) return;
        this.lastMoveTime = now;
        this.moveRight();
    },

    onKeyDown(e) {
        if (this.state !== 'playing') return;

        // Voorkom key-repeat (ingehouden toets)
        if (e.repeat) return;

        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            this.moveLeft();
            e.preventDefault();
        }
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            this.moveRight();
            e.preventDefault();
        }
    },

    onTouchStart(e) {
        if (this.state !== 'playing') return;
        if (e.target.classList.contains('ctrl-btn')) return;
        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
    },

    onTouchEnd(e) {
        if (this.state !== 'playing') return;
        if (e.target.classList.contains('ctrl-btn')) return;
        if (!e.changedTouches.length) return;

        const touch = e.changedTouches[0];
        const dx = touch.clientX - this.touchStartX;

        // Swipe detectie
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

    /* ---- MUZIEK (Web Audio API) ---- */

    startMusic() {
        if (this.musicPlaying) return;
        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this.musicPlaying = true;
            this.playMusicLoop();
        } catch (e) {
            // Geen audio support, geen probleem
        }
    },

    stopMusic() {
        this.musicPlaying = false;
        if (this.audioCtx) {
            this.audioCtx.close().catch(() => {});
            this.audioCtx = null;
        }
    },

    // Simpel Belgisch koersmuziekje (vrolijke melodie in loop)
    playMusicLoop() {
        if (!this.musicPlaying || !this.audioCtx) return;

        const ctx = this.audioCtx;
        const now = ctx.currentTime;

        // Vrolijke melodie - Belgische koerssfeer
        // Noten in frequenties (C major / volksmuziek stijl)
        const melody = [
            { f: 523, d: 0.2 },  // C5
            { f: 587, d: 0.2 },  // D5
            { f: 659, d: 0.2 },  // E5
            { f: 523, d: 0.2 },  // C5
            { f: 659, d: 0.3 },  // E5
            { f: 698, d: 0.3 },  // F5
            { f: 784, d: 0.5 },  // G5
            { f: 0, d: 0.1 },    // pauze
            { f: 784, d: 0.2 },  // G5
            { f: 698, d: 0.2 },  // F5
            { f: 659, d: 0.2 },  // E5
            { f: 587, d: 0.2 },  // D5
            { f: 523, d: 0.3 },  // C5
            { f: 392, d: 0.3 },  // G4
            { f: 523, d: 0.5 },  // C5
            { f: 0, d: 0.3 },    // pauze
            // Tweede deel
            { f: 659, d: 0.2 },  // E5
            { f: 659, d: 0.2 },  // E5
            { f: 698, d: 0.2 },  // F5
            { f: 784, d: 0.4 },  // G5
            { f: 698, d: 0.2 },  // F5
            { f: 659, d: 0.2 },  // E5
            { f: 587, d: 0.4 },  // D5
            { f: 0, d: 0.1 },    // pauze
            { f: 523, d: 0.2 },  // C5
            { f: 587, d: 0.2 },  // D5
            { f: 659, d: 0.3 },  // E5
            { f: 523, d: 0.3 },  // C5
            { f: 392, d: 0.3 },  // G4
            { f: 440, d: 0.2 },  // A4
            { f: 523, d: 0.6 },  // C5
            { f: 0, d: 0.4 },    // pauze
        ];

        let t = now;
        const gainNode = ctx.createGain();
        gainNode.gain.value = 0.08; // zacht volume
        gainNode.connect(ctx.destination);

        melody.forEach(note => {
            if (note.f > 0) {
                const osc = ctx.createOscillator();
                const noteGain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.value = note.f;
                noteGain.gain.setValueAtTime(0.08, t);
                noteGain.gain.exponentialRampToValueAtTime(0.01, t + note.d * 0.9);
                osc.connect(noteGain);
                noteGain.connect(gainNode);
                osc.start(t);
                osc.stop(t + note.d);
            }
            t += note.d;
        });

        // Loop de melodie
        const loopDuration = t - now;
        this.musicTimeout = setTimeout(() => {
            this.playMusicLoop();
        }, loopDuration * 1000);
    },

    // Geluidje bij botsing
    playHitSound() {
        if (!this.audioCtx) return;
        try {
            const ctx = this.audioCtx;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(200, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
        } catch (e) {}
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
        this.ronaldX = 0;

        this.showScreen('game');
        Renderer.resize();

        this.lastFrame = performance.now();
        this.startTime = this.lastFrame;

        // Start de muziek
        this.startMusic();

        this.gameLoop();
    },

    restart() {
        this.stopMusic();
        this.showScreen('start');
        this.state = 'start';
        this.animatePreview();
    },

    /* ---- GAME LOOP ---- */

    gameLoop() {
        if (this.state !== 'playing') return;

        const now = performance.now();
        const dt = Math.min((now - this.lastFrame) / 1000, 0.05);
        this.lastFrame = now;
        this.elapsed += dt;
        this.pedaling += dt;

        this.update(dt);
        this.render();

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

        // Gewichtsverlies
        this.weight -= CONFIG.weightLossPerSec * dt;
        if (this.weight < CONFIG.minWeight) this.weight = CONFIG.minWeight;

        // Scroll
        this.scrollOffset += CONFIG.roadScrollSpeed * dt;

        // Ronald's positie
        const roadLeft = w * (0.5 - CONFIG.laneWidth * CONFIG.laneCount / 2);
        const roadWidth = w * CONFIG.laneWidth * CONFIG.laneCount;
        const laneW = roadWidth / CONFIG.laneCount;
        const targetX = roadLeft + laneW * this.targetLane + laneW / 2;

        if (!this.ronaldX) this.ronaldX = targetX;
        this.ronaldX += (targetX - this.ronaldX) * CONFIG.laneSwitchSpeed;
        this.ronaldY = h * 0.75;

        // Moeilijkheidsverhoging over tijd
        const progress = this.elapsed / CONFIG.gameDuration;
        const diffMult = 1 + progress * (CONFIG.difficultyRamp.speedIncrease - 1);
        const spawnMult = 1 - progress * (1 - CONFIG.difficultyRamp.spawnDecrease);

        // Spawn items
        this.spawnItems(dt, spawnMult);

        // Update items (sneller naarmate het vordert)
        this.items.forEach(item => {
            item.y += CONFIG.itemSpeed * diffMult * dt;
        });

        // Collision
        this.checkCollisions();

        // Cleanup
        this.items = this.items.filter(item => item.y < h + 50);

        // Update effecten
        this.effects = this.effects.filter(fx => {
            fx.progress += dt * 1.5; // iets langzamer zodat quotes leesbaar zijn
            return fx.progress < 1;
        });

        this.updateHUD();
    },

    spawnItems(dt, spawnMult) {
        this.lastSpawnTime += dt;
        const interval = CONFIG.itemSpawnInterval * spawnMult;
        if (this.lastSpawnTime < interval) return;
        this.lastSpawnTime = 0;

        // Soms 2 items tegelijk spawnen (moeilijker!)
        const numItems = Math.random() < 0.25 ? 2 : 1;
        const usedLanes = new Set();

        for (let i = 0; i < numItems; i++) {
            let lane;
            do {
                lane = Math.floor(Math.random() * CONFIG.laneCount);
            } while (usedLanes.has(lane) && usedLanes.size < CONFIG.laneCount);
            usedLanes.add(lane);

            // Kies type
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
                y: -CONFIG.itemSize - (i * 40), // licht verschoven als er 2 zijn
                size: CONFIG.itemSize
            });
        }
    },

    checkCollisions() {
        const hitDistance = CONFIG.itemSize * 0.9;

        this.items = this.items.filter(item => {
            const dx = item.x - this.ronaldX;
            const dy = item.y - this.ronaldY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < hitDistance) {
                const itemCfg = CONFIG.items[item.type];
                this.weight += itemCfg.weight;

                // Kies een random cynische quote
                const quotes = CONFIG.collisionQuotes[item.type];
                const quote = quotes[Math.floor(Math.random() * quotes.length)];

                this.effects.push({
                    x: item.x,
                    y: item.y,
                    type: item.type,
                    quote: quote,
                    progress: 0
                });

                // Geluidje
                this.playHitSound();

                return false;
            }
            return true;
        });
    },

    updateHUD() {
        const weightStr = this.weight.toFixed(1).replace('.', ',');
        document.getElementById('weight-display').textContent = weightStr + ' kg';

        const weightEl = document.getElementById('weight-display');
        if (this.weight > 95) weightEl.style.color = '#FF4444';
        else if (this.weight > 85) weightEl.style.color = '#FFA726';
        else weightEl.style.color = '#FFD700';

        const progress = Math.min(this.elapsed / CONFIG.gameDuration, 1);
        document.getElementById('progress-bar').style.width = (progress * 100) + '%';
        document.getElementById('progress-text').textContent = Math.floor(progress * 100) + '%';
    },

    /* ---- RENDERING ---- */

    render() {
        Renderer.clear();
        Renderer.drawBackground(this.scrollOffset);
        const road = Renderer.drawRoad(this.scrollOffset);
        Renderer.drawFlags(this.scrollOffset);

        // Finish lijn
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

        // Collision effecten met quotes
        this.effects.forEach(fx => {
            Renderer.drawCollisionEffect(fx.x, fx.y, fx.progress, fx.type, fx.quote);
        });
    },

    /* ---- EINDE SPEL ---- */

    endGame() {
        this.state = 'ended';
        this.stopMusic();
        this.showScreen('end');

        const finalWeight = Math.round(this.weight * 10) / 10;
        document.getElementById('end-weight').textContent =
            finalWeight.toFixed(1).replace('.', ',') + ' kg';

        const msg = CONFIG.endMessages.find(m => finalWeight <= m.maxWeight);
        document.getElementById('end-message').textContent =
            msg ? msg.text : 'Ronald heeft gefietst!';

        document.getElementById('end-title').textContent =
            finalWeight < 80 ? 'Fantastisch!' : 'De Finish!';

        Leaderboard.render();

        const nameInput = document.getElementById('player-name');
        nameInput.value = '';
        nameInput.disabled = false;
        document.getElementById('save-score-btn').disabled = false;
        document.getElementById('save-score-btn').textContent = 'Score Opslaan';
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

document.addEventListener('DOMContentLoaded', () => Game.init());
