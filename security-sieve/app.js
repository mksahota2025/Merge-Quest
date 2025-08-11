const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

// ❌ Hardcoded credentials
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'mergequest'
});

app.use(bodyParser.json());

// ❌ Vulnerable to SQL Injection
app.get('/users', (req, res) => {
  const userId = req.query.id;
  const query = `SELECT * FROM users WHERE id = '${userId}'`;

  db.query(query, (err, result) => {
    if (err) return res.status(500).send('DB Error');
    res.json(result);
  });
});

// ❌ Insecure password storage
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const query = `INSERT INTO users (username, password) VALUES ('${username}', '${password}')`;
  db.query(query, (err) => {
    if (err) return res.status(500).send('Register Error');
    res.send('User registered');
  });
});

app.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`));
