const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'mergequest',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Successfully connected to PostgreSQL database');
        release();
    }
});

app.use(cors());
app.use(bodyParser.json());

// Rooms configuration
const rooms = ['branch-maze', 'dependency-jenga', 'security-sieve', 'vibe-boss'];

// POST /start-session
app.post('/start-session', async (req, res) => {
    const { teamName, emails } = req.body;
    const assignedRoom = rooms[Math.floor(Math.random() * rooms.length)];
    const sessionId = Math.random().toString(36).substr(2, 9);

    try {
        await pool.query(
            'INSERT INTO sessions (session_id, team_name, emails, assigned_room, status) VALUES ($1, $2, $3, $4, $5)',
            [sessionId, teamName, emails.join(','), assignedRoom, 'started']
        );
        res.json({ sessionId, assignedRoom });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database error.' });
    }
});

// GET /get-room?sessionId=XXX
app.get('/get-room', async (req, res) => {
    const { sessionId } = req.query;
    
    try {
        const result = await pool.query(
            'SELECT assigned_room FROM sessions WHERE session_id = $1',
            [sessionId]
        );
        
        if (result.rows.length > 0) {
            res.json({ assignedRoom: result.rows[0].assigned_room });
        } else {
            res.status(404).json({ error: 'Session not found' });
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database error.' });
    }
});

// POST /submit-solution
app.post('/submit-solution', async (req, res) => {
    const { sessionId, repoUrl } = req.body;
    try {
        const result = await pool.query(
            'UPDATE sessions SET status = $1, repo_url = $2 WHERE session_id = $3',
            ['completed', repoUrl, sessionId]
        );
        if (result.rowCount > 0) {
            res.json({ message: 'Solution submitted! Badge coming soon.' });
        } else {
            res.status(404).json({ error: 'Session not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error.' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
