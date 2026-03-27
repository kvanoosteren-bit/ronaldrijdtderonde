/**
 * Vercel Serverless Function - Gedeeld Leaderboard
 * Slaat scores op in /tmp (persistent zolang functie warm is)
 * Client stuurt ook lokale scores mee voor sync bij cold starts
 */

const fs = require('fs');
const path = require('path');

const SCORES_FILE = path.join('/tmp', 'ronald_ronde_scores.json');
const MAX_SCORES = 10;

function getScores() {
    try {
        if (fs.existsSync(SCORES_FILE)) {
            return JSON.parse(fs.readFileSync(SCORES_FILE, 'utf8'));
        }
    } catch (e) {}
    return [];
}

function saveScores(scores) {
    const sorted = scores
        .sort((a, b) => a.weight - b.weight)
        .slice(0, MAX_SCORES);
    fs.writeFileSync(SCORES_FILE, JSON.stringify(sorted));
    return sorted;
}

// Merge twee score-lijsten, dedupliceer op naam+gewicht
function mergeScores(serverScores, clientScores) {
    const all = [...serverScores];
    const existing = new Set(serverScores.map(s => `${s.name}|${s.weight}`));

    for (const score of clientScores) {
        const key = `${score.name}|${score.weight}`;
        if (!existing.has(key)) {
            all.push(score);
            existing.add(key);
        }
    }

    return all.sort((a, b) => a.weight - b.weight).slice(0, MAX_SCORES);
}

module.exports = (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // GET: haal scores op, optioneel sync met client-scores
    if (req.method === 'GET') {
        const scores = getScores();
        return res.status(200).json(scores);
    }

    // POST: voeg score toe en/of sync
    if (req.method === 'POST') {
        const { name, weight, sync } = req.body || {};
        let scores = getScores();

        // Sync client-scores bij cold start recovery
        if (Array.isArray(sync) && sync.length > 0) {
            const validSync = sync.filter(s =>
                s && typeof s.name === 'string' && typeof s.weight === 'number'
            );
            scores = mergeScores(scores, validSync);
        }

        // Voeg nieuwe score toe als naam en gewicht meegegeven
        if (name && weight) {
            scores.push({
                name: String(name).substring(0, 20).trim() || 'Anoniem',
                weight: Math.round(Number(weight) * 10) / 10,
                date: new Date().toLocaleDateString('nl-BE')
            });
        }

        const saved = saveScores(scores);
        return res.status(200).json(saved);
    }

    return res.status(405).json({ error: 'Method not allowed' });
};
