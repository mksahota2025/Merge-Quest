const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Fake db for simulation only
const db = {
  query: (query, params, callback) => {
    // Support both old string interpolation (for backward compatibility with intentional vulnerabilities)
    // and new parameterized queries (for secure endpoints)
    if (typeof params === 'function') {
      // Old style: query(query, callback) - string interpolation
      callback = params;
      console.log('[SIMULATED QUERY]:', query);
      const injected = query.includes("' OR '1'='1");
      if (injected) {
        return callback(null, [{ id: 1, username: 'admin' }]);
      }
      return callback(null, []);
    } else {
      // New style: query(query, params, callback) - parameterized
      console.log('[SIMULATED QUERY]:', query, 'with params:', params);

      const expectedUsername = process.env.ADMIN_USERNAME || 'admin';
      const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';

      // Simulate parameterized query - safely check credentials
      // In a real DB, this would use prepared statements

      // Handle username-only lookup (secure approach with bcrypt)
      if (params && params.length === 1) {
        const [username] = params;

        // Simulated user lookup by username only
        if (username === expectedUsername) {
          // Return user with hashed password (simulated - in real app, fetch from DB)
          // Hash generated with: bcrypt.hash('admin123', 10)
          return callback(null, [{
            id: 1,
            username: expectedUsername,
            hashed_password: '$2b$10$yxvz/8v5qUXkNzK66QkboOjXsnuUeAovWLTNtGszaYuOUwvRIUAq6'
          }]);
        }
        return callback(null, []);
      }

      // Handle old username+password lookup (legacy - deprecated)
      // TODO: SIMULATION ONLY - DO NOT SHIP TO PRODUCTION
      // In production, use hashed passwords (bcrypt/argon2) and a real database
      // Never store or compare plaintext passwords
      if (params && params.length >= 2) {
        const [username, password] = params;

        // Simulated user lookup - compare against environment variables (INSECURE)
        if (username === expectedUsername && password === expectedPassword) {
          return callback(null, [{ id: 1, username: expectedUsername }]);
        }
      }
      return callback(null, []);
    }
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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure CORS with secure dynamic origin check
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : [];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) {
      return callback(null, true);
    }

    // If ALLOWED_ORIGINS is configured, use whitelist
    if (allowedOrigins.length > 0) {
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      // If no whitelist configured, allow all origins but without credentials
      callback(null, true);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: allowedOrigins.length > 0  // Only enable credentials when whitelist is configured
}));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: `API is running on port ${PORT}` });
});

// Start session
app.post('/start-session', (req, res) => {
  const { teamName, emails } = req.body;

  // Validate inputs
  if (!teamName || typeof teamName !== 'string' || teamName.trim().length === 0) {
    return res.status(400).json({ error: 'teamName must be a non-empty string' });
  }

  // Validate teamName length (prevent excessively long values)
  if (teamName.length > 100) {
    return res.status(400).json({ error: 'teamName must not exceed 100 characters' });
  }

  if (!Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ error: 'emails must be a non-empty array' });
  }

  // Validate maximum number of emails
  if (emails.length > 10) {
    return res.status(400).json({ error: 'Maximum 10 email addresses allowed' });
  }

  // Validate email format and length
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  for (const email of emails) {
    if (typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'All emails must be valid email addresses' });
    }
    // Validate email length (RFC 5321 max length is 254)
    if (email.length > 254) {
      return res.status(400).json({ error: 'Email addresses must not exceed 254 characters' });
    }
  }

  // Sanitize inputs
  const sanitizedTeamName = teamName.trim();
  const sanitizedEmails = emails.map(email => email.trim());

  // Generate cryptographically secure session ID
  const sessionId = crypto.randomUUID();
  const assignedRoom = rooms[Math.floor(Math.random() * rooms.length)];

  sessions.set(sessionId, {
    teamName: sanitizedTeamName,
    emails: sanitizedEmails,
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

  // Validate session ID exists in Authorization header
  if (!sessionId) {
    return res.status(401).json({ error: 'Unauthorized: No session ID provided' });
  }

  // Validate session exists in sessions Map
  const session = sessions.get(sessionId);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
  }

  // Validate required fields
  if (!vulnerabilityId || !fix || !room) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate room is valid
  if (!rooms.includes(room)) {
    return res.status(400).json({ error: 'Invalid room specified' });
  }

  // Optional: Enforce that user can only submit fixes for their assigned room
  if (session.assignedRoom !== room) {
    return res.status(403).json({ error: 'Forbidden: You can only submit fixes for your assigned room' });
  }

  // Calculate points for the vulnerability
  const points = roomVulnerabilities[room]?.find(v => v.id === vulnerabilityId)?.points || 0;
  res.json({ success: true, message: 'Fix submitted successfully', points });
});

