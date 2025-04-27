const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(bodyParser());

app.get('/', (req, res) => {
  res.send('Welcome to Branch Maze! This is the main branch.');
});

// This is a bug that needs to be fixed
app.get('/bug', (req, res) => {
  res.send('This is a bug that needs to be fixed.');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});