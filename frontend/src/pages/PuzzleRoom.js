import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function PuzzleRoom({ sessionId, assignedRoom }) {
  const [repoUrl, setRepoUrl] = useState('');
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const submitSolution = async () => {
    const res = await fetch('http://localhost:5000/submit-solution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, repoUrl })
    });
    const data = await res.json();
    if (data.success) {
      navigate('/success');
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-6 space-y-6">
      <h1 className="text-3xl font-bold text-green-400">Puzzle: {assignedRoom}</h1>
      <h2 className="text-xl text-yellow-300">Time Left: {formatTime(timeLeft)}</h2>

      <input 
        type="text" 
        placeholder="Paste PR URL here" 
        className="w-80 p-2 rounded bg-gray-700 text-white" 
        value={repoUrl}
        onChange={e => setRepoUrl(e.target.value)}
      />
      <button 
        onClick={submitSolution}
        className="mt-2 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded shadow-lg"
      >
        🛠️ Submit Fix
      </button>
    </div>
  );
}

export default PuzzleRoom; 