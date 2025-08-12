const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Fake db for simulation only
const db = {
  query: (query, callback) => {
    console.log('[SIMULATED QUERY]:', query);
    const injected = query.includes("' OR '1'='1");
    if (injected) {
      return callback(null, [{ id: 1, username: 'admin' }]);
    }
    return callback(null, []);
  }
};

// In-memory session store
const sessions = new Map();

// Room configurations
const rooms = ['branch-maze', 'dependency-jenga', 'security-sieve', 'vibe-boss'];

const roomVulnerabilities = {
  'vibe-boss': [
    { id: 1, title: 'Insecure API Key Storage', description: 'API keys are hardcoded in the source code', points: 50 },
    { id: 2, title: 'Missing Input Validation', description: 'User input is not properly sanitized', points: 30 }
  ],
  'branch-maze': [
    { id: 1, title: 'Merge Conflict Resolution', description: 'Improper handling of merge conflicts', points: 40 }
  ],
  'dependency-jenga': [
    { id: 1, title: 'Outdated Dependencies', description: 'Multiple packages have known vulnerabilities', points: 60 }
  ],
  'security-sieve': [
    { id: 1, title: 'SQL Injection', description: 'Database queries are vulnerable to injection', points: 70 }
  ]
};

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: `API is running on port ${PORT}` });
});

// Start session
app.post('/start-session', (req, res) => {
  const { teamName, emails } = req.body;
  const assignedRoom = rooms[Math.floor(Math.random() * rooms.length)];
  const sessionId = Math.random().toString(36).substring(2, 12);

  sessions.set(sessionId, {
    teamName,
    emails,
    assignedRoom,
    status: 'started'
  });

  res.json({ sessionId, assignedRoom });
});

// Get vulnerabilities
app.get('/vulnerabilities', (req, res) => {
  const { room } = req.query;
  if (!room || !rooms.includes(room)) {
    return res.status(400).json({ error: 'Invalid room specified' });
  }
  const vulnerabilities = roomVulnerabilities[room] || [];
  res.json(vulnerabilities);
});

// Submit fix
app.post('/submit-fix', (req, res) => {
  const { vulnerabilityId, fix, room } = req.body;
  const sessionId = req.headers.authorization?.split(' ')[1];

  if (!vulnerabilityId || !fix || !room) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Simulated response
  const points = roomVulnerabilities[room]?.find(v => v.id === vulnerabilityId)?.points || 0;
  res.json({ success: true, message: 'Fix submitted successfully', points });
});

// Submit PR solution
app.post('/submit-solution', (req, res) => {
  const { sessionId, repoUrl } = req.body;
  const session = sessions.get(sessionId);

  if (!session) return res.status(404).json({ error: 'Session not found' });

  session.status = 'completed';
  session.repoUrl = repoUrl;

  res.json({ message: 'Solution submitted! Badge coming soon.' });
});

// Simulated async bug: unhandled promise rejection
app.get('/simulate-error', (req, res) => {
  fakeAsyncDanger(); // ❌ no await, no .catch()
  res.send('Background task launched');
});

async function fakeAsyncDanger() {
  throw new Error('💥 Background async failure (unhandled)');
}


// Simulated SQL injection vulnerability
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // ❌ SENSITIVE DATA LEAK
  console.log(`[DEBUG] Login attempt: username=${username}, password=${password}`);

  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).send('DB error');
    if (results.length > 0) return res.send('✅ Logged in');
    res.status(401).send('❌ Invalid credentials');
  });
});

// Prototype pollution vulnerability
app.post('/pollute', (req, res) => {
  const config = {};
  const userInput = req.body;

  // ❌ UNSAFE merge
  Object.assign(config, userInput);

  res.send({ message: 'Merged config', config });
});

app.get('/check', (req, res) => {
  if ({}.polluted === true) {
    return res.send('🔥 System compromised by prototype pollution!');
  }
  res.send('✅ Safe');
});

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

