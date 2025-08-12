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


const { createCanvas } = require('canvas');

app.get('/badge/:sessionId', async (req, res) => {
  const { sessionId } = req.params;

  const result = await pool.query(
    'SELECT team_name, time_taken FROM sessions WHERE session_id = $1 AND status = $2',
    [sessionId, 'completed']
  );

  if (result.rows.length === 0) {
    return res.status(404).send('Badge not ready or session incomplete.');
  }

  const { team_name, time_taken } = result.rows[0];

  const canvas = createCanvas(600, 300);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0f172a'; // dark slate
  ctx.fillRect(0, 0, 600, 300);

  // Title
  ctx.fillStyle = '#0ea5e9'; // sky blue
  ctx.font = 'bold 30px Sans';
  ctx.fillText('🏅 Merge Quest Survivor', 40, 60);

  // Team name
  ctx.fillStyle = '#facc15'; // yellow
  ctx.font = '24px Sans';
  ctx.fillText(`Team: ${team_name}`, 40, 120);

  // Time
  ctx.fillText(`Time: ${formatTime(time_taken)}`, 40, 160);

  ctx.fillStyle = '#94a3b8'; // gray
  ctx.font = '16px Sans';
  ctx.fillText('Share your badge on LinkedIn! 🔗', 40, 220);

  res.setHeader('Content-Type', 'image/png');
  canvas.pngStream().pipe(res);
});

function formatTime(interval) {
  const [hours, minutes, seconds] = interval.split(':');
  return `${parseInt(minutes)}m ${parseInt(seconds)}s`;
}
