/* ============================================
   leaderboard.js - Lokale score-opslag
   Gebruikt localStorage voor ranking
   ============================================ */

const Leaderboard = {
    STORAGE_KEY: 'ronald_ronde_scores',
    MAX_SCORES: 10,

    // Haal alle scores op uit localStorage
    getScores() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    // Sla een nieuwe score op (laagste gewicht = beste)
    saveScore(name, weight) {
        const scores = this.getScores();
        const entry = {
            name: name.trim().substring(0, 20) || 'Anoniem',
            weight: Math.round(weight * 10) / 10,
            date: new Date().toLocaleDateString('nl-BE')
        };
        scores.push(entry);

        // Sorteer op gewicht (laagste eerst = beste)
        scores.sort((a, b) => a.weight - b.weight);

        // Bewaar alleen top 10
        const trimmed = scores.slice(0, this.MAX_SCORES);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmed));

        // Geef positie terug (1-based, of -1 als niet in top 10)
        const pos = trimmed.findIndex(s => s === entry);
        return pos !== -1 ? pos + 1 : -1;
    },

    // Render het leaderboard in de DOM
    render(highlightWeight) {
        const list = document.getElementById('leaderboard-list');
        const scores = this.getScores();
        list.innerHTML = '';

        if (scores.length === 0) {
            list.innerHTML = '<li style="justify-content:center;color:#888;">Nog geen scores. Jij bent de eerste!</li>';
            return;
        }

        scores.forEach((entry) => {
            const li = document.createElement('li');
            // Highlight als dit de zojuist opgeslagen score is
            if (highlightWeight !== undefined &&
                Math.abs(entry.weight - highlightWeight) < 0.05) {
                li.classList.add('highlight');
                highlightWeight = undefined; // maar 1 highlighten
            }
            li.innerHTML = `
                <span class="lb-name">${this.escapeHtml(entry.name)}</span>
                <span class="lb-weight">${entry.weight.toFixed(1).replace('.', ',')} kg</span>
            `;
            list.appendChild(li);
        });
    },

    // Voorkom XSS in namen
    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};
