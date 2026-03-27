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

    resize() {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
    },

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    /* ---- ACHTERGROND MET PARALLAX ---- */

    drawBackground(scrollOffset) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.5);
        skyGrad.addColorStop(0, '#4A90D9');
        skyGrad.addColorStop(1, '#87CEEB');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h * 0.5);

        this.drawClouds(scrollOffset * 0.2);
        this.drawHills(scrollOffset * 0.4, h * 0.38, '#2d6a1e', 120);
        this.drawHills(scrollOffset * 0.7, h * 0.45, '#3d8a2e', 80);

        ctx.fillStyle = CONFIG.grassColor;
        ctx.fillRect(0, h * 0.45, w, h * 0.55);
    },

    drawClouds(offset) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';

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

        const roadLeft = w * (0.5 - CONFIG.laneWidth * CONFIG.laneCount / 2);
        const roadRight = w * (0.5 + CONFIG.laneWidth * CONFIG.laneCount / 2);
        const roadWidth = roadRight - roadLeft;
        const roadTop = h * 0.45;

        ctx.fillStyle = CONFIG.roadColor;
        ctx.fillRect(roadLeft, roadTop, roadWidth, h - roadTop);

        this.drawKasseien(roadLeft, roadTop, roadWidth, h - roadTop, scrollOffset);

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

        const flagSpacing = 200;
        const flagOffset = scrollOffset % flagSpacing;

        for (let fy = roadTop - flagOffset; fy < h + flagSpacing; fy += flagSpacing) {
            if (fy < roadTop - 20) continue;
            this.drawFlag(roadLeft - 20, fy, scrollOffset);
            this.drawFlag(roadRight + 10, fy, scrollOffset);
        }
    },

    drawFlag(x, y, time) {
        const ctx = this.ctx;
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x, y - 30, 3, 30);
        const wave = Math.sin(time * 0.05 + x) * 2;
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 3, y - 30 + wave, 6, 12);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 9, y - 30 + wave, 6, 12);
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(x + 15, y - 30 + wave, 6, 12);
    },

    /* ---- RONALD TEKENEN (GROOT, KAAL, GEEN HELM) ---- */

    drawRonald(x, y, weight, pedaling) {
        const ctx = this.ctx;
        const s = CONFIG.ronaldScale || 1.6; // schaal factor

        // Buikgrootte schaalt met gewicht
        const bellySize = (14 + (weight - 60) * 0.35) * s;
        const wobble = Math.sin(pedaling * 8) * 2.5;

        ctx.save();
        ctx.translate(x, y + wobble);

        // --- FIETS ---
        const wheelR = 14 * s;
        const wheelY = 22 * s;
        const wheelSpread = 18 * s;

        // Wielen
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2.5 * s;
        ctx.beginPath();
        ctx.arc(-wheelSpread, wheelY, wheelR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(wheelSpread, wheelY, wheelR, 0, Math.PI * 2);
        ctx.stroke();

        // Spaken
        const spokeAngle = pedaling * 10;
        [[-wheelSpread, wheelY], [wheelSpread, wheelY]].forEach(([wx, wy]) => {
            for (let sp = 0; sp < 4; sp++) {
                const a = spokeAngle + sp * Math.PI / 2;
                ctx.beginPath();
                ctx.moveTo(wx + Math.cos(a) * 4 * s, wy + Math.sin(a) * 4 * s);
                ctx.lineTo(wx + Math.cos(a) * (wheelR - 2), wy + Math.sin(a) * (wheelR - 2));
                ctx.strokeStyle = '#888';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        });

        // Frame
        ctx.strokeStyle = '#E53935';
        ctx.lineWidth = 3 * s;
        ctx.beginPath();
        ctx.moveTo(-wheelSpread, wheelY);
        ctx.lineTo(-2 * s, 2 * s);
        ctx.lineTo(wheelSpread, wheelY);
        ctx.moveTo(-2 * s, 2 * s);
        ctx.lineTo(12 * s, 6 * s);
        ctx.stroke();

        // Zadel
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.ellipse(-2 * s, 0, 6 * s, 2.5 * s, -0.1, 0, Math.PI * 2);
        ctx.fill();

        // Pedalen
        const pedalAngle = pedaling * 10;
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2.5 * s;
        const pedalCX = -wheelSpread + 4 * s;
        const pedalCY = wheelY;
        ctx.beginPath();
        ctx.moveTo(
            pedalCX + Math.cos(pedalAngle) * 9 * s,
            pedalCY + Math.sin(pedalAngle) * 9 * s
        );
        ctx.lineTo(
            pedalCX + Math.cos(pedalAngle + Math.PI) * 9 * s,
            pedalCY + Math.sin(pedalAngle + Math.PI) * 9 * s
        );
        ctx.stroke();

        // --- RONALD'S LICHAAM ---

        // Benen
        ctx.strokeStyle = '#F5CBA7';
        ctx.lineWidth = 6 * s;
        const legAngle1 = Math.sin(pedaling * 8) * 0.4;
        const legAngle2 = Math.sin(pedaling * 8 + Math.PI) * 0.4;
        ctx.beginPath();
        ctx.moveTo(-2 * s, 4 * s);
        ctx.lineTo(pedalCX + legAngle1 * 12 * s, wheelY - 2 * s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-2 * s, 4 * s);
        ctx.lineTo(pedalCX + legAngle2 * 12 * s, wheelY - 2 * s);
        ctx.stroke();

        // Schoenen
        ctx.fillStyle = '#222';
        ctx.fillRect(pedalCX + legAngle1 * 12 * s - 5 * s, wheelY - 3 * s, 10 * s, 4 * s);
        ctx.fillRect(pedalCX + legAngle2 * 12 * s - 5 * s, wheelY - 3 * s, 10 * s, 4 * s);

        // Torso / wielershirt (ROZE - Pantani style!)
        ctx.fillStyle = '#E84887';
        ctx.beginPath();
        ctx.ellipse(0, -4 * s, 12 * s, 14 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Witte bies op roze shirt (Mercatone Uno stijl)
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2 * s;
        ctx.beginPath();
        ctx.moveTo(-12 * s, -4 * s);
        ctx.lineTo(12 * s, -4 * s);
        ctx.stroke();

        // Tweede bies (geel accent, Pantani)
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 1.5 * s;
        ctx.beginPath();
        ctx.moveTo(-11 * s, -7 * s);
        ctx.lineTo(11 * s, -7 * s);
        ctx.stroke();

        // BUIK! (het grappigste deel - groeit flink met gewicht, GEEN ARMEN = meer zichtbaar!)
        ctx.fillStyle = '#D63B78';
        ctx.beginPath();
        ctx.ellipse(
            2 * s, 4 * s,
            bellySize * 0.75, bellySize * 0.6,
            0.15, 0, Math.PI * 2
        );
        ctx.fill();

        // Buik highlight (glans - maakt de buik 3D)
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.beginPath();
        ctx.ellipse(
            -1 * s, 1 * s,
            bellySize * 0.4, bellySize * 0.3,
            0.2, 0, Math.PI * 2
        );
        ctx.fill();

        // Navel (zichtbaar door strak shirt bij hoog gewicht)
        if (weight > 80) {
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.beginPath();
            ctx.ellipse(1 * s, 5 * s, 1.5 * s, 2 * s, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Buik-streep detail (shirt spant)
        if (weight > 85) {
            ctx.strokeStyle = 'rgba(0,0,0,0.12)';
            ctx.lineWidth = 1;
            for (let i = -3; i <= 3; i++) {
                ctx.beginPath();
                ctx.moveTo(i * 3.5 * s, -2 * s);
                ctx.lineTo(i * 4.5 * s, 12 * s);
                ctx.stroke();
            }
        }

        // --- MEGA SPIERBALLEN ARMEN MET TATTOO ---

        // Linkerarm (met tattoo "MAGIC") - MEGA SPIERBAL
        // Hemd mouw (roze, kort)
        ctx.fillStyle = '#E84887';
        ctx.beginPath();
        ctx.ellipse(-12 * s, -8 * s, 7 * s, 5.5 * s, -0.3, 0, Math.PI * 2);
        ctx.fill();
        // Mouw randje
        ctx.strokeStyle = '#D63B78';
        ctx.lineWidth = 1.5 * s;
        ctx.beginPath();
        ctx.ellipse(-12 * s, -8 * s, 7 * s, 5.5 * s, -0.3, 0.5, Math.PI + 0.5);
        ctx.stroke();

        // Bovenarm - MEGA SPIERBAL (nog groter)
        ctx.fillStyle = '#F5CBA7';
        ctx.beginPath();
        ctx.ellipse(-17 * s, -2 * s, 11 * s, 7.5 * s, -0.4, 0, Math.PI * 2);
        ctx.fill();

        // Bicep highlight (glans op spierbal)
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath();
        ctx.ellipse(-15 * s, -5 * s, 6 * s, 3.5 * s, -0.4, 0, Math.PI * 2);
        ctx.fill();

        // Spier-lijn detail (scheiding bicep/tricep)
        ctx.strokeStyle = 'rgba(180,140,110,0.4)';
        ctx.lineWidth = 1.2 * s;
        ctx.beginPath();
        ctx.moveTo(-12 * s, -7 * s);
        ctx.quadraticCurveTo(-18 * s, -2 * s, -15 * s, 4 * s);
        ctx.stroke();

        // Onderarm (ook dik)
        ctx.fillStyle = '#F5CBA7';
        ctx.beginPath();
        ctx.ellipse(-15 * s, 6 * s, 5.5 * s, 7.5 * s, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // TATTOO "MAGIC" - direct op de spierbal, geen sterretjes
        ctx.save();
        ctx.translate(-17 * s, -2 * s);
        ctx.rotate(-0.4);

        // Tattoo schaduw
        ctx.fillStyle = 'rgba(0, 20, 50, 0.5)';
        ctx.font = `900 ${5.5 * s}px "Arial Black", Impact, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('MAGIC', 0.4 * s, 0.4 * s);

        // Tattoo tekst
        ctx.fillStyle = '#0a1e3d';
        ctx.fillText('MAGIC', 0, 0);

        ctx.restore();

        // Rechterarm - ook gespierd
        // Hemd mouw
        ctx.fillStyle = '#E84887';
        ctx.beginPath();
        ctx.ellipse(12 * s, -8 * s, 7 * s, 5.5 * s, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#D63B78';
        ctx.lineWidth = 1.5 * s;
        ctx.beginPath();
        ctx.ellipse(12 * s, -8 * s, 7 * s, 5.5 * s, 0.3, -0.5, Math.PI - 0.5);
        ctx.stroke();

        // Bovenarm rechts - spierbal (even groot als links)
        ctx.fillStyle = '#F5CBA7';
        ctx.beginPath();
        ctx.ellipse(17 * s, -2 * s, 11 * s, 7.5 * s, 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Bicep highlight rechts
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath();
        ctx.ellipse(15 * s, -5 * s, 6 * s, 3.5 * s, 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Onderarm rechts
        ctx.fillStyle = '#F5CBA7';
        ctx.beginPath();
        ctx.ellipse(14 * s, 5 * s, 5 * s, 7 * s, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Handen op stuur
        ctx.fillStyle = '#F0C0A0';
        ctx.beginPath();
        ctx.arc(-12 * s, 8 * s, 3 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(12 * s, 8 * s, 3 * s, 0, Math.PI * 2);
        ctx.fill();

        // --- HOOFD (KAAL! Geen helm, zoals de foto) ---
        const headR = 13 * s;
        const headY = -22 * s;

        // Hoofd - huidskleur
        ctx.fillStyle = '#F0C8A0';
        ctx.beginPath();
        ctx.arc(0, headY, headR, 0, Math.PI * 2);
        ctx.fill();

        // Kale glans - prominent (lichtreflectie bovenop hoofd)
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.ellipse(-2 * s, headY - headR * 0.45, headR * 0.5, headR * 0.3, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Tweede glans (extra kaal effect)
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.ellipse(3 * s, headY - headR * 0.55, headR * 0.25, headR * 0.15, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Lichte stoppels aan zijkanten (zoals de foto)
        ctx.fillStyle = 'rgba(180, 160, 140, 0.3)';
        // Links
        ctx.beginPath();
        ctx.ellipse(-headR * 0.75, headY + headR * 0.1, headR * 0.25, headR * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Rechts
        ctx.beginPath();
        ctx.ellipse(headR * 0.75, headY + headR * 0.1, headR * 0.25, headR * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Oren
        ctx.fillStyle = '#E8B888';
        ctx.beginPath();
        ctx.ellipse(-headR - 2 * s, headY + 2 * s, 3 * s, 5 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(headR + 2 * s, headY + 2 * s, 3 * s, 5 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wenkbrauwen
        ctx.strokeStyle = '#8B7355';
        ctx.lineWidth = 2 * s;
        ctx.beginPath();
        ctx.moveTo(-6 * s, headY - 5 * s);
        ctx.quadraticCurveTo(-4 * s, headY - 7 * s, -1 * s, headY - 5.5 * s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(2 * s, headY - 5.5 * s);
        ctx.quadraticCurveTo(5 * s, headY - 7 * s, 7 * s, headY - 5 * s);
        ctx.stroke();

        // Ogen (groter, expressiever)
        // Oogwit
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.ellipse(-4 * s, headY - 2 * s, 3.5 * s, 3 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(4 * s, headY - 2 * s, 3.5 * s, 3 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pupillen (kijken soms naar items)
        ctx.fillStyle = '#4A7A5A'; // groenige ogen zoals de foto
        ctx.beginPath();
        ctx.arc(-4 * s, headY - 1.5 * s, 2 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(4 * s, headY - 1.5 * s, 2 * s, 0, Math.PI * 2);
        ctx.fill();

        // Pupil zwart
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(-4 * s, headY - 1.5 * s, 1 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(4 * s, headY - 1.5 * s, 1 * s, 0, Math.PI * 2);
        ctx.fill();

        // Oog-highlight
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(-3 * s, headY - 2.5 * s, 0.7 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(5 * s, headY - 2.5 * s, 0.7 * s, 0, Math.PI * 2);
        ctx.fill();

        // Neus (klein, rond)
        ctx.fillStyle = '#E0A878';
        ctx.beginPath();
        ctx.ellipse(0, headY + 2 * s, 2.5 * s, 2 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Mond / gezichtsuitdrukking (afhankelijk van gewicht)
        ctx.strokeStyle = '#8B5E3C';
        ctx.lineWidth = 2 * s;
        ctx.beginPath();
        if (weight > 95) {
            // Echt hijgend / open mond
            ctx.fillStyle = '#CC6666';
            ctx.beginPath();
            ctx.ellipse(0, headY + 7 * s, 4 * s, 3 * s, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFF';
            ctx.fillRect(-3 * s, headY + 5 * s, 6 * s, 1.5 * s); // tanden

            // Flink zweten
            ctx.fillStyle = 'rgba(100, 180, 255, 0.7)';
            ctx.beginPath();
            ctx.ellipse(headR + 1 * s, headY - 3 * s, 1.5 * s, 3 * s, 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(headR + 3 * s, headY + 4 * s, 1 * s, 2 * s, 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(-headR - 1 * s, headY + 1 * s, 1.2 * s, 2.5 * s, -0.3, 0, Math.PI * 2);
            ctx.fill();
        } else if (weight > 85) {
            // Inspanning, beetje zweten
            ctx.arc(0, headY + 4 * s, 5 * s, 0.15, Math.PI - 0.15, true); // frown
            ctx.stroke();
            ctx.fillStyle = 'rgba(100, 180, 255, 0.6)';
            ctx.beginPath();
            ctx.ellipse(headR, headY - 2 * s, 1.2 * s, 2.5 * s, 0.3, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Blije glimlach
            ctx.arc(0, headY + 3 * s, 5 * s, 0.2, Math.PI - 0.2);
            ctx.stroke();

            // Kuiltjes
            ctx.fillStyle = '#D4A07A';
            ctx.beginPath();
            ctx.arc(-6 * s, headY + 5 * s, 1.2 * s, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(6 * s, headY + 5 * s, 1.2 * s, 0, Math.PI * 2);
            ctx.fill();
        }

        // Kin/kaak (wat voller bij hoog gewicht)
        if (weight > 90) {
            ctx.fillStyle = '#E8B888';
            ctx.beginPath();
            ctx.ellipse(0, headY + headR + 2 * s, headR * 0.6, 4 * s * (weight / 90), 0, 0, Math.PI);
            ctx.fill();
        }

        ctx.restore();
    },

    // Preview voor startscherm
    drawRonaldPreview(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2 + 20);
        const savedCtx = this.ctx;
        this.ctx = ctx;
        this.drawRonald(0, 0, 100, performance.now() / 1000);
        this.ctx = savedCtx;
        ctx.restore();
    },

    /* ---- ITEMS TEKENEN ---- */

    drawItem(x, y, type, size) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, y);

        if (type === 'hamburger') this.drawHamburger(size);
        else if (type === 'bier') this.drawBier(size);
        else if (type === 'frieten') this.drawFrieten(size);

        ctx.restore();
    },

    drawHamburger(s) {
        const ctx = this.ctx;
        const r = s / 2;
        ctx.fillStyle = '#D2691E';
        ctx.beginPath();
        ctx.ellipse(0, 4, r, r * 0.4, 0, 0, Math.PI);
        ctx.fill();
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-r + 2, -2, s - 4, 6);
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(-r + 3, -4, s - 6, 3);
        ctx.fillStyle = '#FFC107';
        ctx.beginPath();
        ctx.moveTo(-r + 2, -4);
        ctx.lineTo(r - 2, -4);
        ctx.lineTo(r, -6);
        ctx.lineTo(-r, -6);
        ctx.fill();
        ctx.fillStyle = '#E8A952';
        ctx.beginPath();
        ctx.ellipse(0, -6, r, r * 0.5, 0, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#FFF8DC';
        ctx.fillRect(-4, -10, 2, 3);
        ctx.fillRect(2, -11, 2, 3);
        ctx.fillRect(-1, -12, 2, 2);
    },

    drawBier(s) {
        const ctx = this.ctx;
        const r = s / 2;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(-r * 0.5, -r, r, r * 1.6);
        ctx.fillStyle = '#F4A460';
        ctx.fillRect(-r * 0.5 + 1, -r * 0.5, r - 2, r * 1.1);
        ctx.fillStyle = '#FFFDD0';
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.5, r * 0.55, r * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(r * 0.5 + 4, 0, 5, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
    },

    drawFrieten(s) {
        const ctx = this.ctx;
        const r = s / 2;
        ctx.fillStyle = '#CC0000';
        ctx.beginPath();
        ctx.moveTo(-r * 0.7, -r * 0.3);
        ctx.lineTo(r * 0.7, -r * 0.3);
        ctx.lineTo(r * 0.3, r);
        ctx.lineTo(-r * 0.3, r);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#FFF';
        ctx.fillRect(-r * 0.1, -r * 0.3, r * 0.2, r * 1.2);
        ctx.fillStyle = '#FFD700';
        const frietjes = [-6, -2, 2, 5, -4, 0, 4];
        frietjes.forEach((fx, i) => {
            const fh = 8 + (i % 3) * 4;
            ctx.fillRect(fx - 1.5, -r * 0.3 - fh, 3, fh);
        });
        ctx.fillStyle = '#FFFDD0';
        ctx.beginPath();
        ctx.arc(0, -r * 0.3 - 6, 4, 0, Math.PI * 2);
        ctx.fill();
    },

    /* ---- COLLISION ANIMATIE MET QUOTE ---- */

    drawCollisionEffect(x, y, progress, itemType, quote) {
        const ctx = this.ctx;
        // Langzamere fade: pas na 60% begint het te verdwijnen
        const alpha = progress < 0.6 ? 1 : 1 - ((progress - 0.6) / 0.4);
        const expand = progress * 30;

        ctx.save();
        ctx.globalAlpha = Math.max(0, alpha);

        // Gewicht-tekst (zweeft omhoog)
        const weightGain = CONFIG.items[itemType].weight;
        ctx.fillStyle = '#FF4444';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
            `+${weightGain.toFixed(1)} kg`,
            x,
            y - 30 - progress * 30
        );

        // Uitdijende ring (alleen begin)
        if (progress < 0.4) {
            ctx.strokeStyle = '#FF6644';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, 15 + expand, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    },

    // Teken alle actieve quotes opeengestapeld bovenaan het scherm
    drawQuoteStack(effects) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        let yPos = 70; // start onder HUD

        effects.forEach((fx) => {
            if (!fx.quote) return;

            // Langzamere fade voor quotes
            const alpha = fx.progress < 0.5 ? 1 : 1 - ((fx.progress - 0.5) / 0.5);
            if (alpha <= 0) return;

            ctx.save();
            ctx.globalAlpha = Math.max(0, alpha);
            ctx.textAlign = 'center';

            // Achtergrond balk
            ctx.font = 'bold 18px sans-serif';
            const textW = ctx.measureText(fx.quote).width;
            const boxW = Math.min(textW + 28, w - 16);
            const boxX = w / 2 - boxW / 2;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.fillRoundRect(ctx, boxX, yPos - 16, boxW, 30, 8);

            // Gekleurde rand links (per item type)
            const colors = { hamburger: '#D2691E', bier: '#F4A460', frieten: '#FFD700' };
            ctx.fillStyle = colors[fx.type] || '#FFD700';
            ctx.fillRect(boxX, yPos - 13, 5, 24);

            // Quote tekst (groter!)
            ctx.fillStyle = '#FFD700';
            ctx.fillText(fx.quote, w / 2, yPos + 6);

            ctx.restore();

            yPos += 36; // volgende quote eronder stapelen
        });
    },

    // Helper: afgeronde rechthoek (werkt in alle browsers)
    fillRoundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
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
