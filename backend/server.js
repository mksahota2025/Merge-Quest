const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Simple in-memory store (replace with DB later)
let participants = [];
let rooms = ['branch-maze', 'dependency-jenga', 'security-sieve', 'vibe-boss'];

// POST /start-session
app.post('/start-session', (req, res) => {
    const { teamName, emails } = req.body;
    const assignedRoom = rooms[Math.floor(Math.random() * rooms.length)];
    const sessionId = Math.random().toString(36).substr(2, 9);
    participants.push({ sessionId, teamName, emails, assignedRoom, status: 'started' });
    res.json({ sessionId, assignedRoom });
});

// GET /get-room?sessionId=XXX
app.get('/get-room', (req, res) => {
    const { sessionId } = req.query;
    const session = participants.find(p => p.sessionId === sessionId);
    if (session) {
        res.json({ assignedRoom: session.assignedRoom });
    } else {
        res.status(404).json({ error: 'Session not found' });
    }
});

// POST /submit-solution
app.post('/submit-solution', (req, res) => {
    const { sessionId, repoUrl } = req.body;
    const session = participants.find(p => p.sessionId === sessionId);
    if (session) {
        session.status = 'completed';
        session.repoUrl = repoUrl;
        res.json({ message: 'Solution submitted! Badge coming soon.' });
    } else {
        res.status(404).json({ error: 'Session not found' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