// Submit PR solution
app.post('/submit-solution', (req, res) => {
  const { sessionId, repoUrl } = req.body;

  if (!repoUrl || typeof repoUrl !== 'string' || repoUrl.trim().length === 0) {
    return res.status(400).json({ error: 'Valid repoUrl is required' });
  }

  // Basic URL validation
  try {
    new URL(repoUrl);
  } catch (error) {
    return res.status(400).json({ error: 'repoUrl must be a valid URL' });
  }

  const session = sessions.get(sessionId);

  if (!session) return res.status(404).json({ error: 'Session not found' });

  session.status = 'completed';
  session.repoUrl = repoUrl.trim();

  res.json({ message: 'Solution submitted! Badge coming soon.' });
});

// Demonstrates proper async error handling with try/catch
app.get('/simulate-error', async (req, res) => {
  try {
    await fakeAsyncDanger();
    res.send('Background task launched');
  } catch (error) {
    console.error('Error in background task:', error.message);
    res.status(500).send('Background task failed');
  }
});

async function fakeAsyncDanger() {
  throw new Error('💥 Background async failure (properly handled)');
}


// Secure login endpoint with bcrypt password verification
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // Log authentication attempts without PII
  console.log('[AUTH] Login attempt received');

  // Query user by username only (never include password in query)
  const query = 'SELECT * FROM users WHERE username = ?';
  const params = [username];

  db.query(query, params, async (err, results) => {
    if (err) {
      console.error('[AUTH] Database error during login');
      return res.status(500).send('DB error');
    }

    // User not found
    if (results.length === 0) {
      console.log('[AUTH] Login failed - user not found');
      return res.status(401).send('❌ Invalid credentials');
    }

    const user = results[0];

    // Verify password using bcrypt (secure hash comparison)
    try {
      const passwordMatch = await bcrypt.compare(password, user.hashed_password);

      if (passwordMatch) {
        console.log('[AUTH] Login successful');
        return res.send('✅ Logged in');
      } else {
        console.log('[AUTH] Login failed - invalid password');
        return res.status(401).send('❌ Invalid credentials');
      }
    } catch (bcryptError) {
      console.error('[AUTH] Password verification error');
      return res.status(500).send('Authentication error');
    }
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

// 🐛 Memory leak: starts a new interval on every request and never stops it
app.get('/leaky-loop', (req, res) => {
  setInterval(() => {
    console.log(`🕳️ Leaking memory... still running`);
  }, 1000);

  res.send('Started a leaky task. Every hit stacks one more.');
});

app.get('/check', (req, res) => {
  if ({}.polluted === true) {
    return res.send('🔥 System compromised by prototype pollution!');
  }
  res.send('✅ Safe');
});

// Note: dotenv already loaded at top of file
// Security: Never log secrets in production
if (process.env.NODE_ENV === 'development') {
  console.log('[CodeRabbit] Environment loaded');
  // Only log that secret exists, not the actual value
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? '***configured***' : '***missing***');
}

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

