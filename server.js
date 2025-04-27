const express = require('express');
const crypto = require('crypto');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// In-memory database (for demonstration purposes)
// In a real application, this would be replaced with a proper database
const db = {
    users: new Map(),
    sessions: new Map()
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper functions
const generateSessionToken = () => crypto.randomBytes(32).toString('hex');
const hashPassword = (password) => crypto.createHash('sha256').update(password).digest('hex');

// Root endpoint
app.get('/', (req, res) => {
    res.send('Vulnerability Hunt Challenge!');
});

// User registration endpoint
app.post('/register', (req, res) => {
    const { username, password, email } = req.body;
    
    // Check if user already exists
    if (db.users.has(username)) {
        return res.status(400).json({ error: 'Username already exists' });
    }

    // Store user with hashed password
    db.users.set(username, {
        username,
        password: hashPassword(password),
        email,
        role: 'user',
        createdAt: new Date().toISOString()
    });

    res.status(201).json({ message: 'User registered successfully' });
});

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.users.get(username);

    if (!user || user.password !== hashPassword(password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const sessionToken = generateSessionToken();
    db.sessions.set(sessionToken, {
        username,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({ token: sessionToken });
});

// Profile endpoint
app.get('/profile', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const session = db.sessions.get(token);
    if (!session || session.expiresAt < Date.now()) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const user = db.users.get(session.username);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Return user profile without sensitive information
    res.json({
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
    });
});

// File upload endpoint
app.post('/upload', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const session = db.sessions.get(token);
    if (!session || session.expiresAt < Date.now()) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const { filename, content } = req.body;
    if (!filename || !content) {
        return res.status(400).json({ error: 'Filename and content are required' });
    }

    // Sanitize filename to prevent path traversal
    const safeFilename = path.basename(filename);
    const uploadPath = path.join(__dirname, 'uploads', safeFilename);

    // Ensure uploads directory exists
    if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
        fs.mkdirSync(path.join(__dirname, 'uploads'));
    }

    // Write file
    fs.writeFileSync(uploadPath, content);
    res.json({ message: 'File uploaded successfully' });
});

// Admin endpoint
app.get('/admin', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const session = db.sessions.get(token);
    if (!session || session.expiresAt < Date.now()) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const user = db.users.get(session.username);
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }

    // Return list of all users (without sensitive information)
    const users = Array.from(db.users.values()).map(u => ({
        username: u.username,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt
    }));

    res.json({ users });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 