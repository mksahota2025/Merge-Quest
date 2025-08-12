require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Secure database connection with environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

app.use(bodyParser.json());

// ✅ Input validation middleware
const validateUserId = (req, res, next) => {
  const userId = req.query.id;
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  next();
};

// ✅ Fixed SQL Injection vulnerability with parameterized queries
app.get('/users', validateUserId, (req, res) => {
  const userId = req.query.id;
  const query = 'SELECT id, username, created_at FROM users WHERE id = ?';

  db.query(query, [userId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(result);
  });
});

// ✅ Secure password storage with bcrypt hashing
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Input validation
    if (!username || !password || password.length < 8) {
      return res.status(400).json({ 
        error: 'Username and password (min 8 chars) required' 
      });
    }
    
    // Hash password securely
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(query, [username, hashedPassword], (err) => {
      if (err) return res.status(500).json({ error: 'Registration failed' });
      res.json({ message: 'User registered successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Login endpoint with secure password comparison
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], async (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      
      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const user = results[0];
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      res.json({ message: 'Login successful', userId: user.id });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => console.log(`Secure server running on http://localhost:${PORT}`));
