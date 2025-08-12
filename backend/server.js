const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// In-memory storage
const sessions = new Map();

app.use(cors());
app.use(bodyParser.json());

// Rooms configuration
const rooms = ['branch-maze', 'dependency-jenga', 'security-sieve', 'vibe-boss'];

// Sample vulnerabilities data for each room
const roomVulnerabilities = {
  'vibe-boss': [
    {
      id: 1,
      title: 'Insecure API Key Storage',
      description: 'API keys are hardcoded in the source code',
      points: 50
    },
    {
      id: 2,
      title: 'Missing Input Validation',
      description: 'User input is not properly sanitized',
      points: 30
    }
  ],
  'branch-maze': [
    {
      id: 1,
      title: 'Merge Conflict Resolution',
      description: 'Improper handling of merge conflicts',
      points: 40
    }
  ],
  'dependency-jenga': [
    {
      id: 1,
      title: 'Outdated Dependencies',
      description: 'Multiple packages have known vulnerabilities',
      points: 60
    }
  ],
  'security-sieve': [
    {
      id: 1,
      title: 'SQL Injection',
      description: 'Database queries are vulnerable to injection',
      points: 70
    }
  ]
};

// GET /vulnerabilities
app.get('/vulnerabilities', (req, res) => {
  const { room } = req.query;
  const sessionId = req.headers.authorization?.split(' ')[1];

  if (!room || !rooms.includes(room)) {
    return res.status(400).json({ error: 'Invalid room specified' });
  }

  const vulnerabilities = roomVulnerabilities[room] || [];
  res.json(vulnerabilities);
});

// POST /start-session
app.post('/start-session', async (req, res) => {
    const { teamName, emails } = req.body;
    const assignedRoom = rooms[Math.floor(Math.random() * rooms.length)];
    const sessionId = Math.random().toString(36).substr(2, 9);

    sessions.set(sessionId, {
        teamName,
        emails,
        assignedRoom,
        status: 'started'
    });

    res.json({ sessionId, assignedRoom });
});

app.get('/', (req, res) => {
    res.json({
      status: 'OK',
      message: 'API is running on port ' + (process.env.PORT || 5001)
    });
  });

// POST /submit-solution
app.post('/submit-solution', async (req, res) => {
    const { sessionId, repoUrl } = req.body;
    const session = sessions.get(sessionId);
    
    if (session) {
        session.status = 'completed';
        session.repoUrl = repoUrl;
        res.json({ message: 'Solution submitted! Badge coming soon.' });
    } else {
        res.status(404).json({ error: 'Session not found' });
    }
});

// POST /submit-fix
app.post('/submit-fix', (req, res) => {
    const { vulnerabilityId, fix, room } = req.body;
    const sessionId = req.headers.authorization?.split(' ')[1];

    if (!vulnerabilityId || !fix || !room) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // In a real application, you would validate the fix here
    // For now, we'll just return a success message
    res.json({
        success: true,
        message: 'Fix submitted successfully',
        points: roomVulnerabilities[room]?.find(v => v.id === vulnerabilityId)?.points || 0
    });
});

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
