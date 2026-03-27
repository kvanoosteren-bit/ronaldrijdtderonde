/* ============================================
   renderer.js - Alle tekenfuncties
   Ronald, items, achtergrond, parcours
   ============================================ */

const Renderer = {
    ctx: null,
    canvas: null,
    frameCount: 0,

    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    },

    // Resize canvas naar schermgrootte
    resize() {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
    },

    // Wis het hele canvas
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    /* ---- ACHTERGROND MET PARALLAX ---- */

    drawBackground(scrollOffset) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Lucht gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.5);
        skyGrad.addColorStop(0, '#4A90D9');
        skyGrad.addColorStop(1, '#87CEEB');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h * 0.5);

        // Wolken (parallax laag 1 - langzaam)
        this.drawClouds(scrollOffset * 0.2);

        // Heuvels achtergrond (parallax laag 2)
        this.drawHills(scrollOffset * 0.4, h * 0.38, '#2d6a1e', 120);

        // Heuvels voorgrond (parallax laag 3)
        this.drawHills(scrollOffset * 0.7, h * 0.45, '#3d8a2e', 80);

        // Gras
        ctx.fillStyle = CONFIG.grassColor;
        ctx.fillRect(0, h * 0.45, w, h * 0.55);
    },

    drawClouds(offset) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';

        // Paar vaste wolkenposities die herhalen
        const clouds = [
            { x: 100, y: 40, r: 30 },
            { x: 300, y: 60, r: 25 },
            { x: 500, y: 35, r: 35 },
            { x: 700, y: 55, r: 28 },
            { x: 900, y: 45, r: 32 }
        ];

        clouds.forEach(c => {
            const cx = ((c.x - offset * 0.5) % (w + 200)) - 100;
            const adjustedX = cx < -100 ? cx + w + 200 : cx;
            ctx.beginPath();
            ctx.arc(adjustedX, c.y, c.r, 0, Math.PI * 2);
            ctx.arc(adjustedX + c.r * 0.8, c.y - c.r * 0.3, c.r * 0.7, 0, Math.PI * 2);
            ctx.arc(adjustedX - c.r * 0.6, c.y - c.r * 0.1, c.r * 0.6, 0, Math.PI * 2);
            ctx.fill();
        });
    },

    drawHills(offset, baseY, color, amplitude) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, h);

        for (let x = 0; x <= w; x += 4) {
            const y = baseY +
                Math.sin((x + offset) * 0.008) * amplitude * 0.5 +
                Math.sin((x + offset) * 0.003) * amplitude * 0.3;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();
    },

    /* ---- WEG MET KASSEIEN ---- */

    drawRoad(scrollOffset) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Bereken wegpositie
        const roadLeft = w * (0.5 - CONFIG.laneWidth * CONFIG.laneCount / 2);
        const roadRight = w * (0.5 + CONFIG.laneWidth * CONFIG.laneCount / 2);
        const roadWidth = roadRight - roadLeft;
        const roadTop = h * 0.45;

        // Wegondergrond
        ctx.fillStyle = CONFIG.roadColor;
        ctx.fillRect(roadLeft, roadTop, roadWidth, h - roadTop);

        // Kasseien patroon
        this.drawKasseien(roadLeft, roadTop, roadWidth, h - roadTop, scrollOffset);

        // Witte lijnen tussen banen
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([20, 15]);

        for (let i = 1; i < CONFIG.laneCount; i++) {
            const lx = roadLeft + (roadWidth / CONFIG.laneCount) * i;
            ctx.beginPath();
            ctx.moveTo(lx, roadTop);
            ctx.lineTo(lx, h);
            ctx.stroke();
        }
        ctx.setLineDash([]);

        // Rode zijkanten (Belgische sfeer)
        ctx.fillStyle = '#cc0000';
        ctx.fillRect(roadLeft - 6, roadTop, 6, h - roadTop);
        ctx.fillRect(roadRight, roadTop, 6, h - roadTop);

        return { roadLeft, roadRight, roadWidth, roadTop };
    },

    drawKasseien(x, y, w, h, offset) {
        const ctx = this.ctx;
        const stoneW = 24;
        const stoneH = 16;
        const offy = offset % (stoneH * 2);

        ctx.fillStyle = CONFIG.kasseienColor;
        for (let row = -2; row < h / stoneH + 2; row++) {
            const rowOffset = (row % 2) * (stoneW / 2);
            for (let col = -1; col < w / stoneW + 2; col++) {
                const sx = x + col * stoneW + rowOffset;
                const sy = y + row * stoneH + offy;
                if (sy < y - stoneH || sy > y + h) continue;
                ctx.fillRect(sx + 1, sy + 1, stoneW - 2, stoneH - 2);
            }
        }
    },

    /* ---- KOERSVLAGGEN ---- */

    drawFlags(scrollOffset) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const roadTop = h * 0.45;

        const roadLeft = w * (0.5 - CONFIG.laneWidth * CONFIG.laneCount / 2);
        const roadRight = w * (0.5 + CONFIG.laneWidth * CONFIG.laneCount / 2);

        // Vlaggen langs de kant
        const flagSpacing = 200;
        const flagOffset = scrollOffset % flagSpacing;

        for (let fy = roadTop - flagOffset; fy < h + flagSpacing; fy += flagSpacing) {
            if (fy < roadTop - 20) continue;
            // Linkervlag
            this.drawFlag(roadLeft - 20, fy, scrollOffset);
            // Rechtervlag
            this.drawFlag(roadRight + 10, fy, scrollOffset);
        }
    },

    drawFlag(x, y, time) {
        const ctx = this.ctx;
        // Stok
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x, y - 30, 3, 30);
        // Vlag (Belgische driekleur)
        const wave = Math.sin(time * 0.05 + x) * 2;
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 3, y - 30 + wave, 6, 12);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 9, y - 30 + wave, 6, 12);
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(x + 15, y - 30 + wave, 6, 12);
    },

    /* ---- RONALD TEKENEN ---- */

    drawRonald(x, y, weight, pedaling) {
        const ctx = this.ctx;
        const scale = 1;

        // Buikgrootte schaalt met gewicht (grappig effect)
        const bellySize = 12 + (weight - 60) * 0.25;
        const wobble = Math.sin(pedaling * 8) * 2; // wiebel-effect tijdens fietsen

        ctx.save();
        ctx.translate(x, y + wobble);

        // --- FIETS ---
        // Wielen
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(-14 * scale, 18 * scale, 12, 0, Math.PI * 2); // achterwiel
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(14 * scale, 18 * scale, 12, 0, Math.PI * 2);  // voorwiel
        ctx.stroke();

        // Spaken draaien
        const spokeAngle = pedaling * 10;
        [[-14, 18], [14, 18]].forEach(([wx, wy]) => {
            for (let s = 0; s < 4; s++) {
                const a = spokeAngle + s * Math.PI / 2;
                ctx.beginPath();
                ctx.moveTo(wx + Math.cos(a) * 4, wy * scale + Math.sin(a) * 4);
                ctx.lineTo(wx + Math.cos(a) * 11, wy * scale + Math.sin(a) * 11);
                ctx.strokeStyle = '#666';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        });

        // Frame
        ctx.strokeStyle = '#E53935';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-14 * scale, 18 * scale); // achterwiel
        ctx.lineTo(0, 2 * scale);             // zadel
        ctx.lineTo(14 * scale, 18 * scale);   // voorwiel
        ctx.moveTo(0, 2 * scale);
        ctx.lineTo(10 * scale, 4 * scale);    // stuur
        ctx.stroke();

        // Zadel
        ctx.fillStyle = '#333';
        ctx.fillRect(-5 * scale, 0, 10, 4);

        // Pedalen (draaien)
        const pedalAngle = pedaling * 10;
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(
            -14 * scale + Math.cos(pedalAngle) * 8,
            18 * scale + Math.sin(pedalAngle) * 8
        );
        ctx.lineTo(
            -14 * scale + Math.cos(pedalAngle + Math.PI) * 8,
            18 * scale + Math.sin(pedalAngle + Math.PI) * 8
        );
        ctx.stroke();

        // --- RONALD'S LICHAAM ---
        // Benen (trappend)
        ctx.strokeStyle = '#F5CBA7';
        ctx.lineWidth = 5;
        const legAngle1 = Math.sin(pedaling * 8) * 0.4;
        const legAngle2 = Math.sin(pedaling * 8 + Math.PI) * 0.4;
        // Been 1
        ctx.beginPath();
        ctx.moveTo(-2 * scale, 2 * scale);
        ctx.lineTo(-8 + legAngle1 * 10, 16 * scale);
        ctx.stroke();
        // Been 2
        ctx.beginPath();
        ctx.moveTo(-2 * scale, 2 * scale);
        ctx.lineTo(-8 + legAngle2 * 10, 16 * scale);
        ctx.stroke();

        // Schoenen
        ctx.fillStyle = '#222';
        ctx.fillRect(-12 + legAngle1 * 10, 15 * scale, 8, 4);
        ctx.fillRect(-12 + legAngle2 * 10, 15 * scale, 8, 4);

        // Torso / wielershirt (blauw met gele bies - Vlaanderen style)
        ctx.fillStyle = '#1565C0';
        ctx.beginPath();
        ctx.ellipse(0, -4 * scale, 10, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Gele bies op shirt
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-10, -4 * scale);
        ctx.lineTo(10, -4 * scale);
        ctx.stroke();

        // BUIK! (het grappige deel - groeit met gewicht)
        ctx.fillStyle = '#1976D2';
        ctx.beginPath();
        ctx.ellipse(
            2, 2 * scale,
            bellySize * 0.7, bellySize * 0.5,
            0.2, 0, Math.PI * 2
        );
        ctx.fill();
        // Buik highlight
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.beginPath();
        ctx.ellipse(
            0, 0,
            bellySize * 0.4, bellySize * 0.3,
            0.2, 0, Math.PI * 2
        );
        ctx.fill();

        // Armen (gestrekt naar stuur)
        ctx.strokeStyle = '#F5CBA7';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(4 * scale, -8 * scale);
        ctx.lineTo(10 * scale, 2 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-4 * scale, -8 * scale);
        ctx.lineTo(10 * scale, 2 * scale);
        ctx.stroke();

        // Handschoenen
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(10 * scale, 2 * scale, 3, 0, Math.PI * 2);
        ctx.fill();

        // Hoofd (kaal!)
        ctx.fillStyle = '#F5CBA7';
        ctx.beginPath();
        ctx.arc(0, -20 * scale, 10, 0, Math.PI * 2);
        ctx.fill();

        // Glans op kaal hoofd
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(-2, -23 * scale, 4, 0, Math.PI * 2);
        ctx.fill();

        // Ogen
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(-3, -20 * scale, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(3, -20 * scale, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Glimlach / inspanning (afhankelijk van gewicht)
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (weight > 90) {
            // Zwetend gezicht bij hoog gewicht
            ctx.arc(0, -17 * scale, 4, 0.1, Math.PI - 0.1, true); // frown
            // Zweetdruppels
            ctx.fillStyle = '#87CEEB';
            ctx.fill();
            ctx.fillRect(7, -22 * scale, 2, 4);
            ctx.fillRect(9, -18 * scale, 2, 3);
        } else {
            // Blij gezicht
            ctx.arc(0, -22 * scale, 4, 0.2, Math.PI - 0.2);
        }
        ctx.stroke();

        // Helm
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.ellipse(0, -25 * scale, 11, 6, 0, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#FFC107';
        ctx.beginPath();
        ctx.ellipse(0, -26 * scale, 9, 3, 0, Math.PI, 0);
        ctx.fill();

        ctx.restore();
    },

    // Preview-versie voor startscherm
    drawRonaldPreview(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2 + 10);
        ctx.scale(1.3, 1.3);
        // Hergebruik Ronald tekening op origin
        ctx.translate(0, 0);
        this.ctx = ctx;
        this.drawRonald(0, 0, 100, performance.now() / 1000);
        ctx.restore();
        // Herstel game canvas context
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
        }
    },

    /* ---- ITEMS TEKENEN ---- */

    drawItem(x, y, type, size) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, y);

        if (type === 'hamburger') {
            this.drawHamburger(size);
        } else if (type === 'bier') {
            this.drawBier(size);
        } else if (type === 'frieten') {
            this.drawFrieten(size);
        }

        ctx.restore();
    },

    drawHamburger(s) {
        const ctx = this.ctx;
        const r = s / 2;
        // Onderbroodje
        ctx.fillStyle = '#D2691E';
        ctx.beginPath();
        ctx.ellipse(0, 4, r, r * 0.4, 0, 0, Math.PI);
        ctx.fill();
        // Vlees
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-r + 2, -2, s - 4, 6);
        // Sla
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(-r + 3, -4, s - 6, 3);
        // Kaas
        ctx.fillStyle = '#FFC107';
        ctx.beginPath();
        ctx.moveTo(-r + 2, -4);
        ctx.lineTo(r - 2, -4);
        ctx.lineTo(r, -6);
        ctx.lineTo(-r, -6);
        ctx.fill();
        // Bovenbroodje met sesamzaadjes
        ctx.fillStyle = '#E8A952';
        ctx.beginPath();
        ctx.ellipse(0, -6, r, r * 0.5, 0, Math.PI, 0);
        ctx.fill();
        // Sesamzaadjes
        ctx.fillStyle = '#FFF8DC';
        ctx.fillRect(-4, -10, 2, 3);
        ctx.fillRect(2, -11, 2, 3);
        ctx.fillRect(-1, -12, 2, 2);
    },

    drawBier(s) {
        const ctx = this.ctx;
        const r = s / 2;
        // Glas
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(-r * 0.5, -r, r, r * 1.6);
        // Bier
        ctx.fillStyle = '#F4A460';
        ctx.fillRect(-r * 0.5 + 1, -r * 0.5, r - 2, r * 1.1);
        // Schuim
        ctx.fillStyle = '#FFFDD0';
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.5, r * 0.55, r * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        // Oor van het glas
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(r * 0.5 + 4, 0, 5, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
    },

    drawFrieten(s) {
        const ctx = this.ctx;
        const r = s / 2;
        // Puntzak (rood-wit gestreept, typisch Belgisch)
        ctx.fillStyle = '#CC0000';
        ctx.beginPath();
        ctx.moveTo(-r * 0.7, -r * 0.3);
        ctx.lineTo(r * 0.7, -r * 0.3);
        ctx.lineTo(r * 0.3, r);
        ctx.lineTo(-r * 0.3, r);
        ctx.closePath();
        ctx.fill();
        // Witte streep
        ctx.fillStyle = '#FFF';
        ctx.fillRect(-r * 0.1, -r * 0.3, r * 0.2, r * 1.2);
        // Frieten die uitsteken
        ctx.fillStyle = '#FFD700';
        const frietjes = [-6, -2, 2, 5, -4, 0, 4];
        frietjes.forEach((fx, i) => {
            const fh = 8 + (i % 3) * 4;
            ctx.fillRect(fx - 1.5, -r * 0.3 - fh, 3, fh);
        });
        // Mayonaise klodder
        ctx.fillStyle = '#FFFDD0';
        ctx.beginPath();
        ctx.arc(0, -r * 0.3 - 6, 4, 0, Math.PI * 2);
        ctx.fill();
    },

    /* ---- COLLISION ANIMATIE ---- */

    drawCollisionEffect(x, y, progress, itemType) {
        const ctx = this.ctx;
        const alpha = 1 - progress;
        const expand = progress * 30;

        ctx.save();
        ctx.globalAlpha = alpha;

        // Gewicht-tekst die omhoog zweeft
        const weightGain = CONFIG.items[itemType].weight;
        ctx.fillStyle = '#FF4444';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
            `+${weightGain.toFixed(1)} kg`,
            x,
            y - 30 - progress * 40
        );

        // Uitdijende ring
        ctx.strokeStyle = '#FF6644';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 15 + expand, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    },

    /* ---- FINISH LIJN ---- */

    drawFinishLine(roadLeft, roadWidth, y) {
        const ctx = this.ctx;
        const squareSize = 12;
        const cols = Math.ceil(roadWidth / squareSize);

        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < cols; col++) {
                ctx.fillStyle = (row + col) % 2 === 0 ? '#000' : '#FFF';
                ctx.fillRect(
                    roadLeft + col * squareSize,
                    y + row * squareSize,
                    squareSize,
                    squareSize
                );
            }
        }
    }
};
