const express = require('express');
const _ = require('lodash');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// Enable JSON parsing for POST requests
app.use(express.json());

// Vulnerable to prototype pollution
app.get('/prototype-pollution', (req, res) => {
  const userInput = req.query.input;
  const obj = {};
  _.merge(obj, JSON.parse(userInput));
  res.json(obj);
});

// Vulnerable to XSS (Express 4.10.0 doesn't escape by default)
app.get('/xss', (req, res) => {
  const userInput = req.query.input;
  res.send(`<div>${userInput}</div>`);
});

// Vulnerable to path traversal
app.get('/file', (req, res) => {
  const filename = req.query.filename;
  res.sendFile(filename, { root: __dirname });
});

// Vulnerable to command injection
app.get('/ping', (req, res) => {
  const host = req.query.host;
  const result = require('child_process').execSync(`ping -c 1 ${host}`);
  res.send(result.toString());
});

// Vulnerable to SQL Injection and weak hashing (MD5)
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Weak MD5 hashing
  const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
  
  // SQL Injection vulnerability through string concatenation
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${hashedPassword}'`;
  
  // Simulate database query
  console.log('Executing query:', query);
  res.json({ message: 'Login attempt processed', query });
});

// Vulnerable to Broken Access Control
app.get('/profile', (req, res) => {
  const userId = req.query.userId;
  // No authorization check - allows horizontal privilege escalation
  const userProfile = {
    id: userId,
    name: 'John Doe',
    email: 'john@example.com',
    ssn: '123-45-6789'
  };
  res.json(userProfile);
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Dependency chaos!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 