// frontend/src/pages/PuzzleRoom.js

import React, { useEffect, useState } from 'react';

const [state, setState] = useState(null); // ❌ invalid hook usage


function PuzzleRoom() {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [score, setScore] = useState(0);
  const [sessionId, setSessionId] = useState(localStorage.getItem('sessionId'));
  const [assignedRoom, setAssignedRoom] = useState(localStorage.getItem('assignedRoom'));
  const [prUrl, setPrUrl] = useState('');

  useEffect(() => {
    if (!sessionId || !assignedRoom) return;
  
    fetch(`http://localhost:5001/vulnerabilities?room=${room}`, {
      headers: {
        Authorization: `Bearer ${sessionId}`
      }
    })
      .then(res => res.json())
      .then(setVulnerabilities);
  }, [room]);
  

  const submitFix = async (vulnerabilityId, fixText) => {
    const res = await fetch('http://localhost:5001/submit-fix', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionId}`
      },
      body: JSON.stringify({
        room: assignedRoom,
        vulnerabilityId,
        fix: fixText
      })
    });

    const data = await res.json();
    if (data.success) {
      setScore(prev => prev + data.points);
      alert(`✅ Fix accepted! +${data.points} points`);
    } else {
      alert(`❌ ${data.error || 'Fix not accepted'}`);
    }
  };

  const submitSolution = async () => {
    await fetch('http://localhost:5001/submit-solution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, repoUrl: prUrl })
    });

    setTimeout(() => {
      window.location.href = `/badge?sessionId=${sessionId}`;
    }, 8000);
  };

  return (
    <div className="p-6 text-white bg-black min-h-screen">
      <h1 className="text-3xl font-bold text-cyan-400 mb-4">Merge Quest: Puzzle Room</h1>
      <h2 className="text-xl mb-2">Room: {assignedRoom}</h2>
      <h3 className="text-lg text-yellow-300 mb-4">Score: {score}</h3>

      {vulnerabilities.map(vuln => (
        <div key={vuln.id} className="bg-gray-800 p-4 mb-4 rounded">
          <h3 className="text-lg text-yellow-300">{vuln.title}</h3>
          <p className="text-sm text-gray-400">{vuln.description}</p>
          <input
            type="text"
            placeholder="Your fix here"
            onBlur={(e) => submitFix(vuln.id, e.target.value)}
            className="mt-2 p-2 w-full rounded bg-gray-700 text-white"
          />
        </div>
      ))}

      <div className="mt-6">
        <h4 className="text-lg mb-2">Submit Your Pull Request URL</h4>
        <input
          type="text"
          value={prUrl}
          onChange={(e) => setPrUrl(e.target.value)}
          placeholder="https://github.com/user/repo/pull/123"
          className="p-2 w-full rounded bg-gray-700 text-white mb-4"
        />
        <button
          onClick={submitSolution}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          🚀 Submit and Escape
        </button>
      </div>
    </div>
  );
}

export default PuzzleRoom;
