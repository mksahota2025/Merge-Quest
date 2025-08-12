import React, { useEffect, useState } from 'react';

function Leaderboard() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/leaderboard')
      .then(res => res.json())
      .then(setScores);
  }, []);

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-4">🏆 Leaderboard</h1>
      <ul>
        {scores.map((s, i) => (
          <li key={i}>
            {i + 1}. <strong>{s.team_name}</strong> – {formatTime(s.time_taken)}
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatTime(t) {
  const [h, m, s] = t.split(':');
  return `${parseInt(m)}m ${parseInt(s)}s`;
}

export default Leaderboard;
