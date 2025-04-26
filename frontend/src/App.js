import React, { useState } from 'react';

function App() {
  const [teamName, setTeamName] = useState('');
  const [emails, setEmails] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [assignedRoom, setAssignedRoom] = useState('');

  const startSession = async () => {
    const res = await fetch('http://localhost:5000/start-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teamName,
        emails: emails.split(',').map(e => e.trim())
      })
    });
    const data = await res.json();
    setSessionId(data.sessionId);
    setAssignedRoom(data.assignedRoom);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-purple-500 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Merge Quest Lobby</h1>

        {!sessionId ? (
          <>
            <input
              type="text"
              placeholder="Team Name"
              className="border p-2 w-full mb-4 rounded"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
            />
            <textarea
              placeholder="Emails (comma-separated)"
              className="border p-2 w-full mb-4 rounded"
              value={emails}
              onChange={e => setEmails(e.target.value)}
            />
            <button
              onClick={startSession}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
            >
              Start Session
            </button>
          </>
        ) : (
          <div className="text-center">
            <p className="text-xl">Session Started!</p>
            <p className="mt-2">Session ID: <strong>{sessionId}</strong></p>
            <p>Assigned Room: <strong>{assignedRoom}</strong></p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

