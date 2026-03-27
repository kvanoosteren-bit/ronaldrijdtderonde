/* ============================================
   leaderboard.js - Gedeelde score-opslag
   Gebruikt Vercel API + localStorage fallback
   ============================================ */

const Leaderboard = {
    STORAGE_KEY: 'ronald_ronde_scores',
    API_URL: '/api/scores',
    MAX_SCORES: 10,

    // --- LOKALE OPSLAG (fallback) ---

    getLocalScores() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    saveLocalScores(scores) {
        try {
            const sorted = scores
                .sort((a, b) => a.weight - b.weight)
                .slice(0, this.MAX_SCORES);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sorted));
        } catch (e) {}
    },

    // --- SERVER API ---

    // Haal scores op van server, sync lokale scores mee
    async fetchScores() {
        try {
            // Stuur lokale scores mee voor sync bij cold starts
            const localScores = this.getLocalScores();
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sync: localScores })
            });

            if (!response.ok) throw new Error('API error');

            const serverScores = await response.json();
            // Update lokale cache met server-data
            this.saveLocalScores(serverScores);
            return serverScores;
        } catch (e) {
            // Fallback naar lokale scores als API niet bereikbaar
            return this.getLocalScores();
        }
    },

    // Sla score op via server + lokaal
    async saveScore(name, weight) {
        const entry = {
            name: name.trim().substring(0, 20) || 'Anoniem',
            weight: Math.round(weight * 10) / 10,
            date: new Date().toLocaleDateString('nl-BE')
        };

        // Altijd lokaal opslaan (als fallback)
        const local = this.getLocalScores();
        local.push(entry);
        this.saveLocalScores(local);

        // Stuur naar server - alleen sync (bevat al de nieuwe score)
        // NIET ook apart name/weight meesturen, want dat geeft dubbel!
        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sync: local
                })
            });

            if (response.ok) {
                const serverScores = await response.json();
                this.saveLocalScores(serverScores);
                return serverScores;
            }
        } catch (e) {
            // Server niet bereikbaar, lokale opslag werkt nog
        }

        return this.getLocalScores();
    },

    // --- RENDERING ---

    // Render het leaderboard (async, laadt van server)
    async render(highlightWeight) {
        const list = document.getElementById('leaderboard-list');
        list.innerHTML = '<li style="justify-content:center;color:#888;">Laden...</li>';

        const scores = await this.fetchScores();
        list.innerHTML = '';

        if (scores.length === 0) {
            list.innerHTML = '<li style="justify-content:center;color:#888;">Nog geen scores. Jij bent de eerste!</li>';
            return;
        }

        let highlighted = false;
        scores.forEach((entry) => {
            const li = document.createElement('li');
            if (!highlighted && highlightWeight !== undefined &&
                Math.abs(entry.weight - highlightWeight) < 0.05) {
                li.classList.add('highlight');
                highlighted = true;
            }
            li.innerHTML = `
                <span class="lb-name">${this.escapeHtml(entry.name)}</span>
                <span class="lb-weight">${entry.weight.toFixed(1).replace('.', ',')} kg</span>
            `;
            list.appendChild(li);
        });
    },

    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};
